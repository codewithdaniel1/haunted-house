import * as THREE from 'three';

// A built cabinet: the key is inside the drawer from the beginning of the run.
export function createGrandfatherClock(scene, wood, brass, interactive) {
  const root = new THREE.Group(); root.position.set(-2.55, 0, -8.8); scene.add(root);
  const walnut = wood.clone(); walnut.color.set(0x65503a); walnut.roughness=.48;
  const edge = new THREE.MeshStandardMaterial({color:0x302019,roughness:.42});
  const gilt = brass.clone(); gilt.color.set(0xb79a58); gilt.roughness=.3;
  const interior = new THREE.MeshStandardMaterial({color:0x100c09,roughness:1});
  function mesh(geometry,material,x,y,z,parent=root){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  const block=(w,h,d,x,y,z,mat=walnut,parent=root)=>mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z,parent);
  function ring(radius,tube,x,y,z,parent=root){return mesh(new THREE.TorusGeometry(radius,tube,10,72),gilt,x,y,z,parent);}
  // Stepped plinth, recessed cabinet, molded shoulders, bonnet and turned columns.
  for(const [w,h,d,y] of [[1.14,.12,.7,.06],[1.04,.1,.62,.17],[1.07,.06,.62,.65]])block(w,h,d,0,y,0);
  for(const x of [-.46,.46])block(.06,.4,.56,x,.42,0);
  block(.92,.4,.05,0,.42,-.26);
  block(.78,1.5,.12,0,1.43,-.2,interior);
  for(const x of [-.43,.43]){block(.12,1.6,.48,x,1.42,0);block(.035,1.51,.025,x,1.42,.26,gilt);}
  block(.84,.08,.53,0,.73,0);block(1.04,.13,.62,0,2.19,0);
  block(1.04,.94,.55,0,2.71,0);block(.95,.84,.035,0,2.71,.294,edge);
  for(const y of [2.23,3.18,3.24])block(1.18,.06,.67,0,y,0);
  for(const x of [-.52,.52]){
    const points=[[.07,0],[.09,.04],[.065,.1],[.04,.15],[.045,.76],[.075,.81],[.08,.85]].map(([r,y])=>new THREE.Vector2(r,y));
    mesh(new THREE.LatheGeometry(points,20),walnut,x,2.27,.33);
    for(const y of [2.34,3.03])mesh(new THREE.CylinderGeometry(.068,.068,.035,24),gilt,x,y,.33);
    mesh(new THREE.SphereGeometry(.075,20,12),gilt,x,3.42,0);
    mesh(new THREE.ConeGeometry(.04,.15,16),walnut,x,3.52,0);
  }
  const bonnet=mesh(new THREE.TorusGeometry(.42,.075,12,48,Math.PI),walnut,0,3.22,0);bonnet.scale.z=2.8;
  ring(.085,.017,0,3.52,.2);
  const dial=document.createElement('canvas');dial.width=dial.height=1024;
  const c=dial.getContext('2d');
  const gradient=c.createRadialGradient(450,400,30,512,512,510);gradient.addColorStop(0,'#f4ead0');gradient.addColorStop(.72,'#d2bf91');gradient.addColorStop(1,'#806839');c.fillStyle=gradient;c.fillRect(0,0,1024,1024);
  c.translate(512,512);
  for(const [r,width] of [[474,9],[455,3],[342,2],[325,3]]){c.strokeStyle='#514326';c.lineWidth=width;c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.stroke();}
  for(let i=0;i<60;i++){c.save();c.rotate(i*Math.PI/30);c.strokeStyle='#362a1b';c.lineWidth=i%5===0?6:2;c.beginPath();c.moveTo(0,-448);c.lineTo(0,i%5===0?-419:-435);c.stroke();c.restore();}
  const roman=['XII','I','II','III','IIII','V','VI','VII','VIII','IX','X','XI'];
  c.fillStyle='#30271b';c.font='52px Georgia';c.textAlign='center';c.textBaseline='middle';
  roman.forEach((number,i)=>{const a=i*Math.PI/6;c.fillText(number,Math.sin(a)*382,-Math.cos(a)*382);});
  c.font='27px Georgia';c.fillText('BLACKTHORN',0,-135);c.font='italic 21px Georgia';c.fillText('London • 1896',0,-97);c.font='16px Georgia';c.fillText('TEMPUS OMNIA REVELAT',0,190);
  for(const x of [-105,105]){c.fillStyle='#382b1c';c.beginPath();c.arc(x,90,18,0,Math.PI*2);c.fill();c.strokeStyle='#a58c55';c.lineWidth=4;c.stroke();}
  // Fine aging is deterministic and remains sharp at inspection distance.
  for(let i=0;i<1700;i++){const x=Math.sin(i*67.13)*490,y=Math.cos(i*43.7)*490;c.fillStyle=`rgba(51,32,12,${.025+(i%7)*.008})`;c.fillRect(x,y,1+i%3,.7+i%2);}
  const map=new THREE.CanvasTexture(dial);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=8;
  const face=mesh(new THREE.CircleGeometry(.415,96),new THREE.MeshStandardMaterial({map,roughness:.6,metalness:.15}),0,2.72,.322);
  ring(.427,.022,0,2.72,.332);ring(.453,.009,0,2.72,.325);
  for(const x of [-.4,.4])for(const y of [2.33,3.09]){const flower=ring(.042,.009,x,y,.334);for(let i=0;i<4;i++)ring(.019,.005,x+Math.sin(i*Math.PI/2)*.034,y+Math.cos(i*Math.PI/2)*.034,.337);}
  const handMaterial=new THREE.MeshStandardMaterial({color:0x131a1c,metalness:.65,roughness:.3});
  function hand(length,width,z){const pivot=new THREE.Group();pivot.position.set(0,2.72,z);root.add(pivot);const shape=new THREE.Shape();shape.moveTo(-width,-.06);shape.lineTo(-width,.08);shape.quadraticCurveTo(-width*3,.15,0,length);shape.quadraticCurveTo(width*3,.15,width,.08);shape.lineTo(width,-.06);shape.closePath();mesh(new THREE.ExtrudeGeometry(shape,{depth:.008,bevelEnabled:true,bevelSize:.002,bevelThickness:.002,bevelSegments:2,steps:1}),handMaterial,0,0,0,pivot);return pivot;}
  const hour=hand(.23,.012,.35),minute=hand(.33,.008,.37);mesh(new THREE.SphereGeometry(.022,20,12),gilt,0,2.72,.39);
  const pendulum=new THREE.Group();pendulum.position.set(0,2.03,.06);root.add(pendulum);
  block(.018,1.02,.018,0,-.5,0,gilt,pendulum);const bob=mesh(new THREE.SphereGeometry(.15,32,20),gilt,0,-.99,0,pendulum);bob.scale.z=.3;
  for(const x of [-.21,.21]){mesh(new THREE.CylinderGeometry(.004,.004,1.05,8),gilt,x,1.5,.01);mesh(new THREE.CylinderGeometry(.055,.055,.32,24),gilt,x,1.21,.01);}
  const glass=new THREE.MeshPhysicalMaterial({color:0xb5c7ba,roughness:.1,metalness:.12,transparent:true,opacity:.13,depthWrite:false});
  block(.72,1.35,.008,0,1.45,.26,glass);
  for(const x of [-.35,.35])block(.025,1.39,.045,x,1.45,.29,edge);
  for(const y of [.75,2.14])block(.74,.035,.045,0,y,.29,edge);
  // A drawer has a real cavity, felt bottom, sides, and a front that conceals its contents.
  const drawer=new THREE.Group();drawer.position.set(0,.43,0);root.add(drawer);
  block(.79,.025,.38,0,-.13,.02,edge,drawer);
  block(.73,.009,.32,0,-.111,.02,new THREE.MeshStandardMaterial({color:0x402629,roughness:1}),drawer);
  for(const x of [-.385,.385])block(.03,.23,.38,x,-.015,.02,walnut,drawer);
  block(.8,.22,.025,0,-.02,-.17,walnut,drawer);
  const drawerFront=block(.86,.29,.065,0,0,.25,walnut,drawer);
  block(.69,.18,.022,0,0,.295,edge,drawer);ring(.045,.008,0,-.015,.32,drawer);
  const key=new THREE.Group();key.position.set(-.17,-.08,.02);key.rotation.x=-Math.PI/2;key.rotation.z=-.55;drawer.add(key);
  const bow=mesh(new THREE.TorusGeometry(.055,.012,10,32),gilt,0,0,0,key);
  const stem=block(.018,.22,.018,0,-.155,0,gilt,key);
  for(const y of [-.235,-.27])block(.065,.018,.025,.024,y,0,gilt,key);
  ring(.025,.007,0,0,.002,key);
  interactive(face,'clock');interactive(drawerFront,'clock');
  key.traverse(o=>{if(o.isMesh)interactive(o,'key');});
  const glint=new THREE.PointLight(0xe1b46d,0,1.4);glint.position.set(0,.2,.45);drawer.add(glint);
  let target=11*60+47,display=target,opened=0,unlocked=false,taken=false;
  return {
    dialURL:dial.toDataURL(),
    setTime(h,m){target=(h%12)*60+m;},
    unlock(){unlocked=true;},
    take(){taken=true;key.visible=false;},
    get keyReachable(){return unlocked&&opened>.85&&!taken;},
    reset(){target=display=11*60+47;opened=0;unlocked=taken=false;key.visible=true;drawer.position.z=0;},
    update(dt,time){display=THREE.MathUtils.damp(display,target,7,dt);hour.rotation.z=-display/720*Math.PI*2;minute.rotation.z=-(display%60)/60*Math.PI*2;pendulum.rotation.z=unlocked?Math.sin(time*2.6)*.065:0;opened=THREE.MathUtils.damp(opened,unlocked?1:0,2.2,dt);drawer.position.z=opened*.54;glint.intensity=taken?0:opened*.6;}
  };
}
