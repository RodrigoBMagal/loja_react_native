// FAB (Floating Action Button) — VetStock Design System
// Uses tokens from @/design/tokens

import React from 'react';
import { Pressable, View, StyleProp, ViewStyle, Platform, Animated } from 'react-native';
import { colors, spacing, typography, borderRadius, getElevation, motion } from '@/design/tokens';

export type FABSize = 'default' | 'sm' | 'lg';
export type FABPosition = 'bottom-right' | 'bottom-center' | 'top-right' | 'top-left';

export interface FABProps {
  onPress: () => void;
  icon: React.ReactNode;
  size?: FABSize;
  position?: FABPosition;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  disabled?: boolean;
}

const sizeStyles: Record<FABSize, { size: number; iconSize: number; elevation: 0 | 1 | 2 | 3 | 4 | 5 }> = {
  default: { size: 56, iconSize: 24, elevation: 3 },
  sm: { size: 40, iconSize: 18, elevation: 2 },
  lg: { size: 72, iconSize: 32, elevation: 4 },
};

const positionStyles: Record<FABPosition, { bottom?: number; right?: number; left?: number; top?: number; transform?: any[] }> = {
  'bottom-right': { bottom: spacing[6], right: spacing[6] },
  'bottom-center': { bottom: spacing[6], left: '50%' as any, transform: [{ translateX: -28 }] },
  'top-right': { top: spacing[6], right: spacing[6] },
  'top-left': { top: spacing[6], left: spacing[6] },
};

export const FAB = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  FABProps
>(
  (
    {
      onPress,
      icon,
      size = 'default',
      position = 'bottom-right',
      style,
      accessibilityLabel,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const { size: fabSize, iconSize, elevation } = sizeStyles[size];
    const pos = positionStyles[position];
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
      if (disabled) return;
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: motion.durations.normal,
        easing: motion.easing.decelerate as any,
        useNativeDriver: true,
      }).start();
    }, [disabled]);

    const containerStyle = {
      ...pos,
      width: fabSize,
      height: fabSize,
      transform: pos.transform ? [...pos.transform, { scale: scaleAnim }] : [{ scale: scaleAnim }],
    };

    const webFocusStyles = Platform.OS === 'web'
      ? {
          ':focus-visible': {
            outline: `2px solid ${colors.brand[500]}`,
            outlineOffset: 2,
          },
        }
      : {};

    return (
      <Pressable
        ref={ref}
        onPress={onPress}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        style={({ pressed }): StyleProp<ViewStyle> => [
          styles.container,
          containerStyle,
          {
            backgroundColor: pressed && !disabled ? colors.brand[700] : colors.brand[600],
            opacity: disabled ? 0.5 : 1,
            ...getElevation(elevation),
          },
          style ? style : {} as ViewStyle,
        ]}
        {...props}
      >
        <View style={[styles.iconWrapper, { width: iconSize, height: iconSize }]}>
          {icon}
        </View>
      </Pressable>
    );
  }
);

FAB.displayName = 'FAB';

const styles = {
  container: {
    borderRadius: borderRadius.full,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...Platform.select({
      web: {
        cursor: 'pointer' as any,
      },
    }),
  },
  iconWrapper: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
};