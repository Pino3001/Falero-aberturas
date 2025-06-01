// GenerarPDF.tsx
import React, { useEffect } from 'react';
import { Alert, Image } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { abreviarCortina } from './calculos';
import { ColorOption, CortinaOption, PresupuestosOption } from '../../constants/interfases';

interface pdfProps {
  cortinas: CortinaOption[],
  presupuesto: PresupuestosOption,
  colors: ColorOption[]

}
const loadImageAsBase64 = async (imageModule: number) => {
  try {
    const asset = Asset.fromModule(imageModule);

    // En desarrollo, puede que necesitemos descargarlo
    if (!asset.localUri) {
      await asset.downloadAsync();
    }

    // Si estamos en producción y el asset está empaquetado
    if (asset.localUri) {
      const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
        encoding: FileSystem.EncodingType.Base64
      });
      return `data:${asset.type || 'image/png'};base64,${base64}`;
    }

    // Fallback para desarrollo con Metro bundler
    return Image.resolveAssetSource(imageModule).uri;
  } catch (error) {
    console.warn('Error cargando imagen:', error);
    return ''; // Imagen vacía si falla
  }
};

// Subcarpeta donde se guardan los pdf
const PDF_SUBFOLDER = `${FileSystem.documentDirectory}PresupuestosPDF/`;

// Verificar que exista la subcarpeta y si no crearla
const crearSubCarpeta = async () => {
  const dirInfo = await FileSystem.getInfoAsync(PDF_SUBFOLDER);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(PDF_SUBFOLDER, { intermediates: true });
    console.log("📁 Carpeta de PDFs creada:", PDF_SUBFOLDER);
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

export const GenerarPDF = async ({ presupuesto, cortinas, colors }: pdfProps) => {
  const logo_empresa = await loadImageAsBase64(require('@/assets/images/ffalero.png'));
  const banco_republica = await loadImageAsBase64(require('@/assets/images/banco_republica.png'));
  const mercado_pago = await loadImageAsBase64(require('@/assets/images/mercado_pago.png'));
  const insta = await loadImageAsBase64(require('@/assets/images/instagram.png'));
  const face = await loadImageAsBase64(require('@/assets/images/facebook.png'));

  const html = `
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
      background-color: #106c6c;
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
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
      background-color: #94c0bb;
      height: 30px;
    }
    .divider-footer {
      background-color: #94c0bb;
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
      background-color: #117a7a;
      color: white;
      padding: 12px 8px;
      text-align: center;
      font-weight: 600;
    }

    td {
      padding: 10px 8px;
      border: 1px solid #ddd;
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
      font-size: 18px;
      color: #d32f2f;
      font-weight: bold;
    }

    .footer {
      margin-top: auto;
      color: white;
      border-radius: 0 0 8px 8px;
    }

    .footer-content {
      background-color: #117a7a;
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
      <img class="header-logo" src=${logo_empresa} alt="Logo FFalero">
      <div class="header-titles">
        <h3>${presupuesto.nombre_cliente || ''}</h3>
        <p>Fecha: ${presupuesto.fecha.toLocaleDateString()}</p>
      </div>
    </div>
  </div>
  <div class="divider"></div>

  <table>
    <thead>
      <tr>
        <th>Descripción</th>
        <th>Cant.</th>
        <th>Precio</th>
      </tr>
    </thead>
    <tbody>
      ${presupuesto.ventanas.map(ventana =>
    `<tr>
        <td>${ventana.tipo_abertura} ${abreviarCortina(ventana.id_cortina || 0, cortinas)} ${ventana.ancho} X ${ventana.alto} ${colors.find(c =>
      c.id === ventana.id_color_aluminio)?.color || ''}</td>
        <td style="text-align: center;">${ventana.cantidad}</td>
        <td style="text-align: center;">U$S ${(ventana.precio_unitario * ventana.cantidad).toFixed(2)}</td>
      </tr>`
  ).join('')}
    </tbody>
  </table>

  <div class="total-section">
    <span class="total-label">TOTAL A PAGAR:</span>
    <span class="total-amount">U$S ${presupuesto.precio_total.toFixed(2)}</span>
  </div>

    <div class="footer">
     <div class="divider-footer"></div>
      <div class="footer-content">
        <!-- Columna 1: Información de pago -->
        <div class="footer-section">
          <span class="footer-title">INFORMACIÓN DE PAGO:</span>
          <div class="payment-logos">
            <div class="payment-logo">
              <img class="br-logo" src=${banco_republica} alt="Banco República">
            </div>
            <div class="mp-logo-container">
              <img class="mp-logo" src=${mercado_pago} alt="Mercado Pago">
            </div>
          </div>
          <div>Nombre de cuenta: Federico Falero</div>
        </div>

        <!-- Columna 2: Contacto -->
        <div class="footer-section">
          <span class="footer-title">CONTACTO:</span>
          <div>WhatsApp: 099080052</div>
          <div style="font-size: 14px">eMail: Fedefalero20@gmail.com</div>
          <div class="social-icons">
            <img class="social-icon" src=${insta} alt="Instagram">
            <img class="social-icon" src=${face} alt="Facebook">
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
    // Crear subcarpeta si no existe
    await crearSubCarpeta();
    await cleanPDFsSubCarpeta(5);

    // Verificar si Sharing está disponible
    if (!(await Sharing.isAvailableAsync())) {
      throw new Error('La función de compartir no está disponible en este dispositivo');
    }

    // Generar PDF temporal
    const { uri: tempUri } = await Print.printToFileAsync({ html });
    if (!tempUri) throw new Error("No se pudo generar el PDF.");

    //  Definir nuevo nombre de pdf en la subcarpeta
    const nombreClienteLimpio = presupuesto.nombre_cliente.replace(/[^a-zA-Z0-9]/g, '_'); // Evitar nombres no admitidos para archivos
    const newFileName = `${PDF_SUBFOLDER}Presupuesto_${nombreClienteLimpio}_${new Date().getFullYear()}.pdf`;

    // Mover a la subcarpeta
    await FileSystem.moveAsync({
      from: tempUri,
      to: newFileName
    });

    // Compartir
    await Sharing.shareAsync(newFileName, {
      mimeType: 'application/pdf',
      dialogTitle: 'Compartir Presupuesto PDF',
    });

    // Limpieza final por si queda residual
    try {
      await FileSystem.deleteAsync(tempUri);
    } catch (cleanupError) {
      console.warn("⚠️ No se pudo limpiar el temporal:", cleanupError);
    }

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

export const listFilesInDirectory = async () => {
  try {
    const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory as string);
    console.log("Archivos en la carpeta:", files);
    return files;
  } catch (error) {
    console.error("Error al listar archivos:", error);
    return [];
  }
};