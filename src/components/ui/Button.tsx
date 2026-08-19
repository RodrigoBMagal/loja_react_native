// Button — VetStock Design System
// Uses tokens from @/design/tokens

import React from 'react';
import { Pressable, Text, StyleProp, ViewStyle, TextStyle, Platform, View } from 'react-native';
import { colors, spacing, typography, borderRadius, getElevation } from '@/design/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon-only';
export type ButtonSize = 'default' | 'sm' | 'lg';

export interface ButtonProps extends React.ComponentPropsWithoutRef<typeof Pressable> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: colors.brand[600], text: colors.neutral[0] },
  secondary: { bg: colors.neutral[0], text: colors.brand[600], border: `1.5px solid ${colors.brand[300]}` },
  ghost: { bg: 'transparent', text: colors.brand[600] },
  danger: { bg: colors.semantic.danger, text: colors.neutral[0] },
  'icon-only': { bg: 'transparent', text: colors.brand[600] },
};

const sizeStyles: Record<ButtonSize, { height: number; paddingH: number; fontSize: number }> = {
  default: { height: 50, paddingH: 24, fontSize: typography.sizes.bodyLg },
  sm: { height: 40, paddingH: 16, fontSize: typography.sizes.bodyMd },
  lg: { height: 56, paddingH: 32, fontSize: typography.sizes.bodyLg },
};

export const Button = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ButtonProps
>(
  (
    {
      variant = 'primary',
      size = 'default',
      children,
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      style,
      textStyle,
      disabled,
      accessibilityLabel,
      onPress,
      ...props
    },
    ref
  ) => {
    const { bg, text: textColor, border } = variantStyles[variant];
    const { height, paddingH, fontSize } = sizeStyles[size];
    const isDisabled = disabled || loading;

    return (
      <Pressable
        ref={ref}
        onPress={onPress}
        disabled={isDisabled}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        style={({ pressed }): StyleProp<ViewStyle> => [
          styles.container,
          {
            backgroundColor: pressed && !isDisabled ? `${bg}CC` : bg,
            borderWidth: border ? 1.5 : 0,
            borderColor: border?.replace('1.5px solid ', ''),
            height,
            paddingHorizontal: paddingH,
            borderRadius: borderRadius.md,
            width: fullWidth ? '100%' : undefined,
            opacity: isDisabled ? 0.5 : 1,
            ...getElevation(variant === 'ghost' ? 0 : 1),
          },
          style ? style : {} as ViewStyle,
        ]}
        {...props}
      >
        {loading ? (
          <LoadingSpinner size={size === 'sm' ? 16 : 20} color={textColor} />
        ) : (
          <React.Fragment>
            {leftIcon && <React.Fragment>{leftIcon}</React.Fragment>}
            <Text
              style={[
                styles.label,
                { fontSize, color: textColor, fontWeight: typography.weights.semibold },
                textStyle,
              ]}
            >
              {children}
            </Text>
            {rightIcon && <React.Fragment>{rightIcon}</React.Fragment>}
          </React.Fragment>
        )}
      </Pressable>
    );
  }
);

Button.displayName = 'Button';

// Web focus-visible styles
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
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: spacing[2],
    minHeight: 44, // Minimum touch target
    ...webFocusStyles,
  },
  label: {
    fontFamily: typography.fontFamily,
    lineHeight: typography.lineHeights.bodyLg,
  },
};

// Simple loading spinner
const LoadingSpinner = ({ size, color }: { size: number; color: string }) => (
  <View
    style={{
      width: size,
      height: size,
      borderWidth: 2,
      borderColor: color,
      borderTopColor: 'transparent',
      borderRadius: size / 2,
    }}
  />
);