import * as THREE from 'three';


const scene = new THREE.Scene();
//const camera = new THREE.OrthographicCamera(window.innerWidth/2.0, window.innerWidth/2.0, window.innerHeight/2.0, window.innerHeight/2.0, 1.0, 10000.0);
let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
const renderer = new THREE.WebGLRenderer({antialias: true});


let container = document.getElementById("container");
container.appendChild(renderer.domElement);

camera.position.set(0, 0, 500);

renderer.render(scene, camera);

const boxGeometry = new THREE.Mesh(
  new THREE.BoxGeometry(100, 100, 100),
  new THREE.MeshBasicMaterial({ color: 0x0000ff })
);
boxGeometry.position.set(0, 0, 0);

scene.add(boxGeometry);

const light = new THREE.AmbientLight( 0x404040 ); // soft white light
light.position.set(10, 10, 10);
scene.add( light );

addEventListener("resize", () => {
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.set(0, 0, 500);
})

const rendering = function() {
  requestAnimationFrame(rendering);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
}

rendering();


/*
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
const renderer = new THREE.WebGLRenderer({antialias: true});

camera.position.set(500, 500, 500);
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();
renderer.render(scene, camera);
//document.body.appendChild(renderer.domElement);

const boxGeometry = new THREE.Mesh(
  new THREE.BoxGeometry(100, 100, 100),
  new THREE.MeshBasicMaterial({ color: 0x0000ff })
);
boxGeometry.rotation.set(40, 0, 40);
scene.add(boxGeometry);

const light = new THREE.AmbientLight( 0x404040 ); // soft white light
light.position.set(10, 10, 10);
scene.add( light );

const rendering = function() {
  requestAnimationFrame(rendering);
  // Constantly rotate box
  renderer.render(scene, camera);
}
rendering();

*/