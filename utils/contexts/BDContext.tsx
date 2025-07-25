import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { initializeDatabase } from '@/utils/_db/utilsDB';
import { AberturaPresupuestoOption, ColorOption, CortinaOption, PerfilesOption, PreciosVariosOption, PresupuestosOption, SerieOption } from '@/utils/constants/interfases';
import { dropAbertura, dropPresupuesto, insertarPresupuestoConItems, updateAbertura, updateAberturaPresupuesto, updateAccesorioPrecio, updatePerfilGramos, updatePrecioColor, updatePrecioCortina, updatePrecioPuerta, updatePrecioTotalPresupuesto, updatePrecioVarios, updatePresupuesto } from '@/utils/_db/operacionesDB';


interface BDContextType {
    stateBD: BDState;
    presupuestosUltimaAct: Date;
    updatePerfilGramosBDContext: (obj: PerfilesOption) => Promise<void>;
    updatePrecioColorBDContext: (obj: ColorOption) => Promise<void>;
    updatePrecioVariosBDContext: (obj: PreciosVariosOption) => Promise<void>;
    updatePrecioCortinaBDContext: (obj: CortinaOption) => Promise<void>;
    updatePrecioPuertaBDContext: (obj: ColorOption) => Promise<void>;
    insertarPresupuestoConItemsBDContext: (obj: PresupuestosOption) => Promise<PresupuestosOption>;
    updateAccesorioPrecioBDContext: (serie: SerieOption) => Promise<void>;
    dropPresupuestoBDContext: (obj: PresupuestosOption) => Promise<void>;
    dropAberturaBDContext: (presupuesto: PresupuestosOption, abertura: AberturaPresupuestoOption) => Promise<PresupuestosOption>;
    updateAberturaPresupuestoBDContext: (presu_actualizado: PresupuestosOption, abertura_actualizada: AberturaPresupuestoOption) => Promise<PresupuestosOption>;
    updatePresupuestoBDContext: (presu_actualizado: PresupuestosOption) => Promise<PresupuestosOption>;
    //obtenerKilajePerfil: (id:string, serie: string) => number;// gramos x metro
}

interface BDProviderProps {
    children: ReactNode;
}

export const BDContext = createContext<BDContextType>({
    stateBD: {
        acabado: [],
        series: [],
        perfiles: [],
        cortinas: [],
        preciosVarios: [],
    },
    presupuestosUltimaAct: new Date(),
    updatePerfilGramosBDContext: async () => { },
    updatePrecioColorBDContext: async () => { },
    updatePrecioVariosBDContext: async () => { },
    updatePrecioCortinaBDContext: async () => { },
    updatePrecioPuertaBDContext: async () => { },
    updateAberturaPresupuestoBDContext: async () => {
        throw new Error('updateAberturaPresupuestoBDContext not implemented');
    },
    insertarPresupuestoConItemsBDContext: async () => {
        throw new Error('insertarPresupuestoConItemsBDContext not implemented');
    },
    updateAccesorioPrecioBDContext: async () => {
        throw new Error('updateAccesorioPrecioBDContext not implemented');
    },
    dropPresupuestoBDContext: async () => {
        throw new Error('insertarPresupuestoConItemsBDContext not implemented');
    },
    dropAberturaBDContext: async () => {
        throw new Error('insertarPresupuestoConItemsBDContext not implemented');
    },
    updatePresupuestoBDContext: async () => {
        throw new Error('insertarPresupuestoConItemsBDContext not implemented');
    },
});

// Define the state type explicitly
export interface BDState {
    acabado: ColorOption[];
    series: SerieOption[];
    perfiles: PerfilesOption[];
    cortinas: CortinaOption[];
    preciosVarios: PreciosVariosOption[];
}

