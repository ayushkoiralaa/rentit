import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import { favoritesApi, notificationsApi } from "../../api/marketplace.js";
import { authApi } from "../../api/auth.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { PageLoader, EmptyState, PrimaryButton, TextField, TextArea } from "../../components/ui.jsx";
import ItemCard from "../../components/ItemCard.jsx";
import { formatDate } from "../../constants.js";

export function Favorites() {
  const [favorites, setFavorites] = useState(null);
  const toast = useToast();

  const load = () => favoritesApi.list().then((res) => setFavorites(res.favorites));
  useEffect(load, []);

  const toggleFavorite = async (item) => {
    try {
      await favoritesApi.remove(item._id);
      toast.success("Removed from favorites.");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!favorites) return <PageLoader />;

  return (
    <div>
      <h1 className="font-display font-bold text-xl mb-5">Favorites</h1>
      {favorites.length === 0 ? (
        <EmptyState title="No favorites yet" description="Tap the heart on any listing to save it here." action={<Link to="/browse"><PrimaryButton type="button">Browse listings</PrimaryButton></Link>} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {favorites.map((f) => (
            <ItemCard key={f._id} item={f.item} isFavorited onToggleFavorite={toggleFavorite} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Notifications() {
  const [notifications, setNotifications] = useState(null);
  const toast = useToast();

  const load = () => notificationsApi.list().then((res) => setNotifications(res.notifications));
  useEffect(load, []);

  const markAll = async () => {
    await notificationsApi.markAllRead();
    load();
  };

  const openNotification = async (n) => {
    if (!n.read) await notificationsApi.markRead(n._id);
    load();
  };

  if (!notifications) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display font-bold text-xl">Notifications</h1>
        {notifications.some((n) => !n.read) && (
          <button onClick={markAll} className="text-xs font-semibold text-brand flex items-center gap-1"><CheckCheck size={13} /> Mark all read</button>
        )}
      </div>
      {notifications.length === 0 ? (
        <EmptyState title="No notifications" description="You'll see booking updates and messages here." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Link
              key={n._id}
              to={n.link || "#"}
              onClick={() => openNotification(n)}
              className={`block border rounded-xl p-3.5 ${n.read ? "bg-white border-line" : "bg-brand-soft border-brand/20"}`}
            >
              <div className="flex items-start gap-2.5">
                <Bell size={15} className="text-brand mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="text-xs text-muted mt-0.5">{n.message}</p>
                  <p className="text-[11px] text-muted mt-1">{formatDate(n.createdAt)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Profile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || "", location: user.location || "", bio: user.bio || "" });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authApi.updateMe(form);
      setUser(res.user);
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md">
      <h1 className="font-display font-bold text-xl mb-5">Profile</h1>
      <form onSubmit={submit} className="bg-white border border-line rounded-2xl p-6">
        <div className="w-16 h-16 rounded-full bg-brand-soft text-brand font-display font-bold text-2xl flex items-center justify-center mb-4">
          {user.name.charAt(0)}
        </div>
        <TextField label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <TextField label="Email" value={user.email} disabled className="opacity-60" />
        <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <TextField label="City" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <TextArea label="Bio" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        <PrimaryButton type="submit" disabled={saving} className="w-full">{saving ? "Saving..." : "Save changes"}</PrimaryButton>
      </form>
    </div>
  );
}
