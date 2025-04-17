// Main application code
let animationId = null;
let snake = null;
let snakeCount = 0;
let canvas = document.getElementById('snake-canvas');
let ctx = canvas.getContext('2d');
let lastMovementType = -1; // -1 is initial state, 0 = top

// Entry points rotation (used to determine where next snake comes from)
const entryPoints = [
    { side: 'left', angle: 0 },
    { side: 'right', angle: Math.PI },
    { side: 'top', angle: Math.PI / 2 },
    { side: 'bottom', angle: -Math.PI / 2 }
];
let currentEntryPoint = 0;

// Configuration
const config = {
    speed: 0.5,
    segments: 45,
    running: false
};

// Define movement patterns
const movementPatterns = [
    {
        name: 'left-top',
        active: true,
        getStartY: (canvas) => {
            const verticalVariation = Math.random() * 120 - 80;
            return canvas.height / 1 + verticalVariation;
        },
        getAngle: () => {
            const angleDenominator = 1.7 + Math.random() * 0.2;
            return -Math.PI / angleDenominator;
        }
    },
    {
        name: 'left-center',
        active: true,
        getStartY: (canvas) => {
            const verticalVariation = Math.random() * 120 - 80;
            return canvas.height / 1 + verticalVariation;
        },
        getAngle: () => {
            const angleDenominator = 1.9 + Math.random() * 0.2;
            return -Math.PI / angleDenominator;
        }
    },
    {
        name: 'left-bottom',
        active: true,
        getStartY: (canvas) => {
            const verticalVariation = Math.random() * 120 - 80;
            return canvas.height / 2.2 + verticalVariation;
        },
        getAngle: () => {
            const angleDenominator = 2.7 + Math.random() * 0.2;
            return -Math.PI / angleDenominator;
        }
    },
    {
        name: 'right-top',
        active: true, 
        getStartY: (canvas) => {
            const verticalVariation = -Math.random() * 120 - 10;
            return canvas.height / 2 + verticalVariation;
        },
        getAngle: () => {
            const angleDenominator = 1.7 + -Math.random() * 0.2;
            return Math.PI / angleDenominator;
        }
    },
    {
        name: 'right-center',
        active: true, 
        getStartY: (canvas) => {
            const verticalVariation = -Math.random() * 120 + 10;
            return canvas.height / 2 + verticalVariation;
        },
        getAngle: () => {
            const angleDenominator = 1.8 + -Math.random() * 0.2;
            return Math.PI / angleDenominator;
        }
    },
    {
        name: 'right-bottom',
        active: true, 
        getStartY: (canvas) => {
            const verticalVariation = -Math.random() * 120 + 30;
            return canvas.height / -2.5 + verticalVariation;
        },
        getAngle: () => {
            const angleDenominator = 2.9 + -Math.random() * 0.2;
            return Math.PI / angleDenominator;
        }
    },
    {
        name: 'top-to-bottom-left',
        active: true,
        getStartY: (canvas) => {
            return -300;
        },
        getStartX: (canvas) => {
            const horizontalVariation = Math.random() * (canvas.width * 0.1) + (canvas.width * 0.5);
            return horizontalVariation;
        },
        getAngle: () => {
            const baseAngle = Math.PI / 10;
            const leftwardTilt = Math.PI / 11 + Math.random() * 0.1;
            return baseAngle + leftwardTilt;
        }
    },
    {
        name: 'top-to-bottom-center',
        active: true,
        getStartY: (canvas) => {
            return -300;
        },
        getStartX: (canvas) => {
            const horizontalVariation = Math.random() * (canvas.width * 0.1) - (canvas.width * 0.3);
            return canvas.width / 2 + horizontalVariation;
        },
        getAngle: () => {
            const baseAngle = Math.PI / 10;
            const horizontalTilt = (-Math.random() * 0.1) - 0.05;
            return baseAngle + horizontalTilt;
        }
    },
    {
        name: 'top-to-bottom-right',
        active: true,
        getStartY: (canvas) => {
            return -300;
        },
        getStartX: (canvas) => {
            const horizontalVariation = Math.random() * (canvas.width * -0.2) + (canvas.width * 0.1);
            return horizontalVariation;
        },
        getAngle: () => {
            const baseAngle = Math.PI / 10;
            const rightwardTilt = -Math.PI / 4 + Math.random() * 0.1;
            return baseAngle + rightwardTilt;
        }
    },
    {
        name: 'bottom-to-top-left',
        active: true,
        getStartY: (canvas) => {
            return canvas.height + 300;
        },
        getStartX: (canvas) => {
            const horizontalVariation = Math.random() * (canvas.width * 0.2) + (canvas.width * 0.6);
            return horizontalVariation; 
        },
        getAngle: () => {
            const baseAngle = Math.PI * 1; 
            const leftwardTilt = Math.PI / 20 + Math.random() * 0.1;
            return baseAngle - leftwardTilt;
        }
    },
    {
        name: 'bottom-to-top-right',
        active: true,
        getStartY: (canvas) => {
            return canvas.height + 300;
        },
        getStartX: (canvas) => {
            const horizontalVariation = Math.random() * (canvas.width * -0.3) + (canvas.width * 0.5);
            return horizontalVariation;
        },
        getAngle: () => {
            const baseAngle = -Math.PI / 2;
            const leftwardTilt = Math.PI / 4 + Math.random() * 0.1;
            return baseAngle - leftwardTilt;
        }
    },
];

