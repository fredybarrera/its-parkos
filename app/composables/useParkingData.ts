// Interfaz de datos del estacionamiento. ÚNICA puerta de entrada a
// sesiones/plazas/abonados/tarifa para componentes y pantallas.
//
// Hoy delega en el store mock (stores/parking.ts), que a su vez parte del
// seed. El día que haya backend, esta función cambia de implementación
// (fetch a una API) sin que ningún componente se entere: siguen llamando a
// useParkingData() igual que ahora.

import { useParkingStore } from '~/stores/parking'
import type { NuevoAbonado, AgregarAbonadoResultado } from '~/stores/parking'
import type {
  Abonado,
  Comprobante,
  Plaza,
  PlazaEstado,
  ReporteDia,
  Sesion,
  SesionOrigen,
  Tarifa,
} from '~/domain/types'

export interface ParkingDataApi {
  getSesiones(): Sesion[]
  registrarIngreso(patente: string, origen: SesionOrigen): Sesion
  registrarSalida(sesionId: string): Comprobante
  getPlazas(): Plaza[]
  setEstadoPlaza(plazaId: string, estado: PlazaEstado): void
  getAbonados(): Abonado[]
  agregarAbonado(data: NuevoAbonado): AgregarAbonadoResultado
  getTarifa(): Tarifa
  setTarifa(tarifa: Tarifa): void
  getReporteDia(): ReporteDia
  /** Vuelve sesiones/plazas/abonados/tarifa al estado semilla inicial. */
  reset(): void
}

export function useParkingData(): ParkingDataApi {
  const store = useParkingStore()

  return {
    getSesiones: () => store.sesiones,
    registrarIngreso: (patente, origen) => store.registrarIngreso(patente, origen),
    registrarSalida: (sesionId) => store.registrarSalida(sesionId),
    getPlazas: () => store.plazas,
    setEstadoPlaza: (plazaId, estado) => store.setEstadoPlaza(plazaId, estado),
    getAbonados: () => store.abonados,
    agregarAbonado: (data) => store.agregarAbonado(data),
    getTarifa: () => store.tarifa,
    setTarifa: (tarifa) => store.setTarifa(tarifa),
    getReporteDia: () => store.getReporteDia(),
    reset: () => store.reset(),
  }
}
