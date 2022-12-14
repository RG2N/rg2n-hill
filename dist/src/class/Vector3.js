"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    fromVector(vector) {
        this.x = vector.x;
        this.y = vector.y;
        this.z = vector.z;
        return this;
    }
    equalsVector(vector) {
        if (this.x === vector.x &&
            this.y === vector.y &&
            this.z === vector.z)
            return true;
    }
    addVector(vector) {
        this.x += vector.x;
        this.y += vector.y;
        this.z += vector.z;
        return this;
    }
    add(x, y, z) {
        this.x += x;
        this.y += y;
        this.z += z;
        return this;
    }
    subVector(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        this.z -= vector.z;
        return this;
    }
    sub(x, y, z) {
        this.x -= x;
        this.y -= y;
        this.z -= z;
        return this;
    }
    multiplyVector(vector) {
        this.x *= vector.x;
        this.y *= vector.y;
        this.z *= vector.z;
        return this;
    }
    multiply(x, y, z) {
        this.x *= x;
        this.y *= y;
        this.z *= z;
        return this;
    }
}
exports.default = Vector3;
