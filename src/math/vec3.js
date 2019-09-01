class Vec3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    getAsArray() {
        return [this.x, this.y, this.z];
    }

    getAsFloat32Array() {
        return Float32Array.from(this.getAsArray());
    }

    setFromArray(vec3) {
        this.x = vec3[0];
        this.y = vec3[1];
        this.z = vec3[2];
        return this;
    }

    clone() {
        return new Vec3(this.x, this.y, this.z);
    }

    add(x, y, z) {
        this.x += x;
        this.y += y;
        this.z += z;
        return this;
    }
}

export default Vec3;
