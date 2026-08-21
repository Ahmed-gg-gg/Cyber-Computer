import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/+esm';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js/+esm';

const $ = (s) => document.querySelector(s);
let xp = Number(localStorage.getItem('cyberComputerXP') || 0);
$('#xp').textContent = xp;

// -----------------------------
// 3D BUILD LAB
// -----------------------------
const mount = $('#threeScene');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x070b12);
scene.fog = new THREE.Fog(0x070b12, 18, 32);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
camera.position.set(8.5, 8.5, 10.5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
mount.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 6;
controls.maxDistance = 19;
controls.maxPolarAngle = Math.PI * 0.48;
controls.target.set(0, 0, 0);

scene.add(new THREE.HemisphereLight(0x9ddfff, 0x111722, 2.1));
const key = new THREE.DirectionalLight(0xffffff, 3.2);
key.position.set(5, 11, 6); key.castShadow = true; scene.add(key);
const rim = new THREE.PointLight(0x4c7dff, 45, 16); rim.position.set(-5, 5, -4); scene.add(rim);
const cyan = new THREE.PointLight(0x00e5ff, 30, 12); cyan.position.set(5, 3, -5); scene.add(cyan);

const mat = (color, rough=.5, metal=.15) => new THREE.MeshStandardMaterial({color, roughness:rough, metalness:metal});
const pcb = mat(0x132d2a, .62, .25);
const dark = mat(0x0b1016, .35, .65);
const silver = mat(0x9ca7b1, .28, .75);
const black = mat(0x090c11, .28, .75);
const accent = mat(0x19d9ff, .3, .45);
const white = mat(0xe8eef5, .28, .55);
const gold = mat(0xcaa84a, .25, .8);

const board = new THREE.Group();
board.name = 'Motherboard';
scene.add(board);
const boardBase = new THREE.Mesh(new THREE.BoxGeometry(8.6, .16, 6.7), pcb);
boardBase.receiveShadow = true; boardBase.castShadow = true; board.add(boardBase);

function addBox(group, x,y,z,w,h,d, material, r=.04){
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), material); m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; group.add(m); return m;
}
function addLabel(group, text, x,y,z, size=.24){
  const canvas=document.createElement('canvas'); canvas.width=512; canvas.height=128; const c=canvas.getContext('2d');
  c.clearRect(0,0,512,128); c.font='700 46px Arial'; c.fillStyle='#b9f5ff'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(text,256,64);
  const tex=new THREE.CanvasTexture(canvas); tex.colorSpace=THREE.SRGBColorSpace;
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false})); s.scale.set(size*3.4,size,.01); s.position.set(x,y,z); group.add(s); return s;
}

// Real motherboard-inspired layout: socket, VRM, DIMMs, PCIe, M.2, chipset, 24-pin.
addBox(board, -2.75,.18,-1.55,.7,.08,2.6,dark);
addBox(board, -2.55,.18,-.05,.7,.08,1.0,silver);
addBox(board, -2.55,.18,1.15,.7,.08,.7,silver);
addLabel(board,'VRM',-2.65,.27,-.05,.18);

const socket = new THREE.Mesh(new THREE.BoxGeometry(2.05,.12,2.0), silver); socket.position.set(-.45,.24,-.85); socket.castShadow=true; board.add(socket);
addBox(board,-.45,.32,-.85,1.55,.08,1.5,black);
addLabel(board,'CPU SOCKET',-.45,.42,-.85,.18);

const dimmZones=[];
for(let i=0;i<4;i++){
  const z=-1.9+i*.82; const slot=addBox(board,2.8,.25,z,.32,.08,.62,dark); dimmZones.push(slot);
  addBox(board,2.8,.31,z,.07,.03,.45,gold);
}
addLabel(board,'DDR5 DIMM',3.25,.38,-.65,.18);

