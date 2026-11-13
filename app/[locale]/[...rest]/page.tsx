import { notFound } from 'next/navigation';

/**
 * Qualquer rota desconhecida dentro de /pt ou /en mostra a 404 desse idioma.
 * Sem parâmetros estáticos e sem dynamicParams: nada corre no servidor, o build gera a 404.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return [];
}

export default function CatchAll() {
  notFound();
}
