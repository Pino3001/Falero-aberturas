import { AberturaPresupuestoOption, ColorOption, PresupuestosOption, PresupuestosOptionDefault } from '@/utils/constants/interfases';
import { GenerarPDF } from '@/utils/_pdfGenerators/pdfGenerator';
import { cortinasEnum, CurrencyOption, CurrencyType, preciosVariosEnum } from '@/utils/constants/variablesGlobales';
import { useBD } from '@/utils/contexts/BDContext';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Divider, IconButton, List, Portal, Modal, Menu, Button, Chip, Text, SegmentedButtons, Dialog, FAB } from 'react-native-paper';
import { GenerarPdfComparado } from '@/utils/_pdfGenerators/pdfComparacion';
import { compararAberturaColores, kilosAluminio } from '@/utils/calculos';
import DialogComponent from '../componentes/DialogComponent';
import AgregarAbertura from './AgregarAbertura';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/utils/contexts/ThemeContext';
import ShowAbertura from '../componentes/ShowAbertura';
import { getPresupuestoByID } from '@/utils/_db/operacionesDB';

interface ModalMostrarPresupuestoProps {
  visible: boolean;
  onClose: () => void;
  animationType?: 'none' | 'slide' | 'fade';
  transparent?: boolean;
  initialPresupuesto: PresupuestosOption;
}

