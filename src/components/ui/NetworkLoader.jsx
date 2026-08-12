"use client";

export function NetworkLoader() {
  return (
    <div className="seesaw-wrapper">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[var(--color-primary)]/15 rounded-full blur-[90px] pointer-events-none" />

      {/* Seesaw Ball Loader */}
      <div className="seesaw-box">
        <div className="bar">
          <div className="ball" />
        </div>
      </div>

      <style jsx>{`
        .seesaw-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 65vh;
          width: 100%;
          position: relative;
          z-index: 20;
          user-select: none;
        }

        .seesaw-box {
          position: relative;
          width: 220px;
          height: 120px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .bar {
          width: 200px;
          height: 12.5px;
          background: linear-gradient(90deg, var(--color-primary, #4F8CFF), #60a5fa);
          border-radius: 30px;
          transform: rotate(-15deg);
          animation: up-down6123 3s ease-in-out 1s infinite alternate;
          box-shadow: 0 0 16px var(--color-primary-glow, rgba(79, 140, 255, 0.4));
          position: relative;
        }

        .ball {
          position: absolute;
          bottom: 12px;
          left: calc(100% - 36px);
          width: 40px;
          height: 40px;
          background: #ffffff;
          border-radius: 50%;
          animation: ball-move8234 3s ease-in-out 1s infinite alternate;
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.8), 0 0 25px var(--color-primary-glow, rgba(79, 140, 255, 0.6));
        }

        .ball::after {
          position: absolute;
          content: '';
          top: 20px;
          right: 5px;
          width: 5px;
          height: 5px;
          background: #0B0F17;
          border-radius: 50%;
        }

        @keyframes up-down6123 {
          from {
            transform: rotate(-15deg);
          }
          to {
            transform: rotate(15deg);
          }
        }

        @keyframes ball-move8234 {
          from {
            left: calc(100% - 36px);
            transform: rotate(360deg);
          }
          to {
            left: calc(0% - 4px);
            transform: rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
}