export const BDProvider: React.FC<BDProviderProps> = ({ children }) => {
    const [presupuestosUltimaAct, setPresupuestosUltimaAct] = useState(new Date());
    const [stateBD, setStateBD] = useState<BDState>({
        acabado: [],
        series: [],
        perfiles: [],
        cortinas: [],
        preciosVarios: [],
    });
    useEffect(() => {
        const loadData = async () => {
            try {
                // Inicializar todas las tablas
                const initializedState = await initializeDatabase();
                setStateBD(initializedState);
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };
        loadData();
    }, []);

    const insertarPresupuestoConItemsBDContext = async (
        presupuesto: PresupuestosOption,
    ): Promise<PresupuestosOption> => {
        const resultado = await insertarPresupuestoConItems(presupuesto);
        setPresupuestosUltimaAct(new Date());
        return resultado;
    }

    const dropPresupuestoBDContext = async (
        presupuesto: PresupuestosOption,
    ): Promise<void> => {
        const resultado = await dropPresupuesto(presupuesto);
        setPresupuestosUltimaAct(new Date());
        return resultado;
    }

    const dropAberturaBDContext = async (
        presupuesto: PresupuestosOption,
        abertura: AberturaPresupuestoOption
    ): Promise<PresupuestosOption> => {
        const resultado = await dropAbertura(presupuesto, abertura);
        setPresupuestosUltimaAct(new Date());
        return presupuesto;
    }

    const updateAccesorioPrecioBDContext = async (serie: SerieOption) => {
        await updateAccesorioPrecio(serie);
        setStateBD(prevState => {
            const index = prevState.series.findIndex(item => item.id === serie.id);
            if (index === -1) return prevState; // No se encontró el elemento
            return {
                ...prevState,
                series:
                    [
                        ...prevState.series.slice(0, index),
                        { ...prevState.series[index], ...serie },
                        ...prevState.series.slice(index + 1)
                    ]
            };
        });
    }

    const updatePrecioPuertaBDContext = async (acabado_props: ColorOption) => {
        await updatePrecioPuerta(acabado_props);
        setStateBD(prevState => {
            const index = prevState.acabado.findIndex(item => item.id === acabado_props.id);
            if (index === -1) return prevState; // No se encontró el elemento
            return {
                ...prevState,
                acabado:
                    [
                        ...prevState.acabado.slice(0, index),
                        { ...prevState.acabado[index], ...acabado_props },
                        ...prevState.acabado.slice(index + 1)
                    ]
            };
        });
    }


    const updatePrecioVariosBDContext = async (precioVario: PreciosVariosOption) => {
        await updatePrecioVarios(precioVario);
        setStateBD(prevState => {
            const index = prevState.preciosVarios.findIndex(item => item.id === precioVario.id);
            if (index === -1) return prevState; // No se encontró el elemento
            return {
                ...prevState,
                preciosVarios:
                    [
                        ...prevState.preciosVarios.slice(0, index),
                        { ...prevState.preciosVarios[index], ...precioVario },
                        ...prevState.preciosVarios.slice(index + 1)
                    ]
            };
        });
    }

    const updatePrecioColorBDContext = async (precioColor: ColorOption) => {
        await updatePrecioColor(precioColor);
        setStateBD(prevState => {
            const index = prevState.acabado.findIndex(item => item.id === precioColor.id);
            if (index === -1) return prevState; // No se encontró el elemento
            return {
                ...prevState,
                acabado:
                    [
                        ...prevState.acabado.slice(0, index),
                        { ...prevState.acabado[index], ...precioColor },
                        ...prevState.acabado.slice(index + 1)
                    ]
            };
        });
    }

    const updateAberturaPresupuestoBDContext = async (
        presu_actualizado: PresupuestosOption,
        abertura_actualizada: AberturaPresupuestoOption
    ): Promise<PresupuestosOption> => {
        await updateAberturaPresupuesto(presu_actualizado, abertura_actualizada);
        setPresupuestosUltimaAct(new Date());
        return presu_actualizado; // Devuelve el presupuesto ya actualizado
    };

    const updatePresupuestoBDContext = async (
        presu_actualizado: PresupuestosOption,
    ): Promise<PresupuestosOption> => {
        await updatePresupuesto(presu_actualizado);
        setPresupuestosUltimaAct(new Date());
        return presu_actualizado; // Devuelve el presupuesto ya actualizado
    };

    const updatePrecioCortinaBDContext = async (cortina: CortinaOption) => {
        await updatePrecioCortina(cortina);
        setStateBD(prevState => {
            const index = prevState.cortinas.findIndex(item => item.id === cortina.id);
            if (index === -1) return prevState; // No se encontró el elemento
            return {
                ...prevState,
                cortinas:
                    [
                        ...prevState.cortinas.slice(0, index),
                        { ...prevState.cortinas[index], ...cortina },
                        ...prevState.cortinas.slice(index + 1)
                    ]
            };
        });
    }

    const updatePerfilGramosBDContext = async (perfilGramos: PerfilesOption) => {
        await updatePerfilGramos(perfilGramos);
        setStateBD(prevState => {
            const index = prevState.perfiles.findIndex(item => item.id === perfilGramos.id);
            if (index === -1) return prevState; // No se encontró el elemento
            return {
                ...prevState,
                perfiles:
                    [
                        ...prevState.perfiles.slice(0, index),
                        { ...prevState.perfiles[index], ...perfilGramos },
                        ...prevState.perfiles.slice(index + 1)
                    ]
            };
        });
    }
    // Provee todo el estado + la función de actualización
    return (
        <BDContext.Provider value={{
            stateBD,
            presupuestosUltimaAct,
            updatePerfilGramosBDContext,
            updatePrecioColorBDContext,
            updatePrecioVariosBDContext,
            insertarPresupuestoConItemsBDContext,
            updateAccesorioPrecioBDContext,
            dropPresupuestoBDContext,
            updatePrecioCortinaBDContext,
            updatePrecioPuertaBDContext,
            updateAberturaPresupuestoBDContext,
            dropAberturaBDContext,
            updatePresupuestoBDContext

        }}>
            {children}
        </BDContext.Provider>
    );
};

export const useBD = () => {
    const context = useContext(BDContext);
    if (!context) throw new Error('useBD must be used within a BDContext');
    return context;
};  
