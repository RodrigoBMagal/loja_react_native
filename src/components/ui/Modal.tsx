// Modal / BottomSheet — VetStock Design System
// Uses tokens from @/design/tokens

import React from 'react';
import { View, Text, Pressable, StyleProp, ViewStyle, TextStyle, Platform, Animated, Keyboard, SafeAreaView, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, getElevation } from '@/design/tokens';

export type ModalPosition = 'center' | 'bottom';
export type ModalSize = 'sm' | 'md' | 'lg' | 'full';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  position?: ModalPosition;
  size?: ModalSize;
  title?: string;
  children: React.ReactNode;
  closeOnOverlayPress?: boolean;
  showHandle?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const sizeStyles: Record<ModalSize, { width: string | number; maxHeight: string | number }> = {
  sm: { width: '85%', maxHeight: '70%' },
  md: { width: '90%', maxHeight: '80%' },
  lg: { width: '95%', maxHeight: '85%' },
  full: { width: '100%', maxHeight: '100%' },
};
export const Modal = React.forwardRef<View, ModalProps>(
  (
    {
      visible,
      onClose,
      position = Platform.OS === 'web' ? 'center' : 'bottom',
      size = 'md',
      title,
      children,
      closeOnOverlayPress = true,
      showHandle = position === 'bottom',
      style,
      contentStyle,
      accessibilityLabel,
      ...props
    },
    ref
  ) => {
    if (!visible) return null;

    const { width, maxHeight } = sizeStyles[size];
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(position === 'bottom' ? 300 : 0)).current;
    const [keyboardHeight, setKeyboardHeight] = React.useState(0);

    React.useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();

      const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
        if (position === 'bottom') setKeyboardHeight(e.endCoordinates.height);
      });
      const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));

      return () => {
        showSub.remove();
        hideSub.remove();
      };
    }, [visible, fadeAnim, slideAnim, position]);

    const handleClose = () => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: position === 'bottom' ? 300 : 0, duration: 200, useNativeDriver: true }),
      ]).start(() => onClose());
    };

    const overlayStyle = { opacity: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) };
    const containerStyle = {
      transform: [{ translateY: slideAnim }],
      opacity: fadeAnim,
    };

    const isWeb = Platform.OS === 'web';
    const isBottom = position === 'bottom';

    return (
      <Pressable
        onPress={closeOnOverlayPress ? handleClose : undefined}
        style={styles.overlayContainer}
      >
        <Animated.View style={[styles.overlay, overlayStyle]} pointerEvents="none" />
        <Animated.View
          ref={ref}
          style={[
            styles.container,
            containerStyle,
            {
              width,
              maxHeight,
              borderRadius: isBottom ? borderRadius.xl : borderRadius.lg,
              ...getElevation(isBottom ? 4 : 5),
            },
            style,
          ] as ViewStyle[]}
          accessibilityRole="none"
          accessibilityLabel={accessibilityLabel || title}
          {...props}
        >
          {showHandle && isBottom && !isWeb && (
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>
          )}
          {(title || !isBottom) && (
            <View style={styles.header}>
              {title && <Text style={styles.title}>{title}</Text>}
              {!isBottom && (
                <Pressable onPress={handleClose} accessibilityLabel="Fechar" style={styles.closeButton}>
                  <Text style={styles.closeText}>✕</Text>
                </Pressable>
              )}
            </View>
          )}
          <View style={[styles.content, { maxHeight: maxHeight === '100%' ? '100%' : undefined }, contentStyle] as ViewStyle[]}>
            {children}
          </View>
          {isBottom && <SafeAreaView style={styles.safeAreaBottom} />}
        </Animated.View>
      </Pressable>
    );
  }
);

Modal.displayName = 'Modal';

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.surface.overlayScrim,
  },
  container: {
    backgroundColor: colors.surface.primary,
    maxHeight: '90%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.neutral[300],
    borderRadius: borderRadius.full,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  title: {
    fontSize: typography.sizes.headingLg,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    fontFamily: typography.fontFamily,
    lineHeight: typography.lineHeights.headingLg,
  },
  closeButton: {
    padding: spacing[2],
  },
  closeText: {
    fontSize: typography.sizes.bodyLg,
    color: colors.neutral[600],
  },
  content: {
    padding: spacing[4],
    overflow: 'hidden',
  },
  safeAreaBottom: {
    flex: 1,
  },
});

// Convenience: BottomSheet alias
export const BottomSheet = Modal;