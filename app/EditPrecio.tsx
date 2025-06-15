import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import {  Card, List, TextInput, Text } from 'react-native-paper';
import ModalSerie from '../components/_modales/ModalSerie';
import ModalColor from '../components/_modales/ModalColor';
import ModalAccesoriosSerie from '@/components/_modales/ModalAccesoriosSerie';
import { useBD } from '@/utils/contexts/BDContext';
import { cortinasEnum, preciosVariosEnum } from '@/utils/constants/variablesGlobales';
import { CortinaOption, CortinaOptionDefault, PerfilesOption, PreciosVariosOption, PreciosVariosOptionDefault, SerieOption, SerieOptionDefault } from '@/utils/constants/interfases';
import Colors from '@/utils/constants/Colors';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import ModalEditarPuerta from '../components/_modales/ModalEditarPuerta';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '@/utils/contexts/ThemeContext';
import ModalEditPrecio from '@/components/_modales/ModalEditPrecio';


type modalOption = {
    visible: boolean;
    tipo?: 'serie' | 'color' | 'preciosVarios' | 'accesorios' | 'cortina' | 'puerta';
    dataModalSerie: {
        serie: SerieOption;
        perfiles: PerfilesOption[];
    };
    dataModalPrecioM2: {
        vario: PreciosVariosOption;
    };
    dataModalCortina: {
        cortina: CortinaOption;
    };
};

const modalDefault: modalOption = {
    visible: false,
    tipo: undefined,
    dataModalSerie: {
        serie: SerieOptionDefault,
        perfiles: []
    },
    dataModalPrecioM2: {
        vario: PreciosVariosOptionDefault
    },
    dataModalCortina: {
        cortina: CortinaOptionDefault
    },
};

