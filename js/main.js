import * as THREE from 'three';
import {GLTFLoader} from 'GLTFLoader';

const scene = new THREE.Scene();
let camera = new THREE.OrthographicCamera(window.innerWidth/-2.0, window.innerWidth/2.0, window.innerHeight/-2.0, window.innerHeight/2.0, 0.1, 50000.0);
//let camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 50000);
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);

let PI = 3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027;



//LOADER FUNCTIONS-----------------------------------------------------------------------------------------------------------------------
const loader = new GLTFLoader();

async function modelLoader(path) {
  let Model = await new Promise((resolve, reject) => {
    loader.load(path, data=> resolve(data), null, reject);
  });
  return Model.scene;
}
//---------------------------------------------------------------------------------------------------------------------------------------
function setModelSize(model, size) {
  const boundingBox = new THREE.Box3().setFromObject(model);
  let scaleX = size.x/(boundingBox.max.x-boundingBox.min.x);
  let scaleY = size.y/(boundingBox.max.y-boundingBox.min.y);
  let scaleZ = size.z/(boundingBox.max.z-boundingBox.min.z);

  model.scale.set(scaleX, scaleY, scaleZ);
}

function setModelPosition(model, pos) {
  model.position.set(pos.x, pos.y, pos.z);
}
//---------------------------------------------------------------------------------------------------------------------------------------

function rotate2d(radius, angle) {
  return new THREE.Vector3(Math.sin(angle)*radius, 0, Math.cos(angle)*radius);
}

let ObserveMode = true;


let container = document.getElementById("container");
container.appendChild(renderer.domElement);


let lastUpdate = performance.now();
let now = performance.now();
let dt = lastUpdate-now;

let orbitTime = dt*0.001;

/*
const light = new THREE.AmbientLight( 0x404040 ); // soft white light
light.position.set(0, 0, 0);
scene.add( light );
*/

var stars = new Array(0);
  for ( var i = 0; i < 10000; i ++ ) {
    let x = THREE.Math.randFloatSpread( 8000 );
    let y = THREE.Math.randFloatSpread( 4000 );
    let z = THREE.Math.randFloat(-2000, -8000);
    stars.push(x, y, z);
  }
  var starsGeometry = new THREE.BufferGeometry();
  starsGeometry.setAttribute(
    "position", new THREE.Float32BufferAttribute(stars, 3)
  );
  var starsMaterial = new THREE.PointsMaterial( { color: 0xaaaaaa } );
  starsMaterial.size = 1;
  var starField = new THREE.Points( starsGeometry, starsMaterial );
  scene.add( starField );
var ambientLight = new THREE.AmbientLight( 0xffffff, 1.4);
scene.add( ambientLight );

renderer.render(scene, camera);



let animationSpeed = 0.1;
let zoom = 1.0;
let animationController = document.getElementById("myRange");
let currentHourData = document.getElementById("currentHourSet");
let animationSpeedDisplay = document.getElementById("animationSpeedDisplay");
let zoomDisplay = document.getElementById("zoomDisplay");
let zoomController = document.getElementById("zoomSlider");
let maximumZoom = parseFloat(zoomController.getAttribute("max"))+0.32;

camera.position.set(0, 0, 2100);

//data table-----------------------------------------------------------------------------------------------------------------------------

//size of each stellar body, in KM
let jSize = 143000;
let cSize = 4800;
let gSize = 5260;
let eSize = 3140;
let iSize = 3630;

//names of Stellar Bodies
let jName = "Jupiter";
let cName = "Callisto";
let gName = "Ganymede";
let eName = "Europa";
let iName = "Io";

//period of orbit of each moon, in hours
let cPeriod = 400.5;
let gPeriod = 172;
let ePeriod = 85.2;
let iPeriod = 42.5;

//radius of orbit of each moon, in KM
let cRadius = 1883000;
let gRadius = 1070000;
let eRadius = 670900;
let iRadius = 421600;

let spaceConversion = 10 ** -3 * 1.1123;
//---------------------------------------------------------------------------------------------------------------------------------------

