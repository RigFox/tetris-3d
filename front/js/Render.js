class Render {
    constructor() {
        this.createScene();
        this.createBackground();
        this.createGrid();
        this.createLights();
        this.play();
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

        this.camera.position.set(10, 10, -3);

        this.controls.target.set(5, 5, 5);

        this.controls.update();


    }

    createGrid() {
        for (let i = 0; i < 10; i++) {
            let gridHelper = new THREE.GridHelper(10, 10);
            gridHelper.position.set(5, i, 5);
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
        let light = new THREE.PointLight(0xffffff, 1, 100);
        light.position.set(0, 10 + 1, 0);
        this.scene.add(light);
        let sideLight1 = new THREE.PointLight(0xffffff, 1, 10);
        sideLight1.position.set(Math.floor(10 / 2), Math.floor(10 / 2), -7);
        this.scene.add(sideLight1);
        let sideLight2 = new THREE.PointLight(0xffffff, 1, 10);
        sideLight2.position.set(Math.floor(10 / 2), Math.floor(10 / 2), 7);
        this.scene.add(sideLight2);
        let sideLight3 = new THREE.PointLight(0xffffff, 1, 10);
        sideLight3.position.set(7, Math.floor(10 / 2), Math.floor(10 / 2));
        this.scene.add(sideLight3);
        let sideLight4 = new THREE.PointLight(0xffffff, 1, 10);
        sideLight4.position.set(-7, Math.floor(10 / 2), Math.floor(10 / 2));
        this.scene.add(sideLight4);
    }

    play() {
        requestAnimationFrame(this.play.bind(this));

        this.renderer.render(this.scene, this.camera);
        this.controls.update();

        this.starSphere.rotation.y += 0.0001;
    }

    createTetromino(tetromino, pos) {
        const geometry = new THREE.BoxGeometry();

        for (let i = 0; i < tetromino.length; i++) {
            let tmpGeometry = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
            tmpGeometry.position.x = tetromino[i].x;
            tmpGeometry.position.y = tetromino[i].y;
            tmpGeometry.position.z = tetromino[i].z;
            tmpGeometry.updateMatrix();
            geometry.merge(tmpGeometry.geometry, tmpGeometry.matrix);
        }

        const material = new THREE.MeshPhongMaterial({color: 0x00ff00});

        this.tetromino = new THREE.Mesh(geometry, material);
        this.tetromino.position.set(pos.x, pos.y, pos.z);

        this.scene.add(this.tetromino);
    }

    setTetrominoPosition(pos) {
        this.tetromino.position.set(pos.x, pos.y, pos.z);
    }
}