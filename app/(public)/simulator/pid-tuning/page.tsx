'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { token, plotChrome, kartu, kontrol, slider, selectCls, buttonPrimary } from '../_lib/ui';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

// A slightly damped plant to make visualizing the controller's impact easier
const PLANT = { K: 1.0, T: 3.0, L: 0.5 };

const DT = 0.05;
const WINDOW_S = 20;
const MAX_SAMPLES = Math.ceil(WINDOW_S / DT) + 20;
const RENDER_INTERVAL_MS = 66;

const SAT_LIMIT = 100;
const TT = 0.5;
const DERIV_FILTER_TF = 0.1;
const RESPONSE_TOL = 2;

type AntiWindup = 'off' | 'clamping' | 'backcalc';

type SimState = {
  t: number;
  pv: number;
  integral: number;
  prevError: number;
  prevPv: number;
  filteredDerivative: number;
  delayBuf: number[];
  lastSetpoint: number;
  spChangeTime: number;
  settled: boolean;
  responseTime: number;
};
type History = { t: number[]; sp: number[]; pv: number[] };
type Stats = { pv: number; responseTime: number; settled: boolean };

const delaySteps = Math.max(1, Math.round(PLANT.L / DT));

// start at 0,simulates a machine just powering on
const initialSim = (setpoint: number): SimState => {
  const uSteady = setpoint / PLANT.K;
  return {
    t: 0,
    pv: setpoint,
    integral: uSteady,
    prevError: 0,
    prevPv: setpoint,
    filteredDerivative: 0,
    delayBuf: Array(delaySteps).fill(uSteady),
    lastSetpoint: setpoint,
    spChangeTime: 0,
    settled: true,
    responseTime: 0,
  };
};

const initialHistory = (setpoint: number): History => ({ t: [0], sp: [setpoint], pv: [setpoint] });

export default function PidSimulator() {
  const [kp, setKp] = useState(1.0);
  const [ki, setKi] = useState(0.3);
  const [kd, setKd] = useState(0.1);
  const [setpoint, setSetpoint] = useState(0); // Power on at 0
  const [antiWindup, setAntiWindup] = useState<AntiWindup>('off');
  const [derivFilter, setDerivFilter] = useState(false);
  const [derivOnMeas, setDerivOnMeas] = useState(true);
  const [outputSat, setOutputSat] = useState(false);

  const paramsRef = useRef({ kp, ki, kd, setpoint, antiWindup, derivFilter, derivOnMeas, outputSat });
  paramsRef.current = { kp, ki, kd, setpoint, antiWindup, derivFilter, derivOnMeas, outputSat };

  const simRef = useRef<SimState>(initialSim(setpoint));
  const historyRef = useRef<History>(initialHistory(setpoint));
  const [chart, setChart] = useState<History>(initialHistory(setpoint));
  const [stats, setStats] = useState<Stats>({ pv: setpoint, responseTime: 0, settled: true });

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let lastRender = 0;

    const step = () => {
      const s = simRef.current;
      const { kp, ki, kd, setpoint, antiWindup, derivFilter, derivOnMeas, outputSat } = paramsRef.current;

      const error = setpoint - s.pv;

      if (setpoint !== s.lastSetpoint) {
        s.lastSetpoint = setpoint;
        s.spChangeTime = s.t;
        s.settled = false;
      }

      // Derivative on Measurement
      const rawDerivative = derivOnMeas
      ? -(s.pv - s.prevPv) / DT
      : (error - s.prevError) / DT;

      // Low-pass filter to smooth out high-frequency noise
      const alpha = DT / (DERIV_FILTER_TF + DT);
      s.filteredDerivative += alpha * (rawDerivative - s.filteredDerivative);
      const derivative = derivFilter ? s.filteredDerivative : rawDerivative;

      const integralCandidate = s.integral + ki * error * DT;
      const uUnsat = kp * error + integralCandidate + kd * derivative;
      const uSat = outputSat ? Math.max(-SAT_LIMIT, Math.min(SAT_LIMIT, uUnsat)) : uUnsat;

      // Anti-windup strategies
      if (antiWindup === 'clamping') {
        const pushingIntoSaturation = outputSat && ((uUnsat > SAT_LIMIT && error > 0) || (uUnsat < -SAT_LIMIT && error < 0));
        s.integral = pushingIntoSaturation ? s.integral : integralCandidate;
      } else if (antiWindup === 'backcalc') {
        s.integral = integralCandidate + (DT / TT) * (uSat - uUnsat);
      } else {
        s.integral = integralCandidate;
      }

      s.prevError = error;
      s.prevPv = s.pv;

      s.delayBuf.push(uSat);
      const uDelayed = s.delayBuf.length > delaySteps ? s.delayBuf.shift()! : 0;

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
    historyRef.current = initialHistory(paramsRef.current.setpoint);
    setChart(initialHistory(paramsRef.current.setpoint));
    setStats({ pv: paramsRef.current.setpoint, responseTime: 0, settled: true });
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
    </label>

    <label className={`${kontrol} flex min-w-[160px] flex-1 flex-col`}>
    <span className="font-mono text-meta text-text-muted">Derivative source</span>
    <select
    className={`${selectCls} mt-2`}
    value={derivOnMeas ? 'pv' : 'error'}
    onChange={e => setDerivOnMeas(e.target.value === 'pv')}
    >
    <option value="pv">Measurement</option>
    <option value="error">Error</option>
    </select>
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
