import { AberturaPresupuestoOption, PerfilesOption, PerfilesOptionDefault, PresupuestosOption } from '@/app/utils/interfases';
import GenerarPDF from '@/app/utils/pdfGenerator';
import { PerfilesEnum, preciosVariosEnum, seriesEnum } from '@/constants/variablesGlobales';
import { useBD } from '@/contexts/BDContext';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { View, TouchableWithoutFeedback, StyleProp, FlatList, Text } from 'react-native';
import { Button, Card, DataTable, Divider, Icon, IconButton, List, Portal, useTheme, Modal } from 'react-native-paper';
import { Item } from 'react-native-paper/lib/typescript/components/Drawer/Drawer';

interface ModalMostrarPresupuestoProps {
  visible: boolean;
  onClose: () => void;
  animationType?: 'none' | 'slide' | 'fade';
  transparent?: boolean;
  presupuesto: PresupuestosOption;
}

const ModalMostrarPresupuesto = ({ visible, onClose, animationType, transparent, presupuesto }: ModalMostrarPresupuestoProps) => {
  const { stateBD } = useBD();
  const { series, colors, perfiles, preciosVarios, cortinas } = stateBD;
  const [pdf, setPdf] = useState(false);

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
    let precioColor = colors.find(c => c.id === ventana.id_color_aluminio)?.precio || 0;
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
  const theme = useTheme();
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.containerStyle}
        style={styles.overlay}
      >
        <View style={[styles.content]} >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 18, margin: 10 }} >Presupuesto</Text>
            <IconButton
              style={{ margin: 5 }}
              icon="close"
              iconColor="black"
              size={24}
              onPress={onClose}
            />
          </View>
          <View style={styles.listContainer}>
            <View style={{ flexDirection: 'row', gap: 15, justifyContent: 'space-between' }}>
              <Text style={{ color: 'black', fontSize: 14, fontWeight: 'bold' }}>Cliente: {presupuesto?.nombre_cliente || ''}</Text>
              <Text style={{ color: 'black', fontSize: 14, fontWeight: 'bold' }}>Fecha: {presupuesto.fecha?.toLocaleDateString()}</Text>
            </View>
            <Divider style={{ borderBlockColor: '#6200ee', borderWidth: 0.5, margin: 5 }}></Divider>
            <View style={{ marginHorizontal: 10, margin: 5 }}>
              <Text style={{ color: 'black', fontSize: 14, fontWeight: 'bold' }}>Lista de aberturas:</Text>
            </View>
            <FlatList
              data={presupuesto.ventanas}
              style={{ width: "100%" }}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <List.Section style={{ width: '100%', marginVertical: 6 }}>
                  <List.Accordion
                    title={
                      <View style={{
                        flexDirection: 'row',
                      }}>
                        <Text style={{ fontSize: 15, color: 'black', fontWeight: 'bold' }}>{item?.cantidad || ""} Ventana </Text>
                        <Text style={{ fontSize: 15, color: 'black', fontWeight: 'bold' }}>{item?.ancho || 0}</Text>
                        <Text style={{ fontSize: 6 }}> cm</Text>
                        <Text style={{ fontSize: 15, color: 'black', fontWeight: 'bold' }}>` × </Text>
                        <Text style={{ fontSize: 15, color: 'black', fontWeight: 'bold' }}>{item?.alto || 0}</Text>
                        <Text style={{ fontSize: 6 }}>cm </Text>
                        <Text style={{ fontSize: 15, color: 'red' }}>{((item?.precio_unitario || 0) *( item?.cantidad || 0)).toFixed(1)} U$S</Text>
                      </View>
                    }
                    style={{ backgroundColor: 'white' }}
                    right={() => null}
                    left={() => <Icon source="star" size={15} color="#6200ee" />}
                  >
                    <View style={{ paddingLeft: 0 }}>
                      <View style={{ paddingHorizontal: 20 }}>
                        <View style={{ alignContent: 'center' }}>
                          <Text style={{ textAlign: 'center', fontSize: 12 }}>{series.find(c => c.id === item.id_serie)?.nombre || ''}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 4, justifyContent: 'space-between' }}>
                          <Text style={{ fontSize: 12 }}>{`Aluminio "${colors.find(c => c.id === item.id_color_aluminio)?.color || ''}"`}</Text>
                          <Text style={{ fontSize: 12 }}>{`Cant: ${gramosAluminio(item)?.toFixed(2) || 0} kg`}</Text>
                        </View>
                      </View>
                      <Divider style={{ margin: 3 }}></Divider>

                      <View style={{ paddingHorizontal: 25 }}>
                        <Text style={{ textAlign: 'center', fontSize: 14 }}>Costos</Text>

                        <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'space-between' }}>
                          <Text style={{ textAlign: 'center', fontSize: 12 }}>Aluminio:</Text>
                          <Text style={{ textAlign: 'center', fontSize: 12, color: 'red' }}>{`${costoAluminio(item)?.toFixed(1) || 0} US$`}</Text>
                        </View>

                        {item.vidrio ? 
                          <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'space-between' }}>
                            <Text style={{ textAlign: 'center', fontSize: 12 }}>Vidrio:</Text>
                            <Text style={{ textAlign: 'center', fontSize: 12, color: 'red' }}>{`${costoVidrio(item)?.toFixed(1) || 0} US$`}</Text>
                          </View>
                          : null
                        }

                        {item.mosquitero ?
                          <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'space-between' }}>
                            <Text style={{ textAlign: 'center', fontSize: 12 }}>Mosquitero:</Text>
                            <Text style={{ textAlign: 'center', fontSize: 12, color: 'red' }}>{`${costoMosquitero(item)?.toFixed(1) || 0} US$`}</Text>
                          </View>
                          : null
                        }

                        {item.id_cortina && item.id_cortina > 1 ?
                          <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'space-between' }}>
                            <Text style={{ textAlign: 'center', fontSize: 12 }}>{cortinas.find(c => c.id === item.id_cortina)?.tipo || 'No especificado'}</Text>
                            <Text style={{ textAlign: 'center', fontSize: 12, color: 'red' }}>{`${costoCortina(item)?.toFixed(1) || 0} US$`}</Text>
                          </View>
                          : null
                        }

                        <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'space-between' }}>
                          <Text style={{ textAlign: 'center', fontSize: 12 }}>{`Accesorios`}</Text>
                          <Text style={{ textAlign: 'center', fontSize: 12, color: 'red' }}>{`${series.find(s => s.id == item.id_serie)?.precio_accesorios || 0} US$`}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'space-between' }}>
                          <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: 'bold' }}>Mano De Obra</Text>
                          <Text style={{ textAlign: 'center', fontSize: 14, color: 'red' }}>{`${costoManoDeObra(item)?.toFixed(1) || 0} US$`}</Text>
                        </View>
                        <Divider style={{ margin: 3 }}></Divider>
                        <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'space-between' }}>
                          <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: 'bold' }}>Sub Total</Text>
                          <Text style={{ textAlign: 'center', fontSize: 14, color: 'red' }}>{`${Math.round(((item?.precio_unitario || 0) *( item?.cantidad || 0)) * 10) / 10} US$`}</Text>
                        </View>
                      </View>
                    </View>
                  </List.Accordion>
                </List.Section>
              )}
              ListEmptyComponent={<List.Item title="No hay aberturas" titleStyle={{ color: 'black', fontSize: 13 }} />}
              initialNumToRender={5}
              maxToRenderPerBatch={5}
              windowSize={10}
            />
            <Divider style={{ margin: 3 }}></Divider>
            <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'space-between', paddingHorizontal: 25, marginVertical: 10 }}>
              <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: 'bold' }}>Total</Text>
              <Text style={{ textAlign: 'center', fontSize: 16, color: 'red' }}>{presupuesto.precio_total?.toFixed(1) || 0} U$S</Text>
            </View>
            <View style={{ justifyContent: 'center', paddingHorizontal: 25, marginVertical: 10 }}>
              <Button style={{ backgroundColor: '#6200ee', borderRadius: 4, justifyContent: 'center' }} labelStyle={{ fontSize: 16 }}
                textColor='white'
                onPress={() => { setPdf(true) }} >
                Compartir
                <Icon
                  source="share"  // o "share-variant"
                  color="white"
                  size={20}
                />
              </Button>
            </View>
          </View>
        </View>
        {pdf &&
          <GenerarPDF
            presupuestoPdf={presupuesto} />}
      </Modal>
    </Portal>
  );
};

export default ModalMostrarPresupuesto;

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  containerStyle: {
    backgroundColor: 'white',
    borderRadius: 8,
    alignSelf: 'center',
    width: '90%',
    height: '90%',
    paddingHorizontal: 0
  },
  content: {
    flex: 1,
    width: '90%',
    height: '90%',
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 10,

  },
  listContainer: {
    width: '100%',
    flex: 1,
  },
});