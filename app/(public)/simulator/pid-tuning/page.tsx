'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { token, plotChrome, kartu, kontrol, slider, selectCls, buttonPrimary } from '../_lib/ui';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

// Fixed plant — first-order + pure delay (FOPDT). This is the same generic
// model the reference simulator uses. Not exposed as a control: the point of
// this page is tuning a controller against a plant, not building plants.
const PLANT = { K: 1.0, T: 2.0, L: 0.4 };

const DT = 0.05;               // simulation step, seconds (20 Hz)
const WINDOW_S = 20;           // visible scrolling window, seconds
const MAX_SAMPLES = Math.ceil(WINDOW_S / DT) + 20; // small slack past the window
const RENDER_INTERVAL_MS = 66; // ~15fps chart updates — smooth, cheap

const SAT_LIMIT = 100;         // output saturation, symmetric: u clamped to ±this
const TT = 0.5;                // back-calculation tracking time constant (s)
const DERIV_FILTER_TF = 0.1;   // derivative low-pass time constant (s)
const RESPONSE_TOL = 2;        // "reached target" band, same units as setpoint

type AntiWindup = 'off' | 'clamping' | 'backcalc';

type SimState = {
  t: number;
  pv: number;
  integral: number;            // stores the I-term's own contribution to u, already Ki-scaled
  prevError: number;
  filteredDerivative: number;
  delayBuf: number[];
  lastSetpoint: number;
  spChangeTime: number;
  settled: boolean;
  responseTime: number;        // seconds since spChangeTime; freezes once settled
};
type History = { t: number[]; sp: number[]; pv: number[] };
type Stats = { pv: number; responseTime: number; settled: boolean };

const delaySteps = Math.max(1, Math.round(PLANT.L / DT));

const initialSim = (setpoint: number): SimState => ({
  t: 0, pv: 0, integral: 0, prevError: 0, filteredDerivative: 0, delayBuf: [],
  lastSetpoint: setpoint, spChangeTime: 0, settled: false, responseTime: 0,
});
const initialHistory = (): History => ({ t: [], sp: [], pv: [] });

