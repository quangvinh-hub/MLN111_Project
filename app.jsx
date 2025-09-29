/* global React, ReactDOM */

const ROLES = [
  {
    id: "government",
    name: "Government",
    blurb: "Budget stability, climate goals, national image.",
    chips: ["Revenue", "Macro stability", "Energy transition"],
  },
  {
    id: "workers",
    name: "Workers",
    blurb: "Cost of living pressure, wages, transport costs.",
    chips: ["Living costs", "Wages", "Transport"],
  },
  {
    id: "students",
    name: "Students",
    blurb: "Fairness, transparency, future outlook.",
    chips: ["Transparency", "Opportunity", "Voice"],
  },
  {
    id: "business",
    name: "Big Business",
    blurb: "Profits, logistics, PR & lobbying.",
    chips: ["Profit", "Supply chain", "Lobbying"],
  },
];

const CASES = [
  {
    id: "usa-2011",
    title: "USA — 'We are the 99%' (2011)",
    summary:
      "Occupy highlighted post-2008 inequality. Leaderless but reshaped discourse on distribution.",
    deep: "Occupy Wall Street began at Zuccotti Park in 2011, reacting to financial power and inequality after the 2008 crisis. The movement, despite lacking formal leadership, pushed income distribution to the center of public debate and illustrated how class interests can clash with the majority population.",
    sources: ["Al Jazeera"],
  },
  {
    id: "france-2018",
    title: "France — Gilets Jaunes (2018–2019)",
    summary:
      "Sparked by fuel-tax hikes, broadened into cost-of-living revolt seen as against “policies for the rich.”",
    deep: "Originating online against a fuel-tax increase, the Yellow Vests quickly became a leaderless nationwide movement expressing rural and lower-middle frustrations. Government partially backtracked. It showed how “national interest” narratives (e.g., climate goals) can collide with everyday livelihoods.",
    sources: ["Wikipedia"],
  },
  {
    id: "indo-2019",
    title: "Indonesia — Student Protests (2019)",
    summary:
      "Protested law changes weakening the anti-graft body and other controversial articles, leading to mass rallies.",
    deep: "In 2019, proposed revisions that curbed the anti-corruption commission triggered large student-led demonstrations nationwide. Tension reflected a clash between state-order priorities and civic demands for accountability and rule of law.",
    sources: ["Reuters"],
  },
];

