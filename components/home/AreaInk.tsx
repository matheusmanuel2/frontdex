'use client';

import { useEffect, useRef } from 'react';

const VERTEX_SHADER = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FRAGMENT_SHADER = `
precision highp float;
uniform vec2 R;uniform float T;uniform vec2 M;uniform float V;
uniform vec3 C1;uniform vec3 C2;uniform vec3 C3;uniform vec3 C4;
uniform float RV;uniform float O;uniform float VL;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);
 for(int i=0;i<4;i++){v+=a*n(p);p=m*p;a*=.5;}return v;}
float veilLinear(float y){
 if(y<.28)return mix(.82,.62,y/.28);
 if(y<.55)return mix(.62,.3,(y-.28)/.27);
 if(y<.72)return mix(.3,.32,(y-.55)/.17);
 return mix(.32,.75,(y-.72)/.28);
}
void main(){
 vec2 uv=gl_FragCoord.xy/R;vec2 asp=vec2(R.x/R.y,1.);
 vec2 p=uv*asp*1.15;vec2 m=M*asp*1.15;
 vec2 d=p-m;float fall=exp(-dot(d,d)*3.);
 float t=T*.045;
 p-=d*fall*(.25+V*1.2);
 p+=vec2(-d.y,d.x)*fall*V*1.5;
 vec2 q=vec2(fbm(p+vec2(0.,t)),fbm(p+vec2(5.2,1.3)-t));
 vec2 r=vec2(fbm(p+2.9*q+vec2(1.7,9.2)+.1*T*.1),fbm(p+2.9*q+vec2(8.3,2.8)-.08*T*.1));
 float f=fbm(p+2.9*r);
 vec3 col=mix(C1,C2,clamp(f*f*2.2,0.,1.));
 col=mix(col,C1*.85,clamp(length(q)-.55,0.,1.));
 float vein=smoothstep(.62,.9,r.x+f*.35);
 col=mix(col,C3,vein*.7);
 col=mix(col,C3,fall*.28*smoothstep(.35,.85,f));
 col*=.92+.08*f;
 float corner=length(gl_FragCoord.xy-vec2(R.x,0.))/(length(R)*.70710678);
 float ink=clamp((RV-corner)/.24,0.,1.)*O;
 float top=1.-uv.y;
 float glow=.65*(1.-min(length(vec2(uv.x/1.2,top/.7))/.7,1.));
 float veil=(1.-(1.-glow)*(1.-veilLinear(top)))*VL;
 float a=1.-(1.-ink)*(1.-veil);
 vec3 c=col*ink*(1.-veil)+C4*veil;
 gl_FragColor=vec4(c,a);
}`;

const SCALE = 0.45;
const REST: [number, number] = [0.88, 0.12];
/** Revelação a partir do canto (section-2.html): raio da máscara em repouso e no hover. */
const REVEAL_REST = 0.42;
const REVEAL_ACTIVE = 1.9;
const INK_REST = 0.5;
const INK_REST_EMPTY = 0.35;
/** Tempo interno do shader (ADR 0011): raio em 900 ms, tinta e véu em 700 ms. */
const REVEAL_MS = 900;
const FADE_MS = 700;

type Tween = { from: number; to: number; start: number; span: number };

function easeOut(progress: number): number {
  return 1 - (1 - progress) ** 4;
}

function tweenValue(tween: Tween, now: number): number {
  if (tween.span <= 0) return tween.to;
  const progress = Math.min(1, Math.max(0, (now - tween.start) / tween.span));
  return tween.from + (tween.to - tween.from) * easeOut(progress);
}

