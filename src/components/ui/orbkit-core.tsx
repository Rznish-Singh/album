'use client'

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'

export type OrbState = 'idle' | 'thinking' | 'speaking'

export type OrbWrapper = 'none' | 'glass' | 'ring' | 'dotted' | 'ticks' | 'reticle' | 'grid' | 'halftone' | 'scanlines'

export interface OrbParamDef {
  key: string
  label: string
  min: number
  max: number
  step: number
  default: number
  /** Uploaded as an accumulator (value * dt integrated over real time), not the raw value —
   *  what lets `speed` change without a phase jump. */
  integrate?: boolean
}

export interface OrbColorDef {
  key: string
  label: string
  default: string
}

export interface OrbVariant {
  key: string
  label: string
  note?: string
  /** GLSL ES 1.00 fragment shader body. May use `#define`s, and must call
   *  `orbUV()` / `tanh3()` and read `uP_<param.key>`, `uInput`, `uOutput`. */
  frag: string
  params: OrbParamDef[]
  colors: OrbColorDef[]
  statePresets: Record<OrbState, Partial<Record<string, number>>>
}

export interface ShaderOrbProps {
  variant: OrbVariant
  size?: number
  state?: OrbState
  params?: Partial<Record<string, number>>
  colors?: Partial<Record<string, string>>
  paused?: boolean
  pauseOffscreen?: boolean
  maxDpr?: number
  wrapper?: OrbWrapper
  wrapperColor?: string
  className?: string
  style?: React.CSSProperties
  ariaLabel?: string
  statePresets?: Partial<Record<OrbState, Partial<Record<string, number>>>>
  stateVolumes?: Partial<Record<OrbState, { input?: number; output?: number }>>
  volumes?: { input?: number; output?: number }
}

const STATES: OrbState[] = ['idle', 'thinking', 'speaking']

const DEFAULT_STATE_VOLUMES: Record<OrbState, { input: number; output: number }> = {
  idle: { input: 0, output: 0.15 },
  thinking: { input: 0.1, output: 0.4 },
  speaking: { input: 0.2, output: 0.75 },
}

const VERTEX_SRC = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

function buildFragmentSrc(paramKeys: string[], body: string): string {
  return `
precision highp float;
uniform vec2 uResolution;
uniform float uInput;
uniform float uOutput;
${paramKeys.map((k) => `uniform float uP_${k};`).join('\n')}

vec2 orbUV() {
  vec2 uv = (gl_FragCoord.xy / uResolution) * 2.0 - 1.0;
  uv.x *= uResolution.x / max(uResolution.y, 1.0);
  return uv;
}

vec3 tanh3(vec3 x) {
  vec3 c = clamp(x, -15.0, 15.0);
  vec3 e = exp(2.0 * c);
  return (e - 1.0) / (e + 1.0);
}

${body}
`
}

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('orbkit: could not create shader')
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(`orbkit: shader compile error — ${log}`)
  }
  return shader
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

