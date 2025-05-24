import { ColorSerieOption, Perfiles, PerfilesSerieOption, SerieOption, PreciosVarios } from "@/contexts/BDContext";

interface CalculoPrecioVentanaParams {
    anchoV: number;
    altoV: number;
    serie: number;
    color: number;
    mosquitero: boolean;
    vidrio: boolean;
}

export function calcularPrecioVentana(
    params: CalculoPrecioVentanaParams,
    perfilesSerie: PerfilesSerieOption[],
    perfiles: Perfiles[],
    preciosSerieColor: ColorSerieOption[],
    series: SerieOption[],
    preciosVarios: PreciosVarios[]

): number {
    const { anchoV, altoV, serie, color } = params;
    const { pesoTotalVentana } = CalculoPesoVentana({ anchoV, altoV, serie }, perfilesSerie, perfiles, series);
    const precioAluminoColor = calcularPrecioColor({ peso: pesoTotalVentana, color, serie }, preciosSerieColor);
    let precioVidrio = 0;
    let precioMosquitero = 0;

    if (params.vidrio) {
        precioVidrio = calcularPrecioVidrio(params.altoV, params.anchoV, preciosVarios);;
    }

    if (params.mosquitero) {
        precioMosquitero = calcularPrecioMosquitero(params.altoV, params.anchoV, preciosVarios);;
    }

    console.log('mosquito', precioMosquitero, params.mosquitero)
    const precioAccesorios = series.find((s) => s.id === serie)?.precio_accesorios || 0;
    const manoObra = preciosVarios.find((p) => p.id === '1')?.precio || 0;
    const precioFinal = (precioAluminoColor.precioTotal + precioVidrio + precioMosquitero + precioAccesorios) * manoObra; // 30% de ganancia
    return (precioFinal) ; // 30% de ganancia
}

interface CalculoCostoKiloParams {
    peso: number;
    color: string;
    serie: string;
}

interface ResultadoCalculo {
    precioTotal: number;
}

export function calcularPrecioColor(
    params: CalculoCostoKiloParams,
    preciosSerieColor: ColorSerieOption[]
): ResultadoCalculo {
    const { peso, color, serie } = params;
    const precioBasePorKilo = preciosSerieColor.find((c) => c.color_id === color && c.serie_id === serie)?.precio_kilo || 0;
    if (peso <= 0) throw new Error('El peso debe ser mayor que cero');
    if (precioBasePorKilo <= 0) throw new Error('El precio base por kilo debe ser mayor que cero');
    if (!preciosSerieColor.some(c => c.color_id === color && c.serie_id === serie)) throw new Error('Color no válido');

    const pesoKilo = peso / 1000; // Convertir a kilos
    console.log('pesoKilo', pesoKilo);
    console.log('precioBasePorKilo', precioBasePorKilo);
    const precioTotal = pesoKilo * precioBasePorKilo;


    return { precioTotal };
}

interface CalculoPesoVentanaParams {
    anchoV: number,
    altoV: number,
    serie: string,
}

interface ResultadoPesoVentana {
    detalle: Array<{
        perfil_id: string;
        nombre: string;
        gramos: number;
        pesoPerfil: number;
        resultado: number;
    }>;
    pesoTotalVentana: number;
}

export function CalculoPesoVentana(
    params: CalculoPesoVentanaParams,
    perfilesSerie: PerfilesSerieOption[],
    perfiles: Perfiles[],
    series: SerieOption[]
): ResultadoPesoVentana {
    const { anchoV, altoV, serie } = params;

    const perfilesDeLaSerie = perfilesSerie.filter((p) => p.serie_id === serie);
    if (!perfilesDeLaSerie) throw new Error('Serie no válida');

    const detalle = perfilesDeLaSerie.map(perfilSerie => {
        const perfil = perfiles.find(p => p.perfil_id === perfilSerie.perfil_id);
        if (!perfil) throw new Error(`No se encontró el perfil con ID ${perfilSerie.perfil_id}`);

        const pesoPerfil = determinarPesoPerfil(serie, perfil.nombre, anchoV, altoV, series) * perfilSerie.gramos_m2;

        return {
            perfil_id: perfilSerie.perfil_id,
            nombre: perfil.nombre,
            gramos: perfilSerie.gramos_m2,
            pesoPerfil,
            resultado: pesoPerfil
        };
    });

    const pesoTotalVentana = detalle.reduce((sum, item) => sum + item.resultado, 0);

    return {
        detalle,
        pesoTotalVentana: parseFloat(pesoTotalVentana.toFixed(2)),
    };
}

function determinarPesoPerfil(
    serie_id: string,
    nombrePerfil: string,
    ancho: number, // Ancho de la ventana en metros
    alto: number, // Altura de la ventana en metros
    series: SerieOption[],
): number {
    const serieSeleccionada = series.find((s) => s.id === serie_id);
    const nombre = nombrePerfil.toLowerCase();

    if (nombre.includes('marco superior') || nombre.includes('marco inferior') || nombre.includes('hoja superior') || nombre.includes('hoja inferior')) {
        return ancho / 100;
    }
    if (nombre.includes('marco lateral') || nombre.includes('hoja lateral')) {
        return (2 * alto / 100);
    }
    if (serieSeleccionada?.nombre === 'SERIE 25 2H') {
        if (nombre.includes('hoja enganche c')) {
            return (2 * alto) / 100;
        }
    }
    if (serieSeleccionada?.nombre === 'SERIE 25 3H') {
        if (nombre.includes('hoja enganche c')) {
            return (4 * alto) / 100;
        }
    }
    if (serieSeleccionada?.nombre === 'SERIE 20') {
        if (nombre.includes('hoja enganche c')) {
            return 0;
        }
    }
    console.warn(`No se pudo determinar multiplicador para perfil "${nombrePerfil}". Usando ancho por defecto.`);
    return 0;
}

function calcularPrecioVidrio(
    altoV: number,
    anchoV: number,
    precioVidrio: PreciosVarios[],
): number {
    const precioVidrioBase = precioVidrio.find((p) => p.nombre === 'Vidrio')?.precio || 0;
    const areaVidrio = (altoV * anchoV) / 10000; // Convertir a m2
    console.log('areaVidrio', areaVidrio);
    console.log('precioVidrioBase', precioVidrioBase);
    const precioTotalVidrio = areaVidrio * precioVidrioBase;

    return parseFloat(precioTotalVidrio.toFixed(2));
}

function calcularPrecioMosquitero(
    altoV: number,
    anchoV: number,
    precioMosquitero: PreciosVarios[],
): number {
    const precioMosquiteroBase = precioMosquitero.find((p) => p.nombre === 'Mosquitero')?.precio || 0;
    const areaMosquitero = (altoV * anchoV) / 10000; // Convertir a m2
    console.log('precioMosquiteroBase', precioMosquiteroBase);
    console.log('areaMosquitero', areaMosquitero);

    const precioTotalMosquitero = areaMosquitero * precioMosquiteroBase;

    return parseFloat(precioTotalMosquitero.toFixed(2));
}