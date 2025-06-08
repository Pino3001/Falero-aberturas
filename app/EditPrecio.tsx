import React, { useState} from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Button, Card, List, TextInput, Text, Switch, Snackbar } from 'react-native-paper';
import ModalSerie from '../components/_modales/ModalSerie';
import ModalColor from '../components/_modales/ModalColor';
import ModalPrecioM2 from '../components/_modales/ModalPrecioM2';
import ModalAccesoriosSerie from '@/components/_modales/ModalAccesoriosSerie';
import { useBD } from '@/utils/contexts/BDContext';
import { cortinasEnum, preciosVariosEnum } from '@/utils/constants/variablesGlobales';
import { CortinaOption, CortinaOptionDefault, PerfilesOption, PreciosVariosOption, PreciosVariosOptionDefault, SerieOption, SerieOptionDefault } from '@/utils/constants/interfases';
import Colors from '@/utils/constants/Colors';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import ModalEditCortina from '../components/_modales/ModalEditCortina';
import ModalEditarPuerta from '../components/_modales/ModalEditarPuerta';
import { FontAwesome6 } from '@expo/vector-icons';

interface EditPrecioProps {
    precio: string;
    onPrecioChange: (precio: string) => void;
}

export default function EditPrecio({ }: EditPrecioProps) {
    const [modal, setModal] = useState<{
        visible: boolean;
        tipo?: 'serie' | 'color' | 'preciosVarios' | 'accesorios' | 'cortina' | 'puerta';
        dataModalSerie: {
            serie: SerieOption;
            perfiles: PerfilesOption[];
        };
        dataModalPrecioM2: {
            vario: PreciosVariosOption
        };
        dataModalCortina: {
            cortina: CortinaOption
        };
    }
    >({
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
    });
    const { stateBD } = useBD();
    const { colors, series, preciosVarios, perfiles, cortinas } = stateBD;

    return (
        <View style={styles.container}>
            {/* Sección Aluminio */}
            <Card style={styles.card}>
                <Card.Title title="Aluminio" titleStyle={styles.title} />
                <Card.Content >
                    <List.Accordion
                        title="Editar Serie"
                        style={styles.accordion}
                        titleStyle={styles.accordionTitle}
                        left={props => <List.Icon {...props} icon="shape" color={Colors.colors.text} />}
                        right={({ isExpanded }) => (
                            <List.Icon
                                icon={isExpanded ? "chevron-up" : "chevron-down"}
                                color={Colors.colors.text}
                            />
                        )}
                        theme={{
                            colors: {
                                background: 'transparent',
                            }
                        }}
                    >
                        {series.map((serie) => (
                            <List.Item
                                key={serie.id}
                                title={serie.nombre ?? '-1'}
                                onPress={() => {
                                    setModal((prevModal) => ({ ...prevModal, visible: true, tipo: 'serie', dataModalSerie: { serie, perfiles: perfiles.filter(p => p.serie_id === serie.id) } }));
                                }}
                                style={styles.item}
                                titleStyle={styles.itemTitle}
                            />
                        ))}
                    </List.Accordion>
                    <TouchableOpacity
                        style={[styles.accordion, styles.buttonColores]}

                        onPress={() => {
                            setModal((prevModal) => ({ ...prevModal, visible: true, tipo: 'color' }));
                        }}
                    ><List.Icon icon="palette" color={Colors.colors.text} style={{ marginLeft: 18 }} />
                        <Text style={{ fontSize: 16, color: Colors.colors.text }}>Acabado</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.accordion, styles.buttonColores]}

                        onPress={() => {
                            setModal((prevModal) => ({ ...prevModal, visible: true, tipo: 'puerta' }));
                        }}
                    ><FontAwesome6 name="door-open" size={22} color={Colors.colors.text} style={{ marginLeft: 18 }} />
                        <Text style={{ fontSize: 16, color: Colors.colors.text }}>Puertas</Text>
                    </TouchableOpacity>

                </Card.Content>
            </Card>

            {/* Sección Accesorios */}
            <Card style={styles.card}>
                <Card.Title title="Varios" titleStyle={styles.title} />
                <Card.Content>
                    <List.Accordion
                        title="Cortinas"
                        style={styles.accordion}
                        titleStyle={styles.accordionTitle}
                        left={props => <MaterialCommunityIcons {...props} name="curtains" size={24} color={Colors.colors.text} />}
                        right={({ isExpanded }) => (
                            <List.Icon
                                icon={isExpanded ? "chevron-up" : "chevron-down"}
                                color={Colors.colors.text}
                            />
                        )}
                        theme={{
                            colors: {
                                background: 'transparent',
                            }
                        }}
                    >
                        {cortinas.map((cortina) => (
                            cortina.tipo != cortinasEnum.ninguna ?
                                <List.Item
                                    key={cortina.id}
                                    title={cortina.tipo ?? 'Error'}
                                    onPress={() => setModal((prevModal) => ({ ...prevModal, visible: true, tipo: 'cortina', dataModalCortina: { cortina } }))}
                                    style={styles.item}
                                    titleStyle={{
                                        color: Colors.colors.text,
                                        fontSize: 16,
                                        marginLeft: -30,
                                        fontWeight: 'bold',
                                    }}
                                />
                                : null
                        ))}
                    </List.Accordion>
                    <List.Accordion
                        title="Edita Precios Varios"
                        style={styles.accordion}
                        titleStyle={styles.accordionTitle}
                        left={props => <List.Icon {...props} icon="tools" color={Colors.colors.text} />}
                        right={({ isExpanded }) => (
                            <List.Icon
                                icon={isExpanded ? "chevron-up" : "chevron-down"}
                                color={Colors.colors.text}
                            />
                        )}
                        theme={{
                            colors: {
                                background: 'transparent',
                            }
                        }}
                    >
                        {preciosVarios.map((vario) => (
                            <List.Item
                                key={vario.id}
                                title={vario.nombre ?? 'Error'}
                                onPress={() => setModal((prevModal) => ({ ...prevModal, visible: true, tipo: 'preciosVarios', dataModalPrecioM2: { vario } }))}
                                style={styles.item}
                                titleStyle={styles.itemTitle}
                            />
                        ))}
                        <List.Item
                            key="accesorios"
                            title="Accesorios"
                            onPress={() => setModal((prevModal) => ({ ...prevModal, visible: true, tipo: 'accesorios' }))}
                            style={styles.item}
                            titleStyle={styles.itemTitle}
                        />
                    </List.Accordion>
                </Card.Content>
            </Card>
            {
                modal && modal.visible && (<>
                    <ModalSerie
                        visible={modal.tipo === 'serie'}
                        hideModal={() => setModal((prevModal) => ({ ...prevModal, visible: false }))}
                        {...modal.dataModalSerie}
                    />
                    <ModalColor
                        visible={modal.tipo === 'color'}
                        hideModal={() => setModal((prevModal) => ({ ...prevModal, visible: false }))}
                        colors={colors}
                    />

                    <ModalPrecioM2
                        visible={modal.tipo === 'preciosVarios'}
                        hideModal={() => setModal((prevModal) => ({ ...prevModal, visible: false }))}
                        {...modal.dataModalPrecioM2}
                    />

                    <ModalAccesoriosSerie
                        visible={modal.tipo === 'accesorios'}
                        hideModal={() => setModal((prevModal) => ({ ...prevModal, visible: false }))}
                        series={stateBD.series}
                    />

                    <ModalEditCortina
                        visible={modal.tipo === 'cortina'}
                        hideModal={() => setModal((prevModal) => ({ ...prevModal, visible: false }))}
                        {...modal.dataModalCortina}
                    />
                    <ModalEditarPuerta
                        visible={modal.tipo === 'puerta'}
                        hideModal={() => setModal((prevModal) => ({ ...prevModal, visible: false }))}
                        colors={colors}
                    />
                </>
                )
            }
        </View>
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
        backgroundColor: Colors.colors.background_modal,
    },
    title: {
        color: Colors.colors.text,
    },
    accordion: {
        backgroundColor: Colors.colors.imput_black,
        borderColor: Colors.colors.complementario,
        borderWidth: 1,
        marginVertical: 4,
        borderRadius: 8,
    },
    accordionTitle: {
        color: Colors.colors.text,
        fontSize: 16,
    },
    item: {
        backgroundColor: Colors.colors.imput_black,
        borderColor: Colors.colors.border_contraste_black,
        borderWidth: 1
    },
    itemTitle: {
        color: Colors.colors.text,
        fontSize: 18,
        fontWeight: 'bold',
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
    editButtonActive: {
        backgroundColor: Colors.colors.verde,
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