// Initialize
function init() {
    // Set up event listeners
    document.getElementById('start-btn').addEventListener('click', startSimulation);
    document.getElementById('stop-btn').addEventListener('click', stopSimulation);
    document.getElementById('reset-btn').addEventListener('click', resetSimulation);
    document.getElementById('speed').addEventListener('input', updateSpeed);
    document.getElementById('segments').addEventListener('input', updateSegments);
    
    // Initial setup
    resetSimulation();
}

function startSimulation() {
    if (!config.running) {
        config.running = true;
        animate();
    }
}

function stopSimulation() {
    config.running = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

function createSnake(entryPointIndex) {
    snakeCount++;
    const entry = entryPoints[entryPointIndex];
    let startX, startY, initialAngle;
    const offCanvasDistance = 300;

    switch(entry.side) {
        case 'left':
            startX = -offCanvasDistance;
            
            // Filter for active left-side patterns
            let availablePatterns = [];
            for (let i = 0; i < 3; i++) {
                if (movementPatterns[i].active && i !== lastMovementType) {
                    availablePatterns.push(i);
                }
            }
            
            // If no active patterns, skip to right side
            if (availablePatterns.length === 0) {
                console.log("No active left-side patterns. Switching to right side.");
                currentEntryPoint = 1; // Force right side
                return createSnake(currentEntryPoint);
            }
            
            // Randomly select from available patterns
            const randomIndex = Math.floor(Math.random() * availablePatterns.length);
            lastMovementType = availablePatterns[randomIndex];
            
            const pattern = movementPatterns[lastMovementType];
            
            // Log the selected pattern for debugging
            console.log(`Snake #${snakeCount}: Using ${pattern.name} pattern (left-to-right)`);
            console.log(`  - Start Y: ${pattern.getStartY(canvas).toFixed(2)}`);
            console.log(`  - Angle: ${pattern.getAngle().toFixed(4)} radians (${(pattern.getAngle() * 180 / Math.PI).toFixed(2)}°)`);
            
            // Apply the pattern's configuration
            startY = pattern.getStartY(canvas);
            initialAngle = pattern.getAngle();
            
            break;
            
        case 'right':
            startX = canvas.width + offCanvasDistance;
            
            // Find active right-side patterns
            let activeRightPatterns = [];
            for (let i = 3; i < movementPatterns.length; i++) {
                if (movementPatterns[i].active) {
                    activeRightPatterns.push(i);
                }
            }
            
            // If no active right patterns, this is a safety check
            if (activeRightPatterns.length === 0) {
                console.log("No active right-side patterns found. Using default.");
                activeRightPatterns = [3]; // Use right-top as fallback
            }
            
            // Randomly select from available right patterns
            const rightRandomIndex = Math.floor(Math.random() * activeRightPatterns.length);
            const rightPatternIndex = activeRightPatterns[rightRandomIndex];
            const rightPattern = movementPatterns[rightPatternIndex];
            
            // Log the selected pattern for debugging
            console.log(`Snake #${snakeCount}: Using ${rightPattern.name} pattern (right-to-left)`);
            console.log(`  - Start Y: ${rightPattern.getStartY(canvas).toFixed(2)}`);
            console.log(`  - Angle: ${rightPattern.getAngle().toFixed(4)} radians (${(rightPattern.getAngle() * 180 / Math.PI).toFixed(2)}°)`);
            
            // Apply the pattern's configuration
            startY = rightPattern.getStartY(canvas);
            initialAngle = rightPattern.getAngle();
            
            break;
            
        case 'top':
            // Randomly choose between available top patterns
            const topPatterns = [];
            for (let i = 6; i < movementPatterns.length; i++) {
                if (movementPatterns[i].active) {
                    topPatterns.push(i);
                }
            }
            
            const topRandomIndex = Math.floor(Math.random() * topPatterns.length);
            const topPatternIndex = topPatterns[topRandomIndex];
            const topPattern = movementPatterns[topPatternIndex];
            
            // Calculate start position
            startY = topPattern.getStartY(canvas);
            startX = topPattern.getStartX(canvas);
            initialAngle = topPattern.getAngle();
            
            // Log the selected pattern for debugging
            console.log(`Snake #${snakeCount}: Using ${topPattern.name} pattern`);
            console.log(`  - Start X: ${startX.toFixed(2)}`);
            console.log(`  - Start Y: ${startY.toFixed(2)}`);
            console.log(`  - Angle: ${initialAngle.toFixed(4)} radians (${(initialAngle * 180 / Math.PI).toFixed(2)}°)`);
            
            break;
            
        case 'bottom':
            // Find all active bottom patterns (indices 9-10)
            const bottomPatterns = [];
            for (let i = 9; i <= 10; i++) {
                if (movementPatterns[i].active) {
                    bottomPatterns.push(i);
                }
            }
            
            // If no active bottom patterns, use bottom-to-top-left as fallback
            if (bottomPatterns.length === 0) {
                console.log("No active bottom-to-top patterns found. Using default.");
                bottomPatterns.push(9); // Use bottom-to-top-left as fallback
            }
            
            // Randomly select from available bottom patterns
            const bottomRandomIndex = Math.floor(Math.random() * bottomPatterns.length);
            const bottomPatternIndex = bottomPatterns[bottomRandomIndex];
            const bottomPattern = movementPatterns[bottomPatternIndex];
            
            // Calculate start position
            startY = bottomPattern.getStartY(canvas);
            startX = bottomPattern.getStartX(canvas);
            initialAngle = bottomPattern.getAngle();
            
            // Log the selected pattern in the right format
            console.log(`Snake #${snakeCount}: Using ${bottomPattern.name} pattern (right-to-left)`);
            console.log(`  - Start Y: ${startY.toFixed(2)}`);
            console.log(`  - Angle: ${initialAngle.toFixed(4)} radians (${(initialAngle * 180 / Math.PI).toFixed(2)}°)`);
            
            break;
    }

    // Create the snake
    let newSnake = null;
    if (entry.side === 'top') {
        // For top entry, we need custom X position
        newSnake = new LateralUndulation(canvas.width, canvas.height, config.segments, startX, startY, initialAngle);
    } else {
        // For left/right entry, use the original code with default X positioning
        newSnake = new LateralUndulation(canvas.width, canvas.height, config.segments, startX, startY, initialAngle);
    }
    
    return newSnake;
}

function resetSimulation() {
    stopSimulation();
    
    // Randomly choose between entry points
    currentEntryPoint = Math.floor(Math.random() * entryPoints.length);
    
    // Create a snake at the randomly selected entry point
    snake = createSnake(currentEntryPoint);
    
    // Draw initial frame
    clearCanvas();
    snake.draw(ctx);
    
    // Update info text
    updateInfoText("Lateral Undulation: The most common snake movement pattern where the body forms a series of S-shaped curves.");
}

function updateSpeed(e) {
    config.speed = parseFloat(e.target.value);
}

function updateSegments(e) {
    config.segments = parseInt(e.target.value);
    resetSimulation();
}

function updateInfoText(text) {
    document.getElementById('simulation-info').textContent = text;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 0.5;
    
    for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function isSnakeOffCanvas() {
    const padding = 100; // Padding around canvas
    
    // Get the movement direction of the snake
    let movingLeft = false, movingRight = false, movingUp = false, movingDown = false;
    
    // Determine direction by comparing positions of head and tail
    const head = snake.r[snake.numSegments];
    const tail = snake.r[0];
    
    if (head[0] > tail[0]) movingRight = true;
    else if (head[0] < tail[0]) movingLeft = true;
    
    if (head[1] > tail[1]) movingDown = true;
    else if (head[1] < tail[1]) movingUp = true;
    
    // For snakes moving right, check if all segments are past right edge
    if (movingRight && tail[0] > canvas.width + padding) return true;
    
    // For snakes moving left, check if all segments are past left edge
    if (movingLeft && tail[0] < -padding) return true;
    
    // For snakes moving down, check if all segments are past bottom edge
    if (movingDown && tail[1] > canvas.height + padding) return true;
    
    // For snakes moving up, check if all segments are past top edge
    if (movingUp && tail[1] < -padding) return true;
    
    return false;
}

function animate() {
    if (!config.running) return;

    clearCanvas();

    // Update snake with appropriate speed
    const speedFactor = 1 / (config.speed + 0.1);
    snake.update(0.1 / speedFactor);

    // Draw the snake
    snake.draw(ctx);

    // Check if snake has left the canvas
    if (isSnakeOffCanvas()) {
        // Randomly choose between entry points
        currentEntryPoint = Math.floor(Math.random() * entryPoints.length);
        
        // Create a snake at the randomly selected entry point
        snake = createSnake(currentEntryPoint);
    }

    animationId = requestAnimationFrame(animate);
}

// Start when the page is loaded
window.addEventListener('load', init);