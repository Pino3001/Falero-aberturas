// GenerarPDF.tsx
import React from 'react';
import { Button, View } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useBD } from '@/contexts/BDContext';
import { abreviarCortina } from './calculos';
import { PresupuestosOption } from './interfases';
interface pdfProps {
    presupuestoPdf: PresupuestosOption,

}
const GenerarPDF = ({ presupuestoPdf }: pdfProps) => {
    const { stateBD } = useBD();
    const { series, colors, cortinas } = stateBD;
    const generarPDF = async () => {
        const html = `
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 24px;
      color: #333;
    }
    .header {
      background-color:rgb(18, 142, 142);
      color: white;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
    }
    h1, h3 { margin: 0; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th {
      background-color:rgb(18, 142, 142);
      color: white;
      padding: 10px;
    }
    td {
      padding: 8px;
      border: 1px solid #ccc;
      text-align: center;
    }
    .footer {
      margin-top: 30px;
      padding: 12px;
      color: white;
      background-color:rgb(18, 142, 142);
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Presupuesto de aberturas</h1>
    <h3>${presupuestoPdf.nombre_cliente || ''}</h3>
    <p>${presupuestoPdf.fecha.toLocaleDateString()}</p>
    <p>RUTA 11 KM 145, EL TALITA<br/>SAN JACINTO - CANELONES<br/>099080052</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>Descripción</th>
        <th>Cant.</th>
        <th>Precio</th>
      </tr>
    </thead>
    <tbody>
        ${presupuestoPdf.ventanas.map(ventana =>
      ` <tr><td>${abreviarCortina(ventana.id_cortina || 0, cortinas )} ${ventana.ancho} X ${ventana.alto} ${colors.find(c => c.id === ventana.id_color_aluminio)?.color || ''}</td><td>${ventana.cantidad}</td><td>U$S 850</td></tr>
             ` ).join('')}

    </tbody>
  </table>
<div style="text-align: right; margin: 20px 0; margin-right: 30px;">
  <h2 style="display: inline-block; margin: 0 10px; font-size: 18px; font-weight: bold;">TOTAL A PAGAR:</h2>
  <h2 style="display: inline-block; margin: 0; font-size: 18px; color: red; font-weight: bold;">U$S ${presupuestoPdf.precio_total.toFixed(2)}</h2>
</div>
  <div class="footer">
    <strong>INFORMACIÓN DE PAGO:</strong><br/>
    Fedefalero20@gmail.com<br/>
    Nombre de cuenta: Federico Falero<br/>
    Carpintería Federico Falero
  </div>
</body>
</html>
`;


        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri);
    };

    return (
        <View style={{ marginTop: 50, paddingHorizontal: 20 }}>
            <Button title="Generar PDF" onPress={generarPDF} />
        </View>
    );
};

export default GenerarPDF;
