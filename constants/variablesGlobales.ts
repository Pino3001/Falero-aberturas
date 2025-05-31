import { PerfilesOption } from "@/app/utils/interfases";


export enum PerfilesEnum {
    MarcoSuperior = "Marco superior",
    MarcoInferior = "Marco inferior",
    MarcoLateral = "Marco lateral",
    HojaSuperior = "Hoja superior",
    HojaInferior = "Hoja inferior",
    HojaLateral = "Hoja lateral",
    HojaEngancheCentral = "Hoja enganche central",
    MarcoFijo = 'Marco fijo',
    Contravidrio = 'Contravidrio'
}

export enum seriesEnum {
    serie20 = 'SERIE 20',
    serie25_2h = 'SERIE 25 2 Hojas',
    serie25_3h = 'SERIE 25 3 Hojas',
    serieA30 = 'SERIE A30'
}

export enum coloresEnum {
    naturalAnodizado = "Natural Anodizado",
    blanco = "Blanco",
    similMadera = "Simil madera",
    anolock = "Anolock"
}

export enum preciosVariosEnum {
    manoDeObra = "Mano de obra",
    vidrio = "Vidrio",
    mosquitero = "Mosquitero"
}

export const enum cortinasEnum {
    ninguna = 'Ninguna',
    cortinapvch25 = 'Cortina pvc H25',
    cortinapanelaluminioH25 = 'Cortina panel aluminio H25',
    monoblockenpvc = 'Monoblock en pvc',
    monoblockconpanelaluminio = 'Monoblock con panel aluminio',
}

export const enum Tablas {
    series = "series",
    coloresAluminio = "coloresAluminio",
    cortinas = "cortinas",
    perfiles = "perfiles",
    preciosVarios = "preciosVarios",
    presupuestos = "presupuestos",
    aberturaPresupuesto = "aberturaPresupuesto",
}

export enum AberturasEnum {
    ventana = 'Ventana',
    puertaVenta = 'Puerta Ventana',
    banderola = 'Banderola de baño',
    puerta = 'Puerta',
    panioFijo = 'Paño fijo'

}

export enum cortinasAbrevEnum {
    ninguna = '',
    cortinapvch25 = 'Pvc H25',
    cortinapanelaluminioH25 = 'Panel aluminio H25',
    monoblockenpvc = 'Monoblock pvc',
    monoblockconpanelaluminio = 'Monoblock aluminio',
}