// Scene setup variables
let scene, camera, renderer, smallSparks, largeSparks;

// Total spark count and proportions
const sparkCount = 20000; // Total number of sparks
const smallSparkCount = Math.floor(sparkCount * 0.7); // 70% small sparks (static layer)
const largeSparkCount = sparkCount - smallSparkCount; // 30% large sparks (dynamic layer)

// General configurations for spark behavior
const heightLimit = 600; // Maximum height for sparks
const startY = -1300; // Starting y-position for sparks
const xFreq = 0.01; // Frequency for x-axis sinusoidal movement
const zFreq = 0.012; // Frequency for z-axis sinusoidal movement
const ySpeedSmall = 0.7; // Slow vertical speed for small sparks
const ySpeedLarge = 2.5; // Fast vertical speed for large sparks
const amplitude = 0.5; // Amplitude for sinusoidal motion

// Phase arrays to add randomness to spark movement
let smallPhases = [];
let largePhases = [];

function initSparks() {
    // Create the Three.js scene
    scene = new THREE.Scene();

    // Set up the camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.set(0, 0, 700); // Camera positioned to look at the center
    camera.lookAt(0, 0, 0);

    // ===================== Small Sparks (Static Layer) =====================
    const smallPositions = new Float32Array(smallSparkCount * 3); // Position data for small sparks
    const smallColors = new Float32Array(smallSparkCount * 3); // Color data for small sparks

    for (let i = 0; i < smallSparkCount; i++) {
        const i3 = i * 3; // Calculate index for x, y, z
        smallPositions[i3 + 0] = (Math.random() - 0.5) * 2000; // Random x-position
        smallPositions[i3 + 1] = startY + Math.random() * (0.3 * heightLimit); // Static y-position
        smallPositions[i3 + 2] = (Math.random() - 0.5) * 2000; // Random z-position

        // Color in orange to yellow hues
        let r = 1.0;
        let g = 0.4 + Math.random() * 0.3;
        let b = 0.0 + Math.random() * 0.2;
        smallColors[i3 + 0] = r;
        smallColors[i3 + 1] = g;
        smallColors[i3 + 2] = b;

        // Random phases for x and z movement
        smallPhases[i] = {
            xPhase: Math.random() * 100,
            zPhase: Math.random() * 100
        };
    }

    // Buffer geometry and material for small sparks
    const smallSparkGeo = new THREE.BufferGeometry();
    smallSparkGeo.setAttribute('position', new THREE.Float32BufferAttribute(smallPositions, 3));
    smallSparkGeo.setAttribute('color', new THREE.Float32BufferAttribute(smallColors, 3));

    // Material for small sparks
    const sprite = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/disc.png');
    const smallSparkMaterial = new THREE.PointsMaterial({
        size: 4.5, // Larger size for static sparks
        map: sprite,
        sizeAttenuation: true, // Ensure size is not affected by distance
        vertexColors: true,
        blending: THREE.AdditiveBlending, // Additive blending for glowing effect
        transparent: true,
        depthWrite: true // Prevent depth conflicts
    });

    // Add small sparks to the scene
    smallSparks = new THREE.Points(smallSparkGeo, smallSparkMaterial);
    scene.add(smallSparks);

    // ===================== Large Sparks (Dynamic Layer) =====================
    const largePositions = new Float32Array(largeSparkCount * 3); // Position data for large sparks
    const largeColors = new Float32Array(largeSparkCount * 3); // Color data for large sparks

    for (let i = 0; i < largeSparkCount; i++) {
        const i3 = i * 3;
        largePositions[i3 + 0] = (Math.random() - 0.5) * 2000; // Random x-position
        largePositions[i3 + 1] = startY + Math.random() * (0.3 * heightLimit); // Initial position near static sparks
        largePositions[i3 + 2] = (Math.random() - 0.5) * 2000; // Random z-position

        // Bright orange colors for large sparks
        largeColors[i3 + 0] = 1.0;
        largeColors[i3 + 1] = 0.4 + Math.random() * 0.3;
        largeColors[i3 + 2] = 0.0;

        // Random phases for x and z movement
        largePhases[i] = {
            xPhase: Math.random() * 100,
            zPhase: Math.random() * 100
        };
    }

    // Buffer geometry and material for large sparks
    const largeSparkGeo = new THREE.BufferGeometry();
    largeSparkGeo.setAttribute('position', new THREE.Float32BufferAttribute(largePositions, 3));
    largeSparkGeo.setAttribute('color', new THREE.Float32BufferAttribute(largeColors, 3));

    // Material for large sparks
    const largeSparkMaterial = new THREE.PointsMaterial({
        size: 4.5, // Smaller size for moving sparks
        map: sprite,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false
    });

    // Add large sparks to the scene
    largeSparks = new THREE.Points(largeSparkGeo, largeSparkMaterial);
    scene.add(largeSparks);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Start animation
    animateSparks();
}




function animateSparks() {
    // Update small and large sparks
    updateSmallSparks(smallSparks, smallPhases, ySpeedSmall, 0.3); // Small sparks remain slow
    updateLargeSparks(largeSparks, largePhases, ySpeedLarge, 0.3); // Large sparks rise with trails

    // Render the scene
    renderer.render(scene, camera);
    requestAnimationFrame(animateSparks); // Loop animation
}

