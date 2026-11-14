/**
 * Durações que o JavaScript precisa de saber (atraso do tooltip do Radix,
 * limpeza de estado). São espelho de styles/motion.css: o teste
 * motion-tokens.test.ts falha se divergirem.
 */
export const MOTION_MS = {
  micro: 80,
  quick: 150,
  fast: 250,
} as const;
