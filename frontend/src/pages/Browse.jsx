import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { itemsApi } from "../api/items.js";
import { categoriesApi, favoritesApi } from "../api/marketplace.js";
import ItemCard, { ItemCardSkeleton } from "../components/ItemCard.jsx";
import { EmptyState, ErrorState } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

const CONDITIONS = ["NEW", "LIKE_NEW", "GOOD", "FAIR"];
const SORTS = [
  ["recommended", "Recommended"],
  ["newest", "Newest"],
  ["price_asc", "Price: Low to High"],
  ["price_desc", "Price: High to Low"],
  ["rating", "Highest Rated"],
];

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [cityStats, setCityStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const { user } = useAuth();
  const toast = useToast();

  const q = searchParams.get("q") || "";
  const tag = searchParams.get("tag") || "";
  const category = searchParams.get("category") || "";
  const city = searchParams.get("city") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const condition = searchParams.get("condition") || "";
  const sort = searchParams.get("sort") || "recommended";
  const page = Number(searchParams.get("page") || 1);

  useEffect(() => {
    categoriesApi
      .list()
      .then((res) => setCategories(res.flat || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      favoritesApi
        .list()
        .then((res) => setFavoriteIds(new Set(res.favorites.map((f) => f.item._id))))
        .catch(() => {});
    }
  }, [user]);

  const loadItems = () => {
    setLoading(true);
    setLoadError(false);
    itemsApi
      .browse({ q, tag, category, city, minPrice, maxPrice, condition, sort, page, limit: 12 })
      .then((res) => {
        setCityStats(res.cityStats || null);
        setItems(res.items || []);
        setPagination(res.pagination || { page: 1, totalPages: 1, total: 0 });
      })
      .catch(() => {
        setLoadError(true);
        setCityStats(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadItems, [q, tag, category, city, minPrice, maxPrice, condition, sort, page]);

  const updateParam = useCallback(
    (key, value) => {
      const next = new URLSearchParams(searchParams);
      if (value) next.set(key, value);
      else next.delete(key);

      // Reset to page 1 when changing filters, but keep page param when clicking page numbers
      if (key !== "page") {
        next.delete("page");
      }

      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  const toggleFavorite = async (item) => {
    if (!user) return toast.info("Log in to save favorites.");
    const isFav = favoriteIds.has(item._id);
    try {
      if (isFav) {
        await favoritesApi.remove(item._id);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(item._id);
          return next;
        });
      } else {
        await favoritesApi.add(item._id);
        setFavoriteIds((prev) => new Set(prev).add(item._id));
        toast.success("Added to favorites.");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const activeFilterCount = [category, city, minPrice, maxPrice, condition].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-bold text-xl text-white">
          {loading ? "Searching..." : `${pagination.total} item${pagination.total !== 1 ? "s" : ""} available`}
          {q && <span className="text-slate-400 font-normal text-base"> for "{q}"</span>}
          {tag && (
            <button
              type="button"
              onClick={() => updateParam("tag", "")}
              className="ml-2 align-middle text-xs font-medium bg-blue-900/60 border border-blue-700/50 text-blue-400 rounded-full px-2.5 py-1 hover:opacity-80"
            >
              #{tag} ✕
            </button>
          )}
        </h1>
        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="text-xs font-medium border border-slate-800 rounded-xl px-3 py-2 bg-slate-900 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            {SORTS.map(([val, label]) => (
              <option key={val} value={val} className="bg-slate-900 text-slate-200">
                {label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setFiltersOpen(true)}
            className="lg:hidden flex items-center gap-1.5 text-xs font-semibold border border-slate-800 rounded-xl px-3.5 py-2 bg-slate-900 text-slate-200"
          >
            <SlidersHorizontal size={14} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
        </div>
      </div>

      {/* City Statistics Banner */}
      {!loading && cityStats && (
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl mb-6 flex flex-wrap items-center justify-between gap-4 backdrop-blur-sm">
          <div>
            <h2 className="text-base font-bold text-white">Listings in {cityStats.cityName}</h2>
            <p className="text-xs text-slate-400">
              Showing {cityStats.totalItems} available {cityStats.totalItems === 1 ? "listing" : "listings"}
            </p>
          </div>

          <div className="flex gap-3 text-xs">
            <div className="bg-slate-950/80 border border-slate-800 px-3.5 py-2 rounded-xl">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Min Price</span>
              <span className="font-bold text-white">Rs. {cityStats.minPrice}/day</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 px-3.5 py-2 rounded-xl">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Avg Price</span>
              <span className="font-bold text-white">Rs. {cityStats.avgPrice}/day</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 px-3.5 py-2 rounded-xl">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Max Price</span>
              <span className="font-bold text-white">Rs. {cityStats.maxPrice}/day</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[240px_1fr] gap-8">
        {/* SIDEBAR (Desktop) */}
        <aside className="hidden lg:block bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 h-fit">
          <FilterPanel
            categories={categories}
            category={category}
            city={city}
            minPrice={minPrice}
            maxPrice={maxPrice}
            condition={condition}
            onChange={updateParam}
          />
        </aside>

        {/* MOBILE DRAWER */}
        {filtersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
            <div className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 rounded-t-2xl p-6 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-white">Filters</h3>
                <button onClick={() => setFiltersOpen(false)} aria-label="Close filters" className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <FilterPanel
                categories={categories}
                category={category}
                city={city}
                minPrice={minPrice}
                maxPrice={maxPrice}
                condition={condition}
                onChange={updateParam}
              />
            </div>
          </div>
        )}

        {/* RESULTS GRID */}
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <ItemCardSkeleton key={i} />
              ))}
            </div>
          ) : loadError ? (
            <ErrorState description="Couldn't load listings. Check your connection and try again." onRetry={loadItems} />
          ) : items.length === 0 ? (
            <EmptyState title="Nothing matches that search" description="Try a different keyword or clear some filters." />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((item) => (
                  <ItemCard
                    key={item._id}
                    item={item}
                    isFavorited={favoriteIds.has(item._id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {Array.from({ length: pagination.totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => updateParam("page", String(i + 1))}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors ${
                        pagination.page === i + 1
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                          : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterPanel({ categories, category, city, minPrice, maxPrice, condition, onChange }) {
  const defaultCategories = [
    { _id: "cat1", name: "Electronics", slug: "electronics" },
    { _id: "cat2", name: "Events & Party", slug: "party" },
    { _id: "cat3", name: "Fashion", slug: "fashion" },
    { _id: "cat4", name: "Home & Appliances", slug: "home" },
    { _id: "cat5", name: "Sports & Outdoors", slug: "outdoors" },
    { _id: "cat6", name: "Tools & Equipment", slug: "tools" },
    { _id: "cat7", name: "Vehicles", slug: "vehicles" },
  ];

  const categoryList = categories.length > 0 ? categories.filter((c) => !c.parent) : defaultCategories;

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Category</h4>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white">
            <input
              type="radio"
              name="category"
              checked={!category}
              onChange={() => onChange("category", "")}
              className="accent-blue-600"
            />
            All categories
          </label>
          {categoryList.map((c) => (
            <label key={c._id} className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white">
              <input
                type="radio"
                name="category"
                checked={category === c.slug}
                onChange={() => onChange("category", c.slug)}
                className="accent-blue-600"
              />
              {c.name}
            </label>
          ))}
        </div>
      </div>

      {/* City Filter */}
      <div>
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">City</h4>
        <input
          defaultValue={city}
          onBlur={(e) => onChange("city", e.target.value)}
          placeholder="e.g. Kathmandu"
          className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Price Per Day Filter */}
      <div>
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Price per day (Rs.)</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            defaultValue={minPrice}
            onBlur={(e) => onChange("minPrice", e.target.value)}
            placeholder="Min"
            className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <span className="text-slate-600 text-xs">–</span>
          <input
            type="number"
            min="0"
            defaultValue={maxPrice}
            onBlur={(e) => onChange("maxPrice", e.target.value)}
            placeholder="Max"
            className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Condition Filter */}
      <div>
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Condition</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white">
            <input
              type="radio"
              name="condition"
              checked={!condition}
              onChange={() => onChange("condition", "")}
              className="accent-blue-600"
            />
            Any
          </label>
          {CONDITIONS.map((c) => (
            <label key={c} className="flex items-center gap-2.5 text-xs text-slate-300 capitalize cursor-pointer hover:text-white">
              <input
                type="radio"
                name="condition"
                checked={condition === c}
                onChange={() => onChange("condition", c)}
                className="accent-blue-600"
              />
              {c.replace("_", " ").toLowerCase()}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}