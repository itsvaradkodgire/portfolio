'use client';

import { useRef, useState, useEffect } from 'react';
import { DemoHead } from './DemoHead';

export function WebcamEdgeDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [active, setActive] = useState(false);
  const [err, setErr] = useState('');
  const [threshold, setThreshold] = useState(80);
  const thresholdRef = useRef(80);

  useEffect(() => { thresholdRef.current = threshold; }, [threshold]);
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const loop = () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;
    const w = 480, h = 360;
    c.width = w; c.height = h;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(v, 0, 0, w, h);
    const src = ctx.getImageData(0, 0, w, h);
    const out = ctx.createImageData(w, h);
    const d = src.data;
    const thr = thresholdRef.current;

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const g = (idx: number) => (d[idx] + d[idx + 1] + d[idx + 2]) / 3;
        const tl = g(((y-1)*w+(x-1))*4), t = g(((y-1)*w+x)*4), tr = g(((y-1)*w+(x+1))*4);
        const l  = g((y*w+(x-1))*4),                             r  = g((y*w+(x+1))*4);
        const bl = g(((y+1)*w+(x-1))*4), b = g(((y+1)*w+x)*4), br = g(((y+1)*w+(x+1))*4);
        const gx = -tl - 2*l - bl + tr + 2*r + br;
        const gy = -tl - 2*t - tr + bl + 2*b + br;
        const m = Math.sqrt(gx*gx + gy*gy);
        const on = m > thr;
        const i = (y*w+x)*4;
        out.data[i]   = on ? 212 : 10;
        out.data[i+1] = on ? 131 : 10;
        out.data[i+2] = on ? 78  : 15;
        out.data[i+3] = 255;
      }
    }
    ctx.putImageData(out, 0, 0);
    rafRef.current = requestAnimationFrame(loop);
  };

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 360 }, audio: false });
      videoRef.current!.srcObject = stream;
      await videoRef.current!.play();
      setActive(true);
      loop();
    } catch (e) {
      setErr('camera permission denied · this is a live demo, enable camera to see it work');
    }
  };

  return (
    <div className="lc-card" style={{ padding: 22 }}>
      <DemoHead idx="03" kind="computer vision" title="Real-Time Edge Detection" desc="Sobel operator · canvas API · 60fps on your webcam" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 20, alignItems: 'start' }}>
        {/* Canvas preview */}
        <div style={{
          position: 'relative',
          background: 'var(--bg-deep)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 4,
          aspectRatio: '4/3',
          overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <video ref={videoRef} style={{ display: 'none' }} muted playsInline />
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', display: active ? 'block' : 'none', objectFit: 'cover' }}
          />
          {!active && (
            <div style={{ textAlign: 'center', padding: 24 }}>
              <p className="lc-label-mono" style={{ marginBottom: 14, color: 'var(--text-faint)' }}>
                camera offline
              </p>
              <button onClick={start} className="lc-btn-primary">$ start webcam</button>
              {err && (
                <p style={{ color: 'var(--red)', fontSize: 11, marginTop: 14, fontFamily: 'var(--font-sans)' }}>{err}</p>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.7 }}>
          <div style={{ marginBottom: 14 }}>
            <label className="lc-label-mono" style={{ display: 'block', marginBottom: 6 }}>
              threshold · {threshold}
            </label>
            <input
              type="range" min={20} max={200} value={threshold}
              onChange={(e) => setThreshold(+e.target.value)}
              style={{ width: '100%', accentColor: 'var(--accent)' }}
            />
          </div>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, marginBottom: 10 }}>
            Live Sobel operator applied to each frame. Output shows edges where
            the gradient magnitude exceeds your threshold.
          </p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, marginBottom: 10 }}>
            This is the low-level work underneath opencv. Adjust the slider
            to see noise vs. fidelity trade-off in real time.
          </p>
          <p style={{ color: 'var(--text-faint)', fontSize: 10 }}>no frames leave your device.</p>
        </div>
      </div>
    </div>
  );
}
