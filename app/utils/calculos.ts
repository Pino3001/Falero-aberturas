import { cortinasAbrevEnum, cortinasEnum } from "@/constants/variablesGlobales";
import { CortinaOption, PresupuestosOption } from "@/contexts/BDContext"


interface aComprarProps {
    presupuestos : PresupuestosOption[]
}


const calculoPerfilesAcomprar = ({presupuestos} : aComprarProps) => {


    

}



export const abreviarCortina = (cortina_id: number, cortinas: CortinaOption[]) : cortinasAbrevEnum => {
    const cortinaSeleccionada = cortinas.find(s => s.id === cortina_id);
    if (cortinaSeleccionada){
        if(cortinaSeleccionada.tipo === cortinasEnum.cortinapanelaluminioH25) return cortinasAbrevEnum.cortinapanelaluminioH25;
        else if(cortinaSeleccionada.tipo === cortinasEnum.cortinapvch25) return cortinasAbrevEnum.cortinapvch25;
        else if(cortinaSeleccionada.tipo === cortinasEnum.monoblockconpanelaluminio) return cortinasAbrevEnum.monoblockconpanelaluminio;
        else if(cortinaSeleccionada.tipo === cortinasEnum.monoblockenpvc) return cortinasAbrevEnum.monoblockenpvc;
    }
    return cortinasAbrevEnum.ninguna;

}