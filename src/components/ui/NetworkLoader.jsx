"use client";

export function NetworkLoader() {
  return (
    <div className="loader-wrapper">
      {/* Background Soft Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[var(--color-primary)]/15 rounded-full blur-[90px] pointer-events-none" />

      {/* Hourglass SVG Loader */}
      <svg className="loader" viewBox="0 0 52 52">
        <g className="loader__model">
          {/* Motion lines */}
          <path
            className="loader__motion-thin"
            d="M26,2 A24,24 0 1,1 26,50 A24,24 0 1,1 26,2"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="1.5"
            strokeDasharray="153.94 153.94"
            opacity="0.4"
          />
          <path
            className="loader__motion-medium"
            d="M26,2 A24,24 0 1,1 26,50 A24,24 0 1,1 26,2"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2.5"
            strokeDasharray="153.94 153.94"
            opacity="0.7"
          />
          <path
            className="loader__motion-thick"
            d="M26,2 A24,24 0 1,1 26,50 A24,24 0 1,1 26,2"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="4"
            strokeDasharray="153.94 153.94"
          />

          {/* Hourglass Body Group */}
          <g transform="translate(13.75, 9.25)">
            {/* Sand Mound Bottom */}
            <path
              className="loader__sand-mound-bottom"
              d="M3,30.5 C3,26 9.25,23.5 12.25,23.5 C15.25,23.5 21.5,26 21.5,30.5 Z"
              fill="var(--color-primary)"
            />

            {/* Sand Mound Top */}
            <path
              className="loader__sand-mound-top"
              d="M3.5,3.5 L21,3.5 C18,8 14.5,11.5 12.25,12.5 C10,11.5 6.5,8 3.5,3.5 Z"
              fill="var(--color-primary)"
            />

            {/* Sand Drop Stream */}
            <path
              className="loader__sand-drop"
              d="M12.25,12.5 L12.25,24.5"
              stroke="var(--color-primary)"
              strokeWidth="2"
              strokeDasharray="107 107"
              strokeLinecap="round"
              fill="none"
            />

            {/* Glass Frame Contour */}
            <path
              d="M2.5,2 L22,2 C22,2 22,3 20.5,5 C18.5,7.5 14,11.5 13.5,13.5 C13,15.5 13,18 13.5,19.5 C14,21.5 18.5,25.5 20.5,28 C22,30 22,31 22,31 L2.5,31 C2.5,31 2.5,30 4,28 C6,25.5 10.5,21.5 11,19.5 C11.5,18 11.5,15.5 11,13.5 C10.5,11.5 6,7.5 4,5 C2.5,3 2.5,2 2.5,2 Z"
              fill="none"
              stroke="var(--color-text-main)"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Glare Highlights */}
            <path
              className="loader__glare-top"
              d="M5.5,5 C7,3.5 10,3.5 10,3.5"
              fill="none"
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              className="loader__glare-bottom"
              d="M5.5,28.5 C7,30 10,30 10,30"
              fill="none"
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        </g>
      </svg>

      <style jsx>{`
        .loader-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 70vh;
          width: 100%;
          position: relative;
          z-index: 20;
          user-select: none;
        }

        .loader {
          --dur: 2s;
          display: block;
          margin: auto;
          width: 8em;
          height: 8em;
          filter: drop-shadow(0 0 16px var(--color-primary-glow));
        }

        @media (min-width: 768px) {
          .loader {
            width: 11em;
            height: 11em;
          }
        }

        .loader__glare-top,
        .loader__glare-bottom,
        .loader__model,
        .loader__motion-thick,
        .loader__motion-medium,
        .loader__motion-thin,
        .loader__sand-drop,
        .loader__sand-mound-top,
        .loader__sand-mound-bottom {
          animation-duration: var(--dur);
          animation-timing-function: cubic-bezier(0.83, 0, 0.17, 1);
          animation-iteration-count: infinite;
        }

        .loader__glare-top {
          animation-name: glare-top;
        }

        .loader__glare-bottom {
          animation-name: glare-bottom;
        }

        .loader__model {
          animation-name: loader-flip;
          transform-origin: 26px 26px;
        }

        .loader__motion-thick,
        .loader__motion-medium,
        .loader__motion-thin {
          transform-origin: 26px 26px;
        }

        .loader__motion-thick {
          animation-name: motion-thick;
        }

        .loader__motion-medium {
          animation-name: motion-medium;
        }

        .loader__motion-thin {
          animation-name: motion-thin;
        }

        .loader__sand-drop {
          animation-name: sand-drop;
        }

        .loader__sand-mound-top {
          animation-name: sand-mound-top;
        }

        .loader__sand-mound-bottom {
          animation-name: sand-mound-bottom;
          transform-origin: 12.25px 31.5px;
        }

        @keyframes loader-flip {
          from {
            transform: rotate(-180deg);
          }
          24%,
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes glare-top {
          from {
            stroke: rgba(255, 255, 255, 0);
          }
          24%,
          to {
            stroke: rgba(255, 255, 255, 0.8);
          }
        }

        @keyframes glare-bottom {
          from {
            stroke: rgba(255, 255, 255, 0.8);
          }
          24%,
          to {
            stroke: rgba(255, 255, 255, 0);
          }
        }

        @keyframes motion-thick {
          from {
            animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
            stroke: rgba(255, 255, 255, 0);
            stroke-dashoffset: 153.94;
            transform: rotate(0.67turn);
          }
          20% {
            animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
            stroke: var(--color-primary);
            stroke-dashoffset: 141.11;
            transform: rotate(1turn);
          }
          40%,
          to {
            stroke: rgba(255, 255, 255, 0);
            stroke-dashoffset: 153.94;
            transform: rotate(1.33turn);
          }
        }

        @keyframes motion-medium {
          from,
          8% {
            animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
            stroke: rgba(255, 255, 255, 0);
            stroke-dashoffset: 153.94;
            transform: rotate(0.5turn);
          }
          20% {
            animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
            stroke: var(--color-primary-glow, #60a5fa);
            stroke-dashoffset: 147.53;
            transform: rotate(0.83turn);
          }
          32%,
          to {
            stroke: rgba(255, 255, 255, 0);
            stroke-dashoffset: 153.94;
            transform: rotate(1.17turn);
          }
        }

        @keyframes motion-thin {
          from,
          4% {
            animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
            stroke: rgba(255, 255, 255, 0);
            stroke-dashoffset: 153.94;
            transform: rotate(0.33turn);
          }
          24% {
            animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
            stroke: var(--color-text-secondary, #9ba7b4);
            stroke-dashoffset: 134.7;
            transform: rotate(0.67turn);
          }
          44%,
          to {
            stroke: rgba(255, 255, 255, 0);
            stroke-dashoffset: 153.94;
            transform: rotate(1turn);
          }
        }

        @keyframes sand-drop {
          from,
          10% {
            animation-timing-function: cubic-bezier(0.12, 0, 0.39, 0);
            stroke-dashoffset: 1;
          }
          70%,
          to {
            stroke-dashoffset: -107;
          }
        }

        @keyframes sand-mound-top {
          from,
          10% {
            animation-timing-function: linear;
            transform: translate(0, 0);
          }
          15% {
            animation-timing-function: cubic-bezier(0.12, 0, 0.39, 0);
            transform: translate(0, 1.5px);
          }
          51%,
          to {
            transform: translate(0, 13px);
          }
        }

        @keyframes sand-mound-bottom {
          from,
          31% {
            animation-timing-function: cubic-bezier(0.61, 1, 0.88, 1);
            transform: scale(1, 0);
          }
          56%,
          to {
            transform: scale(1, 1);
          }
        }
      `}</style>
    </div>
  );
}
