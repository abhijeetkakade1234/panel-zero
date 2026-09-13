import './style.css';
import * as T from 'three';
import { makeRoom } from './scene.js';
import { advance, objectives, canWalk } from './story.js';

const $=id=>document.getElementById(id);
const canvas=$('world'), reading=$('reading'), pause=$('pause');
document.body.classList.add('in-menu');
let world;
try{world=makeRoom(canvas);}catch(error){$('fatal').hidden=false;console.error(error);}
if(world)run();

function run(){
  let stage=0,started=false,paused=true,yaw=0,pitch=-.03,target=null,dragging=false,muted=false,keptLight=false,choicePending=false;
  let audio,master,ringTimer,closeAction=null;
  const keys=new Set();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const forward=new T.Vector3(),direction=new T.Vector3();
  function startAudio(){
    if(audio){audio.resume().catch(()=>{});return;}
    const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
    audio=new Audio();master=audio.createGain();master.gain.value=.12;master.connect(audio.destination);
    const buffer=audio.createBuffer(1,audio.sampleRate*3,audio.sampleRate);const values=buffer.getChannelData(0);
    for(let i=0;i<values.length;i++)values[i]=(Math.random()*2-1)*.15;
    const rain=audio.createBufferSource();rain.buffer=buffer;rain.loop=true;const filter=audio.createBiquadFilter();filter.type='lowpass';filter.frequency.value=1200;rain.connect(filter);filter.connect(master);rain.start();
    const hum=audio.createOscillator();hum.frequency.value=58;const gain=audio.createGain();gain.gain.value=.07;hum.connect(gain);gain.connect(master);hum.start();
    ringTimer=setInterval(()=>{if(stage===1&&!paused)tone(740,.2,.12);},1300);
  }
  function tone(frequency,duration=.18,volume=.15){if(!audio||muted)return;const oscillator=audio.createOscillator(),gain=audio.createGain();oscillator.frequency.value=frequency;gain.gain.setValueAtTime(volume,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);oscillator.connect(gain);gain.connect(master);oscillator.start();oscillator.stop(audio.currentTime+duration);}
  function release(){keys.clear();dragging=false;if(document.pointerLockElement)document.exitPointerLock();}
  function capture(){canvas.focus();try{const result=canvas.requestPointerLock?.();result?.catch(()=>{});}catch{/* Arrow keys and drag work without pointer capture. */}}
  function refresh(){world.sync(stage,keptLight);$('objective').textContent=stage===6?(keptLight?'The light is still on. Go home to 404.':'The light is out. Find apartment 000.'):objectives[stage];$('clock').textContent=stage===0?'00:07':stage<6?'00:08':keptLight?'00:09':'00:00';}
  function resume(){paused=false;keys.clear();if(pause.open)pause.close();capture();}
  function reset(){stage=0;keptLight=false;choicePending=false;yaw=0;pitch=-.03;world.camera.position.set(0,1.6,3.1);closeAction=null;if(reading.open)reading.close();refresh();}
  $('begin').onclick=()=>{started=true;$('menu').hidden=true;$('menu').style.display='none';document.body.classList.remove('in-menu');startAudio();resume();};
  $('resume').onclick=resume;
  $('restart').onclick=()=>{reset();resume();};
  $('mute').onclick=()=>{muted=!muted;if(master)master.gain.value=muted?0:.12;$('mute').textContent=`Sound: ${muted?'off':'on'}`;};
  function showPause(){if(!started||reading.open||pause.open)return;paused=true;release();pause.showModal();$('resume').focus();}
  function read(number,title,paragraphs,panel=0,after=null,button='Put the page down'){
    paused=true;release();closeAction=after;
    choicePending=false;$('other-choice').hidden=true;
    $('page-number').textContent=number;$('page-title').textContent=title;
    $('page-copy').replaceChildren(...paragraphs.map(text=>{const p=document.createElement('p');p.textContent=text;return p;}));
    const art=reading.querySelector('.panel-art');art.style.backgroundSize='auto 300%';art.style.backgroundPosition=`center ${panel*50}%`;
    $('close-page').textContent=button;reading.showModal();$('close-page').focus();
  }
  function closeReading(){if(!reading.open)return;reading.close();const action=closeAction;closeAction=null;choicePending=false;action?.();refresh();resume();}
  $('close-page').onclick=closeReading;
  reading.addEventListener('cancel',event=>{event.preventDefault();if(choicePending)closeAction=null;closeReading();});
  pause.addEventListener('cancel',event=>{event.preventDefault();resume();});
  function use(){
    if(paused||!target)return;
    const id=target.id;
    if(id==='page'&&stage===0){read('THE DELIVERED CHAPTER / 01','Tomorrow, in ink.',[
      'Your room. Your cup. Even the crack beside the window. Someone has drawn every detail.',
      'In the next panel, the telephone rings at 00:08. In the last, you stand outside your own door.',
      'The room on the page has no reader. So who is holding the paper?',
    ],0,()=>{stage=advance(stage,id);tone(740,.3);});}
    else if(id==='phone'){
      if(stage===1)read('00:08 / INCOMING CALL','Your voice. On the line.',[
        '“This is you. A little later. Listen carefully: the woman in 402 is going to tell you I’m dead.”',
        'You haven’t said anything. The voice takes a breath exactly when you do.',
        '“Find the page beneath the red light. Do what it says. Then come home.” A click. Under it, very quietly, a woman says: “Keep it on.”',
      ],0,()=>{stage=advance(stage,id);},'Hang up');
      else read('THE TELEPHONE','No dial tone.', ['The receiver is warm. As though someone has just put it down.'],0,null,'Set it down');
    }
    else if(id==='door'){
      if(stage===2){stage=advance(stage,id);tone(110,.5);refresh();}
      else if(stage===6){
        stage=advance(stage,id);refresh();tone(110,.5);
        read('BACK AT YOUR DOOR',keptLight?'404. Still yours.':'000. Before you lived here.',keptLight?[
          'The latch opens before you touch it. From 402, Mrs. Arai calls: “You’re late. That’s new.”',
          'The phone has stopped ringing. The cup is cold. On the desk, a page you haven’t seen before.',
        ]:[
          'Where 404 should be, three zeroes. You hear the telephone ringing inside, then stop as the latch opens.',
          'Your room is colder. There is a fresh page on the desk. The ink is wet.',
        ],0,null,'Go inside');
      }
      else if(stage<2)read('APARTMENT 404','Wait.', ['Something in the room still expects an answer.'],0,null,'Step back');
    }
    else if(id==='neighbor'){
      read('APARTMENT 402 / MRS. ARAI',stage===3?'“We buried you yesterday.”':'“I’m still here.”',stage===3?[
        'A chain catches on the other side of the door. “I watched them carry you down these stairs. Then you came back and asked me to leave the red light on.”',
        '“Every night you turn it off. Every morning I forget your face. Tonight I wrote your name on my wrist.”',
        'You mention the call. A long silence. “You didn’t own a telephone.” The light beneath her door stays on.',
      ]:[keptLight&&stage>=6?'“It’s nine minutes past midnight. It hasn’t been nine minutes past midnight in a very long time.”':'“A page can say anything. Keep one thing in this corridor where you can see it.”'],1,()=>{stage=advance(stage,id);},'Step away from 402');
    }
    else if(id==='hallpage'&&stage===4){read('THE NEXT PAGE / A CORRECTION','Someone edited her out.',[
      'The first panel shows you speaking to Mrs. Arai. Her speech bubble reads: “Turn off the light.” That is not what she said.',
      'In the second, your hand is on the switch. In the third, apartment 402 is an unbroken wall. The caption: THERE WAS NEVER A WITNESS.',
      'At the bottom, in your handwriting: TURN IT OFF. COME HOME. The figure drawn beneath the red lamp has your clothes, but no face.',
    ],1,()=>{stage=advance(stage,id);tone(82,.8);});}
    else if(id==='switch'&&stage===5){
      read('THE UNPRINTED MOMENT','Your hand. Your decision.',[
        'The page has already drawn your finger on the switch. Mrs. Arai is waiting behind her door.',
        'The voice on the telephone promised you a way home. The woman in 402 asked you to leave something unchanged.',
        'For once, the next panel does not have to be right.',
      ],1,()=>{keptLight=false;stage=advance(stage,id);tone(65,.7);},'Turn it off — follow the page');
      choicePending=true;const other=$('other-choice');other.hidden=false;other.textContent='Leave it on — trust the witness';other.onclick=()=>{closeAction=()=>{keptLight=true;stage=advance(stage,id);tone(440,.5);};closeReading();};
    }
    else if(id==='finalpage'&&stage===7){
      stage=advance(stage,id);refresh();
      read(keptLight?'ENDING 02 / OUTSIDE THE FRAME':'ENDING 01 / THE DELIVERY',keptLight?'One minute nobody wrote.':'You know this hand.',keptLight?[
        'The page shows the corridor, the red light, and Mrs. Arai’s door. Underneath is an empty panel. No instructions. No picture of you.',
        'On the back: “If you can read this, I remembered your face.” Signed Arai. The ink on the signature is still drying.',
        'Your clock changes to 00:09. Somewhere outside the building, a telephone begins to ring. You let it.',
      ]:[
        'Panel Zero: your hand feeding a page beneath the door of 404. Behind you, apartment 402 has been painted over.',
        'The next panel shows you at the telephone, calling someone in a room exactly like this one. You know what you have to say.',
        '“This is you. A little later.” Under the desk, a stack of identical chapters. The top one is dated tomorrow.',
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
  addEventListener('blur',()=>{keys.clear();showPause();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)showPause();});
  document.addEventListener('pointerlockchange',()=>{if(!document.pointerLockElement&&!paused)showPause();});
  canvas.addEventListener('pointerdown',()=>{if(!paused)dragging=true;});
  addEventListener('pointerup',()=>{dragging=false;});
  addEventListener('mousemove',event=>{if(!paused&&(document.pointerLockElement===canvas||dragging)){yaw-=event.movementX*.002;pitch-=event.movementY*.002;pitch=T.MathUtils.clamp(pitch,-1.15,1.15);}});
  function pick(){
    world.camera.getWorldDirection(forward);target=null;let best=0;
    for(const object of world.objects){
      if(object.id==='page'&&stage!==0||object.id==='hallpage'&&stage!==4||object.id==='switch'&&stage!==5||object.id==='finalpage'&&stage!==7||object.id==='door'&&stage>=3&&stage!==6||object.id==='neighbor'&&stage<3)continue;
      if(object.id==='neighbor'&&stage>=6&&!keptLight)continue;
      // Only offer room props on the room side of the entrance.
      if(world.camera.position.z < -3.4 && !['door','hallpage','neighbor','switch'].includes(object.id))continue;
      direction.copy(object.position).sub(world.camera.position);const distance=direction.length();
      if(distance>2.15)continue;const facing=direction.normalize().dot(forward);
      const score=facing-distance*.08;if(facing>.65&&score>best){best=score;target=object;}
    }
    $('prompt').textContent=target?`E  —  ${target.name}`:'';
  }
  let previous=performance.now();
  function frame(now){
    const dt=Math.min((now-previous)/1000,.04);previous=now;
    if(!paused){
      yaw+=((keys.has('ArrowLeft')?1:0)-(keys.has('ArrowRight')?1:0))*dt*1.5;
      pitch=T.MathUtils.clamp(pitch+((keys.has('ArrowUp')?1:0)-(keys.has('ArrowDown')?1:0))*dt*1.2,-1.15,1.15);
      let dx=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0),dz=(keys.has('KeyS')?1:0)-(keys.has('KeyW')?1:0);
      const length=Math.hypot(dx,dz)||1;dx/=length;dz/=length;
      const speed=1.65*dt,x=world.camera.position.x+(dx*Math.cos(yaw)+dz*Math.sin(yaw))*speed,z=world.camera.position.z+(-dx*Math.sin(yaw)+dz*Math.cos(yaw))*speed;
      if(canWalk(x,world.camera.position.z,stage))world.camera.position.x=x;
      if(canWalk(world.camera.position.x,z,stage))world.camera.position.z=z;
      world.camera.rotation.set(pitch,yaw,0,'YXZ');pick();
    }
    world.animate(paused?0:dt,now/1000,reduced);requestAnimationFrame(frame);
  }
  refresh();world.camera.rotation.set(pitch,yaw,0,'YXZ');requestAnimationFrame(frame);
}
