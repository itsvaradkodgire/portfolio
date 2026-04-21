'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { DiagramNode, DiagramEdge } from '@/lib/types';

interface AnimatedDiagramProps {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  className?: string;
}

function autoLayout(nodes: DiagramNode[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const n = nodes.length;
  if (n === 0) return positions;

  const cols = n <= 4 ? 2 : n <= 6 ? 3 : n <= 9 ? 3 : 4;
  const rows = Math.ceil(n / cols);
  const W = 580;
  const H = 340;
  const padX = 60;
  const padY = 50;
  const cellW = (W - padX * 2) / cols;
  const cellH = rows > 1 ? (H - padY * 2) / (rows - 1) : 0;

  nodes.forEach((node, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    positions.set(node.id, {
      x: padX + col * cellW,
      y: padY + row * cellH,
    });
  });
  return positions;
}

const NODE_W = 120;
const NODE_H = 40;

export function AnimatedDiagram({ nodes, edges, className }: AnimatedDiagramProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const positions = autoLayout(nodes);

  const nodePos = (id: string) => positions.get(id) ?? { x: 0, y: 0 };

  const edgePath = (from: string, to: string) => {
    const f = nodePos(from);
    const t = nodePos(to);
    const fx = f.x + NODE_W / 2;
    const fy = f.y + NODE_H / 2;
    const tx = t.x + NODE_W / 2;
    const ty = t.y + NODE_H / 2;
    const mx = (fx + tx) / 2;
    const my = (fy + ty) / 2;
    const dx = tx - fx;
    const dy = ty - fy;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const cx = mx - (dy / len) * 18;
    const cy = my + (dx / len) * 18;
    return `M ${fx} ${fy} Q ${cx} ${cy} ${tx} ${ty}`;
  };

  return (
    <div className={`relative ${className ?? ''}`}>
      <svg
        viewBox="0 0 580 360"
        className="w-full h-auto"
        style={{ overflow: 'visible' }}
        aria-label="System architecture diagram"
      >
        <defs>
          <marker id="arr" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
            <polygon points="0 0, 7 2.5, 0 5" fill="rgba(90,168,160,0.5)" />
          </marker>
          <marker id="arr-active" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
            <polygon points="0 0, 7 2.5, 0 5" fill="#d4834e" />
          </marker>
        </defs>

        {/* Edges — static dashed lines, no continuous animation */}
        {edges.map((edge, i) => {
          const isActive = hovered === edge.from || hovered === edge.to;
          return (
            <path
              key={i}
              d={edgePath(edge.from, edge.to)}
              fill="none"
              stroke={isActive ? '#d4834e' : 'rgba(90,168,160,0.3)'}
              strokeWidth={isActive ? 1.5 : 1}
              strokeDasharray={edge.animated ? '5 4' : undefined}
              markerEnd={isActive ? 'url(#arr-active)' : 'url(#arr)'}
              style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node, i) => {
          const { x, y } = nodePos(node.id);
          const isHov = hovered === node.id;
          return (
            <motion.g
              key={node.id}
              transform={`translate(${x}, ${y})`}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 + i * 0.06, duration: 0.35, ease: 'easeOut' }}
              onHoverStart={() => setHovered(node.id)}
              onHoverEnd={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={0} y={0} width={NODE_W} height={NODE_H} rx={8}
                fill={isHov ? '#1f1f2e' : '#16161e'}
                stroke={isHov ? 'rgba(212,131,78,0.55)' : 'rgba(255,255,255,0.08)'}
                strokeWidth={1}
                style={{ transition: 'fill 0.15s, stroke 0.15s' }}
              />
              <text x={14} y={NODE_H / 2 + 5} fontSize={13} textAnchor="middle">
                {node.icon ?? '◆'}
              </text>
              <text
                x={NODE_W / 2 + 6} y={NODE_H / 2 + 4} fontSize={10}
                fill={isHov ? '#e8e4e0' : '#b0acaa'} textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                style={{ transition: 'fill 0.15s' }}
              >
                {node.label.length > 14 ? node.label.slice(0, 13) + '…' : node.label}
              </text>

              {isHov && node.description && (
                <g transform={`translate(0, ${NODE_H + 8})`}>
                  <rect
                    x={-8} y={0}
                    width={Math.min(node.description.length * 6.2 + 20, 220)}
                    height={38} rx={6}
                    fill="#1a1a24" stroke="rgba(255,255,255,0.1)" strokeWidth={1}
                  />
                  <foreignObject
                    x={4} y={5}
                    width={Math.min(node.description.length * 6.2 + 4, 208)}
                    height={32}
                  >
                    <div
                      // @ts-expect-error xmlns for foreignObject
                      xmlns="http://www.w3.org/1999/xhtml"
                      style={{
                        fontSize: '9px', color: '#8a8690',
                        fontFamily: 'JetBrains Mono, monospace',
                        lineHeight: '1.45', whiteSpace: 'normal', wordBreak: 'break-word',
                      }}
                    >
                      {node.description}
                    </div>
                  </foreignObject>
                </g>
              )}
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