for(let i=0;i<3;i++) addBox(board,-.25,.2,1.75+i*.72,5.9,.07,.16,dark);
const pcieZone = addBox(board,-.05,.25,1.75,5.8,.09,.42,black);
addBox(board,-.05,.33,1.75,5.35,.025,.07,gold);
addLabel(board,'PCIe x16',-2.35,.42,1.75,.18);

const m2Zone=addBox(board,1.0,.27,-.05,2.4,.08,.35,dark);
addBox(board,1.0,.34,-.05,2.15,.025,.07,gold); addLabel(board,'M.2 NVMe',1.0,.43,-.05,.18);
addBox(board,1.9,.25,2.55,1.3,.18,1.3,silver); addLabel(board,'CHIPSET',1.9,.38,2.55,.16);
const powerZone=addBox(board,3.8,.25,1.2,.45,.1,2.1,black); addLabel(board,'24-PIN',3.45,.4,1.2,.17);
addBox(board,-.2,.2,-2.65,2.2,.07,.22,dark); addLabel(board,'MOTHERBOARD',-.2,.34,-2.65,.19);

// Mounting holes.
for(const [x,z] of [[-3.7,-2.7],[3.7,-2.7],[-3.7,2.7],[3.7,2.7]]){
  const ring=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.05,32),gold); ring.rotation.x=Math.PI/2; ring.position.set(x,.25,z); board.add(ring);
}

const parts = {};
const installed = new Set();
let selectedPart = null;
let activeDrag = null;
const dragPlane = new THREE.Plane(new THREE.Vector3(0,1,0), -0.52);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function createCPU(){
  const g=new THREE.Group();
  addBox(g,0,.18,0,1.45,.35,1.35,silver,.08); addBox(g,0,.38,0,1.15,.12,1.08,white,.04); addLabel(g,'RYZEN 9',0,.52,0,.2); return g;
}
function createRAM(){
  const g=new THREE.Group();
  for(let i=0;i<2;i++){ const x=i*.42-.21; addBox(g,x,.13,0,.27,.5,1.25,dark,.03); addBox(g,x,.39,0,.19,.06,1.08,accent,.02); for(let j=-4;j<5;j++) addBox(g,x,.2,j*.1,.03,.03,.04,gold,.01); }
  return g;
}
function createGPU(){
  const g=new THREE.Group();
  addBox(g,0,.28,0,5.2,.72,1.55,dark,.12); addBox(g,0,.68,0,4.8,.08,1.3,black,.08); addBox(g,-1.35,.73,0,1.5,.05,1.18,silver,.08); addBox(g,1.35,.73,0,1.5,.05,1.18,silver,.08);
  for(const x of [-1.35,1.35]){const fan=new THREE.Mesh(new THREE.CylinderGeometry(.48,.48,.08,40),dark);fan.rotation.z=Math.PI/2;fan.position.set(x,.82,0);g.add(fan);}
  addLabel(g,'RTX 5090',0,.88,0,.23); return g;
}
function createSSD(){
  const g=new THREE.Group(); addBox(g,0,.16,0,2.25,.12,.36,dark,.04); addBox(g,-.25,.24,0,.65,.08,.28,silver,.02); addBox(g,.55,.24,0,.75,.08,.28,black,.02); addLabel(g,'NVMe PCIe 5.0',0,.36,0,.15); return g;
}
function createCooler(){
  const g=new THREE.Group(); addBox(g,0,1.25,0,1.65,2.0,1.3,silver,.08); addBox(g,0,1.25,.68,1.25,1.25,.12,dark,.03); addLabel(g,'TOWER COOLER',0,2.35,.7,.15); return g;
}
function createPSU(){
  const g=new THREE.Group(); addBox(g,0,.55,0,2.3,1.4,2.4,dark,.12); addBox(g,0,1.28,0,1.5,.08,1.5,black,.08); addLabel(g,'1200W PSU',0,1.45,0,.18); return g;
}
function createPower(){
  const g=new THREE.Group();
  const cableMat=new THREE.MeshStandardMaterial({color:0x151a20,roughness:.75});
  const cable=(x,z,w)=>{const c=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,w,12),cableMat);c.rotation.z=Math.PI/2;c.position.set(x,.45,z);g.add(c);};
  cable(-2.2,-2.0,2.8); cable(2.0,1.25,2.5); cable(1.2,1.8,2.0); addLabel(g,'POWER',0,.65,0,.17); return g;
}

