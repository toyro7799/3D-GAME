// main.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Scene, Camera, and Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Sky blue background

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 15);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimize for high-res displays

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 10, 5);
scene.add(directionalLight);
// main.js (continued)

// Player (a simple cube)
const playerGeometry = new THREE.BoxGeometry(1, 2, 1);
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Red
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.y = 1; // Position player above the ground
scene.add(player);

// Ground
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 }); // Forest green
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Rotate to be flat
scene.add(ground);

// Obstacles for Collision
const obstacles = [];
const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown

for (let i = 0; i < 5; i++) {
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.set(
        (Math.random() - 0.5) * 40,
        1,
        (Math.random() - 0.5) * 40
    );
    obstacles.push(box);
    scene.add(box);
}
// main.js (continued)

// Camera Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooths camera movement
controls.target.copy(player.position); // Make camera focus on the player
// main.js (continued)

// Player Movement
const keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

window.addEventListener('keydown', (event) => {
    if (keys[event.key.toLowerCase()] !== undefined) {
        keys[event.key.toLowerCase()] = true;
    }
});

window.addEventListener('keyup', (event) => {
    if (keys[event.key.toLowerCase()] !== undefined) {
        keys[event.key.toLowerCase()] = false;
    }
});

const moveSpeed = 0.1;
const playerVelocity = new THREE.Vector3();
// main.js (continued)

// Collision Detection
const playerBB = new THREE.Box3();
const obstaclesBB = obstacles.map(obstacle => new THREE.Box3().setFromObject(obstacle));

function checkCollisions() {
    playerBB.setFromObject(player);
    for (const obstacleBB of obstaclesBB) {
        if (playerBB.intersectsBox(obstacleBB)) {
            // Play sound on collision
            collisionSound.play();
            return true; // Collision detected
        }
    }
    return false;
}
// main.js (continued)

// Sound
const listener = new THREE.AudioListener();
camera.add(listener); // Attach listener to the camera

const backgroundMusic = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();

audioLoader.load('sounds/music.mp3', function(buffer) {
    backgroundMusic.setBuffer(buffer);
    backgroundMusic.setLoop(true);
    backgroundMusic.setVolume(0.3);
    // User must interact with the page first to play audio
    window.addEventListener('click', () => {
        if (!backgroundMusic.isPlaying) {
            backgroundMusic.play();
        }
    }, { once: true });
});

const collisionSound = new THREE.Audio(listener);
audioLoader.load('sounds/collision.wav', function(buffer) {
    collisionSound.setBuffer(buffer);
    collisionSound.setVolume(0.8);
});
// main.js (continued)

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta(); // Time since last frame (for frame-rate independence)

    // Player Movement Logic
    playerVelocity.set(0, 0, 0);
    if (keys.w) playerVelocity.z -= moveSpeed;
    if (keys.s) playerVelocity.z += moveSpeed;
    if (keys.a) playerVelocity.x -= moveSpeed;
    if (keys.d) playerVelocity.x += moveSpeed;

    const oldPosition = player.position.clone();
    player.position.add(playerVelocity);

    // Collision Response
    if (checkCollisions()) {
        player.position.copy(oldPosition); // Revert to previous position if collision
    }

    // Update camera to follow player
    controls.target.copy(player.position);
    controls.update();

    // Render the scene
    renderer.render(scene, camera);
}
// main.js (continued)

// Responsive Design
window.addEventListener('resize', () => {
    // Update camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Start the animation loop
animate();
