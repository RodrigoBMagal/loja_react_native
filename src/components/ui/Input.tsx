// Input — VetStock Design System
// Uses tokens from @/design/tokens

import React from 'react';
import { TextInput, Text, View, Pressable, StyleProp, ViewStyle, TextStyle, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius, getElevation } from '@/design/tokens';

export type InputSize = 'default' | 'sm';
export type InputType = 'text' | 'number' | 'email' | 'password' | 'tel' | 'decimal-pad';

export interface InputProps extends React.ComponentPropsWithoutRef<typeof TextInput> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: InputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  fullWidth?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

const sizeStyles: Record<InputSize, { height: number; paddingH: number; fontSize: number; labelFontSize: number }> = {
  default: { height: 48, paddingH: 14, fontSize: typography.sizes.bodyMd, labelFontSize: typography.sizes.labelLg },
  sm: { height: 40, paddingH: 12, fontSize: typography.sizes.bodySm, labelFontSize: typography.sizes.labelMd },
};

export const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'default',
      leftIcon,
      rightIcon,
      onRightIconPress,
      fullWidth = true,
      style,
      inputStyle,
      labelStyle,
      disabled,
      accessibilityLabel,
      secureTextEntry,
      onBlur,
      onFocus,
      ...props
    },
    ref
  ) => {
    const { height, paddingH, fontSize, labelFontSize } = sizeStyles[size];
    const hasError = !!error;
    const [focused, setFocused] = React.useState(false);

    const borderColor = hasError
      ? colors.semantic.danger
      : focused
        ? colors.brand[600]
        : colors.neutral[300];
    const borderWidth = focused || hasError ? 2 : 1.5;

    const a11yLabel = accessibilityLabel || label;

    // Add extra left padding when leftIcon is present
    const inputPaddingLeft = leftIcon ? paddingH + 28 : paddingH;

    return (
      <View style={[styles.container, { width: fullWidth ? '100%' : undefined }, style] as ViewStyle[]}>
        {label && (
          <Text
            style={[
              styles.label,
              { fontSize: labelFontSize, color: colors.neutral[700], fontWeight: typography.weights.semibold },
              labelStyle,
            ]}
          >
            {label}
          </Text>
        )}
        <View style={styles.inputWrapper}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <TextInput
            ref={ref}
            style={[
              styles.input,
              {
                height,
                paddingHorizontal: paddingH,
                paddingLeft: inputPaddingLeft,
                fontSize,
                fontFamily: typography.fontFamily,
                color: colors.neutral[900],
                backgroundColor: colors.neutral[0],
                borderColor,
                borderWidth,
                borderRadius: borderRadius.md,
                paddingRight: rightIcon ? paddingH : paddingH,
              },
              inputStyle,
            ] as TextStyle[]}
            editable={!disabled}
            secureTextEntry={secureTextEntry}
            onBlur={(e) => { setFocused(false); onBlur?.(e); }}
            onFocus={(e) => { setFocused(true); onFocus?.(e); }}
            accessibilityLabel={a11yLabel}
            accessibilityState={{ disabled, selected: hasError }}
            accessibilityLiveRegion={hasError ? 'assertive' : 'polite'}
            {...props}
          />
          {rightIcon && (
            <Pressable 
              style={styles.iconRight} 
              onPress={onRightIconPress}
              accessibilityLabel="Toggle visibility"
            >
              {rightIcon}
            </Pressable>
          )}
        </View>
        {(error || helperText) && (
          <Text
            style={[
              styles.helper,
              { fontSize: typography.sizes.labelSm, color: hasError ? colors.semantic.danger : colors.neutral[600] },
            ]}
            accessibilityLiveRegion="polite"
          >
            {error || helperText}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

const webFocusStyles = Platform.OS === 'web'
  ? {
      ':focus-within': {
        boxShadow: `0 0 0 2px ${colors.brand[500]}40`,
      },
    }
  : {};

const styles = {
  container: {
    gap: spacing[2],
    width: '100%',
    ...webFocusStyles,
  },
  inputWrapper: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  input: {
    flex: 1,
    lineHeight: typography.lineHeights.bodyMd,
  },
  label: {
    fontFamily: typography.fontFamily,
    lineHeight: typography.lineHeights.labelLg,
  },
  helper: {
    fontFamily: typography.fontFamily,
    lineHeight: typography.lineHeights.labelSm,
  },
  iconLeft: {
    position: 'absolute' as const,
    left: spacing[3],
    zIndex: 1,
  },
  iconRight: {
    position: 'absolute' as const,
    right: spacing[3],
    zIndex: 1,
  },
};