import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Keyboard, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Button, Card, Chip, Portal, TextInput, Modal, Text } from 'react-native-paper';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Dropdown } from 'react-native-element-dropdown';
import { useBD } from '@/utils/contexts/BDContext';
import { calcularPrecioVentana } from '@/utils/_db/operacionesDB';
import { AberturasEnum, seriesEnum } from '@/utils/constants/variablesGlobales';
import { AberturaPresupuestoOption, ColorOption, ColorOptionDefault } from '@/utils/constants/interfases';
import Colors from '@/utils/constants/Colors';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/utils/contexts/ThemeContext';

interface AgregarAberturaProps {
    ventanaAEditar?: AberturaPresupuestoOption;
    handleDone: (ventana: AberturaPresupuestoOption) => void;
    handleClose: () => void;
    visible: boolean;
    hideModal: () => void;
    ref: React.RefObject<any>;
    id_col_anterior?: number;

}
export type AgregarAberturaRef = {
    open: () => void;
};
const AgregarAbertura = forwardRef<AgregarAberturaRef, AgregarAberturaProps>(
    ({ ventanaAEditar, handleDone, handleClose, visible, hideModal, id_col_anterior }, ref) => {
        const { colors, fonts } = useTheme();

        const { stateBD } = useBD();
        const { acabado, series, cortinas } = stateBD;
        console.log('acabado viene vacio por lo que sea', acabado);
        const aberturasCombo = [
            { label: AberturasEnum.ventana, value: AberturasEnum.ventana },
            { label: AberturasEnum.banderola, value: AberturasEnum.banderola },
            { label: AberturasEnum.puertaVenta, value: AberturasEnum.puertaVenta },
            { label: AberturasEnum.panioFijo, value: AberturasEnum.panioFijo },
            { label: AberturasEnum.puerta, value: AberturasEnum.puerta }
        ];
        const [visibleLocal, setVisibleLocal] = useState(true);
        const [state, setState] = useState<{
            ventana: AberturaPresupuestoOption,
            ancho: string,
            alto: string,
            cantidad: string,
            cargado: boolean
        }>({
            cargado: false,
            ventana: ventanaAEditar ?? {
                id: -1,
                alto: 120,
                tipo_abertura: AberturasEnum.ventana,
                ancho: 100,
                vidrio: true,
                mosquitero: false,
                id_serie: series[0].id,
                id_color_aluminio: id_col_anterior ?? acabado[0]?.id ?? -1,
                id_cortina: cortinas[0].id,
                cantidad: 1,
                precio_unitario: 0,
            },
            ancho: "100",
            alto: "120",
            cantidad: "1"
        });
        useImperativeHandle(ref, () => ({
            open: () => setVisibleLocal(true),
        }));
        const { ventana, ancho, alto, cantidad } = state;
        const [errors, setErrors] = useState({
            largo: false,
            ancho: false,
            serie: false,
            colorAluminio: false
        });

        const validateFields = () => {
            const newErrors = {
                largo: alto.trim() === '',
                ancho: ancho.trim() === '',
                serie: ventana.id_serie < 1,
                colorAluminio: ventana.id_color_aluminio < 1
            };

            setErrors(newErrors);
            return !Object.values(newErrors).some(error => error);
        };

        const handleSubmit = () => {
            if (validateFields()) {
                handleDone(ventana);
            }
        };
        const [colorPuerta, setColorPuerta] = useState(false);


        useEffect(() => {
            const fetchData = async () => {
                try {
                    const { alto, ancho, id_serie, id_color_aluminio } = ventana;
                    console.log('la serie no se guarda?', id_serie, 'ancho?', ancho, 'color aluminio', id_color_aluminio);

                    setState((prevState) => ({ ...prevState, ventana: { ...prevState.ventana, preciounitario: -2, precioTotal: -2 } }));
                    if (colorPuerta) {
                        console.log('ahora si entro');
                        setState((prevState) => ({ ...prevState, ventana: { ...prevState.ventana, precio_unitario: acabado.find(c => c.id === id_color_aluminio)?.precio_un_puerta || -1 } }));
                        setColorPuerta(false);
                    } else if (alto < 1 || ancho < 1 || id_serie === -1 || id_color_aluminio === -1 || isNaN(alto) || isNaN(ancho)) {
                        setState((prevState) => ({ ...prevState, ventana: { ...prevState.ventana, preciounitario: -1, precioTotal: -1 } }));
                    }
                    else {
                        const preciounitario = await calcularPrecioVentana(ventana);
                        setState((prevState) => ({ ...prevState, ventana: { ...prevState.ventana, precio_unitario: preciounitario } }));
                    }
                }
                catch (ex) {
                    console.log(ex);
                }

            };
            fetchData();
        }, [ventana.ancho, ventana.alto, ventana.id_serie, ventana.id_color_aluminio, ventana.id_cortina, ventana.mosquitero, ventana.vidrio, ventana.cantidad, ventana.tipo_abertura]);



        const handleAncho = (ancho: string) => {
            const nuevoValor = ancho.replace(/[^0-9.]/g, '');
            const number = Number.parseInt(nuevoValor);
            setState((prevState) => ({
                ...prevState,
                ventana: { ...prevState.ventana, ancho: !Number.isNaN(number) ? number : -1 },
                ancho: nuevoValor
            }));
        };
        const handleAlto = (largo: string) => {
            const nuevoValor = largo.replace(/[^0-9.]/g, '');
            const number = Number.parseInt(nuevoValor);
            setState((prevState) => ({
                ...prevState,
                ventana: { ...prevState.ventana, ancho: !Number.isNaN(number) ? number : -1 },
                alto: nuevoValor
            }));
        };

        const seriesSegunTipoAbertura = useMemo(() => {
            if ([AberturasEnum.banderola, AberturasEnum.ventana, AberturasEnum.puertaVenta].includes(ventana.tipo_abertura)) {
                // Obtener series válidas (excluyendo serieA30)
                const seriesFiltradas = series.filter(x => x.nombre !== seriesEnum.serieA30);

                // Si el id_serie actual no es válido para el nuevo tipo, resetearlo al primer elemento
                if (!seriesFiltradas.some(s => s.id === ventana.id_serie)) {
                    setState(prevState => ({
                        ...prevState,
                        ventana: {
                            ...prevState.ventana,
                            id_serie: seriesFiltradas[0]?.id ?? -1, // Usar el primer id disponible o -1 si no hay series
                        },
                    }));
                }

                return seriesFiltradas;
            } else {
                // Forzar serieA30 para puertas/panioFijo
                setState(prevState => ({
                    ...prevState,
                    ventana: {
                        ...prevState.ventana,
                        id_serie: 4, // id serie A30
                    },
                }));
                return series.filter(x => x.nombre === seriesEnum.serieA30);
            }
        }, [ventana.tipo_abertura, series]);

        const styles = StyleSheet.create({
            Container: {
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
            },
            ContainerMateriales: {
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: 10,
            },
            ContainerMaterialesChip: {
                flexDirection: 'row',
                gap: 10,
                alignItems: 'center',
                backgroundColor: 'transparent',
            },
            outputMaterial: {
                height: 40,
                borderWidth: 1.5,
                borderRadius: 4,
                paddingHorizontal: 10,
            },
            buttonContainer: {
                flexDirection: 'row',
                gap: 50,
                alignContent: 'center',
                justifyContent: 'space-between',
                marginBottom: 10,
                backgroundColor: 'transparent',
            },
            button: {
                backgroundColor: 'transparent',
                height: 40,
                justifyContent: 'center',
            },
            placeholderStyle: {
                color: Colors.colors.text,
            },
            inputError: {
                borderColor: Colors.colors.error,
                borderWidth: 1,
            },
            containerStyle: {
                padding: 20,
                margin: 20,
                borderRadius: 8,
                alignSelf: 'center',
                width: '95%',
                maxWidth: 500,
            },
        });

        return (
            <Portal>
                <Modal
                    visible={ventanaAEditar ? visible : visibleLocal}
                    onDismiss={ventanaAEditar ? hideModal : () => {
                        setVisibleLocal(false);
                        hideModal();
                    }}
                    contentContainerStyle={[styles.containerStyle, { backgroundColor: colors.background }]}
                    style={{ backgroundColor: colors.backdrop }}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>

                        <View style={{ width: '100%', alignItems: "center", alignSelf: 'center', backgroundColor: colors.background, marginTop: 10 }}>
                            <View style={{ flexDirection: 'column', gap: 15, alignContent: "center", alignItems: "center", width: '100%' }}>
                                <Text variant='titleMedium' style={{ textAlign: 'center' }}>Agregar Nueva Abertura</Text>
                                <View style={{
                                    flexDirection: 'row', justifyContent: "space-between",
                                    width: "100%", alignItems: "center"
                                }}>
                                    <Text variant='bodyMedium'>Aberturas</Text>
                                    <View style={{ width: "70%" }}>
                                        <Dropdown
                                            data={aberturasCombo}
                                            labelField="label"
                                            valueField="value"
                                            value={ventana.tipo_abertura}
                                            onChange={item => {
                                                if (AberturasEnum.puerta === item.value) {
                                                    setColorPuerta(true);
                                                }
                                                setState((prevState) => ({ ...prevState, ventana: { ...prevState.ventana, tipo_abertura: item.value } }))
                                            }

                                            }
                                            placeholder="Seleccione abertura"
                                            selectedTextStyle={{ color: colors.onBackground, fontSize: 14, fontFamily: fonts.bold.fontFamily }}
                                            style={[styles.outputMaterial, { backgroundColor: colors.background, borderColor: colors.outline }]}
                                            placeholderStyle={{ fontSize: 14 }}
                                            containerStyle={{ backgroundColor: colors.background }}
                                            activeColor={colors.primary}
                                            itemTextStyle={{ color: colors.onBackground, fontSize: 14, fontFamily: fonts.bold.fontFamily }}
                                            iconColor={colors.onBackground}
                                            showsVerticalScrollIndicator={false}
                                        />
                                    </View>
                                </View>
                                {ventana.tipo_abertura != AberturasEnum.puerta ? (
                                    <View style={{ flexDirection: 'row', gap: 10, justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                                        <Text variant='bodyMedium'>Dimensiones</Text>
                                        <View style={{ flexDirection: 'row', justifyContent: "flex-start", alignItems: "center", width: "70%", height: 40 }}>

                                            <TextInput
                                                label='Alto *'
                                                mode="outlined"
                                                error={errors.largo}
                                                style={{ height: 40, width: '40%', fontSize: 14, fontFamily: fonts.bold.fontFamily }}
                                                contentStyle={{ fontSize: 14, fontFamily: fonts.bold.fontFamily }}
                                                keyboardType="numeric"
                                                right={<TextInput.Affix text="cm" textStyle={{ marginRight: -12 }} />}
                                                maxLength={3}
                                                showSoftInputOnFocus={true}
                                                value={alto}
                                                onChangeText={handleAlto}
                                                outlineStyle={{ borderWidth: 1.5, height: 40 }}
                                            />
                                            <View style={{ width: "15%", borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
                                                <FontAwesome name="close" size={20} color={colors.onBackground} />
                                            </View>

                                            <TextInput
                                                label='Ancho *'
                                                mode="outlined"
                                                error={errors.ancho}
                                                maxLength={3}
                                                contentStyle={{ fontSize: 14, fontFamily: fonts.bold.fontFamily }}
                                                style={{ height: 40, width: '40%', fontSize: 14, fontFamily: fonts.bold.fontFamily }}
                                                outlineStyle={{ borderWidth: 1.5, height: 40 }}
                                                right={<TextInput.Affix text="cm" textStyle={{ marginRight: -12 }} />}
                                                showSoftInputOnFocus={true}
                                                keyboardType="numeric"
                                                value={ancho}
                                                onChangeText={handleAncho}
                                            />
                                        </View>
                                    </View>
                                ) : null}

                                {ventana.tipo_abertura != AberturasEnum.puerta ? (
                                    <View style={{
                                        flexDirection: 'row', justifyContent: "space-between",
                                        width: "100%", alignItems: "center"
                                    }}>
                                        <Text variant='bodyMedium'>Serie</Text>
                                        <View style={{ width: "70%" }}>
                                            <Dropdown
                                                data={seriesSegunTipoAbertura}
                                                labelField="nombre"
                                                valueField="id"
                                                style={[styles.outputMaterial, { backgroundColor: colors.background, borderColor: colors.outline }]}
                                                onChange={(item) => {
                                                    setState((prevState) => ({
                                                        ...prevState, ventana: {
                                                            ...prevState.ventana,
                                                            id_serie: item.id
                                                        }
                                                    }));
                                                    setErrors(prev => ({ ...prev, serie: false }));
                                                }}
                                                value={ventana.id_serie}
                                                placeholder="Selecciona la serie *"
                                                placeholderStyle={{ color: colors.onBackground }}
                                                activeColor={colors.primary}
                                                itemTextStyle={{ color: colors.onBackground, fontSize: 14, fontFamily: fonts.bold.fontFamily }}
                                                selectedTextStyle={{ color: colors.onBackground, fontSize: 14, fontFamily: fonts.bold.fontFamily }}
                                                containerStyle={{ backgroundColor: colors.background }}
                                                iconColor={colors.onBackground}
                                            />
                                        </View>
                                    </View>
                                ) : null}
                                {ventana.tipo_abertura != AberturasEnum.puerta ? (
                                    <View style={{ flexDirection: 'row', justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                                        <Text variant='bodyMedium'>Color</Text>
                                        <View style={{ width: "70%", backgroundColor: 'transparent' }}>
                                            <Dropdown
                                                data={acabado || ColorOptionDefault}
                                                labelField="color"
                                                valueField="id"
                                                onChange={(item: ColorOption) => {
                                                    setState((prevState) => ({
                                                        ...prevState, ventana: {
                                                            ...prevState.ventana,
                                                            id_color_aluminio: item.id
                                                        }
                                                    }));
                                                    setErrors(prev => ({ ...prev, colorAluminio: false }));
                                                }}
                                                value={ventana.id_color_aluminio}
                                                placeholder=" Selecciona el color *"
                                                style={[styles.outputMaterial, { backgroundColor: colors.background, borderColor: colors.outline }]}
                                                placeholderStyle={{ color: colors.onBackground }}
                                                activeColor={colors.primary}
                                                itemTextStyle={{ color: colors.onBackground, fontSize: 14, fontFamily: fonts.bold.fontFamily }}
                                                selectedTextStyle={{ color: colors.onBackground, fontSize: 14, fontFamily: fonts.bold.fontFamily }}
                                                containerStyle={{ backgroundColor: colors.background }}
                                                iconColor={colors.onBackground}
                                            />
                                        </View>
                                    </View>
                                ) : null}


                                {ventana.tipo_abertura != AberturasEnum.puerta ? (
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                                        <Text variant='bodyMedium'>Cortina</Text>
                                        <View style={{ width: "70%" }}>
                                            <Dropdown
                                                data={cortinas}
                                                labelField="tipo"
                                                valueField="id"
                                                onChange={(item) =>
                                                    setState((prevState) => ({
                                                        ...prevState, ventana: {
                                                            ...prevState.ventana,
                                                            id_cortina: item.id
                                                        }
                                                    }))}
                                                value={ventana.id_cortina}
                                                placeholder=" Selecciona la cortina"
                                                style={[styles.outputMaterial, { backgroundColor: colors.background, borderColor: colors.outline }]}
                                                placeholderStyle={{ color: colors.onBackground }}
                                                activeColor={colors.primary}
                                                itemTextStyle={{ color: colors.onBackground, fontSize: 14, fontFamily: fonts.bold.fontFamily }}
                                                selectedTextStyle={{ color: colors.onBackground, fontSize: 14, fontFamily: fonts.bold.fontFamily }}
                                                containerStyle={{ backgroundColor: colors.background }}
                                                iconColor={colors.onBackground}
                                            />
                                        </View>
                                    </View>
                                ) : null}

                                {ventana.tipo_abertura != AberturasEnum.puerta ? (
                                    <View style={styles.ContainerMaterialesChip}>
                                        <View style={{
                                            minWidth: 120,
                                        }}>
                                            <Chip
                                                icon={ventana.mosquitero ?
                                                    () => <MaterialCommunityIcons name="check" color={colors.onPrimary} size={20} /> :
                                                    () => <MaterialCommunityIcons name="close" color={colors.primary} size={20} />
                                                }
                                                onPress={() =>
                                                    setState((prevState) => ({
                                                        ...prevState, ventana: {
                                                            ...prevState.ventana,
                                                            mosquitero: !prevState.ventana.mosquitero
                                                        }
                                                    }))}
                                                style={{
                                                    borderRadius: 16,
                                                    backgroundColor: ventana.mosquitero ? colors.primary : colors.primaryContainer,
                                                }}
                                                textStyle={{ color: ventana.mosquitero ? colors.onPrimary : colors.onPrimaryContainer, }}
                                            >
                                                Mosquitero
                                            </Chip>
                                        </View>

                                        <View style={{
                                            minWidth: 120,
                                            backgroundColor: 'transparent',
                                        }}>
                                            <Chip
                                                icon={ventana.vidrio ?
                                                    () => <MaterialCommunityIcons name="check" color={colors.onPrimary} size={20} /> :
                                                    () => <MaterialCommunityIcons name="close" color="red" size={20} />
                                                }
                                                disabled={true}
                                                onPress={() =>
                                                    setState((prevState) => ({
                                                        ...prevState, ventana: {
                                                            ...prevState.ventana,
                                                            vidrio: !prevState.ventana.vidrio
                                                        }
                                                    }))}
                                                style={{
                                                    borderRadius: 16,
                                                    backgroundColor: ventana.vidrio ? colors.primary : colors.primaryContainer,
                                                }}
                                                textStyle={{ color: ventana.vidrio ? colors.onPrimary : colors.primary, }}
                                            >
                                                Vidrio
                                            </Chip>
                                        </View>
                                    </View>
                                ) : null}
                                {ventana.tipo_abertura === AberturasEnum.puerta ? (
                                    <View style={{
                                        flexDirection: 'row', justifyContent: "space-between",
                                        width: "100%", alignItems: "center"
                                    }}>
                                        <Text variant='bodyMedium'>Acabado: </Text>
                                        <View style={{ width: "70%", backgroundColor: 'transparent' }}>
                                            <Dropdown
                                                data={acabado || ColorOptionDefault}
                                                labelField="color"
                                                valueField="id"
                                                onChange={(item: ColorOption) => {
                                                    setColorPuerta(true);
                                                    setState((prevState) => ({
                                                        ...prevState, ventana: {
                                                            ...prevState.ventana,
                                                            id_color_aluminio: item.id
                                                        }
                                                    }));
                                                    setErrors(prev => ({ ...prev, serie: false }));
                                                }}
                                                value={ventana.id_color_aluminio}
                                                placeholder=" Selecciona la serie *"
                                                inputSearchStyle={{ height: 40 }}
                                                style={[styles.outputMaterial, { backgroundColor: colors.background, borderColor: colors.outline }]}
                                                placeholderStyle={{ color: colors.onBackground }}
                                                activeColor={colors.primary}
                                                itemTextStyle={{ color: colors.onBackground, fontSize: 14, fontFamily: fonts.bold.fontFamily }}
                                                selectedTextStyle={{ color: colors.onBackground, fontSize: 14, fontFamily: fonts.bold.fontFamily }}
                                                containerStyle={{ backgroundColor: colors.background }}
                                                iconColor={colors.onBackground}
                                            />
                                        </View>
                                    </View>
                                ) : null}


                                <View style={{ flexDirection: 'row', gap: 10, justifyContent: "space-between", alignItems: "center", width: "100%", backgroundColor: 'transparent' }}>
                                    <Text variant='bodyMedium'>Cantidad</Text>
                                    <View style={{ width: "70%", flexDirection: 'row', justifyContent: "flex-start", gap: 10 }}>
                                        <TextInput
                                            value={cantidad}
                                            onChangeText={(text) => {
                                                const newText = text.replace(/[^0-9]/g, '');
                                                setState((prevState) => ({
                                                    ...prevState,
                                                    cantidad: newText,
                                                    ventana: {
                                                        ...prevState.ventana,
                                                        cantidad: Number(newText)
                                                    }
                                                }))
                                            }}
                                            keyboardType="numeric"
                                            mode="outlined"
                                            style={{
                                                width: 120,
                                                alignSelf: 'center',
                                                height: 40,
                                            }}
                                            contentStyle={{ fontSize: 14, fontFamily: fonts.bold.fontFamily }}
                                            outlineStyle={{ borderWidth: 1 }}
                                            right={
                                                <TextInput.Icon
                                                    icon={() => (
                                                        <FontAwesome
                                                            name="plus"
                                                            size={18}
                                                            color={Number(ventana.cantidad) >= 100 ? colors.outline : colors.onBackground}
                                                        />
                                                    )}
                                                    onPress={() => {
                                                        if (Number(ventana.cantidad) < 100) {
                                                            setState((prevState) => ({
                                                                ...prevState,
                                                                cantidad: String(Number(prevState.ventana.cantidad) + 1),
                                                                ventana: {
                                                                    ...prevState.ventana,
                                                                    cantidad: prevState.ventana.cantidad + 1
                                                                }
                                                            }))
                                                        }
                                                        if (ventana.tipo_abertura === AberturasEnum.puerta) {
                                                            setColorPuerta(true);
                                                        }
                                                    }
                                                    }
                                                    disabled={Number(ventana.cantidad) >= 100}
                                                />
                                            }
                                            left={
                                                <TextInput.Icon
                                                    icon={() => (
                                                        <FontAwesome
                                                            name="minus"
                                                            size={18}
                                                            color={Number(ventana.cantidad) <= 0 ? colors.outline : colors.onBackground}
                                                        />
                                                    )}
                                                    onPress={() => {
                                                        if (Number(ventana.cantidad) > 0) {
                                                            setState((prevState) => ({
                                                                ...prevState,
                                                                cantidad: String(Math.max(0, Number(prevState.ventana.cantidad) - 1)),
                                                                ventana: {
                                                                    ...prevState.ventana,
                                                                    cantidad: Math.max(0, prevState.ventana.cantidad - 1),
                                                                }
                                                            }));
                                                        }
                                                        if (ventana.tipo_abertura === AberturasEnum.puerta) {
                                                            setColorPuerta(true);
                                                        }
                                                    }}
                                                    disabled={Number(ventana.cantidad) === 1}
                                                />
                                            }
                                            editable={false}
                                        />
                                        {

                                            <Card style={{
                                                flexGrow: 1,
                                                height: 40,
                                                marginLeft: 6,
                                                alignItems: 'center',
                                                backgroundColor: colors.surface,
                                                justifyContent: 'space-between',
                                            }}>
                                                <Text variant='bodySmall' style={{ color: colors.error }}>Precio sugerido</Text>
                                                <Text variant='bodySmall' style={{ fontSize: 12, alignSelf: 'center' }}>
                                                    {ventana.precio_unitario === -1 && 'No disponible'}
                                                    {ventana.precio_unitario === -2 && 'Cargando...'}
                                                    {ventana.precio_unitario > 0 && `$${(ventana.precio_unitario * ventana.cantidad).toFixed(1)}`}
                                                </Text>
                                            </Card>
                                        }
                                    </View>

                                </View>
                                <View style={styles.buttonContainer}>
                                    <Button
                                        mode="contained"
                                        onPress={handleSubmit}
                                        icon={() => <FontAwesome name="check" size={32} color={colors.primary} />}
                                        style={styles.button}
                                        labelStyle={{ color: colors.onBackground }}

                                    >
                                        Confirmar
                                    </Button>
                                    <Button
                                        mode="contained"
                                        onPress={handleClose}
                                        icon={() => <FontAwesome name="close" size={32} color={colors.error} />}
                                        style={styles.button}
                                        labelStyle={{ color: colors.onBackground }}
                                    >
                                        Cancelar
                                    </Button>
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            </Portal>
        );
    });

export default AgregarAbertura;

