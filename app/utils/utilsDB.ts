import { ColorOption, CortinaOption, PerfilesOption, PreciosVariosOption, SerieOption } from '@/contexts/BDContext';
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
    { tipo: 'Ninguna', id: -1, preciom2: 20 },
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
    { id: -1, nombre: 'Hoja enganche c', serie_id: 2, gramos_por_m: 557 },
    { id: -1, nombre: 'Marco superior', serie_id: 2, gramos_por_m: 1463 },
    { id: -1, nombre: 'Marco inferior', serie_id: 2, gramos_por_m: 1364 },
    { id: -1, nombre: 'Marco lateral', serie_id: 2, gramos_por_m: 1528 },
    { id: -1, nombre: 'Hoja Superior', serie_id: 2, gramos_por_m: 492 },
    { id: -1, nombre: 'Hoja inferior', serie_id: 2, gramos_por_m: 666 },
    { id: -1, nombre: 'Hoja lateral', serie_id: 2, gramos_por_m: 580 },
    { id: -1, nombre: 'Hoja enganche c', serie_id: 2, gramos_por_m: 557 },
];


export async function initializeSeriesTable() {
    try {
        const { series, coloresAluminio, cortinas, perfiles, preciosVarios } = Tablas;
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
            id TEXT PRIMARY KEY NOT NULL,
            nombre TEXT NOT NULL,
            precio_accesorios REAL NOT NULL DEFAULT 0,
            FOREIGN KEY (serie_id_hereda) REFERENCES ${series} (id) NULL,  
      );
    `);

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
        ÇREATE  TABLE IF NOT EXIST ${coloresAluminio} (
            id TEXT PRIMARY KEY NOT NULL,
            nombreColor TEXT NOT NULL,
            precioKilo REAL NOT NULL,
        );
       `);

        // Verificar si la tabla está vacía
        const resultColores = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) as count FROM ${coloresAluminio}`
        );
        // Maneja los null
        const countColores = resultColores ? resultColores.count : 0;
        // Insertar datos iniciales si la tabla está vacía
        if (countColores === 0) {
            colorData.map((color: ColorOption) => {
                db.runSync(`
                            INSERT INTO ${coloresAluminio} (nombreColor, precioKilo) VALUES 
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
        CREATE TABLE IF NOT EXIST ${cortinas} (
            id TEXT PRIMARY KEY NOT NULL,
            tipo TEXT NOT NULL,
            precio_m2 REAL NOT NULL,
        );
        `);

        // Verificar si la tabla está vacía
        const resultCortinas = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) as count FROM ${cortinas}`
        );
        // Maneja los null
        const countCortinas = resultCortinas ? resultCortinas.count : 0;
        // Insertar datos iniciales si la tabla está vacía
        if (countCortinas === 0) {
            cortinaData.map((cortinas: CortinaOption) => {
                db.runSync(`
                            INSERT INTO ${cortinas} (nombreColor, precioKilo) VALUES 
                            (?, ?);
                        `, [cortinas.tipo, cortinas.preciom2]);
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
        CREATE TABLE IF NOT EXIST ${perfiles} (
            id TEXT PRIMARY KEY NOT NULL,
            nombre TEXT NOT NULL,
            FOREIGN KEY (serie_id) REFERENCES ${series} (id) NOT NULL,
            gramos_por_m REAL NOT NULL,
        );
        `)

        // Verificar si la tabla está vacía
        const resultPerfiles = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) as count FROM ${perfiles}`
        );
        // Maneja los null
        const countPerfiles = resultPerfiles ? resultPerfiles.count : 0;
        // Insertar datos iniciales si la tabla está vacía
        if (countPerfiles === 0) {
            perfilesData.map((perfiles: PerfilesOption) => {
                db.runSync(`
                            INSERT INTO ${perfiles} (nombreColor, serie_id, precioKilo) VALUES 
                            (?, ?, ?);
                        `, [perfiles.nombre, perfiles.serie_id, perfiles.gramos_por_m]);
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
        CREATE TABLE IF NOT EXIST ${preciosVarios} (
            id TEXT PRIMARY KEY NOT NULL,
            nombre TEXT NOT NULL,
            precio REAL NOT NULL,
        );
        `)
        // Verificar si la tabla está vacía
        const resultPreciosVarios = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) as count FROM ${perfiles}`
        );
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
    }
    catch (error) {
        console.error('Error initializing series table:', error);
        throw error;
    }

}


export async function precioperfil(perfil_nombre: string, serie_id: number): Promise<number> {
    const { perfiles, series } = Tablas;
    let result = await db.getFirstAsync<{ gramos_m2: number }>(
        `SELECT gramos_m2 FROM ${perfiles} WHERE nombre = ? AND serie_id = ? `
        , [perfil_nombre, serie_id]);
    if (result) {
        return result.gramos_m2;
    }
    else {
        result = await db.getFirstAsync<{ gramos_m2: number }>(
            `SELECT p.gramos_m2 FROM ${perfiles} p JOIN ${series} s on p.serie_id = s.serie_id_hereda where nombre= ? AND s.id = ? `
            , [perfil_nombre, serie_id]);
        if (result) {
            return result.gramos_m2;
        }
        return -1;
    }
}

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
