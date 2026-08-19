import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const STACK_ITEMS = [
  'MongoDB', 'Express', 'React', 'Node.js', 'JWT Auth',
  'Vite', 'Mongoose', 'Tailwind CSS', 'React Router', 'Axios',
];

const WAYPOINTS = [
  { t: 0.0, coord: 'LAT 31.2304°N · LON 121.4737°E', place: 'Shanghai Port' },
  { t: 0.42, coord: 'LAT 30.0000°N · LON 170.0000°W', place: 'Pacific — Mid Ocean' },
  { t: 0.72, coord: 'LAT 33.7292°N · LON 118.2620°W', place: 'Los Angeles, US' },
  { t: 1.0, coord: 'LAT 41.8781°N · LON 87.6298°W', place: 'Chicago, US' },
];

const DURATION = 9000; // ms per loop
const PAUSE = 1400; // pause before reset

function LandingPage() {
  const staticPathRef = useRef(null);
  const progressPathRef = useRef(null);
  const markerRef = useRef(null);
  const coordTickRef = useRef(null);
  const wpRefs = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const staticPath = staticPathRef.current;
    const progressPath = progressPathRef.current;
    const marker = markerRef.current;
    const coordTick = coordTickRef.current;
    if (!staticPath || !progressPath || !marker || !coordTick) return;

    const fullLen = staticPath.getTotalLength();
    progressPath.style.strokeDasharray = fullLen;
    progressPath.style.strokeDashoffset = fullLen;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const setWaypointState = (idx, activeIdx) => {
      const wp = wpRefs.current[idx];
      if (!wp) return;
      const dot = wp.dot;
      const pulse = wp.pulse;
      const label = wp.label;
      dot.classList.remove('active', 'done');
      pulse.classList.remove('animate');
      label.classList.remove('active');
      if (idx < activeIdx) dot.classList.add('done');
      else if (idx === activeIdx) {
        dot.classList.add('active');
        pulse.classList.add('animate');
        label.classList.add('active');
      }
    };

    const frame = (elapsed) => {
      let t = (elapsed % (DURATION + PAUSE)) / DURATION;
      t = Math.min(t, 1);

      const drawLen = fullLen * t;
      progressPath.style.strokeDashoffset = fullLen - drawLen;

      const pt = staticPath.getPointAtLength(drawLen);
      marker.setAttribute('transform', `translate(${pt.x}, ${pt.y})`);

      let activeIdx = 0;
      for (let i = 0; i < WAYPOINTS.length; i++) {
        if (t >= WAYPOINTS[i].t - 0.001) activeIdx = i;
      }
      WAYPOINTS.forEach((_, i) => setWaypointState(i, activeIdx));
      coordTick.textContent = WAYPOINTS[activeIdx].coord;
    };

    if (prefersReduced) {
      frame(DURATION * 0.42);
      return;
    }

    let start = null;
    const loop = (ts) => {
      if (start === null) start = ts;
      frame(ts - start);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const stripItems = [...STACK_ITEMS, ...STACK_ITEMS];

  return (
    <div className="landing">
      <nav>
        <div className="wrap nav-inner">
          <div className="logo grotesk">
            <span className="logo-mark" aria-hidden="true" />
            SHIPTRACK
          </div>
          <div className="nav-links nav-mobile-hide">
            <a href="#features">Features</a>
            <a href="#product">Dashboard</a>
            <a href="#stack">Stack</a>
            <Link to="/signup" className="nav-cta">Get started</Link>
          </div>
        </div>
      </nav>

      <header className="hero">
        <div className="wrap">
          <div className="eyebrow">
            <span className="dot" aria-hidden="true" /> BOOKED → IN TRANSIT → CUSTOMS → DELIVERED
          </div>
          <h1 className="hero-title display">
            Know where<br />it is. <span className="accent">Always.</span>
          </h1>
          <p className="hero-sub grotesk">
            ShipTrack turns scattered carrier updates into one live manifest —
            from the moment a shipment is booked to the second it's signed for.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn-primary">Get started <span aria-hidden="true">→</span></Link>
            <a href="#product" className="btn-secondary">See the dashboard</a>
          </div>

          <div className="route-panel">
            <div className="route-topline">
              <div className="tracking-id">
                TRACKING <span>#ST-84213-CN</span> · ORIGIN SHANGHAI, CN → DEST CHICAGO, US
              </div>
              <div className="coord-tick" ref={coordTickRef}>LAT 31.2304°N · LON 121.4737°E</div>
            </div>
            <div className="route-svg-wrap">
              <svg
                className="route-svg"
                viewBox="0 0 1080 190"
                preserveAspectRatio="xMidYMid meet"
                role="img"
                aria-label="Animated shipment route from Shanghai to Chicago showing four status waypoints"
              >
                <path
                  ref={staticPathRef}
                  className="route-line"
                  d="M60,140 C 220,40 340,180 480,90 S 760,20 1020,60"
                />
                <path
                  ref={progressPathRef}
                  className="route-line-progress"
                  d="M60,140 C 220,40 340,180 480,90 S 760,20 1020,60"
                />

                <g>
                  <circle ref={(el) => (wpRefs.current[0] = { ...wpRefs.current[0], pulse: el })} className="wp-pulse" cx="60" cy="140" />
                  <circle ref={(el) => (wpRefs.current[0] = { ...wpRefs.current[0], dot: el })} className="wp-dot" cx="60" cy="140" />
                  <text ref={(el) => (wpRefs.current[0] = { ...wpRefs.current[0], label: el })} className="wp-label" x="60" y="172" textAnchor="middle">PENDING</text>
                  <text className="wp-port" x="60" y="20" textAnchor="middle">SHANGHAI PORT</text>
                </g>
                <g>
                  <circle ref={(el) => (wpRefs.current[1] = { ...wpRefs.current[1], pulse: el })} className="wp-pulse" cx="480" cy="90" />
                  <circle ref={(el) => (wpRefs.current[1] = { ...wpRefs.current[1], dot: el })} className="wp-dot" cx="480" cy="90" />
                  <text ref={(el) => (wpRefs.current[1] = { ...wpRefs.current[1], label: el })} className="wp-label" x="480" y="122" textAnchor="middle">IN TRANSIT</text>
                  <text className="wp-port" x="480" y="42" textAnchor="middle">PACIFIC — MID OCEAN</text>
                </g>
                <g>
                  <circle ref={(el) => (wpRefs.current[2] = { ...wpRefs.current[2], pulse: el })} className="wp-pulse" cx="760" cy="27.5" />
                  <circle ref={(el) => (wpRefs.current[2] = { ...wpRefs.current[2], dot: el })} className="wp-dot" cx="760" cy="27.5" />
                  <text ref={(el) => (wpRefs.current[2] = { ...wpRefs.current[2], label: el })} className="wp-label" x="760" y="8" textAnchor="middle">CUSTOMS</text>
                  <text className="wp-port" x="760" y="58" textAnchor="middle">LOS ANGELES, US</text>
                </g>
                <g>
                  <circle ref={(el) => (wpRefs.current[3] = { ...wpRefs.current[3], pulse: el })} className="wp-pulse" cx="1020" cy="60" />
                  <circle ref={(el) => (wpRefs.current[3] = { ...wpRefs.current[3], dot: el })} className="wp-dot" cx="1020" cy="60" />
                  <text ref={(el) => (wpRefs.current[3] = { ...wpRefs.current[3], label: el })} className="wp-label" x="998" y="92" textAnchor="end">DELIVERED</text>
                  <text className="wp-port" x="998" y="34" textAnchor="end">CHICAGO, US</text>
                </g>

                <g ref={markerRef} className="marker-glow">
                  <circle r="5" fill="#FF6A3D" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </header>

      <div className="strip" id="stack" aria-hidden="true">
        <div className="strip-track">
          {stripItems.map((item, i) => (
            <div className="stamp" key={`${item}-${i}`}><b>{item}</b></div>
          ))}
        </div>
      </div>

      <section id="features">
        <div className="wrap">
          <div className="section-eyebrow mono">// FEATURES</div>
          <h2 className="section-title">Built for the ops<br />team, not the spreadsheet.</h2>
          <p className="section-desc">Four things a shipment tracker actually needs to get right — and nothing it doesn't.</p>

          <div className="feature-grid">
            <div className="feature-card">
              <span className="feature-tag tag-cyan">REAL-TIME</span>
              <span className="feature-index mono">01 — TIMELINE</span>
              <h3>A timeline that doesn't lie</h3>
              <p>Every scan, hand-off, and customs hold lands on one shipment record the moment it happens — booked, in transit, customs, delivered, in order, with a timestamp on each.</p>
            </div>
            <div className="feature-card">
              <span className="feature-tag tag-amber">SECURED</span>
              <span className="feature-index mono">02 — ACCESS</span>
              <h3>Roles that make sense</h3>
              <p>Ops leads create and update shipments. Everyone else gets a clean, read-only view. JWT-secured auth, no shared logins, no spreadsheet with edit access for the whole company.</p>
            </div>
            <div className="feature-card">
              <span className="feature-tag tag-green">AT A GLANCE</span>
              <span className="feature-index mono">03 — DASHBOARD</span>
              <h3>One screen, the whole book</h3>
              <p>Summary counts by status, search by tracking ID or destination, and filters that actually narrow things down — no digging through tabs to find one container.</p>
            </div>
            <div className="feature-card">
              <span className="feature-tag tag-slate">MERN</span>
              <span className="feature-index mono">04 — ARCHITECTURE</span>
              <h3>Two services, one contract</h3>
              <p>React frontend, Express + MongoDB API, talking over a documented REST contract — deployed the way you'd actually ship it, not bundled into one fragile box.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="product">
        <div className="wrap">
          <div className="section-eyebrow mono">// THE DASHBOARD</div>
          <h2 className="section-title">Everything, sorted<br />the moment it loads.</h2>
          <p className="section-desc">Live counts up top, the full shipment book below — search, filter, and status at a glance.</p>

          <div className="mockup-shell">
            <div className="mockup-chrome">
              <div className="chrome-dot" /><div className="chrome-dot" /><div className="chrome-dot" />
              <div className="chrome-url">app.shiptrack.io/dashboard</div>
            </div>
            <div className="mockup-body">
              <div className="mockup-summary">
                <div className="summary-card"><div className="summary-num" style={{ color: 'var(--slate-badge)' }}>12</div><div className="summary-label">Pending</div></div>
                <div className="summary-card"><div className="summary-num" style={{ color: 'var(--cyan)' }}>34</div><div className="summary-label">In Transit</div></div>
                <div className="summary-card"><div className="summary-num" style={{ color: 'var(--amber)' }}>6</div><div className="summary-label">Customs</div></div>
                <div className="summary-card"><div className="summary-num" style={{ color: 'var(--green)' }}>128</div><div className="summary-label">Delivered</div></div>
              </div>
              <div className="mockup-table">
                <div className="mtr head"><div>Tracking ID</div><div>Destination</div><div>Status</div><div>Updated</div></div>
                <div className="mtr row"><div>ST-84213-CN</div><div>Chicago, US</div><div><span className="badge badge-transit">In Transit</span></div><div>2h ago</div></div>
                <div className="mtr row"><div>ST-77190-DE</div><div>Austin, US</div><div><span className="badge badge-customs">Customs</span></div><div>5h ago</div></div>
                <div className="mtr row"><div>ST-91002-VN</div><div>Rotterdam, NL</div><div><span className="badge badge-pending">Pending</span></div><div>1d ago</div></div>
                <div className="mtr row"><div>ST-60244-US</div><div>Toronto, CA</div><div><span className="badge badge-delivered">Delivered</span></div><div>2d ago</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="section-eyebrow mono">// STATUS TIMELINE</div>
          <h2 className="section-title">Four states.<br />No ambiguity.</h2>
          <p className="section-desc">Every shipment moves through the same typed lifecycle — so nobody's guessing what "almost there" means.</p>

          <div className="timeline-showcase">
            <div className="tl-step s1">
              <div className="tl-dot" />
              <div className="tl-time mono">DAY 0, 09:14</div>
              <div className="tl-title grotesk">Pending</div>
              <div className="tl-desc">Shipment booked and logged. Waiting for carrier pickup.</div>
            </div>
            <div className="tl-step s2">
              <div className="tl-dot" />
              <div className="tl-time mono">DAY 1, 22:40</div>
              <div className="tl-title grotesk">In Transit</div>
              <div className="tl-desc">Picked up and moving. Location updates land here as they come in.</div>
            </div>
            <div className="tl-step s3">
              <div className="tl-dot" />
              <div className="tl-time mono">DAY 11, 06:02</div>
              <div className="tl-title grotesk">Customs</div>
              <div className="tl-desc">Held for inspection at the border. Flagged clearly, not buried.</div>
            </div>
            <div className="tl-step s4">
              <div className="tl-dot" />
              <div className="tl-time mono">DAY 12, 15:37</div>
              <div className="tl-title grotesk">Delivered</div>
              <div className="tl-desc">Signed for. Timeline closes, record stays for the audit trail.</div>
            </div>
          </div>
        </div>
      </section>

      <section id="get-started">
        <div className="wrap">
          <div className="cta-section">
            <h2 className="display">Stop tracking cargo<br />in a spreadsheet.</h2>
            <p>Spin up the backend, connect a Mongo Atlas cluster, and you've got a real shipment tracker running locally in minutes.</p>
            <div className="hero-actions" style={{ justifyContent: 'center' }}>
              <Link to="/signup" className="btn-primary">Create an account <span aria-hidden="true">→</span></Link>
              <Link to="/login" className="btn-secondary">Log in</Link>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap footer-inner">
          <div className="footer-stamp mono">
            MANIFEST TYPE — MERN STACK<br />
            FRONTEND — REACT + VITE + REACT ROUTER<br />
            BACKEND — EXPRESS + MONGOOSE + JWT
          </div>
          <div>
            <div className="footer-sig">ShipTrack — a full-stack shipment tracking dashboard.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
