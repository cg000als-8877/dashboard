"use client";

export function NetworkLoader() {
  return (
    <div className="gyro-page">
      {/* Background Soft Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--color-primary)]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* 3D Gyroscopic Ring Container */}
      <div className="gyro-container">
        <div className="gyro-ring" />
        <div className="gyro-ring" />
        <div className="gyro-ring" />
        <div className="gyro-ring" />
        
        {/* Center Text */}
        <h3 className="gyro-text">
          loading
        </h3>
      </div>

      {/* 3D Gyroscopic Ring CSS matched with Website Colors */}
      <style jsx>{`
        .gyro-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
          width: 100%;
          position: relative;
          z-index: 20;
          user-select: none;
        }

        .gyro-container {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          width: 220px;
          height: 220px;
        }

        .gyro-text {
          color: var(--color-primary, #3b82f6);
          font-size: 0.85rem;
          font-weight: 900;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          position: absolute;
          z-index: 10;
          animation: pulse 1.8s ease-in-out infinite;
          filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.6));
        }

        .gyro-ring {
          width: 190px;
          height: 190px;
          border: 1px solid transparent;
          border-radius: 50%;
          position: absolute;
        }

        /* Ring 1 - Electric Blue */
        .gyro-ring:nth-child(1) {
          border-bottom: 6px solid #3b82f6;
          filter: drop-shadow(0 0 8px #3b82f6);
          animation: rotate1 2s linear infinite;
        }

        @keyframes rotate1 {
          from {
            transform: rotateX(50deg) rotateZ(110deg);
          }
          to {
            transform: rotateX(50deg) rotateZ(470deg);
          }
        }

        /* Ring 2 - Cyan Glow */
        .gyro-ring:nth-child(2) {
          border-bottom: 6px solid #06b6d4;
          filter: drop-shadow(0 0 8px #06b6d4);
          animation: rotate2 2s linear infinite;
        }

        @keyframes rotate2 {
          from {
            transform: rotateX(20deg) rotateY(50deg) rotateZ(20deg);
          }
          to {
            transform: rotateX(20deg) rotateY(50deg) rotateZ(380deg);
          }
        }

        /* Ring 3 - Neon Purple / Violet */
        .gyro-ring:nth-child(3) {
          border-bottom: 6px solid #8b5cf6;
          filter: drop-shadow(0 0 8px #8b5cf6);
          animation: rotate3 2s linear infinite;
        }

        @keyframes rotate3 {
          from {
            transform: rotateX(40deg) rotateY(130deg) rotateZ(450deg);
          }
          to {
            transform: rotateX(40deg) rotateY(130deg) rotateZ(90deg);
          }
        }

        /* Ring 4 - Sky Blue */
        .gyro-ring:nth-child(4) {
          border-bottom: 6px solid #60a5fa;
          filter: drop-shadow(0 0 8px #60a5fa);
          animation: rotate4 2s linear infinite;
        }

        @keyframes rotate4 {
          from {
            transform: rotateX(70deg) rotateZ(270deg);
          }
          to {
            transform: rotateX(70deg) rotateZ(630deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(0.96);
          }
          50% {
            opacity: 1;
            transform: scale(1.04);
          }
        }
      `}</style>
    </div>
  );
}
