import React, { useRef, useEffect, useState } from 'react';
import { 
  View, StyleSheet, Animated, PanResponder, Dimensions, 
  TouchableWithoutFeedback, Keyboard, Platform 
} from 'react-native';
import { COLORS, SHADOWS } from '../../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * InteractiveBottomSheet
 * A gesture-driven bottom sheet supporting snap points and smooth dismissal.
 * 
 * Props:
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

  // Track the current Y position for pan logic
  const currentY = useRef(hiddenY);
  translateY.addListener(({ value }) => {
    currentY.current = value;
  });

  useEffect(() => {
    if (isVisible) {
      setIsOpen(true);
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
    } else {
      closeSheet();
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
        translateY.setOffset(currentY.current);
        translateY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        // Prevent dragging above the highest snap point (lowest Y)
        const highestSnap = Math.min(...snapPixels);
        if (currentY.current + gestureState.dy < highestSnap - 20) {
          // Add resistance
          translateY.setValue(gestureState.dy * 0.2);
        } else {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        translateY.flattenOffset();
        const velocityY = gestureState.vy;
        const finalY = currentY.current;

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
    ...SHADOWS.dark,
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
