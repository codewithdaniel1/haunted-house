import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import './style.css';
import { createGrandfatherClock } from './clock.js';
import { createMansion } from './mansion.js';

const app = document.querySelector('#app');
app.innerHTML = `<div class="grain"></div><div class="hud"><div class="topbar"><div><div class="brand">Haunted House</div><div class="chapter">Blackthorn Estate · The Foyer</div></div><div class="objective">Current objective<strong id="objective">Find a way out</strong></div></div><div class="timebox"><span>HOUSE TIME</span><strong id="house-time">12:00 AM</strong><small id="phase">THE AWAKENING</small></div><div class="stamina"><i id="stamina-fill"></i></div><div id="crosshair" class="crosshair"></div><div id="interact-hint" class="interact-hint"></div><div class="bottom"><div class="status">Haunting <b id="haunt-value">45%</b><div class="haunt-track"><i id="haunt-fill"></i></div>Flashlight <b id="lightstatus">ON</b> · Inventory <b id="inventory">EMPTY</b></div><div class="help">WASD Move · Shift Run<br>Mouse Look · E Interact<br>F Flashlight · J Journal · C Crouch · Esc Pause</div></div></div><div id="toast" class="toast"></div><div id="journal" class="journal hidden"><div class="journal-page"><button id="close-journal" class="close" aria-label="Close journal">×</button><div class="eyebrow">Field Journal</div><h2>Blackthorn Estate</h2><p id="journal-text">The front door is locked. Search the library for a clue.</p></div></div><div id="puzzle" class="puzzle hidden"><div class="puzzle-card"><div class="eyebrow">Grandfather Clock</div><h2>Set the hour</h2><p>Turn the hands to the time recorded in the diary, then wind the mechanism.</p><div id="clock-inspection" class="clock-inspection"><i id="inspect-hour"></i><i id="inspect-minute"></i><b></b></div><div class="clock-controls"><button id="hour-down" aria-label="Hour back">−</button><output id="clock-reading">11:47</output><button id="hour-up" aria-label="Hour forward">+</button></div><label class="minute-control">MINUTE HAND<input id="minute-hand" type="range" min="0" max="59" value="47"></label><button id="wind-clock" class="wind-clock">Wind the mechanism</button><button id="close-puzzle" class="text-button">Step away</button></div></div><div id="overlay" class="overlay"><div class="panel"><div class="eyebrow">Blackthorn Estate · A first-person escape story</div><h1>HAUNTED<br><em>HOUSE</em></h1><p>Five floors. Locked doors. A family that never left. Read what they left behind, turn the hands of time, and find your own way out.</p><button id="enter">Enter the House</button><small>WASD move · Mouse look · E interact · F flashlight · J journal</small></div></div>`;

app.insertAdjacentHTML('beforeend',`<div id="mechanism" class="puzzle hidden"><div class="puzzle-card mechanism-card"><div class="eyebrow">Blackthorn Estate</div><h2 id="mechanism-title"></h2><p id="mechanism-description"></p><div id="mechanism-controls" class="mechanism-controls"></div><p id="mechanism-status" aria-live="polite"></p><button id="close-mechanism" class="text-button">Step away</button></div></div>`);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x070b0e);
scene.fog = new THREE.FogExp2(0x0b1114, 0.025);
const camera = new THREE.PerspectiveCamera(73, innerWidth / innerHeight, 0.045, 90);
camera.position.set(0, 1.68, 17.8);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
app.prepend(renderer.domElement);
const environmentGenerator=new THREE.PMREMGenerator(renderer);
const roomEnvironment=new RoomEnvironment();
scene.environment=environmentGenerator.fromScene(roomEnvironment,.04).texture;
scene.environmentIntensity=.16;
roomEnvironment.dispose();environmentGenerator.dispose();

const texLoader = new THREE.TextureLoader();
function pbr(id, rx, ry, tint=0xffffff) {
  const base = `/assets/materials/${id}`;
  const map = texLoader.load(`${base}_color.jpg`); map.colorSpace = THREE.SRGBColorSpace;
  const normalMap = texLoader.load(`${base}_normal.jpg`);
  const roughnessMap = texLoader.load(`${base}_roughness.jpg`);
  for (const t of [map,normalMap,roughnessMap]) { t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rx,ry); t.anisotropy=4; }
  return new THREE.MeshStandardMaterial({ map, normalMap, roughnessMap, color:tint, roughness:1, side:THREE.DoubleSide });
}
const floorMat=pbr('old_wood_floor',4,8,0xb6aa94);
const wallMat=pbr('decrepit_wallpaper',3,2,0x8a8174);
const plasterMat=pbr('worn_cracked_plaster',4,3,0x777879);
const darkWood=new THREE.MeshStandardMaterial({color:0x1c1713,roughness:.83});
const trimWood=new THREE.MeshStandardMaterial({color:0x352920,roughness:.78});
const metal=new THREE.MeshStandardMaterial({color:0x50422b,metalness:.72,roughness:.43});
const black=new THREE.MeshStandardMaterial({color:0x080c0d,roughness:1});
const furnitureColliders=[];
const solidBoxes=new Set(['desk','bed frame','dining table top','travelling trunk','register pedestal']);
function addCollider(x,z,width,depth,minY,maxY,padding=.24){furnitureColliders.push({minX:x-width/2-padding,maxX:x+width/2+padding,minZ:z-depth/2-padding,maxZ:z+depth/2+padding,minY,maxY});}
function blockedByFurniture(x,z,y){return furnitureColliders.some(c=>x>c.minX&&x<c.maxX&&z>c.minZ&&z<c.maxZ&&y<c.maxY&&y+1.45>c.minY);}
function box(name,w,h,d,x,y,z,mat,shadow=true){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.name=name;m.position.set(x,y,z);m.castShadow=shadow;m.receiveShadow=true;scene.add(m);if(solidBoxes.has(name))addCollider(x,z,w,d,y-h/2,y+h/2);return m;}
function plane(w,h,x,y,z,rotY,mat){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);m.position.set(x,y,z);m.rotation.y=rotY;m.receiveShadow=true;scene.add(m);return m;}

