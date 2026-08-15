from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from scipy import signal, interpolate

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class SystemConfig(BaseModel):
    num_poles: int
    num_zeros: int
    p_re: list[float]
    p_im: list[float]
    z_re: list[float]
    z_im: list[float]

def fmt_poly(c):
    c = np.trim_zeros(c, 'f')
    if not len(c): return "0"
    deg = len(c) - 1
    terms = []
    for i, val in enumerate(c):
        p = deg - i
        if abs(val) < 1e-4: continue
        sign = " + " if val > 0 else " - "
        if not terms: sign = "" if val > 0 else "-"
        v = f"{abs(val):.2f}".rstrip('0').rstrip('.')
        if v == "1" and p > 0: v = ""
        terms.append(f"{sign}{v}s^{{{p}}}" if p > 1 else f"{sign}{v}s" if p == 1 else f"{sign}{v or 1}")
    return "".join(terms) or "1"

@app.post("/api/analyze")
def analyze(cfg: SystemConfig):
    def build_pts(num, re, im):
        pts = []
        if num >= 1: pts.extend([complex(re[0], im[0]), complex(re[0], -im[0])] if im[0] else [complex(re[0], 0)])
        if num >= 3: pts.extend([complex(re[1], im[1]), complex(re[1], -im[1])] if im[1] else [complex(re[1], 0)])
        if num in (1, 3, 5) and len(pts) < num: pts.append(complex(re[2], 0))
        return pts[:num]

    poles, zeros = build_pts(cfg.num_poles, cfg.p_re, cfg.p_im), build_pts(cfg.num_zeros, cfg.z_re, cfg.z_im)
    b, a = signal.zpk2tf(zeros, poles, 1.0)
    sys = signal.TransferFunction(b, a)

    t, w = np.linspace(0, 10, 300), np.logspace(-1, 2, 300)
    try: _, y_s = signal.step(sys, T=t)
    except: y_s = np.zeros_like(t)
    try: _, y_i = signal.impulse(sys, T=t)
    except: y_i = np.zeros_like(t)
    _, mag, _ = signal.bode(sys, w=w)

    sigmas, omegas = np.linspace(-6, 3, 60), np.linspace(-10, 10, 60)
    S = sigmas + 1j * omegas[:, None]
    Num = np.prod([S - z for z in zeros], axis=0) if zeros else np.ones_like(S)
    Den = np.prod([S - p for p in poles], axis=0)
    Mag = np.clip(np.abs(Num / Den), 0, 15)

    interp = interpolate.RegularGridInterpolator((omegas, sigmas), Mag, bounds_error=False, fill_value=0.0)
    z_markers = {"x": [z.real for z in zeros], "y": [z.imag for z in zeros], "z": [float(interp([z.imag, z.real])[0]) + 0.15 for z in zeros]}

    return {
        "tf_latex": f"H(s) = \\frac{{{fmt_poly(b)}}}{{{fmt_poly(a)}}}",
        "step": {"t": t.tolist(), "y": y_s.tolist()},
        "impulse": {"t": t.tolist(), "y": y_i.tolist()},
        "bode": {"w": w.tolist(), "mag": mag.tolist()},
        "surface": {"sigma": sigmas.tolist(), "omega": omegas.tolist(), "z": Mag.tolist()},
        "zeros": z_markers
    }
