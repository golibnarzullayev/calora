export enum SubscriptionFeature {
  MEAL_UPLOAD = "Rasm yuklash",
  DAILY_ANALYSIS = "Kunlik tahlil",
  STATS = "Oqim statistikasi",
  AI_RECOMMENDATIONS = "AI tavsiyalari",
  UNLIMITED_UPLOADS = "Cheksiz rasm yuklash",
  PRIORITY_SUPPORT = "Prioritet qo'llab-quvvatlash",
  MACRO_ANALYSIS = "Makro nutrient tahlili",
}

export const FEATURE_LIMITS: Record<SubscriptionFeature, number | null> = {
  [SubscriptionFeature.MEAL_UPLOAD]: 5,
  [SubscriptionFeature.DAILY_ANALYSIS]: null,
  [SubscriptionFeature.STATS]: null,
  [SubscriptionFeature.AI_RECOMMENDATIONS]: null,
  [SubscriptionFeature.UNLIMITED_UPLOADS]: null,
  [SubscriptionFeature.PRIORITY_SUPPORT]: null,
  [SubscriptionFeature.MACRO_ANALYSIS]: null,
};

export const FEATURE_DESCRIPTIONS: Record<SubscriptionFeature, string> = {
  [SubscriptionFeature.MEAL_UPLOAD]: "Kuniga 5 ta rasm yuklash imkonyati",
  [SubscriptionFeature.DAILY_ANALYSIS]: "Kunlik tahlil va kalori hisoblash",
  [SubscriptionFeature.STATS]: "Oqim statistikasi va grafiklari",
  [SubscriptionFeature.AI_RECOMMENDATIONS]: "AI orqali shaxsiy tavsiyalar",
  [SubscriptionFeature.UNLIMITED_UPLOADS]: "Cheksiz rasm yuklash",
  [SubscriptionFeature.PRIORITY_SUPPORT]: "Tezkor texnik qo'llab-quvvatlash",
  [SubscriptionFeature.MACRO_ANALYSIS]: "Makro nutrientlar tahlili",
};