document.getElementById("jName").innerText=jName;
document.getElementById("cName").innerText=cName;
document.getElementById("gName").innerText=gName;
document.getElementById("eName").innerText=eName;
document.getElementById("iName").innerText=iName;

var labelsCanvas = document.getElementById("PlanetLabels");
let context = labelsCanvas.getContext("2d");
context.canvas.width = window.innerWidth;
context.canvas.height = window.innerHeight;

addEventListener("resize", () => {
  context.canvas.width = window.innerWidth;
  context.canvas.height = window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);
});

class Planet {
  constructor(name, model, orbitRadius, orbitSpeed, size, startPos) {
    this.name = name;
    this.model = model;
    this.orbitRadius = orbitRadius;
    this.orbitSpeed = orbitSpeed;
    this.size = size;
    this.position = rotate2d(this.orbitRadius, startPos);
    this.offset = startPos;

    setModelSize(this.model, size);
    setModelPosition(this.model, this.position);

    scene.add(model);
  }

  update(dt, oTime) {
    this.model.rotation.y -= dt*0.00003;
    this.position = rotate2d(this.orbitRadius, this.offset+PI*2*(oTime/this.orbitSpeed));
    //console.log("Planet with offset: " + this.offset);
    //console.log(Math.PI*2*(oTime/this.orbitSpeed));
    setModelPosition(this.model, this.position);
  }

  getPosition() {
    return this.position;
  }

  getRadius() {
    return this.size.x;
  }

  getOrbitRadius() {
    return this.orbitRadius;
  }
  
  getName() {
    return this.name;
  }
}

let planets = [];
let playing = true;
var selectedPlanet;

//UI logic-------------------------------------------------------------------------------------------------------------------------------
function togglePlaying() {
  let element = document.getElementById("playpause");
  playing = !playing;

  currentHourData.disabled = playing;

  if (playing) {
    element.innerHTML = '<svg stroke="#ffffff" xmlns="http://www.w3.org/2000/svg" height="40px" width="40px" fill="#ffffff" viewBox="0 0 320 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/></svg>';
  } else {
    element.innerHTML = '<svg stroke="#ffffff" xmlns="http://www.w3.org/2000/svg" fill="#ffffff" height="40px" width="40px" viewBox="0 0 384 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>';
    animationSpeed = 0;
  }
}
document.getElementById("playpause").addEventListener("click", togglePlaying);

function incrementHour() {
  if (!playing) {
    orbitTime+=1;
    currentHourData.value = orbitTime.toPrecision(8).toString();
  }
}
document.getElementById("hourIncrementer").addEventListener("click", incrementHour)

function decrementHour() {
  if (!playing) {
    orbitTime-=1;
    currentHourData.value = orbitTime.toPrecision(8).toString();
  }
}
document.getElementById("hourDecrementer").addEventListener("click", decrementHour);

const maxSize = 2.5;

function handleCameraLookat() {
  if (selectedPlanet !== -1) {
    let cameraPosToHandle = planets[selectedPlanet].getPosition();
    //let radiusOfPlanet = planets[selectedPlanet].getRadius();
    //let orbitRadius = planets[selectedPlanet].getOrbitRadius();
    camera.position.set(cameraPosToHandle.x, cameraPosToHandle.y, camera.position.z);
  }
  //camera.zoom = zoom;
  //camera.updateProjectionMatrix();
  //camera.lookAt(cameraPosToHandle);
  camera.left = (window.innerWidth/-2.0)*(maxSize*zoom);
  camera.right = (window.innerWidth/2.0)*(maxSize*zoom);
  camera.top = (window.innerHeight/-2.0)*(maxSize*zoom);
  camera.bottom = (window.innerHeight/2.0)*(maxSize*zoom);
  camera.updateProjectionMatrix();
}

function selectNone() {
  document.getElementById("JupiterSelect").className = "body-control foregroundMenu";
  document.getElementById("CallistoSelect").className = "body-control foregroundMenu";
  document.getElementById("GanymedeSelect").className = "body-control foregroundMenu";
  document.getElementById("EuropaSelect").className = "body-control foregroundMenu";
  document.getElementById("IoSelect").className = "body-control foregroundMenu";
  selectedPlanet = -1;
}

