import React, { useState } from 'react';
import { StyleSheet, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, IconButton } from 'react-native-paper';
import { SerieOption  } from '../contexts/BDContext';
import { updateAccesorioPrecio } from '@/app/utils/utilsDB';

interface ModalEditarAccesorioProps {
    visible: boolean;
    hideModal: () => void;
    serie: SerieOption;
}

const ModalEditarAccesorio = ({ visible, hideModal, serie }: ModalEditarAccesorioProps) => {
    const [precio, setPrecio] = useState(serie.precio_accesorios.toString());
    const [error, setError] = useState('');

    const handleSave = () => {
        const nuevoPrecio = Number(precio);
        if (isNaN(nuevoPrecio) || nuevoPrecio <= 0) {
            setError('Por favor, ingrese un precio válido');
            return;
        }
        updateAccesorioPrecio({ ...serie, precio_accesorios: nuevoPrecio })
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
                            <Text style={styles.title}>Costo</Text>
                            <IconButton
                                icon="close"
                                iconColor="white"
                                size={24}
                                onPress={hideModal}
                                style={styles.closeButton}
                            />
                        </View>
                        <Text style={styles.serieText}>{serie?.nombre}</Text>
                        
                        <TextInput
                            label="Precio"
                            value={precio}
                            onChangeText={(text) => {
                                setPrecio(text);
                                setError('');
                            }}
                            keyboardType="numeric"
                            style={styles.input}
                            contentStyle={styles.inputContent}
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
                            left={<TextInput.Affix text="US$" />}
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
    title: {
        fontSize: 24,
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
    },
    subtitle: {
        fontSize: 18,
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    serieText: {
        fontSize: 16,
        color: '#ccc',
        textAlign: 'center',
    },
    closeButton: {
        margin: 0,
        padding: 0,
    },
    input: {
        width: '60%',
        backgroundColor: '#6200ee',
        alignSelf: 'center',
        marginVertical: 10,
        color: 'white',
        height: 50,
    },
    inputContent: {
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        textAlignVertical: 'center',
        paddingVertical: 0,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
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

export default ModalEditarAccesorio; 