const ModalMostrarPresupuesto = ({ visible, onClose, initialPresupuesto }: ModalMostrarPresupuestoProps) => {
  const { colors } = useTheme();
  const [presupuesto, setLocalPresupuesto] = useState(initialPresupuesto || PresupuestosOptionDefault);
  const { stateBD, updateAberturaPresupuestoBDContext, dropAberturaBDContext, presupuestosUltimaAct } = useBD();
  const { series, acabado, perfiles, preciosVarios, cortinas } = stateBD;
  useEffect(() => { // Iniciar el presupuesto por primera vez
    if (initialPresupuesto) {
      setLocalPresupuesto(initialPresupuesto || PresupuestosOptionDefault);
    }
  }, [initialPresupuesto]);

  //Comportamiento extranio de mostrarse los presupuestos iniciales un momento antes de actualizarse y mostrarce corectamente todos los datos

  useEffect(() => { // Iniciar el presupuesto por primera vez
    const fetchPresupuesto = async () => {
      setLocalPresupuesto(await getPresupuestoByID(initialPresupuesto.id));
    };
    fetchPresupuesto();
  }, [presupuestosUltimaAct]);

  // Configuracion de tipo de moneda
  const CURRENCY_CONFIG: Record<CurrencyType, CurrencyOption> = {
    peso: {
      tipo: 'peso',
      multiplicador: preciosVarios.find(p => p.nombre === preciosVariosEnum.dolar)?.precio || 1,
      label: 'Pesos',
      affix: '$'
    },
    dolar: {
      tipo: 'dolar',
      multiplicador: 1,
      label: 'Dólares',
      affix: 'US$'
    }
  };

  const [visibleMenu, setVisibleMenu] = useState(false);
  const [listComparar, setListComparar] = useState<ColorOption[]>([]);
  const [selectedEdit, setSelectedEdit] = useState<AberturaPresupuestoOption>();
  const [dialog, setDialog] = useState(false);
  const [editAbertura, setEditAbertura] = useState(false);
  const [cambio, setCambio] = useState<CurrencyOption>(CURRENCY_CONFIG.dolar);
  const [showDialog, setShowDialog] = useState(false);
  const [showDialogErrorEliminar, setShowDialogErrorEliminar] = useState(false);
  const [aberturaToDelete, setAberturaToDelete] = useState<AberturaPresupuestoOption | null>(null);

  const openMenu = () => setVisibleMenu(true);

  const closeMenu = () => setVisibleMenu(false);

  const costoAluminio = (ventana: AberturaPresupuestoOption): number => {
    const pesoAluminio = kilosAluminio(ventana, series, perfiles);

    let costoAluminio = 0;
    let precioColor = acabado.find(c => c.id === ventana.id_color_aluminio)?.precio || 0;
    if (precioColor != undefined) {
      costoAluminio = pesoAluminio * precioColor;
    }
    return costoAluminio;
  }

  const costoManoDeObra = (ventana: AberturaPresupuestoOption): number => {
    const manoAux = preciosVarios.find(v => v.nombre === preciosVariosEnum.manoDeObra)?.precio || 0;
    if (manoAux && manoAux > 0) {
      return (((ventana?.precio_unitario || 0) * manoAux) / (100 + manoAux)) * (ventana?.cantidad || 0);
    }
    return 0;
  }

  const comparar = async () => {
    if (listComparar.length > 0) {
      const listaPresu = await compararAberturaColores(presupuesto, listComparar);
      GenerarPdfComparado({ presupuesto: listaPresu, cortinas, acabado: acabado, series, currency: cambio });
    } else {
      setDialog(true);
    }

  }

  const hayMosquitero = (abertura: AberturaPresupuestoOption): number | null => {
    if (abertura.mosquitero) {
      const areaMosquitero = ((abertura?.ancho || 0) * (abertura?.alto || 0)) / 10000;
      const costoM2Mosquitero = preciosVarios.find(v => v.nombre === preciosVariosEnum.vidrio)?.precio || 0;
      if (costoM2Mosquitero === undefined) return null;
      return areaMosquitero * costoM2Mosquitero;
    } else {
      return null;
    }
  }

  const hayVidrio = (abertura: AberturaPresupuestoOption): number | null => {
    if (abertura.vidrio) {
      const areaVidrio = ((abertura?.ancho || 0) * (abertura?.alto || 0)) / 10000;
      const costoM2Vidrio = preciosVarios.find(v => v.nombre === preciosVariosEnum.vidrio)?.precio || 0;
      if (costoM2Vidrio === undefined) return null;
      return areaVidrio * costoM2Vidrio;
    } else {
      return null;
    }
  }
  const handleActualizarAberturaCompleta = async (ventanaEditada: AberturaPresupuestoOption) => {
    try {

      // Calcular nuevo estado del presupuesto
      const nuevasVentanas = presupuesto.ventanas.map(v =>
        v.id === ventanaEditada.id ? ventanaEditada : v
      );

      const nuevoPrecioTotal = nuevasVentanas.reduce(
        (sum, ventana) => sum + (ventana.precio_unitario * ventana.cantidad),
        0
      );

      const presupuestoActualizado = {
        ...presupuesto,
        ventanas: nuevasVentanas,
        precio_total: parseFloat(nuevoPrecioTotal.toFixed(2))
      };

      await updateAberturaPresupuestoBDContext(presupuestoActualizado, ventanaEditada);

      setEditAbertura(false);
      setSelectedEdit(undefined);

      return presupuestoActualizado;

    } catch (error) {
      console.error('Error al actualizar abertura:', error);
      setLocalPresupuesto(presupuesto);
      throw error;
    }
  };

  const formatCurrency = (value: number) => {
    const rounded = Math.round(value * 10) / 10;
    if (cambio.tipo === 'peso') {
      return `${(rounded * cambio.multiplicador).toFixed(0)} ${cambio.affix}`;
    }
    return `${(rounded * cambio.multiplicador).toFixed(1)} ${cambio.affix}`;
  };

  // Receteo estados antes de cerrar
  const closeModal = () => {
    setCambio(CURRENCY_CONFIG.dolar);
    setListComparar([]);
    onClose();
  }

  const handleDeleteAbertura = (abertura: AberturaPresupuestoOption) => {
    setAberturaToDelete(abertura);
    setShowDialog(true);
  };

  const confirmDelete = async () => {
    if (aberturaToDelete) {
      if (presupuesto.ventanas.length > 1) {
        await dropAberturaBDContext(presupuesto, aberturaToDelete);
        setShowDialog(false);
        setAberturaToDelete(null);
      } else {
        setShowDialogErrorEliminar(true);
        setShowDialog(false);
        setAberturaToDelete(null);
      }
    }
  };


  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={closeModal}
        contentContainerStyle={[styles.containerStyle, { backgroundColor: colors.background }]}
        style={{ backgroundColor: colors.backdrop }}
      >
        <View style={[styles.content]} >

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignContent: 'center', alignItems: 'center' }}>
            <View style={{ width: '10%' }} />
            <Text variant='titleMedium' style={{ textAlign: 'center' }}>Presupuesto</Text>
            <IconButton
              style={{ margin: 0, width: '10%' }}
              icon="close"
              size={24}
              onPress={closeModal}
            />
          </View>

          <View style={styles.listContainer}>
            <View style={{ flexDirection: 'row', gap: 15, justifyContent: 'space-between', width: '95%' }}>
              <Text variant='labelLarge' style={{ fontSize: 14, marginLeft: 10 }}>Cliente: {presupuesto?.nombre_cliente || ''}</Text>
              <Text variant='labelLarge' style={{ fontSize: 14 }}>Fecha: {presupuesto.fecha?.toLocaleDateString('es-ES')}</Text>
            </View>
            <Divider style={{ borderBlockColor: colors.onBackground, borderWidth: 0.5, margin: 5 }}></Divider>
            <View style={{ flexDirection: 'row', gap: 5, justifyContent: 'flex-end', margin: 5, width: '50%', alignContent: 'center', alignItems: 'center' }}>


            </View>

            <FlatList
              data={presupuesto.ventanas}
              key={`ventanas_${presupuesto.ventanas.length}_${cambio.tipo}`}
              extraData={[presupuesto.ventanas, cambio]}
              style={{ width: "100%" }}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <ShowAbertura
                  abertura={item}
                  serie={series?.find(s => s.id === item.id_serie)}
                  acabado={acabado?.find(a => a.id === item.id_color_aluminio)}
                  peso_alum={kilosAluminio(item, series, perfiles)}
                  costo_alum={costoAluminio(item)}
                  vidrio={hayVidrio(item)}
                  mosquitero={hayMosquitero(item)}
                  cortina={
                    (() => {
                      const c = cortinas?.find(c => c.id === item.id_cortina);
                      return c && c.tipo !== cortinasEnum.ninguna ? c : null;
                    })()
                  }
                  manoObra={costoManoDeObra(item)}
                  currency={cambio}
                  onLongPress={() => {
                    setEditAbertura(true)
                    setSelectedEdit(item)
                  }}
                  onDelete={handleDeleteAbertura}
                  isDeleting={showDialog}
                />
              )}
              ListEmptyComponent={<List.Item title="No hay aberturas" style={{ marginTop: 5 }} titleStyle={{ color: colors.onBackground, fontSize: 13 }} />}
              initialNumToRender={5}
              maxToRenderPerBatch={5}
              windowSize={10}
            />
            <Divider style={{ margin: 3 }}></Divider>
            <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'space-between', paddingHorizontal: 35, marginVertical: 10, marginBottom: 'auto' }}>
              <Text variant='titleMedium' style={{ textAlign: 'center', fontSize: 16 }}>Total</Text>
              <Text style={{ textAlign: 'center', fontSize: 16, color: colors.error }}>{formatCurrency(presupuesto?.precio_total || 0)}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              {/* Compartir el presupuesto comparandolo con los colores de aluminio */}
              <Menu
                visible={visibleMenu}
                onDismiss={closeMenu}
                anchor={
                  <IconButton
                    icon="compare-horizontal"
                    onPress={openMenu}
                    size={26}
                    style={{
                      borderColor: colors.primary,
                      borderWidth: 1,
                      elevation: 3,
                      width: 52,
                      height: 30,
                      margin: 10
                    }}
                    iconColor={colors.primary}
                  />
                }>
                <Text variant='headlineMedium' style={{ textAlign: 'center' }}>Comparar presupuesto</Text>
                {acabado?.map(item => {
                  const isSelected = listComparar.some(e => e.id === item.id);
                  return (
                    <Menu.Item
                      key={item.id}
                      onPress={() => {
                        setListComparar(prev =>
                          isSelected
                            ? prev.filter(e => e.id !== item.id)
                            : [...prev, item]
                        );
                      }}
                      title={
                        <Chip
                          mode="outlined"
                          icon={isSelected ?
                            () => <MaterialCommunityIcons name="check" color={colors.onPrimary} size={20} /> :
                            () => <MaterialCommunityIcons name="close" color={colors.primary} size={20} />
                          }
                          style={{
                            backgroundColor: isSelected
                              ? colors.primary
                              : colors.primaryContainer,
                          }}
                          textStyle={{ color: isSelected ? colors.onPrimary : colors.onPrimaryContainer, }}
                        >
                          {item.color}
                        </Chip>
                      }
                    />
                  );
                })}
                <Button
                  onPress={() => {
                    closeMenu()
                    comparar()
                  }}
                  style={{ backgroundColor: colors.secondary, marginHorizontal: 10, borderRadius: 4 }}
                  textColor={colors.onPrimary}
                >Comparar</Button>
              </Menu>
            </View>

            <View>
              <SegmentedButtons
                value={cambio.tipo}
                onValueChange={(tipo) => {
                  if (tipo === CURRENCY_CONFIG.dolar.tipo) {
                    setCambio(CURRENCY_CONFIG.dolar);
                  } else if (tipo === CURRENCY_CONFIG.peso.tipo) {
                    setCambio(CURRENCY_CONFIG.peso);
                  }
                }}
                density="small"
                buttons={[
                  {
                    value: CURRENCY_CONFIG.dolar.tipo,
                    label: 'Dólares',
                    labelStyle: {
                      fontSize: 12,
                      textAlign: 'center',
                      width: '100%',
                      marginVertical: 0,
                      lineHeight: 14
                    },
                    style: {
                      minWidth: 80,
                      height: 30,
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingHorizontal: 0,
                    }
                  },
                  {
                    value: CURRENCY_CONFIG.peso.tipo,
                    label: 'Pesos',
                    labelStyle: {
                      fontSize: 12,
                      textAlign: 'center',
                      width: '100%',
                      marginVertical: 0,
                      lineHeight: 14

                    },
                    style: {
                      minWidth: 80,
                      height: 30,
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingHorizontal: 0,
                    },
                  },
                ]}
                style={{
                  height: 32,
                  padding: 0,
                  alignSelf: 'center',
                }}
                theme={{
                  colors: {
                    secondaryContainer: colors.primaryContainer,
                    onSecondaryContainer: colors.onPrimaryContainer
                  }
                }}
              />
            </View>

            <View>
              {/* Compartir el presupuesto en dolares o pesos */}
              <IconButton
                icon="share"
                onPress={() => {
                  try {
                    GenerarPDF({ presupuesto, colors: acabado, cortinas, series, currency: cambio });
                  } catch (error) {
                    console.error("Error al generar PDF:", error);
                    // Mostrar feedback al usuario
                  }
                }}
                size={26}
                style={{
                  borderColor: colors.primary,
                  borderWidth: 1,
                  elevation: 3,
                  width: 52,
                  height: 30,
                  margin: 10
                }}
                iconColor={colors.primary}
              />
            </View>
          </View>

        </View>
        {editAbertura ?
          <AgregarAbertura
            ventanaAEditar={selectedEdit}
            handleDone={(ventanaEditada) => {
              handleActualizarAberturaCompleta(ventanaEditada)
            }}
            handleClose={() => {
              setEditAbertura(false)
              setSelectedEdit(undefined)
            }}
            visible={true}
            hideModal={() => {
              setEditAbertura(false)
              setSelectedEdit(undefined)}}
            acabadoProps={acabado}
            seriesProps={series}
            cortinasProps={cortinas}
          />
          : null}
        {dialog ?
          <DialogComponent
            Title='Cuidado!'
            Content_text='Debes seleccionar al menos un color!'
            onCancel={() => setDialog(false)}
            onConfirm={() => setDialog(false)}
          /> : null}

      </Modal>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
        <Dialog.Title>Eliminar</Dialog.Title>
        <Dialog.Content>
          <Text>{`¿Estás seguro de eliminar esta ${aberturaToDelete?.tipo_abertura || ''}?`}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowDialog(false)}>Cancelar</Button>
          <Button onPress={confirmDelete}>Eliminar</Button>
        </Dialog.Actions>
      </Dialog>

      {/* Diálogo de advertencia solo una abertura */}
      <Dialog visible={showDialogErrorEliminar} onDismiss={() => setShowDialogErrorEliminar(false)} >
        <Dialog.Icon icon="alert" color={colors.error} />
        <Dialog.Title style={{ textAlign: 'center', fontSize: 16 }}>No puedes eliminar la unica abertura del presupuesto!!!</Dialog.Title>
      </Dialog>

    </Portal >
  );
};

export default ModalMostrarPresupuesto;

const styles = StyleSheet.create({
  containerStyle: {
    borderRadius: 8,
    alignSelf: 'center',
    width: '95%',
    height: '90%',
  },
  content: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    borderRadius: 10,

  },
  listContainer: {
    width: '100%',
    flex: 1,
  },
});