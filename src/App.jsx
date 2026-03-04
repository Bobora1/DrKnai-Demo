import { useState, useEffect } from "react";

// ─── Mock Data ───────────────────────────────────────────────
const PETS = [
  { id: 1, name: "Bella", breed: "Golden Retriever", age: 4, weight: 31.2, owner: "Sarah Chen", species: "Dog", status: "healthy", avatar: "🐕", lastVisit: "2026-02-18", nextAppt: "2026-03-12", healthScore: 92 },
  { id: 2, name: "Mochi", breed: "Persian Cat", age: 7, weight: 4.8, owner: "James Park", species: "Cat", status: "monitor", avatar: "🐈", lastVisit: "2026-02-25", nextAppt: "2026-03-05", healthScore: 74 },
  { id: 3, name: "Rex", breed: "German Shepherd", age: 6, weight: 38.5, owner: "Maria Lopez", species: "Dog", status: "alert", avatar: "🐕‍🦺", lastVisit: "2026-03-01", nextAppt: "2026-03-04", healthScore: 58 },
  { id: 4, name: "Luna", breed: "Maine Coon", age: 3, weight: 6.1, owner: "David Kim", species: "Cat", status: "healthy", avatar: "🐱", lastVisit: "2026-02-10", nextAppt: "2026-04-10", healthScore: 96 },
  { id: 5, name: "Max", breed: "Labrador", age: 9, weight: 34.0, owner: "Emily Turner", species: "Dog", status: "monitor", avatar: "🦮", lastVisit: "2026-02-28", nextAppt: "2026-03-15", healthScore: 67 },
  { id: 6, name: "Whiskers", breed: "Siamese", age: 5, weight: 3.9, owner: "Tom Nguyen", species: "Cat", status: "healthy", avatar: "😺", lastVisit: "2026-01-20", nextAppt: "2026-04-20", healthScore: 89 },
];

const CLAIMS = [
  { id: "CLM-2026-0847", pet: "Rex", owner: "Maria Lopez", amount: 4200, procedure: "ACL Surgery", date: "2026-03-01", riskScore: 87, flags: ["Photo metadata mismatch", "Claim filed 2hrs after policy activation", "Pre-existing condition suspected"], status: "flagged", provider: "Happy Paws Clinic" },
  { id: "CLM-2026-0812", pet: "Bella", owner: "Sarah Chen", amount: 380, procedure: "Annual Vaccination", date: "2026-02-18", riskScore: 8, flags: [], status: "approved", provider: "VetCare Central" },
  { id: "CLM-2026-0831", pet: "Mochi", owner: "James Park", amount: 1850, procedure: "Dental Cleaning + Extraction", date: "2026-02-25", riskScore: 42, flags: ["Unusual billing pattern for provider"], status: "review", provider: "Purrfect Health Vet" },
  { id: "CLM-2026-0855", pet: "Max", owner: "Emily Turner", amount: 6700, procedure: "Tumor Removal", date: "2026-02-28", riskScore: 63, flags: ["Amount exceeds regional average by 45%", "No prior diagnostic records"], status: "review", provider: "Animal Emergency Center" },
  { id: "CLM-2026-0801", pet: "Luna", owner: "David Kim", amount: 120, procedure: "Routine Checkup", date: "2026-02-10", riskScore: 3, flags: [], status: "approved", provider: "Feline Friends Clinic" },
];

const VET_NOTES_SAMPLE = `Patient: Rex (German Shepherd, 6y, 38.5kg)
Chief Complaint: Owner reports limping on right hind leg for 3 days. 
Decreased appetite. Whimpering when climbing stairs.

Physical Exam: Temperature 39.2°C (elevated). HR 110 bpm. 
Right stifle joint swollen, positive drawer sign. 
Pain response on palpation of right CCL region.
Body condition score 6/9.

Assessment: Suspected right cranial cruciate ligament (CCL) rupture.
Recommend radiographs to confirm. Possible partial tear vs complete rupture.

Plan:
- Radiograph right stifle (2 views)
- Start Carprofen 75mg BID x 7 days
- Strict rest, no stairs/jumping
- Recheck in 1 week
- Discuss surgical options (TPLO vs lateral suture)
- Send blood panel (CBC, Chem 17) pre-surgical workup`;

const XRAY_ANALYSIS_RESULTS = {
  findings: [
    { region: "Right Stifle Joint", severity: "high", finding: "Joint effusion consistent with CCL rupture", confidence: 94 },
    { region: "Tibial Plateau", severity: "medium", finding: "Mild osteophyte formation — early osteoarthritis", confidence: 87 },
    { region: "Patella", severity: "low", finding: "Normal positioning, no luxation", confidence: 96 },
    { region: "Femoral Condyles", severity: "low", finding: "No fractures or lesions detected", confidence: 98 },
  ],
  overallAssessment: "CCL Rupture — Surgical Consultation Recommended",
  breedRisk: "German Shepherds have 2.3x elevated CCL rupture risk",
};

const NLP_RESULTS = {
  entities: [
    { text: "Rex", type: "Patient", color: "#667eea" },
    { text: "German Shepherd", type: "Breed", color: "#8b5cf6" },
    { text: "6y", type: "Age", color: "#06b6d4" },
    { text: "38.5kg", type: "Weight", color: "#06b6d4" },
    { text: "limping on right hind leg", type: "Symptom", color: "#f59e0b" },
    { text: "3 days", type: "Duration", color: "#06b6d4" },
    { text: "Decreased appetite", type: "Symptom", color: "#f59e0b" },
    { text: "Whimpering", type: "Symptom", color: "#f59e0b" },
    { text: "39.2°C", type: "Vital Sign", color: "#ef4444" },
    { text: "110 bpm", type: "Vital Sign", color: "#ef4444" },
    { text: "cranial cruciate ligament (CCL) rupture", type: "Diagnosis", color: "#f43f5e" },
    { text: "Carprofen 75mg BID", type: "Medication", color: "#10b981" },
    { text: "TPLO", type: "Procedure", color: "#a855f7" },
    { text: "lateral suture", type: "Procedure", color: "#a855f7" },
    { text: "CBC, Chem 17", type: "Lab Test", color: "#3b82f6" },
  ],
  claimAutoFill: {
    patientName: "Rex",
    breed: "German Shepherd",
    diagnosis: "Cranial Cruciate Ligament (CCL) Rupture",
    diagnosisCode: "VET-ORTH-CCL-001",
    procedures: ["Radiograph (2 views)", "Carprofen 75mg BID x7d", "TPLO Surgery (pending)"],
    estimatedCost: "$3,800 – $5,200",
  }
};

