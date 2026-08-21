const $ = s => document.querySelector(s);
let xp = Number(localStorage.getItem('cyberComputerXP') || 0);
$('#xp').textContent = xp;

const mount = $('#threeScene');
let scene, camera, renderer, board;
let selectedPart = null, draggingPart = null, autoRotate = false, wireMode = false;
let rotX = -0.62, rotY = 0.45, zoom = 12;
const objects = {}, installed = new Set(), targets = {};
const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();

const names = {cpu:'CPU — AMD Ryzen 9 9950X3D',ram:'RAM — DDR5 64GB (2×32GB) 6000MHz',gpu:'GPU — NVIDIA GeForce RTX 5090',ssd:'NVMe SSD — PCIe 5.0 M.2 2TB',cooler:'CPU Cooler — High-End Tower',psu:'PSU — 1200W ATX 3.x',power:'Power Cables — 24-Pin + EPS + GPU'};
const info = {
 cpu:'افتح Socket، حاذِ علامة المعالج مع علامة المقبس، أنزل CPU برفق ثم أغلق الذراع.',
 ram:'حاذِ notch الرامة مع اللسان داخل DIMM واضغط حتى تغلق المشابك. استخدم الشقوق المناسبة للقناتين.',
 gpu:'افتح لسان PCIe x16، أدخل البطاقة بشكل مستقيم وثبتها، ثم صل طاقة GPU المناسبة.',
 ssd:'أدخل NVMe في M.2 بزاوية، اخفضه ثم ثبته بالبرغي أو آلية التثبيت.',
 cooler:'ثبت قاعدة التبريد، ضع المعجون حسب تعليمات الشركة، ثبت المشتت بالتساوي ووصل CPU_FAN.',
 psu:'ثبت PSU داخل الكيس واستخدم فقط كابلاته المتوافقة. صل 24-Pin وEPS وطاقة GPU حسب الحاجة.',
 power:'صل 24-Pin للوحة، EPS للمعالج، وكابل GPU للبطاقة. لا تجبر أي موصل.'
};
function status(t){$('#sceneStatus').textContent=t;}
function addXP(n){xp+=n;localStorage.setItem('cyberComputerXP',xp);$('#xp').textContent=xp;$('#quizXP').textContent=xp+' XP';}
function mat(c,r=.5,m=.2){return new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});}
const M={pcb:mat(0x10211d,.65,.3),black:mat(0x070a0f,.3,.75),dark:mat(0x151c25,.4,.55),silver:mat(0xb2bac3,.25,.8),white:mat(0xe9eef3,.22,.65),cyan:mat(0x16ddff,.25,.45),blue:mat(0x4268ff,.3,.5),purple:mat(0x8657ff,.3,.45),gold:mat(0xd8ae45,.22,.85)};
function box(p,x,y,z,w,h,d,m){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;}
function label(p,text,x,y,z,size=.17){const c=document.createElement('canvas');c.width=512;c.height=96;const g=c.getContext('2d');g.font='bold 42px Arial';g.fillStyle='#c2f7ff';g.textAlign='center';g.textBaseline='middle';g.fillText(text,256,48);const t=new THREE.CanvasTexture(c);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false}));s.scale.set(size*4,size,.01);s.position.set(x,y,z);p.add(s);}
function ring(pos,r,color=0x00e5ff){const o=new THREE.Mesh(new THREE.TorusGeometry(r,.035,12,40),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.8}));o.rotation.x=Math.PI/2;o.position.copy(pos);scene.add(o);return o;}

