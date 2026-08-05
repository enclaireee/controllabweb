'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function PoleZeroSimulator() {
    const [numPoles, setNumPoles] = useState(2);
    const [numZeros, setNumZeros] = useState(0);

    const [pRe, setPRe] = useState([-1.0, -2.0, -1.5]);
    const [pIm, setPIm] = useState([2.0, 3.0]);
    const [zRe, setZRe] = useState([-2.0, -3.0, -1.0]);
    const [zIm, setZIm] = useState([0.0, 0.0]);

    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const h = setTimeout(() => {
            fetch('http://localhost:8000/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ num_poles: numPoles, num_zeros: numZeros, p_re: pRe, p_im: pIm, z_re: zRe, z_im: zIm })
            }).then(r => r.json()).then(setData);
        }, 60);
        return () => clearTimeout(h);
    }, [numPoles, numZeros, pRe, pIm, zRe, zIm]);

    if (!data) return <div className="p-8 font-sans">Loading simulation data...</div>;

    const updateArr = (arr: number[], setArr: Function, idx: number, val: number) => {
        const next = [...arr];
        next[idx] = val;
        setArr(next);
    };

    const render2D = (x: number[], y: number[], title: string, xL: string, yL: string, color: string, logX = false) => (
        <Plot
        data={[{ x, y, type: 'scatter', mode: 'lines', line: { color } }]}
        layout={{ title, xaxis: { title: { text: xL }, type: logX ? 'log' : 'linear' }, yaxis: { title: { text: yL } }, margin: { l: 50, r: 20, t: 35, b: 40 }, autosize: true }}
        useResizeHandler className="w-full h-72"
        />
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
        <h1 className="text-2xl font-bold">Control System Simulator</h1>
        <div className="text-xl p-4 bg-slate-50 border rounded-lg inline-block" dangerouslySetInnerHTML={{ __html: katex.renderToString(data.tf_latex, { throwOnError: false }) }} />

        <div className="flex gap-6 bg-gray-100 p-4 rounded-lg">
        <label className="flex flex-col text-sm font-semibold">
        Poles:
        <select value={numPoles} onChange={e => { const v = +e.target.value; setNumPoles(v); if (numZeros > v) setNumZeros(v); }} className="p-1 border rounded bg-white">
        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Pole{n > 1 && 's'}</option>)}
        </select>
        </label>
        <label className="flex flex-col text-sm font-semibold">
        Zeros:
        <select value={numZeros} onChange={e => setNumZeros(+e.target.value)} className="p-1 border rounded bg-white">
        {Array.from({ length: numPoles + 1 }, (_, i) => <option key={i} value={i}>{i} Zero{i !== 1 && 's'}</option>)}
        </select>
        </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 border rounded-lg">
        <div className="space-y-3">
        <h3 className="font-bold text-sm text-red-700">Poles</h3>
        {numPoles >= 1 && (
            <div className="p-2 border rounded bg-white text-xs space-y-1">
            <span>{numPoles === 1 ? 'Real Pole 1' : 'Pole Pair 1'}</span>
            <label className="flex flex-col">Real (σ1): {pRe[0]}<input type="range" min="-5" max="2" step="0.1" value={pRe[0]} onChange={e => updateArr(pRe, setPRe, 0, +e.target.value)} /></label>
            {numPoles >= 2 && <label className="flex flex-col">Imag (±ω1): {pIm[0]}<input type="range" min="0" max="8" step="0.1" value={pIm[0]} onChange={e => updateArr(pIm, setPIm, 0, +e.target.value)} /></label>}
            </div>
        )}
        {numPoles >= 3 && (
            <div className="p-2 border rounded bg-white text-xs space-y-1">
            <span>{numPoles === 3 ? 'Real Pole 2' : 'Pole Pair 2'}</span>
            <label className="flex flex-col">Real (σ2): {pRe[1]}<input type="range" min="-5" max="2" step="0.1" value={pRe[1]} onChange={e => updateArr(pRe, setPRe, 1, +e.target.value)} /></label>
            {numPoles >= 4 && <label className="flex flex-col">Imag (±ω2): {pIm[1]}<input type="range" min="0" max="8" step="0.1" value={pIm[1]} onChange={e => updateArr(pIm, setPIm, 1, +e.target.value)} /></label>}
            </div>
        )}
        {numPoles === 5 && (
            <div className="p-2 border rounded bg-white text-xs space-y-1">
            <span>Real Pole 3</span>
            <label className="flex flex-col">Real (σ3): {pRe[2]}<input type="range" min="-5" max="2" step="0.1" value={pRe[2]} onChange={e => updateArr(pRe, setPRe, 2, +e.target.value)} /></label>
            </div>
        )}
        </div>

        <div className="space-y-3">
        <h3 className="font-bold text-sm text-blue-700">Zeros</h3>
        {numZeros === 0 && <p className="text-xs text-gray-500 italic">No zeros selected.</p>}
        {numZeros >= 1 && (
            <div className="p-2 border rounded bg-white text-xs space-y-1">
            <span>{numZeros === 1 ? 'Real Zero 1' : 'Zero Pair 1'}</span>
            <label className="flex flex-col">Real (σ_z1): {zRe[0]}<input type="range" min="-6" max="2" step="0.1" value={zRe[0]} onChange={e => updateArr(zRe, setZRe, 0, +e.target.value)} /></label>
            {numZeros >= 2 && <label className="flex flex-col">Imag (±ω_z1): {zIm[0]}<input type="range" min="0" max="8" step="0.1" value={zIm[0]} onChange={e => updateArr(zIm, setZIm, 0, +e.target.value)} /></label>}
            </div>
        )}
        {numZeros >= 3 && (
            <div className="p-2 border rounded bg-white text-xs space-y-1">
            <span>{numZeros === 3 ? 'Real Zero 2' : 'Zero Pair 2'}</span>
            <label className="flex flex-col">Real (σ_z2): {zRe[1]}<input type="range" min="-6" max="2" step="0.1" value={zRe[1]} onChange={e => updateArr(zRe, setZRe, 1, +e.target.value)} /></label>
            {numZeros >= 4 && <label className="flex flex-col">Imag (±ω_z2): {zIm[1]}<input type="range" min="0" max="8" step="0.1" value={zIm[1]} onChange={e => updateArr(zIm, setZIm, 1, +e.target.value)} /></label>}
            </div>
        )}
        {numZeros === 5 && (
            <div className="p-2 border rounded bg-white text-xs space-y-1">
            <span>Real Zero 3</span>
            <label className="flex flex-col">Real (σ_z3): {zRe[2]}<input type="range" min="-6" max="2" step="0.1" value={zRe[2]} onChange={e => updateArr(zRe, setZRe, 2, +e.target.value)} /></label>
            </div>
        )}
        </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {render2D(data.step.t, data.step.y, 'Step Response', 'Time (s)', 'y(t)', '#2563eb')}
        {render2D(data.impulse.t, data.impulse.y, 'Impulse Response', 'Time (s)', 'y(t)', '#059669')}
        {render2D(data.bode.w, data.bode.mag, 'Magnitude Response', 'Frequency (rad/s)', 'Magnitude (dB)', '#d97706', true)}

        <div className="md:col-span-2">
        <Plot
        data={[
            {
                x: data.surface.sigma, y: data.surface.omega, z: data.surface.z,
            type: 'surface', colorscale: 'Viridis',
            contours: { x: { show: true, color: 'rgba(255,255,255,0.3)', width: 1 }, y: { show: true, color: 'rgba(255,255,255,0.3)', width: 1 }, z: { show: true, usecolormap: true, project: { z: true } } }
            },
            {
                x: data.zeros.x, y: data.zeros.y, z: data.zeros.z,
            type: 'scatter3d', mode: 'markers', name: 'Zeros (o)',
            marker: { size: 8, color: '#2563eb', symbol: 'circle' }
            }
        ]}
        layout={{ title: '3D s-Plane Surface Magnitude |H(s)|', scene: { xaxis: { title: { text: 'Real (σ)' } }, yaxis: { title: { text: 'Imag (jω)' } }, zaxis: { title: { text: '|H(s)|' } } }, margin: { l: 20, r: 20, t: 40, b: 20 }, autosize: true }}
        useResizeHandler className="w-full h-[600px]"
        />
        </div>
        </div>
        </div>
    );
}
