const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Byzid Apparels - System Architecture & Construction Blueprint</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

    @page {
      size: A4 portrait;
      margin: 10mm 12mm 10mm 12mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #0F172A;
      background: #FFFFFF;
      line-height: 1.45;
      font-size: 11px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 100%;
      min-height: 275mm;
      position: relative;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding-bottom: 8mm;
    }

    .page:last-child {
      page-break-after: avoid;
    }

    /* Header Bar */
    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0F172A;
      padding-bottom: 8px;
      margin-bottom: 14px;
    }

    .doc-header .logo-area {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .logo-badge {
      background: #0F172A;
      color: #FFFFFF;
      font-weight: 800;
      font-size: 10px;
      padding: 4px 8px;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }

    .doc-title {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: -0.3px;
      color: #0F172A;
      text-transform: uppercase;
    }

    .doc-subtitle {
      font-size: 9px;
      color: #64748B;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .doc-meta {
      text-align: right;
      font-size: 8.5px;
      color: #64748B;
      font-family: 'JetBrains Mono', monospace;
    }

    .doc-meta span {
      color: #F97316;
      font-weight: 700;
    }

    /* Footer */
    .doc-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #E2E8F0;
      padding-top: 6px;
      font-size: 8px;
      color: #94A3B8;
      font-family: 'JetBrains Mono', monospace;
    }

    /* Headings */
    h2 {
      font-size: 13px;
      font-weight: 800;
      color: #0F172A;
      text-transform: uppercase;
      letter-spacing: 0.2px;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    h2 .bar {
      width: 4px;
      height: 13px;
      background: #F97316;
      border-radius: 2px;
      display: inline-block;
    }

    h3 {
      font-size: 10.5px;
      font-weight: 700;
      color: #1E293B;
      margin-bottom: 4px;
    }

    p {
      color: #334155;
      margin-bottom: 8px;
      font-size: 10px;
      line-height: 1.45;
    }

    /* Grid Layouts */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 10px;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
      margin-bottom: 10px;
    }

    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 10px;
    }

    /* Card Containers */
    .card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 8px 10px;
    }

    .card-dark {
      background: #0B1120;
      border: 1px solid #1E293B;
      border-radius: 8px;
      padding: 8px 10px;
      color: #F8FAFC;
    }

    .card-dark p {
      color: #94A3B8;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9px;
      margin-bottom: 8px;
    }

    th {
      background: #F1F5F9;
      color: #0F172A;
      font-weight: 700;
      text-align: left;
      padding: 4px 6px;
      border: 1px solid #CBD5E1;
      font-family: 'JetBrains Mono', monospace;
      text-transform: uppercase;
      font-size: 8px;
    }

    td {
      padding: 4px 6px;
      border: 1px solid #E2E8F0;
      color: #334155;
    }

    tr:nth-child(even) td {
      background: #F8FAFC;
    }

    .badge {
      display: inline-block;
      padding: 1px 5px;
      border-radius: 4px;
      font-size: 8px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      text-transform: uppercase;
    }

    .badge-orange { background: #FFEDD5; color: #C2410C; }
    .badge-blue { background: #DBEAFE; color: #1D4ED8; }
    .badge-green { background: #DCFCE7; color: #15803D; }
    .badge-purple { background: #F3E8FF; color: #7E22CE; }
    .badge-slate { background: #E2E8F0; color: #475569; }

    /* Flowchart Container */
    .flowchart-box {
      background: #080D1A;
      border: 1px solid #1E293B;
      border-radius: 10px;
      padding: 12px 10px;
      margin-bottom: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .flowchart-title {
      color: #F8FAFC;
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #1E293B;
      padding-bottom: 5px;
    }

    .flowchart-title span.tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 7.5px;
      padding: 2px 6px;
      border-radius: 4px;
      background: #F97316;
      color: #FFFFFF;
      font-weight: 700;
    }

    /* Diagram Nodes & Connectors */
    .diagram-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 7px 0;
      position: relative;
    }

    .node {
      background: #0F172A;
      border: 1px solid #334155;
      border-radius: 6px;
      padding: 5px 8px;
      font-size: 8.5px;
      color: #E2E8F0;
      text-align: center;
      position: relative;
      flex: 1;
      max-width: 140px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    }

    .node.primary {
      border-color: #F97316;
      background: rgba(249, 115, 22, 0.12);
      color: #FED7AA;
      font-weight: 700;
    }

    .node.accent {
      border-color: #38BDF8;
      background: rgba(56, 189, 248, 0.12);
      color: #BAE6FD;
      font-weight: 700;
    }

    .node.success {
      border-color: #34D399;
      background: rgba(52, 211, 153, 0.12);
      color: #A7F3D0;
      font-weight: 700;
    }

    .node.warning {
      border-color: #FBBF24;
      background: rgba(251, 191, 36, 0.12);
      color: #FDE68A;
      font-weight: 700;
    }

    .arrow-right {
      color: #64748B;
      font-size: 11px;
      padding: 0 4px;
      font-weight: 900;
      flex-shrink: 0;
    }

    .code-block {
      background: #0B1120;
      color: #93C5FD;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8px;
      padding: 6px 8px;
      border-radius: 6px;
      border: 1px solid #1E293B;
      margin-bottom: 8px;
      white-space: pre-wrap;
      line-height: 1.4;
    }

    .tree-view {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8px;
      color: #334155;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      padding: 6px 8px;
      line-height: 1.45;
    }

    .tree-view span.dir { color: #2563EB; font-weight: 700; }
    .tree-view span.file { color: #0F172A; }
    .tree-view span.desc { color: #64748B; font-style: italic; }
  </style>
</head>
<body>

  <!-- ==================== PAGE 1 ==================== -->
  <div class="page">
    <div>
      <div class="doc-header">
        <div class="logo-area">
          <div class="logo-badge">BYZID</div>
          <div>
            <div class="doc-title">Factory Operations Dashboard</div>
            <div class="doc-subtitle">Architecture & Construction Details for AI Platforms</div>
          </div>
        </div>
        <div class="doc-meta">
          BYZID APPARELS (PVT) LTD<br>
          SYS: <span>v8.2.0-PROD</span> · DOC: <span>ARCH-2026-BAPL</span>
        </div>
      </div>

      <h2><span class="bar"></span>1. Executive System Profile & Architectural Overview</h2>
      <p>
        The <strong>Byzid Apparels Factory Operations Platform</strong> is a high-performance, real-time industrial production and financial telemetry dashboard engineered for high-volume apparel manufacturing. It ingests floor metrics, worker counts, hourly outputs, and financial contribution margins (CM), performing automated analytics, live projections, multi-month archival backups, and enterprise-grade role-based access control.
      </p>

      <div class="grid-2">
        <div class="card">
          <h3>Core Technical Specifications</h3>
          <table>
            <tr><th>Attribute</th><th>Specification</th></tr>
            <tr><td><strong>Core Framework</strong></td><td>Next.js 16.2.10 (Turbopack, App Router, SSR/CSR Hybrid)</td></tr>
            <tr><td><strong>Frontend Library</strong></td><td>React 19.2.4 (React Server & Client Components)</td></tr>
            <tr><td><strong>Styling Engine</strong></td><td>Tailwind CSS v4 + Dynamic CSS Custom Properties</td></tr>
            <tr><td><strong>Data Ingestion</strong></td><td>Live Google Sheets API (XLSX parsing) + Firebase Firestore</td></tr>
            <tr><td><strong>Mobile Runtime</strong></td><td>Capacitor 8.5.0 (Android native wrapper) + Offline PWA</td></tr>
            <tr><td><strong>Access Gateway</strong></td><td>Next.js 16 Edge Route Proxy + SHA-256 Cookie Token</td></tr>
            <tr><td><strong>Chart Engines</strong></td><td>Recharts 3.10.0 + Custom Real-Time SVG Visualizers</td></tr>
          </table>
        </div>

        <div class="card">
          <h3>Business & Manufacturing Scope</h3>
          <table>
            <tr><th>Metric</th><th>Business Implementation</th></tr>
            <tr><td><strong>Production Lines</strong></td><td>4 Active Lines (Line A: Sherpa Jackets, B & C: Boxers, D: Active)</td></tr>
            <tr><td><strong>Hourly Tracking</strong></td><td>Hours 1–11 production curve with target vs actual variance</td></tr>
            <tr><td><strong>Efficiency Model</strong></td><td>Manpower (MP) × Working Hours × SMV vs Actual Output</td></tr>
            <tr><td><strong>Quality Metric</strong></td><td>DHU % (Defects per Hundred Units) tolerance thresholding</td></tr>
            <tr><td><strong>Financial Model</strong></td><td>Contribution Margin ($/Dozen & $/Piece) and Daily Gross Earnings</td></tr>
            <tr><td><strong>Default Theme</strong></td><td>Ember Tide (Midnight Navy #070C16 × Burning Coral #F97316)</td></tr>
            <tr><td><strong>Default Mode</strong></td><td>Enforced Night (Dark) Mode with 0ms FOUC blocking script</td></tr>
          </table>
        </div>
      </div>

      <h2><span class="bar"></span>2. Complete Technology Stack Matrix</h2>
      <div class="grid-4">
        <div class="card">
          <span class="badge badge-orange">Framework & Core</span>
          <div style="font-weight:700; font-size:10px; margin:4px 0 2px;">Next.js 16 + React 19</div>
          <p style="font-size:8px; color:#64748B; margin:0;">Turbopack build system, App Router, Route Handlers, Edge Proxy middleware, Server/Client components.</p>
        </div>
        <div class="card">
          <span class="badge badge-blue">Styling & UI</span>
          <div style="font-weight:700; font-size:10px; margin:4px 0 2px;">Tailwind v4 & CSS Vars</div>
          <p style="font-size:8px; color:#64748B; margin:0;">60-30-10 color budget protocol, 8px layout grid, 14 visual themes, 9 dynamic background shaders, glassmorphism.</p>
        </div>
        <div class="card">
          <span class="badge badge-green">Data & Storage</span>
          <div style="font-weight:700; font-size:10px; margin:4px 0 2px;">SheetJS + Firebase</div>
          <p style="font-size:8px; color:#64748B; margin:0;">Buffer extraction via XLSX, automated multi-month Firestore auto-backup, local JSON archival files, SWR caching.</p>
        </div>
        <div class="card">
          <span class="badge badge-purple">Mobile & Native</span>
          <div style="font-weight:700; font-size:10px; margin:4px 0 2px;">Capacitor Android + PWA</div>
          <p style="font-size:8px; color:#64748B; margin:0;">Native APK packaging, manifest.json, service workers, install prompts, pull-to-refresh overscroll stabilization.</p>
        </div>
      </div>

      <h2><span class="bar"></span>3. Codebase Directory Map & Key File Roles</h2>
      <div class="tree-view">
        <div><span class="dir">dashboard/</span></div>
        <div>├── <span class="dir">src/app/</span> <span class="desc"># Next.js App Router root</span></div>
        <div>│   ├── <span class="file">layout.tsx</span> <span class="desc"># Root layout: font loading, ThemeProvider, head blocking script, PwaManager</span></div>
        <div>│   ├── <span class="file">page.jsx</span> <span class="desc"># Primary Executive Dashboard route (renders DashboardContent.jsx)</span></div>
        <div>│   ├── <span class="file">proxy.js</span> <span class="desc"># Next.js 16 Edge Route Proxy (auth cookie gatekeeper, redirects to /login)</span></div>
        <div>│   ├── <span class="dir">login/</span> <span class="desc"># Premium Factory Operations Portal pre-auth screen (isolated card, do1@z1a)</span></div>
        <div>│   ├── <span class="dir">hourly/</span> <span class="desc"># Real-time hourly production matrix (1ST - 11TH hours, variance calculation)</span></div>
        <div>│   ├── <span class="dir">lines/</span> <span class="desc"># Multi-line production overview (Month tabs & Density switcher on single row)</span></div>
        <div>│   │   └── <span class="dir">[id]/</span> <span class="desc"># Deep-dive line telemetry (Line A, B, C, D individual analysis)</span></div>
        <div>│   ├── <span class="dir">compare/</span> <span class="desc"># Comparative analytics (Cross-month & cross-line benchmarking)</span></div>
        <div>│   ├── <span class="dir">simulator/</span> <span class="desc"># Production output & financial CM forecasting simulator</span></div>
        <div>│   ├── <span class="dir">archive/</span> <span class="desc"># Monthly historical catalog & printable executive report generator</span></div>
        <div>│   └── <span class="dir">api/</span> <span class="desc"># Serverless API endpoints: /api/auth, /api/data, /api/hourly, /api/version</span></div>
        <div>├── <span class="dir">src/components/</span> <span class="desc"># Modular UI component architecture</span></div>
        <div>│   ├── <span class="dir">layout/</span> <span class="desc"># DashboardLayout.jsx, Sidebar.jsx (with Logout), MobileBottomNav.jsx</span></div>
        <div>│   ├── <span class="dir">providers/</span> <span class="desc"># ThemeProvider.jsx, MonthProvider.jsx, DensityProvider.jsx, ClientAutoRefresh.jsx</span></div>
        <div>│   └── <span class="dir">ui/</span> <span class="desc"># ThemePicker.jsx, DensitySwitcher.jsx, BackgroundCanvas.jsx, AppWelcomeSplash.jsx</span></div>
        <div>├── <span class="dir">src/data/</span> <span class="desc"># Ingestion data: hourly-archives/*.json, data.json, live-backup.json</span></div>
        <div>└── <span class="dir">src/utils/</span> <span class="desc"># Business logic: kpiEngine.js (all math formulas), useKpiData.js (SWR fetcher)</span></div>
      </div>
    </div>

    <div class="doc-footer">
      <div>BYZID APPARELS (PVT) LTD · SYSTEM CONSTRUCTION SPECIFICATION</div>
      <div>PAGE 1 OF 4</div>
    </div>
  </div>

  <!-- ==================== PAGE 2 ==================== -->
  <div class="page">
    <div>
      <div class="doc-header">
        <div class="logo-area">
          <div class="logo-badge">FLOWCHARTS</div>
          <div>
            <div class="doc-title">System Architecture & Access Gateway Flowcharts</div>
            <div class="doc-subtitle">Execution Pipeline & Security Control Verification</div>
          </div>
        </div>
        <div class="doc-meta">
          DOC: <span>FLOW-2026-SYS</span> · AUTH: <span>EDGE-PROXY-SHA256</span>
        </div>
      </div>

      <!-- Flowchart 1: High Level System Architecture -->
      <div class="flowchart-box">
        <div class="flowchart-title">
          <span>FLOWCHART 1: END-TO-END SYSTEM TOPOLOGY & ROUTING PIPELINE</span>
          <span class="tag">TOPOLOGY</span>
        </div>

        <div style="padding: 4px 0;">
          <div class="diagram-row">
            <div class="node primary">
              <strong>1. INCOMING REQUEST</strong><br>
              Web Browser / Android PWA
            </div>
            <div class="arrow-right">➔</div>
            <div class="node warning">
              <strong>2. NEXT.JS 16 PROXY</strong><br>
              src/proxy.js (Edge Middleware)
            </div>
            <div class="arrow-right">➔</div>
            <div class="node" style="border-color:#EC4899; background:rgba(236,72,153,0.1); color:#FBCFE8;">
              <strong>3. AUTHENTICATION GATE</strong><br>
              SHA-256 Hash Verification
            </div>
          </div>

          <div style="display:flex; justify-content:space-around; margin: 4px 0; font-size:8px; font-family:'JetBrains Mono'; color:#64748B;">
            <div style="text-align:center; width:45%;">▼ Valid Session Cookie (ba_session)</div>
            <div style="text-align:center; width:45%;">▼ Missing / Invalid Session Cookie</div>
          </div>

          <div class="diagram-row">
            <div class="node success" style="max-width:240px; flex:2;">
              <strong>4A. AUTHORIZED WORKSPACE</strong><br>
              ThemeProvider > MonthProvider > DashboardLayout > Page Content
            </div>
            <div style="width:20px;"></div>
            <div class="node" style="border-color:#EF4444; background:rgba(239,68,68,0.15); color:#FCA5A5; max-width:240px; flex:2;">
              <strong>4B. ACCESS INTERCEPTOR</strong><br>
              Instant 307 Redirect to /login?from=&lt;path&gt;
            </div>
          </div>

          <div style="margin-top:8px; border-top:1px dashed #1E293B; padding-top:6px;">
            <div class="diagram-row">
              <div class="node accent">
                <strong>5. DATA INGESTION</strong><br>
                /api/data & /api/hourly
              </div>
              <div class="arrow-right">➔</div>
              <div class="node">
                <strong>6. ETL ENGINE</strong><br>
                SheetJS Buffer Parse + Firebase
              </div>
              <div class="arrow-right">➔</div>
              <div class="node primary">
                <strong>7. KPI ENGINE</strong><br>
                kpiEngine.js (Formula Compute)
              </div>
              <div class="arrow-right">➔</div>
              <div class="node success">
                <strong>8. CLIENT UI</strong><br>
                Recharts, Tickers & Telemetry
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Flowchart 2: Security & Authentication Pipeline -->
      <div class="flowchart-box">
        <div class="flowchart-title">
          <span>FLOWCHART 2: SECURITY GATEWAY, SESSION COOKIES & LOGOUT LIFECYCLE</span>
          <span class="tag">SECURITY GATEWAY</span>
        </div>

        <div style="padding: 4px 0;">
          <div class="diagram-row">
            <div class="node primary">
              <strong>USER INPUT</strong><br>
              Types code in /login
            </div>
            <div class="arrow-right">➔</div>
            <div class="node">
              <strong>POST /api/auth</strong><br>
              Body: { passcode }
            </div>
            <div class="arrow-right">➔</div>
            <div class="node warning">
              <strong>VERIFICATION</strong><br>
              Compare with DASHBOARD_PASSCODE
            </div>
            <div class="arrow-right">➔</div>
            <div class="node success">
              <strong>SHA-256 DIGEST</strong><br>
              Generate session token
            </div>
          </div>

          <div class="diagram-row" style="margin-top:8px;">
            <div class="node" style="border-color:#38BDF8; flex:1.5; max-width:200px;">
              <strong>SET HTTP-ONLY COOKIE</strong><br>
              ba_session = hash(passcode)<br>
              maxAge: 31536000s (1 Year)
            </div>
            <div class="arrow-right">➔</div>
            <div class="node success" style="flex:1.5; max-width:200px;">
              <strong>ACCESS GRANTED</strong><br>
              Redirect to original route (?from=/)
            </div>
            <div class="arrow-right">➔</div>
            <div class="node" style="border-color:#EF4444; background:rgba(239,68,68,0.1); color:#FCA5A5; flex:1.5; max-width:200px;">
              <strong>LOGOUT ACTION</strong><br>
              DELETE /api/auth -> Cookie deleted<br>
              Instant redirect to /login
            </div>
          </div>

          <div style="margin-top:6px; background:#0B1120; border-radius:6px; padding:6px 8px; border:1px solid #1E293B;">
            <div style="font-size:8px; font-family:'JetBrains Mono'; color:#38BDF8; font-weight:700;">CLIENT-SIDE 401 INTERCEPTOR (LOOP PREVENTION):</div>
            <p style="font-size:7.5px; color:#94A3B8; margin:2px 0 0; line-height:1.35;">
              ClientAutoRefresh.jsx and useKpiData.js wrap window.fetch. If any background call receives HTTP 401, it checks (window.location.pathname !== '/login'). If true, redirects immediately to /login. If already on /login, background polling is completely aborted to guarantee zero flashing or infinite reload loops.
            </p>
          </div>
        </div>
      </div>

      <h2><span class="bar"></span>4. Authentication & Access Security Architecture</h2>
      <div class="grid-2">
        <div class="card">
          <h3>Server Security Implementation</h3>
          <p>
            Authentication does not store passwords in plaintext or transmit unencrypted session flags. Instead, the server uses a cryptographic SHA-256 digest of the access code as the cookie token:
          </p>
          <div class="code-block">// Cookie verification token calculation
function hashPasscode(passcode) {
  return createHash('sha256')
    .update((passcode || '').trim())
    .digest('hex');
}</div>
          <p style="font-size:8.5px; color:#64748B;">
            <strong>Instant Global Invalidation:</strong> Changing <code>DASHBOARD_PASSCODE</code> in <code>.env.local</code> instantly invalidates all active session cookies globally on the very next request.
          </p>
        </div>

        <div class="card">
          <h3>Session Cookie Attributes</h3>
          <table>
            <tr><th>Attribute</th><th>Configuration</th><th>Security Purpose</th></tr>
            <tr><td><strong>Name</strong></td><td><code>ba_session</code></td><td>Dashboard identification token</td></tr>
            <tr><td><strong>httpOnly</strong></td><td><code>true</code></td><td>Prevents XSS attacks (JS cannot read cookie)</td></tr>
            <tr><td><strong>secure</strong></td><td><code>NODE_ENV === 'prod'</code></td><td>Enforces HTTPS-only transmission</td></tr>
            <tr><td><strong>sameSite</strong></td><td><code>lax</code></td><td>Protects against Cross-Site Request Forgery</td></tr>
            <tr><td><strong>maxAge</strong></td><td><code>31,536,000s</code></td><td>1 Year persistence (avoids daily re-login)</td></tr>
            <tr><td><strong>path</strong></td><td><code>/</code></td><td>Protects entire domain route hierarchy</td></tr>
          </table>
        </div>
      </div>
    </div>

    <div class="doc-footer">
      <div>BYZID APPARELS (PVT) LTD · SYSTEM CONSTRUCTION SPECIFICATION</div>
      <div>PAGE 2 OF 4</div>
    </div>
  </div>

  <!-- ==================== PAGE 3 ==================== -->
  <div class="page">
    <div>
      <div class="doc-header">
        <div class="logo-area">
          <div class="logo-badge">DATA PIPELINE</div>
          <div>
            <div class="doc-title">Data Ingestion, ETL & Business KPI Engine</div>
            <div class="doc-subtitle">Google Sheets Sync, Firebase Cloud Backup & Telemetry Formulas</div>
          </div>
        </div>
        <div class="doc-meta">
          PIPELINE: <span>SHEETJS-ETL</span> · CLOUD: <span>FIREBASE-FIRESTORE</span>
        </div>
      </div>

      <!-- Flowchart 3: Data Pipeline -->
      <div class="flowchart-box">
        <div class="flowchart-title">
          <span>FLOWCHART 3: LIVE DATA EXTRACTION, CLOUD BACKUP & NORMALIZATION PIPELINE</span>
          <span class="tag">ETL PIPELINE</span>
        </div>

        <div style="padding: 4px 0;">
          <div class="diagram-row">
            <div class="node primary">
              <strong>FACTORY FLOOR</strong><br>
              Live Google Sheets (Doc ID: 1sk_chM...)
            </div>
            <div class="arrow-right">➔</div>
            <div class="node accent">
              <strong>XLSX BUFFER FETCH</strong><br>
              fetch(url) -> ArrayBuffer -> SheetJS
            </div>
            <div class="arrow-right">➔</div>
            <div class="node warning">
              <strong>DATA PARSER</strong><br>
              Extract Targets, Actuals, MP, Notes
            </div>
            <div class="arrow-right">➔</div>
            <div class="node success">
              <strong>FIREBASE BACKUP</strong><br>
              Firestore: byzid-apparels
            </div>
          </div>

          <div class="diagram-row" style="margin-top:8px;">
            <div class="node" style="border-color:#A855F7; background:rgba(168,85,247,0.1); color:#E9D5FF; flex:1.5; max-width:200px;">
              <strong>LOCAL JSON ARCHIVE</strong><br>
              src/data/hourly-archives/YYYY-MM-DD.json
            </div>
            <div class="arrow-right">➔</div>
            <div class="node primary" style="flex:1.5; max-width:200px;">
              <strong>KPI ENGINE (kpiEngine.js)</strong><br>
              Compute Efficiency, DHU %, CM Revenue
            </div>
            <div class="arrow-right">➔</div>
            <div class="node success" style="flex:1.5; max-width:200px;">
              <strong>REACTIVE SWR CACHE</strong><br>
              useKpiData.js (Multi-Tab In-Memory Cache)
            </div>
          </div>
        </div>
      </div>

      <h2><span class="bar"></span>5. Core Manufacturing Telemetry & KPI Math Formulas</h2>
      <div class="grid-3">
        <div class="card">
          <span class="badge badge-green">Efficiency Equation</span>
          <div style="font-weight:700; font-size:9.5px; margin:3px 0;">Operator Efficiency (%)</div>
          <p style="font-size:8px; font-family:'JetBrains Mono'; background:#FFFFFF; padding:4px; border:1px solid #E2E8F0; border-radius:4px;">
            Eff% = (Actual Output × SMV) / (Manpower × Working Minutes) × 100
          </p>
          <p style="font-size:7.5px; color:#64748B; margin:0;">Measures actual operator labor output against standard allowable time benchmark.</p>
        </div>

        <div class="card">
          <span class="badge badge-orange">Quality Scoring</span>
          <div style="font-weight:700; font-size:9.5px; margin:3px 0;">DHU % (Defect Rate)</div>
          <p style="font-size:8px; font-family:'JetBrains Mono'; background:#FFFFFF; padding:4px; border:1px solid #E2E8F0; border-radius:4px;">
            DHU% = (Total Defects Found / Total Garments Checked) × 100
          </p>
          <p style="font-size:7.5px; color:#64748B; margin:0;">Monitors factory floor QA gates. Tolerances color-code Green (&lt;2%), Amber (2–4%), Red (&gt;4%).</p>
        </div>

        <div class="card">
          <span class="badge badge-blue">Unit Economics</span>
          <div style="font-weight:700; font-size:9.5px; margin:3px 0;">Contribution Margin ($)</div>
          <p style="font-size:8px; font-family:'JetBrains Mono'; background:#FFFFFF; padding:4px; border:1px solid #E2E8F0; border-radius:4px;">
            Gross CM = Actual Pcs × (CM per Dozen / 12) - Daily Factory Cost
          </p>
          <p style="font-size:7.5px; color:#64748B; margin:0;">Tracks financial break-even in real-time across lines and entire monthly production.</p>
        </div>
      </div>

      <h2><span class="bar"></span>6. Primary Data Schemas & Record Structures</h2>
      <div class="grid-2">
        <div class="card">
          <h3>Hourly Floor Archive Schema (JSON)</h3>
          <div class="code-block">{
  "date": "2026-09-09",
  "timeLabels": ["1ST","2ND","3RD","4TH","5TH","6TH","7TH","8TH","9TH","10TH","11TH"],
  "lines": [
    {
      "line_id": "A",
      "buyer": "FAMETEX",
      "style": "N/A",
      "item": "SHERPA JACKET",
      "mp": 78,
      "target": [80, 80, 80, 80, 80, 80, 80, 80, null, null, null],
      "actual": [40, 40, 40, 50, 60, 50, 60, 60, null, null, null],
      "notes": [null, null, null, null, null, null, null, null, null, null, null]
    }
  ]
}</div>
        </div>

        <div class="card">
          <h3>Monthly Aggregate Production Schema</h3>
          <div class="code-block">{
  "month": "2026-09",
  "totalTarget": 162240,
  "totalActual": 97240,
  "overallAchievement": 59.94,
  "totalEarningsCM": 18240.50,
  "dailyProduction": [
    {
      "date": "2026-09-09",
      "target": 6240,
      "actual": 3740,
      "efficiency": 60.5,
      "status": "OPERATIONAL",
      "lines": { "A": 400, "B": 1180, "C": 2160, "D": 0 }
    }
  ]
}</div>
        </div>
      </div>
    </div>

    <div class="doc-footer">
      <div>BYZID APPARELS (PVT) LTD · SYSTEM CONSTRUCTION SPECIFICATION</div>
      <div>PAGE 3 OF 4</div>
    </div>
  </div>

  <!-- ==================== PAGE 4 ==================== -->
  <div class="page">
    <div>
      <div class="doc-header">
        <div class="logo-area">
          <div class="logo-badge">UI & THEME</div>
          <div>
            <div class="doc-title">UI Architecture, Theme Engine & AI Platform Guide</div>
            <div class="doc-subtitle">Component Hierarchy, CSS Token Design & Prompting Specifications</div>
          </div>
        </div>
        <div class="doc-meta">
          UI: <span>TAILWIND-V4</span> · THEME: <span>EMBER-TIDE-NIGHT</span>
        </div>
      </div>

      <!-- Flowchart 4: React Component Hierarchy -->
      <div class="flowchart-box">
        <div class="flowchart-title">
          <span>FLOWCHART 4: REACT COMPONENT TREE & PROVIDER COMPOSITION</span>
          <span class="tag">COMPONENT TREE</span>
        </div>

        <div style="padding: 4px 0;">
          <div class="diagram-row">
            <div class="node primary">
              <strong>RootLayout (layout.tsx)</strong><br>
              Head script + Fonts
            </div>
            <div class="arrow-right">➔</div>
            <div class="node warning">
              <strong>ThemeProvider</strong><br>
              Theme & Mode State
            </div>
            <div class="arrow-right">➔</div>
            <div class="node accent">
              <strong>MonthProvider</strong><br>
              Active Month Selector
            </div>
            <div class="arrow-right">➔</div>
            <div class="node" style="border-color:#EC4899; color:#FBCFE8;">
              <strong>DensityProvider</strong><br>
              Compact/Normal/Detailed
            </div>
          </div>

          <div class="diagram-row" style="margin-top:8px;">
            <div class="node" style="border-color:#38BDF8; color:#BAE6FD; flex:1.2;">
              <strong>ClientAutoRefresh</strong><br>
              Idle Refresh + 401 Guard
            </div>
            <div class="arrow-right">➔</div>
            <div class="node" style="border-color:#34D399; color:#A7F3D0; flex:1.2;">
              <strong>PwaManager</strong><br>
              Install Prompts + Updates
            </div>
            <div class="arrow-right">➔</div>
            <div class="node primary" style="flex:1.8;">
              <strong>DashboardLayout.jsx</strong><br>
              Sidebar + MobileBottomNav + Canvas
            </div>
            <div class="arrow-right">➔</div>
            <div class="node success" style="flex:1.8;">
              <strong>PAGE CONTENT ({children})</strong><br>
              Dashboard / Lines / Hourly / Reports
            </div>
          </div>
        </div>
      </div>

      <h2><span class="bar"></span>7. Visual Styling & Theme Engine Specifications</h2>
      <div class="grid-2">
        <div class="card">
          <h3>Ember Tide Theme (Production Default)</h3>
          <p>
            Default styling balances industrial technology with restrained SaaS glassmorphism:
          </p>
          <table>
            <tr><th>Design Token</th><th>CSS Custom Property</th><th>Hex Value</th></tr>
            <tr><td><strong>Dominant Base</strong></td><td><code>--color-bg-main</code></td><td><code>#070C16</code> (Midnight Navy)</td></tr>
            <tr><td><strong>Elevated Card</strong></td><td><code>--color-bg-card</code></td><td><code>#0E1526</code> (Matte Slate Glass)</td></tr>
            <tr><td><strong>Primary Brand</strong></td><td><code>--color-primary</code></td><td><code>#F97316</code> (Burning Coral Ember)</td></tr>
            <tr><td><strong>Accent / Secondary</strong></td><td><code>--color-secondary</code></td><td><code>#38BDF8</code> (Arctic Cyan)</td></tr>
            <tr><td><strong>Success / Growth</strong></td><td><code>--color-success</code></td><td><code>#10B981</code> (Emerald Mint)</td></tr>
            <tr><td><strong>Danger / Loss</strong></td><td><code>--color-danger</code></td><td><code>#F43F5E</code> (Rose Red)</td></tr>
          </table>
        </div>

        <div class="card">
          <h3>The 60-30-10 Color Budget (Skill.md)</h3>
          <p>
            Enforced by the project's strict design guard rules:
          </p>
          <ul style="font-size:9px; color:#334155; padding-left:14px; line-height:1.45;">
            <li><strong>60% Dominant Base:</strong> Flat cool slate or dark navy neutral background. No rainbow wallpaper.</li>
            <li><strong>30% Secondary Structure:</strong> Single primary brand color for active tabs, selected states, and navigation bars.</li>
            <li><strong>10% Intent Accent:</strong> High-visibility colors (Red, Green, Amber) reserved strictly for live data alerts and growth metrics.</li>
            <li><strong>8px Grid Rhythms:</strong> All padding, margin, and gaps are strict multiples of 8px (8, 16, 24, 32px).</li>
          </ul>
        </div>
      </div>

      <h2><span class="bar"></span>8. AI Platform Collaboration Prompt & Instructions</h2>
      <div class="card" style="background:#FFFBEB; border-color:#FDE68A;">
        <h3 style="color:#B45309;">Prompt Template for Sharing with Other AI Systems:</h3>
        <p style="font-size:8.5px; color:#78350F; margin-bottom:4px;">
          Copy and paste this structured prompt whenever you share this project with Claude, ChatGPT, Gemini, or external coding agents:
        </p>
        <div class="code-block" style="background:#1E293B; color:#F8FAFC; margin-bottom:0; font-size:7.5px;">"This is the Byzid Apparels Factory Operations Dashboard (Next.js 16.2 Turbopack, React 19, Tailwind v4).
- Production default theme: 'ember-tide' in enforced Night/Dark mode with 0ms FOUC prevention.
- Security Gateway: All routes are guarded by src/proxy.js using an httpOnly SHA-256 session cookie (ba_session) verified against process.env.DASHBOARD_PASSCODE (default: 'do1@z1a'). Do NOT alter auth logic.
- Data Layer: Live floor data extracted from Google Sheets via SheetJS (XLSX), cached in src/data/hourly-archives/, and auto-synced to Firebase Firestore ('byzid-apparels').
- Mathematical Model: All production efficiency, DHU %, and CM financial metrics are calculated in src/utils/kpiEngine.js.
- UI Guidelines: Follow strict 60-30-10 color budget (Skill.md). Never introduce uncoordinated rainbow colors; keep Month tabs and Density switcher on a single row (flex-nowrap).
Please inspect this specification document before making any architectural proposals."</div>
      </div>
    </div>

    <div class="doc-footer">
      <div>BYZID APPARELS (PVT) LTD · SYSTEM CONSTRUCTION SPECIFICATION</div>
      <div>PAGE 4 OF 4 · END OF DOCUMENT</div>
    </div>
  </div>

</body>
</html>
`;

const htmlPath = path.join(__dirname, 'architecture_blueprint.html');
fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
console.log('HTML blueprint successfully written to:', htmlPath);

const pdfPath = path.join(__dirname, '..', 'Byzid_Apparels_Platform_Construction_Details_and_Flowcharts.pdf');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

console.log('Compiling PDF via Headless Edge...');
const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
const command = '"' + edgePath + '" --headless=new --disable-gpu --print-to-pdf="' + pdfPath + '" --no-pdf-header-footer "' + fileUrl + '"';

try {
  execSync(command);
  console.log('PDF successfully generated at:', pdfPath);
  if (fs.existsSync(pdfPath)) {
    const stats = fs.statSync(pdfPath);
    console.log('PDF File Size: ' + stats.size + ' bytes');
  }
} catch (error) {
  console.error('Error generating PDF:', error.message);
}
