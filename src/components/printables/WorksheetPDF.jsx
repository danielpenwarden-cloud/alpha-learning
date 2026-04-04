import { useState, useEffect, useRef } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, pdf, Svg, Line, Circle, Ellipse, Rect, Path, G } from '@react-pdf/renderer';

// ─── Constants ───────────────────────────────────

const KNOWN_SHAPES = ['circle', 'square', 'triangle', 'rectangle', 'star', 'heart', 'diamond', 'oval'];
const KNOWN_EMOTIONS = ['happy', 'sad', 'angry', 'surprised', 'neutral'];
const KNOWN_SIZES = ['tall', 'short', 'big', 'small', 'medium', 'long'];

// ── Verified SVG whitelist: ONLY these objects render correctly as pictures ──
const VERIFIED_ICONS = [
  'sun', 'star', 'moon', 'tree', 'car', 'cat', 'dog', 'fish',
  'ball', 'book', 'apple', 'house', 'flower', 'heart', 'cup',
];

// Letter → verified icon mapping for letter-to-picture activities
// Only letters with unmistakably clear SVG icons
const LETTER_TO_ICON = {
  A: 'apple', B: 'ball', C: 'cat', D: 'dog', F: 'fish',
  H: 'house', M: 'moon', S: 'star', T: 'tree',
};

// Legacy alias — anything checking this list now uses the verified whitelist
const PICTURE_ICON_NAMES = VERIFIED_ICONS;

// Number words → digits
const NUMBER_WORDS = { zero: '0', one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: '10' };

// ─── Styles ──────────────────────────────────────
// Twinkl-quality: clean layout, generous spacing, professional typography.
// Uses margins (not gap) for maximum @react-pdf/renderer compatibility.

