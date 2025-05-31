import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Modal, Portal, Text, DataTable, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ModalEditarPeso from './ModalPesoXmetro';
import { PerfilesOption, SerieOption } from '@/app/utils/interfases';
import Colors from '@/constants/Colors';

interface ModalSerieProps {
    visible: boolean;
    hideModal: () => void;
    serie?: SerieOption;
    perfiles: PerfilesOption[];
}

const ModalSerie = ({ visible, hideModal, serie , perfiles}: ModalSerieProps) => {
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedPerfil, setSelectedPerfil] = useState<PerfilesOption | null>(null);
    
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
                        <Text style={styles.title}>{serie?.nombre}</Text>
                        <TouchableOpacity onPress={hideModal} style={styles.closeButton}>
                            <MaterialCommunityIcons name="close" size={24} color={Colors.colors.text} />
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
                                <DataTable.Cell textStyle={[styles.cellText, {marginRight: -40}]}>{perfil.nombre}</DataTable.Cell>
                                <DataTable.Cell numeric textStyle={styles.cellText}>{perfil.gramos_por_m} g</DataTable.Cell>
                                <DataTable.Cell numeric>
                                    <IconButton
                                        icon="pencil"
                                        iconColor={Colors.colors.text}
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
        backgroundColor: Colors.colors.transparencia_modal,
    },
    containerStyle: {
        width: '98%',
        alignSelf: 'center',
        backgroundColor: Colors.colors.background_modal,
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
        color: Colors.colors.text,
        fontWeight: 'bold',
        marginLeft: 20
    },
    closeButton: {
        padding: 5,
    },
    tableHeader: {
        backgroundColor: Colors.colors.complementario,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    headerText: {
        color: Colors.colors.text,
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
        color: Colors.colors.text,
        fontSize: 14,
    },
    editButton: {
        margin: 0,
        backgroundColor: 'transparent',
    },
});

export default ModalSerie; 