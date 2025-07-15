const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#ffffff',
    scene: {
        create: create
    }
};

const game = new Phaser.Game(config);

function create() {
    const scene = this;

    initDescriptions(scene);
    initInfoText(scene);
    initDiagramData(scene);
    createSegments(scene);
    drawInitialSegments(scene);
    setupInteraction(scene);
}

// Descriptions text for each segment
function initDescriptions(scene) {
    scene.descriptions = [
        "ID: 10\nLeader: Mansoun Leke",
        "PFJP: 70\nLeader: Frens Ricter",
        "USP Reformers: 40\nLeader: Albin Clavin",
        "USP Moderates: 50\nLeader: Anton Rayne",
        "USP Conservatives: 40\nLeader: Gloria Tory",
        "NFP: 40\nLeader: Kesaro Kibener"
    ];
}

// Create info text box (hidden initially)
function initInfoText(scene) {
    scene.infoText = scene.add.text(20, 20, '', {
        font: '18px Arial',
        fill: '#000000',
        backgroundColor: '#f0f0f0',
        padding: { x: 10, y: 6 },
        wordWrap: { width: 300 }
    }).setDepth(100).setVisible(false);
}

// Initialize diagram parameters (center, radii, colors, etc)
function initDiagramData(scene) {
    scene.centerX = 400;
    scene.centerY = 500;
    scene.outerRadius = 100;
    scene.innerRadius = 20;
    scene.percentages = [4, 28, 16, 20, 16, 16];
    scene.colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
    scene.segments = [];
}

// Create graphics segments and calculate angles
function createSegments(scene) {
    const total = 100;
    let startAngle = Math.PI; // start from 180 degrees (left side)
    
    scene.percentages.forEach((percent, index) => {
        const angle = Math.PI * (percent / total);
        const midAngle = startAngle + angle / 2;
        const graphics = scene.add.graphics({ fillStyle: { color: scene.colors[index] } });
        
        scene.segments.push({
            graphics,
            startAngle,
            endAngle: startAngle + angle,
            midAngle,
            outerRadius: scene.outerRadius,
            innerRadius: scene.innerRadius,
            color: scene.colors[index],
            offset: 0
        });
        
        startAngle += angle;
    });
}

// Draw all segments initially with zero offset
function drawInitialSegments(scene) {
    scene.segments.forEach(seg => {
        drawSegmentWithOffset(seg, scene.centerX, scene.centerY, 0);
    });
}

// Setup pointermove event to handle hover interaction
function setupInteraction(scene) {
    scene.input.on('pointermove', pointer => {
        const mouseAngleRaw = Phaser.Math.Angle.Between(scene.centerX, scene.centerY, pointer.x, pointer.y);
        const mouseAngle = (mouseAngleRaw + Math.PI * 2) % (Math.PI * 2); // Normalize to 0–2π
        const dist = Phaser.Math.Distance.Between(scene.centerX, scene.centerY, pointer.x, pointer.y);
        
        let anyHovered = false;
        
        scene.segments.forEach((seg, i) => {
            const inAngle = mouseAngle >= seg.startAngle && mouseAngle < seg.endAngle;
            const inRadius = dist >= seg.innerRadius && dist <= seg.outerRadius;
            const isHovered = inAngle && inRadius;
            const offset = isHovered ? 10 : 0;
            const innerR = seg.innerRadius;
            const outerR = seg.outerRadius + (isHovered ? 10 : 0);
            
            seg.graphics.clear();
            drawSegmentWithOffset(seg, scene.centerX, scene.centerY, offset, outerR, innerR);
            
            if (isHovered) {
                scene.infoText.setText(scene.descriptions[i]);
                scene.infoText.setVisible(true);
                anyHovered = true;
            }
        });
        
        if (!anyHovered) {
            scene.infoText.setVisible(false);
        }
    });
}

// Helper to draw a segment with optional offset and radii
function drawSegmentWithOffset(seg, cx, cy, offset, outerRadius = seg.outerRadius, innerRadius = seg.innerRadius) {
    const step = (seg.endAngle - seg.startAngle) / 60;

    const offsetX = Math.cos(seg.midAngle) * offset;
    const offsetY = Math.sin(seg.midAngle) * offset;

    const graphics = seg.graphics;
    graphics.beginPath();

    // Outer arc
    for (let angle = seg.startAngle; angle <= seg.endAngle; angle += step) {
        const x = cx + offsetX + Math.cos(angle) * outerRadius;
        const y = cy + offsetY + Math.sin(angle) * outerRadius;
        if (angle === seg.startAngle) {
            graphics.moveTo(x, y);
        } else {
            graphics.lineTo(x, y);
        }
    }

    // Inner arc (reverse)
    for (let angle = seg.endAngle; angle >= seg.startAngle; angle -= step) {
        const x = cx + offsetX + Math.cos(angle) * innerRadius;
        const y = cy + offsetY + Math.sin(angle) * innerRadius;
        graphics.lineTo(x, y);
    }

    graphics.closePath();
    graphics.fillStyle(seg.color, 1);
    graphics.fillPath();
}
