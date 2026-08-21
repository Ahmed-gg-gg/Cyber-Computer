const synth = window.speechSynthesis;
let voices = [];
let xp = Number(localStorage.getItem('cyberComputerXP') || 0);
let questionIndex = 0;
let answered = false;

function loadVoices(){ voices = synth ? synth.getVoices() : []; }
if (synth) { loadVoices(); synth.onvoiceschanged = loadVoices; }

function speak(text){
  if (!('speechSynthesis' in window)) { alert('متصفحك لا يدعم قراءة النص بالصوت. جرّب Chrome أو Edge.'); return; }
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const arabic = voices.find(v => /^ar(-|_)/i.test(v.lang)) || voices.find(v => /arab|Arabic/i.test(`${v.lang} ${v.name}`));
  if (arabic) u.voice = arabic;
  u.lang = arabic?.lang || 'ar-EG';
  u.rate = 0.95;
  u.pitch = 1;
  u.volume = 1;
  synth.speak(u);
}

document.querySelectorAll('.speak').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); speak(btn.dataset.speech); }));

const questions = [
['ما الوظيفة الأساسية للـCPU؟',['تخزين الملفات','تنفيذ التعليمات ومعالجة البيانات','توفير الكهرباء','تبريد الجهاز'],1,'CPU ينفذ تعليمات البرامج ويجري العمليات الحسابية والمنطقية.'],
['أي مكوّن يحتفظ بالبيانات مؤقتًا أثناء تشغيل البرامج؟',['RAM','HDD','PSU','Case'],0,'RAM هي ذاكرة العمل المؤقتة.'],
['ماذا يحدث عادة لمحتوى RAM عند إيقاف الكهرباء؟',['يُحفظ دائمًا','يختفي','ينتقل إلى GPU','يُطبع'],1,'RAM ذاكرة متطايرة، لذلك تفقد محتواها عند انقطاع الطاقة.'],
['أي قطعة تربط معظم مكونات الكمبيوتر ببعضها؟',['Motherboard','Mouse','Monitor','Speaker'],0,'اللوحة الأم تحتوي على المقابس والمنافذ والدوائر التي تربط المكونات.'],
['أين تركب وحدة RAM في اللوحة الأم؟',['PCIe','DIMM','SATA','CPU EPS'],1,'RAM تركب في شقوق DIMM.'],
['ما وظيفة GPU الأساسية؟',['معالجة الرسوميات','تخزين الملفات','توفير الطاقة','تبريد CPU'],0,'GPU متخصص في معالجة الرسوميات والعمليات المتوازية.'],
['ما المقصود بـSSD؟',['وحدة تخزين فلاش','مروحة','نوع RAM','مزود طاقة'],0,'SSD يستخدم ذاكرة فلاش لتخزين البيانات.'],
['ما الفرق الأساسي الذي يميز HDD عن SSD؟',['HDD ميكانيكي بأقراص دوارة','HDD هو RAM','SSD يحتاج مروحة','SSD لا يخزن ملفات'],0,'HDD يعتمد على أجزاء ميكانيكية دوارة، بينما SSD لا يعتمد عليها عادة.'],
['ما وظيفة PSU؟',['توزيع الطاقة المناسبة','تشغيل الألعاب فقط','تخزين Windows','زيادة RAM'],0,'PSU يحول ويوزع الطاقة المناسبة للمكونات.'],
['ما هو موصل 24-Pin؟',['طاقة رئيسية للوحة الأم','كابل شاشة','كابل سماعة','كابل إنترنت'],0,'24-Pin ATX من موصلات الطاقة الرئيسية للوحة الأم.'],
['ما وظيفة CPU EPS؟',['توفير طاقة للمعالج','توصيل SSD SATA','تشغيل الشاشة','تبريد GPU'],0,'موصل EPS يغذي دائرة طاقة المعالج على اللوحة الأم.'],
['أين يركب كارت الشاشة المكتبي عادة؟',['DIMM','PCIe x16','SATA','USB'],1,'كروت الشاشة تستخدم عادة منفذ PCIe x16.'],
['ما هي VRAM؟',['ذاكرة مخصصة للـGPU','ذاكرة BIOS فقط','ذاكرة PSU','تخزين HDD'],0,'VRAM تخزن البيانات الرسومية التي يحتاجها GPU.'],
['ما هو M.2؟',['شكل/واجهة لتركيب وحدات صغيرة مثل NVMe','نوع باور سبلاي','مروحة','نظام تشغيل'],0,'M.2 هو شكل ومقاس للقطع، ويمكن أن يستخدم مع NVMe للتخزين السريع.'],
['ما وظيفة SATA؟',['توصيل بعض وحدات التخزين','تبريد CPU','توصيل RAM','تشغيل BIOS'],0,'SATA واجهة لتوصيل HDD وSATA SSD وغيرها.'],
['ما هو BIOS/UEFI؟',['برنامج منخفض المستوى يبدأ قبل نظام التشغيل','لعبة','نوع كابل','ذاكرة RAM'],0,'BIOS/UEFI يهيئ العتاد ويساعد في عملية الإقلاع.'],
['ما معنى POST؟',['فحص مكونات عند بدء التشغيل','ضغط الملفات','تشفير القرص','تحديث Windows'],0,'POST يفحص مكونات أساسية قبل تحميل نظام التشغيل.'],
['ما وظيفة نظام التشغيل؟',['إدارة موارد الجهاز وتشغيل البرامج','توفير كهرباء','تبريد الجهاز','تصنيع CPU'],0,'نظام التشغيل يدير الموارد ويوفر بيئة لتشغيل البرامج.'],
['ما وظيفة Driver؟',['يساعد النظام على التواصل مع قطعة عتاد','يخزن الصور فقط','يزيد حجم الشاشة','هو كابل'],0,'التعريف يترجم أو ينظم طريقة تواصل نظام التشغيل مع العتاد.'],
['ما معنى Hardware؟',['الأجزاء المادية','البرامج','المواقع','الملفات فقط'],0,'Hardware هو كل جزء مادي يمكن لمسه.'],
['ما معنى Software؟',['البرامج والتعليمات','المازر بورد','الرام','الكابلات'],0,'Software هو البرامج والتعليمات التي تجعل الجهاز ينفذ المهام.'],
['أي مما يلي جهاز إدخال؟',['Keyboard','Monitor','Speaker','Printer'],0,'الكيبورد يرسل مدخلات إلى الكمبيوتر.'],
['أي مما يلي جهاز إخراج؟',['Monitor','Keyboard','Mouse','Microphone'],0,'الشاشة تعرض نتائج من الكمبيوتر.'],
['ما معنى CPU Core؟',['نواة تنفيذ داخل المعالج','كابل طاقة','نوع SSD','منفذ USB'],0,'كل Core يمثل وحدة تنفيذ داخل المعالج.'],
['هل سرعة GHz وحدها تحدد أداء CPU؟',['نعم دائمًا','لا، المعمارية والأنوية وعوامل أخرى مهمة','فقط في RAM','فقط في HDD'],1,'التردد مهم لكنه ليس المقياس الوحيد للأداء.'],
['ما وظيفة Cache؟',['تخزين سريع قريب من المعالج','تخزين دائم للصور فقط','تبريد المعالج','توفير الطاقة'],0,'Cache تقلل زمن الوصول إلى بيانات وتعليمات متكررة.'],
['ما وظيفة Thermal Paste؟',['تحسين انتقال الحرارة بين CPU والمبرد','تثبيت RAM','توصيل الإنترنت','تخزين BIOS'],0,'المعجون يملأ الفراغات الدقيقة لتحسين انتقال الحرارة.'],
['ماذا يفعل CPU Cooler؟',['يساعد على نقل الحرارة بعيدًا عن CPU','يزيد مساحة SSD','يشغل Wi-Fi','يخزن Windows'],0,'المبرد يزيل الحرارة الناتجة عن المعالج.'],
['ما المقصود بـAirflow داخل الكيس؟',['حركة الهواء البارد والساخن عبر الجهاز','سرعة الإنترنت','تردد RAM','سرعة SSD'],0,'تدفق الهواء الجيد يساعد في خفض درجات الحرارة.'],
['ما هو Form Factor للوحة الأم؟',['حجم وشكل اللوحة ومعايير تركيبها','نوع المعالج فقط','سرعة الإنترنت','سعة RAM'],0,'ATX وMicro ATX وMini ITX أمثلة على Form Factors.'],
['ما وظيفة VRM؟',['تنظيم الطاقة للمعالج ومكونات أخرى','تخزين الألعاب','عرض الصور','تبريد الكيس فقط'],0,'VRM تنظم وتحول الطاقة لتناسب المكونات.'],
['ماذا يعني Thermal Throttling؟',['تقليل السرعة بسبب الحرارة العالية','زيادة RAM تلقائيًا','تشفير القرص','زيادة سعة PSU'],0,'المكون قد يقلل تردده عند ارتفاع الحرارة لحماية نفسه.'],
['ما وظيفة USB؟',['نقل بيانات وطاقة لأجهزة مختلفة','تخزين BIOS فقط','توصيل CPU مباشرة','تبريد GPU'],0,'USB معيار شائع لتوصيل الأجهزة ونقل البيانات والطاقة حسب الإصدار.'],
['ما وظيفة Network Card؟',['الاتصال بالشبكات','معالجة الرسوميات','تبريد CPU','تخزين الملفات'],0,'بطاقة الشبكة توفر اتصال Ethernet أو Wi-Fi حسب نوعها.'],
['ما هو Ethernet؟',['اتصال شبكة سلكي','نوع RAM','مبرد','نظام تشغيل'],0,'Ethernet تقنية شبكة سلكية تستخدم كابلات شبكة.'],
['أي عبارة صحيحة عن CPU وGPU؟',['CPU للمهام العامة وGPU مناسب للعمليات المتوازية','هما نفس الشيء','GPU هو PSU','CPU هو SSD'],0,'لكل منهما تصميم واستخدامات مختلفة.'],
['ما الذي تحتاجه بعض كروت الشاشة بالإضافة إلى PCIe؟',['كابل طاقة إضافي من PSU','كابل SATA فقط دائمًا','RAM خارجية','كابل سماعة'],0,'الكروت ذات استهلاك الطاقة الأعلى قد تحتاج موصلات طاقة إضافية.'],
['قبل تركيب قطعة داخل الكمبيوتر، ما أهم خطوة؟',['التأكد من التوافق وفصل الكهرباء','تشغيل الجهاز','رش الماء','نزع المراوح'],0,'السلامة والتوافق أساسيان قبل التجميع.'],
['ماذا تفعل عند تركيب RAM؟',['مطابقة الشق واتجاهها ثم الضغط حتى تثبت','إجبارها بالعكس','توصيلها في PCIe','وضعها على PSU'],0,'شق RAM يحدد الاتجاه الصحيح، ويجب تثبيتها في DIMM slot.'],
['ماذا يحدث إذا نسيت توصيل 24-Pin؟',['قد لا تحصل اللوحة الأم على الطاقة الرئيسية','يزداد الإنترنت','تعمل RAM أسرع','تتحول إلى SSD'],0,'24-Pin هو مصدر الطاقة الرئيسي للوحة الأم.'],
['ماذا يحدث إذا لم توصل CPU EPS؟',['قد لا يقلع المعالج أو الجهاز','تزيد VRAM','يعمل HDD أسرع','تضيء الشاشة دائمًا'],0,'طاقة المعالج ضرورية لعمل دائرة CPU.'],
['ما المقصود بعملية Boot؟',['بدء الجهاز وتحميل نظام التشغيل','حذف الملفات','تغيير RAM','تنظيف الكيس'],0,'Boot هي سلسلة خطوات بدء التشغيل حتى تحميل نظام التشغيل.'],
['أي قطعة تحفظ الملفات بعد إغلاق الجهاز؟',['SSD/HDD','RAM','Cache','VRAM فقط'],0,'التخزين غير المتطاير يحتفظ بالملفات بعد إيقاف الجهاز.'],
['أي ذاكرة أقرب وأسرع من RAM في المعالج؟',['Cache','HDD','USB','SATA SSD'],0,'Cache داخل/قريبة من CPU وأسرع من RAM عادة.'],
['ما فائدة Dual Channel RAM؟',['زيادة عرض نطاق نقل البيانات عند استخدام ترتيب متوافق','توفير الكهرباء فقط','تشغيل GPU بدون طاقة','تخزين الملفات'],0,'Dual Channel يسمح باستخدام قناتين للذاكرة بشكل متوازٍ عند توفر الشروط.'],
['ما القطعة التي تحمي وتنظم المكونات داخليًا؟',['Case','RAM','CPU','BIOS'],0,'الكيس يحمل المكونات ويساعد في الحماية وتدفق الهواء وتنظيم الكابلات.'],
['أي تسلسل أقرب للإقلاع الصحيح؟',['Power → POST/UEFI → Boot Device → OS','OS → PSU → RAM → Power','GPU → Case → OS → PSU','RAM → Monitor → Power'],0,'بعد وصول الطاقة يبدأ تهيئة وفحص العتاد ثم اختيار جهاز الإقلاع وتحميل النظام.'],
['إذا كان الجهاز يعمل لكن الحرارة مرتفعة، ماذا تفحص أولًا؟',['التبريد وتدفق الهواء وتركيب المبرد','اسم المستخدم','لون الكيبورد','حجم الشاشة'],0,'الحرارة ترتبط بالتبريد والمعجون وتدفق الهواء وسرعات المراوح.'],
['ما الفرق بين SATA SSD وNVMe SSD؟',['NVMe عادة يستخدم PCIe وبروتوكول NVMe، وSATA SSD يستخدم واجهة SATA','لا فرق إطلاقًا','SATA SSD هو RAM','NVMe هو PSU'],0,'NVMe يعمل عبر PCIe بينما SATA SSD يستخدم SATA.'],
['لماذا لا يجب إجبار CPU داخل الـSocket؟',['لأن اتجاهه ومطابقته للـSocket مهمان وقد تتلف الأرجل أو المقبس','لأنه يحتاج USB','لأنه RAM','لأنه لا يدخل في Motherboard'],0,'المعالج يجب أن يطابق socket ويتجه حسب العلامات، ولا يحتاج قوة لإجباره.'],
['ما أفضل وصف للوحة الأم؟',['منصة اتصال وتغذية للمكونات','وحدة تخزين فقط','شاشة','مروحة'],0,'اللوحة الأم تربط المكونات وتوفر مسارات اتصال وموصلات طاقة.'],
['ما الهدف من الاختبار بعد كل مرحلة؟',['التأكد من فهم المفاهيم قبل الانتقال','تغيير اسم الجهاز','زيادة سرعة الإنترنت','حذف الدرس'],0,'الاختبار يقيس الفهم ويمنح XP قبل فتح مراحل جديدة.']
];

