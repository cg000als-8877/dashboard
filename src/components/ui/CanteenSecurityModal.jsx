"use client";

import { useState } from 'react';
import { Coffee, ShieldAlert, CheckCircle2, X, Lock, ArrowRight, RotateCcw } from 'lucide-react';
import { cn } from '@/components/layout/Sidebar';

const CANTEEN_OPTIONS = [900, 1000, 1200, 1500, 1800];
const CORRECT_ANSWER = 1200;

export function CanteenSecurityModal({ isOpen, onClose, onRedirectHome }) {
  const [step, setStep] = useState('initial'); // 'initial' | 'challenge' | 'failed'
  const [selectedCharge, setSelectedCharge] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleInitialYes = () => {
    setSelectedCharge(null);
    setErrorMessage('');
    setStep('challenge');
  };

  const handleInitialNo = () => {
    onClose();
    if (onRedirectHome) onRedirectHome();
  };

  const handleChallengeSubmit = () => {
    if (!selectedCharge) {
      setErrorMessage('Please select an amount to continue.');
      return;
    }

    if (Number(selectedCharge) === CORRECT_ANSWER) {
      // Correct answer: Open Canteen portal and close
      setStep('initial');
      onClose();
      window.open('https://baplc.vercel.app', '_blank', 'noopener,noreferrer');
    } else {
      // Wrong answer: Trigger "You Lied!" wicked laughing animation
      setStep('failed');
    }
  };

  const handleReset = () => {
    setSelectedCharge(null);
    setErrorMessage('');
    setStep('challenge');
  };

  const handleFullClose = () => {
    setStep('initial');
    setSelectedCharge(null);
    setErrorMessage('');
    onClose();
  };

  return (
    <>
      {/* Dark Blur Backdrop */}
      <div 
        className="fixed inset-0 z-[110] bg-black/75 backdrop-blur-md animate-[fade-in_0.2s_ease-out_both]"
        onClick={handleFullClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center z-[120] p-4 pointer-events-none">
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] w-full max-w-sm rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] p-6 flex flex-col items-center text-center pointer-events-auto relative overflow-hidden animate-[fade-down_0.25s_cubic-bezier(0.16,1,0.3,1)_both]">
          
          {/* Close button */}
          <button
            onClick={handleFullClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          {/* ══════════════════════════════════════════════════════════
              STEP 1: Initial Membership Question
             ══════════════════════════════════════════════════════════ */}
          {step === 'initial' && (
            <div className="flex flex-col items-center gap-4 w-full animate-[fade-in_0.2s_ease-out]">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shadow-inner mt-1">
                <Coffee size={26} className="drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/90">
                  Verification Required
                </span>
                <h3 className="text-base font-extrabold text-[var(--color-text-main)] tracking-wide">
                  BAPL Canteen Entry
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed px-2 font-medium">
                  Are you a member of the BAPL Canteen?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full mt-3">
                <button
                  onClick={handleInitialYes}
                  className="py-2.5 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-[var(--color-on-primary)] font-bold text-xs transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Yes, I am</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  onClick={handleInitialNo}
                  className="py-2.5 px-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] font-bold text-xs transition-all active:scale-95 cursor-pointer"
                >
                  No
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              STEP 2: Security Challenge (5 Radio Options)
             ══════════════════════════════════════════════════════════ */}
          {step === 'challenge' && (
            <div className="flex flex-col items-center gap-3.5 w-full animate-[fade-in_0.2s_ease-out]">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner mt-1">
                <Lock size={22} className="drop-shadow-[0_0_8px_rgba(129,140,248,0.4)]" />
              </div>

              <div className="space-y-1">
                <span className="text-[9.5px] font-black uppercase tracking-[0.2em] text-indigo-400">
                  Security Question
                </span>
                <h3 className="text-sm font-bold text-[var(--color-text-main)] leading-snug px-1">
                  So, tell me how much canteen charges per month?
                </h3>
              </div>

              {/* 5 Radio Option Cards */}
              <div className="w-full space-y-1.5 my-1">
                {CANTEEN_OPTIONS.map((amount) => {
                  const isSelected = selectedCharge === amount;
                  return (
                    <label
                      key={amount}
                      onClick={() => {
                        setSelectedCharge(amount);
                        setErrorMessage('');
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all duration-150 cursor-pointer select-none",
                        isSelected
                          ? "bg-[var(--color-primary)]/15 border-[var(--color-primary)] text-[var(--color-text-main)] shadow-[0_0_12px_var(--color-primary-glow)] font-bold"
                          : "bg-[var(--color-surface)]/70 border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-main)]"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                          isSelected
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)] shadow-sm"
                            : "border-[var(--color-text-muted)]/50 bg-transparent"
                        )}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-on-primary)]" />}
                        </div>
                        <span className="font-mono text-sm tracking-wide">BDT {amount}</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-bold">
                        / month
                      </span>
                    </label>
                  );
                })}
              </div>

              {errorMessage && (
                <p className="text-[11px] text-rose-400 font-semibold animate-[shake_0.3s_ease-in-out]">
                  {errorMessage}
                </p>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 w-full mt-1">
                <button
                  onClick={() => setStep('initial')}
                  className="py-2.5 px-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] font-bold text-xs transition-all active:scale-95 cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleChallengeSubmit}
                  className="py-2.5 px-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-[var(--color-on-primary)] font-bold text-xs transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Submit</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              STEP 3: "YOU LIED!" Wicked Laughing 3D Animated Emoji Pop-up
             ══════════════════════════════════════════════════════════ */}
          {step === 'failed' && (
            <div className="flex flex-col items-center gap-3 w-full animate-[pop-in_0.35s_cubic-bezier(0.34,1.56,0.64,1)_both]">
              
              {/* 3D Wicked Laughing & Finger Pointing Animated Illustration */}
              <div className="relative w-28 h-28 flex items-center justify-center my-1 select-none">
                {/* Sinister Aura Glow */}
                <div className="absolute inset-0 rounded-full bg-rose-600/25 blur-xl animate-pulse" />
                <div className="absolute inset-2 rounded-full bg-amber-500/20 blur-lg animate-ping opacity-60" />

                {/* SVG 3D Wicked Laughing Face with Pointing Finger */}
                <svg
                  viewBox="0 0 160 160"
                  className="w-28 h-28 relative z-10 drop-shadow-[0_10px_20px_rgba(225,29,72,0.4)] animate-[wicked-laugh_0.7s_ease-in-out_infinite]"
                >
                  <defs>
                    {/* 3D Sphere Head Gradient */}
                    <radialGradient id="wickedHead3D" cx="38%" cy="30%" r="68%">
                      <stop offset="0%" stopColor="#FFF066" />
                      <stop offset="45%" stopColor="#F59E0B" />
                      <stop offset="85%" stopColor="#D97706" />
                      <stop offset="100%" stopColor="#991B1B" />
                    </radialGradient>

                    {/* Dark Mouth Depth Gradient */}
                    <radialGradient id="wickedMouth" cx="50%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#7F1D1D" />
                      <stop offset="60%" stopColor="#450A0A" />
                      <stop offset="100%" stopColor="#1C0505" />
                    </radialGradient>

                    {/* Laughing Tear Gradient */}
                    <linearGradient id="tearGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#67E8F9" />
                      <stop offset="100%" stopColor="#0284C7" />
                    </linearGradient>

                    {/* 3D Pointing Finger Gradient */}
                    <linearGradient id="finger3D" x1="0%" y1="30%" x2="100%" y2="70%">
                      <stop offset="0%" stopColor="#FDE047" />
                      <stop offset="50%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#B45309" />
                    </linearGradient>
                  </defs>

                  {/* 1. Sphere Head with 3D shadow */}
                  <circle cx="70" cy="70" r="54" fill="url(#wickedHead3D)" />

                  {/* Wicked Sinister Eyebrows (Sharp Angular Slant) */}
                  <path
                    d="M36 44 Q 52 50 62 40"
                    stroke="#450A0A"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M104 44 Q 88 50 78 40"
                    stroke="#450A0A"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Wicked Laughing Eyes (Squinting closed arcs with devilish tilt) */}
                  <path
                    d="M38 56 Q 52 46 64 56"
                    stroke="#310505"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M76 56 Q 88 46 102 56"
                    stroke="#310505"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Huge Wicked Laughing Open Mouth */}
                  <path
                    d="M40 76 Q 70 66 100 76 Q 70 118 40 76 Z"
                    fill="url(#wickedMouth)"
                    stroke="#310505"
                    strokeWidth="2.5"
                  />

                  {/* Top Sharp Teeth */}
                  <path
                    d="M46 75 L 53 81 L 60 75 L 70 82 L 80 75 L 87 81 L 94 75"
                    fill="#FFFFFF"
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />

                  {/* Tongue Bouncing */}
                  <ellipse cx="70" cy="100" rx="14" ry="9" fill="#F43F5E" />

                  {/* Laughing Tears Spouting */}
                  <path
                    d="M32 58 Q 24 50 26 42 Q 36 46 32 58 Z"
                    fill="url(#tearGrad)"
                    className="animate-bounce"
                  />
                  <path
                    d="M108 58 Q 116 50 114 42 Q 104 46 108 58 Z"
                    fill="url(#tearGrad)"
                    className="animate-bounce"
                  />

                  {/* 3D Animated Finger Pointing Directly at Viewer */}
                  <g className="animate-[finger-point_0.7s_ease-in-out_infinite]">
                    {/* Hand Wrist/Base */}
                    <circle cx="120" cy="115" r="16" fill="url(#finger3D)" stroke="#92400E" strokeWidth="2" />
                    {/* Main Extended Pointing Finger */}
                    <path
                      d="M110 110 L 146 122 Q 154 126 148 132 L 114 124 Z"
                      fill="url(#finger3D)"
                      stroke="#92400E"
                      strokeWidth="2"
                    />
                    {/* Folded Thumb & Fingers */}
                    <ellipse cx="114" cy="106" rx="6" ry="4" fill="#D97706" />
                    <ellipse cx="110" cy="118" rx="6" ry="4" fill="#B45309" />
                    {/* Pointing Index Fingertip highlight */}
                    <circle cx="148" cy="126" r="4.5" fill="#FEF08A" />
                  </g>
                </svg>
              </div>

              {/* "YOU LIED!" Headline with glowing fiery wicked styling */}
              <div className="space-y-1">
                <div className="inline-block px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 font-black text-[10px] tracking-[0.25em] uppercase shadow-[0_0_12px_rgba(244,63,94,0.4)]">
                  Caught Red-Handed
                </div>
                <h3 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-amber-400 to-rose-600 animate-pulse uppercase">
                  You lied!
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed px-3 font-medium">
                  Wrong answer! Only real BAPL Canteen members know the exact monthly charge.
                </p>
              </div>

              {/* Try Again / Exit buttons */}
              <div className="grid grid-cols-2 gap-2.5 w-full mt-2">
                <button
                  onClick={handleReset}
                  className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-xs transition-all active:scale-95 shadow-[0_0_15px_rgba(244,63,94,0.4)] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Try Again</span>
                </button>
                <button
                  onClick={handleFullClose}
                  className="py-2.5 px-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] font-bold text-xs transition-all active:scale-95 cursor-pointer"
                >
                  Exit
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
