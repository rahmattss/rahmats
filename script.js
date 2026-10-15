const $ = (id) => document.getElementById(id);
let food = 12, fish = 10, happy = 100, clean = 95, relax = false, toastTimer;
let audioCtx = null, soundEnabled = false, ambientTimer = null, lampOn = true;
function audioReady(){if(!audioCtx){const AC=window.AudioContext||window.webkitAudioContext;if(AC)audioCtx=new AC()}if(audioCtx&&audioCtx.state==='suspended')audioCtx.resume();return audioCtx}
function tone(freq=440,duration=.12,type='sine',volume=.035,slide=0){const ctx=audioReady();if(!ctx)return;const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(freq,ctx.currentTime);if(slide)osc.frequency.exponentialRampToValueAtTime(Math.max(25,freq+slide),ctx.currentTime+duration);gain.gain.setValueAtTime(.0001,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(volume,ctx.currentTime+.015);gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+duration+.03)}
function playSound(kind){if(!soundEnabled)return;if(kind==='feed'){tone(760,.12,'sine',.045,-250);setTimeout(()=>tone(420,.2,'triangle',.035,-120),90);setTimeout(()=>tone(620,.1,'sine',.025,120),180)}else if(kind==='bubble'){for(let i=0;i<4;i++)setTimeout(()=>tone(280+Math.random()*500,.18,'sine',.025,120),i*65)}else if(kind==='fish'){tone(540,.1,'sine',.03,180);setTimeout(()=>tone(820,.17,'sine',.03,-120),100)}else if(kind==='clean'){tone(320,.22,'triangle',.035,280);setTimeout(()=>tone(720,.24,'sine',.025,90),170)}}
function ambientSound(){if(!soundEnabled||!audioCtx)return;const ctx=audioReady(),length=Math.floor(ctx.sampleRate*.8),buffer=ctx.createBuffer(1,length,ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*.12;const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();src.buffer=buffer;filter.type='lowpass';filter.frequency.value=420;gain.gain.value=.012;src.connect(filter);filter.connect(gain);gain.connect(ctx.destination);src.start();src.stop(ctx.currentTime+.8)}
function toast(message){const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600)}
function updateStats(){
  $('foodCount').textContent=food;$('fishCount').textContent=fish;$('happyCount').textContent=happy+'%';
  $('cleanValue').textContent=clean+'%';$('cleanBar').style.width=clean+'%';
  $('moodLabel').textContent=happy>70?'Ekosistem sehat':happy>40?'Butuh perhatian':'Saatnya merawat';
  $('careTip').textContent=clean>75?'Kondisi akuarium terlihat sangat baik.':clean>45?'Air mulai keruh. Tekan Bersihkan Air untuk melihat perubahan.':'Air sangat keruh! Segera gunakan fitur Bersihkan Air.';
  const tank=$('tank');tank.style.setProperty('--dirt-level',String((100-clean)/100*.78));
  tank.classList.toggle('dirty-water',clean<75);
  $('waterStatus').textContent=clean>75?'AIR JERNIH':clean>45?'AIR MULAI KERUH':'AIR SANGAT KERUH';
  $('waterStatus').style.color=clean>75?'#b8f8ff':clean>45?'#f8df8b':'#ffb2a7';
}
function dropFood(){
  const tank=$('tank'), pellet=document.createElement('i');
  pellet.className='food-pellet';pellet.style.left=(15+Math.random()*70)+'%';
  pellet.style.animationDuration=(1.4+Math.random()*.6)+'s';tank.appendChild(pellet);
  // Setelah pelet jatuh sebentar, ikan terdekat mengejarnya lalu pelet menghilang saat dimakan.
  setTimeout(()=>{
    if(!pellet.isConnected)return;
    const fishes=[...$('tankFish').querySelectorAll('.swim')].filter(f=>!f.classList.contains('extra-fish')||f.isConnected);
    if(!fishes.length){pellet.remove();return}
    const pr=pellet.getBoundingClientRect();
    let target=fishes[0],best=Infinity;
    for(const f of fishes){const r=f.getBoundingClientRect();const d=Math.hypot((r.left+r.width/2)-(pr.left+pr.width/2),(r.top+r.height/2)-(pr.top+pr.height/2));if(d<best){best=d;target=f}}
    target.classList.add('chasing-food');
    const tr=target.getBoundingClientRect(),tankRect=tank.getBoundingClientRect();
    pellet.style.animation='none';pellet.style.transition='left .65s ease-in, top .65s ease-in, opacity .65s ease-in, transform .65s ease-in';
    pellet.style.left=(tr.left+tankRect.left*-1+tr.width/2-3)+'px';
    pellet.style.top=(tr.top-tankRect.top+tr.height/2-3)+'px';
    pellet.style.transform='scale(.25)';pellet.style.opacity='0';
    setTimeout(()=>{pellet.remove();target.classList.remove('chasing-food');target.classList.add('nibble');setTimeout(()=>target.classList.remove('nibble'),650)},650);
  },900);
  setTimeout(()=>pellet.remove(),4000);
}
function feed(){if(food<=0){toast('Makanan habis! Tekan “Isi Ulang Makanan” 🥣');$('tankMessage').textContent='Stok makanan habis. Isi ulang sebelum memberi makan lagi.';return}food--;playSound('feed');happy=Math.min(100,happy+3);clean=Math.max(15,clean-7);updateStats();toast('🍤 Makanan ditebarkan! Lihat ikan mengejar peletnya.');$('tankMessage').textContent='Nyam! Ikan-ikan mengejar pelet dan memakannya.';for(let i=0;i<8;i++){makeBubble(true);dropFood()}}
function makeBubble(foodBubble=false){const b=document.createElement('i');b.className='bubble';b.style.left=(Math.random()*96+2)+'%';b.style.animationDuration=(3+Math.random()*3)+'s';b.style.width=b.style.height=(5+Math.random()*9)+'px';$('tankBubbles').appendChild(b);setTimeout(()=>b.remove(),6500)}
$('feedBtn').addEventListener('click',feed);$('feedHero').addEventListener('click',feed);
$('bubbleBtn').addEventListener('click',()=>{playSound('bubble');for(let i=0;i<22;i++)setTimeout(()=>makeBubble(),i*70);clean=Math.min(100,clean+1);updateStats();toast('🫧 Gelembung baru memenuhi akuarium!')});
$('addFishBtn').addEventListener('click',()=>{if(fish>=14){toast('Akuariummu sudah penuh! Maksimal 14 ikan.');return}fish++;playSound('fish');happy=Math.max(70,happy-1);const emojis=['🐠','🐟','🐡'];const el=document.createElement('span');el.className='swim';el.textContent=emojis[Math.floor(Math.random()*emojis.length)];el.style.top=(15+Math.random()*65)+'%';el.style.left=(5+Math.random()*80)+'%';el.style.animationDelay=(-Math.random()*8)+'s';$('tankFish').appendChild(el);updateStats();toast('🐟 Penghuni baru bergabung ke akuarium!')});

