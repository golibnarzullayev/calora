import { connectDatabase } from '../config/database.js';
import { Subscription } from '../models/Subscription.js';

const subscriptionPlans = [
  {
    name: 'Basic',
    description: 'Asosiy paket - kunlik tahlil va statistika',
    price: 50000,
    duration: 1,
    durationUnit: 'month' as const,
    features: [
      'Kunlik tahlil',
      'Oqim statistikasi',
      'Rasm yuklash',
      'Asosiy tavsiyalar',
    ],
    isActive: true,
  },
  {
    name: 'Premium',
    description: 'Premium paket - barcha asosiy xususiyatlar + AI tavsiyalari',
    price: 120000,
    duration: 1,
    durationUnit: 'month' as const,
    features: [
      'Kunlik tahlil',
      'Oqim statistikasi',
      'Cheksiz rasm yuklash',
      'AI tavsiyalari',
      'Prioritet qo\'llab-quvvatlash',
      'Makro nutrient tahlili',
    ],
    isActive: true,
  },
  {
    name: 'Annual',
    description: 'Yillik paket - eng qulay narx',
    price: 1200000,
    duration: 1,
    durationUnit: 'year' as const,
    features: [
      'Barcha Premium xususiyatlari',
      'Cheksiz rasm yuklash',
      'Shaxsiy nutritionist maslahat',
      'API kirish',
      'Reklama yo\'q',
      'Eksport va tahlillar',
    ],
    isActive: true,
  },
];

async function initSubscriptions() {
  try {
    await connectDatabase(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/calories-tracker',
    );

    console.log('Mavjud subscription planlarini o\'chirish...');
    await Subscription.deleteMany({});

    console.log('Yangi subscription planlarini qo\'shish...');
    const created = await Subscription.insertMany(subscriptionPlans);

    console.log(`✓ ${created.length} ta subscription plan muvaffaqiyatli qo\'shildi:`);
    created.forEach((sub) => {
      console.log(`  - ${sub.name}: ${sub.price} so'm/${sub.durationUnit}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Xato yuz berdi:', error);
    process.exit(1);
  }
}

initSubscriptions();
