import { useState, useEffect, useCallback } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  bg: "#f0f2f5",
  surface: "#ffffff",
  surface2: "#f8f9fb",
  border: "#e2e6ed",
  borderLight: "#edf0f4",
  blue: "#2563eb",
  blueLight: "#dbeafe",
  blueDark: "#1d4ed8",
  green: "#16a34a",
  greenLight: "#dcfce7",
  red: "#dc2626",
  redLight: "#fee2e2",
  yellow: "#d97706",
  yellowLight: "#fef3c7",
  text: "#111827",
  text2: "#6b7280",
  text3: "#9ca3af",
  sidebar: "#0f172a",
  sidebarText: "#94a3b8",
};

const shadow = "0 1px 3px rgba(0,0,0,0.08),0 1px 2px rgba(0,0,0,0.04)";
const shadowMd = "0 4px 6px rgba(0,0,0,0.07),0 2px 4px rgba(0,0,0,0.05)";
const shadowLg = "0 10px 15px rgba(0,0,0,0.1),0 4px 6px rgba(0,0,0,0.05)";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const ROLE_PERMISSIONS = {
  admin: ["dashboard","leads","leads-new","customers","review","contracts","billing","sla","reports","settings"],
  handler: ["dashboard","leads","leads-new","customers","review","contracts","billing","sla"],
  executive: ["dashboard","leads","leads-new","customers","sla"],
};

const ROLE_INFO = {
  admin:     { name: "Admin User",    tag: "System Administrator", avatar: "A", color: T.blue },
  handler:   { name: "Rahul Mehta",   tag: "Customer Handler",     avatar: "R", color: T.green },
  executive: { name: "Priya Kapoor",  tag: "Care Executive",       avatar: "P", color: T.yellow },
};

const NAV_ITEMS = [
  { section: "Main" },
  { id: "dashboard",  icon: "📊", label: "Dashboard",         roles: "admin,handler,executive" },
  { id: "leads",      icon: "📋", label: "Leads",             roles: "admin,handler,executive", badge: 7 },
  { id: "customers",  icon: "🏢", label: "Customer Database", roles: "admin,handler,executive" },
  { section: "Operations" },
  { id: "review",     icon: "🔍", label: "Performance Review", roles: "admin,handler" },
  { id: "contracts",  icon: "📄", label: "Contract Management",roles: "admin,handler" },
  { id: "billing",    icon: "💰", label: "Billing Schedule",   roles: "admin,handler" },
  { id: "sla",        icon: "🎯", label: "SLA Monitoring",     roles: "admin,handler,executive" },
  { section: "Analytics" },
  { id: "reports",    icon: "📈", label: "Reports",            roles: "admin" },
  { id: "settings",   icon: "⚙️",  label: "Settings",          roles: "admin" },
];

const LEADS_DATA = [
  { id:"LD-2024-0089", company:"Apex Logistics Ltd.",     city:"Mumbai",    fleet:48,  risk:22, riskLevel:"low",  status:"approved", handler:"Rahul M.",  date:"12 Feb 2025" },
  { id:"LD-2024-0088", company:"SwiftTrans India",        city:"Delhi NCR", fleet:120, risk:58, riskLevel:"med",  status:"review",   handler:"Priya K.",  date:"14 Feb 2025" },
  { id:"LD-2024-0087", company:"National Fleet Services", city:"Chennai",   fleet:200, risk:81, riskLevel:"high", status:"rejected", handler:"Arjun S.",  date:"10 Feb 2025" },
  { id:"LD-2024-0086", company:"Green Mile Cargo",        city:"Pune",      fleet:35,  risk:15, riskLevel:"low",  status:"review",   handler:"Rahul M.",  date:"15 Feb 2025" },
  { id:"LD-2024-0085", company:"Metro Movers Co.",        city:"Hyderabad", fleet:67,  risk:44, riskLevel:"med",  status:"active",   handler:"Priya K.",  date:"8 Feb 2025"  },
];

const CUSTOMERS_DATA = [
  { id:"CX-0001", company:"Apex Logistics Ltd.",  city:"Mumbai",    fleet:48,  contracts:3, value:"₹42.8L", risk:22, riskLevel:"low",  status:"active"   },
  { id:"CX-0002", company:"Metro Movers Co.",     city:"Hyderabad", fleet:67,  contracts:1, value:"₹18.4L", risk:44, riskLevel:"med",  status:"active"   },
  { id:"CX-0003", company:"SunRise Transport",    city:"Bangalore", fleet:22,  contracts:2, value:"₹9.2L",  risk:18, riskLevel:"low",  status:"expiring" },
];

const BILLING_DATA = [
  { id:"CT-2024-0041", company:"Apex Logistics",     freq:"Monthly",   last:"01 Feb 2025", next:"01 Mar 2025", amount:"₹1,40,000", outstanding:"₹0",        overdueStatus:"ok"      },
  { id:"CT-2024-0038", company:"Metro Movers",       freq:"Quarterly", last:"01 Jan 2025", next:"Overdue",     amount:"₹3,60,000", outstanding:"₹3,60,000", overdueStatus:"overdue" },
  { id:"CT-2024-0033", company:"SunRise Transport",  freq:"Monthly",   last:"01 Feb 2025", next:"01 Mar 2025", amount:"₹76,000",   outstanding:"₹0",        overdueStatus:"ok"      },
];

const SLA_DATA = [
  { id:"CT-2024-0041", company:"Apex Logistics",           fleet:48,  sla:96.4, tickets:2,  nextMaint:"22 Feb 2025", nextBill:"01 Mar 2025", health:"healthy" },
  { id:"CT-2024-0038", company:"Metro Movers",             fleet:67,  sla:88.2, tickets:7,  nextMaint:"18 Feb 2025", nextBill:"01 Apr 2025", health:"risk"    },
  { id:"CT-2024-0032", company:"National Fleet Services",  fleet:200, sla:72.1, tickets:18, nextMaint:"20 Feb 2025", nextBill:"01 Mar 2025", health:"breach"  },
];

const RBAC_TABLE = [
  { feature:"View Dashboard",         executive:"✅", handler:"✅", admin:"✅" },
  { feature:"Create Leads",           executive:"✅", handler:"✅", admin:"✅" },
  { feature:"Performance Review",     executive:"👁 View Only", handler:"✅", admin:"✅" },
  { feature:"Approve / Reject Leads", executive:"❌", handler:"✅", admin:"✅" },
  { feature:"Create Contracts",       executive:"❌", handler:"✅", admin:"✅" },
  { feature:"Billing Management",     executive:"❌", handler:"✅", admin:"✅" },
  { feature:"SLA Monitoring",         executive:"👁 View Only", handler:"✅", admin:"✅" },
  { feature:"Reports & Analytics",    executive:"❌", handler:"❌", admin:"✅" },
  { feature:"System Settings",        executive:"❌", handler:"❌", admin:"✅" },
  { feature:"User Management",        executive:"❌", handler:"❌", admin:"✅" },
  { feature:"AI Risk Score Override", executive:"❌", handler:"❌", admin:"✅" },
];

// ─── STYLE HELPERS ────────────────────────────────────────────────────────────
const css = {
  card: {
    background: T.surface,
    borderRadius: 8,
    border: `1px solid ${T.border}`,
    padding: 16,
    boxShadow: shadow,
  },
  panelCard: {
    background: T.surface,
    borderRadius: 8,
    border: `1px solid ${T.border}`,
    boxShadow: shadow,
    padding: 20,
    marginBottom: 16,
  },
  tableCard: {
    background: T.surface,
    borderRadius: 8,
    border: `1px solid ${T.border}`,
    boxShadow: shadow,
    overflow: "hidden",
  },
  th: {
    background: T.surface2,
    borderBottom: `1px solid ${T.border}`,
    padding: "10px 16px",
    textAlign: "left",
    fontSize: 11,
    fontWeight: 700,
    color: T.text2,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "12px 16px",
    borderBottom: `1px solid ${T.borderLight}`,
    fontSize: 13,
    color: T.text,
    verticalAlign: "middle",
  },
};

