import { useEffect, useMemo, useState } from "react";
import "./App.css";

/* ---------- Static data ---------- */

const NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Explore Flatmates", href: "#search" },
  { label: "Safety", href: "#features" },
];

const CITIES = [
  "Pune, Maharashtra",
  "Mumbai, Maharashtra",
  "Bengaluru, Karnataka",
  "Hyderabad, Telangana",
  "Delhi NCR",
  "Chennai, Tamil Nadu",
];

const BUDGETS = [
  { label: "Under ₹5,000", min: 0, max: 5000 },
  { label: "₹5,000 – ₹8,000", min: 5000, max: 8000 },
  { label: "₹8,000 – ₹12,000", min: 8000, max: 12000 },
  { label: "₹12,000 – ₹18,000", min: 12000, max: 18000 },
  { label: "₹18,000+", min: 18000, max: 100000 },
];

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

const TOKEN_KEY = "colive_token";
const USER_KEY = "colive_user";

function readStored(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key, value) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* storage can be blocked; the app still works for this visit */
  }
}

const FEATURES = [
  {
    icon: "heart",
    title: "Lifestyle First",
    text: "Compatibility starts with habits and routines — sleep schedules, cleanliness, social energy and more.",
  },
  {
    icon: "wallet",
    title: "Budget Friendly",
    text: "Set your monthly budget and look for flatmates whose expectations fit comfortably within it.",
  },
  {
    icon: "shield",
    title: "Safer Connections",
    text: "We encourage informed choices: clear preferences up front and time to get to know someone first.",
  },
];

const STEPS = [
  {
    title: "Create your profile",
    text: "Tell us about your routine, budget, preferred city and what you want from a home.",
  },
  {
    title: "Get recommendations",
    text: "CoLive compares preferences and suggests flatmates whose lifestyle fits yours.",
  },
  {
    title: "Connect and decide",
    text: "Chat, ask questions and take your time before you choose who you live with.",
  },
];

const BENEFITS = [
  "Matching based on lifestyle, not just location",
  "Personalised recommendations that improve with your preferences",
  "Transparent preferences so there are fewer surprises later",
  "Designed for students and young professionals",
];

const FOOTER_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Explore Flatmates", href: "#search" },
  { label: "Safety", href: "#features" },
  { label: "Why CoLive", href: "#why" },
];

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80";

/* ---------- Small reusable components ---------- */

function Icon({ name }) {
  const common = {
    width: 26,
    height: 26,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };
  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5 10v10h14V10" />
          <path d="M10 20v-5h4v5" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M20.8 5.6a5.2 5.2 0 0 0-7.4 0L12 7l-1.4-1.4a5.2 5.2 0 0 0-7.4 7.4L12 21.8l8.8-8.8a5.2 5.2 0 0 0 0-7.4Z" />
        </svg>
      );
    case "wallet":
      return (
        <svg {...common}>
          <path d="M3 7a2 2 0 0 1 2-2h13v4" />
          <path d="M3 7v11a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H5a2 2 0 0 1-2-1Z" />
          <circle cx="16.5" cy="14" r="1" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6l-8-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "pin":
      return (
        <svg {...common}>
          <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 5 5 9-10" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common} width={18} height={18}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );
    default:
      return null;
  }
}

function Logo({ href = "#top" }) {
  return (
    <a className="logo" href={href} aria-label="CoLive home">
      <span className="logo-mark">
        <Icon name="home" />
      </span>
      <span className="logo-text">CoLive</span>
    </a>
  );
}

