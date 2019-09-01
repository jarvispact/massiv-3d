class Quat {
    constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    getAsArray() {
        return [this.x, this.y, this.z, this.w];
    }

    getAsFloat32Array() {
        return Float32Array.from(this.getAsArray());
    }

    setFromArray(quat) {
        this.x = quat[0];
        this.y = quat[1];
        this.z = quat[2];
        this.w = quat[3];
        return this;
    }

    clone() {
        return new Quat(this.x, this.y, this.z, this.w);
    }

    setFromEuler(x = 0, y = 0, z = 0) {
        const halfToRad = 0.5 * Math.PI / 180.0;
        x *= halfToRad;
        y *= halfToRad;
        z *= halfToRad;
    
        const sx = Math.sin(x);
        const cx = Math.cos(x);
        const sy = Math.sin(y);
        const cy = Math.cos(y);
        const sz = Math.sin(z);
        const cz = Math.cos(z);
    
        this.x = sx * cy * cz - cx * sy * sz;
        this.y = cx * sy * cz + sx * cy * sz;
        this.z = cx * cy * sz - sx * sy * cz;
        this.w = cx * cy * cz + sx * sy * sz;

        return this;
    }

    multiply(quat) {
        const ax = this.x, ay = this.y, az = this.z, aw = this.w;
        const bx = quat.x, by = quat.y, bz = quat.z, bw = quat.w;
      
        this.x = ax * bw + aw * bx + ay * bz - az * by;
        this.y = ay * bw + aw * by + az * bx - ax * bz;
        this.z = az * bw + aw * bz + ax * by - ay * bx;
        this.w = aw * bw - ax * bx - ay * by - az * bz;

        return this;
    }
}

export default Quat;
