import { View, TouchableOpacity, StyleSheet } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Icon } from 'react-native-paper';
import Colors from '@/constants/Colors';
import { useEffect } from "react";

type SwipeableRowProps = {
    onPress: () => void;
    onDelete: () => void;
    children: React.ReactNode;
    isDeleting?: boolean;
};

const MAX_SWIPE = 90;
const SWIPE_THRESHOLD = 50;
const SWIPE_SENSITIVITY = 20;

const SwipeableRow: React.FC<SwipeableRowProps> = ({ onPress, onDelete, children, isDeleting }) => {
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
                <TouchableOpacity
                    style={styles.deleteTouchable}
                    onPress={() => {
                        translateX.value = withSpring(0, {}, () => runOnJS(onDelete)());
                    }}
                >
                    <Icon
                        source="delete"
                        size={40}
                        color={Colors.colors.complementario}
                    />
                </TouchableOpacity>
            </Animated.View>

            <GestureDetector gesture={panGesture}>
                <Animated.View style={[animatedStyle, { width: '100%' }]}>
                    <TouchableOpacity 
                        onPress={onPress}
                        activeOpacity={0.8}
                        style={{ width: '100%' }}
                    >
                        {children}
                    </TouchableOpacity>
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
        paddingHorizontal:25,
        paddingRight: 25,
        zIndex: -1,
    },
    deleteTouchable: {
        height: '100%',
        justifyContent: 'center',
    },
});

export default SwipeableRow;