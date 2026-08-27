import slugify from "slugify";
import User from "../models/User.js";
import Category from "../models/Category.js";

// Password used only the first time a demo account is created. If the
// account already exists (e.g. you changed the password yourself) this is
// never applied again, so it's safe to leave the same value here.
export const DEMO_PASSWORD = "Demo@1234";

export const DEMO_ACCOUNTS = [
  { name: "Rent It Admin", email: "admin@rentit.demo", role: "admin", location: "Kathmandu" },
  { name: "Owner Demo", email: "owner@rentit.demo", role: "user", location: "Kathmandu" },
  { name: "Renter Demo", email: "renter@rentit.demo", role: "user", location: "Kathmandu" },
];

const BASE_CATEGORY_TREE = [
  { name: "Vehicles", icon: "Bike", children: ["Cars", "Motorcycles", "Scooters", "Bicycles", "Vans"] },
  { name: "Electronics", icon: "Camera", children: ["Cameras", "Laptops", "Phones", "Projectors", "Drones", "Audio"] },
  { name: "Tools & Equipment", icon: "Wrench", children: ["Power Tools", "Hand Tools", "Generators", "Ladders"] },
  { name: "Home & Appliances", icon: "Sofa", children: ["Kitchen Appliances", "Furniture", "Home Electronics"] },
  { name: "Fashion", icon: "Shirt", children: ["Formal Wear", "Traditional Wear", "Costumes"] },
  { name: "Sports & Outdoors", icon: "Dumbbell", children: ["Camping Gear", "Fitness Equipment", "Trekking Gear"] },
  { name: "Events & Party", icon: "PartyPopper", children: ["Sound Systems", "Decor", "Tents & Canopies"] },
];

/**
 * Idempotent, non-destructive setup that runs on every server boot.
 *
 * Unlike src/seed.js (which wipes and rebuilds everything for demo
 * purposes), this ONLY creates things that are missing. It never deletes
 * or overwrites existing users, categories, or listings, so real signups
 * and real posted items are always safe — this just guarantees the login
 * credentials for the admin/owner/renter demo accounts and the base
 * category tree always exist, even on a completely fresh database, without
 * you having to remember to run `npm run seed` by hand.
 */
export async function ensureBaseData({ silent = false } = {}) {
  const log = (...args) => !silent && console.log(...args);

  // --- Base category tree (only fills in what's missing by slug) ---
  for (const top of BASE_CATEGORY_TREE) {
    const topSlug = slugify(top.name, { lower: true, strict: true });
    let parent = await Category.findOne({ slug: topSlug });
    if (!parent) {
      parent = await Category.create({ name: top.name, slug: topSlug, icon: top.icon });
      log(`[ensure-base-data] Created category "${top.name}"`);
    }
    for (const childName of top.children) {
      const childSlug = slugify(childName, { lower: true, strict: true });
      const exists = await Category.findOne({ slug: childSlug });
      if (!exists) {
        await Category.create({ name: childName, slug: childSlug, icon: top.icon, parent: parent._id });
        log(`[ensure-base-data] Created category "${childName}"`);
      }
    }
  }

  // --- Demo login accounts (created once, never overwritten afterwards) ---
  const created = [];
  for (const acc of DEMO_ACCOUNTS) {
    const exists = await User.findOne({ email: acc.email });
    if (!exists) {
      await User.create({ ...acc, password: DEMO_PASSWORD });
      created.push(acc.email);
    }
  }
  if (created.length > 0) {
    log(`[ensure-base-data] Created demo accounts: ${created.join(", ")} (password: ${DEMO_PASSWORD})`);
  }

  return { createdAccounts: created };
}
