import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Star, Heart } from "lucide-react";
import { formatCurrency, CONDITION_LABELS } from "../constants.js";
import { resolveAssetUrl } from "../api/client.js";

export default function ItemCard({ item, isFavorited, onToggleFavorite }) {
  const image = item.images?.[0]?.url;
  const isPublished = item.status === "PUBLISHED";

  return (
    <Link
      to={`/items/${item.slug}`}
      className="group bg-white rounded-2xl border border-line overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all block relative"
    >
      <div className="h-36 sm:h-40 bg-brand-soft relative overflow-hidden">
        {image ? (
          <img
            src={resolveAssetUrl(image)}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-brand text-3xl font-display font-bold">
            {item.title?.charAt(0)}
          </div>
        )}

        {!isPublished && (
          <span className="absolute top-2.5 left-2.5 bg-ink/80 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize">
            {item.status.replace("_", " ").toLowerCase()}
          </span>
        )}

        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(item);
            }}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white"
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart size={15} className={isFavorited ? "fill-danger text-danger" : "text-muted"} />
          </button>
        )}
      </div>

      <div className="p-3.5">
        <div className="text-[11px] font-semibold text-brand uppercase tracking-wide mb-1 truncate">
          {item.category?.name || "Uncategorized"}
        </div>
        <h3 className="text-[15px] font-semibold text-ink mb-2 leading-snug line-clamp-2 min-h-[2.5em]">
          {item.title}
        </h3>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-[17px] font-bold text-ink">{formatCurrency(item.pricePerDay)}</span>
          <span className="text-xs text-muted">/ day</span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted">
          <span className="flex items-center gap-1 truncate">
            <MapPin size={12} className="shrink-0" /> {item.city}
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <Star size={12} className="fill-brand text-brand" /> {item.ratingAverage?.toFixed(1) || "New"}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ItemCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-line overflow-hidden animate-pulse">
      <div className="h-36 sm:h-40 bg-surface" />
      <div className="p-3.5 space-y-2">
        <div className="h-2.5 bg-surface rounded w-1/3" />
        <div className="h-4 bg-surface rounded w-4/5" />
        <div className="h-4 bg-surface rounded w-1/2" />
      </div>
    </div>
  );
}
