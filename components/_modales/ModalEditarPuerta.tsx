import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Modal, Portal, Text, DataTable, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ColorOption } from '@/utils/constants/interfases';
import Colors from '@/utils/constants/Colors';
import ModalPrecioPuerta from './ModalPrecioPuerta';

interface ModalEditarPuertaProps {
    visible: boolean;
    hideModal: () => void;
    colors?: ColorOption[];
}



const ModalEditarPuerta = ({ visible, hideModal, colors }: ModalEditarPuertaProps) => {
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
                        <Text style={styles.title}>Precio Puerta</Text>
                        <TouchableOpacity onPress={hideModal} style={styles.closeButton}>
                            <MaterialCommunityIcons name="close" size={24} color={Colors.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <DataTable style={{ width: '100%', alignContent: 'center' }}>
                        <DataTable.Header style={styles.tableHeader}>
                            <DataTable.Title textStyle={styles.headerText}>Acabado</DataTable.Title>
                            <DataTable.Title numeric textStyle={styles.headerText}>Precio</DataTable.Title>
                            <DataTable.Title numeric textStyle={styles.headerText}>Editar</DataTable.Title>
                        </DataTable.Header>

                        {colors?.map((acabado: ColorOption) => (
                            <DataTable.Row key={acabado.id} style={styles.row}>
                                <DataTable.Cell >
                                    <Text style={[styles.cellText, {fontSize: 12}]}>{acabado.color}</Text>
                                </DataTable.Cell >
                                <DataTable.Cell numeric>
                                    <Text style={styles.cellText}>US$ {acabado.precio_un_puerta}</Text>
                                </DataTable.Cell>
                                <DataTable.Cell numeric>
                                    <IconButton
                                        icon="pencil"
                                        iconColor={Colors.colors.text}
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

            {selectedAcabado ? (
                <ModalPrecioPuerta
                    visible={editModalVisible}
                    hideModal={() => setEditModalVisible(false)}
                    color={selectedAcabado}
                />
            ) : null}
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
        maxWidth: 500,
    },
    content: {
        width: '100%',
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
        marginLeft: 20,
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
        backgroundColor: Colors.colors.tabla,
        borderBottomWidth: 1,
        borderBottomColor:Colors.colors.border_contraste_black,
    },
    cellText: {
        color: Colors.colors.text,
        fontSize: 14,
    },
    editButton: {
        margin: 0,
        backgroundColor: 'transparent',
    },
});

export default ModalEditarPuerta; 