function updateSmallSparks(sparks, phases, speed, fadeSpeed) {
    const positions = sparks.geometry.attributes.position.array; // Position buffer
    const colors = sparks.geometry.attributes.color.array; // Color buffer
    const count = positions.length / 3; // Number of sparks
    const heightLimit_smallsparks = window.innerHeight * 0.1; // 30% of screen height
    const speed_limit = speed

    for (let i = 0; i < count; i++) {
        const i3 = i * 3; // Index for x, y, z
        let x = positions[i3 + 0];
        let y = positions[i3 + 1];
        let z = positions[i3 + 2];

        y += speed;
        // console.log(`Updated Y position: ${y}, Speed: ${speed}`);


        // Sinusoidal movement for x and z
        const px = phases[i].xPhase;
        const pz = phases[i].zPhase;
        x += Math.sin(y * xFreq + px) * amplitude;
        z += Math.sin(y * zFreq + pz) * amplitude;

        // Calculate progress for fading
        const startY_offset = 0 + startY;
        let progress = (y - startY_offset) / (heightLimit - startY_offset);
        if (progress > 1) progress = 1;

        let fade = 1 - progress; // Fade as it rises

        // Fade effect for small sparks
        colors[i3 + 0] = fade * 1.0;
        colors[i3 + 1] = fade * 0.4;
        colors[i3 + 2] = fade * 0.1;

       // Check if spark has reached height limit
if (y > -330) {
    // Introduce a 1% chance for the spark to behave differently
    if (Math.random() < 0.01) {
        // This is the special spark
        y += speed * 3; // Increase speed significantly
        colors[i3 + 0] = 1.5; // Light up brighter (R)
        colors[i3 + 1] = 0.7; // Bright orange (G)
        colors[i3 + 2] = 0.3; // Subtle orange (B)

        // Create a trail effect by keeping previous spark positions slightly faded
        colors[i3 + 0] *= 0.98; // Gradual fade
        colors[i3 + 1] *= 0.95;
        colors[i3 + 2] *= 0.92;

        // Let the spark continue rising beyond the usual limit
        if (y > -100) {
            // Reset when it reaches an even higher limit
            x = (Math.random() - 0.5) * 1000; // Randomize x
            y = Math.random() * 50 - 600; // Reset to near the base
            z = (Math.random() - 0.5) * 1000; // Randomize z

            // Reset phases for sinusoidal movement
            phases[i].xPhase = Math.random() * 100;
            phases[i].zPhase = Math.random() * 100;

            // Reset color for fade effect
            colors[i3 + 0] = 1.0;
            colors[i3 + 1] = 0.4 + Math.random() * 0.3;
            colors[i3 + 2] = 0.0;
        }
    } else {
        // Regular spark behavior
        x = (Math.random() - 0.5) * 1000; // Randomize x
        y = Math.random() * 50 - 600; // Reset to near the base
        z = (Math.random() - 0.5) * 1000; // Randomize z

        // Reset phases for sinusoidal movement
        phases[i].xPhase = Math.random() * 100;
        phases[i].zPhase = Math.random() * 100;

        // Reset color for fade effect
        colors[i3 + 0] = 1.0;
        colors[i3 + 1] = 0.4 + Math.random() * 0.3;
        colors[i3 + 2] = 0.0;
    }
} else {
    // Sinusoidal movement for x and z
    const px = phases[i].xPhase;
    const pz = phases[i].zPhase;
    x += Math.sin(y * xFreq + px) * amplitude;
    z += Math.sin(y * zFreq + pz) * amplitude;

    // Fade effect
    let progress = y / heightLimit;
    let fade = 1 - progress; // Fade out as it rises
    colors[i3 + 0] = fade * 1.0;
    colors[i3 + 1] = fade * 0.4;
    colors[i3 + 2] = fade * 0.1;
}


        // Update positions
        positions[i3 + 0] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;
    }

    // Mark attributes for update
    sparks.geometry.attributes.position.needsUpdate = true;
    sparks.geometry.attributes.color.needsUpdate = true;
}

function updateLargeSparks(sparks, phases, speed, fadeSpeed) {
    const positions = sparks.geometry.attributes.position.array; // Position buffer
    const colors = sparks.geometry.attributes.color.array; // Color buffer
    const count = positions.length / 3; // Number of sparks

    for (let i = 0; i < count; i++) {
        const i3 = i * 3; // Index for x, y, z
        let x = positions[i3 + 0];
        let y = positions[i3 + 1];
        let z = positions[i3 + 2];

        // Move upward
        y += speed;

        // Sinusoidal movement for x and z
        const px = phases[i].xPhase;
        const pz = phases[i].zPhase;
        x += Math.sin(y * xFreq + px) * amplitude;
        z += Math.sin(y * zFreq + pz) * amplitude;

        // Calculate progress for fading
        const startY_offset = 0 + startY;
        let progress = (y - startY_offset) / (heightLimit - startY_offset);
        if (progress > 1) progress = 1;

        let fade = 1 - progress; // Fade as it rises

        // Trail effect for large sparks
        colors[i3 + 0] *= fadeSpeed;
        colors[i3 + 1] *= fadeSpeed;
        colors[i3 + 2] *= fadeSpeed;

        if (y > heightLimit * 0.3) {
            // Reset position and color when spark reaches height limit
            x = (Math.random() - 0.5) * 1000;
            y = startY + Math.random() * 200;
            z = (Math.random() - 0.5) * 1000;

            colors[i3 + 0] = 1.0;
            colors[i3 + 1] = 0.4 + Math.random() * 0.3;
            colors[i3 + 2] = 0.0;

            // Reset phases
            phases[i].xPhase = Math.random() * 100;
            phases[i].zPhase = Math.random() * 100;
        }

        // Update positions
        positions[i3 + 0] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;
    }

    // Mark attributes for update
    sparks.geometry.attributes.position.needsUpdate = true;
    sparks.geometry.attributes.color.needsUpdate = true;
}






// Handle window resizing
window.addEventListener('resize', () => {
    if (renderer && camera) {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
});

// Initialize the sparks on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    initSparks();
});
