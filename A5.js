import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/OrbitControls.js';
import { ShadowMapViewer } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/utils/ShadowMapViewer.js';
import { OBJLoader } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/OBJLoader.js';

const viewDepthMap = true;

let camera, scene, renderer, clock;
let dirLight, spotLight;
let dirLightShadowMapViewer, spotLightShadowMapViewer;
let group, group1;
let canvas, container; // Add canvas and container (for resizing canvas size to good size)


init();
animate();

function init() {
	initScene();
	initShadowMapViewers();
	initMisc();

	//document.body.appendChild(renderer.domElement);
	window.addEventListener('resize', onWindowResize);
}

function initScene() {
	canvas = document.getElementById('canvas');
	container = document.getElementById('canvas-container');

	camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 1000);
	camera.position.set(0, 15, 35);

	scene = new THREE.Scene();

	// Lights
	scene.add(new THREE.AmbientLight(0x404040, 3));

	spotLight = new THREE.SpotLight(0xffffff, 500);
	spotLight.name = 'Spot Light';
	spotLight.angle = Math.PI / 5;
	spotLight.penumbra = 0.3;
	spotLight.position.set(10, 15, 5);
	spotLight.castShadow = true;
	spotLight.shadow.camera.near = 8;
	spotLight.shadow.camera.far = 30;
	spotLight.shadow.mapSize.width = 1024;
	spotLight.shadow.mapSize.height = 1024;
	scene.add(spotLight);

	scene.add(new THREE.CameraHelper(spotLight.shadow.camera));

	dirLight = new THREE.DirectionalLight(0xffffff, 3);
	dirLight.name = 'Dir. Light';
	dirLight.position.set(0, 10, 0);
	dirLight.castShadow = true;
	dirLight.shadow.camera.near = 1;
	dirLight.shadow.camera.far = 10;
	dirLight.shadow.camera.right = 15;
	dirLight.shadow.camera.left = - 15;
	dirLight.shadow.camera.top = 15;
	dirLight.shadow.camera.bottom = - 15;
	dirLight.shadow.mapSize.width = 1024;
	dirLight.shadow.mapSize.height = 1024;
	scene.add(dirLight);

	scene.add(new THREE.CameraHelper(dirLight.shadow.camera));

	// Geometry
	let material = new THREE.MeshPhongMaterial({
		color: 0xff80ac,
		shininess: 150,
		specular: 0x222222
	});

	const metalMaterial = new THREE.MeshStandardMaterial({
		color: 0xff0000, // Red color
		metalness: 0.9,
		roughness: 0.1,
	});

	group = new THREE.Group();

	const loader = new OBJLoader();

	function onProgress(xhr) {
		if (xhr.lengthComputable) {
			const percentComplete = xhr.loaded / xhr.total * 100;
			//console.log('model ' + percentComplete.toFixed(2) + '% downloaded');
		}
	}

	function onError() { }

	// const boxGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
	for (let x = -3; x <= 3; x++)
		for (let y = -3; y <= 3; y++)
			for (let z = -3; z <= 3; z++) {
				loader.load('models/person.obj', function (object) {

					// attach material
					object.traverse(function (child) {
						if (child.isMesh) {
							child.material = metalMaterial; // Apply the material to each mesh
							child.castShadow = true;
							child.receiveShadow = true;
						}
					});
			
					// Calculate the bounding box to get model size and center
					const boundingBox = new THREE.Box3().setFromObject(object);
			
					// Center the model
					const center = boundingBox.getCenter(new THREE.Vector3());
					
					// Scale the model to a unit scale and center it to (0,0,0)
					const size = boundingBox.getSize(new THREE.Vector3());
					const maxDimension = Math.max(size.x, size.y, size.z);
					const scale = 7.0 / maxDimension;
					object.scale.set(scale, scale, scale);
					object.position.set(-center.x * scale, -center.y * scale, -center.z * scale)
			
					// Add the model to the group
					// object.position.set(x,y,z);
					group.add(object); // OG OBJECT

					if (x === 3 && y === 3 && z === 3){
						group1 = group.clone();
						group1.scale.set(0.5, 0.5, 0.5);
						group1.position.set(10, 3, 10);
						scene.add(group1)
					}
				}, onProgress, onError);
	// 			const cube = new THREE.Mesh(boxGeometry, material);
	// 			cube.position.set(x, y, z);
	// 			cube.castShadow = true;
	// 			cube.receiveShadow = true;
	// 			group.add(cube)
			}

	// shift everything up by 2
	group.position.set(0, 5, 0);
	scene.add(group)

	// COPIED OBJECT (idk why its not showing up)
	// group1 = group.clone();
	// group1.scale.set(0.5, 0.5, 0.5);
	// group1.position.set(10, 3, 10);
	// scene.add(group1)

	// THIS IS THE PLANE
	const geometry = new THREE.BoxGeometry(10, 0.15, 10);
	material = new THREE.MeshPhongMaterial({
		color: 0xa0adaf,
		shininess: 150,
		specular: 0x111111
	});

	const ground = new THREE.Mesh(geometry, material);
	ground.scale.multiplyScalar(3);
	ground.castShadow = false;
	ground.receiveShadow = true;
	scene.add(ground);
}

function initShadowMapViewers() {
	dirLightShadowMapViewer = new ShadowMapViewer(dirLight);
	spotLightShadowMapViewer = new ShadowMapViewer(spotLight);
	resizeShadowMapViewers();
}

function initMisc() {
	renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(container.clientWidth, container.clientHeight);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.BasicShadowMap;

	// Mouse control
	const controls = new OrbitControls(camera, renderer.domElement);
	controls.target.set(0, 2, 0);
	controls.update();

	clock = new THREE.Clock();
}

function resizeShadowMapViewers() {
	const size = window.innerWidth * 0.15;

	dirLightShadowMapViewer.position.x = 10;
	dirLightShadowMapViewer.position.y = 10;
	dirLightShadowMapViewer.size.width = size;
	dirLightShadowMapViewer.size.height = size;
	dirLightShadowMapViewer.update();

	spotLightShadowMapViewer.size.set(size, size);
	spotLightShadowMapViewer.position.set(size + 20, 10);
	spotLightShadowMapViewer.update();
}

function onWindowResize() {
	camera.aspect = container.clientWidth / container.clientHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(container.clientWidth, container.clientHeight);

	resizeShadowMapViewers();
	dirLightShadowMapViewer.updateForWindowResize();
	spotLightShadowMapViewer.updateForWindowResize();
}

function animate() {
	requestAnimationFrame(animate);
	render();
}

function renderScene() {
	renderer.render(scene, camera);
}

function renderShadowMapViewers() {
	dirLightShadowMapViewer.render(renderer);
	spotLightShadowMapViewer.render(renderer);
}

function render() {
	const delta = clock.getDelta();

	renderScene();
	if (viewDepthMap)
		renderShadowMapViewers();

	group.rotation.x += 0.25 * delta;
	group.rotation.y += 2 * delta;
	group.rotation.z += 1 * delta;

	//group.rotation.x = 0.4;
	//group.rotation.y = 0.45;
	//group.rotation.z = 0.3;

	group1.rotation.x += 0.05 * delta;
	group1.rotation.y += 0.5 * delta;
	group1.rotation.z += 0.25 * delta;
}