const s = StyleSheet.create({
  page: { padding: 36, fontFamily: 'Helvetica', fontSize: 12 },
  header: { marginBottom: 10, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  title: { fontSize: 24, fontFamily: 'Helvetica-Bold', marginBottom: 4, textAlign: 'center', color: '#222' },
  subtitle: { fontSize: 9, color: '#999', textAlign: 'center' },
  instructions: { fontSize: 10, color: '#444', marginBottom: 14, fontStyle: 'italic', padding: 10, backgroundColor: '#f8f8f8', borderRadius: 6, borderWidth: 1, borderColor: '#eee' },
  activity: { marginBottom: 14, padding: 14, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8 },
  actNumBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#f97316', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  actNumText: { fontSize: 11, color: '#FFFFFF', fontFamily: 'Helvetica-Bold' },
  actHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  prompt: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#222' },
  hint: { fontSize: 9, color: '#888', fontStyle: 'italic', marginTop: 6 },
  footer: { position: 'absolute', bottom: 24, left: 36, right: 36, textAlign: 'center', fontSize: 7, color: '#bbb' },
  drawBox: { height: 100, borderWidth: 2, borderColor: '#999', borderRadius: 6, marginTop: 6, borderStyle: 'dashed' },
});

// ═══════════════════════════════════════════════════════
// SVG COMPONENT LIBRARY
// ═══════════════════════════════════════════════════════

function starPath(cx, cy, outerR, innerR) {
  const pts = [];
  for (let i = 0; i < 5; i++) {
    const oa = (Math.PI / 2) + (2 * Math.PI * i / 5);
    const ia = oa + Math.PI / 5;
    pts.push(`${i === 0 ? 'M' : 'L'}${(cx + outerR * Math.cos(oa)).toFixed(1)} ${(cy - outerR * Math.sin(oa)).toFixed(1)}`);
    pts.push(`L${(cx + innerR * Math.cos(ia)).toFixed(1)} ${(cy - innerR * Math.sin(ia)).toFixed(1)}`);
  }
  return pts.join(' ') + ' Z';
}

function SvgShape({ shape, size = 60, stroke = '#333', strokeWidth = 2, fill = 'none', dashed = false }) {
  const s2 = size / 2;
  const pad = 4;
  const r = s2 - pad;
  const da = dashed ? '8,5' : undefined;
  const vb = `0 0 ${size} ${size}`;
  let inner;
  switch (shape) {
    case 'circle':
      inner = <Circle cx={s2} cy={s2} r={r} stroke={stroke} strokeWidth={strokeWidth} fill={fill} strokeDasharray={da} />;
      break;
    case 'oval':
      inner = <Ellipse cx={s2} cy={s2} rx={r} ry={r * 0.65} stroke={stroke} strokeWidth={strokeWidth} fill={fill} strokeDasharray={da} />;
      break;
    case 'square':
      inner = <Rect x={pad} y={pad} width={size - pad * 2} height={size - pad * 2} stroke={stroke} strokeWidth={strokeWidth} fill={fill} strokeDasharray={da} />;
      break;
    case 'rectangle':
      inner = <Rect x={pad} y={size * 0.2} width={size - pad * 2} height={size * 0.6} stroke={stroke} strokeWidth={strokeWidth} fill={fill} strokeDasharray={da} />;
      break;
    case 'triangle':
      inner = <Path d={`M${s2} ${pad} L${size - pad} ${size - pad} L${pad} ${size - pad} Z`} stroke={stroke} strokeWidth={strokeWidth} fill={fill} strokeDasharray={da} />;
      break;
    case 'star':
      inner = <Path d={starPath(s2, s2, r, r * 0.38)} stroke={stroke} strokeWidth={strokeWidth} fill={fill} strokeDasharray={da} />;
      break;
    case 'heart': {
      const d = `M${s2} ${size - pad - 4} C${pad + 4} ${s2 + 4} ${pad} ${s2 * 0.55} ${s2 * 0.55} ${pad + 4} C${s2 * 0.75} ${pad} ${s2} ${s2 * 0.45} ${s2} ${s2 * 0.55} C${s2} ${s2 * 0.45} ${s2 * 1.25} ${pad} ${s2 * 1.45} ${pad + 4} C${size - pad} ${s2 * 0.55} ${size - pad - 4} ${s2 + 4} ${s2} ${size - pad - 4} Z`;
      inner = <Path d={d} stroke={stroke} strokeWidth={strokeWidth} fill={fill} strokeDasharray={da} />;
      break;
    }
    case 'diamond':
      inner = <Path d={`M${s2} ${pad} L${size - pad} ${s2} L${s2} ${size - pad} L${pad} ${s2} Z`} stroke={stroke} strokeWidth={strokeWidth} fill={fill} strokeDasharray={da} />;
      break;
    default:
      inner = <Circle cx={s2} cy={s2} r={r} stroke={stroke} strokeWidth={strokeWidth} fill={fill} />;
  }
  return (
    <Svg width={size} height={size} viewBox={vb}>
      {inner}
    </Svg>
  );
}

function SvgFace({ emotion, size = 60 }) {
  const s2 = size / 2;
  const eyeY = size * 0.38;
  const eyeR = Math.max(2.5, size * 0.05);
  const leftEyeX = size * 0.35;
  const rightEyeX = size * 0.65;
  const mouthY = size * 0.65;
  const mouthHW = size * 0.15;
  const ml = s2 - mouthHW;
  const mr = s2 + mouthHW;
  const vb = `0 0 ${size} ${size}`;
  let mouth;
  let extras = null;
  switch (emotion) {
    case 'happy':
      mouth = <Path d={`M${ml} ${mouthY} Q${s2} ${mouthY + size * 0.12} ${mr} ${mouthY}`} stroke="#333" strokeWidth={2} fill="none" />;
      break;
    case 'sad':
      mouth = <Path d={`M${ml} ${mouthY + size * 0.08} Q${s2} ${mouthY - size * 0.08} ${mr} ${mouthY + size * 0.08}`} stroke="#333" strokeWidth={2} fill="none" />;
      break;
    case 'angry':
      mouth = <Path d={`M${ml} ${mouthY + size * 0.08} Q${s2} ${mouthY - size * 0.08} ${mr} ${mouthY + size * 0.08}`} stroke="#333" strokeWidth={2} fill="none" />;
      extras = (
        <G>
          <Line x1={leftEyeX - 5} y1={eyeY - 8} x2={leftEyeX + 5} y2={eyeY - 4} stroke="#333" strokeWidth={2} />
          <Line x1={rightEyeX + 5} y1={eyeY - 8} x2={rightEyeX - 5} y2={eyeY - 4} stroke="#333" strokeWidth={2} />
        </G>
      );
      break;
    case 'surprised':
      mouth = <Circle cx={s2} cy={mouthY + 2} r={size * 0.07} stroke="#333" strokeWidth={2} fill="none" />;
      break;
    default:
      mouth = <Line x1={ml} y1={mouthY} x2={mr} y2={mouthY} stroke="#333" strokeWidth={2} />;
  }
  return (
    <Svg width={size} height={size} viewBox={vb}>
      <Circle cx={s2} cy={s2} r={s2 - 3} stroke="#333" strokeWidth={2} fill="none" />
      <Circle cx={leftEyeX} cy={eyeY} r={eyeR} fill="#333" stroke="none" />
      <Circle cx={rightEyeX} cy={eyeY} r={eyeR} fill="#333" stroke="none" />
      {mouth}
      {extras}
    </Svg>
  );
}

// ─── Picture Icons ───────────────────────────────
// Simple SVG drawings for common objects and scenarios.
// All use a 44x44 coordinate system, scalable via size prop.

function PictureIcon({ name, size = 44 }) {
  const vb = '0 0 44 44';
  switch (name) {
    case 'apple':
      return (
        <Svg width={size} height={size} viewBox={vb}>
          <Circle cx={22} cy={27} r={13} stroke="#333" strokeWidth={1.5} fill="none" />
          <Rect x={20} y={9} width={3} height={6} fill="#333" stroke="none" />
          <Path d="M24 12 Q29 8 27 14" stroke="#333" strokeWidth={1.5} fill="none" />
        </Svg>
      );
    case 'ball':
      return (
        <Svg width={size} height={size} viewBox={vb}>
          <Circle cx={22} cy={22} r={16} stroke="#333" strokeWidth={1.5} fill="none" />
          <Path d="M8 16 Q22 28 36 16" stroke="#333" strokeWidth={1.5} fill="none" />
        </Svg>
      );
    case 'cat':
      return (
        <Svg width={size} height={size} viewBox={vb}>
          <Circle cx={22} cy={26} r={11} stroke="#333" strokeWidth={1.5} fill="none" />
          <Path d="M14 18 L10 6 L19 16" stroke="#333" strokeWidth={1.5} fill="none" />
          <Path d="M30 18 L34 6 L25 16" stroke="#333" strokeWidth={1.5} fill="none" />
          <Circle cx={17} cy={24} r={1.5} fill="#333" stroke="none" />
          <Circle cx={27} cy={24} r={1.5} fill="#333" stroke="none" />
          <Path d="M20 29 L22 31 L24 29" stroke="#333" strokeWidth={1} fill="none" />
          <Line x1={14} y1={28} x2={5} y2={26} stroke="#333" strokeWidth={1} />
          <Line x1={14} y1={30} x2={5} y2={32} stroke="#333" strokeWidth={1} />
          <Line x1={30} y1={28} x2={39} y2={26} stroke="#333" strokeWidth={1} />
          <Line x1={30} y1={30} x2={39} y2={32} stroke="#333" strokeWidth={1} />
        </Svg>
      );
    case 'dog':
      return (
        <Svg width={size} height={size} viewBox={vb}>
          <Circle cx={22} cy={22} r={12} stroke="#333" strokeWidth={1.5} fill="none" />
          <Path d="M12 17 Q5 24 10 32" stroke="#333" strokeWidth={1.5} fill="none" />
          <Path d="M32 17 Q39 24 34 32" stroke="#333" strokeWidth={1.5} fill="none" />
          <Circle cx={17} cy={20} r={1.5} fill="#333" stroke="none" />
          <Circle cx={27} cy={20} r={1.5} fill="#333" stroke="none" />
          <Circle cx={22} cy={26} r={2.5} fill="#333" stroke="none" />
        </Svg>
      );
    case 'fish':
      return (
        <Svg width={size} height={size} viewBox={vb}>
          <Ellipse cx={18} cy={22} rx={13} ry={8} stroke="#333" strokeWidth={1.5} fill="none" />
          <Path d="M31 22 L40 14 L40 30 Z" stroke="#333" strokeWidth={1.5} fill="none" />
          <Circle cx={12} cy={20} r={2} fill="#333" stroke="none" />
        </Svg>
      );
    case 'sun':
      return (
        <Svg width={size} height={size} viewBox={vb}>
          <Circle cx={22} cy={22} r={8} stroke="#333" strokeWidth={1.5} fill="none" />
          {Array.from({ length: 8 }).map((_, a) => {
            const angle = (a * Math.PI) / 4;
            return (
              <Line key={a}
                x1={22 + 11 * Math.cos(angle)} y1={22 + 11 * Math.sin(angle)}
                x2={22 + 18 * Math.cos(angle)} y2={22 + 18 * Math.sin(angle)}
                stroke="#333" strokeWidth={1.5} />
            );
          })}
        </Svg>
      );
    case 'tree':
      return (
        <Svg width={size} height={size} viewBox={vb}>
          <Circle cx={22} cy={16} r={12} stroke="#333" strokeWidth={1.5} fill="none" />
          <Rect x={18} y={28} width={8} height={12} stroke="#333" strokeWidth={1.5} fill="none" />
        </Svg>
      );
    case 'house':
      return (
        <Svg width={size} height={size} viewBox={vb}>
          <Rect x={8} y={22} width={28} height={18} stroke="#333" strokeWidth={1.5} fill="none" />
          <Path d="M6 22 L22 8 L38 22" stroke="#333" strokeWidth={1.5} fill="none" />
          <Rect x={17} y={30} width={10} height={10} stroke="#333" strokeWidth={1.5} fill="none" />
        </Svg>
      );
    case 'flower':
      return (
        <Svg width={size} height={size} viewBox={vb}>
          <Line x1={22} y1={26} x2={22} y2={42} stroke="#333" strokeWidth={1.5} />
          <Circle cx={22} cy={18} r={4} fill="#333" stroke="none" />
          {Array.from({ length: 5 }).map((_, i) => {
            const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
            return (
              <Circle key={i}
                cx={22 + 9 * Math.cos(angle)} cy={18 + 9 * Math.sin(angle)}
                r={5} stroke="#333" strokeWidth={1} fill="none" />
            );
          })}
        </Svg>
      );
    case 'cup':
      return (
        <Svg width={size} height={size} viewBox={vb}>
          <Path d="M12 8 L10 36 L34 36 L32 8 Z" stroke="#333" strokeWidth={1.5} fill="none" />
          <Path d="M34 16 Q42 22 34 28" stroke="#333" strokeWidth={1.5} fill="none" />
        </Svg>
      );
    case 'book':
      return (
        <Svg width={size} height={size} viewBox={vb}>
          <Rect x={6} y={10} width={16} height={24} stroke="#333" strokeWidth={1.5} fill="none" />
          <Rect x={22} y={10} width={16} height={24} stroke="#333" strokeWidth={1.5} fill="none" />
          <Line x1={22} y1={10} x2={22} y2={34} stroke="#333" strokeWidth={1.5} />
        </Svg>
      );
    case 'car':
      return (
        <Svg width={size} height={size} viewBox={vb}>
          <Rect x={4} y={20} width={36} height={12} stroke="#333" strokeWidth={1.5} fill="none" />
          <Path d="M14 20 L18 10 L30 10 L34 20" stroke="#333" strokeWidth={1.5} fill="none" />
          <Circle cx={12} cy={32} r={4} fill="#333" stroke="none" />
          <Circle cx={32} cy={32} r={4} fill="#333" stroke="none" />
        </Svg>
      );
    case 'moon':
      return (
        <Svg width={size} height={size} viewBox={vb}>
          <Path d="M28 6 A16 16 0 1 0 28 38 A11 11 0 1 1 28 6 Z" stroke="#333" strokeWidth={1.5} fill="none" />
        </Svg>
      );
    case 'star': {
      const sp = starPath(22, 22, 17, 6.5);
      return (
        <Svg width={size} height={size} viewBox={vb}>
          <Path d={sp} stroke="#333" strokeWidth={1.5} fill="none" />
        </Svg>
      );
    }
    case 'heart':
      return (
        <Svg width={size} height={size} viewBox={vb}>
          <Path d="M22 38 C8 28 2 18 10 10 C15 6 22 12 22 16 C22 12 29 6 34 10 C42 18 36 28 22 38 Z" stroke="#333" strokeWidth={1.5} fill="none" />
        </Svg>
      );
    default:
      return null;
  }
}

// ─── Dot / Star / Shape Groups ───────────────────

function DotGroup({ count = 5, dotSize = 24, fill = '#333' }) {
  const n = Math.min(Math.max(count, 0), 20);
  const r = dotSize / 2 - 2;
  const c = dotSize / 2;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
      {Array.from({ length: n }).map((_, i) => (
        <View key={i} style={{ marginRight: 6, marginBottom: 6 }}>
          <Svg width={dotSize} height={dotSize} viewBox={`0 0 ${dotSize} ${dotSize}`}>
            <Circle cx={c} cy={c} r={r} fill={fill} stroke="none" />
          </Svg>
        </View>
      ))}
    </View>
  );
}

