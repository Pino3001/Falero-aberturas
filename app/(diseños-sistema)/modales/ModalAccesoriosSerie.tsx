import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Modal, Portal, Text, DataTable, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SerieOption } from '@/utils/constants/interfases';
import { useTheme } from '@/utils/contexts/ThemeContext';
import ModalEditPrecio from './ModalEditPrecio';
import { useBD } from '@/utils/contexts/BDContext';

interface ModalAccesoriosSerieProps {
    visible: boolean;
    onDimiss: () => void;
    series: SerieOption[];
}




const ModalAccesoriosSerie = ({ visible, onDimiss, series }: ModalAccesoriosSerieProps) => {
    const { colors, fonts } = useTheme();
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedSerie, setSelectedSerie] = useState<SerieOption | null>(null);
    const { updateAccesorioPrecioBDContext } = useBD();

    const handleEdit = (serie: SerieOption) => {
        setSelectedSerie(serie);
        setEditModalVisible(true);
    };

    const handleSave = async (nuevoPrecio: number) => {
        const serieToUpdate = selectedSerie; // Guardamos referencia por si se cierra el modal
        if (!serieToUpdate) return;

        try {
            await updateAccesorioPrecioBDContext({
                ...serieToUpdate,
                precio_accesorios: nuevoPrecio
            });
        } finally {
            setEditModalVisible(false);
            setSelectedSerie(null);
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
                        }}>Accesorios Serie</Text>
                        <TouchableOpacity onPress={onDimiss} style={{ right: 0 }}>
                            <MaterialCommunityIcons name="close" size={24} color={colors.onPrimary} />
                        </TouchableOpacity>
                    </View>
                    <DataTable.Header style={[styles.tableHeader, { backgroundColor: colors.primary }]}>
                        <DataTable.Title textStyle={{
                            color: colors.background, fontSize: 16,
                            fontFamily: fonts.bold.fontFamily,
                        }}>Serie</DataTable.Title>
                        <DataTable.Title numeric textStyle={{
                            color: colors.background, fontSize: 16,
                            fontFamily: fonts.bold.fontFamily,
                        }}>Costo </DataTable.Title>
                        <DataTable.Title numeric textStyle={{
                            color: colors.background, fontSize: 16,
                            fontFamily: fonts.bold.fontFamily,
                        }}>Editar</DataTable.Title>
                    </DataTable.Header>

                    {series?.map((serie) => (
                        <DataTable.Row key={serie.id} style={[styles.row, , { backgroundColor: colors.surfaceVariant }]}>
                            <DataTable.Cell>
                                <Text style={[styles.cellText, { fontFamily: fonts.medium.fontFamily }]}>{serie.nombre}</Text>
                            </DataTable.Cell>
                            <DataTable.Cell numeric>
                                <Text style={[styles.cellText, { fontFamily: fonts.numero.fontFamily }]}>{serie.precio_accesorios} US$</Text>
                            </DataTable.Cell>
                            <DataTable.Cell numeric>
                                <IconButton
                                    icon="pencil"
                                    iconColor={colors.primary}
                                    size={20}
                                    onPress={() => handleEdit(serie)}
                                    style={styles.editButton}
                                />
                            </DataTable.Cell>
                        </DataTable.Row>
                    ))}
                </DataTable>
            </Modal>

            {selectedSerie && (
                <ModalEditPrecio
                    visible={editModalVisible}
                    onDismiss={() => setEditModalVisible(false)}
                    title={selectedSerie?.nombre || 'Editar precio'}
                    inputLabel='Precio accesorios'
                    affix='US$'
                    initialValue={selectedSerie?.precio_accesorios || 0}
                    onSave={handleSave}
                />
            )}
        </Portal>
    );
};

const styles = StyleSheet.create({
    containerStyle: {
        borderRadius: 8,
        alignSelf: 'center',
        width: '98%',
        maxWidth: 600,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
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

export default ModalAccesoriosSerie; 