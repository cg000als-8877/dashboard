"use client";

import React, { useId } from 'react';
import { cn } from '@/components/layout/Sidebar';

/**
 * 3D Zigzag Plunge / Surge Arrow
 * Inspired by financial market crash & surge graphics:
 * - Loss mode: Jagged descending zigzag plunging steep down into the floor with a 3D arrowhead & soft impact shadow.
 * - Profit mode: Jagged ascending zigzag surging rocket-high with an upward-pointing 3D arrowhead.
 */
export function Trend3DBarArrow({ isProfit = false, className = "" }) {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9]/g, '');

  const frontGradId = `frontGrad_${id}`;
  const depthGradId = `depthGrad_${id}`;
  const floorShadowId = `floorShadow_${id}`;

  return (
    <div className={cn("relative flex items-center justify-center shrink-0 select-none", className)}>
      <svg
        viewBox="0 0 100 88"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          {isProfit ? (
            <>
              {/* Profit Gradients */}
              <linearGradient id={frontGradId} x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="50%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>
              <linearGradient id={depthGradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#065F46" />
                <stop offset="100%" stopColor="#064E3B" />
              </linearGradient>
              <radialGradient id={floorShadowId} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </radialGradient>
            </>
          ) : (
            <>
              {/* Loss Gradients */}
              <linearGradient id={frontGradId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FF4D4D" />
                <stop offset="50%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#DC2626" />
              </linearGradient>
              <linearGradient id={depthGradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#991B1B" />
                <stop offset="100%" stopColor="#6B1212" />
              </linearGradient>
              <radialGradient id={floorShadowId} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
              </radialGradient>
            </>
          )}
        </defs>

        {/* Floor landing / launch shadow */}
        {isProfit ? (
          <ellipse cx="12" cy="85" rx="10" ry="3.5" fill={`url(#${floorShadowId})`} />
        ) : (
          <ellipse cx="88" cy="85" rx="11" ry="3.5" fill={`url(#${floorShadowId})`} />
        )}

        {isProfit ? (
          /* ── PROFIT: 3D ZIGZAG SURGE ARROW (Ascending) ── */
          <g
            style={{
              animation: "pulseSurgeProfit 1.8s ease-in-out infinite",
              transformOrigin: "center"
            }}
          >
            {/* 3D Under-extrusion / Depth Layer (Offset +2.5px X, +2.5px Y) */}
            <path
              d="M 6 82 L 35 56 L 43 74 L 54 50 L 68 64 Q 78 58, 83 42 L 87 24"
              stroke={`url(#${depthGradId})`}
              strokeWidth="7.5"
              strokeLinecap="square"
              strokeLinejoin="miter"
              strokeMiterlimit="4"
              transform="translate(2.5, 2.5)"
            />
            <polygon
              points="75,24 88,3 98,25"
              fill="#064E3B"
              transform="translate(2.5, 2.5)"
            />

            {/* Front Face Emerald Layer */}
            <path
              d="M 6 82 L 35 56 L 43 74 L 54 50 L 68 64 Q 78 58, 83 42 L 87 24"
              stroke={`url(#${frontGradId})`}
              strokeWidth="7"
              strokeLinecap="square"
              strokeLinejoin="miter"
              strokeMiterlimit="4"
            />

            {/* Top Gloss Highlight Edge */}
            <path
              d="M 6 80 L 35 54 L 43 72 L 54 48 L 68 62 Q 78 56, 83 40 L 87 22"
              stroke="#A7F3D0"
              strokeWidth="1.5"
              strokeLinecap="square"
              strokeLinejoin="miter"
              strokeMiterlimit="4"
              opacity="0.85"
            />

            {/* Arrowhead Front Face (Pointing Up) */}
            <polygon
              points="74,26 88,4 98,27"
              fill={`url(#${frontGradId})`}
              stroke={`url(#${frontGradId})`}
              strokeWidth="1"
              strokeLinejoin="round"
            />
            {/* Arrowhead Facet Highlight */}
            <polygon
              points="74,26 88,4 88,26.5"
              fill="#6EE7B7"
              opacity="0.75"
            />
          </g>
        ) : (
          /* ── LOSS: 3D ZIGZAG PLUNGE ARROW (Descending) ── */
          <g
            style={{
              animation: "pulsePlungeLoss 1.8s ease-in-out infinite",
              transformOrigin: "center"
            }}
          >
            {/* 3D Under-extrusion / Depth Layer (Offset +2.5px X, +2.5px Y) */}
            <path
              d="M 6 6 L 35 32 L 43 14 L 54 38 L 68 24 Q 78 30, 83 46 L 87 64"
              stroke={`url(#${depthGradId})`}
              strokeWidth="7.5"
              strokeLinecap="square"
              strokeLinejoin="miter"
              strokeMiterlimit="4"
              transform="translate(2.5, 2.5)"
            />
            <polygon
              points="75,64 88,85 98,63"
              fill="#6B1212"
              transform="translate(2.5, 2.5)"
            />

            {/* Front Face Red Layer */}
            <path
              d="M 6 6 L 35 32 L 43 14 L 54 38 L 68 24 Q 78 30, 83 46 L 87 64"
              stroke={`url(#${frontGradId})`}
              strokeWidth="7"
              strokeLinecap="square"
              strokeLinejoin="miter"
              strokeMiterlimit="4"
            />

            {/* Top Gloss Highlight Edge */}
            <path
              d="M 6 4 L 35 30 L 43 12 L 54 36 L 68 22 Q 78 28, 83 44 L 87 62"
              stroke="#FFA1A1"
              strokeWidth="1.5"
              strokeLinecap="square"
              strokeLinejoin="miter"
              strokeMiterlimit="4"
              opacity="0.8"
            />

            {/* Arrowhead Front Face (Pointing Down) */}
            <polygon
              points="74,62 88,84 98,61"
              fill={`url(#${frontGradId})`}
              stroke={`url(#${frontGradId})`}
              strokeWidth="1"
              strokeLinejoin="round"
            />
            {/* Arrowhead Facet Highlight */}
            <polygon
              points="74,62 88,84 88,61.5"
              fill="#FF6B6B"
              opacity="0.7"
            />
          </g>
        )}
      </svg>
    </div>
  );
}

// Export both names for convenience
export const ZigzagTrendArrow = Trend3DBarArrow;
