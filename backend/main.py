from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from scipy import signal, interpolate

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class SystemConfig(BaseModel):
    num_poles: int
    num_zeros: int
    p_re: list[float]
    p_im: list[float]
    z_re: list[float]
    z_im: list[float]

def fmt_poly(c: np.ndarray) -> str:
    """Formats polynomial coefficients into LaTeX string representation."""
    c = np.real_if_close(c)
    c = np.trim_zeros(c, "f")
    if len(c) == 0:
        return "0"

    deg = len(c) - 1
    terms = []

    for i, val in enumerate(c):
        p = deg - i
        val = float(np.real(val))
        if abs(val) < 1e-4:
            continue

        sign = " + " if val > 0 else " - "
        if not terms:
            sign = "" if val > 0 else "-"

        v = f"{abs(val):.2f}".rstrip("0").rstrip(".")
        if v == "1" and p > 0:
            v = ""

        if p > 1:
            terms.append(f"{sign}{v}s^{{{p}}}")
        elif p == 1:
            terms.append(f"{sign}{v}s")
        else:
            terms.append(f"{sign}{v or 1}")

    return "".join(terms) or "1"

def build_pts(num: int, re: list[float], im: list[float]) -> list[complex]:
    """Reconstructs complex conjugate pairs safely from input lists."""
    def safe_get(lst: list[float], idx: int) -> float:
        return lst[idx] if idx < len(lst) else 0.0

    pts = []
    if num >= 1:
        r0, i0 = safe_get(re, 0), safe_get(im, 0)
        pts.extend([complex(r0, i0), complex(r0, -i0)] if i0 else [complex(r0, 0)])

    if num >= 3:
        r1, i1 = safe_get(re, 1), safe_get(im, 1)
        pts.extend([complex(r1, i1), complex(r1, -i1)] if i1 else [complex(r1, 0)])

    if num in (1, 3, 5) and len(pts) < num:
        pts.append(complex(safe_get(re, 2), 0))

    return pts[:num]

@app.post("/api/analyze")
def analyze(cfg: SystemConfig):
    poles = build_pts(cfg.num_poles, cfg.p_re, cfg.p_im)
    zeros = build_pts(cfg.num_zeros, cfg.z_re, cfg.z_im)

    b, a = signal.zpk2tf(zeros, poles, 1.0)
    b, a = np.real_if_close(b), np.real_if_close(a)
    sys_tf = signal.TransferFunction(b, a)

    t = np.linspace(0, 10, 300)
    w = np.logspace(-1, 2, 300)

    try:
        _, y_s = signal.step(sys_tf, T=t)
        y_s = np.nan_to_num(y_s)
    except Exception:
        y_s = np.zeros_like(t)

    try:
        _, y_i = signal.impulse(sys_tf, T=t)
        y_i = np.nan_to_num(y_i)
    except Exception:
        y_i = np.zeros_like(t)

    try:
        _, mag, _ = signal.bode(sys_tf, w=w)
        mag = np.nan_to_num(mag)
    except Exception:
        mag = np.zeros_like(w)

    sigmas = np.linspace(-6, 3, 60)
    omegas = np.linspace(-10, 10, 60)
    S = sigmas + 1j * omegas[:, None]

    Num = np.prod([S - z for z in zeros], axis=0) if zeros else np.ones_like(S)
    Den = np.prod([S - p for p in poles], axis=0) if poles else np.ones_like(S)

    with np.errstate(divide="ignore", invalid="ignore"):
        Mag = np.abs(Num / Den)
        Mag = np.nan_to_num(Mag, nan=15.0, posinf=15.0, neginf=0.0)
        Mag = np.clip(Mag, 0, 15)

    interp = interpolate.RegularGridInterpolator(
        (omegas, sigmas), Mag, bounds_error=False, fill_value=0.0
    )
    z_markers = {
        "x": [z.real for z in zeros],
        "y": [z.imag for z in zeros],
        "z": [float(interp([z.imag, z.real])[0]) + 0.15 for z in zeros],
    }

    return {
        "tf_latex": f"H(s) = \\frac{{{fmt_poly(b)}}}{{{fmt_poly(a)}}}",
        "step": {"t": t.tolist(), "y": y_s.tolist()},
        "impulse": {"t": t.tolist(), "y": y_i.tolist()},
        "bode": {"w": w.tolist(), "mag": mag.tolist()},
        "surface": {
            "sigma": sigmas.tolist(),
            "omega": omegas.tolist(),
            "z": Mag.tolist(),
        },
        "zeros": z_markers,
    }