function init(){
 if(!window.THREE){status('⚠️ محرك 3D لم يتم تحميله. أعد تحميل الصفحة.');return;}
 try{
  scene=new THREE.Scene();scene.background=new THREE.Color(0x050912);scene.fog=new THREE.Fog(0x050912,18,38);
  camera=new THREE.PerspectiveCamera(42,1,.1,100);renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.shadowMap.enabled=true;if(renderer.outputColorSpace!==undefined)renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;mount.innerHTML='';mount.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xa7dcff,0x111722,2.3));const key=new THREE.DirectionalLight(0xffffff,3.4);key.position.set(6,12,8);key.castShadow=true;scene.add(key);const r=new THREE.PointLight(0x466fff,55,18);r.position.set(-6,5,-5);scene.add(r);const c=new THREE.PointLight(0x00e5ff,35,15);c.position.set(6,3,-3);scene.add(c);
  makeGround();makeBoard();makeTargets();resize();applyCamera();
  renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('wheel',wheel,{passive:false});renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());window.addEventListener('resize',resize);
  animate();status('جاهز — المازربورد 3D أمامك. اسحب بالماوس للدوران.');
 }catch(e){console.error(e);status('⚠️ خطأ في 3D: '+e.message);}
}
function makeGround(){const p=new THREE.Mesh(new THREE.PlaneGeometry(32,32),new THREE.MeshStandardMaterial({color:0x050a11,roughness:.9}));p.rotation.x=-Math.PI/2;p.position.y=-.2;p.receiveShadow=true;scene.add(p);for(let i=-15;i<=15;i++){const l=new THREE.Mesh(new THREE.BoxGeometry(.012,.012,30),new THREE.MeshBasicMaterial({color:0x12314a}));l.position.set(i, -.18,0);scene.add(l);}}
function makeBoard(){
 board=new THREE.Group();scene.add(board);box(board,0,0,0,9.2,.18,6.9,M.pcb);
 box(board,-3.35,.22,-1.8,1.0,.4,2.0,M.dark);box(board,-3.2,.43,-.85,.7,.1,.7,M.silver);label(board,'VRM',-3.3,.58,-.9);
 box(board,-.75,.22,-1.05,2.2,.16,2.0,M.silver);box(board,-.75,.34,-1.05,1.75,.1,1.55,M.black);box(board,-1.4,.43,-1.72,.08,.08,.08,M.gold);label(board,'CPU SOCKET',-.75,.58,-1.05,.16);
 for(let i=0;i<4;i++){let z=-2.25+i*.82;box(board,2.55,.25,z,.34,.16,.62,M.black);box(board,2.55,.36,z,.08,.04,.48,M.gold);}label(board,'DDR5 DIMM',3.1,.58,-.65,.16);
 for(let i=0;i<3;i++)box(board,-.15,.21,1.55+i*.72,6.1,.12,.2,M.black);box(board,-.15,.35,1.55,5.75,.08,.42,M.silver);box(board,-.15,.42,1.55,5.45,.03,.07,M.gold);label(board,'PCIe x16',-2.5,.58,1.55,.16);
 box(board,1,.35,-.05,2.55,.12,.42,M.black);box(board,1,.44,-.05,2.2,.03,.07,M.gold);label(board,'M.2 NVMe',1,.6,-.05,.15);box(board,1.8,.25,2.5,1.6,.4,1.35,M.silver);label(board,'CHIPSET',1.8,.56,2.5,.14);box(board,3.95,.35,.95,.5,.18,2.25,M.black);label(board,'24-PIN',3.45,.6,.95,.15);
 for(const [x,z] of [[-4,-2.85],[4,-2.85],[-4,2.85],[4,2.85]]){const h=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.06,24),M.gold);h.rotation.x=Math.PI/2;h.position.set(x,.25,z);board.add(h);}label(board,'MOTHERBOARD',-.2,.43,-2.9,.18);
}
function makeTargets(){targets.cpu=new THREE.Vector3(-.75,.65,-1.05);targets.ram=new THREE.Vector3(2.55,.65,-.65);targets.gpu=new THREE.Vector3(-.15,.68,1.55);targets.ssd=new THREE.Vector3(1,.58,-.05);targets.cooler=new THREE.Vector3(-.75,1,-1.05);targets.psu=new THREE.Vector3(5,.8,2.7);targets.power=new THREE.Vector3(3.6,.65,.95);for(const k of Object.keys(targets))ring(targets[k],k==='gpu'?2.6:.55);}
function part(type){const g=new THREE.Group();
 if(type==='cpu'){box(g,0,.2,0,1.5,.35,1.4,M.silver);box(g,0,.4,0,1.2,.12,1.08,M.white);label(g,'RYZEN 9',0,.58,0,.18);}
 if(type==='ram'){for(let i=0;i<2;i++){let x=-.22+i*.44;box(g,x,.2,0,.27,.55,1.3,M.black);box(g,x,.49,0,.2,.06,1.12,M.cyan);}}
 if(type==='gpu'){box(g,0,.35,0,5.35,.78,1.6,M.black);box(g,0,.78,0,5,.08,1.38,M.dark);for(let x of [-1.45,0,1.45]){const f=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,.1,32),M.dark);f.rotation.x=Math.PI/2;f.position.set(x,.86,0);g.add(f);}label(g,'RTX 5090',0,1.05,0,.22);}
 if(type==='ssd'){box(g,0,.18,0,2.35,.14,.38,M.black);box(g,-.35,.29,0,.7,.1,.28,M.silver);label(g,'NVMe PCIe 5.0',0,.42,0,.14);}
 if(type==='cooler'){box(g,0,1.25,0,1.7,2.0,1.35,M.silver);box(g,0,1.25,.72,1.25,1.3,.12,M.black);label(g,'TOWER COOLER',0,2.35,.72,.14);}
 if(type==='psu'){box(g,0,.7,0,2.5,1.5,2.4,M.black);box(g,0,1.45,0,1.5,.08,1.5,M.dark);label(g,'1200W PSU',0,1.62,0,.17);}
 if(type==='power'){for(const [x,z,w] of [[-1.6,-1.2,2.6],[1.4,.5,2.2],[1.7,1.2,1.7]]){const m=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,w,12),M.black);m.rotation.z=Math.PI/2;m.position.set(x,.35,z);g.add(m);}label(g,'POWER',0,.65,0,.16);}
 return g;}
