import slugify from "slugify";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Item from "../models/Item.js";

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

const SAMPLE_ITEMS = [
  {
    title: "Sony Alpha A7 III Camera + 24-70mm Lens",
    categorySlug: "electronics",
    city: "Kathmandu",
    location: "Baneshwor, Kathmandu",
    pricePerDay: 1500,
    condition: "LIKE_NEW",
    description: "Professional full-frame mirrorless kit, great for weddings, events, and video shoots. Includes camera body, 24-70mm f/2.8 lens, two batteries, a 64GB card, and a carry bag.",
    images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80"],
  },
  {
    title: "DJI Mini 3 Pro Drone with Fly More Combo",
    categorySlug: "electronics",
    city: "Lalitpur",
    location: "Jhamsikhel, Lalitpur",
    pricePerDay: 2500,
    condition: "NEW",
    description: "Ultralight foldable drone with 4K/60fps video, obstacle sensing, and three high-capacity batteries in the Fly More Combo.",
    images: ["https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1000&q=80"],
  },
  {
    title: "MacBook Pro 14\" M3 Pro",
    categorySlug: "electronics",
    city: "Kathmandu",
    location: "Sinamangal, Kathmandu",
    pricePerDay: 1800,
    condition: "LIKE_NEW",
    description: "18GB RAM, 512GB SSD. Great for video editing, design work, or short-term dev projects.",
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80"],
  },
  {
    title: "Bosch Professional Cordless Hammer Drill Kit",
    categorySlug: "tools-and-equipment",
    city: "Pokhara",
    location: "Lakeside, Pokhara",
    pricePerDay: 500,
    condition: "GOOD",
    description: "18V cordless hammer drill for masonry, wood, and metal. Comes with two batteries and a hard case.",
    images: ["https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1000&q=80"],
  },
  {
    title: "Honda 2.2kW Portable Generator",
    categorySlug: "tools-and-equipment",
    city: "Bhaktapur",
    location: "Suryabinayak, Bhaktapur",
    pricePerDay: 1200,
    condition: "GOOD",
    description: "Quiet inverter generator, ideal for outdoor events or backup power. Full tank included at pickup.",
    images: ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1000&q=80"],
  },
  {
    title: "Waterproof 4-Person Camping Tent + Sleeping Bags",
    categorySlug: "sports-and-outdoors",
    city: "Pokhara",
    location: "Lakeside, Pokhara",
    pricePerDay: 800,
    condition: "LIKE_NEW",
    description: "Double-layer windproof tent package. Includes two thermal sleeping bags and one inflatable sleeping pad, ideal for trekking trips.",
    images: ["https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1000&q=80"],
  },
  {
    title: "Trekking Backpack 60L + Poles",
    categorySlug: "sports-and-outdoors",
    city: "Kathmandu",
    location: "Thamel, Kathmandu",
    pricePerDay: 350,
    condition: "GOOD",
    description: "60L capacity with rain cover, adjustable straps, and a pair of trekking poles included.",
    images: ["https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1000&q=80"],
  },
  {
    title: "Mountain Electric Bicycle (E-Bike)",
    categorySlug: "vehicles",
    city: "Pokhara",
    location: "Damside, Pokhara",
    pricePerDay: 1200,
    condition: "GOOD",
    description: "Pedal-assist mountain e-bike, good for lake-side rides or trail exploring. Helmet included.",
    images: ["https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=1000&q=80"],
  },
  {
    title: "Royal Enfield Classic 350",
    categorySlug: "vehicles",
    city: "Pokhara",
    location: "Lakeside, Pokhara",
    pricePerDay: 2200,
    condition: "LIKE_NEW",
    description: "Fully serviced touring motorcycle with luggage rack and two helmets included.",
    images: ["https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1000&q=80"],
  },
  {
    title: "JBL PartyBox 310 Bluetooth Speaker",
    categorySlug: "events-and-party",
    city: "Kathmandu",
    location: "Baneshwor, Kathmandu",
    pricePerDay: 1000,
    condition: "NEW",
    description: "240W party speaker with a built-in light show, Bluetooth, and mic/guitar input.",
    images: ["https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80"],
  },
  {
    title: "Party Tent & Canopy (10x10ft)",
    categorySlug: "events-and-party",
    city: "Bhaktapur",
    location: "Durbar Square area, Bhaktapur",
    pricePerDay: 900,
    condition: "GOOD",
    description: "Waterproof pop-up canopy tent, easy setup, great for outdoor gatherings and stalls.",
    images: ["https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=80"],
  },
  {
    title: "Traditional Bridal Lehenga & Jewelry Set",
    categorySlug: "fashion",
    city: "Bhaktapur",
    location: "Bhaktapur Durbar Square",
    pricePerDay: 3000,
    condition: "LIKE_NEW",
    description: "Heavy velvet bridal outfit with zardozi work, dry-cleaned. Includes lehenga, dupatta, and jewelry.",
    images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80"],
  },
  {
    title: "Men's Formal Suit (Tailored, Size M)",
    categorySlug: "fashion",
    city: "Kathmandu",
    location: "New Road, Kathmandu",
    pricePerDay: 800,
    condition: "GOOD",
    description: "Charcoal grey tailored suit with shirt and tie, freshly dry-cleaned before every rental.",
    images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80"],
  },
  {
    title: "Kärcher K3 High Pressure Washer",
    categorySlug: "home-and-appliances",
    city: "Kathmandu",
    location: "Koteshwor, Kathmandu",
    pricePerDay: 700,
    condition: "GOOD",
    description: "120 Bar pressure washer, great for cars, driveways, and exteriors. 6m cable included.",
    images: ["https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1000&q=80"],
  },
  {
    title: "Stand Mixer + Full Baking Set",
    categorySlug: "home-and-appliances",
    city: "Lalitpur",
    location: "Patan, Lalitpur",
    pricePerDay: 400,
    condition: "LIKE_NEW",
    description: "6-quart stand mixer with dough hook, whisk, and paddle, plus measuring sets and baking pans.",
    images: ["https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&w=1000&q=80"],
  },
];

