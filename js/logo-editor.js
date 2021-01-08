let scene, camera, renderer, raycaster;

const currVersion = 'v0.0.0.1';

const container = $('#car');
const decalListContainer = document.getElementById('decalPositionList');
const logos = [
    /* 'fox-light-colors.png', */
    /* 'rc_logo.png', */
    /* 'Motul_logo.png', */
    'TSKB Silver.png',
    'Team Kraken Silver.png',
    'RC Star Silver.png',
    'Method Race Silver.png',
    'Kraken logo silver.png',
    'Fiberwerx Silver.png',
    'Castrol Silver.png',
    'BF Goodrich silver.png',
    'Baja Designs.png',
    'Fiberwerx Silver.png'
];
const car = {
    model: "3d-assets/new_object_update9.obj",
    material: '3d-assets/new_object_update9.mtl',
    object: null,
    color: new THREE.Color('rgb(246, 25, 34)'),
    decals: [],
    highlighter: {
        intersect: null,
        mesh: null,
        prevHex: null,
        decal: null,
        status: false
    }
};

const currentDecal = {
    src: '',
    material: null,
    status: false
};

let decalPositions = {
    'test.png': [
        {
            meshName: '',
            position: {
                x: 0,
                y: 0,
                z: 0
            },
            rotation: {
                x: 0,
                y: 0,
                z: 0
            }
        }
    ]
};

let displayedDecals = [];

let materials = {};
const materialMap = {};
const bodyMeshes = [];

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
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(0, 5, 0);
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight2.position.set(0, -5, 0);
    scene.add(directionalLight2);

    const directionalLight3 = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight3.position.set(6, -1, 0);
    scene.add(directionalLight3);

    const directionalLight4 = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight4.position.set(-6, -1, 0);
    scene.add(directionalLight4);

    const ambientLight = new THREE.AmbientLight( 0x404040 );
    scene.add( ambientLight );
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
    controls.enableDamping = false;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.maxPolarAngle = Math.PI/2;
    controls.minDistance = 10;
    controls.maxDistance = 16;
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

/* function loadObject() {
    // Using the three oBjectLOader to load the 3d json file
    const objectLoader = new THREE.ObjectLoader();
    objectLoader.load(car.model, function (obj) {
        car.object = obj;
        changeVehicleColor(car.color);
        scene.add(obj);
    });
} */

function loadObject() {
    const mtlLoader = new THREE.MTLLoader();
    const loader = new THREE.OBJLoader();
    mtlLoader.load(car.material, (materialCreator) => {

        materialCreator.preload();
        materials = { ...materialCreator.materials };
        loader.setMaterials(materialCreator);

        loader.load(car.model, (obj) => {
            getMaterialMappings(obj);
            initMaterials();
            car.object = obj;
            obj.position.y = -2;
            console.log(obj);
            scene.add(obj);

            setMaterial('Default');
            setMaterial('Tires');
            setMaterial('misc');
            setMaterial('grill');
            changeVehicleColor(new THREE.Color('rgb(214, 207, 191)'));
            
            addEventListeners();

        }, undefined, (error) => {
            console.log(error);
        });
    });
};

/**
 * Records material mapping of each meshes in the car
 * the mapping is in the form -> materialName: [array of mesh ids which uses this material]
 * @param {*} mesh car mesh
 */
function getMaterialMappings(mesh) {
    for (const childMesh of mesh.children) {
        if (childMesh.material && childMesh.material.name) {

            if (['C'].indexOf(childMesh.material.name) != -1) {
                bodyMeshes.push(childMesh);
            }

            if (materialMap[childMesh.material.name]) {
                materialMap[childMesh.material.name].push(childMesh.id);
                console.log(childMesh.material.name+ ' : ' +childMesh.name);
            } else {
                materialMap[childMesh.material.name] = [childMesh.id];
                console.log(childMesh.material.name+ ' : ' +childMesh.name);
            }
        }
    }
}

