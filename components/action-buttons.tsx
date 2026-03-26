import React from 'react';
import { View, Pressable, Text, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { cn } from '@/lib/utils';

export interface ActionButton {
  id: string;
  label: string;
  icon: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  disabled?: boolean;
  fullWidth?: boolean;
}

export interface ActionButtonsProps {
  buttons: ActionButton[];
  layout?: 'horizontal' | 'vertical' | 'grid';
  spacing?: 'compact' | 'normal' | 'loose';
}

const variantStyles = {
  primary: 'bg-primary',
  secondary: 'bg-surface border border-border',
  success: 'bg-success',
  danger: 'bg-error',
  warning: 'bg-warning',
};

const variantTextStyles = {
  primary: 'text-white',
  secondary: 'text-foreground',
  success: 'text-white',
  danger: 'text-white',
  warning: 'text-white',
};

/**
 * Reusable action buttons component
 * Supports multiple layouts and variants
 */
export function ActionButtons({
  buttons,
  layout = 'horizontal',
  spacing = 'normal',
}: ActionButtonsProps) {
  const handlePress = (button: ActionButton) => {
    if (button.disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    button.onPress();
  };

  const spacingClasses = {
    compact: 'gap-2',
    normal: 'gap-3',
    loose: 'gap-4',
  };

  if (layout === 'horizontal') {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className={cn('px-4 py-3', spacingClasses[spacing])}
        contentContainerStyle={{ gap: spacing === 'compact' ? 8 : spacing === 'loose' ? 16 : 12 }}
      >
        {buttons.map((button) => (
          <Pressable
            key={button.id}
            onPress={() => handlePress(button)}
            disabled={button.disabled}
            className={cn(
              'px-4 py-3 rounded-lg items-center justify-center active:opacity-80',
              variantStyles[button.variant || 'primary'],
              button.disabled && 'opacity-50'
            )}
          >
            <Text className="text-2xl mb-1">{button.icon}</Text>
            <Text
              className={cn(
                'text-xs font-semibold',
                variantTextStyles[button.variant || 'primary']
              )}
              numberOfLines={1}
            >
              {button.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    );
  }

  if (layout === 'vertical') {
    return (
      <View className={cn('px-4 py-3', spacingClasses[spacing])}>
        {buttons.map((button) => (
          <Pressable
            key={button.id}
            onPress={() => handlePress(button)}
            disabled={button.disabled}
            className={cn(
              'flex-row items-center px-4 py-3 rounded-lg active:opacity-80',
              variantStyles[button.variant || 'primary'],
              button.disabled && 'opacity-50',
              spacingClasses[spacing]
            )}
          >
            <Text className="text-2xl mr-3">{button.icon}</Text>
            <Text
              className={cn(
                'flex-1 font-semibold',
                variantTextStyles[button.variant || 'primary']
              )}
            >
              {button.label}
            </Text>
            <Text className="text-lg">→</Text>
          </Pressable>
        ))}
      </View>
    );
  }

  // Grid layout
  return (
    <View className={cn('px-4 py-3', spacingClasses[spacing])}>
      <View className="flex-row flex-wrap">
        {buttons.map((button, index) => (
          <View
            key={button.id}
            className={cn(
              'w-1/2',
              index % 2 === 1 && 'pl-1.5',
              index % 2 === 0 && 'pr-1.5',
              Math.floor(index / 2) > 0 && 'mt-3'
            )}
          >
            <Pressable
              onPress={() => handlePress(button)}
              disabled={button.disabled}
              className={cn(
                'p-4 rounded-lg items-center justify-center active:opacity-80',
                variantStyles[button.variant || 'primary'],
                button.disabled && 'opacity-50'
              )}
            >
              <Text className="text-3xl mb-2">{button.icon}</Text>
              <Text
                className={cn(
                  'text-sm font-semibold text-center',
                  variantTextStyles[button.variant || 'primary']
                )}
                numberOfLines={2}
              >
                {button.label}
              </Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

export default ActionButtons;
