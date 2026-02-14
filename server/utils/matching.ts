export function computeSimilarityScore(
  sessionDataA: any,
  sessionDataB: any
): number {
  if (!sessionDataA || !sessionDataB) return 0;

  const s1A = sessionDataA.session1;
  const s12A = sessionDataA.session12;
  const s1B = sessionDataB.session1;
  const s12B = sessionDataB.session12;

  if (!s1A || !s12A || !s1B || !s12B) return 0;

  const allKeys = new Set([
    ...Object.keys(s1A),
    ...Object.keys(s12A),
    ...Object.keys(s1B),
    ...Object.keys(s12B),
  ]);

  const improvA: number[] = [];
  const improvB: number[] = [];

  for (const key of allKeys) {
    if (
      typeof s1A[key] === "number" &&
      typeof s12A[key] === "number" &&
      typeof s1B[key] === "number" &&
      typeof s12B[key] === "number"
    ) {
      improvA.push(s12A[key] - s1A[key]);
      improvB.push(s12B[key] - s1B[key]);
    }
  }

  if (improvA.length === 0) return 0;

  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < improvA.length; i++) {
    dotProduct += improvA[i] * improvB[i];
    magA += improvA[i] * improvA[i];
    magB += improvB[i] * improvB[i];
  }

  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);

  if (magA === 0 || magB === 0) return 0;

  const cosine = dotProduct / (magA * magB);
  return Math.max(0, Math.min(1, (cosine + 1) / 2));
}
