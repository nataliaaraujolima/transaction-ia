export function buildDedupKey(params: {
  userId: string;
  slotId: string;
  sessionId: string;
  dayUTC?: string;
}): string {
  const dayUTC = params.dayUTC ?? new Date().toISOString().slice(0, 10);
  return `${params.userId}:${params.slotId}:${params.sessionId}:${dayUTC}`;
}
