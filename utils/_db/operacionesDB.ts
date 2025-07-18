import { AberturaPresupuestoOption, ColorOption, CortinaOption, PerfilesOption, PreciosVariosOption, PresupuestosOption, SerieOption, SerieOptionDefault } from "../constants/interfases";
import { cortinasEnum, DATABASE_NAME, PerfilesEnum, preciosVariosEnum, Tablas } from "../constants/variablesGlobales";
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync(DATABASE_NAME);


export const insertarPresupuestoConItems = async (
    presupuesto: PresupuestosOption,
): Promise<PresupuestosOption> => {
    try {

        let presupuesto_result: PresupuestosOption = { ...presupuesto, fecha: new Date() };
        await db.withExclusiveTransactionAsync(async (txn) => {
            // 1. Insertar el presupuesto

            const presupuestoResult = await txn.runAsync(
                `INSERT INTO ${Tablas.presupuestos} (nombre_cliente, fecha, precio_total) 
                VALUES (?, ?, ?);
            `, [presupuesto_result.nombre_cliente, presupuesto_result.fecha.toISOString(), presupuesto_result.precio_total]);

            const presupuestoId = presupuestoResult.lastInsertRowId as number;
            presupuesto_result = { ...presupuesto_result, id: presupuestoId };
            let ventanas_agregadas: AberturaPresupuestoOption[] = [];
            // 2. Insertar todos los items asociados
            for (const ventana of presupuesto.ventanas) {
                let result = await txn.runAsync(`
                    INSERT INTO ${Tablas.aberturaPresupuesto} 
                    (id_presupuesto, ancho, alto, tipo_abertura, id_color_aluminio, id_serie, id_cortina ,vidrio, mosquitero, cantidad, precio_unitario) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                `, [
                    presupuestoId,
                    ventana.ancho,
                    ventana.alto,
                    ventana.tipo_abertura,
                    ventana.id_color_aluminio,
                    ventana.id_serie,
                    ventana.id_cortina ? ventana.id_cortina : null,
                    Number(ventana.vidrio),
                    Number(ventana.mosquitero),
                    ventana.cantidad,
                    ventana.precio_unitario
                ]);
                const idventana = result.lastInsertRowId;
                ventanas_agregadas = [...ventanas_agregadas, { ...ventana, id: idventana }];
            }
            presupuesto_result.ventanas = ventanas_agregadas;
            // Devolver el presupuesto con el ID asignado
        });

        return presupuesto_result;
    } catch (error) {
        console.error('Error en transacción:', error);
        throw error;
    }
};

export async function insertAbertura(abertura: AberturaPresupuestoOption, presupuestoId: number) {
    let result = await db.runAsync(`
                    INSERT INTO ${Tablas.aberturaPresupuesto} 
                    (id_presupuesto, ancho, alto, tipo_abertura, id_color_aluminio, id_serie, id_cortina ,vidrio, mosquitero, cantidad, precio_unitario) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                `, [
        presupuestoId,
        abertura.ancho,
        abertura.alto,
        abertura.tipo_abertura,
        abertura.id_color_aluminio,
        abertura.id_serie,
        abertura.id_cortina || null,
        Number(abertura.vidrio),
        Number(abertura.mosquitero),
        abertura.cantidad,
        abertura.precio_unitario
    ]);
}

export async function getSeries(): Promise<SerieOption[]> {
    return await db.getAllAsync<SerieOption>(`SELECT * FROM ${Tablas.series}`);
}

export async function getSeriesByID(id_serie: string): Promise<SerieOption> {
    const result = await db.getFirstAsync<SerieOption>(`SELECT * FROM ${Tablas.series} WHERE id = ?`, [id_serie]);
    if (result === null) {
        throw new Error("El id del presupuesto no es valido");
    }
    return result;
}

export async function getColorAluminio(): Promise<ColorOption[]> {
    return await db.getAllAsync<ColorOption>(`SELECT * FROM ${Tablas.coloresAluminio}`);
}

export async function getCortinas(): Promise<CortinaOption[]> {
    return await db.getAllAsync<CortinaOption>(`SELECT * FROM ${Tablas.cortinas}`);
}

export async function getPerfiles(): Promise<PerfilesOption[]> {
    return await db.getAllAsync<PerfilesOption>(`SELECT * FROM ${Tablas.perfiles}`);
}

export async function getPreciosVarios(): Promise<PreciosVariosOption[]> {
    return await db.getAllAsync<PreciosVariosOption>(`SELECT * FROM ${Tablas.preciosVarios}`);
}

