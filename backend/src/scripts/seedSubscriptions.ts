import "dotenv/config";
import { connectDatabase } from "../config/database.js";
import { Subscription } from "../models/Subscription.js";

const subscriptionPlans = [
  {
    name: "Premium Monthly",
    description: "Premium paket - oylik obuna",
    price: 120000,
    duration: 1,
    durationUnit: "month" as const,
    isActive: true,
    discount: 0,
  },
  {
    name: "Premium Yearly",
    description: "Premium paket - yillik obuna (25% chegirma)",
    price: 1080000,
    duration: 1,
    durationUnit: "year" as const,
    isActive: true,
    discount: 20,
  },
];

async function seedSubscriptions() {
  try {
    await connectDatabase(
      process.env.MONGODB_URI || "mongodb://localhost:27017/calories-tracker",
    );

    console.log("📋 Mavjud subscription planlarini o'chirish...");
    await Subscription.deleteMany({});
    console.log("✓ Eski planlar o'chirildi");

    console.log("\n📝 Yangi subscription planlarini qo'shish...");
    const created = await Subscription.insertMany(subscriptionPlans);

    console.log("\n✅ Muvaffaqiyatli qo'shildi:");
    created.forEach((sub) => {
      console.log(`\n📦 ${sub.name}`);
      console.log(`   Narxi: ${sub.price.toLocaleString()} so'm`);
      console.log(`   Davomiyligi: ${sub.duration} ${sub.durationUnit}`);
      console.log(`   Tavsifi: ${sub.description}`);
      console.log(`   Chegirma: ${sub.discount}%`);
    });

    console.log(`\n✨ Jami ${created.length} ta plan qo'shildi`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Xato yuz berdi:", error);
    process.exit(1);
  }
}

seedSubscriptions();
