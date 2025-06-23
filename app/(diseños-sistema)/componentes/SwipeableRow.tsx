import { View, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Icon, useTheme } from 'react-native-paper';
import { useEffect } from "react";

type SwipeableRowProps = {
    onPress?: () => void;
    onLongPress?: () => void;
    onDelete: () => void;
    onPressIn?: () => void;
    onPressOut?: () => void;
    delayLongPress?: number;
    children: React.ReactNode;
    isDeleting?: boolean;
    size?: number;
};

const MAX_SWIPE = 90;
const SWIPE_THRESHOLD = 50;
const SWIPE_SENSITIVITY = 20;

const SwipeableRow: React.FC<SwipeableRowProps> = ({ onPress, onDelete, children, isDeleting, size, onLongPress, onPressIn, onPressOut, delayLongPress }) => {
    const { colors } = useTheme();
    const translateX = useSharedValue(0);
    const isSwiping = useSharedValue(false);
    const startX = useSharedValue(0);

    useEffect(() => {
        if (!isDeleting) {
            translateX.value = withSpring(0);
        }
    }, [isDeleting]);

    const panGesture = Gesture.Pan()
        .onBegin((event) => {
            startX.value = event.absoluteX;
            isSwiping.value = false;
        })
        .onUpdate((event) => {
            if (startX.value < 100) {
                if (Math.abs(event.translationX) > SWIPE_SENSITIVITY) {
                    isSwiping.value = true;
                }
                if (isSwiping.value) {
                    translateX.value = Math.min(event.translationX, MAX_SWIPE);
                }
            }
        })
        .onEnd((event) => {
            if (isSwiping.value && event.translationX > SWIPE_THRESHOLD) {
                translateX.value = withSpring(MAX_SWIPE, {}, () => runOnJS(onDelete)());
            } else {
                translateX.value = withSpring(0);
            }
            isSwiping.value = false;
        })
        .activeOffsetX([-10, 10])
        .failOffsetY([-20, 20]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const deleteButtonStyle = useAnimatedStyle(() => ({
        opacity: translateX.value > 20 ? 1 : 0,
        transform: [{ translateX: translateX.value - MAX_SWIPE }],
    }));

    return (
        <View style={styles.container}>
            <Animated.View
                style={[styles.deleteButton, deleteButtonStyle]}>
                <Pressable
                    onPress={() => {
                        translateX.value = withSpring(0, {}, () => runOnJS(onDelete)());
                    }}
                >
                    <Icon
                        source="delete"
                        size={size ? size : 40}
                        color={colors.error}
                    />
                </Pressable>
            </Animated.View>

            <GestureDetector gesture={panGesture}>
                <Animated.View style={[animatedStyle, { width: '100%' }]}>
                    <Pressable
                        onPress={onPress}
                        onLongPress={onLongPress} // Corregir según el nombre del prop
                        onPressIn={onPressIn}   // Pasar el handler correctamente
                        onPressOut={onPressOut}  // Pasar el handler correctamente
                        delayLongPress={delayLongPress}
                        style={{ width: '100%' }}
                    >
                        {children}
                    </Pressable>
                </Animated.View>
            </GestureDetector>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        marginVertical: 4,
        width: '100%',
    },
    deleteButton: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        alignItems: 'flex-start',
        width: MAX_SWIPE,
        justifyContent: 'center',
        paddingHorizontal: 25,
        paddingRight: 25,
        zIndex: -1,
    },
    deleteTouchable: {
        height: '100%',
        justifyContent: 'center',
    },
});

export default SwipeableRow;