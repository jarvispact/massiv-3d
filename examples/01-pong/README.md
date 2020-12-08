# pong3D
a pong3D implementation with massiv-3d

## general info
this is the first attempt in implementing a ecs system and writing a game with it. The separation of systems and components seems not correct in terms of ecs philosphy. But the game works so far and i will leave it like this for now. Maybe i will improve this as soon as i have a deeper understanding of ecs systems.

## game info
the game has 3 entities:

1. **Ball**
2. **Player**
3. **Table**

it makes use of the following components:

- **Transform**
- **Geometry**
- **Velocity**
- **BoundingBox**
- **Color**
- **Animation**
- **Audio**

and the game logic is written with the following systems:

- **animation-system** (handles bounce-back animation of player paddle on collision between ball and player entity)
- **collision-system** (handles collision between ball, player and table)
- **input-system** (handles input)
- **level-system** (implements a timer and triggers a level-up every 5 seconds)
- **movement-system** (handles updates for transform, velocity and boundingbox components)
- **render-bounding-box-system** (used to debug boundingboxes)
- **webgl2-render-system** (render the world using a poor-mans-diffuse-shader)

## improvements for the next example

- better separation of systems
- rethink velocity component (maybe should not contain translation, scaling and rotation)
- better ecs concept for animations
- still no concept for camera and generalized render-system
- do we really need to cache the transform updates?

## possible new features

- more animations (shake animation on wall hit, ball reset animation)
- persistent high-score system