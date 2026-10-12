"use client";

import React, { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Root layout error caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{
        backgroundColor: '#0B0F19',
        color: '#ECEEF2',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        margin: 0,
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        boxSizing: 'border-box'
      }}>
        <div style={{
          backgroundColor: '#131B2B',
          borderRadius: '24px',
          padding: '36px 28px',
          maxWidth: '380px',
          margin: '20px',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            backgroundColor: 'rgba(249, 115, 22, 0.15)',
            color: '#F97316',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            fontSize: '22px'
          }}>
            ⚡
          </div>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            margin: '0 0 8px 0',
            color: '#F0F7FF'
          }}>
            BYZID APPARELS
          </h2>
          <p style={{
            fontSize: '13px',
            color: '#94A3B8',
            lineHeight: '1.5',
            margin: '0 0 24px 0'
          }}>
            Factory telemetry connection was interrupted during reload. Tap below to reconnect.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => {
                if (reset) reset();
                else window.location.reload();
              }}
              style={{
                backgroundColor: '#F97316',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: '700',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Reconnect Now
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = '/';
              }}
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                color: '#ECEEF2',
                border: '1px solid rgba(255,255,255,0.1)',
                fontWeight: '700',
                padding: '12px 20px',
                borderRadius: '12px',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
