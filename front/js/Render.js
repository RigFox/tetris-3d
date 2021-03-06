class Render {
    constructor(cup_width, cup_length, cup_height) {
        this.cup_width = cup_width;
        this.cup_length = cup_length;
        this.cup_height = cup_height;

        this.tetromino = null;

        this.initConstant();
        this.prepareCup();

        this.createScene();
        this.createBackground();
        this.createGrid();
        this.createLights();
        this.play();
    }

    initConstant() {
        this.TETROMINO_COLORS = {
            "T": 0xd31e1e,
            "S": 0x57b21d,
            "J": 0xe35d27,
            "O": 0xd38a1e,
            "I": 0x1a9ad4
        }
    }

    prepareCup() {
        this.cup = Helper.create3DMatrix(this.cup_width, this.cup_height, this.cup_length, false);
    }

    createScene() {
        let fieldOfView = 75;
        let aspectRatio = window.innerWidth / window.innerHeight
        let nearPlane = 0.1
        let farPlane = 1000;

        this.scene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer({antialias: true, autoSize: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.4;
        this.controls.maxDistance = 20;
        this.controls.minDistance = 5;
        this.controls.enablePan = false;

        this.camera.position.set(this.cup_width, this.cup_height, -3);

        this.controls.target.set(
            Math.round(this.cup_width / 2),
            Math.round(this.cup_height / 2),
            Math.round(this.cup_length / 2),
        );

        this.controls.update();
    }

    createGrid() {
        for (let i = 0; i < 1; i++) {
            let gridHelper = new THREE.GridHelper(this.cup_width, this.cup_length);
            gridHelper.position.set(
                (this.cup_width / 2) - 0.5,
                i,
                (this.cup_length / 2) - 0.5
            );
            this.scene.add(gridHelper);
        }
    }

    createBackground() {
        const geometry = new THREE.SphereGeometry(90, 32, 32);
        const material = new THREE.MeshBasicMaterial();
        const loader = new THREE.TextureLoader();
        material.map = loader.load('images/galaxy.jpg');
        material.side = THREE.BackSide;

        this.starSphere = new THREE.Mesh(geometry, material);
        this.scene.add(this.starSphere);
    }

    createLights() {
        this.scene.add(new THREE.AmbientLight(0xffffff));

        const light1 = new THREE.PointLight(0xffffff, 1, 100);
        light1.position.set(this.cup_width, this.cup_height, -5);
        this.scene.add(light1);

        const light2 = new THREE.PointLight(0xff0000, 1, 100);
        light2.position.set(0, 0, -5);
        this.scene.add(light2);
    }

    play() {
        requestAnimationFrame(this.play.bind(this));

        this.renderer.render(this.scene, this.camera);
        this.controls.update();

        this.starSphere.rotation.y += 0.0001;
    }

    createBlock(type, x, y, z) {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({
            color: this.TETROMINO_COLORS[type]
        });

        const block = new THREE.Mesh(geometry, material);
        block.position.set(x, y, z);

        return block;
    }

    createTetromino(tetromino, pos) {
        if (this.tetromino !== null) {
            this.tetromino.geometry.dispose();
            this.tetromino.material.dispose();
            this.scene.remove(this.tetromino);
        }

        const geometry = new THREE.BoxGeometry();

        tetromino.form.forEach(vector => {
            let tmpGeometry = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
            tmpGeometry.position.x = vector.x;
            tmpGeometry.position.y = vector.y;
            tmpGeometry.position.z = vector.z;
            tmpGeometry.updateMatrix();
            geometry.merge(tmpGeometry.geometry, tmpGeometry.matrix);
        })

        const material = new THREE.MeshPhongMaterial({
            color: this.TETROMINO_COLORS[tetromino.type]
        });

        this.tetromino = new THREE.Mesh(geometry, material);
        this.tetromino.position.set(pos.x, pos.y, pos.z);

        this.scene.add(this.tetromino);
    }

    setTetrominoPosition(pos) {
        this.tetromino.position.set(pos.x, pos.y, pos.z);
    }

    rotateTetromino(tetromino, pos) {
        this.tetromino.geometry.dispose();
        this.tetromino.material.dispose();
        this.scene.remove(this.tetromino);
        this.createTetromino(tetromino, pos);
    }

    updateCup(game_cup) {
        Helper.forEachMatrix(game_cup, (value, x, y, z) => {
            let cup_value = this.cup[x][y][z];

            if (value === false && cup_value !== false) {
                this.cup[x][y][z] = false;

                cup_value.geometry.dispose();
                cup_value.material.dispose();
                this.scene.remove(cup_value);
            }

            if (value !== false && cup_value === false) {
                this.cup[x][y][z] = this.createBlock(value, x, y, z);
                this.scene.add(this.cup[x][y][z]);
            }

            if (value !== false && cup_value !== false) {
                cup_value.material.color.setHex(this.TETROMINO_COLORS[value]);
            }
        });

        this.renderer.renderLists.dispose();
    }

    getMove(move) {
        let cameraAngle = 0
        const azimuthalAngle = this.controls.getAzimuthalAngle();

        const PI4 = Math.PI / 4;
        const PI = Math.PI;

        if (azimuthalAngle >= PI - PI4 && azimuthalAngle <= -PI + PI4) {
            cameraAngle = 0;
        } else if (azimuthalAngle >= PI - 3 * PI4 && azimuthalAngle <= PI - PI4) {
            cameraAngle = 90;
        } else if (azimuthalAngle >= -PI4 && azimuthalAngle <= PI4) {
            cameraAngle = 180;
        } else if (azimuthalAngle >= -PI + PI4 && azimuthalAngle <= -PI + 3 * PI4) {
            cameraAngle = 270;
        }

        switch (move) {
            case "left":
                if (cameraAngle === 90) return "up";
                if (cameraAngle === 180) return "right";
                if (cameraAngle === 270) return "down";
                return "left";
            case "right":
                if (cameraAngle === 90) return "down";
                if (cameraAngle === 180) return "left";
                if (cameraAngle === 270) return "up";
                return "right";
            case "up":
                if (cameraAngle === 90) return "right";
                if (cameraAngle === 180) return "down";
                if (cameraAngle === 270) return "left";
                return "up";
            case "down":
                if (cameraAngle === 90) return "left";
                if (cameraAngle === 180) return "up";
                if (cameraAngle === 270) return "right";
                return "down";
            case "z_clockwise":
                if (cameraAngle === 90) return "x_counterclockwise";
                if (cameraAngle === 180) return "z_counterclockwise";
                if (cameraAngle === 270) return "x_clockwise";
                return "z_clockwise";
            case "z_counterclockwise":
                if (cameraAngle === 90) return "x_clockwise";
                if (cameraAngle === 180) return "z_clockwise";
                if (cameraAngle === 270) return "x_counterclockwise";
                return "z_counterclockwise";
            case "x_clockwise":
                if (cameraAngle === 90) return "z_clockwise";
                if (cameraAngle === 180) return "x_counterclockwise";
                if (cameraAngle === 270) return "z_counterclockwise";
                return "x_clockwise";
            case "x_counterclockwise":
                if (cameraAngle === 90) return "z_counterclockwise";
                if (cameraAngle === 180) return "x_clockwise";
                if (cameraAngle === 270) return "z_clockwise";
                return "x_counterclockwise";
            case "y_clockwise":
                return "y_clockwise";
            case "y_counterclockwise":
                return "y_counterclockwise";
        }
    }
}