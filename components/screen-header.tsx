import React, { useState } from 'react';
import { View, Text, Pressable, I18nManager } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

I18nManager.forceRTL(true);

export interface HeaderButton {
  id: string;
  label: string;
  icon?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  buttons?: HeaderButton[];
  onMenuPress?: () => void;
  showMenu?: boolean;
}

/**
 * Reusable header component for all screens
 * Supports RTL, dark mode, and action buttons
 */
export function ScreenHeader({
  title,
  subtitle,
  showBackButton = true,
  buttons = [],
  onMenuPress,
  showMenu = true,
}: ScreenHeaderProps) {
  const router = useRouter();
  const colors = useColors();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleButtonPress = (button: HeaderButton) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    button.onPress();
  };

  const handleMenuPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowMoreMenu(!showMoreMenu);
    onMenuPress?.();
  };

  // Display up to 2 buttons in header, rest in menu
  const displayButtons = buttons.slice(0, 2);
  const menuButtons = buttons.slice(2);
  const hasMoreMenu = menuButtons.length > 0 && showMenu;

  return (
    <View className="bg-surface border-b border-border">
      {/* Main Header Row */}
      <View className="flex-row items-center justify-between px-4 py-3">
        {/* Left Section - Back Button */}
        <View className="flex-row items-center gap-2">
          {showBackButton && (
            <Pressable
              onPress={handleBackPress}
              className="p-2 rounded-lg active:bg-background"
            >
              <Text className="text-2xl">←</Text>
            </Pressable>
          )}
        </View>

        {/* Center Section - Title */}
        <View className="flex-1 mx-2">
          <Text
            className="text-xl font-bold text-foreground text-center"
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              className="text-sm text-muted text-center"
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right Section - Action Buttons */}
        <View className="flex-row items-center gap-1">
          {/* Display Buttons */}
          {displayButtons.map((button) => (
            <Pressable
              key={button.id}
              onPress={() => handleButtonPress(button)}
              disabled={button.disabled}
              className={cn(
                'p-2 rounded-lg active:opacity-70',
                button.variant === 'primary' && 'bg-primary',
                button.variant === 'danger' && 'bg-error',
                button.variant !== 'primary' &&
                  button.variant !== 'danger' &&
                  'bg-background',
                button.disabled && 'opacity-50'
              )}
            >
              <Text
                className={cn(
                  'text-lg font-semibold',
                  (button.variant === 'primary' ||
                    button.variant === 'danger') &&
                    'text-white',
                  button.variant !== 'primary' &&
                    button.variant !== 'danger' &&
                    'text-foreground'
                )}
              >
                {button.icon || button.label.charAt(0).toUpperCase()}
              </Text>
            </Pressable>
          ))}

          {/* More Menu Button */}
          {hasMoreMenu && (
            <Pressable
              onPress={handleMenuPress}
              className="p-2 rounded-lg active:bg-background"
            >
              <Text className="text-2xl">⋮</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* More Menu Dropdown */}
      {hasMoreMenu && showMoreMenu && (
        <View className="bg-background border-t border-border">
          {menuButtons.map((button) => (
            <Pressable
              key={button.id}
              onPress={() => {
                handleButtonPress(button);
                setShowMoreMenu(false);
              }}
              disabled={button.disabled}
              className={cn(
                'flex-row items-center justify-between px-4 py-3 border-b border-border active:bg-surface',
                button.disabled && 'opacity-50'
              )}
            >
              <Text
                className={cn(
                  'font-semibold',
                  button.variant === 'danger' ? 'text-error' : 'text-foreground'
                )}
              >
                {button.label}
              </Text>
              {button.icon && (
                <Text className="text-lg">{button.icon}</Text>
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

export default ScreenHeader;
