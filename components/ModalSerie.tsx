import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Modal, Portal, Text, DataTable, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ModalEditarPeso from './ModalEditarPeso';

interface ModalSerieProps {
    visible: boolean;
    hideModal: () => void;
    serie: string;
}

const perfilesIniciales = {
    '25 2H': [
        { nombre: 'Marco superior', gramos: 972 },
        { nombre: 'Marco inferior', gramos: 978 },
        { nombre: 'Marco lateral', gramos: 669 },
        { nombre: 'Hoja Superior', gramos: 492 },
        { nombre: 'Hoja inferior', gramos: 666 },
        { nombre: 'Hoja lateral', gramos: 580 },
        { nombre: 'Hoja enganche c', gramos: 557 },
    ],
    '25 3H': [
        { nombre: 'Marco superior', gramos: 972 },
        { nombre: 'Marco inferior', gramos: 978 },
        { nombre: 'Marco lateral', gramos: 669 },
        { nombre: 'Hoja Superior', gramos: 492 },
        { nombre: 'Hoja central', gramos: 666 },
        { nombre: 'Hoja inferior', gramos: 666 },
        { nombre: 'Hoja lateral', gramos: 580 },
        { nombre: 'Hoja enganche c', gramos: 557 },
    ],
    '20': [
        { nombre: 'Marco superior', gramos: 850 },
        { nombre: 'Marco inferior', gramos: 855 },
        { nombre: 'Marco lateral', gramos: 580 },
        { nombre: 'Hoja Superior', gramos: 450 },
        { nombre: 'Hoja inferior', gramos: 580 },
        { nombre: 'Hoja lateral', gramos: 520 },
        { nombre: 'Hoja enganche c', gramos: 500 },
    ]
};

const ModalSerie = ({ visible, hideModal, serie }: ModalSerieProps) => {
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedPerfil, setSelectedPerfil] = useState<{nombre: string, gramos: number, index: number} | null>(null);
    const [perfiles, setPerfiles] = useState(perfilesIniciales);
    
    const getPerfilesBySerie = () => {
        return perfiles[serie as keyof typeof perfiles] || perfiles['25 2H'];
    };

    const handleEdit = (index: number) => {
        const perfilSeleccionado = getPerfilesBySerie()[index];
        setSelectedPerfil({...perfilSeleccionado, index});
        setEditModalVisible(true);
    };

    const handleSavePeso = (nuevoPeso: number) => {
        if (selectedPerfil) {
            const perfilesActualizados = {...perfiles};
            const serieActual = serie as keyof typeof perfiles;
            perfilesActualizados[serieActual] = perfilesActualizados[serieActual].map((perfil, index) => 
                index === selectedPerfil.index ? {...perfil, gramos: nuevoPeso} : perfil
            );
            setPerfiles(perfilesActualizados);
        }
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
                        <Text style={styles.title}>Serie {serie}</Text>
                        <TouchableOpacity onPress={hideModal} style={styles.closeButton}>
                            <MaterialCommunityIcons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                    
                    <DataTable style={{width: '100%'}}>
                        <DataTable.Header style={styles.tableHeader}>
                            <DataTable.Title textStyle={styles.headerText}>Perfil</DataTable.Title>
                            <DataTable.Title numeric textStyle={styles.headerText}>gr/m</DataTable.Title>
                            <DataTable.Title numeric textStyle={styles.headerText}>Editar</DataTable.Title>
                        </DataTable.Header>

                        {getPerfilesBySerie().map((perfil, index) => (
                            <DataTable.Row key={index} style={styles.row}>
                                <DataTable.Cell textStyle={styles.cellText}>{perfil.nombre}</DataTable.Cell>
                                <DataTable.Cell numeric textStyle={styles.cellText}>{perfil.gramos}</DataTable.Cell>
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
                    onSave={handleSavePeso}
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