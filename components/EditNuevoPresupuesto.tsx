import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Image, View, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button, Menu, List, Card, Text, IconButton, Divider, FAB, DataTable } from 'react-native-paper';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AgregarAbertura, { AgregarAberturaRef } from './AgregarAbertura';
import { Dropdown } from 'react-native-element-dropdown';
import { useBD } from '../contexts/BDContext';
import { AberturasEnum } from '@/constants/variablesGlobales';
import { AberturaPresupuestoOption, ColorOption, CortinaOption, PresupuestosOption, PresupuestosOptionDefault, SerieOption } from '@/app/utils/interfases';
const ventanaIcon = require('../assets/images/ventana.png');
const ventana3HojasIcon = require('../assets/images/ventana con 3 hojas.png');
const ventanaCortinaIcon = require('../assets/images/ventana con cortina.png');

export type Ventana = {
  id_abertura_presupuesto?: number;
  largo: string;
  label: string;
  ancho: string;
  vidrio: boolean;
  mosquitero: boolean;
  serie?: SerieOption;
  colorAluminio?: ColorOption;
  cortina?: CortinaOption;
  cantidad: string;
  preciounitario: number;
  precioTotal: number;
};


export default function EditNuevoPresupuesto({ path }: { path: string }) {

  const [presupuesto, SetPresupuesto] = useState<PresupuestosOption>(PresupuestosOptionDefault);
  const [mostrarAbertura, setMostrarAbertura] = useState(false);
  const [agregarCerrado, setAgregarCerrado] = useState(false);
  const handleNombreChange = (texto: string) => {
    SetPresupuesto((prevPresupuesto) => ({ ...prevPresupuesto, nombre_cliente: texto }));
  };


  const contador = useRef(0);
  const [aberturaEditar, setAberturaEditar] = useState<AberturaPresupuestoOption | undefined>(undefined);
  const handleComfirmarCreacion = (ventana: AberturaPresupuestoOption) => {
    contador.current -= 1;
    // id negativo significa que no esta en bd
    SetPresupuesto((prevPresupuesto) => ({ ...prevPresupuesto, ventanas: [...prevPresupuesto.ventanas, { ...ventana, id: contador.current }] }));
    setMostrarAbertura(false);
  }

  const handleComfirmarActualizacion = (ventana: AberturaPresupuestoOption) => {
    SetPresupuesto(prevPresupuesto => {
      const index = prevPresupuesto.ventanas.findIndex(item => item.id === ventana.id);
      if (index === -1) return prevPresupuesto; // No se encontró el elemento
      return {
        ...prevPresupuesto,
        ventanas:
          [
            ...prevPresupuesto.ventanas.slice(0, index),
            { ...prevPresupuesto.ventanas[index], ...ventana },
            ...prevPresupuesto.ventanas.slice(index + 1)
          ]
      };
    });
    setAberturaEditar(undefined);
  }
  const handleClose = () => {
    setMostrarAbertura(false);
    setAberturaEditar(undefined);
  }
  const { insertarPresupuestoConItemsBDContext } = useBD();
  const handleGuardarPresupuesto = async () => {
    Alert.alert(
      'Guardar presupuesto',
      '¿Estás seguro que deseas guardar este presupuesto?',
      [
        {
          text: 'Cancelar',
          style: 'cancel', // Estilo predefinido para iOS (no afecta Android)
          onPress: () => console.log('Cancelado')
        },
        {
          text: 'Guardar',
          onPress: async () => {
            try {
              const precioTotalTemp = presupuesto.ventanas.reduce((total, item) => total + (item.precio_unitario * item.cantidad), 0);
              const respuesta = await insertarPresupuestoConItemsBDContext({ ...presupuesto, precio_total: precioTotalTemp });
              SetPresupuesto(PresupuestosOptionDefault);
              console.log("respuesta:", respuesta);
            }
            catch (ex) {
              console.log(ex);
            }

          }
        }
      ]
    )
  }

  const handleEliminarAbertura = (id: number) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro que deseas eliminar esta abertura?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => SetPresupuesto(prev => ({
            ...prev,
            ventanas: prev.ventanas.filter(v => v.id !== id)
          }))
        }
      ],
      {
        cancelable: true // Permite cerrar tocando fuera
      }
    );
  };

  const dropdownRef = useRef<AgregarAberturaRef>(null);

  return (
    <View style={styles.getStartedContainer}>

      <TextInput // Imput nombre de usuario del presupuesto (OBLIFATORIO)
        mode="outlined"
        label="Nombre Cliente"
        placeholderTextColor={'black'}
        textColor='black'
        cursorColor='#6200ee'
        placeholder="Nombre Cliente"
        left={<TextInput.Icon icon="account" color={'black'} />}
        style={styles.input}
        theme={{
          colors: {
            primary: 'black', // Color del label cuando está activo/focus (cámbialo si lo necesitas)
            onSurfaceVariant: 'black', // Color del label cuando está inactivo
          },
        }}
        value={presupuesto.nombre_cliente}
        onChangeText={handleNombreChange}
      />

      <Divider style={{ marginHorizontal: 10 }} />
      <Text style={{ fontSize: 14, textAlign: 'center' }}>Listado de Aberturas</Text>
      {presupuesto.ventanas.length > 0 ? (
        presupuesto.ventanas.map((ventana) => (
          <List.Item
            key={ventana.id}
            title={`${ventana.cantidad} ${ventana.tipo_abertura}${Number(ventana.cantidad) > 1 ? 's' : ''} - ${ventana.ancho}cm X ${ventana.ancho}cm`}
            style={styles.listItem}
            titleStyle={styles.listItemTitle}
            left={() => (
              <View style={styles.leftIconContainer}>
                <Image
                  source={
                    ventana.id_serie === 3
                      ? ventana3HojasIcon
                      : ventana.id !== undefined && ventana.id_cortina !== undefined
                        ? ventanaCortinaIcon
                        : ventanaIcon
                  }
                  style={styles.ventanaIcon}
                />
              </View>
            )}
            right={props => (
              <View style={styles.rightIconContainer}>
                <TouchableOpacity
                  onPress={() => {
                    console.log("editar pressed");
                    setAberturaEditar(ventana)
                  }}
                  style={styles.actionButton}
                  disabled={(mostrarAbertura && aberturaEditar != null) || aberturaEditar !== undefined}
                >
                  <MaterialCommunityIcons
                    name="pencil"
                    size={20}
                    color="white"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleEliminarAbertura(ventana.id)}
                  style={styles.actionButton}
                  disabled={(mostrarAbertura && aberturaEditar != null) || aberturaEditar !== undefined}
                >
                  <MaterialCommunityIcons
                    name="delete"
                    size={20}
                    color="#ee6200"
                  />
                </TouchableOpacity>
              </View>
            )}
          />
        )))
        : (
          <Text style={{ textAlign: 'center', color: 'white', fontSize: 16 }}>Lista de aberturas vacia!!!</Text>
        )}
      <Divider style={{ margin: 10 }} />
      {presupuesto.ventanas.length > 0 && (
        <Text style={styles.mensajeTexto}>
          {`Precio total:  `}
          <Text style={[styles.mensajeTexto, { color: 'rgb(232, 121, 42)' }]}>{presupuesto.ventanas.reduce((total, item) => total + item.precio_unitario, 0).toFixed(1)} US$</Text>
        </Text>
      )}
      {presupuesto.ventanas.length > 0 && (
        <View style={{ flexDirection: 'row', gap: 10, alignContent: 'center', justifyContent: 'center', marginTop: 10 }}>
          <TouchableOpacity style={{
            backgroundColor: '#6200ee',
            borderRadius: 6,
            borderColor: 'rgb(243, 243, 243)',
            borderWidth: 1.5,
            height: 40,
            width: '40%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
            disabled={(mostrarAbertura) || aberturaEditar !== undefined}
            onPress={() => handleGuardarPresupuesto()}
          > <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>Guardar</Text> </TouchableOpacity>
          <TouchableOpacity
            disabled={(mostrarAbertura) || aberturaEditar !== undefined}
            style={{
              backgroundColor:'#9e9e9e',
              borderColor: 'rgb(243, 243, 243)',
              borderWidth: 1.5,
              borderRadius: 6,
              height: 40,
              width: '40%',
              alignItems: 'center',
              justifyContent: 'center'
            }}> <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>Limpiar</Text>
          </TouchableOpacity>
        </View>
      )}
      {(!mostrarAbertura || agregarCerrado) &&
        <FAB
          icon="plus"
          style={{
            position: 'absolute',
            margin: 16,
            right: 0,
            bottom: 0,
            backgroundColor: '#6200ee'
          }}
          onPress={() => {
            if (agregarCerrado && dropdownRef.current) {
              dropdownRef.current.open();
              setAgregarCerrado(false);
            }
            else {
              setMostrarAbertura(true);
            }
          }}
        />
      }
      {mostrarAbertura ? (
        <AgregarAbertura
          handleDone={handleComfirmarCreacion}
          ref={dropdownRef}
          handleClose={handleClose}
          visible={mostrarAbertura}
          hideModal={() => setAgregarCerrado(true)}
        />
      ) : null}
      {aberturaEditar ? (
        <AgregarAbertura
          ventanaAEditar={aberturaEditar}
          ref={dropdownRef}
          handleDone={handleComfirmarActualizacion}
          handleClose={handleClose}
          visible={true}
          hideModal={() => setAberturaEditar(undefined)}
        />
      ) : null}
    </View >
  );
}

