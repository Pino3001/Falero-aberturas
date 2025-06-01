import { getPresupuestos, getPresupuestoByID } from "@/app/utils/operacionesDB";
import { useBD } from "@/contexts/BDContext";
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { ActivityIndicator, Button, Card, Dialog, IconButton, List } from "react-native-paper";
import ModalMostrarPresupuesto from "../components/_modales/ModalMostrarPresupuesto";
import { PresupuestosOption, PresupuestosOptionDefault } from "@/constants/interfases";
import Colors from "@/constants/Colors";
import SwipeableRow from "@/components/SwipeableRow"

export default function ListarPresupuestos({ path }: { path: string }) {
    const [presupuestos, setPresupuestos] = useState<PresupuestosOption[] | undefined>(undefined);
    const [presupuestoSelec, setPresupuestoSelec] = useState<PresupuestosOption>(PresupuestosOptionDefault);
    const [modal, setModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<PresupuestosOption | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [loading, setLoading] = useState(true);

    const handleDelete = async (item: PresupuestosOption) => {
        setItemToDelete(item);
        setShowDialog(true);
    };

    const confirmDelete = async () => {
        if (itemToDelete) {
            await dropPresupuestoBDContext(itemToDelete);
            setShowDialog(false);
            setItemToDelete(null);
        }
    };

    const { presupuestosUltimaAct, dropPresupuestoBDContext } = useBD();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const presupuestos = await getPresupuestos();
                setPresupuestos(presupuestos);
            } catch (error) {
                console.error('Error cargando presupuestos:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [presupuestosUltimaAct]);

    if (loading) {
        return (
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <ActivityIndicator
                    size={68}
                    color={Colors.colors.complementario} // Cambia el color según tu tema
                />
            </View>
        );
    }

    return (
        <>
            <FlatList
                data={presupuestos}
                style={{ width: "100%" }}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={{ width: '100%', paddingHorizontal: 0 }}>
                        <SwipeableRow
                            onPress={async () => {
                                const presupuesto = await getPresupuestoByID(item.id);
                                setPresupuestoSelec(presupuesto);
                                setModal(true);
                            }}
                            onDelete={() => handleDelete(item)}
                            isDeleting={showDialog}
                        >
                            <Card style={{
                                borderRadius: 8,
                                borderColor: Colors.colors.complementario,
                                width: '98%', alignSelf: 'center',
                                marginVertical: 4,
                                backgroundColor: Colors.colors.background_modal,
                                borderWidth: 1,
                            }}>
                                <List.Section
                                    style={{

                                        marginVertical: 4
                                    }}>

                                    <List.Item
                                        title={
                                            <Text>
                                                <Text style={{ fontSize: 14, color: Colors.colors.text, fontWeight: "bold" }}>Cliente: </Text>
                                                <Text style={{ fontSize: 14, color: Colors.colors.text }}>{item.nombre_cliente.substring(0, 30)}</Text>
                                            </Text>
                                        }
                                        titleStyle={{ color: Colors.colors.text }}
                                        description={
                                            <View style={{ flexDirection: "row", justifyContent: "space-between", width: '100%' }}>
                                                <Text>
                                                    <Text style={{ fontSize: 12, color: Colors.colors.text, fontWeight: "bold" }}>  Fecha: </Text>
                                                    <Text style={{ fontSize: 12, color: Colors.colors.text }}>{item.fecha?.toLocaleDateString() || 0}</Text>
                                                </Text>
                                                <Text >
                                                    <Text style={{ fontSize: 12, color: Colors.colors.text, fontWeight: "bold" }}>Total: </Text>
                                                    <Text style={{ fontSize: 12, color: Colors.colors.text }}>{item.precio_total.toFixed(2)}</Text>
                                                </Text>
                                            </View>
                                        }
                                        descriptionStyle={{ color: '#bbbbbb' }}
                                        left={props => <List.Icon {...props} icon="star" color={Colors.colors.text} />}
                                    />
                                </List.Section>

                            </Card>
                        </SwipeableRow>
                    </View>
                )}
                ListEmptyComponent={<List.Item title="No hay presupuestos" titleStyle={{color: Colors.colors.text}}/>}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={10}
                removeClippedSubviews={false}
            />

            <ModalMostrarPresupuesto
                visible={modal}
                onClose={() => setModal(false)}
                animationType="none"
                transparent={true}
                presupuesto={presupuestoSelec}
            />

            <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
                <Dialog.Title style={{ color: Colors.colors.text }}>Confirmar eliminación</Dialog.Title>
                <Dialog.Content>
                    <Text style={{ color: Colors.colors.text }}>¿Estás seguro de eliminar este presupuesto?</Text>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button textColor={Colors.colors.complementario} onPress={() => setShowDialog(false)}>Cancelar</Button>
                    <Button textColor={Colors.colors.complementario} onPress={confirmDelete}>Eliminar</Button>
                </Dialog.Actions>
            </Dialog>
        </>
    );
}

