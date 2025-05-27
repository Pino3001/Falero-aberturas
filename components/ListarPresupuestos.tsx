import { getPresupuestos, getPresupuestoByID } from "@/app/utils/utilsDB";
import { PresupuestosOption, PresupuestosOptionDefault, useBD } from "@/contexts/BDContext";
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, FlatList, TouchableOpacity } from "react-native";
import { Card, List, Title } from "react-native-paper";
import ModalMostrarPresupuesto from "./ModalMostrarPresupuesto";

export default function ListarPresupuestos({ path }: { path: string }) {
    const [presupuestos, setPresupuestos] = useState<PresupuestosOption[] | undefined>(undefined);
    const [presupuestoSelec, setPresupuestoSelec] = useState<PresupuestosOption>(PresupuestosOptionDefault);
    const [modal, setModal] = useState(false);
    const { presupuestosUltimaAct } = useBD();
    useEffect(() => {
        const fetchData = async () => {
            const presupuestos = await getPresupuestos();
            setPresupuestos(presupuestos);
        }
        fetchData();
    }, [presupuestosUltimaAct]);
    return (
        <>
            <FlatList
                data={presupuestos}
                style={{ width: "100%" }}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={async () => {
                            const presupuesto = await getPresupuestoByID(item.id);
                            setPresupuestoSelec(presupuesto);
                            setModal(true);

                        }}>
                        <Card style={{ width: '98%', alignSelf: 'center', marginVertical: 4 }}>
                            <List.Section
                                style={{
                                    backgroundColor: '#6200ee', // Cambié el rojo por un color más Material Design
                                    borderRadius: 8,
                                    marginVertical: 4 // Espacio entre items
                                }}>
                                <List.Subheader style={{ color: 'white' }}>
                                    `Cliente: ${item.nombre_cliente}`
                                </List.Subheader>
                                <List.Item
                                    title={`Fecha: ${item.fecha?.toLocaleDateString() || 0} - Total: $${item?.precio_total || 0}`}
                                    titleStyle={{ color: "white" }}
                                    description={`Cliente: ${item.nombre_cliente}`}
                                    descriptionStyle={{ color: '#bbbbbb' }}
                                    left={props => <List.Icon {...props} icon="star" color="white" />}
                                />
                            </List.Section>

                        </Card>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<List.Item title="No hay presupuestos" />}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={10}
            />

                <ModalMostrarPresupuesto
                    visible={modal}
                    onClose={() => setModal(false)}
                    animationType="none"
                    transparent={true}
                    presupuesto={presupuestoSelec}
                />
        </>
    );
}