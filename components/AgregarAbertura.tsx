import React, { forwardRef, useContext, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Keyboard, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { View, Text } from './Themed';
import { Button, Card, Chip, Portal, TextInput, Modal } from 'react-native-paper';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Dropdown } from 'react-native-element-dropdown';
import { Ventana } from './EditNuevoPresupuesto';
import { useBD } from '../contexts/BDContext';
import { calcularPrecioVentana } from '@/app/utils/utilsDB';
import { AberturasEnum, seriesEnum } from '@/constants/variablesGlobales';
import { AberturaPresupuestoOption, ColorOption } from '@/app/utils/interfases';

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


        useEffect(() => {
            const fetchData = async () => {
                try {
                    console.log("calculo precio en proceso");
                    const { alto, ancho, id_serie, id_color_aluminio } = ventana;
                    setState((prevState) => ({ ...prevState, ventana: { ...prevState.ventana, preciounitario: -2, precioTotal: -2 } }));

                    if (alto < 1 || ancho < 1 || id_serie === -1 || id_color_aluminio === -1) {
                        console.log("alto:", alto);
                        console.log("ancho:", ancho);
                        console.log("id_serie:", id_serie);
                        console.log("id_color_aluminio:", id_color_aluminio);
                        setState((prevState) => ({ ...prevState, ventana: { ...prevState.ventana, preciounitario: -1, precioTotal: -1 } }));
                    }
                    else {
                        const preciounitario = await calcularPrecioVentana(ventana);
                        console.log("preciounitario:", preciounitario);
                        setState((prevState) => ({ ...prevState, ventana: { ...prevState.ventana, precio_unitario: preciounitario } }));
                    }
                }
                catch (ex) {
                    console.log(ex);
                }

            };
            fetchData();
        }, [ventana.ancho, ventana.alto, ventana.id_serie, ventana.id_color_aluminio, ventana.id_cortina, ventana.mosquitero, ventana.vidrio, ventana.cantidad]);



        const handleAncho = (ancho: string) => {
            const nuevoValor = ancho.replace(/[^0-9.]/g, '');
            const number = Number.parseInt(nuevoValor);
            setState((prevState) => ({
                ...prevState,
                ventana: { ...prevState.ventana, ancho: Number.isNaN(number) ? number : -1 },
                ancho: nuevoValor
            }));
        };
        const handleAlto = (largo: string) => {
            const nuevoValor = largo.replace(/[^0-9.]/g, '');
            const number = Number.parseInt(nuevoValor);
            setState((prevState) => ({
                ...prevState,
                ventana: { ...prevState.ventana, ancho: Number.isNaN(number) ? number : -1 },
                alto: nuevoValor
            }));
        };
        const seriesSegunTipoAbertura = useMemo(() => {
            if ([AberturasEnum.banderola, AberturasEnum.ventana, AberturasEnum.puertaVenta].includes(ventana.tipo_abertura)) {
                return series.filter(x => x.nombre !== seriesEnum.serieA30);
            }
            else {
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

                        <View style={{ width: '100%', alignItems: "center", alignSelf: 'center', backgroundColor: '#1E1E1E', marginTop: 10 }}>
                            <View style={{ flexDirection: 'column', gap: 15, alignContent: "center", alignItems: "center", width: '100%', backgroundColor: 'transparent' }}>
                                <Text style={{ textAlign: 'center' }}>Agregar Nueva Abertura</Text>
                                <View style={{
                                    flexDirection: 'row', justifyContent: "space-between",
                                    width: "100%", alignItems: "center", backgroundColor: 'transparent'
                                }}>
                                    <Text>Aberturas</Text>
                                    <View style={{ width: "70%" }}>
                                        <Dropdown
                                            data={aberturasCombo}
                                            labelField="label"
                                            valueField="value"
                                            value={ventana.tipo_abertura}
                                            onChange={item => setState((prevState) => ({ ...prevState, ventana: { ...prevState.ventana, tipo_abertura: item.value } }))}
                                            placeholder="Seleccione abertura"
                                            selectedTextStyle={{ color: 'white', fontSize: 14 }}
                                            style={styles.outputMaterial}
                                            placeholderStyle={{ color: 'white', fontSize: 14 }}
                                            containerStyle={{ backgroundColor: '#000' }}
                                            itemContainerStyle={{ height: 50, paddingVertical: 0 }}
                                            activeColor="#6200ee"
                                            itemTextStyle={{ color: 'white', fontSize: 14 }}
                                            iconColor="white"
                                            showsVerticalScrollIndicator={false}
                                        />
                                    </View>
                                </View>
                                {/* Lista de materiales */}
                                <View style={{ flexDirection: 'row', gap: 10, justifyContent: "space-between", alignItems: "center", width: "100%", backgroundColor: 'transparent' }}>
                                    <Text>Dimensiones</Text>
                                    <View style={{ flexDirection: 'row', justifyContent: "flex-start", alignItems: "center", width: "70%", backgroundColor: 'transparent', height: 40 }}>

                                        <TextInput
                                            label='Alto *'
                                            mode="outlined"
                                            error={errors.largo}
                                            style={{ height: 40, width: '42%', backgroundColor: '#121212', fontSize: 14 }}
                                            keyboardType="numeric"
                                            right={<TextInput.Affix text="cm" textStyle={{ marginRight: -6 }} />}
                                            maxLength={3}
                                            showSoftInputOnFocus={true}
                                            value={alto}
                                            onChangeText={handleAlto}
                                            outlineStyle={{ borderWidth: 1.5, height: 40 }}
                                            theme={{
                                                colors: {
                                                    error: '#ff0000',
                                                    placeholder: errors.largo ? '#ff0000' : 'white',
                                                    text: errors.largo ? '#ff0000' : 'white',
                                                    outline: errors.largo ? '#ff0000' : '#757575',
                                                }
                                            }}
                                        />
                                        <View style={{ width: "16%", borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexGrow: 1, backgroundColor: 'transparent' }}>
                                            <FontAwesome name="close" size={20} color="white" />
                                        </View>

                                        <TextInput
                                            label='Ancho *'
                                            mode="outlined"
                                            error={errors.ancho}
                                            maxLength={3}
                                            style={{ height: 40, width: '42%', backgroundColor: '#121212', fontSize: 14 }}
                                            outlineStyle={{ borderWidth: 1.5, height: 40 }}
                                            right={<TextInput.Affix text="cm" textStyle={{ marginRight: -6 }} />}
                                            showSoftInputOnFocus={true}
                                            keyboardType="numeric"
                                            value={ancho}
                                            onChangeText={handleAncho}
                                            theme={{
                                                colors: {
                                                    error: '#ff0000',
                                                    placeholder: errors.ancho ? '#ff0000' : 'white',
                                                    text: errors.ancho ? '#ff0000' : 'white',
                                                    outline: errors.ancho ? '#ff0000' : '#757575',

                                                }
                                            }}
                                        />
                                    </View>
                                </View>

                                <View style={{
                                    flexDirection: 'row', justifyContent: "space-between",
                                    width: "100%", alignItems: "center", backgroundColor: 'transparent'
                                }}>
                                    <Text>Serie</Text>
                                    <View style={{ width: "70%" }}>
                                        <Dropdown
                                            data={seriesSegunTipoAbertura}
                                            labelField="nombre"
                                            valueField="id"
                                            style={[styles.outputMaterial, errors.serie && styles.dropdownError]}
                                            itemContainerStyle={{ height: 50, paddingVertical: 0 }}
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
                                            placeholderStyle={{ color: errors.serie ? '#ff0000' : 'white' }}
                                            activeColor="#6200ee"
                                            itemTextStyle={{ color: 'white', fontSize: 14 }}
                                            selectedTextStyle={{ color: errors.serie ? '#ff0000' : 'white', fontSize: 14 }}
                                            containerStyle={{ backgroundColor: '#121212' }}
                                            iconColor={errors.serie ? '#ff0000' : 'white'}
                                            inputSearchStyle={{ height: 40 }}
                                        />
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: "space-between", width: "100%", alignItems: "center", backgroundColor: 'transparent' }}>
                                    <Text>Color</Text>
                                    <View style={{ width: "70%" }}>
                                        <Dropdown
                                            data={colors}
                                            labelField="color"
                                            valueField="id"
                                            style={[styles.outputMaterial, errors.colorAluminio && styles.dropdownError]}
                                            itemContainerStyle={{ height: 50, paddingVertical: 0 }}
                                            onChange={(item: ColorOption) => {
                                                setState((prevState) => ({
                                                    ...prevState, ventana: {
                                                        ...prevState.ventana,
                                                        colorAluminio: item
                                                    }
                                                }));
                                                setErrors(prev => ({ ...prev, colorAluminio: false }));
                                            }}
                                            value={ventana.id_color_aluminio}
                                            placeholder=" Selecciona el color *"
                                            placeholderStyle={{ color: errors.colorAluminio ? '#ff0000' : 'white', fontSize: 14 }}
                                            activeColor="#6200ee"
                                            itemTextStyle={{ color: 'white', fontSize: 14 }}
                                            selectedTextStyle={{ color: errors.colorAluminio ? '#ff0000' : 'white', fontSize: 14 }}
                                            containerStyle={{ backgroundColor: '#121212' }}
                                            iconColor={errors.colorAluminio ? '#ff0000' : 'white'}
                                        />
                                    </View>
                                </View>

                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", backgroundColor: 'transparent' }}>
                                    <Text>Cortina</Text>
                                    <View style={{ width: "70%" }}>
                                        <Dropdown
                                            data={cortinas}
                                            labelField="tipo"
                                            valueField="id"
                                            style={styles.outputMaterial}
                                            itemContainerStyle={{ height: 50, paddingVertical: 0 }}
                                            selectedTextStyle={{ color: 'white', backgroundColor: '121212', fontSize: 14 }}
                                            containerStyle={{ backgroundColor: '#121212' }}
                                            activeColor="#6200ee"
                                            itemTextStyle={{ color: 'white', fontSize: 14 }}
                                            onChange={(item) =>
                                                setState((prevState) => ({
                                                    ...prevState, ventana: {
                                                        ...prevState.ventana,
                                                        id_cortina: item.id
                                                    }
                                                }))}
                                            value={ventana.id_cortina}
                                            placeholder=" Selecciona la cortina"
                                            placeholderStyle={{ color: 'white', fontSize: 14 }}
                                            iconColor={'white'}
                                        />
                                    </View>
                                </View>

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
                                            style={{
                                                borderRadius: 16,
                                                backgroundColor: ventana.mosquitero ? '#6200ee' : 'grey',
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
                                            style={{
                                                borderRadius: 16,
                                                backgroundColor: ventana.vidrio ? '#6200ee' : 'grey',
                                            }}
                                        >
                                            Vidrio
                                        </Chip>
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', gap: 10, justifyContent: "space-between", alignItems: "center", width: "100%", backgroundColor: 'transparent' }}>
                                    <Text>Cantidad</Text>
                                    <View style={{ width: "70%", flexDirection: 'row', justifyContent: "flex-start", gap: 10, backgroundColor: 'transparent' }}>
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
                                                backgroundColor: '#121212',
                                                alignSelf: 'center',
                                                height: 40,
                                            }}
                                            outlineStyle={{ borderWidth: 1 }}
                                            theme={{
                                                colors: {
                                                    primary: '#757575',
                                                    outline: 'gray',
                                                    background: '#333',
                                                    text: 'white',
                                                    placeholder: 'gray',
                                                }
                                            }}
                                            right={
                                                <TextInput.Icon
                                                    icon={() => (
                                                        <FontAwesome
                                                            name="plus"
                                                            size={18}
                                                            color={Number(ventana.cantidad) >= 100 ? 'gray' : 'white'}
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
                                                            color={Number(ventana.cantidad) <= 0 ? 'gray' : 'white'}
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
                                                backgroundColor: '#121212',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                            }}>
                                                <Text style={{ color: 'red', fontSize: 8 }}>Precio sugerido</Text>
                                                <Text style={{ color: 'white', fontSize: 12, alignSelf: 'center' }}>
                                                    {ventana.precio_unitario === -1 && 'No disponible'}
                                                    {ventana.precio_unitario === -2 && 'Cargando...'}
                                                    {ventana.precio_unitario > 0 && `$${(ventana.precio_unitario).toFixed(1)}`}
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
                                        labelStyle={{ color: 'white', fontWeight: 'bold' }}

                                    >
                                        Confirmar
                                    </Button>
                                    <Button
                                        mode="contained"
                                        onPress={handleClose}
                                        icon={() => <FontAwesome name="close" size={32} color="red" />}
                                        style={styles.button}
                                        labelStyle={{ color: 'white', fontWeight: 'bold' }}
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
        borderColor: '#757575',
        borderWidth: 1.5,
        borderRadius: 4,
        backgroundColor: '#121212',
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
        color: 'white'
    },
    dropdownError: {
        borderColor: '#ff0000',
        borderWidth: 1,
    },
    inputError: {
        borderColor: '#ff0000',
        borderWidth: 1,
    },
    card: {
        backgroundColor: '#1E1E1E',
        alignSelf: 'center',
        elevation: 4,
        marginBottom: 10,
    },
    modalBackground: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    containerStyle: {
        backgroundColor: '#1E1E1E',
        padding: 20,
        margin: 20,
        borderRadius: 8,
        alignSelf: 'center',
        width: '95%',
        maxWidth: 500,
    },
});