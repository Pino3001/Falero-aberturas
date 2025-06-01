import { ColorOption, CortinaOption, PerfilesOption, PreciosVariosOption, SerieOption } from "@/constants/interfases";
import { coloresEnum, cortinasEnum, PerfilesEnum, preciosVariosEnum, seriesEnum } from "@/constants/variablesGlobales";


export const preciosVariosData: PreciosVariosOption[] = [
    { id: -1, nombre: preciosVariosEnum.manoDeObra, precio: 30 },
    { id: -1, nombre: preciosVariosEnum.vidrio, precio: 40 },
    { id: -1, nombre: preciosVariosEnum.mosquitero, precio: 40 },
];


export const colorData: ColorOption[] = [
    { color: coloresEnum.naturalAnodizado, id: -1, precio: 10.1, precio_un_puerta: 1 },
    { color: coloresEnum.blanco, id: -1, precio: 10.8, precio_un_puerta: 2 },
    { color: coloresEnum.similMadera, id: -1, precio: 13.8, precio_un_puerta: 3 },
    { color: coloresEnum.anolock, id: -1, precio: 12.4, precio_un_puerta: 4 },
];

export const serieData: SerieOption[] = [
    { nombre: seriesEnum.serie20, id: 1, precio_accesorios: 35, serie_id_hereda: null },
    { nombre: seriesEnum.serie25_2h, id: 2, precio_accesorios: 35, serie_id_hereda: null },
    { nombre: seriesEnum.serie25_3h, id: 3, precio_accesorios: 40, serie_id_hereda: 2 },
    { nombre: seriesEnum.serieA30, id: 4, precio_accesorios: 0, serie_id_hereda: null }
];


export const cortinaData: CortinaOption[] = [
    { tipo: cortinasEnum.ninguna, id: -1, preciom2: null },
    { tipo: cortinasEnum.cortinapvch25, id: -1, preciom2: 87 },
    { tipo: cortinasEnum.cortinapanelaluminioH25, id: -1, preciom2: 43 },
    { tipo: cortinasEnum.monoblockenpvc, id: -1, preciom2: 110 },
    { tipo: cortinasEnum.monoblockconpanelaluminio, id: -1, preciom2: 160 },
];


export const perfilesData: PerfilesOption[] = [
    { id: -1, nombre: PerfilesEnum.MarcoSuperior, serie_id: 1, gramos_por_m: 972 },
    { id: -1, nombre: PerfilesEnum.MarcoInferior, serie_id: 1, gramos_por_m: 978 },
    { id: -1, nombre: PerfilesEnum.MarcoLateral, serie_id: 1, gramos_por_m: 669 },
    { id: -1, nombre: PerfilesEnum.MarcoSuperior, serie_id: 2, gramos_por_m: 972 },
    { id: -1, nombre: PerfilesEnum.MarcoInferior, serie_id: 2, gramos_por_m: 978 },
    { id: -1, nombre: PerfilesEnum.MarcoLateral, serie_id: 2, gramos_por_m: 669 },
    { id: -1, nombre: PerfilesEnum.HojaSuperior, serie_id: 2, gramos_por_m: 492 },
    { id: -1, nombre: PerfilesEnum.HojaInferior, serie_id: 2, gramos_por_m: 666 },
    { id: -1, nombre: PerfilesEnum.HojaLateral, serie_id: 2, gramos_por_m: 580 },
    { id: -1, nombre: PerfilesEnum.HojaEngancheCentral, serie_id: 2, gramos_por_m: 557 },
    { id: -1, nombre: PerfilesEnum.MarcoSuperior, serie_id: 3, gramos_por_m: 1463 },
    { id: -1, nombre: PerfilesEnum.MarcoInferior, serie_id: 3, gramos_por_m: 1364 },
    { id: -1, nombre: PerfilesEnum.MarcoLateral, serie_id: 3, gramos_por_m: 1528 },
    { id: -1, nombre: PerfilesEnum.MarcoFijo, serie_id: 4, gramos_por_m: 649 },
    { id: -1, nombre: PerfilesEnum.Contravidrio, serie_id: 4, gramos_por_m: 122 },
];