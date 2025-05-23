import React, { useState } from 'react';
import { StyleSheet, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, IconButton } from 'react-native-paper';
import { ColorOption } from '@/contexts/BDContext';
import { updatePrecioColor } from '@/app/utils/utilsDB';

interface ModalPrecioGramoProps {
    visible: boolean;
    hideModal: () => void;
    color: ColorOption;
}

const ModalPrecioGramo = ({ visible, hideModal, color }: ModalPrecioGramoProps) => {
    const [precio, setPrecio] = useState(color.precio.toString());
    const [error, setError] = useState('');

    const  handleSave = async () => {
        const nuevoPrecio = Number(precio);
        if (isNaN(nuevoPrecio) || nuevoPrecio <= 0) {
            setError('Por favor, ingrese un precio válido');
            return;
        }
        await updatePrecioColor({ ...color, precio: nuevoPrecio })
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
                            <Text style={styles.title}>Precio x gramo</Text>
                            <IconButton
                                icon="close"
                                iconColor="white"
                                size={24}
                                onPress={hideModal}
                                style={styles.closeButton}
                            />
                        </View>
                        <Text style={styles.subtitle}>{color.color}</Text>
                        
                        <TextInput
                            label="Precio"
                            value={precio}
                            onChangeText={(text) => {
                                setPrecio(text);
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

export default ModalPrecioGramo; 