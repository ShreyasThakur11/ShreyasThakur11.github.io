const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.id = 'bg-canvas';
document.body.prepend(canvas);

let width, height;
let particles = [];

// Configuration
const PARTICLE_COUNT = 60;
const CONNECTION_DISTANCE = 150;
const MOLECULE_SIZE = 3;

// Resize handling
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

window.addEventListener('resize', resize);
resize();

// Particle Class
class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
        this.size = Math.random() * MOLECULE_SIZE + 1;
        this.color = `rgba(56, 189, 248, ${Math.random() * 0.5 + 0.2})`; // Primary color variant
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

// Initialize particles
for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
}

// Animation Loop
function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw connections first (layering)
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < CONNECTION_DISTANCE) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(56, 189, 248, ${1 - distance / CONNECTION_DISTANCE})`; // Original blue for background
                ctx.lineWidth = 1;
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    }

    particles.forEach((p) => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animate);
}

animate();

// Scroll Animation - Process Flow
const observerOptions = {
    threshold: 0.2,
    rootMargin: "0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.timeline-item, .card').forEach(el => {
    observer.observe(el);
});
