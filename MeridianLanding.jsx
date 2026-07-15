import React, { useState, useEffect, useRef } from "react";
import { Activity, Bell, BarChart3, Check, ArrowRight, Menu, X } from "lucide-react";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');`;

function useCountUp(target, duration = 1400, startOnMount = true) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!startOnMount) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, startOnMount]);
  return value;
}

// ---- Razorpay integration ----
// Replace with your live/test Key ID from the Razorpay Dashboard (Settings > API Keys).
// Only the public Key ID goes here — never put your Key Secret in frontend code.
const RAZORPAY_KEY_ID = "rzp_test_TBsGsTA1R0WaXI";

function useRazorpay() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (window.Razorpay) { setReady(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setReady(true);
    document.body.appendChild(script);
  }, []);

  const openCheckout = ({ amount, planName, onSuccess, onFailure }) => {
    if (!window.Razorpay) {
      alert("Payment is still loading, please try again in a moment.");
      return;
    }
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: amount * 100, // Razorpay expects the smallest currency unit (paise)
      currency: "INR",
      name: "Meridian",
      description: `${planName} plan subscription`,
      notes: { plan: planName },
      theme: { color: "#F2A93B" },
      handler: function (response) {
        // response.razorpay_payment_id should be verified against your backend
        // (via webhook or the Payments API) before granting access in production.
        if (onSuccess) onSuccess(response);
      },
      modal: {
        ondismiss: function () {
          if (onFailure) onFailure();
        },
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (response) {
      if (onFailure) onFailure(response);
    });
    rzp.open();
  };

  return { ready, openCheckout };
}

function PulseDivider() {
  return (
    <div className="pulse-wrap" aria-hidden="true">
      <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="pulse-svg">
        <line x1="0" y1="30" x2="1200" y2="30" className="pulse-baseline" />
        <path
          d="M0,30 L440,30 L470,6 L500,54 L530,30 L1200,30"
          className="pulse-line"
        />
      </svg>
    </div>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  const links = ["Product", "Pricing", "Docs", "Company"];
  return (
    <header className="nav">
      <div className="nav-inner">
        <div className="brand">
          <span className="brand-dot" />
          <span className="brand-name">meridian</span>
        </div>
        <nav className="nav-links">
          {links.map((l) => (
            <a key={l} href="#" className="nav-link">{l}</a>
          ))}
        </nav>
        <div className="nav-actions">
          <a href="#" className="nav-signin">Sign in</a>
          <a href="#" className="btn btn-primary btn-sm">Start free</a>
        </div>
        <button className="nav-burger" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <div className="nav-mobile">
          {links.map((l) => (
            <a key={l} href="#" className="nav-mobile-link">{l}</a>
          ))}
          <a href="#" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Start free</a>
        </div>
      )}
    </header>
  );
}