const W=10.8,L=19.8,H=4.8;
plane(W,L,0,.01,0,0,floorMat).rotation.x=-Math.PI/2;
plane(W,L,0,H,0,0,plasterMat).rotation.x=Math.PI/2;
plane(L,H,-W/2,H/2,0,Math.PI/2,wallMat);
plane(L,H,W/2,H/2,0,-Math.PI/2,wallMat);
plane(W,H,0,H/2,-L/2,0,wallMat);
// Wainscot, crown molding, tall pilasters, and ceiling coffers establish scale.
for(const side of [-1,1]){
  const x=side*(W/2-.09);
  for(let z=-8.5;z<=8.5;z+=3.4){
    box('wall panel',.15,1.32,3.17,x,.72,z,darkWood,false);
    box('panel top rail',.22,.09,3.25,x,1.4,z,trimWood,false);
    box('panel base rail',.24,.13,3.25,x,.15,z,trimWood,false);
    box('pilaster',.34,4.25,.28,x,2.18,z+1.69,trimWood,false);
    box('pilaster capital',.48,.2,.44,x,4.2,z+1.69,metal,false);
  }
  box('crown molding',.34,.26,L,x,H-.18,0,trimWood,false);
  box('picture rail',.17,.07,L,x,3.55,0,metal,false);
}
for(let z=-7.7;z<=8.1;z+=3.4){
  box('ceiling beam',W,.22,.25,0,H-.16,z,trimWood,false);
  box('coffer',W-.75,.04,3.12,0,H-.05,z+1.55,darkWood,false);
}
for(let z of [-L/2+.12]){
  box('end wainscot',W,1.35,.18,0,.68,z,darkWood,false);
  box('end rail',W,.11,.23,0,1.42,z,trimWood,false);
  box('end crown',W,.25,.31,0,H-.18,z,trimWood,false);
}
// The old library now opens into the foyer. A side gallery branches from the foyer.
const foyer={minX:-6,maxX:6,minZ:9.9,maxZ:20.9};
const gallery={minX:6,maxX:17,minZ:12.1,maxZ:18.7};
const stoneLight=new THREE.MeshStandardMaterial({color:0x716d65,roughness:.83});
const stoneDark=new THREE.MeshStandardMaterial({color:0x222728,roughness:.9});
const tileGeometry=new THREE.BoxGeometry(.995,.055,.995);
const tileDummy=new THREE.Object3D();
for(const [material,parity] of [[stoneLight,0],[stoneDark,1]]){
  const tiles=new THREE.InstancedMesh(tileGeometry,material,66);let index=0;
  for(let x=-5.5;x<=5.5;x++)for(let z=10.4;z<=20.4;z++){
    if((Math.round(x+5.5)+Math.round(z-10.4))%2!==parity)continue;
    tileDummy.position.set(x,.032,z);tileDummy.updateMatrix();tiles.setMatrixAt(index++,tileDummy.matrix);
  }
  tiles.count=index;tiles.receiveShadow=true;scene.add(tiles);
}
box('foyer underfloor',12,.08,11,0,-.05,15.4,stoneDark,false);
box('foyer ceiling',12,.13,11,0,H,15.4,plasterMat,false);
box('gallery floor',11,.1,6.6,11.5,-.03,15.4,floorMat,false);
box('gallery ceiling',11,.13,6.6,11.5,H,15.4,plasterMat,false);
function wall(name,w,d,x,z,material=wallMat,low=0,high=H){return box(name,w,high-low,d,x,(low+high)/2,z,material,false);}
// Library portal, foyer entrance, and gallery opening are real gaps in the walls.
for(const side of [-1,1])wall('library foyer wall',4.65,.18,side*3.675,9.9);
wall('library doorway lintel',2.7,.18,0,9.9,wallMat,3.18,H);
for(const z of [11.95,18.85])wall('foyer west wall',.2,4.1,-6,z);
wall('west wing portal lintel',.2,2.8,-6,15.4,wallMat,3.2,H);
for(const side of [-1,1])wall('foyer entrance wall',4.65,.2,side*3.675,20.9);
wall('front entrance lintel',2.7,.2,0,20.9,wallMat,3.25,H);
for(const z of [12.1,18.7])wall('foyer gallery wall',.2,4.4,6,z);
wall('gallery doorway lintel',.2,2.2,6,15.4,wallMat,3.18,H);
wall('gallery north wall',11,.2,11.5,12.1);
wall('gallery south wall',11,.2,11.5,18.7);
wall('gallery east wall',.2,6.6,17,15.4);
const portals=[[0,9.9,2.7],[0,20.9,2.7]];
for(const [x,z,width] of portals){
  for(const side of [-1,1])box('carved door post',.22,3.42,.28,x+side*width/2,1.71,z,trimWood,false);
  box('carved door head',width+.42,.21,.3,x,3.35,z,trimWood,false);
  box('door head brass detail',width+.18,.035,.34,x,3.48,z,metal,false);
}
for(const z of [14.2,16.6])box('gallery portal post',.3,3.42,.22,6,1.71,z,trimWood,false);
box('gallery portal head',.35,.22,2.7,6,3.35,15.4,trimWood,false);
// Wainscot and trim make the new rooms belong to the same estate as the library.
for(const x of [-5.88,5.88]){
  if(x>0){for(const z of [12.05,18.75])box('foyer panel',.18,1.38,4.1,x,.72,z,darkWood,false);}
  else for(const z of [11.95,18.85])box('foyer panel',.18,1.38,4.1,x,.72,z,darkWood,false);
  box('foyer crown',.32,.23,10.7,x,H-.18,15.4,trimWood,false);
}
for(const z of [10.02,20.78]){
  for(const x of [-3.7,3.7])box('foyer end panel',4.35,1.36,.17,x,.72,z,darkWood,false);
  box('foyer end crown',11.6,.22,.28,0,H-.18,z,trimWood,false);
}
for(const z of [12.23,18.57]){
  box('gallery wainscot',10.6,1.45,.18,11.5,.75,z,darkWood,false);
  box('gallery chair rail',10.6,.09,.24,11.5,1.51,z,metal,false);
  box('gallery crown',10.8,.22,.26,11.5,H-.17,z,trimWood,false);
}
for(const x of [8,10.8,13.6,16.4]){
  box('foyer coffer beam',.12,.16,10.6,x-11.5,H-.11,15.4,trimWood,false);
}
for(const z of [11.3,13.9,16.5,19.1])box('foyer ceiling beam',11.4,.19,.17,0,H-.15,z,trimWood,false);
// A cold blue bay creates a strong visual destination at the far end.
const skyCanvas=document.createElement('canvas');skyCanvas.width=512;skyCanvas.height=512;
const skyCtx=skyCanvas.getContext('2d');
const skyGradient=skyCtx.createLinearGradient(0,0,0,512);skyGradient.addColorStop(0,'#213441');skyGradient.addColorStop(.58,'#50616a');skyGradient.addColorStop(1,'#131d22');skyCtx.fillStyle=skyGradient;skyCtx.fillRect(0,0,512,512);
skyCtx.fillStyle='#c4cbd0';skyCtx.shadowColor='#d8e9f6';skyCtx.shadowBlur=50;skyCtx.beginPath();skyCtx.arc(358,106,36,0,Math.PI*2);skyCtx.fill();skyCtx.shadowBlur=0;
skyCtx.strokeStyle='#111a1d';skyCtx.lineCap='round';
function branch(x,y,angle,length,width,depth){if(depth<=0)return;const x2=x+Math.cos(angle)*length,y2=y+Math.sin(angle)*length;skyCtx.lineWidth=width;skyCtx.beginPath();skyCtx.moveTo(x,y);skyCtx.lineTo(x2,y2);skyCtx.stroke();branch(x2,y2,angle-.47,length*.72,width*.68,depth-1);branch(x2,y2,angle+.38,length*.68,width*.64,depth-1);}
branch(8,512,-1.14,220,18,6);branch(510,512,-2.0,190,17,6);
const skyTexture=new THREE.CanvasTexture(skyCanvas);skyTexture.colorSpace=THREE.SRGBColorSpace;
const windowGlow=new THREE.MeshBasicMaterial({map:skyTexture});
box('window recess',3.16,3.12,.07,0,2.72,-L/2+.19,black,false);
box('moonlit glass',2.74,2.78,.015,0,2.7,-L/2+.25,windowGlow,false);
for(const x of [-1.5,0,1.5]) box('window mullion',.11,3.1,.15,x,2.7,-L/2+.32,trimWood,false);
for(const y of [1.3,2.7,4.1]) box('window muntin',3.1,.09,.14,0,y,-L/2+.32,trimWood,false);
const curtains=new THREE.MeshStandardMaterial({color:0x221a1b,roughness:1,side:THREE.DoubleSide});
for(const x of [-1.75,1.75]) box('velvet drape',.66,3.5,.28,x,2.7,-L/2+.55,curtains,false);
box('curtain rod',4.4,.08,.12,0,4.57,-L/2+.46,metal,false);
for(const z of [12.8,18]){
  const pane=box('foyer moonlit window',.035,2.3,1.2,-5.72,2.76,z,windowGlow,false);
  pane.rotation.y=0;
  for(const dz of [-.66,.66])box('foyer window frame',.18,2.55,.12,-5.65,2.76,z+dz,trimWood,false);
  box('foyer window sill',.28,.12,1.52,-5.58,1.53,z,stoneLight,false);
  box('foyer window head',.24,.16,1.52,-5.58,4,z,trimWood,false);
  box('foyer window cross',.13,.08,1.4,-5.55,2.78,z,trimWood,false);
}

