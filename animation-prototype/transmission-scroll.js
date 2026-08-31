import * as THREE from "three";

function boot() {
  const canvas = document.getElementById("gl");
  if (!canvas) { requestAnimationFrame(boot); return; }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0.6, 1.3, 7.2);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  renderer.setSize(window.innerWidth, window.innerHeight);

  scene.add(new THREE.HemisphereLight(0x9fc4ff, 0x2a2a2a, 1.1));
  const key = new THREE.DirectionalLight(0xfff2e0, 2.0);
  key.position.set(5, 6, 6);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xbfd9ff, 0.9);
  fill.position.set(-5, 1, 4);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0x3b9eff, 1.6);
  rim.position.set(-3, -2, -5);
  scene.add(rim);

  const iron = new THREE.MeshStandardMaterial({ color: 0x6a6b70, metalness: 0.35, roughness: 0.55 });
  const alloy = new THREE.MeshStandardMaterial({ color: 0xd3d6db, metalness: 0.85, roughness: 0.25 });
  const bronze = new THREE.MeshStandardMaterial({ color: 0xc99a5c, metalness: 0.75, roughness: 0.3 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2c2c2e, metalness: 0.4, roughness: 0.5 });
  const accent = new THREE.MeshStandardMaterial({ color: 0x4facfe, metalness: 0.5, roughness: 0.35 });

  const group = new THREE.Group();
  const parts = [];
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const addPart = (mesh, assembled, exploded, spin) => {
    mesh.position.copy(assembled);
    group.add(mesh);
    parts.push({ mesh, assembled, exploded, spin: spin || 0 });
  };

  const bellGeo = new THREE.CylinderGeometry(1.55, 1.15, 0.85, 48, 1, true);
  const bell = new THREE.Mesh(bellGeo, iron);
  bell.rotation.z = Math.PI / 2;
  addPart(bell, V(-1.3, 0, 0), V(-4.2, 0.4, 0));

  const body = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.1, 2.2, 48), iron);
  body.rotation.z = Math.PI / 2;
  addPart(body, V(0.15, 0, 0), V(-1.0, 0, 0));

  for (let i = 0; i < 5; i++) {
    const fin = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.035, 8, 40), alloy);
    fin.rotation.y = Math.PI / 2;
    addPart(fin, V(-0.7 + i * 0.5, 0, 0), V(-1.0 + i * 0.5, 0.15 * (i - 2), -0.3 - i * 0.1));
  }

  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.75, 1.2, 32), iron);
  tail.rotation.z = Math.PI / 2;
  addPart(tail, V(1.85, 0, 0), V(4.6, -0.6, -0.8));

  const outShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 1.6, 20), alloy);
  outShaft.rotation.z = Math.PI / 2;
  addPart(outShaft, V(2.85, 0, 0), V(6.3, -0.9, -1.2));

  const tcDisc = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.42, 40), bronze);
  tcDisc.rotation.z = Math.PI / 2;
  addPart(tcDisc, V(-2.9, 0, 0), V(-5.6, 1.6, 2.0));

  const tcRim = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.09, 16, 40), alloy);
  tcRim.rotation.y = Math.PI / 2;
  addPart(tcRim, V(-2.9, 0, 0), V(-5.6, 1.6, 2.0), 1.6);

  const tcHub = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.9, 16), alloy);
  tcHub.rotation.z = Math.PI / 2;
  addPart(tcHub, V(-3.35, 0, 0), V(-6.4, 1.9, 2.3));

  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2;
    const gGroup = new THREE.Group();
    const gearBody = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.3, 24), accent);
    gGroup.add(gearBody);
    for (let t = 0; t < 12; t++) {
      const ta = (t / 12) * Math.PI * 2;
      const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.09), accent);
      tooth.position.set(Math.cos(ta) * 0.38, 0, Math.sin(ta) * 0.38);
      tooth.rotation.y = -ta;
      gGroup.add(tooth);
    }
    addPart(gGroup,
      V(Math.cos(angle) * 0.5, Math.sin(angle) * 0.5, 0.55),
      V(Math.cos(angle) * 2.6, Math.sin(angle) * 2.6 - 1.2, 2.2 + i * 0.7),
      2.4);
  }

  const sunGear = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.4, 20), alloy);
  addPart(sunGear, V(0, 0, 0.55), V(-0.4, -1.8, 3.4), 3);

  const pan = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.28, 1.0), dark);
  addPart(pan, V(0.1, -1.25, 0), V(-3.8, -2.6, 3.2), -0.6);

  for (let i = 0; i < 8; i++) {
    const col = i % 4, row = i < 4 ? 1 : -1;
    const bx = col * 0.42 - 0.63;
    const bz = row * 0.42;
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.14, 6), alloy);
    addPart(bolt, V(0.1 + bx, -1.4, bz), V(-3.8 + bx * 1.4, -2.7, 3.2 + bz * 1.4));
  }

  scene.add(group);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  let progress = 0;
  const computeProgress = () => {
    const zoneStart = window.innerHeight * 1;
    const zoneHeight = window.innerHeight * 3;
    progress = Math.min(1, Math.max(0, (window.scrollY - zoneStart) / zoneHeight));
  };
  window.addEventListener("scroll", computeProgress, { passive: true });
  computeProgress();

  const clock = new THREE.Clock();
  const tick = () => {
    const dt = Math.min(0.05, clock.getDelta());
    group.rotation.y += dt * (0.22 + progress * 0.18);
    parts.forEach(p => {
      p.mesh.position.lerpVectors(p.assembled, p.exploded, progress);
      if (p.spin) p.mesh.rotation.y += dt * p.spin * (0.2 + progress);
    });
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };
  tick();
}
window.addEventListener("DOMContentLoaded", boot);
if (document.readyState !== "loading") boot();
