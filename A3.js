// Importing OrbitControls (make sure the path matches the version you are using)
import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/OrbitControls.js';

// Creating the scene
var scene = new THREE.Scene();

// Canvas and canvas container
const canvas = document.getElementById('canvas');
const container = document.getElementById('canvas-container')

// Creating the camera
var camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.z = 3;

// Creating the renderer
var renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
renderer.setSize(container.clientWidth, container.clientHeight);

// Function to resize canvas container
function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Event listener
window.addEventListener('resize', onWindowResize, false);

// add light.
const directionLight = new THREE.DirectionalLight(0xffffff, 0.5)
directionLight.position.set(0, 0, 10)
scene.add(directionLight)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // white light at 50% intensity
scene.add(ambientLight)

// load different color textures
const bumpTexture = new THREE.TextureLoader().load('textures/earth_bumpmap.jpg');
const heightEarthTexture = new THREE.TextureLoader().load('textures/earth_normalmap_8192x4096.jpg');
const earthTexture = new THREE.TextureLoader().load('textures/worldColor.jpg');

heightEarthTexture.colorSpace = THREE.SRGBColorSpace;
earthTexture.colorSpace = THREE.SRGBColorSpace;

const materialEarth = new THREE.MeshStandardMaterial({ map: earthTexture});
const materialHeightEarth = new THREE.MeshStandardMaterial({ map: heightEarthTexture});
const materialBump = new THREE.MeshStandardMaterial({ map: earthTexture, bumpMap : bumpTexture, bumpScale : 0.015 });
const plainMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const materialSecondBump = new THREE.MeshStandardMaterial({ map: heightEarthTexture, bumpMap: bumpTexture, bumpScale: 0.015});

// Sphere with normal earth bump mapping (RIGHT)
const sphereGeometry = new THREE.SphereGeometry(1, 720, 360); // radius, widthSegments, heightSegments
const sphere = new THREE.Mesh(sphereGeometry, materialBump);
sphere.position.set(1.5, 0, 0);
scene.add(sphere);

// Sphere with height and bump mapping textures (LEFT)
const secondSphereGeo = new THREE.SphereGeometry(1, 720, 360);
const secondSphere = new THREE.Mesh(secondSphereGeo, materialSecondBump);
secondSphere.position.set(-1.5, 0, 0);
scene.add(secondSphere);

// Adding OrbitControls
var controls = new OrbitControls(camera, renderer.domElement);

// Adjust control settings if needed
controls.minDistance = 1;
controls.maxDistance = 10;
controls.enablePan = true;

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();

    // Rendering the scene
    renderer.render(scene, camera);
}

animate();