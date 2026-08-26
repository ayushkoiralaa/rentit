import "dotenv/config";
import { validateEnv, env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import mongoose from "mongoose";
import slugify from "slugify";

import User from "./models/User.js";
import Category from "./models/Category.js";
import Item from "./models/Item.js";
import Booking from "./models/Booking.js";
import Review from "./models/Review.js";
import Favorite from "./models/Favorite.js";

validateEnv();
await connectDB();

console.log("[seed] Clearing existing demo-relevant collections...");
await Promise.all([
  User.deleteMany({}),
  Category.deleteMany({}),
  Item.deleteMany({}),
  Booking.deleteMany({}),
  Review.deleteMany({}),
  Favorite.deleteMany({}),
]);

console.log("[seed] Creating categories...");
const categoryTree = [
  { name: "Vehicles", icon: "Bike", children: ["Cars", "Motorcycles", "Scooters", "Bicycles", "Vans"] },
  { name: "Electronics", icon: "Camera", children: ["Cameras", "Laptops", "Phones", "Projectors", "Drones", "Audio"] },
  { name: "Tools & Equipment", icon: "Wrench", children: ["Power Tools", "Hand Tools", "Generators", "Ladders"] },
  { name: "Home & Appliances", icon: "Sofa", children: ["Kitchen Appliances", "Furniture", "Home Electronics"] },
  { name: "Fashion", icon: "Shirt", children: ["Formal Wear", "Traditional Wear", "Costumes"] },
  { name: "Sports & Outdoors", icon: "Dumbbell", children: ["Camping Gear", "Fitness Equipment", "Trekking Gear"] },
  { name: "Events & Party", icon: "PartyPopper", children: ["Sound Systems", "Decor", "Tents & Canopies"] },
];

const categoriesById = {};
for (const top of categoryTree) {
  const parent = await Category.create({ name: top.name, slug: slugify(top.name, { lower: true, strict: true }), icon: top.icon });
  categoriesById[top.name] = parent;
  for (const childName of top.children) {
    const child = await Category.create({
      name: childName,
      slug: slugify(childName, { lower: true, strict: true }),
      icon: top.icon,
      parent: parent._id,
    });
    categoriesById[childName] = child;
  }
}

console.log("[seed] Creating demo users...");
const DEMO_PASSWORD = "Demo@1234";

const admin = await User.create({
  name: "Rent It Admin",
  email: "admin@rentit.demo",
  password: DEMO_PASSWORD,
  role: "admin",
  location: "Kathmandu",
});

const ownerNames = [
  ["Sujata Karki", "Baneshwor, Kathmandu"],
  ["Bikash Thapa", "New Road, Kathmandu"],
  ["Prakash Gurung", "Lakeside, Pokhara"],
  ["Anita Rai", "Chipledhunga, Pokhara"],
  ["Deepak Shrestha", "Mahendrapul, Pokhara"],
  ["Manisha Pandey", "Pardi, Pokhara"],
  ["Suraj Magar", "Baidam, Pokhara"],
  ["Nirmala Adhikari", "Boudha, Kathmandu"],
];

const owners = [];
for (const [name, location] of ownerNames) {
  const email = `${name.split(" ")[0].toLowerCase()}@rentit.demo`;
  const user = await User.create({ name, email, password: DEMO_PASSWORD, location, phone: "98" + Math.floor(10000000 + Math.random() * 89999999) });
  owners.push(user);
}

const renter = await User.create({
  name: "Renter Demo",
  email: "renter@rentit.demo",
  password: DEMO_PASSWORD,
  location: "Kathmandu",
});
const ownerDemo = await User.create({
  name: "Owner Demo",
  email: "owner@rentit.demo",
  password: DEMO_PASSWORD,
  location: "Kathmandu",
});
owners.push(ownerDemo);

console.log("[seed] Creating listings...");
const CONDITIONS = ["NEW", "LIKE_NEW", "GOOD", "FAIR"];
const listingSeeds = [
  { title: "3-Seater Sofa-cum-Bed", category: "Furniture", price: 300, deposit: 1500, city: "Kathmandu", loc: "Baneshwor", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop" },
  { title: "Canon EOS 90D DSLR Camera", category: "Cameras", price: 800, deposit: 8000, city: "Kathmandu", loc: "New Road", img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop" },
  { title: "Bosch Cordless Drill Machine", category: "Power Tools", price: 150, deposit: 1000, city: "Pokhara", loc: "Lakeside", img: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop" },
  { title: "Electric Scooter — Long Range", category: "Scooters", price: 500, deposit: 5000, city: "Pokhara", loc: "Chipledhunga", img: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop" },
  { title: "Men's Wedding Suit (Size L)", category: "Formal Wear", price: 1200, deposit: 3000, city: "Pokhara", loc: "Mahendrapul", img: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=600&fit=crop" },
  { title: "Wooden Study Table, Second Hand", category: "Furniture", price: 200, deposit: 500, city: "Pokhara", loc: "Pardi", img: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&h=600&fit=crop" },
  { title: "JBL Bluetooth Party Speaker", category: "Audio", price: 250, deposit: 2000, city: "Kathmandu", loc: "New Road", img: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=600&fit=crop" },
  { title: "Mountain Bike, 21-Gear", category: "Bicycles", price: 350, deposit: 2500, city: "Pokhara", loc: "Baidam", img: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800&h=600&fit=crop" },
  { title: "DJI Mini 3 Drone", category: "Drones", price: 1500, deposit: 15000, city: "Kathmandu", loc: "Boudha", img: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&h=600&fit=crop" },
  { title: "MacBook Pro 14\" M2", category: "Laptops", price: 1800, deposit: 20000, city: "Kathmandu", loc: "Baneshwor", img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop" },
  { title: "Portable Generator 2kVA", category: "Generators", price: 600, deposit: 5000, city: "Pokhara", loc: "Lakeside", img: "https://images.unsplash.com/photo-1620825141326-5c6ec3855c92?w=800&h=600&fit=crop" },
  { title: "Epson Home Theatre Projector", category: "Projectors", price: 700, deposit: 6000, city: "Kathmandu", loc: "New Road", img: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=600&fit=crop" },
  { title: "4-Person Camping Tent", category: "Camping Gear", price: 400, deposit: 2000, city: "Pokhara", loc: "Lakeside", img: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=600&fit=crop" },
  { title: "PA Sound System with Mixer", category: "Sound Systems", price: 2000, deposit: 10000, city: "Kathmandu", loc: "Boudha", img: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&h=600&fit=crop" },
  { title: "Traditional Daura Suruwal Set", category: "Traditional Wear", price: 800, deposit: 2000, city: "Kathmandu", loc: "Baneshwor", img: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&h=600&fit=crop" },
];

const items = [];
for (let i = 0; i < listingSeeds.length; i++) {
  const seed = listingSeeds[i];
  const owner = owners[i % owners.length];
  const category = categoriesById[seed.category];
  const title = seed.title;
  const item = await Item.create({
    owner: owner._id,
    category: category._id,
    title,
    slug: slugify(title, { lower: true, strict: true }) + "-" + (i + 1),
    description: `${title} in great working condition, well maintained and ready to rent. Pickup available from ${seed.loc}, ${seed.city}. Please treat it with care and return on the agreed date.`,
    condition: CONDITIONS[i % CONDITIONS.length],
    pricePerDay: seed.price,
    securityDeposit: seed.deposit,
    images: [{ url: seed.img, publicId: "" }],
    location: seed.loc,
    city: seed.city,
    rules: ["No smoking", "Return on time", "Handle with care"],
    status: "PUBLISHED",
    ratingAverage: Math.round((4 + Math.random()) * 10) / 10,
    ratingCount: Math.floor(Math.random() * 30) + 1,
    favoriteCount: Math.floor(Math.random() * 15),
    viewCount: Math.floor(Math.random() * 200),
  });
  items.push(item);
}

console.log("[seed] Creating a demo booking (completed, with review) for the demo accounts...");
const demoItem = items[0];
const start = new Date();
start.setDate(start.getDate() - 10);
const end = new Date();
end.setDate(end.getDate() - 7);

const demoBooking = await Booking.create({
  item: demoItem._id,
  renter: renter._id,
  owner: demoItem.owner,
  startDate: start,
  endDate: end,
  numberOfDays: 3,
  rentalAmount: demoItem.pricePerDay * 3,
  platformFee: Math.round((demoItem.pricePerDay * 3 * env.platformFeePercent) / 100),
  securityDeposit: demoItem.securityDeposit,
  totalAmount: demoItem.pricePerDay * 3 + demoItem.securityDeposit,
  status: "COMPLETED",
  paymentStatus: "DEMO_PAID",
  paymentReference: "DEMO-SEED-0001",
});

await Review.create({
  booking: demoBooking._id,
  item: demoItem._id,
  reviewer: renter._id,
  reviewee: demoItem.owner,
  rating: 5,
  comment: "Exactly as described, smooth pickup and return. Would rent again!",
});

console.log("\n[seed] Done!\n");
console.log("Demo accounts (password for all: " + DEMO_PASSWORD + "):");
console.log("  Admin:  admin@rentit.demo");
console.log("  Owner:  owner@rentit.demo");
console.log("  Renter: renter@rentit.demo");
console.log(`\nSeeded ${owners.length + 2} users, ${items.length} listings, 1 completed booking + review.\n`);

await mongoose.connection.close();
process.exit(0);
