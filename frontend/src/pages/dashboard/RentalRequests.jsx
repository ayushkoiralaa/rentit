import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, X, PlayCircle, CheckCircle } from "lucide-react";
import { bookingsApi } from "../../api/marketplace.js";
import { useToast } from "../../context/ToastContext.jsx";
import { PageLoader, EmptyState, ErrorState, PrimaryButton, DangerButton, SecondaryButton, Badge } from "../../components/ui.jsx";
import { formatCurrency, formatDate, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from "../../constants.js";
import { resolveAssetUrl } from "../../api/client.js";

export default function RentalRequests() {
  const toast = useToast();
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setError(null);
    bookingsApi
      .mine({ role: "owner" })
      .then((res) => setBookings(res.bookings))
      .catch((err) => setError(err.message || "Couldn't load your rental requests."));
  };
  useEffect(load, []);

  const act = async (id, action, ...args) => {
    setBusyId(id);
    try {
      await bookingsApi[action](id, ...args);
      toast.success("Updated.");
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  if (error) return <ErrorState description={error} onRetry={load} />;
  if (!bookings) return <PageLoader />;

  return (
    <div>
      <h1 className="font-display font-bold text-xl mb-5">Rental Requests</h1>
      {bookings.length === 0 ? (
        <EmptyState title="No requests yet" description="When someone requests to rent one of your items, it'll show up here." />
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
                  </div>
                  <p className="text-xs text-muted mt-0.5">Renter: {b.renter?.name}</p>
                  <p className="text-xs text-muted">{formatDate(b.startDate)} → {formatDate(b.endDate)} · {b.numberOfDays} day(s)</p>
                  <p className="text-sm font-semibold mt-1">{formatCurrency(b.totalAmount)} <span className="text-xs font-normal text-muted">(you earn {formatCurrency(b.rentalAmount - b.platformFee)})</span></p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-line">
                {b.status === "PENDING" && (
                  <>
                    <PrimaryButton onClick={() => act(b._id, "accept")} disabled={busyId === b._id} className="flex-1 min-w-[7rem] py-2 text-xs">
                      <Check size={13} /> Accept
                    </PrimaryButton>
                    <DangerButton onClick={() => act(b._id, "reject")} disabled={busyId === b._id} className="flex-1 min-w-[7rem] py-2 text-xs">
                      <X size={13} /> Decline
                    </DangerButton>
                  </>
                )}
                {b.status === "ACCEPTED" && (
                  <PrimaryButton onClick={() => act(b._id, "activate")} disabled={busyId === b._id} className="flex-1 py-2 text-xs">
                    <PlayCircle size={13} /> Mark as handed over
                  </PrimaryButton>
                )}
                {b.status === "ACTIVE" && (
                  <PrimaryButton onClick={() => act(b._id, "complete")} disabled={busyId === b._id} className="flex-1 py-2 text-xs">
                    <CheckCircle size={13} /> Mark as returned / complete
                  </PrimaryButton>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
