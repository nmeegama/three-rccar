let scene, camera, renderer, raycaster, colladaDownloadLink;

const currVersion = 'v0.0.0.3';

const container = $('#car');
const logos = [
    /* 'fox-light-colors.png',
    'rc_logo.png',
    'Motul_logo.png', */
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
    model: "3d-assets/new_object_update11.obj",
    material: '3d-assets/new_object_update11.mtl',
    object: null,
    color: new THREE.Color('rgb(246, 25, 34)'),
    decals: [],
    highlighter: {
        intersect: null,
        mesh: null,
        prevHex: null,
        decal: null,
        status: false
    },
    /* decalPositions: [
        {
            meshName: 'bodypanel60',
            position: new THREE.Vector3(2.5729999542236346, 0.5528489172720067, -1.17313083406363),
            rotation: new THREE.Euler( 0, 1.5707963267948966, 0, 'XYZ' )
        },
        {
            meshName: 'bodypanel60',
            position: new THREE.Vector3(2.5729999542236346, 0.5528489172720067, -1.17313083406363),
            rotation: new THREE.Euler( 0, 1.5707963267948966, 0, 'XYZ' )
        }
    ] */
    decalPositions: {"test.png":[{"id": "", "size": {}, "meshName":"","position":{"x":0,"y":0,"z":0},"rotation":{"x":0,"y":0,"z":0}}]}
};
const currentDecal = {
    src: '',
    material: null,
    status: false,
    sizing: null
};

let materials = {};
const materialMap = {};

const materialThumbNails = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
];

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
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 5, 0);
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight2.position.set(0, -5, 0);
    scene.add(directionalLight2);

    const directionalLight3 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight3.position.set(6, -1, 0);
    scene.add(directionalLight3);

    const directionalLight4 = new THREE.DirectionalLight(0xffffff, 1);
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
    for(const name of ['Default']) {
        if (materials[name]) {
            materials[name].color = color;
        }
    }
};

function loadImages() {
    const folder = "img/logo-images/";
    const dafault_img = "default/ico_noimage.png";
    $('.controls-logo-gallery .row').append('<div class="col-md-3 logo-item default"> <img  src="' + folder + dafault_img + '"></div>');
    for (const i in logos) {
        console.log(logos[i] + ' in ' , car.decalPositions);
        if (car.decalPositions[`${folder}${logos[i]}`]) {
            $('.controls-logo-gallery .row').append('<div class="col-md-3 logo-item"> <img  src="' + folder + logos[i] + '"></div>');
        }
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
        // car.highlighter.mesh.material.emissive.setHex(car.highlighter.prevHex);
        // scene.remove(car.highlighter.decal);
        // car.highlighter.decal.visible = false;
        car.highlighter.status = false;
    }
};

function setHighlighter(intersect) {
    // const meshName = intersect.object.name;
    // const positionObj = _.find(car.decalPositions, {meshName});

    // const size = new THREE.Vector3(1, 1, 1);

    // const material = currentDecal.material.clone();
    // material.needsUpdate = true;
    // material.emissive.setHex(0xff0000);

    // const decal = new THREE.Mesh(new THREE.DecalGeometry(intersect.object, positionObj.position, positionObj.rotation, size), material);
    // scene.add(decal);

    intersect.object.visible = true;

    car.highlighter.decal = intersect.object;

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
    return new THREE.MeshStandardMaterial({
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
    });
}

function addDecal(mesh, position, rotation, size, material) {
    const decal = new THREE.Mesh(new THREE.DecalGeometry(mesh, position, rotation, size), material);
    scene.add(decal);
    return decal;
}

function createDecal(mesh, position, rotation, size, material) {
    const decal = new THREE.Mesh(new THREE.DecalGeometry(mesh, position, rotation, size), material);
    return decal;
}

function addAllowedLocations() {
    const decalPositions = car.decalPositions[currentDecal.src];

    if (car.decalPositions[currentDecal.src]) {
        currentDecal.allowedLocations = [];

        /* const material = currentDecal.material.clone();
        material.emissive.setHex(0xff0000); */
        const material = new THREE.MeshStandardMaterial({
            side: THREE.FrontSide,
            specular: 0x444444,
            normalScale: new THREE.Vector2(1, 1),
            shininess: 30,
            transparent: true,
            depthTest: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: - 4,
            wireframe: false,
        });

        decalPositions.forEach(positionItem => {

            const sizing = positionItem.size || {length: 1, width: 1};

            const size = new THREE.Vector3(Number(sizing.length), Number(sizing.width), 1);

            const position = new THREE.Vector3(positionItem.position.x, positionItem.position.y, positionItem.position.z);
            const rotation = new THREE.Euler( positionItem.rotation.x, positionItem.rotation.y, positionItem.rotation.z, 'XYZ');

            const decal = createDecal(scene.getObjectByName(positionItem.meshName), position, rotation, size, material);
            decal.userData.id = positionItem.id;
            // decal.visible = false;
            currentDecal.allowedLocations.push(decal);

            if (!checkForOverlappingDecals(decal)) {
                scene.add(decal);         
            }
        });
    }
}

