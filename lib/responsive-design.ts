/**
 * Responsive Design Utilities
 * Ensures app works well on all device sizes and orientations
 */

import React from 'react';
import { Dimensions, Platform, useWindowDimensions } from 'react-native';

/**
 * Breakpoints for responsive design
 */
export const BREAKPOINTS = {
  xs: 0,      // Extra small (phones < 320px)
  sm: 320,    // Small phones (320px - 480px)
  md: 480,    // Medium phones (480px - 768px)
  lg: 768,    // Tablets (768px - 1024px)
  xl: 1024,   // Large tablets (1024px+)
};

/**
 * Get current screen size category
 */
export function getScreenSize(): 'xs' | 'sm' | 'md' | 'lg' | 'xl' {
  const width = Dimensions.get('window').width;

  if (width < BREAKPOINTS.sm) return 'xs';
  if (width < BREAKPOINTS.md) return 'sm';
  if (width < BREAKPOINTS.lg) return 'md';
  if (width < BREAKPOINTS.xl) return 'lg';
  return 'xl';
}

/**
 * Responsive font sizes
 */
export const RESPONSIVE_FONT_SIZES = {
  xs: {
    h1: 24,
    h2: 20,
    h3: 18,
    body: 14,
    small: 12,
  },
  sm: {
    h1: 28,
    h2: 24,
    h3: 20,
    body: 16,
    small: 14,
  },
  md: {
    h1: 32,
    h2: 28,
    h3: 24,
    body: 16,
    small: 14,
  },
  lg: {
    h1: 36,
    h2: 32,
    h3: 28,
    body: 18,
    small: 16,
  },
  xl: {
    h1: 40,
    h2: 36,
    h3: 32,
    body: 18,
    small: 16,
  },
};

/**
 * Responsive spacing
 */
export const RESPONSIVE_SPACING = {
  xs: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  sm: {
    xs: 6,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
  },
  md: {
    xs: 8,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  },
  lg: {
    xs: 12,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
  },
  xl: {
    xs: 16,
    sm: 24,
    md: 32,
    lg: 40,
    xl: 48,
  },
};

/**
 * Hook to get responsive values
 */
export function useResponsive<T>(values: Record<string, T>): T {
  const screenSize = getScreenSize();
  return values[screenSize] || values['md'];
}

/**
 * Hook to get responsive dimensions
 */
export function useResponsiveDimensions() {
  const { width, height } = useWindowDimensions();
  const screenSize = getScreenSize();
  const isPortrait = height > width;
  const isTablet = width >= BREAKPOINTS.lg;

  return {
    width,
    height,
    screenSize,
    isPortrait,
    isTablet,
    isPhone: !isTablet,
  };
}

/**
 * Get font size based on screen size
 */
export function getResponsiveFontSize(
  type: keyof typeof RESPONSIVE_FONT_SIZES['xs']
): number {
  const screenSize = getScreenSize();
  return RESPONSIVE_FONT_SIZES[screenSize][type];
}

/**
 * Get spacing based on screen size
 */
export function getResponsiveSpacing(
  size: keyof typeof RESPONSIVE_SPACING['xs']
): number {
  const screenSize = getScreenSize();
  return RESPONSIVE_SPACING[screenSize][size];
}

/**
 * Get column count for grid based on screen size
 */
export function getGridColumns(): number {
  const screenSize = getScreenSize();

  switch (screenSize) {
    case 'xs':
    case 'sm':
      return 1;
    case 'md':
      return 2;
    case 'lg':
    case 'xl':
      return 3;
    default:
      return 2;
  }
}

/**
 * Platform-specific utilities
 */
export const PLATFORM_SPECIFIC = {
  isAndroid: Platform.OS === 'android',
  isIOS: Platform.OS === 'ios',
  isWeb: Platform.OS === 'web',
  isNative: Platform.OS !== 'web',
};

/**
 * Get safe area insets for notch/home indicator
 */
