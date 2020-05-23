class Vector {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(other) {
        return new Vector(this.x + other.x, this.y + other.y, this.z + other.z);
    }

    negative() {
        return new Vector(-this.x, -this.y, -this.z)
    }

    static copy(other) {
        return new Vector(other.x, other.y, other.z);
    }
}