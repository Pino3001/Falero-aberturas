import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Button, Card, List, TextInput, Text, Switch } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ModalSerie from './ModalSerie';

interface EditPrecioProps {
    precio: string;
    onPrecioChange: (precio: string) => void;
}

export default function EditPrecio({ precio, onPrecioChange }: EditPrecioProps) {
    const [gripType, setGripType] = useState('');
    const [includeScrews, setIncludeScrews] = useState(false);
    const [notes, setNotes] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [serieSeleccionada, setSerieSeleccionada] = useState('');

    const handleSerieChange = (serie: string) => {
        onPrecioChange(`serie_${serie.toLowerCase()}`);
    };

    const handleColorChange = (color: string) => {
        onPrecioChange(`color_${color}`);
    };

    const handleSave = () => {
        onPrecioChange(JSON.stringify({
            gripType,
            includeScrews,
            notes
        }));
    };

    const showModal = (serie: string) => {
        setSerieSeleccionada(serie);
        setModalVisible(true);
    };

    const hideModal = () => setModalVisible(false);

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
                        <List.Item
                            title="SERIE 20"
                            onPress={() => {
                                showModal('20');
                                handleSerieChange('A');
                            }}
                            style={styles.item}
                            titleStyle={styles.itemTitle}
                        />
                        <List.Item
                            title="SERIE 25 2 hojas"
                            onPress={() => {
                                showModal('25 2H');
                                handleSerieChange('B');
                            }}
                            style={styles.item}
                            titleStyle={styles.itemTitle}
                        />
                        <List.Item
                            title="SERIE 25 en 3 hojas"
                            onPress={() => {
                                showModal('25 3H');
                                handleSerieChange('C');
                            }}
                            style={styles.item}
                            titleStyle={styles.itemTitle}
                        />
                    </List.Accordion>
                    <List.Accordion
                        title="Editar Color"
                        style={styles.accordion}
                        titleStyle={styles.accordionTitle}
                        left={props => <List.Icon {...props} icon="palette" color="white" />}
                    >
                        <List.Item
                            title="Natural Anodizado"
                            onPress={() => handleColorChange('blanco')}
                            style={styles.item}
                            titleStyle={styles.itemTitle}
                        />
                        <List.Item
                            title="Blanco"
                            onPress={() => handleColorChange('blanco')}
                            style={styles.item}
                            titleStyle={styles.itemTitle}
                        />
                        <List.Item
                            title="Simil madera"
                            onPress={() => handleColorChange('negro')}
                            style={styles.item}
                            titleStyle={styles.itemTitle}
                        />
                        <List.Item
                            title="Anolock"
                            onPress={() => handleColorChange('negro')}
                            style={styles.item}
                            titleStyle={styles.itemTitle}
                        />
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
                            onPress={() => handleColorChange('vidrio')}
                            style={styles.item}
                            titleStyle={styles.itemTitle}
                        />
                        <List.Item
                            title="Mosquitero"
                            onPress={() => handleColorChange('mosquitero')}
                            style={styles.item}
                            titleStyle={styles.itemTitle}
                        />
                        <List.Item
                            title="Accesorios"
                            onPress={() => handleColorChange('accesorios')}
                            style={styles.item}
                            titleStyle={styles.itemTitle}
                        />
                    </List.Accordion>
                </Card.Content>
            </Card>

            {/* Sección Extra */}
            <Card style={styles.card}>
                <Card.Title title="Mano de Obra" titleStyle={styles.title} />
                <Card.Content>
                    <View style={styles.contentContainer}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                mode="outlined"
                                label="colocar mano de obra"
                                multiline
                                value={notes}
                                onChangeText={setNotes}
                                style={styles.input}
                                right={<TextInput.Affix text="cm" />}
                                theme={{ colors: { text: 'white', primary: '#6200ee' } }}
                                textColor="white"
                                keyboardType="numeric"
                            />
                            <TouchableOpacity 
                                style={styles.editButton}
                                onPress={() => {}}
                            >
                                <MaterialCommunityIcons name="pencil" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Card.Content>
            </Card>
            <ModalSerie 
                visible={modalVisible}
                hideModal={hideModal}
                serie={serieSeleccionada}
            />
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
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingHorizontal: 8,
    },
    saveButton: {
        marginTop: 24,
        marginHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#6200ee',
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
        width: '100%',
        gap: 8,
    },
    input: {
        backgroundColor: '#6200ee',
        alignItems: 'center',
        alignSelf: 'center',
        width: '70%',
    },
    editButton: {
        backgroundColor: 'transparent',
        height: 45,
        width: 45,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: 'white',
    }
});