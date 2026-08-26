import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { itemsApi } from "../api/items.js";
import { categoriesApi, favoritesApi } from "../api/marketplace.js";
import ItemCard, { ItemCardSkeleton } from "../components/ItemCard.jsx";
import { EmptyState } from "../components/ui.jsx";
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
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const { user } = useAuth();
  const toast = useToast();

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const city = searchParams.get("city") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const condition = searchParams.get("condition") || "";
  const sort = searchParams.get("sort") || "recommended";
  const page = Number(searchParams.get("page") || 1);

  useEffect(() => {
    categoriesApi.list().then((res) => setCategories(res.flat));
  }, []);

  useEffect(() => {
    if (user) {
      favoritesApi.list().then((res) => setFavoriteIds(new Set(res.favorites.map((f) => f.item._id))));
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    itemsApi
      .browse({ q, category, city, minPrice, maxPrice, condition, sort, page, limit: 12 })
      .then((res) => {
        setItems(res.items);
        setPagination(res.pagination);
      })
      .finally(() => setLoading(false));
  }, [q, category, city, minPrice, maxPrice, condition, sort, page]);

  const updateParam = useCallback(
    (key, value) => {
      const next = new URLSearchParams(searchParams);
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete("page");
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="font-display font-bold text-xl">
          {loading ? "Searching..." : `${pagination.total} item${pagination.total !== 1 ? "s" : ""} available`}
          {q && <span className="text-muted font-normal text-base"> for "{q}"</span>}
        </h1>
        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="text-sm border border-line rounded-lg px-3 py-2 bg-white"
          >
            {SORTS.map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <button
            onClick={() => setFiltersOpen(true)}
            className="lg:hidden flex items-center gap-1.5 text-sm border border-line rounded-lg px-3 py-2 bg-white"
          >
            <SlidersHorizontal size={14} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        {/* SIDEBAR (desktop) */}
        <aside className="hidden lg:block">
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
            <div className="absolute inset-0 bg-ink/40" onClick={() => setFiltersOpen(false)} />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold">Filters</h3>
                <button onClick={() => setFiltersOpen(false)} aria-label="Close filters"><X size={20} /></button>
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

        {/* RESULTS */}
        <div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => <ItemCardSkeleton key={i} />)}
            </div>
          ) : items.length === 0 ? (
            <EmptyState title="Nothing matches that search" description="Try a different keyword or clear some filters." />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {items.map((item) => (
                  <ItemCard key={item._id} item={item} isFavorited={favoriteIds.has(item._id)} onToggleFavorite={toggleFavorite} />
                ))}
              </div>
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  {Array.from({ length: pagination.totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => updateParam("page", String(i + 1))}
                      className={`w-8 h-8 rounded-lg text-sm font-medium ${
                        pagination.page === i + 1 ? "bg-brand text-white" : "border border-line hover:border-brand"
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
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xs font-semibold text-muted uppercase mb-2.5">Category</h4>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="category" checked={!category} onChange={() => onChange("category", "")} /> All categories
          </label>
          {categories.filter((c) => !c.parent).map((c) => (
            <label key={c._id} className="flex items-center gap-2 text-sm">
              <input type="radio" name="category" checked={category === c.slug} onChange={() => onChange("category", c.slug)} /> {c.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-muted uppercase mb-2.5">City</h4>
        <input
          defaultValue={city}
          onBlur={(e) => onChange("city", e.target.value)}
          placeholder="e.g. Kathmandu"
          className="w-full text-sm border border-line rounded-lg px-3 py-2 bg-surface"
        />
      </div>

      <div>
        <h4 className="text-xs font-semibold text-muted uppercase mb-2.5">Price per day (Rs.)</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            defaultValue={minPrice}
            onBlur={(e) => onChange("minPrice", e.target.value)}
            placeholder="Min"
            className="w-full text-sm border border-line rounded-lg px-3 py-2 bg-surface"
          />
          <span className="text-muted">–</span>
          <input
            type="number"
            min="0"
            defaultValue={maxPrice}
            onBlur={(e) => onChange("maxPrice", e.target.value)}
            placeholder="Max"
            className="w-full text-sm border border-line rounded-lg px-3 py-2 bg-surface"
          />
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-muted uppercase mb-2.5">Condition</h4>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="condition" checked={!condition} onChange={() => onChange("condition", "")} /> Any
          </label>
          {CONDITIONS.map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm">
              <input type="radio" name="condition" checked={condition === c} onChange={() => onChange("condition", c)} />
              {c.replace("_", " ").toLowerCase()}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