function selectJupiter() {
  document.getElementById("JupiterSelect").className = "body-control foregroundMenu foregroundMenuSelected";
  document.getElementById("CallistoSelect").className = "body-control foregroundMenu";
  document.getElementById("GanymedeSelect").className = "body-control foregroundMenu";
  document.getElementById("EuropaSelect").className = "body-control foregroundMenu";
  document.getElementById("IoSelect").className = "body-control foregroundMenu";
  selectedPlanet = 0;
}
document.getElementById("JupiterSelect").addEventListener("click", selectJupiter);

function selectCallisto() {
  document.getElementById("JupiterSelect").className = "body-control foregroundMenu";
  document.getElementById("CallistoSelect").className = "body-control foregroundMenu foregroundMenuSelected";
  document.getElementById("GanymedeSelect").className = "body-control foregroundMenu";
  document.getElementById("EuropaSelect").className = "body-control foregroundMenu";
  document.getElementById("IoSelect").className = "body-control foregroundMenu";
  selectedPlanet = 1;
}
document.getElementById("CallistoSelect").addEventListener("click", selectCallisto);

function selectGanymede() {
  document.getElementById("JupiterSelect").className = "body-control foregroundMenu";
  document.getElementById("CallistoSelect").className = "body-control foregroundMenu";
  document.getElementById("GanymedeSelect").className = "body-control foregroundMenu foregroundMenuSelected";
  document.getElementById("EuropaSelect").className = "body-control foregroundMenu";
  document.getElementById("IoSelect").className = "body-control foregroundMenu";
  selectedPlanet = 2;
}
document.getElementById("GanymedeSelect").addEventListener("click", selectGanymede);

function selectEuropa() {
  document.getElementById("JupiterSelect").className = "body-control foregroundMenu";
  document.getElementById("CallistoSelect").className = "body-control foregroundMenu";
  document.getElementById("GanymedeSelect").className = "body-control foregroundMenu";
  document.getElementById("EuropaSelect").className = "body-control foregroundMenu foregroundMenuSelected";
  document.getElementById("IoSelect").className = "body-control foregroundMenu";
  selectedPlanet = 3;
}
document.getElementById("EuropaSelect").addEventListener("click", selectEuropa);

function selectIo() {
  document.getElementById("JupiterSelect").className = "body-control foregroundMenu";
  document.getElementById("CallistoSelect").className = "body-control foregroundMenu";
  document.getElementById("GanymedeSelect").className = "body-control foregroundMenu";
  document.getElementById("EuropaSelect").className = "body-control foregroundMenu";
  document.getElementById("IoSelect").className = "body-control foregroundMenu foregroundMenuSelected";
  selectedPlanet = 4;
}
document.getElementById("IoSelect").addEventListener("click", selectIo);

let mouseDataX = 0;
let mouseDataY = 0;
let mouseDataXContainer = document.getElementById("mouseDataPositionX");
let mouseDataYContainer = document.getElementById("mouseDataPositionY");

let maxCameraX = 0;
let minCameraX = 0;
let maxCameraY = 0;
let minCameraY = 0;

function updateMouseDrag(e) {
  let mouseX = e.movementX;
  let mouseY = e.movementY;

  let updateX = Math.min(Math.max(camera.position.x + (-mouseX*(2*camera.right/window.innerWidth)), minCameraX), maxCameraX);
  let updateY = Math.min(Math.max(camera.position.y + (-mouseY*(2*camera.bottom/window.innerHeight)), minCameraY), maxCameraY);

  //var cameraVector = camera.getWorldDirection();
  camera.position.set(updateX, updateY, 2000);
}

function updateMouse(e) {
  let mouseX = e.clientX-window.innerWidth/2;
  let mouseY = e.clientY-window.innerHeight/2;
  mouseDataX = camera.position.x+mouseX*(2*camera.right/window.innerWidth);
  mouseDataY = camera.position.y+mouseY*(2*camera.bottom/window.innerHeight);
}

