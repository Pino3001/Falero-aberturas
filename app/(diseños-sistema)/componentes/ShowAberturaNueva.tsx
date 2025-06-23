import { AberturaPresupuestoOption, ColorOption, CortinaOption, SerieOption } from "@/utils/constants/interfases";
import { AberturasEnum, cortinasEnum, CurrencyOption } from "@/utils/constants/variablesGlobales";
import { useTheme } from "@/utils/contexts/ThemeContext"
import { useRef, useState } from "react";
import { Pressable, View, Animated, Easing, Image } from "react-native"
import { Button, Dialog, Divider, Icon, Text } from "react-native-paper";
import SwipeableRow from "./SwipeableRow";
const ventanaIcon = require('@/assets/images/ventana.png');
const ventana3HojasIcon = require('@/assets/images/ventana con 3 hojas.png');
const ventanaCortinaIcon = require('@/assets/images/ventana con cortina.png');

interface ShowAberturaProps {
    abertura: AberturaPresupuestoOption
    serie: SerieOption | undefined
    acabado: ColorOption | undefined
    cortina: CortinaOption | null
    isDeleting?: boolean;
    onLongPress?: () => void
    onDelete?: (abertura: AberturaPresupuestoOption) => void
}

const ShowAberturaNueva = ({ abertura, serie, acabado, cortina, isDeleting, onLongPress, onDelete }: ShowAberturaProps) => {
    const { colors } = useTheme();
    const [detalle, setDetalle] = useState(false);
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

    const mostrarDetalle = () => {
        if (detalle) {
            setDetalle(false);
        } else {
            setDetalle(true);
        }
    }

    const formatCurrency = (value: number) => {
        const rounded = Math.round(value * 10) / 10;
        return `${rounded.toFixed(0)} US$`;
    };

    const handleDelete = async (item: AberturaPresupuestoOption) => {
        onDelete?.(item); // Llama a la función proporcionada por el padre
    };

    return (
        <Animated.View
            style={{
                transform: [{ scale: animatedScale }],
                width: '90%',
                alignSelf: 'center',
                marginVertical: 3,

            }}
        >
            <SwipeableRow
                onDelete={() => { handleDelete(abertura) }}
                size={24}
                isDeleting={isDeleting}
            >
                <Pressable
                    onPress={mostrarDetalle}
                    onPressIn={startPressAnimation}
                    onPressOut={resetPressAnimation}
                    onLongPress={handleLongPress}
                    delayLongPress={500}
                >
                    <Animated.View
                        style={[{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            gap: 5,
                            padding: 8,
                            borderRadius: 6,
                            backgroundColor: animatedBackground,
                        }]}
                    >
                        <View style={{ alignItems: "center", flexDirection: "row", gap: 10 }}>
                            <Image
                                source={
                                    abertura.id_serie === 3
                                        ? ventana3HojasIcon
                                        : cortina?.tipo !== cortinasEnum.ninguna
                                            ? ventanaCortinaIcon
                                            : ventanaIcon
                                }
                                style={{
                                    tintColor: colors.tertiary,
                                    width: 24,
                                    height: 24,
                                }}
                            />
                            <Text variant="bodyMedium" style={{ textAlign: "left" }}>
                                {abertura?.cantidad || 0} {abertura?.tipo_abertura || ''} {abertura?.ancho || 0}cm x {abertura?.alto || 0}cm
                            </Text>
                        </View>

                    </Animated.View>
                </Pressable >
            </SwipeableRow>
            {
                detalle ?
                    <View style={{ backgroundColor: colors.surface, borderRadius: 6, borderWidth: 0.3, borderColor: colors.outline, paddingVertical: 5 }}>
                        < View style={{ width: '80%', alignSelf: "center", flexDirection: "column", gap: 5 }}>
                            <Text variant="headlineMedium" style={{ color: colors.onPrimaryContainer, textAlign: "center" }}>Detalle Abertura</Text>
                            <Text variant="titleLarge" style={{}}>{serie?.nombre || ''}</Text>
                            <Text variant="titleLarge" style={{}}>Acabado {acabado?.color || ''}</Text>
                            {abertura.tipo_abertura !== AberturasEnum.puerta ?
                                (
                                    cortina?.tipo !== cortinasEnum.ninguna ?
                                        <Text variant="titleLarge" style={{}}>{cortina?.tipo || ''}</Text>
                                        : <Text variant="titleLarge" style={{}}>Sin Cortina</Text>
                                )
                                : null
                            }
                            {abertura.tipo_abertura !== AberturasEnum.puerta ?
                                (
                                    abertura.mosquitero ?
                                        <Text variant="titleLarge" style={{}}>Con Mosquitero</Text>
                                        : <Text variant="titleLarge" style={{}}>Sin Mosquitero</Text>
                                )
                                : null
                            }

                        </View >
                        <Divider style={{ margin: 5, marginHorizontal: 30 }} />
                        <View style={{ width: '80%', alignSelf: "center", flexDirection: "column", gap: 5 }}>
                            <View style={{ justifyContent: "space-between", flexDirection: "row" }}>
                                <Text variant="headlineMedium" style={{}}>Subtotal:</Text>
                                <Text variant="headlineMedium" style={{ color: colors.error }}>{formatCurrency(abertura?.precio_unitario || 0)}</Text>
                            </View>
                        </View>
                    </View> : null}

        </Animated.View >
    )
}

export default ShowAberturaNueva;