class Render {
    constructor() {
        this.createScene();
        this.createBackground();
        this.play();
    }

    createScene() {
        let fieldOfView = 75;
        let aspectRatio = window.innerWidth / window.innerHeight
        let nearPlane = 0.1
        let farPlane = 1000;

        this.scene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.4;
        this.controls.maxDistance = 20;
        this.controls.minDistance = 5;

        this.controls.maxPolarAngle = Math.PI / 4;
        this.controls.minPolarAngle = - Math.PI / 2;

        this.camera.position.set(10, 10, -3);

        this.controls.target.set(5, 5, 5);

        this.controls.update();
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

        const material = new THREE.MeshBasicMaterial({color: 0x00ff00});

        this.tetromino = new THREE.Mesh(geometry, material);
        this.tetromino.position.set(pos.x, pos.y, pos.z);

        this.scene.add(this.tetromino);
    }

    setTetrominoPosition(pos) {
        this.tetromino.position.set(pos.x, pos.y, pos.z);
    }
}