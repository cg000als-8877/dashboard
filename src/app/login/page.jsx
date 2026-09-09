"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

// Faint architectural technical grid and watermarks
function IndustrialBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Deep baseline gradients */}
      <div 
        className="absolute inset-0 bg-[#060911]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 20%, rgba(30, 41, 69, 0.45) 0%, transparent 55%),
            radial-gradient(circle at 80% 80%, rgba(15, 45, 55, 0.25) 0%, transparent 45%),
            radial-gradient(circle at 20% 90%, rgba(26, 21, 55, 0.25) 0%, transparent 45%)
          `
        }}
      />

      {/* Very faint architectural blueprint grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.7) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.7) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 80%)'
        }}
      />

      {/* Faint technical watermark tokens (architectural, non-distracting) */}
      <div className="hidden lg:flex absolute inset-x-12 top-8 justify-between text-[9px] font-mono tracking-[0.3em] uppercase text-slate-500/20">
        <span>FACILITY // BAPL-OPERATIONS-HUB</span>
        <span>PRODUCTION CONTROL • QUALITY • ORDERS</span>
        <span>AUTH.GATEWAY // v4.2</span>
      </div>

      <div className="hidden lg:flex absolute inset-x-12 bottom-8 justify-between text-[9px] font-mono tracking-[0.3em] uppercase text-slate-500/20">
        <span>SECTOR: APPAREL MANUFACTURING</span>
        <span>SAMPLES • SHIPMENTS • LINES A-D</span>
        <span>SYS.STATUS // NORMAL</span>
      </div>

      {/* Soft spotlight behind the main card */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] rounded-full blur-[140px] pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.25) 0%, rgba(13, 148, 136, 0.12) 50%, transparent 70%)',
        }}
      />

      {/* Subtle vignette border */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 85% 75% at 50% 50%, transparent 45%, rgba(4, 7, 13, 0.75) 100%)'
        }}
      />
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef(null);

  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passcode.trim() || loading || success) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          const from = searchParams.get('from') || '/';
          router.replace(from);
          router.refresh();
        }, 700);
      } else {
        const data = await res.json();
        setError(data.error || 'Incorrect access code. Please try again.');
        setShake(true);
        setPasscode('');
        setTimeout(() => setShake(false), 550);
        inputRef.current?.focus();
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`transition-all duration-300 ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Passcode input field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label 
              htmlFor="access-code"
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400"
            >
              Access code
            </label>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Encrypted Session
            </span>
          </div>

          <div className="relative group">
            {/* Input icon */}
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors duration-150 group-focus-within:text-indigo-400">
              {success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
            </div>

            <input
              id="access-code"
              ref={inputRef}
              type={showPasscode ? "text" : "password"}
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                if (error) setError('');
              }}
              placeholder="Access code"
              autoComplete="current-password"
              disabled={loading || success}
              className={`
                w-full pl-10 pr-11 py-3 sm:py-3.5 rounded-xl text-sm font-medium
                bg-[#090E1A]/90 border outline-none transition-all duration-150
                placeholder:text-slate-500 placeholder:font-normal
                text-slate-100 tracking-wider font-mono
                ${error
                  ? 'border-red-500/60 focus:border-red-400 focus:ring-2 focus:ring-red-500/20 bg-red-950/10'
                  : success
                  ? 'border-emerald-500/60 bg-emerald-950/15 text-emerald-200'
                  : 'border-slate-700/60 hover:border-slate-600/80 focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 shadow-inner'
                }
              `}
            />

            {/* Visibility Toggle Button */}
            <button
              type="button"
              onClick={() => setShowPasscode(!showPasscode)}
              disabled={loading || success || !passcode}
              aria-label={showPasscode ? "Hide access code" : "Show access code"}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
            >
              {showPasscode ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Error message alert */}
        {error && (
          <div 
            role="alert"
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-xs font-medium animate-[fadeIn_0.2s_ease-out]"
          >
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Primary action button */}
        <button
          type="submit"
          disabled={loading || success || !passcode.trim()}
          className={`
            w-full py-3.5 px-5 rounded-xl font-medium text-sm tracking-wide transition-all duration-200
            flex items-center justify-center gap-2 relative overflow-hidden group
            focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C1222]
            ${success
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 cursor-default'
              : loading
              ? 'bg-indigo-600/70 text-white/80 cursor-wait'
              : !passcode.trim()
              ? 'bg-indigo-600/40 text-slate-300/60 cursor-not-allowed border border-indigo-500/20'
              : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white active:scale-[0.99] shadow-lg shadow-indigo-950/60 border border-indigo-400/20'
            }
          `}
        >
          {success ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white animate-pulse" />
              <span>Access Granted — Opening Portal</span>
            </>
          ) : loading ? (
            <>
              <svg className="w-4 h-4 animate-spin text-white/80" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <>
              <span>Access Dashboard</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      {/* Supporting text */}
      <div className="text-center mt-3.5 space-y-0.5">
        <p className="text-xs text-slate-400 font-medium">
          Authorized personnel only
        </p>
        <p className="text-[11px] text-slate-400">
          Session remains active for 7 days.
        </p>
      </div>

      {/* System status strip */}
      <div className="mt-6 pt-4 border-t border-slate-800/70 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-30" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="font-semibold tracking-wider text-emerald-400 text-[10px] uppercase">
            System Operational
          </span>
        </div>
        <span className="text-slate-400 text-[11px] font-medium tracking-tight">
          Secure Operations Environment
        </span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative bg-[#060911] px-4 py-8 sm:py-12 overflow-x-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <IndustrialBackground />

      {/* Main card container */}
      <div className="relative z-10 w-full max-w-[440px] transition-all duration-300">
        <div
          className="rounded-2xl border border-slate-700/40 overflow-hidden shadow-2xl transition-all"
          style={{
            background: 'linear-gradient(180deg, rgba(17, 24, 39, 0.78) 0%, rgba(11, 17, 30, 0.88) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 24px 60px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
          }}
        >
          {/* Top subtle gradient accent line */}
          <div
            className="h-[2px] w-full"
            style={{
              background: 'linear-gradient(90deg, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0.9) 35%, rgba(20,184,166,0.85) 75%, rgba(20,184,166,0.1) 100%)',
            }}
          />

          <div className="p-6 sm:p-8">
            {/* Brand Header */}
            <div className="text-center mb-6">
              {/* Apparel manufacturing crest icon */}
              <div
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mx-auto mb-3.5 border border-indigo-500/20 shadow-lg shadow-indigo-950/40 relative group"
                style={{
                  background: 'linear-gradient(145deg, rgba(30, 41, 69, 0.85) 0%, rgba(17, 24, 39, 0.95) 100%)',
                }}
              >
                {/* Subtle internal ring */}
                <div className="absolute inset-0.5 rounded-[10px] border border-white/[0.06] pointer-events-none" />

                {/* Refined apparel factory crest */}
                <svg
                  className="w-7 h-7 text-indigo-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 3h12l3 6-5 3-1-3H9L8 12 3 9l3-6z" />
                  <path d="M9 12v9h6v-9" />
                  <path d="M12 3v5" />
                  <circle cx="12" cy="15" r="0.75" fill="currentColor" stroke="none" />
                  <circle cx="12" cy="18" r="0.75" fill="currentColor" stroke="none" />
                </svg>
              </div>

              {/* Exact required copy */}
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Welcome Back
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 font-medium">
                Sign in to your operations workspace
              </p>
              <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-slate-800/60 border border-slate-700/50 text-[11px] font-medium text-slate-300">
                <span>Byzid Apparels (Pvt) Ltd</span>
              </div>
            </div>

            {/* Divider with requested section title */}
            <div className="flex items-center gap-2.5 mb-5">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-slate-400 shrink-0">
                Secure Operations Access
              </span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* Security notice box (Restrained enterprise component) */}
            <div
              className="rounded-xl p-3.5 sm:p-4 mb-5 border border-amber-500/20 bg-amber-500/[0.03] text-left transition-colors"
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 p-1 rounded-md bg-amber-500/10 text-amber-400 shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xs font-semibold text-amber-200 tracking-tight">
                    Private Operations Portal
                  </h2>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    This workspace is restricted to authorized Byzid Apparels personnel. Your access code protects confidential production and business information.
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive login form wrapped in Suspense for useSearchParams */}
            <Suspense fallback={<div className="h-40 animate-pulse bg-slate-800/20 rounded-xl" />}>
              <LoginForm />
            </Suspense>
          </div>
        </div>

        {/* Understated Footer */}
        <footer className="text-center mt-6">
          <p className="text-xs text-slate-400 font-medium">
            Byzid Apparels (Pvt) Ltd · Factory Operations
          </p>
        </footer>
      </div>

      {/* Reduced-motion compliant shake animation */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse,
          .animate-ping,
          .animate-spin {
            animation: none !important;
          }
        }
      `}</style>
    </main>
  );
}
