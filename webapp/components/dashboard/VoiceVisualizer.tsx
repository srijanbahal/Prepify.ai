"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface VoiceVisualizerProps {
  isActive: boolean;
  audioLevel?: number;
}

export default function VoiceVisualizer({ isActive, audioLevel = 0 }: VoiceVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bars] = useState<number>(24);
  const animationRef = useRef<number | undefined>(undefined);
  const barsDataRef = useRef<number[]>(new Array(24).fill(0.2));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;
    const barWidth = 3;
    const barGap = 2;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update bars based on activity
      if (isActive) {
        barsDataRef.current = barsDataRef.current.map((bar, i) => {
          const target = 0.3 + (audioLevel || Math.random() * 0.7);
          return bar + (target - bar) * 0.2;
        });
      } else {
        barsDataRef.current = barsDataRef.current.map((bar) => {
          return bar + (0.2 - bar) * 0.1;
        });
      }

      // Draw bars
      for (let i = 0; i < bars; i++) {
        const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
        const barHeight = barsDataRef.current[i] * 60;

        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + barHeight);
        const y2 = centerY + Math.sin(angle) * (radius + barHeight);

        // Gradient
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        if (isActive) {
          gradient.addColorStop(0, "rgba(255, 255, 255, 0.2)");
          gradient.addColorStop(1, "rgba(255, 255, 255, 0.9)");
        } else {
          gradient.addColorStop(0, "rgba(255, 255, 255, 0.1)");
          gradient.addColorStop(1, "rgba(255, 255, 255, 0.3)");
        }

        ctx.strokeStyle = gradient;
        ctx.lineWidth = barWidth;
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, audioLevel, bars]);

  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        {/* Glow effect */}
        <div
          className={`absolute inset-0 rounded-full blur-3xl transition-opacity duration-500 ${
            isActive ? "opacity-30" : "opacity-10"
          }`}
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)",
          }}
        />

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="relative z-10"
        />

        {/* Center indicator */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className={`w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              isActive
                ? "border-white bg-white/10 scale-110"
                : "border-white/30 bg-white/5"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                isActive ? "bg-white animate-pulse" : "bg-white/50"
              }`}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
