// GenerarPDF.tsx
import { Alert, Image, Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { abreviarCortina, abreviarPdf, abreviarSerie } from '../calculos';
import { AberturaPresupuestoOption, ColorOption, CortinaOption, PresupuestosOption, SerieOption } from '../constants/interfases';
import { CurrencyOption, seriesEnum, seriesMostrarEnum } from '../constants/variablesGlobales';


interface pdfComparadoProps {
  cortinas: CortinaOption[],
  presupuesto: PresupuestosOption[],
  acabado: ColorOption[],
  series: SerieOption[],
  currency: CurrencyOption

}
const loadImageAsBase64 = async (imageModule: number) => {
  try {
    const asset = Asset.fromModule(imageModule);

    // Descargar el asset si no está disponible localmente
    if (!asset.localUri) {
      await asset.downloadAsync();
    }

    if (asset.localUri) {
      // Normalizar el URI para Android
      const normalizedUri = Platform.OS === 'android'
        ? asset.localUri.replace('file:/', 'file:///')
        : asset.localUri;

      // Crear ruta temporal única
      const tempFileName = `temp_${Date.now()}_${asset.name}`;
      const tempPath = `${FileSystem.cacheDirectory}${tempFileName}`;

      // Copiar a ubicación temporal
      await FileSystem.copyAsync({
        from: normalizedUri,
        to: tempPath
      });

      // Leer como base64
      const base64 = await FileSystem.readAsStringAsync(tempPath, {
        encoding: FileSystem.EncodingType.Base64
      });

      // Eliminar inmediatamente después de usar
      await FileSystem.deleteAsync(tempPath, { idempotent: true });

      return `data:${asset.type || 'image/png'};base64,${base64}`;
    }

    // Fallback para desarrollo
    const source = Image.resolveAssetSource(imageModule);
    return source.uri || '';
  } catch (error) {
    console.error('Error cargando imagen:', error);
    return '';
  }
};

const cleanImageCache = async (daysToKeep: number = 1) => {
  try {
    if (!FileSystem.cacheDirectory) {
      throw new Error('FileSystem.cacheDirectory is null');
    }
    const files = await FileSystem.readDirectoryAsync(FileSystem.cacheDirectory);
    const currentTime = Date.now();

    const cleanupPromises = files.map(async (file) => {
      if (file.match(/\.(jpg|jpeg|png|gif|bmp|temp_)/i)) {
        const filePath = `${FileSystem.cacheDirectory}${file}`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);

        if (fileInfo.exists) {
          // Borrar archivos temporales antiguos (mayores a daysToKeep días)
          const fileAgeDays = (currentTime - fileInfo.modificationTime) / (1000 * 60 * 60 * 24);
          if (file.startsWith('temp_') || fileAgeDays > daysToKeep) {
            await FileSystem.deleteAsync(filePath, { idempotent: true });
          }
        }
      }
    });

    await Promise.all(cleanupPromises);
    console.log('Limpieza de caché completada');
  } catch (error) {
    console.warn('Error durante la limpieza de caché:', error);
  }
};

const PDF_SUBFOLDER = `${FileSystem.cacheDirectory}PresupuestosPDFComparados/`;

const crearSubCarpeta = async () => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(PDF_SUBFOLDER);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(PDF_SUBFOLDER, { intermediates: true });
      console.log("📁 Carpeta de PDFs creada:", PDF_SUBFOLDER);
    }
  } catch (error) {
    console.error("Error al crear carpeta:", error);
    throw error;
  }
};

const cleanPDFsSubCarpeta = async (mantenerUltimos = 5) => {
  try {
    // Verificar si la carpeta existe
    const folderInfo = await FileSystem.getInfoAsync(PDF_SUBFOLDER);
    if (!folderInfo.exists) return;

    //Listar todos los archivos PDF
    const files = await FileSystem.readDirectoryAsync(PDF_SUBFOLDER);
    const pdfFiles = files.filter(file => file.endsWith('.pdf'));

    // Ordenar por fecha (más reciente primero)
    pdfFiles.sort((a, b) => {
      const aTimePart = a.split('_').pop();
      const bTimePart = b.split('_').pop();
      const aTime = aTimePart ? aTimePart.replace('.pdf', '') : '0';
      const bTime = bTimePart ? bTimePart.replace('.pdf', '') : '0';
      return parseInt(bTime) - parseInt(aTime); // Orden descendente
    });

    // Borrar archivos excedentes
    if (mantenerUltimos > 0 && pdfFiles.length > mantenerUltimos) {
      const filesToDelete = pdfFiles.slice(mantenerUltimos);
      await cleanImageCache();
      for (const file of filesToDelete) {
        await FileSystem.deleteAsync(`${PDF_SUBFOLDER}${file}`);
        console.log(`🧹 Eliminado PDF antiguo: ${file}`);
      }
    }

    console.log(`✅ Carpeta limpia. Se conservan los ${mantenerUltimos} PDFs más recientes.`);
  } catch (error) {
    console.error('❌ Error al limpiar la carpeta:', error);
  }
};

