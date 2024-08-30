import * as THREE from 'three';
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';

let camera, scene, renderer, material;
let controls;
let canvas, container;
let pause = true;

function blackBodyColor(value) {
    // Ensure the value is within [0, 1]
    value = Math.min(Math.max(value, 0), 1);

    // Define color stops
    const colors = [
        { pos: 0, color: { r: 0, g: 0, b: 0 } },      // Black
        { pos: 0.2, color: { r: 0.545, g: 0, b: 0 } },  // Dark Red
        { pos: 0.4, color: { r: 1, g: 0.27, b: 0 } }, // OrangeRed
        { pos: 0.6, color: { r: 1, g: 1, b: 0 } },// Yellow
        { pos: 0.8, color: { r: 1, g: 1, b: 1 } }, // White
        { pos: 1.0, color: { r: 0, g: 0, b: 1 } }   // Blue
    ];

    // Find the two nearest color stops
    let start = colors[0], end = colors[colors.length - 1];
    for (let i = 0; i < colors.length - 1; i++) {
        if (value >= colors[i].pos && value <= colors[i + 1].pos) {
            start = colors[i];
            end = colors[i + 1];
            break;
        }
    }
    // Interpolate between the start and end colors
    const mix = (value - start.pos) / (end.pos - start.pos);
    const r = start.color.r + (end.color.r - start.color.r) * mix;
    const g = start.color.g + (end.color.g - start.color.g) * mix;
    const b = start.color.b + (end.color.b - start.color.b) * mix;
    return [r, g, b];
}

class particleSystem {
	// [-0.5, 0.5]^3
	getRandomVec() {
		return [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5];
	}
	getFixedPosition() {
		return [0,0,0];
	}
	getRandomColor() {
		return [Math.random(), Math.random(), Math.random()];
	}
	getWhiteColor() {
		return [1, 1, 1]; // r, g, b
	}

	constructor(nParticles) {
		this.m_nParticles = nParticles;

		//this.BrownianWalkInit();
		//this.gravityFallInit();
		this.gravityAttractInit();
		// depthTest: false,
		const sprite = new THREE.TextureLoader().load('textures/disc.png');
		sprite.colorSpace = THREE.SRGBColorSpace;
		material = new THREE.PointsMaterial({
			size: 0.03,
			sizeAttenuation: true,
			map: sprite,
			alphaTest: 0.5,
			blending: THREE.AdditiveBlending, 
			transparent: true,
			vertexColors: true // Use vertex colors
		});
		this.m_allParticles = new THREE.Points(this.m_geometry, material);
		this.m_positions = this.m_allParticles.geometry.attributes.position.array;
		this.m_color = this.m_allParticles.geometry.attributes.color.array;
	}

	// update particles.
	update() {
		//this.BrownianWalk();
		//this.gravityFall();
		this.gravityAttract();
		this.m_allParticles.geometry.attributes.position.needsUpdate = true;
		this.m_allParticles.geometry.attributes.color.needsUpdate = true;
	}

	BrownianWalkInit() {
		this.m_geometry = new THREE.BufferGeometry();
		const vertices = [];
		const colors = [];
		for (let i = 0; i < this.m_nParticles; i++) {
			const P = this.getRandomVec()
			vertices.push(0, P[1], P[2]); // x,y,z coordinates
			const C = this.getWhiteColor()
			colors.push(C[0], C[1], C[2]); // Add the color for this vertex
		}
		this.m_geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
		this.m_geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
	}
	BrownianWalk() {
		const displacementScale = 0.03; // Control the "energy" of the motion
		// update position and color
		for (let i = 0; i < this.m_positions.length; i += 3) {
			// For each vertex (particle), add a small random displacement
			this.m_positions[i] +=     (Math.random() - 0.5) * displacementScale; // x
			this.m_positions[i + 1] += (Math.random() - 0.5) * displacementScale; // y
			this.m_positions[i + 2] += (Math.random() - 0.5) * displacementScale; // z
			// compute the distance from the center.
			let dist = Math.sqrt(this.m_positions[i] * this.m_positions[i] + this.m_positions[i + 1] * this.m_positions[i + 1] + this.m_positions[i + 2] * this.m_positions[i + 2]);
			// reset to origin if moved to far.
			if (dist > 1.3) {
				this.m_positions[i] = 0;
				this.m_positions[i + 1] = 0;
				this.m_positions[i + 2] = 0;
				dist = 0.0;
			}
			let color = blackBodyColor(dist);
			this.m_color[i] = color[0];
			this.m_color[i + 1] = color[1];
			this.m_color[i + 2] = color[2];
		}
	}
	