/*
document.addEventListener("pointerlockchange", lockChangeAlert, false);
function lockChangeAlert() {
  if (document.pointerLockElement === renderer.domElement) {
    document.addEventListener("mousemove", updateMouse, false);
  } else {
    document.removeEventListener("mousemove", updateMouse, false);
  }
}
*/
renderer.domElement.addEventListener("mousedown", (event) => {
  if (ObserveMode) {
    document.addEventListener("mousemove", updateMouseDrag, false);
    selectNone();
    //renderer.domElement.requestPointerLock({unadjustedMouseMovement: true});
  } else {
    mouseDataXContainer.innerText = mouseDataX.toPrecision(7).toString();
    mouseDataYContainer.innerText = mouseDataY.toPrecision(7).toString();
  }
});

document.addEventListener("mousemove", updateMouse, false);

renderer.domElement.addEventListener("mouseup", (event) => {
  //document.exitPointerLock();
  document.removeEventListener("mousemove", updateMouseDrag, false);
});

function setObserveMode() {
  document.getElementById("MeasureButton").className = "dataTableControl foregroundMenu";
  document.getElementById("ObserveButton").className = "dataTableControl foregroundMenu foregroundMenuSelected";
  ObserveMode = true;
}
document.getElementById("ObserveButton").addEventListener("click", setObserveMode);

function setMeasureMode() {
  document.getElementById("MeasureButton").className = "dataTableControl foregroundMenu foregroundMenuSelected";
  document.getElementById("ObserveButton").className = "dataTableControl foregroundMenu";
  ObserveMode = false;
  mouseDataXContainer.innerText = "-";
  mouseDataYContainer.innerText = "-";
  handleCameraLookat();
}

function setBodySelectClosed() {
  document.getElementById("bodyOpen").className = "bodySelector backgroundMenu hider";
  document.getElementById("bodyClosed").className = "hideControlContainer backgroundMenu";
  document.getElementById("topHeightController").className = "topuiContainer topuiContainerOverride";
}
document.getElementById("setBodySelectClosed").addEventListener("click", setBodySelectClosed);

function setBodySelectOpen() {
  document.getElementById("bodyOpen").className = "bodySelector backgroundMenu";
  document.getElementById("bodyClosed").className = "hideControlContainer backgroundMenu hider";
  document.getElementById("topHeightController").className = "topuiContainer";
}
document.getElementById("setBodySelectOpen").addEventListener("click", setBodySelectOpen);



document.getElementById("MeasureButton").addEventListener("click", setMeasureMode);
//update RENDERING LOGIC-----------------------------------------------------------------------------------------------------------------

const handleCamera = function() {
  let maxBorderX = 1500+(window.innerWidth/2.0)*(maxSize);
  let minBorderX = -1500-(window.innerWidth/2.0)*(maxSize);
  let maxBorderY = 1200+(window.innerHeight/2.0)*(maxSize);
  let minBorderY = -1200-(window.innerHeight/2.0)*(maxSize);

  maxCameraX = maxBorderX-camera.right;
  minCameraX = minBorderX+camera.right;
  maxCameraY = maxBorderY-camera.right;
  minCameraY = minBorderY+camera.right;

  let clampCamX = Math.min(Math.max(camera.position.x, minCameraX), maxCameraX);
  let clampCamY = Math.min(Math.max(camera.position.y, minCameraY), maxCameraY);

  camera.position.set(clampCamX, clampCamY, camera.position.z);

  handleCameraLookat();
  zoom = 1-(parseFloat(zoomController.value)/maximumZoom);
  zoomDisplay.innerText = parseFloat(zoomController.value).toPrecision(3).toString();
}