const wrapperStyle = (wrapper: OrbWrapper, color: string): React.CSSProperties | null => {
  switch (wrapper) {
    case 'ring':
      return { position: 'absolute', inset: -3, borderRadius: '9999px', border: `1px solid ${color}`, opacity: 0.55 }
    case 'dotted':
      return { position: 'absolute', inset: -4, borderRadius: '9999px', border: `1px dotted ${color}`, opacity: 0.6 }
    case 'glass':
      return {
        position: 'absolute',
        inset: 0,
        borderRadius: '9999px',
        boxShadow: `inset 0 1px 1px rgba(255,255,255,0.25), inset 0 -6px 10px rgba(0,0,0,0.25)`,
        pointerEvents: 'none',
      }
    case 'ticks':
      return {
        position: 'absolute',
        inset: -6,
        borderRadius: '9999px',
        background: `repeating-conic-gradient(${color} 0deg 1.2deg, transparent 1.2deg 15deg)`,
        WebkitMask: 'radial-gradient(circle, transparent 62%, black 64%, black 68%, transparent 70%)',
        mask: 'radial-gradient(circle, transparent 62%, black 64%, black 68%, transparent 70%)',
        opacity: 0.5,
      }
    case 'reticle':
      return {
        position: 'absolute',
        inset: -10,
        background: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
        backgroundPosition: 'center',
        backgroundSize: '100% 1px, 1px 100%',
        backgroundRepeat: 'no-repeat',
        opacity: 0.35,
      }
    case 'grid':
      return {
        position: 'absolute',
        inset: 0,
        borderRadius: '9999px',
        backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
        backgroundSize: '8px 8px',
        opacity: 0.12,
        mixBlendMode: 'overlay',
      }
    case 'halftone':
      return {
        position: 'absolute',
        inset: 0,
        borderRadius: '9999px',
        backgroundImage: `radial-gradient(${color} 1px, transparent 1.4px)`,
        backgroundSize: '5px 5px',
        opacity: 0.15,
        mixBlendMode: 'overlay',
      }
    case 'scanlines':
      return {
        position: 'absolute',
        inset: 0,
        borderRadius: '9999px',
        backgroundImage: `repeating-linear-gradient(${color} 0 1px, transparent 1px 3px)`,
        opacity: 0.15,
        mixBlendMode: 'overlay',
      }
    case 'none':
    default:
      return null
  }
}

