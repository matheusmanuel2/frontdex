/**
 * Regras de movimento (spec 004/006, T-304): durações, easings e @keyframes
 * só existem em styles/motion.css. Usado pelo teste de movimento e, no M8,
 * pelo pnpm check:anti-ai.
 */
export type MotionViolation = { file: string; line: number; rule: string; text: string };

export const MOTION_SOURCE = 'styles/motion.css';

const CSS_RULES: [RegExp, string][] = [
  [/@keyframes\b/, '@keyframes fora de styles/motion.css'],
  [/\b(transition|animation)(-duration|-delay)?\s*:[^;]*\b\d+(\.\d+)?m?s\b/, 'duração escrita à mão'],
  [/\b(transition|animation)(-timing-function)?\s*:[^;]*cubic-bezier\(/, 'easing escrito à mão'],
];

const CODE_RULES: [RegExp, string][] = [
  [/\b(duration|delay)-(\d+|\[[^\]]+\])/, 'duração do Tailwind escrita à mão (usa os recipes t-*)'],
  [/\bease-\[[^\]]+\]/, 'easing do Tailwind escrito à mão'],
  [/\banimate-(spin|ping|pulse|bounce|\[)/, 'animação do Tailwind (usa os recipes t-*)'],
  [/\b(transitionDuration|animationDuration|transitionDelay)\s*:\s*['"`]?\d/, 'duração inline'],
  [/\btransition\s*:\s*['"`][^'"`]*\d+m?s/, 'duração inline'],
  [/\bduration\s*:\s*\d/, 'duração de biblioteca de animação'],
];

export function findMotionViolations(file: string, source: string): MotionViolation[] {
  if (file === MOTION_SOURCE) return [];
  const rules = file.endsWith('.css') ? CSS_RULES : CODE_RULES;
  const violations: MotionViolation[] = [];
  source.split('\n').forEach((text, index) => {
    for (const [pattern, rule] of rules) {
      if (pattern.test(text)) violations.push({ file, line: index + 1, rule, text: text.trim() });
    }
  });
  return violations;
}
