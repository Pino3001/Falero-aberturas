import { BDState } from '@/utils/contexts/BDContext';
import * as SQLite from 'expo-sqlite';
import { Tablas, DATABASE_NAME, DATABASE_VERSION, preciosVariosEnum } from '../constants/variablesGlobales';
import { ColorOption, CortinaOption, PerfilesOption, PreciosVariosOption, SerieOption } from '../constants/interfases';
import { getColorAluminio, getCortinas, getPerfiles, getPreciosVarios, getSeries } from './operacionesDB';
import { colorData, cortinaData, perfilesData, preciosVariosData, serieData } from '../valores_preCargados';
import * as FileSystem from 'expo-file-system';
import { Alert, Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

let db = SQLite.openDatabaseSync(DATABASE_NAME);


export async function initializeDatabase(): Promise<BDState> {
  try {
    // 1. Setup inicial
    await createVersionTable();
    const currentVersion = await getCurrentVersion();

    // 2. Migraciones
    if (currentVersion < DATABASE_VERSION) {
      await runMigrations(currentVersion, DATABASE_VERSION);
    }

    // 3. Crear tablas si no existen
    await inicializaTablas();


    // 5. Devolver estado inicial
    return {
      acabado: await getColorAluminio(),
      cortinas: await getCortinas(),
      perfiles: await getPerfiles(),
      preciosVarios: await getPreciosVarios(),
      series: await getSeries(),
    };
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}


async function createVersionTable() {
  await db.execAsync(`
        CREATE TABLE IF NOT EXISTS ${Tablas.db_version} (
            version INTEGER PRIMARY KEY NOT NULL,
            updated_at TEXT NOT NULL
        );
    `);

  // Verificar si ya existe una versión registrada
  const versionResult = await db.getFirstAsync<{ version: number }>(
    `SELECT version FROM ${Tablas.db_version} LIMIT 1`
  );

  if (!versionResult) {
    // Insertar versión inicial
    await db.runAsync(
      `INSERT INTO ${Tablas.db_version} (version, updated_at) VALUES (1, datetime('now'))`
    );
  }
}


async function inicializaTablas() {
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
    precio_un_puerta: number
    } */

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS ${Tablas.coloresAluminio} (
            id INTEGER PRIMARY KEY NOT NULL,
            precio_un_puerta REAL NOT NULL,
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
                            INSERT INTO ${Tablas.coloresAluminio} (color, precio, precio_un_puerta) VALUES 
                            (?, ?, ?);
                        `, [color.color, color.precio, color.precio_un_puerta]);
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
                ventanas: AberturaPresupuestoOption[],
                precio_total: number;
            } */



    // --TABLA PRESUPUESTOS--
    await db.execAsync(`CREATE TABLE IF NOT EXISTS ${Tablas.presupuestos} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre_cliente TEXT NOT NULL,
            fecha TEXT NOT NULL,
            precio_total REAL NOT NULL);`
    );

    /* export interface AberturaPresupuestoOption {
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

    // --TABLA PRESUPUESTOS--
    await db.execAsync(`CREATE TABLE IF NOT EXISTS ${Tablas.aberturaPresupuesto} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tipo_abertura TEXT NOT NULL,
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
            FOREIGN KEY (id_presupuesto) REFERENCES ${Tablas.presupuestos} (id));`);
  }
  catch (error) {
    console.error('Error initializing series table:', error);
    throw error;
  }

}

async function getCurrentVersion(): Promise<number> {
  const result = await db.getFirstAsync<{ version: number }>(
    `SELECT version FROM ${Tablas.db_version} LIMIT 1`
  );
  return result?.version ?? 0;
}

async function runMigrations(currentVersion: number, targetVersion: number) {
  console.log(`Running migrations from ${currentVersion} to ${targetVersion}`);

  for (let version = currentVersion + 1; version <= targetVersion; version++) {
    const migrationFunction = migrations[version];
    if (!migrationFunction) {
      throw new Error(`No migration found for version ${version}`);
    }

    try {
      await db.withTransactionAsync(async () => {
        console.log(`Running migration to version ${version}`);
        await migrationFunction();
        await updateDbVersion(version);
      });
    } catch (error) {
      console.error(`Migration to version ${version} failed:`, error);
      throw error;
    }
  }
}

async function updateDbVersion(version: number) {
  await db.runAsync(
    `UPDATE ${Tablas.db_version} SET version = ?, updated_at = datetime('now')`,
    [version]
  );
}

const migrations: Record<number, () => Promise<void>> = {
  1: async () => {
    // Migración inicial
  },
  2: async () => {
    try {
      db.runSync(`
        INSERT INTO ${Tablas.preciosVarios} ( nombre, precio) VALUES 
        ( ? , 43);
        `, [preciosVariosEnum.dolar]);
    } catch (error) {
      console.error('Error en migración 2:', error);
      throw error; // Propaga el error para detener las migraciones
    }

  },
};



export async function dropTables(): Promise<void> {

  try {
    await db.withExclusiveTransactionAsync(async () => {
      // Eliminar tablas en orden inverso para respetar las dependencias de claves foráneas
      await db.execAsync(`DROP TABLE IF EXISTS ${Tablas.aberturaPresupuesto};`);
      console.log(`Tabla ${Tablas.aberturaPresupuesto} eliminada`);

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

export const DatabaseManager = {
  exportDatabase: async (): Promise<void> => {
    try {
      // 1. Definir rutas de origen
      const dbUri = `${FileSystem.documentDirectory}SQLite/${DATABASE_NAME}`;

      // 2. Verificar que el archivo de origen existe
      const fileInfo = await FileSystem.getInfoAsync(dbUri);
      if (!fileInfo.exists) {
        throw new Error('La base de datos no existe en la ubicación esperada');
      }

      // 3. Manejo diferente para Android
      if (Platform.OS === 'android') {
        // 3.1 Solicitar permisos para acceder al almacenamiento externo
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (!permissions.granted) {
          throw new Error('Se requieren permisos de almacenamiento');
        }

        // 3.2 Crear el archivo usando SAF (Storage Access Framework)
        try {
          const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            DATABASE_NAME,
            'application/x-sqlite3'
          );

          // 3.3 Leer la base de datos como string base64
          const base64Data = await FileSystem.readAsStringAsync(dbUri, {
            encoding: FileSystem.EncodingType.Base64
          });

          // 3.4 Escribir en el nuevo archivo
          await FileSystem.writeAsStringAsync(fileUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64
          });

          Alert.alert('Éxito', 'Base de datos exportada correctamente');
          return;
        } catch (safError) {
          throw new Error(`Error al crear el archivo: ${safError}`);
        }
      }

      // 4. Manejo para iOS
      const exportDir = `${FileSystem.cacheDirectory}exports/`;
      const exportPath = `${exportDir}${DATABASE_NAME}_backup_${Date.now()}.db`;

      // 5. Crear directorio si no existe
      await FileSystem.makeDirectoryAsync(exportDir, { intermediates: true });

      // 6. Copiar el archivo
      await FileSystem.copyAsync({
        from: dbUri,
        to: exportPath
      });

      // 7. Compartir el archivo
      await Sharing.shareAsync(exportPath, {
        mimeType: 'application/x-sqlite3',
        dialogTitle: 'Exportar base de datos',
        UTI: 'com.adobe.pdf' // Para iOS
      });

    } catch (error) {
      console.error('Error al exportar la base de datos:', error);
      Alert.alert(
        'Error',
        `No se pudo exportar la base de datos: ${error}`
      );
      throw error;
    }
  },

  pickDatabaseForImport: async (): Promise<void> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: Platform.OS === 'android'
          ? ['application/x-sqlite3', 'application/octet-stream']
          : ['public.database'],
        copyToCacheDirectory: true,
        multiple: false
      });

      if (!result.canceled && result.assets?.length) {
        const selectedFile = result.assets[0];

        // Verificar el archivo antes de importar
        const fileInfo = await FileSystem.getInfoAsync(selectedFile.uri);
        if (!fileInfo.exists || fileInfo.size === 0) {
          throw new Error('El archivo seleccionado está vacío o no existe');
        }

        // Mover a una ubicación controlada antes de importar
        const tempUri = `${FileSystem.cacheDirectory}temp_import.db`;
        await FileSystem.copyAsync({
          from: selectedFile.uri,
          to: tempUri
        });

        await importDatabase(tempUri);
        Alert.alert('Éxito', 'Base de datos importada correctamente');
      }
    } catch (error) {
      console.error('Error en importación:', error);
      Alert.alert(
        'Error',
        `No se pudo importar: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
    }
  },

  createBackup: async (): Promise<string> => {
    const backupUri = `${FileSystem.documentDirectory}backups/${Date.now()}_${DATABASE_NAME}`;
    await FileSystem.copyAsync({
      from: `${FileSystem.documentDirectory}SQLite/${DATABASE_NAME}`,
      to: backupUri
    });
    return backupUri;
  },

  restoreBackup: async (backupUri: string): Promise<void> => {
    try {
      // 1. Verificar que el backup existe
      const backupInfo = await FileSystem.getInfoAsync(backupUri);
      if (!backupInfo.exists) {
        throw new Error('El archivo de backup no existe');
      }

      // 2. Verificar que es una base de datos SQLite válida
      const header = await FileSystem.readAsStringAsync(backupUri, {
        encoding: FileSystem.EncodingType.UTF8,
        length: 16,
        position: 0
      });

      if (!header.startsWith('SQLite format 3')) {
        throw new Error('El archivo no es una base de datos SQLite válida');
      }

      // 3. Crear un backup de la base de datos actual (por si acaso)
      const rollbackUri = await DatabaseManager.createBackup();

      try {
        // 4. Cerrar la conexión actual si está abierta
        await db.closeAsync();

        // 5. Definir rutas
        const dbPath = `${FileSystem.documentDirectory}SQLite/${DATABASE_NAME}`;

        // 6. Reemplazar la base de datos
        await FileSystem.deleteAsync(dbPath);
        await FileSystem.copyAsync({
          from: backupUri,
          to: dbPath
        });

        // 7. Reabrir la conexión
        db = SQLite.openDatabaseSync(DATABASE_NAME);

        // 8. Verificar integridad de la base de datos restaurada
        const version = await getCurrentVersion();
        console.log('Base de datos restaurada. Versión:', version);

        Alert.alert('Éxito', 'Base de datos restaurada correctamente');
      } catch (restoreError) {
        // 9. Restaurar el backup original si falla
        console.error('Error al restaurar, haciendo rollback:', restoreError);
        await FileSystem.copyAsync({
          from: rollbackUri,
          to: `${FileSystem.documentDirectory}SQLite/${DATABASE_NAME}`
        });
        throw new Error('Error al restaurar. Se recuperó la versión anterior');
      } finally {
        // 10. Limpiar el backup de rollback
        await FileSystem.deleteAsync(rollbackUri).catch(console.warn);
      }
    } catch (error) {
      console.error('Error en restoreBackup:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Error desconocido al restaurar'
      );
      throw error;
    }
  },

  // Función para listar backups disponibles
  listBackups: async (): Promise<string[]> => {
    const backupDir = `${FileSystem.documentDirectory}backups/`;
    const dirInfo = await FileSystem.getInfoAsync(backupDir);

    if (!dirInfo.exists) {
      return [];
    }

    const files = await FileSystem.readDirectoryAsync(backupDir);
    return files
      .filter(file => file.endsWith('.db'))
      .map(file => `${backupDir}${file}`)
      .sort((a, b) => b.localeCompare(a)); // Ordenar por más reciente primero
  }
};

