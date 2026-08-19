// TabBar — VetStock Design System
// Uses tokens from @/design/tokens

import React from 'react';
import { View, Pressable, Text, StyleProp, ViewStyle, TextStyle, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius, getElevation } from '@/design/tokens';

export interface TabBarItem {
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  accessibilityLabel?: string;
}

export interface TabBarProps {
  items: TabBarItem[];
  activeIndex: number;
  onChange: (index: number) => void;
  style?: StyleProp<ViewStyle>;
  itemStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  activeColor?: string;
  inactiveColor?: string;
}

export const TabBar = React.forwardRef<View, TabBarProps>(
  (
    {
      items,
      activeIndex,
      onChange,
      style,
      itemStyle,
      labelStyle,
      activeColor = colors.brand[600],
      inactiveColor = colors.neutral[500],
      ...props
    },
    ref
  ) => {
    return (
      <View
        ref={ref}
        style={[
          styles.container,
          {
            backgroundColor: colors.surface.primary,
            borderTopWidth: 1,
            borderTopColor: colors.neutral[200],
            ...getElevation(4),
            paddingBottom: Platform.OS === 'ios' ? spacing[2] : spacing[3], // Safe area handled by parent
          },
          style,
        ] as ViewStyle[]}
        {...props}
      >
        {items.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <Pressable
              key={index}
              onPress={() => onChange(index)}
              accessibilityLabel={item.accessibilityLabel || item.label}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              style={({ pressed }) => [
                styles.item,
                {
                  flex: 1,
                  opacity: pressed ? 0.7 : 1,
                },
                itemStyle,
              ] as ViewStyle[]}
            >
              <View style={styles.iconWrapper}>
                {isActive && item.activeIcon ? item.activeIcon : item.icon}
              </View>
              <Text
                style={[
                  styles.label,
                  {
                    fontSize: typography.sizes.labelSm,
                    color: isActive ? activeColor : inactiveColor,
                    fontWeight: isActive ? typography.weights.semibold : typography.weights.medium,
                  },
                  labelStyle,
                ] as TextStyle[]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }
);

TabBar.displayName = 'TabBar';

const webFocusStyles = Platform.OS === 'web'
  ? {
      ':focus-visible': {
        outline: `2px solid ${colors.brand[500]}`,
        outlineOffset: -2,
        borderRadius: borderRadius.sm,
      },
    }
  : {};

const styles = {
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    ...webFocusStyles,
  },
  item: {
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    paddingVertical: spacing[2],
    gap: spacing[1],
    minHeight: 44,
    minWidth: 60,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  label: {
    fontFamily: typography.fontFamily,
    lineHeight: typography.lineHeights.labelSm,
  },
};