/** TODO: REMOVE
 * When given a material name, looks for the meshes that uses the material and adds it
 * to the mesh
 * @param {*} name material name
 */
function _setMaterial(name, updateColor = true) {
    if (materials[name] && materialMap[name]) {
        for (const objectId of materialMap[name]) {
            const mesh = scene.getObjectById(objectId, true);

            if (mesh.name === 'bodypanel52_bodypanel52_Default') {
                console.log('gotcha');
            }

            // If this is the first time the material is assigned to mesh, assign a clone of the original material.
            if (!mesh.material.map) {
                mesh.material = materials[name];
                if (updateColor) {
                    mesh.material.color = car.color;
                }
            } else {
                // If the mesh already has a copy of given material, toggle its visibility
                mesh.material.visible = 1;
            }
        }
    }
}

/* function hideMaterial(name) {
    if (materials[name] && materialMap[name]) {
        for (const objectId of materialMap[name]) {
            const mesh = scene.getObjectById(objectId, true);

            if (mesh.material) {
                // mesh.material = materials['Default'].clone();
                // mesh.material.color = car.color;
                mesh.material.visible = 0;
            }
        }
    }
} */

function hideMaterial(name) {
    if (materials[name]) {
        materials[name].visible = 0;
    }
}

/**
 * Init materials will hide and control materials that you can see on the frontend
 *
 */
function initMaterials() {
    for (const key in materials) {
        /* if (key !== 'Default') {
            materials[key].visible = 0;
            materials[key].color = null;
            materials[key].alphaMap = null;
        } */
        materials[key].visible = 0;
        materials[key].alphaMap = null;
    }
}

function setMaterial(name) {
    if (materials[name]) {
        materials[name].visible = 1;
    }
}

function changeVehicleColor(color) {
    /* for (const key in materials) {
        materials[key].color = color;
    }; */

    for(const name of ['Default']) {
        if (materials[name]) {
            materials[name].color = color;
        }
    }

    /* for (const mesh of car.object.children) {
        if (mesh && mesh.material && ['A', 'B', 'C', 'D', 'E', 'F', 'Default'].indexOf(mesh.material.name) !== -1) {
            mesh.material.color = color;
        }
    } */
};