scene.add(new THREE.HemisphereLight(0x728697,0x21170f,.65));
const moon=new THREE.SpotLight(0xa6cce0,54,19,Math.PI/4.6,.65,1.1);
moon.position.set(0,3.2,-9.3);moon.target.position.set(0,1,-3);moon.castShadow=true;moon.shadow.mapSize.set(1024,1024);moon.shadow.bias=-.0002;moon.shadow.normalBias=.025;scene.add(moon,moon.target);
const lamps=[];
for (const [x,z,intensity] of [[0,-3.8,45],[0,3.4,32],[0,15.3,48],[11.5,15.4,31]]){
  const lamp=new THREE.PointLight(0xffbb74,intensity,8,1.8);lamp.position.set(x,3.7,z);scene.add(lamp);
  lamps.push({lamp,intensity});
}
const foyerMoon=new THREE.SpotLight(0x8ab8d4,43,14,Math.PI/4,.75,1.3);
foyerMoon.position.set(-5.5,3.5,15.4);foyerMoon.target.position.set(1,.6,15.4);scene.add(foyerMoon,foyerMoon.target);
const galleryAccent=new THREE.PointLight(0xffa765,18,9,2);galleryAccent.position.set(16,2.5,15.4);scene.add(galleryAccent);
const flashlight=new THREE.SpotLight(0xe5f2ff,42,15,Math.PI/8,.5,1.5);
flashlight.castShadow=true;flashlight.shadow.mapSize.set(1024,1024);flashlight.shadow.bias=-.0005;flashlight.shadow.normalBias=.018;
flashlight.position.set(.12,-.06,.12);flashlight.target.position.set(.12,-.06,-7);
camera.add(flashlight,flashlight.target);scene.add(camera);
const fillLight=new THREE.PointLight(0xc6d6da,1.6,2.4);fillLight.position.set(0,-.15,0);camera.add(fillLight);

// Floor clutter and architectural detail use inexpensive geometry; key props are real PBR glTFs.
for (let i=0;i<24;i++){
  const z=-8.4+i*.73;
  const x=(i%2?1:-1)*(3.3+(i%3)*.17);
  const book=box('fallen book',.26,.05,.34,x,.05,z,new THREE.MeshStandardMaterial({color:[0x383026,0x45372f,0x302b28,0x48443c][i%4],roughness:.9}));
  book.rotation.y=i*1.92;
}
for(const z of [-6.7,.15,6.7]){
  const rug=new THREE.Mesh(new THREE.PlaneGeometry(3.4,2.5),new THREE.MeshStandardMaterial({color:0x281b1a,roughness:1,side:THREE.DoubleSide}));
  rug.rotation.x=-Math.PI/2;rug.position.set(0,.027,z);rug.receiveShadow=true;scene.add(rug);
  for(const dx of [-1.57,1.57]) box('rug border',.03,.008,2.33,dx,.034,z,metal,false);
  for(const dz of [-1.12,1.12]) box('rug border',3.16,.008,.03,0,.034,z+dz,metal,false);
}

const gltfLoader=new GLTFLoader();
const propAssets=new Map();
async function loadProp(id,x,y,z,targetHeight,rotation=0){
  try{
    if(!propAssets.has(id))propAssets.set(id,gltfLoader.loadAsync(`/assets/models/${id}/${id}_1k.gltf`));
    const gltf=await propAssets.get(id);
    const model=gltf.scene.clone(true);
    const bounds=new THREE.Box3().setFromObject(model);
    const size=bounds.getSize(new THREE.Vector3());
    model.scale.setScalar(targetHeight/size.y);
    model.rotation.y=rotation;
    const scaledBounds=new THREE.Box3().setFromObject(model);
    const center=scaledBounds.getCenter(new THREE.Vector3());
    model.position.set(x-center.x,y-scaledBounds.min.y,z-center.z);
    model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
    scene.add(model);
    if(['wooden_bookshelf_worn','gothic_coffee_table','GothicCabinet_01','ornate_mirror_01'].includes(id)){
      const footprint=new THREE.Box3().setFromObject(model);
      const footprintSize=footprint.getSize(new THREE.Vector3());
      const footprintCenter=footprint.getCenter(new THREE.Vector3());
      addCollider(footprintCenter.x,footprintCenter.z,footprintSize.x,footprintSize.z,footprint.min.y,footprint.max.y,.18);
    }
    return model;
  }catch(error){console.warn(`Could not load ${id}`,error);}
}
const props=[];
for (const x of [-4.25,4.25]) for(const z of [-6.8,-3.7,-.6,2.5,5.6]) props.push(loadProp('wooden_bookshelf_worn',x,0,z,3.55,x<0?Math.PI/2:-Math.PI/2));
props.push(loadProp('gothic_coffee_table',0,0,-3.5,.9));
props.push(loadProp('gothic_coffee_table',2.25,0,4.9,.6,.3));
props.push(loadProp('ornate_mirror_01',4.68,1.35,-5.2,1.9,-Math.PI/2));
props.push(loadProp('Chandelier_01',0,3.78,-3.8,.92));
props.push(loadProp('Chandelier_01',0,3.78,3.4,.92));
props.push(loadProp('Chandelier_01',0,3.72,15.4,1.15));
props.push(loadProp('Chandelier_01',11.5,3.85,15.4,.74));
props.push(loadProp('GothicCabinet_01',-5.25,0,19.5,2.7,Math.PI/2));
props.push(loadProp('ornate_mirror_01',-5.75,1.45,10.9,1.7,Math.PI/2));
Promise.allSettled(props).then(()=>console.info('Room props loaded'));

