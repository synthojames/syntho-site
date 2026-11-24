import * as THREE from 'three';

export interface HeroSceneOptions {
  /** When false, render a single frame and stop (prefers-reduced-motion). */
  animate: boolean;
}

/** Read a CSS custom property so the scene follows the site's theme tokens. */
function cssColor(el: Element, name: string, fallback: string): THREE.Color {
  const value = getComputedStyle(el).getPropertyValue(name).trim();
  return new THREE.Color(value || fallback);
}

/**
 * Decorative background scene: a wireframe icosahedron inside a drifting
 * star field. Returns a cleanup function that releases all GPU resources.
 *
 * This file is the template for future 3D work: one module per scene, exporting
 * a `mount(canvas, options) => dispose` function.
 */
export function mountHeroScene(canvas: HTMLCanvasElement, options: HeroSceneOptions): () => void {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 6;

  const accent = cssColor(canvas, '--color-accent', '#8b7bff');
  const accent2 = cssColor(canvas, '--color-accent-2', '#3ee6c4');

  // Core shape
  const shapeGeometry = new THREE.IcosahedronGeometry(1.8, 1);
  const shapeMaterial = new THREE.MeshBasicMaterial({
    color: accent,
    wireframe: true,
    transparent: true,
    opacity: 0.55,
  });
  const shape = new THREE.Mesh(shapeGeometry, shapeMaterial);
  scene.add(shape);

  // Star field
  const starCount = 600;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < positions.length; i++) {
    positions[i] = (Math.random() - 0.5) * 24;
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const starMaterial = new THREE.PointsMaterial({
    color: accent2,
    size: 0.03,
    transparent: true,
    opacity: 0.7,
  });
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  // Sizing
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  // Subtle pointer parallax
  const pointer = { x: 0, y: 0 };
  const onPointerMove = (e: PointerEvent) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  };

  // Animation loop, paused while off-screen to save battery/GPU.
  const timer = new THREE.Timer();
  let visible = true;
  const tick = () => {
    if (!visible) return;
    timer.update();
    const dt = timer.getDelta();
    shape.rotation.x += dt * 0.12;
    shape.rotation.y += dt * 0.18;
    stars.rotation.y += dt * 0.01;
    camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.04;
    camera.position.y += (-pointer.y * 0.4 - camera.position.y) * 0.04;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  };

  let visibilityObserver: IntersectionObserver | undefined;
  if (options.animate) {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      renderer.setAnimationLoop(visible ? tick : null);
    });
    visibilityObserver.observe(canvas);
  }

  return () => {
    renderer.setAnimationLoop(null);
    visibilityObserver?.disconnect();
    resizeObserver.disconnect();
    window.removeEventListener('pointermove', onPointerMove);
    shapeGeometry.dispose();
    shapeMaterial.dispose();
    starGeometry.dispose();
    starMaterial.dispose();
    timer.dispose();
    renderer.dispose();
  };
}
