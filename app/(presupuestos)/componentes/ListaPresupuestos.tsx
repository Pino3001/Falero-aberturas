import { getPresupuestos, getPresupuestoByID, buscarPresupuestosNombre } from "@/utils/_db/operacionesDB";
import { useBD } from "@/utils/contexts/BDContext";
import React, { useEffect, useState } from "react";
import { View, FlatList } from "react-native";
import { ActivityIndicator, Button, Dialog, IconButton, List, Surface, TextInput, Text } from "react-native-paper";
import ModalMostrarPresupuesto from "../../(diseños-sistema)/modales/ModalMostrarPresupuesto";
import { PresupuestosOption, PresupuestosOptionDefault } from "@/utils/constants/interfases";
import { RefreshControl } from "react-native-gesture-handler";
import { useTheme } from '@/utils/contexts/ThemeContext';
import { router } from "expo-router";
import ItemList from "@/app/(diseños-sistema)/componentes/ItemList";


export default function ListarPresupuestos({ path }: { path: string }) {
    const { colors } = useTheme();
    const [presupuestos, setPresupuestos] = useState<PresupuestosOption[] | undefined>(undefined);
    const [presupuestoSelec, setPresupuestoSelec] = useState<PresupuestosOption>(PresupuestosOptionDefault);
    const [modal, setModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<PresupuestosOption | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [loading, setLoading] = useState(true);
    const [buscador, setBuscador] = useState(false);
    const [searchText, setSearchText] = useState('');
    const { presupuestosUltimaAct, dropPresupuestoBDContext } = useBD();

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (searchText.length > 0) {
                    try {
                        const resultados = await buscarPresupuestosNombre(searchText);
                        setPresupuestos(resultados);
                    } catch (error) {
                        console.error("Error al buscar:", error);
                    }
                } else {
                    const presupuestos = await getPresupuestos();
                    setPresupuestos(presupuestos)
                }
            } catch (error) {
                console.error('Error cargando presupuestos:', error);
            }
        }
        fetchData();
    }, [searchText]);

    if (loading) {
        return (
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <ActivityIndicator
                    size={68}
                />
            </View>
        );
    }

    const handleSearch = async (text: string) => {
        setSearchText(text);
    };

    const activarBuscador = () => {
        if (buscador) {
            setSearchText('');
            setBuscador(false);
        } else {
            setBuscador(true);
        }
    }

    return (
        <>
            <FlatList
                data={presupuestos}
                style={{ width: "100%" }}
                keyExtractor={(item) => item.id.toString()}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl
                        refreshing={false}
                        onRefresh={() => activarBuscador()}
                        progressViewOffset={1000}
                        colors={["transparent"]}
                    />
                }
                ListHeaderComponent={
                    buscador ?
                        <Surface style={{ flexDirection: "row", backgroundColor: 'transparent', marginLeft: 10 }}>
                            <TextInput
                                mode="outlined"
                                label="Buscar"
                                onChangeText={handleSearch}
                                style={{
                                    width: '80%',
                                    height: 40,
                                    backgroundColor: 'transparent',
                                }}
                                right={
                                    <TextInput.Icon
                                        icon="magnify"
                                        color={colors.primary}
                                        size={26}
                                    />
                                }
                                outlineColor={colors.primary}
                                activeOutlineColor={colors.primary}
                                dense={true}
                            />

                            <IconButton
                                icon="filter"
                                onPress={() => {
                                    setBuscador(false);
                                    setSearchText('');
                                }}
                                style={{ width: '10%' }}
                                iconColor={colors.primary}
                            />
                        </Surface>
                        : null
                }
                renderItem={({ item }) => (
                    <ItemList
                        presupuesto={item}
                        onLongPress={() => {
                            router.push(`/(presupuestos)/editar/${item.id}`);
                        }}
                        onPress={async () => {
                            const presupuesto = await getPresupuestoByID(item.id);
                            setPresupuestoSelec(presupuesto);
                            setModal(true);
                        }}
                        onDelete={() => handleDelete(item)}
                        isDeleting={showDialog}
                    />
                )}
                ListEmptyComponent={<List.Item title="No hay presupuestos" />}
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
                initialPresupuesto={presupuestoSelec}
            />

            <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
                <Dialog.Title >Eliminar</Dialog.Title>
                <Dialog.Content>
                    <Text >¿Estás seguro de eliminar este presupuesto?</Text>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={() => setShowDialog(false)}>Cancelar</Button>
                    <Button onPress={confirmDelete}>Eliminar</Button>
                </Dialog.Actions>
            </Dialog>
        </>
    );
}