// ─── Styles ──────────────────────────────────────────────────
const C = {
  bg: "#f4f6fb",
  surface: "#ffffff",
  surfaceHover: "#f0f2f8",
  card: "rgba(255,255,255,0.85)",
  cardHover: "rgba(255,255,255,1)",
  border: "rgba(0,0,0,0.07)",
  borderHover: "rgba(102,126,234,0.35)",
  text: "#1e293b",
  textMuted: "#64748b",
  textDim: "#94a3b8",
  accent1: "#5b6fe6",
  accent2: "#7c4daf",
  accent3: "#d946ef",
  accent4: "#059669",
  danger: "#dc2626",
  warning: "#d97706",
  gradientText: "linear-gradient(135deg, #5b6fe6, #7c4daf, #d946ef)",
};

// ─── Utility Components ──────────────────────────────────────
const GradientText = ({ children, style }) => (
  <span style={{ background: C.gradientText, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", ...style }}>
    {children}
  </span>
);

const Card = ({ children, style, onClick, hover = true }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered && hover ? C.cardHover : C.card,
        border: `1px solid ${hovered && hover ? C.borderHover : C.border}`,
        borderRadius: 16, padding: 24, transition: "all 0.3s ease",
        transform: hovered && hover ? "translateY(-2px)" : "none",
        cursor: onClick ? "pointer" : "default",
        boxShadow: hovered && hover
          ? "0 8px 30px rgba(91,111,230,0.10), 0 2px 8px rgba(0,0,0,0.06)"
          : "0 1px 4px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Badge = ({ children, color = C.accent1, style }) => (
  <span style={{
    background: `${color}22`, color, fontSize: 11, fontWeight: 700,
    padding: "4px 10px", borderRadius: 20, letterSpacing: 0.5,
    textTransform: "uppercase", border: `1px solid ${color}33`, ...style,
  }}>
    {children}
  </span>
);

const ProgressBar = ({ value, max = 100, color = C.accent1, height = 8 }) => (
  <div style={{ width: "100%", height, background: "rgba(0,0,0,0.06)", borderRadius: height / 2, overflow: "hidden" }}>
    <div style={{
      width: `${(value / max) * 100}%`, height: "100%", borderRadius: height / 2,
      background: `linear-gradient(90deg, ${color}, ${color}88)`,
      transition: "width 1.5s ease",
    }} />
  </div>
);

const StatusDot = ({ status }) => {
  const colors = { healthy: C.accent4, monitor: C.warning, alert: C.danger, approved: C.accent4, review: C.warning, flagged: C.danger };
  return <span style={{ width: 10, height: 10, borderRadius: "50%", background: colors[status] || C.textMuted, display: "inline-block", boxShadow: `0 0 6px ${colors[status] || C.textMuted}44` }} />;
};

const AnimatedNumber = ({ target, duration = 1500 }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <>{val.toLocaleString()}</>;
};

const SectionTitle = ({ children, subtitle }) => (
  <div style={{ marginBottom: 28 }}>
    <h2 style={{ fontSize: 28, fontWeight: 800, color: C.text, margin: 0, letterSpacing: -0.5, fontFamily: "'DM Sans', sans-serif" }}>{children}</h2>
    {subtitle && <p style={{ fontSize: 14, color: C.textMuted, margin: "6px 0 0", fontFamily: "'DM Sans', sans-serif" }}>{subtitle}</p>}
  </div>
);

const TabBar = ({ tabs, active, onChange }) => (
  <div style={{ display: "flex", gap: 4, background: "rgba(0,0,0,0.03)", borderRadius: 12, padding: 4, marginBottom: 24 }}>
    {tabs.map(t => (
      <button
        key={t.id}
        onClick={() => onChange(t.id)}
        style={{
          flex: 1, padding: "10px 16px", borderRadius: 10, border: "none",
          background: active === t.id ? "rgba(91,111,230,0.1)" : "transparent",
          color: active === t.id ? "#5b6fe6" : C.textMuted,
          fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
          fontFamily: "'DM Sans', sans-serif",
          borderBottom: active === t.id ? "2px solid #5b6fe6" : "2px solid transparent",
        }}
      >
        {t.icon} {t.label}
      </button>
    ))}
  </div>
);

// ─── Pages ───────────────────────────────────────────────────

// DASHBOARD
const Dashboard = ({ setPage, setSelectedPet }) => {
  const alerts = PETS.filter(p => p.status === "alert" || p.status === "monitor");
  const flaggedClaims = CLAIMS.filter(c => c.status === "flagged" || c.status === "review");

  return (
    <div>
      <SectionTitle subtitle="Real-time overview of your clinic's AI-powered insights">Dashboard</SectionTitle>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total Patients", value: 847, icon: "🐾", color: C.accent1 },
          { label: "AI Analyses Today", value: 23, icon: "🧠", color: C.accent2 },
          { label: "Claims Processed", value: 156, icon: "📋", color: C.accent3 },
          { label: "Avg Health Score", value: 79, icon: "💚", color: C.accent4, suffix: "/100" },
        ].map((s, i) => (
          <Card key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: s.color, fontFamily: "'DM Sans', sans-serif" }}>
              <AnimatedNumber target={s.value} />{s.suffix || ""}
            </div>
            <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4, fontWeight: 600 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Alerts */}
        <Card style={{ padding: 0, overflow: "hidden" }} hover={false}>
          <div style={{ padding: "18px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: C.text }}>⚠️ Health Alerts</span>
            <Badge color={C.danger}>{alerts.length} Active</Badge>
          </div>
          {alerts.map(p => (
            <div
              key={p.id}
              onClick={() => { setSelectedPet(p); setPage("records"); }}
              style={{
                padding: "14px 24px", display: "flex", alignItems: "center", gap: 14,
                borderBottom: `1px solid ${C.border}`, cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.02)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize: 28 }}>{p.avatar}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>{p.name} <span style={{ color: C.textMuted, fontWeight: 500 }}>— {p.breed}</span></div>
                <div style={{ fontSize: 12, color: C.textMuted }}>{p.owner}</div>
              </div>
              <StatusDot status={p.status} />
              <div style={{ fontSize: 20, fontWeight: 800, color: p.healthScore < 70 ? C.danger : C.warning }}>{p.healthScore}</div>
            </div>
          ))}
        </Card>

        {/* Flagged Claims */}
        <Card style={{ padding: 0, overflow: "hidden" }} hover={false}>
          <div style={{ padding: "18px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: C.text }}>🛡️ Flagged Claims</span>
            <Badge color={C.warning}>{flaggedClaims.length} Require Review</Badge>
          </div>
          {flaggedClaims.map(cl => (
            <div
              key={cl.id}
              onClick={() => setPage("insurance")}
              style={{
                padding: "14px 24px", display: "flex", alignItems: "center", gap: 14,
                borderBottom: `1px solid ${C.border}`, cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.02)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: cl.riskScore > 70 ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 900,
                color: cl.riskScore > 70 ? C.danger : C.warning,
              }}>
                {cl.riskScore}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>{cl.id}</div>
                <div style={{ fontSize: 12, color: C.textMuted }}>{cl.procedure} — ${cl.amount.toLocaleString()}</div>
              </div>
              <Badge color={cl.status === "flagged" ? C.danger : C.warning}>{cl.status}</Badge>
            </div>
          ))}
        </Card>
      </div>

      {/* AI Modules Quick Access */}
      <div style={{ marginTop: 28 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 16 }}>🧠 AI Modules</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {[
            { icon: "👁️", name: "PetVision", desc: "Image & X-ray Analysis", color: "#667eea", page: "vision" },
            { icon: "🔊", name: "PetSound", desc: "Audio & Bark Analysis", color: "#8b5cf6", page: "sound" },
            { icon: "📡", name: "PetSense", desc: "Sensor & Vitals Data", color: "#06b6d4", page: "sense" },
            { icon: "📝", name: "PetText", desc: "NLP & Notes Extraction", color: "#f59e0b", page: "text" },
          ].map(m => (
            <Card key={m.name} onClick={() => setPage(m.page)} style={{ textAlign: "center", cursor: "pointer" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>{m.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: m.color }}>{m.name}</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{m.desc}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// PATIENT RECORDS
const PatientRecords = ({ selectedPet, setSelectedPet }) => {
  const [search, setSearch] = useState("");
  const filtered = PETS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.breed.toLowerCase().includes(search.toLowerCase()) ||
    p.owner.toLowerCase().includes(search.toLowerCase())
  );

  const detail = selectedPet;

  return (
    <div>
      <SectionTitle subtitle="Unified digital records replacing paper + digital chaos">Patient Records</SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: detail ? "340px 1fr" : "1fr", gap: 20 }}>
        {/* Patient List */}
        <Card style={{ padding: 0, overflow: "hidden", maxHeight: 700 }} hover={false}>
          <div style={{ padding: 16, borderBottom: `1px solid ${C.border}` }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search patients..."
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 10,
                background: "rgba(0,0,0,0.03)", border: `1px solid ${C.border}`,
                color: C.text, fontSize: 14, outline: "none", fontFamily: "'DM Sans', sans-serif",
              }}
            />
          </div>
          <div style={{ overflowY: "auto", maxHeight: 620 }}>
            {filtered.map(p => (
              <div
                key={p.id}
                onClick={() => setSelectedPet(p)}
                style={{
                  padding: "14px 20px", display: "flex", alignItems: "center", gap: 14,
                  borderBottom: `1px solid ${C.border}`, cursor: "pointer",
                  background: detail?.id === p.id ? "rgba(91,111,230,0.07)" : "transparent",
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => { if (detail?.id !== p.id) e.currentTarget.style.background = "rgba(0,0,0,0.02)"; }}
                onMouseLeave={e => { if (detail?.id !== p.id) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ fontSize: 30 }}>{p.avatar}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>{p.breed} · {p.age}y · {p.weight}kg</div>
                </div>
                <StatusDot status={p.status} />
              </div>
            ))}
          </div>
        </Card>

        {/* Patient Detail */}
        {detail && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Header */}
            <Card hover={false} style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{
                width: 80, height: 80, borderRadius: 20,
                background: "linear-gradient(135deg, rgba(91,111,230,0.1), rgba(124,77,175,0.1))",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44,
                border: `2px solid ${C.borderHover}`,
              }}>
                {detail.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: C.text }}>{detail.name}</div>
                <div style={{ fontSize: 14, color: C.textMuted }}>{detail.breed} · {detail.species} · {detail.age} years · {detail.weight} kg</div>
                <div style={{ fontSize: 13, color: C.textDim, marginTop: 4 }}>Owner: {detail.owner}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: 70, height: 70, borderRadius: "50%",
                  background: `conic-gradient(${detail.healthScore > 80 ? C.accent4 : detail.healthScore > 60 ? C.warning : C.danger} ${detail.healthScore * 3.6}deg, rgba(0,0,0,0.06) 0deg)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%", background: "#ffffff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, fontWeight: 900, color: C.text,
                  }}>
                    {detail.healthScore}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4, fontWeight: 600 }}>Health Score</div>
              </div>
            </Card>

            {/* Info Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <Card hover={false}>
                <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, marginBottom: 6 }}>Last Visit</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{detail.lastVisit}</div>
              </Card>
              <Card hover={false}>
                <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, marginBottom: 6 }}>Next Appointment</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{detail.nextAppt}</div>
              </Card>
              <Card hover={false}>
                <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, marginBottom: 6 }}>Status</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <StatusDot status={detail.status} />
                  <span style={{ fontSize: 16, fontWeight: 700, color: C.text, textTransform: "capitalize" }}>{detail.status}</span>
                </div>
              </Card>
            </div>

            {/* Multimodal Records */}
            <Card hover={false}>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 16 }}>📁 Multimodal Records</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
                {[
                  { icon: "👁️", label: "X-rays", count: 3, color: "#667eea" },
                  { icon: "🔊", label: "Audio", count: 2, color: "#8b5cf6" },
                  { icon: "📡", label: "Sensor", count: 14, color: "#06b6d4" },
                  { icon: "📝", label: "Notes", count: 8, color: "#f59e0b" },
                  { icon: "🏥", label: "Lab Results", count: 4, color: "#f093fb" },
                ].map(r => (
                  <div key={r.label} style={{
                    textAlign: "center", padding: 16, borderRadius: 12,
                    background: `${r.color}0a`, border: `1px solid ${r.color}22`,
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{r.icon}</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: r.color }}>{r.count}</div>
                    <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600 }}>{r.label}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Timeline */}
            <Card hover={false} style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 16 }}>📅 Recent Activity</div>
              {[
                { date: "Mar 1", event: "Exam: Suspected CCL rupture", type: "visit", color: C.danger },
                { date: "Feb 28", event: "PetSense alert: Elevated HR", type: "ai", color: C.warning },
                { date: "Feb 25", event: "PetSound: Distress vocalization detected", type: "ai", color: "#8b5cf6" },
                { date: "Feb 18", event: "Routine checkup — All clear", type: "visit", color: C.accent4 },
              ].map((ev, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: ev.color, boxShadow: `0 0 8px ${ev.color}66`, flexShrink: 0 }} />
                  <div style={{ fontSize: 12, color: C.textDim, width: 60, fontWeight: 600 }}>{ev.date}</div>
                  <div style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>{ev.event}</div>
                  <Badge color={ev.type === "ai" ? C.accent2 : C.textMuted} style={{ marginLeft: "auto" }}>{ev.type === "ai" ? "AI Insight" : "Visit"}</Badge>
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

// PET VISION
const PetVision = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const runAnalysis = () => {
    setAnalyzing(true);
    setResults(null);
    setTimeout(() => { setAnalyzing(false); setResults(XRAY_ANALYSIS_RESULTS); }, 2800);
  };

  return (
    <div>
      <SectionTitle subtitle="AI-powered X-ray analysis, breed recognition, and health indicator detection">PetVision — Image Analysis</SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Left: Upload & Image */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card hover={false}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.textMuted, marginBottom: 12 }}>PATIENT: Rex — German Shepherd, 6y</div>
            {/* Simulated X-ray */}
            <div style={{
              width: "100%", height: 340, borderRadius: 12, position: "relative",
              background: "linear-gradient(135deg, #e8eaf2 0%, #dfe2ec 100%)",
              border: `1px solid ${C.border}`, overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 72, marginBottom: 8, opacity: 0.3 }}>🦴</div>
                <div style={{ fontSize: 18, color: C.textDim, fontWeight: 700 }}>Right Stifle X-ray</div>
                <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>2 views — Lateral & CrCd</div>
              </div>

              {/* Simulated heatmap overlay */}
              {results && (
                <>
                  <div style={{
                    position: "absolute", width: 120, height: 120, borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(239,68,68,0.35), transparent 70%)",
                    top: "30%", left: "55%", transform: "translate(-50%,-50%)",
                    animation: "pulse 2s ease-in-out infinite",
                  }} />
                  <div style={{
                    position: "absolute", width: 80, height: 80, borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(245,158,11,0.25), transparent 70%)",
                    top: "55%", left: "45%", transform: "translate(-50%,-50%)",
                  }} />
                  <div style={{
                    position: "absolute", top: "28%", left: "55%", transform: "translate(-50%,-50%)",
                    background: "rgba(239,68,68,0.9)", color: "#ffffff", fontSize: 10, fontWeight: 800,
                    padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap",
                  }}>
                    Joint Effusion — 94%
                  </div>
                </>
              )}
            </div>

            <button
              onClick={runAnalysis}
              disabled={analyzing}
              style={{
                width: "100%", padding: "14px", marginTop: 16, borderRadius: 12,
                background: analyzing ? "rgba(91,111,230,0.12)" : "linear-gradient(135deg, #5b6fe6, #7c4daf)",
                border: "none", color: "#ffffff", fontSize: 15, fontWeight: 800,
                cursor: analyzing ? "wait" : "pointer", transition: "all 0.3s",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {analyzing ? "🔄 Analyzing with PetVision AI..." : "🧠 Run PetVision Analysis"}
            </button>
          </Card>
        </div>

        {/* Right: Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {analyzing && (
            <Card hover={false} style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔬</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.accent1, marginBottom: 12 }}>Processing X-ray...</div>
              <ProgressBar value={75} color={C.accent1} />
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 12 }}>Detecting anomalies across 4 regions...</div>
            </Card>
          )}

          {results && (
            <>
              {/* Overall Assessment */}
              <Card hover={false} style={{ background: "rgba(220,38,38,0.05)", borderColor: "rgba(220,38,38,0.15)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 24 }}>🚨</span>
                  <div style={{ fontSize: 20, fontWeight: 900, color: C.danger }}>{results.overallAssessment}</div>
                </div>
                <div style={{ fontSize: 13, color: C.warning, fontWeight: 600 }}>⚠️ {results.breedRisk}</div>
              </Card>

              {/* Findings */}
              {results.findings.map((f, i) => (
                <Card key={i} hover={false}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{f.region}</div>
                    <Badge color={f.severity === "high" ? C.danger : f.severity === "medium" ? C.warning : C.accent4}>
                      {f.severity}
                    </Badge>
                  </div>
                  <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 10 }}>{f.finding}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <ProgressBar value={f.confidence} color={f.severity === "high" ? C.danger : f.severity === "medium" ? C.warning : C.accent4} />
                    <span style={{ fontSize: 13, fontWeight: 800, color: C.text, minWidth: 36 }}>{f.confidence}%</span>
                  </div>
                </Card>
              ))}
            </>
          )}

          {!analyzing && !results && (
            <Card hover={false} style={{ textAlign: "center", padding: 60 }}>
              <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.4 }}>👁️</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.textMuted }}>Run PetVision to see analysis</div>
              <div style={{ fontSize: 13, color: C.textDim, marginTop: 8 }}>AI will detect anomalies, grade severity, and provide breed-specific risk context</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// PET TEXT (NLP)
const PetText = () => {
  const [text, setText] = useState(VET_NOTES_SAMPLE);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [tab, setTab] = useState("entities");

  const runNLP = () => {
    setAnalyzing(true);
    setResults(null);
    setTimeout(() => { setAnalyzing(false); setResults(NLP_RESULTS); }, 2200);
  };

  return (
    <div>
      <SectionTitle subtitle="Extract diagnoses, medications, procedures, and auto-fill insurance claims from vet notes">PetText — NLP Engine</SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Left: Input */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card hover={false}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.textMuted, marginBottom: 12 }}>VET NOTES INPUT</div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              style={{
                width: "100%", height: 360, padding: 16, borderRadius: 12,
                background: "#f8f9fc", border: `1px solid ${C.border}`,
                color: C.text, fontSize: 13, lineHeight: 1.7, resize: "none",
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace", outline: "none",
              }}
            />
            <button
              onClick={runNLP}
              disabled={analyzing}
              style={{
                width: "100%", padding: "14px", marginTop: 12, borderRadius: 12,
                background: analyzing ? "rgba(217,119,6,0.12)" : "linear-gradient(135deg, #d97706, #ea580c)",
                border: "none", color: "#ffffff", fontSize: 15, fontWeight: 800,
                cursor: analyzing ? "wait" : "pointer", fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {analyzing ? "🔄 Extracting with PetText AI..." : "📝 Run PetText Analysis"}
            </button>
          </Card>
        </div>

        {/* Right: Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {analyzing && (
            <Card hover={false} style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.warning, marginBottom: 12 }}>Parsing veterinary notes...</div>
              <ProgressBar value={65} color={C.warning} />
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 12 }}>Extracting entities, diagnoses, and procedures...</div>
            </Card>
          )}

          {results && (
            <>
              <TabBar
                tabs={[
                  { id: "entities", icon: "🏷️", label: "Entities" },
                  { id: "claim", icon: "📋", label: "Auto-Fill Claim" },
                ]}
                active={tab}
                onChange={setTab}
              />

              {tab === "entities" && (
                <Card hover={false} style={{ maxHeight: 460, overflowY: "auto" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                    {[...new Set(results.entities.map(e => e.type))].map(type => {
                      const entity = results.entities.find(e => e.type === type);
                      return (
                        <Badge key={type} color={entity.color}>
                          {type} ({results.entities.filter(e => e.type === type).length})
                        </Badge>
                      );
                    })}
                  </div>
                  {results.entities.map((e, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                      borderBottom: i < results.entities.length - 1 ? `1px solid ${C.border}` : "none",
                    }}>
                      <div style={{
                        width: 4, height: 32, borderRadius: 2, background: e.color, flexShrink: 0,
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{e.text}</div>
                      </div>
                      <Badge color={e.color}>{e.type}</Badge>
                    </div>
                  ))}
                </Card>
              )}

              {tab === "claim" && (
                <Card hover={false}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                    <span style={{ fontSize: 22 }}>✨</span>
                    <div style={{ fontSize: 16, fontWeight: 800, color: C.accent4 }}>Insurance Claim Auto-Filled from Notes</div>
                  </div>
                  {Object.entries(results.claimAutoFill).map(([key, val]) => (
                    <div key={key} style={{ display: "flex", padding: "12px 0", borderBottom: `1px solid ${C.border}`, gap: 16 }}>
                      <div style={{ width: 140, fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5, paddingTop: 2 }}>
                        {key.replace(/([A-Z])/g, " $1")}
                      </div>
                      <div style={{ flex: 1, fontSize: 15, fontWeight: 600, color: C.text }}>
                        {Array.isArray(val) ? val.join(" · ") : val}
                      </div>
                    </div>
                  ))}
                  <button style={{
                    width: "100%", padding: "12px", marginTop: 20, borderRadius: 12,
                    background: "linear-gradient(135deg, #10b981, #06b6d4)",
                    border: "none", color: "#ffffff", fontSize: 14, fontWeight: 800, cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    📤 Submit Claim to Insurer
                  </button>
                </Card>
              )}
            </>
          )}

          {!analyzing && !results && (
            <Card hover={false} style={{ textAlign: "center", padding: 60 }}>
              <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.4 }}>📝</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.textMuted }}>Paste vet notes and run PetText</div>
              <div style={{ fontSize: 13, color: C.textDim, marginTop: 8 }}>Extracts diagnoses, meds, procedures + auto-fills claims</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// INSURANCE FRAUD DETECTION
const InsuranceFraud = () => {
  const [selected, setSelected] = useState(CLAIMS[0]);

  return (
    <div>
      <SectionTitle subtitle="AI-powered claim verification and fraud risk scoring — tackling a $600M problem">Insurance Fraud Detection</SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 20 }}>
        {/* Claims List */}
        <Card style={{ padding: 0, overflow: "hidden" }} hover={false}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>Claims Queue</div>
          </div>
          {CLAIMS.map(cl => (
            <div
              key={cl.id}
              onClick={() => setSelected(cl)}
              style={{
                padding: "14px 20px", borderBottom: `1px solid ${C.border}`, cursor: "pointer",
                background: selected?.id === cl.id ? "rgba(91,111,230,0.07)" : "transparent",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => { if (selected?.id !== cl.id) e.currentTarget.style.background = "rgba(0,0,0,0.02)"; }}
              onMouseLeave={e => { if (selected?.id !== cl.id) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{cl.id}</span>
                <Badge color={cl.status === "approved" ? C.accent4 : cl.status === "flagged" ? C.danger : C.warning}>{cl.status}</Badge>
              </div>
              <div style={{ fontSize: 12, color: C.textMuted }}>{cl.pet} — {cl.procedure}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>${cl.amount.toLocaleString()}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, color: C.textMuted }}>Risk:</span>
                  <span style={{
                    fontSize: 14, fontWeight: 900,
                    color: cl.riskScore > 70 ? C.danger : cl.riskScore > 30 ? C.warning : C.accent4,
                  }}>{cl.riskScore}</span>
                </div>
              </div>
            </div>
          ))}
        </Card>

        {/* Claim Detail */}
        {selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Header */}
            <Card hover={false} style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{
                width: 80, height: 80, borderRadius: 20,
                background: selected.riskScore > 70
                  ? "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.1))"
                  : selected.riskScore > 30
                  ? "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.1))"
                  : "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.1))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, fontWeight: 900,
                color: selected.riskScore > 70 ? C.danger : selected.riskScore > 30 ? C.warning : C.accent4,
                border: `2px solid ${selected.riskScore > 70 ? "rgba(239,68,68,0.3)" : selected.riskScore > 30 ? "rgba(245,158,11,0.3)" : "rgba(16,185,129,0.3)"}`,
              }}>
                {selected.riskScore}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: C.text }}>{selected.id}</div>
                <div style={{ fontSize: 14, color: C.textMuted }}>{selected.procedure} — {selected.provider}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: C.text }}>${selected.amount.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: C.textMuted }}>{selected.date}</div>
              </div>
            </Card>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Claim Details */}
              <Card hover={false}>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.textMuted, marginBottom: 16 }}>CLAIM DETAILS</div>
                {[
                  ["Pet", selected.pet],
                  ["Owner", selected.owner],
                  ["Provider", selected.provider],
                  ["Procedure", selected.procedure],
                  ["Date Filed", selected.date],
                  ["Amount", `$${selected.amount.toLocaleString()}`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 13, color: C.textMuted }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{v}</span>
                  </div>
                ))}
              </Card>

              {/* Risk Analysis */}
              <Card hover={false}>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.textMuted, marginBottom: 16 }}>AI RISK ANALYSIS</div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: C.textMuted }}>Fraud Risk Score</span>
                    <span style={{
                      fontSize: 14, fontWeight: 900,
                      color: selected.riskScore > 70 ? C.danger : selected.riskScore > 30 ? C.warning : C.accent4,
                    }}>{selected.riskScore}/100</span>
                  </div>
                  <ProgressBar
                    value={selected.riskScore}
                    color={selected.riskScore > 70 ? C.danger : selected.riskScore > 30 ? C.warning : C.accent4}
                    height={10}
                  />
                </div>

                {selected.flags.length > 0 ? (
                  selected.flags.map((f, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0",
                      borderBottom: i < selected.flags.length - 1 ? `1px solid ${C.border}` : "none",
                    }}>
                      <span style={{ color: C.danger, fontSize: 14, marginTop: 1 }}>⚠️</span>
                      <span style={{ fontSize: 13, color: "#dc2626", fontWeight: 600, lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: "center", padding: 20 }}>
                    <span style={{ fontSize: 28 }}>✅</span>
                    <div style={{ fontSize: 14, color: C.accent4, fontWeight: 700, marginTop: 8 }}>No anomalies detected</div>
                  </div>
                )}
              </Card>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 12 }}>
              <button style={{
                flex: 1, padding: 14, borderRadius: 12, border: "none",
                background: "linear-gradient(135deg, #10b981, #06b6d4)",
                color: "#ffffff", fontSize: 14, fontWeight: 800, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}>✅ Approve Claim</button>
              <button style={{
                flex: 1, padding: 14, borderRadius: 12, border: "none",
                background: "linear-gradient(135deg, #f59e0b, #f97316)",
                color: "#ffffff", fontSize: 14, fontWeight: 800, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}>🔍 Request More Info</button>
              <button style={{
                flex: 1, padding: 14, borderRadius: 12, border: "none",
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                color: "#ffffff", fontSize: 14, fontWeight: 800, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}>🚫 Deny Claim</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// PET SOUND (lighter)
const PetSound = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const run = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setResults({
        emotion: "Distress / Pain",
        stress: 78,
        pain: 65,
        anxiety: 42,
        pattern: "Intermittent whimpering with elevated pitch — consistent with musculoskeletal pain",
      });
    }, 2000);
  };

  return (
    <div>
      <SectionTitle subtitle="Bark and vocalization analysis for stress, pain, and emotional states">PetSound — Audio Analysis</SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card hover={false}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.textMuted, marginBottom: 12 }}>AUDIO SAMPLE: Rex — Vocalizations</div>
          {/* Waveform viz */}
          <div style={{
            width: "100%", height: 200, borderRadius: 12, background: "#f0f1f7",
            border: `1px solid ${C.border}`, display: "flex", alignItems: "center",
            justifyContent: "center", gap: 2, padding: "0 20px", overflow: "hidden",
          }}>
            {Array.from({ length: 80 }, (_, i) => {
              const h = Math.sin(i * 0.15) * 30 + Math.random() * 40 + 20;
              return (
                <div key={i} style={{
                  width: 4, height: h, borderRadius: 2, flexShrink: 0,
                  background: results
                    ? `linear-gradient(180deg, #8b5cf6, ${i > 30 && i < 50 ? "#ef4444" : "#667eea"})`
                    : "rgba(139,92,246,0.3)",
                  transition: "all 0.5s ease",
                }} />
              );
            })}
          </div>
          {results && (
            <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "center" }}>
              <Badge color="#ef4444">Pain Segment</Badge>
              <Badge color="#8b5cf6">Normal</Badge>
              <Badge color="#667eea">Baseline</Badge>
            </div>
          )}
          <button onClick={run} disabled={analyzing} style={{
            width: "100%", padding: "14px", marginTop: 16, borderRadius: 12,
            background: analyzing ? "rgba(124,77,175,0.12)" : "linear-gradient(135deg, #7c4daf, #8b5cf6)",
            border: "none", color: "#ffffff", fontSize: 15, fontWeight: 800,
            cursor: analyzing ? "wait" : "pointer", fontFamily: "'DM Sans', sans-serif",
          }}>
            {analyzing ? "🔄 Analyzing..." : "🔊 Analyze Audio"}
          </button>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {results ? (
            <>
              <Card hover={false} style={{ background: "rgba(220,38,38,0.05)", borderColor: "rgba(220,38,38,0.15)" }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: C.danger, marginBottom: 6 }}>🔊 {results.emotion}</div>
                <div style={{ fontSize: 13, color: C.textMuted }}>{results.pattern}</div>
              </Card>
              {[
                { label: "Stress Level", value: results.stress, color: C.danger },
                { label: "Pain Indicator", value: results.pain, color: C.warning },
                { label: "Anxiety Level", value: results.anxiety, color: "#8b5cf6" },
              ].map(m => (
                <Card key={m.label} hover={false}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{m.label}</span>
                    <span style={{ fontSize: 18, fontWeight: 900, color: m.color }}>{m.value}%</span>
                  </div>
                  <ProgressBar value={m.value} color={m.color} height={10} />
                </Card>
              ))}
            </>
          ) : (
            <Card hover={false} style={{ textAlign: "center", padding: 60, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.4 }}>🔊</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.textMuted }}>Analyze audio to detect emotional states</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// PET SENSE (lighter)