const BASE_CATEGORY_TOP_SLUGS = BASE_CATEGORY_TREE.map((c) => slugify(c.name, { lower: true, strict: true }));

async function uniqueItemSlug(title) {
  const base = slugify(title, { lower: true, strict: true }).slice(0, 80) || "item";
  let slug = base;
  let n = 1;
  while (await Item.exists({ slug })) {
    slug = `${base}-${++n}`;
  }
  return slug;
}

export async function ensureBaseData({ silent = false } = {}) {
  const log = (...args) => !silent && console.log(...args);

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

  const owner = await User.findOne({ email: "owner@rentit.demo" });
  if (owner) {
    const categoryDocs = await Category.find({ slug: { $in: BASE_CATEGORY_TOP_SLUGS } });
    const categoryBySlug = new Map(categoryDocs.map((c) => [c.slug, c]));

    let createdItems = 0;
    for (const sample of SAMPLE_ITEMS) {
      const alreadyExists = await Item.exists({ title: sample.title, owner: owner._id });
      if (alreadyExists) continue;

      const categoryDoc = categoryBySlug.get(sample.categorySlug);
      if (!categoryDoc) {
        log(`[ensure-base-data] Skipping "${sample.title}" — category "${sample.categorySlug}" not found.`);
        continue;
      }

      await Item.create({
        owner: owner._id,
        category: categoryDoc._id,
        title: sample.title,
        slug: await uniqueItemSlug(sample.title),
        description: sample.description,
        pricePerDay: sample.pricePerDay,
        condition: sample.condition,
        location: sample.location,
        city: sample.city,
        images: sample.images.map((url) => ({ url })),
        status: "PUBLISHED",
      });
      createdItems++;
    }
    if (createdItems > 0) {
      log(`[ensure-base-data] Created ${createdItems} sample listing(s).`);
    }
  } else {
    log("[ensure-base-data] Skipped sample listings — owner@rentit.demo not found.");
  }

  return { createdAccounts: created };
}