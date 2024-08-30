// Importing OrbitControls (make sure the path matches the version you are using)
import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/OBJLoader.js';

let camera, scene, renderer;
let object;
let canvas, container; // Add canvas and container (for resizing canvas size to good size)

init();

function init() {

	canvas = document.getElementById('canvas');
	container = document.getElementById('canvas-container');

	camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 20);
	camera.position.z = 2.5;

	// scene
	scene = new THREE.Scene();

	const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
	scene.add(ambientLight);

	const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
	directionalLight.position.set(1, 1, 0).normalize();
	scene.add(directionalLight);

	const envMaploader = new THREE.CubeTextureLoader();
	const environmentMap = envMaploader.load([
		'textures/Bridge2/posx.jpg', 'textures/Bridge2/negx.jpg',
		'textures/Bridge2/posy.jpg', 'textures/Bridge2/negy.jpg',
		'textures/Bridge2/posz.jpg', 'textures/Bridge2/negz.jpg'
	]);
	scene.environment = environmentMap;
	scene.background = environmentMap;

	const textureMap = new THREE.TextureLoader().load('textures/uv_grid_opengl.jpg');
	const textureMaterial = new THREE.MeshStandardMaterial({ map: textureMap });

	const bunnyTexture = new THREE.TextureLoader().load('models/Torus_Base.png');
	const bunnyMaterial = new THREE.MeshStandardMaterial({ map: bunnyTexture });

	// Create a metallic material with a gold tint
	const metalMaterial = new THREE.MeshStandardMaterial({
		color: 0xff80ac, // Pink color
		metalness: 1.5,
		roughness: 0.1,
	});

	const matteMaterial = new THREE.MeshStandardMaterial({
		color: 0x05eaff, // Gold color
		metalness: 0.1,
		roughness: 0.8
	});

	const glassmaterial = new THREE.MeshPhysicalMaterial({
		color: 0xffffff, // Adjust the color as needed
		metalness: 0, // Glass is not metallic
		roughness: 0, // Smooth surface
		transmission: 1, // 0 is fully opaque, 1 is fully transparent (glass-like)
		transparent: true, // Enable transparency
		reflectivity: 1, // Adjust for the level of reflectivity
		refractionRatio: 0.9, // Adjust for the level of refraction
	});

	const loader = new OBJLoader();
	// model
	function onProgress(xhr) {
		if (xhr.lengthComputable) {
			const percentComplete = xhr.loaded / xhr.total * 100;
			//console.log('model ' + percentComplete.toFixed(2) + '% downloaded');
		}
	}
	function onError() { }

	loader.load('models/person.obj', function (object) {

		// attach material
		object.traverse(function (child) {
			if (child.isMesh) {
				child.material = metalMaterial; // Apply the material to each mesh
				console.log("Wireframe mode:", child.material.wireframe);
			}
		});

		// Calculate the bounding box to get model size and center
		const boundingBox = new THREE.Box3().setFromObject(object);

		// Center the model
		const center = boundingBox.getCenter(new THREE.Vector3());
		
		// Scale the model to a unit scale and center it to (0,0,0)
		const size = boundingBox.getSize(new THREE.Vector3());
		const maxDimension = Math.max(size.x, size.y, size.z);
		const scale = 1.0 / maxDimension;
		object.scale.set(scale, scale, scale);
		object.position.set(-center.x * scale, -center.y * scale, -center.z * scale)

		// Add the model to the scene
		scene.add(object);
		render();
	}, onProgress, onError);

	renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(container.clientWidth, container.clientHeight);
	// document.body.appendChild(renderer.domElement);

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.addEventListener('change', render);
	window.addEventListener('resize', onWindowResize);

	onWindowResize();
}

// Function to resize canvas
function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function render() {
	renderer.render(scene, camera);
}