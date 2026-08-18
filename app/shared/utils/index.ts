export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "0,00";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