function checkForOverlappingDecals(decal1) {
    const box1 = new THREE.Box3();
    decal1.geometry.computeBoundingBox();
    box1.copy( decal1.geometry.boundingBox ).applyMatrix4( decal1.matrixWorld );
    for(const existingDecal of (car.decals || [])) {
        const decal2 = existingDecal.decal;
        const box2 = new THREE.Box3();
        decal2.geometry.computeBoundingBox();
        box2.copy( decal2.geometry.boundingBox ).applyMatrix4( decal2.matrixWorld );
        if (box1.intersectsBox(box2)) {
            return true;
        }
    }

    return false;
}

function refreshDecalPlaceholders() {
    (currentDecal.allowedLocations || []).forEach(decal => {
        scene.remove(decal);
    });
    currentDecal.allowedLocations = [];
    addAllowedLocations();
}

function resetDecalSelector() {
    (currentDecal.allowedLocations || []).forEach(decal => {
        scene.remove(decal);
    });
    currentDecal.allowedLocations = [];
    currentDecal.src = null;
    currentDecal.material = null;
    currentDecal.status = false;
}

function addEventListeners() {

    // On decal select event listener
    $('.controls-logo-gallery').on('click', '.logo-item', function () {
        resetLogoOutlines();
        if (!$(this).hasClass('default')) {
            resetDecalSelector();
            currentDecal.src = $(this).find('img').attr("src");
            currentDecal.material = getDecalMaterial(currentDecal.src);
            addAllowedLocations();
            currentDecal.status = true;
            $(this).css('border-color', 'blue');
        } else {
            resetDecalSelector();
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
        /* const meshesList = [];
        car.decalPositions.forEach(position => {
            if (!_.find(car.decals, {meshName: position.meshName})) {
                meshesList.push(scene.getObjectByName(position.meshName));
            }
        }); */
        const intersects = getIntersects(event.clientX, event.clientY, currentDecal.allowedLocations || []);
        if (intersects.length > 0/*  && intersects[0] !== car.highlighter.mesh */) {
            setHighlighter(intersects[0]);
            // console.log(intersects[0].object.name);
            // intersects[0].object.material.emissive.setHex(0xff0000);
        }
    });

    container.on("click", (event) => {
        if (currentDecal.status && car.highlighter.status) {


            const { face, point, object } = car.highlighter.intersect;

            // const center = getMeshCenter(object);

            // if (car.decals && _.find(car.decals, { meshID: object.uuid })) {
            //     return;
            // }

            // const normal = face.normal.clone();
            // normal.transformDirection(object.matrixWorld);
            // normal.add(center);

            // To get the proper rotation of the face
            // const orientationHelper = new THREE.Mesh(new THREE.BoxBufferGeometry(0.01, 0.0, 1), new THREE.MeshNormalMaterial());
            // orientationHelper.position.copy(center);
            // orientationHelper.lookAt(normal);

            // Logo size scaling
            // const size = new THREE.Vector3(1, 1, 1);
            
            const material = currentDecal.material.clone();

            // addBal(center);

            const m = new THREE.Mesh(car.highlighter.decal.geometry, material);
            m.userData.id = car.highlighter.decal.userData.id;
            scene.add(m);

            car.decals.push({
                id: car.highlighter.decal.userData.id,
                meshID: object.uuid,
                meshName: object.name,
                decal: m
            });

            refreshDecalPlaceholders();

            clearMeshHighlights();
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

    $('.export-btn').on('click', function () {
        exportCollada();
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
    
    loadDecalPos();

    loadImages();

    loadMaterialEls();

    animate();
}

function download(blob, name) {
    colladaDownloadLink.href = URL.createObjectURL( blob );
    colladaDownloadLink.download = name;
    colladaDownloadLink.click();
}

function exportCollada() {

    colladaDownloadLink = document.createElement('a');
    colladaDownloadLink.style.display = 'none';
    document.body.appendChild(colladaDownloadLink);

    const results = [];

    const exporter = new THREE.ColladaExporter();

    for (const mesh of [car.object, /* ...car.decals.map(decalObj => decalObj.decal) */]) {
        // Parse the input and generate the ply output
        const result = exporter.parse( mesh );

        /* result.textures.forEach( tex => {
            download( new Blob( [ tex.data ], { type: 'application/octet-stream' } ), `${ tex.name }.${ tex.ext }` );
        } ); */

        results.push(result.data);
    }

    download(new Blob( [ ...results ], { type: 'text/plain' } ), 'test-collada.dae');
}

function loadDecalPos() {
    const pos = localStorage.getItem('decalPositions');
    if (pos) {
        car.decalPositions = JSON.parse(pos);
    }
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