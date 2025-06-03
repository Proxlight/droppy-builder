import { Subscription } from '@/hooks/useSubscription';

export const FEATURES = {
  EXPORT_CODE: 'export_code',
  ADVANCED_WIDGETS: 'advanced_widgets', 
  REMOVE_WATERMARK: 'remove_watermark',
  UNLIMITED_CANVAS: 'unlimited_canvas',
  PRIORITY_SUPPORT: 'priority_support',
  CUSTOM_INTEGRATIONS: 'custom_integrations',
  CREATE_PROJECTS: 'create_projects'
};

export const TIER_FEATURES = {
  free: [
    FEATURES.UNLIMITED_CANVAS,
  ],
  standard: [
    FEATURES.UNLIMITED_CANVAS,
    FEATURES.EXPORT_CODE,
    FEATURES.ADVANCED_WIDGETS,
    FEATURES.REMOVE_WATERMARK,
  ],
  pro: [
    FEATURES.UNLIMITED_CANVAS,
    FEATURES.EXPORT_CODE,
    FEATURES.ADVANCED_WIDGETS,
    FEATURES.REMOVE_WATERMARK,
    FEATURES.PRIORITY_SUPPORT,
    FEATURES.CUSTOM_INTEGRATIONS,
  ],
};

/**
 * Check if a subscription has a specific feature
 */
export function hasFeature(subscription: Subscription | null, feature: string): boolean {
  const tier = subscription?.tier || 'free';
  return TIER_FEATURES[tier].includes(feature);
}

/**
 * Get features available for a specific tier
 */
export function getFeatures(tier: 'free' | 'standard' | 'pro') {
  return TIER_FEATURES[tier];
}

/**
 * Check if a widget is available for a subscription tier
 */
export function isWidgetAvailable(widget: string, subscription: Subscription | null): boolean {
  const tier = subscription?.tier || 'free';
  const advancedWidgets = ['DatePicker', 'ColorPicker', 'Slider', 'ProgressBar', 'TabView'];
  
  // All users have access to basic widgets
  if (!advancedWidgets.includes(widget)) {
    return true;
  }
  
  // Only paid users have access to advanced widgets
  return tier === 'standard' || tier === 'pro';
}
