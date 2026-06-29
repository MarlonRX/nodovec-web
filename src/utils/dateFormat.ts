import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

/**
 * Parsea una fecha evitando el bug de timezone.
 *
 * `new Date("2026-06-29")` se interpreta como UTC y al mostrarlo en
 * locale local se desplaza un día atrás en timezones negativos.
 * Especificando el formato de entrada con `dayjs(value, "YYYY-MM-DD")`
 * se trata la fecha como local y no hay corrimiento.
 */
function parseSafe(value: string | Date): dayjs.Dayjs | null {
  if (value instanceof Date) {
    const d = dayjs(value);
    return d.isValid() ? d : null;
  }

  // Intentar parseo con formato explícito ISO date
  const d1 = dayjs(value, "YYYY-MM-DD");
  if (d1.isValid()) return d1;

  // Fallback: parseo directo
  const d2 = dayjs(value);
  if (d2.isValid()) return d2;

  return null;
}

/**
 * Formatea una fecha al formato DD-MM-YYYY.
 */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = parseSafe(value);
  return d ? d.format("DD-MM-YYYY") : "—";
}

/**
 * Formatea una fecha mostrando solo mes y año (MM/YY).
 * Útil para fechas de vencimiento de tarjetas.
 */
export function formatMonthYear(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = parseSafe(value);
  return d ? d.format("MM/YY") : "—";
}

/**
 * Formatea una fecha para mostrar en formato corto.
 * Ejemplo: "15 Jun 2026" o "15 jun 2026" según locale.
 */
export function formatDateShort(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = parseSafe(value);
  if (!d) return "—";
  return d.format("D MMM YYYY");
}