const factories={cpu:createCPU,ram:createRAM,gpu:createGPU,ssd:createSSD,cooler:createCooler,psu:createPSU,power:createPower};
const target={cpu:new THREE.Vector3(-.45,.62,-.85),ram:new THREE.Vector3(2.8,.65,-.65),gpu:new THREE.Vector3(-.05,.72,1.75),ssd:new THREE.Vector3(1,.5,-.05),cooler:new THREE.Vector3(-.45,.9,-.85),psu:new THREE.Vector3(-5,.8,2.5),power:new THREE.Vector3(0,.6,0)};
const start={cpu:new THREE.Vector3(5,2,-4),ram:new THREE.Vector3(5,2,-2),gpu:new THREE.Vector3(5,2,0),ssd:new THREE.Vector3(5,1,2),cooler:new THREE.Vector3(-5,2,-4),psu:new THREE.Vector3(-5,1,2),power:new THREE.Vector3(0,2,5)};

function addFloatingPart(type){
  if(installed.has(type)) return;
  if(parts[type]) scene.remove(parts[type]);
  const obj=factories[type](); obj.position.copy(start[type]); obj.userData.partType=type; obj.userData.ghost=true; scene.add(obj); parts[type]=obj; selectedPart=type;
  $('#selectedBox').innerHTML=`<b>${partNames[type]}</b><br>${partInfo[type].short}`;
  $('#installBtn').disabled=false;
  $('#partExplainer').innerHTML=`<h3>💡 ${partNames[type]}</h3><p>${partInfo[type].steps}</p>`;
  $('#sceneStatus').textContent='القطعة ظهرت في المشهد — اسحبها إلى مكانها الصحيح أو اضغط تركيب القطعة.';
}

const partNames={cpu:'CPU — AMD Ryzen 9 9950X3D',ram:'RAM — DDR5 64GB',gpu:'GPU — NVIDIA GeForce RTX 5090',ssd:'NVMe SSD — PCIe 5.0',cooler:'CPU Cooler — High-End Tower',psu:'PSU — 1200W ATX 3.x',power:'Power Cables — 24-Pin + EPS + GPU'};
const partInfo={
 cpu:{short:'المعالج يدخل في CPU Socket بدون ضغط جانبي.',steps:'حاذِ العلامة الموجودة على المعالج مع العلامة الموجودة في الـSocket، ثم أنزله برفق. بعد الإغلاق لا تحركه جانبيًا.'},
 ram:{short:'ركّب وحدتي DDR5 في شقوق DIMM المناسبة.',steps:'حاذِ الـnotch في الرامة مع اللسان داخل DIMM. اضغط من الطرفين حتى تثبت المشابك. في التجميع الحقيقي استخدم الشقوق التي توصي بها اللوحة لقناتين.'},
 gpu:{short:'كارت RTX 5090 يدخل في PCIe x16.',steps:'افتح لسان PCIe، حاذِ موصل البطاقة، أدخلها بشكل مستقيم ثم ثبتها في الكيس. بطاقة قوية مثل RTX 5090 تحتاج أيضًا إلى توصيل الطاقة المناسب ومزود طاقة متوافق.'},
 ssd:{short:'وحدة NVMe تدخل في M.2 بزاوية ثم تثبت.',steps:'أدخل طرف الـM.2 في المنفذ بزاوية، اخفض الوحدة، ثم ثبتها بالآلية المخصصة. لا تضغط على الوحدة لأسفل قبل محاذاتها.'},
 cooler:{short:'المبرد يثبت فوق المعالج بعد تجهيز سطح التلامس.',steps:'ثبت قاعدة التبريد المتوافقة مع الـSocket، ضع كمية مناسبة من المعجون الحراري حسب تعليمات الشركة، ثم ثبت المشتت بالتساوي ووصل مروحة CPU_FAN.'},
 psu:{short:'مزود الطاقة يثبت في الكيس وليس فوق اللوحة.',steps:'في الجهاز الحقيقي يوضع PSU داخل الكيس ويثبت بالمسامير. بعد ذلك نختار الكابلات المناسبة ولا نستخدم كابلًا غير مخصص للمزود.'},
 power:{short:'24-Pin + EPS + GPU Power تربط الطاقة بالمكونات.',steps:'وصل 24-Pin للوحة، EPS للمعالج، وكابل GPU للبطاقة. يجب أن تتطابق موصلات الكابل مع منفذها، ولا تجبر أي موصل بالقوة.'}
};

