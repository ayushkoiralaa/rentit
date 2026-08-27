import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X, ImagePlus, Check } from "lucide-react";
import { itemsApi } from "../../api/items.js";
import { categoriesApi } from "../../api/marketplace.js";
import { useToast } from "../../context/ToastContext.jsx";
import { PageLoader, ErrorState, PrimaryButton, SecondaryButton, TextField, TextArea, SelectField } from "../../components/ui.jsx";
import { resolveAssetUrl } from "../../api/client.js";
import { getCategoryIcon } from "../../constants.js";

const MAX_IMAGES = 8;
const MAX_TAGS = 15;
const MAX_TAG_LENGTH = 30;

// Cheap client-side approximation of the backend's slugify, good enough for
// "is this the same category name" comparisons — doesn't need to be exact.
function slugifyLite(str) {
  return str.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function ListingForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  // categoryTree is the nested parent -> children structure the API
  // already builds for us; it powers the toggle-chip category picker below.
  // categoryFlat is the same data un-nested, used to detect when a typed
  // custom category name already matches (or nearly matches) one that
  // exists, so people don't end up creating five near-duplicate categories.
  const [categoryTree, setCategoryTree] = useState(null);
  const [categoryFlat, setCategoryFlat] = useState([]);
  const [categoriesError, setCategoriesError] = useState(null);
  const [activeParentId, setActiveParentId] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    title: "", description: "", category: "", newCategory: "", tags: [], pricePerDay: "", securityDeposit: "0",
    condition: "GOOD", location: "", city: "", rules: "", status: "PUBLISHED",
  });
  // Category is optional now — this just toggles whether the form shows
  // the existing chip picker or a free-text box for typing a new one.
  // Switching modes back and forth keeps whatever was typed/selected in
  // each — nothing gets wiped just from clicking the toggle.
  const [customCategoryMode, setCustomCategoryMode] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  const loadCategories = () => {
    setCategoriesError(null);
    categoriesApi
      .list()
      .then((res) => {
        setCategoryTree(res.categories);
        setCategoryFlat(res.flat || []);
      })
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

  // While typing a custom category name, surface anything already close to
  // it so people reuse "Bicycles" instead of accidentally forking off a
  // near-duplicate "Bikes" / "bicycle" category. Exact match (by slug) is
  // called out separately since that one will just get silently reused.
  const typedCategoryName = form.newCategory.trim();
  const exactCategoryMatch = useMemo(() => {
    if (!typedCategoryName) return null;
    const slug = slugifyLite(typedCategoryName);
    return categoryFlat.find((c) => slugifyLite(c.name) === slug) || null;
  }, [typedCategoryName, categoryFlat]);
  const similarCategories = useMemo(() => {
    if (!typedCategoryName || typedCategoryName.length < 2 || exactCategoryMatch) return [];
    const needle = typedCategoryName.toLowerCase();
    return categoryFlat
      .filter((c) => c.name.toLowerCase().includes(needle) || needle.includes(c.name.toLowerCase()))
      .slice(0, 4);
  }, [typedCategoryName, exactCategoryMatch, categoryFlat]);

  const loadItem = () => {
    if (!isEdit) return;
    setLoading(true);
    setLoadError(null);
    itemsApi
      .get(id)
      .then((res) => {
        const it = res.item;
        setForm({
          title: it.title, description: it.description, category: it.category?._id || "", newCategory: "",
          tags: it.tags || [],
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

  const addTag = (raw) => {
    const clean = raw.trim().toLowerCase().slice(0, MAX_TAG_LENGTH);
    if (!clean) return;
    setForm((f) => {
      if (f.tags.includes(clean) || f.tags.length >= MAX_TAGS) return f;
      return { ...f, tags: [...f.tags, clean] };
    });
    setTagInput("");
  };

  const removeTag = (tag) => setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));

  const handleTagInputKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput && form.tags.length > 0) {
      // Backspacing on an empty input pops the last chip, same as most
      // tag/email-recipient inputs behave.
      removeTag(form.tags[form.tags.length - 1]);
    }
  };

  // Jump from a "similar category" suggestion straight to picking that
  // existing category, instead of creating a near-duplicate.
  const useExistingCategory = (cat) => {
    setCustomCategoryMode(false);
    setForm((f) => ({ ...f, category: cat._id }));
    const parentId = cat.parent || cat._id;
    setActiveParentId(parentId);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required.";
    if (!form.description.trim()) e.description = "Description is required.";
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
      // Only send the category source that's actually active in the UI —
      // avoids a stale value in the "other" mode's field ever winning
      // server-side just because it was typed/selected earlier.
      const categoryPayload = customCategoryMode
        ? { category: "", newCategory: form.newCategory.trim() }
        : { category: form.category, newCategory: "" };

      if (isEdit) {
        await itemsApi.update(id, {
          ...form,
          ...categoryPayload,
          rules: rulesArr,
          pricePerDay: Number(form.pricePerDay),
          securityDeposit: Number(form.securityDeposit),
        });
        if (newFiles.length > 0) {
          const fd = new FormData();
          newFiles.forEach((f) => fd.append("images", f));
          await itemsApi.addImages(id, fd);
        }
        toast.success("Listing updated.");
        navigate("/dashboard/listings");
      } else {
        const fd = new FormData();
        Object.entries({ ...form, ...categoryPayload, status: "PUBLISHED" }).forEach(([k, v]) => {
          if (k !== "rules" && k !== "tags") fd.append(k, v);
        });
        // Append each rule/tag as its own field so multer/express parses
        // them back into proper arrays instead of one joined string.
        rulesArr.forEach((r) => fd.append("rules", r));
        form.tags.forEach((t) => fd.append("tags", t));
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
          <div className="flex items-center justify-between mb-1.5">
            <span className="block text-xs font-semibold text-muted">Category <span className="font-normal text-muted/70">(optional)</span></span>
            <button
              type="button"
              onClick={() => setCustomCategoryMode((v) => !v)}
              className="text-xs font-semibold text-brand hover:underline"
            >
              {customCategoryMode ? "Pick from existing categories" : "+ Use my own category"}
            </button>
          </div>

          {customCategoryMode ? (
            <div>
              <TextField
                placeholder="e.g. Musical Instruments"
                value={form.newCategory}
                maxLength={60}
                onChange={(e) => setForm({ ...form, newCategory: e.target.value })}
              />
              {exactCategoryMatch ? (
                <p className="flex items-center gap-1.5 text-xs text-emerald-700 -mt-3 mb-3">
                  <Check size={13} /> Matches an existing category — your listing will be added to it, nothing new gets created.
                </p>
              ) : similarCategories.length > 0 ? (
                <div className="-mt-3 mb-3">
                  <p className="text-xs text-muted mb-1.5">Did you mean one of these already-existing categories?</p>
                  <div className="flex flex-wrap gap-1.5">
                    {similarCategories.map((c) => (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() => useExistingCategory(c)}
                        className="text-xs font-medium bg-surface border border-line rounded-full px-3 py-1 hover:border-brand hover:text-brand"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : typedCategoryName ? (
                <p className="text-xs text-muted -mt-3 mb-3">This will be created as a brand new category.</p>
              ) : null}
            </div>
          ) : categoriesError ? (
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
              <p className="text-xs text-muted mt-2">Leave unselected and it'll be listed under "General" — you can always change it later.</p>
            </>
          )}
          {errors.category && <span className="block text-xs text-danger mt-1.5">{errors.category}</span>}
        </div>

        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="block text-xs font-semibold text-muted">Search keywords <span className="font-normal text-muted/70">(optional)</span></span>
            <span className="text-[11px] text-muted">{form.tags.length}/{MAX_TAGS}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 w-full border border-line rounded-xl px-2.5 py-2 bg-surface focus-within:ring-2 focus-within:ring-brand/40 focus-within:border-brand">
            {form.tags.map((t) => (
              <span key={t} className="flex items-center gap-1 text-xs font-medium bg-white border border-line rounded-full pl-2.5 pr-1.5 py-1">
                #{t}
                <button type="button" onClick={() => removeTag(t)} className="text-muted hover:text-ink">
                  <X size={11} />
                </button>
              </span>
            ))}
            {form.tags.length < MAX_TAGS && (
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                onBlur={() => addTag(tagInput)}
                placeholder={form.tags.length === 0 ? "e.g. waterproof, beginner-friendly — press Enter to add" : "Add another..."}
                className="flex-1 min-w-[140px] text-sm bg-transparent outline-none py-1"
              />
            )}
          </div>
          <p className="text-xs text-muted mt-1.5">Your own keywords help people find this listing in search, even if the words aren't in the title.</p>
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
