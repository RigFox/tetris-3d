class Render {
    constructor(cup_width, cup_length, cup_height) {
        this.cup_width = cup_width;
        this.cup_length = cup_length;
        this.cup_height = cup_height;

        this.initConstant();

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

    createTetromino(tetromino, pos) {
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
        this.scene.remove(this.tetromino);
        this.createTetromino(tetromino, pos);
    }
}