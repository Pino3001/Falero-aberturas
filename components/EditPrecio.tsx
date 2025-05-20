import React, { useState, useCallback } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Button, Card, List, TextInput, Text, Switch, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ModalSerie from './ModalSerie';
import ModalColor from './ModalColor';
import ModalPrecioM2 from './ModalPrecioM2';
import ModalAccesoriosSerie from './ModalAccesoriosSerie';
import { PreciosVarios, useBD } from '../contexts/BDContext';

interface EditPrecioProps {
    precio: string;
    onPrecioChange: (precio: string) => void;
    mapAberturas?: Map<string, any>;
}



export default function EditPrecio({ precio, onPrecioChange, mapAberturas }: EditPrecioProps) {
    const { series, colors, preciosVarios, updatePrecioVarios } = useBD();
    const [modalVisible, setModalVisible] = useState(false);
    const [serieSeleccionada, setSerieSeleccionada] = useState('');
    const [colorModalVisible, setColorModalVisible] = useState(false);
    const [selectedColor, setSelectedColor] = useState('');
    const [m2ModalVisible, setM2ModalVisible] = useState(false);
    const [preciosM2, setPreciosM2] = useState<PreciosVarios & { index: number } | null>(null);
    const [accesoriosModalVisible, setAccesoriosModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [manoObra, setManoObra] = useState(preciosVarios.find(p => p.id === '1')?.precio.toString() || '0');


    const handleSerieChange = useCallback((serie: string) => {
        onPrecioChange(`serie_${serie.toLowerCase()}`);
    }, [onPrecioChange]);

    const handleColorPress = useCallback((color: string) => {
        setSelectedColor(color);
        setColorModalVisible(true);
    }, []);

    const getPreciosVarios = () => {
        return preciosVarios.filter(p => p.id === '1' || p.id === '2' || p.id === '3');
    };

    const handleM2ItemPress = useCallback((index: number) => {
        const vario = getPreciosVarios()[index];
        setPreciosM2({ ...vario, index });
        setM2ModalVisible(true);
    }, [preciosM2]);

    const handleSaveM2Price = useCallback((nuevoPrecio: number) => {
        if (preciosM2) {
            updatePrecioVarios(preciosM2.id, nuevoPrecio);
        }
    }, [preciosM2]);

    const handleEditToggle = useCallback(() => {
        if (isEditing) {
          const precioNumerico = parseFloat(manoObra) || 0;
          updatePrecioVarios('1', precioNumerico);
        } else {
          // Al entrar en modo edición, sincroniza con los últimos datos
          const nuevoValor = preciosVarios.find(p => p.id === '1')?.precio.toString() || '0';
          setManoObra(nuevoValor);
        }
        setIsEditing(!isEditing);
      }, [isEditing, manoObra, preciosVarios, updatePrecioVarios]);

    const handleSave = useCallback(() => {
        const data = {
            preciosM2,
            manoObra: Number(manoObra)
        };
        onPrecioChange(JSON.stringify(data));
    }, [preciosM2, manoObra, onPrecioChange]);

    return (
        <View style={styles.container}>
            {/* Sección Aluminio */}
            <Card style={styles.card}>
                <Card.Title title="Aluminio" titleStyle={styles.title} />
                <Card.Content>
                    <List.Accordion
                        title="Editar Serie"
                        style={styles.accordion}
                        titleStyle={styles.accordionTitle}
                        left={props => <List.Icon {...props} icon="shape" color="white" />}
                    >
                        {series.map((serie) => (
                            <List.Item
                                key={serie.id}
                                title={serie.nombre}
                                onPress={() => {
                                    setSerieSeleccionada(serie.id);
                                    setModalVisible(true);
                                    handleSerieChange(serie.id);
                                }}
                                style={styles.item}
                                titleStyle={styles.itemTitle}
                            />
                        ))}
                    </List.Accordion>
                    <List.Accordion
                        title="Colores"
                        left={props => <List.Icon {...props} icon="palette" />}
                        style={styles.accordion}
                        titleStyle={styles.accordionTitle}
                    >
                        {colors.map((color) => (
                            <List.Item
                                key={color.id}
                                title={color.color}
                                onPress={() => {
                                    setSelectedColor(color.id);
                                    setColorModalVisible(true);
                                    handleColorPress(color.id);
                                }}
                                style={styles.item}
                                titleStyle={styles.itemTitle}
                            />
                        ))}
                    </List.Accordion>
                </Card.Content>
            </Card>

            {/* Sección Accesorios */}
            <Card style={styles.card}>
                <Card.Title title="Accesorios" titleStyle={styles.title} />
                <Card.Content>
                    <List.Accordion
                        title="Editar Accesorios"
                        style={styles.accordion}
                        titleStyle={styles.accordionTitle}
                        left={props => <List.Icon {...props} icon="tools" color="white" />}
                    >
                        <List.Item
                            title="Vidrio"
                            onPress={() => 
                                handleM2ItemPress(1)}
                            style={styles.item}
                            titleStyle={styles.itemTitle}
                        />
                        <List.Item
                            title="Mosquitero"
                            onPress={() => 
                                handleM2ItemPress(2)}
                            style={styles.item}
                            titleStyle={styles.itemTitle}
                        />
                        <List.Item
                            title="Accesorios"
                            onPress={() => setAccesoriosModalVisible(true)}
                            style={styles.item}
                            titleStyle={styles.itemTitle}
                        />
                    </List.Accordion>
                </Card.Content>
            </Card>

            {/* Sección Mano de Obra */}
            <Card style={styles.card}>
                <Card.Title title="Mano de Obra" titleStyle={styles.title} />
                <Card.Content>
                    <View style={styles.contentContainer}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                mode="outlined"
                                value={manoObra}
                                onChangeText={(text) => {if (/^\d*\.?\d*$/.test(text) || text === '') 
                                    setManoObra(text);
                                }}
                                style={[
                                    styles.input,
                                    !isEditing && styles.inputDisabled
                                ]}
                                contentStyle={styles.inputContent}
                                right={<TextInput.Affix text="US$" />}
                                theme={{ 
                                    colors: { 
                                        text: 'white',
                                        primary: 'white',
                                        onSurfaceVariant: 'white',
                                        placeholder: 'white',
                                        disabled: '#3700b3',
                                        background: isEditing ? '#6200ee' : '#4B0082',
                                    },
                                }}
                                textColor="white"
                                cursorColor="white"
                                keyboardType="numeric"
                                editable={isEditing}
                                selectionColor="rgba(255, 255, 255, 0.3)"
                            />
                            <TouchableOpacity 
                                style={[
                                    styles.editButton,
                                    isEditing && styles.editButtonActive
                                ]}
                                onPress={handleEditToggle}
                            >
                                <MaterialCommunityIcons 
                                    name={isEditing ? "check" : "pencil"} 
                                    size={24} 
                                    color="white" 
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Card.Content>
            </Card>

            <ModalSerie 
                visible={modalVisible}
                hideModal={() => setModalVisible(false)}
                serie={serieSeleccionada}
            />
            <ModalColor
                visible={colorModalVisible}
                hideModal={() => setColorModalVisible(false)}
                color_id={selectedColor}
            />
            {preciosM2 && (
                <ModalPrecioM2
                    visible={m2ModalVisible}
                    hideModal={() => setM2ModalVisible(false)}
                    vario_id={preciosM2.id}
                    onSave={handleSaveM2Price}
                />
            )}
            <ModalAccesoriosSerie
                visible={accesoriosModalVisible}
                hideModal={() => setAccesoriosModalVisible(false)}
            />

            {mapAberturas && mapAberturas.size > 0 && (
                <View style={styles.saveButtonContainer}>
                    <Button
                        mode="contained"
                        onPress={handleSave}
                        style={styles.submitButton}
                        labelStyle={styles.submitButtonLabel}
                    >
                        Guardar Cambios
                    </Button>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 16,
    },
    card: {
        marginBottom: 16,
        elevation: 2,
        width: '98%',
        backgroundColor: '#1E1E1E',
    },
    title: {
        color: 'white',
    },
    accordion: {
        backgroundColor: '#6200ee',
        marginVertical: 4,
    },
    accordionTitle: {
        color: 'white',
        fontSize: 16,
    },
    item: {
        backgroundColor: '#3700b3',
    },
    itemTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    contentContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    input: {
        backgroundColor: '#6200ee',
        alignSelf: 'center',
        justifyContent: 'center',
        width: '40%',
        height: 50,
        marginRight: 10,
    },
    inputDisabled: {
        backgroundColor: '#3700b3',
    },
    inputContent: {
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        textAlignVertical: 'center',
        paddingVertical: 0,
    },
    editButton: {
        backgroundColor: 'transparent',
        height: 45,
        width: 45,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editButtonActive: {
        backgroundColor: '#4CAF50',
    },
    saveButtonContainer: {
        width: '100%',
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 10,
    },
    submitButton: {
        backgroundColor: '#4CAF50',
        padding: 8,
    },
    submitButtonLabel: {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
    },
    snackbar: {
        backgroundColor: 'red',
    },
});