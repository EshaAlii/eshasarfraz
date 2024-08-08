
// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const canvas = document.getElementById('canvas'); // Get canvas
const width = canvas.clientWidth; // canvas width
const height = canvas.clientHeight; // canvas height
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
const nWidth = width / Math.max(width, height) * 10;
const nHeight = height / Math.max(width, height) * 10;

//const camera = new THREE.OrthographicCamera(-nWidth / 2, nWidth / 2, nHeight / 2, -nHeight /2, 0.1, 1000);
scene.add(camera);

// Camera Position
camera.position.z = 10; // Adjusted to fit the person in view

// Render canvas
const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true}); // make it adjust to the canvas size
renderer.setSize(width, height); // Set the height and width

// Function to resize Window
function onWindowResize(){
    const newWidth = canvas.clientWidth;
    const newHeight = canvas.clientHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight, false);
}

// Event Listener to resize window
window.addEventListener('resize', onWindowResize, false);

// Define Materials
const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0xe32259 });
const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF});

// Create the head (A Sphere)
const headGeometry = new THREE.SphereGeometry(0.6, 16, 16);
const head = new THREE.Mesh(headGeometry, bodyMaterial);
const headEdgeGeo = new THREE.EdgesGeometry(headGeometry);
const headEdges = new THREE.LineSegments(headEdgeGeo, edgeMaterial);

// Create the torso (A Box)
const torsoGeometry = new THREE.BoxGeometry(1, 2, 0.7);
const torso = new THREE.Mesh(torsoGeometry, bodyMaterial);
const torsoEdgeGeo = new THREE.EdgesGeometry(torsoGeometry);
const torsoEdges = new THREE.LineSegments(torsoEdgeGeo, edgeMaterial);

// Create the right arm (A Box)
const rightArmGeometry = new THREE.BoxGeometry(0.5, 2, 0.5);
const rightArm = new THREE.Mesh(rightArmGeometry, bodyMaterial);
const rightArmEdgeGeo = new THREE.EdgesGeometry(rightArmGeometry);
const rightArmEdges = new THREE.LineSegments(rightArmEdgeGeo, edgeMaterial);

// Create the left arm (A Box)
const leftArmGeometry = new THREE.BoxGeometry(0.5, 2, 0.5);
const leftArm = new THREE.Mesh(leftArmGeometry, bodyMaterial);
const leftArmEdgeGeo = new THREE.EdgesGeometry(leftArmGeometry);
const leftArmEdges = new THREE.LineSegments(leftArmEdgeGeo, edgeMaterial);

// Create the right leg (A Box)
const rightLegGeometry = new THREE.BoxGeometry(0.6, 2, 0.5);
const rightLeg = new THREE.Mesh(rightLegGeometry, bodyMaterial);
const rightLegEdgeGeo = new THREE.EdgesGeometry(rightLegGeometry);
const rightLegEdges = new THREE.LineSegments(rightLegEdgeGeo, edgeMaterial);

// Create the left leg (A Box)
const leftLegGeometry = new THREE.BoxGeometry(0.6, 2, 0.5);
const leftLeg = new THREE.Mesh(leftLegGeometry, bodyMaterial);
const leftLegEdgeGeo = new THREE.EdgesGeometry(leftLegGeometry);
const leftLegEdges = new THREE.LineSegments(leftLegEdgeGeo, edgeMaterial);

// Reposition character features
torso.position.set(0, -1.6, 0);
torsoEdges.position.set(0, -1.6, 0);

rightArm.position.set(0.9, -1.7, 0);
rightArmEdges.position.set(0.9, -1.7, 0);

leftArm.position.set(-0.9, -1.7, 0);
leftArmEdges.position.set(-0.9, -1.7, 0);

rightLeg.position.set(0.3, -3.7, 0);
rightLegEdges.position.set(0.3, -3.7, 0);

leftLeg.position.set(-0.3, -3.7, 0);
leftLegEdges.position.set(-0.3, -3.7, 0);

// use group to create character
const group = new THREE.Group();
group.add(head);
group.add(headEdges);

group.add(torso);
group.add(torsoEdges);

group.add(rightArm);
group.add(rightArmEdges);

group.add(leftArm);
group.add(leftArmEdges);

group.add(rightLeg);
group.add(rightLegEdges);

group.add(leftLeg);
group.add(leftLegEdges);

scene.add(group);

group.scale.set(1.3, 1.3, 1.3)
group.position.set(0, 1.5, 0)

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate character
    group.rotation.x += 0.01;
    group.rotation.y += 0.05;
    group.rotation.z += 0.01;


    // Render scene + camera
    renderer.render(scene, camera);
}

// Animate
animate();