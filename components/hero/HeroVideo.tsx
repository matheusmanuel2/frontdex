'use client';

import { useEffect, useRef, useState } from 'react';

type Sources = { av1: string; h264: string };

const AV1_TYPE = 'video/webm; codecs="av01.0.08M.10"';

function pickSources(): Sources {
  const size = window.matchMedia('(max-width: 960px)').matches ? 960 : 1440;
  return { av1: `/hero/hero-loop-${size}.webm`, h264: `/hero/hero-loop-${size}.mp4` };
}

/**
 * Loop de vídeo do hero (decisions/0009). Fica por cima do poster, que já é o
 * primeiro frame do vídeo, por isso a troca não se vê.
 * - Só monta depois do `load` e nunca com movimento reduzido ou Save-Data.
 * - AV1 só quando o browser garante que o descodifica ("probably"); senão H.264
 *   (o Safari sem AV1 em hardware). Se a fonte falhar, passa para o H.264.
 * - Só se vê enquanto toca; se o autoplay for proibido (Modo de Pouca Energia), fica o poster.
 * - Pausa quando o hero sai do ecrã.
 */
export function HeroVideo() {
  const [src, setSrc] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const sourcesRef = useRef<Sources | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduced || saveData) return;
    const start = () => {
      const sources = pickSources();
      sourcesRef.current = sources;
      const av1 = document.createElement('video').canPlayType(AV1_TYPE) === 'probably';
      setSrc(av1 ? sources.av1 : sources.h264);
    };
    if (document.readyState === 'complete') {
      start();
      return;
    }
    window.addEventListener('load', start, { once: true });
    return () => window.removeEventListener('load', start);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // O Safari decide o autoplay pelo estado `muted` do elemento: garante-o antes de tocar.
    video.muted = true;
    const play = () =>
      video.play().catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'NotAllowedError') setBlocked(true);
      });
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) void play();
      else video.pause();
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, [src]);

  if (!src || blocked) return null;

  return (
    <video
      ref={videoRef}
      key={src}
      src={src}
      className="t-hero-video pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
      controls={false}
      disablePictureInPicture
      disableRemotePlayback
      onPlaying={(event) => event.currentTarget.setAttribute('data-playing', '')}
      onPause={(event) => event.currentTarget.removeAttribute('data-playing')}
      onError={() => {
        const h264 = sourcesRef.current?.h264;
        if (h264 && src !== h264) setSrc(h264);
        else setBlocked(true);
      }}
    />
  );
}