function renderQuestion(){
 const q=questions[questionIndex]; answered=false;
 document.getElementById('questionCounter').textContent=`السؤال ${questionIndex+1} من ${questions.length}`;
 document.getElementById('score').textContent=`${xp} XP`;
 document.getElementById('quizQuestion').textContent=q[0];
 const box=document.getElementById('answers'); box.innerHTML='';
 q[1].forEach((text,i)=>{const b=document.createElement('button');b.className='answer';b.textContent=text;b.addEventListener('click',()=>answer(i));box.appendChild(b);});
 document.getElementById('quizFeedback').textContent='';
 const next=document.getElementById('nextQuestion'); next.disabled=true; next.textContent=questionIndex===questions.length-1?'إنهاء الاختبار 🏆':'السؤال التالي →';
}
function answer(choice){
 if(answered)return; answered=true; const q=questions[questionIndex]; const ok=choice===q[2];
 document.querySelectorAll('.answer').forEach((b,i)=>{b.disabled=true;if(i===q[2])b.classList.add('correct-answer');if(i===choice&&!ok)b.classList.add('wrong-answer');});
 if(ok){xp+=10;localStorage.setItem('cyberComputerXP',xp);document.getElementById('score').textContent=`${xp} XP`;document.getElementById('quizFeedback').textContent=`✅ صحيح! +10 XP — ${q[3]}`;}
 else document.getElementById('quizFeedback').textContent=`❌ الإجابة الصحيحة: ${q[1][q[2]]}. ${q[3]}`;
 document.getElementById('nextQuestion').disabled=false;
}
document.getElementById('nextQuestion').addEventListener('click',()=>{if(questionIndex<questions.length-1){questionIndex++;renderQuestion();}else{document.getElementById('quizFeedback').textContent=`🏆 خلصت الاختبار! مجموعك ${xp} XP.`;document.getElementById('nextQuestion').disabled=true;}});

