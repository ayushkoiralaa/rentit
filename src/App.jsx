import React, { useState, useMemo } from "react";
import {
  Search, MapPin, Star, X, Plus, ArrowRight,
  Sofa, Camera, Wrench, Bike, Shirt, Tag, MoreHorizontal,
  Headphones, Smartphone
} from "lucide-react";

/* ---------- BRAND TOKENS ---------- */
const C = {
  blue: "#2454E0",
  blueDark: "#15318F",
  blueSoft: "#EAF0FE",
  ink: "#12151C",
  gray: "#6B7280",
  grayLine: "#E5E7EB",
  bg: "#F6F7FB",
  white: "#FFFFFF",
  green: "#188A4A",
  red: "#D8402F",
};

const CATEGORIES = [
  { id: "home", label: "Home", icon: Sofa },
  { id: "electronics", label: "Electronics", icon: Camera },
  { id: "tools", label: "Tools", icon: Wrench },
  { id: "vehicles", label: "Vehicles", icon: Bike },
  { id: "fashion", label: "Fashion", icon: Shirt },
  { id: "secondhand", label: "Second hand", icon: Tag },
  { id: "more", label: "And more", icon: MoreHorizontal },
];

const ICONS = { home: Sofa, electronics: Camera, tools: Wrench, vehicles: Bike, fashion: Shirt, secondhand: Tag, more: Headphones };

