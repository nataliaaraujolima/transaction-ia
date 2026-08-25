export function toStripeId(value: string | { id: string } | null | undefined) {
  if (!value) {
    return undefined;
  }

  return typeof value === "string" ? value : value.id;
}
