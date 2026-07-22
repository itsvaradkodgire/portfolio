'use client';

import { useEffect, useRef, useState } from 'react';
import { DemoHead } from './DemoHead';

// ─── A REAL 2-layer neural network trained live with backpropagation ──────────
// Learns to separate two interleaving "moons" — a classic non-linear task that a
// linear model can't solve. Everything (forward pass, gradients, weight updates)
// runs in your browser. No libraries, no server.

type Pt = { x: number; y: number; label: number };

function makeMoons(n = 120): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < n / 2; i++) {
    const t = Math.PI * (i / (n / 2));
    // upper moon (label 0)
    pts.push({ x: Math.cos(t) * 0.9, y: Math.sin(t) * 0.9 - 0.25, label: 0 });
    // lower moon (label 1), shifted
    pts.push({ x: 1 - Math.cos(t) * 0.9, y: -Math.sin(t) * 0.9 + 0.25, label: 1 });
  }
  // add a little noise
  return pts.map((p) => ({ ...p, x: p.x + (Math.random() - 0.5) * 0.12, y: p.y + (Math.random() - 0.5) * 0.12 }));
}

// Simple MLP: 2 -> H (tanh) -> 1 (sigmoid), trained with SGD + binary cross-entropy.
const H = 10;
const LR = 0.15;

function randMat(rows: number, cols: number) {
  const m: number[][] = [];
  for (let i = 0; i < rows; i++) {
    m.push(Array.from({ length: cols }, () => (Math.random() - 0.5) * 1.2));
  }
  return m;
}

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

export function NeuralNetDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [loss, setLoss] = useState(0);
  const [acc, setAcc] = useState(0);
  const rafRef = useRef<number>(0);

  // network state kept in refs so the animation loop mutates in place
  const net = useRef({
    W1: randMat(H, 2), b1: new Array(H).fill(0),
    W2: randMat(1, H), b2: [0],
    data: makeMoons(),
  });

  const reset = () => {
    net.current = {
      W1: randMat(H, 2), b1: new Array(H).fill(0),
      W2: randMat(1, H), b2: [0],
      data: makeMoons(),
    };
    setEpoch(0); setLoss(0); setAcc(0);
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  useEffect(() => {
    if (!running) return;

    const step = () => {
      const s = net.current;
      const { W1, b1, W2, b2, data } = s;

      // one epoch of SGD over all points
      let totalLoss = 0, correct = 0;
      for (const pt of data) {
        // ── forward ──
        const x = [pt.x, pt.y];
        const h = new Array(H); const hpre = new Array(H);
        for (let j = 0; j < H; j++) {
          let z = b1[j];
          z += W1[j][0] * x[0] + W1[j][1] * x[1];
          hpre[j] = z; h[j] = Math.tanh(z);
        }
        let o = b2[0];
        for (let j = 0; j < H; j++) o += W2[0][j] * h[j];
        const yhat = sigmoid(o);

        // ── loss (BCE) ──
        const eps = 1e-7;
        totalLoss += -(pt.label * Math.log(yhat + eps) + (1 - pt.label) * Math.log(1 - yhat + eps));
        if ((yhat > 0.5 ? 1 : 0) === pt.label) correct++;

        // ── backward ──
        const dO = yhat - pt.label;               // dL/do
        for (let j = 0; j < H; j++) {
          const dW2 = dO * h[j];
          const dH = dO * W2[0][j] * (1 - h[j] * h[j]); // through tanh
          W2[0][j] -= LR * dW2;
          W1[j][0] -= LR * dH * x[0];
          W1[j][1] -= LR * dH * x[1];
          b1[j]    -= LR * dH;
        }
        b2[0] -= LR * dO;
      }

      setEpoch((e) => e + 1);
      setLoss(totalLoss / data.length);
      setAcc(correct / data.length);
      draw();
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const draw = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    const W = c.width, Hc = c.height;
    const { W1, b1, W2, b2, data } = net.current;

    // map data coords (~ -1.2..2.2) to canvas
    const toPx = (x: number, y: number) => [((x + 1.3) / 3.1) * W, Hc - ((y + 1.4) / 2.9) * Hc];

    // decision field (coarse grid for speed)
    const grid = 40;
    const cw = W / grid, ch = Hc / grid;
    for (let gy = 0; gy < grid; gy++) {
      for (let gx = 0; gx < grid; gx++) {
        const dx = (gx + 0.5) / grid * 3.1 - 1.3;
        const dy = (1 - (gy + 0.5) / grid) * 2.9 - 1.4;
        // forward
        let o = b2[0];
        for (let j = 0; j < H; j++) {
          const z = b1[j] + W1[j][0] * dx + W1[j][1] * dy;
          o += W2[0][j] * Math.tanh(z);
        }
        const p = sigmoid(o);
        // orange for class 1, teal for class 0
        ctx.fillStyle = p > 0.5
          ? `rgba(212,131,78,${0.10 + (p - 0.5) * 0.5})`
          : `rgba(91,168,160,${0.10 + (0.5 - p) * 0.5})`;
        ctx.fillRect(gx * cw, gy * ch, cw + 1, ch + 1);
      }
    }

    // data points
    for (const pt of data) {
      const [px, py] = toPx(pt.x, pt.y);
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = pt.label === 1 ? '#e6935a' : '#6fc0b8';
      ctx.fill();
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.stroke();
    }
  };

  // initial paint
  useEffect(() => { draw(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <div className="lc-card" style={{ padding: 22 }}>
      <DemoHead idx="02" kind="deep learning" title="Neural Net — Live Training"
        desc="Real 2-layer MLP learning a non-linear boundary via backprop · client-side" />

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <canvas
          ref={canvasRef}
          width={300}
          height={220}
          style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-dim)', borderRadius: 4, flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 150 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', rowGap: 6, columnGap: 12, fontSize: 12, fontFamily: 'var(--font-mono)', marginBottom: 14 }}>
            <span style={{ color: 'var(--text-muted)' }}>epoch</span>
            <span style={{ color: 'var(--text-primary)' }}>{epoch}</span>
            <span style={{ color: 'var(--text-muted)' }}>loss</span>
            <span style={{ color: 'var(--accent)' }}>{loss.toFixed(4)}</span>
            <span style={{ color: 'var(--text-muted)' }}>accuracy</span>
            <span style={{ color: 'var(--green)' }}>{(acc * 100).toFixed(1)}%</span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setRunning((r) => !r)}
              style={{
                background: running ? 'var(--bg-elevated)' : 'var(--accent)',
                color: running ? 'var(--text-primary)' : 'var(--bg-deep)',
                border: 'none', borderRadius: 4, padding: '7px 14px',
                fontFamily: 'var(--font-mono)', fontSize: 11.5, cursor: 'pointer', fontWeight: 600,
              }}
            >
              {running ? '⏸ pause' : epoch === 0 ? '▶ train' : '▶ resume'}
            </button>
            <button
              onClick={() => { setRunning(false); reset(); requestAnimationFrame(draw); }}
              style={{
                background: 'transparent', color: 'var(--text-muted)',
                border: '1px solid var(--border-dim)', borderRadius: 4, padding: '7px 14px',
                fontFamily: 'var(--font-mono)', fontSize: 11.5, cursor: 'pointer',
              }}
            >
              ↺ reset
            </button>
          </div>

          <p style={{ fontSize: 10, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', margin: '14px 0 0', lineHeight: 1.5 }}>
            watch the boundary bend to fit two interleaving moons — a task no linear model can solve.
          </p>
        </div>
      </div>
    </div>
  );
}
