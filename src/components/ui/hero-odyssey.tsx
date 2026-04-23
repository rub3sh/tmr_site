 'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Diamond, Menu, X } from 'lucide-react';

interface ElasticHueSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

const ElasticHueSlider: React.FC<ElasticHueSliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 360,
  step = 1,
  label = 'Adjust Hue',
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const progress = (value - min) / (max - min);
  const thumbPosition = progress * 100;

  return (
    <div className="relative flex w-full max-w-xs scale-75 flex-col items-center sm:scale-90" aria-label={label}>
      {label && (
        <label htmlFor="hue-slider-native" className="mb-1 text-sm text-gray-300">
          {label}
        </label>
      )}

      <div className="relative flex h-5 w-full items-center">
        <input
          id="hue-slider-native"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="absolute inset-0 z-20 h-full w-full cursor-pointer appearance-none bg-transparent"
          style={{ WebkitAppearance: 'none' }}
        />

        <div className="absolute left-0 z-0 h-1 w-full rounded-full bg-gray-700" />
        <div
          className="absolute left-0 z-10 h-1 rounded-full bg-[var(--accent)]"
          style={{ width: `${thumbPosition}%` }}
        />

        <motion.div
          className="absolute top-1/2 z-30 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-[var(--accent)] shadow-[0_0_12px_rgba(79,123,247,0.75)]"
          style={{ left: `${thumbPosition}%` }}
          animate={{ scale: isDragging ? 1.2 : 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: isDragging ? 20 : 30 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.2 }}
          className="mt-2 text-xs text-gray-400"
        >
          {value}
          {'°'}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

interface FeatureItemProps {
  name: string;
  value: string;
  position: string;
}

interface LightningProps {
  hue?: number;
  xOffset?: number;
  speed?: number;
  intensity?: number;
  size?: number;
}

const Lightning: React.FC<LightningProps> = ({
  hue = 44,
  xOffset = 0,
  speed = 1,
  intensity = 1,
  size = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const gl = canvas.getContext('webgl');
    if (!gl) {
      window.removeEventListener('resize', resizeCanvas);
      return undefined;
    }

    const vertexShaderSource = `
      attribute vec2 aPosition;
      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform float uHue;
      uniform float uXOffset;
      uniform float uSpeed;
      uniform float uIntensity;
      uniform float uSize;

      #define OCTAVE_COUNT 10

      vec3 hsv2rgb(vec3 c) {
        vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
        return c.z * mix(vec3(1.0), rgb, c.y);
      }

      float hash11(float p) {
        p = fract(p * .1031);
        p *= p + 33.33;
        p *= p + p;
        return fract(p);
      }

      float hash12(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * .1031);
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);
      }

      mat2 rotate2d(float theta) {
        float c = cos(theta);
        float s = sin(theta);
        return mat2(c, -s, s, c);
      }

      float noise(vec2 p) {
        vec2 ip = floor(p);
        vec2 fp = fract(p);
        float a = hash12(ip);
        float b = hash12(ip + vec2(1.0, 0.0));
        float c = hash12(ip + vec2(0.0, 1.0));
        float d = hash12(ip + vec2(1.0, 1.0));

        vec2 t = smoothstep(0.0, 1.0, fp);
        return mix(mix(a, b, t.x), mix(c, d, t.x), t.y);
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < OCTAVE_COUNT; ++i) {
          value += amplitude * noise(p);
          p *= rotate2d(0.45);
          p *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }

      void mainImage(out vec4 fragColor, in vec2 fragCoord) {
        vec2 uv = fragCoord / iResolution.xy;
        uv = 2.0 * uv - 1.0;
        uv.x *= iResolution.x / iResolution.y;
        uv.x += uXOffset;

        uv += 2.0 * fbm(uv * uSize + 0.8 * iTime * uSpeed) - 1.0;

        float dist = abs(uv.x);
        vec3 baseColor = hsv2rgb(vec3(uHue / 360.0, 0.7, 0.85));
        vec3 col = baseColor * pow(mix(0.0, 0.08, hash11(iTime * uSpeed)) / dist, 1.0) * uIntensity;
        fragColor = vec4(col, 1.0);
      }

      void main() {
        mainImage(gl_FragColor, gl_FragCoord.xy);
      }
    `;

    const compileShader = (source: string, type: number): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    };

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) {
      window.removeEventListener('resize', resizeCanvas);
      return undefined;
    }

    const program = gl.createProgram();
    if (!program) {
      window.removeEventListener('resize', resizeCanvas);
      return undefined;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      window.removeEventListener('resize', resizeCanvas);
      return undefined;
    }

    gl.useProgram(program);

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const iResolutionLocation = gl.getUniformLocation(program, 'iResolution');
    const iTimeLocation = gl.getUniformLocation(program, 'iTime');
    const uHueLocation = gl.getUniformLocation(program, 'uHue');
    const uXOffsetLocation = gl.getUniformLocation(program, 'uXOffset');
    const uSpeedLocation = gl.getUniformLocation(program, 'uSpeed');
    const uIntensityLocation = gl.getUniformLocation(program, 'uIntensity');
    const uSizeLocation = gl.getUniformLocation(program, 'uSize');

    const startTime = performance.now();
    let rafId = 0;

    const render = () => {
      resizeCanvas();
      gl.viewport(0, 0, canvas.width, canvas.height);

      if (iResolutionLocation) gl.uniform2f(iResolutionLocation, canvas.width, canvas.height);
      if (iTimeLocation) gl.uniform1f(iTimeLocation, (performance.now() - startTime) / 1000.0);
      if (uHueLocation) gl.uniform1f(uHueLocation, hue);
      if (uXOffsetLocation) gl.uniform1f(uXOffsetLocation, xOffset);
      if (uSpeedLocation) gl.uniform1f(uSpeedLocation, speed);
      if (uIntensityLocation) gl.uniform1f(uIntensityLocation, intensity);
      if (uSizeLocation) gl.uniform1f(uSizeLocation, size);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resizeCanvas);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      if (vertexBuffer) gl.deleteBuffer(vertexBuffer);
    };
  }, [hue, xOffset, speed, intensity, size]);

  return <canvas ref={canvasRef} className="relative h-full w-full" />;
};