// The first escape route connects the diary, clock, family portraits, and front door.
const interactTargets=[];
function interactive(mesh,id){mesh.userData.interactId=id;interactTargets.push(mesh);return mesh;}
const portraitOrder=['Edmund','Eleanor','Clara','Thomas','The Family'];
const portraitFrames=[];
function addPortrait(name,x,z,rotation,width=1.15,height=1.55){
  const group=new THREE.Group();group.position.set(x,2.7,z);group.rotation.y=rotation;scene.add(group);
  const frame=new THREE.Mesh(new THREE.BoxGeometry(width+.2,height+.2,.1),trimWood);frame.castShadow=true;group.add(frame);
  const gilding=new THREE.Mesh(new THREE.BoxGeometry(width+.12,height+.12,.115),metal);gilding.position.z=.012;group.add(gilding);
  const inner=new THREE.Mesh(new THREE.BoxGeometry(width+.025,height+.025,.13),darkWood);inner.position.z=.022;group.add(inner);
  const canvas=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshStandardMaterial({color:0x8d8270,roughness:.94,side:THREE.DoubleSide}));
  canvas.position.z=.096;group.add(canvas);interactive(canvas,`portrait:${name}`);
  portraitFrames.push({name,gilding,canvas});
  return canvas;
}
addPortrait('Edmund',8.65,12.26,0);
addPortrait('Eleanor',11.55,12.26,0);
addPortrait('Clara',9.5,18.54,Math.PI);
addPortrait('Thomas',12.6,18.54,Math.PI);
addPortrait('The Family',16.8,15.4,-Math.PI/2,2.05,1.57);
const familyImage=texLoader.load('/assets/blackthorn-family.png',imageTexture=>{
  const image=imageTexture.image;
  const crops={Edmund:[.36,.015,.29,.42],Eleanor:[.58,.23,.25,.59],Clara:[.31,.39,.29,.6],Thomas:[.11,.23,.27,.68],'The Family':[0,0,1,1]};
  for(const portrait of portraitFrames){
    const [sx,sy,sw,sh]=crops[portrait.name];
    const canvas=document.createElement('canvas');canvas.width=portrait.name==='The Family'?1024:512;canvas.height=768;
    canvas.getContext('2d').drawImage(image,sx*image.width,sy*image.height,sw*image.width,sh*image.height,0,0,canvas.width,canvas.height);
    const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;
    portrait.canvas.material.map=map;portrait.canvas.material.color.set(0xffffff);portrait.canvas.material.needsUpdate=true;
  }
});
const record=interactive(box('family register',.66,.045,.49,7.24,.898,15.4,new THREE.MeshStandardMaterial({color:0x7c6b55,roughness:1}),false),'record');
box('register pedestal',.82,.86,.62,7.24,.44,15.4,darkWood);
interactive(box('register pages',.59,.008,.43,7.24,.925,15.4,new THREE.MeshStandardMaterial({color:0xc5b99c,roughness:1}),false),'record');
for(const x of [10.12,13.55,15.35]){
  box('gallery sconce back',.25,.56,.12,x,2.95,12.32,metal,false);
  const candle=box('gallery candle',.075,.28,.075,x,3.03,12.48,new THREE.MeshStandardMaterial({color:0xd6c6aa,roughness:.9}),false);
  const flame=new THREE.PointLight(0xff9c4c,2.4,2.3,2);flame.position.set(x,3.22,12.55);scene.add(flame);
}
box('foyer runner',2.6,.018,6.8,0,.068,15.2,new THREE.MeshStandardMaterial({color:0x342021,roughness:1}),false);
for(const x of [-1.22,1.22])box('foyer runner trim',.035,.022,6.65,x,.079,15.2,metal,false);
const diary=interactive(box('Blackthorn diary',.38,.055,.52,0,.929,-3.5,new THREE.MeshStandardMaterial({color:0x594234,roughness:.92}),false),'diary');
interactive(box('diary pages',.32,.008,.46,0,.96,-3.5,new THREE.MeshStandardMaterial({color:0xb0a48a,roughness:1}),false),'diary');
const grandfather=createGrandfatherClock(scene,floorMat,metal,interactive);
addCollider(-2.55,-8.8,1.14,.7,0,3.5,.18);
const frontZ=20.68;
const door=interactive(box('front door',1.96,3.15,.18,0,1.6,frontZ,new THREE.MeshStandardMaterial({color:0x2b211b,roughness:.73})),'door');
for(const side of [-1,1])box('door frame',.18,3.45,.34,side*1.05,1.74,frontZ,trimWood,false);
box('door lintel',2.3,.18,.34,0,3.47,frontZ,trimWood,false);
const doorHandle=box('door handle',.16,.055,.09,.57,1.54,frontZ-.13,metal,false);
const doorLock=new THREE.Mesh(new THREE.TorusGeometry(.09,.019,8,20),metal);doorLock.position.set(.58,1.36,frontZ-.13);scene.add(doorLock);
const seal=new THREE.Mesh(new THREE.TorusGeometry(.48,.035,10,48),new THREE.MeshStandardMaterial({color:0x55b8cf,emissive:0x1a6574,emissiveIntensity:1.7,metalness:.3,roughness:.36}));seal.position.set(0,2.3,frontZ-.12);scene.add(seal);

