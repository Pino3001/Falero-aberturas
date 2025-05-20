import React, { useContext, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { View, Text } from './Themed';
import { Button, Card, Chip, TextInput } from 'react-native-paper';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Dropdown } from 'react-native-element-dropdown';
import { Ventana } from './EditNuevoPresupuesto';
import { useBD } from '../contexts/BDContext';

interface VentanaSeleccionadaProps {
    handleComfirmarCreacion: (ventana: Ventana) => void;
}
export default function VentanaSeleccionada({ handleComfirmarCreacion }: VentanaSeleccionadaProps) {
    const { colors } = useBD();
    const { series } = useBD();
    const { cortina } = useBD();
    const [ventana, setVentana] = useState<Ventana>({
        largo: '',
        label: 'Ventana',
        ancho: '',
        vidrio: true,
        mosquitero: false,
        serie: series[0],
        colorAluminio: colors[0],
        cortina: cortina[0],
        cantidad: '1',
    });

    const [errors, setErrors] = useState({
        largo: false,
        ancho: false,
        serie: false,
        colorAluminio: false
    });

    const validateFields = () => {
        const newErrors = {
            largo: ventana.largo.trim() === '',
            ancho: ventana.ancho.trim() === '',
            serie: !ventana.serie.id,
            colorAluminio: !ventana.colorAluminio.id
        };

        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error);
    };

    const handleSubmit = () => {
        if (validateFields()) {
            handleComfirmarCreacion(ventana);
        }
    };

    const handleReset = () => {
        setVentana({
            largo: '',
            label: 'Ventana',
            ancho: '',
            vidrio: true,
            mosquitero: false,
            serie: series[0],
            colorAluminio: colors[0],
            cortina: cortina[0],
            cantidad: '1',
        });
        setErrors({
            largo: false,
            ancho: false,
            serie: false,
            colorAluminio: false
        });
    };

    const handleAncho = (ancho: string) => {
        const nuevoValor = ancho.replace(/[^0-9.]/g, '');
        setVentana((prev_ventana) => ({ ...prev_ventana, ancho: nuevoValor }));
    };
    const handleLargo = (largo: string) => {
        const nuevoValor = largo.replace(/[^0-9.]/g, '');
        setVentana((prev_ventana) => ({ ...prev_ventana, largo: nuevoValor }));
    };
    return (
        <Card style={styles.card}>
            <View style={{ width: '90%', alignItems: "center", alignSelf: 'center', backgroundColor: '#1E1E1E', marginTop: 10 }}>
                <View style={{ flexDirection: 'column', gap: 15, alignContent: "center", alignItems: "center", width: '100%', backgroundColor: 'transparent' }}>
                    {/* Lista de materiales */}
                    <View style={{ flexDirection: 'row', gap: 10, justifyContent: "space-between", alignItems: "center", width: "100%", backgroundColor: 'transparent' }}>
                        <Text>Dimensiones</Text>
                        <View style={{ flexDirection: 'row', justifyContent: "flex-start", alignItems: "center", width: "70%", backgroundColor: 'transparent', height: 40 }}>
                            <TextInput
                                label='Largo *'
                                mode="outlined"
                                error={errors.largo}
                                style={{ height: 40, width: '42%', backgroundColor: '#121212', fontSize: 14,}}
                                keyboardType="numeric"
                                right={<TextInput.Affix text="cm" />}
                                maxLength={3}
                                showSoftInputOnFocus={true}
                                value={ventana.largo}
                                onChangeText={handleLargo}
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
                                style={{ height: 40, width: '42%', backgroundColor: '#121212', fontSize: 14}}
                                outlineStyle={{ borderWidth: 1.5, height: 40 }}
                                right={<TextInput.Affix text="cm" />}
                                showSoftInputOnFocus={true}
                                keyboardType="numeric"
                                value={ventana.ancho}
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

                    <View style={{ flexDirection: 'row', justifyContent: "space-between", 
                        width: "100%", alignItems: "center", backgroundColor: 'transparent' }}>
                        <Text>Serie</Text>
                        <View style={{ width: "70%" }}>
                            <Dropdown
                                data={series}
                                labelField="nombre"
                                valueField="id"
                                style={[styles.outputMaterial, errors.serie && styles.dropdownError]}
                                onChange={(item) => {
                                    setVentana((prevVentanta) => ({ ...prevVentanta, serie: item }));
                                    setErrors(prev => ({ ...prev, serie: false }));
                                }}
                                value={ventana.serie}
                                placeholder=" Selecciona la serie *"
                                placeholderStyle={{ color: errors.serie ? '#ff0000' : 'white' }}
                                activeColor="#6200ee"
                                itemTextStyle={{ color: 'white' }}
                                selectedTextStyle={{ color: errors.serie ? '#ff0000' : 'white' }}
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
                                onChange={(item) => {
                                    setVentana((prevVentanta) => ({ ...prevVentanta, colorAluminio: item }));
                                    setErrors(prev => ({ ...prev, colorAluminio: false }));
                                }}
                                value={ventana.colorAluminio}
                                placeholder=" Selecciona el color *"
                                placeholderStyle={{ color: errors.colorAluminio ? '#ff0000' : 'white' }}
                                activeColor="#6200ee"
                                itemTextStyle={{ color: 'white' }}
                                selectedTextStyle={{ color: errors.colorAluminio ? '#ff0000' : 'white' }}
                                containerStyle={{ backgroundColor: '#121212' }}
                                iconColor={errors.colorAluminio ? '#ff0000' : 'white'}
                            />
                        </View>
                    </View>

                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", backgroundColor: 'transparent' }}>
                        <Text>Cortina</Text>
                        <View style={{ width: "70%" }}>
                            <Dropdown
                                data={cortina}
                                labelField="tipo"
                                valueField="id"
                                style={styles.outputMaterial}
                                selectedTextStyle={{ color: 'white', backgroundColor: '121212' }}
                                containerStyle={{ backgroundColor: '#121212' }}
                                activeColor="#6200ee"
                                itemTextStyle={{ color: 'white' }}
                                onChange={(item) => setVentana((prevVentanta) => ({ ...prevVentanta, cortina: item }))}
                                value={ventana.cortina}
                                placeholder=" Selecciona la cortina"
                                placeholderStyle={{ color: 'white' }}
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
                                onPress={() => setVentana((prevVentanta) => ({ ...prevVentanta, mosquitero: !prevVentanta.mosquitero }))}
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
                                onPress={() => setVentana((prevVentanta) => ({ ...prevVentanta, vidrio: !prevVentanta.vidrio }))}
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
                        <View style={{ width: "70%", flexDirection: 'row', justifyContent: "flex-start", backgroundColor: 'transparent' }}>
                            <TextInput
                                value={ventana.cantidad}
                                onChangeText={(text) => {
                                    const newText = text.replace(/[^0-9]/g, '');
                                    setVentana((prevVentanta) => ({ ...prevVentanta, cantidad: newText }))
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
                                                setVentana((prevVentanta) => ({ ...prevVentanta, cantidad: String(Number(prevVentanta.cantidad) + 1) }))
                                            }
                                        }}
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
                                                setVentana((prevVentanta) => ({ ...prevVentanta, cantidad: String(Math.max(0, Number(prevVentanta.cantidad) - 1)) }))
                                            }
                                        }}
                                        disabled={Number(ventana.cantidad) === 1}
                                    />
                                }
                                editable={false}
                            />
                            <Card style={{ width: '40%', height: 40, marginLeft: 6, backgroundColor: '#121212', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ color: 'red', fontSize: 8 }}>Precio estimado</Text>
                                    <Text style={{ color: 'white', fontSize: 12, alignSelf: 'center' }}>{ventana.serie.precio_accesorios}</Text>
                            </Card>
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
                            onPress={handleReset}
                            icon={() => <FontAwesome name="close" size={32} color="red" />}
                            style={styles.button}
                            labelStyle={{ color: 'white', fontWeight: 'bold' }}
                        >
                            Cancelar
                        </Button>
                    </View>
                </View>
            </View>
        </Card>

    );
}

const styles = StyleSheet.create({
    Container: {
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
        width: '95%',
        elevation: 4,
        marginBottom: 10,
      },
});