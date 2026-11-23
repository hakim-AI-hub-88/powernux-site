// Planète Powernux en 3D (Three.js) : planète indigo, atmosphère cyan, anneau orbital,
// satellites, outils en orbite et champ d'étoiles. Réagit à la souris et au défilement.
import * as THREE from "../vendor/three.min.js";

const CYAN = 0x00c2ff;
const VIOLET = 0x8b7cff;
const GREEN = 0x2ee6a6;

/** Texture de la planète : dégradé indigo, bandes et invite « >_ ». */
function planetTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const g = c.getContext("2d");
  const grad = g.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, "#2a2670");
  grad.addColorStop(0.5, "#1e1b4b");
  grad.addColorStop(1, "#121035");
  g.fillStyle = grad;
  g.fillRect(0, 0, 1024, 512);
  // Bandes atmosphériques
  for (let i = 0; i < 26; i++) {
    g.fillStyle = `rgba(${i % 2 ? "139,124,255" : "0,194,255"},${0.025 + Math.random() * 0.04})`;
    const y = Math.random() * 512;
    g.fillRect(0, y, 1024, 4 + Math.random() * 22);
  }
  // Points lumineux (« villes »)
  for (let i = 0; i < 260; i++) {
    g.fillStyle = `rgba(160,230,255,${Math.random() * 0.5})`;
    g.fillRect(Math.random() * 1024, 120 + Math.random() * 280, 2, 2);
  }
  // Invite de commande, sur la face visible
  g.font = "bold 120px 'JetBrains Mono', monospace";
  g.fillStyle = "#00c2ff";
  g.shadowColor = "#00c2ff";
  g.shadowBlur = 30;
  g.fillText(">", 430, 300);
  g.fillStyle = "#f4f6ff";
  g.fillRect(515, 278, 80, 18);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Halo atmosphérique (effet de Fresnel). */
function atmosphere(radius) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: { glow: { value: new THREE.Color(CYAN) } },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform vec3 glow;
      varying vec3 vNormal;
      void main() {
        float i = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
        gl_FragColor = vec4(glow, 1.0) * i * 0.9;
      }`,
  });
  return new THREE.Mesh(new THREE.SphereGeometry(radius * 1.16, 64, 64), mat);
}

function stars(count, spread) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = spread * (0.5 + Math.random() * 0.5);
    const t = Math.random() * Math.PI * 2;
    const p = Math.acos(2 * Math.random() - 1);
    pos.set([r * Math.sin(p) * Math.cos(t), r * Math.sin(p) * Math.sin(t), r * Math.cos(p)], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  return new THREE.Points(
    geo,
    new THREE.PointsMaterial({ color: 0xbfeeff, size: 0.035, transparent: true, opacity: 0.85, depthWrite: false }),
  );
}

export function mount(stage) {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  } catch {
    return; // pas de WebGL : l'image de secours reste affichée
  }
  stage.prepend(canvas);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0.3, 8.1);

  const world = new THREE.Group();
  scene.add(world);

  // Planète
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(1.45, 96, 96),
    new THREE.MeshStandardMaterial({ map: planetTexture(), roughness: 0.55, metalness: 0.15, emissive: 0x0b0a2a, emissiveIntensity: 0.6 }),
  );
  planet.rotation.y = -1.6;
  world.add(planet);
  world.add(atmosphere(1.45));

  // Anneau orbital incliné
  const orbit = new THREE.Group();
  orbit.rotation.set(1.18, 0.15, -0.32);
  world.add(orbit);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.35, 0.03, 16, 220),
    new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.95 }),
  );
  orbit.add(ring);
  const ringGlow = new THREE.Mesh(
    new THREE.TorusGeometry(2.35, 0.12, 16, 220),
    new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  orbit.add(ringGlow);

  // Satellites (les outils) en orbite
  const satellites = [CYAN, VIOLET, GREEN, 0xffb547, 0xff6b9a].map((color, i) => {
    const s = new THREE.Mesh(
      i === 0 ? new THREE.SphereGeometry(0.11, 24, 24) : new THREE.IcosahedronGeometry(0.08, 0),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.9, roughness: 0.3 }),
    );
    s.userData = { angle: (i / 5) * Math.PI * 2, speed: 0.22 + i * 0.035, radius: i === 0 ? 2.35 : 2.35 + (i % 2 ? 0.28 : -0.22) };
    orbit.add(s);
    return s;
  });

  // Second anneau, plus fin
  const orbit2 = new THREE.Group();
  orbit2.rotation.set(-0.9, 0.6, 0.4);
  world.add(orbit2);
  orbit2.add(
    new THREE.Mesh(
      new THREE.TorusGeometry(2.9, 0.008, 8, 200),
      new THREE.MeshBasicMaterial({ color: VIOLET, transparent: true, opacity: 0.45 }),
    ),
  );

  const starfield = stars(900, 22);
  scene.add(starfield);

  // Lumières
  scene.add(new THREE.AmbientLight(0x6a66c8, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(-4, 3, 5);
  scene.add(key);
  const rim = new THREE.PointLight(CYAN, 30, 20);
  rim.position.set(4, -1, -2);
  scene.add(rim);

  // Taille
  const resize = () => {
    const { width, height } = stage.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / height || 1;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(stage);
  resize();

  // Souris et défilement
  const target = { x: 0, y: 0 };
  addEventListener("pointermove", (e) => {
    target.x = (e.clientX / innerWidth - 0.5) * 0.6;
    target.y = (e.clientY / innerHeight - 0.5) * 0.4;
  }, { passive: true });

  // Animation seulement si visible
  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(stage);

  const clock = new THREE.Clock();
  const tick = () => {
    requestAnimationFrame(tick);
    if (!visible || document.hidden) return;
    const t = clock.getElapsedTime();
    planet.rotation.y += 0.0022;
    orbit.rotation.z += 0.0009;
    orbit2.rotation.z -= 0.0006;
    starfield.rotation.y = t * 0.012;
    for (const s of satellites) {
      const { angle, speed, radius } = s.userData;
      const a = angle + t * speed;
      s.position.set(Math.cos(a) * radius, Math.sin(a) * radius, 0);
      s.rotation.x = t;
    }
    world.rotation.y += (target.x - world.rotation.y) * 0.04;
    world.rotation.x += (target.y - world.rotation.x) * 0.04;
    world.position.y = Math.sin(t * 0.8) * 0.06 - Math.min(scrollY / 2000, 0.4);
    ringGlow.material.opacity = 0.1 + Math.sin(t * 2) * 0.04;
    renderer.render(scene, camera);
  };
  tick();
  stage.classList.add("ready");
}