const doorPivot=new THREE.Group();doorPivot.position.set(-.98,0,frontZ);scene.add(doorPivot);doorPivot.attach(door);doorPivot.attach(doorHandle);doorPivot.attach(doorLock);
const extraSeals=[.35,.22].map(radius=>{const ring=new THREE.Mesh(new THREE.TorusGeometry(radius,.022,10,48),seal.material);ring.position.copy(seal.position);scene.add(ring);return ring;});
let doorOpening=false,doorOpened=0;
// A spectral presence remains a house threat, not a camera objective.
const ghostTexture=texLoader.load('/assets/ghost.png');ghostTexture.colorSpace=THREE.SRGBColorSpace;
const ghostMat=new THREE.MeshBasicMaterial({map:ghostTexture,transparent:true,depthWrite:false,opacity:0,side:THREE.DoubleSide,color:0xc5e7ec});
const spirit=new THREE.Mesh(new THREE.PlaneGeometry(1.5,2.45),ghostMat);spirit.position.set(1.2,1.42,-6.25);scene.add(spirit);
let playing=false,lookYaw=0,lookPitch=0,flashlightOn=true,runTime=0,stepPhase=0;
let audioContext,drone;
function startSound(){
  if(!audioContext){
    audioContext=new AudioContext();
    drone=audioContext.createOscillator();drone.type='sine';drone.frequency.value=54;
    const droneGain=audioContext.createGain();droneGain.gain.value=.032;
    const lowpass=audioContext.createBiquadFilter();lowpass.type='lowpass';lowpass.frequency.value=180;
    drone.connect(lowpass).connect(droneGain).connect(audioContext.destination);drone.start();
  }
  audioContext.resume();
}
function tone(frequency,duration,volume,type='sine'){
  if(!audioContext)return;
  const oscillator=audioContext.createOscillator(),gain=audioContext.createGain();
  oscillator.type=type;oscillator.frequency.setValueAtTime(frequency,audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(25,frequency*.45),audioContext.currentTime+duration);
  gain.gain.setValueAtTime(volume,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,audioContext.currentTime+duration);
  oscillator.connect(gain).connect(audioContext.destination);oscillator.start();oscillator.stop(audioContext.currentTime+duration);
}
const keys=new Set();
const overlay=document.querySelector('#overlay');
const crosshair=document.querySelector('#crosshair');
const toast=document.querySelector('#toast');
const journal=document.querySelector('#journal');
const puzzle=document.querySelector('#puzzle');
const mechanismPanel=document.querySelector('#mechanism');
const profile={base:45,seconds:3600,activity:1.2};
let houseMinutes=0,haunting=profile.base,hasReadDiary=false,clockSolved=false,hasKey=false,hasReadRecord=false,portraitProgress=0,sealReleased=false,escaped=false,modal=null,started=false,thirteenthTriggered=false,nearGhostCooldown=0,ghostGraceUntil=0,currentTarget=null,groundY=0,stamina=100,failed=false,captures=0;
const documents=new Map();
let clockHours=11,clockMinutes=47,escapeText='';
const hint=document.querySelector('#interact-hint');
const SAVE_KEY='haunted-house-run-v1';
function saveGame(){
  if(!started||escaped||failed)return;
  try{sessionStorage.setItem(SAVE_KEY,JSON.stringify({houseMinutes,haunting,hasReadDiary,clockSolved,hasKey,hasReadRecord,portraitProgress,sealReleased,clockHours,clockMinutes,documents:[...documents],position:camera.position.toArray(),groundY,lookYaw,lookPitch,stamina,captures,flashlightOn,mansion:mansion.snapshot()}));}catch{}
}
function restoreGame(){
  let state;try{state=JSON.parse(sessionStorage.getItem(SAVE_KEY));}catch{return false;}
  if(!state||!Array.isArray(state.position)||state.position.length!==3)return false;
  houseMinutes=state.houseMinutes??0;haunting=state.haunting??profile.base;
  hasReadDiary=Boolean(state.hasReadDiary);clockSolved=Boolean(state.clockSolved);hasKey=Boolean(state.hasKey);hasReadRecord=Boolean(state.hasReadRecord);
  portraitProgress=state.portraitProgress??0;sealReleased=Boolean(state.sealReleased);
  clockHours=state.clockHours??11;clockMinutes=state.clockMinutes??47;setInspectionTime();
  if(clockSolved)grandfather.unlock();if(hasKey)grandfather.take();
  documents.clear();for(const entry of state.documents??[])if(Array.isArray(entry)&&entry.length===2)documents.set(entry[0],entry[1]);
  if(documents.size)document.querySelector('#journal-text').innerHTML=[...documents].map(([title,text])=>`<strong>${title}</strong><br>${text}`).join('<br><br>');
  camera.position.fromArray(state.position);groundY=state.groundY??0;lookYaw=state.lookYaw??0;lookPitch=state.lookPitch??0;
  // Older saves may place the player inside the former basement or attic flights.
  if(camera.position.x>-11.25&&camera.position.x<-8.15&&camera.position.z>11.45&&camera.position.z<19.55){
    if(groundY<-.6){groundY=-5.2;camera.position.set(-12.7,groundY+1.68,20.1);}
    else if(groundY>10.4+.6&&groundY<15.6-.6){groundY=groundY>13?15.6:10.4;camera.position.set(-12.7,groundY+1.68,20.1);}
  }
  camera.rotation.set(lookPitch,lookYaw,0,'YXZ');stamina=state.stamina??100;captures=state.captures??0;
  flashlightOn=state.flashlightOn!==false;flashlight.visible=flashlightOn;document.querySelector('#lightstatus').textContent=flashlightOn?'ON':'OFF';
  mansion.restore(state.mansion);if(sealReleased){seal.visible=false;mansion.setPortraitSolved();}
  for(let i=0;i<Math.min(portraitProgress,portraitFrames.length);i++)portraitFrames[i].gilding.material=new THREE.MeshStandardMaterial({color:0xb28d42,emissive:0x714a10,emissiveIntensity:.9,metalness:.75,roughness:.28});
  thirteenthTriggered=houseMinutes>=193;ghostGraceUntil=runTime+15;ghostAwake=false;updateHud();updateObjective();return true;
}
function showToast(message){toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2400);}
function timeLabel(minutes){const total=Math.min(Math.floor(minutes),360);const hour=Math.floor(total/60);return `${hour===0?12:hour}:${String(total%60).padStart(2,'0')} AM`;}
function updateObjective(){document.querySelector('#objective').textContent=escaped?'You escaped Blackthorn Estate':!hasReadDiary?'Search the library for a clue':!clockSolved?'Set the grandfather clock':!hasKey?'Take the brass key':!hasReadRecord?'Read the family register':!sealReleased?'Arrange the family portraits':mansion.progressHint();document.querySelector('#inventory').textContent=[...(hasKey?['Front door key']:[]),...mansion.inventory()].join(' · ')||'EMPTY';}
function updateHud(){document.querySelector('#house-time').textContent=timeLabel(houseMinutes);document.querySelector('#haunt-value').textContent=`${Math.round(haunting)}%`;document.querySelector('#haunt-fill').style.width=`${haunting}%`;document.querySelector('#phase').textContent=houseMinutes>=360?'AFTER DAWN':houseMinutes>=193&&houseMinutes<218?'THE THIRTEENTH HOUR':houseMinutes>=270?'THE HOUSE AWAKENS':houseMinutes>=60?'RESTLESS':'THE AWAKENING';const wing=camera.position.x<-5.6||Math.abs(groundY)>.6||camera.position.x<-3&&camera.position.z>20.9;document.querySelector('.chapter').textContent=`Blackthorn Estate · ${wing?mansion.roomName(camera.position.x,groundY,camera.position.z):camera.position.x>5.7?'Portrait Hall':camera.position.z>9.75?'The Foyer':'The Library'}`;}
function changeHaunting(amount){haunting=THREE.MathUtils.clamp(haunting+amount,0,100);updateHud();}
function reset(){
  houseMinutes=0;hasReadDiary=false;clockSolved=false;hasKey=false;hasReadRecord=false;portraitProgress=0;sealReleased=false;escaped=false;failed=false;captures=0;thirteenthTriggered=false;nearGhostCooldown=0;ghostGraceUntil=0;haunting=profile.base;groundY=0;stamina=100;documents.clear();keys.clear();grandfather.reset();mansion.reset();clockHours=11;clockMinutes=47;doorOpening=false;doorOpened=0;doorPivot.rotation.y=0;door.visible=true;seal.visible=true;ghostAwake=false;patrolIndex=0;chaseMemory=0;ghostGround=0;spirit.position.set(1.8,1.42,-6);flashlightOn=true;flashlight.visible=true;document.querySelector('#lightstatus').textContent='ON';
  for(const portrait of portraitFrames)portrait.gilding.material=metal;
  camera.position.set(0,1.68,17.8);camera.rotation.set(0,0,0);lookYaw=lookPitch=0;
  document.querySelector('.panel h1').innerHTML='HAUNTED<br><em>HOUSE</em>';document.querySelector('.panel p').textContent='Explore the estate. Read its clues. Find a way out before dawn.';
  document.querySelector('#journal-text').textContent='The front door is sealed. The library lies ahead; the main staircase is through the west arch.';updateHud();updateObjective();
}
function readDocument(title,text){documents.set(title,text);document.querySelector('#journal-text').innerHTML=[...documents].map(([title,text])=>`<strong>${title}</strong><br>${text}`).join('<br><br>');saveGame();openModal('journal');}
function finishEscape(text){escaped=true;escapeText=text;sessionStorage.removeItem(SAVE_KEY);tone(740,1,.1);updateObjective();document.exitPointerLock();}

