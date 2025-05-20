import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Modal, Portal, Text, DataTable, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ModalPrecioGramo from './ModalPrecioGramo';
import { ColorSerieOption, useBD } from '@/contexts/BDContext';

interface ModalColorProps {
    visible: boolean;
    hideModal: () => void;
    color_id: string;
}



const ModalColor = ({ visible, hideModal, color_id }: ModalColorProps) => {
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedAcabado, setSelectedAcabado] = useState<ColorSerieOption & { index: number } | null>(null);
    const { preciosSerieColor, updatePrecioSerieColor, colors, series } = useBD();
    
    const getPreciosByColor = () => {
        return preciosSerieColor.filter(p => p.color_id === color_id);
    };

    const handleEdit = (index: number) => {
        const acabadoSeleccionado = getPreciosByColor()[index];
        setSelectedAcabado({...acabadoSeleccionado, index});
        setEditModalVisible(true);
    };

    const handleSavePrecio = (nuevoPrecio: number) => {
        if (selectedAcabado) {
            updatePrecioSerieColor(color_id, selectedAcabado.serie_id, nuevoPrecio);
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
                        <Text style={styles.title}>Color {colors.find(c => c.id === color_id)?.color}</Text>
                        <TouchableOpacity onPress={hideModal} style={styles.closeButton}>
                            <MaterialCommunityIcons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                    
                    <DataTable style={{width: '100%'}}>
                        <DataTable.Header style={styles.tableHeader}>
                            <DataTable.Title textStyle={styles.headerText}>Serie</DataTable.Title>
                            <DataTable.Title numeric textStyle={styles.headerText}>Precio/Kg</DataTable.Title>
                            <DataTable.Title numeric textStyle={styles.headerText}>Editar</DataTable.Title>
                        </DataTable.Header>

                        {getPreciosByColor().map((acabado, index) => (
                            <DataTable.Row key={index} style={styles.row}>
                                <DataTable.Cell textStyle={styles.cellText}>{series.find(s => s.id === acabado.serie_id)?.nombre}</DataTable.Cell>
                                <DataTable.Cell numeric textStyle={styles.cellText}>US${acabado.precio_kilo}</DataTable.Cell>
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

            {selectedAcabado && (
                <ModalPrecioGramo
                    visible={editModalVisible}
                    hideModal={() => setEditModalVisible(false)}
                    color_id={color_id }
                    serie_id={selectedAcabado.serie_id}
                    onSave={handleSavePrecio}
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