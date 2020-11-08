import { vec3 } from 'gl-matrix';

const velocityArraySize = 3;
const velocitySize = velocityArraySize * Float32Array.BYTES_PER_ELEMENT;
const velocityOffset = 0;

export const velocityBufferLayout = {
    velocity: { offset: velocityOffset, size: velocitySize },
};

export type VelocityBufferLayout = typeof velocityBufferLayout;

export const velocityFromBuffer = (buffer: SharedArrayBuffer) => ({
    type: 'Velocity' as const,
    buffer,
    data: {
        velocity: new Float32Array(buffer, velocityBufferLayout.velocity.offset, velocityArraySize),
    },
});

export type Velocity = ReturnType<typeof velocityFromBuffer>;

export const createVelocity = (x = 0, y = 0, z = 0): Velocity => {
    const data = new SharedArrayBuffer(velocitySize);
    const t = velocityFromBuffer(data);
    vec3.set(t.data.velocity, x, y, z);
    return t;
};
