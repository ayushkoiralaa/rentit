import React, { useState } from "react";
import { Star } from "lucide-react";

export function StarRating({ value = 0, size = 14, className = "" }) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} className={n <= Math.round(value) ? "fill-brand text-brand" : "text-line"} />
      ))}
    </div>
  );
}

export function StarRatingInput({ value, onChange, size = 24 }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          aria-label={`Rate ${n} stars`}
        >
          <Star
            size={size}
            className={n <= (hover || value) ? "fill-brand text-brand" : "text-line"}
          />
        </button>
      ))}
    </div>
  );
}
