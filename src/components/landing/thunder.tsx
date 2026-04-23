"use client";

import { useEffect, useRef } from "react";

export default function Thunder() {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const gl = canvas.getContext("webgl");
		if (!gl) return;

		const resize = () => {
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			const width = Math.floor(canvas.clientWidth * dpr);
			const height = Math.floor(canvas.clientHeight * dpr);

			if (canvas.width === width && canvas.height === height) return;

			canvas.width = width;
			canvas.height = height;
		};

		resize();
		window.addEventListener("resize", resize);

		const vertexShader = `
			attribute vec2 aPosition;
			void main() {
				gl_Position = vec4(aPosition, 0.0, 1.0);
			}
		`;

		const fragmentShader = `
			precision mediump float;

			uniform vec2 iResolution;
			uniform float iTime;

			float hash(float n) { return fract(sin(n) * 43758.5453); }

			float noise(vec2 x) {
				vec2 p = floor(x);
				vec2 f = fract(x);
				f = f * f * (3.0 - 2.0 * f);
				float n = p.x + p.y * 57.0;
				return mix(mix(hash(n), hash(n + 1.0), f.x),
									mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y);
			}

			float fbm(vec2 p) {
				float f = 0.0;
				f += 0.5 * noise(p); p *= 2.0;
				f += 0.25 * noise(p); p *= 2.0;
				f += 0.125 * noise(p);
				return f;
			}

			void main() {
				vec2 uv = gl_FragCoord.xy / iResolution.xy;
				uv = uv * 2.0 - 1.0;
				uv.x *= iResolution.x / iResolution.y;

				float k = 0.70710678;
				vec2 boltUV = vec2(
					(uv.y - uv.x) * k,
					(uv.x + uv.y) * k
				);

				float t = iTime * 1.5;

				// MAIN THUNDER DISTORTION
				vec2 mainUV = boltUV;
				mainUV.x += fbm(mainUV * 3.0 + t) * 0.3;

				float mainDist = max(abs(mainUV.x), 0.001);
				float mainBolt = 0.015 / mainDist;

				// SCATTER BRANCHES
				float scatter = 0.0;
				for (int i = 1; i <= 3; i++) {
					float fi = float(i);

					vec2 offsetUV = boltUV;
					offsetUV.x += fbm(offsetUV * (2.0 + fi) + t * (1.0 + fi * 0.3)) * (0.2 + fi * 0.05);

					float d = max(abs(offsetUV.x + sin(boltUV.y * 10.0 + fi) * 0.1), 0.001);
					scatter += (0.01 / d) * (0.4 / fi);
				}

				// COMBINE
				float intensity = mainBolt + scatter;

				// STRONG GLOW FALL OFF
				float glow = pow(intensity, 1.3);

				// GOLD LIGHTNING COLOR
				vec3 coreColor = vec3(1.0, 0.85, 0.3);
				vec3 glowColor = vec3(1.0, 0.6, 0.1);

				float lightning = clamp(intensity * 0.55, 0.0, 1.0);
				float halo = clamp(glow * 0.035, 0.0, 1.0);
				vec3 color = coreColor * lightning + glowColor * halo;
				float alpha = smoothstep(0.16, 0.72, lightning + halo * 0.4);

				gl_FragColor = vec4(color, alpha);
			}
		`;

		const compile = (type: number, source: string) => {
			const shader = gl.createShader(type);
			if (!shader) return null;
			gl.shaderSource(shader, source);
			gl.compileShader(shader);
			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				console.error(gl.getShaderInfoLog(shader) || "Shader compile failed");
				gl.deleteShader(shader);
				return null;
			}
			return shader;
		};

		const vertex = compile(gl.VERTEX_SHADER, vertexShader);
		const fragment = compile(gl.FRAGMENT_SHADER, fragmentShader);
		if (!vertex || !fragment) {
			if (vertex) gl.deleteShader(vertex);
			if (fragment) gl.deleteShader(fragment);
			window.removeEventListener("resize", resize);
			return;
		}

		const program = gl.createProgram();
		if (!program) {
			gl.deleteShader(vertex);
			gl.deleteShader(fragment);
			window.removeEventListener("resize", resize);
			return;
		}

		gl.attachShader(program, vertex);
		gl.attachShader(program, fragment);
		gl.linkProgram(program);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error(gl.getProgramInfoLog(program) || "Program link failed");
			gl.deleteProgram(program);
			gl.deleteShader(vertex);
			gl.deleteShader(fragment);
			window.removeEventListener("resize", resize);
			return;
		}

		gl.useProgram(program);

		const buffer = gl.createBuffer();
		if (!buffer) {
			window.removeEventListener("resize", resize);
			gl.deleteProgram(program);
			gl.deleteShader(vertex);
			gl.deleteShader(fragment);
			return;
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
			gl.STATIC_DRAW,
		);

		const pos = gl.getAttribLocation(program, "aPosition");
		if (pos < 0) {
			window.removeEventListener("resize", resize);
			gl.deleteBuffer(buffer);
			gl.deleteProgram(program);
			gl.deleteShader(vertex);
			gl.deleteShader(fragment);
			return;
		}

		gl.enableVertexAttribArray(pos);
		gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

		const res = gl.getUniformLocation(program, "iResolution");
		const time = gl.getUniformLocation(program, "iTime");

		const start = performance.now();
		let rafId = 0;
		let running = true;

		const render = () => {
			if (!running) return;
			if (canvas.width === 0 || canvas.height === 0) {
				resize();
				rafId = requestAnimationFrame(render);
				return;
			}

			gl.viewport(0, 0, canvas.width, canvas.height);

			if (res) gl.uniform2f(res, canvas.width, canvas.height);
			if (time) gl.uniform1f(time, (performance.now() - start) / 1000);

			gl.drawArrays(gl.TRIANGLES, 0, 6);
			rafId = requestAnimationFrame(render);
		};

		const onVisibilityChange = () => {
			if (document.visibilityState === "hidden") {
				running = false;
				cancelAnimationFrame(rafId);
				return;
			}

			if (!running) {
				running = true;
				rafId = requestAnimationFrame(render);
			}
		};

		document.addEventListener("visibilitychange", onVisibilityChange);

		render();

		return () => {
			document.removeEventListener("visibilitychange", onVisibilityChange);
			running = false;
			cancelAnimationFrame(rafId);
			window.removeEventListener("resize", resize);
			gl.deleteBuffer(buffer);
			gl.deleteProgram(program);
			gl.deleteShader(vertex);
			gl.deleteShader(fragment);
		};
	}, []);

	return <canvas ref={canvasRef} className="h-full w-full" />;
}
