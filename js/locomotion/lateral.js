// Lateral Undulation model
class LateralUndulation {
    constructor(canvasWidth, canvasHeight, numSegments, startX = 100, startY = null, initialAngle = null) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.numSegments = numSegments;
        this.segmentLength = 8;
        this.time = 0;
        
        // Starting position - use provided or default
        this.x0 = startX;
        this.y0 = startY !== null ? startY : canvasHeight / 2;
        
        // Initialize arrays
        this.r = new Array(numSegments + 1).fill().map(() => [0, 0]);
        this.r[0] = [this.x0, this.y0];
        
        this.th = new Array(numSegments).fill(0);
        this.a = 0;
        
        // Determine entry direction vector based on initial angle
        const entryDirection = initialAngle || 0;
        const dirX = Math.cos(entryDirection);
        const dirY = Math.sin(entryDirection);
        
        // Start with a straight line of segments extending behind the head
        // This creates a realistic entry effect as the snake slithers in
        for (let i = 0; i <= this.numSegments; i++) {
            // Calculate offset from head position in opposite direction of travel
            const offsetX = -i * this.segmentLength * dirX;
            const offsetY = -i * this.segmentLength * dirY;
            
            // Position segment
            this.r[i] = [this.x0 + offsetX, this.y0 + offsetY];
        }
        
        // Initialize angles with proper wave pattern
        for (let i = 0; i < this.numSegments; i++) {
            this.th[i] = this.gait(i + this.a);
        }
        
        // Set head angle
        if (initialAngle !== null) {
            this.th[0] = initialAngle;
        } else {
            this.th[0] = this.th[0] - 3 * Math.PI / 8 - Math.PI / 64;
        }
        
