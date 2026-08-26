import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { itemsApi } from "../../api/items.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { PageLoader, EmptyState, PrimaryButton, SecondaryButton, DangerButton, Badge } from "../../components/ui.jsx";
import { formatCurrency } from "../../constants.js";
import { resolveAssetUrl } from "../../api/client.js";

const STATUS_STYLES = {
  DRAFT: "bg-gray-100 text-muted border-line",
  PENDING_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  PUBLISHED: "bg-emerald-50 text-success border-emerald-200",
  PAUSED: "bg-gray-100 text-ink border-line",
  REJECTED: "bg-red-50 text-danger border-red-200",
  REMOVED: "bg-red-50 text-danger border-red-200",
};

export default function MyListings() {
  const { user } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState(null);

  const load = () => {
    itemsApi.browse({ owner: user._id, limit: 50, status: "" }).then((res) => setItems(res.items));
  };

  useEffect(load, [user._id]);

  const togglePause = async (item) => {
    const nextStatus = item.status === "PAUSED" ? "PUBLISHED" : "PAUSED";
    try {
      await itemsApi.update(item._id, { status: nextStatus });
      toast.success(nextStatus === "PAUSED" ? "Listing paused." : "Listing published.");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (item) => {
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    try {
      await itemsApi.remove(item._id);
      toast.success("Listing removed.");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!items) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display font-bold text-xl">My Listings</h1>
        <Link to="/dashboard/listings/new">
          <PrimaryButton type="button" className="flex items-center gap-1.5"><Plus size={15} /> New listing</PrimaryButton>
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No listings yet"
          description="List your first item and start earning from things you're not using every day."
          action={<Link to="/dashboard/listings/new"><PrimaryButton type="button">List an item</PrimaryButton></Link>}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item._id} className="bg-white border border-line rounded-2xl p-3.5 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-brand-soft overflow-hidden shrink-0">
                {item.images?.[0] ? (
                  <img src={resolveAssetUrl(item.images[0].url)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand font-bold">{item.title.charAt(0)}</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm truncate">{item.title}</p>
                  <Badge className={STATUS_STYLES[item.status]}>{item.status.replace("_", " ")}</Badge>
                </div>
                <p className="text-xs text-muted mt-0.5">{formatCurrency(item.pricePerDay)}/day · {item.city} · {item.viewCount} views</p>
                {item.status === "REJECTED" && item.rejectionReason && (
                  <p className="text-xs text-danger mt-1">Reason: {item.rejectionReason}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Link to={`/items/${item.slug}`} className="w-9 h-9 rounded-lg border border-line flex items-center justify-center hover:border-brand" aria-label="View">
                  <Eye size={14} />
                </Link>
                <Link to={`/dashboard/listings/${item._id}/edit`} className="w-9 h-9 rounded-lg border border-line flex items-center justify-center hover:border-brand" aria-label="Edit">
                  <Pencil size={14} />
                </Link>
                {["PUBLISHED", "PAUSED"].includes(item.status) && (
                  <SecondaryButton onClick={() => togglePause(item)} className="px-3 py-2 text-xs">
                    {item.status === "PAUSED" ? "Publish" : "Pause"}
                  </SecondaryButton>
                )}
                <button onClick={() => remove(item)} className="w-9 h-9 rounded-lg border border-line flex items-center justify-center hover:border-danger hover:text-danger" aria-label="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
