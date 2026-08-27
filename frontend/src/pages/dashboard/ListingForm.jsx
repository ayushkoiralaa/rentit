import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X, ImagePlus } from "lucide-react";
import { itemsApi } from "../../api/items.js";
import { categoriesApi } from "../../api/marketplace.js";
import { useToast } from "../../context/ToastContext.jsx";
import { PageLoader, ErrorState, PrimaryButton, SecondaryButton, TextField, TextArea, SelectField } from "../../components/ui.jsx";
import { resolveAssetUrl } from "../../api/client.js";
import { getCategoryIcon } from "../../constants.js";

const MAX_IMAGES = 8;

export default function ListingForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  // categoryTree is the nested parent -> children structure the API
  // already builds for us; it powers the toggle-chip category picker below.
  const [categoryTree, setCategoryTree] = useState(null);
  const [categoriesError, setCategoriesError] = useState(null);
  const [activeParentId, setActiveParentId] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    title: "", description: "", category: "", pricePerDay: "", securityDeposit: "0",
    condition: "GOOD", location: "", city: "", rules: "", status: "PUBLISHED",
  });
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  const loadCategories = () => {
    setCategoriesError(null);
    categoriesApi
      .list()
      .then((res) => setCategoryTree(res.categories))
      .catch((err) => setCategoriesError(err.message || "Couldn't load categories."));
  };
  useEffect(loadCategories, []);

  // Once categories and (in edit mode) the item's current category are both
  // known, default the parent tab to whichever group the chosen category
  // belongs to — otherwise the first group.
  useEffect(() => {
    if (!categoryTree || categoryTree.length === 0 || activeParentId) return;
    const owningParent = categoryTree.find((p) => p.children.some((c) => c._id === form.category));
    setActiveParentId((owningParent || categoryTree[0])._id);
  }, [categoryTree, form.category, activeParentId]);

  const activeChildren = useMemo(
    () => categoryTree?.find((p) => p._id === activeParentId)?.children || [],
    [categoryTree, activeParentId]
  );

  const loadItem = () => {
    if (!isEdit) return;
    setLoading(true);
    setLoadError(null);
    itemsApi
      .get(id)
      .then((res) => {
        const it = res.item;
        setForm({
          title: it.title, description: it.description, category: it.category._id,
          pricePerDay: it.pricePerDay, securityDeposit: it.securityDeposit, condition: it.condition,
          location: it.location, city: it.city, rules: (it.rules || []).join(", "), status: it.status,
        });
        setExistingImages(it.images || []);
      })
      .catch((err) => setLoadError(err.message || "Couldn't load this listing."))
      .finally(() => setLoading(false));
  };
  useEffect(loadItem, [id, isEdit]);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    const totalCount = existingImages.length + newFiles.length + files.length;
    if (totalCount > MAX_IMAGES) {
      toast.error(`You can have up to ${MAX_IMAGES} images per listing.`);
      return;
    }
    setNewFiles((prev) => [...prev, ...files]);
    setNewPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeNewFile = (i) => {
    setNewFiles((prev) => prev.filter((_, idx) => idx !== i));
    setNewPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const removeExistingImage = async (imageId) => {
    if (!isEdit) return;
    try {
      await itemsApi.removeImage(id, imageId);
      setExistingImages((prev) => prev.filter((img) => img._id !== imageId));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required.";
    if (!form.description.trim()) e.description = "Description is required.";
    if (!form.category) e.category = "Choose a category.";
    if (!form.pricePerDay || Number(form.pricePerDay) <= 0) e.pricePerDay = "Enter a valid daily price.";
    if (!form.location.trim()) e.location = "Location is required.";
    if (!form.city.trim()) e.city = "City is required.";
    if (!isEdit && existingImages.length + newFiles.length === 0) e.images = "Add at least one photo.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const rulesArr = form.rules.split(",").map((r) => r.trim()).filter(Boolean);

      if (isEdit) {
        await itemsApi.update(id, { ...form, rules: rulesArr, pricePerDay: Number(form.pricePerDay), securityDeposit: Number(form.securityDeposit) });
        if (newFiles.length > 0) {
          const fd = new FormData();
          newFiles.forEach((f) => fd.append("images", f));
          await itemsApi.addImages(id, fd);
        }
        toast.success("Listing updated.");
        navigate("/dashboard/listings");
      } else {
        const fd = new FormData();
        Object.entries({ ...form, status: "PUBLISHED" }).forEach(([k, v]) => {
          if (k !== "rules") fd.append(k, v);
        });
        // Append each rule as its own "rules" field so multer/express parses
        // it back into a proper array instead of one comma-joined string.
        rulesArr.forEach((r) => fd.append("rules", r));
        newFiles.forEach((f) => fd.append("images", f));
        await itemsApi.create(fd);
        toast.success("Listing published!");
        navigate("/dashboard/listings");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;
  if (loadError) return <ErrorState description={loadError} onRetry={loadItem} />;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display font-bold text-xl mb-5">{isEdit ? "Edit listing" : "List an item"}</h1>
      <form onSubmit={submit} className="bg-white border border-line rounded-2xl p-6">
        <TextField label="Title" placeholder="e.g. Canon EOS 90D DSLR Camera" value={form.title} error={errors.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })} />

        <TextArea label="Description" rows={4} placeholder="Describe the item's condition, what's included, and any pickup details."
          value={form.description} error={errors.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

        <div className="mb-5">
          <span className="block text-xs font-semibold text-muted mb-1.5">Category</span>
          {categoriesError ? (
            <ErrorState description={categoriesError} onRetry={loadCategories} />
          ) : !categoryTree ? (
            <div className="flex items-center gap-2 text-sm text-muted py-3">Loading categories...</div>
          ) : (
            <>
              {/* Parent group tabs — pick a group, then toggle a specific
                  category chip below. Both rows are keyboard accessible
                  toggle buttons, not a plain <select>. */}
              <div className="flex gap-2 overflow-x-auto pb-1.5 -mx-0.5 px-0.5">
                {categoryTree.map((p) => {
                  const Icon = getCategoryIcon(p.icon);
                  const isActive = p._id === activeParentId;
                  return (
                    <button
                      key={p._id}
                      type="button"
                      onClick={() => setActiveParentId(p._id)}
                      aria-pressed={isActive}
                      className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-sm font-medium transition-colors ${
                        isActive ? "bg-ink text-white border-ink" : "bg-white border-line text-ink hover:border-ink"
                      }`}
                    >
                      <Icon size={14} /> {p.name}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2 mt-2.5">
                {activeChildren.length === 0 ? (
                  <p className="text-sm text-muted py-1">No subcategories in this group yet.</p>
                ) : (
                  activeChildren.map((c) => {
                    const selected = form.category === c._id;
                    return (
                      <button
                        key={c._id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setForm({ ...form, category: selected ? "" : c._id })}
                        className={`px-3.5 py-2 rounded-full border text-sm font-medium transition-colors ${
                          selected
                            ? "bg-brand text-white border-brand"
                            : "bg-white border-line text-ink hover:border-brand hover:text-brand"
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })
                )}
              </div>
            </>
          )}
          {errors.category && <span className="block text-xs text-danger mt-1.5">{errors.category}</span>}
        </div>

        <SelectField label="Condition" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="max-w-xs">
          <option value="NEW">New</option>
          <option value="LIKE_NEW">Like new</option>
          <option value="GOOD">Good</option>
          <option value="FAIR">Fair</option>
        </SelectField>

        <div className="grid grid-cols-2 gap-3">
          <TextField label="Price per day (Rs.)" type="number" min="1" value={form.pricePerDay} error={errors.pricePerDay}
            onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })} />
          <TextField label="Security deposit (Rs.)" type="number" min="0" value={form.securityDeposit}
            onChange={(e) => setForm({ ...form, securityDeposit: e.target.value })} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TextField label="Location (area)" placeholder="e.g. Baneshwor" value={form.location} error={errors.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <TextField label="City" placeholder="e.g. Kathmandu" value={form.city} error={errors.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </div>

        <TextField label="Rules (comma-separated, optional)" placeholder="No smoking, Return on time"
          value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} />

        <div className="mb-5">
          <span className="block text-xs font-semibold text-muted mb-1.5">Photos ({existingImages.length + newFiles.length}/{MAX_IMAGES})</span>
          <div className="flex flex-wrap gap-2.5">
            {existingImages.map((img) => (
              <div key={img._id} className="relative w-20 h-20 rounded-xl overflow-hidden border border-line">
                <img src={resolveAssetUrl(img.url)} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeExistingImage(img._id)} className="absolute top-0.5 right-0.5 bg-ink/70 text-white rounded-full w-5 h-5 flex items-center justify-center">
                  <X size={11} />
                </button>
              </div>
            ))}
            {newPreviews.map((src, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-line">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeNewFile(i)} className="absolute top-0.5 right-0.5 bg-ink/70 text-white rounded-full w-5 h-5 flex items-center justify-center">
                  <X size={11} />
                </button>
              </div>
            ))}
            {existingImages.length + newFiles.length < MAX_IMAGES && (
              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-line flex flex-col items-center justify-center cursor-pointer hover:border-brand text-muted hover:text-brand">
                <ImagePlus size={18} />
                <span className="text-[10px] mt-1">Add photo</span>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden onChange={handleFiles} />
              </label>
            )}
          </div>
          {errors.images && <span className="block text-xs text-danger mt-1.5">{errors.images}</span>}
        </div>

        {isEdit && (
          <SelectField label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="PUBLISHED">Published</option>
            <option value="PAUSED">Paused</option>
            <option value="DRAFT">Draft</option>
          </SelectField>
        )}

        <div className="flex gap-3 mt-2">
          <SecondaryButton type="button" onClick={() => navigate("/dashboard/listings")} className="flex-1">Cancel</SecondaryButton>
          <PrimaryButton type="submit" disabled={saving} className="flex-1">
            {saving ? "Saving..." : isEdit ? "Save changes" : "Publish listing"}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
