import { coloresEnum, cortinasAbrevEnum, cortinasEnum, PerfilesEnum, seriesEnum, seriesMostrarEnum } from "./constants/variablesGlobales";
import { AberturaPresupuestoOption, ColorOption, CortinaOption, PerfilesOption, PerfilesSeries, PresupuestosOption, SerieOption } from "./constants/interfases";
import { calcularPrecioVentana } from "./_db/operacionesDB";


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

/* const calculoPerfilesAcomprar = async ({ presupuestos, series }: aComprarProps) => {
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
}; */



export const abreviarCortina = (cortina_id: number, cortinas: CortinaOption[]): string => {
    const cortinaSeleccionada = cortinas.find(s => s.id === cortina_id);
    if (cortinaSeleccionada) {
        if (cortinaSeleccionada.tipo === cortinasEnum.cortinapanelaluminioH25) return 'con cortina ' + cortinasAbrevEnum.cortinapanelaluminioH25.toString();
        else if (cortinaSeleccionada.tipo === cortinasEnum.cortinapvch25) return 'con cortina ' + cortinasAbrevEnum.cortinapvch25.toString();
        else if (cortinaSeleccionada.tipo === cortinasEnum.monoblockconpanelaluminio) return 'con cortina ' + cortinasAbrevEnum.monoblockconpanelaluminio.toString();
        else if (cortinaSeleccionada.tipo === cortinasEnum.monoblockenpvc) return 'con cortina ' + cortinasAbrevEnum.monoblockenpvc.toString();
    }
    return cortinasAbrevEnum.ninguna;

}

export const abreviarSerie = (id_serie: number, series: SerieOption[]): string => {
    const serieSeleccionada = series.find(s => s.id === id_serie)
    if (serieSeleccionada?.nombre === seriesEnum.serie20) return ' ' + seriesMostrarEnum.serie20.toString()
    if (serieSeleccionada?.nombre === seriesEnum.serie25_2h) return ' ' + seriesMostrarEnum.serie25_2h.toString()
    if (serieSeleccionada?.nombre === seriesEnum.serie25_3h) return ' ' + seriesMostrarEnum.serie25_3h.toString()
    if (serieSeleccionada?.nombre === seriesEnum.serieA30) return ' ' + seriesMostrarEnum.serieA30.toString()
    return ''
}

export const abreviarPdf = (id_serie: number, series: SerieOption[], cortina_id: number, cortinas: CortinaOption[], mosquitero: boolean): string => {
    let text = abreviarSerie(id_serie, series);
    if (mosquitero) {
        if (abreviarCortina(cortina_id, cortinas) !== cortinasAbrevEnum.ninguna) {
            text += ', ' + abreviarCortina(cortina_id, cortinas) + ' y mosquitero';
        } else {
            text += ', con mosquitero'
        }
    } else {
        text += ', ' + abreviarCortina(cortina_id, cortinas);
    }
    return text;
}

export const compararAberturaColores = async (
    presupuesto_comparar: PresupuestosOption,
    colores_comparar: ColorOption[]
): Promise<PresupuestosOption[]> => {

    let lista: PresupuestosOption[] = [];

    for (const col_comparar of colores_comparar) {
        const nuevoPresupuesto = await copiarPresupuestoConNuevoColor(
            presupuesto_comparar,
            col_comparar.id
        );
        lista = [...lista, nuevoPresupuesto];
    }

    return lista;
};


async function copiarPresupuestoConNuevoColor(
    presupuestoOriginal: PresupuestosOption,
    nuevoColorId: number
): Promise<PresupuestosOption> {
    // Crear copias de las ventanas con el nuevo color y calcula sus precios
    const ventanasActualizadas = await Promise.all(
        presupuestoOriginal.ventanas.map(async (ventana) => {
            const ventanaConNuevoColor = {
                ...ventana,
                id_color_aluminio: nuevoColorId,
            };

            const nuevoPrecio = await calcularPrecioVentana(ventanaConNuevoColor);

            return {
                ...ventanaConNuevoColor,
                precio_unitario: nuevoPrecio,
            };
        })
    );

    // Calcular el nuevo precio_total
    const nuevoPrecioTotal = ventanasActualizadas.reduce(
        (total, ventana) => total + (ventana.cantidad * ventana.precio_unitario),
        0
    );

    // Presupuesto actualizado
    return {
        ...presupuestoOriginal,
        ventanas: ventanasActualizadas,
        precio_total: nuevoPrecioTotal,
    };
}

function determinarPerfiles(serie: SerieOption, perfiles: PerfilesOption[]): PerfilesOption[] {
    // Obtener perfiles directos de la serie
    const perfilesDirectos = perfiles.filter(p => p.serie_id === serie.id);

    // Obtener perfiles heredados (si existe serie padre)
    let perfilesHeredados: PerfilesOption[] = [];

    if (serie.serie_id_hereda) {
        // Nombres de perfiles directos para evitar duplicados
        const nombresDirectos = new Set(perfilesDirectos.map(p => p.nombre));

        perfilesHeredados = perfiles.filter(p =>
            p.serie_id === serie.serie_id_hereda &&
            !nombresDirectos.has(p.nombre)
        );
    }

    // Combinar ambos conjuntos
    return [...perfilesDirectos, ...perfilesHeredados];
}

