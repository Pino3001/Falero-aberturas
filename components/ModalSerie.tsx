import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Modal, Portal, Text, DataTable, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ModalEditarPeso from './ModalPesoXmetro';
import { useBD, PerfilesOption, SerieOption } from '../contexts/BDContext';

interface ModalSerieProps {
    visible: boolean;
    hideModal: () => void;
    serie: SerieOption;
    perfiles: PerfilesOption[];
}

const ModalSerie = ({ visible, hideModal, serie , perfiles}: ModalSerieProps) => {
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedPerfil, setSelectedPerfil] = useState<PerfilesOption | null>(null);
    
    const { updatePerfilGramos } = useBD();

    

    const handleEdit = (index: number) => {
        const perfilSeleccionado = perfiles[index];
        setSelectedPerfil(perfilSeleccionado);
        setEditModalVisible(true);
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={hideModal}
                contentContainerStyle={styles.containerStyle}
                style={styles.modalBackground}
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Serie {serie.nombre}</Text>
                        <TouchableOpacity onPress={hideModal} style={styles.closeButton}>
                            <MaterialCommunityIcons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    <DataTable style={{ width: '100%' }}>
                        <DataTable.Header style={styles.tableHeader}>
                            <DataTable.Title textStyle={styles.headerText}>Perfil</DataTable.Title>
                            <DataTable.Title numeric textStyle={styles.headerText}>gr/m</DataTable.Title>
                            <DataTable.Title numeric textStyle={styles.headerText}>Editar</DataTable.Title>
                        </DataTable.Header>

                        {perfiles.map((perfil, index) => (
                            <DataTable.Row key={index} style={styles.row}>
                                <DataTable.Cell textStyle={styles.cellText}>{perfiles.find(p => p.serie_id === serie.id)?.nombre}</DataTable.Cell>
                                <DataTable.Cell numeric textStyle={styles.cellText}>{perfil.gramos_por_m}</DataTable.Cell>
                                <DataTable.Cell numeric>
                                    <IconButton
                                        icon="pencil"
                                        iconColor="white"
                                        size={20}
                                        onPress={() => handleEdit(index)}
                                        style={styles.editButton}
                                    />
                                </DataTable.Cell>
                            </DataTable.Row>
                        ))}
                    </DataTable>
                </View>
            </Modal>

            {selectedPerfil && (
                <ModalEditarPeso
                    visible={editModalVisible}
                    hideModal={() => setEditModalVisible(false)}
                    perfil={selectedPerfil}
                />
            )}
        </Portal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    containerStyle: {
        width: '98%',
        alignSelf: 'center',
        backgroundColor: '#1E1E1E',
        padding: 20,
        margin: 20,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    content: {
        width: 350,
        alignSelf: 'center',
        gap: 15,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 20
    },
    closeButton: {
        padding: 5,
    },
    tableHeader: {
        backgroundColor: '#6200ee',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    headerText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    row: {
        backgroundColor: '#2d2d2d',
        borderBottomWidth: 1,
        borderBottomColor: '#3d3d3d',
    },
    cellText: {
        textAlign: 'center',
        color: 'white',
        fontSize: 14,
    },
    editButton: {
        margin: 0,
        backgroundColor: 'transparent',
    },
});

export default ModalSerie; 