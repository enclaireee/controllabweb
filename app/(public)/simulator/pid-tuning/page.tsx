'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { token, plotChrome, kartu, kontrol, slider, buttonPrimary } from '../_lib/ui';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });
const PLANT = { K: 1.0, T: 2.0, L: 0.4 };

const DT = 0.05;
const WINDOW_S = 20;
const MAX_SAMPLES = Math.ceil(WINDOW_S / DT) + 20;
const RENDER_INTERVAL_MS = 66;
const INTEGRAL_CLAMP = 100;

type SimState = { t: number; pv: number; integral: number; prevError: number; delayBuf: number[] };
type History = { t: number[]; sp: number[]; pv: number[] };

const delaySteps = Math.max(1, Math.round(PLANT.L / DT));

const initialSim = (): SimState => ({ t: 0, pv: 0, integral: 0, prevError: 0, delayBuf: [] });
const initialHistory = (): History => ({ t: [], sp: [], pv: [] });

export default function PidSimulator() {
  const [kp, setKp] = useState(1.0);
  const [ki, setKi] = useState(0.3);
  const [kd, setKd] = useState(0.1);
  const [setpoint, setSetpoint] = useState(50);

  const paramsRef = useRef({ kp, ki, kd, setpoint });
  paramsRef.current = { kp, ki, kd, setpoint };

  const simRef = useRef<SimState>(initialSim());
  const historyRef = useRef<History>(initialHistory());
  const [chart, setChart] = useState<History>(initialHistory());
  const [pv, setPv] = useState(0);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let lastRender = 0;

    const step = () => {
      const s = simRef.current;
      const { kp, ki, kd, setpoint } = paramsRef.current;

      const error = setpoint - s.pv;
      s.integral = Math.max(-INTEGRAL_CLAMP, Math.min(INTEGRAL_CLAMP, s.integral + error * DT));
      const derivative = (error - s.prevError) / DT;
      s.prevError = error;

      const u = kp * error + ki * s.integral + kd * derivative;

      s.delayBuf.push(u);
      const uDelayed = s.delayBuf.length > delaySteps ? s.delayBuf.shift()! : 0;

      s.pv += (DT / PLANT.T) * (PLANT.K * uDelayed - s.pv);
      s.t += DT;

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
        setPv(simRef.current.pv);
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const reset = () => {
    simRef.current = initialSim();
    historyRef.current = initialHistory();
    setChart(initialHistory());
    setPv(0);
  };

  const chrome = plotChrome();
  const tNow = chart.t.length ? chart.t[chart.t.length - 1] : 0;
  const xRange: [number, number] = [Math.max(0, tNow - WINDOW_S), Math.max(WINDOW_S, tNow)];

  return (
    <div className="mx-auto max-w-content space-y-8 px-5 py-20 tablet:px-8">
    <div className="flex flex-wrap items-baseline justify-between gap-3">
    <h1 className="font-display text-xl font-medium text-text">PID Controller Simulator</h1>
    <span className="font-mono text-sm text-text-muted" data-numeric>PV: {pv.toFixed(1)}</span>
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
    <button onClick={reset} className={`${buttonPrimary} self-end`}>Reset</button>
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
    Plant is a fixed first-order system with dead time (K={PLANT.K}, T={PLANT.T}s, L={PLANT.L}s).
    Drag the setpoint to see the step response; the chart keeps running as you retune the gains.
    </p>
    </div>
  );
}
