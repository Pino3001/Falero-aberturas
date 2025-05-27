import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Button, Card, List, TextInput, Text, Switch, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ModalSerie from './ModalSerie';
import ModalColor from './ModalColor';
import ModalPrecioM2 from './ModalPrecioM2';
import ModalAccesoriosSerie from './ModalAccesoriosSerie';
import { ColorOption, PerfilesOption, PreciosVariosOption, PreciosVariosOptionDefault, SerieOption, SerieOptionDefault, useBD } from '../contexts/BDContext';
import { preciosVariosEnum } from '@/app/Data/variablesGlobales';

interface EditPrecioProps {
    precio: string;
    onPrecioChange: (precio: string) => void;
}

export default function EditPrecio({ }: EditPrecioProps) {
    console.log("EditPrecio: entro");
    const [modal, setModal] = useState<{
        visible: boolean;
        tipo?: 'serie' | 'color' | 'preciosVarios' | 'accesorios';
        dataModalSerie: {
            serie: SerieOption;
            perfiles: PerfilesOption[];
        };
        dataModalPrecioM2: {
            vario: PreciosVariosOption
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
    });
    const [isEditing, setIsEditing] = useState(false);
    const [manoObra, setManoObra] = useState<string>("");
    const { stateBD, updatePrecioVariosBDContext } = useBD();
    const { colors, series, preciosVarios, perfiles } = stateBD;
    console.log("preciosVarios:",preciosVarios);

    const handleEditToggle = async () => {
        if (isEditing) {
            setIsEditing((prev) => !prev);
            await updatePrecioVariosBDContext({ ...preciosVarios.find(p => p.nombre === 'Mano de Obra') as PreciosVariosOption, precio: Number(manoObra) });
        } else {
            setIsEditing((prev) => !prev);
        }
    };

    return (
        <View style={styles.container}>
            {/* Sección Aluminio */}
            <Card style={styles.card}>
                <Card.Title title="Aluminio" titleStyle={styles.title} />
                <Card.Content>
                    <List.Accordion
                        title="Editar Serie"
                        style={styles.accordion}
                        titleStyle={styles.accordionTitle}
                        left={props => <List.Icon {...props} icon="shape" color="white" />}
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
                    ><List.Icon icon="palette" color="white" style={{ marginLeft: 18 }} />
                        <Text style={{ fontSize: 16, color: 'white' }}>Colores</Text>
                    </TouchableOpacity>
                </Card.Content>
            </Card>

            {/* Sección Accesorios */}
            <Card style={styles.card}>
                <Card.Title title="Accesorios" titleStyle={styles.title} />
                <Card.Content>
                    <List.Accordion
                        title="Editar Accesorios"
                        style={styles.accordion}
                        titleStyle={styles.accordionTitle}
                        left={props => <List.Icon {...props} icon="tools" color="white" />}
                    >
                        {preciosVarios.filter(x=> !x.nombre.includes(preciosVariosEnum.manoDeObra)).map((vario) => (
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

            {/* Sección Mano de Obra */}
            <Card style={styles.card}>
                <Card.Title title="Mano de Obra" titleStyle={styles.title} />
                <Card.Content>
                    <View style={styles.contentContainer}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                mode="outlined"
                                value={preciosVarios.find(p => p.nombre === preciosVariosEnum.manoDeObra)?.precio.toString() || ''}
                                onChangeText={(text) => {
                                    if (/^\d*\.?\d*$/.test(text) || text === '') {
                                        setManoObra(text);
                                    }
                                }}
                                style={[
                                    styles.input,
                                    !isEditing && styles.inputDisabled
                                ]}
                                contentStyle={styles.inputContent}
                                right={<TextInput.Affix text="%" />}
                                theme={{
                                    colors: {
                                        text: 'white',
                                        primary: 'white',
                                        onSurfaceVariant: 'white',
                                        placeholder: 'white',
                                        disabled: '#3700b3',
                                        background: isEditing ? '#6200ee' : '#4B0082',
                                    },
                                }}
                                textColor="white"
                                cursorColor="white"
                                keyboardType="numeric"
                                editable={isEditing}
                                selectionColor="rgba(255, 255, 255, 0.3)"
                            />
                            <TouchableOpacity
                                style={[
                                    styles.editButton,
                                    isEditing && styles.editButtonActive
                                ]}
                                onPress={handleEditToggle}
                            >
                                <MaterialCommunityIcons
                                    name={isEditing ? "check" : "pencil"}
                                    size={24}
                                    color="white"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
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
                </>
                )
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 16,
    },
    card: {
        marginBottom: 16,
        elevation: 2,
        width: '98%',
        backgroundColor: '#1E1E1E',
    },
    title: {
        color: 'white',
    },
    accordion: {
        backgroundColor: '#6200ee',
        marginVertical: 4,
    },
    accordionTitle: {
        color: 'white',
        fontSize: 16,
    },
    item: {
        backgroundColor: '#3700b3',
    },
    itemTitle: {
        color: 'white',
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
        backgroundColor: '#6200ee',
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
        backgroundColor: '#4CAF50',
    },
    saveButtonContainer: {
        width: '100%',
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 10,
    },
    submitButton: {
        backgroundColor: '#4CAF50',
        padding: 8,
    },
    submitButtonLabel: {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
    },
    snackbar: {
        backgroundColor: 'red',
    },
    buttonColores: {
        height: 60,
        borderRadius: 0,
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        justifyContent: 'flex-start',
    }
});