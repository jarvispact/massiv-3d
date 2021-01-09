import { vec3 } from 'gl-matrix';

export const sphericalToCartesian = (out: vec3, radius: number, phi: number, theta: number) => {
    const sinPhiRadius = Math.sin(phi) * radius;
    out[0] = sinPhiRadius * Math.sin(theta);
    out[1] = Math.cos(phi) * radius;
    out[2] = sinPhiRadius * Math.cos(theta);
};