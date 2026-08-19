import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// A short, syntax-colored snippet that types itself out, pauses, then loops.
const codeLines = [
  { indent: 0, tokens: [{ t: 'function ', c: 'text-purple-400' }, { t: 'launchCareer', c: 'text-sky-400' }, { t: '(', c: 'text-slate-400' }, { t: 'student', c: 'text-orange-300' }, { t: ') {', c: 'text-slate-400' }] },
  { indent: 1, tokens: [{ t: 'student', c: 'text-orange-300' }, { t: '.skills = ', c: 'text-slate-400' }, { t: "['HTML', 'CSS', 'JS'];", c: 'text-emerald-300' }] },
  { indent: 1, tokens: [{ t: 'student', c: 'text-orange-300' }, { t: '.certified = ', c: 'text-slate-400' }, { t: 'true', c: 'text-amber-300' }, { t: ';', c: 'text-slate-400' }] },
  { indent: 1, tokens: [{ t: 'return ', c: 'text-purple-400' }, { t: 'student', c: 'text-orange-300' }, { t: '.getPlaced();', c: 'text-slate-400' }] },
  { indent: 0, tokens: [{ t: '}', c: 'text-slate-400' }] },
];

const lineTexts = codeLines.map((l) => l.tokens.map((t) => t.t).join(''));
const lineLengths = lineTexts.map((t) => t.length);
const totalLength = lineLengths.reduce((a, b) => a + b, 0);

function sliceTokens(tokens, count) {
  let remaining = count;
  const out = [];
  for (const tok of tokens) {
    if (remaining <= 0) break;
    if (tok.t.length <= remaining) {
      out.push(tok);
      remaining -= tok.t.length;
    } else {
      out.push({ t: tok.t.slice(0, remaining), c: tok.c });
      remaining = 0;
    }
  }
  return out;
}

const orbitIcons = [
  { icon: '</>', bg: 'bg-indigo-600', label: 'Coding' },
  { icon: '🖥️', bg: 'bg-sky-600', label: 'Hardware' },
  { icon: '🌐', bg: 'bg-emerald-600', label: 'Networking' },
  { icon: '☁️', bg: 'bg-purple-600', label: 'Cloud' },
  { icon: '🔒', bg: 'bg-rose-600', label: 'Security' },
  { icon: '🗄️', bg: 'bg-amber-600', label: 'Database' },
];

const ORBIT_DURATION = 26;
const RADIUS = 175;

export default function HeroShowcase() {
  const [visibleChars, setVisibleChars] = useState(0);
  const cardRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 150, damping: 20 });

  useEffect(() => {
    const delay = visibleChars < totalLength ? 30 : 2600;
    const next = visibleChars < totalLength ? visibleChars + 1 : 0;
    const timer = setTimeout(() => setVisibleChars(next), delay);
    return () => clearTimeout(timer);
  }, [visibleChars]);

  function handleMouseMove(e) {
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  let consumed = 0;

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square flex items-center justify-center">
      {/* Animated dot-grid backdrop */}
      <div className="absolute inset-0 dot-grid text-indigo-200/70 [mask-image:radial-gradient(circle,black_35%,transparent_75%)]" />

      {/* Glow blob */}
      <motion.div
        className="absolute w-72 h-72 rounded-full bg-gradient-to-br from-indigo-400/25 to-purple-400/25 blur-3xl"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Orbiting solution icons */}
      {orbitIcons.map((item, i) => {
        const angle = (360 / orbitIcons.length) * i;
        return (
          <motion.div
            key={item.label}
            className="absolute top-1/2 left-1/2"
            style={{ marginTop: -22, marginLeft: -22 }}
            initial={{ rotate: angle }}
            animate={{ rotate: angle + 360 }}
            transition={{ duration: ORBIT_DURATION, repeat: Infinity, ease: 'linear' }}
          >
            <div style={{ transform: `translateX(${RADIUS}px)` }}>
              <motion.div
                initial={{ rotate: -angle }}
                animate={{ rotate: -angle - 360 }}
                transition={{ duration: ORBIT_DURATION, repeat: Infinity, ease: 'linear' }}
                whileHover={{ scale: 1.2 }}
                className={`w-11 h-11 rounded-xl ${item.bg} text-white flex items-center justify-center text-base font-semibold shadow-lg cursor-default`}
                title={item.label}
              >
                {item.icon}
              </motion.div>
            </div>
          </motion.div>
        );
      })}

      {/* Code editor card with mouse-tilt */}
      <div style={{ perspective: 1000 }} className="relative z-10 w-[300px] sm:w-[340px]">
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-slate-900 rounded-xl shadow-2xl shadow-indigo-900/30 border border-white/10 overflow-hidden"
        >
          <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800/80 border-b border-white/5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="ml-3 text-[11px] text-slate-400 font-mono">career.js</span>
          </div>

          <div className="px-4 py-4 font-mono text-[12px] leading-6 min-h-[150px]">
            {codeLines.map((line, li) => {
              const charsForLine = Math.max(0, Math.min(lineLengths[li], visibleChars - consumed));
              consumed += lineLengths[li];
              const shown = sliceTokens(line.tokens, charsForLine);
              const isTypingHere = charsForLine > 0 && charsForLine < lineLengths[li];
              const lineDone = consumed <= visibleChars;
              return (
                <div key={li} style={{ paddingLeft: line.indent * 16 }} className="flex items-center whitespace-pre">
                  <span className="text-slate-600 select-none w-4 inline-block">{li + 1}</span>
                  {shown.map((tok, ti) => (
                    <span key={ti} className={tok.c}>{tok.t}</span>
                  ))}
                  {(isTypingHere || (lineDone && li === codeLines.length - 1)) && (
                    <span className="inline-block w-[6px] h-[13px] bg-indigo-400 ml-0.5 blink-cursor" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="px-4 py-2.5 bg-slate-950/60 border-t border-white/5 font-mono text-[11px] text-emerald-400 flex items-center gap-1.5">
            <span className="text-slate-500">$</span> Sufi Infotech — all computer solutions
          </div>
        </motion.div>
      </div>
    </div>
  );
}
