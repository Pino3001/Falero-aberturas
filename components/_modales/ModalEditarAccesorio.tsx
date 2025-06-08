import React, { useState } from 'react';
import { StyleSheet, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, IconButton } from 'react-native-paper';
import { useBD } from '@/utils/contexts/BDContext';
import { SerieOption } from '@/utils/constants/interfases';
import Colors from '@/utils/constants/Colors';

interface ModalEditarAccesorioProps {
    visible: boolean;
    hideModal: () => void;
    serie: SerieOption;
}

const ModalEditarAccesorio = ({ visible, hideModal, serie  }: ModalEditarAccesorioProps) => {
    const [precio, setPrecio] = useState(serie.precio_accesorios.toString());
    const [error, setError] = useState('');
    const { updateAccesorioPrecioBDContext } = useBD();
    const handleSave = async () => {
        const nuevoPrecio = Number(precio);
        if (isNaN(nuevoPrecio) || nuevoPrecio <= 0) {
            setError('Por favor, ingrese un precio válido');
            return;
        }
        if (serie && typeof serie.id === 'number') {
            console.log('precio accesorio', nuevoPrecio);
            await updateAccesorioPrecioBDContext({ ...serie, precio_accesorios: nuevoPrecio });
        }
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
                            <Text style={styles.title}>{serie?.nombre}</Text>
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
                            contentStyle={styles.inputContent}
                            mode="outlined"
                            error={!!error}
                            textColor={Colors.colors.text}
                            theme={{
                                colors: {
                                    primary: Colors.colors.complementario,
                                    onSurfaceVariant: Colors.colors.text,
                                    placeholder: Colors.colors.border_contraste_black,
                                    background: Colors.colors.border_contraste_black,
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
        fontWeight: 'bold',
    },
    serieText: {
        fontSize: 16,
        color: Colors.colors.border_contraste_black,
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
        marginVertical: 10,
        color: Colors.colors.text,
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

export default ModalEditarAccesorio; 