export async function getDolar(): Promise<number> {
    const result = await db.getFirstAsync<PreciosVariosOption>(`SELECT * FROM ${Tablas.preciosVarios} WHERE nombre = 'Dolar'`);
    if (result === null) {
        throw new Error("No se encontró el valor del Dólar en la base de datos");
    }
    return result.precio;
}

export async function getPresupuestos(): Promise<PresupuestosOption[]> {
    const result = await db.getAllAsync<PresupuestosOption>(`SELECT * FROM ${Tablas.presupuestos} ORDER BY fecha DESC`);
    return result.map((x: PresupuestosOption) => ({ ...x, fecha: new Date(x.fecha) }));
}

export async function getPresupuestoByID(id: number): Promise<PresupuestosOption> {
    try {
        // Obtener el presupuesto
        const presupuestoResult = await db.getFirstAsync<PresupuestosOption>(
            `SELECT id, nombre_cliente, fecha, precio_total 
            FROM ${Tablas.presupuestos} 
            WHERE id = ?`,
            [id]
        );

        if (presupuestoResult === null) {
            throw new Error("El id del presupuesto no es valido");
        }

        presupuestoResult.fecha = new Date(presupuestoResult.fecha);

        // Obtener las ventanas asociadas al presupuesto
        const ventanasResult = await db.getAllAsync<AberturaPresupuestoOption>(
            `SELECT id, ancho, alto, tipo_abertura, id_color_aluminio, id_serie, id_cortina, 
            vidrio, mosquitero, cantidad, precio_unitario
            FROM ${Tablas.aberturaPresupuesto} 
            WHERE id_presupuesto = ?`,
            [id]
        );

        const result: PresupuestosOption = {
            ...presupuestoResult,
            ventanas: ventanasResult
        };
        return result;
    } catch (error) {
        throw error;
    }
}

/* export interface SerieOption {
    nombre: string;
    id: number;
    precio_accesorios: number;
    serie_id_hereda: number | null;
} */
export const updateAccesorioPrecio = async (obj: SerieOption) => {
    console.log("Ejecutando UPDATE en BD con:", obj);
    await db.runAsync(`
            UPDATE ${Tablas.series} 
            SET precio_accesorios = ? 
            WHERE id = ?;
        `, [obj.precio_accesorios, obj.id]);
};

/* export interface PerfilesOption {
    id: number;
    nombre: string;
    gramos_por_m: number;
    serie_id: number;
} */
export const updatePerfilGramos = async (obj: PerfilesOption) => {
    console.log('entro o no')
    await db.runAsync(`
            UPDATE ${Tablas.perfiles} 
            SET gramos_por_m = ? 
            WHERE id = ?;
        `, [obj.gramos_por_m, obj.id]);
};

export const updatePrecioColor = async (obj: ColorOption) => {
    await db.runAsync(`
            UPDATE ${Tablas.coloresAluminio} 
            SET precio = ? 
            WHERE id = ?;
        `, [obj.precio, obj.id]);
};

export const updatePrecioPuerta = async (obj: ColorOption) => {
    await db.runAsync(`
            UPDATE ${Tablas.coloresAluminio} 
            SET precio_un_puerta = ? 
            WHERE id = ?;
        `, [obj.precio_un_puerta, obj.id]);
};

/* export interface PreciosVariosOption {
    id: number;
    nombre: string;
    precio: number;
} */
export const updatePrecioVarios = async (objeto: PreciosVariosOption) => {
    await db.runAsync(`
            UPDATE ${Tablas.preciosVarios} 
            SET precio = ? 
            WHERE id = ?;
        `, [objeto.precio, objeto.id]);
};

export const updatePrecioCortina = async (objeto: CortinaOption) => {
    if (objeto && objeto.tipo != cortinasEnum.ninguna) {
        await db.runAsync(`
            UPDATE ${Tablas.cortinas} 
            SET preciom2 = ? 
            WHERE id = ?;
        `, [objeto.preciom2, objeto.id]);
    }
};

/* export interface AberturaPresupuestoOption {
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
} */

export const updateAbertura = async (objeto: AberturaPresupuestoOption) => {
    await db.runAsync(`
            UPDATE ${Tablas.aberturaPresupuesto} 
            SET 
                tipo_abertura = ?,
                ancho = ?,
                alto = ?,
                id_color_aluminio = ?,
                id_serie = ?,
                id_cortina = ?,
                mosquitero = ?,
                vidrio = ?,
                cantidad = ?,
                precio_unitario = ?
            WHERE id = ?;
        `, [
        objeto.tipo_abertura,
        objeto.ancho,
        objeto.alto,
        objeto.id_color_aluminio,
        objeto.id_serie,
        objeto.id_cortina || null,
        objeto.mosquitero ? 1 : 0,
        objeto.vidrio ? 1 : 0,
        objeto.cantidad,
        objeto.precio_unitario,
        objeto.id
    ]);
};

