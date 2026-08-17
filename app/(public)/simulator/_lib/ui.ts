'use client';

const cache = new Map<string, string>();

export const token = (name: string): string => {
    if (typeof window === 'undefined') return '';
    const hit = cache.get(name);
    if (hit) return hit;
    const probe = document.createElement('span');
    probe.style.color = `var(${name})`;
    probe.style.display = 'none';
    document.body.appendChild(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    if (value) cache.set(name, value);
    return value;
};

export const plotChrome = () => ({
    paper_bgcolor: 'rgba(0,0,0,0)',
                                 plot_bgcolor: 'rgba(0,0,0,0)',
                                 font: { color: token('--text-muted'), size: 13 },
                                 xaxis: { gridcolor: token('--border'), zerolinecolor: token('--border') },
                                 yaxis: { gridcolor: token('--border'), zerolinecolor: token('--border') },
});

export const kartu = 'rounded-card border border-border bg-surface p-5';
export const kontrol = 'rounded-button border border-border bg-bg p-3 text-meta text-text-body';
export const slider = 'mt-2 w-full accent-accent';
export const selectCls = 'h-10 rounded-button border border-border-strong bg-surface px-3 text-sm text-text';

export const buttonPrimary =
'rounded-button bg-accent px-5 py-2 text-sm text-on-accent transition-colors duration-120 hover:bg-accent-hover active:bg-accent-active';
export const buttonSecondary =
'rounded-button border border-border-strong bg-surface px-5 py-2 text-sm text-text transition-colors duration-120 hover:bg-bg';
