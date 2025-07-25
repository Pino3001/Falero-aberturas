import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Modal, Portal, Text, DataTable, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ColorOption } from '@/utils/constants/interfases';
import { useTheme } from '@/utils/contexts/ThemeContext';
import ModalEditPrecio from './ModalEditPrecio';
import { useBD } from '@/utils/contexts/BDContext';

interface ModalEditarPuertaProps {
    visible: boolean;
    onDimiss: () => void;
    acabado?: ColorOption[];
}



const ModalEditarPuerta = ({ visible, onDimiss, acabado }: ModalEditarPuertaProps) => {
    const { colors, fonts } = useTheme();
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedAcabado, setSelectedAcabado] = useState<ColorOption | null>(null);
    const { updatePrecioPuertaBDContext } = useBD();

    const handleEdit = (color: ColorOption) => {
        setSelectedAcabado(color);
        setEditModalVisible(true);
    };


    const handleSave = async (nuevoPrecio: number) => {
        const acabadoToUpdate = selectedAcabado; // Guardamos referencia por si se cierra el modal
        if (!acabadoToUpdate) return;

        try {
            await updatePrecioPuertaBDContext({
                ...acabadoToUpdate,
                precio_un_puerta: nuevoPrecio
            });
        } finally {
            setEditModalVisible(false);
            setSelectedAcabado(null);
        }
    };
    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDimiss}
                contentContainerStyle={[styles.containerStyle, { backgroundColor: colors.background }]}
                style={{ backgroundColor: colors.backdrop }}
            >
                <DataTable style={{ width: '100%', backgroundColor: colors.primary, borderRadius: 6, overflow: 'hidden', }}>
                    <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ alignSelf: 'center' }} />
                        <Text style={{
                            color: colors.onPrimary, textAlign: 'center',
                            fontSize: 22,
                            margin: 5,
                            fontFamily: fonts.bold.fontFamily
                        }}>Puertas</Text>
                        <TouchableOpacity onPress={onDimiss} style={{ right: 0 }}>
                            <MaterialCommunityIcons name="close" size={24} color={colors.onPrimary} />
                        </TouchableOpacity>
                    </View>
                    <DataTable.Header style={[styles.tableHeader, { backgroundColor: colors.primary }]}>
                        <DataTable.Title textStyle={{
                            color: colors.background, fontSize: 16,
                            fontFamily: fonts.bold.fontFamily,
                        }}>Acabado</DataTable.Title>
                        <DataTable.Title numeric textStyle={{
                            color: colors.background, fontSize: 16,
                            fontFamily: fonts.bold.fontFamily,
                        }}>Precio</DataTable.Title>
                        <DataTable.Title numeric textStyle={{
                            color: colors.background, fontSize: 16,
                            fontFamily: fonts.bold.fontFamily,
                        }}>Editar</DataTable.Title>
                    </DataTable.Header>

                    {acabado?.map((acabado: ColorOption) => (
                        <DataTable.Row key={acabado.id} style={[styles.row, , { backgroundColor: colors.surfaceVariant }]}>
                            <DataTable.Cell >
                                <Text style={[styles.cellText, { fontFamily: fonts.medium.fontFamily }]}>{acabado.color}</Text>
                            </DataTable.Cell >
                            <DataTable.Cell numeric>
                                <Text style={[styles.cellText, {fontFamily: fonts.numero.fontFamily}]}>{acabado.precio_un_puerta} US$</Text>
                            </DataTable.Cell>
                            <DataTable.Cell numeric>
                                <IconButton
                                    icon="pencil"
                                    iconColor={colors.primary}
                                    size={20}
                                    onPress={() => handleEdit(acabado)}
                                    style={styles.editButton}
                                />
                            </DataTable.Cell>
                        </DataTable.Row>
                    ))}
                </DataTable>
            </Modal>

            {
                selectedAcabado ? (
                    <ModalEditPrecio
                        visible={editModalVisible}
                        onDismiss={() => setEditModalVisible(false)}
                        title={selectedAcabado?.color || 'No hay color'}
                        inputLabel='Precio Puerta'
                        affix='US$'
                        initialValue={selectedAcabado?.precio_un_puerta || 0}
                        onSave={handleSave}
                    />
                ) : null
            }
        </Portal >
    );
};

const styles = StyleSheet.create({
    containerStyle: {
        borderRadius: 8,
        alignSelf: 'center',
        width: '98%',
        maxWidth: 500,
    },
    tableHeader: {
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    row: {
        borderBottomWidth: 1,
    },
    cellText: {
        fontSize: 14,
    },
    editButton: {
        margin: 0,
        backgroundColor: 'transparent',
    },
});

export default ModalEditarPuerta; 