export const updateAberturaPresupuesto = async (presu_actualizado: PresupuestosOption, abertura_actualizada: AberturaPresupuestoOption) => {
    try {
        await db.withExclusiveTransactionAsync(async () => {
            await updateAbertura(abertura_actualizada);
            await updatePrecioTotalPresupuesto(presu_actualizado);
        });
    } catch (error) {
        console.error(`Error al modificar presupuesto`, error);
    }
}

export const updatePresupuesto = async (presu_actualizado: PresupuestosOption) => {
    try {
        await db.withExclusiveTransactionAsync(async () => {
            // Obtener el presupuesto actual de la base de datos
            const presuPrevio = await getPresupuestoByID(presu_actualizado.id);

            // Identificar aberturas que ya no están en el presupuesto actualizado (para eliminarlas)
            const aberturasAEliminar = presuPrevio.ventanas.filter(
                aberturaPrevia => !presu_actualizado.ventanas.some(
                    aberturaActualizada => aberturaActualizada.id === aberturaPrevia.id
                )
            );

            // Procesar eliminaciones
            for (const abertura of aberturasAEliminar) {
                await dropAbertura(presuPrevio, abertura);
            }

            // Procesar aberturas actualizadas o nuevas
            for (const abertura of presu_actualizado.ventanas) {
                const aberturaExistente = presuPrevio.ventanas.find(a => a.id === abertura.id);

                if (aberturaExistente) {
                    // Abertura existente - actualizar
                    await updateAbertura(abertura);
                } else {
                    // Nueva abertura - agregar
                    await insertAbertura(abertura, presuPrevio.id);
                }
            }

            await db.runAsync(`
                 UPDATE ${Tablas.presupuestos} 
                 SET precio_total = ?,
                    nombre_cliente = ? 
                 WHERE id = ?;
        `, [presu_actualizado.precio_total, presu_actualizado.nombre_cliente, presuPrevio.id]);
        });
    } catch (error) {
        console.error(`Error al modificar presupuesto`, error);
        throw error; // Es importante propagar el error para manejo externo
    }
}

export const updatePrecioTotalPresupuesto = async (objeto: PresupuestosOption) => {
    await db.runAsync(`
            UPDATE ${Tablas.presupuestos} 
            SET precio_total = ? 
            WHERE id = ?;
        `, [objeto.precio_total, objeto.id]);
};

export const buscarPresupuestosNombre = async (searchText: string): Promise<PresupuestosOption[]> => {
    const resultados = await db.getAllAsync<PresupuestosOption>(
        `SELECT * FROM ${Tablas.presupuestos} 
         WHERE nombre_cliente LIKE ? 
         ORDER BY fecha DESC`,
        [`%${searchText}%`]
    );
    return resultados.map((x: PresupuestosOption) => ({ ...x, fecha: new Date(x.fecha) }));
};

async function calcularPrecioVidrio(
    altoV: number,
    anchoV: number,
): Promise<number> {
    try {
        const vidrio = await db.getFirstAsync<PreciosVariosOption>(`SELECT * FROM ${Tablas.preciosVarios} WHERE nombre = ?`, [preciosVariosEnum.vidrio]);

        // Manejar el caso donde vidrio o vidrio.precio es undefined
        const precioUnitario = vidrio?.precio ?? 0;

        const areaVidrio = (altoV * anchoV) / 10000;
        const precioTotalVidrio = areaVidrio * precioUnitario;

        // Verificar si es NaN antes de usar
        if (isNaN(precioTotalVidrio)) {
            return 0;
        }

        return precioTotalVidrio;
    } catch (error) {
        console.error('Error al calcular precio del vidrio:', error);
        return 0;
    }
}

async function calcularPrecioMosquitero(
    altoV: number,
    anchoV: number,
): Promise<number> {
    try {
        const mosquitero = await db.getFirstAsync<PreciosVariosOption>(`SELECT * FROM ${Tablas.preciosVarios} WHERE nombre = 'Mosquitero'`);
        // Manejar el caso donde vidrio o vidrio.precio es undefined
        const precioUnitario = mosquitero?.precio ?? 0;
        const areaMosquitero = (altoV * anchoV) / 10000;
        const precioTotalMosquitero = areaMosquitero * precioUnitario;
        // Verificar si es NaN antes de usar toFixed
        if (isNaN(precioTotalMosquitero)) {
            return 0;
        }
        return precioTotalMosquitero;
    } catch (error) {
        console.error('Error al calcular precio del vidrio:', error);
        return 0;
    }
}


