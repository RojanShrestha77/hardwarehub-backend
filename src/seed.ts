import { db } from "./database";
import { products } from "./models/product.model";
import { categories } from "./models/category.model";
import { users } from "./models/user.model";
import { eq } from "drizzle-orm";
import bcryptjs from "bcryptjs";

const categoryData = [
    {
        name: "Power Tools",
        slug: "power-tools",
        description: "Electric and battery-powered tools including drills, angle grinders, jigsaws, and circular saws for heavy-duty work.",
        icon: "⚡",
    },
    {
        name: "Hand Tools",
        slug: "hand-tools",
        description: "Essential manual tools — hammers, screwdrivers, pliers, wrenches, and spanners for everyday tasks.",
        icon: "🔨",
    },
    {
        name: "Measuring Tools",
        slug: "measuring-tools",
        description: "Spirit levels, tape measures, try squares, laser levels, and calipers for accurate measurements.",
        icon: "📏",
    },
    {
        name: "Cutting Tools",
        slug: "cutting-tools",
        description: "Utility knives, chisels, hacksaws, bolt cutters, and wire cutters for precise cutting jobs.",
        icon: "✂️",
    },
    {
        name: "Fastening Tools",
        slug: "fastening-tools",
        description: "Nail guns, staple guns, rivet guns, and impact drivers for quick and secure fastening.",
        icon: "🔩",
    },
    {
        name: "Electrical Tools",
        slug: "electrical-tools",
        description: "Multimeters, wire strippers, soldering irons, voltage testers, and cable management tools.",
        icon: "🔌",
    },
    {
        name: "Plumbing Tools",
        slug: "plumbing-tools",
        description: "Pipe wrenches, pipe cutters, basin wrenches, drain snakes, and plungers for all plumbing needs.",
        icon: "🪠",
    },
    {
        name: "Safety Equipment",
        slug: "safety-equipment",
        description: "Hard hats, safety goggles, work gloves, ear defenders, dust masks, and hi-vis vests.",
        icon: "🦺",
    },
    {
        name: "Woodworking Tools",
        slug: "woodworking-tools",
        description: "Wood chisels, hand planes, wood routers, orbital sanders, and carving tools for woodwork projects.",
        icon: "🪵",
    },
    {
        name: "Automotive Tools",
        slug: "automotive-tools",
        description: "Socket sets, torque wrenches, car jacks, OBD scanners, and tyre inflators for vehicle maintenance.",
        icon: "🔧",
    },
];