$('cleanBtn').addEventListener('click',()=>{
  const before=clean;clean=Math.min(100,clean+35);happy=Math.min(100,happy+4);
  $('tank').classList.remove('cleaning-water');void $('tank').offsetWidth;$('tank').classList.add('cleaning-water');
  playSound('clean');updateStats();
  for(let i=0;i<28;i++)setTimeout(()=>makeBubble(),i*45);
  $('tankMessage').textContent=before<75?'✨ Air kembali jernih! Kotoran tersapu dan ikan lebih nyaman.':'💧 Air sudah segar dan terawat!';
  toast('💧 Air dibersihkan! Kebersihan naik menjadi '+clean+'%.');
  setTimeout(()=>$('tank').classList.remove('cleaning-water'),1900);
});
$('soundBtn').addEventListener('click',()=>{soundEnabled=!soundEnabled;$('soundBtn').querySelector('b').textContent='Suara Akuarium: '+(soundEnabled?'Aktif':'Mati');$('soundBtn').querySelector('span').textContent=soundEnabled?'🔊':'🔇';$('soundBtn').querySelector('small').textContent=soundEnabled?'Efek makan, gelembung, ikan, dan ambience air aktif':'Aktifkan ambience air dan efek suara';if(soundEnabled){audioReady();playSound('bubble');ambientSound();ambientTimer=setInterval(ambientSound,1300);toast('🔊 Suara akuarium diaktifkan.')}else{clearInterval(ambientTimer);ambientTimer=null;toast('🔇 Suara akuarium dimatikan.')}});