function LiveMetricsPanel() {
  const uptime = useCountUp(99.98, 1600);
  const latency = useCountUp(42, 1200);
  const [jitter, setJitter] = useState(42);

  useEffect(() => {
    const id = setInterval(() => {
      setJitter(38 + Math.round(Math.random() * 9));
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="metrics-panel">
      <div className="metrics-header">
        <span className="status-dot" />
        <span>All systems operational</span>
      </div>
      <div className="metrics-grid">
        <div className="metric">
          <div className="metric-label">Uptime, 90d</div>
          <div className="metric-value">{uptime.toFixed(2)}%</div>
        </div>
        <div className="metric">
          <div className="metric-label">p50 latency</div>
          <div className="metric-value">{Math.round(latency)}ms</div>
        </div>
        <div className="metric">
          <div className="metric-label">Live now</div>
          <div className="metric-value metric-live">{jitter}ms</div>
        </div>
        <div className="metric">
          <div className="metric-label">Open incidents</div>
          <div className="metric-value">0</div>
        </div>
      </div>
      <div className="metrics-footer">Checked every 15s across 6 regions</div>
    </div>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-copy">
          <div className="eyebrow">Infrastructure monitoring</div>
          <h1 className="hero-title">
            Know the moment<br />something breaks.
          </h1>
          <p className="hero-sub">
            Meridian watches uptime, latency, and errors across every service you run,
            and pages the right engineer before your customers notice.
          </p>
          <div className="hero-ctas">
            <a href="#" className="btn btn-primary">Start free <ArrowRight size={16} /></a>
            <a href="#" className="btn btn-ghost">View live demo</a>
          </div>
          <div className="hero-meta">No credit card. 6-minute setup. Cancel anytime.</div>
        </div>
        <div className="hero-visual">
          <LiveMetricsPanel />
        </div>
      </div>
    </section>
  );
}

function LogoStrip() {
  const names = ["Fenwick", "Halyard", "Northpeak", "Ostro", "Quillon", "Verdant"];
  return (
    <div className="logo-strip">
      <div className="logo-strip-label">Trusted by engineering teams at</div>
      <div className="logo-row">
        {names.map((n) => (
          <span key={n} className="logo-item">{n}</span>
        ))}
      </div>
    </div>
  );
}

function Features() {
  const items = [
    {
      icon: Activity,
      title: "Uptime monitoring",
      body: "Synthetic checks from 6 regions every 15 seconds, with a status history you can hand to customers directly.",
    },
    {
      icon: Bell,
      title: "Incident alerts",
      body: "Route pages by service and severity. Escalate automatically if the first responder doesn't acknowledge in time.",
    },
    {
      icon: BarChart3,
      title: "Performance insights",
      body: "Trace slow endpoints back to the deploy that caused them, with latency percentiles broken down by route.",
    },
  ];
  return (
    <section className="features">
      <div className="section-inner">
        <h2 className="section-title">Built for the on-call rotation</h2>
        <p className="section-sub">Three tools your team will actually open during an incident.</p>
        <div className="feature-grid">
          {items.map((it) => (
            <div key={it.title} className="feature-card">
              <it.icon size={22} className="feature-icon" />
              <h3 className="feature-title">{it.title}</h3>
              <p className="feature-body">{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Quote() {
  return (
    <section className="quote-section">
      <div className="section-inner quote-inner">
        <p className="quote-text">
          "We replaced three separate tools with Meridian. Our mean time to acknowledge
          dropped from eleven minutes to under ninety seconds."
        </p>
        <div className="quote-attr">
          <span className="quote-name">Dana Okoye</span>
          <span className="quote-role">VP Engineering, Northpeak</span>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const { openCheckout } = useRazorpay();
  const [status, setStatus] = useState(null); // { plan, state: 'success' | 'failed' }

  const tiers = [
    {
      name: "Starter",
      price: "$0",
      period: "forever",
      amountINR: 0,
      desc: "For side projects and small services.",
      features: ["3 monitors", "5-minute checks", "Email alerts", "7-day history"],
      cta: "Start free",
      highlighted: false,
    },
    {
      name: "Team",
      price: "$49",
      period: "/month",
      amountINR: 4100, // approx. INR equivalent billed via Razorpay — adjust to your real pricing
      desc: "For teams running production workloads.",
      features: ["50 monitors", "15-second checks", "SMS + on-call routing", "90-day history", "Status page"],
      cta: "Pay & start trial",
      highlighted: true,
    },
    {
      name: "Scale",
      price: "Custom",
      period: "",
      amountINR: null,
      desc: "For multi-region infrastructure at scale.",
      features: ["Unlimited monitors", "Custom check intervals", "SSO + audit logs", "1-year history", "Dedicated support"],
      cta: "Talk to sales",
      highlighted: false,
    },
  ];

  const handleCTA = (tier) => {
    if (tier.amountINR === null) return; // Scale plan -> routes to sales contact, no payment
    if (tier.amountINR === 0) return; // Starter plan is free, no payment needed
    openCheckout({
      amount: tier.amountINR,
      planName: tier.name,
      onSuccess: (response) => setStatus({ plan: tier.name, state: "success", id: response.razorpay_payment_id }),
      onFailure: () => setStatus({ plan: tier.name, state: "failed" }),
    });
  };

  return (
    <section className="pricing">
      <div className="section-inner">
        <h2 className="section-title">Simple, predictable pricing</h2>
        <p className="section-sub">Start free. Upgrade when your team is on the hook for uptime.</p>

        {status && (
          <div className={`payment-banner ${status.state === "success" ? "payment-success" : "payment-failed"}`}>
            {status.state === "success"
              ? `Payment received for the ${status.plan} plan. Reference: ${status.id}`
              : `Payment for the ${status.plan} plan didn't go through. You can try again.`}
          </div>
        )}

        <div className="pricing-grid">
          {tiers.map((t) => (
            <div key={t.name} className={`price-card ${t.highlighted ? "price-card-highlight" : ""}`}>
              {t.highlighted && <div className="price-badge">Most popular</div>}
              <div className="price-name">{t.name}</div>
              <div className="price-amount">
                <span className="price-number">{t.price}</span>
                <span className="price-period">{t.period}</span>
              </div>
              <p className="price-desc">{t.desc}</p>
              <ul className="price-features">
                {t.features.map((f) => (
                  <li key={f}><Check size={14} className="price-check" /> {f}</li>
                ))}
              </ul>
              <button
                onClick={() => handleCTA(t)}
                className={`btn ${t.highlighted ? "btn-primary" : "btn-ghost"} btn-full`}
              >
                {t.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTAFooter() {
  return (
    <section className="cta-footer">
      <div className="section-inner cta-inner">
        <h2 className="cta-title">Stop finding out about outages from your customers.</h2>
        <a href="#" className="btn btn-primary btn-lg">Start monitoring free <ArrowRight size={16} /></a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="section-inner footer-inner">
        <div className="brand">
          <span className="brand-dot" />
          <span className="brand-name">meridian</span>
        </div>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Status</a>
          <a href="#">Contact</a>
        </div>
        <div className="footer-copy">© 2026 Meridian Labs, Inc.</div>
      </div>
    </footer>
  );
}

export default function MeridianLanding() {
  return (
    <div className="meridian-root">
      <style>{`
        ${FONT_IMPORT}

        .meridian-root {
          --ink: #0D1117;
          --ink-soft: #151B24;
          --paper: #ECEDF0;
          --slate: #8B93A1;
          --slate-dim: #5B6472;
          --amber: #F2A93B;
          --amber-dim: #C98A28;
          --green: #2ECC71;
          --line: #232B36;
          background: var(--ink);
          color: var(--paper);
          font-family: 'Inter', sans-serif;
          width: 100%;
          overflow-x: hidden;
        }
        .meridian-root * { box-sizing: border-box; }
        .meridian-root a { text-decoration: none; color: inherit; }
        .meridian-root ul { list-style: none; margin: 0; padding: 0; }

        .section-inner { max-width: 1120px; margin: 0 auto; padding: 0 24px; }

        /* Nav */
        .nav { position: relative; border-bottom: 1px solid var(--line); }
        .nav-inner {
          max-width: 1120px; margin: 0 auto; padding: 18px 24px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .brand { display: flex; align-items: center; gap: 8px; }
        .brand-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--amber); box-shadow: 0 0 0 3px rgba(242,169,59,0.15); }
        .brand-name { font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 18px; letter-spacing: -0.02em; }
        .nav-links { display: flex; gap: 28px; }
        .nav-link { font-size: 14px; color: var(--slate); transition: color 0.15s ease; }
        .nav-link:hover, .nav-link:focus-visible { color: var(--paper); }
        .nav-actions { display: flex; align-items: center; gap: 20px; }
        .nav-signin { font-size: 14px; color: var(--slate); }
        .nav-signin:hover { color: var(--paper); }
        .nav-burger { display: none; background: none; border: none; color: var(--paper); cursor: pointer; }
        .nav-mobile { display: none; }

        .btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          font-family: 'Inter', sans-serif; font-weight: 600; font-size: 14px;
          padding: 11px 20px; border-radius: 7px; border: 1px solid transparent;
          cursor: pointer; transition: transform 0.12s ease, background 0.15s ease, border-color 0.15s ease;
        }
        .btn:focus-visible { outline: 2px solid var(--amber); outline-offset: 2px; }
        .btn-primary { background: var(--amber); color: #1A1200; }
        .btn-primary:hover { background: #FFC163; }
        .btn-ghost { background: transparent; color: var(--paper); border-color: var(--line); }
        .btn-ghost:hover { border-color: var(--slate-dim); }
        .btn-sm { padding: 8px 16px; font-size: 13px; }
        .btn-lg { padding: 15px 28px; font-size: 15px; }
        .btn-full { width: 100%; margin-top: 8px; }

        /* Hero */
        .hero { padding: 88px 0 64px; }
        .hero-inner {
          max-width: 1120px; margin: 0 auto; padding: 0 24px;
          display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 56px; align-items: center;
        }
        .eyebrow {
          font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--amber); margin-bottom: 18px;
        }
        .hero-title {
          font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 48px;
          line-height: 1.08; letter-spacing: -0.02em; margin: 0 0 20px;
        }
        .hero-sub { font-size: 16px; line-height: 1.6; color: var(--slate); max-width: 460px; margin: 0 0 32px; }
        .hero-ctas { display: flex; gap: 14px; margin-bottom: 18px; }
        .hero-meta { font-size: 13px; color: var(--slate-dim); }

        /* Metrics panel */
        .metrics-panel {
          background: var(--ink-soft); border: 1px solid var(--line); border-radius: 12px;
          padding: 22px; font-family: 'IBM Plex Mono', monospace;
        }
        .metrics-header {
          display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--green);
          margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--line);
        }
        .status-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); animation: blink 2s ease-in-out infinite; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
        .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .metric-label { font-size: 11px; color: var(--slate-dim); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
        .metric-value { font-size: 22px; font-weight: 500; color: var(--paper); }
        .metric-live { color: var(--amber); }
        .metrics-footer { margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--line); font-size: 11px; color: var(--slate-dim); }

        /* Pulse divider */
        .pulse-wrap { width: 100%; line-height: 0; }
        .pulse-svg { width: 100%; height: 44px; display: block; }
        .pulse-baseline { stroke: var(--line); stroke-width: 1; }
        .pulse-line {
          fill: none; stroke: var(--amber); stroke-width: 1.5;
          stroke-dasharray: 1400; stroke-dashoffset: 1400;
          animation: draw-pulse 2.6s ease-out forwards;
        }
        @keyframes draw-pulse { to { stroke-dashoffset: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .pulse-line { animation: none; stroke-dashoffset: 0; }
          .status-dot { animation: none; }
        }

        /* Logo strip */
        .logo-strip { max-width: 1120px; margin: 0 auto; padding: 40px 24px 64px; text-align: center; }
        .logo-strip-label { font-size: 12px; color: var(--slate-dim); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 22px; }
        .logo-row { display: flex; justify-content: center; gap: 44px; flex-wrap: wrap; }
        .logo-item { font-family: 'Space Grotesk', sans-serif; font-size: 16px; color: var(--slate-dim); font-weight: 500; }

        /* Features */
        .features { padding: 72px 0; }
        .section-title { font-family: 'Space Grotesk', sans-serif; font-size: 32px; font-weight: 600; letter-spacing: -0.01em; margin: 0 0 10px; text-align: center; }
        .section-sub { color: var(--slate); text-align: center; margin: 0 0 48px; font-size: 15px; }
        .feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .feature-card { background: var(--ink-soft); border: 1px solid var(--line); border-radius: 12px; padding: 28px; }
        .feature-icon { color: var(--amber); margin-bottom: 16px; }
        .feature-title { font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 600; margin: 0 0 10px; }
        .feature-body { font-size: 14px; line-height: 1.6; color: var(--slate); margin: 0; }

        /* Quote */
        .quote-section { padding: 72px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
        .quote-inner { text-align: center; max-width: 700px; }
        .quote-text { font-family: 'Space Grotesk', sans-serif; font-size: 24px; line-height: 1.5; font-weight: 500; margin: 0 0 20px; }
        .quote-attr { display: flex; flex-direction: column; gap: 2px; }
        .quote-name { font-size: 14px; font-weight: 600; }
        .quote-role { font-size: 13px; color: var(--slate-dim); }

        /* Pricing */
        .pricing { padding: 80px 0; }
        .payment-banner {
          max-width: 640px; margin: 0 auto 32px; padding: 13px 18px; border-radius: 8px;
          font-size: 13px; text-align: center; font-family: 'IBM Plex Mono', monospace;
        }
        .payment-success { background: rgba(46,204,113,0.1); border: 1px solid rgba(46,204,113,0.35); color: var(--green); }
        .payment-failed { background: rgba(242,169,59,0.08); border: 1px solid rgba(242,169,59,0.3); color: var(--amber); }
        .price-card button.btn { width: 100%; font-family: 'Inter', sans-serif; }
        .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .price-card { background: var(--ink-soft); border: 1px solid var(--line); border-radius: 12px; padding: 28px; position: relative; }
        .price-card-highlight { border-color: var(--amber-dim); background: #1A140A; }
        .price-badge {
          position: absolute; top: -12px; left: 24px; background: var(--amber); color: #1A1200;
          font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; letter-spacing: 0.02em;
        }
        .price-name { font-family: 'Space Grotesk', sans-serif; font-size: 15px; color: var(--slate); margin-bottom: 12px; }
        .price-amount { display: flex; align-items: baseline; gap: 4px; margin-bottom: 12px; }
        .price-number { font-family: 'Space Grotesk', sans-serif; font-size: 34px; font-weight: 600; }
        .price-period { font-size: 13px; color: var(--slate-dim); }
        .price-desc { font-size: 13px; color: var(--slate); margin: 0 0 20px; min-height: 36px; }
        .price-features { margin-bottom: 8px; }
        .price-features li { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--paper); padding: 7px 0; border-top: 1px solid var(--line); }
        .price-features li:first-child { border-top: none; }
        .price-check { color: var(--green); flex-shrink: 0; }

        /* CTA footer */
        .cta-footer { padding: 88px 0; }
        .cta-inner { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 28px; }
        .cta-title { font-family: 'Space Grotesk', sans-serif; font-size: 32px; font-weight: 600; max-width: 560px; letter-spacing: -0.01em; margin: 0; }

        /* Footer */
        .footer { border-top: 1px solid var(--line); padding: 32px 0; }
        .footer-inner { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .footer-links { display: flex; gap: 22px; font-size: 13px; color: var(--slate); }
        .footer-links a:hover { color: var(--paper); }
        .footer-copy { font-size: 13px; color: var(--slate-dim); }

        /* Responsive */
        @media (max-width: 860px) {
          .nav-links, .nav-actions { display: none; }
          .nav-burger { display: block; }
          .nav-mobile { display: flex; flex-direction: column; padding: 16px 24px 20px; border-top: 1px solid var(--line); gap: 14px; }
          .nav-mobile-link { font-size: 15px; color: var(--paper); }
          .hero-inner { grid-template-columns: 1fr; }
          .hero-title { font-size: 36px; }
          .feature-grid, .pricing-grid { grid-template-columns: 1fr; }
          .logo-row { gap: 24px; }
        }
      `}</style>

      <Nav />
      <Hero />
      <PulseDivider />
      <LogoStrip />
      <Features />
      <Quote />
      <Pricing />
      <CTAFooter />
      <Footer />
    </div>
  );
}
