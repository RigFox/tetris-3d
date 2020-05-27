class TetrisGame {

    constructor(cup_width, cup_length, cup_height, random_seed) {
        this.cup_width = cup_width;
        this.cup_length = cup_length;
        this.cup_height = cup_height;

        this.random_seed = random_seed;

        this.current_tetromino = null;

        this.init_constant()
        this.prepare_cup()
    }

    setNewTetrominoHandler(handler) {
        this.newTetrominoHandler = handler;
    }

    init_constant() {
        this.TETROMINO = {
            "T": [
                new Vector(-1, 0, 0),
                new Vector(0, 0, 0),
                new Vector(1, 0, 0),
                new Vector(0, -1, 0)
            ],
            "S": [ // Also Z
                new Vector(-1, 0, 0),
                new Vector(0, 0, 0),
                new Vector(0, -1, 0),
                new Vector(1, -1, 0)
            ],
            "J": [ // Also L
                new Vector(-1, 0, 0),
                new Vector(0, 0, 0),
                new Vector(1, 0, 0),
                new Vector(-1, -1, 0)
            ],
            "O": [
                new Vector(0, 0, 0),
                new Vector(1, 0, 0),
                new Vector(0, -1, 0),
                new Vector(1, -1, 0)
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
            "x_clockwise": [
                [1, 0, 0],
                [0, 0, 1],
                [0, -1, 0]
            ],
            "x_counterclockwise": [
                [1, 0, 0],
                [0, 0, -1],
                [0, 1, 0]
            ],
            "y_clockwise": [
                [0, 0, -1],
                [0, 1, 0],
                [1, 0, 0]
            ],
            "y_counterclockwise": [
                [0, 0, 1],
                [0, 1, 0],
                [-1, 0, 0]
            ],
            "z_clockwise": [
                [0, 1, 0],
                [-1, 0, 0],
                [0, 0, 1]
            ],
            "z_counterclockwise": [
                [0, -1, 0],
                [1, 0, 0],
                [0, 0, 1]
            ]
        };
    }

    prepare_cup() {
        this.cup = new Array(this.cup_width);

        for (let i = 0; i < this.cup_width; i++) {
            this.cup[i] = new Array(this.cup_length);

            for (let j = 0; j < this.cup_length; j++) {
                this.cup[i][j] = new Array(this.cup_height).fill(false);
            }
        }
    }

    random() {
        // TODO: Rewrite bad random
        let x = Math.sin(this.random_seed++) * 10000;
        return Math.round((x - Math.floor(x)) * (this.TETROMINO_LIST.length - 1));
    }

    tick() {
        if (this.current_tetromino === null) {
            this.create_tetromino();
        }

        // logic
        let stopTetromino = false;

        this.current_tetromino.real_pos().forEach((vector) => {
            if (vector.z + 1 === this.cup_height) {
                // Dno
                stopTetromino = true;
            }

            if (this.cup[vector.x][vector.y][vector.z + 1]) {
                // Another tetromino
                stopTetromino = true;
            }
        })

        if (stopTetromino) {
            this.current_tetromino.real_pos().forEach((vector) => {
                this.cup[vector.x][vector.y][vector.z] = true;
            })

            this.current_tetromino = null;
        } else {
            this.current_tetromino.pos.z += 1;
        }
    }

    create_tetromino() {
        let tetromino_type = this.TETROMINO_LIST[this.random()];

        this.current_tetromino = new Tetromino(
            tetromino_type,
            this.TETROMINO[tetromino_type],
            new Vector(Math.round(this.cup_width / 2), Math.round(this.cup_length / 2), 0)
        )

        this.newTetrominoHandler();
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
}