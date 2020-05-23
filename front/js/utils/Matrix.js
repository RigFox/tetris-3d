class Matrix {
    constructor(arr) {
        this.arr = arr;
    }

    mul2vec(vector) {
        let x = this.arr[0][0] * vector.x + this.arr[0][1] * vector.y + this.arr[0][2] * vector.z;
        let y = this.arr[1][0] * vector.x + this.arr[1][1] * vector.y + this.arr[1][2] * vector.z;
        let z = this.arr[2][0] * vector.x + this.arr[2][1] * vector.y + this.arr[2][2] * vector.z;

        return new Vector(x, y, z);
    }
}