const productData = [
  // ── Power Tools ─────────────────────────────────────────────────────────────
  {
    name: "Bosch GSB 18V-85C Cordless Combi Drill",
    description: "Professional 18V brushless combi drill with 3-speed gearbox and 85 Nm torque. Ideal for drilling into masonry, wood, and metal on site.",
    price: 18500,
    originalPrice: 22000,
    category: "Power Tools",
    brand: "Bosch",
    stock: 25,
    badge: "Best Seller",
    imageUrl: null,
    specs: { Voltage: "18V", Torque: "85 Nm", Chuck: "13mm Keyless", Speed: "0–550 / 0–2,100 RPM", Motor: "Brushless", Weight: "1.9 kg" },
  },
  {
    name: "DeWalt DCS570 54V XR Circular Saw",
    description: "54V FLEXVOLT circular saw with 190mm blade. Cuts through 2×4 timbers in a single smooth pass with minimal kickback.",
    price: 32000,
    originalPrice: 37500,
    category: "Power Tools",
    brand: "DeWalt",
    stock: 14,
    badge: "Top Rated",
    imageUrl: null,
    specs: { Voltage: "54V FLEXVOLT", "Blade Diameter": "190mm", "Cutting Depth": "64mm @ 90°", "No-Load Speed": "5,800 RPM", Bevel: "0–56°", Weight: "3.4 kg" },
  },
  {
    name: "Makita GA5034 1250W Angle Grinder",
    description: "125mm professional angle grinder with electronic speed control and soft-start for precise material removal and cutting.",
    price: 9800,
    originalPrice: null,
    category: "Power Tools",
    brand: "Makita",
    stock: 30,
    badge: null,
    imageUrl: null,
    specs: { "Input Power": "1,250W", "Disc Diameter": "125mm", "No-Load Speed": "11,000 RPM", Spindle: "M14", Weight: "1.9 kg", Protection: "IPX4" },
  },
  // ── Hand Tools ───────────────────────────────────────────────────────────────
  {
    name: "Stanley FatMax 22oz Fiberglass Claw Hammer",
    description: "Anti-vibe technology absorbs 10× more vibration than wooden handles. Magnetic nail starter groove for single-handed nailing.",
    price: 3200,
    originalPrice: 3800,
    category: "Hand Tools",
    brand: "Stanley",
    stock: 60,
    badge: "Deal",
    imageUrl: null,
    specs: { Weight: "22 oz (624g)", Handle: "Fiberglass Anti-Vibe", Face: "Milled Strike Face", Claw: "Rip Claw", Length: "370mm", Grip: "Bi-Material" },
  },
  {
    name: "Gedore 8 Piece Combination Spanner Set",
    description: "Drop-forged chrome-vanadium steel spanners. Sizes 8–19mm. Individually stamped with size for quick identification.",
    price: 5500,
    originalPrice: 6500,
    category: "Hand Tools",
    brand: "Gedore",
    stock: 40,
    badge: null,
    imageUrl: null,
    specs: { Pieces: "8", Sizes: "8, 10, 12, 13, 14, 17, 19mm", Material: "Chrome-Vanadium Steel", Finish: "Mirror Polish", Standard: "DIN 3113", Head: "12-Point Bi-Hex" },
  },
  // ── Measuring Tools ──────────────────────────────────────────────────────────
  {
    name: "Bosch GLM 50-27 CG Laser Distance Measurer",
    description: "50m range laser with Bluetooth connectivity and full-colour display. Measures area, volume, and indirect distance with one press.",
    price: 12500,
    originalPrice: 15000,
    category: "Measuring Tools",
    brand: "Bosch",
    stock: 20,
    badge: "Best Seller",
    imageUrl: null,
    specs: { Range: "0.05–50m", Accuracy: "±1.5mm", Display: "Full Colour 360°", Connectivity: "Bluetooth", Battery: "1× Li-Ion", IP: "IP54" },
  },
  {
    name: "Stanley 8m PowerLock Tape Measure",
    description: "8m × 25mm blade with Mylar coating for 10× longer life. Stand-out reach of 3m for single-person measuring.",
    price: 1800,
    originalPrice: null,
    category: "Measuring Tools",
    brand: "Stanley",
    stock: 80,
    badge: null,
    imageUrl: null,
    specs: { Length: "8m", Width: "25mm", "Stand-Out": "3m", Blade: "Mylar Coated", Hook: "True Zero", Case: "Impact Resistant ABS" },
  },
  // ── Cutting Tools ────────────────────────────────────────────────────────────
  {
    name: "Stanley FatMax 25mm Retractable Utility Knife",
    description: "25mm wide heavy-duty blade with auto-lock blade change system. Blade storage in handle holds 3 spare blades.",
    price: 1400,
    originalPrice: 1700,
    category: "Cutting Tools",
    brand: "Stanley",
    stock: 100,
    badge: "Deal",
    imageUrl: null,
    specs: { "Blade Width": "25mm", Lock: "Auto-Lock", Storage: "3 Spare Blades", Handle: "Bi-Material Rubber", "Blade Type": "SK5 Carbon Steel", Length: "185mm" },
  },
  {
    name: "Bahco 300mm Hacksaw with 3 Blades",
    description: "Professional hacksaw with 300mm frame and three 18 TPI bi-metal blades. Cuts through steel pipe, rebar, and profiles cleanly.",
    price: 2800,
    originalPrice: 3300,
    category: "Cutting Tools",
    brand: "Bahco",
    stock: 35,
    badge: null,
    imageUrl: null,
    specs: { "Frame Size": "300mm", TPI: "18 (included blades)", Blade: "Bi-Metal", Tension: "Tool-Free Adjust", Grip: "Ergonomic Bi-Material", Includes: "3× Blades" },
  },
  // ── Fastening Tools ──────────────────────────────────────────────────────────
  {
    name: "Makita DFR550Z 18V Auto-Feed Screwdriver",
    description: "Drive 6mm drywall screws continuously without reloading. 4,500 RPM speed and adjustable depth stop for flush finishing.",
    price: 21000,
    originalPrice: 25500,
    category: "Fastening Tools",
    brand: "Makita",
    stock: 12,
    badge: null,
    imageUrl: null,
    specs: { Voltage: "18V", Speed: "0–4,500 RPM", "Screw Size": "3.5–6mm × up to 65mm", Depth: "Adjustable Stop", Feed: "Auto-Feed Magazine", Weight: "2.1 kg" },
  },
  {
    name: "Stanley TR250 Heavy Duty Staple Gun",
    description: "All-steel staple gun for upholstery, insulation, and carpeting. Drives 6, 8, 10, 12, and 14mm staples with one-touch jam release.",
    price: 2200,
    originalPrice: null,
    category: "Fastening Tools",
    brand: "Stanley",
    stock: 45,
    badge: null,
    imageUrl: null,
    specs: { Staples: "6–14mm T50", Action: "One-Strike", "Jam Clear": "One-Touch", Body: "All-Steel", Capacity: "105 Staples", Weight: "0.6 kg" },
  },
  // ── Electrical Tools ─────────────────────────────────────────────────────────
  {
    name: "Fluke 117 True RMS Digital Multimeter",
    description: "Electrician's multimeter with VoltAlert non-contact voltage detection and AutoVolt automatic AC/DC selection.",
    price: 28000,
    originalPrice: 33000,
    category: "Electrical Tools",
    brand: "Fluke",
    stock: 18,
    badge: "Top Rated",
    imageUrl: null,
    specs: { "AC Voltage": "600V", "DC Voltage": "600V", Current: "10A AC/DC", Resistance: "40 MΩ", "CAT III": "600V", Display: "6,000 Count Backlit" },
  },
  {
    name: "Klein Tools 11061 Wire Stripper & Cutter",
    description: "Strips 10–18 AWG solid and 12–20 AWG stranded wire. Precision-ground stripping holes and side-cutters for a clean finish.",
    price: 3500,
    originalPrice: 4200,
    category: "Electrical Tools",
    brand: "Klein Tools",
    stock: 50,
    badge: "Deal",
    imageUrl: null,
    specs: { "Solid Wire": "10–18 AWG", "Stranded Wire": "12–20 AWG", Cutter: "Side-Cutter Integrated", Handle: "Cushion-Grip", Length: "190mm", Weight: "145g" },
  },
  // ── Plumbing Tools ───────────────────────────────────────────────────────────
  {
    name: "Irwin Record 450mm Pipe Wrench",
    description: "Heavy-duty drop-forged wrench for 50mm diameter pipe. Malleable iron jaw withstands 2× rated load for demanding plumbing jobs.",
    price: 4200,
    originalPrice: 4900,
    category: "Plumbing Tools",
    brand: "Irwin",
    stock: 28,
    badge: null,
    imageUrl: null,
    specs: { Length: "450mm", "Pipe Capacity": "Up to 50mm", Jaw: "Malleable Iron", Body: "Drop-Forged Steel", Adjustment: "Quick-Release Nut", Weight: "1.2 kg" },
  },
  {
    name: "Ridgid K-45 Handheld Drain Cleaning Machine",
    description: "Clears 40–100mm drains up to 15m. Forward/reverse cable rotation with inner drum keeps hands clean.",
    price: 38000,
    originalPrice: 45000,
    category: "Plumbing Tools",
    brand: "Ridgid",
    stock: 8,
    badge: "Best Seller",
    imageUrl: null,
    specs: { "Drain Size": "40–100mm", "Cable Length": "15m", Motor: "370W", Rotation: "Fwd/Rev", "Cable Dia": "16mm", Weight: "16 kg" },
  },
  // ── Safety Equipment ─────────────────────────────────────────────────────────
  {
    name: "3M SecureFit SF201 Safety Glasses",
    description: "Pressure-diffusion temple technology self-adjusts for a secure fit. Scratch-resistant clear lens with 99.9% UV protection.",
    price: 1200,
    originalPrice: 1500,
    category: "Safety Equipment",
    brand: "3M",
    stock: 150,
    badge: "Deal",
    imageUrl: null,
    specs: { Lens: "Clear Anti-Scratch", UV: "99.9% Protection", Standard: "ANSI Z87.1 / EN166", Frame: "Polycarbonate", Fit: "Pressure-Diffusion Temple", Weight: "28g" },
  },
  {
    name: "Milwaukee BOLT Hard Hat with Headlamp",
    description: "Class E vented hard hat with integrated BOLT headlamp providing 500 lumens. USB-C rechargeable, auto-off sensor, 5-year warranty.",
    price: 8500,
    originalPrice: 10500,
    category: "Safety Equipment",
    brand: "Milwaukee",
    stock: 22,
    badge: null,
    imageUrl: null,
    specs: { Class: "Class E (Electrical)", Lumens: "500 (Headlamp)", Runtime: "Up to 5h", Charge: "USB-C", Standard: "ANSI/ISEA Z89.1", Weight: "420g" },
  },
  // ── Woodworking Tools ────────────────────────────────────────────────────────
  {
    name: "Festool RO 90 DX FEQ Rotex Sander",
    description: "Compact Rotex sander with rotary and random-orbit modes. Ideal for fine sanding, coarse material removal, and polishing on wood.",
    price: 42000,
    originalPrice: 48500,
    category: "Woodworking Tools",
    brand: "Festool",
    stock: 10,
    badge: "Top Rated",
    imageUrl: null,
    specs: { "Pad Size": "90mm", Power: "400W", Speed: "4,800–10,500 RPM", Orbit: "2.5mm (RO) / 5mm (DF)", Mode: "Rotex + Random-Orbit", Weight: "1.1 kg" },
  },
  {
    name: "Bahco 250mm Hardpoint Tenon Saw",
    description: "22 TPI hardpoint tenon saw for fine joinery and dovetail cuts. Stiffened spine keeps blade perfectly straight through the cut.",
    price: 2600,
    originalPrice: null,
    category: "Woodworking Tools",
    brand: "Bahco",
    stock: 40,
    badge: null,
    imageUrl: null,
    specs: { Length: "250mm", TPI: "22", "Blade Depth": "80mm", Spine: "Brass Back", Tooth: "Hardpoint Impulse Hardened", Handle: "Ergonomic Beech" },
  },
  // ── Automotive Tools ─────────────────────────────────────────────────────────
  {
    name: "Draper 46 Piece 3/8\" Drive Socket Set",
    description: "Metric and AF sockets with 72-tooth ratchet handle. Chrome-vanadium steel with chrome-plated finish. Blow-mould storage case included.",
    price: 7800,
    originalPrice: 9200,
    category: "Automotive Tools",
    brand: "Draper",
    stock: 30,
    badge: "Deal",
    imageUrl: null,
    specs: { Pieces: "46", Drive: "3/8\"", Sockets: "10–32mm Metric", Ratchet: "72-Tooth Quick-Release", Material: "Chrome-Vanadium", Case: "Blow-Mould Tray" },
  },
  {
    name: "Silverline 2-Tonne Hydraulic Trolley Jack",
    description: "Low-profile hydraulic trolley jack for vehicles with 85mm minimum clearance. Double-pump fast-rise for quick positioning under the vehicle.",
    price: 14500,
    originalPrice: 17000,
    category: "Automotive Tools",
    brand: "Silverline",
    stock: 15,
    badge: null,
    imageUrl: null,
    specs: { Capacity: "2 Tonne", "Min Height": "85mm", "Max Height": "380mm", Pump: "Double-Pump Fast-Rise", Frame: "Steel", Weight: "12 kg" },
  },
  // ── Top Trade Deals (added last → appear first) ─────────────────────────────
  {
    name: "Milwaukee M18 FUEL 1/2\" Hammer Drill",
    description: "Brushless hammer drill delivering 1,400 in-lbs of torque. Three-mode D-handle design for masonry, wood, and steel drilling. RedLithium battery compatible.",
    price: 28500,
    originalPrice: 35000,
    category: "Power Tools",
    brand: "Milwaukee",
    stock: 20,
    badge: "Deal",
    imageUrl: null,
    specs: { Voltage: "M18", Torque: "1,400 in-lbs", "No Load Speed": "0–550 / 0–2,000 RPM", "Hammer Rate": "0–32,000 BPM", Chuck: "1/2\" All-Metal Ratcheting", Weight: "2.3 kg (tool only)" },
  },
  {
    name: "DeWalt DW756 6\" Bench Grinder",
    description: "Industrial bench grinder with 6-inch wheels and 5-amp motor. Cast-iron base reduces vibration for precision sharpening of chisels, drill bits, and blades.",
    price: 15500,
    originalPrice: 19000,
    category: "Power Tools",
    brand: "DeWalt",
    stock: 12,
    badge: "Top Rated",
    imageUrl: null,
    specs: { "Wheel Size": "6\" x 3/4\"", Motor: "5A Induction", Speed: "3,450 RPM", Base: "Cast-Iron", "Wheel Guards": "Adjustable", Weight: "18 kg" },
  },
  {
    name: "Stanley 94-248 8-Piece Screwdriver Set",
    description: "Cabinet-tip screwdriver set with tri-lobe ergonomic handles and magnetic tips. Heat-treated chrome-vanadium shafts for long life.",
    price: 2200,
    originalPrice: 2800,
    category: "Hand Tools",
    brand: "Stanley",
    stock: 80,
    badge: "Best Seller",
    imageUrl: null,
    specs: { Pieces: "8", "Tip Types": "Slotted + Phillips", Handle: "Tri-Lobe Ergonomic", Shaft: "Chrome-Vanadium", Tip: "Magnetic", Weight: "0.5 kg" },
  },
  {
    name: "Bosch UniversalLevel 2 Laser Level",
    description: "Self-levelling cross-line laser with 10m range. Pendulum system locks during transport for durability. Includes magnetic bracket for quick mounting.",
    price: 6500,
    originalPrice: 8500,
    category: "Measuring Tools",
    brand: "Bosch",
    stock: 35,
    badge: null,
    imageUrl: null,
    specs: { Range: "10m", Accuracy: "±0.5 mm/m", Levelling: "Self-Levelling Pendulum", Laser: "Red, Class 2", "Line Angle": "120°", "Battery Life": "10h" },
  },
] as const;