export const kilosAluminio = (abertura: AberturaPresupuestoOption, series: SerieOption[], perfiles: PerfilesOption[]): number => {
    const serie = series.find(x => x.id == abertura.id_serie);

    if (!serie) return -1;

    const perfiles_serie = determinarPerfiles(serie, perfiles);

    if (!perfiles) return -1;

    if (serie.nombre === seriesEnum.serie20) return kilosAluminio_serie20(perfiles_serie, abertura);
    if (serie.nombre === seriesEnum.serie25_2h) return kilosAluminio_serie25_2H(perfiles_serie, abertura);
    if (serie.nombre === seriesEnum.serie25_3h) return kilosAluminio_serie25_3H(perfiles_serie, abertura);
    if (serie.nombre === seriesEnum.serieA30) return kilosAluminio_serie30(perfiles_serie, abertura);

    return -1;
}

const kilosAluminio_serie20 = (perfiles: PerfilesOption[], abertura: AberturaPresupuestoOption): number => {
    let g: number = 0;

    for (const p of perfiles) {
        if (p.nombre === PerfilesEnum.MarcoSuperior) {
            g += p.gramos_por_m * abertura.ancho;
        } else if (p.nombre === PerfilesEnum.MarcoInferior) {
            g += p.gramos_por_m * abertura.ancho;
        } else if (p.nombre === PerfilesEnum.MarcoLateral) {
            g += (p.gramos_por_m * abertura.alto) * 2;
        }
    }
    return g / 100000;
}

const kilosAluminio_serie25_2H = (perfiles: PerfilesOption[], abertura: AberturaPresupuestoOption): number => {
    let g: number = 0;

    for (const p of perfiles) {
        if (p.nombre === PerfilesEnum.MarcoSuperior) {
            g += p.gramos_por_m * abertura.ancho;
        } else if (p.nombre === PerfilesEnum.MarcoInferior) {
            g += p.gramos_por_m * abertura.ancho;
        } else if (p.nombre === PerfilesEnum.MarcoLateral) {
            g += (p.gramos_por_m * abertura.alto) * 2;
        } else if (p.nombre === PerfilesEnum.HojaInferior) {
            g += p.gramos_por_m * abertura.ancho;
        } else if (p.nombre === PerfilesEnum.HojaSuperior) {
            g += p.gramos_por_m * abertura.ancho;
        } else if (p.nombre === PerfilesEnum.HojaEngancheCentral) {
            g += (p.gramos_por_m * abertura.alto) * 2;
        } else if (p.nombre === PerfilesEnum.HojaLateral) {
            g += (p.gramos_por_m * abertura.alto) * 2;
        }
    }
    return g / 100000;
}

const kilosAluminio_serie25_3H = (perfiles: PerfilesOption[], abertura: AberturaPresupuestoOption): number => {
    let g: number = 0;

    for (const p of perfiles) {
        if (p.nombre === PerfilesEnum.MarcoSuperior) {
            g += p.gramos_por_m * abertura.ancho;
        } else if (p.nombre === PerfilesEnum.MarcoInferior) {
            g += p.gramos_por_m * abertura.ancho;
        } else if (p.nombre === PerfilesEnum.MarcoLateral) {
            g += (p.gramos_por_m * abertura.alto) * 2;
        } else if (p.nombre === PerfilesEnum.HojaInferior) {
            g += p.gramos_por_m * abertura.ancho;
        } else if (p.nombre === PerfilesEnum.HojaSuperior) {
            g += p.gramos_por_m * abertura.ancho;
        } else if (p.nombre === PerfilesEnum.HojaEngancheCentral) {
            g += (p.gramos_por_m * abertura.alto) * 4;
        } else if (p.nombre === PerfilesEnum.HojaLateral) {
            g += (p.gramos_por_m * abertura.alto) * 2;
        }
    }
    return g / 100000;
}

const kilosAluminio_serie30 = (perfiles: PerfilesOption[], abertura: AberturaPresupuestoOption): number => {
    let g: number = 0;

    for (const p of perfiles) {
        if (p.nombre === PerfilesEnum.Contravidrio) {
            g += p.gramos_por_m * (abertura.ancho + abertura.alto) * 2;
        } else if (p.nombre === PerfilesEnum.MarcoFijo) {
            g += p.gramos_por_m * (abertura.ancho + abertura.alto) * 2;
        }
    }
    return g / 100000;
}



/*   const buscarPerfil = (ventana: AberturaPresupuestoOption, perfil_nombre: string): PerfilesOption => {
    let perfilAux = perfiles.find(p => p.serie_id === ventana.id_serie && p.nombre === perfil_nombre);
    if (perfilAux)
      return perfilAux;
    else {
      const serie = series.find(x => x.id == ventana.id_serie);
      if (serie && serie.serie_id_hereda) {
        perfilAux = perfiles.find(p => p.serie_id === serie.serie_id_hereda && p.nombre === perfil_nombre)
        if (perfilAux)
          return perfilAux;
      }
    }
    return PerfilesOptionDefault;
  }
  */