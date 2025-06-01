import React, { useState } from 'react';
import { StyleSheet, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, IconButton } from 'react-native-paper';
import { useBD } from '@/contexts/BDContext';
import { ColorOption } from '@/constants/interfases';
import Colors from '@/constants/Colors';

interface ModalPrecioPuertaProps {
    visible: boolean;
    hideModal: () => void;
    color: ColorOption;
}

const ModalPrecioPuerta = ({ visible, hideModal, color }: ModalPrecioPuertaProps) => {
    const [precio, setPrecio] = useState(color.precio_un_puerta.toString());
    const [error, setError] = useState('');
    const {updatePrecioPuertaBDContext} = useBD()
    const  handleSave = async () => {
        const nuevoPrecio = Number(precio);
        console.log('entro a editar', nuevoPrecio);
        if (isNaN(nuevoPrecio) || nuevoPrecio <= 0) {
            setError('Por favor, ingrese un precio válido');
            return;
        }
        await updatePrecioPuertaBDContext({ ...color, precio_un_puerta: nuevoPrecio })
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
                            <Text style={styles.title}>{color.color}</Text>
                            <IconButton
                                icon="close"
                                iconColor={Colors.colors.text}
                                size={24}
                                onPress={hideModal}
                                style={styles.closeButton}
                            />
                        </View>
                        
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
                            textColor={Colors.colors.text}
                            theme={{
                                colors: {
                                    primary: Colors.colors.complementario,
                                    onSurfaceVariant: Colors.colors.text,
                                    placeholder: Colors.colors.border_contraste_black,
                                    background: Colors.colors.imput_black,
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
                                textColor={Colors.colors.text}
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
        backgroundColor: Colors.colors.transparencia_modal,
    },
    containerStyle: {
        backgroundColor: Colors.colors.background_modal,
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
        fontSize: 22,
        color: Colors.colors.text,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
    },
    subtitle: {
        fontSize: 18,
        color: Colors.colors.text,
        textAlign: 'center',
    },
    closeButton: {
        margin: 0,
        padding: 0,
    },
    input: {
        width: '60%',
        backgroundColor: Colors.colors.imput_black,
        alignSelf: 'center',
        textAlign: 'center',
        marginVertical: 10,
        color: Colors.colors.text,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    button: {
        width: '60%',
        backgroundColor: Colors.colors.complementario,
        textAlign: 'center',
        tintColor: Colors.colors.text,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: Colors.colors.text,
    },
    errorText: {
        color: Colors.colors.error,
        textAlign: 'center',
    },
});

export default ModalPrecioPuerta; 