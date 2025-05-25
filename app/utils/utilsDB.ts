import { ColorOption, CortinaOption, PerfilesOption, PreciosVariosOption, PresupuestosOption, SerieOption, VentanaPresupuestoOption } from '@/contexts/BDContext';
import { parse } from '@babel/core';
import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabaseSync('falero.db');
console.log('Database opened:', db);

const serie25_2H: string = 'Serie 25 2H';
const serie25_3H: string = 'Serie 25 3H';
const serie20: string = 'Serie 20';

const Tablas = {
    series: "series",
    coloresAluminio: "coloresAluminio",
    cortinas: "cortinas",
    perfiles: "perfiles",
    preciosVarios: "preciosVarios",
    presupuestos: "presupuestos",
    ventanapresupuesto: "ventanapresupuesto",
}


const preciosVariosData: PreciosVariosOption[] = [
    { id: -1, nombre: 'Mano de obra', precio: 1.3 },
    { id: -1, nombre: 'Vidrio', precio: 40 },
    { id: -1, nombre: 'Mosquitero', precio: 40 },
];

const colorData: ColorOption[] = [
    { color: 'Natural Anodizado', id: -1, precio: 10.1 },
    { color: 'Blanco', id: -1, precio: 10.8 },
    { color: 'Simil madera', id: -1, precio: 13.8 },
    { color: 'Anolock', id: -1, precio: 12.4 },
];

const serieData: SerieOption[] = [
    { nombre: 'SERIE 20', id: 1, precio_accesorios: 0, serie_id_hereda: null },
    { nombre: 'SERIE 25 2H', id: 2, precio_accesorios: 35, serie_id_hereda: null },
    { nombre: 'SERIE 25 3H', id: 3, precio_accesorios: 40, serie_id_hereda: 2 },
];

const cortinaData: CortinaOption[] = [
    { tipo: 'Ninguna', id: -1, preciom2: null },
    { tipo: 'Cortina pvc H25', id: -1, preciom2: 87 },
    { tipo: 'Cortina panel aluminio H25', id: -1, preciom2: 43 },
    { tipo: 'Monoblock en pvc', id: -1, preciom2: 110 },
    { tipo: 'Monoblock con panel aluminio', id: -1, preciom2: 160 },
];

const perfilesData: PerfilesOption[] = [
    { id: -1, nombre: 'Marco superior', serie_id: 1, gramos_por_m: 972 },
    { id: -1, nombre: 'Marco inferior', serie_id: 1, gramos_por_m: 978 },
    { id: -1, nombre: 'Marco lateral', serie_id: 1, gramos_por_m: 669 },
    { id: -1, nombre: 'Marco superior', serie_id: 2, gramos_por_m: 972 },
    { id: -1, nombre: 'Marco inferior', serie_id: 2, gramos_por_m: 978 },
    { id: -1, nombre: 'Marco lateral', serie_id: 2, gramos_por_m: 669 },
    { id: -1, nombre: 'Hoja Superior', serie_id: 2, gramos_por_m: 492 },
    { id: -1, nombre: 'Hoja inferior', serie_id: 2, gramos_por_m: 666 },
    { id: -1, nombre: 'Hoja lateral', serie_id: 2, gramos_por_m: 580 },
    { id: -1, nombre: 'Hoja enganche central', serie_id: 2, gramos_por_m: 557 },
    { id: -1, nombre: 'Marco superior', serie_id: 3, gramos_por_m: 1463 },
    { id: -1, nombre: 'Marco inferior', serie_id: 3, gramos_por_m: 1364 },
    { id: -1, nombre: 'Marco lateral', serie_id: 3, gramos_por_m: 1528 },
];