// ─── BADGE ────────────────────────────────────────────────────────────────────
const badgeColors = {
  review:   { bg: "#fef3c7", color: "#92400e", dot: "#d97706" },
  approved: { bg: "#dcfce7", color: "#14532d", dot: "#16a34a" },
  rejected: { bg: "#fee2e2", color: "#7f1d1d", dot: "#dc2626" },
  active:   { bg: "#dbeafe", color: "#1e3a8a", dot: "#2563eb" },
  pending:  { bg: "#f3f4f6", color: "#374151", dot: "#9ca3af" },
  expiring: { bg: "#fef3c7", color: "#92400e", dot: "#d97706" },
  signed:   { bg: "#dcfce7", color: "#14532d", dot: "#16a34a" },
  healthy:  { bg: "#dcfce7", color: "#14532d", dot: "#16a34a" },
  risk:     { bg: "#fef3c7", color: "#92400e", dot: "#d97706" },
  breach:   { bg: "#fee2e2", color: "#7f1d1d", dot: "#dc2626" },
};

const BADGE_LABELS = { review:"Under Review", approved:"Approved", rejected:"Rejected", active:"Active", pending:"Pending", expiring:"Expiring", signed:"Signed", healthy:"Healthy", risk:"At Risk", breach:"Breach" };

function Badge({ status }) {
  const c = badgeColors[status] || badgeColors.pending;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:700, letterSpacing:"0.2px", background:c.bg, color:c.color }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:c.dot, display:"inline-block" }} />
      {BADGE_LABELS[status] || status}
    </span>
  );
}

// ─── RISK SCORE ───────────────────────────────────────────────────────────────
function RiskScore({ score, level }) {
  const colors = { low: T.green, med: T.yellow, high: T.red };
  const c = colors[level] || T.text2;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:6, fontFamily:"'DM Mono',monospace", fontSize:12, fontWeight:500, color:c }}>
      {score}
      <span style={{ display:"inline-block", height:4, width:30, borderRadius:2, background:c, opacity:0.6 }} />
    </span>
  );
}

// ─── BUTTON ───────────────────────────────────────────────────────────────────
function Btn({ children, variant="primary", onClick, style={}, full=false }) {
  const variants = {
    primary:   { background:T.blue,      color:"#fff",     border:"none" },
    secondary: { background:T.surface2,  color:T.text2,    border:`1px solid ${T.border}` },
    success:   { background:T.green,     color:"#fff",     border:"none" },
    danger:    { background:T.red,       color:"#fff",     border:"none" },
    dangerSoft:{ background:T.redLight,  color:T.red,      border:`1px solid #fca5a5` },
    successSoft:{ background:T.greenLight,color:T.green,   border:`1px solid #86efac` },
    viewSm:    { background:T.blueLight, color:T.blue,     border:"none" },
  };
  const v = variants[variant] || variants.primary;
  return (
    <button
      onClick={onClick}
      style={{
        display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6,
        padding: variant.endsWith("Sm") || variant === "viewSm" ? "5px 12px" : "7px 14px",
        borderRadius:6, fontSize: variant === "viewSm" ? 11 : 12, fontWeight:700,
        cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s",
        width: full ? "100%" : undefined, ...v, ...style
      }}
    >
      {children}
    </button>
  );
}

// ─── INPUT / LABEL ────────────────────────────────────────────────────────────
function Label({ children }) {
  return <label style={{ fontSize:11, fontWeight:700, color:T.text2, textTransform:"uppercase", letterSpacing:"0.4px" }}>{children}</label>;
}

function Input({ type="text", placeholder, value, onChange, style={} }) {
  return (
    <input
      type={type} placeholder={placeholder} value={value} onChange={onChange}
      style={{ padding:"9px 12px", borderRadius:6, border:`1px solid ${T.border}`, fontFamily:"'DM Sans',sans-serif", fontSize:13, background:T.surface, color:T.text, outline:"none", width:"100%", ...style }}
    />
  );
}

function Select({ value, onChange, children, style={} }) {
  return (
    <select
      value={value} onChange={onChange}
      style={{ padding:"9px 12px", borderRadius:6, border:`1px solid ${T.border}`, fontFamily:"'DM Sans',sans-serif", fontSize:13, background:T.surface, color:T.text, outline:"none", width:"100%", ...style }}
    >
      {children}
    </select>
  );
}

function Textarea({ placeholder, value, onChange, style={} }) {
  return (
    <textarea
      placeholder={placeholder} value={value} onChange={onChange}
      style={{ padding:"9px 12px", borderRadius:6, border:`1px solid ${T.border}`, fontFamily:"'DM Sans',sans-serif", fontSize:13, background:T.surface, color:T.text, outline:"none", resize:"vertical", minHeight:90, width:"100%", ...style }}
    />
  );
}

