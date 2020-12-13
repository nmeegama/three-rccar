let scene, camera, renderer, raycaster;

const container = $('#car');
const logos = [
    'fox-light-colors.png',
    'rc_logo.png',
    'Motul_logo.png'
];
const car = {
    model: "3d-assets/Apr_29_2020_CarA01.obj",
    material: '3d-assets/Apr_29_2020_CarA01.mtl',
    object: null,
    color: new THREE.Color('rgb(36, 141, 252)'),
    decals: [],
    highlighter: {
        intersect: null,
        mesh: null,
        prevHex: null,
        status: false
    }
};

const currentMesh = {
    id: '',
    object: null
};

const currentDecal = {
    src: '',
    status: false
};

function createCamera() {
    // Set the camera
    const camera = new THREE.PerspectiveCamera(70, container.width() / container.height(), 0.1, 500);
    camera.position.x = 0;
    camera.position.y = 10;
    camera.position.z = 15;
    return camera;
};

function createScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfafafa);
    return scene;
};

function initLighting() {
    const ambientLight = new THREE.AmbientLight(0x443333);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffddcc, 1);
    directionalLight1.position.set(1, 0.75, 0.5);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xccccff, 1);
    directionalLight2.position.set(-1, 0.75, -0.5);
    scene.add(directionalLight2);

    const pointLight = new THREE.PointLight(0xffaa00, 2);
    pointLight.position.set(2000, 1200, 10000);
    scene.add(pointLight);
};

function createRenderer() {
    const renderer = new THREE.WebGLRenderer();
    //renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(container.width(), container.height());
    container.append($(renderer.domElement));
    return renderer;
};

function setupCameraControls() {
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    // controls.addEventListener('change', render);
    return controls;
};

function render() {
    renderer.render(scene, camera);
};

function animate() {
    requestAnimationFrame(animate);
    render();
};

function loadObject() {
    const mtlLoader = new THREE.MTLLoader();
    const loader = new THREE.OBJLoader();
    mtlLoader.load(car.material, (materialCreator) => {

        materialCreator.preload();
        materials = { ...materialCreator.materials };
        // loader.setMaterials(materialCreator);

        loader.load(car.model, (obj) => {
            car.object = obj;
            addEventListeners();

        }, undefined, (error) => {
            console.log(error);
        });
    });
};

function loadImages() {
    const folder = "img/logo-images/";
    const dafault_img = "default/ico_noimage.png";
    $('.controls-logo-gallery .row').append('<div class="col-md-3 logo-item default"> <img  src="' + folder + dafault_img + '"></div>');
    for (const i in logos) {
        $('.controls-logo-gallery .row').append('<div class="col-md-3 logo-item"> <img  src="' + folder + logos[i] + '"></div>');
    }
}

function loadMaterialEls() {
    /* const folder = "Files/pics/";
    const dafault_img = "default/ico_noimage.png";
    $('.controls-material-gallery .row').append('<div class="col-md-2 material-item default"> <img  src="logo-images/' + dafault_img + '"></div>');
    for (const i in materialThumbNails) {
        $('.controls-material-gallery .row').append('<div class="col-md-2 material-item"> <img  src="' + folder + materialThumbNails[i] + '.png"></div>');
    } */

    const folder = "3d-assets/pics/";
    for (const i in materialThumbNails) {
        const li = '<li class="list-group-item material-item d-flex">' +
            '<img data-material="' + materialThumbNails[i] + '" src="' + folder + materialThumbNails[i] + '.png" style="width: 100px;border: 1px solid #ddd;border-radius: 4px;padding: 5px;width: 50px;" alt="..." class="img-thumbnail order-2">' +
            '<div class="form-group form-check order-1">' +
            '<input type="checkbox" data-material="' + materialThumbNails[i] + '" class="form-check-input material-checkbox" id="exampleCheck1">' +
            '</div>' +
            '<div class="order-3 ml-2">'+materialThumbNails[i]+'</div>' +
            '</li>';
        $('.controls-material-gallery').find('.list-group').append(li);
    }
}

function getIntersects(clientX, clientY, meshes) {

    const canvasBounds = renderer.getContext().canvas.getBoundingClientRect();
    const x = ((clientX - canvasBounds.left) / (canvasBounds.right - canvasBounds.left)) * 2 - 1;
    const y = - ((clientY - canvasBounds.top) / (canvasBounds.bottom - canvasBounds.top)) * 2 + 1;

    const mouse = new THREE.Vector2(x, y);

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects([...meshes]);

    return intersects;
};

function clearMeshHighlights() {
    if (car.highlighter.status) {
        car.highlighter.mesh.material.emissive.setHex(car.highlighter.prevHex);
        car.highlighter.status = false;
    }
};

function setHighlighter(intersect) {
    car.highlighter.intersect = intersect;
    car.highlighter.mesh = intersect.object;
    car.highlighter.prevHex = intersect.object.material.emissive.getHex();
    car.highlighter.status = true;
}

