import { BDState, ColorOption, CortinaOption, PerfilesOption, PreciosVariosOption, PresupuestosOption, SerieOption, VentanaPresupuestoOption } from '@/contexts/BDContext';
import { parse } from '@babel/core';
import * as SQLite from 'expo-sqlite';
import { coloresEnum, cortinasEnum, PerfilesEnum, preciosVariosEnum, seriesEnum, Tablas } from '../Data/variablesGlobales';
const db = SQLite.openDatabaseSync('falero.db');
console.log('Database opened:', db);





const preciosVariosData: PreciosVariosOption[] = [
    { id: -1, nombre: preciosVariosEnum.manoDeObra, precio: 30 },
    { id: -1, nombre: preciosVariosEnum.vidrio, precio: 40 },
    { id: -1, nombre: preciosVariosEnum.mosquitero, precio: 40 },
];


const colorData: ColorOption[] = [
    { color: coloresEnum.naturalAnodizado, id: -1, precio: 10.1 },
    { color: coloresEnum.blanco, id: -1, precio: 10.8 },
    { color: coloresEnum.similMadera, id: -1, precio: 13.8 },
    { color: coloresEnum.anolock, id: -1, precio: 12.4 },
];

const serieData: SerieOption[] = [
    { nombre: seriesEnum.serie20, id: 1, precio_accesorios: 35, serie_id_hereda: null },
    { nombre: seriesEnum.serie25_2h, id: 2, precio_accesorios: 35, serie_id_hereda: null },
    { nombre: seriesEnum.serie25_3h, id: 3, precio_accesorios: 40, serie_id_hereda: 2 },
];


const cortinaData: CortinaOption[] = [
    { tipo: cortinasEnum.ninguna, id: -1, preciom2: null },
    { tipo:cortinasEnum.cortinapvch25, id: -1, preciom2: 87 },
    { tipo: cortinasEnum.cortinapanelaluminioH25, id: -1, preciom2: 43 },
    { tipo: cortinasEnum.monoblockenpvc, id: -1, preciom2: 110 },
    { tipo: cortinasEnum.monoblockconpanelaluminio, id: -1, preciom2: 160 },
];


const perfilesData: PerfilesOption[] = [
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
];


