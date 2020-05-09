# TODO

goal of the project:

a high performance rendering engine (webgl2 and later webgpu), ecs design to the core. flexible (only pay for what you need)
fitting the tech to the context

built in materials:
unlit-material (transparency, texture or color)
pbr-material (transparency, texture or color)

build in geometries:
triangle
quad
cube

- update active camera
- add renderablesystem

- remove unnecessary uniform update code from components
- simplify uniform handling further (events? frame lifecycle?)
- dynamic lights give warnings in console
- uniform buffers
- use active attributes to avoid unncessary buffer creation
- raw webgl example
- custom renderable renderer
- custom shader
- remove world componet cache
- rename standard-material to phong-material
- add pbr material
- refactor shader registry code (DRY)
- batch renderer interface
- collision detection
- fsm
- pong

- add support for multiple viewports
- add normal mapping
- define a clear ecs interface
- try offscreen canvas for smoother rendering
- reuse shader programs (ShaderRegistry ?)