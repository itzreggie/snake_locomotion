// Utility functions for the snake locomotion simulation

// Cross product for 3D vectors
function cross(a, b) {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ];
}

// Dot product for 2D vectors
function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1];
}

// Vector norm (length)
function norm(v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
}

// Scale a vector by a scalar
function scale(v, s) {
    return [v[0] * s, v[1] * s];
}

// Add two vectors
function add(a, b) {
    return [a[0] + b[0], a[1] + b[1]];
}

// Subtract two vectors
function subtract(a, b) {
    return [a[0] - b[0], a[1] - b[1]];
}

// Create a normalized vector
function normalize(v) {
    const length = norm(v);
    if (length === 0) return [0, 0];
    return [v[0] / length, v[1] / length];
}