function addDecalToMesh() {

}

function getMeshCenter(mesh) {
    const box = new THREE.Box3().setFromObject(mesh);
    const center = box.getCenter(new THREE.Vector3());
    return center;
}

function resetLogoOutlines() {
    for (const logoEl of $('.logo-item')) {
        $(logoEl).css('border-color', 'unset');
    }
}

function addEventListeners() {

    // On decal select event listener
    $('.controls-logo-gallery').on('click', '.logo-item', function () {
        resetLogoOutlines();
        if (!$(this).hasClass('default')) {
            currentDecal.src = $(this).find('img').attr("src");
            currentDecal.status = true;
            $(this).css('border-color', 'blue');
        } else {
            currentDecal.src = null;
            currentDecal.status = false;
        }
    });

    // On color select event listener
    $('.controls__color-palette-item').on('click', function () {
        const selectedColor = $(this).css('background-color');
        // set the current color to the color clicked
        $('.rc-color-picker-trigger').css('background-color', selectedColor);

        car.color = new THREE.Color(selectedColor);
        changeVehicleColor(car.color);
    });

    $('.controls__color-palette-item').on('click', function () {
        const selectedColor = $(this).css('background-color');
        // set the current color to the color clicked
        $('.rc-color-picker-trigger').css('background-color', selectedColor);

        car.color = new THREE.Color(selectedColor);
        changeVehicleColor(car.color);
    });

    container.on('mousemove', (event) => {
        clearMeshHighlights();
        const intersects = getIntersects(event.clientX, event.clientY, car.object.children);
        if (intersects.length > 0) {
            setHighlighter(intersects[0]);
            console.log(intersects[0].object.name);
            intersects[0].object.material.emissive.setHex(0xff0000);
        }
    });

    container.on("click", (event) => {
        if (currentDecal.status && car.highlighter.status) {

            const { face, point, object } = car.highlighter.intersect;

            const center = /* getMeshCenter(object) */ point;

            if (car.decals && _.find(car.decals, { meshID: object.uuid })) {
                // alert('This surface already has a decal');
                return;
            }

            const normal = face.normal.clone();
            normal.transformDirection(object.matrixWorld);
            normal.add(center);

            // To get the proper rotation of the face
            const orientationHelper = new THREE.Mesh(new THREE.BoxBufferGeometry(0.01, 0.0, 1), new THREE.MeshNormalMaterial());
            orientationHelper.position.copy(center);
            orientationHelper.lookAt(normal);

            // Logo size scaling
            const size = new THREE.Vector3(1, 1, 1);

            console.log('Position : '+point);

            // const material = decal.material.clone();

            const texture = new THREE.TextureLoader().load(currentDecal.src);
            const material = new THREE.MeshBasicMaterial({
                side: THREE.FrontSide,
                specular: 0x444444,
                map: texture,
                normalScale: new THREE.Vector2(1, 1),
                shininess: 30,
                transparent: true,
                depthTest: true,
                depthWrite: false,
                polygonOffset: true,
                polygonOffsetFactor: - 4,
                wireframe: false,
            })

            // addBal(center);

            const m = new THREE.Mesh(new THREE.DecalGeometry(object, center, orientationHelper.rotation, size), material);
            scene.add(m);

            car.decals.push({
                meshID: object.uuid,
                decal: m
            });
        }
    });

    /* $('.controls-material-gallery').on('click', '.material-item', function () {
        const name = $(this).find('img').attr("src").replace(".png", "").replace("Files/pics/", "");
        setMaterial(name);    
      }); */

    $('.material-checkbox').on('click', function () {
        const material = $(this).data('material');
        const status = $(this).is(':checked');
        if (status) {
            setMaterial(material);
        } else {
            hideMaterial(material);
        }
    });
};

function addBal(pos) {
    const ballMat = new THREE.MeshStandardMaterial({
        color: 0xffff00,
        roughness: 0.5,
        metalness: 1.0
    });
    const ballGeometry = new THREE.SphereBufferGeometry(1, 32, 32);
    const ballMesh = new THREE.Mesh(ballGeometry, ballMat);
    ballMesh.position.copy(pos);
    ballMesh.rotation.y = Math.PI;
    ballMesh.castShadow = true;
    scene.add(ballMesh);
};

function init() {
    raycaster = new THREE.Raycaster();
    scene = createScene();
    camera = createCamera();
    renderer = createRenderer();

    initLighting();

    car.color = new THREE.Color('rgb(41, 183, 132)');

    loadObject();

    setupCameraControls();

    // document.addEventListener('mousemove', onDocumentMouseMove, false);
    // document.addEventListener('mousedown', onDocumentMouseDown, false);
    loadImages();

    loadMaterialEls();

    animate();
}

$(function () {
    init();
});