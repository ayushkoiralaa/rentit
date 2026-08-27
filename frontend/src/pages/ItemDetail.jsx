import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapPin, Star, Heart, Flag, ShieldCheck, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { itemsApi } from "../api/items.js";
import { bookingsApi, favoritesApi, reviewsApi, reportsApi, messagesApi } from "../api/marketplace.js";
import { formatCurrency, formatDate, CONDITION_LABELS } from "../constants.js";
import { PageLoader, PrimaryButton, SecondaryButton, Badge } from "../components/ui.jsx";
import { StarRating } from "../components/StarRating.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { resolveAssetUrl } from "../api/client.js";

export default function ItemDetail() {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const load = () => {
    setLoading(true);
    itemsApi
      .get(idOrSlug)
      .then((res) => {
        setData(res);
        setIsFavorited(res.isFavorited);
        return reviewsApi.forItem(res.item._id);
      })
      .then((res) => setReviews(res.reviews))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    setImageIndex(0);
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idOrSlug]);

  if (loading) return <PageLoader />;
  if (!data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="font-display font-bold text-xl mb-2">Listing not found</h2>
        <p className="text-muted mb-5">It may have been removed or is no longer available.</p>
        <Link to="/browse" className="text-brand font-semibold">Back to browse</Link>
      </div>
    );
  }

  const { item } = data;
  const isOwner = user && user._id === item.owner._id;
  const images = item.images?.length ? item.images : [];

  const toggleFavorite = async () => {
    if (!user) return navigate("/login", { state: { from: `/items/${item.slug}` } });
    try {
      if (isFavorited) {
        await favoritesApi.remove(item._id);
        setIsFavorited(false);
      } else {
        await favoritesApi.add(item._id);
        setIsFavorited(true);
        toast.success("Added to favorites.");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const days = startDate && endDate ? Math.round((new Date(endDate) - new Date(startDate)) / 86400000) : 0;
  const rentalAmount = days > 0 ? days * item.pricePerDay : 0;
  const platformFee = Math.round(rentalAmount * 0.1);
  const total = rentalAmount + item.securityDeposit;

  const submitRequest = async () => {
    if (!user) return navigate("/login", { state: { from: `/items/${item.slug}` } });
    if (!startDate || !endDate) return toast.error("Choose a start and end date first.");
    setSubmitting(true);
    try {
      const res = await bookingsApi.create({ itemId: item._id, startDate, endDate });
      toast.success("Rental request sent! The owner will confirm shortly.");
      navigate(`/dashboard/rentals`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const sendMessageToOwner = async () => {
    if (!user) return navigate("/login", { state: { from: `/items/${item.slug}` } });
    if (!messageText.trim()) return;
    setSendingMessage(true);
    try {
      await messagesApi.send({ receiverId: item.owner._id, itemId: item._id, body: messageText.trim() });
      toast.success("Message sent!");
      setMessageText("");
      setShowMessage(false);
      navigate("/dashboard/messages");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSendingMessage(false);
    }
  };

  const submitReport = async (reason, description) => {
    try {
      await reportsApi.create({ itemId: item._id, reason, description });
      toast.success("Thanks — our team will review this listing.");
      setShowReport(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8">
        <div>
          {/* IMAGE GALLERY */}
          <div className="relative rounded-2xl overflow-hidden bg-brand-soft h-72 sm:h-96">
            {images.length > 0 ? (
              <img src={resolveAssetUrl(images[imageIndex].url)} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-brand text-6xl font-display font-bold">
                {item.title.charAt(0)}
              </div>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setImageIndex((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setImageIndex((i) => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center"
                  aria-label="Next image"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-2.5 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImageIndex(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 ${i === imageIndex ? "border-brand" : "border-transparent"}`}
                >
                  <img src={resolveAssetUrl(img.url)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* TITLE + META */}
          <div className="mt-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-brand uppercase mb-1">{item.category?.name}</p>
                <h1 className="font-display font-bold text-2xl">{item.title}</h1>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={toggleFavorite} className="w-10 h-10 rounded-full border border-line flex items-center justify-center hover:border-danger" aria-label="Favorite">
                  <Heart size={17} className={isFavorited ? "fill-danger text-danger" : "text-muted"} />
                </button>
                {!isOwner && (
                  <button onClick={() => setShowReport(true)} className="w-10 h-10 rounded-full border border-line flex items-center justify-center hover:border-ink" aria-label="Report">
                    <Flag size={16} className="text-muted" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted">
              <span className="flex items-center gap-1"><MapPin size={14} /> {item.location}, {item.city}</span>
              <span className="flex items-center gap-1"><Star size={14} className="fill-brand text-brand" /> {item.ratingAverage?.toFixed(1) || "New"} ({item.ratingCount} reviews)</span>
              <Badge className="bg-surface border-line text-ink">{CONDITION_LABELS[item.condition]}</Badge>
            </div>

            <p className="text-[15px] text-ink/90 leading-relaxed mt-5 whitespace-pre-line">{item.description}</p>

            {item.tags?.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {item.tags.map((t) => (
                  <Link
                    key={t}
                    to={`/browse?tag=${encodeURIComponent(t)}`}
                    className="text-xs text-brand bg-brand-soft rounded-full px-3 py-1.5 hover:opacity-80"
                  >
                    #{t}
                  </Link>
                ))}
              </div>
            )}

            {item.rules?.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-sm mb-2">Rental rules</h3>
                <ul className="flex flex-wrap gap-2">
                  {item.rules.map((r, i) => (
                    <li key={i} className="text-xs bg-surface border border-line rounded-full px-3 py-1.5">{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* OWNER */}
            <div className="mt-7 pt-6 border-t border-line flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-brand-soft text-brand font-semibold flex items-center justify-center">
                {item.owner.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{item.owner.name}</p>
                <p className="text-xs text-muted flex items-center gap-1">
                  <Star size={11} className="fill-brand text-brand" /> {item.owner.ratingAverage?.toFixed(1) || "New"} · Member since {formatDate(item.owner.createdAt)}
                </p>
              </div>
              {!isOwner && (
                <SecondaryButton onClick={() => setShowMessage(true)} className="py-2 px-3.5 text-xs shrink-0">
                  <MessageSquare size={13} /> Message
                </SecondaryButton>
              )}
            </div>

            {/* REVIEWS */}
            <div className="mt-8">
              <h3 className="font-display font-semibold text-lg mb-4">Reviews ({reviews.length})</h3>
              {reviews.length === 0 ? (
                <p className="text-sm text-muted">No reviews yet — be the first to rent and review this item.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r._id} className="border-b border-line pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-full bg-brand-soft text-brand text-xs font-semibold flex items-center justify-center">
                          {r.reviewer.name.charAt(0)}
                        </div>
                        <span className="font-medium text-sm">{r.reviewer.name}</span>
                        <StarRating value={r.rating} size={12} />
                      </div>
                      {r.comment && <p className="text-sm text-ink/80 ml-10">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOOKING PANEL */}
        <div>
          <div className="sticky top-24 bg-white border border-line rounded-2xl p-5 shadow-card">
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-2xl font-bold">{formatCurrency(item.pricePerDay)}</span>
              <span className="text-sm text-muted">/ day</span>
            </div>

            {isOwner ? (
              <div className="bg-surface rounded-xl p-4 text-sm text-muted text-center">
                This is your own listing — you can manage it from your dashboard.
                <Link to="/dashboard/listings" className="block mt-2 text-brand font-semibold">Go to My Listings</Link>
              </div>
            ) : item.status !== "PUBLISHED" ? (
              <div className="bg-red-50 text-danger text-sm rounded-xl p-4 text-center font-medium">
                This listing is currently unavailable.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <label className="block">
                    <span className="block text-xs font-semibold text-muted mb-1">Start date</span>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full border border-line rounded-lg px-2.5 py-2 text-sm bg-surface"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-xs font-semibold text-muted mb-1">End date</span>
                    <input
                      type="date"
                      min={startDate || new Date().toISOString().split("T")[0]}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full border border-line rounded-lg px-2.5 py-2 text-sm bg-surface"
                    />
                  </label>
                </div>

                {days > 0 && (
                  <div className="bg-surface rounded-xl p-3.5 text-sm space-y-1.5 mb-4">
                    <Row label={`${formatCurrency(item.pricePerDay)} × ${days} day${days > 1 ? "s" : ""}`} value={formatCurrency(rentalAmount)} />
                    <Row label="Platform fee (10%)" value={formatCurrency(platformFee)} muted />
                    <Row label="Security deposit" value={formatCurrency(item.securityDeposit)} muted />
                    <div className="border-t border-line pt-1.5 mt-1.5">
                      <Row label="Total due" value={formatCurrency(total)} bold />
                    </div>
                  </div>
                )}

                <PrimaryButton onClick={submitRequest} disabled={submitting} className="w-full">
                  {submitting ? "Sending request..." : "Request to rent"}
                </PrimaryButton>
                <p className="text-[11px] text-muted text-center mt-2.5">
                  You won't be charged yet. The owner needs to accept your request first.
                </p>
              </>
            )}

            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-line text-xs text-muted">
              <ShieldCheck size={16} className="text-success shrink-0" />
              Security deposits and payments run through Rent It's demo-mode escrow for this build.
            </div>
          </div>
        </div>
      </div>

      {showReport && <ReportModal onClose={() => setShowReport(false)} onSubmit={submitReport} />}

      {showMessage && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-5" onClick={() => setShowMessage(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display font-semibold text-lg mb-4">Message {item.owner.name}</h3>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={4}
              placeholder={`Hi, I'm interested in renting your "${item.title}"...`}
              className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-surface resize-none mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <SecondaryButton onClick={() => setShowMessage(false)} className="flex-1">Cancel</SecondaryButton>
              <PrimaryButton onClick={sendMessageToOwner} disabled={sendingMessage} className="flex-1">
                {sendingMessage ? "Sending..." : "Send"}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, muted, bold }) {
  return (
    <div className="flex justify-between">
      <span className={muted ? "text-muted" : "text-ink"}>{label}</span>
      <span className={bold ? "font-bold" : ""}>{value}</span>
    </div>
  );
}

function ReportModal({ onClose, onSubmit }) {
  const [reason, setReason] = useState("SCAM");
  const [description, setDescription] = useState("");
  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-5" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display font-semibold text-lg mb-4">Report this listing</h3>
        <label className="block mb-3">
          <span className="block text-xs font-semibold text-muted mb-1.5">Reason</span>
          <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-surface">
            <option value="SCAM">Scam</option>
            <option value="FAKE_LISTING">Fake listing</option>
            <option value="INCORRECT_INFORMATION">Incorrect information</option>
            <option value="INAPPROPRIATE_CONTENT">Inappropriate content</option>
            <option value="UNSAFE_BEHAVIOR">Unsafe behavior</option>
            <option value="OTHER">Other</option>
          </select>
        </label>
        <label className="block mb-4">
          <span className="block text-xs font-semibold text-muted mb-1.5">Details (optional)</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-surface resize-none" />
        </label>
        <div className="flex gap-2">
          <SecondaryButton onClick={onClose} className="flex-1">Cancel</SecondaryButton>
          <PrimaryButton onClick={() => onSubmit(reason, description)} className="flex-1">Submit</PrimaryButton>
        </div>
      </div>
    </div>
  );
}
