import * as THREE from 'three';

// ========== 3D BACKGROUND SCENE (LIGHT THEME) ==========
const canvas = document.getElementById('bg-canvas');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 14;

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const isMobile = window.matchMedia('(max-width: 720px)').matches;

// ----- Particle Field -----
const particleCount = isMobile ? 700 : 1400;
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const sizes = new Float32Array(particleCount);

const palette = [
  new THREE.Color(0x4f46e5),
  new THREE.Color(0x0ea5e9),
  new THREE.Color(0x6366f1),
  new THREE.Color(0x818cf8),
];

for (let i = 0; i < particleCount; i++) {
  const radius = 9 + Math.random() * 22;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos((Math.random() * 2) - 1);

  positions[i * 3]     = radius * Math.sin(phi) * Math.cos(theta);
  positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  positions[i * 3 + 2] = radius * Math.cos(phi);

  const color = palette[Math.floor(Math.random() * palette.length)];
  colors[i * 3]     = color.r;
  colors[i * 3 + 1] = color.g;
  colors[i * 3 + 2] = color.b;

  sizes[i] = Math.random() * 0.04 + 0.015;
}

const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const particleMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
  },
  vertexShader: `
    attribute float size;
    varying vec3 vColor;
    uniform float uTime;
    uniform float uPixelRatio;
    void main() {
      vColor = color;
      vec3 pos = position;
      pos.y += sin(uTime * 0.25 + position.x * 0.4) * 0.3;
      pos.x += cos(uTime * 0.18 + position.z * 0.3) * 0.25;
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = size * 320.0 * uPixelRatio / -mvPosition.z;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    void main() {
      vec2 uv = gl_PointCoord - 0.5;
      float dist = length(uv);
      float alpha = smoothstep(0.5, 0.0, dist);
      gl_FragColor = vec4(vColor, alpha * 0.55);
    }
  `,
  transparent: true,
  depthWrite: false,
  vertexColors: true,
  blending: THREE.NormalBlending,
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

// ----- Subtle Wireframe Geometry -----
const shapes = [];

function createShape(geometry, color, position, scale = 1) {
  const material = new THREE.MeshBasicMaterial({
    color,
    wireframe: true,
    transparent: true,
    opacity: 0.08,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.scale.setScalar(scale);
  scene.add(mesh);
  shapes.push({
    mesh,
    rotSpeed: {
      x: (Math.random() - 0.5) * 0.002,
      y: (Math.random() - 0.5) * 0.0025,
      z: (Math.random() - 0.5) * 0.0015,
    },
    floatOffset: Math.random() * Math.PI * 2,
  });
  return mesh;
}

if (!isMobile) {
  createShape(new THREE.IcosahedronGeometry(2.4, 1), 0x4f46e5, [-9, 4, -5], 1);
  createShape(new THREE.OctahedronGeometry(2, 0), 0x0ea5e9, [9, -3, -4], 1);
  createShape(new THREE.TorusKnotGeometry(1.3, 0.35, 100, 16), 0x6366f1, [7, 6, -9], 0.9);
  createShape(new THREE.DodecahedronGeometry(1.8, 0), 0x818cf8, [-7, -5, -7], 1);
} else {
  createShape(new THREE.IcosahedronGeometry(2, 1), 0x4f46e5, [-5, 3, -4], 1);
  createShape(new THREE.OctahedronGeometry(1.6, 0), 0x0ea5e9, [5, -3, -3], 1);
}

// ----- Mouse parallax -----
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
window.addEventListener('mousemove', (e) => {
  mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
});

// ----- Resize -----
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  particleMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
});

// ----- Animation loop -----
const clock = new THREE.Clock();
let scrollY = 0;
window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

function animate() {
  const elapsed = clock.getElapsedTime();
  particleMaterial.uniforms.uTime.value = elapsed;

  mouse.x += (mouse.tx - mouse.x) * 0.04;
  mouse.y += (mouse.ty - mouse.y) * 0.04;

  particles.rotation.y = elapsed * 0.025 + mouse.x * 0.12;
  particles.rotation.x = mouse.y * 0.08;

  shapes.forEach((s) => {
    s.mesh.rotation.x += s.rotSpeed.x;
    s.mesh.rotation.y += s.rotSpeed.y;
    s.mesh.rotation.z += s.rotSpeed.z;
    s.mesh.position.y += Math.sin(elapsed * 0.4 + s.floatOffset) * 0.004;
  });

  camera.position.y = -scrollY * 0.0015;
  camera.position.x = mouse.x * 0.3;
  camera.lookAt(scene.position);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// ========== REVEAL ON SCROLL ==========
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// ========== SUBTLE 3D TILT ON CARDS (DESKTOP ONLY) ==========
if (!isMobile && window.matchMedia('(hover: hover)').matches) {
  const tiltCards = document.querySelectorAll('[data-tilt]');
  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotX = ((y - cy) / cy) * -3;
      const rotY = ((x - cx) / cx) * 3;
      card.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-3px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ========== FOOTER YEAR ==========
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ========== SMOOTH SCROLL ==========
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (href === '#' || href === '#!') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
