// Card — VetStock Design System
// Uses tokens from @/design/tokens

import React from 'react';
import { View, Pressable, StyleProp, ViewStyle, Platform } from 'react-native';
import { colors, spacing, borderRadius, getElevation } from '@/design/tokens';

export type CardVariant = 'default' | 'tight' | 'outlined';
export type CardBorder = 'none' | 'left' | 'full';

export interface CardProps {
  variant?: CardVariant;
  border?: CardBorder;
  borderColor?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityRole?: 'button' | 'none';
  accessibilityLabel?: string;
}

const variantStyles: Record<CardVariant, { padding: number; elevation: 0 | 1 }> = {
  default: { padding: spacing[4], elevation: 1 },
  tight: { padding: spacing[3], elevation: 1 },
  outlined: { padding: spacing[4], elevation: 0 },
};

export const Card = React.forwardRef<View, CardProps>(
  (
    {
      variant = 'default',
      border = 'none',
      borderColor,
      children,
      style,
      onPress,
      accessibilityRole = 'none',
      accessibilityLabel,
      ...props
    },
    ref
  ) => {
    const { padding, elevation } = variantStyles[variant];
    const isInteractive = !!onPress;

    const borderLeftStyles = border === 'left' ? {
      borderLeftWidth: 4,
      borderLeftColor: borderColor || colors.brand[600],
    } : {};

    const borderFullStyles = border === 'full' ? {
      borderWidth: 1,
      borderColor: borderColor || colors.neutral[200],
    } : {};

    const elevationStyles = variant !== 'outlined' ? getElevation(elevation) : {};

    const Component = isInteractive ? Pressable : View;

    return (
      <Component
        ref={ref}
        onPress={onPress}
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        accessible={isInteractive}
        style={[
          styles.container,
          {
            backgroundColor: colors.surface.primary,
            borderRadius: borderRadius.lg,
            padding,
            ...borderLeftStyles,
            ...borderFullStyles,
            ...elevationStyles,
          },
          style,
        ] as ViewStyle[]}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';

const webFocusStyles = Platform.OS === 'web'
  ? {
      ':focus-visible': {
        outline: `2px solid ${colors.brand[500]}`,
        outlineOffset: 2,
      },
    }
  : {};

const styles = {
  container: {
    ...webFocusStyles,
  },
  header: {
    marginBottom: spacing[3],
  },
  content: {},
  footer: {
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
};

// Card sub-components for common patterns
export const CardHeader = ({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) => (
  <View style={[styles.header, style]}>{children}</View>
);

export const CardContent = ({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) => (
  <View style={[styles.content, style]}>{children}</View>
);

export const CardFooter = ({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) => (
  <View style={[styles.footer, style]}>{children}</View>
);