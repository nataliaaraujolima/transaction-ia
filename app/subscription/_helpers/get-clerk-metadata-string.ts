export function getClerkMetadataString(metadata: Record<string, unknown>, metadataKey: string) {
  const metadataValue = metadata[metadataKey];
  return typeof metadataValue === "string" ? metadataValue : undefined;
}
