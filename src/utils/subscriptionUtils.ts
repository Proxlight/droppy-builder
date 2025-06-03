
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
    FEATURES.CREATE_PROJECTS,
  ],
  pro: [
    FEATURES.UNLIMITED_CANVAS,
    FEATURES.EXPORT_CODE,
    FEATURES.ADVANCED_WIDGETS,
    FEATURES.REMOVE_WATERMARK,
    FEATURES.PRIORITY_SUPPORT,
    FEATURES.CUSTOM_INTEGRATIONS,
    FEATURES.CREATE_PROJECTS,
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

/**
 * Check if user can create more projects based on their subscription tier
 */
export function canCreateProject(subscription: Subscription | null, currentProjectCount: number): boolean {
  const tier = subscription?.tier || 'free';
  
  // Free users can create up to 3 projects
  if (tier === 'free') {
    return currentProjectCount < 3;
  }
  
  // Standard and Pro users have unlimited projects
  return tier === 'standard' || tier === 'pro';
}

/**
 * Get the maximum number of projects allowed for a tier
 */
export function getMaxProjects(tier: 'free' | 'standard' | 'pro'): number | 'unlimited' {
  if (tier === 'free') {
    return 3;
  }
  return 'unlimited';
}
