setTimeout(() => {
  'use strict';
  const mount = document.getElementById('threeScene');
  if (!mount) return;

  const IMG = 'https://pngimg.com/uploads/motherboard/motherboard_PNG3.png';
  const parts = {
    cpu:{name:'CPU — المعالج',x:58,y:44,w:19,h:25,label:'CPU Socket'},
    ram:{name:'RAM — الرامات',x:79,y:43,w:15,h:35,label:'DIMM'},
    gpu:{name:'GPU — كارت الشاشة',x:49,y:67,w:43,h:12,label:'PCIe x16'},
    ssd:{name:'NVMe SSD',x:63,y:59,w:20,h:9,label:'M.2'},
    cooler:{name:'CPU Cooler — المشتت',x:58,y:44,w:21,h:28,label:'CPU Cooler'},
    psu:{name:'PSU — الباور سبلاي',x:12,y:87,w:25,h:9,label:'PSU'},
    power:{name:'Power Cables — كابلات الطاقة',x:91,y:62,w:8,h:25,label:'POWER'}
  };
  let selected = null;
  const installed = new Set();

  const toolbar = mount.parentElement?.querySelector('.scene-toolbar');
  const help = mount.parentElement?.querySelector('.scene-help');
  if (toolbar) toolbar.innerHTML = '<span class="real-mode-badge">🧰 وضع التركيب السهل</span>';
  if (help) help.innerHTML = '<span>1️⃣ اختار القطعة</span><span>2️⃣ اضغط مكانها</span><span>3️⃣ القطعة تثبت تلقائيًا</span>';

  mount.innerHTML = `<div class="real-lab" dir="rtl"><div class="real-stage"><div class="board-wrap"><img src="${IMG}" class="real-board" alt="مازر بورد حقيقية من أعلى" draggable="false"><div class="hotspots"></div><div class="installed"></div></div></div><div class="real-help"><div><b>الخطوة الحالية</b><span id="realStep">اختار CPU من القائمة</span></div><p id="realTip">💡 مش محتاج تلف القطعة. اختارها ثم اضغط على مكانها الصحيح في الصورة.</p></div></div>`;

  const style = document.createElement('style');
  style.textContent = `.real-lab{height:100%;min-height:560px;padding:12px;display:grid;grid-template-rows:1fr auto;gap:12px;box-sizing:border-box}.real-stage{min-height:450px;display:grid;place-items:center;border:1px solid rgba(0,220,255,.22);border-radius:18px;background:#050912;overflow:hidden}.board-wrap{position:relative;width:min(94%,820px);aspect-ratio:640/430}.real-board{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;user-select:none;filter:drop-shadow(0 15px 25px rgba(0,0,0,.5))}.hotspots,.installed{position:absolute;inset:0}.hotspot{position:absolute;transform:translate(-50%,-50%);border:2px dashed #ffd84a;background:rgba(255,216,74,.10);border-radius:9px;cursor:pointer;z-index:3;transition:.18s}.hotspot:hover,.hotspot.active{background:rgba(255,216,74,.25);box-shadow:0 0 22px rgba(255,216,74,.45);transform:translate(-50%,-50%) scale(1.04)}.hotspot.done{border-color:#4cff9a;background:rgba(76,255,154,.2)}.hotspot span{position:absolute;right:0;top:-27px;white-space:nowrap;background:#07111b;color:#fff;border:1px solid rgba(0,220,255,.25);border-radius:7px;padding:4px 7px;font-size:10px;font-weight:700}.placed{position:absolute;transform:translate(-50%,-50%);display:grid;place-items:center;background:linear-gradient(135deg,#11cfe8,#5365ff);border:2px solid #fff;color:#fff;font-weight:800;border-radius:8px;z-index:4;animation:snap .3s ease;pointer-events:none}@keyframes snap{from{opacity:0;transform:translate(-50%,-50%) scale(.5)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}.real-help{display:grid;grid-template-columns:1fr 2fr;gap:10px}.real-help>div,.real-help>p{margin:0;padding:10px 12px;border:1px solid rgba(0,220,255,.16);border-radius:11px;background:rgba(10,18,28,.9);line-height:1.7}.real-help b{display:block;color:#62eaff;font-size:11px}.real-help span{color:#fff;font-weight:700}.real-help p{color:#dceaf2}.real-mode-badge{padding:7px 11px;border:1px solid rgba(0,220,255,.22);border-radius:9px;color:#8fefff}@media(max-width:850px){.real-help{grid-template-columns:1fr}.real-stage{min-height:360px}.real-lab{min-height:500px}}`;
  document.head.appendChild(style);

  const hotspots = mount.querySelector('.hotspots');
  const placed = mount.querySelector('.installed');
  const step = mount.querySelector('#realStep');
  const tip = mount.querySelector('#realTip');
  const names = Object.keys(parts);

  function status(t){const s=document.getElementById('sceneStatus');if(s)s.textContent=t;if(step)step.textContent=t;}
  function info(type){const p=parts[type];const title=document.getElementById('infoTitle'),text=document.getElementById('infoText'),box=document.getElementById('selectedBox');if(title)title.textContent=p.name;if(text)text.textContent='اضغط على '+p.label+' في الصورة لتركيب القطعة مباشرة.';if(box)box.innerHTML='<b>'+p.name+'</b><br>اضغط على '+p.label+' في المازربورد.';if(tip)tip.textContent='🎯 '+p.name+' مختارة — اضغط على المنطقة الصفراء في الصورة.';}
  function xp(){const old=Number(localStorage.getItem('cyberComputerXP')||0),next=old+25;localStorage.setItem('cyberComputerXP',String(next));['xp','quizXP','buildXP'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=id==='quizXP'?next+' XP':next;});}
  function install(type){if(!selected||installed.has(type))return;const p=parts[type];installed.add(type);selected=null;xp();const el=document.createElement('div');el.className='placed';el.style.left=p.x+'%';el.style.top=p.y+'%';el.style.width=Math.max(7,p.w*.72)+'%';el.style.height=Math.max(5,p.h*.65)+'%';el.textContent=type==='cpu'?'CPU':type==='ram'?'RAM':type==='gpu'?'GPU':type==='ssd'?'NVMe':type==='cooler'?'COOLER':type==='psu'?'PSU':'POWER';placed.appendChild(el);[...hotspots.children].forEach(h=>{if(h.dataset.type===type){h.classList.remove('active');h.classList.add('done');}});const count=installed.size,pct=Math.round(count/7*100);const c=document.getElementById('buildCount'),pc=document.getElementById('buildPercent'),bar=document.getElementById('progressBar');if(c)c.textContent=count;if(pc)pc.textContent=pct+'%';if(bar)bar.style.width=pct+'%';const ready=document.getElementById('readyBox');if(ready)ready.innerHTML=count===7?'🏆 <b>اكتمل التجميع!</b><br><small>كل القطع الأساسية مركبة.</small>':'🟢 <b>تم تركيب '+p.name+'</b><br><small>اختار القطعة التالية.</small>';status('✅ '+p.name+' اتثبتت في مكانها الصحيح — +25 XP');}

  names.forEach(type=>{const p=parts[type],h=document.createElement('button');h.type='button';h.className='hotspot';h.dataset.type=type;h.style.left=p.x+'%';h.style.top=p.y+'%';h.style.width=p.w+'%';h.style.height=p.h+'%';h.innerHTML='<span>'+p.label+'</span>';h.addEventListener('click',()=>{if(installed.has(type)){status('ℹ️ '+p.name+' مركبة بالفعل.');return}if(selected===type){install(type);return}selected=type;info(type);h.classList.add('active');status('🎯 '+p.name+' مختارة — اضغط مرة أخرى على مكانها.');});hotspots.appendChild(h);});
  document.querySelectorAll('.part-choice').forEach(btn=>btn.addEventListener('click',()=>{const type=btn.dataset.part;if(!parts[type]||installed.has(type))return;selected=type;info(type);document.querySelectorAll('.hotspot').forEach(h=>h.classList.remove('active'));const h=hotspots.querySelector('[data-type="'+type+'"]');if(h)h.classList.add('active');status('🎯 '+parts[type].name+' مختارة — اضغط على مكانها في الصورة.');}));
  const reset=document.getElementById('resetBuild');if(reset)reset.addEventListener('click',()=>{installed.clear();selected=null;placed.innerHTML='';document.querySelectorAll('.hotspot').forEach(h=>h.classList.remove('active','done'));const c=document.getElementById('buildCount'),pc=document.getElementById('buildPercent'),bar=document.getElementById('progressBar');if(c)c.textContent='0';if(pc)pc.textContent='0%';if(bar)bar.style.width='0%';status('جاهز — اختار قطعة ثم اضغط على مكانها في المازربورد الواقعية.');});
  status('جاهز — مازر بورد واقعية. اختار CPU ثم اضغط على CPU Socket.');
}, 120);