function showPart(type){if(installed.has(type))return;if(objects[type])scene.remove(objects[type]);const g=part(type);g.userData.partType=type;g.position.copy({cpu:new THREE.Vector3(-6,2,-4),ram:new THREE.Vector3(6,2,-3),gpu:new THREE.Vector3(6,1,3),ssd:new THREE.Vector3(5,2,-1),cooler:new THREE.Vector3(-5,2,2),psu:new THREE.Vector3(5,.8,4),power:new THREE.Vector3(0,1,5)}[type]);scene.add(g);objects[type]=g;selectedPart=type;$('#selectedBox').innerHTML=`<b>${names[type]}</b><br>${info[type]}`;$('#infoTitle').textContent=names[type];$('#infoText').textContent=info[type];$('#partExplainer').innerHTML=`<h3>💡 ${names[type]}</h3><p>${info[type]}</p>`;$('#installBtn').disabled=false;document.querySelectorAll('.part-choice').forEach(b=>b.classList.toggle('selected',b.dataset.part===type));status(`تم إظهار ${names[type]} — اسحبها للدائرة المضيئة أو اضغط تركيب القطعة.`);}
function install(){if(!selectedPart)return;const type=selectedPart;const o=objects[type];if(!o)return;o.position.copy(targets[type]);installed.add(type);addXP(25);$('#buildXP').textContent=xp;$('#installBtn').disabled=true;selectedPart=null;const n=installed.size;$('#buildCount').textContent=n;$('#buildPercent').textContent=Math.round(n/7*100)+'%';$('#progressBar').style.width=Math.round(n/7*100)+'%';$('#selectedBox').innerHTML=`<b>✅ ${names[type]}</b><br>تم تثبيتها في المكان الصحيح.`;status(`✅ تم تركيب ${names[type]} — +25 XP`);if(n===7){$('#readyBox').innerHTML='🏆 <b>اكتمل التجميع!</b><br><small>كل القطع الأساسية مركبة.</small>';status('🏆 اكتمل تجميع الكمبيوتر! يمكنك الآن حل الاختبار.');}}
function reset(){Object.values(objects).forEach(o=>scene.remove(o));for(const k of Object.keys(objects))delete objects[k];installed.clear();selectedPart=null;$('#installBtn').disabled=true;$('#buildCount').textContent=0;$('#buildPercent').textContent='0%';$('#progressBar').style.width='0%';$('#selectedBox').textContent='اختر قطعة من القائمة أو اضغط عليها لتظهر في المشهد.';$('#readyBox').innerHTML='🟢 جاهز للتجميع<br><small>ابدأ باختيار قطعة من القائمة.</small>';status('تمت إعادة التجميع. المازربورد جاهزة.');}