const FeatureItem: React.FC<FeatureItemProps> = ({ name, value, position }) => {
  return (
    <div className={`group absolute ${position} z-10 transition-all duration-300 hover:scale-110`}>
      <div className="relative flex items-center gap-2">
        <div className="relative">
          <div className="h-2 w-2 rounded-full bg-white group-hover:animate-pulse" />
          <div className="absolute -inset-1 rounded-full bg-white/20 blur-sm opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
        <div className="relative text-white">
          <div className="font-medium transition-colors duration-300 group-hover:text-white">{name}</div>
          <div className="text-sm text-white/70 transition-colors duration-300 group-hover:text-white/70">{value}</div>
          <div className="absolute -inset-2 -z-10 rounded-lg bg-white/10 opacity-70 blur-md transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      </div>
    </div>
  );
};

export const HeroSection: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lightningHue, setLightningHue] = useState(44);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="relative w-full overflow-hidden bg-black text-white">
      <div className="relative z-20 mx-auto flex h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-12 flex items-center justify-between rounded-full bg-black/50 px-4 py-4 backdrop-blur-3xl"
        >
          <div className="flex items-center">
            <div className="text-2xl font-bold">
              <Diamond className="h-9 w-9 text-white" strokeWidth={1.7} />
            </div>
            <div className="ml-8 hidden items-center space-x-6 md:flex">
              <button className="rounded-full bg-gray-800/50 px-4 py-2 text-sm transition-colors hover:bg-gray-700/50">Start</button>
              <button className="px-4 py-2 text-sm transition-colors hover:text-gray-300">Home</button>
              <button className="px-4 py-2 text-sm transition-colors hover:text-gray-300">Contacts</button>
              <button className="px-4 py-2 text-sm transition-colors hover:text-gray-300">Help</button>
              <button className="px-4 py-2 text-sm transition-colors hover:text-gray-300">Docs</button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="hidden px-4 py-2 text-sm transition-colors hover:text-gray-300 md:block">Register</button>
            <button className="rounded-full bg-gray-800/80 px-4 py-2 text-sm backdrop-blur-sm transition-colors hover:bg-gray-700/80">Application</button>
            <button className="rounded-md p-2 focus:outline-none md:hidden" onClick={() => setMobileMenuOpen((prev) => !prev)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </motion.div>

        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg md:hidden">
            <div className="flex h-full flex-col items-center justify-center space-y-6 text-lg">
              <button className="absolute right-6 top-6 p-2" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-6 w-6" />
              </button>
              <button className="rounded-full bg-gray-800/50 px-6 py-3">Start</button>
              <button className="px-6 py-3">Home</button>
              <button className="px-6 py-3">Contacts</button>
              <button className="px-6 py-3">Help</button>
              <button className="px-6 py-3">Docs</button>
              <button className="px-6 py-3">Register</button>
              <button className="rounded-full bg-gray-800/80 px-6 py-3 backdrop-blur-sm">Application</button>
            </div>
          </motion.div>
        )}

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative top-[30%] z-20 w-full">
          <motion.div variants={itemVariants}>
            <FeatureItem name="React" value="for base" position="left-0 top-40 sm:left-10" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <FeatureItem name="Tailwind" value="for styles" position="left-1/4 top-24" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <FeatureItem name="Framer Motion" value="for animations" position="right-1/4 top-24" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <FeatureItem name="Shaders" value="for lightning" position="right-0 top-40 sm:right-10" />
          </motion.div>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-30 mx-auto flex max-w-4xl flex-col items-center text-center">
          <ElasticHueSlider value={lightningHue} onChange={setLightningHue} label="Adjust Lightning Hue" />

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group mb-6 flex items-center space-x-2 rounded-full bg-white/5 px-4 py-2 text-sm transition-all duration-300 hover:bg-white/10"
          >
            <span>Join us for free world</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </motion.button>

          <motion.h1 variants={itemVariants} className="mb-2 text-5xl font-light md:text-7xl">
            Hero Odyssey
          </motion.h1>

          <motion.h2 variants={itemVariants} className="bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 bg-clip-text pb-3 text-3xl font-light text-transparent md:text-5xl">
            Lighting Up The Future
          </motion.h2>

          <motion.p variants={itemVariants} className="mb-9 max-w-2xl text-gray-400">
            Lightning animation is 100% code generated, so feel free to customize it to your liking.
          </motion.p>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-[100px] rounded-full bg-white/10 px-8 py-3 backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            Discover Those Worlds
          </motion.button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-black/80" />
        <div className="absolute left-1/2 top-[55%] h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-[rgba(79,123,247,0.22)] to-[rgba(79,123,247,0.08)] blur-3xl" />
        <div className="absolute left-1/2 top-0 h-full w-full -translate-x-1/2">
          <Lightning hue={lightningHue} xOffset={0} speed={1.6} intensity={0.6} size={2} />
        </div>
        <div className="absolute left-1/2 top-[55%] z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_25%_90%,_#1e386b_15%,_#000000de_70%,_#000000ed_100%)] backdrop-blur-3xl" />
      </motion.div>
    </div>
  );
};