export function getSafeAreaInsets() {
  const { width, height } = Dimensions.get('window');
  
  // Approximate safe area insets based on device
  if (Platform.OS === 'ios') {
    // iPhone X and newer
    if (height > 800) {
      return { top: 44, bottom: 34, left: 0, right: 0 };
    }
    // Older iPhones
    return { top: 20, bottom: 0, left: 0, right: 0 };
  }

  if (Platform.OS === 'android') {
    // Android with notch
    if (height > 800) {
      return { top: 24, bottom: 0, left: 0, right: 0 };
    }
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  return { top: 0, bottom: 0, left: 0, right: 0 };
}

/**
 * Responsive container styles
 */
export function getContainerStyles() {
  const { width } = Dimensions.get('window');
  const screenSize = getScreenSize();

  return {
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('md'),
    maxWidth: screenSize === 'xl' ? 1200 : '100%',
  };
}

/**
 * Responsive button styles
 */
export function getButtonStyles() {
  const screenSize = getScreenSize();

  return {
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('sm'),
    borderRadius: screenSize === 'xs' ? 8 : 12,
    minHeight: screenSize === 'xs' ? 40 : 48,
  };
}

/**
 * Responsive card styles
 */
export function getCardStyles() {
  const screenSize = getScreenSize();

  return {
    padding: getResponsiveSpacing('md'),
    borderRadius: screenSize === 'xs' ? 8 : 12,
    marginBottom: getResponsiveSpacing('md'),
  };
}

/**
 * Check if device has low memory
 */
export function isLowMemoryDevice(): boolean {
  // Approximate check based on screen size
  // Smaller screens often mean older devices
  const screenSize = getScreenSize();
  return screenSize === 'xs' || screenSize === 'sm';
}

/**
 * Optimize for low-end devices
 */
export function getLowEndDeviceOptimizations() {
  const isLowEnd = isLowMemoryDevice();

  return {
    // Reduce animation complexity
    useSimpleAnimations: isLowEnd,
    // Reduce shadow effects
    useShadows: !isLowEnd,
    // Reduce blur effects
    useBlur: !isLowEnd,
    // Reduce image quality
    imageQuality: isLowEnd ? 0.7 : 1.0,
    // Reduce list item count per page
    itemsPerPage: isLowEnd ? 10 : 20,
    // Disable parallax effects
    useParallax: !isLowEnd,
  };
}

/**
 * Get optimal image dimensions
 */
export function getOptimalImageDimensions(
  originalWidth: number,
  originalHeight: number
): { width: number; height: number } {
  const { width: screenWidth } = Dimensions.get('window');
  const maxWidth = Math.min(screenWidth - 32, 600); // 32px padding

  if (originalWidth <= maxWidth) {
    return { width: originalWidth, height: originalHeight };
  }

  const ratio = originalHeight / originalWidth;
  return {
    width: maxWidth,
    height: Math.round(maxWidth * ratio),
  };
}

/**
 * Responsive text input styles
 */
export function getTextInputStyles() {
  const screenSize = getScreenSize();

  return {
    fontSize: getResponsiveFontSize('body'),
    paddingHorizontal: getResponsiveSpacing('md'),
    paddingVertical: getResponsiveSpacing('sm'),
    borderRadius: screenSize === 'xs' ? 6 : 8,
    minHeight: screenSize === 'xs' ? 40 : 48,
  };
}

/**
 * Get list item height based on device
 */
export function getListItemHeight(): number {
  const screenSize = getScreenSize();

  switch (screenSize) {
    case 'xs':
      return 60;
    case 'sm':
      return 70;
    case 'md':
    case 'lg':
    case 'xl':
      return 80;
    default:
      return 70;
  }
}

/**
 * Orientation change handler
 */
export function useOrientationChange(callback: (isPortrait: boolean) => void) {
  const { width, height } = useWindowDimensions();

  React.useEffect(() => {
    const isPortrait = height > width;
    callback(isPortrait);
  }, [width, height, callback]);
}