$('refillBtn').addEventListener('click',()=>{
  if(food>=60){toast('🥣 Stok makanan sudah penuh! Maksimal 60 porsi.');return}
  food=Math.min(60,food+12);playSound('feed');updateStats();
  $('tankMessage').textContent='Persediaan makanan sudah diisi ulang.';
  toast('🥣 Berhasil isi ulang! Stok sekarang '+food+' porsi.');
});
$('lampBtn').addEventListener('click',()=>{
  lampOn=!lampOn;$('tank').classList.toggle('lamp-off',!lampOn);
  $('lampBtn').querySelector('b').textContent='Lampu Akuarium: '+(lampOn?'Nyala':'Redup');
  $('lampBtn').querySelector('span').textContent=lampOn?'💡':'🌘';
  $('tankMessage').textContent=lampOn?'Lampu akuarium menyala, ikan terlihat jelas.':'Lampu diredupkan untuk suasana malam yang tenang.';
  toast(lampOn?'💡 Lampu akuarium dinyalakan.':'🌘 Pencahayaan diredupkan.');
});
$('treasureBtn').addEventListener('click',()=>{
  const reward=Math.random();playSound('bubble');
  if(reward<.65){const bonus=3+Math.floor(Math.random()*5);food=Math.min(60,food+bonus);updateStats();toast('🪙 Kamu menemukan '+bonus+' porsi makanan!');$('tankMessage').textContent='Harta karun ditemukan di antara pasir!';}
  else{happy=Math.min(100,happy+5);clean=Math.min(100,clean+3);updateStats();toast('✨ Harta karun ajaib! Kebahagiaan ikan +5%.');$('tankMessage').textContent='Kilauan harta karun membuat ikan-ikan penasaran.';}
  for(let i=0;i<8;i++)setTimeout(()=>makeBubble(),i*60);
});

