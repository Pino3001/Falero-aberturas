import React, { createContext, useContext, ReactNode, useState } from 'react';

export interface ColorOption {
    color: string;
    id: string;
}

export interface CortinaOption {
    tipo: string;
    id: string;
}

export interface SerieOption {
    nombre: string;
    id: string;
    precio_accesorios: number;
}

export interface Perfiles {
    perfil_id: string;
    nombre: string;
}

export interface PerfilesSerieOption {
    serie_id: string;
    perfil_id: string;
    gramos: number;
}

export interface ColorSerieOption {
    color_id: string;
    serie_id: string;
    precio_kilo: number;
}

export interface PreciosVarios {
    id: string;
    nombre: string;
    precio: number;
}

const preciosVarios: PreciosVarios[] = [
    { id: '1', nombre: 'Mano de obra', precio: 560 },
    { id: '2', nombre: 'Vidrio', precio: 55 },
    { id: '3', nombre: 'Mosquitero', precio: 100 },
];

const preciosSerieColor: ColorSerieOption[] = [
    { color_id: '1', serie_id: '1', precio_kilo: 100 },
    { color_id: '1', serie_id: '2', precio_kilo: 120 },
    { color_id: '1', serie_id: '3', precio_kilo: 150 },
    { color_id: '2', serie_id: '1', precio_kilo: 120 },
    { color_id: '2', serie_id: '2', precio_kilo: 140 },
    { color_id: '2', serie_id: '3', precio_kilo: 170 },
    { color_id: '3', serie_id: '1', precio_kilo: 140 },
    { color_id: '3', serie_id: '2', precio_kilo: 160 },
    { color_id: '3', serie_id: '3', precio_kilo: 190 },
    { color_id: '4', serie_id: '1', precio_kilo: 150 },
    { color_id: '4', serie_id: '2', precio_kilo: 170 },
    { color_id: '4', serie_id: '3', precio_kilo: 200 },
];
const colorData: ColorOption[] = [
    { color: 'Natural Anodizado', id: '1' },
    { color: 'Blanco', id: '2' },
    { color: 'Simil madera', id: '3' },
    { color: 'Anolock', id: '4' },
];

const serieData: SerieOption[] = [
    { nombre: 'SERIE 20', id: '1', precio_accesorios: 6300 },
    { nombre: 'SERIE 25 2H', id: '2', precio_accesorios: 7700 },
    { nombre: 'SERIE 25 3H', id: '3', precio_accesorios: 9000 },
];

const cortinaData: CortinaOption[] = [
    { tipo: 'Ninguna', id: '1' },
    { tipo: 'Cortina pvc H25', id: '2' },
    { tipo: 'Cortina panel aluminio H25', id: '3' },
];

const perfilesData: Perfiles[] = [
    { perfil_id: '1', nombre: 'Marco superior' },
    { perfil_id: '2', nombre: 'Marco inferior' },
    { perfil_id: '3', nombre: 'Marco lateral' },
    { perfil_id: '4', nombre: 'Hoja Superior' },
    { perfil_id: '5', nombre: 'Hoja inferior' },   
    { perfil_id: '6', nombre: 'Hoja lateral' },
    { perfil_id: '7', nombre: 'Hoja enganche c' },
];