function lock(){
  if(!started){reset();started=true;restoreGame();}
  else if(escaped||failed){sessionStorage.removeItem(SAVE_KEY);reset();started=true;}
  modal=null;journal.classList.add('hidden');puzzle.classList.add('hidden');mechanismPanel.classList.add('hidden');
  startSound();renderer.domElement.requestPointerLock();
}
document.querySelector('#enter').addEventListener('click',lock);
document.addEventListener('pointerlockchange',()=>{
  playing=document.pointerLockElement===renderer.domElement;keys.clear();if(!playing)saveGame();
  overlay.classList.toggle('hidden',playing||modal!==null);
  if(!playing&&escaped){document.querySelector('.panel h1').innerHTML='YOU<br><em>ESCAPED</em>';document.querySelector('.panel p').textContent=`${escapeText} You escaped at ${timeLabel(houseMinutes)}.`;document.querySelector('#enter').textContent='Play again';}
  else if(!playing&&failed){document.querySelector('.panel h1').innerHTML='THE HOUSE<br><em>KEPT YOU</em>';document.querySelector('.panel p').textContent='Your clues remain a memory. Start a new night and find another way.';document.querySelector('#enter').textContent='Try another night';}
  else if(!playing&&!modal&&started){document.querySelector('#enter').textContent='Return to the House';}
});
document.addEventListener('mousemove',e=>{if(!playing)return;lookYaw-=e.movementX*.0022;lookPitch=Math.max(-1.24,Math.min(1.24,lookPitch-e.movementY*.0022));camera.rotation.set(lookPitch,lookYaw,0,'YXZ');});
document.addEventListener('keydown',e=>{keys.add(e.code);if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.repeat)return;if(e.code==='KeyF'&&playing){flashlightOn=!flashlightOn;flashlight.visible=flashlightOn;document.querySelector('#lightstatus').textContent=flashlightOn?'ON':'OFF';tone(flashlightOn?400:200,.06,.05);}if(e.code==='KeyE'&&playing)interact();if(e.code==='KeyJ'&&playing)openModal('journal');if(e.code==='Escape'&&modal)closeModal();});
document.addEventListener('keyup',e=>keys.delete(e.code));
const raycaster=new THREE.Raycaster();
function openModal(name){modal=name;document.exitPointerLock();overlay.classList.add('hidden');({journal,puzzle,mechanism:mechanismPanel})[name].classList.remove('hidden');}
function closeModal(){journal.classList.add('hidden');puzzle.classList.add('hidden');mechanismPanel.classList.add('hidden');modal=null;lock();}
document.querySelector('#close-journal').addEventListener('click',closeModal);
document.querySelector('#close-puzzle').addEventListener('click',closeModal);
document.querySelector('#close-mechanism').addEventListener('click',closeModal);
function showMechanism(title,description,controls,status=''){
  document.querySelector('#mechanism-title').textContent=title;document.querySelector('#mechanism-description').textContent=description;document.querySelector('#mechanism-status').textContent=status;
  const container=document.querySelector('#mechanism-controls');container.replaceChildren();
  for(const [label,action]of controls){const button=document.createElement('button');button.textContent=label;button.onclick=()=>{document.querySelector('#mechanism-status').textContent=action();updateObjective();saveGame();};container.append(button);}
  openModal('mechanism');
}

document.querySelector('#clock-inspection').style.backgroundImage=`url(${grandfather.dialURL})`;
function setInspectionTime(){
  document.querySelector('#clock-reading').textContent=`${String(clockHours||12).padStart(2,'0')}:${String(clockMinutes).padStart(2,'0')}`;
  document.querySelector('#inspect-hour').style.transform=`rotate(${clockHours*30+clockMinutes*.5}deg)`;
  document.querySelector('#inspect-minute').style.transform=`rotate(${clockMinutes*6}deg)`;
  document.querySelector('#minute-hand').value=clockMinutes;grandfather.setTime(clockHours,clockMinutes);
}
document.querySelector('#hour-down').onclick=()=>{clockHours=(clockHours+11)%12;setInspectionTime();tone(180,.035,.025);};
document.querySelector('#hour-up').onclick=()=>{clockHours=(clockHours+1)%12;setInspectionTime();tone(180,.035,.025);};
document.querySelector('#minute-hand').oninput=e=>{clockMinutes=Number(e.target.value);setInspectionTime();};
document.querySelector('#clock-inspection').onclick=e=>{const r=e.currentTarget.getBoundingClientRect();clockMinutes=Math.round((Math.atan2(e.clientX-r.left-r.width/2,-(e.clientY-r.top-r.height/2))+Math.PI*2)/(Math.PI*2)*60)%60;setInspectionTime();};
document.querySelector('#wind-clock').onclick=()=>{
  if(clockHours===3&&clockMinutes===13){clockSolved=true;grandfather.unlock();ghostGraceUntil=Math.max(ghostGraceUntil,runTime+25);for(let i=0;i<3;i++)setTimeout(()=>tone(330+i*85,1.1,.08),i*420);showToast('A latch clicks. The drawer opens. Something stirs deeper in the house.');}
  else{changeHaunting(8);tone(100,.6,.08,'triangle');showToast('The spring tightens, but the latch holds. Check the diary.');}
  updateObjective();saveGame();closeModal();
};
setInspectionTime();

