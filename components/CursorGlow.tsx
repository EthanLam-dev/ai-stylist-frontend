"use client";
import { useEffect, useState } from "react";

export default function CursorGlow() {
  const [position, setPosition] = useState({ x: -150, y: -150 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className="fixed pointer-events-none z-0 transition-transform duration-100 ease-out blur-[20px]"
      style={{
        width: "300px",
        height: "300px",
        background: "radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 70%)",
        borderRadius: "50%",
        transform: `translate(${position.x - 150}px, ${position.y - 150}px)`,
      }}
    />
  );
}