function FormGroup({ label, children, full=false }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5, gridColumn: full ? "1 / -1" : undefined }}>
      {label && <Label>{label}</Label>}
      {children}
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(2px)" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background:T.surface, borderRadius:10, boxShadow:shadowLg, width:480, overflow:"hidden", animation:"modalIn 0.2s ease" }}
      >
        <div style={{ padding:"18px 20px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:14, fontWeight:700 }}>{title}</span>
          <span onClick={onClose} style={{ cursor:"pointer", color:T.text3, fontSize:20, lineHeight:1 }}>×</span>
        </div>
        <div style={{ padding:20 }}>{children}</div>
        {footer && <div style={{ padding:"14px 20px", borderTop:`1px solid ${T.border}`, display:"flex", justifyContent:"flex-end", gap:8 }}>{footer}</div>}
      </div>
    </div>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ msg, visible }) {
  return (
    <div style={{
      position:"fixed", bottom:24, right:24, zIndex:2000,
      background:T.sidebar, color:"#f8fafc", padding:"12px 18px",
      borderRadius:8, fontSize:13, fontWeight:500, boxShadow:shadowLg,
      display:"flex", alignItems:"center", gap:8,
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(10px)",
      transition:"all 0.25s ease", pointerEvents:"none"
    }}>
      {msg}
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
function Sidebar({ currentScreen, role, onNavigate, onRoleChange }) {
  const info = ROLE_INFO[role];
  const allowed = ROLE_PERMISSIONS[role];

  return (
    <aside style={{ width:240, minHeight:"100vh", background:T.sidebar, display:"flex", flexDirection:"column", position:"fixed", top:0, left:0, zIndex:100 }}>
      {/* Logo */}
      <div style={{ padding:"20px 20px 16px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, background:T.blue, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🚛</div>
          <div>
            <div style={{ color:"#f8fafc", fontWeight:700, fontSize:15, letterSpacing:"-0.3px" }}>FleetCare Pro</div>
            <div style={{ color:T.sidebarText, fontSize:10, marginTop:1 }}>Contract Management System</div>
          </div>
        </div>
      </div>

      {/* Role Selector */}
      <div style={{ padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ color:T.sidebarText, fontSize:10, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:6 }}>Logged in as</div>
        <select
          value={role}
          onChange={e => onRoleChange(e.target.value)}
          style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:6, padding:"8px 10px", width:"100%", color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif", fontSize:12, cursor:"pointer", outline:"none" }}
        >
          <option value="admin">🔑 Admin</option>
          <option value="handler">🧑‍💼 Customer Handler</option>
          <option value="executive">👤 Care Executive</option>
        </select>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:"8px 10px", overflowY:"auto" }}>
        {NAV_ITEMS.map((item, i) => {
          if (item.section) {
            return (
              <div key={i} style={{ color:"rgba(148,163,184,0.5)", fontSize:10, textTransform:"uppercase", letterSpacing:"0.8px", padding:"12px 8px 6px", fontWeight:600 }}>
                {item.section}
              </div>
            );
          }
          const isAllowed = allowed.includes(item.id);
          const isActive = currentScreen === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={!isAllowed ? "Access restricted for your role" : ""}
              style={{
                display:"flex", alignItems:"center", gap:10, padding:"9px 10px",
                borderRadius:6, cursor: isAllowed ? "pointer" : "not-allowed",
                color: isActive ? "#60a5fa" : T.sidebarText,
                fontSize:13, fontWeight:500, transition:"all 0.15s", marginBottom:1,
                position:"relative", opacity: isAllowed ? 1 : 0.4,
                background: isActive ? "rgba(37,99,235,0.2)" : "transparent",
              }}
            >
              {isActive && <span style={{ position:"absolute", left:-10, top:"50%", transform:"translateY(-50%)", width:3, height:18, background:T.blue, borderRadius:"0 2px 2px 0" }} />}
              <span style={{ width:16, textAlign:"center", fontSize:14 }}>{item.icon}</span>
              <span style={{ flex:1 }}>{item.label}</span>
              {item.badge && <span style={{ background:T.blue, color:"#fff", fontSize:10, fontWeight:700, padding:"2px 6px", borderRadius:10 }}>{item.badge}</span>}
            </div>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding:"14px 16px", borderTop:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:32, height:32, borderRadius:"50%", background:info.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, color:"#fff", flexShrink:0 }}>
          {info.avatar}
        </div>
        <div>
          <div style={{ color:"#e2e8f0", fontSize:12, fontWeight:600 }}>{info.name}</div>
          <div style={{ color:T.sidebarText, fontSize:10 }}>{info.tag}</div>
        </div>
      </div>
    </aside>
  );
}

// ─── TOPBAR ───────────────────────────────────────────────────────────────────
const PAGE_INFO = {
  dashboard:   { title:"Dashboard",            crumb:"Overview" },
  leads:       { title:"Leads",                crumb:"All Leads" },
  "leads-new": { title:"Create New Lead",      crumb:"Leads → New Lead" },
  customers:   { title:"Customer Database",    crumb:"All Customers" },
  review:      { title:"Performance Review",   crumb:"Leads → LD-2024-0089 → Review" },
  contracts:   { title:"Contract Management",  crumb:"Contracts → Create" },
  billing:     { title:"Billing Schedule",     crumb:"Finance → Billing" },
  sla:         { title:"SLA Monitoring",       crumb:"Operations → SLA" },
  reports:     { title:"Reports & Analytics",  crumb:"Analytics → Reports" },
  settings:    { title:"System Settings",      crumb:"Settings → Access Control" },
  "access-denied": { title:"Access Denied",   crumb:"" },
};

function Topbar({ screen, onNavigate }) {
  const info = PAGE_INFO[screen] || { title:"FleetCare Pro", crumb:"" };
  const showNewLead = ["dashboard","leads"].includes(screen);
  const showNewContract = screen === "contracts";
  return (
    <div style={{ background:T.surface, borderBottom:`1px solid ${T.border}`, padding:"0 28px", height:58, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ fontSize:16, fontWeight:700, color:T.text, letterSpacing:"-0.3px" }}>{info.title}</div>
        <div style={{ color:T.text3, fontSize:12 }}>{info.crumb}</div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:34, height:34, borderRadius:6, background:T.surface2, border:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", position:"relative" }}>
          🔔
          <div style={{ position:"absolute", top:6, right:6, width:7, height:7, background:T.red, borderRadius:"50%", border:`1.5px solid ${T.surface}` }} />
        </div>
        {showNewLead && <Btn onClick={() => onNavigate("leads-new")}>+ New Lead</Btn>}
        {showNewContract && <Btn onClick={() => onNavigate("contracts")}>+ New Contract</Btn>}
      </div>
    </div>
  );
}

// ─── SCREEN: DASHBOARD ────────────────────────────────────────────────────────
function DashboardScreen({ onNavigate }) {
  const summaryCards = [
    { label:"New Leads",       value:24,  icon:"📋", sub:"↑ 4 today",          colorClass:"blue" },
    { label:"Under Review",    value:7,   icon:"🔍", sub:"Avg 2.3 days",        colorClass:"yellow" },
    { label:"Approved",        value:18,  icon:"✅", sub:"This month",          colorClass:"green" },
    { label:"Rejected",        value:5,   icon:"❌", sub:"This month",          colorClass:"red" },
    { label:"Active Contracts",value:142, icon:"🚛", sub:"↑ 6 new this week",   colorClass:"accent" },
    { label:"Expiring Soon",   value:3,   icon:"⏰", sub:"Within 30 days",      colorClass:"yellow" },
  ];
  const colorMap = { blue:T.blue, yellow:T.yellow, green:T.green, red:T.red };

  return (
    <div>
      {/* Alert */}
      <div style={{ display:"flex", alignItems:"center", gap:10, background:"#fffbeb", border:"1px solid #fcd34d", borderRadius:8, padding:"12px 16px", marginBottom:20, fontSize:13, color:"#92400e" }}>
        ⚠️ <strong>3 contracts expiring within 30 days.</strong> Review and initiate renewal process.
        <Btn variant="viewSm" style={{ marginLeft:"auto" }} onClick={() => onNavigate("contracts")}>View Contracts</Btn>
      </div>

      {/* Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:14, marginBottom:24 }}>
        {summaryCards.map((c, i) => (
          <div key={i} style={{ ...css.card, background: c.colorClass === "accent" ? T.blue : T.surface, cursor:"pointer" }} onClick={() => onNavigate("leads")}>
            <div style={{ fontSize:20, marginBottom:6 }}>{c.icon}</div>
            <div style={{ fontSize:11, fontWeight:600, color: c.colorClass === "accent" ? "#fff" : T.text2, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:8 }}>{c.label}</div>
            <div style={{ fontSize:26, fontWeight:700, letterSpacing:"-1px", color: c.colorClass === "accent" ? "#fff" : (colorMap[c.colorClass] || T.text), lineHeight:1 }}>{c.value}</div>
            <div style={{ fontSize:11, color: c.colorClass === "accent" ? "rgba(255,255,255,0.8)" : T.text3, marginTop:5 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <div style={{ fontSize:15, fontWeight:700 }}>Lead Overview</div>
        <div style={{ display:"flex", gap:8 }}>
          <input placeholder="Search leads…" style={{ padding:"6px 12px 6px 30px", borderRadius:6, border:`1px solid ${T.border}`, fontFamily:"'DM Sans',sans-serif", fontSize:12, background:T.surface2, outline:"none", width:200, color:T.text }} />
          <select style={{ padding:"6px 10px", borderRadius:6, border:`1px solid ${T.border}`, fontFamily:"'DM Sans',sans-serif", fontSize:12, color:T.text2, background:T.surface2 }}>
            <option>All Status</option><option>Under Review</option><option>Approved</option><option>Rejected</option>
          </select>
        </div>
      </div>

      <div style={css.tableCard}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              {["Lead ID","Company Name","Fleet Size","Risk Score","Status","Assigned Handler","Created","Action"].map(h => (
                <th key={h} style={css.th}>{h === "Risk Score" ? <span style={{ display:"flex", alignItems:"center", gap:6 }}>{h} <span style={{ background:"linear-gradient(135deg,#4f46e5,#7c3aed)", color:"#fff", borderRadius:4, padding:"2px 6px", fontSize:10, fontWeight:700 }}>AI</span></span> : h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LEADS_DATA.map((lead, idx) => (
              <tr key={lead.id} style={{ background: idx % 2 === 0 ? T.surface : T.surface }}>
                <td style={css.td}><span style={{ fontFamily:"'DM Mono',monospace", color:T.blue, fontWeight:600 }}>{lead.id}</span></td>
                <td style={css.td}><div style={{ fontWeight:600 }}>{lead.company}</div><div style={{ fontSize:11, color:T.text2 }}>{lead.city}</div></td>
                <td style={css.td}>{lead.fleet} vehicles</td>
                <td style={css.td}><RiskScore score={lead.risk} level={lead.riskLevel} /></td>
                <td style={css.td}><Badge status={lead.status} /></td>
                <td style={css.td}>{lead.handler}</td>
                <td style={css.td}>{lead.date}</td>
                <td style={css.td}><Btn variant="viewSm" onClick={() => onNavigate("review")}>View</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── SCREEN: LEADS ────────────────────────────────────────────────────────────
function LeadsScreen({ onNavigate }) {
  const [tab, setTab] = useState("All");
  const tabs = ["All (24)","Under Review (7)","Approved (18)","Rejected (5)"];
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <div style={{ fontSize:15, fontWeight:700 }}>All Leads</div>
        <Btn onClick={() => onNavigate("leads-new")}>+ Create New Lead</Btn>
      </div>
      <div style={{ display:"flex", gap:2, background:T.surface2, borderRadius:6, padding:3, marginBottom:20, width:"fit-content" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding:"7px 16px", borderRadius:5, fontSize:12, fontWeight:600, cursor:"pointer", border:"none", background: tab===t ? T.surface : "transparent", color: tab===t ? T.text : T.text2, fontFamily:"'DM Sans',sans-serif", boxShadow: tab===t ? shadow : "none", transition:"all 0.15s" }}>{t}</button>
        ))}
      </div>
      <div style={css.tableCard}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>{["Lead ID","Company Name","Fleet Size","Contact","Risk Score","Status","Handler","Action"].map(h => <th key={h} style={css.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {LEADS_DATA.map(lead => (
              <tr key={lead.id}>
                <td style={css.td}><span style={{ fontFamily:"'DM Mono',monospace", color:T.blue, fontWeight:600 }}>{lead.id}</span></td>
                <td style={css.td}><div style={{ fontWeight:600 }}>{lead.company}</div><div style={{ fontSize:11, color:T.text2 }}>{lead.city}</div></td>
                <td style={css.td}>{lead.fleet}</td>
                <td style={css.td}>Rajesh Kumar</td>
                <td style={css.td}><RiskScore score={lead.risk} level={lead.riskLevel} /></td>
                <td style={css.td}><Badge status={lead.status} /></td>
                <td style={css.td}>{lead.handler}</td>
                <td style={css.td}><Btn variant="viewSm" onClick={() => onNavigate("review")}>Review</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── SCREEN: NEW LEAD ─────────────────────────────────────────────────────────
function NewLeadScreen({ onNavigate, onSubmit }) {
  const [form, setForm] = useState({ company:"", contact:"", phone:"", email:"", address:"", fleet:"", vehicles:"", location:"", duration:"", startDate:"", handler:"", notes:"" });
  const set = k => e => setForm(f => ({...f, [k]:e.target.value}));
  const gridStyle = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 };

  return (
    <div style={{ ...css.card, padding:24 }}>
      <div style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:16, borderBottom:`1px solid ${T.borderLight}`, paddingBottom:10 }}>Company Information</div>
      <div style={gridStyle}>
        <FormGroup label="Company Name *"><Input placeholder="e.g. Apex Logistics Ltd." value={form.company} onChange={set("company")} /></FormGroup>
        <FormGroup label="Contact Person *"><Input placeholder="Full name" value={form.contact} onChange={set("contact")} /></FormGroup>
        <FormGroup label="Phone Number *"><Input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set("phone")} /></FormGroup>
        <FormGroup label="Email Address *"><Input type="email" placeholder="contact@company.com" value={form.email} onChange={set("email")} /></FormGroup>
        <FormGroup label="Business Address" full><Input placeholder="Full address with city and state" value={form.address} onChange={set("address")} /></FormGroup>
      </div>

      <hr style={{ border:"none", borderTop:`1px solid ${T.border}`, margin:"16px 0" }} />
      <div style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:16, borderBottom:`1px solid ${T.borderLight}`, paddingBottom:10 }}>Fleet & Contract Details</div>
      <div style={gridStyle}>
        <FormGroup label="Fleet Size *"><Input type="number" placeholder="Number of vehicles" value={form.fleet} onChange={set("fleet")} /></FormGroup>
        <FormGroup label="Vehicle Types"><Input placeholder="HCV, LCV, Buses..." value={form.vehicles} onChange={set("vehicles")} /></FormGroup>
        <FormGroup label="Service Location"><Input placeholder="City / State" value={form.location} onChange={set("location")} /></FormGroup>
        <FormGroup label="Preferred Contract Duration">
          <Select value={form.duration} onChange={set("duration")}><option>Select duration</option><option>6 Months</option><option>1 Year</option><option>2 Years</option><option>3 Years</option><option>Custom</option></Select>
        </FormGroup>
        <FormGroup label="Expected Start Date"><Input type="date" value={form.startDate} onChange={set("startDate")} /></FormGroup>
        <FormGroup label="Assign Handler">
          <Select value={form.handler} onChange={set("handler")}><option>Auto Assign</option><option>Rahul Mehta</option><option>Priya Kapoor</option><option>Arjun Singh</option></Select>
        </FormGroup>
        <FormGroup label="Special Requirements" full><Textarea placeholder="Any specific maintenance requirements, service level expectations, or additional notes..." value={form.notes} onChange={set("notes")} /></FormGroup>
      </div>

      <div style={{ background:T.blueLight, borderRadius:6, padding:"12px 16px", marginTop:16, fontSize:12, color:"#1e40af", display:"flex", gap:8, alignItems:"flex-start" }}>
        🤖 <span><strong>AI Risk Scoring</strong> will be automatically calculated based on fleet size, company history, and service patterns after lead submission.</span>
      </div>

      <div style={{ display:"flex", gap:10, marginTop:20, justifyContent:"flex-end" }}>
        <Btn variant="secondary" onClick={() => onNavigate("leads")}>Cancel</Btn>
        <Btn onClick={onSubmit}>Generate Lead →</Btn>
      </div>
    </div>
  );
}

// ─── SCREEN: PERFORMANCE REVIEW ───────────────────────────────────────────────
function ReviewScreen({ role, onApprove, onReject }) {
  const canDecide = ["admin","handler"].includes(role);

  return (
    <div>
      {/* Customer Header */}
      <div style={{ background:"linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)", borderRadius:8, padding:20, color:"#fff", marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:11, opacity:0.7, fontWeight:600, letterSpacing:"0.5px", textTransform:"uppercase", marginBottom:4 }}>Lead LD-2024-0089</div>
            <div style={{ fontSize:20, fontWeight:700, letterSpacing:"-0.5px" }}>Apex Logistics Ltd.</div>
            <div style={{ fontSize:12, opacity:0.8, marginTop:4 }}>📍 Mumbai, Maharashtra &nbsp;|&nbsp; 👤 Rajesh Kumar &nbsp;|&nbsp; 📞 +91 98765 43210</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:11, opacity:0.7, marginBottom:4 }}>Existing Customer</div>
            <div style={{ fontSize:22, fontWeight:700 }}>48 Vehicles</div>
            <div style={{ fontSize:12, opacity:0.8 }}>HCV, LCV Fleet</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, marginTop:12 }}>
          {["⭐ 3-Year Relationship","✅ Payment: Excellent","🤖 AI Score: 22/100","📊 Risk: Low"].map(tag => (
            <span key={tag} style={{ background:"rgba(255,255,255,0.15)", borderRadius:4, padding:"3px 10px", fontSize:11, fontWeight:600 }}>{tag}</span>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:20 }}>
        {/* Left */}
        <div>
          {/* Analytics */}
          <div style={css.panelCard}>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>📊 Performance Analytics</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
              {[["96.4%","SLA Compliance",T.green],["₹42.8L","Total Revenue",T.blue],["0","Open Disputes",T.green],["1.2%","Downtime %",T.text],["3","SLA Violations",T.yellow],["100%","Payment Rate",T.green]].map(([val,lbl,color]) => (
                <div key={lbl} style={{ background:T.surface2, borderRadius:6, padding:14, border:`1px solid ${T.borderLight}` }}>
                  <div style={{ fontSize:22, fontWeight:700, letterSpacing:"-0.5px", color }}>{val}</div>
                  <div style={{ fontSize:11, color:T.text2, marginTop:2, fontWeight:500 }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Contract History */}
          <div style={css.panelCard}>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>📋 Contract History</div>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead><tr>{["Contract ID","Period","Value","Status"].map(h=><th key={h} style={{...css.th,padding:"8px 0"}}>{h}</th>)}</tr></thead>
              <tbody>
                <tr>
                  <td style={{...css.td,padding:"10px 0",fontFamily:"'DM Mono',monospace",fontSize:12,color:T.blue}}>CT-2023-0041</td>
                  <td style={{...css.td,padding:"10px 0",fontSize:12}}>Jan–Dec 2023</td>
                  <td style={{...css.td,padding:"10px 0",fontSize:12,fontWeight:600}}>₹14.2L</td>
                  <td style={{...css.td,padding:"10px 0"}}><Badge status="signed" /></td>
                </tr>
                <tr>
                  <td style={{...css.td,padding:"10px 0",fontFamily:"'DM Mono',monospace",fontSize:12,color:T.blue}}>CT-2022-0018</td>
                  <td style={{...css.td,padding:"10px 0",fontSize:12}}>Jan–Dec 2022</td>
                  <td style={{...css.td,padding:"10px 0",fontSize:12,fontWeight:600}}>₹12.6L</td>
                  <td style={{...css.td,padding:"10px 0"}}><Badge status="signed" /></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Audit Log */}
          <div style={css.panelCard}>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>🕐 Audit Log</div>
            {[["15 Feb 2025 10:23","Rahul M.","submitted lead for review"],["15 Feb 2025 11:40","System","AI Risk Score calculated: 22 (Low)"],["15 Feb 2025 14:12","Admin","assigned to Rahul M. for review"]].map(([time,user,action]) => (
              <div key={time} style={{ display:"flex", gap:10, padding:"10px 0", borderBottom:`1px solid ${T.borderLight}`, fontSize:12 }}>
                <div style={{ color:T.text3, fontFamily:"'DM Mono',monospace", whiteSpace:"nowrap", minWidth:130 }}>{time}</div>
                <div><span style={{ color:T.blue, fontWeight:600 }}>{user}</span> <span style={{ color:T.text }}>{action}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* Decision Panel */}
        <div style={{ position:"sticky", top:80 }}>
          <div style={{ background:T.surface, borderRadius:8, border:`1px solid ${T.border}`, boxShadow:shadowMd, overflow:"hidden" }}>
            <div style={{ background:T.sidebar, padding:"14px 18px", color:"#f8fafc", fontSize:13, fontWeight:700 }}>🤖 AI Decision Panel</div>
            <div style={{ padding:18 }}>
              <div style={{ textAlign:"center", padding:"20px 0", borderBottom:`1px solid ${T.borderLight}`, marginBottom:16 }}>
                <div style={{ width:100, height:100, borderRadius:"50%", margin:"0 auto 10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:700, fontFamily:"'DM Mono',monospace", background:T.greenLight, color:T.green, border:`4px solid ${T.green}` }}>22</div>
                <div style={{ fontSize:11, color:T.text2, fontWeight:600 }}>Risk Score · LOW RISK</div>
                <div style={{ fontSize:11, color:T.text3, marginTop:4 }}>AI Recommendation: <strong style={{ color:T.green }}>Approve</strong></div>
              </div>

              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:12, fontWeight:700, color:T.text, marginBottom:8 }}>AI Analysis Summary</div>
                {[["green","Payment history: Excellent (100%)","Positive factor"],["green","3-year client relationship","Positive factor"],["yellow","3 minor SLA violations","Minor concern"],["green","Fleet size: Manageable","Positive factor"]].map(([color,text,sub]) => (
                  <div key={text} style={{ display:"flex", gap:10, marginBottom:12, position:"relative", paddingLeft:18 }}>
                    <div style={{ position:"absolute", left:0, top:4, width:10, height:10, borderRadius:"50%", background:{green:T.green,yellow:T.yellow,red:T.red}[color] || T.text3, border:`2px solid ${T.surface}` }} />
                    <div>
                      <div style={{ fontSize:12, color:T.text2 }}>{text}</div>
                      <div style={{ fontSize:10, color:T.text3 }}>{sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:11, fontWeight:700, color:T.text2, textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:6 }}>Profitability Projection</div>
                {[["Estimated Annual Value","₹16.8L",T.green],["Margin %","34%",T.text],["Renewal Probability","87%",T.blue]].map(([k,v,c]) => (
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${T.borderLight}`, fontSize:13 }}>
                    <span style={{ color:T.text2 }}>{k}</span>
                    <span style={{ fontWeight:700, fontFamily:"'DM Mono',monospace", color:c }}>{v}</span>
                  </div>
                ))}
              </div>

              {canDecide ? (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  <Btn full variant="success" style={{ padding:10, fontSize:13 }} onClick={onApprove}>✅ Approve Lead</Btn>
                  <Btn full variant="dangerSoft" style={{ padding:10, fontSize:13 }} onClick={onReject}>❌ Reject Lead</Btn>
                </div>
              ) : (
                <div style={{ background:T.surface2, borderRadius:6, padding:12, textAlign:"center", fontSize:12, color:T.text2 }}>
                  🔒 Only Handlers and Admins can approve or reject leads.
                </div>
              )}

              <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${T.borderLight}` }}>
                <div style={{ fontSize:11, fontWeight:700, color:T.text2, textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:8 }}>Handler Notes</div>
                <Textarea placeholder="Add notes about this lead..." style={{ minHeight:70 }} />
                <Btn variant="viewSm" style={{ marginTop:6, width:"100%", justifyContent:"center" }}>Save Note</Btn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN: CUSTOMERS ────────────────────────────────────────────────────────
function CustomersScreen() {
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <div style={{ fontSize:15, fontWeight:700 }}>Customer Database</div>
        <input placeholder="Search customers…" style={{ padding:"6px 12px", borderRadius:6, border:`1px solid ${T.border}`, fontFamily:"'DM Sans',sans-serif", fontSize:12, background:T.surface2, outline:"none", width:250, color:T.text }} />
      </div>
      <div style={css.tableCard}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr>{["Customer ID","Company","Fleet Size","Total Contracts","Total Value","Risk Score","Status","Action"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead>
          <tbody>
            {CUSTOMERS_DATA.map(c => (
              <tr key={c.id}>
                <td style={css.td}><span style={{ fontFamily:"'DM Mono',monospace", color:T.blue, fontWeight:600 }}>{c.id}</span></td>
                <td style={css.td}><div style={{ fontWeight:600 }}>{c.company}</div><div style={{ fontSize:11, color:T.text2 }}>{c.city}</div></td>
                <td style={css.td}>{c.fleet}</td>
                <td style={css.td}>{c.contracts}</td>
                <td style={css.td}><span style={{ fontWeight:700, fontFamily:"'DM Mono',monospace" }}>{c.value}</span></td>
                <td style={css.td}><RiskScore score={c.risk} level={c.riskLevel} /></td>
                <td style={css.td}><Badge status={c.status} /></td>
                <td style={css.td}><Btn variant="viewSm">Profile</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── SCREEN: CONTRACTS ────────────────────────────────────────────────────────
function ContractsScreen({ onContractGenerate }) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const duration = (() => {
    if (!start || !end) return null;
    const s = new Date(start), e = new Date(end);
    const diff = Math.round((e - s) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return null;
    const months = Math.round(diff / 30);
    const years = Math.floor(months / 12);
    const rem = months % 12;
    let label = "";
    if (years > 0) label += years + " Year" + (years > 1 ? "s" : "");
    if (rem > 0) label += (years > 0 ? " " : "") + rem + " Month" + (rem > 1 ? "s" : "");
    return `📅 ${label} (${diff} days) — Auto Calculated`;
  })();

  return (
    <div>
      <div style={{ background:"#fffbeb", border:"1px solid #fcd34d", borderRadius:8, padding:"12px 16px", marginBottom:16, fontSize:13, color:"#92400e" }}>
        🔒 Contract creation is only available for <strong>Approved</strong> leads.
      </div>

      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, padding:20, marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:11, color:T.text2, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Creating Contract for Lead LD-2024-0089</div>
          <div style={{ fontSize:16, fontWeight:700 }}>Apex Logistics Ltd.</div>
          <div style={{ fontSize:12, color:T.text2, marginTop:2 }}>48 Vehicles · Mumbai, Maharashtra</div>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <span style={{ display:"inline-flex", alignItems:"center", gap:6, background:T.greenLight, color:T.green, border:"1px solid #86efac", borderRadius:6, padding:"6px 14px", fontSize:12, fontWeight:700 }}>✅ Lead Approved</span>
          <span style={{ fontSize:11, color:T.text3, fontFamily:"'DM Mono',monospace" }}>Contract ID: CT-2025-0051</span>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        <div style={{ ...css.card, padding:24 }}>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:16, borderBottom:`1px solid ${T.borderLight}`, paddingBottom:10 }}>Contract Period</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
            <FormGroup label="Contract Start Date *"><Input type="date" value={start} onChange={e => setStart(e.target.value)} /></FormGroup>
            <FormGroup label="Contract End Date *"><Input type="date" value={end} onChange={e => setEnd(e.target.value)} /></FormGroup>
            <FormGroup label="Duration (Auto-calculated)" full>
              <div style={{ padding:"9px 12px", borderRadius:6, background:T.blueLight, color:T.blue, fontWeight:700, fontSize:13 }}>
                {duration || "Select dates above to auto-calculate ↑"}
              </div>
            </FormGroup>
          </div>

          <hr style={{ border:"none", borderTop:`1px solid ${T.border}`, margin:"16px 0" }} />
          <div style={{ fontSize:13, fontWeight:700, marginBottom:12, borderBottom:`1px solid ${T.borderLight}`, paddingBottom:10 }}>Maintenance Scope</div>
          <FormGroup label="Coverage Scope">
            <Select><option>Full Maintenance (Parts + Labor)</option><option>Labor Only</option><option>Preventive Maintenance Only</option><option>Breakdown Support Only</option></Select>
          </FormGroup>

          <hr style={{ border:"none", borderTop:`1px solid ${T.border}`, margin:"16px 0" }} />
          <div style={{ fontSize:13, fontWeight:700, marginBottom:12, borderBottom:`1px solid ${T.borderLight}`, paddingBottom:10 }}>Pricing Model</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <FormGroup label="Pricing Type"><Select><option>Fixed Annual</option><option>Per Vehicle</option><option>Per Service</option></Select></FormGroup>
            <FormGroup label="Amount (₹)"><Input type="number" placeholder="0.00" /></FormGroup>
            <FormGroup label="Payment Terms"><Select><option>Monthly</option><option>Quarterly</option><option>Half-Yearly</option><option>Annual</option></Select></FormGroup>
            <FormGroup label="Penalty Clause (₹/day)"><Input type="number" placeholder="500" /></FormGroup>
          </div>
        </div>

        <div>
          <div style={css.panelCard}>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>📋 SLA Terms</div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <FormGroup label="Response Time SLA"><Select><option>4 Hours (Gold)</option><option>8 Hours (Silver)</option><option>24 Hours (Bronze)</option></Select></FormGroup>
              <FormGroup label="Uptime Guarantee"><Select><option>99.5%</option><option>99%</option><option>98%</option></Select></FormGroup>
              <FormGroup label="Service Coverage"><Select><option>24x7</option><option>Business Hours (9–6)</option><option>Extended Hours (7–10)</option></Select></FormGroup>
            </div>
          </div>

          <div style={css.panelCard}>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>📊 Contract Summary Preview</div>
            {[["Fleet Size","48 Vehicles"],["Coverage","Full Maintenance"],["SLA Tier","Gold – 4Hr"],["Estimated Value","₹16.8L"],["Renewal Alert","30 days prior"]].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${T.borderLight}`, fontSize:13 }}>
                <span style={{ color:T.text2 }}>{k}</span>
                <span style={{ fontWeight:700, fontFamily:"'DM Mono',monospace" }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <Btn full style={{ padding:11, fontSize:13, justifyContent:"center" }} onClick={onContractGenerate}>📄 Generate Draft Contract</Btn>
            <div style={{ textAlign:"center", fontSize:11, color:T.text3 }}>System will auto-generate Contract ID and PDF</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN: BILLING ─────────────────────────────────────────────────────────
function BillingScreen() {
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div style={{ fontSize:15, fontWeight:700 }}>Billing Schedule</div>
        <Btn>+ Generate Invoice</Btn>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:24 }}>
        {[["Total Outstanding","₹8.4L","Across 12 contracts",T.blue],["Collected This Month","₹24.2L","↑ 12% vs last month",T.green],["Overdue","₹1.2L","3 invoices pending",T.yellow]].map(([l,v,s,c]) => (
          <div key={l} style={css.card}>
            <div style={{ fontSize:11, fontWeight:600, color:T.text2, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:8 }}>{l}</div>
            <div style={{ fontSize:26, fontWeight:700, letterSpacing:"-1px", color:c }}>{v}</div>
            <div style={{ fontSize:11, color:T.text3, marginTop:5 }}>{s}</div>
          </div>
        ))}
      </div>

      <div style={css.tableCard}>
        <div style={{ padding:"16px 20px", borderBottom:`1px solid ${T.border}`, fontSize:14, fontWeight:700 }}>Billing Schedule</div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr>{["Contract ID","Company","Billing Freq.","Last Invoice","Next Invoice","Amount","Outstanding","Action"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead>
          <tbody>
            {BILLING_DATA.map(b => (
              <tr key={b.id}>
                <td style={css.td}><span style={{ fontFamily:"'DM Mono',monospace", color:T.blue, fontWeight:600 }}>{b.id}</span></td>
                <td style={{ ...css.td, fontWeight:600 }}>{b.company}</td>
                <td style={css.td}>{b.freq}</td>
                <td style={css.td}>{b.last}</td>
                <td style={{ ...css.td, color: b.overdueStatus === "overdue" ? T.red : (b.overdueStatus === "soon" ? T.yellow : T.text), fontWeight: b.overdueStatus !== "ok" ? 600 : 400 }}>{b.next}</td>
                <td style={{ ...css.td, fontWeight:700, fontFamily:"'DM Mono',monospace" }}>{b.amount}</td>
                <td style={{ ...css.td, color: b.outstanding === "₹0" ? T.green : T.red, fontWeight:600 }}>{b.outstanding}</td>
                <td style={css.td}><Btn variant="viewSm">Invoice</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── SCREEN: SLA ─────────────────────────────────────────────────────────────
function SLAScreen() {
  const healthColor = { healthy: T.green, risk: T.yellow, breach: T.red };
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:24 }}>
        {[["Healthy Contracts","128","SLA ≥ 95%",T.green],["At Risk","10","SLA 85–95%",T.yellow],["Breach","4","SLA < 85%",T.red]].map(([l,v,s,c]) => (
          <div key={l} style={css.card}>
            <div style={{ fontSize:11, fontWeight:600, color:T.text2, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:8 }}>{l}</div>
            <div style={{ fontSize:26, fontWeight:700, letterSpacing:"-1px", color:c }}>{v}</div>
            <div style={{ fontSize:11, color:T.text3, marginTop:5 }}>{s}</div>
          </div>
        ))}
      </div>

      <div style={css.tableCard}>
        <div style={{ padding:"16px 20px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontSize:14, fontWeight:700 }}>SLA Monitoring Dashboard</div>
          <select style={{ padding:"6px 10px", borderRadius:6, border:`1px solid ${T.border}`, fontFamily:"'DM Sans',sans-serif", fontSize:12, color:T.text2, background:T.surface2 }}>
            <option>All Status</option><option>Healthy</option><option>At Risk</option><option>Breach</option>
          </select>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr>{["Contract ID","Company","Fleet","SLA Compliance","Open Tickets","Next Maintenance","Next Billing","Health"].map(h=><th key={h} style={css.th}>{h}</th>)}</tr></thead>
          <tbody>
            {SLA_DATA.map(s => (
              <tr key={s.id}>
                <td style={css.td}><span style={{ fontFamily:"'DM Mono',monospace", color:T.blue, fontWeight:600 }}>{s.id}</span></td>
                <td style={{ ...css.td, fontWeight:600 }}>{s.company}</td>
                <td style={css.td}>{s.fleet}</td>
                <td style={css.td}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontWeight:700, color:healthColor[s.health] }}>{s.sla}%</span>
                    <div style={{ height:6, background:T.border, borderRadius:3, flex:1, overflow:"hidden" }}>
                      <div style={{ height:"100%", borderRadius:3, background:healthColor[s.health], width:`${s.sla}%` }} />
                    </div>
                  </div>
                </td>
                <td style={css.td}>{s.tickets}</td>
                <td style={css.td}>{s.nextMaint}</td>
                <td style={css.td}>{s.nextBill}</td>
                <td style={css.td}><Badge status={s.health} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── SCREEN: REPORTS ─────────────────────────────────────────────────────────
function ReportsScreen() {
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
        {[["Total Revenue","₹2.4Cr","FY 2024–25",T.blue],["Active Contracts","142","↑ 18% YoY",T.green],["Avg. Contract Value","₹16.9L","Per contract",T.text],["Renewal Rate","84%","Target: 80%",T.green]].map(([l,v,s,c]) => (
          <div key={l} style={css.card}>
            <div style={{ fontSize:11, fontWeight:600, color:T.text2, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:8 }}>{l}</div>
            <div style={{ fontSize:26, fontWeight:700, letterSpacing:"-1px", color:c }}>{v}</div>
            <div style={{ fontSize:11, color:T.text3, marginTop:5 }}>{s}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        <div style={css.panelCard}>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>📈 Monthly Revenue Trend</div>
          <div style={{ height:180, background:T.surface2, borderRadius:6, display:"flex", alignItems:"flex-end", gap:6, padding:16, overflow:"hidden" }}>
            {[60,75,55,85,70,90,100].map((h, i) => (
              <div key={i} style={{ flex:1, background: i === 6 ? T.blue : T.blueLight, borderRadius:"4px 4px 0 0", height:`${h}%` }} />
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:T.text3, padding:"4px 16px 0", fontFamily:"'DM Mono',monospace" }}>
            {["Aug","Sep","Oct","Nov","Dec","Jan","Feb"].map(m => <span key={m}>{m}</span>)}
          </div>
        </div>

        <div style={css.panelCard}>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>📊 Contract Status Breakdown</div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:24, height:180 }}>
            <div style={{ width:120, height:120, borderRadius:"50%", background:`conic-gradient(${T.green} 0% 60%,${T.yellow} 60% 78%,${T.red} 78% 85%,${T.border} 85% 100%)`, position:"relative" }}>
              <div style={{ position:"absolute", inset:20, borderRadius:"50%", background:T.surface, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700 }}>142</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8, fontSize:12 }}>
              {[[T.green,"Active (85)"],[T.yellow,"Expiring (25)"],[T.red,"Suspended (12)"],[T.border,"Pending (20)"]].map(([c,l]) => (
                <div key={l} style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:10, height:10, borderRadius:2, background:c }} />{l}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN: SETTINGS ────────────────────────────────────────────────────────
function SettingsScreen() {
  const [tab, setTab] = useState("Roles & Permissions");
  const tabs = ["General","Roles & Permissions","SLA Thresholds","Notifications","AI Settings","Integrations"];
  return (
    <div style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:20 }}>
      <div style={{ ...css.panelCard, padding:10 }}>
        {tabs.map(t => (
          <div key={t} onClick={() => setTab(t)} style={{ padding:"9px 12px", borderRadius:5, fontSize:12, fontWeight:600, cursor:"pointer", background: tab===t ? T.surface2 : "transparent", color: tab===t ? T.text : T.text2, marginBottom:1 }}>{t}</div>
        ))}
      </div>
      <div style={css.panelCard}>
        <div style={{ fontSize:13, fontWeight:700, marginBottom:16 }}>🔑 Role-Based Access Control</div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              <th style={css.th}>Feature / Permission</th>
              <th style={{ ...css.th, textAlign:"center" }}>Care Executive</th>
              <th style={{ ...css.th, textAlign:"center" }}>Customer Handler</th>
              <th style={{ ...css.th, textAlign:"center" }}>Admin</th>
            </tr>
          </thead>
          <tbody>
            {RBAC_TABLE.map(row => (
              <tr key={row.feature}>
                <td style={{ ...css.td, fontSize:13 }}>{row.feature}</td>
                <td style={{ ...css.td, textAlign:"center" }}>{row.executive}</td>
                <td style={{ ...css.td, textAlign:"center" }}>{row.handler}</td>
                <td style={{ ...css.td, textAlign:"center" }}>{row.admin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── SCREEN: ACCESS DENIED ────────────────────────────────────────────────────
function AccessDeniedScreen({ onBack }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:300, gap:12 }}>
      <div style={{ fontSize:48 }}>🔒</div>
      <div style={{ fontSize:18, fontWeight:700 }}>Access Restricted</div>
      <div style={{ fontSize:14, color:T.text2, textAlign:"center" }}>You don't have permission to access this section.<br/>Please contact your administrator for access.</div>
      <Btn variant="secondary" onClick={onBack} style={{ marginTop:8 }}>← Back to Dashboard</Btn>
    </div>
  );
}

// ─── MODAL: REJECT ────────────────────────────────────────────────────────────
function RejectModal({ open, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={<span style={{ color:T.red }}>❌ Reject Lead — Reason Required</span>}
      footer={<>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn variant="danger" onClick={() => { onConfirm(); onClose(); }}>Confirm Rejection</Btn>
      </>}
    >
      <div style={{ background:T.redLight, borderRadius:6, padding:12, fontSize:12, color:"#7f1d1d", marginBottom:16 }}>
        ⚠️ Rejection requires a valid reason. This will be logged in the audit trail.
      </div>
      <FormGroup label="Rejection Reason *">
        <Select value={reason} onChange={e => setReason(e.target.value)}>
          <option>Select reason</option>
          <option>High Risk Score</option>
          <option>Poor Payment History</option>
          <option>Excessive SLA Violations</option>
          <option>Incomplete Documentation</option>
          <option>Fleet Size Outside Coverage</option>
          <option>Other</option>
        </Select>
      </FormGroup>
      <div style={{ marginTop:12 }}>
        <FormGroup label="Detailed Notes">
          <Textarea placeholder="Provide detailed notes for rejection (min. 50 characters)..." value={notes} onChange={e => setNotes(e.target.value)} style={{ minHeight:100 }} />
        </FormGroup>
      </div>
    </Modal>
  );
}

// ─── MODAL: LEAD SUBMITTED ────────────────────────────────────────────────────
function LeadModal({ open, onClose, onView }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={<span style={{ color:T.blue }}>📋 Lead Generated</span>}
      footer={<><Btn variant="secondary" onClick={onClose}>Close</Btn><Btn onClick={() => { onClose(); onView(); }}>View All Leads</Btn></>}
    >
      <div style={{ background:T.blueLight, borderRadius:6, padding:14, marginBottom:16, textAlign:"center" }}>
        <div style={{ fontSize:22, fontWeight:700, color:T.blue, fontFamily:"'DM Mono',monospace" }}>LD-2025-0090</div>
        <div style={{ fontSize:12, color:T.blue, marginTop:4 }}>Lead ID Auto-Generated</div>
      </div>
      {[["Status","review"],["AI Risk Scoring","⏳ Processing…"],["Assigned To","Auto-assigned"]].map(([k,v]) => (
        <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${T.borderLight}`, fontSize:13 }}>
          <span style={{ color:T.text2 }}>{k}</span>
          {k === "Status" ? <Badge status="review" /> : <span style={{ fontWeight:600 }}>{v}</span>}
        </div>
      ))}
      <div style={{ background:"#f0fdf4", borderRadius:6, padding:10, marginTop:12, fontSize:12, color:T.green }}>
        ✅ Lead submitted successfully. Handler will be notified for review.
      </div>
    </Modal>
  );
}

// ─── MODAL: CONTRACT GENERATED ────────────────────────────────────────────────
function ContractModal({ open, onClose, onSend }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={<span style={{ color:T.green }}>✅ Contract Generated Successfully</span>}
      footer={<><Btn variant="secondary" onClick={onClose}>Close</Btn><Btn onClick={() => { onClose(); onSend(); }}>Send to Customer</Btn></>}
    >
      <div style={{ background:T.greenLight, borderRadius:6, padding:14, marginBottom:16, textAlign:"center" }}>
        <div style={{ fontSize:24, fontWeight:700, color:T.green, fontFamily:"'DM Mono',monospace" }}>CT-2025-0051</div>
        <div style={{ fontSize:12, color:T.green, marginTop:4 }}>Contract ID Generated</div>
      </div>
      {[["Status","Pending Customer Confirmation"],["PDF","📄 Contract_CT-2025-0051.pdf"],["Created At","15 Feb 2025, 14:32"]].map(([k,v]) => (
        <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${T.borderLight}`, fontSize:13 }}>
          <span style={{ color:T.text2 }}>{k}</span>
          {k === "Status" ? <Badge status="pending" /> : <span style={{ fontWeight:600, color: k === "PDF" ? T.blue : T.text, fontFamily: k === "Created At" ? "'DM Mono',monospace" : "inherit", fontSize:12 }}>{v}</span>}
        </div>
      ))}
    </Modal>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [role, setRole] = useState("admin");
  const [screen, setScreen] = useState("dashboard");

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);

  const [reviewStatus, setReviewStatus] = useState(null); // null | "approved" | "rejected"

  const [toast, setToast] = useState({ visible:false, msg:"" });

  const showToast = useCallback((msg) => {
    setToast({ visible:true, msg });
    setTimeout(() => setToast(t => ({ ...t, visible:false })), 3500);
  }, []);

  const navigate = useCallback((target) => {
    const allowed = ROLE_PERMISSIONS[role];
    if (!allowed.includes(target)) {
      setScreen("access-denied");
    } else {
      setScreen(target);
    }
  }, [role]);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setScreen("dashboard");
    const info = ROLE_INFO[newRole];
    showToast(`🔑 Switched to ${info.tag} view`);
  };

  const handleApprove = () => {
    setReviewStatus("approved");
    showToast("✅ Lead approved! Contract creation now available.");
  };

  const handleRejectConfirm = () => {
    setReviewStatus("rejected");
    showToast("❌ Lead rejected successfully. Audit log updated.");
  };

  const renderScreen = () => {
    switch (screen) {
      case "dashboard":   return <DashboardScreen onNavigate={navigate} />;
      case "leads":       return <LeadsScreen onNavigate={navigate} />;
      case "leads-new":   return <NewLeadScreen onNavigate={navigate} onSubmit={() => setShowLeadModal(true)} />;
      case "customers":   return <CustomersScreen />;
      case "review":      return (
        <div>
          {reviewStatus && (
            <div style={{ padding:12, borderRadius:6, background: reviewStatus === "approved" ? T.greenLight : T.redLight, color: reviewStatus === "approved" ? "#14532d" : "#7f1d1d", marginBottom:16, fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:8 }}>
              {reviewStatus === "approved" ? "✅ Lead Approved — Contract creation is now enabled. Audit log recorded." : "❌ Lead Rejected — Status updated. Audit log recorded."}
              <Btn variant="secondary" style={{ marginLeft:"auto", fontSize:11, padding:"4px 10px" }} onClick={() => setReviewStatus(null)}>Reset</Btn>
            </div>
          )}
          <ReviewScreen role={role} onApprove={handleApprove} onReject={() => setShowRejectModal(true)} />
        </div>
      );
      case "contracts":   return <ContractsScreen onContractGenerate={() => setShowContractModal(true)} />;
      case "billing":     return <BillingScreen />;
      case "sla":         return <SLAScreen />;
      case "reports":     return <ReportsScreen />;
      case "settings":    return <SettingsScreen />;
      case "access-denied": return <AccessDeniedScreen onBack={() => navigate("dashboard")} />;
      default: return <DashboardScreen onNavigate={navigate} />;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'DM Sans',sans-serif; background:${T.bg}; color:${T.text}; font-size:14px; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(0,0,0,0.15); border-radius:10px; }
        @keyframes modalIn { from { transform:scale(0.95); opacity:0; } to { transform:scale(1); opacity:1; } }
        button:hover { filter:brightness(0.95); }
        tr:hover td { background:${T.surface2}; }
      `}</style>

      <div style={{ display:"flex", minHeight:"100vh" }}>
        <Sidebar currentScreen={screen} role={role} onNavigate={navigate} onRoleChange={handleRoleChange} />

        <main style={{ marginLeft:240, flex:1, display:"flex", flexDirection:"column", minHeight:"100vh" }}>
          <Topbar screen={screen} onNavigate={navigate} />
          <div style={{ padding:"24px 28px", flex:1 }}>
            {renderScreen()}
          </div>
        </main>
      </div>

      <RejectModal open={showRejectModal} onClose={() => setShowRejectModal(false)} onConfirm={handleRejectConfirm} />
      <LeadModal open={showLeadModal} onClose={() => setShowLeadModal(false)} onView={() => navigate("leads")} />
      <ContractModal open={showContractModal} onClose={() => setShowContractModal(false)} onSend={() => showToast("📧 Contract sent to customer!")} />
      <Toast msg={toast.msg} visible={toast.visible} />
    </>
  );
}