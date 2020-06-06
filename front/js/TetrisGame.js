class TetrisGame {

    constructor(cup_width, cup_length, cup_height, random_seed) {
        this.cup_width = cup_width;
        this.cup_length = cup_length;
        this.cup_height = cup_height;

        this.random_seed = random_seed;

        this.current_tetromino = null;
        this.move_vector = null;
        this.rotate_matrix = null;

        this.lastUpdate = Date.now();
        this.tetromino_timer = 0;

        this.initConstant();
        this.prepareCup();
    }

    setNewTetrominoHandler(handler) {
        this.newTetrominoHandler = handler;
    }

    setRotateTetrominoHandler(handler) {
        this.rotateTetrominoHandler = handler;
    }

    setDestroyPlaneHandler(handler) {
        this.destroyPlaneHandler = handler;
    }

    initConstant() {
        // x, z -- width, length
        // y -- height
        this.TETROMINO = {
            "T": [
                new Vector(-1, 0, 0),
                new Vector(0, 0, 0),
                new Vector(1, 0, 0),
                new Vector(0, 0, 1)
            ],
            "S": [ // Also Z
                new Vector(-1, 0, 0),
                new Vector(0, 0, 0),
                new Vector(0, 0, 1),
                new Vector(1, 0, 1)
            ],
            "J": [ // Also L
                new Vector(-1, 0, 0),
                new Vector(0, 0, 0),
                new Vector(1, 0, 0),
                new Vector(-1, 0, 1)
            ],
            "O": [
                new Vector(0, 0, 0),
                new Vector(1, 0, 0),
                new Vector(0, 0, 1),
                new Vector(1, 0, 1)
            ],
            "I": [
                new Vector(-1, 0, 0),
                new Vector(0, 0, 0),
                new Vector(1, 0, 0),
                new Vector(2, 0, 0)
            ]
        };
        this.TETROMINO_LIST = ["T", "S", "J", "O", "I"];
        this.ROTATE = {
            "x_clockwise": new Matrix([
                [1, 0, 0],
                [0, 0, -1],
                [0, 1, 0]
            ]),
            "x_counterclockwise": new Matrix([
                [1, 0, 0],
                [0, 0, 1],
                [0, -1, 0]
            ]),
            "y_clockwise": new Matrix([
                [0, 0, -1],
                [0, 1, 0],
                [1, 0, 0]
            ]),
            "y_counterclockwise": new Matrix([
                [0, 0, 1],
                [0, 1, 0],
                [-1, 0, 0]
            ]),
            "z_clockwise": new Matrix([
                [0, 1, 0],
                [-1, 0, 0],
                [0, 0, 1]
            ]),
            "z_counterclockwise": new Matrix([
                [0, -1, 0],
                [1, 0, 0],
                [0, 0, 1]
            ])
        };
    }

    prepareCup() {
        this.cup = Helper.create3DMatrix(this.cup_width, this.cup_height, this.cup_length, false);
    }

    random() {
        // TODO: Rewrite bad random
        let x = Math.sin(this.random_seed++) * 10000;
        return Math.round((x - Math.floor(x)) * (this.TETROMINO_LIST.length - 1));
    }

    tick() {
        let now = Date.now();
        let dt = now - this.lastUpdate;
        this.lastUpdate = now;

        this.update(dt);
    }

    update(dt) {
        this.tetromino_timer += dt;

        if (this.move_vector !== null) {
            this.moveTetromino(this.move_vector);

            // TODO: Сбрасывать drop таймер, если был ручной drop
            this.move_vector = null;
        }

        if (this.rotate_matrix !== null) {
            this.rotateTetromino();
            this.rotate_matrix = null;
        }

        if (this.tetromino_timer > 1000) {
            this.tetromino_timer = 0;

            if (this.current_tetromino === null) {
                this.createTetromino();
            }

            let allowMove = this.moveTetromino(new Vector(0, -1, 0));

            if (!allowMove) {
                this.current_tetromino.real_pos().forEach((vector) => {
                    this.cup[vector.x][vector.y][vector.z] = this.current_tetromino.type;
                })

                this.createTetromino();
            }
        }

        this.checkPlanes();
    }

    input(move) {
        switch (move) {
            // TODO: Завести enum движений
            case "left":
                this.move_vector = new Vector(1, 0, 0)
                break;
            case "right":
                this.move_vector = new Vector(-1, 0, 0)
                break
            case "up":
                this.move_vector = new Vector(0, 0, 1)
                break
            case "down":
                this.move_vector = new Vector(0, 0, -1)
                break
            case "drop":
                this.move_vector = new Vector(0, -1, 0)
                break;
            case "x_clockwise":
                this.rotate_matrix = this.ROTATE["x_clockwise"];
                break;
            case "x_counterclockwise":
                this.rotate_matrix = this.ROTATE["x_counterclockwise"];
                break;
            case "y_clockwise":
                this.rotate_matrix = this.ROTATE["y_clockwise"];
                break;
            case "y_counterclockwise":
                this.rotate_matrix = this.ROTATE["y_counterclockwise"];
                break;
            case "z_clockwise":
                this.rotate_matrix = this.ROTATE["z_clockwise"];
                break;
            case "z_counterclockwise":
                this.rotate_matrix = this.ROTATE["z_counterclockwise"];
                break;
        }
    }

    moveTetromino(move_vector) {
        if (this.current_tetromino !== null) {
            let allow_move = this.checkPosition(this.current_tetromino.move(move_vector));

            if (allow_move) {
                this.current_tetromino.pos = this.current_tetromino.pos.add(move_vector);
            }

            return allow_move;
        }

        return false;
    }

    rotateTetromino() {
        if (this.current_tetromino !== null) {
            let allow_move = this.checkPosition(this.current_tetromino.rotate(this.rotate_matrix));

            if (allow_move) {
                this.current_tetromino.form = this.current_tetromino.rotate(this.rotate_matrix);
                this.rotateTetrominoHandler();
            }

            return allow_move;
        }

        return false;
    }

    checkPosition(vectors) {
        let allowMove = true;

        vectors.forEach((vector) => {
            vector = vector.add(this.current_tetromino.pos);

            if (vector.x >= this.cup_width || vector.x < 0) {
                allowMove = false;
                return;
            }

            if (vector.z >= this.cup_length || vector.z < 0) {
                allowMove = false;
                return;
            }

            if (vector.y < 0) {
                allowMove = false;
                return;
            }

            if (this.cup[vector.x][vector.y][vector.z] !== false) {
                allowMove = false;
            }
        })

        return allowMove;
    }

    createTetromino() {
        let tetromino_type = this.TETROMINO_LIST[this.random()];

        this.current_tetromino = new Tetromino(
            tetromino_type,
            this.TETROMINO[tetromino_type],
            new Vector(Math.round(this.cup_width / 2), this.cup_height - 1, Math.round(this.cup_length / 2))
        )

        this.newTetrominoHandler();
    }

    checkPlanes() {
        for (let y = this.cup_height - 1; y >= 0; y--) {
            if (this.isFullPlane(y)) {
                this.movePlaneDown(y);
                this.destroyPlaneHandler();
            }
        }
    }

    isFullPlane(y) {
        for (let x = 0; x < this.cup_width; x++) {
            for (let z = 0; z < this.cup_length; z++) {
                if (this.cup[x][y][z] === false) {
                    return false;
                }
            }
        }

        return true;
    }

    movePlaneDown(start_y) {
        for (let y = start_y; y < this.cup_height - 1; y++) {
            for (let x = 0; x < this.cup_width; x++) {
                for (let z = 0; z < this.cup_length; z++) {
                    this.cup[x][y][z] = this.cup[x][y + 1][z]
                }
            }
        }
    }
}

class Tetromino {
    constructor(type, form, pos) {
        this.form = [];
        this.type = type;
        this.pos = pos;

        form.forEach((vector) => {
            this.form.push(Vector.copy(vector));
        })
    }

    real_pos() {
        return this.form.map((vector) => {
            return vector.add(this.pos);
        })
    }

    move(move_vector) {
        return this.form.map((vector) => {
            return vector.add(move_vector);
        })
    }

    rotate(rotate_matrix) {
        return this.form.map((vector) => {
            return rotate_matrix.mul2vec(vector);
        });
    }
}