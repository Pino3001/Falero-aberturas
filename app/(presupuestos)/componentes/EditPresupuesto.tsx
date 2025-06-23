import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { TextInput, Text, Divider, FAB, Dialog, Button } from 'react-native-paper';
import AgregarAbertura, { AgregarAberturaRef } from '@/app/(diseños-sistema)/modales/AgregarAbertura';
import { AberturaPresupuestoOption, ColorOption, CortinaOption, PresupuestosOption, PresupuestosOptionDefault, SerieOption } from '@/utils/constants/interfases';
import ModalMostrarPresupuesto from '@/app/(diseños-sistema)/modales/ModalMostrarPresupuesto';
import DialogComponent from '@/app/(diseños-sistema)/componentes/DialogComponent';
import Colors from '@/utils/constants/Colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getPresupuestoByID } from '@/utils/_db/operacionesDB';
import ShowAberturaNueva from '@/app/(diseños-sistema)/componentes/ShowAberturaNueva';
import { useTheme } from '@/utils/contexts/ThemeContext';
import { useBD } from '@/utils/contexts/BDContext';

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

export default function EditPresupuesto() {
  const params = useLocalSearchParams<{ id?: string }>();
  const { colors } = useTheme();
  const [presupuesto, SetPresupuesto] = useState<PresupuestosOption>(PresupuestosOptionDefault);

  const {stateBD } = useBD(); // Para recargar si hay cambios
  const { series, cortinas, acabado } = stateBD;

  const router = useRouter();

  useEffect(() => {
    const loadPresupuesto = async () => {
      if (params.id) {
        const data = await getPresupuestoByID(Number(params.id));
        SetPresupuesto(data || PresupuestosOptionDefault);

      } else {
        SetPresupuesto(PresupuestosOptionDefault); // Reset si no hay ID
      }
    };
    loadPresupuesto();
  }, [params.id]);


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
  const { insertarPresupuestoConItemsBDContext } = useBD();
  const [aberturaEditar, setAberturaEditar] = useState<AberturaPresupuestoOption | undefined>(undefined);



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

  const handleComfirmarCreacion = (ventana: AberturaPresupuestoOption) => {
    if (!ventana) {
      console.error("Ventana es undefined");
      return;
    }
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
      console.log('se esta cargando datos: ', series)

      setShowDialog(true);
      setShowGuardar(true);
    } else {
      setAlert(true);
    }
  }

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

  const getUltimoColorUsado = () => {
    if (!presupuesto?.ventanas?.length) return undefined;
    return presupuesto.ventanas[presupuesto.ventanas.length - 1].id_color_aluminio;
  };

  const dropdownRef = useRef<AgregarAberturaRef>(null);

  return (
    <View style={styles.getStartedContainer}>

      <View style={{ marginBottom: 0, paddingBottom: 0 }}>
        <TextInput // Imput nombre de usuario del presupuesto (OBLIFATORIO)
          mode="outlined"
          label=""
          placeholder="Nombre Cliente"
          left={<TextInput.Icon icon="account" />}
          style={styles.input}
          value={presupuesto.nombre_cliente}
          onChangeText={handleNombreChange}
          error={!!errorNombre}
        />
        <Divider style={{ marginHorizontal: 10, marginTop: 5, marginBottom: 5 }} />
        <Text variant='titleMedium' style={{ textAlign: 'center', color: colors.onPrimaryContainer }}>Listado de Aberturas</Text>
      </View>

      <View style={{ flex: 1 }}>

        <FlatList
          data={presupuesto.ventanas}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<Text variant='titleSmall' style={{ marginLeft: 20, color: colors.primary, marginTop: 30 }}>No hay presupuestos</Text>}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={10}
          renderItem={({ item }) => (
            <ShowAberturaNueva
              abertura={item}
              serie={series.find(s => s.id === item.id_serie)}
              acabado={acabado.find(a => a.id === item.id_color_aluminio)}
              cortina={cortinas.find(c => c.id === item.id_cortina) ?? null}
              onLongPress={() => { setAberturaEditar(item) }}
              onDelete={() => {
                setShowDialog(true);
                setShowEliminar({
                  mostrar: true,
                  id: item.id
                });
              }}
              isDeleting={showDialog}
            />
          )}
        />
      </View>

      <View style={{ paddingTop: 0 }}>

        {presupuesto.ventanas.length > 0 ? (
          <View>
            <Divider style={{ marginBottom: 10, marginHorizontal: 5, marginTop: 0 }} />

            <Text variant='bodyLarge' style={styles.mensajeTexto}>
              {`Precio total:  `}
              <Text variant='bodyLarge' style={[styles.mensajeTexto, { color: colors.error }]}>{presupuesto.ventanas.reduce((total, item) => total + item.precio_unitario, 0).toFixed(1)} US$</Text>
            </Text>
          </View>
        ) : null}

        {presupuesto.ventanas.length > 0 ? (
          <View style={{ flexDirection: 'row', gap: 10, alignContent: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 80 }}>
            <Button style={{
              borderRadius: 6,
              backgroundColor: colors.primary,
              height: 40,
              width: '40%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
              textColor={colors.onPrimary}
              disabled={(mostrarAbertura) || aberturaEditar !== undefined}
              onPress={() => handleGuardar()}
            >Editar
            </Button>
            <View></View>
            <Button
              style={{
                backgroundColor: colors.surfaceVariant,
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
            >Cancelar
            </Button>
          </View>
        ) : null
        }
      </View>

      <FAB
        icon="plus"
        color={colors.onSecondary}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          backgroundColor: colors.secondary,
          width: 60,
          height: 60,
          margin: 16,
          right: 0,
          bottom: 0,
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

      {
        mostrarAbertura ? (
          <AgregarAbertura
            handleDone={handleComfirmarCreacion}
            ref={dropdownRef}
            handleClose={handleClose}
            visible={mostrarAbertura}
            hideModal={() => setAgregarCerrado(true)}
            id_col_anterior={getUltimoColorUsado()}
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
        initialPresupuesto={mostrarPresupuesto.nuevoPresu}
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
          const aberturaSelec = presupuesto?.ventanas?.find(v => v?.id === showEliminar?.id);
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
          <Dialog visible={alert} onDismiss={() => setAlert(false)} >
            <Dialog.Icon icon="alert" color={colors.error} />
            <Dialog.Title style={{ textAlign: 'center', fontSize: 16 }}>Debes insertar un nombre de Cliente</Dialog.Title>
          </Dialog>
        ) : null
      }
    </View >
  );
}

const styles = StyleSheet.create({
  getStartedContainer: {
    flexDirection: 'column',
    flex: 1,
    minHeight: '100%',
  },
  input: {
    width: '90%',
    height: 40,
    marginTop: 40,
    alignSelf: 'center', // Centrar horizontalmente
  },
  label: {
    fontSize: 16,
    color: Colors.colors.text,
  },
  mensajeTexto: {
    textAlign: 'center',
  },
  leftIconContainer: {
    justifyContent: 'center',
    paddingLeft: 15,
    alignItems: 'center'
  },
  rightIconContainer: {
    flexDirection: 'row',
    marginHorizontal: 0,
    paddingHorizontal: 0,
    right: -5,
    gap: 10,
  },
  actionButton: {
    alignItems: 'stretch'
  },
});
