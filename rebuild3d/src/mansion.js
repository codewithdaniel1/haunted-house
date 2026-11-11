import * as THREE from 'three';

export function createMansion({scene,box,addCollider,materials,interactive,loadProp,notify,read,tone,escape,mechanism}) {
  const {wood,wall,floor,metal,dark}=materials;
  const STEP=5.2, doors=[],chests=[],secrets=[],lightSources=[],inventory=new Set(),taken=new Set();
  // Keep the number of rendered lights constant. Changing PointLight.visible while
  // climbing made Three.js rebuild every lit material for the new floor.
  const lightSlots=Array.from({length:8},()=>{
    const light=new THREE.PointLight(0xffffff,0,10,2);
    scene.add(light);
    return {light,source:-1,target:0};
  });
  let lightSelectionTimer=0;
  let portraitSolved=false,nurserySeal=false,archiveSeal=false,musicProgress=0;
  const melody=[3,1,4,2],symbols=['Sun','Moon','Star','Raven'];let rings=[3,0,1];
  const names={[-1]:['Boiler room','Workshop'],0:['Estate office','Dining room'],1:['Master bedroom','Nursery'],2:['Family archive','Observatory'],3:['Ritual chamber','Trunk room']};
  const roomLocks={[-1]:[null,null],0:['family-seal',null],1:['bedroom-key',null],2:['archive-key',null],3:['relic',null]};
  const itemNames={'service-key':'Iron service key','bedroom-key':'Bedroom key','archive-key':'Archive key',ward:'Attic ward',relic:'Blackthorn relic',fuse:'Generator fuse'};
  const paper=new THREE.MeshStandardMaterial({color:0xd6c6a5,roughness:1});
  const fabric=new THREE.MeshStandardMaterial({color:0x493237,roughness:1});
  function light(x,y,z,color=0xfac18a){lightSources.push({x,y,z,color});}
  function updateLights(dt,playerY,playerX,playerZ){
    lightSelectionTimer-=dt;
    if(lightSelectionTimer<=0){
      lightSelectionTimer=.3;
      const nearest=lightSources.map((source,index)=>({index,distance:(source.x-playerX)**2+(source.z-playerZ)**2+1.5*(source.y-playerY-1.68)**2}))
        .sort((a,b)=>a.distance-b.distance).slice(0,lightSlots.length).map(entry=>entry.index);
      const selected=new Set(nearest);
      for(const slot of lightSlots)if(slot.source!==-1&&!selected.has(slot.source))slot.target=0;
      for(const sourceIndex of nearest){
        const existing=lightSlots.find(slot=>slot.source===sourceIndex);
        if(existing){existing.target=22;continue;}
        const slot=lightSlots.find(slot=>slot.source===-1||slot.target===0&&slot.light.intensity<.5);
        if(!slot)continue;
        const source=lightSources[sourceIndex];
        slot.source=sourceIndex;slot.target=22;slot.light.intensity=0;
        slot.light.position.set(source.x,source.y,source.z);slot.light.color.setHex(source.color);
      }
    }
    for(const slot of lightSlots){
      slot.light.intensity=THREE.MathUtils.damp(slot.light.intensity,slot.target,8,dt);
      if(slot.target===0&&slot.light.intensity<.5){slot.light.intensity=0;slot.source=-1;}
    }
  }
  function door(id,x,y,z,rotation,title,lock,swing=-1){
    const pivot=new THREE.Group();pivot.position.set(x,y,z);pivot.rotation.y=rotation;scene.add(pivot);
    const leaf=new THREE.Mesh(new THREE.BoxGeometry(1.5,2.9,.1),wood);leaf.position.set(.75,1.45,0);leaf.castShadow=true;leaf.receiveShadow=true;pivot.add(leaf);interactive(leaf,`wing:door:${id}`);
    const panels=[];
    for(const cy of [.75,2])for(const side of [-1,1]){const panel=new THREE.Mesh(new THREE.BoxGeometry(1.18,.86,.045),dark);panel.position.set(.75,cy,side*.065);pivot.add(panel);panels.push(panel);}
    for(const side of [-1,1]){
      const plate=new THREE.Mesh(new THREE.BoxGeometry(.13,.24,.018),metal);plate.position.set(1.3,1.31,side*.115);pivot.add(plate);
      const handle=new THREE.Mesh(new THREE.SphereGeometry(.047,14,10),metal);handle.position.set(1.3,1.4,side*.135);pivot.add(handle);
    }
    const d={id,pivot,leaf,panels,rotation,swing,open:false,amount:0,title,lock};doors.push(d);return d;
  }
  function stairDoor(id,x,y,z,rotation,title,lock,swing){
    const entry=door(id,x,y,z,rotation,title,lock,swing);
    entry.panels.forEach(panel=>panel.visible=false);
    entry.leaf.material=id==='basement'?new THREE.MeshStandardMaterial({color:0x323b39,roughness:.94}):atticBoards;
    for(const side of [-1,1]){
      if(id==='basement'){
        for(const px of [.18,.47,.76,1.05,1.34]){
          const plank=new THREE.Mesh(new THREE.BoxGeometry(.26,2.75,.018),px%2>.5?wood:dark);
          plank.position.set(px,1.46,side*.062);entry.pivot.add(plank);
        }
        for(const h of [.38,1.5,2.55]){
          const strap=new THREE.Mesh(new THREE.BoxGeometry(1.38,.06,.025),metal);
          strap.position.set(.75,h,side*.083);entry.pivot.add(strap);
        }
      }else{
        for(const px of [.24,.75,1.26]){
          const board=new THREE.Mesh(new THREE.BoxGeometry(.48,2.76,.018),atticBoards);
          board.position.set(px,1.46,side*.062);entry.pivot.add(board);
        }
        for(const angle of [-.62,.62]){
          const brace=new THREE.Mesh(new THREE.BoxGeometry(.085,2.2,.025),wood);
          brace.position.set(.75,1.45,side*.085);brace.rotation.z=angle;entry.pivot.add(brace);
        }
        const wardMark=new THREE.Mesh(new THREE.TorusGeometry(.16,.018,8,32),new THREE.MeshStandardMaterial({color:0x7098a0,emissive:0x193e48,emissiveIntensity:1.2}));
        wardMark.position.set(.75,2.3,side*.105);entry.pivot.add(wardMark);
      }
    }
    return entry;
  }
  const basementPlaster=new THREE.MeshStandardMaterial({color:0x646661,roughness:.96,side:THREE.DoubleSide});
  const atticBoards=new THREE.MeshStandardMaterial({color:0x574a38,roughness:.88,side:THREE.DoubleSide});
  const stairSkirting=dark.clone();stairSkirting.side=THREE.DoubleSide;
  const stairRailWood=new THREE.MeshStandardMaterial({color:0x927052,roughness:.78});
  function landingGuard(name,x0,z0,x1,z1,y){
    const dx=x1-x0,dz=z1-z0,length=Math.hypot(dx,dz),angle=Math.atan2(dx,dz);
    for(const [part,height,width,depth] of [['handrail',1.07,.14,.12],['base rail',.12,.1,.09]]){
      const rail=box(`${name} ${part}`,width,depth,length,(x0+x1)/2,y+height,(z0+z1)/2,stairRailWood,false);
      rail.rotation.y=angle;
    }
    const count=Math.ceil(length/.38);
    for(let i=0;i<=count;i++){
      const t=i/count,x=x0+dx*t,z=z0+dz*t,end=i===0||i===count;
      box(`${name} ${end?'newel':'baluster'}`,end ? .18 : .075,end ? 1.12 : .95,end ? .18 : .075,x,y+(end ? .56 : .55),z,stairRailWood,false);
      if(end)box(`${name} cap`,.27,.1,.27,x,y+1.16,z,metal,false);
    }
  }
  function boxedMainStairSide(x){
    const x0=x-.12,x1=x+.12;
    const vertices=[x0,0,19.5,x0,0,11.5,x0,STEP,11.5,x1,0,19.5,x1,0,11.5,x1,STEP,11.5];
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
    geometry.setIndex([0,1,2,3,5,4,0,3,4,0,4,1,0,2,5,0,5,3,1,4,5,1,5,2]);
    geometry.computeVertexNormals();
    const panel=new THREE.Mesh(geometry,stairSkirting);panel.name='boxed main stair wall';panel.receiveShadow=true;scene.add(panel);
  }
  function slopedStairWall(x,baseY,height,material,z0=11.45,z1=19.55){
    const x0=x-.07,x1=x+.07;
    const riseAt=z=>baseY+THREE.MathUtils.clamp((19.5-z)/8,0,1)*STEP;
    const corners=[
      [x0,riseAt(z0),z0],[x0,riseAt(z0)+height,z0],[x0,riseAt(z1),z1],[x0,riseAt(z1)+height,z1],
      [x1,riseAt(z0),z0],[x1,riseAt(z0)+height,z0],[x1,riseAt(z1),z1],[x1,riseAt(z1)+height,z1]
    ];
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(corners.flat(),3));
    geometry.setIndex([0,1,3,0,3,2,4,7,5,4,6,7,0,5,1,0,4,5,2,3,7,2,7,6,0,2,6,0,6,4,1,5,7,1,7,3]);
    geometry.computeVertexNormals();
    const mesh=new THREE.Mesh(geometry,material);mesh.name='enclosed service stair wall';mesh.receiveShadow=true;scene.add(mesh);
  }
  function atticStair(){
    const baseY=2*STEP,stepDepth=8/26,stepRise=STEP/26;
    box('attic stair lower landing',2.7,.16,1.12,-4.75,baseY-.08,19.04,floor,false);
    slopedStairWall(-3.4,baseY,3.14,atticBoards);
    slopedStairWall(-5.6,baseY,3.14,atticBoards,12.25,18.4);
    slopedStairWall(-3.51,baseY,.92,stairSkirting);
    slopedStairWall(-5.49,baseY,.92,stairSkirting,12.25,18.4);
    const ceiling=box('sloped attic stair ceiling',2.2,.13,Math.hypot(8.1,STEP),-4.5,baseY+STEP/2+3.12,15.5,atticBoards,false);
    ceiling.rotation.x=Math.atan2(STEP,8.1);
    for(const z of [12.65,14.6,16.55,18.5]){
      const stairY=baseY+(19.5-z)/8*STEP;
      box('attic stair ceiling joist',2.25,.13,.15,-4.5,stairY+3.02,z,wood,false);
    }
    for(let i=0;i<26;i++){
      const h=(i+1)*stepRise,z=19.5-(i+.5)*stepDepth;
      box('attic stair tread',1.85,.12,stepDepth,-4.5,baseY+h-.06,z,wood,false);
      box('attic stair riser',1.85,stepRise,.055,-4.5,baseY+h-stepRise/2,z+stepDepth/2,wood,false);
      box('worn attic stair runner',.86,.012,stepDepth*.78,-4.5,baseY+h+.006,z,fabric,false);
    }
    for(const x of [-5.39,-3.61]){
      const rail=box('attic stair handrail',.1,.1,Math.hypot(8,STEP),x,baseY+STEP/2+1,15.5,stairRailWood,false);
      rail.rotation.x=Math.atan2(STEP,8);
      for(const z of [12.6,14.1,15.6,17.1,18.1]){
        const stairY=baseY+(19.5-z)/8*STEP;
        box('attic handrail wall bracket',.22,.065,.09,x+(x< -4.5 ? -.1 : .1),stairY+1,z,metal,false);
      }
    }
    for(const z of [11.65,11.95,18.7,19.05,19.35]){
      const stairY=baseY+(19.5-z)/8*STEP;
      box('attic open-side baluster',.07,1,.07,-5.39,stairY+.5,z,stairRailWood,false);
    }
    for(const z of [13.4,17.4]){const stairY=baseY+(19.5-z)/8*STEP;light(-3.75,stairY+2.25,z,0xd6a36d);}
    landingGuard('attic lower landing guard',-6.08,19.55,-3.48,19.55,baseY);
    box('attic upper landing',2.85,.16,1.55,-4.875,3*STEP-.08,10.7,floor,false);
    box('attic landing back wall',2.2,3.2,.15,-4.5,3*STEP+1.6,9.93,atticBoards,false);
  }
  function basementSideWall(z,height,material,x0=-11.5,x1=-3.5){
    const z0=z-.07,z1=z+.07;
    const dropAt=x=>-THREE.MathUtils.clamp((x+11.5)/8,0,1)*STEP;
    const corners=[
      [x0,dropAt(x0),z0],[x0,dropAt(x0)+height,z0],[x1,dropAt(x1),z0],[x1,dropAt(x1)+height,z0],
      [x0,dropAt(x0),z1],[x0,dropAt(x0)+height,z1],[x1,dropAt(x1),z1],[x1,dropAt(x1)+height,z1]
    ];
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(corners.flat(),3));
    geometry.setIndex([0,1,3,0,3,2,4,7,5,4,6,7,0,5,1,0,4,5,2,3,7,2,7,6,0,2,6,0,6,4,1,5,7,1,7,3]);geometry.computeVertexNormals();
    const mesh=new THREE.Mesh(geometry,material);mesh.name='basement service stair wall';mesh.receiveShadow=true;scene.add(mesh);
  }
  function basementStair(){
    const stepDepth=8/26,stepRise=STEP/26;
    basementSideWall(23.6,3.14,basementPlaster);
    basementSideWall(21.4,3.14,basementPlaster,-11.5,-4.4);
    basementSideWall(23.49,.92,stairSkirting);
    basementSideWall(21.51,.92,stairSkirting,-11.5,-4.4);
    const ceiling=box('sloped basement stair ceiling',Math.hypot(8.1,STEP),.13,2.2,-7.5,-STEP/2+3.12,22.5,basementPlaster,false);
    ceiling.rotation.z=-Math.atan2(STEP,8.1);
    for(let i=0;i<26;i++){
      const h=(i+1)*stepRise,x=-11.5+(i+.5)*stepDepth;
      box('basement stair tread',stepDepth,.12,1.85,x,-h-.06,22.5,wood,false);
      box('basement stair riser',.055,stepRise,1.85,x-stepDepth/2,-i*stepRise-stepRise/2,22.5,wood,false);
    }
    for(const z of [21.57,23.43]){
      const rail=box('basement stair handrail',Math.hypot(8,STEP),.1,.1,-7.5,-STEP/2+1,z,stairRailWood,false);
      rail.rotation.z=-Math.atan2(STEP,8);
      for(const x of [-10.4,-8.7,-7,-5.3]){
        const stairY=-(x+11.5)/8*STEP;
        box('basement handrail wall bracket',.09,.065,.2,x,stairY+1,z+(z<22.5 ? -.09 : .09),metal,false);
      }
    }
    for(const x of [-4.3,-4,-3.7]){
      const stairY=-(x+11.5)/8*STEP;
      box('basement open-side baluster',.07,1,.07,x,stairY+.5,21.57,stairRailWood,false);
    }
    for(const x of [-9.3,-5.5]){const stairY=-(x+11.5)/8*STEP;light(x,stairY+2.22,22.13,0xa8c0bd);}
    box('service vestibule floor',2,.16,1.62,-12.4,-.08,21.75,floor,false);
    landingGuard('service vestibule guard',-13.25,22.53,-12,22.53,0);
    box('basement door threshold',1.55,.06,.38,-12.5,-.025,20.85,wood,false);
    box('service vestibule west wall',.16,3.25,2.45,-13.36,1.625,22.18,basementPlaster,false);
    box('service vestibule south wall',1.85,3.25,.16,-12.45,1.625,23.48,basementPlaster,false);
    box('service vestibule ceiling',2.4,.14,2.45,-12.1,3.2,22.18,basementPlaster,false);
    box('basement passage floor',3.15,.16,4.15,-4.75,-STEP-.08,20.525,floor,false);
    landingGuard('basement passage guard',-6.24,22.55,-4.4,22.55,-STEP);
    box('basement passage east wall',.16,3.15,4.15,-3.16,-STEP+1.57,20.525,basementPlaster,false);
    box('basement passage ceiling',2.7,.14,4.15,-4.55,-STEP+3.15,20.525,basementPlaster,false);
  }
  function keyMesh(parent,id){
    const group=new THREE.Group();group.position.set(-.1,.04,.02);group.rotation.x=-Math.PI/2;group.rotation.z=.7;parent.add(group);
    if(['ward','relic','fuse'].includes(id)){
      const geometry=id==='fuse'?new THREE.CylinderGeometry(.025,.025,.19,16):new THREE.CylinderGeometry(.095,.095,.025,48);
      const item=new THREE.Mesh(geometry,id==='fuse'?paper:metal);item.rotation.x=Math.PI/2;group.add(item);interactive(item,`wing:item:${id}`);
      if(id!=='fuse'){const inset=new THREE.Mesh(new THREE.TorusGeometry(.07,.008,8,32),dark);inset.position.z=.02;group.add(inset);interactive(inset,`wing:item:${id}`);}
      return group;
    }
    const parts=[[new THREE.TorusGeometry(.055,.012,8,24),0,0],[new THREE.BoxGeometry(.018,.19,.02),0,-.13],[new THREE.BoxGeometry(.065,.025,.02),.025,-.21]];
    for(const [geo,x,y]of parts){const m=new THREE.Mesh(geo,metal);m.position.set(x,y,0);group.add(m);interactive(m,`wing:item:${id}`);}
    return group;
  }
  function chest(id,x,y,z){
    const group=new THREE.Group();group.position.set(x,y,z);scene.add(group);
    function b(w,h,d,px,py,pz,mat=wood,parent=group){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(px,py,pz);m.castShadow=true;parent.add(m);return m;}
    b(.66,.05,.44,0,0,0);for(const px of [-.31,.31])b(.04,.22,.44,px,.11,0);for(const pz of [-.2,.2])b(.66,.22,.04,0,.11,pz);
    b(.56,.012,.34,0,.032,0,fabric);
    const hinge=new THREE.Group();hinge.position.set(0,.23,-.22);group.add(hinge);const lid=b(.69,.045,.46,0,0,.22,wood,hinge);interactive(lid,`wing:chest:${id}`);
    b(.07,.07,.018,0,.15,.23,metal);
    const item=keyMesh(group,id);chests.push({id,group,hinge,item,open:false,amount:0});
    return group;
  }
  function desk(x,y,z){box('desk',2.1,.13,.95,x,y+.86,z,wood);for(const dx of [-.86,.86])for(const dz of [-.36,.36])box('turned desk leg',.09,.83,.09,x+dx,y+.42,z+dz,wood);}
  function diningChair(x,y,z,rotation){
    const group=new THREE.Group();group.position.set(x,y,z);group.rotation.y=rotation;scene.add(group);
    addCollider(x,z,.68,.66,y,y+1.4,.1);
    const add=(geometry,material,px,py,pz)=>{const mesh=new THREE.Mesh(geometry,material);mesh.position.set(px,py,pz);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;};
    const block=(w,h,d,px,py,pz,material=wood)=>add(new THREE.BoxGeometry(w,h,d),material,px,py,pz);
    for(const px of [-.24,.24])for(const pz of [-.23,.23]){
      add(new THREE.CylinderGeometry(.035,.055,.47,12),wood,px,.235,pz);
      block(.085,.045,.085,px,.46,pz,metal);
    }
    block(.62,.09,.58,0,.51,0);
    block(.5,.045,.46,0,.578,-.015,fabric);
    for(const px of [-.25,.25]){
      add(new THREE.CylinderGeometry(.035,.045,.79,12),wood,px,.94,.245);
      add(new THREE.SphereGeometry(.055,12,8),metal,px,1.36,.245);
    }
    block(.51,.29,.055,0,1.02,.245,fabric);
    block(.6,.07,.09,0,1.34,.245);
  }
  function note(id,title,text,x,y,z){
    const c=document.createElement('canvas');c.width=512;c.height=768;const ctx=c.getContext('2d');
    const paperGradient=ctx.createLinearGradient(0,0,512,768);paperGradient.addColorStop(0,'#e3d5b5');paperGradient.addColorStop(.73,'#d5c29b');paperGradient.addColorStop(1,'#b9a47f');
    ctx.fillStyle=paperGradient;ctx.fillRect(0,0,512,768);
    ctx.strokeStyle='rgba(80,54,34,.28)';ctx.lineWidth=8;ctx.strokeRect(12,12,488,744);
    ctx.fillStyle='#493322';ctx.font='30px Georgia';ctx.fillText(title.slice(0,28),34,78);
    ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(36,99);ctx.lineTo(476,99);ctx.stroke();
    ctx.font='italic 22px Georgia';let line='',lineY=151;
    for(const word of text.split(' ')){
      const next=line?`${line} ${word}`:word;
      if(ctx.measureText(next).width>435&&line){ctx.fillText(line,38,lineY);lineY+=34;line=word;}else line=next;
    }
    if(line)ctx.fillText(line,38,lineY);
    ctx.font='18px Georgia';ctx.fillStyle='#765b3f';ctx.fillText('Blackthorn Estate · Private papers',38,721);
    const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;
    const sheet=new THREE.Mesh(new THREE.PlaneGeometry(.32,.46),new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide}));sheet.rotation.x=-Math.PI/2;sheet.position.set(x,y,z);scene.add(sheet);interactive(sheet,`wing:note:${id}`);notes.set(id,{title,text});
  }
  const notes=new Map();
  for(let level=-1;level<=3;level++){
    const y=level*STEP;
    const roomWall=wall.clone();roomWall.color.set([0x586263,0x8a8174,0x7c6a6b,0x77735e,0x6b5845][level+1]);
    // The main stair starts on floor 1. Only floors 2 and 3 need a cutout for
    // the flight arriving from below; the basement and attic use other wings.
    if(level===-1||level===0||level===3){
      box('closed main stair hall floor',9,.16,11,-10.5,y-.08,15.5,floor,false);
    }else{
      box('main stair west landing',3.9,.16,11,-13.05,y-.08,15.5,floor,false);
      box('main stair east landing',2.3,.16,11,-7.15,y-.08,15.5,floor,false);
      box('main stair north landing',2.8,.16,1.55,-9.7,y-.08,10.775,floor,false);
      box('main stair south landing',2.8,.16,1.55,-9.7,y-.08,20.225,floor,false);
    }
    box('stair hall north end',20,4.8,.18,-16,y+2.4,10,roomWall,false);
    if(level===0){
      box('service entry south wall',12.7,4.8,.18,-19.65,y+2.4,21,roomWall,false);
      box('service entry south wall',5.7,4.8,.18,-8.85,y+2.4,21,roomWall,false);
      box('service entry lintel',1.6,1.8,.18,-12.5,y+3.9,21,roomWall,false);
      for(const x of [-13.33,-11.67])box('basement door jamb',.16,3.08,.31,x,y+1.54,21,wood,false);
      box('basement door header',1.84,.22,.33,-12.5,y+3.08,21,wood,false);
    }else box('stair hall south end',20,4.8,.18,-16,y+2.4,21,roomWall,false);
    if(level===-1||level===2){
      box('east wall before service doorway',.18,4.8,8.45,-6,y+2.4,14.225,roomWall,false);
      box('east wall after service doorway',.18,4.8,1.05,-6,y+2.4,20.475,roomWall,false);
      box('east service doorway lintel',.18,1.8,1.5,-6,y+3.9,19.2,roomWall,false);
      for(const z of [18.37,20.03])box('east service door jamb',.3,3.08,.16,-6,y+1.54,z,wood,false);
      box('east service door header',.32,.22,1.83,-6,y+3.08,19.2,wood,false);
    }else if(level===3){
      box('attic arrival east wall',.18,4.8,.7,-6,y+2.4,10.35,roomWall,false);
      box('attic arrival east wall',.18,4.8,8.8,-6,y+2.4,16.6,roomWall,false);
      box('attic arrival lintel',.18,1.8,1.5,-6,y+3.9,11.45,roomWall,false);
      for(const z of [10.62,12.28])box('attic arrival jamb',.3,3.08,.16,-6,y+1.54,z,wood,false);
    }else if(level!==0)box('stair hall east wall',.18,4.8,11,-6,y+2.4,15.5,roomWall,false);
    light(-12.6,y+3.7,15.5,level===-1?0x9fbbb7:0xfac18a);
    if(level>=1&&level<=2)for(const x of [-11.1,-8.3]){
      box('stairwell guard rail',.12,.11,7.8,x,y+1.07,15.5,stairRailWood,false);
      box('stairwell guard base',.1,.1,7.8,x,y+.09,15.5,wood,false);
      for(let z=11.65;z<=19.35;z+=.44)box('stairwell baluster',.065,.93,.065,x,y+.55,z,stairRailWood,false);
      for(const z of [11.6,19.4]){
        box('stairwell end post',.18,1.13,.18,x,y+.56,z,stairRailWood,false);
        box('stairwell end cap',.28,.1,.28,x,y+1.15,z,metal,false);
      }
    }
    if(level===2)landingGuard('floor three south stairwell guard',-11.1,19.45,-8.3,19.45,y);
    for(let r=0;r<2;r++){
      const centerZ=r===0?12.75:18.25,id=`${level}:${r}`,doorZ=centerZ-.75;
      box('room floor',10,.14,5.5,-20,y-.07,centerZ,floor,false);
      box('room ceiling',10,.16,5.5,-20,y+4.8,centerZ,level===3?wood:roomWall,false);
      for(const z of [centerZ-2.75,centerZ+2.75]){
        box('room wall',10,4.8,.15,-20,y+2.4,z,roomWall,false);
        box('room paneling',9.8,1.3,.18,-20,y+.65,z+(z<centerZ?.1:-.1),dark,false);
        box('room picture rail',9.8,.065,.19,-20,y+1.34,z+(z<centerZ?.13:-.13),metal,false);
        box('room crown molding',9.85,.16,.25,-20,y+4.62,z,wood,false);
      }
      for(const zz of [centerZ-1.75,centerZ+1.75])box('doorway wall',.16,4.8,2,-15,y+2.4,zz,roomWall,false);
      box('doorway lintel',.16,1.8,1.5,-15,y+3.9,centerZ,roomWall,false);
      const d=door(id,-15,y,doorZ,-Math.PI/2,names[level][r],roomLocks[level][r]);
      // Room-specific furniture and a clear pool of light over the clue desk.
      desk(-20,y,centerZ-.8);light(-20,y+3.3,centerZ,level===-1?0x9ec7c4:0xffba79);
      loadProp('Chandelier_01',-20,y+3.7,centerZ,.85);
      if(level===1){
        box('bed frame',2.3,.42,2.8,-23,y+.3,centerZ,wood);box('aged mattress',2.15,.25,2.6,-23,y+.63,centerZ,paper);box('wool quilt',2.17,.08,1.8,-23,y+.8,centerZ+.35,fabric);box('headboard',2.4,1.4,.15,-23,y+.8,centerZ-1.45,wood);box('pillow',.8,.16,.48,-23,y+.84,centerZ-.95,paper);
      }else if(level===-1){
        const tank=new THREE.Mesh(new THREE.CylinderGeometry(.65,.65,2.8,24),metal);tank.position.set(-23,y+1.4,centerZ);tank.castShadow=true;scene.add(tank);
        addCollider(-23,centerZ,1.3,1.3,y,y+2.8,.18);
        for(const z of [centerZ-1,centerZ+1])box('service pipe',8,.09,.09,-20,y+3.9,z,metal,false);
      }else if(level===3){
        for(const x of [-24,-22,-20,-18,-16]){const beam=box('attic rafter',.16,3.2,.16,x,y+3.4,centerZ,wood,false);beam.rotation.z=.6;}
        for(const z of [centerZ-1.8,centerZ+1.8])box('travelling trunk',1.25,.65,.7,-23,y+.33,z,wood);
      }else{
        loadProp('wooden_bookshelf_worn',-23,y,centerZ-2.1,2.8);
        loadProp('GothicCabinet_01',-17,y,centerZ+1.8,2.2,Math.PI);
      }
      if(level===0&&r===1){
        box('dining table top',1.65,.12,1.28,-20,y+.79,centerZ+.9,wood);
        for(const dx of [-.7,.7])for(const dz of [-.49,.49])box('dining table leg',.11,.73,.11,-20+dx,y+.365,centerZ+.9+dz,wood);
        diningChair(-21.35,y,centerZ+.9,-Math.PI/2);
        diningChair(-18.65,y,centerZ+.9,Math.PI/2);
        diningChair(-20,y,centerZ+1.85,0);
      }
      // The northern room of each floor has a concealed western annex.
      if(r===0){
        for(const zz of [centerZ-1.8,centerZ+1.8])box('secret wall',.18,4.8,1.9,-25,y+2.4,zz,roomWall,false);
        box('secret lintel',.18,1.7,1.9,-25,y+3.95,centerZ,roomWall,false);
        box('secret chamber floor',4,.14,5.5,-27,y-.07,centerZ,floor,false);box('secret chamber ceiling',4,.15,5.5,-27,y+4.8,centerZ,roomWall,false);
        box('secret chamber back',.18,4.8,5.5,-29,y+2.4,centerZ,roomWall,false);
        for(const z of [centerZ-2.75,centerZ+2.75])box('secret chamber side',4,4.8,.15,-27,y+2.4,z,roomWall,false);
        const pivot=new THREE.Group();pivot.position.set(-24.87,y,centerZ-1);scene.add(pivot);
        const back=new THREE.Mesh(new THREE.BoxGeometry(.3,3.15,2),wood);back.position.set(0,1.575,1);pivot.add(back);interactive(back,`wing:secret:${level}`);
        for(const h of [.3,.85,1.4,1.95,2.5,3.1]){const shelf=new THREE.Mesh(new THREE.BoxGeometry(.55,.08,2),wood);shelf.position.set(.25,h,1);pivot.add(shelf);}
        for(let i=0;i<40;i++){const book=new THREE.Mesh(new THREE.BoxGeometry(.21,.38,.06),new THREE.MeshStandardMaterial({color:[0x584336,0x35474a,0x655b43][i%3],roughness:1}));book.position.set(.23,.52+Math.floor(i/8)*.55,.25+(i%8)*.2);pivot.add(book);}
        secrets.push({level,pivot,open:false,amount:0});
        light(-27,y+2.7,centerZ,0x9db6c1);
      }else {
        box('room west wall',.18,4.8,5.5,-25,y+2.4,centerZ,roomWall,false);
        if(level>=0){
          box('moonlit sash window',.02,2.4,1.4,-24.87,y+2.8,centerZ,materials.glass,false);
          for(const zz of [centerZ-.74,centerZ,centerZ+.74])box('window mullion',.12,2.55,.055,-24.8,y+2.8,zz,wood,false);
          for(const yy of [1.55,2.8,4.05])box('window crossbar',.13,.06,1.58,-24.8,y+yy,centerZ,wood,false);
          for(const zz of [centerZ-.95,centerZ+.95])for(let j=0;j<5;j++)box('velvet curtain fold',.12,2.9,.055,-24.69+j%2*.06,y+2.7,zz+j*.055,fabric,false);
        }
      }
    }
    if(level===0||level===1){
      const stepDepth=8/26,stepRise=STEP/26;
      for(let i=0;i<26;i++){
        const h=(i+1)*stepRise,z=19.5-(i+.5)*stepDepth;
        box('main stair tread',2.55,.12,stepDepth,-9.7,y+h-.06,z,wood,false);
        box('main stair riser',2.55,stepRise,.055,-9.7,y+h-stepRise/2,z+stepDepth/2,wood,false);
      }
      if(level===0){
        boxedMainStairSide(-11.04);boxedMainStairSide(-8.36);
        box('boxed main stair back wall',2.96,STEP,.24,-9.7,STEP/2,11.5,dark,false);
      }
      for(const [x,stringerX] of [[-11.1,-11.02],[-8.3,-8.38]]){
        const stringer=box('main stair stringer',.16,.24,Math.hypot(8,STEP),stringerX,y+STEP/2,15.5,wood,false);
        stringer.rotation.x=Math.atan2(STEP,8);
        const rail=box('ascending handrail',.13,.12,Math.hypot(8,STEP),x,y+STEP/2+1.06,15.5,stairRailWood,false);rail.rotation.x=Math.atan2(STEP,8);
        for(let i=0;i<26;i++)box('stair spindle',.065,1.04,.065,x,y+i/26*STEP+.55,19.5-i/26*8,stairRailWood,false);
        for(const [z,postY] of [[19.5,y],[11.5,y+STEP]]){
          box('main stair newel post',.2,1.13,.2,x,postY+.56,z,stairRailWood,false);
          box('main stair newel cap',.29,.11,.29,x,postY+1.16,z,metal,false);
        }
      }
    }
  }
  basementStair();atticStair();
  const basementGate=stairDoor('basement',-13.25,0,21,0,'Basement service door','service-key',1);
  const atticGate=stairDoor('attic',-6,2*STEP,18.45,-Math.PI/2,'Attic stair door','ward',-1);
  chest('bedroom-key',-20,.96,17.45);
  chest('service-key',-20,.96,11.95);
  chest('archive-key',-20,STEP+.96,11.95);
  chest('ward',-20,STEP*2+.96,11.95);
  chest('relic',-27,STEP*2+.3,12.75);
  chest('fuse',-20,-STEP+.96,17.45);
  note('dining','A housekeeper’s note','The bedroom key is in this keepsake box. The estate office opens when the family portraits remember their order. The iron service key is kept on the office desk.',-20.7,.929,17.45);
  note('nursery','Clara’s lullaby','Clara wrote her lullaby in the margin: third bell, first bell, fourth bell, second bell. The music box clasps one of the family seals. Father kept the archive key in the master bedroom. Loose books hide drafts and passages.',-20.7,STEP+.929,17.45);
  note('observatory','The celestial ward','The archive’s outer ring belongs to the Sun. The Moon watches the middle. A lone Star rests at its heart. Behind the archive shelves is the private chapel and the family relic. Bring that relic into the attic.',-20,STEP*2+.929,17.45);
  note('office','Service plans','The basement service door is at the south end of the floor-one west hall. Find a spare fuse in the workshop. A false wine rack in the boiler room hides the old drainage tunnel.',-20.7,.929,11.95);
  const fusebox=interactive(box('generator fuse panel',.12,.65,.45,-28.75,-STEP+1.4,12.75,metal),'wing:generator');
  const tunnel=interactive(box('tunnel gate',.1,2.7,1.5,-28.8,-STEP+1.4,13.8,dark),'wing:tunnel');
  const ritual=interactive(box('ritual lectern',.7,1.1,.7,-27,STEP*3+.55,12.75,wood),'wing:ritual');
  const musicBox=interactive(box('Clara music box',.65,.22,.4,-19.7,STEP+1.05,17.45,wood),'wing:music');
  const cylinder=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.42,32),metal);cylinder.rotation.z=Math.PI/2;cylinder.position.set(-19.7,STEP+1.2,17.45);scene.add(cylinder);interactive(cylinder,'wing:music');
  const starPlate=interactive(box('celestial seal',.7,.035,.65,-20.7,STEP*2+.96,11.95,metal),'wing:stars');
  for(const radius of [.1,.19,.28]){const ring=new THREE.Mesh(new THREE.TorusGeometry(radius,.012,8,48),dark);ring.rotation.x=Math.PI/2;ring.position.set(-20.7,STEP*2+.99,11.95);scene.add(ring);interactive(ring,'wing:stars');}
  let generator=false;
  const unlocked=lock=>!lock||(lock==='family-seal'?portraitSolved:inventory.has(lock));
  function roomDoor(level,r){return doors.find(d=>d.id===`${level}:${r}`);}
  return {
    setPortraitSolved(){portraitSolved=true;},
    awakened(){return inventory.size>=2||nurserySeal||archiveSeal;},
    seals(){return [nurserySeal,archiveSeal];},
    frontDoorReady(){return nurserySeal&&archiveSeal;},
    progressHint(){return !nurserySeal?'Find Clara’s music box on floor 2':!archiveSeal?'Release the archive seal on floor 3':'Unlock the front door';},
    inventory(){return [...inventory].map(id=>itemNames[id]);},
    canTarget(id){if(id.startsWith('wing:chest:'))return !taken.has(id.slice(11));if(!id.startsWith('wing:item:'))return true;const c=chests.find(c=>c.id===id.slice(10));return c&&c.amount>.8&&!taken.has(c.id);},
    targetLabel(id){const parts=id.split(':');if(parts[1]==='door')return `${doors.find(d=>d.id===parts.slice(2).join(':'))?.title??'Door'}`;if(parts[1]==='chest'){const c=chests.find(c=>c.id===parts[2]);return c?.amount>.8&&!taken.has(c.id)?`Take ${itemNames[c.id]}`:'Open keepsake box';}if(parts[1]==='item')return `Take ${itemNames[parts[2]]}`;if(parts[1]==='secret')return 'Press the loose book';if(parts[1]==='note')return 'Read document';return {generator:'Repair generator',tunnel:'Open tunnel gate',ritual:'Place the family relic',music:'Examine Clara’s music box',stars:'Turn the celestial rings'}[parts[1]];},
    interact(id){
      if(!id.startsWith('wing:'))return false;const parts=id.split(':');
      if(parts[1]==='door'){const d=doors.find(d=>d.id===parts.slice(2).join(':'));if(!unlocked(d.lock)){notify(d.lock==='family-seal'?'The family crest matches the portrait hall.':`Locked · ${itemNames[d.lock]} needed`);tone(90,.15,.04);return true;}if(!d.open){d.open=true;tone(120,.6,.05);notify(`${d.title} opens.`);}}
      if(parts[1]==='chest'){const c=chests.find(c=>c.id===parts[2]);if(c.id==='ward'&&!archiveSeal){notify('The celestial mechanism holds this box shut.');return true;}if(c.amount>.8&&!taken.has(c.id)){taken.add(c.id);inventory.add(c.id);c.item.visible=false;tone(660,.25,.045);notify(`${itemNames[c.id]} collected`);}else if(!c.open){c.open=true;tone(160,.25,.04);notify('The lid lifts. Something rests inside.');}}
      if(parts[1]==='item'){const c=chests.find(c=>c.id===parts[2]);if(c.amount>.8&&!taken.has(c.id)){taken.add(c.id);inventory.add(c.id);c.item.visible=false;tone(660,.25,.045);notify(`${itemNames[c.id]} collected`);}}
      if(parts[1]==='secret'){const s=secrets.find(s=>s.level===Number(parts[2]));s.open=true;tone(70,.8,.08);notify('The shelves scrape across the floor. A hidden passage opens.');}
      if(parts[1]==='note'){const n=notes.get(parts[2]);read(n.title,n.text);}
      if(parts[1]==='music'){
        if(nurserySeal){notify('Clara’s lullaby has released the nursery seal.');return true;}
        musicProgress=0;
        mechanism('Clara’s music box','Four brass tongues wait beneath the cylinder. Recreate the lullaby recorded in Clara’s note.',[1,2,3,4].map(n=>[`Bell ${n}`,()=>{
          if(nurserySeal)return 'The nursery seal is already released.';
          tone(220*Math.pow(1.25,n),.65,.055);
          if(melody[musicProgress]===n){musicProgress++;if(musicProgress===4){nurserySeal=true;return 'The lullaby finishes. The nursery seal breaks.';}return `${musicProgress} notes remembered…`;}
          musicProgress=0;return 'A sour note. Begin the melody again.';
        }]));
      }
      if(parts[1]==='stars'){
        if(archiveSeal){notify('The celestial seal is released. The ward box is unlocked.');return true;}
        const describe=()=>`Outer: ${symbols[rings[0]]} · Middle: ${symbols[rings[1]]} · Heart: ${symbols[rings[2]]}`;
        mechanism('The celestial seal','Three concentric discs turn independently. The observatory’s notes describe their alignment.',[
          ...['Outer ring','Middle ring','Inner ring'].map((label,i)=>[label,()=>{rings[i]=(rings[i]+1)%4;tone(190,.08,.035);return describe();}]),
          ['Release clasp',()=>{if(rings.every((v,i)=>v===i)){archiveSeal=true;chests.find(c=>c.id==='ward').open=true;tone(520,.8,.08);return 'The archive seal releases. The ward box opens.';}return `The clasp holds. ${describe()}`;}]
        ],describe());
      }
      if(parts[1]==='generator'){if(!inventory.has('fuse'))notify('A fuse is missing. Search the workshop.');else{generator=true;tone(55,1,.12);notify('The generator starts. The tunnel lock releases.');}}
      if(parts[1]==='tunnel'){if(generator)escape('You followed the drainage tunnel beyond the estate.');else notify('The gate needs power. Inspect the generator panel.');}
      if(parts[1]==='ritual'){if(inventory.has('relic'))escape('The relic returns to its place. The house releases its dead.');else notify('A family relic fits the empty recess.');}
      return true;
    },
    surfaceAt(x,z,currentY){
      const choices=[];
      for(let level=-1;level<=3;level++){
        const y=level*STEP;
        if(Math.abs(y-currentY)<.6){
          const hall=x>-14.75&&x<-6.15&&z>10.25&&z<20.75;
          const mainStairOpening=level>=1&&level<=2&&x>-11.1&&x<-8.3&&z>11.55&&z<19.45;
          const boxedUnderStair=level===0&&x>-11.42&&x<-7.98&&z>11.1&&z<19.46;
          if(hall&&!mainStairOpening&&!boxedUnderStair)choices.push(y);
          if(level===0&&x>=-6.15&&x<-5.6&&z>14.4&&z<16.4)choices.push(0);
          if(level===0&&basementGate.amount>.75&&x>-13.3&&x<-11.4&&z>20.72&&z<22.56&&(z>21.1||x<-11.72))choices.push(0);
          if(level===-1&&x>-6.2&&x<-3.15&&z>18.45&&z<22.6&&(z<19.95||x>-5.85))choices.push(y);
          if(level===2&&atticGate.amount>.75&&x>-6.2&&x<-5.3&&z>18.45&&z<19.55)choices.push(y);
          if(level===3&&x>-6.3&&x<-3.4&&z>10.65&&z<11.5&&(z>10.7||x>-5.85))choices.push(y);
          for(let r=0;r<2;r++){
            const center=r===0?12.75:18.25;
            if(x>-24.65&&x<-15.25&&Math.abs(z-center)<2.45)choices.push(y);
            if(x>=-15.25&&x<=-14.75&&Math.abs(z-center)<.57&&roomDoor(level,r).amount>.75)choices.push(y);
          }
          const secret=secrets.find(s=>s.level===level);
          if(x>-28.65&&x<-25.3&&z>10.3&&z<15.2)choices.push(y);
          if(x>=-25.3&&x<=-24.65&&Math.abs(z-12.75)<.7&&secret.amount>.8)choices.push(y);
        }
        if((level===0||level===1)&&x>-10.85&&x<-8.55&&z>=11.45&&z<=19.55){
          const stairY=y+THREE.MathUtils.clamp((19.5-z)/8,0,1)*STEP;
          if(Math.abs(stairY-currentY)<.6)choices.push(stairY);
        }
      }
      if(basementGate.amount>.75&&x>=-11.5&&x<=-3.5&&z>21.55&&z<23.45){
        const stairY=-THREE.MathUtils.clamp((x+11.5)/8,0,1)*STEP;
        if(Math.abs(stairY-currentY)<.65)choices.push(stairY);
      }
      if(atticGate.amount>.75&&x>-5.35&&x<-3.65&&z>=11.45&&z<=19.55){
        const stairY=2*STEP+THREE.MathUtils.clamp((19.5-z)/8,0,1)*STEP;
        if(Math.abs(stairY-currentY)<.65)choices.push(stairY);
      }
      return choices.sort((a,b)=>Math.abs(a-currentY)-Math.abs(b-currentY))[0]??null;
    },
    roomName(x,y,z){const level=Math.round(y/STEP);if(z>20.75&&x>-13.5&&x<-3)return 'Basement service stair';if(x>-6.2&&x<-3.3&&y>STEP*1.8)return y>STEP*2.9?'Attic landing':'Attic stair';if(x>-6.2&&x<-3.1&&y<-.6)return 'Basement passage';if(x<-25.3)return ['Drainage tunnel','Hidden study','Wardrobe passage','Private chapel','Relic chamber'][level+1]??'Hidden passage';if(x<-15.25)return names[level]?.[z<15.5?0:1]??'West wing';return level===-1?'Basement hall':level===3?'Attic landing':`Floor ${level+1} · Main staircase`;},
    snapshot(){return {inventory:[...inventory],taken:[...taken],doors:doors.filter(d=>d.open).map(d=>d.id),chests:chests.filter(c=>c.open).map(c=>c.id),secrets:secrets.filter(s=>s.open).map(s=>s.level),portraitSolved,nurserySeal,archiveSeal,generator,rings};},
    restore(state){
      if(!state)return;
      for(const id of state.inventory??[])if(itemNames[id])inventory.add(id);
      for(const id of state.taken??[])if(itemNames[id])taken.add(id);
      portraitSolved=Boolean(state.portraitSolved);nurserySeal=Boolean(state.nurserySeal);archiveSeal=Boolean(state.archiveSeal);generator=Boolean(state.generator);
      if(Array.isArray(state.rings)&&state.rings.length===3)rings=state.rings.slice();
      for(const d of doors)if(state.doors?.includes(d.id)){d.open=true;d.amount=1;d.pivot.rotation.y=d.rotation+d.swing*Math.PI*.49;}
      for(const c of chests){if(state.chests?.includes(c.id)){c.open=true;c.amount=1;c.hinge.rotation.x=-Math.PI*.65;}if(taken.has(c.id))c.item.visible=false;}
      for(const s of secrets)if(state.secrets?.includes(s.level)){s.open=true;s.amount=1;s.pivot.rotation.y=-Math.PI*.48;}
    },
    reset(){inventory.clear();taken.clear();portraitSolved=generator=nurserySeal=archiveSeal=false;musicProgress=0;rings=[3,0,1];for(const d of doors){d.open=false;d.amount=0;d.pivot.rotation.y=d.rotation;}for(const c of chests){c.open=false;c.amount=0;c.item.visible=true;c.hinge.rotation.x=0;}for(const s of secrets){s.open=false;s.amount=0;s.pivot.rotation.y=0;}},
    update(dt,playerY,playerX,playerZ){for(const d of doors){d.amount=THREE.MathUtils.damp(d.amount,d.open?1:0,3,dt);d.pivot.rotation.y=d.rotation+d.swing*d.amount*Math.PI*.49;}for(const c of chests){c.amount=THREE.MathUtils.damp(c.amount,c.open?1:0,3,dt);c.hinge.rotation.x=-c.amount*Math.PI*.65;}for(const s of secrets){s.amount=THREE.MathUtils.damp(s.amount,s.open?1:0,1.4,dt);s.pivot.rotation.y=-s.amount*Math.PI*.48;}updateLights(dt,playerY,playerX,playerZ);}
  };
}