function loadImages() {
    const folder = "img/logo-images/";
    const dafault_img = "default/ico_noimage.png";
    $('.controls-logo-gallery .row').append('<div class="col-md-3 logo-item default"> <img  src="' + folder + dafault_img + '"></div>');
    for (const i in logos) {
        $('.controls-logo-gallery .row').append('<div class="col-md-3 logo-item"> <img  src="' + folder + logos[i] + '"></div>');
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

function getDecalMaterial(src) {
    const texture = new THREE.TextureLoader().load(src);
    return new THREE.MeshPhongMaterial({
        side: THREE.FrontSide,
        map: texture,
        shininess: 30,
        transparent: true,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: - 4
    });
}

function addDecalToList(id, meshName, position, rotation) {
    if (!decalPositions[currentDecal.src]) {
        decalPositions[currentDecal.src] = [];
    }

    decalPositions[currentDecal.src].push({
        id,
        meshName,
        position: {x: position.x, y: position.y, z: position.z},
        rotation: {x: rotation.x, y: rotation.y, z: rotation.z}
    });

    saveDecalPos();

    addListItem(id, `mesh: ${meshName} x: ${Math.floor(position.x)} y: ${Math.floor(position.z)} z: ${Math.floor(position.z)}`);
}

function addDecal(mesh, position, rotation, size, material) {
    const decal = new THREE.Mesh(new THREE.DecalGeometry(mesh, position, rotation, size), material);
    scene.add(decal);
    return decal;
}

function loadDecalList() {
    const size = new THREE.Vector3(1, 1, 1);
    const material = currentDecal.material.clone();
    $(decalListContainer).empty();
    displayedDecals.forEach(decal => scene.remove(decal));
    displayedDecals = [];

    (decalPositions[currentDecal.src] || []).forEach(positionItem => {

        const { id, meshName, position, rotation } = positionItem;

        const decalPosition = new THREE.Vector3(position.x, position.y, position.z);
        const decalRotation = new THREE.Euler( rotation.x, rotation.y, rotation.z, 'XYZ');

        const decal = addDecal(scene.getObjectByName(meshName), decalPosition, decalRotation, size, material);
        decal.id = id;

        displayedDecals.push(decal);

        addListItem(id, `mesh: ${meshName} x: ${Math.floor(position.x)} y: ${Math.floor(position.y)} z: ${Math.floor(position.z)}`);
    });
}

function resetActivePosListItem() {
    $( ".position-item" ).removeClass( "active" );
}

function removePosItem(id, node) {
    _.remove(decalPositions[currentDecal.src], {id});
    saveDecalPos();
    const decalMesh = scene.getObjectById(id);
    scene.remove(decalMesh);
    _.remove(displayedDecals, decalMesh);
    $(node).remove();
}

function addListItem(id, content) {
    const node = document.createElement("LI");
    node.innerHTML = content;
    node.classList.add("list-group-item");
    node.classList.add("position-item");
    node.onclick = () => {
        resetActivePosListItem();
        node.classList.add("active");
    }
    const button = document.createElement("BUTTON");
    button.classList.add("btn");
    button.classList.add("btn-danger");
    button.innerHTML = 'REMOVE';
    button.onclick = () => {
        removePosItem(id, node);
    }
    node.appendChild(button);
    decalListContainer.appendChild(node);
}

function addEventListeners() {

    // On decal select event listener
    $('.controls-logo-gallery').on('click', '.logo-item', function () {
        resetLogoOutlines();
        if (!$(this).hasClass('default')) {
            currentDecal.src = $(this).find('img').attr("src");
            currentDecal.material = getDecalMaterial(currentDecal.src);
            currentDecal.status = true;
            loadDecalList();
            $(this).css('border-color', 'blue');
        } else {
            currentDecal.src = null;
            currentDecal.material = null;
            currentDecal.status = false;
            $(decalListContainer).empty();
        }
    });

    container.on('mousemove', (event) => {
        clearMeshHighlights();
        const intersects = getIntersects(event.clientX, event.clientY, bodyMeshes);
        if (intersects.length > 0) {
            setHighlighter(intersects[0]);
            // intersects[0].object.material.emissive.setHex(0xffffff);
        }
    });

    container.on("click", (event) => {
        if (currentDecal.status && car.highlighter.status) {

            const { face, point, object } = car.highlighter.intersect;

            const normal = face.normal.clone();
            normal.transformDirection(object.matrixWorld);
            normal.add(point);

            // To get the proper rotation of the face
            const orientationHelper = new THREE.Mesh(new THREE.BoxBufferGeometry(0.01, 0.0, 1), new THREE.MeshNormalMaterial());
            orientationHelper.position.copy(point);
            orientationHelper.lookAt(normal);

            // Logo size scaling
            const size = new THREE.Vector3(1, 1, 1);

            // const material = decal.material.clone();

            const material = getDecalMaterial(currentDecal.src);

            // addBal(center);

            // const id = `${meshName}${position.x}${position.y}${position.z}`;

            const m = new THREE.Mesh(new THREE.DecalGeometry(object, point, orientationHelper.rotation, size), material);
            scene.add(m);

            displayedDecals.push(m);

            addDecalToList(m.id, object.name, point, orientationHelper.rotation);
        }
    });
};

function init() {
    clearOnNewRelease();

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

    animate();

    loadDecalPos();
}

function loadDecalPos() {
    const pos = localStorage.getItem('decalPositions');
    if (pos) {
        decalPositions = JSON.parse(pos);
    }
}

function saveDecalPos() {
    localStorage.setItem('decalPositions', JSON.stringify(decalPositions));
}

function clearOnNewRelease() {
    const version = localStorage.getItem('version');
    if (!version || version !== currVersion) {
        localStorage.removeItem('decalPositions');
        localStorage.setItem('version', currVersion);
    }
}

$(function () {
    init();
});