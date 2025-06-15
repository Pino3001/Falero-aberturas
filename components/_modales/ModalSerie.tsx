import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Modal, Portal, Text, DataTable, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PerfilesOption, SerieOption } from '@/utils/constants/interfases';
import { useTheme } from '@/utils/contexts/ThemeContext';
import ModalEditPrecio from './ModalEditPrecio';
import { useBD } from '@/utils/contexts/BDContext';

interface ModalSerieProps {
    visible: boolean;
    onDimiss: () => void;
    serie?: SerieOption;
    perfiles: PerfilesOption[];
}

const ModalSerie = ({ visible, onDimiss, serie, perfiles }: ModalSerieProps) => {
    const { colors, fonts } = useTheme();
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedPerfil, setSelectedPerfil] = useState<PerfilesOption | null>(null);
    const {updatePerfilGramosBDContext} = useBD();

    const handleEdit = (index: number) => {
        const perfilSeleccionado = perfiles[index];
        setSelectedPerfil(perfilSeleccionado);
        setEditModalVisible(true);
    };

    const handleSave = async (nuevoPrecio: number) => {
        const perfilToUpdate = selectedPerfil; // Guardamos referencia por si se cierra el modal
        if (!perfilToUpdate) return;

        try {
            await updatePerfilGramosBDContext({
                ...perfilToUpdate,
                gramos_por_m: nuevoPrecio
            });
        } finally {
            setEditModalVisible(false);
            setSelectedPerfil(null);
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
                            fontFamily: fonts.bold.fontFamily,
                        }}>{serie?.nombre}</Text>
                        <TouchableOpacity onPress={onDimiss} style={{ right: 0 }}>
                            <MaterialCommunityIcons name="close" size={24} color={colors.onPrimary} />
                        </TouchableOpacity>
                    </View>
                    <DataTable.Header style={[styles.tableHeader, { backgroundColor: colors.primary }]}>
                        <DataTable.Title textStyle={{
                            color: colors.background, fontSize: 16,
                            fontFamily: fonts.bold.fontFamily,
                        }}>Perfil</DataTable.Title>
                        <DataTable.Title numeric textStyle={{
                            color: colors.background, fontSize: 16,
                            fontFamily: fonts.bold.fontFamily,
                        }}>gr/m</DataTable.Title>
                        <DataTable.Title numeric textStyle={{
                            color: colors.background, fontSize: 16,
                            fontFamily: fonts.bold.fontFamily,
                        }}>Editar</DataTable.Title>
                    </DataTable.Header>

                    {perfiles.map((perfil, index) => (
                        <DataTable.Row key={index} style={[styles.row, , { backgroundColor: colors.surfaceVariant }]}>
                            <DataTable.Cell textStyle={[styles.cellText, { marginRight: -40, fontSize: 14 }]}>{perfil.nombre}</DataTable.Cell>
                            <DataTable.Cell numeric textStyle={styles.cellText}>{perfil.gramos_por_m} g</DataTable.Cell>
                            <DataTable.Cell numeric>
                                <IconButton
                                    icon="pencil"
                                    iconColor={colors.primary}
                                    size={20}
                                    onPress={() => handleEdit(index)}
                                    style={styles.editButton}
                                />
                            </DataTable.Cell>
                        </DataTable.Row>
                    ))}
                </DataTable>
            </Modal>

            {
                selectedPerfil && (
                    <ModalEditPrecio
                        visible={editModalVisible}
                        onDismiss={() => setEditModalVisible(false)}
                        title={selectedPerfil?.nombre || 'No hay perfil'}
                        inputLabel='Peso g/m'
                        affix='g'
                        initialValue={selectedPerfil?.gramos_por_m || 0}
                        onSave={handleSave}
                    />
                )
            }
        </Portal >
    );
};

const styles = StyleSheet.create({
    containerStyle: {
        width: '98%',
        alignSelf: 'center',
        borderRadius: 8,
    },
    title: {

    },
    tableHeader: {
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },

    row: {
        borderBottomWidth: 1,
    },
    cellText: {
        textAlign: 'center',
        fontSize: 14,
    },
    editButton: {
        margin: 0,
        backgroundColor: 'transparent',
    },
});

export default ModalSerie; 