const INITIAL_STATE = {
  turn: 1,
  maxTurns: 6,
  conflict: 25, // starts after policy announcement - slightly higher for more tension
  governmentPopularity: 65, // slightly lower initial popularity for more challenge
  feed: [
    {
      t: 0,
      text: "Policy announced: +15% fuel tax to fund infrastructure & energy transition.",
    },
  ],
};

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function ConflictMeter({ value }) {
  const pct = clamp(value, 0, 100);
  return (
    <div>
      <div className="meter" aria-label="Conflict meter">
        <span style={{ width: `${pct}%` }} />
      </div>
      <div className="meter-label">
        <span>Calm</span>
        <span>{pct}%</span>
        <span>Crisis</span>
      </div>
    </div>
  );
}

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function CaseStudies() {
  const [openId, setOpenId] = React.useState(null);
  const [tab, setTab] = React.useState("summary");
  const openCase = CASES.find((c) => c.id === openId);

  return (
    <div className="card" style={{ gridColumn: "span 6" }}>
      <h3>Case Studies</h3>
      <p>Tap to learn how similar tensions unfolded.</p>
      <div
        className="roles"
        style={{ gridTemplateColumns: "repeat(3, minmax(0,1fr))" }}
      >
        {CASES.map((cs) => (
          <div
            key={cs.id}
            className="role"
            onClick={() => {
              setOpenId(cs.id);
              setTab("summary");
            }}
          >
            <h4>{cs.title}</h4>
            <small>{cs.summary}</small>
          </div>
        ))}
      </div>

      <Modal open={!!openId} onClose={() => setOpenId(null)}>
        {openCase && (
          <>
            <h3>{openCase.title}</h3>
            <div className="tabs">
              <button
                className={`tab ${tab === "summary" ? "active" : ""}`}
                onClick={() => setTab("summary")}
              >
                Summary
              </button>
              <button
                className={`tab ${tab === "deep" ? "active" : ""}`}
                onClick={() => setTab("deep")}
              >
                Deep
              </button>
            </div>
            <div>
              {tab === "summary" ? (
                <p>{openCase.summary}</p>
              ) : (
                <p>{openCase.deep}</p>
              )}
              <p>
                <small>Sources: {openCase.sources.join(", ")}</small>
              </p>
            </div>
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
            >
              <button className="btn" onClick={() => setOpenId(null)}>
                Close
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

function RoleSelect({ value, onChange }) {
  return (
    <div className="card" style={{ gridColumn: "span 6" }}>
      <h3>Select Your Role</h3>
      <p>Choose a perspective to experience the policy shock.</p>
      <div className="roles">
        {ROLES.map((r) => (
          <div
            key={r.id}
            className={`role ${value === r.id ? "active" : ""}`}
            onClick={() => onChange(r.id)}
          >
            <h4>{r.name}</h4>
            <small>{r.blurb}</small>
            <div className="chips">
              {r.chips.map((c) => (
                <span key={c} className="chip">
                  {c}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function useSimulation(role) {
  const [state, setState] = React.useState(INITIAL_STATE);
  const [ended, setEnded] = React.useState(false);

  const log = React.useCallback((text) => {
    setState((s) => ({
      ...s,
      feed: [{ t: Date.now(), text }, ...s.feed].slice(0, 50),
    }));
  }, []);

  const applyAction = React.useCallback(
    (action) => {
      setState((s) => {
        let conflict = s.conflict;
        let govPop = s.governmentPopularity;

        // Role-specific multipliers for more realistic impact
        const roleMultipliers = {
          government: { conflict: 0.8, popularity: 1.2 }, // Government actions have less conflict impact
          workers: { conflict: 1.3, popularity: 0.9 }, // Workers have high conflict impact
          students: { conflict: 1.1, popularity: 0.8 }, // Students moderate impact
          business: { conflict: 0.7, popularity: 1.1 }, // Business has low conflict, high popularity impact
        };

        const multiplier = roleMultipliers[role] || {
          conflict: 1.0,
          popularity: 1.0,
        };

        if (action === "support") {
          conflict -= Math.round(8 * multiplier.conflict);
          govPop += Math.round(3 * multiplier.popularity);
          log(`${labelFor(role)} supported the policy. Stability improves.`);
        }
        if (action === "negotiate") {
          const negotiateEffect = Math.random() < 0.6 ? -6 : 6; // 60% chance of positive outcome
          conflict += Math.round(negotiateEffect * multiplier.conflict);
          govPop -= Math.round(1 * multiplier.popularity);
          log(`${labelFor(role)} pushed to modify terms. Tension shifts.`);
        }
        if (action === "oppose") {
          conflict += Math.round(12 * multiplier.conflict);
          govPop -= Math.round(8 * multiplier.popularity);
          log(`${labelFor(role)} organized protests. Pressure mounts.`);
        }

        // Reduced random shock frequency and impact
        if (Math.random() < 0.03) {
          // Reduced from 5% to 3%
          const shockImpact = Math.round(15 + Math.random() * 10); // 15-25 instead of fixed 30
          conflict += shockImpact;
          log(
            `Shock event: viral incident escalates tensions (+${shockImpact}).`
          );
        }

        conflict = clamp(conflict, 0, 100);
        govPop = clamp(govPop, 0, 100);

        let turn = s.turn + 1;
        let willEnd = turn > s.maxTurns;
        if (conflict >= 70) {
          log("Warning: Escalation risk rising. Streets tense.");
        }
        if (conflict >= 90) {
          log("Crisis: Confrontations erupt. Emergency measures considered.");
        }

        return { ...s, conflict, governmentPopularity: govPop, turn };
      });
    },
    [role, log]
  );

  React.useEffect(() => {
    // End after exceeding max turns
    if (state.turn > state.maxTurns && !ended) {
      setEnded(true);
      if (state.conflict < 50) {
        log("Outcome: Negotiated settlement stabilizes society.");
      } else if (state.conflict < 80) {
        log("Outcome: Uneasy truce. Popularity hit lingers.");
      } else {
        log(
          "Outcome: Crisis forces retreat or crackdown. Long-term trust declines."
        );
      }
    }
  }, [state.turn, state.maxTurns, state.conflict, ended, log]);

  const reset = React.useCallback(() => {
    setEnded(false);
    setState(INITIAL_STATE);
  }, []);

  return { state, ended, applyAction, reset };
}

function labelFor(role) {
  switch (role) {
    case "government":
      return "Government";
    case "workers":
      return "Workers";
    case "students":
      return "Students";
    case "business":
      return "Big Business";
    default:
      return "Unknown";
  }
}

function MiniGame({ role }) {
  const { state, ended, applyAction, reset } = useSimulation(role);
  const { conflict, governmentPopularity, turn, maxTurns, feed } = state;

  return (
    <div className="card" style={{ gridColumn: "span 12" }}>
      <h3>Fuel Tax Shock — Mini Simulation</h3>
      <p>
        Turns {turn}/{maxTurns}. Pick one action per turn from your role.
      </p>

      <div
        className="grid"
        style={{ gridTemplateColumns: "repeat(12,1fr)", gap: 14 }}
      >
        <div className="panel" style={{ gridColumn: "span 6" }}>
          <div className="actions">
            <button
              className="btn primary"
              disabled={ended}
              onClick={() => applyAction("support")}
            >
              Support
            </button>
            <button
              className="btn warn"
              disabled={ended}
              onClick={() => applyAction("negotiate")}
            >
              Negotiate
            </button>
            <button
              className="btn danger"
              disabled={ended}
              onClick={() => applyAction("oppose")}
            >
              Oppose
            </button>
            <button className="btn ghost" onClick={reset}>
              Reset
            </button>
          </div>

          <div>
            <h4 style={{ margin: "12px 0 6px" }}>Conflict</h4>
            <ConflictMeter value={conflict} />
          </div>

          <div>
            <h4 style={{ margin: "12px 0 6px" }}>Government Popularity</h4>
            <div className="meter">
              <span
                style={{
                  width: `${governmentPopularity}%`,
                  background: "linear-gradient(90deg,#7c5cff,#2ee6a6)",
                }}
              />
            </div>
            <div className="meter-label">
              <span>Low</span>
              <span>{governmentPopularity}%</span>
              <span>High</span>
            </div>
          </div>
        </div>

        <div className="panel" style={{ gridColumn: "span 6" }}>
          <h4 style={{ margin: "0 0 6px" }}>News Feed</h4>
          <div className="feed" aria-live="polite">
            {feed.map((e, i) => (
              <div key={i} className="event">
                <div>{e.text}</div>
                <small>{new Date(e.t).toLocaleString()}</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      {ended && (
        <div style={{ marginTop: 12 }}>
          <div className="event">
            <strong>Simulation complete.</strong> Discuss: whose interests were
            prioritized? What trade-offs worked?
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [role, setRole] = React.useState("government");

  return (
    <div className="container">
      <div className="hero">
        <div>
          <h1>The Nation's Voice</h1>
          <p>
            Explore interests and conflict through roles, case studies, and a
            quick simulation.
          </p>
        </div>
        <div className="actions">
          <a className="btn" href="#minigame">
            Play minigame
          </a>
          <a className="btn ghost" href="#cases">
            Read cases
          </a>
        </div>
      </div>

      <div className="grid">
        <RoleSelect value={role} onChange={setRole} />
        <CaseStudies />
      </div>

      <div id="minigame" className="grid" style={{ marginTop: 20 }}>
        <MiniGame role={role} />
      </div>

      <div className="footer">
        Built as a static demo with React (CDN). No build steps required.
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
