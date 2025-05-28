import { AberturasEnum } from "@/constants/variablesGlobales";

export interface ColorOption {
    color: string;
    id: number;
    precio: number;
}


export const ColorOptionDefault: ColorOption = { color: "", id: -1, precio: -1 }

export interface CortinaOption {
    tipo: string;
    id: number;
    preciom2: number | null; // Precio por metro cuadrado
}
export const CortinaOptionDefault: CortinaOption = { tipo: "", id: -1, preciom2: -1 };

export interface SerieOption {
    nombre: string;
    id: number;
    precio_accesorios: number;
    serie_id_hereda: number | null;
}

export const SerieOptionDefault: SerieOption = { nombre: "", id: -1, precio_accesorios: -1, serie_id_hereda: null }

export interface PerfilesOption {
    id: number;
    nombre: string;
    gramos_por_m: number;
    serie_id: number;
}

export const PerfilesOptionDefault: PerfilesOption = { nombre: "", id: -1, gramos_por_m: -1, serie_id: -1 }

export interface PreciosVariosOption {
    id: number;
    nombre: string;
    precio: number;
}

export const PreciosVariosOptionDefault: PreciosVariosOption = { nombre: "", id: -1, precio: -1 }


export interface PresupuestosOption {
    id: number;
    nombre_cliente: string;
    fecha: Date;
    ventanas: AberturaPresupuestoOption[],
    precio_total: number;
}

export const PresupuestosOptionDefault: PresupuestosOption = { id: -1, nombre_cliente: '', fecha: new Date(), precio_total: -1, ventanas: [] }

export interface AberturaPresupuestoOption {
    id: number;
    ancho: number;
    tipo_abertura: AberturasEnum;
    alto: number;
    id_color_aluminio: number;
    id_serie: number;
    id_cortina?: number;
    vidrio: boolean;
    mosquitero: boolean;
    cantidad: number;
    precio_unitario: number;
}