function findTarget(){
  camera.updateMatrixWorld();raycaster.setFromCamera({x:0,y:0},camera);raycaster.far=3.1;
  const hits=raycaster.intersectObjects(interactTargets,false);
  for(const hit of hits){
    const id=hit.object.userData.interactId;
    if((id==='key'&&!grandfather.keyReachable)||!mansion.canTarget(id))continue;
    // Solid architectural meshes block use through walls, but small furniture details do not.
    const blocker=raycaster.intersectObjects(scene.children,false).find(h=>
      h.object.visible&&h.object!==hit.object&&h.object.userData.interactId!==id&&
      h.distance<hit.distance-.04&&!h.object.material?.transparent&&
      /wall|door|ceiling|floor|landing/i.test(h.object.name)
    );
    if(!blocker)return id;
  }
  return null;
}

function interact(){
  const target=findTarget();if(!target)return;
  if(mansion.interact(target)){updateObjective();saveGame();return;}
  if(target==='diary'){hasReadDiary=true;updateObjective();readDocument('Edmund’s final entry','“Thirteen minutes after the third bell, the house fell silent. I stopped the hands at that moment. Wind the clock at that hour and the latch beneath the pendulum will release. The front-door key rests in its felt-lined drawer.”');}
  if(target==='clock'){if(!clockSolved){setInspectionTime();openModal('puzzle');}else if(grandfather.keyReachable){hasKey=true;grandfather.take();ghostGraceUntil=Math.max(ghostGraceUntil,runTime+15);tone(520,.35,.06);showToast('You lift the brass front-door key from its velvet lining.');updateObjective();}else showToast(hasKey?'The clock drawer is empty.':'The drawer beneath the pendulum is sliding open.');}
  if(target==='key'&&grandfather.keyReachable){hasKey=true;grandfather.take();ghostGraceUntil=Math.max(ghostGraceUntil,runTime+15);tone(520,.35,.06);showToast('You lift the brass front-door key from its velvet lining.');updateObjective();}
  if(target==='record'){hasReadRecord=true;updateObjective();readDocument('Blackthorn family register','Edmund inherited the estate in 1902. Eleanor joined him in 1905. Clara was born in 1908; Thomas in 1912. The last family portrait was painted in 1926. Touch the frames in that order to release the family seal and the estate office door.');}
  if(target.startsWith('portrait:')){
    const name=target.slice(9);
    if(!hasReadRecord){showToast('The portraits are fixed in place. A register nearby might explain them.');return;}
    if(sealReleased){showToast('The gallery has fallen silent. The door seal is broken.');return;}
    if(name===portraitOrder[portraitProgress]){
      portraitFrames[portraitProgress].gilding.material=new THREE.MeshStandardMaterial({color:0xb28d42,emissive:0x714a10,emissiveIntensity:.9,metalness:.75,roughness:.28});
      portraitProgress++;tone(330+portraitProgress*90,.34,.08);
      if(portraitProgress===portraitOrder.length){sealReleased=true;seal.visible=false;mansion.setPortraitSolved();showToast('The final portrait moves. The seal on the front door shatters.');}
      else showToast(`${name} · ${portraitProgress} of ${portraitOrder.length} remembered`);
    }else{portraitProgress=0;for(const portrait of portraitFrames)portrait.gilding.material=metal;changeHaunting(8*profile.activity);tone(100,.5,.12,'sawtooth');showToast('The portraits turn away. The sequence begins again.');}
    updateObjective();
  }
  if(target==='door'){if(!hasKey){showToast('Locked. Find the brass key in the library.');changeHaunting(1);}else if(!sealReleased){showToast('The key turns, but a blue seal holds the door. Search the portrait hall.');}else if(!mansion.frontDoorReady()){showToast('Two family seals remain: the nursery and the archive.');}else{doorOpening=true;showToast('The lock turns. The door gives way.');tone(120,.7,.08);}}
  saveGame();
}
document.addEventListener('mousedown',e=>{if(e.button===0&&playing)interact();});
function walkable(x,z){
  const library=x>-4.85&&x<4.85&&z>-9.05&&z<9.74;
  const libraryPortal=Math.abs(x)<1.18&&z>=9.74&&z<10.08;
  const foyer=x>-5.65&&x<5.65&&z>=10.08&&z<20.45;
  const galleryPortal=x>=5.65&&x<6.25&&z>14.32&&z<16.48;
  const galleryRoom=x>=6.25&&x<16.55&&z>12.47&&z<18.33;
  return library||libraryPortal||foyer||galleryPortal||galleryRoom;
}
const wingWood=floorMat.clone();wingWood.color.set(0x675340);wingWood.roughness=.65;
const mansion=createMansion({scene,box,addCollider,materials:{wood:wingWood,wall:wallMat,floor:floorMat,metal,dark:darkWood,glass:windowGlow},interactive,loadProp,notify:showToast,read:readDocument,tone,escape:finishEscape,mechanism:showMechanism});
function surfaceAt(x,z,ignoreFurniture=false){if(!ignoreFurniture&&blockedByFurniture(x,z,groundY))return null;if(Math.abs(groundY)<.6&&walkable(x,z))return 0;return mansion.surfaceAt(x,z,groundY);}
function collide(x,z){
  const oldX=camera.position.x,oldZ=camera.position.z;
  const recovering=blockedByFurniture(oldX,oldZ,groundY);
  for(const [nx,nz]of [[x,z],[x,oldZ],[oldX,z]]){const height=surfaceAt(nx,nz,recovering);if(height!==null){groundY=height;return [nx,nz];}}
  return [oldX,oldZ];
}
let lastTick=0,lastStep=0,lastSave=0,patrolIndex=0,ghostAwake=false,chaseMemory=0,ghostGround=0;
const patrol=[[1.8,-6],[1.8,5],[0,9],[0,15.4],[11,15.4],[0,15.4],[-7,15.4],[-7,20],[-9.7,20],[-9.7,11.2],[-7,11.2],[-7,20],[-9.7,20],[-9.7,11.2],[-7,11.2],[-7,20],[-7,11.2],[-9.7,11.2],[-9.7,20],[-7,20],[-7,11.2],[-9.7,11.2],[-9.7,20],[-7,20],[-7,15.4],[0,15.4],[0,9],[1.8,5]];
const sightRay=new THREE.Raycaster();

