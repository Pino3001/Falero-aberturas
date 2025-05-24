import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Button, Card, List, TextInput, Text, Switch, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ModalSerie from './ModalSerie';
import ModalColor from './ModalColor';
import ModalPrecioM2 from './ModalPrecioM2';
import ModalAccesoriosSerie from './ModalAccesoriosSerie';
import { ColorOption, PerfilesOption, PreciosVariosOption, SerieOption, useBD } from '../contexts/BDContext';
import { getPerfiles, updatePrecioVarios } from '@/app/utils/utilsDB';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

interface EditPrecioProps {
    precio: string;
    onPrecioChange: (precio: string) => void;
    mapAberturas?: Map<string, any>;
}

export default function EditPrecio({ precio, onPrecioChange, mapAberturas }: EditPrecioProps) {
    const [modal, setModal] = useState<{
        visible: boolean;
        tipo?: 'serie' | 'color' | 'preciosVarios' | 'accesorios';
        objeto?: SerieOption | ColorOption | PreciosVariosOption | SerieOption[];
        extradata?: { perfiles: PerfilesOption[] };
    }
    >({
        visible: false,
        tipo: undefined,
        objeto: undefined,
        extradata: undefined,
    });
    const [isEditing, setIsEditing] = useState(false);



    const [state, setState] = useState<{
        colors: ColorOption[],
        series: SerieOption[],
        preciosVarios: PreciosVariosOption[],
        perfiles: PerfilesOption[],
        cargado: boolean
    }>({
        colors: [],
        series: [],
        preciosVarios: [],
        perfiles: [],
        cargado: false,
    });

    const { colors, series, preciosVarios, perfiles } = state;
    useEffect(() => {
        const fetchData = async () => {
            try {
                const { getColorAluminio, getSeries, getPreciosVarios, updatePrecioVarios } = useBD();
                const [colors, series, preciosVarios, perfiles] = await Promise.all([
                    getColorAluminio(),
                    getSeries(),
                    getPreciosVarios(),
                    getPerfiles(),
                ]);
                setState((prevState) => ({
                    ...prevState,
                    colors, series, preciosVarios,
                    perfiles,
                    cargado: true,
                }));

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);



    const handleSaveM2Price = useCallback((nuevoPrecio: number) => {
        if (preciosM2) {
            updatePrecioVarios(preciosM2.id,);
        }
    }, [preciosM2]);

    const handleEditToggle = useCallback(() => {
        if (isEditing) {
            const precioNumerico = parseFloat(manoObra) || 0;
            updatePrecioVarios('1', precioNumerico);
        } else {
            // Al entrar en modo edición, sincroniza con los últimos datos
            const nuevoValor = preciosVarios.find(p => p.id === '1')?.precio.toString() || '0';
            setManoObra(nuevoValor);
        }
        setIsEditing(!isEditing);
    }, [isEditing, manoObra, preciosVarios, updatePrecioVarios]);

    const handleSave = useCallback(() => {
        const data = {
            preciosM2,
            manoObra: Number(manoObra)
        };
        onPrecioChange(JSON.stringify(data));
    }, [preciosM2, manoObra, onPrecioChange]);

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
                                title={serie.nombre}
                                onPress={() => {
                                    setModal({ visible: true, tipo: 'serie', objeto: serie, extradata: { perfiles: perfiles.filter(p => p.serie_id === serie.id) } });
                                }}
                                style={styles.item}
                                titleStyle={styles.itemTitle}
                            />
                        ))}
                    </List.Accordion>
                    <Button
                        style={styles.accordion}
                        onPress={() => {
                            setModal({ visible: true, tipo: 'color', extradata: undefined });
                        }}
                    >Colores </Button>
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
                        {preciosVarios.map((varios) => (
                            <List.Item
                                key={varios.id}
                                title={varios.nombre}
                                onPress={() => {
                                    setModal(
                                        { visible: true, tipo: 'preciosVarios', objeto: varios, extradata: undefined }
                                    )
                                }}
                                style={styles.item}
                                titleStyle={styles.itemTitle}
                            />
                        ))}
                        <List.Item
                            key="accesorios"
                            title="Accesorios"
                            onPress={() => setModal({ visible: true, tipo: 'accesorios', objeto: series, extradata: undefined })}
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
                                value={preciosVarios.find(p => p.nombre === 'Mano de Obra')?.precio.toString() || ''}
                                onChangeText={(text) => {
                                    if (/^\d*\.?\d*$/.test(text) || text === '')
                                        setManoObra(text);
                                }}
                                style={[
                                    styles.input,
                                    !isEditing && styles.inputDisabled
                                ]}
                                contentStyle={styles.inputContent}
                                right={<TextInput.Affix text="US$" />}
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
                        serie={modal.objeto as SerieOption}
                        perfiles={modal.extradata?.perfiles as PerfilesOption[]}
                    />
                    <ModalColor
                        visible={modal.tipo === 'color'}
                        hideModal={() => setModal((prevModal) => ({ ...prevModal, visible: false }))}
                        color={colors}
                    />

                    <ModalPrecioM2
                        visible={modal.tipo === 'preciosVarios'}
                        hideModal={() => setModal((prevModal) => ({ ...prevModal, visible: false }))}
                        vario={modal.objeto as PreciosVariosOption}
                        onSave={handleSaveM2Price}
                    />

                    <ModalAccesoriosSerie
                        visible={modal.tipo === 'accesorios'}
                        hideModal={() => setModal((prevModal) => ({ ...prevModal, visible: false }))}
                        series={modal.objeto as SerieOption[]}
                    />
                </>
                )
            }

            {mapAberturas && mapAberturas.size > 0 && (
                <View style={styles.saveButtonContainer}>
                    <Button
                        mode="contained"
                        onPress={handleSave}
                        style={styles.submitButton}
                        labelStyle={styles.submitButtonLabel}
                    >
                        Guardar Cambios
                    </Button>
                </View>
            )}
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
});