function retarget(tween: Tween, to: number, now: number, span: number): Tween {
  return { from: tweenValue(tween, now), to, start: now, span };
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) {
    console.error('Não foi possível criar o shader de tinta das áreas.');
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Falha ao compilar o shader de tinta das áreas:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function tokenColor(element: Element, name: string): Float32Array | null {
  const value = getComputedStyle(element).getPropertyValue(name).trim();
  const match = /^#([\da-f]{6})$/i.exec(value);
  if (!match?.[1]) return null;

  const color = Number.parseInt(match[1], 16);
  return new Float32Array([((color >> 16) & 255) / 255, ((color >> 8) & 255) / 255, (color & 255) / 255]);
}

export function AreaInk() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const card = canvas?.parentElement;
    if (!canvas || !card) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const gl = canvas.getContext('webgl', {
      antialias: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: reducedMotion,
    });
    if (!gl) return;

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) {
      if (vertexShader) gl.deleteShader(vertexShader);
      if (fragmentShader) gl.deleteShader(fragmentShader);
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      console.error('Não foi possível criar o programa WebGL da tinta das áreas.');
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Falha ao ligar o programa WebGL da tinta das áreas:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return;
    }

    const buffer = gl.createBuffer();
    const position = gl.getAttribLocation(program, 'p');
    const resolution = gl.getUniformLocation(program, 'R');
    const time = gl.getUniformLocation(program, 'T');
    const mouse = gl.getUniformLocation(program, 'M');
    const velocity = gl.getUniformLocation(program, 'V');
    const colorOne = gl.getUniformLocation(program, 'C1');
    const colorTwo = gl.getUniformLocation(program, 'C2');
    const colorThree = gl.getUniformLocation(program, 'C3');
    const veilColor = gl.getUniformLocation(program, 'C4');
    const revealRadius = gl.getUniformLocation(program, 'RV');
    const inkOpacity = gl.getUniformLocation(program, 'O');
    const veilOpacity = gl.getUniformLocation(program, 'VL');
    const firstColor = tokenColor(card, '--area-ink-1');
    const secondColor = tokenColor(card, '--area-ink-2');
    const thirdColor = tokenColor(card, '--area-ink-3');
    const fourthColor = tokenColor(card, '--color-ink');

    if (
      !buffer ||
      position < 0 ||
      !resolution ||
      !time ||
      !mouse ||
      !velocity ||
      !colorOne ||
      !colorTwo ||
      !colorThree ||
      !veilColor ||
      !revealRadius ||
      !inkOpacity ||
      !veilOpacity
    ) {
      console.error('WebGL não disponibilizou os recursos necessários para a tinta das áreas.');
      if (buffer) gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      return;
    }
    if (!firstColor || !secondColor || !thirdColor || !fourthColor) {
      console.error('Não foi possível ler as cores dos tokens da tinta das áreas.');
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      return;
    }

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.uniform3fv(colorOne, firstColor);
    gl.uniform3fv(colorTwo, secondColor);
    gl.uniform3fv(colorThree, thirdColor);
    gl.uniform3fv(veilColor, fourthColor);
    gl.clearColor(0, 0, 0, 0);
    canvas.dataset.ready = '';

    const inkRest = card.hasAttribute('data-empty') ? INK_REST_EMPTY : INK_REST;
    let reveal: Tween = { from: REVEAL_REST, to: REVEAL_REST, start: 0, span: 0 };
    let fade: Tween = { from: 0, to: 0, start: 0, span: 0 };
    const setActive = (next: boolean) => {
      const now = performance.now();
      reveal = retarget(reveal, next ? REVEAL_ACTIVE : REVEAL_REST, now, reducedMotion ? 0 : REVEAL_MS);
      fade = retarget(fade, next ? 1 : 0, now, reducedMotion ? 0 : FADE_MS);
    };

    let active = false;
    let visible = false;
    let running = false;
    let tick = 0;
    let animationFrame = 0;
    const startedAt = performance.now();
    let target: [number, number] = [...REST];
    const current: [number, number] = [...REST];
    let speed = 0;

    const draw = (now: number) => {
      const settling = now < reveal.start + reveal.span || now < fade.start + fade.span;
      if (!reducedMotion && !active && !settling && tick++ % 2 === 1) return;

      const dx = target[0] - current[0];
      const dy = target[1] - current[1];
      current[0] += dx * 0.045;
      current[1] += dy * 0.045;
      speed = speed * 0.95 + Math.min(Math.hypot(dx, dy), 0.5) * 0.08;
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform1f(time, reducedMotion ? 0 : (now - startedAt) / 1000);
      gl.uniform2f(mouse, current[0], current[1]);
      gl.uniform1f(velocity, reducedMotion ? 0 : speed);
      const fadeValue = tweenValue(fade, now);
      gl.uniform1f(revealRadius, tweenValue(reveal, now));
      gl.uniform1f(inkOpacity, inkRest + (1 - inkRest) * fadeValue);
      gl.uniform1f(veilOpacity, fadeValue);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const frame = (now: number) => {
      animationFrame = 0;
      if (!active && !visible) {
        running = false;
        return;
      }

      draw(now);
      animationFrame = requestAnimationFrame(frame);
    };

    const start = () => {
      if (reducedMotion) {
        draw(performance.now());
        return;
      }
      if (!running && (active || visible)) {
        running = true;
        animationFrame = requestAnimationFrame(frame);
      }
    };

    const resize = () => {
      const bounds = card.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(bounds.width * SCALE));
      canvas.height = Math.max(1, Math.floor(bounds.height * SCALE));
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (visible) start();
    };

    const moveToPointer = (event: PointerEvent) => {
      const bounds = card.getBoundingClientRect();
      if (bounds.width === 0 || bounds.height === 0) return;
      target = [(event.clientX - bounds.left) / bounds.width, 1 - (event.clientY - bounds.top) / bounds.height];
    };
    const onPointerEnter = (event: PointerEvent) => {
      moveToPointer(event);
      active = true;
      setActive(true);
      start();
    };
    const onPointerLeave = () => {
      if (card.matches(':focus-within')) return;
      active = false;
      target = [...REST];
      setActive(false);
      start();
    };
    const onFocusIn = () => {
      active = true;
      setActive(true);
      start();
    };
    const onFocusOut = (event: FocusEvent) => {
      if (event.relatedTarget instanceof Element && card.contains(event.relatedTarget)) return;
      if (card.matches(':hover')) return;
      active = false;
      target = [...REST];
      setActive(false);
      start();
    };

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      if (visible) start();
    });
    resizeObserver.observe(card);
    intersectionObserver.observe(card);
    card.addEventListener('pointerenter', onPointerEnter);
    card.addEventListener('pointermove', moveToPointer);
    card.addEventListener('pointerleave', onPointerLeave);
    card.addEventListener('focusin', onFocusIn);
    card.addEventListener('focusout', onFocusOut);
    resize();

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      card.removeEventListener('pointerenter', onPointerEnter);
      card.removeEventListener('pointermove', moveToPointer);
      card.removeEventListener('pointerleave', onPointerLeave);
      card.removeEventListener('focusin', onFocusIn);
      card.removeEventListener('focusout', onFocusOut);
      delete canvas.dataset.ready;
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, []);

  return <canvas ref={canvasRef} className="t-area-ink" aria-hidden="true" />;
}