        this.calculatePositions();
    }
    
    gait(i) {
        const n = 40;
        i = i % (n + 1);
        const amplitude = 3.5; // Using requested amplitude
        const phase = 0;       // Using requested phase
        return amplitude * Math.PI / n * Math.sin(4 * Math.PI / (n + 1) * i) + phase;
    }
    
    width(i) {
        const n = 50;
        const a = 30 / this.segmentLength; // Increased from 16 to 20 for thicker body
        const b = 0.003;
        const t = -1 * n * 2 / 3;
        return a * Math.exp(-b * Math.pow(i + t, 2));
    }
    
    calculatePositions() {
        // Calculate all positions based on current angles
        for (let i = 1; i <= this.numSegments; i++) {
            let tempX = 0;
            let tempY = 0;
            
            for (let j = 0; j < i; j++) {
                // Calculate the cumulative angle at this joint
                let sumTheta = 0;
                for (let k = 0; k <= j; k++) {
                    sumTheta += this.th[k];
                }
                
                // Add segment contribution
                tempX += this.segmentLength * Math.cos(sumTheta);
                tempY += this.segmentLength * Math.sin(sumTheta);
            }
            
            // Set position relative to head
            this.r[i] = [this.r[0][0] + tempX, this.r[0][1] + tempY];
        }
    }

    update(deltaTime) {
        // Accumulate time
        this.time += deltaTime;
        
        // Only update snake position when enough time has passed
        if (this.time < 0.1) {
            return; // Skip this update for slower motion
        }
        
        // Reset accumulated time
        this.time = 0;
        
        // Calculate positions with current angles FIRST
        this.calculatePositions();
        
        // Move segments forward (matching MATLAB's r(:,1:n)=r(:,2:n+1))
        for (let i = 0; i < this.numSegments; i++) {
            this.r[i] = [...this.r[i+1]];
        }
        
        // Update counter for gait function (matching MATLAB)
        this.a = (this.a + 1) % 40;
        
        // Apply undulation physics first
        const prevTh0 = this.th[0];
        
        // Propagate the wave through the body
        this.th[0] = prevTh0 + this.th[1];
        
        // Shift angles
        for (let i = 1; i < this.numSegments - 1; i++) {
            this.th[i] = this.th[i + 1];
        }
        
        // New angle at tail
        this.th[this.numSegments - 1] = this.gait(this.a);
    }
    
    draw(ctx) {
        // Calculate normal vectors for each segment to create width
        const normals = [];
        for (let i = 0; i < this.numSegments; i++) {
            const dx = this.r[i+1][0] - this.r[i][0];
            const dy = this.r[i+1][1] - this.r[i][1];
            const length = Math.sqrt(dx*dx + dy*dy);
            // Normal vector (perpendicular to segment)
            normals.push([-dy/length, dx/length]);
        }
        
        // Draw snake body with shape and texture
        ctx.save();
        
        // Create gradient for snake body
        const gradient = ctx.createLinearGradient(
            this.r[0][0], this.r[0][1], 
            this.r[this.numSegments][0], this.r[this.numSegments][1]
        );
        gradient.addColorStop(0, '#304D30');    // Darker green at head
        gradient.addColorStop(0.5, '#4F6F52');  // Medium green in middle
        gradient.addColorStop(1, '#739072');    // Lighter green at tail
        
        // Draw main body shape
        ctx.beginPath();
        const leftSide = [];
        const rightSide = [];
        
        // Create body outline points
        for (let i = 0; i < this.numSegments; i++) {
            const width = this.width(i) * 2;
            
            // Left side of snake
            leftSide.push([
                this.r[i][0] + normals[i][0] * width,
                this.r[i][1] + normals[i][1] * width
            ]);
            
            // Right side of snake (in reverse order for drawing)
            rightSide.unshift([
                this.r[i][0] - normals[i][0] * width,
                this.r[i][1] - normals[i][1] * width
            ]);
        }
        
        // Connect all points to form snake body
        ctx.beginPath();
        ctx.moveTo(leftSide[0][0], leftSide[0][1]);
        
        // Draw left side
        for (let i = 1; i < leftSide.length; i++) {
            ctx.lineTo(leftSide[i][0], leftSide[i][1]);
        }
        
        // Draw right side
        for (let i = 0; i < rightSide.length; i++) {
            ctx.lineTo(rightSide[i][0], rightSide[i][1]);
        }
        
        // Close the path
        ctx.closePath();
        
        // Fill with gradient
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Add subtle border
        ctx.strokeStyle = '#1E321E';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        
        // Draw scales pattern - improved version
        for (let i = 0; i < this.numSegments; i += 2) {
            const width = this.width(i) * 0.9;
            
            // Create diamond pattern for scales
            const centerX = this.r[i][0];
            const centerY = this.r[i][1];
            
            // Lower the threshold to 1 so scales will show
            if (width > 1) {
                // Scale pattern - make more visible
                ctx.beginPath();
                ctx.moveTo(
                    centerX + normals[i][0] * width * 0.7,
                    centerY + normals[i][1] * width * 0.7
                );
                ctx.lineTo(
                    centerX - normals[i][0] * width * 0.7,
                    centerY - normals[i][1] * width * 0.7
                );
                ctx.strokeStyle = 'rgb(255, 255, 255)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
        
        // Draw snake head
        const headAngle = this.th.reduce((sum, angle) => sum + angle, 0);
        const headPos = [this.r[this.numSegments][0], this.r[this.numSegments][1], headAngle];

        // Head shape - create plectrum-like shape for the snake head
        const headScale = 3.5;
        const widthMultiplier = 1.4; // Increased for wider sides

        // Create plectrum-shaped head points
        const headX = [
            // Pointed tip at the front
            headPos[0] + 5 * headScale * Math.cos(headPos[2]),
            
            // Right side curve points (from tip to widest part)
            headPos[0] + 3 * headScale * Math.cos(headPos[2]) + 1.2 * headScale * widthMultiplier * Math.sin(headPos[2]),
            headPos[0] + 1 * headScale * Math.cos(headPos[2]) + 1.9 * headScale * widthMultiplier * Math.sin(headPos[2]),
            
            // Right back curve for rounder bottom
            headPos[0] - 1 * headScale * Math.cos(headPos[2]) + 2.0 * headScale * widthMultiplier * Math.sin(headPos[2]),
            headPos[0] - 2 * headScale * Math.cos(headPos[2]) + 1.8 * headScale * widthMultiplier * Math.sin(headPos[2]),
            headPos[0] - 3 * headScale * Math.cos(headPos[2]) + 1.4 * headScale * widthMultiplier * Math.sin(headPos[2]),
            
            // Center bottom point (rounded instead of angular)
            headPos[0] - 3.5 * headScale * Math.cos(headPos[2]),
            
            // Left back curve for rounder bottom
            headPos[0] - 3 * headScale * Math.cos(headPos[2]) - 1.4 * headScale * widthMultiplier * Math.sin(headPos[2]),
            headPos[0] - 2 * headScale * Math.cos(headPos[2]) - 1.8 * headScale * widthMultiplier * Math.sin(headPos[2]),
            headPos[0] - 1 * headScale * Math.cos(headPos[2]) - 2.0 * headScale * widthMultiplier * Math.sin(headPos[2]),
            
            // Left side curve points (from widest part to tip)
            headPos[0] + 1 * headScale * Math.cos(headPos[2]) - 1.9 * headScale * widthMultiplier * Math.sin(headPos[2]),
            headPos[0] + 3 * headScale * Math.cos(headPos[2]) - 1.2 * headScale * widthMultiplier * Math.sin(headPos[2]),
        ];

        const headY = [
            // Pointed tip at the front
            headPos[1] + 5 * headScale * Math.sin(headPos[2]),
            
            // Right side curve points (from tip to widest part)
            headPos[1] + 3 * headScale * Math.sin(headPos[2]) - 1.2 * headScale * widthMultiplier * Math.cos(headPos[2]),
            headPos[1] + 1 * headScale * Math.sin(headPos[2]) - 1.9 * headScale * widthMultiplier * Math.cos(headPos[2]),
            
            // Right back curve for rounder bottom
            headPos[1] - 1 * headScale * Math.sin(headPos[2]) - 2.0 * headScale * widthMultiplier * Math.cos(headPos[2]),
            headPos[1] - 2 * headScale * Math.sin(headPos[2]) - 1.8 * headScale * widthMultiplier * Math.cos(headPos[2]),
            headPos[1] - 3 * headScale * Math.sin(headPos[2]) - 1.4 * headScale * widthMultiplier * Math.cos(headPos[2]),
            
            // Center bottom point (rounded instead of angular)
            headPos[1] - 3.5 * headScale * Math.sin(headPos[2]),
            
            // Left back curve for rounder bottom
            headPos[1] - 3 * headScale * Math.sin(headPos[2]) + 1.4 * headScale * widthMultiplier * Math.cos(headPos[2]),
            headPos[1] - 2 * headScale * Math.sin(headPos[2]) + 1.8 * headScale * widthMultiplier * Math.cos(headPos[2]),
            headPos[1] - 1 * headScale * Math.sin(headPos[2]) + 2.0 * headScale * widthMultiplier * Math.cos(headPos[2]),
            
            // Left side curve points (from widest part to tip)
            headPos[1] + 1 * headScale * Math.sin(headPos[2]) + 1.9 * headScale * widthMultiplier * Math.cos(headPos[2]),
            headPos[1] + 3 * headScale * Math.sin(headPos[2]) + 1.2 * headScale * widthMultiplier * Math.cos(headPos[2]),
        ];
        
        // Draw head with gradient
        const headGradient = ctx.createRadialGradient(
            headPos[0], headPos[1], 0,
            headPos[0], headPos[1], 6 * headScale
        );
        headGradient.addColorStop(0, '#304D30');
        headGradient.addColorStop(1, '#1A2B1A');
        
        ctx.beginPath();
        ctx.moveTo(headX[0], headY[0]);
        for (let i = 1; i < headX.length; i++) {
            ctx.lineTo(headX[i], headY[i]);
        }
        ctx.closePath();
        ctx.fillStyle = headGradient;
        ctx.fill();
        
        ctx.restore();
    }
}