function StarGroup({ count = 5, size = 24, fill = '#333' }) {
  const n = Math.min(Math.max(count, 0), 20);
  const c = size / 2;
  const r = c - 2;
  const ir = r * 0.38;
  const d = starPath(c, c, r, ir);
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
      {Array.from({ length: n }).map((_, i) => (
        <View key={i} style={{ marginRight: 6, marginBottom: 6 }}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <Path d={d} fill={fill} stroke="none" />
          </Svg>
        </View>
      ))}
    </View>
  );
}

function FilledShapeGroup({ count = 5, shape = 'circle', size = 24 }) {
  if (shape === 'star') return <StarGroup count={count} size={size} />;
  if (shape === 'circle' || shape === 'dot') return <DotGroup count={count} dotSize={size} />;
  const n = Math.min(Math.max(count, 0), 20);
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
      {Array.from({ length: n }).map((_, i) => (
        <View key={i} style={{ marginRight: 6, marginBottom: 6 }}>
          <SvgShape shape={shape} size={size} fill="#333" stroke="none" />
        </View>
      ))}
    </View>
  );
}

function detectCountShape(prompt) {
  const p = (prompt || '').toLowerCase();
  if (p.includes('star')) return 'star';
  if (p.includes('heart')) return 'heart';
  if (p.includes('triangle')) return 'triangle';
  if (p.includes('square')) return 'square';
  if (p.includes('diamond')) return 'diamond';
  return 'circle';
}

function HeightBars({ items }) {
  const SIZE_MAP = { tall: 100, big: 90, medium: 55, short: 40, small: 30, long: 80 };
  const maxH = 110;
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', marginTop: 8 }}>
      {items.map((label, i) => {
        const h = SIZE_MAP[label] || 50;
        return (
          <View key={i} style={{ alignItems: 'center', marginRight: 20 }}>
            <Svg width={40} height={maxH} viewBox={`0 0 40 ${maxH}`}>
              <Rect x={5} y={maxH - h} width={30} height={h} stroke="#333" strokeWidth={2} fill="#e8e8e8" />
            </Svg>
            <Text style={{ fontSize: 10, color: '#555', marginTop: 4 }}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function WritingLines({ count = 4, lineWidth = 480 }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ height: 36, marginBottom: 2, justifyContent: 'flex-end' }}>
          <View style={{ position: 'absolute', top: 12, left: 0, right: 0 }}>
            <Svg width={lineWidth} height={2} viewBox={`0 0 ${lineWidth} 2`}>
              <Line x1={0} y1={1} x2={lineWidth} y2={1} stroke="#ddd" strokeWidth={0.5} strokeDasharray="3,3" />
            </Svg>
          </View>
          <Svg width={lineWidth} height={2} viewBox={`0 0 ${lineWidth} 2`}>
            <Line x1={0} y1={1} x2={lineWidth} y2={1} stroke="#bbb" strokeWidth={1} />
          </Svg>
        </View>
      ))}
    </View>
  );
}

function ScissorSvg({ width = 20, height = 20 }) {
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Circle cx={6} cy={5} r={4} stroke="#666" strokeWidth={1.5} fill="none" />
      <Circle cx={6} cy={15} r={4} stroke="#666" strokeWidth={1.5} fill="none" />
      <Line x1={10} y1={7} x2={18} y2={3} stroke="#666" strokeWidth={1.5} />
      <Line x1={10} y1={13} x2={18} y2={17} stroke="#666" strokeWidth={1.5} />
    </Svg>
  );
}

function CloudSvg({ width = 70, height = 50 }) {
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Circle cx={25} cy={30} r={14} fill="#e8e8e8" stroke="#aaa" strokeWidth={1} />
      <Circle cx={45} cy={30} r={14} fill="#e8e8e8" stroke="#aaa" strokeWidth={1} />
      <Circle cx={35} cy={20} r={14} fill="#e8e8e8" stroke="#aaa" strokeWidth={1} />
      <Circle cx={28} cy={22} r={10} fill="#e8e8e8" stroke="none" />
      <Circle cx={42} cy={22} r={10} fill="#e8e8e8" stroke="none" />
      <Circle cx={35} cy={30} r={10} fill="#e8e8e8" stroke="none" />
    </Svg>
  );
}

// ═══════════════════════════════════════════════════════
// MATCH ITEM VISUAL
// ═══════════════════════════════════════════════════════

function MatchItemVisual({ item }) {
  const text = (item || '').trim();
  const lower = text.toLowerCase();
  const iconKey = lower.replace(/\s+/g, '_');

  // Pure integer → filled dots
  if (/^\d+$/.test(text)) {
    const n = Math.min(parseInt(text, 10), 10);
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: 80 }}>
        {Array.from({ length: n }).map((_, i) => (
          <View key={i} style={{ marginRight: 3, marginBottom: 3 }}>
            <Svg width={14} height={14} viewBox="0 0 14 14">
              <Circle cx={7} cy={7} r={5} fill="#333" stroke="none" />
            </Svg>
          </View>
        ))}
      </View>
    );
  }

  // "dotsN" / "Ndots" patterns
  const dotsMatch = lower.match(/^(?:dots?\s*(\d+)|(\d+)\s*dots?)$/);
  if (dotsMatch) {
    const n = Math.min(parseInt(dotsMatch[1] || dotsMatch[2], 10), 10);
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: 80 }}>
        {Array.from({ length: n }).map((_, i) => (
          <View key={i} style={{ marginRight: 3, marginBottom: 3 }}>
            <Svg width={14} height={14} viewBox="0 0 14 14">
              <Circle cx={7} cy={7} r={5} fill="#333" stroke="none" />
            </Svg>
          </View>
        ))}
      </View>
    );
  }

  // "starsN" / "Nstars" patterns
  const starsMatch = lower.match(/^(?:stars?\s*(\d+)|(\d+)\s*stars?)$/);
  if (starsMatch) {
    const n = Math.min(parseInt(starsMatch[1] || starsMatch[2], 10), 10);
    const sz = 14;
    const c = sz / 2;
    const r = c - 1;
    const ir = r * 0.38;
    const d = starPath(c, c, r, ir);
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: 80 }}>
        {Array.from({ length: n }).map((_, i) => (
          <View key={i} style={{ marginRight: 3, marginBottom: 3 }}>
            <Svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
              <Path d={d} fill="#333" stroke="none" />
            </Svg>
          </View>
        ))}
      </View>
    );
  }

  // Shape name → SVG shape
  if (KNOWN_SHAPES.includes(lower)) {
    return <SvgShape shape={lower} size={32} />;
  }

  // Emotion name → face SVG
  if (KNOWN_EMOTIONS.includes(lower)) {
    return <SvgFace emotion={lower} size={32} />;
  }

  // Picture icon name → SVG illustration
  if (PICTURE_ICON_NAMES.includes(iconKey)) {
    return <PictureIcon name={iconKey} size={40} />;
  }

  // Fallback: text
  return <Text style={{ fontSize: 22, fontFamily: 'Helvetica-Bold', textAlign: 'center', width: 80 }}>{text}</Text>;
}

// ═══════════════════════════════════════════════════════
// NORMALIZATION
// ═══════════════════════════════════════════════════════