document.querySelectorAll('.part-choice').forEach(btn=>btn.addEventListener('click',()=>addFloatingPart(btn.dataset.part)));
$('#installBtn').addEventListener('click',()=>installSelected());
$('#resetBuild').addEventListener('click',resetBuild);

function installSelected(){
  if(!selectedPart || !parts[selectedPart]) return;
  const obj=parts[selectedPart];
  obj.position.copy(target[selectedPart]);
  obj.rotation.set(0, selectedPart==='gpu'?Math.PI/2:0, 0);
  obj.userData.ghost=false; installed.add(selectedPart);
  obj.traverse(o=>{if(o.material){o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone(); if(o.material.emissive)o.material.emissive.set(0x002b33);}});
  gainXP(25);
  $('#sceneStatus').textContent=`✅ تم تركيب ${partNames[selectedPart]} في مكانه.`;
  selectedPart=null; $('#installBtn').disabled=true; updateProgress();
}

function updateProgress(){
  $('#buildCount').textContent=installed.size; $('#progressBar').style.width=`${installed.size/7*100}%`;
  if(installed.size===7){$('#sceneStatus').textContent='🏆 تجميعة مكتملة! كل القطع الأساسية في مكانها. يمكنك الآن مراجعة الأسئلة.'; gainXP(100);}
}
function resetBuild(){
  Object.values(parts).forEach(o=>scene.remove(o)); for(const k in parts) delete parts[k]; installed.clear(); selectedPart=null; $('#installBtn').disabled=true; $('#selectedBox').textContent='اختار قطعة من القائمة لبدء تركيبها.'; $('#sceneStatus').textContent='تمت إعادة المختبر. ابدأ من CPU.'; updateProgress();
}

// Drag a selected 3D part with the mouse over the motherboard surface.
function pointerFromEvent(e){const r=renderer.domElement.getBoundingClientRect(); pointer.x=((e.clientX-r.left)/r.width)*2-1; pointer.y=-((e.clientY-r.top)/r.height)*2+1;}
renderer.domElement.addEventListener('pointerdown',e=>{
  if(!selectedPart || !parts[selectedPart]) return;
  pointerFromEvent(e); raycaster.setFromCamera(pointer,camera);
  const hits=raycaster.intersectObject(parts[selectedPart],true);
  if(hits.length){activeDrag=selectedPart; controls.enabled=false; renderer.domElement.setPointerCapture(e.pointerId);}
});
renderer.domElement.addEventListener('pointermove',e=>{
  if(!activeDrag) return; pointerFromEvent(e); raycaster.setFromCamera(pointer,camera); const p=new THREE.Vector3(); if(raycaster.ray.intersectPlane(dragPlane,p)) parts[activeDrag].position.set(p.x,.7,p.z);
});
renderer.domElement.addEventListener('pointerup',e=>{if(!activeDrag)return; controls.enabled=true; renderer.domElement.releasePointerCapture(e.pointerId); const t=activeDrag; const obj=parts[t]; const d=obj.position.distanceTo(target[t]); activeDrag=null; if(d<1.45) installSelected(); else {obj.position.copy(start[t]); $('#sceneStatus').textContent='❌ المكان غير صحيح. قرب القطعة من مكانها المحدد وحاول مرة أخرى.';}});