export async function determinarPerfiles(serie: SerieOption): Promise<PerfilesOption[]> {
    const result = await db.getAllAsync<PerfilesOption>(`
        -- Perfiles directos
        SELECT * 
        FROM ${Tablas.perfiles} 
        WHERE serie_id = ?
        
        UNION ALL
        
        -- Perfiles heredados (sin duplicados por nombre)
        SELECT p.* 
        FROM ${Tablas.perfiles} p
        WHERE p.serie_id = ? 
        AND p.nombre NOT IN (
            SELECT nombre 
            FROM ${Tablas.perfiles} 
            WHERE serie_id = ?
        )
    `,
        [serie.id, serie.serie_id_hereda, serie.id]);

    return result || [];
}


async function calculoPesoVentana(
    anchoV: number,
    altoV: number,
    serie: SerieOption,
): Promise<number> {

    const perfilesDeLaSerie = await determinarPerfiles(serie);
    if (!perfilesDeLaSerie) throw new Error('Serie no válida');

    let pesoTotal = 0;
    perfilesDeLaSerie.map(perfil => {
        let longitudPerfil = 0;

        if (perfil.nombre === PerfilesEnum.MarcoSuperior ||
            perfil.nombre === PerfilesEnum.MarcoInferior ||
            perfil.nombre === PerfilesEnum.HojaSuperior ||
            perfil.nombre === PerfilesEnum.HojaInferior) {
            longitudPerfil = anchoV / 100;
        }
        if (perfil.nombre === PerfilesEnum.MarcoLateral || perfil.nombre === PerfilesEnum.HojaLateral) {
            longitudPerfil = (2 * altoV) / 100;
        }
        if (serie.id === 2) {
            if (perfil.nombre === PerfilesEnum.HojaEngancheCentral) {
                longitudPerfil = (2 * altoV) / 100;
            }
        }
        if (serie.id === 3) {
            if (perfil.nombre === PerfilesEnum.HojaEngancheCentral) {
                longitudPerfil = (4 * altoV) / 100;
            }
        }
        if (perfil.nombre === PerfilesEnum.Contravidrio) {
            longitudPerfil = ((2 * altoV) + (2 * anchoV)) / 100;
        }
        if (perfil.nombre === PerfilesEnum.MarcoFijo) {
            longitudPerfil = ((2 * altoV) + (2 * anchoV)) / 100;
        }

        const pesoTemp = longitudPerfil * perfil.gramos_por_m;
        pesoTotal += pesoTemp;
    })

    return pesoTotal;
}

async function calcularPrecioColor(
    color_id: number,
    peso_aluminio: number
): Promise<number> {
    const precioColor = await db.getFirstAsync<ColorOption>(
        `SELECT * FROM ${Tablas.coloresAluminio} WHERE id = ?`
        , [color_id]);
    if (peso_aluminio <= 0) throw new Error('El peso debe ser mayor que cero');
    if (!precioColor) throw new Error('No se encontro el color buscado');

    const pesoKilo = peso_aluminio / 1000; // Convertir a kilos
    const precioTotal = pesoKilo * precioColor.precio;

    return precioTotal;
}

async function calcularPrecioCortina(ancho: number, alto: number, id_cortina: number): Promise<number> {
    if (id_cortina === -1) return 0;
    const areaCortina = (ancho / 100 * alto / 100);
    const cortinaSeleccionada = await db.getFirstAsync<CortinaOption>(
        `SELECT * FROM ${Tablas.cortinas} WHERE id = ?`, [id_cortina]);
    if (cortinaSeleccionada?.preciom2 === null) return 0;
    const precioUnitario = cortinaSeleccionada?.preciom2 ?? 0;
    return precioUnitario * areaCortina;
}


