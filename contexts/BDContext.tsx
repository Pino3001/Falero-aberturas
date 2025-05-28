import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';
import {
    updatePerfilGramos,
    updatePrecioColor,
    updatePrecioVarios,
    insertarPresupuestoConItems,
    initializeSeriesTable,
    updateAccesorioPrecio
} from '@/app/utils/utilsDB';
import { AberturasEnum } from '@/constants/variablesGlobales';
import { ColorOption, CortinaOption, PerfilesOption, PreciosVariosOption, PresupuestosOption, SerieOption } from '@/app/utils/interfases';

const db = SQLite.openDatabaseAsync('falero.db');
console.log('Database opened:', db);


interface BDContextType {
    stateBD: BDState;
    presupuestosUltimaAct: Date;
    updatePerfilGramosBDContext: (obj: PerfilesOption) => Promise<void>;
    updatePrecioColorBDContext: (obj: ColorOption) => Promise<void>;
    updatePrecioVariosBDContext: (obj: PreciosVariosOption) => Promise<void>;
    insertarPresupuestoConItemsBDContext: (obj: PresupuestosOption) => Promise<PresupuestosOption>;
    updateAccesorioPrecioBDContext: (serie: SerieOption) => Promise<void>;
    //obtenerKilajePerfil: (id:string, serie: string) => number;// gramos x metro
}

interface BDProviderProps {
    children: ReactNode;
}

export const BDContext = createContext<BDContextType>({
    stateBD: {
        colors: [],
        series: [],
        perfiles: [],
        cortinas: [],
        preciosVarios: [],
    },
    presupuestosUltimaAct: new Date(),
    updatePerfilGramosBDContext: async () => { },
    updatePrecioColorBDContext: async () => { },
    updatePrecioVariosBDContext: async () => { },
    insertarPresupuestoConItemsBDContext: async () => {
        throw new Error('insertarPresupuestoConItemsBDContext not implemented');
    },
    updateAccesorioPrecioBDContext: async () => {
        throw new Error('updateAccesorioPrecioBDContext not implemented');
    },
});

// Define the state type explicitly
export interface BDState {
    colors: ColorOption[];
    series: SerieOption[];
    perfiles: PerfilesOption[];
    cortinas: CortinaOption[];
    preciosVarios: PreciosVariosOption[];
}

export const BDProvider: React.FC<BDProviderProps> = ({ children }) => {
    const [presupuestosUltimaAct, setPresupuestosUltimaAct] = useState(new Date());
    const [stateBD, setStateBD] = useState<BDState>({
        colors: [],
        series: [],
        perfiles: [],
        cortinas: [],
        preciosVarios: [],
    });
    useEffect(() => {
        const loadData = async () => {
            try {
                // Inicializar todas las tablas
                const initializedState = await initializeSeriesTable();
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
            const index = prevState.colors.findIndex(item => item.id === precioColor.id);
            if (index === -1) return prevState; // No se encontró el elemento
            return {
                ...prevState,
                colors:
                    [
                        ...prevState.colors.slice(0, index),
                        { ...prevState.colors[index], ...precioColor },
                        ...prevState.colors.slice(index + 1)
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
            updateAccesorioPrecioBDContext

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