export async function initializeSeriesTable() {
    try {
        const { series, coloresAluminio, cortinas, perfiles, preciosVarios, presupuestos, ventanapresupuesto } = Tablas;
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
        CREATE TABLE IF NOT EXISTS ${series} (
            id INTEGER PRIMARY KEY NOT NULL,
            nombre TEXT NOT NULL,
            precio_accesorios REAL NOT NULL DEFAULT 0,
            serie_id_hereda REAL,
            FOREIGN KEY (serie_id_hereda) REFERENCES ${series} (id)  
      );
    `);
        console.log('Tabla series creada o ya existe');

        // Verificar si la tabla está vacía
        const resultSeries = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) as count FROM ${series}`
        );
        // Maneja los null
        const count = resultSeries ? resultSeries.count : 0;
        // Insertar datos iniciales si la tabla está vacía
        if (count === 0) {

            serieData.map((serie: SerieOption) => {
                db.runSync(`
                            INSERT INTO ${series} (id, nombre, precio_accesorios, serie_id_hereda) VALUES 
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
        CREATE TABLE IF NOT EXISTS ${coloresAluminio} (
            id INTEGER PRIMARY KEY NOT NULL,
            color TEXT NOT NULL,
            precio REAL NOT NULL
        );
       `);
        console.log('Tabla coloresAluminio creada o ya existe');
        // Verificar si la tabla está vacía
        const resultColores = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) as count FROM ${coloresAluminio}`
        );
        console.log('resultColores', resultColores);
        // Maneja los null
        const countColores = resultColores ? resultColores.count : 0;
        // Insertar datos iniciales si la tabla está vacía
        if (countColores === 0) {
            colorData.map((color: ColorOption) => {
                db.runSync(`
                            INSERT INTO ${coloresAluminio} (color, precio) VALUES 
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
        CREATE TABLE IF NOT EXISTS ${cortinas} (
            id INTEGER PRIMARY KEY NOT NULL,
            tipo TEXT NOT NULL,
            preciom2 REAL
        );
        `);

        // Verificar si la tabla está vacía
        const resultCortinas = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) as count FROM ${cortinas}`
        );
        console.log('resultCortinas', resultCortinas);
        // Maneja los null
        const countCortinas = resultCortinas ? resultCortinas.count : 0;
        // Insertar datos iniciales si la tabla está vacía
        if (countCortinas === 0) {
            cortinaData.map((cortina: CortinaOption) => {
                db.runSync(`
                            INSERT INTO ${cortinas} (tipo, preciom2) VALUES 
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
        CREATE TABLE IF NOT EXISTS ${perfiles} (
            id INTEGER PRIMARY KEY NOT NULL,
            nombre TEXT NOT NULL,
            serie_id INTEGER NOT NULL,
            gramos_por_m REAL NOT NULL,
            FOREIGN KEY (serie_id) REFERENCES ${series} (id)
        );
        `)

        // Verificar si la tabla está vacía
        const resultPerfiles = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) as count FROM ${perfiles}`
        );
        // Maneja los null
        const countPerfiles = resultPerfiles ? resultPerfiles.count : 0;

        console.log('resultPerfiles', resultPerfiles);
        // Insertar datos iniciales si la tabla está vacía
        if (countPerfiles === 0) {
            perfilesData.map((perfil: PerfilesOption) => {
                db.runSync(`
                            INSERT INTO ${perfiles} (nombre, serie_id, gramos_por_m) VALUES 
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
        CREATE TABLE IF NOT EXISTS ${preciosVarios} (
            id INTEGER PRIMARY KEY NOT NULL,
            nombre TEXT NOT NULL,
            precio REAL NOT NULL
        );
        `)
        // Verificar si la tabla está vacía
        const resultPreciosVarios = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) as count FROM ${preciosVarios}`
        );

        console.log('resultPreciosVarios', resultPreciosVarios);
        // Maneja los null
        const countPereciosVarios = resultPreciosVarios ? resultPreciosVarios.count : 0;
        // Insertar datos iniciales si la tabla está vacía
        if (countPereciosVarios === 0) {
            preciosVariosData.map((varios: PreciosVariosOption) => {
                db.runSync(`
                            INSERT INTO ${preciosVarios} ( nombre, precio) VALUES 
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
        await db.execAsync(`CREATE TABLE IF NOT EXISTS ${presupuestos} (
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
            await db.execAsync(`CREATE TABLE IF NOT EXISTS ${ventanapresupuesto} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            id_presupuesto INTEGER NOT NULL,
            ancho INTEGER NOT NULL,
            alto INTEGER NOT NULL,
            id_color_aluminio INTEGER NOT NULL,
            id_serie INTEGER NOT NULL,
            vidrio BOOLEAN NOT NULL,
            id_cortina INTEGER,
            mosquitero BOOLEAN NOT NULL,
            cantidad INTEGER NOT NULL,
            precio_unitario REAL NOT NULL,
            FOREIGN KEY (id_color_aluminio) REFERENCES ${coloresAluminio} (id),
            FOREIGN KEY (id_serie) REFERENCES ${series} (id),
            FOREIGN KEY (id_cortina) REFERENCES ${cortinas} (id),
            FOREIGN KEY (id_presupuesto) REFERENCES ${presupuestos} (id));`
            );
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
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
                `, [
                    presupuestoId,
                    ventana.ancho,
                    ventana.alto,
                    ventana.id_color_aluminio,
                    ventana.id_serie,
                    ventana.id_cortina ? ventana.id_cortina : null,
                    ventana.vidrio,
                    ventana.mosquitero,
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

export async function getSeries(): Promise<SerieOption[]> {
    const { series } = Tablas;
    const result = await db.getAllAsync<SerieOption>(`SELECT * FROM ${series}`);
    return result;
}

export async function getColorAluminio(): Promise<ColorOption[]> {
    const { coloresAluminio } = Tablas;
    const result = await db.getAllAsync<ColorOption>(`SELECT * FROM ${coloresAluminio}`);
    return result;
}

export async function getCortinas(): Promise<CortinaOption[]> {
    const { cortinas } = Tablas;
    const result = await db.getAllAsync<CortinaOption>(`SELECT * FROM ${cortinas}`);
    return result;
}

export async function getPerfiles(): Promise<PerfilesOption[]> {
    const { perfiles } = Tablas;
    const result = await db.getAllAsync<PerfilesOption>(`SELECT * FROM ${perfiles}`);
    return result;
}

export async function getPreciosVarios(): Promise<PreciosVariosOption[]> {
    const { preciosVarios } = Tablas;
    const result = await db.getAllAsync<PreciosVariosOption>(`SELECT * FROM ${preciosVarios}`);
    return result;
}

export async function getPresupuestos(): Promise<PresupuestosOption[]> {
    const { presupuestos } = Tablas;
    const result = await db.getAllAsync<PresupuestosOption>(`SELECT * FROM ${presupuestos}`);
    return result;
}

export async function getPresupuestoByID(id: number): Promise<PresupuestosOption> {
    const { presupuestos, ventanapresupuesto } = Tablas;
    try {
        // Obtener el presupuesto
        const presupuestoResult = await db.getFirstAsync<PresupuestosOption>(
            `SELECT id, nombre_cliente, fecha, precio_total 
            FROM ${presupuestos} 
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
            FROM ${ventanapresupuesto} 
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
    const { series } = Tablas;
    await db.runAsync(`
            UPDATE ${series} 
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
    const { perfiles } = Tablas;
    await db.runAsync(`
            UPDATE ${perfiles} 
            SET gramos_por_m = ? 
            WHERE AND id = ?;
        `, [obj.gramos_por_m, obj.id]);
};

export const updatePrecioColor = async (obj: ColorOption) => {
    const { coloresAluminio } = Tablas;
    await db.runAsync(`
            UPDATE ${coloresAluminio} 
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
    const { preciosVarios } = Tablas;
    await db.runAsync(`
            UPDATE ${preciosVarios} 
            SET precio = ? 
            WHERE id = ?;
        `, [objeto.precio, objeto.id]);
};

async function calcularPrecioVidrio(
    altoV: number,
    anchoV: number,
): Promise<number> {
    const { preciosVarios } = Tablas;
    try {
        const vidrio = await db.getFirstAsync<PreciosVariosOption>(`SELECT * FROM ${preciosVarios} WHERE nombre = 'Vidrio'`);

        // Manejar el caso donde vidrio o vidrio.precio es undefined
        const precioUnitario = vidrio?.precio ?? 0;

        const areaVidrio = (altoV * anchoV) / 10000;
        const precioTotalVidrio = areaVidrio * precioUnitario;

        // Verificar si es NaN antes de usar toFixed
        if (isNaN(precioTotalVidrio)) {
            return 0;
        }

        return parseFloat(precioTotalVidrio.toFixed(2));
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
        const { preciosVarios } = Tablas;

        const mosquitero = await db.getFirstAsync<PreciosVariosOption>(`SELECT * FROM ${preciosVarios} WHERE nombre = 'Mosquitero'`);
        // Manejar el caso donde vidrio o vidrio.precio es undefined
        const precioUnitario = mosquitero?.precio ?? 0;
        const areaMosquitero = (altoV * anchoV) / 10000;
        const precioTotalMosquitero = areaMosquitero * precioUnitario;
        // Verificar si es NaN antes de usar toFixed
        if (isNaN(precioTotalMosquitero)) {
            return 0;
        }
        return parseFloat(precioTotalMosquitero.toFixed(2));
    } catch (error) {
        console.error('Error al calcular precio del vidrio:', error);
        return 0;
    }
}

async function determinarPerfiles(serie_id: number): Promise<PerfilesOption[]> {
    const { perfiles, series } = Tablas;
    let result = await db.getAllAsync<PerfilesOption>(
        `SELECT * FROM ${perfiles} WHERE serie_id = ? `
        , [serie_id]);
    if (result) {
        return result;
    }
    else {
        result = await db.getAllAsync<PerfilesOption>(
            `SELECT * FROM ${perfiles} p JOIN ${series} s on p.serie_id = s.serie_id_hereda where s.id = ? `
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
        if (perfil.nombre === 'Marco superior' || perfil.nombre === 'Marco inferior' || perfil.nombre === 'Hoja Superior' || perfil.nombre === 'Hoja inferior') {
            pesoPerfil = anchoV / 100;
        }
        if (perfil.nombre === 'Marco lateral' || perfil.nombre === 'Hoja lateral') {
            pesoPerfil = (2 * altoV) / 100;
        }
        if (serie_id === 2) {
            if (perfil.nombre === 'Hoja enganche central') {
                pesoPerfil = (2 * altoV) / 100;
            }
        }
        if (serie_id === 3) {
            if (perfil.nombre === 'Hoja enganche central') {
                pesoPerfil = (4 * altoV) / 100;
            }
        }
        const pesoTemp = pesoPerfil * perfil.gramos_por_m;
        pesoTotal += pesoTemp;
    })

    return parseFloat(pesoTotal.toFixed(2));
}

async function calcularPrecioColor(
    color_id: number,
    peso_aluminio: number
): Promise<number> {
    const { coloresAluminio } = Tablas;
    const precioColor = await db.getFirstAsync<ColorOption>(
        `SELECT * FROM ${coloresAluminio} WHERE id = ?`
        , [color_id]);
    if (peso_aluminio <= 0) throw new Error('El peso debe ser mayor que cero');
    if (!precioColor) throw new Error('No se encontro el color buscado');

    const pesoKilo = peso_aluminio / 1000; // Convertir a kilos
    const precioTotal = pesoKilo * precioColor.precio;

    return precioTotal;
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
        const { series, preciosVarios } = Tablas;

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

        // Obtención de datos adicionales con valores por defecto
        const serieAccesorio = await db.getFirstAsync<SerieOption>(
            `SELECT * FROM ${series} WHERE id = ?`,
            [ventana.id_serie]
        ) || { precio_accesorios: 0 }; // Valor por defecto

        const varioManoObra = await db.getFirstAsync<PreciosVariosOption>(
            `SELECT * FROM ${preciosVarios} WHERE nombre = 'Mano de obra'`
        ) || { precio: 1 }; // Valor por defecto 1 si no existe

        // Cálculo final con protección contra NaN
        const sumaComponentes = precioAluminioColor + precioVidrio + precioMosquitero + (serieAccesorio.precio_accesorios || 0);
        const factorGanancia = varioManoObra.precio || 1;

        const precioFinal = sumaComponentes * factorGanancia;

        if (isNaN(precioFinal)) {
            throw new Error('El cálculo del precio final resultó en NaN');
        }

        return parseFloat(precioFinal.toFixed(2));
    } catch (error) {
        console.error('Error en calcularPrecioVentana:', error);
        return 0;
    }
}