export default function PidSimulator() {
  const [kp, setKp] = useState(1.0);
  const [ki, setKi] = useState(0.3);
  const [kd, setKd] = useState(0.1);
  const [setpoint, setSetpoint] = useState(50);
  const [antiWindup, setAntiWindup] = useState<AntiWindup>('off');
  const [derivFilter, setDerivFilter] = useState(false);
  const [outputSat, setOutputSat] = useState(false);

  // The rAF loop reads every one of these each step and must never restart
  // when a control moves — restarting would drop the running simulation.
  // This ref, not the state above, is the loop's source of truth; the state
  // only drives the UI.
  const paramsRef = useRef({ kp, ki, kd, setpoint, antiWindup, derivFilter, outputSat });
  paramsRef.current = { kp, ki, kd, setpoint, antiWindup, derivFilter, outputSat };

  const simRef = useRef<SimState>(initialSim(setpoint));
  const historyRef = useRef<History>(initialHistory());
  const [chart, setChart] = useState<History>(initialHistory());
  const [stats, setStats] = useState<Stats>({ pv: 0, responseTime: 0, settled: false });

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let lastRender = 0;

    const step = () => {
      const s = simRef.current;
      const { kp, ki, kd, setpoint, antiWindup, derivFilter, outputSat } = paramsRef.current;

      const error = setpoint - s.pv;

      if (setpoint !== s.lastSetpoint) {
        s.lastSetpoint = setpoint;
        s.spChangeTime = s.t;
        s.settled = false;
      }

      // Derivative — raw on error, optionally smoothed by a first-order
      // low-pass so a setpoint jump doesn't slam Kd straight through as
      // a step ("derivative kick"), and noise wouldn't get amplified.
      const rawDerivative = (error - s.prevError) / DT;
      const alpha = DT / (DERIV_FILTER_TF + DT);
      s.filteredDerivative += alpha * (rawDerivative - s.filteredDerivative);
      const derivative = derivFilter ? s.filteredDerivative : rawDerivative;

      const integralCandidate = s.integral + ki * error * DT;
      const uUnsat = kp * error + integralCandidate + kd * derivative;
      const uSat = outputSat ? Math.max(-SAT_LIMIT, Math.min(SAT_LIMIT, uUnsat)) : uUnsat;

      if (antiWindup === 'clamping') {
        // Conditional integration: freeze the integral the moment the
        // output is saturated *and* the error is still pushing further
        // into that same saturation direction. With output saturation
        // off there's nothing to clamp against, so this is a no-op —
        // that's expected, not a bug.
        const pushingIntoSaturation =
        outputSat && ((uUnsat > SAT_LIMIT && error > 0) || (uUnsat < -SAT_LIMIT && error < 0));
        s.integral = pushingIntoSaturation ? s.integral : integralCandidate;
      } else if (antiWindup === 'backcalc') {
        // Back-calculation: feed the saturation "excess" back into the
        // integral, scaled by a tracking time constant, so it unwinds
        // itself as soon as the actuator comes off the limit instead
        // of waiting out a hard clamp. Same no-op-without-saturation
        // property as clamping, for the same reason.
        s.integral = integralCandidate + (DT / TT) * (uSat - uUnsat);
      } else {
        s.integral = integralCandidate;
      }

      s.prevError = error;

      // The plant only ever sees what the actuator can physically send.
      s.delayBuf.push(uSat);
      const uDelayed = s.delayBuf.length > delaySteps ? s.delayBuf.shift()! : 0;

      // Forward-Euler discretization of T·pv' + pv = K·u_delayed.
      // DT (0.05s) is small relative to T (2s), so this stays stable.
      s.pv += (DT / PLANT.T) * (PLANT.K * uDelayed - s.pv);
      s.t += DT;

      if (!s.settled && Math.abs(setpoint - s.pv) <= RESPONSE_TOL) {
        s.settled = true;
      }
      if (!s.settled) {
        s.responseTime = s.t - s.spChangeTime;
      }

      const h = historyRef.current;
      h.t.push(s.t); h.sp.push(setpoint); h.pv.push(s.pv);
      if (h.t.length > MAX_SAMPLES) { h.t.shift(); h.sp.shift(); h.pv.shift(); }
    };

    const loop = (now: number) => {
      const elapsed = (now - last) / 1000;
      last = now;
      acc += elapsed;
      // Cap steps per frame so a backgrounded tab can't spiral on return.
      let guard = 0;
      while (acc >= DT && guard < 10) { step(); acc -= DT; guard++; }

      if (now - lastRender > RENDER_INTERVAL_MS) {
        lastRender = now;
        const h = historyRef.current;
        setChart({ t: [...h.t], sp: [...h.sp], pv: [...h.pv] });
        setStats({ pv: simRef.current.pv, responseTime: simRef.current.responseTime, settled: simRef.current.settled });
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const reset = () => {
    simRef.current = initialSim(paramsRef.current.setpoint);
    historyRef.current = initialHistory();
    setChart(initialHistory());
    setStats({ pv: 0, responseTime: 0, settled: false });
  };

  const chrome = plotChrome();
  const tNow = chart.t.length ? chart.t[chart.t.length - 1] : 0;
  const xRange: [number, number] = [Math.max(0, tNow - WINDOW_S), Math.max(WINDOW_S, tNow)];
  const error = setpoint - stats.pv;

  const stat = (label: string, value: string, emphasize = false) => (
    <div className="flex flex-col gap-1">
    <span className="font-mono text-meta text-text-muted">{label}</span>
    <span className={`font-mono text-lg ${emphasize ? 'text-success' : 'text-text'}`} data-numeric>{value}</span>
    </div>
  );

  return (
    <div className="mx-auto max-w-content space-y-8 px-5 py-20 tablet:px-8">
    <h1 className="font-display text-xl font-medium text-text">PID Controller Simulator</h1>

    <div className={`${kartu} flex flex-wrap gap-8`}>
    {stat('Setpoint', setpoint.toFixed(1))}
    {stat('Current Value', stats.pv.toFixed(1))}
    {stat('Error', error.toFixed(1))}
    {stat('Response Time', `${stats.responseTime.toFixed(2)}s`, stats.settled)}
    </div>

    <div className={`${kartu} flex flex-wrap gap-8`}>
    <label className={`${kontrol} flex min-w-[160px] flex-1 flex-col`}>
    <span className="font-mono" data-numeric>Kp: {kp.toFixed(2)}</span>
    <input type="range" min="0" max="5" step="0.05" value={kp} onChange={e => setKp(+e.target.value)} className={slider} />
    </label>
    <label className={`${kontrol} flex min-w-[160px] flex-1 flex-col`}>
    <span className="font-mono" data-numeric>Ki: {ki.toFixed(2)}</span>
    <input type="range" min="0" max="2" step="0.02" value={ki} onChange={e => setKi(+e.target.value)} className={slider} />
    </label>
    <label className={`${kontrol} flex min-w-[160px] flex-1 flex-col`}>
    <span className="font-mono" data-numeric>Kd: {kd.toFixed(2)}</span>
    <input type="range" min="0" max="2" step="0.02" value={kd} onChange={e => setKd(+e.target.value)} className={slider} />
    </label>
    <label className={`${kontrol} flex min-w-[160px] flex-1 flex-col`}>
    <span className="font-mono" data-numeric>Setpoint: {setpoint}</span>
    <input type="range" min="0" max="100" step="1" value={setpoint} onChange={e => setSetpoint(+e.target.value)} className={slider} />
    </label>
    </div>

    <div className={`${kartu} flex flex-wrap items-end gap-8`}>
    <label className={`${kontrol} flex min-w-[160px] flex-1 flex-col`}>
    <span className="font-mono text-meta text-text-muted">Output saturation</span>
    <select
    className={`${selectCls} mt-2`}
    value={outputSat ? 'on' : 'off'}
    onChange={e => setOutputSat(e.target.value === 'on')}
    >
    <option value="off">Off</option>
    <option value="on">On (±{SAT_LIMIT})</option>
    </select>
    </label>
    <label className={`${kontrol} flex min-w-[160px] flex-1 flex-col ${!outputSat ? 'opacity-50' : ''}`}>
    <span className="font-mono text-meta text-text-muted">Anti-windup</span>
    <select
    className={`${selectCls} mt-2 ${!outputSat ? 'cursor-not-allowed' : ''}`}
    value={antiWindup}
    disabled={!outputSat}
    onChange={e => setAntiWindup(e.target.value as AntiWindup)}
    >
    <option value="off">Off</option>
    <option value="clamping">Clamping</option>
    <option value="backcalc">Back-calculation</option>
    </select>
    {!outputSat && (
      <span className="mt-1 text-meta text-text-muted">Needs output saturation on</span>
    )}
    </label>
    <label className={`${kontrol} flex min-w-[160px] flex-1 flex-col`}>
    <span className="font-mono text-meta text-text-muted">Derivative filter</span>
    <select
    className={`${selectCls} mt-2`}
    value={derivFilter ? 'on' : 'off'}
    onChange={e => setDerivFilter(e.target.value === 'on')}
    >
    <option value="off">Off</option>
    <option value="on">On</option>
    </select>
    </label>
    <button onClick={reset} className={buttonPrimary}>Reset</button>
    </div>

    <div className={kartu}>
    <Plot
    data={[
      {
        x: chart.t, y: chart.sp, type: 'scatter', mode: 'lines',
        name: 'Setpoint',
        // A guide line, not a signal — muted and dashed rather than
        // a second accent hue. §2's "one accent" is for the signal.
        line: { color: token('--text-muted'), width: 1.5, dash: 'dash' },
      },
      {
        x: chart.t, y: chart.pv, type: 'scatter', mode: 'lines',
        name: 'Process Variable',
        line: { color: token('--accent'), width: 2.5 },
      },
    ]}
    layout={{
      ...chrome,
      xaxis: { ...chrome.xaxis, title: { text: 'Time (s)' }, range: xRange },
          // Fixed headroom above/below the setpoint range so overshoot and
          // ringing are visible without the axis rescaling every frame —
          // only the x-axis should visibly move.
          yaxis: { ...chrome.yaxis, title: { text: 'Value' }, range: [-20, 140] },
          margin: { l: 50, r: 20, t: 20, b: 40 },
          showlegend: false,
          autosize: true,
    }}
    config={{ displayModeBar: false }}
    useResizeHandler className="h-96 w-full"
    />
    </div>

    <p className="text-sm text-text-muted">
    Plant is a fixed first-order system with pure delay (K={PLANT.K}, T={PLANT.T}s, L={PLANT.L}s).
    Drag the setpoint to see the step response.
    </p>
    </div>
  );
}
