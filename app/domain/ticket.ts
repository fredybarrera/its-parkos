// Lógica pura de tickets de barras. Sin dependencias externas.

/**
 * Deriva un código único de ticket a partir del id de sesión.
 * Formato: "TK" + 8 caracteres hex en mayúsculas.
 * No es la patente; es el identificador del ticket para el barcode CODE128.
 */
export function generarTicketCode(sesionId: string): string {
  const hex = sesionId.replace('ses-', '').replace(/-/g, '').toUpperCase()
  return `TK${hex.slice(0, 8)}`
}