$('relaxBtn').addEventListener('click',()=>{relax=!relax;document.body.classList.toggle('relax-mode',relax);$('relaxBtn').querySelector('b').textContent=relax?'Keluar Mode Santai':'Mode Santai';$('tankMessage').textContent=relax?'Tarik napas, rileks, dan nikmati lautan.':'Ikan-ikanmu sedang berenang dengan bahagia.';toast(relax?'🌙 Mode santai aktif. Nikmati suasana!':'Mode santai dinonaktifkan.')});
$('themeToggle').addEventListener('click',()=>{document.body.classList.toggle('light');const light=document.body.classList.contains('light');$('themeToggle').textContent=light?'☀ Mode Terang':'☾ Mode Malam';toast(light?'Mode terang diaktifkan ☀':'Mode malam diaktifkan 🌙')});
document.querySelectorAll('.theme-card').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.theme-card').forEach(x=>x.classList.remove('active'));btn.classList.add('active');const t=btn.dataset.theme;const tank=$('tank'), art=document.querySelector('.hero-art');const palettes={tropical:['#1595be','#075078','#042239'],deep:['#5550a3','#18234f','#020a22'],coral:['#f4a56d','#b84b70','#401d4e'],mint:['#80e5cb','#168c9b','#063d5d']};const p=palettes[t];tank.style.background=`radial-gradient(ellipse at 45% 0%,${p[0]},${p[1]} 48%,${p[2]})`;art.style.background=`radial-gradient(ellipse at 48% 8%,${p[0]},transparent 32%),linear-gradient(180deg,${p[1]},${p[2]} 100%)`;toast('Tema '+btn.querySelector('b').textContent.replace(/^\\S+\\s/,'')+' berhasil diterapkan!')}));
const details={Clownfish:['🐠','Ikan kecil berwarna oranye yang aktif dan ramah.'], 'Blue Tang':['🐟','Ikan biru yang senang berenang menjelajahi akuarium.'],Pufferfish:['🐡','Ikan unik yang menjadi pusat perhatian di akuarium.'],'Coral Fish':['🐠','Ikan karang yang suka berenang di sekitar tanaman.'],'Little Sardine':['🐟','Ikan kecil yang tampak cantik ketika berenang bersama.'],'Golden Fish':['🐠','Ikan keemasan yang menambah warna ceria di akuarium.']};
document.querySelectorAll('.fish-card').forEach(btn=>btn.addEventListener('click',()=>{const name=btn.dataset.name;const d=details[name];$('detailEmoji').textContent=d[0];$('detailName').textContent=name;$('detailDesc').textContent=d[1];$('fishDetail').hidden=false;$('fishDetail').scrollIntoView({behavior:'smooth',block:'nearest'})}));
$('closeDetail').addEventListener('click',()=>$('fishDetail').hidden=true);
for(let i=0;i<18;i++)setTimeout(()=>makeBubble(),i*280);
for(let i=0;i<34;i++){const p=document.createElement('i');p.className='water-particle';p.style.left=(Math.random()*100)+'%';p.style.top=(35+Math.random()*65)+'%';p.style.animationDelay=(-Math.random()*8)+'s';p.style.animationDuration=(6+Math.random()*7)+'s';$('waterParticles').appendChild(p)}
setInterval(()=>{if(!relax && Math.random()>.6){happy=Math.max(60,happy-1);updateStats()}},30000);
updateStats();