export default function EditPrecio({ }) {
    const { colors, fonts } = useTheme();
    const [modal, setModal] = useState<modalOption>(modalDefault);
    const { stateBD, updatePrecioVariosBDContext, updatePrecioCortinaBDContext } = useBD();
    const { acabado, series, preciosVarios, perfiles, cortinas } = stateBD;




    const handleSaveVario = async (nuevoPrecio: number) => {
        const varioToUpdate = modal.dataModalPrecioM2.vario; // Guardamos referencia por si se cierra el modal
        if (!varioToUpdate) return;

        try {
            await updatePrecioVariosBDContext({
                ...varioToUpdate,
                precio: nuevoPrecio
            });
        } finally {
            setModal(modalDefault);
        }
    };

    const handleSaveCortina = async (nuevoPrecio: number) => {
        const cortinaToUpdate = modal.dataModalCortina.cortina;
        if (!cortinaToUpdate) return;
        try {
            await updatePrecioCortinaBDContext({
                ...cortinaToUpdate,
                preciom2: nuevoPrecio
            });
        } finally {
            setModal(modalDefault);
        }
    };

    return (
        <View style={styles.container}>
            {/* Sección Aluminio */}
            <Card style={[styles.card, { backgroundColor: colors.surface }]}>
                <Card.Title title="Aluminio" titleStyle={{ color: colors.onPrimaryContainer, fontFamily: fonts.bold.fontFamily }} />
                <Card.Content >
                    <List.Accordion
                        title="Editar Serie"
                        style={[styles.accordion, { borderColor: colors.primary, backgroundColor: colors.background }]}
                        titleStyle={{
                            color: colors.onPrimaryContainer, fontSize: 16,
                            fontFamily: fonts.bold.fontFamily
                        }}
                        left={props => <List.Icon {...props} icon="shape" color={colors.secondary} />}
                        right={({ isExpanded }) => (
                            <List.Icon
                                icon={isExpanded ? "chevron-up" : "chevron-down"}
                                color={colors.primary}
                            />
                        )}
                        theme={{
                            colors: {
                                background: "transparent", // Cambia el fondo del menú desplegable
                            },
                        }}
                    >

                        <View style={{ borderWidth: 1, backgroundColor: colors.background, borderColor: colors.onPrimaryContainer }}>
                            {series.map((serie) => (
                                <List.Item
                                    key={serie.id}
                                    title={serie.nombre ?? '-1'}
                                    onPress={() => {
                                        setModal((prevModal) => ({ ...prevModal, visible: true, tipo: 'serie', dataModalSerie: { serie, perfiles: perfiles.filter(p => p.serie_id === serie.id) } }));
                                    }}
                                    style={{ backgroundColor: colors.background, width: '100%' }}
                                    titleStyle={{
                                        color: colors.onPrimaryContainer,
                                        fontSize: 16,
                                        fontFamily: fonts.bold.fontFamily,
                                    }}
                                />
                            ))}
                        </View>

                    </List.Accordion>
                    <TouchableOpacity
                        style={[styles.accordion, styles.buttonColores, { borderColor: colors.primary, backgroundColor: colors.background }]}

                        onPress={() => {
                            setModal((prevModal) => ({ ...prevModal, visible: true, tipo: 'color' }));
                        }}
                    ><List.Icon icon="palette" color={colors.secondary} style={{ marginLeft: 16 }} />
                        <Text style={{ fontSize: 16, color: colors.onPrimaryContainer, fontFamily: fonts.bold.fontFamily, marginLeft: 6 }}>Acabado</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.accordion, styles.buttonColores, { borderColor: colors.primary, backgroundColor: colors.background }]}
                        onPress={() => {
                            setModal((prevModal) => ({ ...prevModal, visible: true, tipo: 'puerta' }));
                        }}
                    ><FontAwesome6 name="door-open" size={22} color={colors.secondary} style={{ marginLeft: 16 }} />
                        <Text style={{ fontSize: 16, color: colors.onPrimaryContainer, fontFamily: fonts.bold.fontFamily, marginLeft: 6 }}>Puertas</Text>
                    </TouchableOpacity>

                </Card.Content>
            </Card>

            {/* Sección Accesorios */}
            <Card style={[styles.card, { backgroundColor: colors.surface }]}>
                <Card.Title title="Varios" titleStyle={{ color: colors.onPrimaryContainer, fontFamily: fonts.bold.fontFamily }} />
                <Card.Content>
                    <List.Accordion
                        title="Cortinas"
                        style={[styles.accordion, { borderColor: colors.primary, backgroundColor: colors.background }]}
                        titleStyle={{
                            color: colors.onPrimaryContainer, fontSize: 16,
                            fontFamily: fonts.bold.fontFamily
                        }}
                        left={props => <MaterialCommunityIcons {...props} name="curtains" size={24} color={colors.secondary} />}
                        right={({ isExpanded }) => (
                            <List.Icon
                                icon={isExpanded ? "chevron-up" : "chevron-down"}
                                color={colors.primary}
                            />
                        )}
                        theme={{
                            colors: {
                                background: 'transparent',
                            }
                        }}
                    >
                        <View style={{ borderWidth: 1, backgroundColor: colors.background, borderColor: colors.primary }}>
                            {cortinas.map((cortina) => (
                                cortina.tipo != cortinasEnum.ninguna ?
                                    <List.Item
                                        key={cortina.id}
                                        title={cortina.tipo ?? 'Error'}
                                        onPress={() => setModal((prevModal) => ({ ...prevModal, visible: true, tipo: 'cortina', dataModalCortina: { cortina } }))}
                                        style={{ backgroundColor: colors.background, width: '100%' }}
                                        titleStyle={{
                                            color: colors.onPrimaryContainer,
                                            fontSize: 16,
                                            fontFamily: fonts.bold.fontFamily,
                                        }}
                                    />
                                    : null
                            ))}
                        </View>

                    </List.Accordion>
                    <List.Accordion
                        title="Precios Varios"
                        style={[styles.accordion, { borderColor: colors.primary, backgroundColor: colors.background }]}
                        titleStyle={{
                            color: colors.onPrimaryContainer,
                            fontSize: 16,
                            fontFamily: fonts.bold.fontFamily
                        }}
                        left={props => <List.Icon {...props} icon="tools" color={colors.secondary} />}
                        right={({ isExpanded }) => (
                            <List.Icon
                                icon={isExpanded ? "chevron-up" : "chevron-down"}
                                color={colors.primary}
                            />
                        )}
                        theme={{
                            colors: {
                                background: 'transparent',
                            }
                        }}
                    >
                        <View style={{ borderWidth: 1, backgroundColor: colors.background, borderColor: colors.primary }}>
                            {preciosVarios.map((vario) => (
                                <List.Item
                                    key={vario.id}
                                    title={vario.nombre ?? 'Error'}
                                    onPress={() => setModal((prevModal) => ({ ...prevModal, visible: true, tipo: 'preciosVarios', dataModalPrecioM2: { vario } }))}
                                    style={{ backgroundColor: colors.background, width: '100%' }}
                                    titleStyle={{
                                        color: colors.onPrimaryContainer,
                                        fontSize: 16,
                                        fontFamily: fonts.bold.fontFamily,
                                    }}
                                />
                            ))}
                            <List.Item
                                key="accesorios"
                                title="Accesorios"
                                onPress={() => setModal((prevModal) => ({ ...prevModal, visible: true, tipo: 'accesorios' }))}
                                style={{ backgroundColor: colors.background, width: '100%' }}
                                titleStyle={{
                                    color: colors.onPrimaryContainer,
                                    fontSize: 16,
                                    fontFamily: fonts.bold.fontFamily,
                                }}
                            />
                        </View>

                    </List.Accordion>
                </Card.Content>
            </Card>
            {
                modal && modal.visible && (<>
                    <ModalSerie
                        visible={modal.tipo === 'serie'}
                        onDimiss={() => setModal(modalDefault)}
                        {...modal.dataModalSerie}
                    />
                    <ModalColor
                        visible={modal.tipo === 'color'}
                        onDimiss={() => setModal(modalDefault)}
                        acabado={acabado}
                    />
                    {modal.tipo === 'preciosVarios' && (
                        modal.dataModalPrecioM2?.vario?.nombre === preciosVariosEnum.manoDeObra ? (
                            <ModalEditPrecio
                                visible={true}
                                onDismiss={() => setModal((prevModal) => ({ ...prevModal, visible: false }))}
                                title={modal.dataModalPrecioM2.vario?.nombre || 'No hay nombre'}
                                inputLabel='Porcentaje ganancia'
                                affix='%'
                                initialValue={modal.dataModalPrecioM2.vario?.precio || 0}
                                onSave={handleSaveVario}
                            />
                        ) : (
                            <ModalEditPrecio
                                visible={true}
                                onDismiss={() => setModal((prevModal) => ({ ...prevModal, visible: false }))}
                                title={modal.dataModalPrecioM2.vario?.nombre || 'No hay nombre'}
                                inputLabel='Precio por M²'
                                affix='US$'
                                initialValue={modal.dataModalPrecioM2.vario?.precio || 0}
                                onSave={handleSaveVario}
                            />
                        )
                    )}
                    <ModalAccesoriosSerie
                        visible={modal.tipo === 'accesorios'}
                        onDimiss={() => setModal(modalDefault)}
                        series={stateBD.series}
                    />

                    <ModalEditPrecio
                        visible={modal.tipo === 'cortina'}
                        onDismiss={() => setModal((prevModal) => ({ ...prevModal, visible: false }))}
                        title={modal.dataModalCortina.cortina?.tipo || 'No hay cortina'}
                        inputLabel='Precio por M²'
                        affix='US$'
                        initialValue={modal.dataModalCortina.cortina?.preciom2 || 0}
                        onSave={handleSaveCortina}
                    />
                    <ModalEditarPuerta
                        visible={modal.tipo === 'puerta'}
                        onDimiss={() => setModal(modalDefault)}
                        acabado={acabado}
                    />
                </>
                )
            }
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'column',
        gap: 30,
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 16,
    },
    card: {
        marginBottom: 16,
        elevation: 2,
        width: '98%',
    },
    accordion: {
        borderWidth: 2,
        marginVertical: 4,
        borderRadius: 8,
    },
    contentContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    input: {
        backgroundColor: Colors.colors.active_color,
        alignSelf: 'center',
        justifyContent: 'center',
        width: '40%',
        height: 50,
        marginRight: 10,
    },
    inputDisabled: {
        backgroundColor: '#3700b3',
    },
    inputContent: {
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        textAlignVertical: 'center',
        paddingVertical: 0,
    },
    editButton: {
        backgroundColor: 'transparent',
        height: 45,
        width: 45,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonColores: {
        height: 60,
        borderRadius: 8,
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        justifyContent: 'flex-start',
    }
});