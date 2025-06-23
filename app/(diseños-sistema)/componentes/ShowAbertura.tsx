import { AberturaPresupuestoOption, ColorOption, CortinaOption, SerieOption } from "@/utils/constants/interfases";
import { cortinasEnum, CurrencyOption } from "@/utils/constants/variablesGlobales";
import { useTheme } from "@/utils/contexts/ThemeContext"
import { useRef, useState } from "react";
import { Pressable, View, Animated, Easing, Image } from "react-native"
import { Button, Dialog, Divider, Icon, Text } from "react-native-paper";
import SwipeableRow from "./SwipeableRow";

interface ShowAberturaProps {
    abertura: AberturaPresupuestoOption
    serie: SerieOption | undefined
    acabado: ColorOption | undefined
    peso_alum: number
    costo_alum: number
    mosquitero: number | null
    vidrio: number | null
    cortina: CortinaOption | null
    manoObra: number
    currency?: CurrencyOption
    isDeleting?: boolean;
    icon?: string | number | { uri: string }
    precio?: boolean
    onLongPress?: () => void
    onDelete?: (abertura: AberturaPresupuestoOption) => void

}

const ShowAbertura = ({ abertura, serie, acabado, peso_alum, costo_alum, mosquitero, vidrio, cortina, manoObra, currency, isDeleting, icon, precio, onLongPress, onDelete }: ShowAberturaProps) => {
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

    const costoCortina = () => {
        if (!cortina || cortina.tipo === cortinasEnum.ninguna) return 0;
        const ancho = abertura?.ancho || 0;
        const alto = abertura?.alto || 0;
        return (ancho * alto / 10000) * (cortina.preciom2 || 0);
    };

    const formatCurrency = (value: number) => {
        const rounded = Math.round(value * 10) / 10;
        if (currency === undefined) return `${rounded.toFixed(0)} US$`;
        if (currency.tipo === 'peso') {
            return `${(rounded * currency.multiplicador).toFixed(0)} ${currency.affix}`;
        }
        return `${(rounded * currency.multiplicador).toFixed(1)} ${currency.affix}`;
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
                marginVertical: 10,
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
                            {typeof icon === "number" || (typeof icon === "object" && icon !== null && "uri" in icon) ? (
                                <Image source={icon as any} style={{ width: 18, height: 18, tintColor: colors.secondary }} />
                            ) : (
                                <Icon source={icon || "star"} size={16} color={colors.secondary} />
                            )}
                            <Text variant="bodyMedium" style={{ textAlign: "left" }}>
                                {abertura?.cantidad || 0} {abertura?.tipo_abertura || ''} {abertura?.ancho || 0} x {abertura?.alto || 0}
                            </Text>
                        </View>
                        {precio === undefined || precio === true ? (
                            <Text variant="bodyMedium" style={{ color: colors.tertiary }}>
                                {formatCurrency((abertura?.precio_unitario || 0) * (abertura?.cantidad || 0))}
                            </Text>
                        ) : null}

                    </Animated.View>
                </Pressable >
            </SwipeableRow>
            {
                detalle ?
                    <View style={{ backgroundColor: colors.surface, borderRadius: 6, borderWidth: 0.3, borderColor: colors.outline, paddingVertical: 5 }}>
                        < View style={{ width: '80%', alignSelf: "center", flexDirection: "column", gap: 5 }}>
                            <Text variant="headlineMedium" style={{ color: colors.onPrimaryContainer, textAlign: "center" }}>Detalle Abertura</Text>
                            <Text variant="titleLarge" style={{}}>{serie?.nombre || ''}</Text>
                            <Text variant="titleLarge" style={{}}>Acabado: {acabado?.color || ''}</Text>
                            <Text variant="titleLarge" style={{}}>Peso total de aluminio: {peso_alum.toFixed(2)} kg</Text>
                        </View >
                        <Divider style={{ margin: 5, marginHorizontal: 30 }} />
                        <View style={{ width: '80%', alignSelf: "center", flexDirection: "column", gap: 5 }}>
                            <Text variant="headlineMedium" style={{ color: colors.onPrimaryContainer, textAlign: "center" }}>Costos</Text>
                            <View style={{ justifyContent: "space-between", flexDirection: "row" }}>
                                <Text variant="titleLarge" style={{}}>Aluminio:</Text>
                                <Text variant="titleLarge" style={{ color: colors.error }}>{formatCurrency(costo_alum)}</Text>
                            </View>
                            <View style={{ justifyContent: "space-between", flexDirection: "row" }}>
                                <Text variant="titleLarge" style={{}}>Accesorios:</Text>
                                <Text variant="titleLarge" style={{ color: colors.error }}>{formatCurrency(serie?.precio_accesorios || 0)}</Text>
                            </View>
                            {vidrio ?
                                <View style={{ justifyContent: "space-between", flexDirection: "row" }}>
                                    <Text variant="titleLarge" style={{}}>Vidrio:</Text>
                                    <Text variant="titleLarge" style={{ color: colors.error }}>{formatCurrency(vidrio)}</Text>
                                </View> : null}
                            {mosquitero ?
                                <View style={{ justifyContent: "space-between", flexDirection: "row" }}>
                                    <Text variant="titleLarge" style={{}}>Mosquitero:</Text>
                                    <Text variant="titleLarge" style={{ color: colors.error }}>{formatCurrency(mosquitero)}</Text>
                                </View> : null}
                            {cortina ?
                                <View style={{ justifyContent: "space-between", flexDirection: "row" }}>
                                    <Text variant="titleLarge" style={{}}>{cortina.tipo}</Text>
                                    <Text variant="titleLarge" style={{ color: colors.error }}>{formatCurrency(costoCortina())}</Text>
                                </View> : null}
                            <View style={{ justifyContent: "space-between", flexDirection: "row" }}>
                                <Text variant="titleLarge" style={{}}>Mano de obra:</Text>
                                <Text variant="titleLarge" style={{ color: colors.error }}>{formatCurrency(manoObra)}</Text>
                            </View>
                            <Divider style={{ margin: 5 }} />
                            <View style={{ justifyContent: "space-between", flexDirection: "row" }}>
                                <Text variant="headlineMedium" style={{}}>Subtotal:</Text>
                                <Text variant="headlineMedium" style={{ color: colors.error }}>{formatCurrency(abertura?.precio_unitario || 0)}</Text>
                            </View>
                        </View>
                    </View> : null}
        </Animated.View >
    );
}

export default ShowAbertura;