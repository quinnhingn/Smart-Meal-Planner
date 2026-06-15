import React, { useRef, useEffect, useState } from 'react';
import {
  View, StyleSheet, Animated, PanResponder, Dimensions,
  TouchableWithoutFeedback, Keyboard, Platform
} from 'react-native';
// Đảm bảo đường dẫn này khớp với cấu trúc dự án của bạn
import { COLORS, SHADOWS } from '../../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * InteractiveBottomSheet
 * A gesture-driven bottom sheet supporting snap points and smooth dismissal.
 * * Props:
 * - isVisible (bool)
 * - onClose (func)
 * - children (node): The content (can be ScrollView)
 * - snapPoints (array): e.g. [0.5, 0.9] -> 50% and 90% of screen height
 * - initialSnapIndex (number): index of snapPoints to start at
 */
const InteractiveBottomSheet = ({
  isVisible,
  onClose,
  children,
  snapPoints = [0.5, 0.9],
  initialSnapIndex = 0
}) => {
  const [isOpen, setIsOpen] = useState(isVisible);

  // Calculate pixel values for snap points (from top of screen)
  const snapPixels = snapPoints.map(p => SCREEN_HEIGHT * (1 - p));
  const hiddenY = SCREEN_HEIGHT;
  const initialY = snapPixels[initialSnapIndex] || snapPixels[0];

  const translateY = useRef(new Animated.Value(hiddenY)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Track the Y position where the pan started for resistance calculation
  const panStartY = useRef(0);

  useEffect(() => {
    if (isVisible) {
      // Đảm bảo view được render (isOpen = true) trước khi chạy animation
      setIsOpen(true);
      // Dùng setTimeout/requestAnimationFrame để animation bắt đầu MƯỢT sau khi mount
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: initialY,
            useNativeDriver: false,
            bounciness: 4,
            speed: 12
          }),
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false
          })
        ]).start();
      }, 50);
    } else {
      if (isOpen) {
        closeSheet();
      }
    }
  }, [isVisible]);

  const closeSheet = () => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: hiddenY,
        duration: 250,
        useNativeDriver: false
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false
      })
    ]).start(() => {
      setIsOpen(false);
      if (onClose) onClose();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only claim responder if dragging vertically more than horizontally
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        // 1. Dừng mọi animation đang chạy lỡ dở
        translateY.stopAnimation();

        // 2. Chuyển vị trí thực tế hiện tại vào offset và reset value về 0 một cách an toàn
        translateY.extractOffset();

        // 3. Lấy vị trí bắt đầu chuẩn xác từ offset (_offset là thuộc tính private nhưng an toàn để đọc)
        panStartY.current = translateY._offset;
      },
      onPanResponderMove: (_, gestureState) => {
        // Prevent dragging above the highest snap point (lowest Y)
        const highestSnap = Math.min(...snapPixels);
        const projectedY = panStartY.current + gestureState.dy;

        if (projectedY < highestSnap) {
          // Add resistance when pulling past the highest snap point
          const maxDy = highestSnap - panStartY.current;
          const overflowDy = gestureState.dy - maxDy;
          translateY.setValue(maxDy + overflowDy * 0.2);
        } else {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Gộp offset vào value hiện tại
        translateY.flattenOffset();
        const velocityY = gestureState.vy;

        // 4. Tính toán finalY trực tiếp bằng toán học
        const finalY = panStartY.current + gestureState.dy;

        // If dragged down fast -> close
        if (velocityY > 1.5) {
          closeSheet();
          return;
        }

        // If dragged up fast -> go to highest snap
        if (velocityY < -1.5) {
          Animated.spring(translateY, {
            toValue: Math.min(...snapPixels),
            useNativeDriver: false,
            bounciness: 4,
            speed: 12
          }).start();
          return;
        }

        // Find closest snap point
        const allPoints = [...snapPixels, hiddenY];
        const closestPoint = allPoints.reduce((prev, curr) =>
          Math.abs(curr - finalY) < Math.abs(prev - finalY) ? curr : prev
        );

        if (closestPoint === hiddenY) {
          closeSheet();
        } else {
          Animated.spring(translateY, {
            toValue: closestPoint,
            useNativeDriver: false,
            bounciness: 4,
            speed: 12
          }).start();
        }
      }
    })
  ).current;

  if (!isOpen) return null;

  return (
    <View style={styles.overlay}>
      <TouchableWithoutFeedback onPress={closeSheet}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.sheetContainer,
          { top: translateY }
        ]}
      >
        {/* Drag Handle Area */}
        <View style={styles.handleArea} {...panResponder.panHandlers}>
          <View style={styles.handlePill} />
        </View>

        {/* Content Area */}
        <View style={styles.content}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    ...SHADOWS?.dark, // Dùng optional chaining phòng trường hợp SHADOWS.dark chưa khai báo chuẩn
    shadowColor: '#000', // Các thuộc tính shadow dự phòng
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  handleArea: {
    width: '100%',
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  handlePill: {
    width: 48,
    height: 6,
    backgroundColor: '#D0D0D0',
    borderRadius: 3,
  },
  content: {
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24, // Safe area bottom
  }
});

export default InteractiveBottomSheet;