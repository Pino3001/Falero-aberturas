import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { Modal, Portal, Text, DataTable, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ModalEditarAccesorio from './ModalEditarAccesorio';
import { SerieOption } from '@/utils/constants/interfases';
import Colors from '@/utils/constants/Colors';

interface ModalAccesoriosSerieProps {
    visible: boolean;
    hideModal: () => void;
    series: SerieOption[];
}

const ModalAccesoriosSerie = ({ visible, hideModal, series }: ModalAccesoriosSerieProps) => {
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedSerie, setSelectedSerie] = useState<SerieOption | null>(null);

    const handleEdit = (serie: SerieOption) => {
        setSelectedSerie(serie);
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
                        <Text style={styles.title}>Accesorios por Serie</Text>
                        <TouchableOpacity onPress={hideModal} style={styles.closeButton}>
                            <MaterialCommunityIcons name="close" size={24} color={Colors.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <DataTable style={styles.table}>
                        <DataTable.Header style={styles.tableHeader}>
                            <DataTable.Title textStyle={styles.headerText}>Serie</DataTable.Title>
                            <DataTable.Title numeric textStyle={styles.headerText}>Costo </DataTable.Title>
                            <DataTable.Title numeric textStyle={styles.headerText}>Editar</DataTable.Title>
                        </DataTable.Header>

                        {series?.map((serie) => (
                            <DataTable.Row key={serie.id} style={styles.row}>
                                <DataTable.Cell style={[styles.cellText, { fontSize: 12 }]}>
                                    <Text style={[styles.cellText, { fontSize: 11 }]}>{serie.nombre}</Text>
                                </DataTable.Cell>
                                <DataTable.Cell numeric textStyle={styles.cellText}>
                                    <Text style={styles.cellText}>{serie.precio_accesorios}</Text>
                                </DataTable.Cell>
                                <DataTable.Cell numeric>
                                    <IconButton
                                        icon="pencil"
                                        iconColor={Colors.colors.text}
                                        size={20}
                                        onPress={() => handleEdit(serie)}
                                        style={styles.editButton}
                                    />
                                </DataTable.Cell>
                            </DataTable.Row>
                        ))}
                    </DataTable>
                </View>
            </Modal>

            {selectedSerie && (
                <ModalEditarAccesorio
                    visible={editModalVisible}
                    hideModal={() => setEditModalVisible(false)}
                    serie={selectedSerie}
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
        backgroundColor: Colors.colors.background_modal,
        padding: 20,
        margin: 20,
        borderRadius: 8,
        alignSelf: 'center',
        width: '98%',
        maxWidth: 600,
    },
    content: {
        width: '100%',
        alignSelf: 'center',
        gap: 20,
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
        marginLeft: 20,
    },
    closeButton: {
        padding: 5,
    },
    table: {
        backgroundColor: Colors.colors.tabla,
        borderRadius: 8,
        overflow: 'hidden',
    },
    tableHeader: {
        backgroundColor: Colors.colors.complementario,
    },
    headerText: {
        color: Colors.colors.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    row: {
        backgroundColor: Colors.colors.tabla,
        borderBottomWidth: 1,
        borderBottomColor: Colors.colors.border_contraste_black,
    },
    cellText: {
        fontSize: 14,
        color: Colors.colors.text,
    },
    editButton: {
        margin: 0,
        backgroundColor: 'transparent',
    },
});

export default ModalAccesoriosSerie; 