export async function initializeSeriesTable(): Promise<BDState> {
    try {
        // --TABLA SERIES--
        /**
        *export interface SerieOption {
        nombre: string;
        id: number;
        precio_accesorios: number;
        serie_id_hereda: number | null;
        } */

        // Crear la tabla si no existe
        await db.execAsync(`
        CREATE TABLE IF NOT EXISTS ${Tablas.series} (
            id INTEGER PRIMARY KEY NOT NULL,
            nombre TEXT NOT NULL,
            precio_accesorios REAL NOT NULL DEFAULT 0,
            serie_id_hereda REAL,
            FOREIGN KEY (serie_id_hereda) REFERENCES ${Tablas.series} (id)  
      );
    `);
        console.log('Tabla series creada o ya existe');

        // Verificar si la tabla está vacía
        const resultSeries = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) as count FROM ${Tablas.series}`
        );
        // Maneja los null
        const count = resultSeries ? resultSeries.count : 0;
        // Insertar datos iniciales si la tabla está vacía
        if (count === 0) {

            serieData.map((serie: SerieOption) => {
                db.runSync(`
                            INSERT INTO ${Tablas.series} (id, nombre, precio_accesorios, serie_id_hereda) VALUES 
                            (?, ?, ?, ?);
                        `, [serie.id, serie.nombre, serie.precio_accesorios, serie.serie_id_hereda]);
            });
        } else {
            console.log("ya tengo al menos una serie");
        }

        // --TABLA COLORESALUMINIO--

        /*export interface ColorOption {
        color: string;
        id: number;
        precio: number; 
        } */

        await db.execAsync(`
        CREATE TABLE IF NOT EXISTS ${Tablas.coloresAluminio} (
            id INTEGER PRIMARY KEY NOT NULL,
            color TEXT NOT NULL,
            precio REAL NOT NULL
        );
       `);
        console.log('Tabla coloresAluminio creada o ya existe');
        // Verificar si la tabla está vacía
        const resultColores = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) as count FROM ${Tablas.coloresAluminio}`
        );
        console.log('resultColores', resultColores);
        // Maneja los null
        const countColores = resultColores ? resultColores.count : 0;
        // Insertar datos iniciales si la tabla está vacía
        if (countColores === 0) {
            colorData.map((color: ColorOption) => {
                db.runSync(`
                            INSERT INTO ${Tablas.coloresAluminio} (color, precio) VALUES 
                            (?, ?);
                        `, [color.color, color.precio]);
            });
        } else {
            console.log("ya tengo al menos una serie");
        }

        // --TABLA CORTINAS--
        /*
        export interface CortinaOption {
        tipo: string;
        id: number;
        preciom2: number; // Precio por metro cuadrado
        }
         */

        await db.execAsync(`
        CREATE TABLE IF NOT EXISTS ${Tablas.cortinas} (
            id INTEGER PRIMARY KEY NOT NULL,
            tipo TEXT NOT NULL,
            preciom2 REAL
        );
        `);

        // Verificar si la tabla está vacía
        const resultCortinas = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) as count FROM ${Tablas.cortinas}`
        );
        console.log('resultCortinas', resultCortinas);
        // Maneja los null
        const countCortinas = resultCortinas ? resultCortinas.count : 0;
        // Insertar datos iniciales si la tabla está vacía
        if (countCortinas === 0) {
            cortinaData.map((cortina: CortinaOption) => {
                db.runSync(`
                            INSERT INTO ${Tablas.cortinas} (tipo, preciom2) VALUES 
                            (?, ?);
                        `, [cortina.tipo, cortina.preciom2]);
            });
        } else {
            console.log("ya tengo al menos una serie");
        }

        // --TABLA PERFILES--

        /**
        export interface PerfilesSerieOption {
        serie_id: string;
        perfil_id: string;
        gramos_m2: number;
        } */

        await db.execAsync(`
        CREATE TABLE IF NOT EXISTS ${Tablas.perfiles} (
            id INTEGER PRIMARY KEY NOT NULL,
            nombre TEXT NOT NULL,
            serie_id INTEGER NOT NULL,
            gramos_por_m REAL NOT NULL,
            FOREIGN KEY (serie_id) REFERENCES ${Tablas.series} (id)
        );
        `)

        // Verificar si la tabla está vacía
        const resultPerfiles = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) as count FROM ${Tablas.perfiles}`
        );
        // Maneja los null
        const countPerfiles = resultPerfiles ? resultPerfiles.count : 0;

        console.log('resultPerfiles', resultPerfiles);
        // Insertar datos iniciales si la tabla está vacía
        if (countPerfiles === 0) {
            perfilesData.map((perfil: PerfilesOption) => {
                db.runSync(`
                            INSERT INTO ${Tablas.perfiles} (nombre, serie_id, gramos_por_m) VALUES 
                            (?, ?, ?);
                        `, [perfil.nombre, perfil.serie_id, perfil.gramos_por_m]);
            });
        } else {
            console.log("ya tengo al menos una serie");
        }

        // --TABLA PRECIOS VARIOS--
        /**
        export interface PreciosVarios {
        id: string;
        nombre: string;
        precio: number;
        }
        */

        await db.execAsync(`
        CREATE TABLE IF NOT EXISTS ${Tablas.preciosVarios} (
            id INTEGER PRIMARY KEY NOT NULL,
            nombre TEXT NOT NULL,
            precio REAL NOT NULL
        );
        `)
        // Verificar si la tabla está vacía
        const resultPreciosVarios = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) as count FROM ${Tablas.preciosVarios}`
        );

        console.log('resultPreciosVarios', resultPreciosVarios);
        // Maneja los null
        const countPereciosVarios = resultPreciosVarios ? resultPreciosVarios.count : 0;
        // Insertar datos iniciales si la tabla está vacía
        if (countPereciosVarios === 0) {
            preciosVariosData.map((varios: PreciosVariosOption) => {
                db.runSync(`
                            INSERT INTO ${Tablas.preciosVarios} ( nombre, precio) VALUES 
                            (?, ?);
                        `, [varios.nombre, varios.precio]);
            });
        } else {
            console.log("ya tengo al menos una serie");
        }


        /*         export interface PresupuestosOption {
                    id: number;
                    nombre_cliente: string;
                    fecha: Date;
                    ventanas: VentanaPresupuestoOption[],
                    precio_total: number;
                } */



        // --TABLA PRESUPUESTOS--
        await db.execAsync(`CREATE TABLE IF NOT EXISTS ${Tablas.presupuestos} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre_cliente TEXT NOT NULL,
            fecha TEXT NOT NULL,
            precio_total REAL NOT NULL);`
        );

        /* export interface VentanaPresupuestoOption {
            id: number;
            ancho: number;
            largo: number;
            id_color_aluminio: number;
            id_serie: number;
            vidrio: boolean;
            mosquitero: boolean;
            cantidad: number;
            precio: number;
        } */

        +        // --TABLA PRESUPUESTOS--
            await db.execAsync(`CREATE TABLE IF NOT EXISTS ${Tablas.ventanapresupuesto} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            id_presupuesto INTEGER NOT NULL,
            ancho INTEGER NOT NULL,
            alto INTEGER NOT NULL,
            id_color_aluminio INTEGER NOT NULL,
            id_serie INTEGER NOT NULL,
            id_cortina INTEGER,
            mosquitero INTEGER NOT NULL,
            vidrio INTEGER NOT NULL,
            cantidad INTEGER NOT NULL,
            precio_unitario REAL NOT NULL,
            FOREIGN KEY (id_color_aluminio) REFERENCES ${Tablas.coloresAluminio} (id),
            FOREIGN KEY (id_serie) REFERENCES ${Tablas.series} (id),
            FOREIGN KEY (id_cortina) REFERENCES ${Tablas.cortinas} (id),
            FOREIGN KEY (id_presupuesto) REFERENCES ${Tablas.presupuestos} (id));`
            );
        return {
            colors: await getColorAluminio(),
            cortinas: await getCortinas(),
            perfiles: await getPerfiles(),
            preciosVarios: await getPreciosVarios(),
            series: serieData,
        }
    }
    catch (error) {
        console.error('Error initializing series table:', error);
        throw error;
    }

}

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
            let ventanas_agregadas: VentanaPresupuestoOption[] = [];
            // 2. Insertar todos los items asociados
            for (const ventana of presupuesto.ventanas) {
                let result = await txn.runAsync(`
                    INSERT INTO ${Tablas.ventanapresupuesto} 
                    (id_presupuesto, ancho, alto, id_color_aluminio, id_serie, id_cortina ,vidrio, mosquitero, cantidad, precio_unitario) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                `, [
                    presupuestoId,
                    ventana.ancho,
                    ventana.alto,
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

async function getSeries(): Promise<SerieOption[]> {
    return await db.getAllAsync<SerieOption>(`SELECT * FROM ${Tablas.series}`);
}

export async function getSeriesByID(id_serie: string): Promise<SerieOption> {
    const result = await db.getFirstAsync<SerieOption>(`SELECT * FROM ${Tablas.series} WHERE id = ?`, [id_serie]);
    if (result === null) {
        throw new Error("El id del presupuesto no es valido");
    }
    return result;
}

async function getColorAluminio(): Promise<ColorOption[]> {
    return await db.getAllAsync<ColorOption>(`SELECT * FROM ${Tablas.coloresAluminio}`);
}

async function getCortinas(): Promise<CortinaOption[]> {
    return await db.getAllAsync<CortinaOption>(`SELECT * FROM ${Tablas.cortinas}`);
}

async function getPerfiles(): Promise<PerfilesOption[]> {
    return await db.getAllAsync<PerfilesOption>(`SELECT * FROM ${Tablas.perfiles}`);
}

async function getPreciosVarios(): Promise<PreciosVariosOption[]> {
    return await db.getAllAsync<PreciosVariosOption>(`SELECT * FROM ${Tablas.preciosVarios}`);
}

export async function getPresupuestos(): Promise<PresupuestosOption[]> {
    const result = await db.getAllAsync<PresupuestosOption>(`SELECT * FROM ${Tablas.presupuestos}`);
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
        const ventanasResult = await db.getAllAsync<VentanaPresupuestoOption>(
            `SELECT id, ancho, alto, id_color_aluminio, id_serie, id_cortina, 
            vidrio, mosquitero, cantidad, precio_unitario
            FROM ${Tablas.ventanapresupuesto} 
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
    await db.runAsync(`
            UPDATE ${Tablas.perfiles} 
            SET gramos_por_m = ? 
            WHERE AND id = ?;
        `, [obj.gramos_por_m, obj.id]);
};

