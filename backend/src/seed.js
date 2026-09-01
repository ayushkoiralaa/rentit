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
  ["Rohan Maharjan", "Patan, Lalitpur"],
  ["Sabina Bajracharya", "Jhamsikhel, Lalitpur"],
  ["Aayush Prajapati", "Durbar Square, Bhaktapur"],
  ["Kiran Khatiwada", "Thamel, Kathmandu"],
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

console.log("[seed] Creating 100 listings...");
const CONDITIONS = ["NEW", "LIKE_NEW", "GOOD", "FAIR"];

const listingSeeds = [
  // Electronics
  { title: "Sony Alpha A7 IV Camera Kit", category: "Cameras", price: 2500, deposit: 25000, city: "Kathmandu", loc: "Thamel", img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800" },
  { title: "DJI Mini 3 Pro Drone", category: "Drones", price: 3500, deposit: 30000, city: "Pokhara", loc: "Lakeside", img: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800" },
  { title: "GoPro HERO11 Black Action Cam", category: "Cameras", price: 1200, deposit: 10000, city: "Pokhara", loc: "Baidam", img: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800" },
  { title: "Epson HD Portable Projector", category: "Projectors", price: 1500, deposit: 12000, city: "Kathmandu", loc: "New Road", img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800" },
  { title: "Meta Quest 3 VR Headset", category: "Home Electronics", price: 2000, deposit: 18000, city: "Lalitpur", loc: "Jhamsikhel", img: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?w=800" },
  { title: "Canon EOS R6 Mark II Body", category: "Cameras", price: 3000, deposit: 35000, city: "Kathmandu", loc: "Baneshwor", img: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800" },
  { title: "Sony 70-200mm f/2.8 GM Lens", category: "Cameras", price: 1800, deposit: 20000, city: "Lalitpur", loc: "Patan", img: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800" },
  { title: "Rode Wireless GO II Mic Set", category: "Audio", price: 800, deposit: 6000, city: "Kathmandu", loc: "Boudha", img: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800" },
  { title: "Aputure 100x Studio LED Light", category: "Cameras", price: 1200, deposit: 10000, city: "Lalitpur", loc: "Kupondole", img: "https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?w=800" },
  { title: "DJI Ronin RS3 Gimbal Stabilizer", category: "Cameras", price: 1500, deposit: 12000, city: "Kathmandu", loc: "New Road", img: "https://images.unsplash.com/photo-1589872736085-f3708e1f0e4b?w=800" },
  { title: "Apple iPad Pro 12.9 M2", category: "Laptops", price: 1200, deposit: 15000, city: "Kathmandu", loc: "Baneshwor", img: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800" },
  { title: "MacBook Pro 16 Inch M2 Max", category: "Laptops", price: 3500, deposit: 40000, city: "Lalitpur", loc: "Jhamsikhel", img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800" },
  { title: "PS5 Console + 2 Controllers", category: "Home Electronics", price: 1500, deposit: 15000, city: "Bhaktapur", loc: "Suryabinayak", img: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800" },
  { title: "Nintendo Switch OLED Model", category: "Home Electronics", price: 800, deposit: 8000, city: "Kathmandu", loc: "Thamel", img: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800" },
  { title: "Anker Portable Power Station 500W", category: "Generators", price: 1200, deposit: 10000, city: "Pokhara", loc: "Lakeside", img: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800" },
  { title: "Starlink Satellite Internet Kit", category: "Home Electronics", price: 2500, deposit: 25000, city: "Pokhara", loc: "Pardi", img: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=800" },

  // Vehicles
  { title: "Royal Enfield Classic 350", category: "Motorcycles", price: 2200, deposit: 15000, city: "Pokhara", loc: "Lakeside", img: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800" },
  { title: "TVS NTorq 125 Scooter", category: "Scooters", price: 800, deposit: 5000, city: "Kathmandu", loc: "Baneshwor", img: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800" },
  { title: "Mahindra Scorpio 4x4 SUV", category: "Cars", price: 7500, deposit: 50000, city: "Kathmandu", loc: "Naxal", img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800" },
  { title: "Honda XR 190L Dirt Bike", category: "Motorcycles", price: 3200, deposit: 20000, city: "Pokhara", loc: "Chipledhunga", img: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800" },
  { title: "Mountain E-Bike Hardtail", category: "Bicycles", price: 1500, deposit: 10000, city: "Pokhara", loc: "Baidam", img: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800" },
  { title: "Toyota HiAce Super GL Van", category: "Vans", price: 8000, deposit: 40000, city: "Kathmandu", loc: "Kalanki", img: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800" },
  { title: "Hyundai Creta Automatic", category: "Cars", price: 5000, deposit: 35000, city: "Lalitpur", loc: "Jhamsikhel", img: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800" },
  { title: "Hero Xpulse 200 4V Bike", category: "Motorcycles", price: 1800, deposit: 12000, city: "Pokhara", loc: "Mahendrapul", img: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800" },
  { title: "Vespa LX 125 Scooter", category: "Scooters", price: 1000, deposit: 6000, city: "Lalitpur", loc: "Patan", img: "https://images.unsplash.com/photo-1520116468816-95b69f847357?w=800" },
  { title: "Crossfire RM 250 Dirt Bike", category: "Motorcycles", price: 3500, deposit: 25000, city: "Kathmandu", loc: "Boudha", img: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800" },
  { title: "Kia Sonet Compact SUV", category: "Cars", price: 4500, deposit: 30000, city: "Bhaktapur", loc: "Suryabinayak", img: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800" },
  { title: "Trek Marlin 7 Mountain Bike", category: "Bicycles", price: 800, deposit: 6000, city: "Pokhara", loc: "Lakeside", img: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800" },
  { title: "Ford Ranger Raptor Pick-Up", category: "Cars", price: 12000, deposit: 60000, city: "Kathmandu", loc: "Thamel", img: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800" },
  { title: "Yamaha FZ-S V3 Motorcycle", category: "Motorcycles", price: 1200, deposit: 8000, city: "Bhaktapur", loc: "Durbar Square", img: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800" },

  // Sports & Outdoors
  { title: "4-Person Waterproof Camping Tent", category: "Camping Gear", price: 1000, deposit: 4000, city: "Pokhara", loc: "Lakeside", img: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800" },
  { title: "North Face 65L Trekking Bag", category: "Trekking Gear", price: 350, deposit: 2000, city: "Kathmandu", loc: "Thamel", img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800" },
  { title: "Marmot -20C Down Sleeping Bag", category: "Camping Gear", price: 400, deposit: 2500, city: "Kathmandu", loc: "New Road", img: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800" },
  { title: "Gore-Tex Heavy Windproof Jacket", category: "Trekking Gear", price: 300, deposit: 1500, city: "Kathmandu", loc: "Thamel", img: "https://images.unsplash.com/photo-1544441893-675973e31985?w=800" },
  { title: "Garmin inReach Mini 2 GPS", category: "Trekking Gear", price: 1500, deposit: 15000, city: "Pokhara", loc: "Baidam", img: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800" },
  { title: "Portable Gas Stove + Cookware", category: "Camping Gear", price: 500, deposit: 2000, city: "Pokhara", loc: "Lakeside", img: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=800" },
  { title: "Trekking Poles & Crampons Set", category: "Trekking Gear", price: 250, deposit: 1000, city: "Kathmandu", loc: "Boudha", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800" },
  { title: "Inflatable Kayak + Paddle Set", category: "Fitness Equipment", price: 2000, deposit: 12000, city: "Pokhara", loc: "Lakeside", img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800" },
  { title: "Stand-Up Paddleboard SUP", category: "Fitness Equipment", price: 1800, deposit: 10000, city: "Pokhara", loc: "Baidam", img: "https://images.unsplash.com/photo-1508873696983-2df515122519?w=800" },
  { title: "Scarpa Hiking Boots Size 42", category: "Trekking Gear", price: 450, deposit: 3000, city: "Kathmandu", loc: "Thamel", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800" },
  { title: "Foldable Camp Chairs (Set of 4)", category: "Camping Gear", price: 400, deposit: 2000, city: "Bhaktapur", loc: "Suryabinayak", img: "https://images.unsplash.com/photo-1596265371388-43edba6757f5?w=800" },
  { title: "Suunto 9 Baro GPS Watch", category: "Fitness Equipment", price: 600, deposit: 5000, city: "Pokhara", loc: "Chipledhunga", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800" },
  { title: "2-Person Lightweight Tent", category: "Camping Gear", price: 600, deposit: 3000, city: "Kathmandu", loc: "Baneshwor", img: "https://images.unsplash.com/photo-1478827536114-da961b7f86d2?w=800" },
  { title: "Petzl Glacier Ice Axe", category: "Trekking Gear", price: 350, deposit: 2000, city: "Kathmandu", loc: "Thamel", img: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800" },
  { title: "Black Diamond Climbing Harness", category: "Fitness Equipment", price: 500, deposit: 3000, city: "Kathmandu", loc: "New Road", img: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800" },
  { title: "Yeti Tundra 45 Cooler Box", category: "Camping Gear", price: 700, deposit: 5000, city: "Lalitpur", loc: "Jhamsikhel", img: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800" },
  { title: "Bushnell 10x42 Binoculars", category: "Trekking Gear", price: 400, deposit: 3000, city: "Pokhara", loc: "Lakeside", img: "https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=800" },
  { title: "Solar Power Bank 20000mAh", category: "Camping Gear", price: 200, deposit: 1000, city: "Kathmandu", loc: "Boudha", img: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800" },

  // Events & Party
  { title: "JBL PartyBox 310 Speaker", category: "Sound Systems", price: 2000, deposit: 15000, city: "Kathmandu", loc: "New Road", img: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800" },
  { title: "Party Canopy Tent (10x10ft)", category: "Tents & Canopies", price: 900, deposit: 4000, city: "Bhaktapur", loc: "Suryabinayak", img: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800" },
  { title: "PA Sound System + Mics", category: "Sound Systems", price: 2800, deposit: 15000, city: "Lalitpur", loc: "Patan", img: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800" },
  { title: "Outdoor Fairy Lights & Floodlights", category: "Decor", price: 600, deposit: 3000, city: "Kathmandu", loc: "Baneshwor", img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800" },
  { title: "Barbeque Grill + Charcoal Kit", category: "Decor", price: 700, deposit: 3000, city: "Lalitpur", loc: "Kupondole", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800" },
  { title: "Smoke Fog Machine 1200W", category: "Decor", price: 1000, deposit: 5000, city: "Kathmandu", loc: "Thamel", img: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800" },
  { title: "Outdoor Movie Screen + Projector", category: "Decor", price: 2500, deposit: 15000, city: "Bhaktapur", loc: "Durbar Square", img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800" },
  { title: "Round Banquet Tables + Chairs", category: "Decor", price: 2000, deposit: 8000, city: "Kathmandu", loc: "Kalanki", img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800" },
  { title: "4-Tier Chocolate Fountain", category: "Decor", price: 1200, deposit: 6000, city: "Lalitpur", loc: "Jhamsikhel", img: "https://images.unsplash.com/photo-1575224300306-1b8da36134ec?w=800" },
  { title: "Pioneer DDJ-FLX6 DJ Controller", category: "Sound Systems", price: 3500, deposit: 25000, city: "Kathmandu", loc: "Thamel", img: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800" },
  { title: "LED RGB Stage Bar Lights", category: "Decor", price: 1500, deposit: 8000, city: "Kathmandu", loc: "Baneshwor", img: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800" },
  { title: "Bubble Machine for Events", category: "Decor", price: 800, deposit: 3000, city: "Bhaktapur", loc: "Suryabinayak", img: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800" },
  { title: "2-Group Commercial Coffee Machine", category: "Decor", price: 4000, deposit: 30000, city: "Kathmandu", loc: "New Road", img: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800" },
  { title: "Gas Patio Tower Heater", category: "Decor", price: 1800, deposit: 10000, city: "Lalitpur", loc: "Jhamsikhel", img: "https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?w=800" },
  { title: "Photobooth Props & Frame Kit", category: "Decor", price: 1000, deposit: 3000, city: "Kathmandu", loc: "Boudha", img: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800" },

  // Tools & Equipment
  { title: "Karcher K3 High Pressure Washer", category: "Power Tools", price: 700, deposit: 5000, city: "Kathmandu", loc: "Kalanki", img: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800" },
  { title: "Bosch Cordless Drill Machine", category: "Power Tools", price: 500, deposit: 3000, city: "Lalitpur", loc: "Patan", img: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800" },
  { title: "Stihl Gas Powered Chainsaw", category: "Power Tools", price: 1200, deposit: 8000, city: "Bhaktapur", loc: "Suryabinayak", img: "https://images.unsplash.com/photo-1590725121839-892b458a74fe?w=800" },
  { title: "Aluminium Extension Ladder 16ft", category: "Ladders", price: 400, deposit: 2000, city: "Kathmandu", loc: "Baneshwor", img: "https://images.unsplash.com/photo-1595846519845-68b298c2edd8?w=800" },
  { title: "Dewalt 10-Inch Mitre Saw", category: "Power Tools", price: 1000, deposit: 7000, city: "Lalitpur", loc: "Kupondole", img: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800" },
  { title: "Gas Heavy Duty Lawn Mower", category: "Power Tools", price: 850, deposit: 5000, city: "Kathmandu", loc: "Budhanilkantha", img: "https://images.unsplash.com/photo-1592417817098-8f3d6eb17985?w=800" },
  { title: "Honda 3kVA Silent Generator", category: "Generators", price: 2200, deposit: 15000, city: "Kathmandu", loc: "New Road", img: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800" },
  { title: "Makita Angle Grinder 5 Inch", category: "Hand Tools", price: 350, deposit: 1500, city: "Bhaktapur", loc: "Durbar Square", img: "https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?w=800" },
  { title: "Portable Concrete Mixer", category: "Power Tools", price: 1800, deposit: 10000, city: "Kathmandu", loc: "Kalanki", img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800" },
  { title: "Wet & Dry Industrial Vacuum", category: "Power Tools", price: 800, deposit: 4000, city: "Lalitpur", loc: "Jhamsikhel", img: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800" },
  { title: "Demolition Jackhammer 15kg", category: "Power Tools", price: 1500, deposit: 10000, city: "Kathmandu", loc: "Baneshwor", img: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800" },
  { title: "Paint Sprayer Zoom System", category: "Power Tools", price: 700, deposit: 3500, city: "Kathmandu", loc: "Boudha", img: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800" },
  { title: "Bosch Rotary Hammer Drill", category: "Power Tools", price: 600, deposit: 3000, city: "Lalitpur", loc: "Patan", img: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800" },
  { title: "3-Ton Floor Hydraulic Jack", category: "Hand Tools", price: 450, deposit: 2500, city: "Bhaktapur", loc: "Suryabinayak", img: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800" },
  { title: "Stihl Grass Trimmer Brushcutter", category: "Power Tools", price: 750, deposit: 4000, city: "Kathmandu", loc: "Budhanilkantha", img: "https://images.unsplash.com/photo-1592417817098-8f3d6eb17985?w=800" },
  { title: "Manual Tile Cutter Machine", category: "Hand Tools", price: 400, deposit: 2000, city: "Lalitpur", loc: "Kupondole", img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800" },

  // Fashion
  { title: "Men's Formal Suit (Tailored M)", category: "Formal Wear", price: 800, deposit: 3000, city: "Kathmandu", loc: "New Road", img: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800" },
  { title: "Traditional Bridal Lehenga Set", category: "Traditional Wear", price: 3000, deposit: 12000, city: "Bhaktapur", loc: "Durbar Square", img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800" },
  { title: "Men's Black Tuxedo (Size L)", category: "Formal Wear", price: 1200, deposit: 4000, city: "Lalitpur", loc: "Jhamsikhel", img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800" },
  { title: "Designer Silk Saree + Blouse", category: "Traditional Wear", price: 1800, deposit: 6000, city: "Kathmandu", loc: "Baneshwor", img: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800" },
  { title: "Authentic Newari Cultural Outfit", category: "Traditional Wear", price: 1000, deposit: 3000, city: "Bhaktapur", loc: "Durbar Square", img: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800" },
  { title: "Gurung Cultural Dress Set", category: "Traditional Wear", price: 1000, deposit: 3000, city: "Pokhara", loc: "Chipledhunga", img: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800" },
  { title: "Sherpa Goose Down Parka", category: "Costumes", price: 500, deposit: 3000, city: "Kathmandu", loc: "Thamel", img: "https://images.unsplash.com/photo-1544441893-675973e31985?w=800" },
  { title: "Men's Biker Leather Jacket", category: "Costumes", price: 600, deposit: 3000, city: "Kathmandu", loc: "Boudha", img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800" },
  { title: "Royal Sherwani Outfit for Groom", category: "Traditional Wear", price: 2500, deposit: 10000, city: "Lalitpur", loc: "Patan", img: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800" },
  { title: "Designer Red Evening Gown", category: "Formal Wear", price: 1500, deposit: 5000, city: "Kathmandu", loc: "New Road", img: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800" },
  { title: "Heavy Silver Bridal Jewelry Set", category: "Traditional Wear", price: 1200, deposit: 6000, city: "Kathmandu", loc: "Baneshwor", img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800" },

  // Home & Appliances
  { title: "Stand Mixer + Baking Set", category: "Kitchen Appliances", price: 400, deposit: 2000, city: "Lalitpur", loc: "Jhamsikhel", img: "https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?w=800" },
  { title: "Portable AC Unit 1.5 Ton", category: "Home Electronics", price: 1200, deposit: 8000, city: "Kathmandu", loc: "Baneshwor", img: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800" },
  { title: "Dyson V11 Cordless Vacuum", category: "Home Electronics", price: 1000, deposit: 7000, city: "Lalitpur", loc: "Kupondole", img: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800" },
  { title: "Delonghi Espresso Machine", category: "Kitchen Appliances", price: 800, deposit: 5000, city: "Kathmandu", loc: "Thamel", img: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800" },
  { title: "Automatic Robot Vacuum Cleaner", category: "Home Electronics", price: 600, deposit: 4000, city: "Kathmandu", loc: "New Road", img: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=800" },
  { title: "13-Fin Oil Filled Heater", category: "Home Electronics", price: 400, deposit: 2000, city: "Kathmandu", loc: "Boudha", img: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800" },
  { title: "Philips Air Fryer XXL", category: "Kitchen Appliances", price: 350, deposit: 2000, city: "Bhaktapur", loc: "Suryabinayak", img: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=800" },
  { title: "Countertop Portable Dishwasher", category: "Kitchen Appliances", price: 700, deposit: 4000, city: "Lalitpur", loc: "Patan", img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800" },
  { title: "Foldable Guest Bed + Mattress", category: "Furniture", price: 300, deposit: 1500, city: "Kathmandu", loc: "Kalanki", img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800" },
  { title: "Garment Steamer Machine", category: "Home Electronics", price: 300, deposit: 1500, city: "Kathmandu", loc: "New Road", img: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800" },
];

const items = [];
for (let i = 0; i < listingSeeds.length; i++) {
  const seed = listingSeeds[i];
  const owner = owners[i % owners.length];
  const category = categoriesById[seed.category];
  
  if (!category) {
    console.error(`[error] Category missing for "${seed.category}"`);
    continue;
  }

  const title = seed.title;
  const item = await Item.create({
    owner: owner._id,
    category: category._id,
    title,
    slug: slugify(title, { lower: true, strict: true }) + "-" + (i + 1),
    description: `${title} in excellent working condition. Fully maintained, inspected, and ready for rental. Pickup available from ${seed.loc}, ${seed.city}. Please handle with care.`,
    condition: CONDITIONS[i % CONDITIONS.length],
    pricePerDay: seed.price,
    securityDeposit: seed.deposit,
    images: [{ url: seed.img, publicId: "" }],
    location: seed.loc,
    city: seed.city,
    rules: ["Handle with care", "Return on agreed time", "Keep away from water/fire damage"],
    status: "PUBLISHED",
    ratingAverage: Math.round((4.0 + Math.random() * 1.0) * 10) / 10,
    ratingCount: Math.floor(Math.random() * 45) + 1,
    favoriteCount: Math.floor(Math.random() * 25),
    viewCount: Math.floor(Math.random() * 400) + 10,
  });
  items.push(item);
}

console.log("[seed] Creating demo booking (completed, with review)...");
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
  comment: "Exactly as described, smooth pickup and return. Highly recommended!",
});

console.log("\n[seed] Done!\n");
console.log("Demo accounts (password for all: " + DEMO_PASSWORD + "):");
console.log("  Admin:  admin@rentit.demo");
console.log("  Owner:  owner@rentit.demo");
console.log("  Renter: renter@rentit.demo");
console.log(`\nSeeded ${owners.length + 2} users, ${items.length} listings, 1 completed booking + review.\n`);

await mongoose.connection.close();
process.exit(0);