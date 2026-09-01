export const MOCK_ITEMS = [
  // ELECTRONICS
  {
    _id: "1",
    title: "Sony Alpha A7 III Full-Frame Camera + 24-70mm f/2.8 GM Lens",
    category: "Electronics",
    city: "Kathmandu",
    pricePerDay: 1500,
    condition: "LIKE_NEW",
    rating: 4.9,
    reviewsCount: 28,
    stock: 2,
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=1000&q=80"
    ],
    owner: { name: "Aarav Shrestha", verified: true, rating: 4.95, responseTime: "within 1 hour" },
    specs: { Brand: "Sony", Model: "A7 III", Sensor: "24.2 MP Full-Frame", Video: "4K HDR" },
    description: "Professional mirrorless setup suitable for weddings, events, and cinematic video shoots. Package includes camera body, 24-70mm lens, 2 extra batteries, 64GB SD card, and a carrying bag."
  },
  {
    _id: "2",
    title: "DJI Mini 3 Pro Drone with Fly More Combo",
    category: "Electronics",
    city: "Lalitpur",
    pricePerDay: 2500,
    condition: "NEW",
    rating: 5.0,
    reviewsCount: 14,
    stock: 1,
    images: [
      "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1000&q=80"
    ],
    owner: { name: "Sujan Karki", verified: true, rating: 4.88, responseTime: "within 30 mins" },
    specs: { Weight: "< 249g", Resolution: "4K/60fps", FlightTime: "34 mins per battery" },
    description: "Ultralight foldable drone with 4K video recording, tri-directional obstacle sensing, and 3 high-capacity batteries."
  },

  // EVENTS & PARTY
  {
    _id: "3",
    title: "JBL PartyBox 310 Portable Wireless Party Speaker",
    category: "Events & Party",
    city: "Kathmandu",
    pricePerDay: 1000,
    condition: "NEW",
    rating: 4.8,
    reviewsCount: 35,
    stock: 3,
    images: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1000&q=80"
    ],
    owner: { name: "Rohan Tuladhar", verified: true, rating: 4.9, responseTime: "instant" },
    specs: { Output: "240W RMS", Battery: "18 Hours", Connectivity: "Bluetooth / Aux / Mic-Guitar Input" },
    description: "Huge JBL Pro sound with dynamic light show synced to the beat. Great for outdoor gatherings, birthdays, and indoor events."
  },

  // FASHION
  {
    _id: "4",
    title: "Traditional Designer Bridal Lehengas & Jewelry Set",
    category: "Fashion",
    city: "Bhaktapur",
    pricePerDay: 3000,
    condition: "LIKE_NEW",
    rating: 4.9,
    reviewsCount: 19,
    stock: 1,
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1000&q=80"
    ],
    owner: { name: "Prashna Maharjan", verified: true, rating: 5.0, responseTime: "within 2 hours" },
    specs: { Size: "Medium (Adjustable)", Fabric: "Velvet with Zardozi Work", Includes: "Lehenga, Dupatta, Jewelry" },
    description: "Premium heavy velvet bridal outfit rental. Dry-cleaned and ready for wedding photoshoots and receptions."
  },

  // HOME & APPLIANCES
  {
    _id: "5",
    title: "Kärcher K3 High Pressure Washer Cleaner",
    category: "Home & Appliances",
    city: "Kathmandu",
    pricePerDay: 700,
    condition: "GOOD",
    rating: 4.7,
    reviewsCount: 9,
    stock: 2,
    images: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1000&q=80"
    ],
    owner: { name: "Binod Gurung", verified: false, rating: 4.6, responseTime: "within 3 hours" },
    specs: { Pressure: "120 Bar", Power: "1600W", CableLength: "6 Meters" },
    description: "Powerful pressure washer designed for washing cars, driveways, patios, and house exteriors effortlessly."
  },

  // SPORTS & OUTDOORS
  {
    _id: "6",
    title: "Waterproof 4-Person Waterproof Camping Tent + Sleeping Bags",
    category: "Sports & Outdoors",
    city: "Pokhara",
    pricePerDay: 800,
    condition: "LIKE_NEW",
    rating: 4.85,
    reviewsCount: 42,
    stock: 4,
    images: [
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1478827536114-da961b7f86d2?auto=format&fit=crop&w=1000&q=80"
    ],
    owner: { name: "Himalayan Gear Rentals", verified: true, rating: 4.98, responseTime: "instant" },
    specs: { Capacity: "4 Persons", WaterResistance: "3000mm", Weight: "4.2 kg" },
    description: "Double-layer windproof tent package. Includes 2 thermal sleeping bags and 1 inflatable sleeping pad for trekking trips."
  },

  // TOOLS & EQUIPMENT
  {
    _id: "7",
    title: "Bosch Professional Cordless Hammer Drill Kit",
    category: "Tools & Equipment",
    city: "Pokhara",
    pricePerDay: 500,
    condition: "GOOD",
    rating: 4.8,
    reviewsCount: 17,
    stock: 3,
    images: [
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=1000&q=80"
    ],
    owner: { name: "Prakash Thapa", verified: true, rating: 4.75, responseTime: "within 1 hour" },
    specs: { Voltage: "18V", Torque: "50 Nm", BatteryCount: "2 x 2.0Ah Li-Ion" },
    description: "Heavy-duty cordless hammer drill for masonry, wood, and metal drilling. Supplied in a hard carry case with masonry bits."
  },

  // VEHICLES
  {
    _id: "8",
    title: "Royal Enfield Classic 350 Dual-Channel ABS",
    category: "Vehicles",
    city: "Pokhara",
    pricePerDay: 2200,
    condition: "LIKE_NEW",
    rating: 4.95,
    reviewsCount: 56,
    stock: 2,
    images: [
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1000&q=80"
    ],
    owner: { name: "Pokhara Bike Tours", verified: true, rating: 4.92, responseTime: "instant" },
    specs: { Engine: "349cc", FuelType: "Petrol", Transmission: "5-Speed Manual" },
    description: "Iconic touring motorcycle fully serviced with luggage racks, smartphone holder, and two helmets included."
  }
];