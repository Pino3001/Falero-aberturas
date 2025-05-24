import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';
import {
    getColorAluminio, getCortinas, getPerfiles, getPreciosVarios, getSeries,
    updateSeriePrecio,
    updatePerfilGramos,
    updatePrecioColor,
    updatePrecioVarios,
    initializeSeriesTable
} from '@/app/utils/utilsDB';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

const db = SQLite.openDatabaseSync('falero.db');
console.log('Database opened:', db);

export interface ColorOption {
    color: string;
    id: number;
    precio: number;
}

export interface CortinaOption {
    tipo: string;
    id: number;
    preciom2: number; // Precio por metro cuadrado
}

export interface SerieOption {
    nombre: string;
    id: number;
    precio_accesorios: number;
    serie_id_hereda: number | null;
}

export interface PerfilesOption {
    id: number;
    nombre: string;
    gramos_por_m: number;
    serie_id: number;
}


export interface PreciosVariosOption {
    id: number;
    nombre: string;
    precio: number;
}

interface BDContextType {
    getColorAluminio: () => Promise<ColorOption[]>,
    getSeries: () => Promise<SerieOption[]>,
    getCortinas: () => Promise<CortinaOption[]>
    getPerfiles: () => Promise<PerfilesOption[]>,
    getPreciosVarios: () => Promise<PreciosVariosOption[]>,
    updateSeriePrecio: (obj: SerieOption) => Promise<void>; // Añade esta línea
    updatePerfilGramos: (obj: PerfilesOption) => Promise<void>;
    updatePrecioColor: (obj: ColorOption) => Promise<void>;
    updatePrecioVarios: (obj: PreciosVariosOption) => Promise<void>;
    //obtenerKilajePerfil: (id:string, serie: string) => number;// gramos x metro
}

interface BDProviderProps {
    children: ReactNode;
}

export const BDContext = createContext<BDContextType>({
    getColorAluminio: async () => [],
    getSeries: async () => [],
    getCortinas: async () => [],
    getPerfiles: async () => [],
    getPreciosVarios: async () => [],
    updateSeriePrecio: async () => { },
    updatePerfilGramos: async () => { },
    updatePrecioColor: async () => { },
    updatePrecioVarios: async () => { },
});

// Define the state type explicitly
interface BDState {
    colors: ColorOption[];
    series: SerieOption[];
    perfiles: PerfilesOption[];
    cortina: CortinaOption[];
    preciosVarios: PreciosVariosOption[];
}

export const BDProvider: React.FC<BDProviderProps> = ({ children }) => {

    useEffect(() => {
        const loadData = async () => {
            try {
                // Inicializar todas las tablas
                await initializeSeriesTable();
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };
        loadData();
    }, []);


    // Provee todo el estado + la función de actualización
    return (
        <BDContext.Provider value={{
            getColorAluminio,
            getCortinas,
            getPerfiles,
            getPreciosVarios,
            getSeries,
            updateSeriePrecio,
            updatePerfilGramos,
            updatePrecioColor,
            updatePrecioVarios
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
