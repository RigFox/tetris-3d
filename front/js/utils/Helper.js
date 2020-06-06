class Helper {
    static create3DMatrix(width, height, length, fillValue) {
        let matrix = new Array(width);

        for (let i = 0; i < width; i++) {
            matrix[i] = new Array(height);

            for (let j = 0; j < height; j++) {
                matrix[i][j] = new Array(length).fill(fillValue);
            }
        }

        return matrix;
    }

    static forEachMatrix(matrix, func) {
        for (let x = 0; x < matrix.length; x++) {
            for (let y = 0; y < matrix[x].length; y++) {
                for (let z = 0; z < matrix[x][y].length; z++) {
                    func(matrix[x][y][z], x, y, z);
                }
            }
        }
    }
}