import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  names: string[];
  resultA: string;
  resultB: string;
  onComplete: () => void;
  autoStart?: boolean;
}

function Drum({
  names,
  result,
  delay,
  onDone,
}: {
  names: string[];
  result: string;
  delay: number;
  onDone: () => void;
}) {
  const [display, setDisplay] = useState(names[0]);
  const [revealed, setRevealed] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let speed = 80;
    let elapsed = 0;
    const total = 5000 + delay; // ms

    function tick() {
      elapsed += speed;
      const progress = elapsed / total;
      // Slow down exponentially toward end
      speed = Math.min(80 + progress * 800, 600);

      setDisplay(names[Math.floor(Math.random() * names.length)]);

      if (elapsed >= total) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplay(result);
        setRevealed(true);
        onDone();
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setTimeout(tick, speed);
      }
    }

    const startTimer = setTimeout(() => {
      intervalRef.current = setTimeout(tick, speed);
    }, delay);

    return () => {
      clearTimeout(startTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`w-48 h-20 flex items-center justify-center rounded-xl border-2 text-2xl font-bold transition-all duration-300 ${
          revealed
            ? "border-[var(--accent)] bg-[var(--accent)]/20 text-white scale-110"
            : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"
        }`}
      >
        <motion.span
          key={display}
          initial={{ opacity: 0.4, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.05 }}
        >
          {display}
        </motion.span>
      </div>
    </div>
  );
}

export default function SlotMachine({ names, resultA, resultB, onComplete, autoStart = true }: Props) {
  const [aDone, setADone] = useState(false);
  const [bDone, setBDone] = useState(false);
  const [started, setStarted] = useState(autoStart);
  const notified = useRef(false);

  useEffect(() => {
    if (aDone && bDone && !notified.current) {
      notified.current = true;
      setTimeout(onComplete, 1500);
    }
  }, [aDone, bDone, onComplete]);

  if (!started) {
    return (
      <button
        onClick={() => setStarted(true)}
        className="px-8 py-4 rounded-2xl bg-[var(--accent)] text-black text-xl font-bold hover:opacity-90 transition"
      >
        Draw!
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-[var(--muted)] text-sm uppercase tracking-widest">The draw</p>
      <div className="flex gap-8 items-end">
        <div className="flex flex-col items-center gap-2">
          <span className="text-lg" title="Standing">🧍</span>
          <Drum
            names={names}
            result={resultA}
            delay={0}
            onDone={() => setADone(true)}
          />
        </div>
        <div className="text-3xl text-[var(--muted)] pb-6">⟺</div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-lg" title="Seated">💺</span>
          <Drum
            names={names}
            result={resultB}
            delay={1200}
            onDone={() => setBDone(true)}
          />
        </div>
      </div>
      {aDone && bDone && (
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-[var(--accent)] text-lg font-semibold"
        >
          It's a match! ✨
        </motion.p>
      )}
    </div>
  );
}
