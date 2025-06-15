import { AberturaPresupuestoOption, ColorOption, PerfilesOption, PerfilesOptionDefault, PresupuestosOption, PresupuestosOptionDefault } from '@/utils/constants/interfases';
import { GenerarPDF } from '@/utils/_pdfGenerators/pdfGenerator';
import { PerfilesEnum, preciosVariosEnum, seriesEnum } from '@/utils/constants/variablesGlobales';
import { useBD } from '@/utils/contexts/BDContext';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { View, FlatList } from 'react-native';
import { Divider, Icon, IconButton, List, Portal, Modal, Menu, Button, Chip, Text } from 'react-native-paper';
import { GenerarPdfComparado } from '@/utils/_pdfGenerators/pdfComparacion';
import { compararAberturaColores } from '@/utils/calculos';
import DialogComponent from '../DialogComponent';
import AgregarAbertura from './AgregarAbertura';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/utils/contexts/ThemeContext';

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
  useEffect(() => {
    if (initialPresupuesto) {
      setLocalPresupuesto(initialPresupuesto);
    }
  }, [initialPresupuesto]);
  const { stateBD, updatePresupuestoBDContext } = useBD();
  const { series, acabado, perfiles, preciosVarios, cortinas } = stateBD;
  const [visibleMenu, setVisibleMenu] = React.useState(false);
  const [listComparar, setListComparar] = useState<ColorOption[]>([]);
  const [selectedEdit, setSelectedEdit] = useState<AberturaPresupuestoOption>();
  const [dialog, setDialog] = useState(false);
  const [dialogEdit, setDialogEdit] = useState(false);
  const [editAbertura, setEditAbertura] = useState(false);

  const openMenu = () => setVisibleMenu(true);

  const closeMenu = () => setVisibleMenu(false);

  const gramosAluminio = (ventana: AberturaPresupuestoOption): number => {
    const serie = series.find(x => x.id == ventana.id_serie);
    if (serie) {
      if (serie.nombre === seriesEnum.serie20) {
        const gramosAlumnio = (buscarPerfil(ventana, PerfilesEnum.MarcoSuperior).gramos_por_m * ventana.ancho +
          buscarPerfil(ventana, PerfilesEnum.MarcoInferior).gramos_por_m * ventana.ancho +
          buscarPerfil(ventana, PerfilesEnum.MarcoLateral).gramos_por_m * 2 * ventana.alto);
        return gramosAlumnio / 100000;
      }
      else if (serie.nombre == seriesEnum.serie25_2h) {
        const gramosAlumnio = (buscarPerfil(ventana, PerfilesEnum.MarcoSuperior).gramos_por_m * ventana.ancho +
          buscarPerfil(ventana, PerfilesEnum.MarcoInferior).gramos_por_m * ventana.ancho +
          buscarPerfil(ventana, PerfilesEnum.MarcoLateral).gramos_por_m * 2 * ventana.alto +
          buscarPerfil(ventana, PerfilesEnum.HojaInferior).gramos_por_m * ventana.ancho +
          buscarPerfil(ventana, PerfilesEnum.HojaSuperior).gramos_por_m * ventana.ancho +
          buscarPerfil(ventana, PerfilesEnum.HojaEngancheCentral).gramos_por_m * 2 * ventana.alto +
          buscarPerfil(ventana, PerfilesEnum.HojaLateral).gramos_por_m * 2 * ventana.alto);
        return gramosAlumnio / 100000;
      }
      else if (serie.nombre == seriesEnum.serie25_3h) {
        const gramosAlumnio = (buscarPerfil(ventana, PerfilesEnum.MarcoSuperior).gramos_por_m * ventana.ancho +
          buscarPerfil(ventana, PerfilesEnum.MarcoInferior).gramos_por_m * ventana.ancho +
          buscarPerfil(ventana, PerfilesEnum.MarcoLateral).gramos_por_m * 2 * ventana.alto +
          buscarPerfil(ventana, PerfilesEnum.HojaInferior).gramos_por_m * ventana.ancho +
          buscarPerfil(ventana, PerfilesEnum.HojaSuperior).gramos_por_m * ventana.ancho +
          buscarPerfil(ventana, PerfilesEnum.HojaEngancheCentral).gramos_por_m * 4 * ventana.alto +
          buscarPerfil(ventana, PerfilesEnum.HojaLateral).gramos_por_m * 2 * ventana.alto);
        return gramosAlumnio / 100000;
      }
    }
    return -1;
  }

  const buscarPerfil = (ventana: AberturaPresupuestoOption, perfil_nombre: string): PerfilesOption => {
    let perfilAux = perfiles.find(p => p.serie_id === ventana.id_serie && p.nombre === perfil_nombre);
    if (perfilAux)
      return perfilAux;
    else {
      const serie = series.find(x => x.id == ventana.id_serie);
      if (serie && serie.serie_id_hereda) {
        perfilAux = perfiles.find(p => p.serie_id === serie.serie_id_hereda && p.nombre === perfil_nombre)
        if (perfilAux)
          return perfilAux;
      }
    }
    return PerfilesOptionDefault;
  }

  const costoVidrio = (ventana: AberturaPresupuestoOption): number => {
    const areaVidrio = ((ventana?.ancho || 0) * (ventana?.alto || 0)) / 10000;
    const costoM2Vidrio = preciosVarios.find(v => v.nombre === preciosVariosEnum.vidrio)?.precio || 0;
    if (costoM2Vidrio === undefined) return 0;
    return areaVidrio * costoM2Vidrio;
  }

  const costoMosquitero = (ventana: AberturaPresupuestoOption): number => {
    const areaMosquitero = ((ventana?.ancho || 0) * (ventana?.alto || 0)) / 10000;
    const costoM2Mosquitero = preciosVarios.find(v => v.nombre === preciosVariosEnum.vidrio)?.precio || 0;
    if (costoM2Mosquitero === undefined) return 0;
    return areaMosquitero * costoM2Mosquitero;
  }

  const costoCortina = (ventana: AberturaPresupuestoOption): number => {
    const areaCortina = ((ventana?.ancho || 0) * (ventana?.alto || 0)) / 10000;
    const precioM2Cortina = cortinas.find(c => c.id === ventana.id_cortina)?.preciom2 || 0;
    if (precioM2Cortina === null || precioM2Cortina === undefined) return 0;
    return areaCortina * precioM2Cortina;
  }

  const costoAluminio = (ventana: AberturaPresupuestoOption): number => {
    const pesoAluminio = gramosAluminio(ventana);

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
      GenerarPdfComparado({ presupuesto: listaPresu, cortinas, colors: acabado });
    } else {
      setDialog(true);
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

      await updatePresupuestoBDContext(presupuestoActualizado, ventanaEditada);

      setLocalPresupuesto(presupuestoActualizado);
      setEditAbertura(false);
      setDialogEdit(false);
      setSelectedEdit(undefined);

      return presupuestoActualizado;

    } catch (error) {
      console.error('Error al actualizar abertura:', error);
      throw error;
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={[styles.containerStyle, { backgroundColor: colors.background }]}
        style={{ backgroundColor: colors.backdrop }}
      >
        <View style={[styles.content]} >
          <View style={{ alignItems: 'flex-end' }}>
            <IconButton
              style={{ margin: 0 }}
              icon="close"
              size={24}
              onPress={onClose}
            />
          </View>
          <View style={styles.listContainer}>
            <View style={{ flexDirection: 'row', gap: 15, justifyContent: 'space-between', width: '95%' }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', marginLeft: 10 }}>Cliente: {presupuesto?.nombre_cliente || ''}</Text>
              <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Fecha: {presupuesto.fecha?.toLocaleDateString()}</Text>
            </View>
            <Divider style={{ borderBlockColor: colors.onBackground, borderWidth: 0.5, margin: 5 }}></Divider>
            <View style={{ marginHorizontal: 20, margin: 5 }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Lista de aberturas:</Text>
            </View>
            <FlatList
              data={presupuesto.ventanas}
              style={{ width: "100%", marginHorizontal: 10 }}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <List.Section
                  style={{ width: "95%" }}>
                  <List.Accordion
                    onLongPress={() => {
                      setDialogEdit(true)
                      setSelectedEdit(item)
                    }}
                    delayLongPress={500}
                    title={
                      <View style={{
                        flexDirection: 'row', justifyContent: "space-between", width: "98%"
                      }}>
                        <View style={{
                          flexDirection: 'row'
                        }}>
                          <Text style={{ fontSize: 13, fontWeight: 'bold' }}>{item?.cantidad || ""} {item.tipo_abertura} </Text>
                          <Text style={{ fontSize: 13, fontWeight: 'bold' }}>{item?.ancho || 0}</Text>
                          <Text style={{ fontSize: 13, fontWeight: 'bold' }}>×</Text>
                          <Text style={{ fontSize: 13, fontWeight: 'bold' }}>{item?.alto || 0}</Text>
                        </View>
                        <View style={{ right: 0 }}>
                          <Text style={{ fontSize: 13, color: colors.error }}>{((item?.precio_unitario || 0) * (item?.cantidad || 0)).toFixed(1)} U$S</Text>
                        </View>
                      </View>
                    }
                    style={{ backgroundColor: colors.background, width: "100%" }}
                    right={() => null}
                    left={() => <Icon source="star" size={15} color={colors.secondary} />}
                  >
                    <Divider />
                    <View style={{ paddingLeft: 0, marginTop: 10, marginBottom: 10 }}>
                      <View style={{ paddingHorizontal: 20 }}>
                        <View style={{ alignContent: 'center' }}>
                          <Text style={{ fontSize: 14, textAlign: 'center' }}>Datos abertura</Text>
                        </View>
                        <View style={{ flexDirection: 'column', gap: 4, justifyContent: 'space-between' }}>
                          <Text style={{ fontSize: 12 }}>{series.find(c => c.id === item.id_serie)?.nombre || ''}</Text>
                          <Text style={{ fontSize: 12 }}>{`Acabado: "${acabado.find(c => c.id === item.id_color_aluminio)?.color || ''}"`}</Text>
                          <Text style={{ fontSize: 12 }}>{`Cant Aluminio: ${gramosAluminio(item)?.toFixed(2) || 0} kg`}</Text>
                        </View>
                      </View>
                      <Divider style={{ margin: 3 }}></Divider>

                      <View style={{ paddingHorizontal: 25 }}>
                        <Text style={{ textAlign: 'center', fontSize: 14 }}>Costos</Text>

                        <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'space-between' }}>
                          <Text style={{ textAlign: 'center', fontSize: 12 }}>Aluminio:</Text>
                          <Text style={{ textAlign: 'center', fontSize: 12, color: colors.error }}>{`${costoAluminio(item)?.toFixed(1) || 0} US$`}</Text>
                        </View>

                        {item.vidrio ?
                          <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'space-between' }}>
                            <Text style={{ textAlign: 'center', fontSize: 12 }}>Vidrio:</Text>
                            <Text style={{ textAlign: 'center', fontSize: 12, color: colors.error }}>{`${costoVidrio(item)?.toFixed(1) || 0} US$`}</Text>
                          </View>
                          : null
                        }

                        {item.mosquitero ?
                          <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'space-between' }}>
                            <Text style={{ textAlign: 'center', fontSize: 12 }}>Mosquitero:</Text>
                            <Text style={{ textAlign: 'center', fontSize: 12, color: colors.error }}>{`${costoMosquitero(item)?.toFixed(1) || 0} US$`}</Text>
                          </View>
                          : null
                        }

                        {item.id_cortina && item.id_cortina > 1 ?
                          <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'space-between' }}>
                            <Text style={{ textAlign: 'center', fontSize: 12 }}>{cortinas.find(c => c.id === item.id_cortina)?.tipo || 'No especificado'}</Text>
                            <Text style={{ textAlign: 'center', fontSize: 12, color: colors.error }}>{`${costoCortina(item)?.toFixed(1) || 0} US$`}</Text>
                          </View>
                          : null
                        }

                        <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'space-between' }}>
                          <Text style={{ textAlign: 'center', fontSize: 12 }}>{`Accesorios`}</Text>
                          <Text style={{ textAlign: 'center', fontSize: 12, color: colors.error }}>{`${series.find(s => s.id == item.id_serie)?.precio_accesorios || 0} US$`}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'space-between' }}>
                          <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: 'bold' }}>Mano De Obra</Text>
                          <Text style={{ textAlign: 'center', fontSize: 14, color: colors.error }}>{`${costoManoDeObra(item)?.toFixed(1) || 0} US$`}</Text>
                        </View>
                        <Divider style={{ margin: 3 }}></Divider>
                        <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'space-between' }}>
                          <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: 'bold' }}>Subtotal</Text>
                          <Text style={{ textAlign: 'center', fontSize: 14, color: colors.error }}>{`${Math.round(((item?.precio_unitario || 0) * (item?.cantidad || 0)) * 10) / 10} US$`}</Text>
                        </View>
                      </View>
                    </View>
                    <Divider />

                  </List.Accordion>
                </List.Section>
              )}
              ListEmptyComponent={<List.Item title="No hay aberturas" titleStyle={{ color: colors.onBackground, fontSize: 13 }} />}
              initialNumToRender={5}
              maxToRenderPerBatch={5}
              windowSize={10}
            />
            <Divider style={{ margin: 3 }}></Divider>
            <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'space-between', paddingHorizontal: 35, marginVertical: 10, marginBottom: 'auto' }}>
              <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: 'bold' }}>Total</Text>
              <Text style={{ textAlign: 'center', fontSize: 16, color: colors.error }}>{presupuesto.precio_total?.toFixed(1) || 0} U$S</Text>
            </View>
            <View style={{ justifyContent: 'center', paddingHorizontal: 25, marginVertical: 10 }}>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 50, justifyContent: 'space-between' }}>

            <Menu
              visible={visibleMenu}
              onDismiss={closeMenu}
              anchor={
                <IconButton
                  icon="compare-horizontal"
                  size={44}
                  iconColor={colors.primary}
                  onPress={() => { openMenu(); }}
                />
              }>
              <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>Comparar presupuesto</Text>
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
                style={{ backgroundColor: colors.primary, marginHorizontal: 10, borderRadius: 4 }}
                textColor={colors.onPrimary}
              >Comparar</Button>
            </Menu>
            <IconButton
              icon="share"
              size={40}
              iconColor={colors.primary}
              onPress={() => { GenerarPDF({ presupuesto, colors: acabado, cortinas }); }}
            />
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
              console.log('quedo con esto', selectedEdit)
            }}
            visible={true}
            hideModal={() => setSelectedEdit(undefined)}
          />
          : null}
        {dialog ?
          <DialogComponent
            Title='Cuidado!'
            Content_text='Debes seleccionar al menos un color!'
            onCancel={() => setDialog(false)}
            onConfirm={() => setDialog(false)}
          /> : null}
        {dialogEdit ?
          <DialogComponent
            Title='Editar abertura'
            Content_text={`Deseas editar ${selectedEdit?.tipo_abertura} ${selectedEdit?.alto} x ${selectedEdit?.ancho}`}
            onCancel={() => { setDialogEdit(false) }}
            onConfirm={() => {
              setEditAbertura(true)
              setDialogEdit(false)
            }}
          /> : null}
      </Modal>
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