function resize(){const w=mount.clientWidth,h=Math.max(520,Math.min(700,w*.68)); renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();}
window.addEventListener('resize',resize); resize();
function animate(){requestAnimationFrame(animate); controls.update(); renderer.render(scene,camera);} animate();

// -----------------------------
// XP + 50-question knowledge system
// -----------------------------
function gainXP(n){xp+=n;localStorage.setItem('cyberComputerXP',xp);$('#xp').textContent=xp;$('#quizXP').textContent=`${xp} XP`;}

const questions=[
['ما الوظيفة الأساسية للـCPU؟',['تخزين الملفات','تنفيذ التعليمات ومعالجة البيانات','توفير الكهرباء','تبريد الجهاز'],1,'CPU ينفذ تعليمات البرامج ويجري العمليات الحسابية والمنطقية.'],
['أي مكوّن يحتفظ بالبيانات مؤقتًا أثناء تشغيل البرامج؟',['RAM','HDD','PSU','Case'],0,'RAM هي ذاكرة العمل المؤقتة.'],
['ماذا يحدث عادة لمحتوى RAM عند إيقاف الكهرباء؟',['يُحفظ دائمًا','يختفي','ينتقل إلى GPU','يُطبع'],1,'RAM ذاكرة متطايرة، لذلك تفقد محتواها عند انقطاع الطاقة.'],
['أي قطعة تربط معظم مكونات الكمبيوتر؟',['Motherboard','Mouse','Monitor','Speaker'],0,'اللوحة الأم تحتوي على المقابس والمنافذ والدوائر التي تربط المكونات.'],
['أين تركب RAM؟',['PCIe','DIMM','SATA','EPS'],1,'RAM تركب في شقوق DIMM.'],
['ما وظيفة GPU الأساسية؟',['معالجة الرسوميات','تخزين الملفات','توفير الطاقة','تبريد CPU'],0,'GPU متخصص في معالجة الرسوميات والعمليات المتوازية.'],
['ما هو SSD؟',['وحدة تخزين فلاش','مروحة','نوع RAM','مزود طاقة'],0,'SSD يستخدم ذاكرة فلاش لتخزين البيانات.'],
['ما الفرق الأساسي في HDD؟',['يعتمد عادة على أجزاء ميكانيكية دوارة','هو RAM','يحتاج مروحة دائمًا','لا يخزن ملفات'],0,'HDD يعتمد على أجزاء ميكانيكية، بينما SSD لا يعتمد عليها عادة.'],
['ما وظيفة PSU؟',['توزيع الطاقة المناسبة','تشغيل الألعاب فقط','تخزين Windows','زيادة RAM'],0,'PSU يحول ويوزع الطاقة المناسبة للمكونات.'],
['ما وظيفة 24-Pin ATX؟',['طاقة رئيسية للوحة الأم','كابل شاشة','كابل سماعة','كابل إنترنت'],0,'24-Pin من موصلات الطاقة الرئيسية للوحة الأم.'],
['ما وظيفة CPU EPS؟',['توفير طاقة للمعالج','توصيل SSD','تشغيل الشاشة','تبريد GPU'],0,'EPS يغذي دائرة طاقة المعالج.'],
['أين يركب GPU المكتبي عادة؟',['DIMM','PCIe x16','SATA','USB'],1,'كروت الشاشة تستخدم عادة PCIe x16.'],
['ما هي VRAM؟',['ذاكرة مخصصة للـGPU','ذاكرة BIOS فقط','ذاكرة PSU','تخزين HDD'],0,'VRAM تخزن البيانات الرسومية التي يحتاجها GPU.'],
['ما المقصود بـM.2؟',['شكل/واجهة لوحدات مثل NVMe','نوع PSU','مروحة','نظام تشغيل'],0,'M.2 شكل شائع لوحدات صغيرة، ويمكن أن يستخدم NVMe عبر PCIe.'],
['ما وظيفة SATA؟',['توصيل بعض وحدات التخزين','تبريد CPU','توصيل RAM','تشغيل BIOS'],0,'SATA واجهة شائعة لتوصيل HDD وSATA SSD.'],
['ما هو BIOS/UEFI؟',['برنامج منخفض المستوى يبدأ قبل نظام التشغيل','لعبة','كابل','نوع RAM'],0,'BIOS/UEFI يهيئ العتاد ويساعد في الإقلاع.'],
['ما معنى POST؟',['فحص مكونات عند بدء التشغيل','ضغط الملفات','تشفير القرص','تحديث Windows'],0,'POST يفحص مكونات أساسية قبل تحميل نظام التشغيل.'],
['ما وظيفة نظام التشغيل؟',['إدارة موارد الجهاز وتشغيل البرامج','توفير الكهرباء','تبريد الجهاز','تصنيع CPU'],0,'نظام التشغيل يدير الموارد ويوفر بيئة للبرامج.'],
['ما وظيفة Driver؟',['يساعد النظام على التواصل مع قطعة عتاد','يخزن الصور فقط','يزيد حجم الشاشة','هو كابل'],0,'التعريف يساعد نظام التشغيل على التواصل مع العتاد.'],
['ما معنى Hardware؟',['الأجزاء المادية','البرامج','المواقع','الملفات فقط'],0,'Hardware هو كل جزء مادي يمكن لمسه.'],
['ما معنى Software؟',['البرامج والتعليمات','المازر بورد','الرام','الكابلات'],0,'Software هو البرامج والتعليمات.'],
['أي مما يلي جهاز إدخال؟',['Keyboard','Monitor','Speaker','Printer'],0,'الكيبورد يرسل مدخلات للكمبيوتر.'],
['أي مما يلي جهاز إخراج؟',['Monitor','Keyboard','Mouse','Microphone'],0,'الشاشة تعرض نتائج الكمبيوتر.'],
['ما معنى CPU Core؟',['نواة تنفيذ داخل المعالج','كابل طاقة','نوع SSD','منفذ USB'],0,'Core وحدة تنفيذ داخل المعالج.'],
['هل GHz وحدها تحدد أداء CPU؟',['نعم دائمًا','لا، المعمارية والأنوية وعوامل أخرى مهمة','فقط في RAM','فقط في HDD'],1,'التردد مهم لكنه ليس المقياس الوحيد للأداء.'],
['ما وظيفة Cache؟',['تخزين سريع قريب من المعالج','تخزين دائم للصور فقط','تبريد المعالج','توفير الطاقة'],0,'Cache تقلل زمن الوصول للبيانات المتكررة.'],
['ما وظيفة Thermal Paste؟',['تحسين انتقال الحرارة بين CPU والمبرد','تثبيت RAM','توصيل الإنترنت','تخزين BIOS'],0,'المعجون يحسن انتقال الحرارة عبر ملء الفراغات الدقيقة.'],
['ما وظيفة CPU Cooler؟',['نقل الحرارة بعيدًا عن CPU','زيادة مساحة SSD','تشغيل Wi-Fi','تخزين Windows'],0,'المبرد يساعد على إزالة حرارة المعالج.'],
['ما المقصود بـAirflow؟',['حركة الهواء البارد والساخن داخل الكيس','سرعة الإنترنت','تردد RAM','سرعة SSD'],0,'تدفق الهواء الجيد يساعد على خفض الحرارة.'],
['ما هو Form Factor؟',['حجم وشكل اللوحة ومعايير تركيبها','نوع المعالج فقط','سرعة الإنترنت','سعة RAM'],0,'ATX وMicro ATX وMini ITX أمثلة على Form Factor.'],
['ما وظيفة VRM؟',['تنظيم الطاقة للمعالج ومكونات أخرى','تخزين الألعاب','عرض الصور','تبريد الكيس فقط'],0,'VRM تنظم وتحول الطاقة لتناسب المكونات.'],
['ما هو Thermal Throttling؟',['تقليل السرعة بسبب الحرارة العالية','زيادة RAM تلقائيًا','تشفير القرص','زيادة PSU'],0,'المكون قد يقلل تردده عند ارتفاع الحرارة لحمايته.'],
['ما وظيفة USB؟',['نقل بيانات وطاقة لأجهزة مختلفة','تخزين BIOS فقط','توصيل CPU مباشرة','تبريد GPU'],0,'USB معيار شائع للبيانات والطاقة حسب الإصدار.'],
['ما وظيفة Network Card؟',['الاتصال بالشبكات','معالجة الرسوميات','تبريد CPU','تخزين الملفات'],0,'بطاقة الشبكة توفر Ethernet أو Wi-Fi حسب النوع.'],
['ما هو Ethernet؟',['اتصال شبكة سلكي','نوع RAM','مبرد','نظام تشغيل'],0,'Ethernet تقنية شبكة سلكية.'],
['أي عبارة صحيحة عن CPU وGPU؟',['CPU للمهام العامة وGPU مناسب للعمليات المتوازية','هما نفس الشيء','GPU هو PSU','CPU هو SSD'],0,'لكل منهما تصميم واستخدامات مختلفة.'],
['ماذا يحتاج بعض GPUs القوية بالإضافة إلى PCIe؟',['كابل طاقة إضافي من PSU','SATA فقط دائمًا','RAM خارجية','كابل سماعة'],0,'البطاقات ذات استهلاك الطاقة العالي تحتاج موصلات طاقة إضافية.'],
['قبل تركيب قطعة ما أهم خطوة؟',['التأكد من التوافق وفصل الكهرباء','تشغيل الجهاز','رش الماء','نزع المراوح'],0,'السلامة والتوافق أساسيان قبل التجميع.'],
['كيف تركب RAM بشكل صحيح؟',['مطابقة الـnotch ثم الضغط حتى تثبت','إجبارها بالعكس','وضعها في PCIe','وضعها على PSU'],0,'الشق يجب أن يتطابق مع اللسان داخل DIMM.'],
['كيف يركب M.2 NVMe عادة؟',['يدخل بزاوية ثم يخفض ويثبت','يوضع فوق RAM','يدخل في PCIe x16 مباشرة','يلصق بالكيس'],0,'وحدة M.2 تدخل بزاوية ثم تثبت.'],
['ما الخطأ الخطير عند تركيب CPU؟',['إجباره بالقوة','محاذاته أولًا','فحص المقبس','اتباع دليل اللوحة'],0,'المعالج لا يحتاج قوة لإدخاله، والإجبار قد يضر Socket أو CPU.'],
['ما وظيفة PCIe؟',['ناقل/واجهة لتوصيل بطاقات توسعة مثل GPU','نوع تخزين فقط','نظام تشغيل','مروحة'],0,'PCIe يربط بطاقات التوسعة بالمنصة.'],
['لماذا نستخدم شقوق RAM موصى بها في دليل اللوحة؟',['لتحقيق التكوين الصحيح للقنوات والذاكرة','لزيادة حجم الكيس','لتشغيل PSU','لتغيير الشاشة'],0,'ترتيب DIMM يؤثر في القنوات والتوافق والأداء.'],
['ما المقصود بـDual Channel؟',['استخدام قناتين للذاكرة لزيادة عرض النطاق','تشغيل GPU مرتين','وجود SSDين فقط','كابلين للشاشة'],0,'Dual Channel يتيح للذاكرة العمل عبر قناتين وفق تصميم المنصة.'],
['ماذا يحدث أثناء Boot؟',['تبدأ تهيئة العتاد ثم تحميل نظام التشغيل','يتم تصنيع RAM','تتغير أبعاد الكيس','يتوقف CPU'],0,'الإقلاع يبدأ بتهيئة العتاد ثم ينتقل إلى محمل نظام التشغيل.'],
['لماذا نثبت GPU في الكيس؟',['لتثبيته ميكانيكيًا ومنع الضغط على منفذ PCIe','لزيادة RAM','لتبريد PSU','لتغيير BIOS'],0,'التثبيت يمنع حركة البطاقة ويحمي المنفذ.'],
['ما سبب أهمية قدرة PSU المناسبة؟',['لتوفير طاقة كافية وآمنة للمكونات','لتزيد دقة الشاشة','لتسرع الإنترنت','لتضاعف RAM'],0,'يجب أن تكون قدرة وجودة PSU مناسبة للحمل والمكونات.'],
['ما الذي يميز RTX 5090 في هذا المختبر؟',['بطاقة رسومية فائقة الأداء تحتاج منصة وطاقة وتبريد مناسبين','هي RAM','هي SSD','هي PSU'],0,'RTX 5090 بطاقة رسومية عالية الاستهلاك، لذلك يجب مراعاة التوافق والطاقة والتبريد.'],
['بعد تركيب القطع، ما الخطوة الآمنة قبل التشغيل؟',['مراجعة التوصيلات والتأكد من عدم وجود كابلات مرتخية','وضع ماء داخل الكيس','إجبار الكابلات','إزالة CPU'],0,'مراجعة التوصيلات خطوة أساسية قبل أول تشغيل.']
];

