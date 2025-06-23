import React, { useRef } from "react";
import { Animated, Easing, Pressable, View } from "react-native";
import { Card, List, Text } from "react-native-paper";
import { PresupuestosOption } from "@/utils/constants/interfases";
import SwipeableRow from "@/app/(diseños-sistema)/componentes/SwipeableRow"
import { useTheme } from '@/utils/contexts/ThemeContext';
import { transparent } from "react-native-paper/lib/typescript/styles/themes/v2/colors";


export default function ItemList({ presupuesto, onPress, onLongPress, onDelete, isDeleting }: {
    presupuesto: PresupuestosOption,
    onPress?: () => void,
    onLongPress?: () => void,
    onDelete: () => void;
    isDeleting: boolean,
}) {
    const { colors } = useTheme();
    const pressProgress = useRef(new Animated.Value(0)).current;

    // Animación al mantener presionado
    const startPressAnimation = () => {
        Animated.timing(pressProgress, {
            toValue: 1,
            duration: 500, // Duración del long press
            easing: Easing.linear,
            useNativeDriver: false, // Necesario para animar backgroundColor
        }).start();
    };

    // Animación al soltar
    const resetPressAnimation = () => {
        Animated.timing(pressProgress, {
            toValue: 0,
            duration: 300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
        }).start();
    };

    // Manejador combinado para long press
    const handleLongPress = () => {
        onLongPress?.();
        resetPressAnimation();
    };

    // Interpolación del color de fondo
    const animatedBackground = pressProgress.interpolate({
        inputRange: [0, 0, 1],
        outputRange: [
            'transparent',
            colors.tertiaryContainer,
            colors.tertiary
        ]
    });

    // Interpolación para escala (opcional)
    const animatedScale = pressProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.96]
    });


    return (
        <Animated.View
            style={{
                transform: [{ scale: animatedScale }],
                backgroundColor: animatedBackground,
                borderRadius: 8,
                alignItems: "center"
            }}
        >
            <SwipeableRow
                onLongPress={handleLongPress}
                onPress={onPress}
                onDelete={onDelete}
                isDeleting={isDeleting}
                onPressIn={startPressAnimation}
                onPressOut={resetPressAnimation}
                delayLongPress={500}
            >
                <Card style={{
                    borderRadius: 8,
                    borderColor: colors.primary,
                    backgroundColor: colors.surface,
                    width: '98%',
                    alignSelf: 'center',
                    borderWidth: 1,
                }}>
                    <List.Section
                        style={{
                            marginVertical: 4
                        }}>

                        <List.Item
                            title={
                                <Text>
                                    <Text variant="bodyMedium"> Cliente: </Text>
                                    <Text variant="titleSmall">{presupuesto.nombre_cliente.substring(0, 30)}</Text>
                                </Text>
                            }
                            description={
                                <View style={{ flexDirection: "row", justifyContent: "space-between", width: '90%' }}>
                                    <Text>
                                        <Text variant="headlineMedium">  Fecha: </Text>
                                        <Text variant="titleLarge">{presupuesto.fecha?.toLocaleDateString() || 0}</Text>
                                    </Text>
                                    <Text >
                                        <Text variant="headlineMedium">Total: </Text>
                                        <Text variant="titleLarge">{presupuesto.precio_total.toFixed(2)}</Text>
                                    </Text>
                                </View>
                            }
                            left={props => <List.Icon {...props} icon="star" color={colors.secondary} />}
                        />
                    </List.Section>
                </Card>
            </SwipeableRow>
        </Animated.View >
    );
}

