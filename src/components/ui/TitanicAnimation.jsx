"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useTheme } from '@/components/ThemeProvider';

export function TitanicAnimation({ netProfit, isSimulation = false, simState = 'profit', simDay = 1 }) {
  const { theme } = useTheme();
  const isDay = theme === 'light';

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const isLoss = isSimulation ? simState === 'loss' : netProfit < 0;
  const isProfit = isSimulation ? simState === 'profit' : netProfit > 0;
  const isNeutral = isSimulation ? simState === 'neutral' : netProfit === 0;

  let frontRotate = 0;
  let frontY = 0;
  let frontX = 0;
  
  let backRotate = 0;
  let backY = 0;
  let backX = 0;

  const isCracking = isLoss && simDay === 21;
  const isSplit = isLoss && simDay >= 22;

  if (isLoss) {
    // Always use the day-based progression for both Dashboard and Simulator
    if (simDay < 21) {
      frontY = backY = (simDay / 20) * 80;
      frontRotate = backRotate = (simDay / 20) * 45;
    } else if (simDay === 21) {
      frontY = backY = 80;
      frontRotate = backRotate = 45;
    } else if (simDay < 24) {
      // THE SPLIT
      const progress = (simDay - 21) / 2; 
      frontY = 100 + progress * 150; 
      frontRotate = 45 - progress * 45; // Front goes horizontal (0 deg)
      frontX = progress * 80;
      
      backY = 100 + progress * 50; 
      backRotate = 45 + progress * 45; // Back goes vertical (90 deg)
      backX = progress * -50;
    } else if (simDay < 27) {
      const progress = (simDay - 23) / 3; 
      frontY = 250 + progress * 250; // Plunges to 500
      frontRotate = 0;
      frontX = 80 + progress * 20;
      
      backY = 150 + progress * 150; 
      backRotate = 90;
      backX = -50;
    } else {
      const progress = (simDay - 26) / 5; 
      frontY = 500; // Do not sink past 500 to keep in frame
      frontRotate = 0;
      frontX = 100 + progress * 50; // Drift ends at 150
      
      backY = 300 + progress * 200; // Sinks to 500
      backRotate = 90 - progress * 90; // Levels out to 0
      backX = -50 - progress * 50; // Drifts to -100
    }
  }

  // Breakage Thresholds (now universally based on simDay, but only if it's a loss)
  const frontBarBroken = isLoss && simDay >= 7;
  const funnel1Broken = isLoss && simDay >= 12;
  const funnel2Broken = isLoss && simDay >= 17;
  const funnel3Broken = isLoss && simDay >= 20;
  const funnel4Broken = isLoss && simDay >= 23;
  const backBarsBroken = isLoss && simDay >= 26;

  const hullBreach = isLoss; // The breach causes the sinking, so it must be present from Day 1 of loss

  const frontStyle = {
    transform: `translate(${frontX}px, ${frontY}px) rotate(${frontRotate}deg)`,
    transformOrigin: "630px 250px", // Exact break point
    transition: "transform 2s ease-in-out",
  };

  const backStyle = {
    transform: `translate(${backX}px, ${backY}px) rotate(${backRotate}deg)`,
    transformOrigin: "630px 250px", // Exact break point
    transition: "transform 2s ease-in-out",
  };

  if (isProfit) {
    frontStyle.animation = backStyle.animation = "ship-bob 4s infinite ease-in-out";
  }

  const stars = useMemo(() => {
    return Array.from({ length: 400 }).map((_, i) => ({
      cx: Math.random() * 8000 - 4000,
      cy: Math.random() * 700, 
      r: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.8 + 0.2,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 4
    }));
  }, []);

  const wavePath = useMemo(() => {
    let path = "M -4000 10 ";
    for (let i = -4000; i < 4000; i += 400) {
      path += `Q ${i + 100} -10 ${i + 200} 10 T ${i + 400} 10 `;
    }
    return path + "L 4000 1600 L -4000 1600 Z";
  }, []);

  const frontWavePath = useMemo(() => {
    let path = "M -4000 10 ";
    for (let i = -4000; i < 4000; i += 400) {
      path += `Q ${i + 100} 30 ${i + 200} 10 T ${i + 400} 10 `;
    }
    return path + "L 4000 1600 L -4000 1600 Z";
  }, []);

  const renderMoonGroup = () => (
    <g>
      <circle cx="1650" cy="50" r="45" fill="#f4f6f0" style={{ filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.8))' }} />
      <circle cx="1660" cy="40" r="8" fill="#e0e2db" opacity="0.6" />
      <circle cx="1630" cy="60" r="12" fill="#e0e2db" opacity="0.4" />
      <circle cx="1665" cy="70" r="6" fill="#e0e2db" opacity="0.5" />
      
      {Array.from({length: 15}).map((_, i) => (
        <path 
          key={`shoot1-${i}`}
          d={`M ${Math.random() * 8000 - 4000} ${Math.random() * 200} l -150 150`}
          stroke="url(#shooting-grad)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0"
          style={{
            animation: `shooting-star ${3 + Math.random() * 5}s infinite ease-in ${Math.random() * 15}s`
          }}
        />
      ))}
    </g>
  );

  const renderShip = () => (
    <>
      {/* Foremast (Front) */}
      <g transform={frontBarBroken ? "translate(100, 300) rotate(90, 900, 120)" : ""} style={{ transition: "all 3s ease-in", opacity: frontBarBroken ? 0 : 1 }}>
        <line x1="900" y1="120" x2="900" y2="-20" stroke="url(#mast-grad)" strokeWidth="3" />
        <line x1="900" y1="120" x2="900" y2="40" stroke="#111" strokeWidth="4" />
      </g>
      
      {/* Mainmast (Back) */}
      <g transform={backBarsBroken ? "translate(-100, 300) rotate(-90, 250, 120)" : ""} style={{ transition: "all 3s ease-in", opacity: backBarsBroken ? 0 : 1 }}>
        <line x1="250" y1="120" x2="250" y2="-10" stroke="url(#mast-grad)" strokeWidth="3" />
        <line x1="250" y1="120" x2="250" y2="40" stroke="#111" strokeWidth="4" />
      </g>
      
      {hullBreach ? (
        <g>
          <polyline points="110,130 250,-10 450,-30 570,-30 690,-30 710,50" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.75" />
          <polyline points="880,50 900,-20 980,130" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.75" />
        </g>
      ) : (
        <polyline points="110,130 250,-10 450,-30 570,-30 690,-30 810,-30 900,-20 980,130" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.75" />
      )}

      {/* Funnels */}
      <g transform={funnel4Broken ? "translate(450, 40) rotate(-75, 15, 70)" : "translate(450, 40)"} style={{ transition: "transform 2s ease-in-out" }}>
        <g transform="skewX(-10)">
          <rect x="0" y="0" width="30" height="70" fill="url(#funnel-grad)" />
          <rect x="0" y="0" width="30" height="18" fill="url(#funnel-top-grad)" />
          <line x1="-2" y1="10" x2="-2" y2="70" stroke="#111" strokeWidth="1" />
        </g>
      </g>
      
      <g transform={funnel3Broken ? "translate(570, 40) rotate(-65, 15, 70)" : "translate(570, 40)"} style={{ transition: "transform 2s ease-in-out" }}>
        <g transform="skewX(-10)">
          <rect x="0" y="0" width="30" height="70" fill="url(#funnel-grad)" />
          <rect x="0" y="0" width="30" height="18" fill="url(#funnel-top-grad)" />
          <line x1="-2" y1="10" x2="-2" y2="70" stroke="#111" strokeWidth="1" />
        </g>
      </g>
      
      <g transform={funnel2Broken ? "translate(690, 40) rotate(75, 15, 70)" : "translate(690, 40)"} style={{ transition: "transform 2s ease-in-out" }}>
        <g transform="skewX(-10)">
          <rect x="0" y="0" width="30" height="70" fill="url(#funnel-grad)" />
          <rect x="0" y="0" width="30" height="18" fill="url(#funnel-top-grad)" />
          <line x1="-2" y1="10" x2="-2" y2="70" stroke="#111" strokeWidth="1" />
        </g>
      </g>
      
      <g transform={funnel1Broken ? "translate(810, 40) rotate(85, 15, 70)" : "translate(810, 40)"} style={{ transition: "transform 2s ease-in-out" }}>
        <g transform="skewX(-10)">
          <rect x="0" y="0" width="30" height="70" fill="url(#funnel-grad)" />
          <rect x="0" y="0" width="30" height="18" fill="url(#funnel-top-grad)" />
          <line x1="-2" y1="10" x2="-2" y2="70" stroke="#111" strokeWidth="1" />
        </g>
      </g>


      {/* Breakpoint structural jagged edges - Only visible when split */}
      {isSplit && (
        <g>
          {/* Back half jagged edge */}
          <path d="M 630 155 L 610 180 L 640 200 L 620 220 L 630 250 L 630 155" fill="#333" />
          {/* Front half jagged edge */}
          <path d="M 630 155 L 650 180 L 620 200 L 640 220 L 630 250 L 630 155" fill="#222" />
        </g>
      )}

      <path d="M 320 110 L 850 110 L 850 120 L 320 120 Z" fill="url(#hull-white-grad)" />
      <g transform="translate(330, 108)">
        {Array.from({length: 18}).map((_, i) => (
          <path key={`lb-${i}`} d={`M ${i * 28} 0 C ${i * 28 + 2} 4, ${i * 28 + 14} 4, ${i * 28 + 16} 0 Z`} fill="#f1f5f9" stroke="#555" strokeWidth="0.5" />
        ))}
      </g>
      <path d="M 300 120 L 860 120 L 870 135 L 290 135 Z" fill="url(#hull-white-grad)" />
      <g>
        {Array.from({length: 91}).map((_, i) => {
           const fill = !isDay && !isLoss ? "#FAD169" : "#222";
           return <rect key={`pd-${i}`} x={305 + i * 6} y="123" width="2.5" height="10" fill={fill} />;
        })}
      </g>
      <path d="M 240 135 L 890 135 L 900 155 L 220 155 Z" fill="url(#hull-white-grad)" />
      <g>
        {Array.from({length: 71}).map((_, i) => {
           const fill = !isDay && !isLoss ? "#FAD169" : "#111";
           return <rect key={`bd-${i}`} x={245 + i * 9} y="140" width="4" height="10" rx="1" fill={fill} />;
        })}
      </g>
      <path d="M 170 155 L 320 155 L 320 165 L 160 165 Z" fill="#E0E0E0" />
      <path d="M 900 155 L 950 155 L 960 165 L 900 165 Z" fill="#E0E0E0" />

      {/* Stern Flag Pole & Huge BAPL Flag */}
      <g transform={backBarsBroken ? "translate(-100, 300) rotate(-90, 120, 155)" : ""} style={{ transition: "all 3s ease-in", opacity: backBarsBroken ? 0 : 1 }}>
        <line x1="120" y1="155" x2="120" y2="60" stroke="#B0A696" strokeWidth="3" />
        <circle cx="120" cy="60" r="2.5" fill="#E3B34C" />
        <g style={{ animation: 'flag-flap 0.6s infinite alternate ease-in-out', transformOrigin: '120px 65px' }}>
          <path d="M 120 65 L 40 65 L 40 105 L 120 105 Z" fill="#FFFFFF" />
          <text x="80" y="93" fontFamily="sans-serif" fontWeight="900" fontSize="22" fill="#111" textAnchor="middle">BAPL</text>
        </g>
      </g>

      {/* Main Hull */}
      <path d="M 110 155 L 985 155 L 945 250 L 160 250 C 140 250, 120 230, 120 200 C 115 180, 110 160, 110 155 Z" fill="url(#hull-black-grad)" />
      <path d="M 110 157 L 984 157" stroke="#E3B34C" strokeWidth="2" fill="none" />
      
      {/* Anti-fouling lower hull (Red) */}
      <path d="M 160 250 L 945 250 L 933 280 C 880 300, 220 300, 180 280 L 160 250 Z" fill="url(#hull-red-grad)" />

      {/* Ship stress crack right before splitting */}
      {isCracking && (
        <g>
          {/* Main central fracture - deep, jagged, and entirely black */}
          <path d="M 630 155 L 624 168 L 634 182 L 618 195 L 636 215 L 622 235 L 630 250" stroke="#000000" strokeWidth="5" fill="none" strokeLinejoin="miter" strokeMiterlimit="2" />
          
          {/* Secondary branching fractures */}
          <path d="M 624 168 L 610 175 L 600 190 L 605 198" stroke="#000000" strokeWidth="3" fill="none" strokeLinejoin="miter" strokeMiterlimit="2" />
          <path d="M 634 182 L 648 174 L 658 190" stroke="#000000" strokeWidth="2.5" fill="none" strokeLinejoin="miter" strokeMiterlimit="2" />
          <path d="M 618 195 L 602 210 L 592 205 L 585 215" stroke="#000000" strokeWidth="2" fill="none" strokeLinejoin="miter" strokeMiterlimit="2" />
          <path d="M 636 215 L 652 230 L 668 225 L 675 240" stroke="#000000" strokeWidth="2" fill="none" strokeLinejoin="miter" strokeMiterlimit="2" />

          {/* Micro splintering cracks for realistic detailing */}
          <path d="M 610 175 L 602 170 M 648 174 L 655 168 M 602 210 L 598 218 M 652 230 L 645 238" stroke="#000000" strokeWidth="1" fill="none" strokeLinecap="square" />
        </g>
      )}

      {/* Iceberg Damage (Hole & Bubbles) */}
      {hullBreach && (
        <g transform="translate(870, 270)">
          <path d="M 0 0 L -25 -15 M -5 0 L -15 15 M 5 -2 L 25 10 M 0 -5 L 15 -18" stroke="#3a0b0b" strokeWidth="2" fill="none" />
          <path d="M 0 0 L -15 -8 M -5 0 L -8 10 M 5 -2 L 15 5 M 0 -5 L 10 -12" stroke="#111" strokeWidth="1" fill="none" />
          <ellipse cx="0" cy="0" rx="14" ry="6" fill="#02040a" transform="rotate(-15)" />
          <ellipse cx="-8" cy="2" rx="10" ry="4" fill="#02040a" transform="rotate(10)" />
          <g>
            {Array.from({length: 12}).map((_, i) => (
              <circle 
                key={`hbl-${i}`} 
                cx={(i % 4) * 6 - 9} 
                cy={(i % 3) * 4 - 4} 
                r={Math.random() * 2.5 + 1} 
                fill="rgba(255,255,255,0.7)"
                style={{ animation: `hole-bubble ${1 + Math.random()}s infinite linear ${Math.random() * 2}s` }}
              />
            ))}
          </g>
        </g>
      )}

      <g fill="#FAD169" opacity="0.9">
        {Array.from({length: 70}).map((_, i) => (
          <circle key={`ph1-${i}`} cx={140 + i * 11} cy="175" r="2.5" />
        ))}
        {Array.from({length: 35}).map((_, i) => (
          <circle key={`ph2-${i}`} cx={170 + i * 22} cy="200" r="2.5" />
        ))}
      </g>

      {/* Propellers */}
      <g transform="translate(130, 270)">
        <path d="M -10 -5 L 10 -5 L 5 15 L -5 15 Z" fill="#555" />
        <g style={{ animation: isNeutral || isSplit ? 'none' : `prop-spin ${isProfit ? '0.1s' : '2s'} infinite linear`, transformOrigin: '0px 10px' }}>
          <ellipse cx="0" cy="10" rx="14" ry="4" fill="#99632D" transform="rotate(-45 0 10)" />
          <ellipse cx="0" cy="10" rx="14" ry="4" fill="#99632D" transform="rotate(45 0 10)" />
          <ellipse cx="0" cy="10" rx="14" ry="4" fill="#99632D" transform="rotate(0 0 10)" />
        </g>
        <circle cx="0" cy="10" r="3" fill="#66421E" />
      </g>
    </>
  );

  return (
    <div className="w-full flex flex-col gap-3">
      <div className={`w-full relative min-h-[360px] sm:min-h-[420px] aspect-[4/3.8] sm:aspect-[4/3] md:aspect-auto md:h-[500px] shadow-none border-none overflow-hidden ${isDay ? 'bg-[#e0f7fa]' : 'bg-[#050A15]'}`}>
      
      <style>{`
        @keyframes ship-bob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes wave-flow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-400px); }
        }
        @keyframes star-move {
          0% { transform: translateX(0); }
          100% { transform: translateX(-8000px); }
        }
        @keyframes prop-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes water-splash {
          0% { opacity: 0; transform: scale(0.5) translate(0, 0); }
          20% { opacity: 1; }
          100% { opacity: 0; transform: scale(3.5) translate(-100px, -40px); }
        }
        @keyframes funnel-smoke {
          0% { opacity: 0.9; transform: translate(0, 0) scale(0.5); }
          100% { opacity: 0; transform: translate(var(--drift-x, -300px), var(--drift-y, -60px)) scale(var(--scale-to, 5)); }
        }
        @keyframes star-twinkle {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 1; }
        }
        @keyframes flag-flap {
          0% { transform: scaleX(1) skewY(2deg); }
          100% { transform: scaleX(0.8) skewY(-6deg); }
        }
        @keyframes hole-bubble {
          0% { transform: translate(0, 0) scale(0.5); opacity: 0; }
          20% { opacity: 0.8; }
          100% { transform: translate(-20px, -60px) scale(1.5); opacity: 0; }
        }
        @keyframes window-flicker-out {
          0%, 20%, 40%, 60% { fill: #FAD169; }
          10%, 30%, 50% { fill: #222; }
          100% { fill: #222; }
        }
        @keyframes jelly-float {
          0%, 100% { transform: translate(0, 0) rotate(-5deg); }
          50% { transform: translate(60px, -150px) rotate(5deg); }
        }
        @keyframes jelly-pulse {
          0%, 100% { transform: scale(1, 1); }
          50% { transform: scale(1.1, 0.9); }
        }
        @keyframes shooting-star {
          0% { opacity: 0; transform: translate(200px, -200px); }
          10% { opacity: 1; }
          20% { opacity: 0; transform: translate(-200px, 200px); }
          100% { opacity: 0; transform: translate(-200px, 200px); }
        }
        @keyframes seaweed-sway {
          0% { transform: translateX(-8px) skewX(2deg); }
          100% { transform: translateX(8px) skewX(-2deg); }
        }
        @keyframes fish-swim-left {
          0% { transform: translateX(1800px); }
          100% { transform: translateX(-800px); }
        }
        @keyframes fish-swim-right {
          0% { transform: translateX(-800px); }
          100% { transform: translateX(1800px); }
        }
      `}</style>

      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${isDay ? 'from-[#4fc3f7] via-[#29b6f6] to-[#0288d1]' : 'from-[#02050A] via-[#050A15] to-[#121B2A]'} z-0`} />

      {/* Desktop Status Text Overlay (Hidden on Mobile) */}
      <div className="hidden md:block absolute bottom-6 left-6 z-20 right-6">
        <h2 
          className="drop-shadow-lg tracking-wide font-medium whitespace-nowrap"
          style={{ fontSize: '1.25rem', color: isDay ? '#01579b' : 'white' }}
        >
          {isProfit && "🔥 Full Steam Ahead!"}
          {isNeutral && "⚓ Anchored in Calm Waters."}
          {isLoss && "⚠️ Mayday! We are sinking! We need profits to float."}
        </h2>
      </div>

      {/* SVG Container */}
      {/* 1200x1340 viewBox with top headroom. Uses 'meet' to scale correctly on all devices */}
      <svg width="100%" height="100%" viewBox="0 -140 1200 1340" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 z-10 overflow-visible">
        
        {/* SVG Clip Paths for Shattering */}
        <defs>
          <clipPath id="clip-stern">
            <rect x="-1000" y="-1000" width="1630" height="2000" />
          </clipPath>
          <clipPath id="clip-bow">
            <rect x="630" y="-1000" width="2000" height="2000" />
          </clipPath>
          <linearGradient id="shooting-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          
          {/* Metallic Gradients for Ship */}
          <linearGradient id="funnel-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b37a34" />
            <stop offset="30%" stopColor="#F5B762" />
            <stop offset="70%" stopColor="#f3c482" />
            <stop offset="100%" stopColor="#8c581a" />
          </linearGradient>
          <linearGradient id="funnel-top-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#050505" />
            <stop offset="40%" stopColor="#333" />
            <stop offset="60%" stopColor="#444" />
            <stop offset="100%" stopColor="#000" />
          </linearGradient>
          <linearGradient id="hull-black-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3a3a3a" />
            <stop offset="30%" stopColor="#1a1a1a" />
            <stop offset="80%" stopColor="#0a0a0a" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>
          <linearGradient id="hull-white-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#e5e7eb" />
            <stop offset="100%" stopColor="#9ca3af" />
          </linearGradient>
          <linearGradient id="hull-red-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8a2525" />
            <stop offset="40%" stopColor="#5c1515" />
            <stop offset="100%" stopColor="#2e0707" />
          </linearGradient>
          <linearGradient id="mast-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c5baa6" />
            <stop offset="50%" stopColor="#e5dfd3" />
            <stop offset="100%" stopColor="#7a6e5a" />
          </linearGradient>
        </defs>
        
        {/* Night Sky Stars / Day Sky Sun */}
        <g className="origin-center scale-[1.1] md:scale-100 transition-transform duration-500" style={{ transformOrigin: '600px 600px' }}>
          {isDay ? (
            <g style={{ animation: isProfit ? 'star-move 40s infinite linear' : 'none' }}>
              <g>
                <circle cx="-100" cy="150" r="40" fill="#fbc531" />
                {Array.from({length: 20}).map((_, i) => {
                  const x = i * 400 - 4000;
                  return <path key={`cloud-${i}`} d={`M ${x} ${100 + (i % 3) * 50} Q ${x + 50} ${80 + (i % 3) * 50} ${x + 100} ${100 + (i % 3) * 50} Q ${x + 150} ${90 + (i % 3) * 50} ${x + 200} ${110 + (i % 3) * 50} L ${x} ${110 + (i % 3) * 50} Z`} fill="rgba(255,255,255,0.7)" />
                })}
              </g>
              <g transform="translate(8000, 0)">
                <circle cx="-100" cy="150" r="40" fill="#fbc531" />
                {Array.from({length: 20}).map((_, i) => {
                  const x = i * 400 - 4000;
                  return <path key={`cloud2-${i}`} d={`M ${x} ${100 + (i % 3) * 50} Q ${x + 50} ${80 + (i % 3) * 50} ${x + 100} ${100 + (i % 3) * 50} Q ${x + 150} ${90 + (i % 3) * 50} ${x + 200} ${110 + (i % 3) * 50} L ${x} ${110 + (i % 3) * 50} Z`} fill="rgba(255,255,255,0.7)" />
                })}
              </g>
            </g>
          ) : (
            <g style={{ animation: isProfit ? 'star-move 20s infinite linear' : 'none' }}>
            <g>
            {renderMoonGroup()}
            {stars.map((star, i) => (
              <circle 
                key={`s1-${i}`} 
                cx={star.cx} 
                cy={star.cy} 
                r={star.r} 
                fill="#FFFFFF" 
                opacity={star.opacity}
                style={isMobile ? undefined : { animation: `star-twinkle ${star.duration}s infinite ease-in-out ${star.delay}s` }}
              />
            ))}
          </g>
          {/* Duplicate for seamless looping */}
          <g transform="translate(8000, 0)">
            {renderMoonGroup()}
            {stars.map((star, i) => (
              <circle 
                key={`s2-${i}`} 
                cx={star.cx} 
                cy={star.cy} 
                r={star.r} 
                fill="#FFFFFF" 
                opacity={star.opacity}
                style={isMobile ? undefined : { animation: `star-twinkle ${star.duration}s infinite ease-in-out ${star.delay}s` }}
              />
            ))}
          </g>
        </g>
        )}

        {/* Global Shift to center the scene */}
        <g transform="translate(0, 360)">
          
          <rect x="-4000" y="210" width="8000" height="1200" fill={isDay ? "#01579b" : "#0c1627"} />

          {/* Back Wave details - Speeds up in Profit mode! */}
          <g transform="translate(0, 200)">
            <g style={{ animation: `wave-flow ${isProfit ? '1.5s' : '4s'} infinite linear` }}>
              <path d={wavePath} fill={isDay ? "#0277bd" : "#13243f"} />
            </g>
          </g>

          {/* SHIP RENDERING LOGIC */}
          <g>
            {/* Render Exhaust Smoke ONCE globally behind the ship so it isn't clipped/duplicated by the structural split */}
            <g style={backStyle}>
              {[
                { cx: 465, broken: funnel4Broken },
                { cx: 585, broken: funnel3Broken },
                { cx: 705, broken: funnel2Broken },
                { cx: 825, broken: funnel1Broken }
              ].map(({ cx, broken }, funnelIdx) => {
                if (broken) return null;
                
                // Determine smoke intensity
                const particleCount = isProfit ? 8 : 4;
                const driftX = isProfit ? -250 : -80;
                const driftY = isProfit ? -30 : -50;
                const scaleTo = isProfit ? 4 : 1.5;
                const baseOpacity = isProfit ? 0.6 : 0.3;
                const durationBase = isProfit ? 2 : 3;
                
                return (
                  <g key={`smoke-plume-${funnelIdx}`} transform={`translate(${cx}, 30)`}>
                    {Array.from({length: particleCount}).map((_, i) => (
                      <circle 
                        key={`sm-${i}`}
                        cx={(Math.random() - 0.5) * 10} 
                        cy={(Math.random() - 0.5) * 10} 
                        r={Math.random() * 4 + 6}
                        fill={`rgba(${180 + Math.random()*75}, ${180 + Math.random()*75}, ${180 + Math.random()*75}, ${baseOpacity})`}
                        style={{ 
                          '--drift-x': `${driftX - Math.random() * 30}px`,
                          '--drift-y': `${driftY - Math.random() * 20}px`,
                          '--scale-to': scaleTo + Math.random() * 1.5,
                          animation: `funnel-smoke ${durationBase + Math.random() * 1.5}s infinite ease-out ${Math.random() * -4}s` 
                        }} 
                      />
                    ))}
                  </g>
                );
              })}
            </g>

            {/* Back Half */}
            <g style={backStyle} clipPath="url(#clip-stern)">
              {renderShip()}
            </g>
            {/* Front Half */}
            <g style={frontStyle} clipPath="url(#clip-bow)">
              {renderShip()}
            </g>
            
            {/* Giant Underwater Impact Bubbles on Day 28+ */}
            {isSimulation && simDay >= 28 && (
              <g>
                 {/* Front part bubbles */}
                 <g transform="translate(1000, 950)">
                   {Array.from({length: 80}).map((_, i) => (
                     <circle 
                       key={`fb-${i}`} 
                       cx={(Math.random() - 0.5) * 400} 
                       cy={(Math.random() - 0.5) * 100} 
                       r={Math.random() * 8 + 2} 
                       fill="rgba(255, 255, 255, 0.7)"
                       style={{ animation: `hole-bubble ${1 + Math.random()}s infinite linear ${Math.random() * 2}s` }}
                     />
                   ))}
                 </g>
                 {/* Back part bubbles */}
                 <g transform="translate(100, 950)">
                   {Array.from({length: 60}).map((_, i) => (
                     <circle 
                       key={`bb-${i}`} 
                       cx={(Math.random() - 0.5) * 300} 
                       cy={(Math.random() - 0.5) * 100} 
                       r={Math.random() * 6 + 2} 
                       fill="rgba(255, 255, 255, 0.6)"
                       style={{ animation: `hole-bubble ${1.5 + Math.random()}s infinite linear ${Math.random() * 2}s` }}
                     />
                   ))}
                 </g>
              </g>
            )}
          </g>

          {/* Muddy Ocean Floor */}
          <g>
            <path d="M -4000 760 Q -2000 730 0 770 T 2000 760 T 4000 770 L 4000 1400 L -4000 1400 Z" fill={isDay ? "#d7ccc8" : "#151710"} />
            <path d="M -4000 790 Q -2000 750 0 800 T 2000 780 T 4000 790 L 4000 1400 L -4000 1400 Z" fill={isDay ? "#bcaaa4" : "#0d0f0a"} />
            
            {/* Seaweed / Grass */}
            {Array.from({length: 45}).map((_, i) => {
              const xPos = -400 + Math.random() * 2000;
              const yPos = 770 + Math.random() * 50;
              return (
                <g key={`weed-${i}`}>
                  <path 
                    d={`M ${xPos} ${yPos} Q ${xPos + 15} ${yPos - 40} ${xPos - 5} ${yPos - 80} T ${xPos + 10} ${yPos - 120}`} 
                    fill="none" 
                    stroke={isDay ? "#4caf50" : "#1e2e18"} 
                    strokeWidth={Math.random() * 3 + 2} 
                    strokeLinecap="round"
                  />
                </g>
              );
            })}

            {/* Glowing Jellyfish (Night Only) */}
            {!isDay && Array.from({length: 12}).map((_, i) => {
              const x = (Math.random() * 8000) - 4000;
              const y = 900 + Math.random() * 400;
              const delay = Math.random() * -20;
              const duration = 15 + Math.random() * 10;
              const scale = Math.random() * 0.5 + 0.5;
              const colorBase = Math.random() > 0.5 ? "0, 255, 255" : "255, 0, 255";
              
              return (
                <g key={`jelly-${i}`} transform={`translate(${x}, ${y}) scale(${scale})`}>
                  <g style={{ animation: `jelly-float ${duration}s infinite ease-in-out ${delay}s` }}>
                    <g style={{ animation: `jelly-pulse 3s infinite alternate ease-in-out ${delay}s` }}>
                      {/* Dome */}
                      <path d="M -20 0 C -20 -30, 20 -30, 20 0 Z" fill={`rgba(${colorBase}, 0.5)`} style={{ filter: `drop-shadow(0 0 10px rgba(${colorBase}, 0.8))` }} />
                      <path d="M -20 0 Q -10 5 0 0 Q 10 5 20 0" fill={`rgba(${colorBase}, 0.8)`} />
                      {/* Tentacles */}
                      {Array.from({length: 6}).map((_, j) => (
                        <path key={`tent-${j}`} d={`M ${-15 + j*6} 0 Q ${-12 + j*6} 20 ${-18 + j*6} 40 T ${-15 + j*6} 80`} fill="none" stroke={`rgba(${colorBase}, 0.6)`} strokeWidth="1.5" style={{ animation: `seaweed-sway ${2 + Math.random()}s infinite alternate ease-in-out ${Math.random()}s` }} />
                      ))}
                    </g>
                  </g>
                </g>
              );
            })}
          </g>

          {/* Splashes (Only when profitable / moving) - Now massive and aggressive! */}
          {isProfit && (
            <g transform="translate(980, 250)">
              {Array.from({length: 30}).map((_, i) => (
                <circle 
                  key={`sw-${i}`} 
                  cx={(Math.random() - 0.5) * 40} 
                  cy={(Math.random() - 0.5) * 20} 
                  r={Math.random() * 6 + 3} 
                  fill="rgba(255, 255, 255, 0.8)"
                  style={{ animation: `water-splash ${1 + Math.random()}s infinite linear ${Math.random() * 1.5}s` }}
                />
              ))}
            </g>
          )}

          {/* Front Wave - Speeds up in Profit mode! */}
          <g transform="translate(0, 240)">
            <g style={{ animation: `wave-flow ${isProfit ? '1s' : '3s'} infinite linear` }}>
              <path d={frontWavePath} fill={isDay ? "rgba(3, 169, 244, 0.4)" : "rgba(28, 54, 94, 0.7)"} />
            </g>
          </g>

        </g>
        </g>
      </svg>
    </div>

    {/* Mobile Status Text Overlay (Hidden on Desktop) */}
    <div className="block md:hidden w-full text-center px-2">
      <h2 className="text-[var(--color-text-secondary)] tracking-wide font-light italic text-xs">
        {isProfit && "🔥 Full Steam Ahead!"}
        {isNeutral && "⚓ Anchored in Calm Waters."}
        {isLoss && "⚠️ Mayday! We are sinking! We need profits to float."}
      </h2>
    </div>
  </div>
  );
}