const styles = StyleSheet.create({
  getStartedContainer: {
    flexDirection: 'column',
    gap: 15,
    height: '100%',
  },
  containerAberturas: {
    flexDirection: 'row',
    gap: 15,
  },
  input: {
    color: 'black',
    backgroundColor: 'rgb(243, 243, 243)',
    width: '90%',
    height: 40,
    alignSelf: 'center', // Centrar horizontalmente
  },
  button: {
    backgroundColor: '#6200ee', // Color morado de Material Design
    borderRadius: 6,
    width: '90%',
    alignSelf: 'center',
  },
  buttonGuardar: {
    backgroundColor: '#6200ee',
    borderRadius: 6,
    padding: 10,
    alignSelf: 'center',
  },
  label: {
    fontSize: 16,
    color: 'white',
  },
  miTexto: {
    fontSize: 16,
    color: 'white',
  },

  mensajeTexto: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
  },
  listItem: {
    height: 45
  },
  listaContainer: {
    backgroundColor: 'transparent',
    width: '100%',
    justifyContent: 'space-between'
  },
  listItemTitle: {
    fontSize: 13,
    color: 'white',
  },
  iconContainer: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftIconContainer: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    paddingLeft: 30,
    alignItems: 'center'
  },
  ventanaIcon: {
    backgroundColor: 'transparent',
    width: 20,
    height: 20,
    tintColor: 'white'
  },
  card: {
    backgroundColor: '#1E1E1E',
    alignSelf: 'center',
    width: '98%',
    elevation: 4,
  },
  rightIconContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    alignItems: 'stretch'
  },
  titleTable: {
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',

  },
  textCell: {
    fontSize: 11,
    textAlign: 'center',
  }
});
