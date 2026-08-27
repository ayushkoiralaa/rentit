import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, XCircle, Star } from "lucide-react";
import { bookingsApi, reviewsApi } from "../../api/marketplace.js";
import { useToast } from "../../context/ToastContext.jsx";
import { PageLoader, EmptyState, ErrorState, PrimaryButton, DangerButton, Badge } from "../../components/ui.jsx";
import { StarRatingInput } from "../../components/StarRating.jsx";
import { formatCurrency, formatDate, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from "../../constants.js";
import { resolveAssetUrl } from "../../api/client.js";

export default function MyRentals() {
  const toast = useToast();
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [reviewingId, setReviewingId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const load = () => {
    setError(null);
    bookingsApi
      .mine({ role: "renter" })
      .then((res) => setBookings(res.bookings))
      .catch((err) => setError(err.message || "Couldn't load your rentals."));
  };
  useEffect(load, []);

  const pay = async (id) => {
    setBusyId(id);
    try {
      const res = await bookingsApi.pay(id);
      toast.info(res.notice);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const cancel = async (id) => {
    if (!confirm("Cancel this booking?")) return;
    setBusyId(id);
    try {
      await bookingsApi.cancel(id, "Cancelled by renter.");
      toast.success("Booking cancelled.");
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const submitReview = async (bookingId) => {
    try {
      await reviewsApi.create({ bookingId, rating, comment });
      toast.success("Thanks for your review!");
      setReviewingId(null);
      setComment("");
      setRating(5);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (error) return <ErrorState description={error} onRetry={load} />;
  if (!bookings) return <PageLoader />;

  return (
    <div>
      <h1 className="font-display font-bold text-xl mb-5">My Rentals</h1>
      {bookings.length === 0 ? (
        <EmptyState title="No rentals yet" description="Browse the marketplace to find something to rent." action={<Link to="/browse"><PrimaryButton type="button">Browse listings</PrimaryButton></Link>} />
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b._id} className="bg-white border border-line rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-xl bg-brand-soft overflow-hidden shrink-0">
                  {b.item?.images?.[0] && <img src={resolveAssetUrl(b.item.images[0].url)} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link to={`/items/${b.item?.slug}`} className="font-semibold text-sm hover:text-brand truncate">{b.item?.title}</Link>
                    <Badge className={BOOKING_STATUS_COLORS[b.status]}>{BOOKING_STATUS_LABELS[b.status]}</Badge>
                    {b.paymentStatus === "DEMO_PAID" && <Badge className="bg-emerald-50 text-success border-emerald-200">Paid (demo)</Badge>}
                  </div>
                  <p className="text-xs text-muted mt-0.5">Owner: {b.owner?.name}</p>
                  <p className="text-xs text-muted">{formatDate(b.startDate)} → {formatDate(b.endDate)} · {b.numberOfDays} day(s)</p>
                  <p className="text-sm font-semibold mt-1">{formatCurrency(b.totalAmount)} total</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-line">
                {b.status === "ACCEPTED" && b.paymentStatus === "UNPAID" && (
                  <PrimaryButton onClick={() => pay(b._id)} disabled={busyId === b._id} className="py-2 text-xs">
                    <CreditCard size={13} /> Pay now (demo)
                  </PrimaryButton>
                )}
                {["PENDING", "ACCEPTED"].includes(b.status) && (
                  <DangerButton onClick={() => cancel(b._id)} disabled={busyId === b._id} className="py-2 text-xs">
                    <XCircle size={13} /> Cancel
                  </DangerButton>
                )}
                {b.status === "COMPLETED" && (
                  <button onClick={() => setReviewingId(reviewingId === b._id ? null : b._id)} className="text-xs font-semibold text-brand flex items-center gap-1">
                    <Star size={13} /> Leave a review
                  </button>
                )}
              </div>

              {reviewingId === b._id && (
                <div className="mt-3 pt-3 border-t border-line">
                  <StarRatingInput value={rating} onChange={setRating} size={20} />
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="How was your rental experience?"
                    rows={2}
                    className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-surface mt-2 resize-none"
                  />
                  <PrimaryButton onClick={() => submitReview(b._id)} className="mt-2 py-2 text-xs">Submit review</PrimaryButton>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
