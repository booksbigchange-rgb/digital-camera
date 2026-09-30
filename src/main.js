import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import './style.css';
document.querySelector('#app').innerHTML=`<div class="top"><div class="eyebrow">BigChange • Interactive Learning</div><h1>Digital Camera Atlas</h1><div class="sub">Explore how light becomes a digital photograph.</div></div><div class="panel"><h2 id="partTitle">Camera Overview</h2><p id="partText">Drag to rotate, scroll/pinch to zoom, and tap a component.</p><div class="grid"><button id="explode">Explode</button><button id="reset">Reset</button><button class="primary" id="photo">Take Photo</button><button id="xray">X-Ray Body</button></div><div id="status">Ready — select a component or take a photo.</div></div><div class="legend"><span class="chip">Lens</span><span class="chip">Aperture</span><span class="chip">Shutter</span><span class="chip">Sensor</span><span class="chip">Processor</span><span class="chip">Memory Card</span></div>`;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x071018);
const camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.1,100);camera.position.set(7,4.2,8);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;document.querySelector('#app').prepend(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.target.set(0,0,0);controls.minDistance=5;controls.maxDistance=18;
scene.add(new THREE.HemisphereLight(0xaedfff,0x17202a,2.2));const light=new THREE.DirectionalLight(0xffffff,4);light.position.set(5,7,5);scene.add(light);
const floor=new THREE.Mesh(new THREE.CircleGeometry(10,64),new THREE.MeshStandardMaterial({color:0x0b141b,roughness:.9}));floor.rotation.x=-Math.PI/2;floor.position.y=-2.15;scene.add(floor);
const atlas=new THREE.Group();scene.add(atlas);const pick=[];
const info={Lens:['Lens','Focuses incoming light toward the sensor.'],Aperture:['Aperture','Controls how much light enters through the lens.'],Shutter:['Shutter','Controls how long the sensor is exposed to light.'],Sensor:['CMOS Sensor','Converts focused light into electronic image data.'],Processor:['Image Processor','Processes sensor data into the final image.'],Card:['Memory Card','Stores the finished digital photograph.']};
const bodyMat=new THREE.MeshStandardMaterial({color:0x20262b,metalness:.35,roughness:.5});
function add(name,g,m,p,r=[0,0,0]){const x=new THREE.Mesh(g,m);x.name=name;x.position.set(...p);x.rotation.set(...r);x.userData.home=x.position.clone();atlas.add(x);return x}
const body=add('Body',new THREE.BoxGeometry(4.5,3,1.75),bodyMat,[0,0,0]);
add('Grip',new THREE.BoxGeometry(1.05,2.5,1.9),new THREE.MeshStandardMaterial({color:0x101417}),[1.95,-.15,.08]);
add('Top',new THREE.BoxGeometry(1.7,.45,1.1),bodyMat,[-.35,1.68,0]);
const dark=new THREE.MeshStandardMaterial({color:0x101417,metalness:.55,roughness:.28});
pick.push(add('Lens',new THREE.CylinderGeometry(1.25,1.38,2.4,48),dark,[0,0,2.05],[Math.PI/2,0,0]));
pick.push(add('Aperture',new THREE.TorusGeometry(.72,.11,12,48),new THREE.MeshStandardMaterial({color:0x5e6870,metalness:.8}),[0,0,1.18]));
pick.push(add('Shutter',new THREE.BoxGeometry(1.65,1.25,.08),new THREE.MeshStandardMaterial({color:0x343c42}),[0,0,.63]));
pick.push(add('Sensor',new THREE.BoxGeometry(1.75,1.28,.09),new THREE.MeshStandardMaterial({color:0x248e9c,emissive:0x052b31}),[0,0,.36]));
pick.push(add('Processor',new THREE.BoxGeometry(1.45,.85,.16),new THREE.MeshStandardMaterial({color:0x174e3d}),[-.9,-.82,-.15]));
pick.push(add('Card',new THREE.BoxGeometry(.7,1.05,.12),new THREE.MeshStandardMaterial({color:0x222b31}),[1.45,-.75,-.15]));
const title=document.querySelector('#partTitle'),text=document.querySelector('#partText'),status=document.querySelector('#status');let exploded=false,xray=false,busy=false;
function select(o){if(!o)return;const [h,b]=info[o.name];title.textContent=h;text.textContent=b;status.textContent='Selected: '+h}
const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();renderer.domElement.addEventListener('pointerdown',e=>{pointer.x=e.clientX/innerWidth*2-1;pointer.y=-(e.clientY/innerHeight)*2+1;ray.setFromCamera(pointer,camera);const h=ray.intersectObjects(pick)[0];if(h)select(h.object)});
function explode(on){exploded=on;const t={Lens:[0,0,5.1],Aperture:[0,0,2.1],Shutter:[0,0,1.2],Sensor:[0,0,.25],Processor:[-2.7,-1.7,-.4],Card:[2.6,-1.55,-.4]};pick.forEach(m=>on?m.position.set(...t[m.name]):m.position.copy(m.userData.home));document.querySelector('#explode').textContent=on?'Reassemble':'Explode';status.textContent=on?'Exploded view — select a component.':'Camera reassembled.'}
document.querySelector('#explode').onclick=()=>explode(!exploded);
document.querySelector('#xray').onclick=()=>{xray=!xray;body.material.transparent=xray;body.material.opacity=xray?.16:1;status.textContent=xray?'X-Ray enabled.':'X-Ray disabled.'};
document.querySelector('#reset').onclick=()=>{explode(false);xray=false;body.material.transparent=false;body.material.opacity=1;camera.position.set(7,4.2,8);controls.target.set(0,0,0);title.textContent='Camera Overview';text.textContent='Drag to rotate, scroll/pinch to zoom, and tap a component.';status.textContent='Reset complete.'};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
document.querySelector('#photo').onclick=async()=>{if(busy)return;busy=true;explode(false);body.material.transparent=true;body.material.opacity=.14;const steps=[['Lens','1/6 — Light enters the lens.'],['Aperture','2/6 — Aperture controls incoming light.'],['Shutter','3/6 — Shutter opens for the exposure.'],['Sensor','4/6 — Sensor converts light into data.'],['Processor','5/6 — Processor builds the image.'],['Card','6/6 — Image saved to memory card.']];for(const [n,msg] of steps){select(pick.find(x=>x.name===n));status.textContent=msg;await wait(650)}status.textContent='Photo captured ✓';busy=false};
function loop(){requestAnimationFrame(loop);controls.update();renderer.render(scene,camera)}loop();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});