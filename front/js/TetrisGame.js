class TetrisGame {

    constructor(cup_width, cup_length, cup_height, random_seed) {
        this.cup_width = cup_width;
        this.cup_length = cup_length;
        this.cup_height = cup_height;

        this.random_seed = random_seed;

        this.current_tetromino = null;

        this.lastUpdate = Date.now();
        this.tetromino_timer = 0;

        this.init_constant();
        this.prepare_cup();
    }

    setNewTetrominoHandler(handler) {
        this.newTetrominoHandler = handler;
    }

    init_constant() {
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
        let now = Date.now();
        let dt = now - this.lastUpdate;
        this.lastUpdate = now;

        this.update(dt);
    }

    update(dt) {
        this.tetromino_timer += dt;

        if (this.tetromino_timer > 1000) {
            this.tetromino_timer = 0;

            if (this.current_tetromino === null) {
                this.create_tetromino();
            }

            // logic
            let stopTetromino = false;

            this.current_tetromino.real_pos().forEach((vector) => {
                if (vector.y === 0) {
                    // Dno
                    stopTetromino = true;
                } else if (this.cup[vector.x][vector.y - 1][vector.z]) {
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
                this.current_tetromino.pos.y -= 1;
            }
        }
    }

    input(move) {
        switch (move) {
            case "left":
                this.move_tetromino(new Vector(1, 0, 0));
                break;
            case "right":
                this.move_tetromino(new Vector(-1, 0, 0));
                break
            case "up":
                this.move_tetromino(new Vector(0, 0, 1));
                break
            case "down":
                this.move_tetromino(new Vector(0, 0, -1));
                break
            case "drop":
                this.move_tetromino(new Vector(0, -1, 0));
                break;
        }
    }

    move_tetromino(move_vector) {
        if (this.current_tetromino !== null) {
            let allow_move = true;

            this.current_tetromino.move(move_vector).forEach((vector) => {
                if (vector.x >= this.cup_width || vector.x < 0) {
                    allow_move = false;
                    return;
                }

                if (vector.z >= this.cup_length || vector.z < 0) {
                    allow_move = false;
                    return;
                }

                if (vector.y < 0) {
                    allow_move = false
                    return;
                }

                if (this.cup[vector.x][vector.y][vector.z]) {
                    allow_move = false;
                }
            });

            if (allow_move) {
                this.current_tetromino.pos = this.current_tetromino.pos.add(move_vector)
            }
        }
    }

    create_tetromino() {
        let tetromino_type = this.TETROMINO_LIST[this.random()];

        this.current_tetromino = new Tetromino(
            tetromino_type,
            this.TETROMINO[tetromino_type],
            new Vector(Math.round(this.cup_width / 2), this.cup_height - 1, Math.round(this.cup_length / 2))
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

    move(move_vector) {
        return this.form.map((vector) => {
            return vector.add(this.pos.add(move_vector));
        })
    }
}