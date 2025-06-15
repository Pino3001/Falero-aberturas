import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native';
import { Modal, Portal, Text, TextInput, Button } from 'react-native-paper';
import { useBD } from '@/utils/contexts/BDContext';
import { SerieOption } from '@/utils/constants/interfases';
import { useTheme } from '@/utils/contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ModalEditarAccesorioProps {
    visible: boolean;
    onDismiss: () => void;
    title: string;
    inputLabel: string;
    affix: string;
    initialValue?: number;
    onSave: (newValue: number) => Promise<void> | void;
}

const ModalEditPrecio = ({
    visible,
    onDismiss,
    title,
    inputLabel,
    affix,
    initialValue,
    onSave
}: ModalEditarAccesorioProps) => {
    const { colors, fonts } = useTheme();
    const [value, setValue] = useState<string>(initialValue?.toString() || '');
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Resetear el estado cuando el modal se abre/cierra o cambia initialValue
    useEffect(() => {
        setValue(initialValue?.toString() || '');
        setError('');
    }, [visible, initialValue]);

    const handleSave = async () => {
        const numericValue = Number(value.replace(',', '.')); 

        if (isNaN(numericValue) || numericValue < 0) {
            setError('Por favor, ingrese un valor válido mayor a 0');
            return;
        }

        setIsSaving(true);
        try {
            await onSave(numericValue);
            onDismiss();
        } catch (err) {
            setError('Error al guardar. Intente nuevamente.');
            console.error('Error saving value:', err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={[styles.containerStyle, { backgroundColor: colors.background }]}
                style={{ backgroundColor: colors.backdrop }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View >
                        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ alignSelf: 'center', width: '10%' }} />
                            <Text style={{
                                fontSize: 22,
                                fontFamily: fonts.bold.fontFamily,
                                textAlign: 'center',
                            }}>{title}</Text>
                            <TouchableOpacity onPress={onDismiss} style={{ right: 0 }}>
                                <MaterialCommunityIcons name="close" size={24} color={colors.primary} />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            label={inputLabel}
                            value={value}
                            onChangeText={(text) => {
                                setValue(text);
                                setError('');
                            }}
                            keyboardType="numeric"
                            style={styles.input}
                            contentStyle={styles.inputContent}
                            mode="outlined"
                            error={!!error}
                            left={<TextInput.Affix text={affix} />}
                        />

                        {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}

                        <View style={styles.buttonContainer}>
                            <Button
                                mode="contained"
                                onPress={handleSave}
                                style={styles.button}
                            >
                                {isSaving ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    containerStyle: {
        borderRadius: 8,
        padding: 10,
        alignSelf: 'center',
        width: '80%',
        maxWidth: 400,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    serieText: {
        fontSize: 16,
        textAlign: 'center',
    },
    closeButton: {
        right: 0
    },
    input: {
        width: '60%',
        alignSelf: 'center',
        marginVertical: 10,
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
        textAlign: 'center',
        borderRadius: 4,
    },
    errorText: {
        textAlign: 'center',
    },
});

export default ModalEditPrecio; 