let qIndex=0, qAnswered=false;
function renderQuestion(){
  qAnswered=false; $('#qNumber').textContent=`سؤال ${qIndex+1} من ${questions.length}`; $('#quizXP').textContent=`${xp} XP`; $('#question').textContent=questions[qIndex][0]; $('#feedback').textContent=''; $('#nextQuestion').disabled=true;
  const box=$('#answers'); box.innerHTML=''; questions[qIndex][1].forEach((a,i)=>{const b=document.createElement('button'); b.textContent=a; b.dataset.answer=i; box.appendChild(b); b.addEventListener('click',()=>answerQuestion(i,b));});
}
function answerQuestion(i,button){if(qAnswered)return;qAnswered=true;const q=questions[qIndex];const buttons=[...$('#answers').children];buttons.forEach(b=>b.disabled=true);if(i===q[2]){button.classList.add('correct');gainXP(10);$('#feedback').textContent=`✅ إجابة صحيحة! +10 XP — ${q[3]}`;}else{button.classList.add('wrong');buttons[q[2]].classList.add('correct');$('#feedback').textContent=`❌ الإجابة الصحيحة: ${buttons[q[2]].textContent}. ${q[3]}`;}$('#nextQuestion').disabled=false;}
$('#nextQuestion').addEventListener('click',()=>{qIndex=(qIndex+1)%questions.length;renderQuestion();});
renderQuestion();

// -----------------------------
// Voice reading utility for all educational text
// -----------------------------
const synth=window.speechSynthesis; let voices=[]; if(synth){voices=synth.getVoices();synth.onvoiceschanged=()=>voices=synth.getVoices();}
function speak(text){if(!synth){alert('المتصفح لا يدعم القراءة الصوتية. استخدم Chrome أو Edge.');return;}synth.cancel();const u=new SpeechSynthesisUtterance(text);const ar=voices.find(v=>/^ar/i.test(v.lang))||voices.find(v=>/arabic|عربي/i.test(v.name));if(ar)u.voice=ar;u.lang=ar?.lang||'ar-EG';u.rate=.92;u.pitch=1;synth.speak(u);}