function Navbar({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Logo />

        <button
          className="nav-toggle"
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          id="main-nav"
          className={`nav-menu ${open ? "is-open" : ""}`}
          aria-label="Main navigation"
        >
          <ul className="nav-links">
            {NAV_LINKS.map((link) => (
              <li key={link.href + link.label}>
                <a href={link.href} onClick={close}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="nav-actions">
            {user ? (
              <>
                <a className="btn btn-ghost" href="#profile" onClick={close}>
                  My Profile
                </a>
                <span className="nav-user">Hi, {user.name.split(" ")[0]}</span>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => {
                    close();
                    onLogout();
                  }}
                >
                  Log Out
                </button>
              </>
            ) : (
              <a className="btn btn-ghost" href="#login" onClick={close}>
                Log In
              </a>
            )}
            <a className="btn btn-primary" href="#search" onClick={close}>
              Find Your Match
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <section className="hero" id="top">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="badge">Find your people, feel at home</span>
          <h1>
            Your next place should <span className="highlight">feel like home.</span>
          </h1>
          <p className="hero-text">
            CoLive helps you find compatible flatmates based on your lifestyle,
            budget and location — so sharing a home feels easy from day one.
          </p>
          <div className="hero-ctas">
            <a className="btn btn-primary btn-lg" href="#search">
              Find a Flatmate <Icon name="arrow" />
            </a>
            <a className="btn btn-secondary btn-lg" href="#how-it-works">
              How It Works
            </a>
          </div>
          <div className="social-proof">
            <div className="avatars" aria-hidden="true">
              <span className="avatar a1" />
              <span className="avatar a2" />
              <span className="avatar a3" />
              <span className="avatar a4" />
            </div>
            <p>Built for students and young professionals looking for a better flatshare.</p>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-image-wrap">
            {imageFailed ? (
              <div className="hero-fallback" role="img" aria-label="Illustration of a cosy shared home">
                <svg viewBox="0 0 400 400" aria-hidden="true">
                  <defs>
                    <linearGradient id="fbg" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#e9e2ff" />
                      <stop offset="1" stopColor="#ffe9dc" />
                    </linearGradient>
                  </defs>
                  <rect width="400" height="400" fill="url(#fbg)" />
                  <path d="M70 200 200 90l130 110v120H70Z" fill="#fff" />
                  <path d="M50 205 200 75l150 130" fill="none" stroke="#6d4fd6" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="170" y="240" width="60" height="80" rx="8" fill="#b9a6ff" />
                  <rect x="100" y="215" width="44" height="44" rx="8" fill="#ece6ff" />
                  <rect x="256" y="215" width="44" height="44" rx="8" fill="#ece6ff" />
                  <circle cx="200" cy="170" r="14" fill="#6d4fd6" />
                </svg>
              </div>
            ) : (
              <img
                src={HERO_IMAGE}
                alt="Young roommates laughing together"
                loading="eager"
                onError={() => setImageFailed(true)}
              />
            )}
          </div>

          <div className="float-card float-match" role="status">
            <span className="float-icon purple">
              <Icon name="heart" />
            </span>
            <div>
              <strong>92% Lifestyle Match</strong>
              <small>Sample compatibility preview</small>
            </div>
          </div>

          <div className="float-card float-location">
            <span className="float-icon peach">
              <Icon name="pin" />
            </span>
            <div>
              <strong>Pune, Maharashtra</strong>
              <small>Popular city</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const TRAIT_LABELS = {
  sleep_schedule: "Sleep schedule",
  cleanliness: "Cleanliness",
  social_style: "Social energy",
};

function MatchCard({ flatmate, onView }) {
  const tags = [flatmate.sleep_schedule, flatmate.cleanliness, flatmate.social_style].filter(Boolean);
  const hasScore = typeof flatmate.match_score === "number";
  const breakdown = flatmate.match_breakdown || {};
  return (
    <article className="match-card">
      <div className="match-top">
        <span className="avatar a1" aria-hidden="true" />
        <div>
          <h3>{flatmate.name}</h3>
          <p className="match-sub">
            {[flatmate.age, flatmate.occupation].filter(Boolean).join(" · ")}
          </p>
        </div>
        {flatmate.is_sample && <span className="demo-badge">Demo</span>}
      </div>
      {hasScore && (
        <div className="score-box">
          <div className="score-head">
            <strong>{flatmate.match_score}% match</strong>
            <span>based on your lifestyle answers</span>
          </div>
          {Object.entries(breakdown).map(([key, value]) => (
            <div className="meter-row" key={key}>
              <span>
                {TRAIT_LABELS[key] || key} · {value}%
              </span>
              <div className="bar">
                <i style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
      {flatmate.bio && <p className="match-bio">{flatmate.bio}</p>}
      <ul className="chips">
        {tags.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <dl className="match-meta">
        <div>
          <dt>Budget</dt>
          <dd>
            ₹{Number(flatmate.budget_min).toLocaleString("en-IN")} – ₹
            {Number(flatmate.budget_max).toLocaleString("en-IN")}
          </dd>
        </div>
        <div>
          <dt>Available from</dt>
          <dd>{flatmate.available_from}</dd>
        </div>
      </dl>
      <button
        className="btn btn-secondary match-btn"
        type="button"
        onClick={() => onView(flatmate.id)}
      >
        View Details
      </button>
    </article>
  );
}

function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function FlatmateModal({ flatmateId, onClose }) {
  const [state, setState] = useState("loading"); // loading | ready | error
  const [profile, setProfile] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState({ preferred_date: "", message: "" });
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const token = readStored(TOKEN_KEY);

  // Load the full profile (with a fresh compatibility score if logged in).
  useEffect(() => {
    let cancelled = false;
    setState("loading");
    fetch(`${API_URL}/api/flatmates/${flatmateId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Could not load this profile.");
        if (!cancelled) {
          setProfile(data.flatmate);
          setState("ready");
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(
          err instanceof TypeError
            ? "Could not reach the CoLive server. Please check that the Flask backend is running."
            : err.message
        );
        setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [flatmateId, token]);

  // Close with the Escape key and stop the page behind from scrolling.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormError("");
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.preferred_date) {
      setFormError("Please choose a preferred date.");
      return;
    }
    if (form.message.length > 300) {
      setFormError("Message is too long (max 300 characters).");
      return;
    }
    setSending(true);
    setFormError("");
    try {
      const response = await fetch(`${API_URL}/api/visit-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          flatmate_id: flatmateId,
          preferred_date: form.preferred_date,
          message: form.message.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not send your request.");
      setSuccessMsg(data.message || "Your request was sent.");
    } catch (err) {
      setFormError(
        err instanceof TypeError
          ? "Could not reach the CoLive server. Please check that the Flask backend is running."
          : err.message
      );
    } finally {
      setSending(false);
    }
  };

  const breakdown = (profile && profile.match_breakdown) || {};
  const hasScore = profile && typeof profile.match_score === "number";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close">
          ×
        </button>

        {state === "loading" && <p className="results-msg">Loading profile…</p>}

        {state === "error" && (
          <p className="results-msg results-error" role="alert">
            {loadError}
          </p>
        )}

        {state === "ready" && profile && (
          <>
            <div className="match-top">
              <span className="avatar a1" aria-hidden="true" />
              <div>
                <h3 id="modal-title">{profile.name}</h3>
                <p className="match-sub">
                  {[profile.age, profile.occupation].filter(Boolean).join(" · ")}
                </p>
              </div>
              {profile.is_sample && <span className="demo-badge">Demo</span>}
            </div>

            {profile.bio && <p className="match-bio">{profile.bio}</p>}

            <dl className="detail-grid">
              <div>
                <dt>City</dt>
                <dd>{profile.city}</dd>
              </div>
              <div>
                <dt>Budget</dt>
                <dd>
                  ₹{Number(profile.budget_min).toLocaleString("en-IN")} – ₹
                  {Number(profile.budget_max).toLocaleString("en-IN")}
                </dd>
              </div>
              <div>
                <dt>Available from</dt>
                <dd>{profile.available_from}</dd>
              </div>
              <div>
                <dt>Sleep schedule</dt>
                <dd>{profile.sleep_schedule}</dd>
              </div>
              <div>
                <dt>Cleanliness</dt>
                <dd>{profile.cleanliness}</dd>
              </div>
              <div>
                <dt>Social energy</dt>
                <dd>{profile.social_style}</dd>
              </div>
            </dl>

            {hasScore ? (
              <div className="score-box">
                <div className="score-head">
                  <strong>{profile.match_score}% match</strong>
                  <span>preference-based score, not an AI prediction</span>
                </div>
                {Object.entries(breakdown).map(([key, value]) => (
                  <div className="meter-row" key={key}>
                    <span>
                      {TRAIT_LABELS[key] || key} · {value}%
                    </span>
                    <div className="bar">
                      <i style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
                <p className="score-explain">
                  Each trait scores 100% for the same answer, 50% for neighbouring answers and 0% for
                  opposite ones. The overall score is the average.
                </p>
              </div>
            ) : (
              <p className="score-notice">
                {token ? (
                  <>
                    <a href="#profile" onClick={onClose}>
                      Complete your lifestyle profile
                    </a>{" "}
                    to see your compatibility score.
                  </>
                ) : (
                  <>
                    <a href="#login" onClick={onClose}>
                      Log in
                    </a>{" "}
                    and complete your lifestyle profile to see your compatibility score.
                  </>
                )}
              </p>
            )}

            <div className="visit-box">
              <h4>Request a visit / express interest</h4>
              {successMsg ? (
                <p className="form-success" role="status">
                  {successMsg}
                </p>
              ) : !token ? (
                <p className="score-notice">
                  Please{" "}
                  <a href="#login" onClick={onClose}>
                    log in
                  </a>{" "}
                  or{" "}
                  <a href="#signup" onClick={onClose}>
                    sign up
                  </a>{" "}
                  to send a request.
                </p>
              ) : (
                <form className="auth-form" onSubmit={handleSend} noValidate>
                  <div className="field">
                    <label htmlFor="visit-date">Preferred date</label>
                    <input
                      id="visit-date"
                      name="preferred_date"
                      type="date"
                      min={todayISO(0)}
                      max={todayISO(90)}
                      value={form.preferred_date}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="visit-message">Message (optional)</label>
                    <textarea
                      id="visit-message"
                      name="message"
                      rows={3}
                      maxLength={300}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Say hello and share anything useful…"
                    />
                  </div>
                  {formError && (
                    <p className="form-error" role="alert">
                      {formError}
                    </p>
                  )}
                  <button className="btn btn-primary" type="submit" disabled={sending}>
                    {sending ? "Sending…" : "Send request"}
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SearchSection() {
  const moveInOptions = useMemo(() => {
    const now = new Date();
    const options = [];
    for (let i = 0; i < 6; i += 1) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      options.push({
        value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: d.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
      });
    }
    return options;
  }, []);

  const [form, setForm] = useState({ city: "", budget: "", moveIn: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [matches, setMatches] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchMeta, setSearchMeta] = useState({ loggedIn: false, hasProfile: false });
  const [selectedId, setSelectedId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.city) nextErrors.city = "Please choose a city.";
    if (!form.budget) nextErrors.budget = "Please choose a budget.";
    if (!form.moveIn) nextErrors.moveIn = "Please choose a move-in month.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSubmitted(null);
      return;
    }
    const budget = BUDGETS.find((b) => b.label === form.budget);
    const moveIn = moveInOptions.find((m) => m.value === form.moveIn);

    setSubmitted({
      city: form.city,
      budget: budget.label,
      moveInLabel: moveIn.label,
    });
    setStatus("loading");
    setMatches([]);
    setErrorMsg("");

    setTimeout(() => {
      const el = document.getElementById("results");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);

    try {
      const params = new URLSearchParams({
        city: form.city,
        budget_min: String(budget.min),
        budget_max: String(budget.max),
        move_in: moveIn.value,
      });
      const token = readStored(TOKEN_KEY);
      const response = await fetch(`${API_URL}/api/search?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Search failed. Please try again.");
      }
      setSearchMeta({
        loggedIn: Boolean(data.logged_in),
        hasProfile: Boolean(data.has_profile),
      });
      setMatches(data.results || []);
      setStatus("done");
    } catch (err) {
      const isNetwork = err instanceof TypeError;
      setErrorMsg(
        isNetwork
          ? "Could not reach the CoLive server. Please check that the Flask backend is running."
          : err.message
      );
      setStatus("error");
    }
  };

  const handleReset = () => {
    setForm({ city: "", budget: "", moveIn: "" });
    setErrors({});
    setSubmitted(null);
    setStatus("idle");
    setMatches([]);
    setErrorMsg("");
    const el = document.getElementById("search");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section className="search-section" id="search" aria-labelledby="search-title">
      <div className="container">
        <form className="search-panel" onSubmit={handleSubmit} noValidate>
          <h2 id="search-title" className="sr-only">
            Search for flatmates
          </h2>

          <div className="field">
            <label htmlFor="city">Preferred city</label>
            <select
              id="city"
              name="city"
              value={form.city}
              onChange={handleChange}
              aria-invalid={Boolean(errors.city)}
              aria-describedby={errors.city ? "city-error" : undefined}
            >
              <option value="">Select a city</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.city && (
              <span className="field-error" id="city-error" role="alert">
                {errors.city}
              </span>
            )}
          </div>

          <div className="field">
            <label htmlFor="budget">Monthly budget</label>
            <select
              id="budget"
              name="budget"
              value={form.budget}
              onChange={handleChange}
              aria-invalid={Boolean(errors.budget)}
              aria-describedby={errors.budget ? "budget-error" : undefined}
            >
              <option value="">Select a budget</option>
              {BUDGETS.map((b) => (
                <option key={b.label} value={b.label}>
                  {b.label}
                </option>
              ))}
            </select>
            {errors.budget && (
              <span className="field-error" id="budget-error" role="alert">
                {errors.budget}
              </span>
            )}
          </div>

          <div className="field">
            <label htmlFor="moveIn">Move-in date</label>
            <select
              id="moveIn"
              name="moveIn"
              value={form.moveIn}
              onChange={handleChange}
              aria-invalid={Boolean(errors.moveIn)}
              aria-describedby={errors.moveIn ? "movein-error" : undefined}
            >
              <option value="">Select a month</option>
              {moveInOptions.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            {errors.moveIn && (
              <span className="field-error" id="movein-error" role="alert">
                {errors.moveIn}
              </span>
            )}
          </div>

          <button className="btn btn-primary btn-lg search-btn" type="submit">
            Explore Matches
          </button>
        </form>

        {submitted && (
          <div className="results-wrap" id="results" aria-live="polite">
            <div className="results-top">
              <ul className="chips">
                <li>
                  <Icon name="pin" /> {submitted.city}
                </li>
                <li>
                  <Icon name="wallet" /> {submitted.budget}
                </li>
                <li>Move in: {submitted.moveInLabel}</li>
              </ul>
              <button className="btn btn-secondary" type="button" onClick={handleReset}>
                Change search
              </button>
            </div>

            {status === "loading" && <p className="results-msg">Searching for matches…</p>}

            {status === "error" && (
              <p className="results-msg results-error" role="alert">
                {errorMsg}
              </p>
            )}

            {status === "done" && matches.length === 0 && (
              <p className="results-msg">
                No profiles match these preferences yet. Try a different budget
                or move-in month.
              </p>
            )}

            {status === "done" && matches.length > 0 && (
              <>
                <p className="results-count">
                  {matches.length} {matches.length === 1 ? "profile" : "profiles"} found
                  {matches.some((m) => m.is_sample) && " — these are demo profiles for testing"}
                </p>
                {!searchMeta.hasProfile && (
                  <p className="score-notice">
                    {searchMeta.loggedIn ? (
                      <>
                        Want to see how well each person fits you?{" "}
                        <a href="#profile">Complete your lifestyle profile</a> to get
                        compatibility scores.
                      </>
                    ) : (
                      <>
                        <a href="#login">Log in</a> and complete your lifestyle profile to
                        see compatibility scores.
                      </>
                    )}
                  </p>
                )}
                <div className="match-grid">
                  {matches.map((m) => (
                    <MatchCard key={m.id} flatmate={m} onView={setSelectedId} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {selectedId && (
        <FlatmateModal flatmateId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </section>
  );
}

function Features() {
  return (
    <section className="section" id="features" aria-labelledby="features-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">What matters</span>
          <h2 id="features-title">Built around how you actually live</h2>
          <p>
            Good flatmates are about more than a shared rent. CoLive focuses on
            the things that make a home work.
          </p>
        </div>
        <div className="card-grid">
          {FEATURES.map((f) => (
            <article className="feature-card" key={f.title}>
              <span className="feature-icon">
                <Icon name={f.icon} />
              </span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="section section-tint" id="how-it-works" aria-labelledby="how-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">How it works</span>
          <h2 id="how-title">Three simple steps to a better flatshare</h2>
        </div>
        <ol className="steps">
          {STEPS.map((s, i) => (
            <li className="step-card" key={s.title}>
              <span className="step-num">{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function WhyChoose() {
  return (
    <section className="section" id="why" aria-labelledby="why-title">
      <div className="container why-grid">
        <div className="why-copy">
          <span className="eyebrow">Why choose CoLive</span>
          <h2 id="why-title">Compatibility first. Recommendations that feel personal.</h2>
          <p>
            Instead of scrolling through endless listings, CoLive learns what
            you value in a home and points you towards people who share it.
          </p>
          <ul className="check-list">
            {BENEFITS.map((b) => (
              <li key={b}>
                <span className="check">
                  <Icon name="check" />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>
        <div className="why-panel" aria-hidden="true">
          <div className="meter-card">
            <span className="meter-title">Sample compatibility</span>
            <div className="meter-row">
              <span>Sleep schedule</span>
              <div className="bar">
                <i style={{ width: "90%" }} />
              </div>
            </div>
            <div className="meter-row">
              <span>Cleanliness</span>
              <div className="bar">
                <i style={{ width: "80%" }} />
              </div>
            </div>
            <div className="meter-row">
              <span>Social energy</span>
              <div className="bar">
                <i style={{ width: "95%" }} />
              </div>
            </div>
            <div className="meter-row">
              <span>Budget fit</span>
              <div className="bar">
                <i style={{ width: "88%" }} />
              </div>
            </div>
            <small>Illustration only — not real user data.</small>
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaBanner() {
  return (
    <section className="section cta-section" aria-labelledby="cta-title">
      <div className="container">
        <div className="cta-banner">
          <h2 id="cta-title">Your next chapter starts at home.</h2>
          <p>Tell us what you&apos;re looking for and let CoLive help you find your people.</p>
          <a className="btn btn-light btn-lg" href="#search">
            Find Your Match <Icon name="arrow" />
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Logo />
          <p>Find your people. Feel at home.</p>
        </div>
        <nav aria-label="Footer navigation">
          <ul className="footer-links">
            {FOOTER_LINKS.map((l) => (
              <li key={l.label}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} CoLive. A college mini project.</p>
      </div>
    </footer>
  );
}

/* ---------- Login / Sign up ---------- */

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function AuthPage({ mode, onAuthSuccess }) {
  const isSignup = mode === "signup";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Start with a clean form when switching between Log In and Sign Up.
  useEffect(() => {
    setForm({ name: "", email: "", password: "" });
    setErrors({});
    setFormError("");
    setShowPassword(false);
  }, [mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    const name = form.name.trim();
    const email = form.email.trim();

    if (isSignup && name.length < 2) nextErrors.name = "Please enter your name.";
    if (!EMAIL_PATTERN.test(email)) nextErrors.email = "Please enter a valid email address.";
    if (isSignup) {
      if (form.password.length < 8) nextErrors.password = "Use at least 8 characters.";
    } else if (!form.password) {
      nextErrors.password = "Please enter your password.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    setFormError("");
    try {
      const response = await fetch(
        `${API_URL}/api/auth/${isSignup ? "register" : "login"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isSignup
              ? { name, email, password: form.password }
              : { email, password: form.password }
          ),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong. Please try again.");
      }
      onAuthSuccess(data.token, data.user);
    } catch (err) {
      setFormError(
        err instanceof TypeError
          ? "Could not reach the CoLive server. Please check that the Flask backend is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-section" aria-labelledby="auth-title">
      <div className="container auth-wrap">
        <div className="auth-card">
          <span className="eyebrow">{isSignup ? "Join CoLive" : "Welcome back"}</span>
          <h1 id="auth-title">{isSignup ? "Create your account" : "Log in to CoLive"}</h1>
          <p className="auth-sub">
            {isSignup
              ? "It takes less than a minute. Then you can start looking for flatmates."
              : "Pick up where you left off and find your people."}
          </p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate id="auth-form">
            {isSignup && (
              <div className="field">
                <label htmlFor="auth-name">Full name</label>
                <input
                  id="auth-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "auth-name-error" : undefined}
                />
                {errors.name && (
                  <span className="field-error" id="auth-name-error" role="alert">
                    {errors.name}
                  </span>
                )}
              </div>
            )}

            <div className="field">
              <label htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "auth-email-error" : undefined}
              />
              {errors.email && (
                <span className="field-error" id="auth-email-error" role="alert">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="field">
              <label htmlFor="auth-password">Password</label>
              <div className="password-row">
                <input
                  id="auth-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  value={form.password}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "auth-password-error" : undefined}
                />
                <button
                  className="show-btn"
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-pressed={showPassword}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <span className="field-error" id="auth-password-error" role="alert">
                  {errors.password}
                </span>
              )}
            </div>

            {formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}

            <button className="btn btn-primary btn-lg auth-submit" type="submit" disabled={loading}>
              {loading ? "Please wait…" : isSignup ? "Create Account" : "Log In"}
            </button>
          </form>

          <p className="auth-switch">
            {isSignup ? "Already have an account? " : "New to CoLive? "}
            <a href={isSignup ? "#login" : "#signup"}>
              {isSignup ? "Log in" : "Create an account"}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- Lifestyle profile (questionnaire) ---------- */

const QUESTIONS = [
  {
    key: "sleep_schedule",
    label: "What is your daily rhythm?",
    options: ["Early bird", "Flexible", "Night owl"],
  },
  {
    key: "cleanliness",
    label: "How do you keep your space?",
    options: ["Relaxed", "Tidy", "Very tidy"],
  },
  {
    key: "social_style",
    label: "How social are you at home?",
    options: ["Quiet", "Easygoing", "Social"],
  },
];

function getMoveInOptions() {
  const now = new Date();
  const options = [];
  for (let i = 0; i < 6; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    options.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
    });
  }
  return options;
}

const EMPTY_PROFILE = {
  city: "",
  budget: "",
  moveIn: "",
  age: "",
  occupation: "",
  bio: "",
  sleep_schedule: "",
  cleanliness: "",
  social_style: "",
  visible: true,
};

function ProfilePage() {
  const moveInOptions = useMemo(() => getMoveInOptions(), []);
  const [form, setForm] = useState(EMPTY_PROFILE);
  const [errors, setErrors] = useState({});
  const [loadState, setLoadState] = useState("loading"); // loading | ready | error
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved
  const [formError, setFormError] = useState("");

  // Fill the form with the saved profile, if there is one.
  useEffect(() => {
    const token = readStored(TOKEN_KEY);
    fetch(`${API_URL}/api/profile`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Could not load your profile.");
        const p = data.profile;
        if (p) {
          const budget = BUDGETS.find((b) => b.min === p.budget_min && b.max === p.budget_max);
          setForm({
            city: p.city || "",
            budget: budget ? budget.label : "",
            moveIn: p.available_from || "",
            age: p.age ? String(p.age) : "",
            occupation: p.occupation || "",
            bio: p.bio || "",
            sleep_schedule: p.sleep_schedule || "",
            cleanliness: p.cleanliness || "",
            social_style: p.social_style || "",
            visible: p.visible !== false,
          });
        }
        setLoadState("ready");
      })
      .catch((err) => {
        setFormError(
          err instanceof TypeError
            ? "Could not reach the CoLive server. Please check that the Flask backend is running."
            : err.message
        );
        setLoadState("error");
      });
  }, []);

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setSaveState("idle");
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.city) nextErrors.city = "Please choose a city.";
    if (!form.budget) nextErrors.budget = "Please choose a budget.";
    if (!form.moveIn) nextErrors.moveIn = "Please choose a move-in month.";
    QUESTIONS.forEach((q) => {
      if (!form[q.key]) nextErrors[q.key] = "Please choose one.";
    });
    if (form.age && (Number(form.age) < 18 || Number(form.age) > 80)) {
      nextErrors.age = "Age must be between 18 and 80.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const budget = BUDGETS.find((b) => b.label === form.budget);
    setSaveState("saving");
    setFormError("");
    try {
      const token = readStored(TOKEN_KEY);
      const response = await fetch(`${API_URL}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          city: form.city,
          budget_min: budget.min,
          budget_max: budget.max,
          available_from: form.moveIn,
          age: form.age ? Number(form.age) : null,
          occupation: form.occupation,
          bio: form.bio,
          sleep_schedule: form.sleep_schedule,
          cleanliness: form.cleanliness,
          social_style: form.social_style,
          visible: form.visible,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not save your profile.");
      setSaveState("saved");
    } catch (err) {
      setSaveState("idle");
      setFormError(
        err instanceof TypeError
          ? "Could not reach the CoLive server. Please check that the Flask backend is running."
          : err.message
      );
    }
  };

  // A saved move-in month that is now in the past still needs to be shown.
  const moveInChoices =
    form.moveIn && !moveInOptions.some((m) => m.value === form.moveIn)
      ? [{ value: form.moveIn, label: form.moveIn }, ...moveInOptions]
      : moveInOptions;

  return (
    <section className="auth-section" aria-labelledby="profile-title">
      <div className="container auth-wrap">
        <div className="auth-card profile-card">
          <span className="eyebrow">Your lifestyle profile</span>
          <h1 id="profile-title">Tell us how you live</h1>
          <p className="auth-sub">
            Your answers are used to calculate compatibility scores in search. It takes
            about a minute.
          </p>

          {loadState === "loading" && <p className="results-msg">Loading your profile…</p>}

          {loadState === "error" && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}

          {loadState === "ready" && (
            <form className="auth-form" onSubmit={handleSubmit} noValidate id="profile-form">
              {QUESTIONS.map((q) => (
                <fieldset className="choice-group" key={q.key}>
                  <legend>{q.label}</legend>
                  <div className="choices">
                    {q.options.map((opt) => (
                      <label
                        key={opt}
                        className={`choice ${form[q.key] === opt ? "is-selected" : ""}`}
                      >
                        <input
                          type="radio"
                          name={q.key}
                          value={opt}
                          checked={form[q.key] === opt}
                          onChange={() => setField(q.key, opt)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                  {errors[q.key] && (
                    <span className="field-error" role="alert">
                      {errors[q.key]}
                    </span>
                  )}
                </fieldset>
              ))}

              <div className="field">
                <label htmlFor="p-city">Preferred city</label>
                <select
                  id="p-city"
                  value={form.city}
                  onChange={(e) => setField("city", e.target.value)}
                  aria-invalid={Boolean(errors.city)}
                >
                  <option value="">Select a city</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.city && (
                  <span className="field-error" role="alert">
                    {errors.city}
                  </span>
                )}
              </div>

              <div className="field">
                <label htmlFor="p-budget">Monthly budget</label>
                <select
                  id="p-budget"
                  value={form.budget}
                  onChange={(e) => setField("budget", e.target.value)}
                  aria-invalid={Boolean(errors.budget)}
                >
                  <option value="">Select a budget</option>
                  {BUDGETS.map((b) => (
                    <option key={b.label} value={b.label}>
                      {b.label}
                    </option>
                  ))}
                </select>
                {errors.budget && (
                  <span className="field-error" role="alert">
                    {errors.budget}
                  </span>
                )}
              </div>

              <div className="field">
                <label htmlFor="p-movein">Available from</label>
                <select
                  id="p-movein"
                  value={form.moveIn}
                  onChange={(e) => setField("moveIn", e.target.value)}
                  aria-invalid={Boolean(errors.moveIn)}
                >
                  <option value="">Select a month</option>
                  {moveInChoices.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                {errors.moveIn && (
                  <span className="field-error" role="alert">
                    {errors.moveIn}
                  </span>
                )}
              </div>

              <div className="field">
                <label htmlFor="p-age">Age (optional)</label>
                <input
                  id="p-age"
                  type="number"
                  min="18"
                  max="80"
                  value={form.age}
                  onChange={(e) => setField("age", e.target.value)}
                  aria-invalid={Boolean(errors.age)}
                />
                {errors.age && (
                  <span className="field-error" role="alert">
                    {errors.age}
                  </span>
                )}
              </div>

              <div className="field">
                <label htmlFor="p-occupation">Student or work (optional)</label>
                <input
                  id="p-occupation"
                  type="text"
                  maxLength={60}
                  placeholder="e.g. Engineering student"
                  value={form.occupation}
                  onChange={(e) => setField("occupation", e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="p-bio">Short bio (optional)</label>
                <textarea
                  id="p-bio"
                  rows={3}
                  maxLength={200}
                  placeholder="What would make a flatshare great for you?"
                  value={form.bio}
                  onChange={(e) => setField("bio", e.target.value)}
                />
                <small className="hint">{form.bio.length}/200</small>
              </div>

              <label className="check-row">
                <input
                  type="checkbox"
                  checked={form.visible}
                  onChange={(e) => setField("visible", e.target.checked)}
                />
                <span>
                  Show my profile to other people searching. Only your name and these
                  answers are shown, never your email.
                </span>
              </label>

              {formError && (
                <p className="form-error" role="alert">
                  {formError}
                </p>
              )}

              {saveState === "saved" && (
                <p className="form-success" role="status">
                  Profile saved. Your searches now show compatibility scores.{" "}
                  <a href="#search">Go to search</a>
                </p>
              )}

              <button
                className="btn btn-primary btn-lg auth-submit"
                type="submit"
                disabled={saveState === "saving"}
              >
                {saveState === "saving" ? "Saving…" : "Save Profile"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- App ---------- */

function useHash() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}

export default function App() {
  const hash = useHash();
  const view =
    hash === "#login"
      ? "login"
      : hash === "#signup"
      ? "signup"
      : hash === "#profile"
      ? "profile"
      : "home";

  const [user, setUser] = useState(() => {
    try {
      const raw = readStored(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Check that a saved login is still valid.
  useEffect(() => {
    const token = readStored(TOKEN_KEY);
    if (!token) return;
    fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          writeStored(USER_KEY, JSON.stringify(data.user));
        } else if (res.status === 401) {
          writeStored(TOKEN_KEY, null);
          writeStored(USER_KEY, null);
          setUser(null);
        }
      })
      .catch(() => {
        /* server offline: keep the saved login for now */
      });
  }, []);

  // Scroll to a section after switching from the Log In page back to the homepage.
  useEffect(() => {
    if (view !== "home") {
      window.scrollTo(0, 0);
      return;
    }
    const id = hash.replace("#", "");
    if (!id) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView();
    }, 0);
    return () => clearTimeout(timer);
  }, [view, hash]);

  const handleAuthSuccess = (token, nextUser) => {
    writeStored(TOKEN_KEY, token);
    writeStored(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    if (hash !== "#profile") window.location.hash = "#top";
  };

  const handleLogout = () => {
    writeStored(TOKEN_KEY, null);
    writeStored(USER_KEY, null);
    setUser(null);
  };

  return (
    <>
      <a
        className="skip-link"
        href={view === "home" ? "#search" : view === "profile" ? "#profile-form" : "#auth-form"}
      >
        {view === "home" ? "Skip to search" : "Skip to form"}
      </a>
      <Navbar user={user} onLogout={handleLogout} />
      <main>
        {view === "home" ? (
          <>
            <Hero />
            <SearchSection />
            <Features />
            <HowItWorks />
            <WhyChoose />
            <CtaBanner />
          </>
        ) : view === "profile" && user ? (
          <ProfilePage />
        ) : (
          <AuthPage
            mode={view === "signup" ? "signup" : "login"}
            onAuthSuccess={handleAuthSuccess}
          />
        )}
      </main>
      <Footer />
    </>
  );
}
