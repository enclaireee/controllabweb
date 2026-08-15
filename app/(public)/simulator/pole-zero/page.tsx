'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import katex from 'katex';
import 'katex/dist/katex.min.css';

import { token, plotChrome, kartu, kontrol, slider, selectCls } from '../_lib/ui';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

type Analysis = {
    tf_latex: string;
    step: { t: number[]; y: number[] };
    impulse: { t: number[]; y: number[] };
    bode: { w: number[]; mag: number[] };
    surface: { sigma: number[]; omega: number[]; z: number[][] };
    zeros: { x: number[]; y: number[]; z: number[] };
};

export default function PoleZeroSimulator() {
    const [numPoles, setNumPoles] = useState(2);
    const [numZeros, setNumZeros] = useState(0);

    const [pRe, setPRe] = useState([-1.0, -2.0, -1.5]);
    const [pIm, setPIm] = useState([2.0, 3.0]);
    const [zRe, setZRe] = useState([-2.0, -3.0, -1.0]);
    const [zIm, setZIm] = useState([0.0, 0.0]);

    const [data, setData] = useState<Analysis | null>(null);
    const [gagal, setGagal] = useState(false);

    useEffect(() => {
        const h = setTimeout(() => {
            fetch('http://localhost:8000/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ num_poles: numPoles, num_zeros: numZeros, p_re: pRe, p_im: pIm, z_re: zRe, z_im: zIm })
            })
                .then(r => r.json())
                .then(d => { setData(d); setGagal(false); })
                .catch(() => setGagal(true));
        }, 60);
        return () => clearTimeout(h);
    }, [numPoles, numZeros, pRe, pIm, zRe, zIm]);

    if (gagal && !data) return (
        <div className="mx-auto max-w-prose px-5 py-20">
            <h1 className="font-display text-lg text-text">Server simulasi tidak merespons</h1>
            <p className="mt-3 text-sm text-text-muted">
                Jalankan backend lebih dulu, lalu muat ulang halaman ini.
            </p>
            <code className="mt-5 inline-block rounded-button border border-border bg-surface px-3 py-2 font-mono text-meta text-text">
                uvicorn backend.main:app --reload --port 8000
            </code>
        </div>
    );

    if (!data) return (
        <div className="mx-auto max-w-prose px-5 py-20 text-sm text-text-muted">
            Memuat data simulasi…
        </div>
    );

    const updateArr = (
        arr: number[],
        setArr: (next: number[]) => void,
        idx: number,
        val: number,
    ) => {
        const next = [...arr];
        next[idx] = val;
        setArr(next);
    };

    const chrome = plotChrome();

    const render2D = (x: number[], y: number[], title: string, xL: string, yL: string, logX = false) => (
        <div className="rounded-card border border-border bg-surface p-5">
            <Plot

                data={[{ x, y, type: 'scatter', mode: 'lines', line: { color: token('--accent'), width: 2 } }]}
                layout={{
                    ...chrome,
                    title: { text: title, font: { color: token('--text'), size: 15 } },
                    xaxis: { ...chrome.xaxis, title: { text: xL }, type: logX ? 'log' : 'linear' },
                    yaxis: { ...chrome.yaxis, title: { text: yL } },
                    margin: { l: 50, r: 20, t: 35, b: 40 },
                    autosize: true,
                }}
                useResizeHandler className="h-72 w-full"
            />
        </div>
    );

    return (
        <div className="mx-auto max-w-content space-y-8 px-5 py-20 tablet:px-8">
            <h1 className="font-display text-xl font-medium text-text">Poles and Zeros Simulator</h1>

            <div
                className={`${kartu} inline-block text-base text-text`}
                dangerouslySetInnerHTML={{ __html: katex.renderToString(data.tf_latex, { throwOnError: false }) }}
            />

            <div className={`${kartu} flex flex-wrap gap-8`}>
                <label className="flex flex-col gap-2 text-meta font-medium text-text-muted">
                    Poles
                    <select
                        value={numPoles}
                        onChange={e => { const v = +e.target.value; setNumPoles(v); if (numZeros > v) setNumZeros(v); }}
                        className={selectCls}
                    >
                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Pole{n > 1 && 's'}</option>)}
                    </select>
                </label>
                <label className="flex flex-col gap-2 text-meta font-medium text-text-muted">
                    Zeros
                    <select value={numZeros} onChange={e => setNumZeros(+e.target.value)} className={selectCls}>
                        {Array.from({ length: numPoles + 1 }, (_, i) => <option key={i} value={i}>{i} Zero{i !== 1 && 's'}</option>)}
                    </select>
                </label>
            </div>

            <div className="grid grid-cols-1 gap-8 tablet:grid-cols-2">
                <div className="space-y-3">
                    <h2 className="font-mono text-meta uppercase tracking-wide text-text-muted">Poles</h2>
                    {numPoles >= 1 && (
                        <div className={kontrol}>
                            <span className="text-text">{numPoles === 1 ? 'Real Pole 1' : 'Pole Pair 1'}</span>
                            <label className="mt-3 flex flex-col">
                                <span className="font-mono" data-numeric>Real (σ1): {pRe[0]}</span>
                                <input type="range" min="-5" max="2" step="0.1" value={pRe[0]} onChange={e => updateArr(pRe, setPRe, 0, +e.target.value)} className={slider} />
                            </label>
                            {numPoles >= 2 && (
                                <label className="mt-3 flex flex-col">
                                    <span className="font-mono" data-numeric>Imag (±ω1): {pIm[0]}</span>
                                    <input type="range" min="0" max="8" step="0.1" value={pIm[0]} onChange={e => updateArr(pIm, setPIm, 0, +e.target.value)} className={slider} />
                                </label>
                            )}
                        </div>
                    )}
                    {numPoles >= 3 && (
                        <div className={kontrol}>
                            <span className="text-text">{numPoles === 3 ? 'Real Pole 2' : 'Pole Pair 2'}</span>
                            <label className="mt-3 flex flex-col">
                                <span className="font-mono" data-numeric>Real (σ2): {pRe[1]}</span>
                                <input type="range" min="-5" max="2" step="0.1" value={pRe[1]} onChange={e => updateArr(pRe, setPRe, 1, +e.target.value)} className={slider} />
                            </label>
                            {numPoles >= 4 && (
                                <label className="mt-3 flex flex-col">
                                    <span className="font-mono" data-numeric>Imag (±ω2): {pIm[1]}</span>
                                    <input type="range" min="0" max="8" step="0.1" value={pIm[1]} onChange={e => updateArr(pIm, setPIm, 1, +e.target.value)} className={slider} />
                                </label>
                            )}
                        </div>
                    )}
                    {numPoles === 5 && (
                        <div className={kontrol}>
                            <span className="text-text">Real Pole 3</span>
                            <label className="mt-3 flex flex-col">
                                <span className="font-mono" data-numeric>Real (σ3): {pRe[2]}</span>
                                <input type="range" min="-5" max="2" step="0.1" value={pRe[2]} onChange={e => updateArr(pRe, setPRe, 2, +e.target.value)} className={slider} />
                            </label>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <h2 className="font-mono text-meta uppercase tracking-wide text-text-muted">Zeros</h2>
                    {numZeros === 0 && <p className="text-sm text-text-muted">Belum ada zero yang dipilih.</p>}
                    {numZeros >= 1 && (
                        <div className={kontrol}>
                            <span className="text-text">{numZeros === 1 ? 'Real Zero 1' : 'Zero Pair 1'}</span>
                            <label className="mt-3 flex flex-col">
                                <span className="font-mono" data-numeric>Real (σ_z1): {zRe[0]}</span>
                                <input type="range" min="-6" max="2" step="0.1" value={zRe[0]} onChange={e => updateArr(zRe, setZRe, 0, +e.target.value)} className={slider} />
                            </label>
                            {numZeros >= 2 && (
                                <label className="mt-3 flex flex-col">
                                    <span className="font-mono" data-numeric>Imag (±ω_z1): {zIm[0]}</span>
                                    <input type="range" min="0" max="8" step="0.1" value={zIm[0]} onChange={e => updateArr(zIm, setZIm, 0, +e.target.value)} className={slider} />
                                </label>
                            )}
                        </div>
                    )}
                    {numZeros >= 3 && (
                        <div className={kontrol}>
                            <span className="text-text">{numZeros === 3 ? 'Real Zero 2' : 'Zero Pair 2'}</span>
                            <label className="mt-3 flex flex-col">
                                <span className="font-mono" data-numeric>Real (σ_z2): {zRe[1]}</span>
                                <input type="range" min="-6" max="2" step="0.1" value={zRe[1]} onChange={e => updateArr(zRe, setZRe, 1, +e.target.value)} className={slider} />
                            </label>
                            {numZeros >= 4 && (
                                <label className="mt-3 flex flex-col">
                                    <span className="font-mono" data-numeric>Imag (±ω_z2): {zIm[1]}</span>
                                    <input type="range" min="0" max="8" step="0.1" value={zIm[1]} onChange={e => updateArr(zIm, setZIm, 1, +e.target.value)} className={slider} />
                                </label>
                            )}
                        </div>
                    )}
                    {numZeros === 5 && (
                        <div className={kontrol}>
                            <span className="text-text">Real Zero 3</span>
                            <label className="mt-3 flex flex-col">
                                <span className="font-mono" data-numeric>Real (σ_z3): {zRe[2]}</span>
                                <input type="range" min="-6" max="2" step="0.1" value={zRe[2]} onChange={e => updateArr(zRe, setZRe, 2, +e.target.value)} className={slider} />
                            </label>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 tablet:grid-cols-2">
                {render2D(data.step.t, data.step.y, 'Step Response', 'Time (s)', 'y(t)')}
                {render2D(data.impulse.t, data.impulse.y, 'Impulse Response', 'Time (s)', 'y(t)')}
                {render2D(data.bode.w, data.bode.mag, 'Magnitude Response', 'Frequency (rad/s)', 'Magnitude (dB)', true)}

                <div className={`${kartu} tablet:col-span-2`}>
                    <Plot
                        data={[
                            {
                                x: data.surface.sigma, y: data.surface.omega, z: data.surface.z,
                                type: 'surface',

                                colorscale: [
                                    [0, token('--bg')],
                                    [0.5, token('--accent-deep')],
                                    [1, token('--highlight')],
                                ],
                                contours: {
                                    x: { show: true, color: token('--border'), width: 1 },
                                    y: { show: true, color: token('--border'), width: 1 },
                                    z: { show: true, usecolormap: true, project: { z: true } }
                                }
                            },
                            {
                                x: data.zeros.x, y: data.zeros.y, z: data.zeros.z,
                                type: 'scatter3d', mode: 'markers', name: 'Zeros (o)',

                                marker: { size: 6, color: token('--highlight'), symbol: 'circle' }
                            }
                        ]}
                        layout={{
                            paper_bgcolor: 'rgba(0,0,0,0)',
                            plot_bgcolor: 'rgba(0,0,0,0)',
                            font: { color: token('--text-muted'), size: 13 },
                            title: { text: '3D s-Plane Surface Magnitude |H(s)|', font: { color: token('--text'), size: 15 } },
                            scene: {
                                xaxis: { title: { text: 'Real (σ)' }, gridcolor: token('--border') },
                                yaxis: { title: { text: 'Imag (jω)' }, gridcolor: token('--border') },
                                zaxis: { title: { text: '|H(s)|' }, gridcolor: token('--border') }
                            },
                            margin: { l: 20, r: 20, t: 40, b: 20 },
                            autosize: true,
                        }}
                        useResizeHandler className="h-[600px] w-full"
                    />
                </div>
            </div>
        </div>
    );
}