const PetSense = () => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const hrData = hours.map(h => 70 + Math.sin(h * 0.5) * 15 + (h > 14 && h < 18 ? 25 : 0) + Math.random() * 5);
  const actData = hours.map(h => (h > 6 && h < 10 ? 80 : h > 16 && h < 20 ? 60 : 20) + Math.random() * 15);

  return (
    <div>
      <SectionTitle subtitle="Real-time wearable and sensor data monitoring with anomaly detection">PetSense — Sensor Dashboard</SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {[
          { label: "Heart Rate", value: "110 bpm", icon: "❤️", color: C.danger, note: "Elevated" },
          { label: "Temperature", value: "39.2°C", icon: "🌡️", color: C.warning, note: "Above normal" },
          { label: "Activity Level", value: "Low", icon: "🏃", color: "#8b5cf6", note: "Down 60%" },
          { label: "Sleep Quality", value: "Poor", icon: "😴", color: C.accent1, note: "Restless" },
        ].map(v => (
          <Card key={v.label} hover={false} style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: `${v.color}15`, border: `1px solid ${v.color}33`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
            }}>{v.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 600 }}>{v.label}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: C.text }}>{v.value}</div>
            </div>
            <Badge color={v.color}>{v.note}</Badge>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {[
          { label: "Heart Rate (24h)", data: hrData, color: C.danger, unit: "bpm" },
          { label: "Activity Level (24h)", data: actData, color: "#8b5cf6", unit: "%" },
        ].map(chart => (
          <Card key={chart.label} hover={false}>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 16 }}>{chart.label}</div>
            <div style={{ height: 160, display: "flex", alignItems: "flex-end", gap: 4, padding: "0 4px" }}>
              {chart.data.map((v, i) => {
                const max = Math.max(...chart.data);
                const h = (v / max) * 140;
                const isAnomaly = chart.label.includes("Heart") && v > 100;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{
                      width: "100%", height: h, borderRadius: 4,
                      background: isAnomaly ? C.danger : chart.color,
                      opacity: isAnomaly ? 1 : 0.5,
                      transition: "height 1s ease",
                    }} />
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ fontSize: 10, color: C.textDim }}>00:00</span>
              <span style={{ fontSize: 10, color: C.textDim }}>12:00</span>
              <span style={{ fontSize: 10, color: C.textDim }}>23:00</span>
            </div>
          </Card>
        ))}
      </div>

      <Card hover={false} style={{ marginTop: 20, background: "rgba(220,38,38,0.05)", borderColor: "rgba(220,38,38,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>🚨</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.danger }}>Anomaly Detected: Heart rate elevated 40% above baseline (14:00–18:00)</div>
            <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>Correlated with decreased activity and increased vocalizations. Recommend immediate examination.</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// CROSS-MODAL
const CrossModal = () => (
  <div>
    <SectionTitle subtitle="Correlating insights across Vision + Sound + Sensor + Text for unified diagnosis">Cross-Modal AI Insights</SectionTitle>

    <Card hover={false} style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
        <span style={{ fontSize: 44 }}>🐕‍🦺</span>
        <div>
          <div style={{ fontSize: 24, fontWeight: 900, color: C.text }}>Rex — German Shepherd, 6y</div>
          <div style={{ fontSize: 14, color: C.textMuted }}>Multi-modal correlation analysis across 4 data streams</div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "center" }}>
          <div style={{ fontSize: 44, fontWeight: 900, color: C.danger }}>58</div>
          <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600 }}>Health Score</div>
        </div>
      </div>
    </Card>

    {/* Signal convergence */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
      {[
        { module: "PetVision", icon: "👁️", signal: "Joint effusion in right stifle", confidence: 94, color: "#667eea" },
        { module: "PetSound", icon: "🔊", signal: "Pain vocalization pattern", confidence: 78, color: "#8b5cf6" },
        { module: "PetSense", icon: "📡", signal: "HR elevated, activity decreased", confidence: 87, color: "#06b6d4" },
        { module: "PetText", icon: "📝", signal: "CCL rupture suspected", confidence: 92, color: "#f59e0b" },
      ].map(s => (
        <Card key={s.module} hover={false} style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: s.color, marginBottom: 6 }}>{s.module}</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 10, minHeight: 36 }}>{s.signal}</div>
          <ProgressBar value={s.confidence} color={s.color} />
          <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>{s.confidence}% confidence</div>
        </Card>
      ))}
    </div>

    {/* Convergence arrow */}
    <div style={{ textAlign: "center", margin: "4px 0", fontSize: 28, color: C.accent1 }}>⬇️</div>

    <Card hover={false} style={{
      background: "linear-gradient(135deg, rgba(91,111,230,0.06), rgba(124,77,175,0.06))",
      borderColor: "rgba(91,111,230,0.2)", textAlign: "center", padding: 32,
    }}>
      <div style={{ fontSize: 14, color: C.textMuted, fontWeight: 700, marginBottom: 8, letterSpacing: 2, textTransform: "uppercase" }}>Cross-Modal Diagnosis</div>
      <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>
        <GradientText>Right CCL Rupture — Surgical Intervention Required</GradientText>
      </div>
      <div style={{ fontSize: 14, color: C.textMuted, maxWidth: 700, margin: "0 auto", lineHeight: 1.7 }}>
        All 4 data streams converge on the same diagnosis with &gt;78% confidence. Visual joint effusion + pain vocalizations + elevated vitals + clinical notes all point to CCL rupture. TPLO surgery recommended within 2 weeks.
      </div>
    </Card>
  </div>
);

