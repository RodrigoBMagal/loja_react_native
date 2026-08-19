// Badge — VetStock Design System
// Uses tokens from @/design/tokens

import React from 'react';
import { View, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, typography, borderRadius, getCategoryBadgeBg, getSemanticBadgeBg } from '@/design/tokens';

export type BadgeVariant = 'category' | 'status' | 'neutral';
export type BadgeSize = 'default' | 'sm';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  category?: keyof typeof colors.category;
  status?: keyof typeof colors.semantic;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

const sizeStyles: Record<BadgeSize, { paddingH: number; paddingV: number; fontSize: number; minHeight: number }> = {
  default: { paddingH: 10, paddingV: 4, fontSize: typography.sizes.labelMd, minHeight: 24 },
  sm: { paddingH: 8, paddingV: 2, fontSize: typography.sizes.labelSm, minHeight: 20 },
};

export const Badge = React.forwardRef<View, BadgeProps>(
  (
    {
      variant = 'neutral',
      size = 'default',
      children,
      category,
      status,
      style,
      textStyle,
      accessibilityLabel,
      ...props
    },
    ref
  ) => {
    const { paddingH, paddingV, fontSize, minHeight } = sizeStyles[size];

    let backgroundColor: string;
    let textColor: string;

    if (variant === 'category' && category) {
      backgroundColor = getCategoryBadgeBg(category);
      textColor = colors.category[category];
    } else if (variant === 'status' && status) {
      backgroundColor = getSemanticBadgeBg(status);
      textColor = colors.semantic[status];
    } else {
      backgroundColor = colors.neutral[200];
      textColor = colors.neutral[700];
    }

    return (
      <View
        ref={ref}
        style={[
          styles.container,
          {
            backgroundColor,
            paddingHorizontal: paddingH,
            paddingVertical: paddingV,
            borderRadius: borderRadius.full,
            minHeight,
          },
          style,
        ] as ViewStyle[]}
        accessibilityLabel={accessibilityLabel || String(children)}
        accessibilityRole="none"
        {...props}
      >
        <Text
          style={[
            styles.text,
            { fontSize, color: textColor, fontWeight: variant === 'status' ? typography.weights.bold : typography.weights.semibold },
            textStyle,
          ] as TextStyle[]}
        >
          {children}
        </Text>
      </View>
    );
  }
);

Badge.displayName = 'Badge';

const styles = {
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  text: {
    fontFamily: typography.fontFamily,
    lineHeight: typography.lineHeights.labelMd,
  },
};

// Convenience components
export const CategoryBadge = ({ category, children, size, ...props }: Omit<BadgeProps, 'variant'> & { category: keyof typeof colors.category }) => (
  <Badge variant="category" category={category} size={size} {...props}>
    {children}
  </Badge>
);

export const StatusBadge = ({ status, children, size, ...props }: Omit<BadgeProps, 'variant'> & { status: keyof typeof colors.semantic }) => (
  <Badge variant="status" status={status} size={size} {...props}>
    {children}
  </Badge>
);