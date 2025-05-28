import { getPresupuestos, getPresupuestoByID } from "@/app/utils/utilsDB";
import { useBD } from "@/contexts/BDContext";
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, FlatList, TouchableOpacity } from "react-native";
import { Card, List, PaperProvider, Title } from "react-native-paper";
import ModalMostrarPresupuesto from "./ModalMostrarPresupuesto";
import { PresupuestosOption, PresupuestosOptionDefault } from "@/app/utils/interfases";

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
                                    backgroundColor: '#6200ee',
                                    borderRadius: 8,
                                    marginVertical: 4
                                }}>

                                <List.Item
                                    title={
                                        <Text>
                                            <Text style={{ fontSize: 14, color: 'white', fontWeight: "bold" }}>Cliente: </Text>
                                            <Text style={{ fontSize: 14, color: 'white' }}>{item.nombre_cliente.substring(0, 30)}</Text>
                                        </Text>
                                    }
                                    titleStyle={{ color: "white" }}
                                    description={
                                        <View style={{ flexDirection: "row", justifyContent: "space-between", width: '100%' }}>
                                            <Text>
                                                <Text style={{ fontSize: 12, color: 'white', fontWeight: "bold" }}>  Fecha: </Text>
                                                <Text style={{ fontSize: 12, color: 'white' }}>{item.fecha?.toLocaleDateString() || 0}</Text>
                                            </Text>
                                            <Text >
                                                <Text style={{ fontSize: 12, color: 'white', fontWeight: "bold" }}>Total: </Text>
                                                <Text style={{ fontSize: 12, color: 'white' }}>{item.precio_total.toFixed(2)}</Text>
                                            </Text>
                                        </View>
                                    }
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