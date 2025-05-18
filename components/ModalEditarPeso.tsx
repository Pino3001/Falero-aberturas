import React, { useState } from 'react';
import { StyleSheet, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ModalEditarPesoProps {
    visible: boolean;
    hideModal: () => void;
    perfil: {
        nombre: string;
        gramos: number;
    };
    onSave: (nuevoPeso: number) => void;
}

const ModalEditarPeso = ({ visible, hideModal, perfil, onSave }: ModalEditarPesoProps) => {
    const [peso, setPeso] = useState(perfil.gramos.toString());
    const [error, setError] = useState('');

    const handleSave = () => {
        const nuevoPeso = Number(peso);
        if (isNaN(nuevoPeso) || nuevoPeso <= 0) {
            setError('Por favor, ingrese un peso válido');
            return;
        }
        onSave(nuevoPeso);
        hideModal();
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={hideModal}
                contentContainerStyle={styles.containerStyle}
                style={styles.modalBackground}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Editar Peso</Text>
                            <IconButton
                                icon="close"
                                iconColor="white"
                                size={24}
                                onPress={hideModal}
                                style={styles.closeButton}
                            />
                        </View>
                        <Text style={styles.subtitle}>{perfil.nombre}</Text>
                        
                        <TextInput
                            label="Peso en gr/m"
                            value={peso}
                            onChangeText={(text) => {
                                setPeso(text);
                                setError('');
                            }}
                            keyboardType="numeric"
                            style={styles.input}
                            mode="outlined"
                            error={!!error}
                            textColor="white"
                            theme={{
                                colors: {
                                    primary: 'white',
                                    onSurfaceVariant: 'white',
                                    placeholder: '#888',
                                    background: '#2d2d2d',
                                }
                            }}
                        />
                        
                        {error ? <Text style={styles.errorText}>{error}</Text> : null}
                        
                        <View style={styles.buttonContainer}>
                            <Button 
                                mode="contained" 
                                onPress={handleSave}
                                style={styles.button}
                                textColor="white"
                            >
                                Guardar
                            </Button>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    containerStyle: {
        backgroundColor: '#1E1E1E',
        padding: 20,
        margin: 20,
        borderRadius: 8,
        alignSelf: 'center',
        width: '80%',
        maxWidth: 400,
    },
    content: {
        gap: 15,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    closeButton: {
        margin: 0,
        padding: 0,
    },
    title: {
        fontSize: 24,
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
    },
    subtitle: {
        fontSize: 18,
        color: '#ccc',
        textAlign: 'center',
    },
    input: {
        width: '60%',
        backgroundColor: '#6200ee',
        alignSelf: 'center',
        textAlign: 'center',
        marginVertical: 10,
        color: 'white',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    button: {
        width: '60%',
        backgroundColor: '#6200ee',
        textAlign: 'center',
        tintColor: 'white',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'white',
    },
    errorText: {
        color: '#cf6679',
        textAlign: 'center',
    },
});

export default ModalEditarPeso; 