export const updatePrecioColor = async (obj: ColorOption) => {
    await db.runAsync(`
            UPDATE ${Tablas.coloresAluminio} 
            SET precioKilo = ? 
            WHERE id = ?;
        `, [obj.precio, obj.id]);
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

async function calcularPrecioVidrio(
    altoV: number,
    anchoV: number,
): Promise<number> {
    try {
        const vidrio = await db.getFirstAsync<PreciosVariosOption>(`SELECT * FROM ${Tablas.preciosVarios} WHERE nombre = ?`,[preciosVariosEnum.vidrio]);

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

async function determinarPerfiles(serie_id: number): Promise<PerfilesOption[]> {
    let result = await db.getAllAsync<PerfilesOption>(
        `SELECT * FROM ${Tablas.perfiles} WHERE serie_id = ? `
        , [serie_id]);
    if (result) {
        return result;
    }
    else {
        result = await db.getAllAsync<PerfilesOption>(
            `SELECT * FROM ${Tablas.perfiles} p JOIN ${Tablas.series} s on p.serie_id = s.serie_id_hereda where s.id = ? `
            , [serie_id]);
        if (result) {
            return result;
        }
        return [];
    }
}

async function calculoPesoVentana(
    anchoV: number,
    altoV: number,
    serie_id: number,
): Promise<number> {

    const perfilesDeLaSerie = await determinarPerfiles(serie_id);
    console.log("perfilesDeLaSerie", perfilesDeLaSerie);
    if (!perfilesDeLaSerie) throw new Error('Serie no válida');

    let pesoTotal = 0;
    perfilesDeLaSerie.map(perfil => {
        let pesoPerfil = 0;
        if (perfil.nombre === PerfilesEnum.MarcoSuperior ||
            perfil.nombre === PerfilesEnum.MarcoInferior ||
            perfil.nombre === PerfilesEnum.HojaSuperior ||
            perfil.nombre === PerfilesEnum.HojaInferior) {
            pesoPerfil = anchoV / 100;
        }
        if (perfil.nombre === PerfilesEnum.MarcoLateral || perfil.nombre === PerfilesEnum.HojaLateral) {
            pesoPerfil = (2 * altoV) / 100;
        }
        if (serie_id === 2) {
            if (perfil.nombre === PerfilesEnum.HojaEngancheCentral) {
                pesoPerfil = (2 * altoV) / 100;
            }
        }
        if (serie_id === 3) {
            if (perfil.nombre === PerfilesEnum.HojaEngancheCentral) {
                pesoPerfil = (4 * altoV) / 100;
            }
        }
        const pesoTemp = pesoPerfil * perfil.gramos_por_m;
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
    ventana: VentanaPresupuestoOption,
): Promise<number> {
    try {
        // Validación básica de inputs
        if (typeof ventana.alto !== 'number' || typeof ventana.ancho !== 'number' || ventana.alto <= 0 || ventana.ancho <= 0) {
            throw new Error('Dimensiones de ventana inválidas');
        }
        console.log("ventana", ventana);

        const pesoPerfiles = await calculoPesoVentana(ventana.ancho, ventana.alto, ventana.id_serie);
        console.log("pesoPerfiles", pesoPerfiles);
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
        console.log('idCortina', ventana.id_cortina);

        // Obtención de datos adicionales con valores por defecto
        const serieAccesorio = await db.getFirstAsync<SerieOption>(
            `SELECT * FROM ${Tablas.series} WHERE id = ?`,
            [ventana.id_serie]
        ) || { precio_accesorios: 0 }; // Valor por defecto

        const varioManoObra = await db.getFirstAsync<PreciosVariosOption>(
            `SELECT * FROM ${Tablas.preciosVarios} WHERE nombre = ?`
        ,[preciosVariosEnum.manoDeObra]) || { precio: 1 }; // Valor por defecto 1 si no existe

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

export async function dropTables(): Promise<void> {

    try {
        await db.withExclusiveTransactionAsync(async () => {
            // Eliminar tablas en orden inverso para respetar las dependencias de claves foráneas
            await db.execAsync(`DROP TABLE IF EXISTS ${Tablas.ventanapresupuesto};`);
            console.log(`Tabla ${Tablas.ventanapresupuesto} eliminada`);

            await db.execAsync(`DROP TABLE IF EXISTS ${Tablas.presupuestos};`);
            console.log(`Tabla ${Tablas.presupuestos} eliminada`);

            await db.execAsync(`DROP TABLE IF EXISTS ${Tablas.preciosVarios};`);
            console.log(`Tabla ${Tablas.preciosVarios} eliminada`);

            await db.execAsync(`DROP TABLE IF EXISTS ${Tablas.perfiles};`);
            console.log(`Tabla ${Tablas.perfiles} eliminada`);

            await db.execAsync(`DROP TABLE IF EXISTS ${Tablas.cortinas};`);
            console.log(`Tabla ${Tablas.cortinas} eliminada`);

            await db.execAsync(`DROP TABLE IF EXISTS ${Tablas.coloresAluminio};`);
            console.log(`Tabla ${Tablas.coloresAluminio} eliminada`);

            await db.execAsync(`DROP TABLE IF EXISTS ${Tablas.series};`);
            console.log(`Tabla ${Tablas.series} eliminada`);

            console.log('Todas las tablas han sido eliminadas correctamente');
        });
    } catch (error) {
        console.error('Error al eliminar las tablas:', error);
        throw error;
    }
}