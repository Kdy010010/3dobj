class Vector3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    rotateX(angle) {
        const rad = angle * (Math.PI / 180);
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const y = this.y * cos - this.z * sin;
        const z = this.y * sin + this.z * cos;
        return new Vector3(this.x, y, z);
    }

    rotateY(angle) {
        const rad = angle * (Math.PI / 180);
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const x = this.x * cos + this.z * sin;
        const z = this.z * cos - this.x * sin;
        return new Vector3(x, this.y, z);
    }

    rotateZ(angle) {
        const rad = angle * (Math.PI / 180);
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const x = this.x * cos - this.y * sin;
        const y = this.x * sin + this.y * cos;
        return new Vector3(x, y, this.z);
    }

    project(viewWidth, viewHeight, fov, viewDistance, camera) {
        const x = this.x - camera.x;
        const y = this.y - camera.y;
        const z = this.z - camera.z;
        
        const factor = fov / (viewDistance + z);
        const px = x * factor + viewWidth / 2;
        const py = -y * factor + viewHeight / 2;
        return new Vector3(px, py, z);
    }
}

class Cube {
    constructor(center, size) {
        this.vertices = [
            new Vector3(center.x - size / 2, center.y - size / 2, center.z - size / 2),
            new Vector3(center.x + size / 2, center.y - size / 2, center.z - size / 2),
            new Vector3(center.x + size / 2, center.y + size / 2, center.z - size / 2),
            new Vector3(center.x - size / 2, center.y + size / 2, center.z - size / 2),
            new Vector3(center.x - size / 2, center.y - size / 2, center.z + size / 2),
            new Vector3(center.x + size / 2, center.y - size / 2, center.z + size / 2),
            new Vector3(center.x + size / 2, center.y + size / 2, center.z + size / 2),
            new Vector3(center.x - size / 2, center.y + size / 2, center.z + size / 2),
        ];

        this.edges = [
            [0, 1], [1, 2], [2, 3], [3, 0], 
            [4, 5], [5, 6], [6, 7], [7, 4],
            [0, 4], [1, 5], [2, 6], [3, 7]
        ];
    }

    rotateX(angle) {
        this.vertices = this.vertices.map(v => v.rotateX(angle));
    }

    rotateY(angle) {
        this.vertices = this.vertices.map(v => v.rotateY(angle));
    }

    rotateZ(angle) {
        this.vertices = this.vertices.map(v => v.rotateZ(angle));
    }

    draw(ctx, viewWidth, viewHeight, fov, viewDistance, camera) {
        ctx.clearRect(0, 0, viewWidth, viewHeight);
        const projected = this.vertices.map(v => v.project(viewWidth, viewHeight, fov, viewDistance, camera));

        ctx.beginPath();
        this.edges.forEach(([start, end]) => {
            ctx.moveTo(projected[start].x, projected[start].y);
            ctx.lineTo(projected[end].x, projected[end].y);
        });
        ctx.stroke();
    }
}

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const viewWidth = canvas.width;
const viewHeight = canvas.height;
const fov = 256;
const viewDistance = 4;
const cube = new Cube(new Vector3(0, 0, 4), 2);
let camera = new Vector3(0, 0, -10);
let isDragging = false;
let previousX, previousY;

function draw() {
    cube.draw(ctx, viewWidth, viewHeight, fov, viewDistance, camera);
}

canvas.addEventListener('touchstart', (e) => {
    isDragging = true;
    previousX = e.touches[0].clientX;
    previousY = e.touches[0].clientY;
});

canvas.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - previousX;
    const deltaY = e.touches[0].clientY - previousY;
    previousX = e.touches[0].clientX;
    previousY = e.touches[0].clientY;
    cube.rotateY(deltaX * 0.5);
    cube.rotateX(-deltaY * 0.5);
    draw();
});

canvas.addEventListener('touchend', () => {
    isDragging = false;
});

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            camera.y -= 1;
            break;
        case 'ArrowDown':
            camera.y += 1;
            break;
        case 'ArrowLeft':
            camera.x -= 1;
            break;
        case 'ArrowRight':
            camera.x += 1;
            break;
        case 'w':
            camera.z += 1;
            break;
        case 's':
            camera.z -= 1;
            break;
    }
    draw();
});

draw();