function applyCamera(){camera.position.set(Math.sin(rotY)*Math.cos(rotX)*zoom,Math.sin(rotX)*zoom+2,Math.cos(rotY)*Math.cos(rotX)*zoom);camera.lookAt(0,0,0);}
let viewDrag=false,lastX=0,lastY=0;
function down(e){const r=renderer.domElement.getBoundingClientRect();pointer.x=(e.clientX-r.left)/r.width*2-1;pointer.y=-(e.clientY-r.top)/r.height*2+1;raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(Object.values(objects),true);if(hits.length){let o=hits[0].object;while(o.parent&&o.parent!==scene)o=o.parent;if(o.userData.partType){selectedPart=o.userData.partType;draggingPart=o;$('#installBtn').disabled=false;return;}}viewDrag=true;lastX=e.clientX;lastY=e.clientY;}
function move(e){if(draggingPart){const r=renderer.domElement.getBoundingClientRect();pointer.x=(e.clientX-r.left)/r.width*2-1;pointer.y=-(e.clientY-r.top)/r.height*2+1;raycaster.setFromCamera(pointer,camera);const plane=new THREE.Plane(new THREE.Vector3(0,1,0),-.6),p=new THREE.Vector3();if(raycaster.ray.intersectPlane(plane,p))draggingPart.position.copy(p);}else if(viewDrag){rotY+=(e.clientX-lastX)*.008;rotX+=(e.clientY-lastY)*.006;rotX=Math.max(-1.2,Math.min(.35,rotX));lastX=e.clientX;lastY=e.clientY;applyCamera();}}
function up(){if(draggingPart){const t=draggingPart.userData.partType;if(draggingPart.position.distanceTo(targets[t])<1.6)install();draggingPart=null;}viewDrag=false;}
function wheel(e){e.preventDefault();zoom=Math.max(7,Math.min(18,zoom+e.deltaY*.012));applyCamera();}
function resize(){if(!renderer)return;const w=Math.max(320,mount.clientWidth),h=Math.max(500,mount.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();applyCamera();}
function animate(){requestAnimationFrame(animate);if(autoRotate){rotY+=.003;applyCamera();}renderer.render(scene,camera);}

document.querySelectorAll('.part-choice').forEach(b=>b.addEventListener('click',()=>showPart(b.dataset.part)));
$('#installBtn').addEventListener('click',install);$('#resetBuild').addEventListener('click',reset);$('#rotateBtn').addEventListener('click',()=>{autoRotate=!autoRotate;status(autoRotate?'↻ الدوران التلقائي يعمل':'⏸️ الدوران التلقائي متوقف');});$('#homeBtn').addEventListener('click',()=>{rotX=-.62;rotY=.45;zoom=12;applyCamera();});$('#wireBtn').addEventListener('click',()=>{wireMode=!wireMode;board.traverse(o=>{if(o.material&&o.material.wireframe!==undefined)o.material.wireframe=wireMode;});status(wireMode?'◉ تفاصيل اللوحة مفعلة':'◉ تفاصيل اللوحة متوقفة');});

const questions=[
['ما الوظيفة الأساسية لـ RAM؟',['تخزين الملفات دائمًا','توفير مساحة عمل مؤقتة للبرامج','توفير الكهرباء','إخراج الصورة'],1,'RAM ذاكرة مؤقتة للبيانات والبرامج المستخدمة حاليًا.'],
['ما وظيفة CPU؟',['تنفيذ التعليمات ومعالجة البيانات','تخزين الملفات','تبريد الجهاز','توفير الطاقة'],0,'CPU ينفذ التعليمات والعمليات الحسابية والمنطقية.'],
['أين يركب المعالج؟',['PCIe','M.2','CPU Socket','SATA'],2,'المعالج يركب في CPU Socket.'],
['ما وظيفة Motherboard؟',['عرض الصورة فقط','ربط مكونات الكمبيوتر','تخزين الملفات فقط','تبريد المعالج'],1,'اللوحة الأم تربط المكونات وتوفر مسارات الاتصال والطاقة.'],
['ما معنى GPU؟',['وحدة معالجة الرسوميات','وحدة تخزين','مزود طاقة','ذاكرة نظام'],0,'GPU هي Graphics Processing Unit.'],
['ما وظيفة SSD؟',['تشغيل المراوح','حفظ الملفات والبرامج بشكل دائم','تنفيذ التعليمات بدل CPU','توفير الكهرباء'],1,'SSD تخزن البيانات حتى بعد إيقاف الجهاز.'],
['ما وظيفة PSU؟',['توفير الطاقة المناسبة للمكونات','زيادة RAM','معالجة الرسوميات','تشغيل نظام التشغيل'],0,'PSU يحول ويوزع الطاقة للمكونات.'],
['ما الذي يميز NVMe؟',['واجهة تخزين سريعة عبر PCIe','نوع RAM','كابل طاقة','معالج'],0,'NVMe بروتوكول تخزين سريع يستخدم غالبًا مع M.2 وPCIe.'],
['ما وظيفة PCIe؟',['واجهة اتصال لمكونات التوسعة','تبريد CPU','تخزين دائم فقط','تشغيل الشاشة'],0,'PCIe واجهة عالية السرعة لبطاقات التوسعة والتخزين.'],
['أين يركب كارت الشاشة المنفصل عادة؟',['DIMM','PCIe x16','CPU Socket','SATA Power'],1,'GPU المنفصل يستخدم عادة PCIe x16.'],
['ما هو POST؟',['فحص مكونات الجهاز عند بدء التشغيل','نوع RAM','برنامج رسم','كابل GPU'],0,'POST يفحص مكونات أساسية قبل الإقلاع.'],
['ما وظيفة BIOS/UEFI؟',['تهيئة العتاد وبدء الإقلاع','تبريد الجهاز','تخزين الصور','زيادة سرعة الإنترنت'],0,'BIOS/UEFI يهيئ العتاد ويبدأ الإقلاع.'],
['ماذا يحدث لبيانات RAM عند فصل الكهرباء؟',['تبقى','تختفي','تنتقل إلى GPU','تنتقل إلى SSD تلقائيًا'],1,'RAM ذاكرة متطايرة.'],
['ما هو CPU Core؟',['وحدة تنفيذ داخل المعالج','نوع كابل','منفذ تخزين','مروحة'],0,'النواة وحدة تنفيذ داخل المعالج.'],
['ما وظيفة CPU Cache؟',['ذاكرة صغيرة وسريعة','توفير الطاقة','إخراج الصورة','تثبيت GPU'],0,'Cache تقلل زمن الوصول للبيانات المتكررة.'],
['ما المقصود بـ Clock Speed؟',['تردد تشغيل المعالج','سعة التخزين','حجم الكيس','قدرة PSU فقط'],0,'التردد يقاس غالبًا بالـGHz.'],
['ما وظيفة VRAM؟',['ذاكرة مخصصة للرسوميات','ذاكرة BIOS','تخزين الملفات النصية','طاقة GPU'],0,'VRAM تحفظ بيانات الرسوميات أثناء المعالجة.'],
['ما وظيفة Thermal Paste؟',['تحسين انتقال الحرارة','زيادة RAM','تثبيت GPU','توفير الكهرباء'],0,'المعجون يحسن انتقال الحرارة إلى المشتت.'],
['لماذا نستخدم CPU Cooler؟',['لتبريد المعالج','لتخزين الملفات','لتشغيل USB','لزيادة SSD'],0,'المعالج يحتاج تبريدًا للحفاظ على حرارته.'],
['ما هو Thermal Throttling؟',['خفض الأداء بسبب الحرارة','زيادة سرعة الإنترنت','زيادة التخزين','إعادة تثبيت Windows'],0,'قد يخفض العتاد التردد لحماية نفسه من الحرارة.'],
['ما وظيفة 24-Pin ATX؟',['طاقة اللوحة الأم الرئيسية','توصيل الشاشة','نقل بيانات SSD','توصيل المروحة فقط'],0,'24-Pin من موصلات الطاقة الرئيسية للوحة.'],
['ما وظيفة EPS CPU Power؟',['تغذية المعالج','توصيل GPU بالشاشة','تخزين BIOS','SATA Data'],0,'EPS مخصص لطاقة CPU.'],
['ما وظيفة GPU Power Cable؟',['طاقة إضافية لكارت الشاشة','توصيل RAM','توصيل الماوس','تشغيل BIOS'],0,'GPU القوية تحتاج طاقة إضافية.'],
['هل كل كابلات PSU قابلة للتبديل؟',['نعم دائمًا','لا، استخدم المتوافق مع المزود','فقط HDMI','فقط SATA'],1,'توصيلات الكابلات الداخلية قد تختلف بين المزودات.'],
['ما وظيفة DIMM Slot؟',['تركيب RAM','تركيب CPU','تركيب PSU','تركيب SSD SATA'],0,'DIMM هو شق ذاكرة النظام.'],
['لماذا يجب محاذاة notch في RAM؟',['للدخول بالاتجاه الصحيح','زيادة الإنترنت','إلغاء BIOS','تبريد CPU'],0,'الشق يحدد اتجاه التركيب الصحيح.'],
['ما فائدة Dual Channel؟',['زيادة عرض نطاق الذاكرة','زيادة PSU','تبريد GPU','تخزين الملفات'],0,'قناتان للذاكرة يمكن أن تزيدا عرض النطاق.'],
['ما الفرق الأساسي بين HDD وSSD؟',['HDD ميكانيكي وSSD فلاش','SSD شريط مغناطيسي','HDD أسرع دائمًا','لا فرق'],0,'HDD ميكانيكي وSSD يعتمد على فلاش.'],
['ما وظيفة SATA Data؟',['نقل البيانات لوحدات SATA','طاقة CPU','توصيل GPU','تشغيل المروحة'],0,'SATA Data ينقل البيانات بين اللوحة ووحدة التخزين.'],
['ما وظيفة SATA Power؟',['توفير الطاقة لوحدات SATA','نقل صورة','توصيل RAM','تحديث BIOS'],0,'SATA Power يمد وحدات SATA بالطاقة.'],
['ما المقصود بـ Form Factor؟',['مقاس وتصميم اللوحة أو الكيس','سرعة CPU','نوع Windows','سعة RAM'],0,'ATX وMicro-ATX أمثلة على Form Factor.'],
['ما أهمية توافق Socket؟',['تحديد توافق المعالج مع اللوحة','لون الكيس','سعة SSD','سرعة الإنترنت'],0,'يجب توافق Socket والمنصة.'],
['ما أهمية دعم BIOS للمعالج؟',['قد تحتاج اللوحة إصدار BIOS مناسبًا','يزيد الشاشة','يشغل المراوح فقط','لا علاقة'],0,'بعض المعالجات تحتاج BIOS حديثًا.'],
['ما وظيفة VRM؟',['تنظيم طاقة المعالج','تخزين الملفات','إخراج الصوت','تشغيل SSD'],0,'VRM تنظم الجهد والتيار للمعالج.'],
['لماذا نستخدم مروحة Case؟',['تحسين تدفق الهواء','زيادة RAM','تخزين BIOS','رفع PSU'],0,'مراوح الكيس تساعد على إدخال وإخراج الهواء.'],
['ما هو Airflow؟',['حركة الهواء داخل الكيس','سرعة SSD','عدد أنوية CPU','نوع RAM'],0,'تخطيط دخول وخروج الهواء يؤثر على الحرارة.'],
['ما المقصود بـ Bottleneck؟',['مكوّن يحد الأداء','زيادة التخزين','كابل طاقة','نوع Socket'],0,'عنق الزجاجة هو الحد الرئيسي للأداء في مهمة معينة.'],
['هل RTX 5090 تحتاج توافقًا مع PSU؟',['نعم','لا تحتاج طاقة','تعمل من RAM','تعمل من USB فقط'],0,'يجب اختيار PSU وكابلات مناسبة للبطاقة.'],
['ماذا تفعل عند تركيب RAM؟',['تطابق notch وتضغط حتى تثبت','تجبرها بالعكس','تضعها في PCIe','تثبتها بمسمار'],0,'محاذاة notch والتثبيت بالمشابك هي الطريقة الصحيحة.'],
['ماذا تفعل عند تركيب M.2؟',['تدخل الوحدة بزاوية ثم تخفضها','تضغطها بقوة','تضعها في DIMM','تحتاج SATA Data دائمًا'],0,'M.2 تدخل بزاوية ثم تثبت.'],
['ما أول شيء قبل تركيب قطع الكمبيوتر؟',['فصل الطاقة وتجهيز مكان آمن','تشغيل الجهاز','توصيل الشاشة','تحديث الألعاب'],0,'افصل الكهرباء واعمل على سطح مناسب.'],
['لماذا نستخدم standoffs؟',['فصل اللوحة عن الكيس وتثبيتها','زيادة RAM','تبريد CPU','توصيل Wi-Fi'],0,'تمنع التماس المباشر وتثبت اللوحة.'],
['ما وظيفة Chipset؟',['إدارة بعض الاتصالات والوظائف','تخزين Windows فقط','تبريد GPU','تشغيل الشاشة'],0,'Chipset يدير مجموعة من واجهات ووظائف المنصة.'],
['ما وظيفة USB؟',['توصيل أجهزة ونقل بيانات وطاقة حسب النوع','نوع CPU','ذاكرة GPU','نوع PSU'],0,'USB معيار شائع للأجهزة الطرفية.'],
['ما فائدة Ethernet؟',['اتصال شبكي سلكي','تخزين SSD','تبريد CPU','عرض الصور'],0,'Ethernet تقنية شبكة سلكية.'],
['ما المقصود بـ Driver؟',['برنامج يسمح للنظام بالتعامل مع العتاد','نوع RAM','كابل GPU','PSU'],0,'Driver يربط نظام التشغيل بالمكوّن.'],
['ما الفرق بين Software وHardware؟',['Software برامج وHardware أجزاء مادية','نفس الشيء','Hardware برامج','Software كابلات'],0,'Software برامج، Hardware مكونات مادية.'],
['ما وظيفة Operating System؟',['إدارة موارد الجهاز وتشغيل البرامج','توفير الكهرباء','تبريد GPU','تخزين BIOS فقط'],0,'نظام التشغيل يدير العتاد ويشغل التطبيقات.'],
['ما المقصود بـ Boot؟',['بدء تشغيل الجهاز وتحميل النظام','تركيب RAM','تنظيف الكيس','تحديث GPU'],0,'Boot سلسلة خطوات بدء الجهاز وتحميل OS.'],
['إذا لم تظهر صورة بعد تركيب GPU، ما أول شيء تفحصه؟',['تثبيت GPU والطاقة وكابل الشاشة','الكيبورد','حذف الملفات','زيادة RAM'],0,'ابدأ بالتوصيلات ومصدر العرض قبل تشخيص عطل آخر.'],
['إذا لم يتعرف الجهاز على RAM، ماذا تفحص؟',['تثبيتها والـslots والتوافق','HDMI فقط','SSD فقط','المروحة'],0,'افحص تركيب RAM والslots والتوافق.'],
['ما الهدف من اختبار الجهاز بعد التجميع؟',['التأكد من الإقلاع والتعرف على القطع والحرارة','تغيير لون الكيس','زيادة الوزن','إلغاء BIOS'],0,'POST والإقلاع والحرارة تكشف أخطاء التجميع.'],
['أين يوجد متحكم الذاكرة في معظم المنصات الحديثة؟',['داخل CPU','داخل الكيس','داخل المروحة','داخل HDMI'],0,'في منصات حديثة يوجد متحكم الذاكرة داخل المعالج.'],
['لماذا لا تضغط بقوة على CPU؟',['لأن المحاذاة الخاطئة قد تتلف المقبس أو المعالج','لزيادة السرعة','لتغيير Windows','لزيادة RAM'],0,'المحاذاة أهم من القوة أثناء تركيب CPU.']
];
let qi=0;
function renderQ(){const q=questions[qi];$('#qNumber').textContent=`سؤال ${qi+1} من 50`;$('#question').textContent=q[0];$('#feedback').textContent='';$('#nextQuestion').disabled=true;const wrap=$('#answers');wrap.innerHTML='';q[1].forEach((a,i)=>{const b=document.createElement('button');b.textContent=a;b.onclick=()=>answer(i);wrap.appendChild(b);});}
function answer(i){const q=questions[qi];const bs=[...document.querySelectorAll('#answers button')];bs.forEach(b=>b.disabled=true);bs[q[2]].classList.add('correct');if(i===q[2]){addXP(10);$('#feedback').textContent='✅ إجابة صحيحة! +10 XP — '+q[3];}else{bs[i].classList.add('wrong');$('#feedback').textContent='❌ الإجابة الصحيحة: '+q[1][q[2]]+' — '+q[3];}$('#nextQuestion').disabled=false;}
$('#nextQuestion').onclick=()=>{qi=(qi+1)%questions.length;renderQ();};
init();renderQ();