// V5 game layer: coins, shop, daily-style missions, hunger, autosave and movable decor.
let coins = 30, hunger = 100;
const fishTypes = {clown:{name:'Ikan Badut',emoji:'🐠',price:10},puffer:{name:'Ikan Buntal',emoji:'🐡',price:12},tang:{name:'Blue Tang',emoji:'🐟',price:14},gold:{name:'Ikan Mas',emoji:'🐠',price:8},turtle:{name:'Kura-kura',emoji:'🐢',price:18}};
let fishInventory = {clown:0,puffer:0,tang:0,gold:0,turtle:0};
const missionDone = {feed:false, clean:false, bubble:false};
function saveGame(){
  try{
    const decor=[...document.querySelectorAll('.decor-item')].map((el)=>({text:el.textContent,cls:el.className,left:el.style.left,top:el.style.top,bottom:el.style.bottom,right:el.style.right,position:el.style.position}));
    localStorage.setItem('virtualAquariumV6',JSON.stringify({food,fish,happy,clean,coins,hunger,missionDone,fishInventory,decor}));
  }catch(e){}
}
function updateGameUI(){
  $('coinCount').textContent=coins;$('hungerValue').textContent=hunger+'%';$('hungerBar').style.width=hunger+'%';
  $('hungerBar').style.background=hunger<30?'linear-gradient(90deg,#ff6969,#ffb36b)':'linear-gradient(90deg,#26d9a1,#8eea72)';
  for(const key of ['feed','clean','bubble']){const btn=$('claim'+key[0].toUpperCase()+key.slice(1));if(btn){btn.disabled=missionDone[key];btn.textContent=missionDone[key]?'✓ Selesai':'Klaim +5 🪙'}}
  renderInventory();saveGame();
}
function claimMission(key){if(missionDone[key]){toast('Misi ini sudah diklaim.');return}const available=key==='feed'?missionDone.feedAction:key==='clean'?missionDone.cleanAction:missionDone.bubbleAction;if(!available){toast('Selesaikan aktivitas ini terlebih dahulu!');return}missionDone[key]=true;coins+=5;updateGameUI();toast('🏆 Misi selesai! Kamu mendapat 5 koin.');}
missionDone.feedAction=false;missionDone.cleanAction=false;missionDone.bubbleAction=false;
$('claimFeed').addEventListener('click',()=>claimMission('feed'));
$('claimClean').addEventListener('click',()=>claimMission('clean'));
$('claimBubble').addEventListener('click',()=>claimMission('bubble'));
$('feedBtn').addEventListener('click',()=>{missionDone.feedAction=true;hunger=Math.min(100,hunger+18);coins+=1;updateGameUI()});
$('feedHero').addEventListener('click',()=>{missionDone.feedAction=true;hunger=Math.min(100,hunger+18);coins+=1;updateGameUI()});
$('cleanBtn').addEventListener('click',()=>{missionDone.cleanAction=true;updateGameUI()});
$('bubbleBtn').addEventListener('click',()=>{missionDone.bubbleAction=true;updateGameUI()});
function renderInventory(){
  const box=$('fishInventory');if(!box)return;box.innerHTML='';let total=0;
  Object.entries(fishTypes).forEach(([key,item])=>{const count=Number(fishInventory[key]||0);total+=count;if(!count)return;
    const row=document.createElement('div');row.className='inventory-item';
    row.innerHTML=`<span class="inventory-emoji">${item.emoji}</span><div class="inventory-copy"><b>${item.name}</b><small>Stok: ${count}</small></div><button class="release-fish" data-release="${key}" ${fish>=14?'disabled':''}>Masukkan</button>`;box.appendChild(row);
  });
  if(!total)box.innerHTML='<p class="inventory-empty">Belum ada stok ikan. Beli ikan dari toko untuk mengisi inventaris.</p>';
  $('tankCapacity').textContent=fish+' / 14';$('stockTotal').textContent=total;
  box.querySelectorAll('[data-release]').forEach(btn=>btn.addEventListener('click',()=>releaseFish(btn.dataset.release)));
}
function addFishToTank(kind){const item=fishTypes[kind];if(!item)return;const el=document.createElement('span');el.className='swim';el.textContent=item.emoji;el.style.top=(12+Math.random()*65)+'%';el.style.left=(5+Math.random()*80)+'%';el.style.animationDelay=(-Math.random()*8)+'s';$('tankFish').appendChild(el);fish++;happy=Math.min(100,happy+1);playSound('fish');updateStats();}
function releaseFish(kind){if(fish>=14){toast('Akuarium penuh! Maksimal 14 penghuni.');return}if(!fishInventory[kind])return;fishInventory[kind]--;addFishToTank(kind);updateGameUI();toast('🐟 '+fishTypes[kind].name+' dimasukkan ke akuarium!')}
document.querySelectorAll('.shop-item').forEach(btn=>btn.addEventListener('click',()=>{
  const kind=btn.dataset.shop;const price=kind==='food'?5:fishTypes[kind]?.price;
  if(coins<price){toast('Koin belum cukup! Selesaikan misi untuk mendapat koin.');return}
  coins-=price;
  if(kind==='food'){food=Math.min(60,food+10);toast('🍤 Paket pakan dibeli! +10 porsi.');updateStats();}
  else{fishInventory[kind]=(fishInventory[kind]||0)+1;toast('🎒 '+fishTypes[kind].name+' masuk ke inventaris. Tekan “Masukkan” untuk melepasnya ke akuarium.');}
  updateGameUI();
}));
// Penataan dekorasi memakai Pointer Events agar bisa dipakai dengan mouse maupun layar sentuh.
let decorationMode=false, dragItem=null, dragOffsetX=0, dragOffsetY=0;
function decorItems(){return [...document.querySelectorAll('.tank-decor,.tank-plants span,.decor-item')].filter((el,i,a)=>a.indexOf(el)===i)}
function enableDecorItems(){decorItems().forEach(el=>{el.classList.add('decor-item');el.draggable=false;el.style.touchAction=decorationMode?'none':'';el.style.pointerEvents=decorationMode?'auto':'';el.title=decorationMode?'Tekan lalu geser untuk memindahkan':' '})}
enableDecorItems();
$('decorateToggle').addEventListener('click',()=>{
  decorationMode=!decorationMode;document.body.classList.toggle('decorate-mode',decorationMode);enableDecorItems();
  $('decorateToggle').textContent=decorationMode?'✋ Tata Dekorasi: Aktif':'✋ Tata Dekorasi: Mati';
  toast(decorationMode?'Tekan dan geser langsung rumput laut, batu, karang, atau kerang.':'Penataan dekorasi disimpan!');
});
$('tank').addEventListener('pointerdown',e=>{
  if(!decorationMode)return;const item=e.target.closest('.decor-item,.tank-decor,.tank-plants span');if(!item)return;
  e.preventDefault();dragItem=item;const r=item.getBoundingClientRect();dragOffsetX=e.clientX-(r.left+r.width/2);dragOffsetY=e.clientY-(r.top+r.height/2);
  if(item.parentElement!==$('tank'))$('tank').appendChild(item);
  item.classList.add('is-dragging');item.style.position='absolute';item.style.bottom='auto';item.style.right='auto';item.style.zIndex='7';item.style.margin='0';item.style.transform='translate(-50%,-50%)';item.style.left=(e.clientX-$('tank').getBoundingClientRect().left-dragOffsetX)+'px';item.style.top=(e.clientY-$('tank').getBoundingClientRect().top-dragOffsetY)+'px';
  try{item.setPointerCapture(e.pointerId)}catch(err){}
});
window.addEventListener('pointermove',e=>{if(!decorationMode||!dragItem)return;const r=$('tank').getBoundingClientRect();dragItem.style.left=Math.max(8,Math.min(r.width-20,e.clientX-r.left-dragOffsetX))+'px';dragItem.style.top=Math.max(12,Math.min(r.height-42,e.clientY-r.top-dragOffsetY))+'px'});
window.addEventListener('pointerup',()=>{if(!dragItem)return;dragItem.classList.remove('is-dragging');dragItem=null;saveGame();toast('Dekorasi dipindahkan dan disimpan!')});
try{
  const saved=JSON.parse(localStorage.getItem('virtualAquariumV6')||localStorage.getItem('virtualAquariumV5')||'null');
  if(saved){food=Number.isFinite(saved.food)?saved.food:food;fish=Number.isFinite(saved.fish)?saved.fish:fish;happy=Number.isFinite(saved.happy)?saved.happy:happy;clean=Number.isFinite(saved.clean)?saved.clean:clean;coins=Number.isFinite(saved.coins)?saved.coins:coins;hunger=Number.isFinite(saved.hunger)?saved.hunger:hunger;Object.assign(missionDone,saved.missionDone||{});Object.assign(fishInventory,saved.fishInventory||{});
    if(Array.isArray(saved.decor)){const els=decorItems();saved.decor.forEach((d,i)=>{const el=els[i];if(el&&d.text===el.textContent&&d.left&&d.top){el.style.position=d.position||'absolute';el.style.left=d.left;el.style.top=d.top;el.style.bottom=d.bottom||'auto';el.style.right=d.right||'auto';el.style.zIndex='4'}})}
    updateStats();
  }
}catch(e){}
updateGameUI();
setInterval(()=>{if(hunger>0){hunger=Math.max(0,hunger-1);if(hunger<30)happy=Math.max(10,happy-1);updateStats();updateGameUI()}},60000);