const timer=new THREE.Timer();timer.connect(document);
renderer.setAnimationLoop(()=>{
  timer.update();const dt=Math.min(Math.max(timer.getDelta(),0),.1);runTime+=dt;
  if(playing&&!doorOpening){
    houseMinutes=Math.min(360,houseMinutes+dt*360/profile.seconds);
    if(houseMinutes>=193&&!thirteenthTriggered){thirteenthTriggered=true;changeHaunting(18*profile.activity);showToast('3:13 AM · The Thirteenth Hour');tone(76,1.2,.16,'sawtooth');}
    let f=Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown'));
    let s=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));
    const len=Math.hypot(f,s)||1;f/=len;s/=len;
    const crouching=keys.has('KeyC');
    const running=keys.has('ShiftLeft')&&stamina>8&&!crouching;
    const speed=crouching?1.15:running?4.1:2.35;
    stamina=THREE.MathUtils.clamp(stamina+dt*(running&&Math.abs(f)+Math.abs(s)>0?-19:12),0,100);
    const dx=(Math.sin(lookYaw)*-f+Math.cos(lookYaw)*s)*speed*dt;
    const dz=(-Math.cos(lookYaw)*f-Math.sin(lookYaw)*s)*speed*dt;
    const [x,z]=collide(camera.position.x+dx,camera.position.z+dz);
    camera.position.x=x;camera.position.z=z;
    const walking=Math.abs(f)+Math.abs(s)>0;
    if(walking)stepPhase+=dt*(keys.has('ShiftLeft')?11:7);
    camera.position.y=THREE.MathUtils.damp(camera.position.y,groundY+(crouching?1.08:1.68)+(walking?Math.sin(stepPhase)*.018:0),14,dt);
    if(walking&&runTime-lastStep>(running?.32:crouching?.72:.52)){lastStep=runTime;tone(groundY<0?90:125,.07,crouching?.008:.022,'triangle');}
    ghostAwake=(clockSolved||mansion.awakened())&&runTime>=ghostGraceUntil;
    if(houseMinutes>=360&&!failed){failed=true;sessionStorage.removeItem(SAVE_KEY);document.exitPointerLock();}
    const timeFloor=profile.base+houseMinutes/360*Math.min(30,100-profile.base);
    haunting=THREE.MathUtils.clamp(haunting+dt*(keys.has('ShiftLeft')&&walking?.42*profile.activity:-.065),timeFloor,100);
    nearGhostCooldown=Math.max(0,nearGhostCooldown-dt);
    const distanceToGhost=camera.position.distanceTo(spirit.position);
    if(ghostAwake&&Math.abs(groundY-ghostGround)<.6&&distanceToGhost<1.1&&nearGhostCooldown===0){nearGhostCooldown=12;captures++;tone(65,1,.16,'sawtooth');changeHaunting(18);houseMinutes+=15;ghostGraceUntil=runTime+18;ghostAwake=false;spirit.position.set(1.8,1.42,-6);ghostGround=0;patrolIndex=0;chaseMemory=0;showToast('The spirit struck. You kept your clues, but lost fifteen minutes.');if(captures>=3){failed=true;sessionStorage.removeItem(SAVE_KEY);document.exitPointerLock();}}
    if(runTime-lastSave>1){lastSave=runTime;saveGame();}
    document.querySelector('#stamina-fill').style.width=`${stamina}%`;document.querySelector('.stamina').classList.toggle('active',stamina<95);
    updateHud();
  }
  grandfather.update(dt,runTime);mansion.update(dt,groundY,camera.position.x,camera.position.z);
  const released=mansion.seals();extraSeals.forEach((ring,i)=>ring.visible=!released[i]);
  if(doorOpening){doorOpened=THREE.MathUtils.damp(doorOpened,1,2.5,dt);doorPivot.rotation.y=-doorOpened*1.5;if(doorOpened>.96){doorOpening=false;finishEscape('The brass key turns. You push the front door into the night.');}}
  if(playing&&camera.position.distanceTo(new THREE.Vector3(-2.55,1.4,-8.8))<7&&runTime-lastTick>1){lastTick=runTime;tone(clockSolved?840:510,.035,.012,'triangle');}
  if(playing&&ghostAwake){
    const delta=camera.position.clone().sub(spirit.position),distance=delta.length();
    sightRay.set(spirit.position,delta.normalize());sightRay.far=distance;
    const obstructed=sightRay.intersectObjects(scene.children,false).some(h=>h.object.visible&&h.object!==spirit&&h.distance<distance-.2&&!h.object.material?.transparent);
    if(Math.abs(groundY-ghostGround)<1&&distance<(keys.has('KeyC')&&!flashlightOn?3.5:8)&&!obstructed)chaseMemory=4;
    else chaseMemory=Math.max(0,chaseMemory-dt);
    const destination=chaseMemory>0?[camera.position.x,camera.position.z]:patrol[patrolIndex];
    const dx=destination[0]-spirit.position.x,dz=destination[1]-spirit.position.z,length=Math.hypot(dx,dz);
    if(length<.3&&chaseMemory===0)patrolIndex=(patrolIndex+1)%patrol.length;
    if(length>.1){
      const speed=chaseMemory>0?2.05:.85,nx=spirit.position.x+dx/length*speed*dt,nz=spirit.position.z+dz/length*speed*dt;
      const height=Math.abs(ghostGround)<.6&&walkable(nx,nz)?0:mansion.surfaceAt(nx,nz,ghostGround);
      if(height!==null){spirit.position.x=nx;spirit.position.z=nz;ghostGround=height;}else chaseMemory=0;
    }
    spirit.position.y=ghostGround+1.42+Math.sin(runTime*1.5)*.08;
  }
  spirit.lookAt(camera.position.x,spirit.position.y,camera.position.z);
  const spiritInBeam=flashlightOn&&camera.position.distanceTo(spirit.position)<10&&new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion).dot(spirit.position.clone().sub(camera.position).normalize())>.9;
  ghostMat.opacity=THREE.MathUtils.damp(ghostMat.opacity,ghostAwake?(chaseMemory>0?.8:spiritInBeam?.55:.1):0,3.5,dt);
  const thirteenthHour=houseMinutes>=193&&houseMinutes<218;
  const flicker=(haunting>55||thirteenthHour)&&Math.sin(runTime*(7+profile.activity*3))*Math.sin(runTime*2.17)>(thirteenthHour?.45:.84);
  for(const {lamp,intensity} of lamps)lamp.intensity=intensity*(flicker?.13:1);
  moon.intensity=flicker?18:54;
  currentTarget=playing?findTarget():null;
  const targetNames={diary:'Read the diary',clock:clockSolved&&grandfather.keyReachable?'Take the brass key':'Examine the grandfather clock',key:'Take the brass key',door:'Inspect the front door',record:'Read the family register'};
  hint.textContent=currentTarget?`E · ${currentTarget.startsWith('wing:')?mansion.targetLabel(currentTarget):currentTarget.startsWith('portrait:')?`Touch ${currentTarget.slice(9)} portrait`:targetNames[currentTarget]}`:'';
  crosshair.classList.toggle('valid',Boolean(currentTarget));
  renderer.render(scene,camera);
});
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);});