export function ShaderOrb({
  variant,
  size = 280,
  state = 'idle',
  params,
  paused = false,
  pauseOffscreen = true,
  maxDpr = 2,
  wrapper = 'none',
  wrapperColor = 'currentColor',
  className,
  style,
  ariaLabel,
  statePresets: statePresetsProp,
  stateVolumes: stateVolumesProp,
  volumes,
}: ShaderOrbProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const uniformsRef = useRef<Record<string, WebGLUniformLocation | null>>({})
  const accumRef = useRef<Record<string, number>>({})
  const volRef = useRef({ input: 0, output: 0 })
  const runningRef = useRef(false)
  const visibleRef = useRef(true)
  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)

  const paramKeys = useMemo(() => variant.params.map((p) => p.key), [variant])
  const integrateKeys = useMemo(() => variant.params.filter((p) => p.integrate).map((p) => p.key), [variant])

  const mergedStatePresets = useMemo(() => {
    const defaults = Object.fromEntries(variant.params.map((p) => [p.key, p.default]))
    const out = {} as Record<OrbState, Record<string, number>>
    for (const s of STATES) {
      out[s] = { ...defaults, ...variant.statePresets[s], ...statePresetsProp?.[s] } as Record<string, number>
    }
    return out
  }, [variant, statePresetsProp])

  const resolvedParams = useMemo(() => ({ ...mergedStatePresets[state], ...params }), [mergedStatePresets, state, params])

  const resolvedVolumes = useMemo(
    () => ({
      input: volumes?.input ?? stateVolumesProp?.[state]?.input ?? DEFAULT_STATE_VOLUMES[state].input,
      output: volumes?.output ?? stateVolumesProp?.[state]?.output ?? DEFAULT_STATE_VOLUMES[state].output,
    }),
    [volumes, stateVolumesProp, state],
  )

  const paramsRef = useRef(resolvedParams)
  const volTargetRef = useRef(resolvedVolumes)
  useLayoutEffect(() => {
    paramsRef.current = resolvedParams
    volTargetRef.current = resolvedVolumes
  }, [resolvedParams, resolvedVolumes])

  // Compile once per variant. paramKeys/integrateKeys are derived from the same
  // variant, so this only re-runs when the orb itself changes.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: true })
    if (!gl) return

    let program: WebGLProgram | null = null
    try {
      const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC)
      const fs = compileShader(gl, gl.FRAGMENT_SHADER, buildFragmentSrc(paramKeys, variant.frag))
      program = gl.createProgram()
      if (!program) throw new Error('orbkit: could not create program')
      gl.attachShader(program, vs)
      gl.attachShader(program, fs)
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(`orbkit: link error — ${gl.getProgramInfoLog(program)}`)
      }
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    } catch (err) {
      console.error(err)
      return
    }

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const aPosition = gl.getAttribLocation(program, 'aPosition')
    gl.enableVertexAttribArray(aPosition)
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)

    const uniforms: Record<string, WebGLUniformLocation | null> = {
      uResolution: gl.getUniformLocation(program, 'uResolution'),
      uInput: gl.getUniformLocation(program, 'uInput'),
      uOutput: gl.getUniformLocation(program, 'uOutput'),
    }
    for (const k of paramKeys) uniforms[k] = gl.getUniformLocation(program, `uP_${k}`)

    glRef.current = gl
    uniformsRef.current = uniforms
    gl.useProgram(program)

    accumRef.current = Object.fromEntries(integrateKeys.map((k) => [k, 0]))
    lastTimeRef.current = null

    return () => {
      // NOTE: deliberately not calling the WEBGL_lose_context extension here.
      // Explicitly losing the context marks the *canvas* as lost — a later
      // getContext('webgl') on the same canvas (which happens on every remount,
      // and twice in a row under React StrictMode's dev double-invoke) then
      // returns that same dead context instead of a fresh one, and every
      // compile on it fails with an empty info log. Deleting the buffer and
      // program is enough; the real context is reclaimed when the canvas
      // element itself is garbage collected.
      gl.deleteBuffer(buffer)
      if (program) gl.deleteProgram(program)
      glRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant])

  // Canvas backing-store size tracks `size`/`maxDpr`; CSS size is fixed via style below.
  useEffect(() => {
    const canvas = canvasRef.current
    const gl = glRef.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
    const px = Math.max(1, Math.round(size * dpr))
    canvas.width = px
    canvas.height = px
    gl?.viewport(0, 0, px, px)
  }, [size, maxDpr, variant])

  useEffect(() => {
    if (!pauseOffscreen || !hostRef.current) {
      visibleRef.current = true
      return
    }
    const el = hostRef.current
    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [pauseOffscreen])

  useEffect(() => {
    const tick = (now: number) => {
      rafRef.current = requestAnimationFrame(tick)
      if (paused || !visibleRef.current) {
        lastTimeRef.current = now
        return
      }
      const gl = glRef.current
      const canvas = canvasRef.current
      if (!gl || !canvas) return

      const last = lastTimeRef.current ?? now
      const dt = Math.min((now - last) / 1000, 0.05)
      lastTimeRef.current = now

      const live = paramsRef.current
      for (const k of integrateKeys) {
        accumRef.current[k] = (accumRef.current[k] ?? 0) + (live[k] ?? 0) * dt
      }

      const smoothing = 1 - Math.exp(-dt * 6)
      volRef.current.input = lerp(volRef.current.input, volTargetRef.current.input, smoothing)
      volRef.current.output = lerp(volRef.current.output, volTargetRef.current.output, smoothing)

      const u = uniformsRef.current
      gl.uniform2f(u.uResolution, canvas.width, canvas.height)
      gl.uniform1f(u.uInput, volRef.current.input)
      gl.uniform1f(u.uOutput, volRef.current.output)
      for (const key of paramKeys) {
        const value = integrateKeys.includes(key) ? accumRef.current[key] : (live[key] ?? 0)
        if (u[key]) gl.uniform1f(u[key], value)
      }

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, paused])

  const overlay = wrapperStyle(wrapper, wrapperColor)

  return (
    <div
      ref={hostRef}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      className={className}
      style={{ position: 'relative', width: size, height: size, ...style }}
    >
      <canvas ref={canvasRef} style={{ width: size, height: size, display: 'block', borderRadius: '9999px' }} />
      {overlay && <div style={overlay} />}
    </div>
  )
}