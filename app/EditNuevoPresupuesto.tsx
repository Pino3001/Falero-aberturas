import React, { useRef, useState } from 'react';
import { StyleSheet, Image, View, TouchableOpacity, Alert } from 'react-native';
import { TextInput, List, Text, Divider, FAB, Dialog, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AgregarAbertura, { AgregarAberturaRef } from '@/components/_modales/AgregarAbertura';
import { useBD } from '../contexts/BDContext';
import { AberturaPresupuestoOption, ColorOption, CortinaOption, PresupuestosOption, PresupuestosOptionDefault, SerieOption } from '@/constants/interfases';
import Colors from '@/constants/Colors';
import ModalMostrarPresupuesto from '@/components/_modales/ModalMostrarPresupuesto';
import DialogComponent from '@/components/DialogComponent';
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
  const contador = useRef(0);
  const [showDialog, setShowDialog] = useState(false);
  const [showGuardar, setShowGuardar] = useState(false);
  const [showEliminar, setShowEliminar] = useState<{ mostrar: boolean, id: number }>({
    mostrar: false,
    id: -1
  });
  const [showLimpiar, setShowLimpiar] = useState(false);
  const [errorNombre, setErrorNombre] = useState('');
  const [alert, setAlert] = useState(false);
  const [mostrarPresupuesto, setMostrarPresupuesto] = useState<{ mostrar: boolean, nuevoPresu: PresupuestosOption }>({
    mostrar: false,
    nuevoPresu: PresupuestosOptionDefault
  });

  const handleNombreChange = (texto: string) => {
    if (errorNombre) setErrorNombre('');
    SetPresupuesto((prevPresupuesto) => ({ ...prevPresupuesto, nombre_cliente: texto }));
  };

  const validateField = () => {
    if (!presupuesto.nombre_cliente.trim()) {
      setErrorNombre('El nombre del cliente es obligatorio');
      setAlert(true)
      return false;
    }
    return true;
  };

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
  const handleGuardar = () => {
    if (validateField()) {
      setShowDialog(true);
      setShowGuardar(true);
    } else {
      setAlert(true);
    }
  }
  const { insertarPresupuestoConItemsBDContext } = useBD();


  const confirmGuardar = async () => {
    try {
      const precioTotalTemp = presupuesto.ventanas.reduce((total, item) => total + (item.precio_unitario * item.cantidad), 0);
      const respuesta = await insertarPresupuestoConItemsBDContext({ ...presupuesto, precio_total: precioTotalTemp });
      setShowDialog(false);
      setShowGuardar(false);
      setMostrarPresupuesto({
        mostrar: true,
        nuevoPresu: { ...presupuesto, precio_total: precioTotalTemp }
      })

    }
    catch (ex) {
      console.log(ex);
    } finally {
      SetPresupuesto(PresupuestosOptionDefault);
    }
  }

  const handleEliminarAbertura = () => {
    SetPresupuesto(prev => ({
      ...prev,
      ventanas: prev.ventanas.filter(v => v.id !== showEliminar.id)
    }))
    setShowEliminar(prevState => ({
      ...prevState,
      id: -1
    }));
    setShowDialog(false);

  };

  const dropdownRef = useRef<AgregarAberturaRef>(null);

  return (
    <View style={styles.getStartedContainer}>

      <TextInput // Imput nombre de usuario del presupuesto (OBLIFATORIO)
        mode="outlined"
        label=""
        placeholderTextColor={Colors.colors.text}
        textColor={Colors.colors.text}
        cursorColor={Colors.colors.complementario}
        placeholder="Nombre Cliente"
        left={<TextInput.Icon icon="account" color={Colors.colors.text} />}
        style={styles.input}
        theme={{
          colors: {
            primary: errorNombre ? Colors.colors.error : Colors.colors.complementarioText,
            onSurfaceVariant: Colors.colors.text,
            error: Colors.colors.error,
          },
        }}
        value={presupuesto.nombre_cliente}
        onChangeText={handleNombreChange}
        error={!!errorNombre}
      />

      <Divider style={{ marginHorizontal: 10, backgroundColor: Colors.colors.text }} />
      <Text style={{ fontSize: 14, textAlign: 'center', color: Colors.colors.text }}>Listado de Aberturas</Text>
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
                    color={Colors.colors.text}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowDialog(true);
                    setShowEliminar({
                      mostrar: true,
                      id: ventana.id
                    });
                  }}
                  style={styles.actionButton}
                  disabled={(mostrarAbertura && aberturaEditar != null) || aberturaEditar !== undefined}
                >
                  <MaterialCommunityIcons
                    name="delete"
                    size={20}
                    color={Colors.colors.complementario}
                  />
                </TouchableOpacity>
              </View>
            )}
          />
        )))
        : (
          <Text style={{ textAlign: 'center', color: Colors.colors.text, fontSize: 16 }}>Lista de aberturas vacia!!!</Text>
        )}
      <Divider style={{ margin: 10, backgroundColor: Colors.colors.text }} />
      {presupuesto.ventanas.length > 0 ? (
        <Text style={styles.mensajeTexto}>
          {`Precio total:  `}
          <Text style={[styles.mensajeTexto, { color: Colors.colors.complementarioText }]}>{presupuesto.ventanas.reduce((total, item) => total + item.precio_unitario, 0).toFixed(1)} US$</Text>
        </Text>
      ) : null}
      {presupuesto.ventanas.length > 0 ? (
        <View style={{ flexDirection: 'row', gap: 10, alignContent: 'center', justifyContent: 'center', marginTop: 10 }}>
          <Button style={{
            backgroundColor: Colors.colors.active_color,
            borderRadius: 6,
            borderColor: Colors.colors.text,
            borderWidth: 1.5,
            height: 40,
            width: '40%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
            disabled={(mostrarAbertura) || aberturaEditar !== undefined}
            onPress={() => handleGuardar()}
          > <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.colors.text }}>Guardar</Text>
          </Button>
          <View></View>
          <Button
            style={{
              backgroundColor: Colors.colors.inactive_color,
              borderColor: Colors.colors.text,
              borderWidth: 1.5,
              borderRadius: 6,
              height: 40,
              width: '40%',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            disabled={(mostrarAbertura) || aberturaEditar !== undefined}
            onPress={() => {
              setShowDialog(true);
              setShowLimpiar(true);
            }}
          > <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.colors.text }}>Limpiar</Text>
          </Button>
        </View>
      ) : null
      }
      {
        (!mostrarAbertura || agregarCerrado) &&
        <FAB
          icon="plus"
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            width: 60,
            height: 60,
            margin: 16,
            right: 0,
            bottom: 0,
            backgroundColor: Colors.colors.complementario
          }}
          color={Colors.colors.text}
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
      {
        mostrarAbertura ? (
          <AgregarAbertura
            handleDone={handleComfirmarCreacion}
            ref={dropdownRef}
            handleClose={handleClose}
            visible={mostrarAbertura}
            hideModal={() => setAgregarCerrado(true)}
          />
        ) : null
      }
      {
        aberturaEditar ? (
          <AgregarAbertura
            ventanaAEditar={aberturaEditar}
            ref={dropdownRef}
            handleDone={handleComfirmarActualizacion}
            handleClose={handleClose}
            visible={true}
            hideModal={() => setAberturaEditar(undefined)}
          />
        ) : null
      }

      <ModalMostrarPresupuesto
        visible={mostrarPresupuesto.mostrar}
        onClose={() => setMostrarPresupuesto({
          mostrar: false,
          nuevoPresu: PresupuestosOptionDefault
        })}
        animationType="none"
        transparent={true}
        presupuesto={mostrarPresupuesto.nuevoPresu}
      />

      {
        showDialog && showGuardar ?
          <DialogComponent
            Title='Guardar Presupuesto'
            Content_text='¿Desea guardar el presupuesto?'
            onCancel={() => {
              setShowDialog(false);
              setShowGuardar(false);
            }}
            onConfirm={() => confirmGuardar()}
          /> : null
      }

      {
        showDialog && showLimpiar ?
          <DialogComponent
            Title='Limpiar Campos'
            Content_text='¿Desea limpiar todos los campos del presupuesto?'
            onCancel={() => {
              setShowDialog(false);
              setShowLimpiar(false);
            }}
            onConfirm={() => {
              SetPresupuesto(PresupuestosOptionDefault);
              setShowLimpiar(false);
              setShowDialog(false);

            }}
          /> : null
      }

      {
        showDialog && showEliminar.mostrar ? (() => {
          const aberturaSelec = presupuesto.ventanas.find(v => v.id === showEliminar.id);
          return (
            <DialogComponent
              Title='Eliminar Abertura'
              Content_text={`¿Desea quitar ${aberturaSelec ? aberturaSelec.cantidad : ''} ${aberturaSelec ? aberturaSelec.tipo_abertura : ''} ${aberturaSelec ? aberturaSelec.ancho : ''}x${aberturaSelec ? aberturaSelec.alto : ''} del presupuesto?`}
              onCancel={() => {
                setShowDialog(false);
                setShowEliminar(prevState => ({
                  ...prevState,
                  mostrar: false
                }));
              }}
              onConfirm={() => {
                handleEliminarAbertura();
                setShowEliminar(prevState => ({
                  ...prevState,
                  mostrar: false
                }));
                setShowDialog(false);
              }}
            />
          );
        })() : null
      }
      {
        alert ? (
          <Dialog visible={alert} onDismiss={() => setAlert(false)} style={{backgroundColor: Colors.colors.background_modal}}>
            <Dialog.Icon icon="alert" color={Colors.colors.complementario} />
            <Dialog.Title style={{ textAlign: 'center', fontSize: 16, color: Colors.colors.text }}>Debes insertar un nombre de Cliente</Dialog.Title>
          </Dialog>
        ) : null
      }
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
    backgroundColor: Colors.colors.imput_black,
    width: '90%',
    height: 40,
    alignSelf: 'center', // Centrar horizontalmente
  },
  button: {
    backgroundColor: Colors.colors.active_color, // Color morado de Material Design
    borderRadius: 6,
    width: '90%',
    alignSelf: 'center',
  },
  buttonGuardar: {
    backgroundColor: Colors.colors.active_color,
    borderRadius: 6,
    padding: 10,
    alignSelf: 'center',
  },
  label: {
    fontSize: 16,
    color: Colors.colors.text,
  },
  miTexto: {
    fontSize: 16,
    color: Colors.colors.text,
  },

  mensajeTexto: {
    color: Colors.colors.text,
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
    color: Colors.colors.text,
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
    tintColor: Colors.colors.text
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
