import './style.css';
import * as T from 'three';
import { makeRoom } from './scene.js';
import { advance, objectives, canWalk, nextScare, pullProgress } from './story.js';

const $=id=>document.getElementById(id);
const canvas=$('world'), reading=$('reading'), pause=$('pause');
document.body.classList.add('in-menu');
let world;
try{world=makeRoom(canvas);}catch(error){$('fatal').hidden=false;console.error(error);}
if(world)run();

function run(){
  let stage=0,started=false,paused=true,yaw=0,pitch=-.03,target=null,dragging=false,muted=false,keptLight=false,choicePending=false;
  let audio,master,ringTimer,closeAction=null;
  const call=new window.Audio('/audio/telephone.ogg');call.preload='auto';
  function stopCall(){call.pause();call.currentTime=0;}
  function playCall(){
    startAudio();stopCall();
    if(!audio){$('call-status').textContent='Voice unavailable. The full call is written below.';return;}
    $('call-status').textContent=muted||volume===0?'Call muted. Sound controls are in Escape → Pause.':'On the line…';
    call.play().catch(()=>{$('call-status').textContent='Voice could not play. Press Replay call to try again.';});
  }
  $('replay-call').onclick=playCall;
  call.onended=()=>{$('call-status').textContent='The line has gone quiet.';};
  const keys=new Set();
  const playedScares=new Set();
  let scareTimer=0,pull=0,stepTime=0,beatTime=0;
  let volume=.65;
  let mouseSensitivity=.0007;
  $('sensitivity').addEventListener('input',event=>{mouseSensitivity=Number(event.target.value)*.00014;});
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const forward=new T.Vector3(),direction=new T.Vector3();
  function startAudio(){
    if(audio){audio.resume().then(audioStatus).catch(audioStatus);return;}
    const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio){$('audio-status').textContent='This browser does not support game audio.';return;}
    audio=new Audio();master=audio.createGain();master.gain.value=volume;
    const limiter=audio.createDynamicsCompressor();limiter.threshold.value=-12;limiter.ratio.value=8;master.connect(limiter);limiter.connect(audio.destination);
    audio.createMediaElementSource(call).connect(master);
    const buffer=audio.createBuffer(1,audio.sampleRate*3,audio.sampleRate);const values=buffer.getChannelData(0);
    for(let i=0;i<values.length;i++)values[i]=(Math.random()*2-1)*.5;
    const rain=audio.createBufferSource();rain.buffer=buffer;rain.loop=true;const filter=audio.createBiquadFilter();filter.type='lowpass';filter.frequency.value=1200;rain.connect(filter);filter.connect(master);rain.start();
    const hum=audio.createOscillator();hum.frequency.value=58;const gain=audio.createGain();gain.gain.value=.07;hum.connect(gain);gain.connect(master);hum.start();
    audio.onstatechange=audioStatus;audio.resume().then(audioStatus).catch(audioStatus);
    ringTimer=setInterval(()=>{if(stage===1&&!paused)tone(740,.2,.12);},1300);
  }
  function audioStatus(){ $('audio-status').textContent=audio?.state==='running'?'Audio ready. Test sound plays three notes.':'Audio paused by browser. Click Test sound to enable it.'; }
  $('volume').oninput=event=>{volume=Number(event.target.value)/100;if(master)master.gain.value=muted?0:volume;};
  $('test-sound').onclick=()=>{if(volume===0){volume=.65;$('volume').value='65';}muted=false;startAudio();if(master)master.gain.value=volume;$('mute').textContent='Sound: on';audio?.resume().then(()=>{tone(440,.3,.35);setTimeout(()=>tone(554,.3,.35),350);setTimeout(()=>tone(660,.3,.35),700);}).catch(audioStatus);};
  function impact(duration=.3,volume=.4){
    if(!audio||muted)return;
    const buffer=audio.createBuffer(1,Math.ceil(audio.sampleRate*duration),audio.sampleRate),data=buffer.getChannelData(0);
    for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);
    const source=audio.createBufferSource(),filter=audio.createBiquadFilter(),gain=audio.createGain();source.buffer=buffer;filter.type='lowpass';filter.frequency.value=900;gain.gain.value=volume;source.connect(filter);filter.connect(gain);gain.connect(master);source.start();
  }
  function tone(frequency,duration=.18,volume=.15){if(!audio||muted)return;const oscillator=audio.createOscillator(),gain=audio.createGain();oscillator.frequency.value=frequency;gain.gain.setValueAtTime(volume,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);oscillator.connect(gain);gain.connect(master);oscillator.start();oscillator.stop(audio.currentTime+duration);}
  function release(){keys.clear();dragging=false;if(document.pointerLockElement)document.exitPointerLock();}
  function capture(){canvas.focus();try{const result=canvas.requestPointerLock?.();result?.catch(()=>{});}catch{/* Arrow keys and drag work without pointer capture. */}}
  function refresh(){world.sync(stage,keptLight);$('objective').textContent=stage===11?(keptLight?'RUN — hold Shift. Return through the service door to 404.':'RUN — hold Shift. Return through the service door to apartment 000.'):objectives[stage];$('clock').textContent=stage===0?'00:07':stage<10?'00:08':keptLight?'00:09':'00:00';}
  function resume(){startAudio();paused=false;keys.clear();if(pause.open)pause.close();capture();}
  async function enterFullscreen(){
    try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen?.();}catch{/* Keep windowed play available when fullscreen is blocked. */}
    resume();
  }
  function reset(){stopCall();stage=0;keptLight=false;choicePending=false;yaw=0;pitch=-.03;playedScares.clear();scareTimer=0;pull=0;stepTime=0;beatTime=0;world.tension(0);world.clearScare();$('scare').hidden=true;world.camera.position.set(0,1.6,3.1);closeAction=null;if(reading.open)reading.close();refresh();}
  $('begin').onclick=()=>{started=true;$('menu').hidden=true;$('menu').style.display='none';document.body.classList.remove('in-menu');startAudio();enterFullscreen();};
  $('resume').onclick=enterFullscreen;
  $('restart').onclick=()=>{reset();resume();};
  $('mute').onclick=()=>{muted=!muted;if(master)master.gain.value=muted?0:volume;$('mute').textContent=`Sound: ${muted?'off':'on'}`;};
  function showPause(){if(!started||reading.open||pause.open)return;paused=true;release();pause.showModal();$('resume').focus();}
  function read(number,title,paragraphs,panel=0,after=null,button='Put the page down'){
    stopCall();$('replay-call').hidden=true;$('call-status').hidden=true;
    paused=true;release();closeAction=after;
    choicePending=false;$('other-choice').hidden=true;
    $('page-number').textContent=number;$('page-title').textContent=title;
    $('page-copy').replaceChildren(...paragraphs.map(text=>{const p=document.createElement('p');p.textContent=text;return p;}));
    const art=reading.querySelector('.panel-art');art.style.backgroundSize='auto 300%';art.style.backgroundPosition=`center ${panel*50}%`;
    $('close-page').textContent=button;reading.showModal();$('close-page').focus();
  }
  function closeReading(){if(!reading.open)return;stopCall();reading.close();const action=closeAction;closeAction=null;choicePending=false;action?.();refresh();resume();}
  $('close-page').onclick=closeReading;
  reading.addEventListener('cancel',event=>{event.preventDefault();if(choicePending)closeAction=null;closeReading();});
  pause.addEventListener('cancel',event=>{event.preventDefault();resume();});
  function use(){
    if(paused||scareTimer>0||!target)return;
    const id=target.id;
    if(id==='page'&&stage===0){read('THE DELIVERED CHAPTER / 01','Tomorrow, in ink.',[
      'Your room. Your cup. Even the crack beside the window. Someone has drawn every detail.',
      'In the next panel, the telephone rings at 00:08. In the last, you stand outside your own door.',
      'The room on the page has no reader. So who is holding the paper?',
    ],0,()=>{stage=advance(stage,id);tone(740,.3);});}
    else if(id==='phone'){
      if(stage===1){read('00:08 / INCOMING CALL','Your voice. On the line.',[
        '“This is you. A little later. Listen carefully: the woman in 402 is going to tell you I’m dead.”',
        'You haven’t said anything. The voice takes a breath exactly when you do.',
        '“Find the page beneath the red light. Do what it says. Then come home.” A click. Under it, very quietly, a woman says: “Keep it on.”',
      ],0,()=>{stage=advance(stage,id);},'Hang up');
        $('replay-call').hidden=false;$('call-status').hidden=false;playCall();
      }
      else read('THE TELEPHONE','No dial tone.', ['The receiver is warm. As though someone has just put it down.'],0,null,'Set it down');
    }
    else if(id==='door'){
      if(stage===2){stage=advance(stage,id);tone(110,.5);refresh();}
      else if(stage===11){
        stage=advance(stage,id);refresh();tone(110,.5);
        read('BACK AT YOUR DOOR',keptLight?'404. Still yours.':'000. Before you lived here.',keptLight?[
          'The latch opens before you touch it. From 402, Mrs. Arai calls: “You’re late. That’s new.”',
          'You set the soaked panel on the desk. The paper boat, the fuse, the thing beneath the drain: all of it is already drawn on the reverse.',
        ]:[
          'Where 404 should be, three zeroes. You hear the telephone ringing inside, then stop as the latch opens.',
          'Your room is colder. You set the panel on the desk. Under the paper, something keeps scratching.',
        ],0,null,'Go inside');
      }
      else if(stage<2)read('APARTMENT 404','Wait.', ['Something in the room still expects an answer.'],0,null,'Step back');
    }
    else if(id==='neighbor'){
      read('APARTMENT 402 / MRS. ARAI',stage===3?'“We buried you yesterday.”':'“I’m still here.”',stage===3?[
        'A chain catches on the other side of the door. “I watched them carry you down these stairs. Then you came back and asked me to leave the red light on.”',
        '“Every night you turn it off. Every morning I forget your face. Tonight I wrote your name on my wrist.”',
        'You mention the call. A long silence. “You didn’t own a telephone.” The light beneath her door stays on.',
      ]:[keptLight&&stage>=10?'“It’s nine minutes past midnight. It hasn’t been nine minutes past midnight in a very long time.”':'“A page can say anything. Keep one thing in this corridor where you can see it.”'],1,()=>{stage=advance(stage,id);},'Step away from 402');
    }
    else if(id==='hallpage'&&stage===4){read('THE NEXT PAGE / A CORRECTION','Someone edited her out.',[
      'The first panel shows you speaking to Mrs. Arai. Her speech bubble reads: “Turn off the light.” That is not what she said.',
      'In the second, your hand is on the switch. In the third, apartment 402 is an unbroken wall. The caption: THERE WAS NEVER A WITNESS.',
      'At the bottom, in your handwriting: TURN IT OFF. COME HOME. The figure drawn beneath the red lamp has your clothes, but no face.',
    ],1,()=>{stage=advance(stage,id);tone(82,.8);});}
    else if(id==='switch'&&stage===5){
      read('THE UNPRINTED MOMENT','Your hand. Your decision.',[
        'The page has already drawn your finger on the switch. Mrs. Arai is waiting behind her door.',
        'On the back of the page: a courtyard bench, a paper boat, and the missing panel caught beneath a storm drain. Arai whispers through the wall: “Bring that panel back. It’s the first time you see its face.”',
        'The service-door latch clicks. Before you go outside, decide what to leave behind.',
      ],1,()=>{keptLight=false;stage=advance(stage,id);tone(65,.7);},'Turn it off — follow the page');
      choicePending=true;const other=$('other-choice');other.hidden=false;other.textContent='Leave it on — trust the witness';other.onclick=()=>{closeAction=()=>{keptLight=true;stage=advance(stage,id);tone(440,.5);};closeReading();};
    }
    else if(id==='exit'&&stage===6){stage=advance(stage,id);tone(105,.6);refresh();}
    else if(id==='boat'&&stage===7){
      read('THE COURTYARD / A CHILDHOOD GAME','You made this when you were eight.',[
        'A paper boat on a dry bench. The rain falls everywhere except here. You remember folding this shape with your father. You have never told anyone in this building.',
        'Inside: a ceramic fuse wrapped in a page from your childhood notebook. Someone has drawn your adult face on every child.',
        'A note: POWER FIRST. THEN REACH INTO THE DRAIN. Behind you, a swing starts to move.',
      ],1,()=>{stage=advance(stage,id);},'Take the fuse');
    }
    else if(id==='flat'&&stage===8){
      read('APARTMENT 401 / THE TENANT','She has been waiting behind the chain.',[
        'A woman opens the door only far enough to show one eye. “You heard the telephone, didn’t you? It always calls the newest tenant first.”',
        'A child’s drawing beside the latch shows a tall figure with no face, only a red line where a mouth should be.',
        '“It is empty,” she says. “It borrows the voice of whoever answers. Take the fuse. When the courtyard goes dark, do not look up.”',
      ],1,()=>{stage=advance(stage,id);tone(58,.6);},'Take the fuse');
    }
    else if(id==='power'&&stage===9){
      stage=advance(stage,id);tone(160,.5);refresh();
      read('POWER RESTORED','The courtyard has been waiting.',[
        'The fuse clicks into place. Follow the light to the FAR WALL, past the swing. The barred opening beneath the RED LAMP is the storm drain. A page is trapped inside.',
        'The voice beneath it sounds like your father. “You dropped your picture. Come closer.”',
        'Your father never called you by the name it uses. Get close, look at the trapped page, and HOLD E to pull it out. If you let go, it pulls the page back.',
      ],1,null,'Find the missing panel');
    }
    else if(id==='finalpage'&&stage===12){
      stage=advance(stage,id);refresh();
      read(keptLight?'ENDING 02 / OUTSIDE THE FRAME':'ENDING 01 / THE DELIVERY',keptLight?'One minute nobody wrote.':'You know this hand.',keptLight?[
        'The page shows the corridor, the red light, and Mrs. Arai’s door. Underneath is an empty panel. No instructions. No picture of you.',
        'Arai’s signature crosses the figure’s face. The red light you left on has kept her memory intact. For the first time, the creature on the page is looking away from you.',
        'Your clock changes to 00:09. In the courtyard, the swing stops. You fold the page into a boat and leave it on the desk. This time, nothing tells you what happens next.',
      ]:[
        'Panel Zero: your hand feeding a page beneath the door of 404. Behind you, apartment 402 has been painted over.',
        'The next panel shows you at the telephone. Your fingers have creases instead of joints. Bringing the page home gave it the final piece of your face.',
        '“This is you. A little later.” Outside, someone leaves a paper boat on the bench. You hear your father’s voice practicing in the drain. The next tenant is already awake.',
      ],keptLight?1:2,()=>reset(),'Begin another reading');
    }
    else if(id==='cup')read('AN EVERYDAY OBJECT','Still warm.', ['A ring of coffee stains the desk. On the page, the cup was on the other side of the telephone.','You live alone. You are almost certain.'],0,null,'Leave it');
    else if(id==='books')read('THE SHELF','All the same ending.', ['Every book has a different cover. Every last page says: “And then the tenant answered the door.”'],0,null,'Leave the books');
    else if(id==='bed')read('THE FUTON','Someone slept here.', ['The pillow holds the shape of a head. You haven’t been home since yesterday.'],0,null,'Step back');
  }
  addEventListener('keydown',event=>{
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(event.key)&&!reading.open&&!pause.open)event.preventDefault();
    if(event.code==='Escape'&&!paused){event.preventDefault();showPause();return;}
    if(paused)return;
    keys.add(event.code);if(event.code==='KeyE'&&!event.repeat)use();
  });
  addEventListener('keyup',event=>keys.delete(event.code));
  addEventListener('blur',()=>{keys.clear();if(!call.paused){call.pause();$('call-status').textContent='Call paused. Press Replay call to listen again.';}showPause();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){call.pause();if(reading.open&&!$('replay-call').hidden)$('call-status').textContent='Call paused. Press Replay call to listen again.';showPause();}});
  document.addEventListener('pointerlockchange',()=>{if(!document.pointerLockElement&&!paused)showPause();});
  canvas.addEventListener('pointerdown',()=>{if(!paused)dragging=true;});
  addEventListener('pointerup',()=>{dragging=false;});
  addEventListener('mousemove',event=>{if(!paused&&scareTimer===0&&(document.pointerLockElement===canvas||dragging)){yaw-=event.movementX*mouseSensitivity;pitch-=event.movementY*mouseSensitivity;pitch=T.MathUtils.clamp(pitch,-1.15,1.15);}});
  function pick(){
    world.camera.getWorldDirection(forward);target=null;let best=0;
    for(const object of world.objects){
      if(object.id==='page'&&stage!==0||object.id==='hallpage'&&stage!==4||object.id==='switch'&&stage!==5||object.id==='finalpage'&&stage!==12||object.id==='door'&&stage>=3&&stage!==11||object.id==='neighbor'&&stage<3)continue;
      if(['exit','boat','flat','power','drain'].includes(object.id)&&stage!==({exit:6,boat:7,flat:8,power:9,drain:10})[object.id])continue;
      if(object.id==='neighbor'&&stage>=6&&!keptLight)continue;
      // Only offer room props on the room side of the entrance.
      if(world.camera.position.z < -3.4 && !['door','hallpage','neighbor','switch','exit','boat','flat','power','drain'].includes(object.id))continue;
      direction.copy(object.position).sub(world.camera.position);const distance=direction.length();
      if(distance>2.15)continue;const facing=direction.normalize().dot(forward);
      const score=facing-distance*.08;if(facing>.65&&score>best){best=score;target=object;}
    }
    $('prompt').textContent=target?(target.id==='drain'?`HOLD E — ${pull>0?'Something is pulling back… '+Math.round(pull/3*100)+'%':'Pull the trapped page free'}`:`E  —  ${target.name}`):'';
  }
  let previous=performance.now();
  function frame(now){
    const dt=Math.min((now-previous)/1000,.04);previous=now;
    if(!paused){
      const scare=nextScare(stage,world.camera.position.z,playedScares);
      if(scare){playedScares.add(scare);scareTimer=scare==='drain'?1.1:.9;keys.clear();$('prompt').textContent='';world.scare(scare);$('scare').hidden=scare!=='drain';impact(scare==='drain'?.8:.4,.65);tone(scare==='gate'?65:scare==='boat'?210:46,.7,.45);tone(730,.13,.2);}
      scareTimer=Math.max(0,scareTimer-dt);if(scareTimer===0)$('scare').hidden=true;
    }
    if(!paused&&scareTimer===0){
      yaw+=((keys.has('ArrowLeft')?1:0)-(keys.has('ArrowRight')?1:0))*dt*1.5;
      pitch=T.MathUtils.clamp(pitch+((keys.has('ArrowUp')?1:0)-(keys.has('ArrowDown')?1:0))*dt*1.2,-1.15,1.15);
      let dx=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0),dz=(keys.has('KeyS')?1:0)-(keys.has('KeyW')?1:0);
      const length=Math.hypot(dx,dz)||1;dx/=length;dz/=length;
      const moving=dx!==0||dz!==0,sprinting=keys.has('ShiftLeft')||keys.has('ShiftRight');
      const speed=(sprinting?2.8:1.65)*dt,x=world.camera.position.x+(dx*Math.cos(yaw)+dz*Math.sin(yaw))*speed,z=world.camera.position.z+(-dx*Math.sin(yaw)+dz*Math.cos(yaw))*speed;
      const oldX=world.camera.position.x,oldZ=world.camera.position.z;
      if(canWalk(x,world.camera.position.z,stage))world.camera.position.x=x;
      if(canWalk(world.camera.position.x,z,stage))world.camera.position.z=z;
      if(moving&&(world.camera.position.x!==oldX||world.camera.position.z!==oldZ)){stepTime+=dt;if(stepTime>(sprinting?.3:.5)){stepTime=0;impact(.09,.25);tone(85,.09,.17);}}else stepTime=0;
      world.camera.rotation.set(pitch,yaw,0,'YXZ');pick();
      if(stage===10){
        pull=pullProgress(pull,target?.id==='drain'&&keys.has('KeyE'),dt);
        world.tension(pull/3,reduced);
        if(pull>0){beatTime+=dt;if(beatTime>.5-pull*.1){beatTime=0;impact(.12,.2+pull*.08);tone(48,.15,.2);}}
        if(pull===3){stage=advance(stage,'drain');pull=0;world.tension(0);refresh();}
      }
      if(stage===11){beatTime+=dt;if(beatTime>.65){beatTime=0;tone(52,.18,.3);}}

    }
    world.animate(paused?0:dt,now/1000,reduced);requestAnimationFrame(frame);
  }
  refresh();world.camera.rotation.set(pitch,yaw,0,'YXZ');requestAnimationFrame(frame);
}
