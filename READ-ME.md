# Snake Locomotion Simulation

A web-based simulation of snake movement using lateral undulation mechanics.

## Introduction

This project simulates the lateral undulation movement pattern of snakes using JavaScript. Lateral undulation is the most common form of snake locomotion, where the body forms a series of S-shaped curves that propagate from head to tail, allowing the snake to push against surface irregularities for forward motion.

## Features

- Realistic lateral undulation physics model
- Adjustable snake speed and segment count
- Dynamic entry points from different sides of the screen
- Fluid animation with gradient coloring and scale patterns
- Grid background to visualize movement patterns

## Implementation Details

The simulation uses:
- Canvas API for rendering
- Mathematical modeling of sine wave patterns for snake movement
- Physics-based segment tracking for realistic body curvature
- Dynamic head and body rendering with teardrop-shaped head design

## How to Use

1. Open the `index.html` file in a web browser
2. Use the control panel to:
   - Start/stop the simulation
   - Reset to generate a new snake
   - Adjust speed with the slider
   - Change the number of body segments

## Controls

- **Start**: Begin the simulation
- **Stop**: Pause the simulation
- **Reset**: Generate a new snake with a random entry point
- **Speed Slider**: Control how fast the snake moves
- **Segments Slider**: Adjust the number of body segments (affects length and appearance)

## Acknowledgments

This project is based on the work by [Yogesh Phalak](https://github.com/YogeshPhalak/Simulation-of-the-Snake-locomotion-mechanisms), which originally provided multiple snake locomotion patterns. This implementation focuses specifically on the lateral undulation movement pattern and writing it all in Javascript.

The mathematical model is based on research in biomechanics of snake movement, with careful attention to the wave propagation and segment coordination that characterizes real snake motion.

## License

This project is available under the MIT License.

