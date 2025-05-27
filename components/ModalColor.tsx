import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Modal, Portal, Text, DataTable, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ModalPrecioGramo from './ModalPrecioGramo';
import { ColorOption } from '@/contexts/BDContext';

interface ModalColorProps {
    visible: boolean;
    hideModal: () => void;
    colors?: ColorOption[];
}



const ModalColor = ({ visible, hideModal, colors }: ModalColorProps) => {
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedAcabado, setSelectedAcabado] = useState<ColorOption | null>(null);


    const handleEdit = (color: ColorOption) => {
        setSelectedAcabado(color);
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
                        <Text style={styles.title}>Colores</Text>
                        <TouchableOpacity onPress={hideModal} style={styles.closeButton}>
                            <MaterialCommunityIcons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    <DataTable style={{ width: '100%' }}>
                        <DataTable.Header style={styles.tableHeader}>
                            <DataTable.Title textStyle={styles.headerText}>Color</DataTable.Title>
                            <DataTable.Title numeric textStyle={styles.headerText}>Precio/Kg</DataTable.Title>
                            <DataTable.Title numeric textStyle={styles.headerText}>Editar</DataTable.Title>
                        </DataTable.Header>

                        {colors?.map((acabado: ColorOption) => (
                            <DataTable.Row key={acabado.id} style={styles.row}>
                                <DataTable.Cell>
                                    <Text style={styles.cellText}>{acabado.color}</Text>
                                </DataTable.Cell>
                                <DataTable.Cell numeric>
                                    <Text style={styles.cellText}>US${acabado.precio}</Text>
                                </DataTable.Cell>
                                <DataTable.Cell numeric>
                                    <IconButton
                                        icon="pencil"
                                        iconColor="white"
                                        size={20}
                                        onPress={() => handleEdit(acabado)}
                                        style={styles.editButton}
                                    />
                                </DataTable.Cell>
                            </DataTable.Row>
                        ))}
                    </DataTable>
                </View>
            </Modal>

            {selectedAcabado && (
                <ModalPrecioGramo
                    visible={editModalVisible}
                    hideModal={() => setEditModalVisible(false)}
                    color={selectedAcabado}
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
        backgroundColor: '#1E1E1E',
        padding: 20,
        margin: 20,
        borderRadius: 8,
        alignSelf: 'center',
        width: '98%',
        maxWidth: 500,
    },
    content: {
        width: '110%',
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
        marginLeft: 20,
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
        color: 'white',
        fontSize: 14,
    },
    editButton: {
        margin: 0,
        backgroundColor: 'transparent',
    },
});

export default ModalColor; 