async function importDatabase(uri: string): Promise<void> {
  try {
    //Verificación avanzada del archivo
    await verifyDatabaseFile(uri);

    //Obtener versión antes de reemplazar
    const importedVersion = await getDatabaseVersionFromFile(uri);
    const currentVersion = DATABASE_VERSION;

    if (importedVersion > currentVersion) {
      throw new Error(`Versión ${importedVersion} no soportada (máxima: ${currentVersion})`);
    }

    // Preparar rutas
    const finalDbPath = `${FileSystem.documentDirectory}SQLite/${DATABASE_NAME}`;
    const backupPath = await DatabaseManager.createBackup();

    try {
      // Cerrar conexión existente
      await db.closeAsync();

      // Reemplazar la base de datos
      await FileSystem.deleteAsync(finalDbPath);
      await FileSystem.copyAsync({
        from: uri,
        to: finalDbPath
      });

      // Reabrir conexión
      db = SQLite.openDatabaseSync(DATABASE_NAME);

      // Aplicar migraciones si es necesario
      if (importedVersion < currentVersion) {
        await runMigrations(importedVersion, currentVersion);
      }

      console.log('Importación completada exitosamente');
    } catch (replaceError) {
      // Restaurar backup en caso de error
      await FileSystem.moveAsync({
        from: backupPath,
        to: finalDbPath
      });
      throw replaceError;
    }
  } catch (error) {
    console.error('Error en importDatabase:', error);
    throw error;
  }
}

