import React, { forwardRef, useContext, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Keyboard, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { View, Text } from '../Themed';
import { Button, Card, Chip, Portal, TextInput, Modal } from 'react-native-paper';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Dropdown } from 'react-native-element-dropdown';
import { useBD } from '@/contexts/BDContext';
import { calcularPrecioVentana } from '@/app/utils/operacionesDB';
import { AberturasEnum, seriesEnum } from '@/constants/variablesGlobales';
import { AberturaPresupuestoOption, ColorOption } from '@/constants/interfases';
import Colors from '@/constants/Colors';

interface AgregarAberturaProps {
    ventanaAEditar?: AberturaPresupuestoOption;
    handleDone: (ventana: AberturaPresupuestoOption) => void;
    handleClose: () => void;
    visible: boolean;
    hideModal: () => void;
    ref: React.RefObject<any>;
}
export type AgregarAberturaRef = {
    open: () => void;
};
const AgregarAbertura = forwardRef<AgregarAberturaRef, AgregarAberturaProps>(
    ({ ventanaAEditar, handleDone, handleClose, visible, hideModal }, ref) => {
        const { stateBD } = useBD();
        const { colors, series, cortinas } = stateBD;
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
                id_color_aluminio: colors[0].id,
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
                        setState((prevState) => ({ ...prevState, ventana: { ...prevState.ventana, precio_unitario: colors.find(c => c.id === id_color_aluminio)?.precio_un_puerta || -1 } }));
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
                return series.filter(x => x.nombre !== seriesEnum.serieA30);
            }
            else {
                setState((prevState) => ({
                    ...prevState, ventana: {
                        ...prevState.ventana,
                        id_serie: 4 // id serie A30
                    }
                }));
                return series.filter(x => x.nombre == seriesEnum.serieA30);
            }
        }, [ventana.tipo_abertura]);
        return (
            <Portal>
                <Modal
                    visible={ventanaAEditar ? visible : visibleLocal}
                    onDismiss={ventanaAEditar ? hideModal : () => {
                        setVisibleLocal(false);
                        hideModal();
                    }}
                    contentContainerStyle={styles.containerStyle}
                    style={styles.modalBackground}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>

                        <View style={{ width: '100%', alignItems: "center", alignSelf: 'center', backgroundColor: Colors.colors.background_modal, marginTop: 10 }}>
                            <View style={{ flexDirection: 'column', gap: 15, alignContent: "center", alignItems: "center", width: '100%', backgroundColor: 'transparent' }}>
                                <Text style={{ textAlign: 'center', color: Colors.colors.text }}>Agregar Nueva Abertura</Text>
                                <View style={{
                                    flexDirection: 'row', justifyContent: "space-between",
                                    width: "100%", alignItems: "center", backgroundColor: Colors.colors.background_modal
                                }}>
                                    <Text style={{ color: Colors.colors.text }}>Aberturas</Text>
                                    <View style={{ width: "70%", backgroundColor: 'transparent' }}>
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
                                            selectedTextStyle={{ color: Colors.colors.text, fontSize: 14 }}
                                            style={styles.outputMaterial}
                                            placeholderStyle={{ color: Colors.colors.text, fontSize: 14 }}
                                            containerStyle={{ backgroundColor: Colors.colors.imput_black }}
                                            itemContainerStyle={{ height: 50, paddingVertical: -20 }}
                                            activeColor={Colors.colors.active_color}
                                            itemTextStyle={{ color: Colors.colors.text, fontSize: 12, marginVertical: -5 }}

                                            iconColor={Colors.colors.text}
                                            showsVerticalScrollIndicator={false}
                                        />
                                    </View>
                                </View>
                                {ventana.tipo_abertura != AberturasEnum.puerta ? (
                                    <View style={{ flexDirection: 'row', gap: 10, justifyContent: "space-between", alignItems: "center", width: "100%", backgroundColor: Colors.colors.background_modal }}>
                                        <Text style={{ color: Colors.colors.text }}>Dimensiones</Text>
                                        <View style={{ flexDirection: 'row', justifyContent: "flex-start", alignItems: "center", width: "70%", backgroundColor: 'transparent', height: 40 }}>

                                            <TextInput
                                                label='Alto *'
                                                mode="outlined"
                                                error={errors.largo}
                                                textColor={Colors.colors.text}
                                                style={{ height: 40, width: '40%', backgroundColor: Colors.colors.imput_black, fontSize: 14 }}
                                                keyboardType="numeric"
                                                right={<TextInput.Affix text="cm" textStyle={{ marginRight: -6, color: Colors.colors.text }} />}
                                                maxLength={3}
                                                showSoftInputOnFocus={true}
                                                value={alto}
                                                onChangeText={handleAlto}
                                                outlineStyle={{ borderWidth: 1.5, height: 40 }}
                                                theme={{
                                                    colors: {
                                                        error: Colors.colors.error,
                                                        placeholder: errors.largo ? Colors.colors.error : Colors.colors.text,
                                                        text: errors.largo ? Colors.colors.error : Colors.colors.text,
                                                        outline: errors.largo ? Colors.colors.error : Colors.colors.border_contraste_black,
                                                        primary: Colors.colors.complementario,
                                                        onSurfaceVariant: Colors.colors.text,
                                                    }
                                                }}
                                            />
                                            <View style={{ width: "15%", borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.colors.background_modal }}>
                                                <FontAwesome name="close" size={20} color={Colors.colors.text} />
                                            </View>

                                            <TextInput
                                                label='Ancho *'
                                                mode="outlined"
                                                error={errors.ancho}
                                                textColor={Colors.colors.text}
                                                maxLength={3}
                                                style={{ height: 40, width: '40%', backgroundColor: Colors.colors.imput_black, fontSize: 14 }}
                                                outlineStyle={{ borderWidth: 1.5, height: 40 }}
                                                right={<TextInput.Affix text="cm" textStyle={{ marginRight: -6, color: Colors.colors.text }} />}
                                                showSoftInputOnFocus={true}
                                                keyboardType="numeric"
                                                value={ancho}
                                                onChangeText={handleAncho}
                                                theme={{
                                                    colors: {
                                                        error: Colors.colors.error,
                                                        placeholder: errors.ancho ? Colors.colors.error : Colors.colors.text,
                                                        text: errors.ancho ? Colors.colors.error : Colors.colors.text,
                                                        outline: errors.ancho ? Colors.colors.error : Colors.colors.border_contraste_black,
                                                        primary: Colors.colors.complementario,
                                                        onSurfaceVariant: Colors.colors.text,
                                                    }
                                                }}
                                            />
                                        </View>
                                    </View>
                                ) : null}

                                {ventana.tipo_abertura != AberturasEnum.puerta ? (
                                    <View style={{
                                        flexDirection: 'row', justifyContent: "space-between",
                                        width: "100%", alignItems: "center", backgroundColor: Colors.colors.background_modal
                                    }}>
                                        <Text style={{ color: Colors.colors.text }}>Serie</Text>
                                        <View style={{ width: "70%", backgroundColor: 'transparent' }}>
                                            <Dropdown
                                                data={seriesSegunTipoAbertura}
                                                labelField="nombre"
                                                valueField="id"
                                                style={[styles.outputMaterial, errors.serie && styles.dropdownError]}
                                                itemContainerStyle={{ height: 50, paddingVertical: -20 }}
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
                                                placeholder=" Selecciona la serie *"
                                                placeholderStyle={{ color: errors.serie ? Colors.colors.error : Colors.colors.text }}
                                                activeColor={Colors.colors.active_color}
                                                itemTextStyle={{ color: Colors.colors.text, fontSize: 12, marginVertical: -5 }}
                                                selectedTextStyle={{ color: errors.serie ? Colors.colors.error : Colors.colors.text, fontSize: 14 }}
                                                containerStyle={{ backgroundColor: Colors.colors.imput_black, paddingVertical: 0 }}
                                                iconColor={errors.serie ? Colors.colors.error : Colors.colors.text}
                                                inputSearchStyle={{ height: 40 }}
                                            />
                                        </View>
                                    </View>
                                ) : null}
                                {ventana.tipo_abertura != AberturasEnum.puerta ? (
                                    <View style={{ flexDirection: 'row', justifyContent: "space-between", width: "100%", alignItems: "center", backgroundColor: Colors.colors.background_modal }}>
                                        <Text style={{ color: Colors.colors.text }}>Color</Text>
                                        <View style={{ width: "70%", backgroundColor: 'transparent' }}>
                                            <Dropdown
                                                data={colors}
                                                labelField="color"
                                                valueField="id"
                                                style={[styles.outputMaterial, errors.colorAluminio && styles.dropdownError]}
                                                itemContainerStyle={{ height: 50, paddingVertical: -20 }}
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
                                                placeholderStyle={{ color: errors.colorAluminio ? Colors.colors.error : Colors.colors.text, fontSize: 14 }}
                                                activeColor={Colors.colors.active_color}
                                                itemTextStyle={{ color: Colors.colors.text, fontSize: 12, marginVertical: -5 }}

                                                selectedTextStyle={{ color: errors.colorAluminio ? Colors.colors.error : Colors.colors.text, fontSize: 14 }}
                                                containerStyle={{ backgroundColor: Colors.colors.imput_black }}
                                                iconColor={errors.colorAluminio ? Colors.colors.error : Colors.colors.text}
                                            />
                                        </View>
                                    </View>
                                ) : null}


                                {ventana.tipo_abertura != AberturasEnum.puerta ? (
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", backgroundColor: Colors.colors.background_modal, }}>
                                        <Text style={{ color: Colors.colors.text }}>Cortina</Text>
                                        <View style={{ width: "70%", backgroundColor: 'transparent' }}>
                                            <Dropdown
                                                data={cortinas}
                                                labelField="tipo"
                                                valueField="id"
                                                style={styles.outputMaterial}
                                                itemContainerStyle={{ height: 50, paddingVertical: -20 }}
                                                selectedTextStyle={{ color: Colors.colors.text, backgroundColor: Colors.colors.imput_black, fontSize: 11 }}
                                                containerStyle={{ backgroundColor: Colors.colors.imput_black }}
                                                activeColor={Colors.colors.active_color}
                                                itemTextStyle={{ color: Colors.colors.text, fontSize: 10, marginVertical: -2 }}

                                                onChange={(item) =>
                                                    setState((prevState) => ({
                                                        ...prevState, ventana: {
                                                            ...prevState.ventana,
                                                            id_cortina: item.id
                                                        }
                                                    }))}
                                                value={ventana.id_cortina}
                                                placeholder=" Selecciona la cortina"
                                                placeholderStyle={{ color: Colors.colors.text, fontSize: 14 }}
                                                iconColor={Colors.colors.text}
                                            />
                                        </View>
                                    </View>
                                ) : null}

                                {ventana.tipo_abertura != AberturasEnum.puerta ? (
                                    <View style={styles.ContainerMaterialesChip}>
                                        <View style={{
                                            minWidth: 120,
                                            backgroundColor: 'transparent',
                                        }}>
                                            <Chip
                                                icon={ventana.mosquitero ? "check" : "close"}
                                                onPress={() =>
                                                    setState((prevState) => ({
                                                        ...prevState, ventana: {
                                                            ...prevState.ventana,
                                                            mosquitero: !prevState.ventana.mosquitero
                                                        }
                                                    }))}
                                                textStyle={{ color: Colors.colors.text }}
                                                style={{
                                                    borderRadius: 16,
                                                    backgroundColor: ventana.mosquitero ? Colors.colors.complementario : Colors.colors.border_contraste_black,
                                                }}
                                                theme={{
                                                    colors: {
                                                        primary: Colors.colors.text   // Color del ícono cuando es "close"
                                                    }
                                                }}
                                            >
                                                Mosquitero
                                            </Chip>
                                        </View>

                                        <View style={{
                                            minWidth: 120,
                                            backgroundColor: 'transparent',
                                        }}>
                                            <Chip
                                                icon={ventana.vidrio ? "check" : "close"}
                                                disabled={true}
                                                onPress={() =>
                                                    setState((prevState) => ({
                                                        ...prevState, ventana: {
                                                            ...prevState.ventana,
                                                            vidrio: !prevState.ventana.vidrio
                                                        }
                                                    }))}
                                                textStyle={{ color: Colors.colors.text }}
                                                style={{
                                                    borderRadius: 16,
                                                    backgroundColor: ventana.vidrio ? Colors.colors.complementarioText : Colors.colors.border_contraste_black,
                                                }}
                                                theme={{
                                                    colors: {
                                                        primary: Colors.colors.text   // Color del ícono cuando es "close"
                                                    }
                                                }}
                                            >
                                                Vidrio
                                            </Chip>
                                        </View>
                                    </View>
                                ) : null}
                                {ventana.tipo_abertura === AberturasEnum.puerta ? (
                                    <View style={{
                                        flexDirection: 'row', justifyContent: "space-between",
                                        width: "100%", alignItems: "center", backgroundColor: Colors.colors.background_modal
                                    }}>
                                        <Text style={{ color: Colors.colors.text }}>Acabado: </Text>
                                        <View style={{ width: "70%", backgroundColor: 'transparent' }}>
                                            <Dropdown
                                                data={colors}
                                                labelField="color"
                                                valueField="id"
                                                style={[styles.outputMaterial, errors.serie && styles.dropdownError]}
                                                itemContainerStyle={{ height: 50, paddingVertical: -20 }}
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
                                                placeholderStyle={{ color: errors.serie ? Colors.colors.error : Colors.colors.text }}
                                                activeColor={Colors.colors.active_color}
                                                itemTextStyle={{ color: Colors.colors.text, fontSize: 12, marginVertical: -5 }}

                                                selectedTextStyle={{ color: errors.serie ? Colors.colors.error : Colors.colors.text, fontSize: 14 }}
                                                containerStyle={{ backgroundColor: Colors.colors.imput_black }}
                                                iconColor={errors.serie ? Colors.colors.error : Colors.colors.text}
                                                inputSearchStyle={{ height: 40 }}
                                            />
                                        </View>
                                    </View>
                                ) : null}


                                <View style={{ flexDirection: 'row', gap: 10, justifyContent: "space-between", alignItems: "center", width: "100%", backgroundColor: 'transparent' }}>
                                    <Text style={{ color: Colors.colors.text }}>Cantidad</Text>
                                    <View style={{ width: "70%", flexDirection: 'row', justifyContent: "flex-start", gap: 10, backgroundColor: Colors.colors.background_modal }}>
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
                                            textColor={Colors.colors.text}
                                            keyboardType="numeric"
                                            mode="outlined"
                                            style={{
                                                width: 120,
                                                backgroundColor: Colors.colors.imput_black,
                                                alignSelf: 'center',
                                                height: 40,
                                            }}
                                            outlineStyle={{ borderWidth: 1 }}
                                            theme={{
                                                colors: {
                                                    primary: Colors.colors.border_contraste_black,
                                                    outline: Colors.colors.border_contraste_black,
                                                    background: Colors.colors.border_contraste_black,
                                                    text: Colors.colors.text,
                                                    placeholder: Colors.colors.border_contraste_black,
                                                }
                                            }}
                                            right={
                                                <TextInput.Icon
                                                    icon={() => (
                                                        <FontAwesome
                                                            name="plus"
                                                            size={18}
                                                            color={Number(ventana.cantidad) >= 100 ? Colors.colors.border_contraste_black : Colors.colors.text}
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
                                                            color={Number(ventana.cantidad) <= 0 ? Colors.colors.border_contraste_black : Colors.colors.text}
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
                                                backgroundColor: Colors.colors.imput_black,
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                            }}>
                                                <Text style={{ color: 'red', fontSize: 8 }}>Precio sugerido</Text>
                                                <Text style={{ color: Colors.colors.text, fontSize: 12, alignSelf: 'center' }}>
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
                                        icon={() => <FontAwesome name="check" size={32} color="green" />}
                                        style={styles.button}
                                        labelStyle={{ color: Colors.colors.text, fontWeight: 'bold' }}

                                    >
                                        Confirmar
                                    </Button>
                                    <Button
                                        mode="contained"
                                        onPress={handleClose}
                                        icon={() => <FontAwesome name="close" size={32} color={Colors.colors.error} />}
                                        style={styles.button}
                                        labelStyle={{ color: Colors.colors.text, fontWeight: 'bold' }}
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
        borderColor: Colors.colors.border_contraste_black,
        borderWidth: 1.5,
        borderRadius: 4,
        backgroundColor: Colors.colors.imput_black,
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
    dropdownError: {
        borderColor: Colors.colors.error,
        borderWidth: 1,
    },
    inputError: {
        borderColor: Colors.colors.error,
        borderWidth: 1,
    },
    modalBackground: {
        backgroundColor: Colors.colors.transparencia_modal,
    },
    containerStyle: {
        backgroundColor: Colors.colors.background_modal,
        padding: 20,
        margin: 20,
        borderRadius: 8,
        alignSelf: 'center',
        width: '95%',
        maxWidth: 500,
    },
});