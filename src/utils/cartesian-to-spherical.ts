import { vec3 } from 'gl-matrix';

// out = [radius, phi, theta]
export const cartesianToSpherical = (out: vec3, x: number, y: number, z: number) => {
    out[0] = Math.sqrt(x * x + y * y + z * z);

    if (out[0] === 0) {
        out[2] = 0;
        out[1] = 0;
    } else {
        out[2] = Math.atan2(x, z);
        out[1] = Math.acos(Math.min(Math.max(y / out[0], -1), 1));
    }
};