const SEED_LISTINGS = [
  { id: 1, name: "Sofa-cum-bed, 3-seater", cat: "home", rate: 300, unit: "day", loc: "Baneshwor", dist: 2, owner: "Sujata K.", rating: 4.8, jobs: 22, available: true, image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop" },
  { id: 2, name: "Canon EOS DSLR camera", cat: "electronics", rate: 800, unit: "day", loc: "New Road", dist: 3, owner: "Bikash T.", rating: 4.9, jobs: 41, available: true, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop" },
  { id: 3, name: "Cordless drill machine", cat: "tools", rate: 150, unit: "day", loc: "Lakeside", dist: 1, owner: "Prakash G.", rating: 4.6, jobs: 15, available: true, image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop" },
  { id: 4, name: "Electric scooter", cat: "vehicles", rate: 500, unit: "day", loc: "Chipledhunga", dist: 4, owner: "Anita R.", rating: 4.7, jobs: 30, available: false, image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop" },
  { id: 5, name: "Wedding suit, size L", cat: "fashion", rate: 1200, unit: "day", loc: "Mahendrapul", dist: 2, owner: "Deepak S.", rating: 5.0, jobs: 9, available: true, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=300&fit=crop" },
  { id: 6, name: "Study table, second hand", cat: "secondhand", rate: 200, unit: "week", loc: "Pardi", dist: 5, owner: "Manisha P.", rating: 4.5, jobs: 12, available: true, image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=300&fit=crop" },
  { id: 7, name: "Bluetooth party speaker", cat: "electronics", rate: 250, unit: "day", loc: "New Road", dist: 3, owner: "Bikash T.", rating: 4.9, jobs: 41, available: true, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop" },
  { id: 8, name: "Mountain bike, 21-gear", cat: "vehicles", rate: 350, unit: "day", loc: "Baidam", dist: 2, owner: "Suraj M.", rating: 4.8, jobs: 18, available: true, image: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400&h=300&fit=crop" },
];

const fmt = (n) => "Rs. " + n.toLocaleString("en-IN");

/* ---------- CARD ---------- */
function ItemCard({ item, onOpen }) {
  const cat = CATEGORIES.find(c => c.id === item.cat) || CATEGORIES[6];
  const Icon = cat.icon;
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = item.image && !imgFailed;
  return (
    <div
      onClick={() => onOpen(item)}
      style={{
        background: C.white, borderRadius: 14, border: `1px solid ${C.grayLine}`,
        overflow: "hidden", cursor: "pointer", transition: "box-shadow .15s ease, transform .15s ease",
      }}
      className="item-card"
    >
      <div style={{
        height: 130, background: C.blueSoft, display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        {showImage ? (
          <img
            src={item.image}
            alt={item.name}
            onError={() => setImgFailed(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Icon size={40} color={C.blue} strokeWidth={1.6} />
        )}
        {!item.available && (
          <span style={{
            position: "absolute", top: 10, right: 10, background: C.red, color: C.white,
            fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20,
          }}>Rented</span>
        )}
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: C.blue, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 4 }}>
          {cat.label}
        </div>
        <h3 style={{ fontSize: 15.5, fontWeight: 600, color: C.ink, margin: "0 0 8px", lineHeight: 1.3 }}>
          {item.name}
        </h3>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: C.ink }}>{fmt(item.rate)}</span>
          <span style={{ fontSize: 12.5, color: C.gray }}>/ {item.unit}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: C.gray }}>
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><MapPin size={12} /> {item.loc}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Star size={12} fill={C.blue} color={C.blue} /> {item.rating}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- ITEM DETAIL MODAL ---------- */
function DetailModal({ item, onClose, requested, onRequest }) {
  const [imgFailed, setImgFailed] = useState(false);
  if (!item) return null;
  const cat = CATEGORIES.find(c => c.id === item.cat) || CATEGORIES[6];
  const Icon = cat.icon;
  const showImage = item.image && !imgFailed;
  return (
    <div style={{ position: "fixed", inset: 0, background: "#12151Ccc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }} onClick={onClose}>
      <div style={{ background: C.white, maxWidth: 440, width: "100%", borderRadius: 16, overflow: "hidden", position: "relative" }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: C.white, borderRadius: "50%", width: 32, height: 32, border: "none", cursor: "pointer", color: C.gray, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}><X size={18} /></button>

        <div style={{ height: 180, background: C.blueSoft, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {showImage ? (
            <img src={item.image} alt={item.name} onError={() => setImgFailed(true)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <Icon size={44} color={C.blue} strokeWidth={1.6} />
          )}
        </div>

        <div style={{ padding: "22px 26px 24px" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.blue, textTransform: "uppercase", marginBottom: 6 }}>{cat.label}</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.ink, margin: "0 0 12px" }}>{item.name}</h2>
        <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.ink }}>{fmt(item.rate)} <span style={{ fontSize: 12.5, color: C.gray, fontWeight: 400 }}>/ {item.unit}</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: C.gray }}><Star size={14} fill={C.blue} color={C.blue} /> {item.rating} ({item.jobs} rentals)</div>
        </div>
        <div style={{ fontSize: 13.5, color: C.gray, marginBottom: 18, display: "flex", alignItems: "center", gap: 4 }}>
          <MapPin size={14} /> {item.loc} · {item.dist} km · owned by {item.owner}
        </div>
        {item.available ? (
          requested ? (
            <div style={{ background: "#E9F7EF", color: C.green, padding: "12px 16px", borderRadius: 10, fontSize: 13.5, fontWeight: 500 }}>
              Request sent — {item.owner} will confirm pickup details.
            </div>
          ) : (
            <button onClick={onRequest} style={{ width: "100%", background: C.blue, color: C.white, border: "none", padding: "13px 16px", borderRadius: 10, fontSize: 14.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              Request to rent <ArrowRight size={16} />
            </button>
          )
        ) : (
          <div style={{ background: "#FDECEA", color: C.red, padding: "12px 16px", borderRadius: 10, fontSize: 13.5, fontWeight: 500 }}>
            Currently rented out — check back soon.
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

/* ---------- ADD LISTING MODAL ---------- */
function AddListingModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: "", cat: CATEGORIES[0].id, rate: "", unit: "day", loc: "", dist: "", owner: "", image: "" });
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = () => {
    if (!form.name.trim() || !form.rate || !form.loc.trim() || !form.owner.trim()) {
      setError("Fill in item name, rate, location, and your name first.");
      return;
    }
    onAdd({
      id: Date.now(), name: form.name.trim(), cat: form.cat, rate: Number(form.rate), unit: form.unit,
      loc: form.loc.trim(), dist: form.dist ? Number(form.dist) : 0, owner: form.owner.trim(),
      rating: 5.0, jobs: 0, available: true, image: form.image.trim() || null,
    });
  };

  const field = { width: "100%", border: `1px solid ${C.grayLine}`, borderRadius: 10, padding: "10px 12px", fontSize: 13.5, background: C.bg, color: C.ink, marginBottom: 14 };
  const label = { fontSize: 12, fontWeight: 600, color: C.gray, marginBottom: 6, display: "block" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#12151Ccc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20, overflowY: "auto" }} onClick={onClose}>
      <div style={{ background: C.white, maxWidth: 440, width: "100%", borderRadius: 16, padding: "26px 26px 24px", position: "relative", margin: "24px 0" }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: C.gray }}><X size={20} /></button>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.blue, textTransform: "uppercase", marginBottom: 6 }}>New listing</div>
        <h2 style={{ fontSize: 21, fontWeight: 700, color: C.ink, margin: "0 0 16px" }}>List your item</h2>

        <label style={label}>Item name</label>
        <input style={field} value={form.name} onChange={set("name")} placeholder="e.g. Table fan, 3 speed" />

        <label style={label}>Category</label>
        <select style={field} value={form.cat} onChange={set("cat")}>
          {CATEGORIES.filter(c => c.id !== "more").map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={label}>Rate (Rs.)</label>
            <input style={field} type="number" min="0" value={form.rate} onChange={set("rate")} placeholder="250" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={label}>Per</label>
            <select style={field} value={form.unit} onChange={set("unit")}>
              <option value="day">day</option>
              <option value="week">week</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={label}>Location</label>
            <input style={field} value={form.loc} onChange={set("loc")} placeholder="e.g. Lakeside" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={label}>Distance (km)</label>
            <input style={field} type="number" min="0" value={form.dist} onChange={set("dist")} placeholder="3" />
          </div>
        </div>

        <label style={label}>Your name</label>
        <input style={field} value={form.owner} onChange={set("owner")} placeholder="e.g. Rikesh T." />

        <label style={label}>Image URL (optional)</label>
        <input style={field} value={form.image} onChange={set("image")} placeholder="https://... (leave blank to use a category icon)" />

        {error && <div style={{ color: C.red, fontSize: 12.5, marginBottom: 12, fontWeight: 500 }}>{error}</div>}

        <button onClick={submit} style={{ width: "100%", background: C.blue, color: C.white, border: "none", padding: "13px 16px", borderRadius: 10, fontSize: 14.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          Post listing <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ---------- APP ---------- */
export default function App() {
  const [listings, setListings] = useState(SEED_LISTINGS);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState(null);
  const [selected, setSelected] = useState(null);
  const [requested, setRequested] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (item) => {
    setListings(prev => [item, ...prev]);
    setShowAdd(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 4000);
  };

  const filtered = useMemo(() => listings.filter(item => {
    const matchesCat = !activeCat || item.cat === activeCat;
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || item.name.toLowerCase().includes(q) || item.loc.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  }), [listings, query, activeCat]);

  const openItem = (item) => { setSelected(item); setRequested(false); };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: C.bg, minHeight: "100vh", color: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .item-card:hover { box-shadow: 0 8px 20px rgba(18,21,28,0.08); transform: translateY(-2px); }
        .cat-chip { transition: background .15s ease, color .15s ease, border-color .15s ease; }
        input:focus, select:focus, button:focus { outline: 2px solid ${C.blue}; outline-offset: 1px; }
        @media (prefers-reduced-motion: reduce) { .item-card, .cat-chip { transition: none !important; } }
        @media (max-width: 560px) { .nav-link { display: none; } }
      `}</style>

      {/* NAV */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", background: C.white, borderBottom: `1px solid ${C.grayLine}`, position: "sticky", top: 0, zIndex: 30 }}>
        <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 22 }}>
          <span style={{ color: C.ink }}>Rent</span><span style={{ color: C.blue }}>it</span>
        </div>
        <nav style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <a href="#browse" className="nav-link" style={{ color: C.ink, textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Browse</a>
          <a href="#how" className="nav-link" style={{ color: C.ink, textDecoration: "none", fontSize: 14, fontWeight: 500 }}>How it works</a>
          <button onClick={() => setShowAdd(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: C.blue, color: C.white, border: "none", padding: "9px 16px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
            <Plus size={15} /> List an item
          </button>
        </nav>
      </header>

      {/* HERO */}
      <section style={{ padding: "56px 24px 40px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "clamp(30px, 5vw, 46px)", lineHeight: 1.1, marginBottom: 14 }}>
          Rent Anything. <span style={{ color: C.blue }}>Your Way.</span>
        </div>
        <p style={{ color: C.gray, fontSize: 15.5, maxWidth: 460, margin: "0 auto 28px" }}>
          Borrow what you need for a day, list what's sitting idle — from tools and electronics to clothes and second-hand furniture.
        </p>
        <div style={{ maxWidth: 560, margin: "0 auto", background: C.white, border: `1px solid ${C.grayLine}`, borderRadius: 14, padding: 8, display: "flex", gap: 8, alignItems: "center", boxShadow: "0 4px 16px rgba(18,21,28,0.06)" }}>
          <Search size={18} color={C.gray} style={{ marginLeft: 8, flexShrink: 0 }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search for tools, gadgets, vehicles..."
            style={{ flex: 1, minWidth: 120, border: "none", outline: "none", fontSize: 14, background: "transparent", color: C.ink }} />
          <a href="#browse" style={{ background: C.blue, color: C.white, border: "none", padding: "10px 20px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, textDecoration: "none" }}>Search</a>
        </div>
      </section>

      {/* CATEGORY STRIP */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6 }}>
          <button onClick={() => setActiveCat(null)} className="cat-chip" style={{
            flexShrink: 0, display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 20,
            fontSize: 13, fontWeight: 500, cursor: "pointer", border: `1px solid ${activeCat === null ? C.blue : C.grayLine}`,
            background: activeCat === null ? C.blue : C.white, color: activeCat === null ? C.white : C.ink,
          }}>All</button>
          {CATEGORIES.map(c => {
            const Icon = c.icon; const active = activeCat === c.id;
            return (
              <button key={c.id} onClick={() => setActiveCat(active ? null : c.id)} className="cat-chip" style={{
                flexShrink: 0, display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 20,
                fontSize: 13, fontWeight: 500, cursor: "pointer", border: `1px solid ${active ? C.blue : C.grayLine}`,
                background: active ? C.blue : C.white, color: active ? C.white : C.ink,
              }}>
                <Icon size={14} /> {c.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* LISTINGS */}
      <section id="browse" style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 21, margin: 0 }}>
            {filtered.length} item{filtered.length !== 1 ? "s" : ""} available
          </h2>
          {justAdded && <span style={{ fontSize: 12.5, fontWeight: 500, color: C.green, background: "#E9F7EF", padding: "6px 12px", borderRadius: 20 }}>Listed — it's live below.</span>}
        </div>

        {filtered.length === 0 ? (
          <div style={{ border: `1px dashed ${C.grayLine}`, borderRadius: 14, padding: "48px 24px", textAlign: "center", color: C.gray, marginBottom: 40 }}>
            Nothing matches that search. Try a different item or clear the filter.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18, marginBottom: 50 }}>
            {filtered.map(item => <ItemCard key={item.id} item={item} onOpen={openItem} />)}
          </div>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ background: C.white, borderTop: `1px solid ${C.grayLine}`, padding: "44px 24px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 22, marginBottom: 26, textAlign: "center" }}>How it works</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
            {[
              { t: "Search nearby", d: "Filter by category and see what's available close to you." },
              { t: "Request to rent", d: "Pick your dates and send a request. The owner confirms pickup." },
              { t: "Return & rate", d: "Bring it back on time and leave a rating for the next renter." },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.blueSoft, color: C.blue, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, margin: "0 auto 10px" }}>{i + 1}</div>
                <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 15.5, margin: "0 0 6px" }}>{s.t}</h3>
                <p style={{ fontSize: 13, color: C.gray, lineHeight: 1.6, margin: 0 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: C.blue, color: C.white, padding: "44px 24px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 24, margin: "0 0 8px" }}>Got something to rent out?</h2>
        <p style={{ color: "#DCE5FC", marginBottom: 20, fontSize: 14 }}>List it in a few minutes — you set the rate and the rules.</p>
        <button onClick={() => setShowAdd(true)} style={{ background: C.white, color: C.blue, border: "none", padding: "12px 26px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Plus size={16} /> List your item
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "24px 24px", textAlign: "center", background: C.white, borderTop: `1px solid ${C.grayLine}` }}>
        <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
          <span style={{ color: C.ink }}>Rent</span><span style={{ color: C.blue }}>it</span>
        </div>
        <p style={{ fontSize: 12, color: C.gray, margin: 0 }}>A college project — rent anything, your way.</p>
      </footer>

      <DetailModal item={selected} onClose={() => setSelected(null)} requested={requested} onRequest={() => setRequested(true)} />
      {showAdd && <AddListingModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
    </div>
  );
}