async function seed() {
  console.log("🌱 Seeding database...");

  // 1. Seed categories
  await db.delete(categories);
  const insertedCategories = await db.insert(categories).values(categoryData).returning();
  console.log(`  ✓ Seeded ${insertedCategories.length} categories`);
  insertedCategories.forEach((c) => console.log(`    • ${c.icon} ${c.name}`));

  // 2. Create a seed seller user
  await db.delete(products);
  console.log("  ✓ Cleared existing products");

  const hashedPassword = await bcryptjs.hash("seller123", 10);
  const [existingSeller] = await db
    .select()
    .from(users)
    .where(eq(users.email, "seller@hardwarehub.np"));

  let seller = existingSeller;

  if (!seller) {
    const [created] = await db
      .insert(users)
      .values({
        name:       "HardwareHub Store",
        email:      "seller@hardwarehub.np",
        password:   hashedPassword,
        role:       "seller",
        isApproved: true,
      })
      .returning();
    seller = created;
  } else {
    console.log(`  ✓ Using existing seller: ${seller.email}`);
  }

  // Guard against undefined seller
  if (!seller) {
    throw new Error("Failed to create or find seller user");
  }

  // 2. Insert products with sellerId injected into each
  const inserted = await db
    .insert(products)
    .values(productData.map((p) => ({ 
      ...p, 
      sellerId: seller.id,
      description: p.description || undefined,
      originalPrice: p.originalPrice || undefined,
      badge: p.badge || undefined,
      imageUrl: p.imageUrl || undefined,
    })))
    .returning();

  console.log(`  ✓ Inserted ${inserted.length} products`);
  console.log("\n  Products seeded:");
  inserted.forEach((p) => console.log(`    • [${p.id}] ${p.name} — Rs.${p.price}`));

  console.log("\n✅ Seed complete!");
  console.log(`   Seller email:    seller@hardwarehub.np`);
  console.log(`   Seller password: seller123`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