// Verificación avanzada del archivo SQLite
async function verifyDatabaseFile(uri: string): Promise<void> {
  try {
    // Verificar que es un archivo SQLite válido
    const header = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.UTF8,
      length: 16,
      position: 0
    });

    if (!header.startsWith('SQLite format 3')) {
      throw new Error('El archivo no es una base de datos SQLite válida');
    }

    // Verificar tablas esenciales
    const tempDb = SQLite.openDatabaseSync(uri);
    try {
      const tablesToVerify = [
        Tablas.series,
        Tablas.coloresAluminio,
        Tablas.db_version
        // Agrega otras tablas esenciales
      ];

      for (const table of tablesToVerify) {
        const tableExists = await tempDb.getFirstAsync<{ name: string }>(
          `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
          [table]
        );

        if (!tableExists) {
          throw new Error(`Falta tabla esencial: ${table}`);
        }
      }
    } finally {
      await tempDb.closeAsync();
    }
  } catch (error) {
    throw new Error(`Verificación fallida: ${error}`);
  }
}

// Obtener versión de archivo SQLite
async function getDatabaseVersionFromFile(uri: string): Promise<number> {
  const tempDb = SQLite.openDatabaseSync(uri);
  try {
    const result = await tempDb.getFirstAsync<{ version: number }>(
      `SELECT version FROM db_version LIMIT 1`
    );
    return result?.version ?? 0;
  } finally {
    await tempDb.closeAsync();
  }
}