const timeHandlingAndControls = function() {

  if (playing) {
    animationSpeed = animationController.value;
    currentHourData.value = orbitTime.toPrecision(8).toString();
  } else {
    orbitTime = isNaN(parseFloat(currentHourData.value)) ? 0 : parseFloat(currentHourData.value);
  }

  animationSpeedDisplay.innerText = animationController.value;

  orbitTime += dt*0.001*animationSpeed;
  if (ObserveMode) {
    mouseDataXContainer.innerText = mouseDataX.toPrecision(7).toString();
    mouseDataYContainer.innerText = mouseDataY.toPrecision(7).toString();
  }
}


let loaded = false;
let loadingScreen = document.getElementById("loadingScreen");
let loadingAnimation = 0;
let loadingScreenInnerText = "Loading...";

const handleLabels = function() {
  context.clearRect(0, 0, labelsCanvas.width, labelsCanvas.height);
}

const rendering = function() {
  requestAnimationFrame(rendering);

  now = performance.now();
  dt = now-lastUpdate;
  lastUpdate = now;

  if (loaded) {
    handleLabels();
    timeHandlingAndControls();
    for (let i = 0; i < planets.length; i++) {
      let position = planets[i].getPosition();
      let planetRadius = planets[i].getRadius();
      position.y += planetRadius/2;
      let name = planets[i].getName();

      let labelPositionX = (position.x-camera.position.x)/(2*camera.right/window.innerWidth);
      let labelPositionY = (position.y-camera.position.y)/(2*camera.bottom/window.innerHeight);
      labelPositionY += window.innerHeight/2;
      labelPositionX += window.innerWidth/2;
      context.fillStyle = "rgb(255, 255, 255)";
      context.strokeStyle = "rgb(255, 255, 255)";
      context.font = "10px monospace";
      context.textAlign = "center";
      context.fillText(name, labelPositionX, labelPositionY+11);
      
      planets[i].update(dt*animationSpeed, orbitTime);
    }
    handleCamera();
      //camera.position.set(Math.sin(dt*0.001)*500, 0, Math.cos(dt*0.001)*500);
      //camera.lookAt(new THREE.Vector3(0,0,0));
    renderer.render(scene, camera);
  } else {
    loadingAnimation += dt;

    if (loadingAnimation >= 500) {
      loadingAnimation = 0;
      loadingScreenInnerText = loadingScreenInnerText==="Loading..." ? "Loading." : loadingScreenInnerText+".";
      loadingScreen.innerText = loadingScreenInnerText;
    }
  }
}

async function main() {
  setBodySelectClosed();
  let JupiterModel = await modelLoader('models/Jupiter.glb');
  let CallistoModel = await modelLoader('models/Callisto.glb');
  let GanymedeModel = await modelLoader('models/Ganymede.glb');
  let EuropaModel = await modelLoader('models/Europa.glb');
  let IoModel = await modelLoader('models/Io.glb');

  planets.push(new Planet(jName, JupiterModel, 0, 1, new THREE.Vector3(jSize*spaceConversion, jSize*spaceConversion, jSize*spaceConversion), 0, 2.0));
  planets.push(new Planet(cName, CallistoModel, cRadius*spaceConversion, cPeriod, new THREE.Vector3(cSize*spaceConversion, cSize*spaceConversion, cSize*spaceConversion), 0));
  planets.push(new Planet(gName, GanymedeModel, gRadius*spaceConversion, gPeriod, new THREE.Vector3(gSize*spaceConversion, gSize*spaceConversion, gSize*spaceConversion), 1.4));
  planets.push(new Planet(eName, EuropaModel, eRadius*spaceConversion, ePeriod, new THREE.Vector3(eSize*spaceConversion, eSize*spaceConversion, eSize*spaceConversion), 3.1));
  planets.push(new Planet(iName, IoModel, iRadius*spaceConversion, iPeriod, new THREE.Vector3(iSize*spaceConversion, iSize*spaceConversion, iSize*spaceConversion), 4.7));

  selectJupiter();
  loadingScreen.className = "hider";
  loaded=true;
}

rendering();

main();


addEventListener("wheel", (event) => {
  let adjustAmount = event.deltaY*0.0015*-1;
  zoomController.value = Math.min(Math.max(parseFloat(zoomController.value)+adjustAmount, 1), maximumZoom).toPrecision(3).toString();
});



