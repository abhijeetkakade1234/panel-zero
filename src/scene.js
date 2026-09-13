import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export function makeRoom(canvas) {
  const renderer = new T.WebGLRenderer({canvas, antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  // The lights and props only change at story transitions; reuse their shadow maps between them.
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.type = T.PCFShadowMap;
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  const scene = new T.Scene();
  scene.background = new T.Color('#142b33');
  scene.fog = new T.FogExp2('#18292d', .032);
  const camera = new T.PerspectiveCamera(60, 1, .05, 60);
  camera.position.set(0, 1.6, 3.1);
  const materials = {};
  function mat(color){return materials[color] ??= new T.MeshStandardMaterial({color,roughness:.92});}
  const outlineMaterial = new T.LineBasicMaterial({color:'#10191c',transparent:true,opacity:.6});
  function box(w,h,d,x,y,z,color,edges=true){
    const geometry = new T.BoxGeometry(w,h,d);
    const mesh = new T.Mesh(geometry, typeof color === 'string' ? mat(color) : color);
    mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);
    if(edges){mesh.add(new T.LineSegments(new T.EdgesGeometry(geometry),outlineMaterial));}
    return mesh;
  }
  function cylinder(r1,r2,h,x,y,z,color){const m=new T.Mesh(new T.CylinderGeometry(r1,r2,h,16),mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;}
  function label(text,w,h,x,y,z,bg='#283538',fg='#d5ccac'){
    const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,512,256);ctx.fillStyle=fg;ctx.font='72px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,128);
    const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;
    const mesh=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture}));mesh.position.set(x,y,z);scene.add(mesh);return mesh;
  }
  scene.add(new T.HemisphereLight('#93bcc8','#555046',1.8));
  const moon=new T.DirectionalLight('#91cedb',2.3);moon.position.set(-5,5,1);scene.add(moon);
  const warm=new T.PointLight('#ffd198',15,6,2);warm.position.set(-1.9,1.6,-.5);warm.castShadow=true;warm.shadow.mapSize.set(1024,1024);warm.shadow.bias=-.002;scene.add(warm);
  const ceiling=new T.PointLight('#c2d1c7',8,9,2);ceiling.position.set(.5,2.9,1);scene.add(ceiling);
  const red=new T.PointLight('#ed6551',30,9,2);red.position.set(.3,2.6,-8.1);scene.add(red);
  const redLampMaterial=new T.MeshBasicMaterial({color:'#e97b60'});
  // Architectural geometry is the final walkable set; generated art remains on the physical pages.
  box(6,.16,7,0,-.09,.5,'#393831');
  for(let row=0;row<16;row++)for(let col=0;col<6;col++){
    const tones=['#70604c','#665b4a','#796650','#5c5447'];
    box(.985,.035,.432,-2.5+col,.005,-2.77+row*.437,tones[(row*3+col)%4]);
  }
  box(.15,3.4,7,3.05,1.7,.5,'#66706a');
  box(6,3.4,.15,0,1.7,4.05,'#74786e');
  box(3,3.4,.18,-1.5,1.7,-3.16,'#6d7770');box(1.15,3.4,.18,2.5,1.7,-3.16,'#6d7770');box(1.85,.6,.18,.95,3.1,-3.16,'#6d7770');
  box(.18,.7,7,-3.05,.35,.5,'#596d6c');box(.18,.6,7,-3.05,3.1,.5,'#596d6c');
  box(.18,2.2,2,-3.05,1.75,-2,'#596d6c');box(.18,2.2,2,-3.05,1.75,3,'#596d6c');
  box(6,.14,7,0,3.46,.5,'#424e4c');
  for(const x of [-2.95,2.95])box(.08,.15,7,x,.13,.5,'#303c3a');
  box(6,.15,.08,0,.13,-3.03,'#303c3a');
  // Window frame, blinds, layered city silhouettes, and physical rain streaks.
  const glass=new T.MeshStandardMaterial({color:'#345c69',transparent:true,opacity:.18,roughness:.2});
  box(.02,2.1,3,-3.08,1.85,.5,glass,false);
  for(const z of [-1,.5,2])box(.14,2.2,.08,-2.96,1.8,z,'#253d42');
  box(.25,.1,3.1,-2.92,.74,.5,'#a08d6d');
  for(let i=0;i<7;i++)box(.19,.055,3,-2.96,2.8-i*.085,.5,'#2d4244');
  for(let i=0;i<12;i++){
    const z=-9+i*1.5;const height=2+(i*7%5);
    box(2,height,1.2,-6-(i%3),height/2-1,z,['#192e35','#233c44','#30484c'][i%3]);
    for(let j=0;j<6;j++)for(let k=0;k<3;k++)if((i+j+k)%3!==0)box(.015,.19,.13,-4.99-(i%3),j*.48-.4,z-.35+k*.32,new T.MeshBasicMaterial({color:(i+j)%4===0?'#b9a680':'#548994'}),false);
  }
  const rainGeo=new T.BufferGeometry();const drops=new Float32Array(180*6);
  for(let i=0;i<180;i++){const x=-3.3-(i%9)*.14,y=(i*1.713)%5,z=-1+(i*.618)%3;drops.set([x,y,z,x,y-.09,z+.015],i*6);}
  rainGeo.setAttribute('position',new T.BufferAttribute(drops,3));const rain=new T.LineSegments(rainGeo,new T.LineBasicMaterial({color:'#b2d4d7',transparent:true,opacity:.32}));scene.add(rain);
  // Entrance.
  box(.1,2.9,.25,-.04,1.45,-3.04,'#303c39');box(.1,2.9,.25,1.94,1.45,-3.04,'#303c39');box(2.1,.1,.25,.95,2.86,-3.04,'#303c39');
  const door=box(1.82,2.7,.12,.95,1.36,-3.12,'#9a9c88');
  const plaque=label('404',.46,.23,.95,2,-3.05);
  const peephole=cylinder(.027,.027,.03,.95,1.68,-3.03,'#171e20');peephole.rotation.x=Math.PI/2;
  const handle=box(.26,.045,.065,.3,1.03,-3,'#202c2e');
  const slot=box(.55,.035,.04,.95,.55,-3.025,'#303a38');
  const doorParts=[door,plaque,peephole,handle,slot];
  box(.75,.45,.12,-1.8,2.6,-3,'#899489');box(.14,.24,.13,-1.95,2.6,-2.91,'#243132');
  // Desk and phone.
  box(1.45,.12,2.5,-2.13,.85,0,'#80674c');
  for(const x of [-2.68,-1.56])for(const z of [-1.05,1.05])box(.09,.8,.09,x,.4,z,'#483e32');
  box(.7,.5,.5,-2.18,.48,.9,'#5b4a38');box(.13,.035,.04,-1.8,.52,.9,'#1b282a');
  const phone=box(.47,.15,.36,-1.9,1,-.55,'#172426');phone.rotation.x=.12;
  const dial=cylinder(.11,.11,.015,-1.9,1.087,-.50,'#baae8c');
  for(let i=0;i<10;i++){const angle=i/10*Math.PI*2;cylinder(.013,.013,.017,-1.9+Math.cos(angle)*.077,1.1,-.5+Math.sin(angle)*.077,'#1b2627');}
  box(.55,.09,.095,-1.9,1.17,-.69,'#132125');for(const x of [-2.13,-1.67])cylinder(.065,.085,.11,x,1.12,-.69,'#132125');
  const cord=[];for(let i=0;i<100;i++)cord.push(new T.Vector3(-2.17+Math.cos(i*.75)*.025,1-.003*i,-.6+i*.003));scene.add(new T.Line(new T.BufferGeometry().setFromPoints(cord),new T.LineBasicMaterial({color:'#111b1d'})));
  cylinder(.12,.13,.025,-2.35,.935,-.93,'#242c2a');cylinder(.018,.018,.58,-2.35,1.22,-.93,'#3a4140');cylinder(.075,.22,.22,-2.35,1.57,-.93,'#485047');
  cylinder(.19,.19,.009,-2.35,1.455,-.93,'#ffe5ad');
  cylinder(.08,.07,.18,-1.85,1.01,.2,'#d6ccb1');cylinder(.066,.066,.008,-1.85,1.105,.2,'#3a342a');
  const mugHandle=new T.Mesh(new T.TorusGeometry(.06,.015,8,16),mat('#d6ccb1'));mugHandle.position.set(-1.75,1.02,.2);scene.add(mugHandle);
  for(let i=0;i<5;i++)box(.35,.042,.5,-2.4,.94+i*.046,.5,['#738077','#aa9b7d','#3d4f54'][i%3]);
  box(.48,.025,.33,-1.85,.94,.8,'#a3997e').rotation.y=.18;
  // Bed, seams, pillow, bedside books.
  box(1.45,.18,2.9,2.15,.12,1.9,'#3f443d');box(1.4,.23,2.85,2.15,.31,1.9,'#a7aa9a');
  box(1.43,.13,2.1,2.15,.46,2.2,'#677a79');box(.95,.14,.5,2.15,.49,.72,'#d0cbb8');
  for(let i=0;i<14;i++)box(.012,.005,2.1,1.49+i*.1,.53,2.2,'#536967',false);
  for(let i=0;i<20;i++)box(1.43,.005,.009,2.15,.535,1.19+i*.107,'#87918a',false);
  box(.65,.65,.52,2.57,.325,-.55,'#6d5c47');for(let i=0;i<3;i++)box(.37,.05,.28,2.55,.69+i*.06,-.55,'#a99f84');
  // Bookshelf and small objects.
  for(const x of [-2.8,-1.93])box(.065,2.1,.4,x,1.05,-2.53,'#5c503d');
  for(let s=0;s<5;s++){box(.94,.055,.43,-2.37,.12+s*.48,-2.53,'#7f6b50');if(s<4)for(let i=0;i<7;i++)box(.09,.28+(i%3)*.03,.27,-2.72+i*.115,.29+s*.48,-2.49,['#a39474','#526563','#6d5044'][i%3]);}
  const plant=cylinder(.13,.09,.23,-2.35,2.23,-2.53,'#938976');
  for(let i=0;i<11;i++){const leaf=new T.Mesh(new T.SphereGeometry(.12,7,5),mat('#3f6956'));leaf.scale.set(.5,1.8,.7);leaf.position.set(-2.35+Math.sin(i*2)*.2,2.43+(i%3)*.1,-2.53+Math.cos(i*2)*.1);leaf.rotation.z=Math.sin(i)*.7;scene.add(leaf);}
  // Framed manga prints on the right wall: same production art as the chapter.
  const art=new T.TextureLoader().load('/art/chapter.png');art.colorSpace=T.SRGBColorSpace;
  for(let i=0;i<2;i++){const print=new T.Mesh(new T.PlaneGeometry(.6,.9),new T.MeshStandardMaterial({map:art,roughness:1}));print.position.set(2.95,2.05,-1.5+i*1.3);print.rotation.y=-Math.PI/2;scene.add(print);}
  box(.7,.08,.22,2.76,2.7,-2.3,'#354642');for(let i=0;i<3;i++)box(.13,.045,.18,2.72,2.62,-2.55+i*.2,'#242f32');
  // Corridor and lamps.
  box(6,.1,6.7,0,-.02,-6.6,'#5b6260');box(6,.15,6.7,0,3.4,-6.6,'#424d4c');
  for(const x of [-3.05,3.05])box(.15,3.4,6.7,x,1.7,-6.6,'#5e706b');
  box(.85,3.4,.15,-2.6,1.7,-9.9,'#465c59');box(3.65,3.4,.15,1.2,1.7,-9.9,'#465c59');box(1.65,.55,.15,-1.3,3.13,-9.9,'#465c59');
  const serviceDoor=box(1.6,2.85,.1,-1.3,1.43,-9.9,'#3f5654');
  for(let i=0;i<3;i++){
    const hallDoor=box(.08,2.6,1.3,2.94,1.3,-4.5-i*1.75,'#52615b');
    box(.5,.06,.25,0,3.2,-4.4-i*1.8,i===2?redLampMaterial:new T.MeshBasicMaterial({color:'#bdc9b5'}));
    if(i<2){const light=new T.PointLight('#a0bfb4',7,5,2);light.position.set(0,2.9,-4.4-i*1.8);scene.add(light);}
  }
  label('COURTYARD',1.3,.18,-1.3,3,-9.79,'#364944','#c4b99c');
  for(let i=0;i<3;i++){
    const number=label(String(402-i),.4,.2,2.88,1.85,-4.5-i*1.75);
    number.rotation.y=-Math.PI/2;
  }
  const neighborGlow=box(.025,.035,1.12,2.885,.055,-4.5,new T.MeshBasicMaterial({color:'#efdca1'}));
  const switchPlate=box(.23,.34,.055,1.5,1.4,-9.76,'#b3af95');
  const switchLever=box(.055,.12,.035,1.5,1.4,-9.72,'#433e36');
  label('NIGHT LIGHT',.75,.12,1.5,1.72,-9.72,'#364944','#c4b99c');
  const neighborName=label('ARAI',.48,.13,2.884,1.57,-4.5);neighborName.rotation.y=-Math.PI/2;
  const erasedDoor=box(.025,2.9,1.55,2.78,1.46,-4.5,'#5e706b');erasedDoor.visible=false;
  function page(x,z){const p=new T.Mesh(new T.PlaneGeometry(.39,.56),new T.MeshStandardMaterial({map:art,roughness:1,side:T.DoubleSide}));p.rotation.x=-Math.PI/2;p.rotation.z=.15;p.position.set(x,.044,z);scene.add(p);return p;}
  const firstPage=page(.95,-2.45),hallPage=page(.2,-8.35),finalPage=page(-1.75,.68);
  finalPage.position.y=.925;finalPage.visible=false;
  // Outdoor service courtyard: a real traversable space beyond the corridor.
  box(12,.14,14,0,-.1,-17,'#273b41');
  for(let row=0;row<14;row++)for(let col=0;col<8;col++)
    box(1.47,.025,.97,-5.25+col*1.5,.006,-10.5-row,['#304850','#354b50','#3d5053'][(row+col)%3]);
  box(.2,7,14,-5.8,3.5,-17,'#263e48');box(.2,7,14,5.8,3.5,-17,'#304751');
  box(12,3.8,.2,0,1.9,-24,'#31464b');
  for(const x of [-5.67,5.67]){
    for(let j=0;j<3;j++)for(let i=0;i<4;i++){
      box(.03,1.1,.8,x,2.8+j*1.65,-12-i*2.7,new T.MeshBasicMaterial({color:(i+j)%3===0?'#a68f60':'#172c35'}));
      box(.7,.08,1.2,x,2.2+j*1.65,-12-i*2.7,'#172c35');
    }
    cylinder(.06,.06,6,x,3,-16,'#1a3038');
  }
  // Bench and origami boat. Its angular paper geometry is intentional in-world art.
  for(let i=0;i<4;i++)box(2.2,.08,.16,-3.9,.62,-14.45+i*.18,'#86704d');
  for(let i=0;i<3;i++)box(2.2,.14,.07,-3.9,.95+i*.2,-14.55,'#655638');
  for(const x of [-4.75,-3.05])box(.08,.6,.65,x,.3,-14.15,'#1c2d30');
  const boat=new T.Group();boat.position.set(-3.6,.76,-14.15);scene.add(boat);
  const hull=new T.Mesh(new T.ConeGeometry(.3,.22,4,1,true),mat('#e5d6ae'));hull.rotation.z=Math.PI;hull.scale.z=.55;boat.add(hull);
  const sail=new T.Mesh(new T.ConeGeometry(.16,.28,3),mat('#f1e3bd'));sail.position.y=.1;boat.add(sail);
  const benchLight=new T.PointLight('#ffd293',20,7,2);benchLight.position.set(-4.7,2.4,-14);scene.add(benchLight);
  cylinder(.1,.22,.16,-4.7,2.65,-14,'#27373a');
  box(.4,.025,.4,-4.7,2.56,-14,new T.MeshBasicMaterial({color:'#ffe0a3'}));
  // Abandoned swing. Movement stops while reading and under reduced motion.
  for(const x of [-1.2,1.2]){box(.09,2.6,.09,x,1.3,-18.7,'#5a4037');}
  box(2.55,.1,.12,0,2.65,-18.7,'#624337');
  const swing=new T.Group();swing.position.set(0,2.55,-18.7);scene.add(swing);
  for(const x of [-.3,.3]){const chain=new T.Mesh(new T.CylinderGeometry(.015,.015,1.9,5),mat('#182b31'));chain.position.set(x,-.95,0);swing.add(chain);}
  const seat=new T.Mesh(new T.BoxGeometry(.8,.06,.3),mat('#453c30'));seat.position.y=-1.92;swing.add(seat);
  box(.22,1.1,.7,5.25,1.3,-18,'#733d32');
  const powerLabel=label('POWER',.6,.2,5.11,1.55,-18);powerLabel.rotation.y=-Math.PI/2;
  const poweredLamp=new T.PointLight('#c5e0d4',0,17,2);poweredLamp.position.set(0,4.1,-20);scene.add(poweredLamp);
  box(.75,.08,.4,0,4.3,-20,'#172930');
  // Recessed drain, iron bars, warning lamp, shallow reflective-looking puddles.
  box(2,1.55,.05,.4,.8,-23.86,new T.MeshBasicMaterial({color:'#03090d'}));
  for(let i=0;i<9;i++)box(.045,1.6,.08,-.48+i*.22,.8,-23.79,'#697677');
  box(2.15,.12,.12,.4,1.61,-23.79,'#687775');
  const drainPage=new T.Mesh(new T.PlaneGeometry(.3,.4),new T.MeshStandardMaterial({map:art,side:T.DoubleSide}));drainPage.position.set(.4,.8,-23.72);scene.add(drainPage);
  const drainLight=new T.PointLight('#e8593e',16,6,2);drainLight.position.set(.4,2.3,-23);scene.add(drainLight);
  box(.18,.18,.06,.4,2.1,-23.8,new T.MeshBasicMaterial({color:'#ea694f'}));
  const wet=new T.MeshStandardMaterial({color:'#597377',roughness:.15,metalness:.45,transparent:true,opacity:.48});
  for(let i=0;i<8;i++){const puddle=new T.Mesh(new T.CircleGeometry(.6+(i%3)*.25,20),wet);puddle.rotation.x=-Math.PI/2;puddle.scale.y=.45;puddle.position.set(-3+(i*1.73)%6,.032,-12-i*1.35);scene.add(puddle);}
  for(let i=0;i<14;i++){
    const x=i%2===0?-5.3:5.3,z=-11-i*.85;
    for(let j=0;j<3;j++){const weed=box(.025,.25+j*.1,.025,x+j*.09,.13+j*.05,z,'#476458',false);weed.rotation.z=(j-1)*.35;}
  }
  const outsideRain=new T.BufferGeometry(),rainPoints=new Float32Array(240*6);
  for(let i=0;i<240;i++){const x=-5.5+(i*.731)%11,y=(i*.419)%6,z=-10.5-(i*.613)%13;rainPoints.set([x,y,z,x,y-.2,z],i*6);}
  outsideRain.setAttribute('position',new T.BufferAttribute(rainPoints,3));scene.add(new T.LineSegments(outsideRain,new T.LineBasicMaterial({color:'#94c4cf',transparent:true,opacity:.25})));
  const foldTexture=new T.TextureLoader().load('/art/fold.png');foldTexture.colorSpace=T.SRGBColorSpace;
  const apparition=new T.Sprite(new T.SpriteMaterial({map:foldTexture,transparent:true,depthTest:false,depthWrite:false,opacity:.98}));
  apparition.center.set(.5,.87);apparition.renderOrder=10;
  apparition.scale.set(2,3,1);apparition.visible=false;scene.add(apparition);
  // ponytail: batch static props by material; moving props stay separate.
  const batches=new Map(),ink=[];
  for(const mesh of [...scene.children]){
    if(!mesh.isMesh||doorParts.includes(mesh)||[firstPage,hallPage,finalPage,neighborGlow,switchLever,erasedDoor,serviceDoor,drainPage].includes(mesh))continue;
    mesh.updateMatrixWorld(true);
    const geometry=mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);
    if(!batches.has(mesh.material))batches.set(mesh.material,[]);
    batches.get(mesh.material).push(geometry);
    for(const edge of mesh.children){if(edge.isLineSegments)ink.push(edge.geometry.clone().applyMatrix4(mesh.matrixWorld));}
    scene.remove(mesh);
  }
  for(const [material,geometries] of batches){const mesh=new T.Mesh(mergeGeometries(geometries),material);mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);}
  scene.add(new T.LineSegments(mergeGeometries(ink),outlineMaterial));
  const objects=[
    {id:'page',name:'Read the delivered page',position:new T.Vector3(.95,.6,-2.45)},
    {id:'phone',name:'Answer the telephone',position:new T.Vector3(-1.9,1.05,-.55)},
    {id:'door',name:'Open apartment 404',position:new T.Vector3(.95,1.3,-3.1)},
    {id:'hallpage',name:'Read the page under the red light',position:new T.Vector3(.2,.6,-8.35)},
    {id:'neighbor',name:'Knock on apartment 402',position:new T.Vector3(2.88,1.4,-4.5)},
    {id:'switch',name:'Decide what to do with the red light',position:new T.Vector3(1.5,1.4,-9.72)},
    {id:'finalpage',name:'Read the page on your desk',position:new T.Vector3(-1.75,1.05,.68)},
    {id:'exit',name:'Open the service door',position:new T.Vector3(-1.3,1.4,-9.8)},
    {id:'boat',name:'Unfold the paper boat',position:new T.Vector3(-3.6,.9,-14.15)},
    {id:'power',name:'Fit the fuse in the power cabinet',position:new T.Vector3(5.1,1.3,-18)},
    {id:'drain',name:'Pull the page from the storm drain',position:new T.Vector3(.4,.9,-23.7)},
    {id:'cup',name:'Inspect the cup',position:new T.Vector3(-1.85,1.05,.2)},
    {id:'books',name:'Inspect the books',position:new T.Vector3(-2.4,1.35,-2.45)},
    {id:'bed',name:'Inspect the futon',position:new T.Vector3(1.5,.7,1.1)},
  ];
  let zeroPlaque;
  function sync(stage,keptLight=false){
    renderer.shadowMap.needsUpdate=true;
    firstPage.visible=stage===0;hallPage.visible=stage<5;finalPage.visible=stage===11;
    boat.visible=stage<8;serviceDoor.visible=stage<7;poweredLamp.intensity=stage>=9?35:0;
    drainPage.visible=stage<10;
    const doorClosed=stage<3||(stage>=6&&stage<11);
    doorParts.forEach(p=>p.visible=doorClosed);
    if(stage>=6&&stage<11){
      plaque.visible=false;
      if(zeroPlaque){scene.remove(zeroPlaque);zeroPlaque.geometry.dispose();zeroPlaque.material.map.dispose();zeroPlaque.material.dispose();}
      zeroPlaque=label(keptLight?'404':'000',.46,.23,.95,2,-3.205);zeroPlaque.rotation.y=Math.PI;
    }else if(zeroPlaque)zeroPlaque.visible=false;
    red.intensity=stage>=6&&!keptLight?0:30;
    redLampMaterial.color.set(stage>=6&&!keptLight?'#302b29':'#e97b60');
    switchLever.rotation.x=stage>=6&&!keptLight?.5:0;
    neighborGlow.visible=stage<6||keptLight;
    erasedDoor.visible=stage>=6&&!keptLight;
    finalPage.material.map=keptLight?null:art;finalPage.material.color.set(keptLight?'#efe9d6':'#ffffff');finalPage.material.needsUpdate=true;
    warm.intensity=stage>=11?(keptLight?20:3):15;
    ceiling.color.set(stage>=11&&!keptLight?'#647f94':'#c2d1c7');
    objects[2].name=stage===10?`Return to apartment ${keptLight?'404':'000'}`:'Open apartment 404';
  }
  let scareRemaining=0,scareLength=0,scareId='',swingTime=0;
  const scareForward=new T.Vector3();
  function scare(id){scareId=id;scareRemaining=scareLength=id==='drain'?1.1:.9;camera.getWorldDirection(scareForward);apparition.position.copy(camera.position).addScaledVector(scareForward,id==='gate'?4:2.5);apparition.visible=true;}
  function clearScare(){scareRemaining=0;apparition.visible=false;swingTime=0;}
  function animate(dt,time,reduced){
    swingTime+=dt;if(!reduced)swing.rotation.x=Math.sin(swingTime*1.8)*.13;
    if(scareRemaining>0){scareRemaining=Math.max(0,scareRemaining-dt);const progress=1-scareRemaining/scareLength;if(!reduced)apparition.position.addScaledVector(scareForward,-dt*(scareId==='gate'?2:1.5));apparition.material.opacity=scareRemaining>0?1:0;const growth=reduced?0:progress;apparition.scale.set(2+growth,3+growth,1);apparition.visible=scareRemaining>0;}
    if(!reduced){for(let i=0;i<240;i++){rainPoints[i*6+1]-=dt*3;rainPoints[i*6+4]-=dt*3;if(rainPoints[i*6+1]<0){rainPoints[i*6+1]+=6;rainPoints[i*6+4]+=6;}}outsideRain.attributes.position.needsUpdate=true;}
    if(!reduced){for(let i=0;i<180;i++){drops[i*6+1]-=dt*2.5;drops[i*6+4]-=dt*2.5;if(drops[i*6+1]<.2){drops[i*6+1]+=4;drops[i*6+4]+=4;}}rainGeo.attributes.position.needsUpdate=true;}
    renderer.render(scene,camera);
  }
  function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}
  resize();addEventListener('resize',resize);
  return {renderer,scene,camera,objects,sync,animate,scare,clearScare};
}