function autoBuildLab(){
 const parts=document.querySelectorAll('.part'),zones=document.querySelectorAll('.zone'),status=document.getElementById('buildStatus'),powerBtn=document.getElementById('powerBtn'),placed=new Set(),map={cpu:'cpu',ram:'ram',gpu:'gpu',storage:'storage',power:'power'};
 parts.forEach(part=>{part.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',part.dataset.part);part.classList.add('dragging')});part.addEventListener('dragend',()=>part.classList.remove('dragging'))});
 zones.forEach(zone=>{zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('over')});zone.addEventListener('dragleave',()=>zone.classList.remove('over'));zone.addEventListener('drop',e=>{e.preventDefault();zone.classList.remove('over');const part=e.dataTransfer.getData('text/plain');if(!part)return;if(map[part]!==zone.dataset.slot){status.textContent=`❌ مش مكان ${part.toUpperCase()}. اقرأ المفاهيم وحاول مرة أخرى.`;return}if(placed.has(part))return;placed.add(part);zone.classList.add('correct');zone.innerHTML=`<strong>✓ ${part.toUpperCase()} Installed</strong>`;status.textContent=`✅ تم تركيب ${part.toUpperCase()} بشكل صحيح.`;const item=document.querySelector(`.part[data-part="${part}"]`);if(item){item.style.opacity='.35';item.style.pointerEvents='none'}if(placed.size===5)status.textContent='🏆 ممتاز! كل القطع الأساسية مركبة. جرّب تشغيل الجهاز.'})});
 powerBtn.addEventListener('click',()=>{if(placed.size<5){status.textContent=`⚠️ الجهاز لن يقلع بعد. ركّبت ${placed.size}/5 قطع أساسية.`;return}powerBtn.textContent='🟢 الجهاز يعمل';powerBtn.disabled=true;status.textContent='🟢 POST Successful — CPU → RAM → BIOS → Operating System';document.querySelector('.pc-scene .case').style.boxShadow='0 30px 90px rgba(0,0,0,.55),0 0 55px rgba(0,255,149,.2)'});
}
autoBuildLab();renderQuestion();