import { cortinasAbrevEnum, cortinasEnum, PerfilesEnum, seriesEnum } from "@/constants/variablesGlobales";
import { AberturaPresupuestoOption, CortinaOption, PerfilDimension, PerfilesOption, PerfilesOptionDefault, PerfilesSeries, PresupuestosOption, SerieOption } from "./interfases";
import { useState } from "react";
import { determinarPerfiles } from "./utilsDB";


interface aComprarProps {
    presupuestos: PresupuestosOption[]
    perfiles: PerfilesOption[],
    series: SerieOption[],
}


/* const calculoPerfilesAcomprar = async ({ presupuestos, perfiles, series }: aComprarProps) => {
    const perfilesPorSerie: Record<string, PerfilesSeries> = {};

    for (const presupuesto of presupuestos) {
        for (const ventana of presupuesto.ventanas) {
            const perfilesVentana = await determinarPerfiles(ventana.id_serie);
            const serieNombre = series.find(s => s.id === ventana.id_serie)?.nombre;

            if (!serieNombre) continue; // Si no hay serieNombre, saltar esta ventana

            for (const perfil of perfilesVentana) {
                let dimension_serie20 = -1;
                let dimension_serie25_2h = -1;
                let dimension_serie25_3h = -1;
                let dimension_serieA30 = -1;

                // Calcular dimensiones para cada serie
                if (serieNombre === seriesEnum.serie20) {
                    switch (perfil.nombre) {
                        case PerfilesEnum.MarcoSuperior:
                        case PerfilesEnum.MarcoInferior:
                            dimension_serie20 = ventana.ancho * ventana.cantidad;
                            break;
                        case PerfilesEnum.HojaLateral:
                            dimension_serie20 = 2 * ventana.alto * ventana.cantidad;
                            break;
                    }
                }
                else if (serieNombre === seriesEnum.serie25_2h) {
                    switch (perfil.nombre) {
                        case PerfilesEnum.MarcoSuperior:
                        case PerfilesEnum.MarcoInferior:
                        case PerfilesEnum.HojaSuperior:
                        case PerfilesEnum.HojaInferior:
                            dimension_serie25_2h = ventana.ancho * ventana.cantidad;
                            break;
                        case PerfilesEnum.HojaLateral:
                        case PerfilesEnum.HojaEngancheCentral:
                            dimension_serie25_2h = 2 * ventana.alto * ventana.cantidad;
                            break;
                    }
                }
                else if (serieNombre === seriesEnum.serie25_3h) {
                    switch (perfil.nombre) {
                        case PerfilesEnum.MarcoSuperior:
                        case PerfilesEnum.MarcoInferior:
                            dimension_serie25_3h = ventana.ancho * ventana.cantidad;
                            break;
                        case PerfilesEnum.HojaLateral:
                            dimension_serie25_3h = 2 * ventana.alto * ventana.cantidad;
                            break;
                        case PerfilesEnum.HojaInferior:
                        case PerfilesEnum.HojaSuperior:
                            dimension_serie25_2h = ventana.ancho * ventana.cantidad;
                            break;
                        case PerfilesEnum.HojaEngancheCentral:
                            dimension_serie25_2h = 2 * ventana.alto * ventana.cantidad;
                            break;
                    }
                }
                else if (serieNombre === seriesEnum.serieA30) {
                    switch (perfil.nombre) {
                        case PerfilesEnum.Contravidrio: 
                        case PerfilesEnum.MarcoFijo: 
                            dimension_serieA30 = ((ventana.ancho * 2) + (2 * ventana.alto)) * ventana.cantidad;
                            break;
                    }
                }

                // Determinar a qué serie asignar el perfil
                let serieAsignacion: seriesEnum | null = null;
                let dimensionFinal = 0;

                if (dimension_serie20 > 0) {
                    serieAsignacion = seriesEnum.serie20;
                    dimensionFinal = dimension_serie20;
                } 
                else if (dimension_serie25_2h > 0) {
                    serieAsignacion = seriesEnum.serie25_2h;
                    dimensionFinal = dimension_serie25_2h;
                } 
                else if (dimension_serie25_3h > 0) {
                    serieAsignacion = seriesEnum.serie25_3h;
                    dimensionFinal = dimension_serie25_3h;
                } 
                else if (dimension_serieA30 > 0) {
                    serieAsignacion = seriesEnum.serieA30;
                    dimensionFinal = dimension_serieA30;
                }

                // Si hay una serie asignada, agregar el perfil
                if (serieAsignacion) {
                    // Inicializar la serie si no existe
                    if (!perfilesPorSerie[serieAsignacion]) {
                        perfilesPorSerie[serieAsignacion] = {
                            serieNombre: serieAsignacion,
                            perfiles: []
                        };
                    }

                    // Buscar si el perfil ya existe
                    const perfilExistente = perfilesPorSerie[serieAsignacion].perfiles.find(
                        p => p.nombrePerfil === perfil.nombre
                    );

                    if (perfilExistente) {
                        perfilExistente.dimension += dimensionFinal;
                    } else {
                        perfilesPorSerie[serieAsignacion].perfiles.push({
                            nombrePerfil: perfil.nombre.toString(),
                            dimension: dimensionFinal
                        });
                    }
                }
            }
        }
    }

    return Object.values(perfilesPorSerie);
}; */