// ─── Navigation ──────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "records", icon: "🐾", label: "Patient Records" },
  { id: "vision", icon: "👁️", label: "PetVision" },
  { id: "sound", icon: "🔊", label: "PetSound" },
  { id: "sense", icon: "📡", label: "PetSense" },
  { id: "text", icon: "📝", label: "PetText" },
  { id: "crossmodal", icon: "🧠", label: "Cross-Modal AI" },
  { id: "insurance", icon: "🛡️", label: "Fraud Detection" },
];

// ─── Main App ────────────────────────────────────────────────
export default function DrKnAIDemo() {
  const [page, setPage] = useState("dashboard");
  const [selectedPet, setSelectedPet] = useState(PETS[2]); // Rex by default
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard setPage={setPage} setSelectedPet={setSelectedPet} />;
      case "records": return <PatientRecords selectedPet={selectedPet} setSelectedPet={setSelectedPet} />;
      case "vision": return <PetVision />;
      case "sound": return <PetSound />;
      case "sense": return <PetSense />;
      case "text": return <PetText />;
      case "crossmodal": return <CrossModal />;
      case "insurance": return <InsuranceFraud />;
      default: return <Dashboard setPage={setPage} setSelectedPet={setSelectedPet} />;
    }
  };

  return (
    <div style={{
      display: "flex", height: "100vh", background: C.bg, color: C.text,
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <div style={{
        width: sidebarCollapsed ? 68 : 240, flexShrink: 0, background: "#ffffff",
        borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column",
        transition: "width 0.3s ease", overflow: "hidden",
        boxShadow: "2px 0 12px rgba(0,0,0,0.03)",
      }}>
        {/* Logo */}
        <div
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{
            padding: sidebarCollapsed ? "20px 14px" : "20px 24px", cursor: "pointer",
            borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12,
            minHeight: 72,
          }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 900, color: "#ffffff",
          }}>K</div>
          {!sidebarCollapsed && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 900 }}>
                <GradientText>Dr. KnAI</GradientText>
              </div>
              <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 1.5, textTransform: "uppercase" }}>Platform Demo</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <div style={{ padding: "12px 8px", flex: 1 }}>
          {NAV_ITEMS.map(item => (
            <div
              key={item.id}
              onClick={() => setPage(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: sidebarCollapsed ? "12px 14px" : "12px 16px",
                borderRadius: 10, cursor: "pointer", marginBottom: 4,
                background: page === item.id ? "rgba(91,111,230,0.08)" : "transparent",
                color: page === item.id ? "#5b6fe6" : C.textMuted,
                transition: "all 0.2s", fontSize: 14, fontWeight: 600,
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { if (page !== item.id) e.currentTarget.style.background = "rgba(0,0,0,0.03)"; }}
              onMouseLeave={e => { if (page !== item.id) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: 18, flexShrink: 0, width: 24, textAlign: "center" }}>{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </div>
          ))}
        </div>

        {/* Footer */}
        {!sidebarCollapsed && (
          <div style={{ padding: "16px 24px", borderTop: `1px solid ${C.border}`, fontSize: 11, color: C.textDim }}>
            Pre-Seed Demo · v0.1
          </div>
        )}
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: "auto", padding: 32 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