export const GenerarPdfComparado = async ({ presupuesto, cortinas, acabado, series, currency }: pdfComparadoProps) => {
  const [logo_empresa, banco_republica, mercado_pago, insta, face] = await Promise.all([
    loadImageAsBase64(require('@/assets/images/ffalero.png')),
    loadImageAsBase64(require('@/assets/images/banco_republica.png')),
    loadImageAsBase64(require('@/assets/images/mercado_pago.png')),
    loadImageAsBase64(require('@/assets/images/instagram.png')),
    loadImageAsBase64(require('@/assets/images/facebook.png'))
  ]);

  const formatCurrency = (value: number) => {
    const rounded = Math.round(value * 10) / 10;
    if (currency.tipo === 'peso') {
      return `${(rounded * currency.multiplicador).toFixed(0)} ${currency.affix}`;
    }
    return `${(rounded * currency.multiplicador).toFixed(1)} ${currency.affix}`;
  };

  let html = `
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <style>
  body {
      font-family: 'Arial', sans-serif;
      padding: 0;
      margin: 0;
      min-height: 100vh;
      color: #333;
      padding-left: 20px;
      padding-right: 20px;
      line-height: 1.4;
    }

    .header {
      background-color: #3E7D6D;
      color: white;
      padding: 20px;
      position: relative;
      overflow: visible;
    }

    .header h1 {
      text-align: center;
      margin: 0;
      font-size: 28px;
      padding-bottom: 10px;
    }

    .header-content {
      display: flex;
      justify-content: flex-end;
      position: relative;
      height: 100px;
    }

    .header-logo {
      position: absolute;
      left: 20px;
      top: 50%;
      transform: translateY(-50%);
      width: 180px;
      z-index: 2;
    }

    .header-titles {
      text-align: right;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
    }

    .header-titles h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .header-titles p {
      margin: 0;
      font-size: 14px;
    }

    .divider {
      background-color: #C8E8DE;
      height: 30px;
      border-radius: 0 0 8px 8px ;
    }
    .divider-footer {
      background-color: #C8E8DE;
      height: 30px;
      width: 100%;
      border-radius:8px 8px  0 0 ;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0;
      margin-top: 30px;
    }

    th {
      background-color: #3E7D6D;
      color: white;
      padding: 8px 8px;
      font-weight: 600;
      font-size: 1.5rem;
    }

    td {
      padding: 10px 8px;
      border: 1px solid #ddd;
      font-size: 1rem;
      text-align: left;
    }

    tr:nth-child(even) {
      background-color: #f2f2f2;
    }

    .total-section {
      text-align: right;
      margin: 25px 30px 15px 0;
    }

    .total-label {
      display: inline-block;
      margin: 0 10px;
      font-size: 18px;
      font-weight: bold;
    }

    .total-amount {
      display: inline-block;
      margin: 0;
      font-size: 1rem;
      color: rgb(179, 42, 42);
      font-weight: bold;
    }

    .footer {
      margin-top: auto;
      color: white;
      border-radius: 0 0 8px 8px;
    }

    .footer-content {
      background-color: #3E7D6D;
      display: flex;
      justify-content: space-between;
    }

    .footer-section {
      flex: 1;
      padding: 0 10px;
    }

    .footer-title {
      font-size: 16px;
      font-weight: bold;
      display: block;
      margin-bottom: 12px;
      color: #fff;
    }

    .payment-logos {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-left: 20px;
    }

    .payment-logo {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .mp-logo-container {
      display: flex;
      width: 30px;
      height: 30px;
      align-items: center;
      justify-content: center;
      background-color: #ffff00;
      border-radius: 8px;
      padding: 5px;
      margin-left: 10px;
    }

    .mp-logo {
      width: 50px;
      height: 50px;
      object-fit: contain;
    }

    .br-logo {
      width: 60px;
      height: 60px;
      object-fit: contain;
    }

    .social-icons {
      display: flex;
    }

    .social-icon {
      width: 40px;
      height: 40px;
      margin-right: 10px;
    }

    .align-right {
      text-align: right;
    }
  </style>
</head>

<body>
  <div style="display: flex; flex-direction: column; height: 100vh;">
  <div class="header">
    <h1>Presupuesto</h1>
    <div class="header-content">
      <img class="header-logo" src="${logo_empresa} "alt="Logo FFalero">
      <div class="header-titles">
        <h3 style="font-size: 1.5rem;">${presupuesto[0].nombre_cliente || ''}</h3>
        <p>Fecha: ${presupuesto[0].fecha.toLocaleDateString('es-ES')}</p>
      </div>
    </div>
  </div>
  <div class="divider"></div>

  <table>
    <thead>
      <tr>
        <th>Descripción</th>
        <th>Cant.</th>
        ${presupuesto.map(color_pre =>
    `<th>${acabado.find(i => i.id === color_pre.ventanas[0].id_color_aluminio)?.color}</th>`
  ).join('')}
      </tr>
    </thead>
    <tbody>
      ${presupuesto[0].ventanas.map((ventana, index) =>
    `<tr>
        <td>${ventana.tipo_abertura} ${ventana.ancho}cm X ${ventana.alto}cm ${abreviarPdf(ventana.id_serie, series, ventana.id_cortina || 0, cortinas, ventana.mosquitero)}</td>
        <td style="text-align: center;">${ventana.cantidad}</td>
        ${presupuesto.map(comparado => `<td style="text-align: center; font-size: 1rem; white-space: nowrap;">${formatCurrency(comparado.ventanas[index].precio_unitario * comparado.ventanas[index].cantidad)}</td>`).join('')}
        </tr>`).join('')}
  <td>TOTAL:</td>
  <td></td>
    ${presupuesto.map(presu =>
      `<td style="text-align: center; color:rgb(179, 42, 42); font-size: 1rem; white-space: nowrap;">${formatCurrency(presu.precio_total)}</td>`
    ).join('')}

    </tbody>
  </table>

    <div class="footer">
     <div class="divider-footer"></div>
      <div class="footer-content">
        <!-- Columna 1: Información de pago -->
        <div class="footer-section">
          <span class="footer-title">INFORMACIÓN DE PAGO:</span>
          <div class="payment-logos">
            <div class="payment-logo">
              <img class="br-logo" src="${banco_republica}" alt="Banco República">
            </div>
            <div class="mp-logo-container">
              <img class="mp-logo" src="${mercado_pago}" alt="Mercado Pago">
            </div>
          </div>
          <div>Nombre de cuenta:</div>
          <div>Federico Falero</div>
        </div>

        <!-- Columna 2: Contacto -->
        <div class="footer-section">
          <span class="footer-title">CONTACTO:</span>
          <div>WhatsApp: 099080052</div>
          <div style="font-size: 14px">eMail: fedefalero20@gmail.com</div>
          <div class="social-icons">
            <a href="https://www.instagram.com/carpinteria.aluminiofedefalero" target="_blank">
              <img class="social-icon" src="${insta}" alt="Instagram">
            </a>
            <img class="social-icon" src="${face}" alt="Facebook">
          </div>
        </div>

        <!-- Columna 3: Dirección -->
        <div class="footer-section align-right">
          <span class="footer-title">DIRECCIÓN:</span>
          <div>RUTA 11 KM 145, EL TALITA</div>
          <div>SAN JACINTO - CANELONES</div>
        </div>
      </div>
    </div>
  </div>
</body>

</html>
`;

  try {
    await Promise.all([crearSubCarpeta(), cleanPDFsSubCarpeta(5)]);

    // Generar PDF directamente en la ubicación final
    const nombreClienteLimpio = presupuesto[0].nombre_cliente.replace(/[^a-zA-Z0-9]/g, '_');
    const newFileName = `${PDF_SUBFOLDER}Presupuesto_${nombreClienteLimpio}_${new Date().getFullYear()}_Comparado.pdf`;

    // Generar PDF directamente en la ubicación deseada
    const { uri } = await Print.printToFileAsync({
      html,
      width: 595,  
      height: 842,  
      base64: false
    });

    // Renombrar/mover el archivo
    await FileSystem.moveAsync({
      from: uri,
      to: newFileName
    });

    // Verificar que el archivo existe
    const fileInfo = await FileSystem.getInfoAsync(newFileName);
    if (!fileInfo.exists) {
      throw new Error('El archivo PDF no se creó correctamente');
    }

    // Compartir
    await Sharing.shareAsync(newFileName, {
      mimeType: 'application/pdf',
      dialogTitle: 'Compartir Presupuesto',
      UTI: 'com.adobe.pdf'
    });

    console.log("✅ PDF guardado en:", newFileName);
    return newFileName;

  } catch (error) {
    if ((error as Error).message.includes('Another share request')) {
      console.warn('Por favor espera a que termine la compartición actual');
      Alert.alert('Espera', 'Por favor espera a que termine la compartición actual antes de intentar nuevamente');
    } else {
      console.error('❌ Error crítico:', error);
      throw error;
    }
  }
};