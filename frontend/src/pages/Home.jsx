import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowRight, ShieldCheck, HandCoins, Star } from "lucide-react";
import { itemsApi } from "../api/items.js";
import { categoriesApi } from "../api/marketplace.js";
import ItemCard, { ItemCardSkeleton } from "../components/ItemCard.jsx";
import { getCategoryIcon } from "../constants.js";

export default function Home() {
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [trending, setTrending] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      categoriesApi.list(),
      itemsApi.browse({ sort: "recommended", limit: 8 }),
      itemsApi.browse({ sort: "newest", limit: 8 }),
    ])
      .then(([catsRes, trendingRes, recentRes]) => {
        setCategories(catsRes.categories.slice(0, 7));
        setTrending(trendingRes.items);
        setRecent(recentRes.items);
      })
      .finally(() => setLoading(false));
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/browse?q=${encodeURIComponent(query.trim())}` : "/browse");
  };

  return (
    <div>
      {/* HERO */}
      <section className="text-center px-4 pt-14 pb-10 sm:pt-16 sm:pb-12">
        <h1 className="font-display font-extrabold text-[clamp(30px,5vw,48px)] leading-tight mb-3">
          Rent Anything. <span className="text-brand">Your Way.</span>
        </h1>
        <p className="text-muted text-[15px] max-w-lg mx-auto mb-7">
          Borrow what you need for a day, list what's sitting idle — from tools and electronics to
          vehicles, fashion and second-hand furniture.
        </p>
        <form onSubmit={submitSearch} className="max-w-xl mx-auto bg-white border border-line rounded-2xl p-1.5 flex items-center gap-2 shadow-card">
          <Search size={18} className="text-muted ml-3 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for tools, gadgets, vehicles..."
            className="flex-1 min-w-0 border-none outline-none text-sm bg-transparent py-2.5"
          />
          <button type="submit" className="bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-dark shrink-0">
            Search
          </button>
        </form>
      </section>

      {/* CATEGORY STRIP */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex gap-2.5 overflow-x-auto pb-2">
          {categories.map((c) => {
            const Icon = getCategoryIcon(c.icon);
            return (
              <Link
                key={c._id}
                to={`/browse?category=${c.slug}`}
                className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border border-line bg-white text-sm font-medium hover:border-brand hover:text-brand transition-colors"
              >
                <Icon size={15} /> {c.name}
              </Link>
            );
          })}
        </div>
      </section>

      {/* TRENDING */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-9">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display font-bold text-xl">Trending near you</h2>
          <Link to="/browse" className="text-sm font-semibold text-brand flex items-center gap-1 hover:gap-1.5 transition-all">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ItemCardSkeleton key={i} />)
            : trending.map((item) => <ItemCard key={item._id} item={item} />)}
        </div>
      </section>

      {/* RECENTLY ADDED */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display font-bold text-xl">Recently added</h2>
          <Link to="/browse?sort=newest" className="text-sm font-semibold text-brand flex items-center gap-1 hover:gap-1.5 transition-all">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ItemCardSkeleton key={i} />)
            : recent.map((item) => <ItemCard key={item._id} item={item} />)}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-white border-y border-line mt-16 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="font-display font-bold text-2xl text-center mb-10">How Rent It works</h2>
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            {[
              { icon: Search, t: "Search nearby", d: "Filter by category and location to see what's available close to you." },
              { icon: HandCoins, t: "Request to rent", d: "Pick your dates, see the price breakdown, and send a request. The owner confirms." },
              { icon: Star, t: "Return & rate", d: "Bring it back on time, then leave a rating for the next renter." },
            ].map((s, i) => (
              <div key={i}>
                <div className="w-12 h-12 rounded-full bg-brand-soft text-brand flex items-center justify-center mx-auto mb-3">
                  <s.icon size={22} />
                </div>
                <h3 className="font-display font-semibold text-[15px] mb-1.5">{s.t}</h3>
                <p className="text-sm text-muted leading-relaxed max-w-[220px] mx-auto">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST & SAFETY */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-brand-soft rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-14 h-14 rounded-full bg-white text-brand flex items-center justify-center shrink-0">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg mb-1">Built for trust and safety</h3>
            <p className="text-sm text-ink/80 max-w-2xl">
              Every rental runs through server-verified pricing, protected security deposits, owner
              and renter ratings, and a reporting system so issues get resolved quickly and fairly.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand text-white text-center px-4 py-12">
        <h2 className="font-display font-bold text-2xl mb-2">Got something to rent out?</h2>
        <p className="text-blue-100 mb-5 text-sm">List it in a few minutes — you set the rate and the rules.</p>
        <Link
          to="/dashboard/listings/new"
          className="inline-flex items-center gap-2 bg-white text-brand font-semibold px-6 py-3 rounded-xl hover:bg-blue-50"
        >
          List your item <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
