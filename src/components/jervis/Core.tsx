import { useEffect, useRef, type MutableRefObject } from "react";

type Point3 = { x: number; y: number; z: number };
type Projected = Point3 & { depth: number };
const TAU = Math.PI * 2;

/** A layered, perspective-projected golden hologram driven by microphone and speech levels. */
export function Core({ levelRef, active, size = 360 }: { levelRef: MutableRefObject<number>; active?: boolean; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const g = canvas.getContext("2d");
    if (!g) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    g.scale(dpr, dpr);

    const c = size / 2;
    const particleCount = 560;
    const lattice: (Point3 & { seed: number })[] = Array.from({ length: particleCount }, (_, i) => {
      const y = 1 - (i / (particleCount - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = i * 2.399963229728653;
      return { x: Math.cos(theta) * r, y, z: Math.sin(theta) * r, seed: ((i * 47) % 101) / 101 };
    });
    const spokes: (Point3 & { seed: number })[] = Array.from({ length: 36 }, (_, i) => {
      const y = 1 - (i / 35) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = i * 2.399963229728653 + 0.35;
      return { x: Math.cos(theta) * r, y, z: Math.sin(theta) * r, seed: ((i * 29) % 37) / 37 };
    });

    let raf = 0;
    let previous = performance.now();
    let time = 0;
    let yaw = 0;
    let level = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const rotate = (p: Point3, pitch: number, roll: number): Point3 => {
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      const cx = Math.cos(pitch), sx = Math.sin(pitch);
      const cz = Math.cos(roll), sz = Math.sin(roll);
      const x1 = p.x * cy - p.z * sy;
      const z1 = p.x * sy + p.z * cy;
      const y1 = p.y * cx - z1 * sx;
      const z2 = p.y * sx + z1 * cx;
      return { x: x1 * cz - y1 * sz, y: x1 * sz + y1 * cz, z: z2 };
    };

    const project = (p: Point3, radius: number, pitch: number, roll: number): Projected => {
      const r = rotate(p, pitch, roll);
      const perspective = 1 + r.z * 0.1;
      return { x: c + r.x * radius * perspective, y: c + r.y * radius * perspective, z: r.z, depth: (r.z + 1) / 2 };
    };

    const color = (depth: number, alpha: number, hot = false) => {
      const green = Math.round((hot ? 184 : 137) + depth * (hot ? 58 : 72));
      const blue = Math.round(24 + depth * (hot ? 92 : 45));
      return `rgba(255,${green},${blue},${Math.max(0, Math.min(1, alpha))})`;
    };

    const path = (points: Projected[], alpha: number, width: number, hot = false) => {
      if (points.length < 2) return;
      const first = points[0];
      if (!first) return;
      const depth = points.reduce((sum, p) => sum + p.depth, 0) / points.length;
      g.strokeStyle = color(depth, alpha * (0.32 + depth * 0.85), hot);
      g.lineWidth = width * (0.7 + depth * 0.55);
      g.beginPath();
      g.moveTo(first.x, first.y);
      for (let i = 1; i < points.length; i++) {
        const point = points[i];
        if (point) g.lineTo(point.x, point.y);
      }
      g.stroke();
    };

    const ring = (radius: number, tilt: number, azimuth: number, start = 0, end = TAU, count = 96) => {
      const points: Point3[] = [];
      const ca = Math.cos(azimuth), sa = Math.sin(azimuth);
      for (let i = 0; i <= count; i++) {
        const a = start + (end - start) * (i / count);
        const x = Math.cos(a) * radius;
        const y0 = Math.sin(a) * radius * Math.cos(tilt);
        const z0 = Math.sin(a) * radius * Math.sin(tilt);
        points.push({ x: x * ca - z0 * sa, y: y0, z: x * sa + z0 * ca });
      }
      return points;
    };

    const draw = (now: number) => {
      const dt = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      time += dt;
      level += (Math.min(levelRef.current, 1.25) - level) * Math.min(1, dt * 9);
      const energy = Math.min(1, level);
      yaw += dt * (reducedMotion ? 0.035 : 0.12 + energy * 0.38 + (activeRef.current ? 0.08 : 0));
      const pitch = 0.29 + Math.sin(time * 0.17) * 0.08;
      const roll = Math.sin(time * 0.11) * 0.055;
      const pulse = 1 + Math.sin(time * 1.8) * 0.008 + energy * 0.055;
      const R = size * 0.29 * pulse;

      g.clearRect(0, 0, size, size);
      g.globalCompositeOperation = "lighter";
      g.lineCap = "round";
      g.lineJoin = "round";

      // Broad amber light and the hot atmospheric halo around the sphere.
      const halo = g.createRadialGradient(c, c, 0, c, c, R * 1.72);
      halo.addColorStop(0, `rgba(255,239,178,${0.18 + energy * 0.2})`);
      halo.addColorStop(0.18, `rgba(255,164,42,${0.16 + energy * 0.16})`);
      halo.addColorStop(0.52, "rgba(212,96,12,0.07)");
      halo.addColorStop(1, "rgba(80,25,0,0)");
      g.fillStyle = halo;
      g.beginPath();
      g.arc(c, c, R * 1.72, 0, TAU);
      g.fill();

      // Fine spherical latitude/longitude cage.
      for (const latitude of [-1.05, -0.62, -0.24, 0.24, 0.62, 1.05]) {
        const r = Math.cos(latitude);
        const y = Math.sin(latitude);
        const points = Array.from({ length: 97 }, (_, i) => {
          const a = (i / 96) * TAU;
          return project({ x: Math.cos(a) * r, y, z: Math.sin(a) * r }, R, pitch, roll);
        });
        path(points, 0.24 + energy * 0.1, 0.55);
      }
      for (let longitude = 0; longitude < 14; longitude++) {
        const a = (longitude / 14) * TAU;
        const points = Array.from({ length: 73 }, (_, i) => {
          const b = (i / 72) * TAU;
          return project({ x: Math.cos(a) * Math.sin(b), y: Math.cos(b), z: Math.sin(a) * Math.sin(b) }, R, pitch, roll);
        });
        path(points, longitude % 2 ? 0.13 : 0.24, longitude % 2 ? 0.45 : 0.65);
      }

      // Radiating spokes and illuminated junctions from the central iris.
      for (let i = 0; i < spokes.length; i++) {
        const spoke = spokes[i];
        if (!spoke) continue;
        const inner = project({ x: spoke.x * 0.18, y: spoke.y * 0.18, z: spoke.z * 0.18 }, R, pitch, roll);
        const middle = project({ x: spoke.x * (0.5 + spoke.seed * 0.12), y: spoke.y * (0.5 + spoke.seed * 0.12), z: spoke.z * (0.5 + spoke.seed * 0.12) }, R, pitch, roll);
        const outer = project(spoke, R * (0.96 + spoke.seed * 0.07), pitch, roll);
        path([inner, middle, outer], 0.2 + energy * 0.22, i % 6 === 0 ? 1.15 : 0.55, i % 6 === 0);
        if (i % 2 === 0) {
          g.fillStyle = color(outer.depth, 0.45 + energy * 0.4, true);
          g.beginPath();
          g.arc(outer.x, outer.y, 0.7 + outer.depth * 1.35 + energy, 0, TAU);
          g.fill();
        }
      }

      // Orbiting particle lattice: sharp front points, soft distant points and drifting satellites.
      for (const particle of lattice) {
        const orbit = 0.91 + particle.seed * 0.22 + Math.sin(time * 0.7 + particle.seed * 18) * 0.012;
        const p = project({ x: particle.x * orbit, y: particle.y * orbit, z: particle.z * orbit }, R, pitch, roll);
        const flicker = 0.55 + Math.sin(time * 2.2 + particle.seed * 40) * 0.25;
        g.fillStyle = color(p.depth, (0.18 + p.depth * 0.66) * flicker + energy * 0.15, particle.seed > 0.82);
        const dot = 0.45 + p.depth * 1.35 + (particle.seed > 0.94 ? 1.3 : 0);
        g.fillRect(p.x - dot / 2, p.y - dot / 2, dot, dot);
      }

      // Broken circuit rings, each with its own orbital plane and direction.
      for (let band = 0; band < 8; band++) {
        const radius = 0.76 + band * 0.052;
        const tilt = -1.02 + band * 0.285;
        const azimuth = band * 0.71 + time * (band % 2 ? -0.025 : 0.035);
        const segments = 10 + (band % 3) * 2;
        for (let segment = 0; segment < segments; segment++) {
          const step = TAU / segments;
          const start = segment * step + band * 0.29;
          const length = step * (0.38 + ((segment + band) % 4) * 0.1);
          const points = ring(radius, tilt, azimuth, start, start + length, 10)
            .map((p) => project(p, R, pitch, roll));
          path(points, 0.42 + energy * 0.24, band % 3 === 0 ? 1.25 : 0.72, segment % 5 === 0);
          if (segment % 3 === 0) {
            const node = points[0];
            const elbow = points[Math.min(3, points.length - 1)];
            if (node && elbow) {
              g.strokeStyle = color(node.depth, 0.55, true);
              g.lineWidth = 0.8;
              g.beginPath();
              g.moveTo(node.x, node.y);
              g.lineTo(elbow.x + (band % 2 ? 4 : -4), elbow.y);
              g.lineTo(elbow.x + (band % 2 ? 4 : -4), elbow.y + 4);
              g.stroke();
              g.fillStyle = color(node.depth, 0.8, true);
              g.fillRect(node.x - 1.2, node.y - 1.2, 2.4, 2.4);
            }
          }
        }
      }

      // Large HUD arcs and calibrated tick marks frame the hologram.
      for (let arc = 0; arc < 4; arc++) {
        const rr = R * (1.25 + arc * 0.065);
        const start = yaw * (arc % 2 ? -0.65 : 0.45) + arc * 1.37;
        g.strokeStyle = `rgba(255,${158 + arc * 14},48,${0.3 - arc * 0.035 + energy * 0.17})`;
        g.lineWidth = arc === 0 ? 1.5 : 0.75;
        g.beginPath();
        g.arc(c, c, rr, start, start + Math.PI * (0.55 + arc * 0.12));
        g.stroke();
        g.setLineDash([2, 6 + arc * 2]);
        g.beginPath();
        g.arc(c, c, rr, start + Math.PI, start + Math.PI * 1.65);
        g.stroke();
        g.setLineDash([]);
      }
      const tickRadius = R * 1.34;
      for (let tick = 0; tick < 84; tick++) {
        const a = (tick / 84) * TAU - yaw * 0.25;
        const long = tick % 7 === 0;
        const h = (long ? 6 : 2.5) + energy * (long ? 7 : 3) * Math.abs(Math.sin(time * 5 + tick));
        g.strokeStyle = `rgba(255,174,65,${long ? 0.5 : 0.22 + energy * 0.2})`;
        g.lineWidth = long ? 1.2 : 0.65;
        g.beginPath();
        g.moveTo(c + Math.cos(a) * tickRadius, c + Math.sin(a) * tickRadius);
        g.lineTo(c + Math.cos(a) * (tickRadius + h), c + Math.sin(a) * (tickRadius + h));
        g.stroke();
      }

      // Expanding energy waves remain delicate rather than obscuring the circuitry.
      for (let waveIndex = 0; waveIndex < 2; waveIndex++) {
        const wave = (time * (0.18 + energy * 0.22) + waveIndex * 0.5) % 1;
        g.strokeStyle = `rgba(255,190,80,${(1 - wave) * (0.1 + energy * 0.3)})`;
        g.lineWidth = 0.8;
        g.beginPath();
        g.arc(c, c, R * (0.32 + wave * 1.05), 0, TAU);
        g.stroke();
      }

      // The bright central iris: concentric mechanical apertures and a luminous pupil.
      const irisRadius = R * (0.205 + energy * 0.025);
      const irisGlow = g.createRadialGradient(c, c, 0, c, c, irisRadius * 1.8);
      irisGlow.addColorStop(0, `rgba(255,248,211,${0.95})`);
      irisGlow.addColorStop(0.14, `rgba(255,200,92,${0.72 + energy * 0.2})`);
      irisGlow.addColorStop(0.45, "rgba(255,135,22,0.2)");
      irisGlow.addColorStop(1, "rgba(255,105,8,0)");
      g.fillStyle = irisGlow;
      g.beginPath();
      g.arc(c, c, irisRadius * 1.8, 0, TAU);
      g.fill();
      for (let iris = 0; iris < 7; iris++) {
        const rr = irisRadius * (0.35 + iris * 0.12);
        const start = yaw * (iris % 2 ? -2.2 : 1.6) + iris;
        g.strokeStyle = `rgba(255,${205 + iris * 5},${105 + iris * 12},${0.48 + iris * 0.06})`;
        g.lineWidth = iris % 3 === 0 ? 1.8 : 0.8;
        g.beginPath();
        g.arc(c, c, rr, start, start + Math.PI * (1.1 + (iris % 3) * 0.22));
        g.stroke();
      }
      g.strokeStyle = "rgba(255,232,165,0.65)";
      g.lineWidth = 0.65;
      g.beginPath();
      g.moveTo(c - irisRadius * 1.45, c);
      g.lineTo(c + irisRadius * 1.45, c);
      g.moveTo(c, c - irisRadius * 1.45);
      g.lineTo(c, c + irisRadius * 1.45);
      g.stroke();
      g.fillStyle = "rgba(255,244,202,0.95)";
      g.beginPath();
      g.arc(c, c, 2.2 + energy * 2.2, 0, TAU);
      g.fill();

      g.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [levelRef, size]);

  return (
    <canvas
      ref={ref}
      style={{ width: "100%", maxWidth: size, height: "auto", aspectRatio: "1" }}
      className="core-canvas block max-w-full"
      role="img"
      aria-label="Rotating golden JERVIS holographic core"
    />
  );
}