	gravityFallInit() {
		this.m_geometry = new THREE.BufferGeometry();
		const vertices = [];
		const colors = [];
		for (let i = 0; i < this.m_nParticles; i++) {
			vertices.push(0, 0, 0);
			const C = this.getRandomColor()
			colors.push(C[0], C[1], C[2]); // Add the color for this vertex
		}
		this.m_geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
		this.m_geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
		this.m_velocity = new Float32Array(this.m_nParticles * 3);
		for (let i = 0; i < this.m_velocity.length; i += 3) {
			const V = this.getRandomVec()
			this.m_velocity[i] = V[0];
			this.m_velocity[i + 1] = 0.5 + V[1];
			this.m_velocity[i + 2] = V[2];
		}

		// Create a metallic material with a gold tint
		const metalMaterial = new THREE.MeshStandardMaterial({
			color: 0xFFD700, // Gold color
			metalness: 0.9, // Fully metallic
			roughness: 0.1 // A bit of roughness to simulate gold's reflectivity
		});
		const boxGeometry = new THREE.BoxGeometry(2, 0.2, 2)
		// add cube to the scene
		const cube = new THREE.Mesh(boxGeometry, metalMaterial);
		cube.position.set(0, -1.1, 0);
		scene.add(cube);
	}

	gravityFall() {
		const a = -1.0;  // acceleration
		const dt = 1.0/60.0;  // timestep
		for (let i = 0; i < this.m_positions.length; i += 3) {
			this.m_velocity[i + 1] += a * dt;
			this.m_positions[i] += this.m_velocity[i] * dt; // v_x
			this.m_positions[i + 1] += this.m_velocity[i + 1] * dt; // v_y
			this.m_positions[i + 2] += this.m_velocity[i + 2] * dt; // v_z

			// compute the distance from the center.
			let dist = Math.sqrt(this.m_velocity[i] * this.m_velocity[i] + this.m_velocity[i + 1] * this.m_velocity[i + 1] + this.m_velocity[i + 2] * this.m_velocity[i + 2]);
			let color = blackBodyColor(dist * 0.5);
			this.m_color[i] = color[0];
			this.m_color[i + 1] = color[1];
			this.m_color[i + 2] = color[2];

			// bounce on obstacle
			if (this.m_positions[i + 1] < -1.0 && Math.abs(this.m_positions[i]) < 1.0 && Math.abs(this.m_positions[i + 2]) < 1.0) {
				this.m_velocity[i + 1] = 0.6 * Math.abs(this.m_velocity[i + 1]);
			}

			// reset
			if (this.m_positions[i + 1] < -2.0) {
				this.m_positions[i] = 0;
				this.m_positions[i + 1] = 0;
				this.m_positions[i + 2] = 0;
				this.m_velocity[i + 1] = 0.5 + Math.random(); // [0, 1]
			}
		}
	}

	gravityAttractInit() {
		this.m_geometry = new THREE.BufferGeometry();
		const vertices = [];
		const colors = [];
		for (let i = 0; i < this.m_nParticles; i++) {
			const P = this.getRandomVec();
			vertices.push(P[0] * 2.0, P[1] * 2.0, P[2] * 2.0);
			const C = this.getRandomColor();
			colors.push(C[0], C[1], C[2]); // Add the color for this vertex
		}
		this.m_geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
		this.m_geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
		this.m_velocity = new Float32Array(this.m_nParticles * 3);
		for (let i = 0; i < this.m_velocity.length; i += 3) {
			const V = this.getRandomVec()
			this.m_velocity[i] = V[0];
			this.m_velocity[i + 1] = V[1];
			this.m_velocity[i + 2] = V[2];
		}
		
		// Create a metallic material with a gold tint
		const metalMaterial = new THREE.MeshStandardMaterial({
			color: 0xFFD700, // Gold color
			metalness: 0.9, // Fully metallic
			roughness: 0.1 // A bit of roughness to simulate gold's reflectivity
		});

		const metalMaterialRed = new THREE.MeshStandardMaterial({
			color: 0xFF0000, // Red color
			metalness: 0.9, // Fully metallic
			roughness: 0.1 // A bit of roughness to simulate gold's reflectivity
		});

		// Store planets as references to serve as properties for the particleSystem class
		// Planet 1
		const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32); // radius, widthSegments, heightSegments
		this.planet1 = new THREE.Mesh(sphereGeometry, metalMaterial);
		// [0,0,0]: center of gravity
		this.planet1.position.set(0, 0, 0)
		scene.add(this.planet1);


