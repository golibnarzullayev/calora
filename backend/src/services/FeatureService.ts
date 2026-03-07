import { UserSubscription } from '../models/UserSubscription.js';
import { Subscription } from '../models/Subscription.js';
import { SubscriptionFeature, FEATURE_LIMITS } from '../constants/features.js';

class FeatureService {
  async getUserFeatures(userId: string): Promise<SubscriptionFeature[]> {
    const userSubscription = await UserSubscription.findOne({
      userId,
      isActive: true,
      endDate: { $gt: new Date() },
    }).populate('subscriptionId');

    if (!userSubscription) {
      return [];
    }

    const subscription = userSubscription.subscriptionId as any;
    return subscription.features || [];
  }

  async hasFeature(userId: string, feature: SubscriptionFeature): Promise<boolean> {
    const features = await this.getUserFeatures(userId);
    return features.includes(feature);
  }

  async checkFeatureAccess(
    userId: string,
    feature: SubscriptionFeature,
  ): Promise<{ hasAccess: boolean; message?: string }> {
    const hasFeature = await this.hasFeature(userId, feature);

    if (!hasFeature) {
      return {
        hasAccess: false,
        message: `Bu xususiyat uchun obuna kerak: ${feature}`,
      };
    }

    return { hasAccess: true };
  }

  async getFeatureLimit(
    userId: string,
    feature: SubscriptionFeature,
  ): Promise<number | null> {
    const hasFeature = await this.hasFeature(userId, feature);
    if (!hasFeature) return null;

    return FEATURE_LIMITS[feature];
  }

  async getAllUserFeatures(userId: string): Promise<{
    features: SubscriptionFeature[];
    subscription: any;
  }> {
    const userSubscription = await UserSubscription.findOne({
      userId,
      isActive: true,
      endDate: { $gt: new Date() },
    }).populate('subscriptionId');

    if (!userSubscription) {
      return {
        features: [],
        subscription: null,
      };
    }

    const subscription = userSubscription.subscriptionId as any;
    return {
      features: subscription.features || [],
      subscription: {
        name: subscription.name,
        endDate: userSubscription.endDate,
      },
    };
  }
}

export default new FeatureService();
