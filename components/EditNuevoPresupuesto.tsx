import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Image, View, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button, Menu, List, Card, Text, IconButton, Divider, FAB, DataTable } from 'react-native-paper';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import VentanaSeleccionada from './VentanaSeleccionada';
import { Dropdown } from 'react-native-element-dropdown';
import { SerieOption, ColorOption, CortinaOption, PresupuestosOption, VentanaPresupuestoOption } from '../contexts/BDContext';
import { insertarPresupuestoConItems } from '@/app/utils/utilsDB';
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
  const [presupuesto, SetPresupuesto] = useState<PresupuestosOption>({
    id: -1,
    fecha: new Date(),
    nombre_cliente: "",
    precio_total: -1,
    ventanas: []
  });
  const [mostrarAbertura, setMostrarAbertura] = useState(false);

  const handleNombreChange = (texto: string) => {
    SetPresupuesto((prevPresupuesto) => ({ ...prevPresupuesto, nombre_cliente: texto }));
  };
  const [abertura, setAbertura] = useState('');
  const aberturasCombo = [
    { label: 'Ventana', value: '1' },
    { label: 'Puerta', value: '2' }
  ];
  const contador = useRef(0);
  const [aberturaEditar, setAberturaEditar] = useState<VentanaPresupuestoOption | undefined>(undefined);
  const handleComfirmarCreacion = (ventana: VentanaPresupuestoOption) => {
    contador.current -= 1;
    // id negativo significa que no esta en bd
    SetPresupuesto((prevPresupuesto) => ({ ...prevPresupuesto, ventanas: [...prevPresupuesto.ventanas, { ...ventana, id: contador.current }] }));
    setMostrarAbertura(false);
  }

  const handleComfirmarActualizacion = (ventana: VentanaPresupuestoOption) => {
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

  const handleGuardarPresupuesto = async () => {
    const precioTotalTemp = presupuesto.ventanas.reduce((total, item) => total + (item.precio_unitario * item.cantidad), 0).toFixed(1)
    SetPresupuesto((prevPresupuesto) => ({ ...prevPresupuesto, precio_total: Number(precioTotalTemp) }));
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
          onPress: () => insertarPresupuestoConItems(presupuesto)
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

  return (
    <View style={styles.getStartedContainer}>
      <Card style={styles.card}>
        <Card.Content style={{ flexDirection: 'column', gap: 15, width: '100%' }}>
          <TextInput // Imput nombre de usuario del presupuesto (OBLIFATORIO)
            mode="outlined"
            label="Nombre Cliente"
            placeholder="Nombre Cliente"
            left={<TextInput.Icon icon="account" />}
            style={styles.input}
            theme={{
              colors: {
                primary: 'white',  // Color primario 
                error: '#f44336',    // Color de error 
              },
            }}
            value={presupuesto.nombre_cliente}
            onChangeText={handleNombreChange}
          />
          {<Card style={styles.mensajeContainer}>
            <Card.Title title="Presupuesto" />

            <Card.Content style={{ width: '100%', paddingHorizontal: 0 }}>
              <Divider style={{ marginBottom: 8 }} />
              {presupuesto.ventanas.length > 0 ? (
                presupuesto.ventanas.map((ventana) => (
                  <List.Item
                    key={ventana.id}
                    title={`${ventana.cantidad} Ventana${Number(ventana.cantidad) > 1 ? 's' : ''} - ${ventana.ancho}cm X ${ventana.ancho}cm`}
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
                          resizeMode="contain"
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
                          disabled={(mostrarAbertura && abertura === "1") || aberturaEditar !== undefined}
                        >
                          <MaterialCommunityIcons
                            name="pencil"
                            size={24}
                            color="white"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleEliminarAbertura(ventana.id)}
                          style={styles.actionButton}
                          disabled={(mostrarAbertura && abertura === "1") || aberturaEditar !== undefined}
                        >
                          <MaterialCommunityIcons
                            name="delete"
                            size={24}
                            color="#ff6b6b"
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                ))
              ) : (
                <Text style={{ textAlign: 'center', color: 'white' }}>Lista de aberturas vacia!!!</Text>
              )}
              <Divider style={{ marginTop: 8, marginBottom: 8 }} />
              {
                presupuesto.ventanas.length > 0 && (
                  <Text style={styles.mensajeTexto}>Precio total: {presupuesto.ventanas.reduce((total, item) => total + item.precio_unitario, 0).toFixed(1)} US$</Text>
                )
              }{presupuesto.ventanas.length > 0 && (
                <View style={{ flexDirection: 'row', gap: 10, alignContent: 'center', justifyContent: 'center', marginTop: 10 }}>
                  <TouchableOpacity style={{
                    backgroundColor: '#2EBD2E',
                    borderRadius: 6,
                    height: 30,
                    width: '40%',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                    disabled={(mostrarAbertura && abertura === "1") || aberturaEditar !== undefined}
                    onPress={() => handleGuardarPresupuesto()}
                  > <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Guardar</Text> </TouchableOpacity>
                  <TouchableOpacity
                    disabled={(mostrarAbertura && abertura === "1") || aberturaEditar !== undefined}
                    style={{
                      backgroundColor: '#BD2E2E',
                      borderRadius: 6,
                      height: 30,
                      width: '40%',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}> <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Limpiar</Text> </TouchableOpacity>
                </View>
              )}
            </Card.Content>
          </Card>
          }

          <Button // Agregar aberturas al presupuesto
            mode="contained"
            onPress={() => setMostrarAbertura(!mostrarAbertura)}
            icon={() => <FontAwesome name="plus" size={20} color="white" />}
            style={styles.button}
            labelStyle={styles.label}
            disabled={(mostrarAbertura && abertura === "1") || aberturaEditar !== undefined}

          >
            Agregar Aberturas
          </Button>
        </Card.Content>
      </Card >
      {/* View que aparece al presionar el botón "Agregar Aberturas"*/
        /* Muestra todas las aberturas del sistema para ser seleccionadas y agregadas al presupuesto */
      }
      <View >
        {mostrarAbertura && (
          <>
            <Card style={styles.card}>
              <Card.Content>
                <Dropdown
                  data={aberturasCombo}
                  labelField="label"
                  valueField="value"
                  value={abertura}
                  onChange={item => setAbertura(item.value)}
                  placeholder="Seleccione abertura"
                  selectedTextStyle={{ color: 'white', textAlign: 'center', fontSize: 20 }}
                  style={styles.dropdown}
                  placeholderStyle={{ color: 'white', textAlign: 'center', fontSize: 20 }}
                  containerStyle={{ backgroundColor: '#000' }}
                  activeColor="#6200ee"
                  itemTextStyle={{ color: 'white' }}
                  iconColor="white"
                  iconStyle={{
                    width: 34,
                    height: 34,
                  }}
                  showsVerticalScrollIndicator={false}
                />
              </Card.Content>
            </Card>
            {abertura === '1' && <VentanaSeleccionada handleDone={handleComfirmarCreacion} handleClose={handleClose} />}
          </>
        )}
        {aberturaEditar && <VentanaSeleccionada ventanaAEditar={aberturaEditar} handleDone={handleComfirmarActualizacion} handleClose={handleClose} />}
      </View>

    </View >
  );
}

const styles = StyleSheet.create({
  getStartedContainer: {
    flexDirection: 'column',
    gap: 15,
  },
  containerAberturas: {
    flexDirection: 'row',
    gap: 15,
  },
  input: {
    backgroundColor: 'grey',
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

  mensajeContainer: {
    width: '100%',
    borderRadius: 5,
    padding: 0,
    marginTop: 10,
  },
  mensajeTexto: {
    color: 'white',
    textAlign: 'center',
  },
  dropdown: {
    width: '90%',
    height: 40,
    alignSelf: 'center',
    alignContent: 'center',
    borderColor: 'white', // Color del borde
    borderWidth: 0.3,
    borderRadius: 4,
    backgroundColor: 'grey',
  },
  listItem: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 30,
  },
  listaContainer: {
    backgroundColor: 'transparent',
    width: '100%',
    justifyContent: 'space-between'
  },
  listItemTitle: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  iconContainer: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    paddingRight: 1,
  },
  leftIconContainer: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    width: 40,
    height: 40,
    alignItems: 'center'
  },
  ventanaIcon: {
    backgroundColor: 'transparent',
    width: 24,
    height: 24,
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
    justifyContent: 'center',
    alignItems: 'center',
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