/** Extract target word from a letter-counting prompt. Very aggressive matching. */
function extractTargetWord(prompt) {
  const p = prompt || '';
  // "word CAT" / "word cat" / 'word "cat"'
  let m = p.match(/\bword\s+[\"']?([a-zA-Z]{2,})[\"']?/i);
  if (m) return m[1];
  // "letters in CAT" / "letters in the cat" / "letters are in cat"
  m = p.match(/letters?\s+(?:are\s+)?in\s+(?:the\s+)?(?:word\s+)?[\"']?([a-zA-Z]{2,})[\"']?/i);
  if (m && !['the','this','that','word','name','each','how','many'].includes(m[1].toLowerCase())) return m[1];
  // ALL CAPS word anywhere
  m = p.match(/\b([A-Z]{2,})\b/);
  if (m) return m[1];
  // Quoted word
  m = p.match(/[\"']([a-zA-Z]{2,})[\"']/);
  if (m) return m[1];
  // Last word if it's short and alphabetic (often the target: "...in cat")
  m = p.match(/\b([a-zA-Z]{2,5})\s*[\?\.]?\s*$/);
  if (m && !['with','from','them','each','your','does','have','many','some'].includes(m[1].toLowerCase())) return m[1];
  return null;
}

function normalizeActivity(act) {
  const a = { ...act };
  a.type = (a.type || '').toLowerCase().replace(/\s+/g, '_');
  a.content = (a.content || '').trim();
  a.prompt = (a.prompt || '').trim();
  const combined = `${a.type} ${a.content} ${a.prompt}`.toLowerCase();

  // ── Redirect sizes→draw for social-emotional concept prompts ──
  if (a.type === 'sizes' && /\b(problem|handle|cope|manage|worry|upset|stress|feeling)\b/i.test(a.prompt)) {
    a.type = 'draw';
    a.content = '';
  }

  // ── Content-based type detection ──
  const contentWords = a.content.toLowerCase().split(/[\s,;|]+/).filter(Boolean);
  const shapeWords = contentWords.filter(w => KNOWN_SHAPES.includes(w));
  const emotionWords = contentWords.filter(w => KNOWN_EMOTIONS.includes(w));
  const sizeWords = contentWords.filter(w => KNOWN_SIZES.includes(w));

  if (shapeWords.length >= 2 && a.type !== 'color' && a.type !== 'cut_shape' && !/circle (the|all|each)/i.test(a.prompt)) {
    if (a.type !== 'shapes') {
      a.type = 'shapes';
      a.content = shapeWords.join(',');
    }
  }
  if (emotionWords.length >= 2 && a.type !== 'emotions') {
    a.type = 'emotions';
    a.content = emotionWords.join(',');
  }
  if (sizeWords.length >= 2 && a.type !== 'sizes') {
    a.type = 'sizes';
    a.content = sizeWords.join(',');
  }

  // ── Unknown types → infer from prompt ──
  const VALID_TYPES = [
    'trace', 'write', 'circle', 'match', 'count', 'draw', 'color', 'cut',
    'compare_groups', 'shapes', 'emotions', 'sizes', 'breathing', 'cut_shape',
  ];
  if (!VALID_TYPES.includes(a.type)) {
    const p = a.prompt.toLowerCase();
    if (/\btrace\b/.test(p)) a.type = 'trace';
    else if (/\b(count|how many)\b/.test(p)) a.type = 'count';
    else if (/\bcircle\b/.test(p) && /\b(the|all|each)\b/.test(p)) a.type = 'circle';
    else if (/\b(match|draw.* line.*between|connect)\b/.test(p)) a.type = 'match';
    else if (/\b(write|print)\b/.test(p)) a.type = 'write';
    else if (/\b(cut)\b/.test(p) && KNOWN_SHAPES.some(sh => combined.includes(sh))) a.type = 'cut_shape';
    else if (/\b(cut)\b/.test(p)) a.type = 'cut';
    else if (/\b(color|colour)\b/.test(p)) a.type = 'color';
    else if (/\b(group|more|fewer|less|greater|bigger group)\b/.test(p)) a.type = 'compare_groups';
    else if (/\b(happy|sad|angry|feeling|emotion|face)\b/.test(p)) a.type = 'emotions';
    else if (/\b(tall|short|big|small|size|height)\b/.test(p)) a.type = 'sizes';
    else if (/\b(breath|calm|inhale|exhale)\b/.test(p)) a.type = 'breathing';
    else if (/\b(shape|square|triangle|rectangle)\b/.test(p) && !/circle (the|all)/i.test(p)) a.type = 'shapes';
    else if (/\b(draw|picture|sketch)\b/.test(p)) a.type = 'draw';
    else a.type = 'draw';
  }

  // ── Fix content per type ──
  if (a.type === 'cut_shape') {
    const found = KNOWN_SHAPES.find(sh => combined.includes(sh));
    a.content = found || 'square';
  }
  if (a.type === 'cut') {
    const found = KNOWN_SHAPES.find(sh => combined.includes(sh));
    if (found) { a.type = 'cut_shape'; a.content = found; }
  }
  if (a.type === 'compare_groups') {
    const nums = (a.content.match(/\d+/g) || []).map(Number);
    a.content = nums.length >= 2 ? `${Math.min(nums[0], 15)},${Math.min(nums[1], 15)}` : '3,7';
  }
  if (a.type === 'count') {
    const isLetterCount = /\bletter/i.test(a.prompt);
    const contentIsWord = /^[a-zA-Z]{2,}$/.test(a.content.trim());
    if (isLetterCount && contentIsWord) {
      // Content is already a word like "cat" — keep it
      a.content = a.content.trim();
    } else if (isLetterCount) {
      // Content is a number but prompt asks about letters — extract word from prompt
      const word = extractTargetWord(a.prompt);
      if (word) {
        a.content = word;
      } else {
        const n = parseInt((a.content.match(/\d+/) || [])[0], 10);
        a.content = String(isNaN(n) ? 5 : Math.min(n, 20));
      }
    } else {
      const n = parseInt((a.content.match(/\d+/) || [])[0], 10);
      a.content = String(isNaN(n) ? 5 : Math.min(n, 20));
    }
  }
  if (a.type === 'emotions') {
    const emos = a.content.toLowerCase().split(/[,;|\s]+/).filter(e => KNOWN_EMOTIONS.includes(e));
    a.content = emos.length > 0 ? emos.join(',') : 'happy,sad,angry';
  }
  if (a.type === 'shapes') {
    const shapes = a.content.toLowerCase().split(/[,;|\s]+/).filter(sh => KNOWN_SHAPES.includes(sh));
    a.content = shapes.length > 0 ? shapes.join(',') : 'circle,square,triangle';
  }
  if (a.type === 'sizes') {
    const sizes = a.content.toLowerCase().split(/[,;|\s]+/).filter(sz => KNOWN_SIZES.includes(sz));
    a.content = sizes.length > 0 ? sizes.join(',') : 'tall,short,tall,short';
  }
  if (a.type === 'breathing') {
    const n = parseInt((a.content.match(/\d+/) || [])[0], 10);
    a.content = String(isNaN(n) ? 4 : Math.min(n, 8));
  }
  if (a.type === 'color') {
    const shapes = a.content.toLowerCase().split(/[,;|\s]+/).filter(sh => KNOWN_SHAPES.includes(sh));
    a.content = shapes.length > 0 ? shapes.join(',') : 'circle,square,triangle';
  }
  if (a.type === 'trace' || a.type === 'write') {
    a.content = a.content.replace(/[^\w\s]/g, '').trim();
    if (!a.content) a.content = a.type === 'trace' ? 'A B C' : 'Lani';
  }
  if (a.type === 'draw') {
    a.content = '';
  }

  // ── Circle: detect letter mode, word mode, or picture mode ──
  if (a.type === 'circle') {
    const p = a.prompt.toLowerCase();
    const isLetterMode = /circle.*\bletter/i.test(p) && !/picture|icon|image/i.test(p);
    const isWordMode = /\b(sight\s*word|word\b.*['\u2018\u2019\u201C\u201D"]|find.*\bword\b|circle.*\bword\b)/i.test(p) && !/picture|icon|image/i.test(p);
    if (isLetterMode) {
      // Keep content as single letters — do NOT convert to pictures
      a._circleMode = 'letters';
    } else if (isWordMode) {
      // Word mode: keep content as words — do NOT convert to pictures
      a._circleMode = 'words';
    } else {
      // Picture mode: force all items to verified whitelist
      const items = a.content.split(/[,;|]+/).map(x => x.trim()).filter(Boolean);
      const fixed = items.map(item => {
        const lower = item.toLowerCase().replace(/\s+/g, '_');
        if (VERIFIED_ICONS.includes(lower)) return lower;
        if (KNOWN_SHAPES.includes(lower)) return lower;
        if (/^[A-Za-z0-9]$/.test(item)) return item; // single chars are fine
        if (/^\d+$/.test(item)) return item; // numbers are fine
        // Unknown item — replace with a verified icon starting with same letter
        const fl = lower[0];
        const replacement = VERIFIED_ICONS.find(v => v[0] === fl && !items.some(x => x.toLowerCase() === v));
        return replacement || item;
      });
      a.content = fixed.join(',');
    }
  }

  // ── Match: fix right-side items OR convert pure-text sight-word matches to trace ──
  if (a.type === 'match') {
    const pairs = parseMatchPairs(a.content);

    // First, check if right-side items are verified icons/shapes/numbers — if so, it's a real match
    const rightSideHasVisuals = pairs.some(([, r]) => {
      const rLower = r.toLowerCase().trim().replace(/\s+/g, '_');
      return VERIFIED_ICONS.includes(rLower) || KNOWN_SHAPES.includes(rLower) || /^\d+$/.test(r.trim());
    });

    if (rightSideHasVisuals) {
      // Legitimate match — ensure ALL right-side items use verified icons
      const fixed = pairs.map(([left, right]) => {
        const rLower = right.toLowerCase().trim().replace(/\s+/g, '_');
        if (VERIFIED_ICONS.includes(rLower) || KNOWN_SHAPES.includes(rLower) || /^\d+$/.test(right.trim())) {
          return [left, right];
        }
        // Unknown right-side item — try LETTER_TO_ICON for left's first letter
        const letter = left.trim()[0]?.toUpperCase();
        const icon = LETTER_TO_ICON[letter];
        return icon ? [left, icon] : [left, right];
      });
      a.content = fixed.map(([l, r]) => `${l}-${r}`).join(',');
    } else {
      // No visuals on right side — check if this is a nonsensical text-only match
      const allTextBothSides = pairs.length >= 2 && pairs.every(([l, r]) =>
        /^[a-zA-Z]+$/.test(l.trim()) && /^[a-zA-Z]+$/.test(r.trim())
      );
      const bothSidesShortWords = allTextBothSides && pairs.every(([l, r]) =>
        l.trim().length <= 5 && r.trim().length <= 5
      );
      const hasSightWords = /sight\s*word/i.test(a.prompt);

      if (allTextBothSides && (hasSightWords || bothSidesShortWords)) {
        // Pure text both sides, no visuals — convert to trace
        const words = [...new Set([...pairs.map(([l]) => l.trim()), ...pairs.map(([, r]) => r.trim())])];
        a.type = 'trace';
        a.content = words.slice(0, 6).join(' ');
      } else {
        // Try to fix right-side items using LETTER_TO_ICON
        const fixed = pairs.map(([left, right]) => {
          const letter = left.trim()[0]?.toUpperCase();
          const icon = LETTER_TO_ICON[letter];
          return icon ? [left, icon] : [left, right];
        });
        a.content = fixed.map(([l, r]) => `${l}-${r}`).join(',');
      }
    }
  }

  return a;
}

// ═══════════════════════════════════════════════════════
// ACTIVITY RENDERERS
// ═══════════════════════════════════════════════════════

/** TRACE: Very light guide + ultra-light trace copies + blank spaces.
 *  Guide: #D8D8D8 (visible reference). Trace: #F0F0F0 (barely visible, invites tracing). */
function TraceActivity({ act }) {
  const chars = (act.content || '').replace(/[^a-zA-Z0-9]/g, '').split('').filter(c => c.trim());
  if (chars.length === 0) chars.push('A');
  const traceCount = Math.max(2, Math.min(3, Math.floor(6 / chars.length)));
  const blankCount = Math.max(2, 8 - chars.length * (1 + traceCount));
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', flexWrap: 'wrap', marginTop: 4 }}>
        {/* Guide letters — light gray reference */}
        {chars.map((ch, i) => (
          <View key={`g-${i}`} style={{ width: 54, height: 68, alignItems: 'center', justifyContent: 'flex-end', marginRight: 2, marginBottom: 2 }}>
            <Text style={{ fontSize: 52, fontFamily: 'Helvetica-Bold', color: '#D8D8D8', textAlign: 'center' }}>{ch}</Text>
          </View>
        ))}
        {/* Trace copies — ultra-light, child traces over these */}
        {Array.from({ length: traceCount }).map((_, rep) =>
          chars.map((ch, i) => (
            <View key={`t-${rep}-${i}`} style={{ width: 54, height: 68, alignItems: 'center', justifyContent: 'flex-end', marginRight: 2, marginBottom: 2 }}>
              <Text style={{ fontSize: 52, fontFamily: 'Helvetica-Bold', color: '#F0F0F0', textAlign: 'center' }}>{ch}</Text>
              {/* Start-here dot */}
              <View style={{ position: 'absolute', top: 2, left: 3 }}>
                <Svg width={10} height={10} viewBox="0 0 10 10">
                  <Circle cx={5} cy={5} r={3} fill="#ccc" stroke="none" />
                </Svg>
              </View>
              {/* Dashed underline */}
              <Svg width={48} height={4} viewBox="0 0 48 4">
                <Line x1={0} y1={2} x2={48} y2={2} stroke="#bbb" strokeWidth={1.5} strokeDasharray="3,2" />
              </Svg>
            </View>
          ))
        )}
        {/* Blank writing spaces */}
        {Array.from({ length: blankCount }).map((_, i) => (
          <View key={`b-${i}`} style={{ width: 54, height: 68, alignItems: 'center', justifyContent: 'flex-end', marginRight: 2, marginBottom: 2 }}>
            <View style={{ width: 48, height: 52, borderBottomWidth: 2, borderBottomColor: '#bbb' }} />
          </View>
        ))}
      </View>
      {act.hint && <Text style={s.hint}>{act.hint}</Text>}
    </View>
  );
}

function WriteActivity({ act }) {
  return (
    <View>
      {act.content && (
        <Text style={{ fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#666', marginBottom: 8, textAlign: 'center' }}>
          {act.content}
        </Text>
      )}
      <WritingLines count={4} />
      {act.hint && <Text style={s.hint}>{act.hint}</Text>}
    </View>
  );
}

function isSizeComparisonPrompt(prompt) {
  return /\b(big|small|large|tiny|biggest|smallest|larger|smaller|which.*size|different.*size)\b/i.test(prompt || '');
}

const GRADUATED_SIZES = [30, 50, 70, 90];
function getGraduatedSize(index, total) {
  const shuffled = total === 2 ? [30, 70] : total === 3 ? [30, 70, 50] : [30, 70, 50, 90];
  return shuffled[index] || 50;
}

/** Fix nonsensical single-letter content for real-world prompts.
 *  Now returns scenario icon names for social-emotional prompts. */
function fixNonsenseCircleContent(items, prompt) {
  const p = (prompt || '').toLowerCase();
  const allSingleLetters = items.length >= 3 && items.every(item => /^[A-Z]$/.test(item.trim()));
  if (!allSingleLetters) return items;

  if (/\b(problem|handle|cope|manage|deal|worry|feel|calm|upset|better|angry|sad|relax|sooth|comfort|help.*feel|stress)\b/i.test(p)) {
    return ['cat', 'dog', 'ball', 'book'];
  }
  if (/\b(healthy|food|eat|fruit|vegetable|snack)\b/i.test(p)) {
    return ['apple', 'fish', 'cup', 'flower'];
  }
  return items;
}

/** Replace unknown picture items with known SVG alternatives.
 *  When the prompt asks about sounds/pictures, items without SVGs are swapped for known icons. */
function fixUnknownPictureItems(items, prompt) {
  const p = (prompt || '').toLowerCase();
  const isPicturePrompt = /\b(picture|sound|start with|begins? with)\b/i.test(p);
  if (!isPicturePrompt) return items;

  return items.map(item => {
    const lower = item.toLowerCase().trim();
    // Skip single characters (letters/digits) — they render fine as text
    if (item.trim().length <= 1) return item;
    const iconKey = lower.replace(/\s+/g, '_');
    const isKnown = VERIFIED_ICONS.includes(iconKey) || KNOWN_SHAPES.includes(lower);
    if (isKnown) return item;

    // Try to find a replacement starting with the same letter
    const firstLetter = lower[0];
    const sameLetterIcons = VERIFIED_ICONS.filter(name =>
      name[0] === firstLetter && !items.some(it => it.toLowerCase().replace(/\s+/g, '_') === name)
    );
    if (sameLetterIcons.length > 0) return sameLetterIcons[0];

    // No same-letter replacement found — pick any unused verified icon
    const anyReplacement = VERIFIED_ICONS.find(name =>
      !items.some(it => it.toLowerCase().replace(/\s+/g, '_') === name)
    );
    return anyReplacement || item;
  });
}

/** CIRCLE: Items in boxes. Renders shapes as SVG, picture icons as illustrations, text as Text.
 *  _circleMode === 'letters': single letters in boxes.
 *  _circleMode === 'words': words in boxes (sight word activities). */
function CircleActivity({ act }) {
  // Letter mode: render all items as individual letter boxes (e.g., "Circle the letters that make the /s/ sound")
  if (act._circleMode === 'letters') {
    let items = parseItems(act.content);
    return (
      <View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginTop: 6 }}>
          {items.map((item, i) => (
            <View key={i} style={{ width: 54, height: 54, borderWidth: 2, borderColor: '#ccc', borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 10, marginBottom: 10 }}>
              <Text style={{ fontSize: 28, fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>{item.trim().toUpperCase()}</Text>
            </View>
          ))}
        </View>
        {act.hint && <Text style={s.hint}>{act.hint}</Text>}
      </View>
    );
  }

  // Word mode: render all items as words in boxes (e.g., "Find and circle the sight word 'the'")
  if (act._circleMode === 'words') {
    let items = parseItems(act.content);
    return (
      <View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginTop: 6 }}>
          {items.map((item, i) => (
            <View key={i} style={{ width: 72, height: 44, borderWidth: 2, borderColor: '#ccc', borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 10, marginBottom: 10 }}>
              <Text style={{ fontSize: 20, fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>{item.trim()}</Text>
            </View>
          ))}
        </View>
        {act.hint && <Text style={s.hint}>{act.hint}</Text>}
      </View>
    );
  }

  // Picture/shape mode
  let items = parseItems(act.content);
  items = fixNonsenseCircleContent(items, act.prompt);
  items = fixUnknownPictureItems(items, act.prompt);
  const sizeComparison = isSizeComparisonPrompt(act.prompt);

  return (
    <View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginTop: 6 }}>
        {items.map((item, i) => {
          const lower = item.toLowerCase().trim();
          const iconKey = lower.replace(/\s+/g, '_');
          const isShape = KNOWN_SHAPES.includes(lower);
          const isPictureIcon = VERIFIED_ICONS.includes(iconKey);

          // Size comparison mode: shapes at graduated sizes
          if (sizeComparison && isShape) {
            const sz = getGraduatedSize(i, items.length);
            const boxSz = sz + 14;
            return (
              <View key={i} style={{ width: boxSz, height: boxSz, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 12, marginBottom: 8 }}>
                <SvgShape shape={lower} size={sz} />
              </View>
            );
          }

          // Picture icon mode: larger box with icon + label
          if (isPictureIcon) {
            return (
              <View key={i} style={{ width: 80, height: 80, borderWidth: 2, borderColor: '#ccc', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12, marginBottom: 8 }}>
                <PictureIcon name={iconKey} size={44} />
                <Text style={{ fontSize: 7, color: '#999', marginTop: 2 }}>{item.replace(/_/g, ' ')}</Text>
              </View>
            );
          }

          // Shape in standard box
          if (isShape) {
            return (
              <View key={i} style={{ width: 54, height: 54, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 10, marginBottom: 10 }}>
                <SvgShape shape={lower} size={40} />
              </View>
            );
          }

          // Single char or short word — always render as text
          return (
            <View key={i} style={{ width: 54, height: 54, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 10, marginBottom: 10 }}>
              {item.length <= 1 ? (
                <Text style={{ fontSize: 28, fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>{item}</Text>
              ) : (
                <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>{item.slice(0, 8)}</Text>
              )}
            </View>
          );
        })}
      </View>
      {act.hint && <Text style={s.hint}>{act.hint}</Text>}
    </View>
  );
}

/** Shuffle an array so NO element stays at its original index (derangement).
 *  Uses a deterministic seed from the items so the PDF renders consistently. */
function derangeRightColumn(rights) {
  if (rights.length <= 1) return rights;
  const arr = [...rights];
  // Simple deterministic seed from content
  let seed = 0;
  for (const r of arr) for (let i = 0; i < r.length; i++) seed = (seed * 31 + r.charCodeAt(i)) | 0;
  const rng = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  // Try up to 100 shuffles to find a derangement
  for (let attempt = 0; attempt < 100; attempt++) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    if (shuffled.every((v, i) => v !== arr[i])) return shuffled;
  }
  // Fallback: rotate by 1 (guaranteed no item stays in place for 2+ items)
  return [...arr.slice(1), arr[0]];
}

/** MATCH: Left = text label, right = SVG visual, dashed line between.
 *  Right column is always scrambled so no picture is directly across from its match.
 *  Converts number words (two→2) to digits. */
function MatchActivity({ act }) {
  let items = parseMatchPairs(act.content);

  // Convert number words to digits on both sides
  items = items.map(([left, right]) => [
    NUMBER_WORDS[left.toLowerCase().trim()] || left,
    NUMBER_WORDS[right.toLowerCase().trim()] || right,
  ]);

  // Heuristic: if left items are all numbers and right looks like labels, swap
  const leftLooksVisual = items.every(([l]) => /^\d+$/.test(l.trim())) && items.some(([, r]) => !/^\d+$/.test(r.trim()));
  const shouldSwap = leftLooksVisual && items.every(([, r]) => /[a-zA-Z]/.test(r));

  const lefts = items.map(pair => shouldSwap ? pair[1] : pair[0]);
  const rights = items.map(pair => shouldSwap ? pair[0] : pair[1]);
  const shuffledRights = derangeRightColumn(rights);

  return (
    <View>
      {lefts.map((left, i) => (
        <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 22, fontFamily: 'Helvetica-Bold', textAlign: 'center', width: 80 }}>{left}</Text>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={200} height={12} viewBox="0 0 200 12">
              <Circle cx={8} cy={6} r={4} fill="#bbb" stroke="none" />
              <Line x1={16} y1={6} x2={184} y2={6} stroke="#ddd" strokeWidth={1} strokeDasharray="2,4" />
              <Circle cx={192} cy={6} r={4} fill="#bbb" stroke="none" />
            </Svg>
          </View>
          <MatchItemVisual item={shuffledRights[i]} />
        </View>
      ))}
      {act.hint && <Text style={s.hint}>{act.hint}</Text>}
    </View>
  );
}

/** COUNT: If content is a word (all letters), show letter boxes. Otherwise show shape dots. */
function CountActivity({ act }) {
  const content = (act.content || '').trim();
  const isWord = /^[a-zA-Z]{2,}$/.test(content);

  // Letter counting mode: content is a word like "cat" — show C A T in boxes
  if (isWord) {
    const letters = content.split('');
    return (
      <View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 6, marginBottom: 8 }}>
          {letters.map((ch, i) => (
            <View key={i} style={{ width: 44, height: 44, borderWidth: 2, borderColor: '#333', borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
              <Text style={{ fontSize: 26, fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>{ch.toUpperCase()}</Text>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 4 }}>
          <Text style={{ fontSize: 14, color: '#666', marginRight: 8 }}>How many letters?</Text>
          <View style={{ width: 40, height: 30, borderWidth: 2, borderColor: '#bbb', borderRadius: 4 }} />
        </View>
        {act.hint && <Text style={s.hint}>{act.hint}</Text>}
      </View>
    );
  }

  // Normal count: show shapes + answer box
  const shape = detectCountShape(act.prompt);
  const displayCount = Math.min(parseInt(content, 10) || 5, 20);
  return (
    <View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 6, marginBottom: 6 }}>
        <FilledShapeGroup count={displayCount} shape={shape} size={28} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 4 }}>
        <Text style={{ fontSize: 14, color: '#666', marginRight: 8 }}>How many?</Text>
        <View style={{ width: 40, height: 30, borderWidth: 2, borderColor: '#bbb', borderRadius: 4 }} />
      </View>
      {act.hint && <Text style={s.hint}>{act.hint}</Text>}
    </View>
  );
}

function DrawActivity({ act }) {
  return (
    <View>
      <View style={s.drawBox} />
      {act.hint && <Text style={s.hint}>{act.hint}</Text>}
    </View>
  );
}

function ColorActivity({ act }) {
  const shapes = (act.content || 'circle,square,triangle').toLowerCase().split(/[,;|]+/).map(sh => sh.trim()).filter(Boolean);
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}>
        {shapes.map((shape, i) => (
          <View key={i} style={{ alignItems: 'center', marginRight: 16 }}>
            <SvgShape shape={shape} size={60} />
            <Text style={{ fontSize: 11, color: '#666', textAlign: 'center', marginTop: 4 }}>{shape}</Text>
          </View>
        ))}
      </View>
      {act.hint && <Text style={s.hint}>{act.hint}</Text>}
    </View>
  );
}

function CutActivity({ act }) {
  return (
    <View>
      <View style={{ marginTop: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <ScissorSvg />
          <Svg width={480} height={4} viewBox="0 0 480 4">
            <Line x1={0} y1={2} x2={480} y2={2} stroke="#333" strokeWidth={2} strokeDasharray="8,5" />
          </Svg>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <ScissorSvg />
          <Svg width={480} height={30} viewBox="0 0 480 30">
            <Path
              d="M 0 15 Q 30 0, 60 15 Q 90 30, 120 15 Q 150 0, 180 15 Q 210 30, 240 15 Q 270 0, 300 15 Q 330 30, 360 15 Q 390 0, 420 15 Q 450 30, 480 15"
              stroke="#333" strokeWidth={2} strokeDasharray="6,4" fill="none"
            />
          </Svg>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ScissorSvg />
          <Svg width={480} height={30} viewBox="0 0 480 30">
            <Path
              d="M 0 20 L 30 5 L 60 20 L 90 5 L 120 20 L 150 5 L 180 20 L 210 5 L 240 20 L 270 5 L 300 20 L 330 5 L 360 20 L 390 5 L 420 20 L 450 5 L 480 20"
              stroke="#333" strokeWidth={2} strokeDasharray="6,4" fill="none"
            />
          </Svg>
        </View>
      </View>
      {act.hint && <Text style={s.hint}>{act.hint}</Text>}
    </View>
  );
}

function CompareGroupsActivity({ act }) {
  const nums = (act.content || '3,7').split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
  const a = Math.min(nums[0] || 3, 15);
  const b = Math.min(nums[1] || 7, 15);
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 8, marginBottom: 6 }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#555', marginBottom: 6 }}>Group A</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 120 }}>
            {Array.from({ length: a }).map((_, i) => (
              <View key={i} style={{ marginRight: 4, marginBottom: 4 }}>
                <Svg width={22} height={22} viewBox="0 0 22 22">
                  <Circle cx={11} cy={11} r={9} fill="#555" stroke="none" />
                </Svg>
              </View>
            ))}
          </View>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#555', marginBottom: 6 }}>Group B</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 120 }}>
            {Array.from({ length: b }).map((_, i) => (
              <View key={i} style={{ marginRight: 4, marginBottom: 4 }}>
                <Svg width={22} height={22} viewBox="0 0 22 22">
                  <Circle cx={11} cy={11} r={9} fill="#555" stroke="none" />
                </Svg>
              </View>
            ))}
          </View>
        </View>
      </View>
      <Text style={{ fontSize: 11, color: '#666', textAlign: 'center', marginTop: 6 }}>Which group has more? Circle it.</Text>
      {act.hint && <Text style={s.hint}>{act.hint}</Text>}
    </View>
  );
}

function ShapeIdentifyActivity({ act }) {
  const shapes = (act.content || 'circle,square,triangle').toLowerCase().split(',').map(sh => sh.trim()).filter(Boolean);
  return (
    <View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
        {shapes.map((shape, i) => (
          <View key={i} style={{ alignItems: 'center', marginRight: 16, marginBottom: 8 }}>
            <SvgShape shape={shape} size={60} />
            <Text style={{ fontSize: 10, color: '#555', marginTop: 4, textAlign: 'center' }}>{shape}</Text>
          </View>
        ))}
      </View>
      {act.hint && <Text style={s.hint}>{act.hint}</Text>}
    </View>
  );
}

function EmotionFacesActivity({ act }) {
  const emotions = (act.content || 'happy,sad,angry').toLowerCase().split(',')
    .map(e => e.trim()).filter(e => KNOWN_EMOTIONS.includes(e));
  if (emotions.length === 0) emotions.push('happy', 'sad', 'angry');
  return (
    <View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
        {emotions.map((emotion, i) => (
          <View key={i} style={{ alignItems: 'center', marginRight: 14, marginBottom: 8 }}>
            <SvgFace emotion={emotion} size={60} />
            <Text style={{ fontSize: 10, color: '#555', marginTop: 4, textAlign: 'center' }}>{emotion}</Text>
          </View>
        ))}
      </View>
      {act.hint && <Text style={s.hint}>{act.hint}</Text>}
    </View>
  );
}

function SizeCompareActivity({ act }) {
  const labels = (act.content || 'tall,short,tall,short').toLowerCase().split(',').map(l => l.trim()).filter(Boolean);
  return (
    <View>
      <HeightBars items={labels} />
      {act.hint && <Text style={s.hint}>{act.hint}</Text>}
    </View>
  );
}

function BreathingActivity({ act }) {
  const count = Math.min(parseInt(act.content, 10) || 4, 8);
  return (
    <View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
        {Array.from({ length: count }).map((_, i) => (
          <View key={i} style={{ alignItems: 'center', marginRight: 16, marginBottom: 8 }}>
            <CloudSvg />
            <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#888', marginTop: 4 }}>{i + 1}</Text>
          </View>
        ))}
      </View>
      {act.hint && <Text style={s.hint}>{act.hint}</Text>}
    </View>
  );
}

function CutShapeActivity({ act }) {
  const shape = (act.content || 'square').toLowerCase().trim();
  return (
    <View>
      <View style={{ alignItems: 'center', marginTop: 8 }}>
        <ScissorSvg />
        <View style={{ marginTop: 4 }}>
          <SvgShape shape={shape} size={180} stroke="#333" strokeWidth={2.5} dashed />
        </View>
      </View>
      {act.hint && <Text style={s.hint}>{act.hint}</Text>}
    </View>
  );
}

function GenericActivity({ act }) {
  return (
    <View>
      <View style={s.drawBox} />
      {act.hint && <Text style={s.hint}>{act.hint}</Text>}
    </View>
  );
}

// ═══════════════════════════════════════════════════════
// PARSING HELPERS
// ═══════════════════════════════════════════════════════

function parseItems(content) {
  if (!content) return ['A', 'B', 'C', 'D'];
  const parts = content.split(/[,;|]+/).map(p => p.trim()).filter(Boolean);
  if (parts.length >= 2) return parts;
  return content.trim().split('').filter(c => c.trim());
}

function parseMatchPairs(content) {
  if (!content) return [['A', '1'], ['B', '2'], ['C', '3']];
  const pairs = content.split(/[,;|]+/).map(p => p.trim()).filter(Boolean);
  return pairs.map(p => {
    const parts = p.split(/[-:=\u2192]+/).map(x => x.trim());
    if (parts.length >= 2) return [parts[0], parts[1]];
    return [p, '?'];
  });
}

// ═══════════════════════════════════════════════════════
// ACTIVITY ROUTER
// ═══════════════════════════════════════════════════════

function ActivityRenderer({ act, num }) {
  const normalized = normalizeActivity(act);

  // Activity prompt is rendered by the router for consistent styling
  const promptEl = <Text style={s.prompt}>{normalized.prompt}</Text>;

  let content;
  switch (normalized.type) {
    case 'trace': content = <TraceActivity act={normalized} />; break;
    case 'write': content = <WriteActivity act={normalized} />; break;
    case 'circle': content = <CircleActivity act={normalized} />; break;
    case 'match': content = <MatchActivity act={normalized} />; break;
    case 'count': content = <CountActivity act={normalized} />; break;
    case 'draw': content = <DrawActivity act={normalized} />; break;
    case 'color':
    case 'colour': content = <ColorActivity act={normalized} />; break;
    case 'cut': content = <CutActivity act={normalized} />; break;
    case 'compare_groups': content = <CompareGroupsActivity act={normalized} />; break;
    case 'shapes': content = <ShapeIdentifyActivity act={normalized} />; break;
    case 'emotions': content = <EmotionFacesActivity act={normalized} />; break;
    case 'sizes': content = <SizeCompareActivity act={normalized} />; break;
    case 'breathing': content = <BreathingActivity act={normalized} />; break;
    case 'cut_shape': content = <CutShapeActivity act={normalized} />; break;
    default: content = <GenericActivity act={normalized} />;
  }

  return (
    <View>
      {/* Twinkl-style: colored number badge + prompt */}
      <View style={s.actHeader}>
        <View style={s.actNumBadge}>
          <Text style={s.actNumText}>{num}</Text>
        </View>
        {promptEl}
      </View>
      {content}
    </View>
  );
}

// ═══════════════════════════════════════════════════════
// DOCUMENT
// ═══════════════════════════════════════════════════════

function reorderActivities(activities) {
  if (!activities) return [];
  const CUT_TYPES = ['cut', 'cut_shape'];
  const nonCut = [];
  const cutActs = [];
  for (const act of activities) {
    const type = (act.type || '').toLowerCase().replace(/\s+/g, '_');
    if (CUT_TYPES.includes(type) || (/\bcut\b/i.test(act.prompt) && !type)) {
      cutActs.push(act);
    } else {
      nonCut.push(act);
    }
  }
  return [...nonCut, ...cutActs];
}

/** Post-generation validation: checks that activities have proper visual elements.
 *  Logs warnings for any activity missing expected SVGs. */
function validateActivities(activities) {
  if (!activities) return;
  activities.forEach((act, i) => {
    const norm = normalizeActivity(act);
    const num = i + 1;

    // Circle activities: check all items have SVG renderers (skip letter/word mode — those render as text)
    if (norm.type === 'circle' && !norm._circleMode) {
      let items = parseItems(norm.content);
      items = fixNonsenseCircleContent(items, norm.prompt);
      items.forEach(item => {
        const lower = item.toLowerCase().trim();
        const iconKey = lower.replace(/\s+/g, '_');
        const hasSvg = KNOWN_SHAPES.includes(lower) || VERIFIED_ICONS.includes(iconKey) || /^\d+$/.test(item) || item.trim().length <= 1;
        if (!hasSvg) {
          console.warn(`[WorksheetPDF] Activity ${num}: "${item}" not in verified icon whitelist — will render as text. Prompt: "${norm.prompt}"`);
        }
      });
    }

    // Count activities: check letter-counting has detectable word
    if (norm.type === 'count' && /letter/i.test(norm.prompt)) {
      const contentIsWord = /^[a-zA-Z]{2,}$/.test((norm.content || '').trim());
      if (!contentIsWord) {
        console.warn(`[WorksheetPDF] Activity ${num}: letter-counting prompt but content is not a word. Content: "${norm.content}", Prompt: "${norm.prompt}"`);
      }
    }

    // Match activities: check right-side items have visuals
    if (norm.type === 'match') {
      const pairs = parseMatchPairs(norm.content);
      pairs.forEach(([, right]) => {
        const lower = right.toLowerCase().trim();
        const iconKey = lower.replace(/\s+/g, '_');
        const hasSvg = KNOWN_SHAPES.includes(lower) || VERIFIED_ICONS.includes(iconKey) || /^\d+$/.test(right) || KNOWN_EMOTIONS.includes(lower);
        if (!hasSvg && right.length > 1 && right !== '?') {
          console.warn(`[WorksheetPDF] Activity ${num}: match item "${right}" not in verified whitelist. Prompt: "${norm.prompt}"`);
        }
      });
    }

    // Shapes/emotions: check items are valid
    if (norm.type === 'shapes') {
      const shapes = norm.content.split(',').map(s => s.trim());
      shapes.forEach(sh => {
        if (!KNOWN_SHAPES.includes(sh)) {
          console.warn(`[WorksheetPDF] Activity ${num}: unknown shape "${sh}". Prompt: "${norm.prompt}"`);
        }
      });
    }
    if (norm.type === 'emotions') {
      const emos = norm.content.split(',').map(e => e.trim());
      emos.forEach(e => {
        if (!KNOWN_EMOTIONS.includes(e)) {
          console.warn(`[WorksheetPDF] Activity ${num}: unknown emotion "${e}". Prompt: "${norm.prompt}"`);
        }
      });
    }
  });
}

function WorksheetDocument({ worksheet }) {
  const orderedActivities = reorderActivities(worksheet.activities);
  // Run post-generation validation
  validateActivities(worksheet.activities);
  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Professional header */}
        <View style={s.header}>
          <Text style={s.title}>{worksheet.title}</Text>
          <Text style={s.subtitle}>Alpha Learning  ·  Personalized Worksheet</Text>
        </View>
        {worksheet.instructions && (
          <View style={s.instructions}>
            <Text>{worksheet.instructions}</Text>
          </View>
        )}
        {orderedActivities.map((act, i) => (
          <View key={i} style={s.activity} wrap={false}>
            <ActivityRenderer act={act} num={i + 1} />
          </View>
        ))}
        <Text style={s.footer}>Generated by Alpha Learning Dashboard</Text>
      </Page>
    </Document>
  );
}

// ═══════════════════════════════════════════════════════
// MOBILE PDF VIEWER — renders each page as canvas via pdfjs
// ═══════════════════════════════════════════════════════

import { Document as PdfViewDoc, Page as PdfViewPage, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function MobilePdfPages({ fileData }) {
  const [numPages, setNumPages] = useState(null);
  const [error, setError] = useState(null);
  const [containerWidth, setContainerWidth] = useState(window.innerWidth);
  const containerRef = useRef(null);

  useEffect(() => {
    function measure() {
      if (containerRef.current) setContainerWidth(containerRef.current.clientWidth);
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <p className="text-text-secondary text-sm mb-3">Could not render preview.</p>
        <p className="text-text-dim text-xs">Use the Download button to save the PDF instead.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-3 py-3 px-1">
      <PdfViewDoc
        file={fileData}
        onLoadSuccess={({ numPages: n }) => setNumPages(n)}
        onLoadError={(err) => setError(err)}
        loading={<p className="text-text-secondary text-sm py-8">Loading pages...</p>}
      >
        {numPages && Array.from({ length: numPages }, (_, i) => (
          <PdfViewPage
            key={i + 1}
            pageNumber={i + 1}
            width={containerWidth - 16}
            renderAnnotationLayer={false}
            renderTextLayer={false}
          />
        ))}
      </PdfViewDoc>
      {numPages && (
        <p className="text-text-dim text-xs pb-2">{numPages} page{numPages > 1 ? 's' : ''}</p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MODAL WRAPPER
// ═══════════════════════════════════════════════════════

export default function WorksheetPDF({ worksheet, onClose }) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [pdfBlob, setPdfBlob] = useState(null);

  useEffect(() => {
    function handleResize() { setIsMobile(window.innerWidth < 768); }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate PDF blob for mobile canvas rendering
  useEffect(() => {
    if (!isMobile) return;
    let revoked = false;
    pdf(<WorksheetDocument worksheet={worksheet} />).toBlob().then(blob => {
      if (!revoked) setPdfBlob(blob);
    });
    return () => { revoked = true; };
  }, [isMobile, worksheet]);

  async function handleDownload() {
    const blob = await pdf(<WorksheetDocument worksheet={worksheet} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${worksheet.title?.replace(/\s+/g, '-') || 'worksheet'}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center md:p-3" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative bg-bg-card flex flex-col w-full h-full md:w-auto md:h-auto md:border md:border-border md:rounded-2xl"
        style={isMobile ? {} : { width: '90vw', maxWidth: 900, height: '92vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <h3 className="text-text-primary text-sm font-semibold">PDF Preview</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="text-xs px-3 py-2 rounded-lg text-white font-medium min-h-[44px]"
              style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}
            >
              Download PDF
            </button>
            <button onClick={onClose} className="text-text-dim hover:text-text-secondary text-2xl min-h-[44px] min-w-[44px] flex items-center justify-center">&times;</button>
          </div>
        </div>
        <div className="flex-1 overflow-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          {isMobile ? (
            pdfBlob ? (
              <MobilePdfPages fileData={pdfBlob} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-text-secondary text-sm">Rendering pages...</p>
              </div>
            )
          ) : (
            <PDFViewer width="100%" height="100%" showToolbar={false}>
              <WorksheetDocument worksheet={worksheet} />
            </PDFViewer>
          )}
        </div>
      </div>
    </div>
  );
}
