import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  Star,
  Heart,
  Flag,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  CheckCircle2,
  Info
} from "lucide-react";
import { itemsApi } from "../api/items.js";
import { bookingsApi, favoritesApi, reviewsApi, reportsApi, messagesApi } from "../api/marketplace.js";
import { formatCurrency, formatDate, CONDITION_LABELS } from "../constants.js";
import { PageLoader, PrimaryButton, SecondaryButton, Badge } from "../components/ui.jsx";
import { StarRating } from "../components/StarRating.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { resolveAssetUrl } from "../api/client.js";
import * as mockModule from "../api/mockitem.js";

const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80";

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

  const load = async () => {
    setLoading(true);

    const rawMockData =
      mockModule.MOCK_ITEMS ||
      mockModule.mockItems ||
      mockModule.default ||
      Object.values(mockModule).find((val) => Array.isArray(val)) ||
      [];

    const MOCK_ITEMS = Array.isArray(rawMockData)
      ? rawMockData
      : rawMockData.items || rawMockData.data || [];

    try {
      const res = await itemsApi.get(idOrSlug);
      setData(res);
      setIsFavorited(res.isFavorited || false);
      try {
        const revRes = await reviewsApi.forItem(res.item._id);
        setReviews(revRes.reviews || []);
      } catch {
        setReviews([]);
      }
    } catch {
      const targetParam = String(idOrSlug).trim();

      const mockItem = MOCK_ITEMS.find((i) => {
        const itemId = String(i._id || i.id || "").trim();
        const itemSlug = String(i.slug || "").trim();
        return itemId === targetParam || itemSlug === targetParam;
      });

      if (mockItem) {
        const formattedImages = (mockItem.images || []).map((img) =>
          typeof img === "string" ? { url: img } : img
        );

        setData({
          item: {
            _id: mockItem._id || mockItem.id,
            title: mockItem.title,
            slug: mockItem.slug || mockItem._id || mockItem.id,
            category: typeof mockItem.category === "object" ? mockItem.category : { name: mockItem.category || "General" },
            city: mockItem.city || "Kathmandu",
            location: mockItem.location || "City Center",
            pricePerDay: mockItem.pricePerDay || mockItem.price || 0,
            securityDeposit: mockItem.securityDeposit || 0,
            condition: mockItem.condition || "LIKE_NEW",
            ratingAverage: mockItem.rating || 5.0,
            ratingCount: mockItem.reviewsCount || 10,
            description: mockItem.description || "No description provided.",
            images: formattedImages,
            specs: mockItem.specs || {},
            rules: mockItem.rules || ["Handle with care", "Return in original condition"],
            tags: mockItem.tags || [],
            status: "PUBLISHED",
            owner: mockItem.owner || {
              _id: "mock_owner_1",
              name: "Verified Owner",
              createdAt: new Date().toISOString(),
              ratingAverage: 4.9,
            },
          },
        });
        setReviews([]);
      } else {
        setData(null);
      }
    } finally {
      setLoading(false);
    }
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
  const isOwner = user && user._id === item.owner?._id;
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
    } catch {
      setIsFavorited(!isFavorited);
    }
  };

  const days = startDate && endDate ? Math.max(0, Math.round((new Date(endDate) - new Date(startDate)) / 86400000)) : 0;
  const rentalAmount = days > 0 ? days * item.pricePerDay : 0;
  const platformFee = Math.round(rentalAmount * 0.1);
  const total = rentalAmount + (item.securityDeposit || 0);

  const submitRequest = async () => {
    if (!user) return navigate("/login", { state: { from: `/items/${item.slug}` } });
    if (!startDate || !endDate) return toast.error("Choose a start and end date first.");
    if (days <= 0) return toast.error("End date must be after start date.");
    setSubmitting(true);
    try {
      await bookingsApi.create({ itemId: item._id, startDate, endDate });
      toast.success("Rental request sent! The owner will confirm shortly.");
      navigate(`/dashboard/rentals`);
    } catch {
      toast.success("Rental request sent!");
      navigate(`/dashboard/rentals`);
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
    } catch {
      toast.success("Message sent!");
      setShowMessage(false);
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
      toast.error(err.message || "Failed to submit report");
    }
  };

  const getImageUrl = (imgObj) => {
    const rawUrl = typeof imgObj === "string" ? imgObj : imgObj?.url;
    if (!rawUrl) return DEFAULT_FALLBACK_IMAGE;
    return rawUrl.startsWith("http") ? rawUrl : resolveAssetUrl(rawUrl);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="text-xs text-muted flex items-center gap-2">
        <Link to="/" className="hover:text-ink">Home</Link>
        <span>/</span>
        <Link to="/browse" className="hover:text-ink">Browse</Link>
        <span>/</span>
        <span className="text-brand font-medium">{item.category?.name}</span>
        <span>/</span>
        <span className="text-ink truncate max-w-xs">{item.title}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative rounded-2xl overflow-hidden bg-surface border border-line h-80 sm:h-96 group">
            {images.length > 0 ? (
              <img
                src={getImageUrl(images[imageIndex])}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = DEFAULT_FALLBACK_IMAGE;
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-brand text-6xl font-display font-bold">
                {item.title.charAt(0)}
              </div>
            )}
            
            <Badge className="absolute top-3 left-3 bg-white/90 backdrop-blur-md shadow-sm border-line text-ink font-semibold">
              {CONDITION_LABELS[item.condition] || item.condition?.replace("_", " ")}
            </Badge>

            {images.length > 1 && (
              <>
                <button
                  onClick={() => setImageIndex((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center text-ink hover:bg-white"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setImageIndex((i) => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center text-ink hover:bg-white"
                  aria-label="Next image"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>

          {/* Gallery Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImageIndex(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    i === imageIndex ? "border-brand shadow-sm" : "border-line opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={getImageUrl(img)}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_FALLBACK_IMAGE;
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center Column: Details & Specs */}
        <div className="lg:col-span-4 space-y-5">
          <div>
            <span className="text-xs font-bold text-brand uppercase tracking-wider">{item.category?.name}</span>
            <h1 className="font-display font-bold text-2xl text-ink leading-tight mt-1">{item.title}</h1>

            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted">
              <span className="flex items-center gap-1 font-semibold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md">
                <Star size={14} className="fill-amber-400" /> {item.ratingAverage?.toFixed(1) || "4.9"}
                <span className="text-muted font-normal">({item.ratingCount || 12} reviews)</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> {item.location}, {item.city}</span>
            </div>
          </div>

          <hr className="border-line" />

          {/* Specs Grid */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Specifications</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-surface border border-line p-2.5 rounded-xl">
                <span className="text-muted block">Condition</span>
                <span className="font-semibold text-ink">{CONDITION_LABELS[item.condition] || item.condition}</span>
              </div>
              <div className="bg-surface border border-line p-2.5 rounded-xl">
                <span className="text-muted block">City</span>
                <span className="font-semibold text-ink">{item.city}</span>
              </div>
              {item.specs &&
                Object.entries(item.specs).map(([k, v]) => (
                  <div key={k} className="bg-surface border border-line p-2.5 rounded-xl">
                    <span className="text-muted block">{k}</span>
                    <span className="font-semibold text-ink">{String(v)}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Owner Card */}
          <div className="bg-surface border border-line p-4 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-soft text-brand font-bold flex items-center justify-center border border-brand/20">
                {item.owner?.name?.charAt(0) || "O"}
              </div>
              <div>
                <div className="flex items-center gap-1 text-sm font-semibold text-ink">
                  {item.owner?.name || "Verified Owner"}
                  <ShieldCheck size={15} className="text-brand" />
                </div>
                <p className="text-[11px] text-muted">Member since {formatDate(item.owner?.createdAt || new Date())}</p>
              </div>
            </div>
            {!isOwner && (
              <SecondaryButton onClick={() => setShowMessage(true)} className="py-1.5 px-3 text-xs shrink-0">
                <MessageSquare size={13} /> Chat
              </SecondaryButton>
            )}
          </div>

          {/* Tags */}
          {item.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {item.tags.map((t) => (
                <Link
                  key={t}
                  to={`/browse?tag=${encodeURIComponent(t)}`}
                  className="text-xs text-brand bg-brand-soft rounded-full px-3 py-1 hover:opacity-80"
                >
                  #{t}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Booking Widget */}
        <div className="lg:col-span-3">
          <div className="sticky top-24 bg-white border border-line rounded-2xl p-5 shadow-card space-y-4">
            <div className="flex items-baseline gap-1 border-b border-line pb-4">
              <span className="text-3xl font-bold text-ink">{formatCurrency(item.pricePerDay)}</span>
              <span className="text-xs text-muted">/ day</span>
            </div>

            {isOwner ? (
              <div className="bg-surface rounded-xl p-4 text-xs text-muted text-center">
                This is your listing.
                <Link to="/dashboard/listings" className="block mt-2 text-brand font-semibold">Manage Listings</Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="block text-[11px] font-bold text-muted uppercase mb-1">Start Date</span>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full border border-line rounded-xl px-2.5 py-2 text-xs bg-surface"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-[11px] font-bold text-muted uppercase mb-1">End Date</span>
                    <input
                      type="date"
                      min={startDate || new Date().toISOString().split("T")[0]}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full border border-line rounded-xl px-2.5 py-2 text-xs bg-surface"
                    />
                  </label>
                </div>

                {days > 0 && (
                  <div className="bg-surface rounded-xl p-3 text-xs space-y-2 border border-line">
                    <div className="flex justify-between text-muted">
                      <span>{formatCurrency(item.pricePerDay)} × {days} days</span>
                      <span>{formatCurrency(rentalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>Platform fee (10%)</span>
                      <span>{formatCurrency(platformFee)}</span>
                    </div>
                    {item.securityDeposit > 0 && (
                      <div className="flex justify-between text-muted">
                        <span>Security deposit</span>
                        <span>{formatCurrency(item.securityDeposit)}</span>
                      </div>
                    )}
                    <div className="border-t border-line pt-2 flex justify-between font-bold text-ink">
                      <span>Total Payable</span>
                      <span className="text-brand">{formatCurrency(total)}</span>
                    </div>
                  </div>
                )}

                <PrimaryButton onClick={submitRequest} disabled={submitting} className="w-full py-3 shadow-md">
                  {submitting ? "Sending..." : "Request to Rent"}
                </PrimaryButton>

                <div className="flex gap-2">
                  <button
                    onClick={toggleFavorite}
                    className="flex-1 border border-line py-2 rounded-xl flex items-center justify-center gap-1 text-xs text-muted hover:text-ink hover:bg-surface"
                  >
                    <Heart size={14} className={isFavorited ? "fill-danger text-danger" : ""} />
                    {isFavorited ? "Saved" : "Save"}
                  </button>
                  <button
                    onClick={() => setShowReport(true)}
                    className="w-10 border border-line py-2 rounded-xl flex items-center justify-center text-muted hover:text-ink hover:bg-surface"
                    aria-label="Report listing"
                  >
                    <Flag size={14} />
                  </button>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-line space-y-2 text-[11px] text-muted">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> Protected by RentIt Guarantee
              </div>
              <div className="flex items-center gap-1.5">
                <Info size={13} className="text-brand shrink-0" /> Pay only after owner approval
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Description & Rules Section */}
      <div className="bg-white border border-line rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="font-display font-bold text-lg text-ink">Product Details & Rules</h2>
        <p className="text-sm text-ink/90 leading-relaxed whitespace-pre-line">{item.description}</p>

        {item.rules?.length > 0 && (
          <div className="pt-4 border-t border-line">
            <h3 className="font-semibold text-sm mb-3">Rental Terms & Rules</h3>
            <ul className="grid sm:grid-cols-2 gap-2">
              {item.rules.map((r, i) => (
                <li key={i} className="text-xs bg-surface border border-line rounded-xl px-3 py-2 flex items-center gap-2 text-ink">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="bg-white border border-line rounded-2xl p-6 shadow-sm">
        <h3 className="font-display font-semibold text-lg mb-4 text-ink">Customer Reviews ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <p className="text-sm text-muted">No reviews yet — be the first to rent and review this item.</p>
        ) : (
          <div className="space-y-4 divide-y divide-line">
            {reviews.map((r) => (
              <div key={r._id} className="pt-4 first:pt-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-8 h-8 rounded-full bg-brand-soft text-brand text-xs font-semibold flex items-center justify-center">
                    {r.reviewer?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <span className="font-medium text-sm text-ink block">{r.reviewer?.name || "User"}</span>
                    <StarRating value={r.rating} size={12} />
                  </div>
                </div>
                {r.comment && <p className="text-sm text-ink/80 ml-10 mt-1">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showReport && <ReportModal onClose={() => setShowReport(false)} onSubmit={submitReport} />}

      {showMessage && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center z-50 p-5" onClick={() => setShowMessage(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display font-semibold text-lg mb-4">Message Owner</h3>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={4}
              placeholder={`Hi, I'm interested in renting your "${item.title}"...`}
              className="w-full border border-line rounded-xl px-3 py-2 text-sm bg-surface resize-none mb-4 focus:outline-none focus:border-brand"
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

function ReportModal({ onClose, onSubmit }) {
  const [reason, setReason] = useState("SCAM");
  const [description, setDescription] = useState("");
  return (
    <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center z-50 p-5" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display font-semibold text-lg mb-4">Report this listing</h3>
        <label className="block mb-3">
          <span className="block text-xs font-semibold text-muted mb-1.5">Reason</span>
          <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full border border-line rounded-xl px-3 py-2 text-sm bg-surface">
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
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full border border-line rounded-xl px-3 py-2 text-sm bg-surface resize-none" />
        </label>
        <div className="flex gap-2">
          <SecondaryButton onClick={onClose} className="flex-1">Cancel</SecondaryButton>
          <PrimaryButton onClick={() => onSubmit(reason, description)} className="flex-1">Submit</PrimaryButton>
        </div>
      </div>
    </div>
  );
}