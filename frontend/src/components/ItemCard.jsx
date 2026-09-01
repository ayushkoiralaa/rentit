import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export default function ItemCard({ item, isFavorited, onToggleFavorite }) {
  if (!item) return null;

  const id = item._id || item.id || "";
  const title = item.title || "Untitled Item";
  const categoryName = item.category?.name || (typeof item.category === "string" ? item.category : "General");
  const city = item.city || "Nepal";
  const price = item.pricePerDay ?? item.price ?? 0;
  
  const rawCondition = item.condition || "GOOD";
  const condition = String(rawCondition).replace(/_/g, " ");
  const rating = item.ratingAverage || item.rating || 5.0;

  // Safely extract image URL handling string or object ({ url: '...' })
  const firstImage = Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : null;
  const imageUrl =
    (typeof firstImage === "string" ? firstImage : firstImage?.url) ||
    item.imageUrl ||
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="group bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 hover:shadow-xl hover:shadow-blue-950/20 transition-all flex flex-col relative">
      <div className="h-44 w-full overflow-hidden relative bg-slate-950">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80";
          }}
        />
        <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-slate-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border border-slate-800">
          {condition}
        </span>

        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite(item);
            }}
            aria-label="Toggle favorite"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors"
          >
            <Heart size={14} className={isFavorited ? "fill-rose-500 text-rose-500" : ""} />
          </button>
        )}
      </div>

      <Link to={`/items/${id}`} className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">
            {categoryName} • {city}
          </span>
          <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-blue-400 transition-colors mt-1">
            {title}
          </h3>
        </div>

        <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
          <div>
            <span className="text-base font-extrabold text-white">Rs. {price}</span>
            <span className="text-xs text-slate-400"> / day</span>
          </div>
          <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
            ★ {rating}
          </span>
        </div>
      </Link>
    </div>
  );
}

export function ItemCardSkeleton() {
  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 animate-pulse space-y-3">
      <div className="h-40 bg-slate-800/60 rounded-xl" />
      <div className="h-4 bg-slate-800/60 rounded w-3/4" />
      <div className="h-3 bg-slate-800/60 rounded w-1/2" />
      <div className="h-5 bg-slate-800/60 rounded w-1/3 pt-2" />
    </div>
  );
}