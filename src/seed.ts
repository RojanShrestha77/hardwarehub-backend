import { db } from "./database";
import { products } from "./models/product.model";
import { users } from "./models/user.model";
import { eq } from "drizzle-orm";
import bcryptjs from "bcryptjs";

const productData = [
  {
    name: "NVIDIA GeForce RTX 4070 Super 12GB",
    description: "Experience next-gen gaming with DLSS 3, ray tracing, and Ada Lovelace architecture. The RTX 4070 Super delivers up to 2× the performance of the RTX 3070.",
    price: 74999,
    originalPrice: 84999,
    category: "GPU",
    brand: "NVIDIA",
    stock: 15,
    badge: "Best Seller",
    imageUrl: null,
    specs: { VRAM: "12GB GDDR6X", "Core Clock": "1980 MHz", "Boost Clock": "2505 MHz", "Memory Bus": "192-bit", TDP: "220W", Interface: "PCIe 4.0 x16" },
  },
  {
    name: "AMD Ryzen 9 7950X 16-Core Processor",
    description: "The ultimate desktop processor with 16 cores and 32 threads. Dominate multitasking, content creation, and gaming with 5nm Zen 4 architecture.",
    price: 89999,
    originalPrice: 104999,
    category: "CPU",
    brand: "AMD",
    stock: 8,
    badge: "Top Rated",
    imageUrl: null,
    specs: { Cores: "16C / 32T", "Base Clock": "4.5 GHz", "Boost Clock": "5.7 GHz", Cache: "64MB L3", TDP: "170W", Socket: "AM5" },
  },
  {
    name: "Corsair Vengeance DDR5 32GB 6000MHz",
    description: "High-performance DDR5 memory with XMP 3.0 support. Exceptional bandwidth for gaming, streaming, and professional workloads.",
    price: 18999,
    originalPrice: 22999,
    category: "RAM",
    brand: "Corsair",
    stock: 30,
    badge: "Deal",
    imageUrl: null,
    specs: { Capacity: "2×16GB", Speed: "DDR5-6000", Latency: "CL36", Voltage: "1.35V", Type: "DIMM", Profile: "XMP 3.0" },
  },
  {
    name: "Samsung 990 Pro 2TB NVMe SSD",
    description: "PCIe 4.0 NVMe SSD with read speeds up to 7450 MB/s. Optimized for gaming with low latency and consistent performance.",
    price: 22999,
    originalPrice: 27999,
    category: "Storage",
    brand: "Samsung",
    stock: 20,
    badge: null,
    imageUrl: null,
    specs: { Capacity: "2TB", Interface: "PCIe 4.0 NVMe M.2", "Read Speed": "7450 MB/s", "Write Speed": "6900 MB/s", NAND: "Samsung V-NAND TLC", Warranty: "5 years" },
  },
  {
    name: "ASUS ROG Strix X670E-E Gaming",
    description: "AMD AM5 flagship motherboard with PCIe 5.0, WiFi 6E, and robust power delivery for Ryzen 7000 series processors.",
    price: 64999,
    originalPrice: 72999,
    category: "Motherboard",
    brand: "ASUS",
    stock: 10,
    badge: null,
    imageUrl: null,
    specs: { Socket: "AM5", Chipset: "X670E", "Memory Slots": "4×DDR5", "Max Memory": "128GB", "PCIe Slots": "PCIe 5.0 x16", Connectivity: "WiFi 6E, BT 5.3" },
  },
  {
    name: "Corsair RM1000x 1000W 80+ Gold",
    description: "Fully modular 80 PLUS Gold certified PSU with Zero RPM fan mode for silent operation at low-to-medium loads.",
    price: 19999,
    originalPrice: 24999,
    category: "PSU",
    brand: "Corsair",
    stock: 12,
    badge: "Best Seller",
    imageUrl: null,
    specs: { Wattage: "1000W", Efficiency: "80+ Gold", Modular: "Fully Modular", Fan: "135mm Zero RPM", Rails: "Single +12V", Warranty: "10 years" },
  },
  {
    name: "Noctua NH-D15 CPU Cooler",
    description: "The benchmark of air cooling. Dual 140mm fans, six heat pipes, and near-silent operation for premium builds.",
    price: 12999,
    originalPrice: null,
    category: "Cooling",
    brand: "Noctua",
    stock: 18,
    badge: "Top Rated",
    imageUrl: null,
    specs: { Type: "Dual-Tower Air", Fans: "2× NF-A15 140mm", "Max TDP": "250W+", Height: "165mm", Socket: "Intel/AMD Universal", Noise: "≤24.6 dB(A)" },
  },
  {
    name: "AMD Radeon RX 7800 XT 16GB",
    description: "Exceptional 1440p gaming performance with 16GB GDDR6 and RDNA 3 architecture. FSR 3 support for smoother framerates.",
    price: 59999,
    originalPrice: 67999,
    category: "GPU",
    brand: "AMD",
    stock: 0,
    badge: null,
    imageUrl: null,
    specs: { VRAM: "16GB GDDR6", "Core Clock": "1295 MHz", "Boost Clock": "2430 MHz", "Memory Bus": "256-bit", TDP: "263W", Interface: "PCIe 4.0 x16" },
  },
  {
    name: "Intel Core i9-13900K",
    description: "Intel's top-tier desktop processor with 24 cores (8P + 16E) and boost speeds up to 5.8 GHz. Exceptional gaming and productivity performance.",
    price: 79999,
    originalPrice: 89999,
    category: "CPU",
    brand: "Intel",
    stock: 6,
    badge: null,
    imageUrl: null,
    specs: { Cores: "24C (8P+16E)", "Base Clock": "3.0 GHz", "Boost Clock": "5.8 GHz", Cache: "36MB L3", TDP: "125W", Socket: "LGA 1700" },
  },
  {
    name: "G.Skill Trident Z5 RGB 32GB DDR5",
    description: "Ultra-high performance DDR5 memory with RGB lighting. Designed for extreme overclocking and enthusiast builds.",
    price: 21999,
    originalPrice: null,
    category: "RAM",
    brand: "G.Skill",
    stock: 25,
    badge: null,
    imageUrl: null,
    specs: { Capacity: "2×16GB", Speed: "DDR5-6400", Latency: "CL32", Voltage: "1.4V", Type: "DIMM", Profile: "XMP 3.0" },
  },
  {
    name: "WD Black SN850X 1TB NVMe",
    description: "Officially licensed for PlayStation 5 with heatsink. PCIe Gen4 speeds up to 7300 MB/s for the fastest gaming experience.",
    price: 14999,
    originalPrice: 17999,
    category: "Storage",
    brand: "Western Digital",
    stock: 22,
    badge: "Deal",
    imageUrl: null,
    specs: { Capacity: "1TB", Interface: "PCIe Gen4 NVMe M.2", "Read Speed": "7300 MB/s", "Write Speed": "6600 MB/s", NAND: "WD BiCS5 TLC", Warranty: "5 years" },
  },
  {
    name: "Lian Li PC-O11 Dynamic EVO",
    description: "Premium dual-chamber case with excellent airflow, support for 360mm radiators, and stunning glass panels.",
    price: 16999,
    originalPrice: null,
    category: "Cases",
    brand: "Lian Li",
    stock: 9,
    badge: null,
    imageUrl: null,
    specs: { "Form Factor": "Mid Tower", "Motherboard Support": "ATX/mATX/mITX", "Max GPU Length": "420mm", "Radiator Support": "Up to 360mm", "Drive Bays": "4×2.5\", 2×3.5\"", Material: "Steel + Glass" },
  },
] as const;

async function seed() {
  console.log("🌱 Seeding database...");

  // 1. Create a seed seller user
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
