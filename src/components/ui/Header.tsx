// Header — VetStock Design System
// Uses tokens from @/design/tokens

import React from 'react';
import { View, Text, Pressable, StyleProp, ViewStyle, TextStyle, Platform, SafeAreaView } from 'react-native';
import { colors, spacing, typography, borderRadius, getElevation } from '@/design/tokens';

export type HeaderVariant = 'default' | 'transparent' | 'primary';

export interface HeaderProps {
  title: string;
  variant?: HeaderVariant;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  leftAccessibilityLabel?: string;
  rightAccessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  showShadow?: boolean;
}

export const Header = React.forwardRef<View, HeaderProps>(
  (
    {
      title,
      variant = 'default',
      leftElement,
      rightElement,
      onLeftPress,
      onRightPress,
      leftAccessibilityLabel,
      rightAccessibilityLabel,
      style,
      titleStyle,
      showShadow = variant !== 'transparent',
      ...props
    },
    ref
  ) => {
    const isTransparent = variant === 'transparent';
    const isPrimary = variant === 'primary';

    const backgroundColor = isTransparent
      ? 'transparent'
      : isPrimary
        ? colors.brand[700]
        : colors.surface.primary;

    const titleColor = isPrimary ? colors.neutral[0] : colors.neutral[900];
    const iconColor = isPrimary ? colors.neutral[0] : colors.neutral[700];
    const shadow = showShadow && !isTransparent ? getElevation(2) : {};

    return (
      <SafeAreaView
        ref={ref}
        style={[
          styles.container,
          {
            backgroundColor,
            paddingHorizontal: spacing[4],
            paddingTop: spacing[2],
            paddingBottom: spacing[3],
            ...shadow,
          },
          style,
        ] as ViewStyle[]}
        {...props}
      >
        <View style={styles.content}>
          {leftElement && (
            <Pressable
              onPress={onLeftPress}
              accessibilityLabel={leftAccessibilityLabel}
              accessibilityRole="button"
              style={styles.action}
            >
              <View style={styles.iconWrapper}>{leftElement}</View>
            </Pressable>
          )}
          <Text
            style={[
              styles.title,
              {
                fontSize: typography.sizes.headingLg,
                fontWeight: typography.weights.bold,
                color: titleColor,
              },
              titleStyle,
            ] as TextStyle[]}
          >
            {title}
          </Text>
          {rightElement && (
            <Pressable
              onPress={onRightPress}
              accessibilityLabel={rightAccessibilityLabel}
              accessibilityRole="button"
              style={styles.action}
            >
              <View style={styles.iconWrapper}>{rightElement}</View>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    );
  }
);

Header.displayName = 'Header';

const styles = {
  container: {
    borderBottomWidth: 0,
  },
  content: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    minHeight: 44,
  },
  title: {
    fontFamily: typography.fontFamily,
    lineHeight: typography.lineHeights.headingLg,
    flex: 1,
    textAlign: 'center' as const,
    marginHorizontal: spacing[3],
  },
  action: {
    padding: spacing[2],
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
};