export async function calcularPrecioVentana(
    ventana: AberturaPresupuestoOption,
): Promise<number> {
    try {
        // Validación básica de inputs
        if (typeof ventana.alto !== 'number' || typeof ventana.ancho !== 'number' || ventana.alto <= 0 || ventana.ancho <= 0) {
            throw new Error('Dimensiones de ventana inválidas');
        }
        const serieVentana = (await getSeries()).find(s => s.id === ventana.id_serie) ?? SerieOptionDefault;
        const pesoPerfiles = await calculoPesoVentana(ventana.ancho, ventana.alto, serieVentana);
        const precioAluminioColor = await calcularPrecioColor(ventana.id_color_aluminio, pesoPerfiles);

        let precioVidrio = 0;
        let precioMosquitero = 0;

        if (ventana.vidrio) {
            precioVidrio = await calcularPrecioVidrio(ventana.alto, ventana.ancho);
        }

        if (ventana.mosquitero) {
            precioMosquitero = await calcularPrecioMosquitero(ventana.alto, ventana.ancho);
        }

        const precioCortina = await calcularPrecioCortina(ventana.ancho, ventana.alto, ventana.id_cortina ?? -1);

        // Obtención de datos adicionales con valores por defecto
        const serieAccesorio = await db.getFirstAsync<SerieOption>(
            `SELECT * FROM ${Tablas.series} WHERE id = ?`,
            [ventana.id_serie]
        ) || { precio_accesorios: 0 }; // Valor por defecto

        const varioManoObra = await db.getFirstAsync<PreciosVariosOption>(
            `SELECT * FROM ${Tablas.preciosVarios} WHERE nombre = ?`
            , [preciosVariosEnum.manoDeObra]) || { precio: 1 }; // Valor por defecto 1 si no existe

        // Cálculo final con protección contra NaN
        const sumaComponentes = precioAluminioColor + precioVidrio + precioMosquitero + (serieAccesorio.precio_accesorios || 0) + precioCortina;
        const factorGanancia = varioManoObra.precio || 1;
        const manoObra = (factorGanancia + 100) / 100;

        const precioFinal = sumaComponentes * manoObra;

        if (isNaN(precioFinal)) {
            throw new Error('El cálculo del precio final resultó en NaN');
        }
        return precioFinal;
    } catch (error) {
        console.error('Error en calcularPrecioVentana:', error);
        return 0;
    }
}

export async function dropPresupuesto(presupuesto: PresupuestosOption): Promise<void> {
    try {
        await db.withExclusiveTransactionAsync(async () => {
            await db.runAsync(
                `DELETE FROM ${Tablas.aberturaPresupuesto} WHERE id_presupuesto = ?`,
                [presupuesto.id]
            );

            // Eliminar el presupuesto principal
            const result = await db.runAsync(
                `DELETE FROM ${Tablas.presupuestos} WHERE id = ?`,
                [presupuesto.id]
            );

            if (result.changes === 0) {
                throw new Error(`No se encontró el presupuesto con ID ${presupuesto.id}`);
            }
        });
    } catch (error) {
        console.error(`Error al eliminar el presupuesto ${presupuesto.id}:`, error);
        if (error instanceof Error) {
            throw new Error(`No se pudo eliminar el presupuesto: ${error.message}`);
        } else {
            throw new Error('No se pudo eliminar el presupuesto: error desconocido');
        }
    }
}

export async function dropAbertura(presupuesto: PresupuestosOption, abertura: AberturaPresupuestoOption): Promise<PresupuestosOption> {
    try {
        const valorAbertura = abertura.precio_unitario * abertura.cantidad;
        const nuevoPrecioTotal = presupuesto.precio_total - valorAbertura;

        await db.withExclusiveTransactionAsync(async () => {
            // Eliminar la abertura
            const resultAbertura = await db.runAsync(
                `DELETE FROM ${Tablas.aberturaPresupuesto} WHERE id_presupuesto = ? AND id = ?`,
                [presupuesto.id, abertura.id]
            );

            if (resultAbertura.changes === 0) {
                throw new Error(`No se encontró la abertura con ID ${abertura.id} en el presupuesto ${presupuesto.id}`);
            }

            // Actualizar el presupuesto principal
            const result = await db.runAsync(
                `UPDATE ${Tablas.presupuestos} 
                SET precio_total = ? 
                WHERE id = ?;`,
                [nuevoPrecioTotal, presupuesto.id]
            );

            if (result.changes === 0) {
                throw new Error(`No se pudo actualizar el presupuesto con ID ${presupuesto.id}`);
            }

        });
        // Devuelve el presupuesto actualizado con el nuevo precio total y sin la abertura eliminada
        return {
            ...presupuesto,
            precio_total: nuevoPrecioTotal,
            ventanas: presupuesto.ventanas.filter(v => v.id !== abertura.id)
        };

    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`No se pudo eliminar la abertura del presupuesto: ${error.message}`);
        }
        throw new Error('No se pudo eliminar la abertura del presupuesto: error desconocido');
    }
}