		// Planet 2
		const planetTwoGeo = new THREE.SphereGeometry(0.5, 32, 32);
		this.planet2 = new THREE.Mesh(planetTwoGeo, metalMaterialRed);
		this.planet2.position.set(-1, 1.5, 0);
		scene.add(this.planet2);
	}

	gravityAttract() {
		const G = 0.3;
		const dt = 1.0/60.0;  // timestep
		let minSpeed = 100000.0;
		let maxSpeed = 0;

		for (let i = 0; i < this.m_positions.length; i += 3) {
			// compute A.
			let P = new THREE.Vector3(this.m_positions[i], this.m_positions[i + 1], this.m_positions[i + 2]); // particle position
			
			// Comment out since they normalize P before force computation
			// let r = P.length();
			// P.normalize();
			// let a = - G/(r * r);

			// Calculate Planet 1 force
			let toP1 = new THREE.Vector3().subVectors(this.planet1.position, P); // Vector from particle P to planet 1
			let r1 = toP1.length(); // distance from planet 1 to the particle
			let f1 = toP1.normalize().multiplyScalar(G/(r1 * r1));  // normalize unit vector + scale by gravitational constant formula 

			// Calculate Planet 2 force
			let toP2 = new THREE.Vector3().subVectors(this.planet2.position, P); // Vector from particle P to planet 2
			let r2 = toP2.length(); // distance from planet 2 to the particle
			let f2 = toP2.normalize().multiplyScalar(G/(r2 * r2)); // normalize unit vector + scale by gravitational constant formula 

			// Combine forces (sum of forces from both planets)
			let combinedForce = new THREE.Vector3().addVectors(f1, f2);

			// Update Velocity in x,y,z directions using combined force + timestep
			this.m_velocity[i] += combinedForce.x * dt;
			this.m_velocity[i + 1] += combinedForce.y * dt;
			this.m_velocity[i + 2] += combinedForce.z * dt;

			// Update Velocity in x,y,z directions
			this.m_positions[i] += this.m_velocity[i] * dt;
			this.m_positions[i + 1] += this.m_velocity[i + 1] * dt;
			this.m_positions[i + 2] += this.m_velocity[i + 2] * dt;

			let speedMag = Math.sqrt(this.m_velocity[i] * this.m_velocity[i] + this.m_velocity[i + 1] * this.m_velocity[i + 1] + this.m_velocity[i + 2] * this.m_velocity[i + 2]);
			minSpeed = Math.min(speedMag, minSpeed);
			maxSpeed = Math.max(speedMag, maxSpeed);

			let color = blackBodyColor(speedMag);
			this.m_color[i] = color[0];
			this.m_color[i + 1] = color[1];
			this.m_color[i + 2] = color[2];

			// reset (based it on the planets 1 and 2. Couldn't figure out particle oscillations)
			if (r1 < 0.8 ||  r2 < 0.8 || r1 > 5.0 || r2 > 5.0) {
				this.m_positions[i] = Math.random() * 0.8 + 0.8; // x
				this.m_positions[i + 1] = 0; // y
				this.m_positions[i + 2] = 0; // z
				this.m_velocity[i] = 0;
				this.m_velocity[i + 1] = Math.abs(Math.random()) * 0.5 + 0.3; // v_y
				this.m_velocity[i + 2] = Math.abs(Math.random()) * 0.1; // v_z
			}
		}

		// minSpeed -> 0
		// maxSpeed -> 1
		const speedR = maxSpeed - minSpeed; // range of velociy
		for (let i = 0; i < this.m_positions.length; i += 3) {
			let speedMag = Math.sqrt(this.m_velocity[i] * this.m_velocity[i] + this.m_velocity[i + 1] * this.m_velocity[i + 1] + this.m_velocity[i + 2] * this.m_velocity[i + 2]);
			let color = blackBodyColor((speedMag - minSpeed) / speedR); 
			this.m_color[i] = color[0];
			this.m_color[i + 1] = color[1];
			this.m_color[i + 2] = color[2];
		}
	}
}

let particleSys;

function onKeyDown(event) {
    if (event.key == 'p') {
		pause = !pause;
    }
}

function init() {

	canvas = document.getElementById('canvas');
	container = document.getElementById('canvas-container');

	camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 1000);
	camera.position.z = 5;
	scene = new THREE.Scene();

	
	
	// add light.
	const directionLight = new THREE.DirectionalLight(0xffffff, 2)
	directionLight.position.set(0, 0, 10)
	scene.add(directionLight)

	const ambientLight = new THREE.AmbientLight(0xffffff, 1); // white light at 50% intensity
	scene.add(ambientLight)
	
	// 100K
	particleSys = new particleSystem(100000);

	scene.add(particleSys.m_allParticles);

	renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(container.clientWidth, container.clientHeight);

	// document.body.appendChild(renderer.domElement);
	document.body.style.touchAction = 'none';
	
	// Adding OrbitControls
	controls = new OrbitControls(camera, renderer.domElement);
	window.addEventListener('resize', onWindowResize);
	window.addEventListener('keydown', onKeyDown, false);
}

function onWindowResize() {
	camera.aspect = container.clientWidth / container.clientHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(container.clientWidth, container.clientHeight);
	
}

function render() {
	renderer.render(scene, camera);
}

function animate() {
	requestAnimationFrame(animate);
	controls.update();
	if (!pause)
		particleSys.update();
	render();
}

init();
animate();