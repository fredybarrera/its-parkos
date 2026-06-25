// Store del estacionamiento: sesiones, plazas, abonados y tarifa vigente.
// Es la implementación mock detrás de useParkingData. Nadie fuera de ese
// composable debería importar este store ni el seed directamente.

import { defineStore } from 'pinia'
import { calcularMinutosTranscurridos, calcularMonto } from '~/domain/billing'
import { generarTicketCode } from '~/domain/ticket'
import { SEED_ABONADOS, SEED_PLAZAS, SEED_SESIONES, SEED_TARIFA } from '~/mocks/seed'
import type {
  Abonado,
  Comprobante,
  HoraPico,
  Plaza,
  PlazaEstado,
  ReporteDia,
  Sesion,
  SesionOrigen,
  Tarifa,
} from '~/domain/types'

/** Resultado de intentar agregar un abonado: deja lugar a un rechazo por
 *  límite de plan, aunque esa regla se cablea en la Etapa 6. */
export type AgregarAbonadoResultado =
  | { ok: true; abonado: Abonado }
  | { ok: false; motivo: string }

export type NuevoAbonado = Pick<Abonado, 'nombre' | 'patente' | 'vigenteHasta'>

export const useParkingStore = defineStore('parking', {
  state: () => ({
    sesiones: structuredClone(SEED_SESIONES) as Sesion[],
    plazas: structuredClone(SEED_PLAZAS) as Plaza[],
    abonados: structuredClone(SEED_ABONADOS) as Abonado[],
    tarifa: structuredClone(SEED_TARIFA) as Tarifa,
  }),

  getters: {
    sesionesActivas: (state): Sesion[] => state.sesiones.filter((s) => s.estado === 'activa'),
  },

  actions: {
    registrarIngreso(patente: string, origen: SesionOrigen): Sesion {
      const id = `ses-${crypto.randomUUID()}`
      const sesion: Sesion = {
        id,
        patente,
        horaEntrada: new Date().toISOString(),
        horaSalida: null,
        estado: 'activa',
        origen,
        monto: null,
        ...(origen === 'ticket' && { ticketCode: generarTicketCode(id) }),
      }
      this.sesiones.push(sesion)
      return sesion
    },

    buscarSesionPorTicket(code: string): Sesion | null {
      return this.sesiones.find(
        (s) => s.estado === 'activa' && s.ticketCode === code,
      ) ?? null
    },

    registrarSalida(sesionId: string): Comprobante {
      const sesion = this.sesiones.find((s) => s.id === sesionId)
      if (!sesion) {
        throw new Error(`Sesión no encontrada: ${sesionId}`)
      }

      const horaSalida = new Date().toISOString()
      const tiempoTotalMinutos = calcularMinutosTranscurridos(sesion.horaEntrada, horaSalida)
      const monto = calcularMonto(this.tarifa, tiempoTotalMinutos)

      sesion.horaSalida = horaSalida
      sesion.estado = 'cerrada'
      sesion.monto = monto

      // Si la sesión tenía plaza asociada, queda libre.
      const plaza = this.plazas.find((p) => p.sesionId === sesionId)
      if (plaza) {
        plaza.estado = 'libre'
        plaza.sesionId = null
      }

      return {
        id: `comp-${crypto.randomUUID()}`,
        sesionId: sesion.id,
        patente: sesion.patente,
        tiempoTotalMinutos,
        monto,
        fecha: horaSalida,
      }
    },

    setEstadoPlaza(plazaId: string, estado: PlazaEstado) {
      const plaza = this.plazas.find((p) => p.id === plazaId)
      if (!plaza) {
        throw new Error(`Plaza no encontrada: ${plazaId}`)
      }
      plaza.estado = estado
      if (estado === 'libre') {
        plaza.sesionId = null
      }
    },

    agregarAbonado(data: NuevoAbonado): AgregarAbonadoResultado {
      // Sin regla de límite acá a propósito: se conecta con useEntitlements
      // en la Etapa 6. Esta acción siempre agrega.
      const abonado: Abonado = {
        id: `abo-${crypto.randomUUID()}`,
        estado: 'activo',
        ...data,
      }
      this.abonados.push(abonado)
      return { ok: true, abonado }
    },

    setTarifa(tarifa: Tarifa) {
      this.tarifa = tarifa
    },

    /** Vuelve sesiones/plazas/abonados/tarifa al estado semilla inicial.
     *  Útil para repetir el demo con el próximo prospecto sin recargar. */
    reset() {
      this.sesiones = structuredClone(SEED_SESIONES)
      this.plazas = structuredClone(SEED_PLAZAS)
      this.abonados = structuredClone(SEED_ABONADOS)
      this.tarifa = structuredClone(SEED_TARIFA)
    },

    getReporteDia(): ReporteDia {
      const cerradas = this.sesiones.filter((s) => s.estado === 'cerrada')
      const ingresosTotales = cerradas.reduce((sum, s) => sum + (s.monto ?? 0), 0)
      const vehiculosAtendidos = this.sesiones.length

      const ocupadas = this.plazas.filter((p) => p.estado === 'ocupada').length
      const ocupacionPromedio = this.plazas.length === 0
        ? 0
        : Math.round((ocupadas / this.plazas.length) * 100)
      const rotacion = this.plazas.length === 0
        ? 0
        : Math.round((vehiculosAtendidos / this.plazas.length) * 10) / 10

      const conteoPorHora = new Map<number, number>()
      for (const s of this.sesiones) {
        const hora = new Date(s.horaEntrada).getHours()
        conteoPorHora.set(hora, (conteoPorHora.get(hora) ?? 0) + 1)
      }
      const horasPico: HoraPico[] = [...conteoPorHora.entries()]
        .map(([hora, vehiculos]) => ({ hora, vehiculos }))
        .sort((a, b) => b.vehiculos - a.vehiculos)
        .slice(0, 3)

      return {
        fecha: new Date().toISOString(),
        ingresosTotales,
        vehiculosAtendidos,
        rotacion,
        ocupacionPromedio,
        horasPico,
      }
    },
  },
})