const perfilesSerieData: PerfilesSerieOption[] = [
    {
        serie_id: serieData[0].id,
        perfil_id: '1',
        gramos: 972
    },
    {
        serie_id: serieData[0].id,
        perfil_id: '2',
        gramos: 978
    },
    {
        serie_id: serieData[0].id,
        perfil_id: '3',
        gramos: 669
    },
    {
        serie_id: serieData[0].id,
        perfil_id: '4',
        gramos: 492
    },
    {
        serie_id: serieData[0].id,
        perfil_id: '5',
        gramos: 666
    },
    {
        serie_id: serieData[0].id,
        perfil_id: '6',
        gramos: 580
    },
    {
        serie_id: serieData[0].id,
        perfil_id: '7',
        gramos: 557
    },
    {
        serie_id: serieData[1].id,
        perfil_id: '1',
        gramos: 972
    },
    {
        serie_id: serieData[1].id,
        perfil_id: '2',
        gramos: 978
    },
    {
        serie_id: serieData[1].id,
        perfil_id: '3',
        gramos: 669
    },
    {
        serie_id: serieData[1].id,
        perfil_id: '4',
        gramos: 492
    },
    {
        serie_id: serieData[1].id,
        perfil_id: '5',
        gramos: 666
    },
    {
        serie_id: serieData[1].id,
        perfil_id: '6',
        gramos: 580
    },
    {
        serie_id: serieData[1].id,
        perfil_id: '7',
        gramos: 557
    },
    {
        serie_id: serieData[2].id,
        perfil_id: '1',
        gramos: 972
    },
    {
        serie_id: serieData[2].id,
        perfil_id: '2',
        gramos: 978
    },
    {
        serie_id: serieData[2].id,
        perfil_id: '3',
        gramos: 669
    },
    {
        serie_id: serieData[2].id,
        perfil_id: '4',
        gramos: 492
    },
    {
        serie_id: serieData[2].id,
        perfil_id: '5',
        gramos: 666
    },
    {
        serie_id: serieData[2].id,
        perfil_id: '6',
        gramos: 580
    },
    {
        serie_id: serieData[2].id,
        perfil_id: '7',
        gramos: 557
    }
];

interface BDContextType {
    colors: ColorOption[];
    series: SerieOption[];
    cortina: CortinaOption[];
    perfiles: Perfiles[];
    perfilesSerie: PerfilesSerieOption[];
    preciosSerieColor: ColorSerieOption[];
    preciosVarios: PreciosVarios[];
    updateSeriePrecio: (serieId: string, nuevoPrecio: number) => void; // Añade esta línea
    updatePerfilGramos: (serieId: string, perfil_id: string, gramos: number) => void;
    updatePrecioSerieColor: (color_id: string, serie_id: string, nuevoPrecio: number) => void;
    updatePrecioVarios: (id: string, nuevoPrecio: number) => void;
}

interface BDProviderProps {
    children: ReactNode;
}

export const BDContext = createContext<BDContextType>({
    colors: [],
    series: [],
    cortina: [],
    perfiles: [],
    perfilesSerie: [],
    preciosSerieColor: [],
    preciosVarios: [],
    updateSeriePrecio: () => {},
    updatePerfilGramos: () => {},
    updatePrecioSerieColor: () => {},
    updatePrecioVarios: () => {},
  });

export const BDProvider: React.FC<BDProviderProps> = ({ children }) => {
    // Mueve el estado aquí dentro
    const [state, setState] = useState({
      colors: colorData,
      series: serieData,
      perfiles: perfilesData,
      perfilesSerie: perfilesSerieData,
      cortina: cortinaData,
      preciosSerieColor: preciosSerieColor,
      preciosVarios: preciosVarios,
    });
  
    // Añade esta función
    const updateSeriePrecio = (serieId: string, nuevoPrecio: number) => {
      setState(prev => ({
        ...prev,
        series: prev.series.map(serie => 
          serie.id === serieId 
            ? { ...serie, precio_accesorios: nuevoPrecio }
            : serie
        )
      }));
    };

    const updatePerfilGramos = (serieId: string, perfil_id: string, gramos: number) => {
        setState(prev => ({
            ...prev,
            perfilesSerie: prev.perfilesSerie.map(perfil => 
                perfil.serie_id === serieId && perfil.perfil_id === perfil_id
                ? { ...perfil, gramos: gramos }
                : perfil
            )
        }));
    };

    const updatePrecioSerieColor = (color_id: string, serie_id: string, nuevoPrecio: number) => {
        setState(prev => ({
            ...prev,
            preciosSerieColor: prev.preciosSerieColor.map(precio => 
                precio.color_id === color_id && precio.serie_id === serie_id
                ? { ...precio, precio_kilo: nuevoPrecio }
                : precio
            )
        }));
    };
    
    const updatePrecioVarios = (id: string, nuevoPrecio: number) => {
        setState(prev => ({
            ...prev,
            preciosVarios: prev.preciosVarios.map(precio => 
                precio.id === id ? { ...precio, precio: nuevoPrecio } : precio  
            )
        }));
    };
    
    // Provee todo el estado + la función de actualización
    return (
      <BDContext.Provider value={{ 
        ...state, 
        updateSeriePrecio,
        updatePerfilGramos,
        updatePrecioSerieColor,
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