const calculoPerfilesAcomprar = async ({ presupuestos, series }: aComprarProps) => {
    const perfilesPorSerie: Record<string, PerfilesSeries> = {};
    
    // Pre-mapeo de series para acceso rápido
    const seriesMap = new Map(series.map(s => [s.id, s]));

    for (const presupuesto of presupuestos) {
        for (const ventana of presupuesto.ventanas) {
            const serie = seriesMap.get(ventana.id_serie);
            if (!serie) continue;

            const perfilesVentana = await determinarPerfiles(serie);
            const { ancho, alto, cantidad } = ventana;

            for (const perfil of perfilesVentana) {
                let dimension = 0;
                let serieAsignacion: seriesEnum | null = null;

                // Calcular dimensiones según serie y tipo de perfil
                switch (serie.nombre) {
                    case seriesEnum.serie20:
                        if ([PerfilesEnum.MarcoSuperior, PerfilesEnum.MarcoInferior].includes(perfil.nombre as PerfilesEnum)) {
                            dimension = ancho * cantidad;
                            serieAsignacion = seriesEnum.serie20;
                        } else if (perfil.nombre === PerfilesEnum.HojaLateral) {
                            dimension = 2 * alto * cantidad;
                            serieAsignacion = seriesEnum.serie20;
                        }
                        break;

                    case seriesEnum.serie25_2h:
                        if ([PerfilesEnum.MarcoSuperior, PerfilesEnum.MarcoInferior, 
                             PerfilesEnum.HojaSuperior, PerfilesEnum.HojaInferior].includes(perfil.nombre as PerfilesEnum)) {
                            dimension = ancho * cantidad;
                            serieAsignacion = seriesEnum.serie25_2h;
                        } else if ([PerfilesEnum.HojaLateral, PerfilesEnum.HojaEngancheCentral].includes(perfil.nombre as PerfilesEnum)) {
                            dimension = 2 * alto * cantidad;
                            serieAsignacion = seriesEnum.serie25_2h;
                        }
                        break;

                    case seriesEnum.serie25_3h:
                        if ([PerfilesEnum.MarcoSuperior, PerfilesEnum.MarcoInferior].includes(perfil.nombre as PerfilesEnum)) {
                            dimension = ancho * cantidad;
                            serieAsignacion = seriesEnum.serie25_3h;
                        } else if (perfil.nombre === PerfilesEnum.HojaLateral) {
                            dimension = 2 * alto * cantidad;
                            serieAsignacion = seriesEnum.serie25_3h;
                        } else if ([PerfilesEnum.HojaSuperior, PerfilesEnum.HojaInferior].includes(perfil.nombre as PerfilesEnum)) {
                            dimension = ancho * cantidad;
                            serieAsignacion = seriesEnum.serie25_2h; // Estos perfiles van a 25_2h
                        } else if (perfil.nombre === PerfilesEnum.HojaEngancheCentral) {
                            dimension = 2 * alto * cantidad;
                            serieAsignacion = seriesEnum.serie25_2h; // Este perfil va a 25_2h
                        }
                        break;

                    case seriesEnum.serieA30:
                        if ([PerfilesEnum.Contravidrio, PerfilesEnum.MarcoFijo].includes(perfil.nombre as PerfilesEnum)) {
                            dimension = ((ancho * 2) + (2 * alto)) * cantidad;
                            serieAsignacion = seriesEnum.serieA30;
                        }
                        break;
                }

                if (dimension <= 0 || !serieAsignacion) continue;

                // Inicializar la serie si no existe
                if (!perfilesPorSerie[serieAsignacion]) {
                    perfilesPorSerie[serieAsignacion] = {
                        serieNombre: serieAsignacion,
                        perfiles: []
                    };
                }

                // Buscar o crear el perfil
                const perfilExistente = perfilesPorSerie[serieAsignacion].perfiles.find(
                    p => p.nombrePerfil === perfil.nombre.toString()
                );

                if (perfilExistente) {
                    perfilExistente.dimension += dimension;
                } else {
                    perfilesPorSerie[serieAsignacion].perfiles.push({
                        nombrePerfil: perfil.nombre.toString(),
                        dimension
                    });
                }
            }
        }
    }

    return Object.values(perfilesPorSerie);
};



export const abreviarCortina = (cortina_id: number, cortinas: CortinaOption[]): cortinasAbrevEnum => {
    const cortinaSeleccionada = cortinas.find(s => s.id === cortina_id);
    if (cortinaSeleccionada) {
        if (cortinaSeleccionada.tipo === cortinasEnum.cortinapanelaluminioH25) return cortinasAbrevEnum.cortinapanelaluminioH25;
        else if (cortinaSeleccionada.tipo === cortinasEnum.cortinapvch25) return cortinasAbrevEnum.cortinapvch25;
        else if (cortinaSeleccionada.tipo === cortinasEnum.monoblockconpanelaluminio) return cortinasAbrevEnum.monoblockconpanelaluminio;
        else if (cortinaSeleccionada.tipo === cortinasEnum.monoblockenpvc) return cortinasAbrevEnum.monoblockenpvc;
    }
    return cortinasAbrevEnum.ninguna;

}