import React, { useState } from 'react';
import { View, Pressable, Text, Modal, I18nManager } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

I18nManager.forceRTL(true);

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  onPress: () => void;
  variant?: 'default' | 'danger' | 'success';
  disabled?: boolean;
}

export interface ContextMenuProps {
  items: ContextMenuItem[];
  triggerLabel?: string;
  triggerIcon?: string;
  position?: 'top' | 'bottom';
}

/**
 * Context menu component for additional options
 * Shows menu items in a modal overlay
 */
export function ContextMenu({
  items,
  triggerLabel = 'المزيد',
  triggerIcon = '⋯',
  position = 'bottom',
}: ContextMenuProps) {
  const [isVisible, setIsVisible] = useState(false);
  const colors = useColors();

  const handleItemPress = (item: ContextMenuItem) => {
    if (item.disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    item.onPress();
    setIsVisible(false);
  };

  const handleTriggerPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsVisible(true);
  };

  return (
    <>
      {/* Trigger Button */}
      <Pressable
        onPress={handleTriggerPress}
        className="px-3 py-2 rounded-lg active:bg-surface"
      >
        <Text className="text-lg font-semibold text-foreground">
          {triggerIcon}
        </Text>
      </Pressable>

      {/* Modal Menu */}
      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        {/* Overlay */}
        <Pressable
          onPress={() => setIsVisible(false)}
          className="flex-1 bg-black/50 justify-end"
        >
          {/* Menu Container */}
          <View
            className="bg-surface rounded-t-3xl overflow-hidden"
            onStartShouldSetResponder={() => true}
          >
            {/* Header */}
            <View className="items-center py-3 border-b border-border">
              <View className="w-12 h-1 bg-border rounded-full" />
            </View>

            {/* Menu Items */}
            <View>
              {items.map((item, index) => (
                <Pressable
                  key={item.id}
                  onPress={() => handleItemPress(item)}
                  disabled={item.disabled}
                  className={cn(
                    'flex-row items-center px-4 py-4 border-b border-border active:bg-background',
                    item.disabled && 'opacity-50',
                    index === items.length - 1 && 'border-b-0'
                  )}
                >
                  {/* Icon */}
                  {item.icon && (
                    <Text className="text-2xl mr-3 ml-0">{item.icon}</Text>
                  )}

                  {/* Label */}
                  <Text
                    className={cn(
                      'flex-1 font-semibold text-lg',
                      item.variant === 'danger' && 'text-error',
                      item.variant === 'success' && 'text-success',
                      item.variant !== 'danger' &&
                        item.variant !== 'success' &&
                        'text-foreground'
                    )}
                  >
                    {item.label}
                  </Text>

                  {/* Chevron */}
                  <Text className="text-lg text-muted">←</Text>
                </Pressable>
              ))}
            </View>

            {/* Cancel Button */}
            <Pressable
              onPress={() => setIsVisible(false)}
              className="px-4 py-4 items-center border-t border-border"
            >
              <Text className="font-semibold text-lg text-primary">إلغاء</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

export default ContextMenu;
