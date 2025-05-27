import { PerfilesEnum, preciosVariosEnum, seriesEnum } from '@/app/Data/variablesGlobales';
import { CortinaOption, PerfilesOption, PerfilesOptionDefault, PresupuestosOption, useBD, VentanaPresupuestoOption } from '@/contexts/BDContext';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Modal, View, TouchableWithoutFeedback, StyleProp, FlatList, Text } from 'react-native';
import { Card, DataTable, Divider, Icon, IconButton, List } from 'react-native-paper';
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

  const gramosAluminio = (ventana: VentanaPresupuestoOption): number => {
    const serie = series.find(x => x.id == ventana.id_serie);
    if (serie) {
      if (serie.nombre === seriesEnum.serie20) {
        const gramosAlumnio = (buscarPerfil(ventana, PerfilesEnum.MarcoSuperior).gramos_por_m * ventana.ancho +
          buscarPerfil(ventana, PerfilesEnum.MarcoInferior).gramos_por_m * ventana.ancho +
          buscarPerfil(ventana, PerfilesEnum.MarcoLateral).gramos_por_m * 2 * ventana.alto);
        return gramosAlumnio;
      }
      else if (serie.nombre == seriesEnum.serie25_2h) {
        const gramosAlumnio = (buscarPerfil(ventana, PerfilesEnum.MarcoSuperior).gramos_por_m * ventana.ancho +
          buscarPerfil(ventana, PerfilesEnum.MarcoInferior).gramos_por_m * ventana.ancho +
          buscarPerfil(ventana, PerfilesEnum.MarcoLateral).gramos_por_m * 2 * ventana.alto +
          buscarPerfil(ventana, PerfilesEnum.HojaInferior).gramos_por_m * ventana.ancho +
          buscarPerfil(ventana, PerfilesEnum.HojaSuperior).gramos_por_m * ventana.ancho +
          buscarPerfil(ventana, PerfilesEnum.HojaEngancheCentral).gramos_por_m * 2 * ventana.alto +
          buscarPerfil(ventana, PerfilesEnum.HojaLateral).gramos_por_m * 2 * ventana.alto);
        return gramosAlumnio;
      }
      else if (serie.nombre == seriesEnum.serie25_3h) {
        const gramosAlumnio = (buscarPerfil(ventana, PerfilesEnum.MarcoSuperior).gramos_por_m * ventana.ancho +
          buscarPerfil(ventana, PerfilesEnum.MarcoInferior).gramos_por_m * ventana.ancho +
          buscarPerfil(ventana, PerfilesEnum.MarcoLateral).gramos_por_m * 2 * ventana.alto +
          buscarPerfil(ventana, PerfilesEnum.HojaInferior).gramos_por_m * ventana.ancho +
          buscarPerfil(ventana, PerfilesEnum.HojaSuperior).gramos_por_m * ventana.ancho +
          buscarPerfil(ventana, PerfilesEnum.HojaEngancheCentral).gramos_por_m * 4 * ventana.alto +
          buscarPerfil(ventana, PerfilesEnum.HojaLateral).gramos_por_m * 2 * ventana.alto);
        return gramosAlumnio;
      }
    }
    return -1;
  }

  const buscarPerfil = (ventana: VentanaPresupuestoOption, perfil_nombre: string): PerfilesOption => {
    let perfilAux = perfiles.find(p => p.serie_id === ventana.id_serie && p.nombre === perfil_nombre);
    console.log('serserieie', ventana.id_serie)
    if (perfilAux)
      return perfilAux;
    else {
      const serie = series.find(x => x.id == ventana.id_serie);
      console.log('serie', serie)
      if (serie && serie.serie_id_hereda) {
        perfilAux = perfiles.find(p => p.serie_id === serie.serie_id_hereda && p.nombre === perfil_nombre)
        if (perfilAux)
          return perfilAux;
      }
    }
    return PerfilesOptionDefault;
  }

  const costoVidrio = (ventana: VentanaPresupuestoOption): number => {
    const areaVidrio = (ventana.ancho * ventana.alto) / 10000;
    const costoM2Vidrio = preciosVarios.find(v => v.nombre === preciosVariosEnum.vidrio)?.precio;
    if (costoM2Vidrio === undefined) return 0;
    return areaVidrio * costoM2Vidrio;
  }

  const costoMosquitero = (ventana: VentanaPresupuestoOption): number => {
    const areaMosquitero = (ventana.ancho * ventana.alto) / 10000;
    const costoM2Mosquitero = preciosVarios.find(v => v.nombre === preciosVariosEnum.vidrio)?.precio;
    if (costoM2Mosquitero === undefined) return 0;
    return areaMosquitero * costoM2Mosquitero;
  }

  const costoCortina = (ventana: VentanaPresupuestoOption): number => {
    const areaCortina = (ventana.ancho * ventana.alto) / 10000;
    const precioM2Cortina = cortinas.find(c => c.id === ventana.id_cortina)?.preciom2;
    if (precioM2Cortina === null || precioM2Cortina === undefined) return 0;
    return areaCortina * precioM2Cortina;
  }

  const costoAluminio = (ventana: VentanaPresupuestoOption): number => {
    const pesoAluminio = gramosAluminio(ventana) / 100000;
    console.log('peso del aluminio', pesoAluminio)

    let costoAluminio = 0;
    let precioColor = colors.find(c => c.id === ventana.id_color_aluminio)?.precio;
    console.log('precio del aluminio', precioColor)
    if (precioColor != undefined) {
      costoAluminio = pesoAluminio * precioColor;
    }
    return costoAluminio;
  }

  const costoManoDeObra = (ventana: VentanaPresupuestoOption): number => {
    const manoAux = preciosVarios.find(v => v.nombre === preciosVariosEnum.manoDeObra)?.precio;
    if (manoAux && manoAux > 0) {
      return ((ventana.precio_unitario * manoAux) / (100 + manoAux)) * ventana.cantidad;
    }
    return 0;
  }

  return (
    <Modal
      animationType={animationType}
      transparent={transparent}
      visible={visible}
      onRequestClose={onClose}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
    >
      <Card style={[styles.content]} >
        <Card.Content style={{ flexDirection: 'row', gap: 15, width: '100%' }}>
          <Card.Title style={{ justifyContent: 'flex-start', width: '70%' }} title="Presupuesto" titleStyle={{ color: 'black', fontWeight: 'bold', fontSize: 18 }} />
          <IconButton
            style={{ width: '30%', }}
            icon="close"
            iconColor="black"
            size={24}
            onPress={onClose}
          />
        </Card.Content>
        <Card.Content style={{}}>
          <View style={{ flexDirection: 'row', gap: 15 }}>
            <Text style={{ color: 'black' }}>Nombre cliente: {presupuesto.nombre_cliente}</Text>
            <Text style={{ color: 'black' }}>Fecha: {presupuesto.fecha.toLocaleDateString()}</Text>
          </View>
          <Divider style={{ borderBlockColor: '#6200ee', borderWidth: 0.5, margin: 3 }}></Divider>
          <View>
            <Text>Aberturas:</Text>
          </View>
          <FlatList
            data={presupuesto.ventanas}
            style={{ width: "100%", height: '100%' }}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <List.Section style={{ justifyContent: 'flex-start', alignContent: 'flex-start', paddingHorizontal: 0 }}>
                <List.Accordion
                  title={
                    <Text style={{ fontSize: 11, color: 'black', fontWeight: 'bold' }}>
                      {`${item.cantidad} - Ventana ${item.ancho} X ${item.alto}`}
                    </Text>
                  }
                  style={{ height: 40, alignItems: 'center', paddingVertical: 0, backgroundColor: 'white' }}
                >
                  <View >
                    <View style={{ paddingHorizontal: 25 }}>
                      <View style={{ flexDirection: 'row', gap: 5 }}>
                        <Text style={{ textAlign: 'center', fontSize: 12 }}>{`${item.cantidad} - Ventana`}</Text>
                        <View style={{ flexDirection: 'row' }}>
                          <Text style={{ textAlign: 'center', fontSize: 12 }}>{`${item.ancho}`}</Text>
                          <Text style={{ color: 'grey', fontSize: 6 }}>{`cm`}</Text>
                          <Text style={{ textAlign: 'center', fontSize: 12 }}>{`x `}</Text>
                          <Text style={{ textAlign: 'center', fontSize: 12 }}>{`${item.alto}`}</Text>
                          <Text style={{ color: 'grey', fontSize: 6 }}>{`cm`}</Text>
                        </View>
                        <Text style={{ textAlign: 'center', fontSize: 12 }}>{`${series.find(s => s.id === item.id_serie)?.nombre || ''}`}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 5 }}>
                        <Text style={{ textAlign: 'center', fontSize: 12 }}>{`Color "${colors.find(c => c.id === item.id_color_aluminio)?.color || ''}"`}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 5 }}>
                        {item.id_cortina && item.id_cortina > 1 &&
                          <Text style={{ textAlign: 'center', fontSize: 12 }}>{`${cortinas.find(c => c.id === item.id_cortina)?.tipo}`}</Text>
                        }
                      </View>
                      <View style={{ flexDirection: 'row', gap: 5 }}>
                        {item.mosquitero &&
                          <Text style={{ textAlign: 'center', fontSize: 12 }}>{`Con mosquitero`}</Text>
                        }
                      </View>
                    <Divider style={{ margin: 3}}></Divider>
                    </View>
                    <View style={{ paddingHorizontal: 25 }}>
                      <Text style={{ textAlign: 'center', fontSize: 14 }}>Costos</Text>

                      <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'space-between' }}>
                        <Text style={{ textAlign: 'center', fontSize: 12 }}>Aluminio:</Text>
                        <Text style={{ textAlign: 'center', fontSize: 12, color: 'red' }}>{`${costoAluminio(item)?.toFixed(1) || 0} US$`}</Text>
                      </View>

                      {item.vidrio &&
                        <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'space-between' }}>
                          <Text style={{ textAlign: 'center', fontSize: 12 }}>Vidrio:</Text>
                          <Text style={{ textAlign: 'center', fontSize: 12, color: 'red' }}>{`${costoVidrio(item)?.toFixed(1) || 0} US$`}</Text>
                        </View>
                      }

                      {item.mosquitero &&
                        <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'space-between' }}>
                          <Text style={{ textAlign: 'center', fontSize: 12 }}>Mosquitero:</Text>
                          <Text style={{ textAlign: 'center', fontSize: 12, color: 'red' }}>{`${costoMosquitero(item)?.toFixed(1) || 0} US$`}</Text>
                        </View>
                      }

                      {item.id_cortina && item.id_cortina > 1 &&
                        <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'space-between' }}>
                          <Text style={{ textAlign: 'center', fontSize: 12 }}>{cortinas.find(c => c.id === item.id_cortina)?.tipo || 'No especificado'}</Text>
                          <Text style={{ textAlign: 'center', fontSize: 12, color: 'red' }}>{`${costoCortina(item)?.toFixed(1) || 0} US$`}</Text>
                        </View>
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
                        <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: 'bold' }}>Total</Text>
                        <Text style={{ textAlign: 'center', fontSize: 14, color: 'red' }}>{`${Math.round(item.precio_unitario * item.cantidad * 10) / 10} US$`}</Text>
                      </View>
                    </View>
                  </View>
                </List.Accordion>
                <Divider style={{ margin: 3 }}></Divider>

              </List.Section>
            )}
            ListEmptyComponent={<List.Item title="No hay aberturas" titleStyle={{ color: 'black', fontSize: 13 }} />}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={10}
          />
          <Divider style={{ borderBlockColor: '#6200ee', borderWidth: 0.5 }}></Divider>
        </Card.Content>
      </Card>
    </Modal>
  );
};

export default ModalMostrarPresupuesto;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8d7da'
  },
  errorText: {
    color: '#721c24'
  },
  content: {
    flex: 1,
    width: '90%',
    height: '90%',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 5,
    paddingHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});