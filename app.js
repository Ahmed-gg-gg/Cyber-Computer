(() => {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const safeText = (el, value) => { if (el) el.textContent = value; };

  // ============================================================
  // GLOBAL XP
  // ============================================================
  let xp = Number(localStorage.getItem('cyberComputerXP') || 0);
  const xpEl = $('#xp'), quizXpEl = $('#quizXP'), buildXpEl = $('#buildXP');
  const setXP = (value) => {
    xp = Math.max(0, Number(value) || 0);
    localStorage.setItem('cyberComputerXP', String(xp));
    safeText(xpEl, xp); safeText(quizXpEl, `${xp} XP`); safeText(buildXpEl, xp);
  };
  const addXP = (n) => setXP(xp + n);
  setXP(xp);

  // Small fallback styles so the quiz remains readable even if a CSS rule changes.
  const style = document.createElement('style');
  style.textContent = `
    #answers{display:grid;gap:10px;margin:18px 0}.answer{width:100%;padding:14px 16px;border:1px solid rgba(105,190,255,.18);border-radius:12px;background:#0c1420;color:#eaf7ff;text-align:right;cursor:pointer;font:inherit;transition:.18s}.answer:hover:not(:disabled){transform:translateY(-1px);border-color:#20d9ff;background:#111d2c}.answer:disabled{cursor:default}.answer.correct{border-color:#32e58b;background:rgba(50,229,139,.12)}.answer.wrong{border-color:#ff5577;background:rgba(255,85,119,.12)}#feedback{min-height:44px;line-height:1.7;margin:8px 0 14px}.correct{color:#65efad}.wrong{color:#ff718c}
  `;
  document.head.appendChild(style);

  // ============================================================
  // QUIZ — intentionally independent from Three.js
  // ============================================================
  const questions = [
    ['ما وظيفة CPU الأساسية؟',['تخزين الملفات','تنفيذ التعليمات والعمليات','عرض الصور فقط','توفير الكهرباء'],1,'CPU هو المعالج الذي ينفذ تعليمات البرامج والعمليات الحسابية والمنطقية.'],
    ['ما الذي يميز RAM؟',['تخزين دائم','ذاكرة عمل سريعة ومؤقتة','مزود طاقة','بطاقة توسعة'],1,'RAM تستخدمها البرامج أثناء التشغيل وتفقد محتواها عند انقطاع الطاقة.'],
    ['أين يركب المعالج على اللوحة الأم؟',['PCIe','M.2','CPU Socket','DIMM'],2,'المعالج يثبت في مقبس CPU Socket المتوافق مع نوعه.'],
    ['ما وظيفة Motherboard؟',['تبريد الجهاز فقط','ربط المكونات وتوفير مسارات الاتصال','تخزين نظام التشغيل فقط','تشغيل الشاشة فقط'],1,'اللوحة الأم تربط CPU وRAM وGPU والتخزين والطاقة وباقي المكونات.'],
    ['ما الواجهة الشائعة لبطاقة الرسوميات الحديثة؟',['DIMM','PCIe x16','SATA Power فقط','USB-A'],1,'بطاقات الرسوميات المنفصلة تركب عادة في منفذ PCIe x16.'],
    ['ما M.2 في أجهزة الكمبيوتر؟',['نوع من مقابس/واجهات وحدات التخزين والتوسعة','نوع من المعالجات','نوع من الذاكرة العشوائية','نوع من المراوح'],0,'M.2 هو شكل/واجهة تستخدم بكثرة مع NVMe SSD.'],
    ['ما NVMe SSD؟',['وحدة تخزين سريعة تستخدم PCIe','مزود طاقة','مروحة CPU','كابل فيديو'],0,'NVMe بروتوكول تخزين يعمل عادة فوق PCIe ويوفر أداءً عاليًا.'],
    ['ما وظيفة PSU؟',['تحويل وتوفير الطاقة المناسبة للمكونات','معالجة الرسوميات','تخزين البيانات','تشغيل BIOS فقط'],0,'PSU يحول كهرباء المصدر إلى جهود مناسبة ويغذي المكونات.'],
    ['ما الموصل الرئيسي للوحة الأم؟',['24-Pin ATX','3.5mm Audio','HDMI','RJ45'],0,'موصل ATX 24-Pin يغذي اللوحة الأم بالطاقة الرئيسية.'],
    ['ما موصل EPS المستخدم غالبًا؟',['طاقة المعالج','طاقة الشاشة فقط','بيانات SSD','صوت السماعات'],0,'EPS/CPU power يزود دائرة المعالج بالطاقة من مزود الطاقة.'],
    ['ماذا يفعل CPU Cooler؟',['يقلل حرارة المعالج','يزيد سعة RAM','يخزن الملفات','يوفر الإنترنت'],0,'المشتت والمروحة ينقلان الحرارة بعيدًا عن المعالج.'],
    ['ما المقصود بـ BIOS/UEFI؟',['برنامج تهيئة وإقلاع منخفض المستوى','نوع RAM','نوع GPU','برنامج رسم'],0,'UEFI/BIOS يهيئ العتاد ويبدأ عملية الإقلاع قبل نظام التشغيل.'],
    ['ما POST؟',['فحص ذاتي عند التشغيل','بروتوكول تخزين','نوع كابل','برنامج تصميم'],0,'POST يفحص المكونات الأساسية أثناء بدء تشغيل الجهاز.'],
    ['أي ذاكرة تفقد محتواها عادة عند إيقاف الطاقة؟',['SSD','RAM','ROM','قرص خارجي'],1,'RAM ذاكرة volatile، لذلك محتواها المؤقت يختفي عند انقطاع الطاقة.'],
    ['أي مكون مسؤول غالبًا عن الرسوميات؟',['GPU','PSU','SSD','RAM'],0,'GPU يعالج الرسوميات والعمليات المتوازية بكفاءة.'],
    ['ما معنى PCIe؟',['واجهة اتصال عالية السرعة للمكونات','نوع من أنظمة التشغيل','نوع من المعجون الحراري','نوع من الشاشة'],0,'PCI Express ناقل عالي السرعة لبطاقات التوسعة ووحدات التخزين وغيرها.'],
    ['لماذا يجب التأكد من توافق RAM مع اللوحة؟',['لأن كل RAM تعمل في أي جهاز','لأن نوع DDR والمواصفات والمنافذ يجب أن تتوافق','لأن RAM تحتاج HDMI','لأن RAM تعمل من PSU مباشرة'],1,'يجب توافق جيل DDR وعدد الوحدات والسرعات ودعم اللوحة.'],
    ['ما الذي يحدد توافق المعالج مع اللوحة بشكل أساسي؟',['Socket والمنصة المدعومة','لون اللوحة','حجم الشاشة','نوع الماوس'],0,'يجب أن يتوافق Socket والمنصة والـBIOS مع المعالج.'],
    ['ما المقصود بـ Cache في CPU؟',['ذاكرة صغيرة وسريعة قريبة من أنوية المعالج','مزود طاقة','وحدة تخزين خارجية','نوع كابل'],0,'Cache تقلل زمن الوصول إلى بيانات وتعليمات يستخدمها المعالج كثيرًا.'],
    ['ما وظيفة نواة CPU؟',['تنفيذ مسار من التعليمات','تخزين الصور دائمًا','توفير الكهرباء','تبريد اللوحة'],0,'كل نواة تستطيع تنفيذ تعليمات، وتعدد الأنوية يسمح بتوازي أكبر.'],
    ['ما الأفضل عند تركيب CPU؟',['إجباره إذا لم يدخل','محاذاته مع العلامات وإنزاله برفق','وضعه فوق RAM','تثبيته بالغراء'],1,'المعالج يجب أن يدخل في الاتجاه الصحيح دون ضغط أو إجبار.'],
    ['ما وظيفة notch في RAM؟',['المساعدة على تحديد اتجاه التركيب','زيادة سرعة الإنترنت','تبريد الذاكرة','توصيل الطاقة'],0,'الشق في وحدة RAM يطابق اللسان في منفذ DIMM لمنع التركيب الخاطئ.'],
    ['ماذا يحدث عند الضغط الصحيح على RAM؟',['تثبتها المشابك في مكانها','تتحول إلى SSD','تعمل بدون لوحة','تضيء الشاشة'],0,'المشابك الجانبية تقفل على الوحدة عند تركيبها بشكل صحيح.'],
    ['كيف يركب NVMe M.2 عادة؟',['بزاوية ثم يخفض ويثبت','عموديًا داخل PCIe x16','داخل PSU','في Socket المعالج'],0,'يدخل طرف M.2 بزاوية في المنفذ ثم يخفض ويثبت.'],
    ['لماذا يستخدم المعجون الحراري؟',['تحسين انتقال الحرارة بين CPU والمشتت','زيادة سعة SSD','توصيل الكهرباء','تثبيت RAM'],0,'المعجون يملأ الفجوات المجهرية ويحسن انتقال الحرارة.'],
    ['ما CPU_FAN؟',['موصل مروحة المعالج','منفذ SSD','موصل GPU','منفذ USB'],0,'CPU_FAN مخصص عادة لمروحة أو مضخة تبريد المعالج.'],
    ['ما الذي يجب تجنبه مع الموصلات؟',['إجبار الموصل في اتجاه خاطئ','التأكد من الاتجاه','استخدام الكابل المناسب','التأكد من الإحكام'],0,'لا يجب إجبار أي موصل؛ المفتاح والشكل يحددان الاتجاه الصحيح.'],
    ['لماذا تحتاج GPU قوية إلى PSU مناسب؟',['لأنها تستهلك طاقة وقد تحتاج موصلات مخصصة','لأنها تخزن الملفات','لأنها تستبدل RAM','لأنها تشغل BIOS فقط'],0,'بطاقات الأداء العالي تحتاج قدرة كافية وكابلات طاقة متوافقة.'],
    ['ما وظيفة VRM على اللوحة؟',['تنظيم وتوفير طاقة مستقرة للمعالج ومكونات أخرى','تخزين النظام','عرض الفيديو','توصيل الإنترنت'],0,'VRM يحول وينظم الطاقة لتناسب دوائر المعالج وغيرها.'],
    ['ما الفرق الأساسي بين SSD وRAM؟',['SSD تخزين دائم نسبيًا وRAM ذاكرة عمل مؤقتة','كلاهما نفس الشيء','RAM تخزين دائم وSSD مؤقت','لا فرق'],0,'SSD يحتفظ بالبيانات دون طاقة، بينما RAM مخصصة للعمل المؤقت.'],
    ['ما فائدة Dual Channel في RAM؟',['زيادة عرض النطاق عند استخدام قناتين متوافقتين','زيادة سعة SSD','تبريد CPU','توفير الطاقة'],0,'تشغيل الذاكرة في قناتين متوافقتين يمكن أن يزيد bandwidth.'],
    ['ما المقصود بـ Clock Speed للمعالج؟',['تردد تشغيل الأنوية','سعة SSD','حجم الكيس','قدرة PSU'],0,'التردد يقيس دورات الساعة، لكنه ليس المقياس الوحيد للأداء.'],
    ['ما معنى TDP في سياق المعالجات؟',['مؤشر حراري/طاقي تستخدمه الشركات لتصميم التبريد والطاقة','سعة RAM','سرعة الشبكة','نوع PCIe'],0,'TDP مرجع تصميمي للطاقة والحرارة وليس ببساطة استهلاكًا ثابتًا دائمًا.'],
    ['ما فائدة Heatsink؟',['توفير مساحة أكبر لتبديد الحرارة','تخزين الملفات','زيادة عدد الأنوية','توصيل الإنترنت'],0,'المشتت يزيد مساحة السطح ويساعد على نقل الحرارة للهواء.'],
    ['ما المقصود بـ Form Factor؟',['مقاس ومعايير تصميم المكون','سرعة المعالج','نوع نظام التشغيل','عدد الملفات'],0,'Form factor يحدد أبعادًا ومواقع تثبيت ومعايير توافق في المكونات.'],
    ['ما الذي يحدد غالبًا توافق PSU مع الكيس؟',['المقاس والمعيار مثل ATX/SFX','لون PSU','نوع GPU فقط','إصدار Windows'],0,'يجب أن يتوافق حجم PSU ومعيار التثبيت مع الكيس.'],
    ['ما وظيفة منفذ SATA؟',['اتصال شائع لبعض وحدات التخزين','تركيب CPU','تركيب RAM','توصيل الشاشة فقط'],0,'SATA يستخدم مع أقراص ووحدات تخزين SATA وأجهزة أخرى متوافقة.'],
    ['ما الفرق بين SATA SSD وNVMe SSD؟',['NVMe يعمل عادة عبر PCIe وبروتوكول NVMe','SATA أسرع دائمًا','لا يوجد فرق تقني','NVMe نوع RAM'],0,'NVMe يستخدم PCIe عادة، بينما SATA SSD يستخدم واجهة SATA.'],
    ['ما فائدة تبريد الهواء الجيد داخل الكيس؟',['إدخال هواء بارد وإخراج الساخن','زيادة مساحة SSD','رفع سعة RAM','تغيير BIOS'],0,'تدفق الهواء المنظم يساعد في إبقاء المكونات ضمن درجات حرارة مناسبة.'],
    ['ما المقصود بـ Thermal Throttling؟',['خفض الأداء تلقائيًا بسبب الحرارة المرتفعة','زيادة سرعة SSD','تغيير نظام الملفات','إيقاف الماوس'],0,'المكون قد يخفض تردده لحماية نفسه عندما تصل الحرارة إلى حدود مرتفعة.'],
    ['ما وظيفة CMOS/UEFI settings عادة؟',['حفظ وإدارة إعدادات العتاد والإقلاع','تخزين الفيديو','تبريد CPU','تشغيل السماعات'],0,'إعدادات UEFI تشمل ترتيب الإقلاع وبعض إعدادات العتاد.'],
    ['ما Boot Order؟',['ترتيب الأجهزة التي يحاول النظام الإقلاع منها','ترتيب تركيب RAM','سرعة المراوح','ترتيب كابلات الكهرباء'],0,'Boot order يحدد الجهاز الذي يحاول firmware الإقلاع منه أولًا.'],
    ['ما المقصود بـ POST beep أو debug indicator؟',['إشارة تساعد في تشخيص مشاكل بدء التشغيل','زيادة سرعة CPU','تثبيت SSD','نوع GPU'],0,'صفارات أو LEDs/شاشات التشخيص قد تساعد في تحديد مكون يسبب فشل POST.'],
    ['لماذا يجب فصل الكهرباء قبل تركيب المكونات؟',['لتقليل خطر تلف المكونات أو حدوث قصر','لزيادة سرعة الإنترنت','لتحديث BIOS','لزيادة RAM'],0,'فصل الطاقة خطوة أساسية للسلامة وتقليل مخاطر الضرر الكهربائي.'],
    ['ما أفضل طريقة للتعامل مع المكونات الإلكترونية؟',['الإمساك بالحواف وتجنب لمس نقاط التوصيل قدر الإمكان','لمس الشرائح دائمًا','وضعها على سطح معدني','ثنيها'],0,'التعامل من الحواف يقلل لمس نقاط الاتصال ويحد من مخاطر التلف.'],
    ['ما المقصود بـ ESD؟',['تفريغ كهرباء ساكنة','نوع SSD','نوع RAM','إشارة فيديو'],0,'ESD هو electrostatic discharge وقد يضر المكونات الإلكترونية الحساسة.'],
    ['أي مكون يخزن نظام التشغيل والملفات عادة؟',['SSD/HDD','RAM','CPU','VRM'],0,'نظام التشغيل والملفات تحفظ عادة على وحدة تخزين مثل SSD أو HDD.'],
    ['ما وظيفة chipset الحديثة؟',['إدارة مجموعة من الاتصالات والميزات الطرفية على المنصة','تبريد GPU فقط','تخزين RAM','توليد الكهرباء'],0,'Chipset/platform controllers تدير اتصالات وميزات طرفية بحسب تصميم المنصة.'],
    ['إذا لم يظهر الجهاز صورة، ما خطوة منطقية أولى؟',['فحص الطاقة والتوصيلات وPOST والشاشة','تغيير الكيس فورًا','حذف الملفات','زيادة RAM عشوائيًا'],0,'ابدأ بالتشخيص الأساسي: الطاقة، الكابلات، الشاشة، POST ومؤشرات اللوحة.'],
    ['ما الهدف من تركيب المكونات بالترتيب الصحيح؟',['تقليل الأخطاء وضمان التوافق والوصول السهل للموصلات','زيادة وزن الجهاز','تغيير نظام التشغيل','إلغاء الحاجة إلى PSU'],0,'الترتيب المنطقي يجعل التجميع أكثر أمانًا وأسهل في الفحص.'],
    ['بعد تركيب كل القطع، ما الخطوة المناسبة قبل تشغيل الجهاز؟',['فحص التوصيلات والتأكد من عدم وجود كابلات أو قطع غير مثبتة','رش الماء داخل الكيس','إزالة RAM','فصل PSU'],0,'المراجعة النهائية للتوصيلات والتثبيت مهمة قبل أول تشغيل.'],
    ['ما المقصود بـ bottleneck؟',['مكون يحد الأداء النسبي للنظام في سيناريو معين','نوع كابل','برنامج حماية','نوع RAM'],0,'عنق الزجاجة هو عامل أو مكون يحد الأداء مقارنة بباقي النظام في حمل معين.']
  ];

  let qIndex = 0, answered = false;
  const qNumber = $('#qNumber'), questionEl = $('#question'), answersEl = $('#answers'), feedbackEl = $('#feedback'), nextBtn = $('#nextQuestion');
  function renderQuestion() {
    if (!questionEl || !answersEl) return;
    answered = false; const q = questions[qIndex];
    safeText(qNumber, `سؤال ${qIndex + 1} من ${questions.length}`); safeText(questionEl, q[0]); answersEl.innerHTML='';
    if(feedbackEl){feedbackEl.textContent='';feedbackEl.className='';} if(nextBtn) nextBtn.disabled=true;
    q[1].forEach((answer,i)=>{const b=document.createElement('button');b.className='answer';b.type='button';b.textContent=`${String.fromCharCode(65+i)}. ${answer}`;b.addEventListener('click',()=>answerQuestion(i,b));answersEl.appendChild(b);});
  }
  function answerQuestion(choice,button){
    if(answered)return; answered=true; const q=questions[qIndex], correct=choice===q[2];
    $$('.answer').forEach((b,i)=>{b.disabled=true;if(i===q[2])b.classList.add('correct');});
    if(correct){button.classList.add('correct');addXP(10);if(feedbackEl){feedbackEl.className='correct';feedbackEl.textContent=`✅ إجابة صحيحة! +10 XP — ${q[3]}`;}}
    else{button.classList.add('wrong');if(feedbackEl){feedbackEl.className='wrong';feedbackEl.textContent=`❌ الإجابة الصحيحة: ${q[1][q[2]]} — ${q[3]}`;}}
    if(nextBtn)nextBtn.disabled=false;
  }
  nextBtn?.addEventListener('click',()=>{if(!answered)return;qIndex++;if(qIndex>=questions.length)qIndex=0;renderQuestion();});
  renderQuestion();

  // ============================================================
  // 3D BUILDER — loaded only after Three.js exists
  // ============================================================
  const mount=$('#threeScene');
  let T=null, scene=null, camera=null, renderer=null, board=null, materials=null;
  let selectedPart=null, draggingPart=null, autoRotate=false, wireMode=false, initialized3D=false;
  let rotX=-0.58,rotY=0.55,zoom=11,viewDrag=false,lastX=0,lastY=0;
  const objects=Object.create(null),installed=new Set(),targets=Object.create(null);
  const names={cpu:'CPU — AMD Ryzen 9 9950X3D',ram:'RAM — DDR5 64GB (2×32GB) 6000MHz',gpu:'GPU — NVIDIA GeForce RTX 5090',ssd:'NVMe SSD — PCIe 5.0 M.2 2TB',cooler:'CPU Cooler — High-End Tower',psu:'PSU — 1200W ATX 3.x',power:'Power Cables — 24-Pin + EPS + GPU'};
  const info={cpu:'حاذِ علامة المعالج مع علامة المقبس، أنزل CPU برفق ثم أغلق الذراع.',ram:'حاذِ notch الرامة مع اللسان داخل DIMM واضغط حتى تغلق المشابك.',gpu:'افتح لسان PCIe x16، أدخل البطاقة بشكل مستقيم وثبتها ثم صل طاقة GPU.',ssd:'أدخل NVMe في M.2 بزاوية، اخفضه ثم ثبته بالبرغي أو آلية التثبيت.',cooler:'ثبت قاعدة التبريد، ضع المعجون حسب تعليمات الشركة، ثم وصل CPU_FAN.',psu:'ثبت PSU داخل الكيس واستخدم كابلاته المتوافقة. صل 24-Pin وEPS وطاقة GPU.',power:'صل 24-Pin للوحة، EPS للمعالج، وكابل GPU للبطاقة. لا تجبر أي موصل.'};
  const sceneStatus=(text)=>safeText($('#sceneStatus'),text);

  function loadThree(){
    if(window.THREE)return Promise.resolve(window.THREE);
    return new Promise((resolve,reject)=>{
      const urls=['https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.min.js','https://unpkg.com/three@0.180.0/build/three.min.js'];
      let i=0;
      const next=()=>{if(window.THREE)return resolve(window.THREE);if(i>=urls.length)return reject(new Error('Three.js unavailable'));const s=document.createElement('script');s.src=urls[i++];s.async=false;s.onload=()=>window.THREE?resolve(window.THREE):next();s.onerror=next;document.head.appendChild(s);};
      next();
    });
  }
  function mat(c,r=.5,m=.2){return new T.MeshStandardMaterial({color:c,roughness:r,metalness:m});}
  function box(p,x,y,z,w,h,d,m){const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;}
  function label(p,text,x,y,z,size=.17){const c=document.createElement('canvas');c.width=512;c.height=96;const g=c.getContext('2d');g.font='bold 40px Arial';g.fillStyle='#c2f7ff';g.textAlign='center';g.textBaseline='middle';g.fillText(text,256,48);const tex=new T.CanvasTexture(c);const s=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,depthWrite:false}));s.scale.set(size*4,size,.01);s.position.set(x,y,z);p.add(s);}
  function ring(pos,r,color=0x00e5ff){const o=new T.Mesh(new T.TorusGeometry(r,.035,12,40),new T.MeshBasicMaterial({color,transparent:true,opacity:.75}));o.rotation.x=Math.PI/2;o.position.copy(pos);scene.add(o);return o;}
  function makeGround(){const p=new T.Mesh(new T.PlaneGeometry(30,30),new T.MeshStandardMaterial({color:0x050a11,roughness:.9}));p.rotation.x=-Math.PI/2;p.position.y=-.2;p.receiveShadow=true;scene.add(p);for(let i=-14;i<=14;i++){const l=new T.Mesh(new T.BoxGeometry(.012,.012,28),new T.MeshBasicMaterial({color:0x12314a}));l.position.set(i,-.18,0);scene.add(l);}}
  function makeBoard(){
    board=new T.Group();scene.add(board);box(board,0,0,0,9.2,.18,6.9,materials.pcb);
    box(board,-3.35,.22,-1.8,1,.4,2,materials.dark);box(board,-3.2,.43,-.85,.7,.1,.7,materials.silver);label(board,'VRM',-3.3,.58,-.9);
    box(board,-.75,.22,-1.05,2.2,.16,2,materials.silver);box(board,-.75,.34,-1.05,1.75,.1,1.55,materials.black);label(board,'CPU SOCKET',-.75,.58,-1.05,.16);
    for(let i=0;i<4;i++){let z=-2.25+i*.82;box(board,2.55,.25,z,.34,.16,.62,materials.black);box(board,2.55,.36,z,.08,.04,.48,materials.gold);}label(board,'DDR5 DIMM',3.1,.58,-.65,.16);
    for(let i=0;i<3;i++)box(board,-.15,.21,1.55+i*.72,6.1,.12,.2,materials.black);box(board,-.15,.35,1.55,5.75,.08,.42,materials.silver);box(board,-.15,.42,1.55,5.45,.03,.07,materials.gold);label(board,'PCIe x16',-2.5,.58,1.55,.16);
    box(board,1,.35,-.05,2.55,.12,.42,materials.black);box(board,1,.44,-.05,2.2,.03,.07,materials.gold);label(board,'M.2 NVMe',1,.6,-.05,.15);box(board,1.8,.25,2.5,1.6,.4,1.35,materials.silver);label(board,'CHIPSET',1.8,.56,2.5,.14);box(board,3.95,.35,.95,.5,.18,2.25,materials.black);label(board,'24-PIN',3.45,.6,.95,.15);
    for(const [x,z] of [[-4,-2.85],[4,-2.85],[-4,2.85],[4,2.85]]){const h=new T.Mesh(new T.CylinderGeometry(.13,.13,.06,24),materials.gold);h.rotation.x=Math.PI/2;h.position.set(x,.25,z);board.add(h);}label(board,'MOTHERBOARD',-.2,.43,-2.9,.18);
  }
  function makeTargets(){targets.cpu=new T.Vector3(-.75,.65,-1.05);targets.ram=new T.Vector3(2.55,.65,-.65);targets.gpu=new T.Vector3(-.15,.68,1.55);targets.ssd=new T.Vector3(1,.58,-.05);targets.cooler=new T.Vector3(-.75,1,-1.05);targets.psu=new T.Vector3(5,.8,2.7);targets.power=new T.Vector3(3.6,.65,.95);Object.keys(targets).forEach(k=>ring(targets[k],k==='gpu'?2.6:.55));}
  function makePart(type){
    const g=new T.Group();
    if(type==='cpu'){box(g,0,.2,0,1.5,.35,1.4,materials.silver);box(g,0,.4,0,1.2,.12,1.08,materials.white);label(g,'RYZEN 9',0,.58,0,.18);}
    if(type==='ram'){for(let i=0;i<2;i++){let x=-.22+i*.44;box(g,x,.2,0,.27,.55,1.3,materials.black);box(g,x,.49,0,.2,.06,1.12,materials.cyan);}}
    if(type==='gpu'){box(g,0,.35,0,5.35,.78,1.6,materials.black);box(g,0,.78,0,5,.08,1.38,materials.dark);for(const x of [-1.45,0,1.45]){const f=new T.Mesh(new T.CylinderGeometry(.5,.5,.1,32),materials.dark);f.rotation.x=Math.PI/2;f.position.set(x,.86,0);g.add(f);}label(g,'RTX 5090',0,1.05,0,.22);}
    if(type==='ssd'){box(g,0,.18,0,2.35,.14,.38,materials.black);box(g,-.35,.29,0,.7,.1,.28,materials.silver);label(g,'NVMe PCIe 5.0',0,.42,0,.14);}
    if(type==='cooler'){box(g,0,1.25,0,1.7,2,1.35,materials.silver);box(g,0,1.25,.72,1.25,1.3,.12,materials.black);label(g,'TOWER COOLER',0,2.35,.72,.14);}
    if(type==='psu'){box(g,0,.7,0,2.5,1.5,2.4,materials.black);box(g,0,1.45,0,1.5,.08,1.5,materials.dark);label(g,'1200W PSU',0,1.62,0,.17);}
    if(type==='power'){for(const [x,z,w] of [[-1.6,-1.2,2.6],[1.4,.5,2.2],[1.7,1.2,1.7]]){const m=new T.Mesh(new T.CylinderGeometry(.07,.07,w,12),materials.black);m.rotation.z=Math.PI/2;m.position.set(x,.35,z);g.add(m);}label(g,'POWER',0,.65,0,.16);}
    g.userData.partType=type;return g;
  }
  function applyCamera(){if(!camera)return;camera.position.set(Math.sin(rotY)*Math.cos(rotX)*zoom,Math.sin(rotX)*zoom+2,Math.cos(rotY)*Math.cos(rotX)*zoom);camera.lookAt(0,0,0);}
  function resize(){if(!renderer||!mount)return;const w=Math.max(300,mount.clientWidth||700),h=Math.max(320,mount.clientHeight||620);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  function updateInfo(type){const s=$('#selectedBox');if(s)s.innerHTML=`<b>${names[type]}</b><br>${info[type]}`;safeText($('#infoTitle'),names[type]);safeText($('#infoText'),info[type]);const e=$('#partExplainer');if(e)e.innerHTML=`<h3>💡 ${names[type]}</h3><p>${info[type]}</p>`;}
  function showPart(type){if(!initialized3D||installed.has(type))return;if(objects[type])scene.remove(objects[type]);const pos={cpu:new T.Vector3(-6,2,-4),ram:new T.Vector3(6,2,-3),gpu:new T.Vector3(6,1,3),ssd:new T.Vector3(5,2,-1),cooler:new T.Vector3(-5,2,2),psu:new T.Vector3(5,.8,4),power:new T.Vector3(0,1,5)}[type];const g=makePart(type);g.position.copy(pos);scene.add(g);objects[type]=g;selectedPart=type;updateInfo(type);if($('#installBtn'))$('#installBtn').disabled=false;$$('.part-choice').forEach(b=>b.classList.toggle('selected',b.dataset.part===type));sceneStatus(`تم إظهار ${names[type]} — اسحبها للدائرة أو اضغط تركيب القطعة.`);}
  function install(){if(!selectedPart||!objects[selectedPart])return;const type=selectedPart;objects[type].position.copy(targets[type]);installed.add(type);selectedPart=null;addXP(25);const n=installed.size,pct=Math.round(n/7*100);safeText($('#buildCount'),n);safeText($('#buildPercent'),`${pct}%`);const bar=$('#progressBar');if(bar)bar.style.width=`${pct}%`;if($('#installBtn'))$('#installBtn').disabled=true;const s=$('#selectedBox');if(s)s.innerHTML=`<b>✅ ${names[type]}</b><br>تم تثبيتها في المكان الصحيح.`;sceneStatus(`✅ تم تركيب ${names[type]} — +25 XP`);if(n===7){const r=$('#readyBox');if(r)r.innerHTML='🏆 <b>اكتمل التجميع!</b><br><small>كل القطع الأساسية مركبة. يمكنك الآن حل الاختبار.</small>';sceneStatus('🏆 اكتمل تجميع الكمبيوتر!');}}
  function resetBuild(){if(!initialized3D)return;Object.values(objects).forEach(o=>scene.remove(o));Object.keys(objects).forEach(k=>delete objects[k]);installed.clear();selectedPart=null;draggingPart=null;safeText($('#buildCount'),0);safeText($('#buildPercent'),'0%');const bar=$('#progressBar');if(bar)bar.style.width='0%';if($('#installBtn'))$('#installBtn').disabled=true;const s=$('#selectedBox');if(s)s.textContent='اختر قطعة من القائمة أو اضغط عليها لتظهر في المشهد.';const r=$('#readyBox');if(r)r.innerHTML='🟢 جاهز للتجميع<br><small>ابدأ باختيار قطعة من القائمة.</small>';sceneStatus('تمت إعادة التجميع. المازربورد جاهزة.');}
  function pointerDown(e){if(!renderer||!camera)return;const r=renderer.domElement.getBoundingClientRect(),p=new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),ray=new T.Raycaster();ray.setFromCamera(p,camera);const hits=ray.intersectObjects(Object.values(objects),true);if(hits.length){let o=hits[0].object;while(o.parent&&o.parent!==scene)o=o.parent;if(o.userData.partType){selectedPart=o.userData.partType;draggingPart=o;updateInfo(selectedPart);if($('#installBtn'))$('#installBtn').disabled=false;return;}}viewDrag=true;lastX=e.clientX;lastY=e.clientY;}
  function pointerMove(e){if(!renderer)return;if(draggingPart){draggingPart.position.x+=(e.clientX-lastX)*.018;draggingPart.position.z+=(e.clientY-lastY)*.018;lastX=e.clientX;lastY=e.clientY;}else if(viewDrag){rotY+=(e.clientX-lastX)*.008;rotX+=(e.clientY-lastY)*.006;rotX=Math.max(-1.25,Math.min(.35,rotX));lastX=e.clientX;lastY=e.clientY;applyCamera();}}
  function pointerUp(){draggingPart=null;viewDrag=false;}
  function wheel(e){if(!camera)return;e.preventDefault();zoom=Math.max(6,Math.min(18,zoom+e.deltaY*.012));applyCamera();}
  function init3D(T3){
    if(initialized3D||!mount)return;T=T3;
    materials={pcb:mat(0x10211d,.65,.3),black:mat(0x070a0f,.3,.75),dark:mat(0x151c25,.4,.55),silver:mat(0xb2bac3,.25,.8),white:mat(0xe9eef3,.22,.65),cyan:mat(0x16ddff,.25,.45),blue:mat(0x4268ff,.3,.5),purple:mat(0x8657ff,.3,.45),gold:mat(0xd8ae45,.22,.85)};
    scene=new T.Scene();scene.background=new T.Color(0x050912);scene.fog=new T.Fog(0x050912,18,38);camera=new T.PerspectiveCamera(42,1,.1,100);renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.shadowMap.enabled=true;if(renderer.outputColorSpace!==undefined)renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;mount.innerHTML='';mount.appendChild(renderer.domElement);
    scene.add(new T.HemisphereLight(0xa7dcff,0x111722,2.3));const key=new T.DirectionalLight(0xffffff,3.4);key.position.set(6,12,8);key.castShadow=true;scene.add(key);const r=new T.PointLight(0x466fff,55,18);r.position.set(-6,5,-5);scene.add(r);const c=new T.PointLight(0x00e5ff,35,15);c.position.set(6,3,-3);scene.add(c);
    makeGround();makeBoard();makeTargets();resize();applyCamera();
    renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointermove',pointerMove);renderer.domElement.addEventListener('pointerup',pointerUp);renderer.domElement.addEventListener('pointerleave',pointerUp);renderer.domElement.addEventListener('wheel',wheel,{passive:false});renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());window.addEventListener('resize',resize);initialized3D=true;sceneStatus('جاهز — المازربورد 3D أمامك. اختر قطعة من القائمة.');
    const animate=()=>{if(!renderer)return;if(autoRotate&&!viewDrag){rotY+=.003;applyCamera();}renderer.render(scene,camera);requestAnimationFrame(animate);};animate();
  }

  $$('.part-choice').forEach(b=>b.addEventListener('click',()=>showPart(b.dataset.part)));
  $('#installBtn')?.addEventListener('click',install);
  $('#resetBuild')?.addEventListener('click',resetBuild);
  $('#rotateBtn')?.addEventListener('click',()=>{autoRotate=!autoRotate;$('#rotateBtn').classList.toggle('active',autoRotate);});
  $('#homeBtn')?.addEventListener('click',()=>{rotX=-.58;rotY=.55;zoom=11;applyCamera();});
  $('#wireBtn')?.addEventListener('click',()=>{wireMode=!wireMode;if(renderer)renderer.domElement.style.filter=wireMode?'contrast(1.08) brightness(1.12)':'none';$('#wireBtn').classList.toggle('active',wireMode);});

  sceneStatus('⏳ جاري تشغيل مختبر 3D...');
  loadThree().then(init3D).catch(err=>{console.error(err);sceneStatus('⚠️ تعذر تحميل محرك 3D. الاختبارات وباقي الموقع تعمل بشكل طبيعي.');if(mount)mount.innerHTML='<div style="display:grid;place-items:center;height:100%;min-height:420px;color:#8fa8bd;text-align:center;padding:30px"><div><div style="font-size:48px">🧩</div><b style="font-size:20px">محرك 3D غير متاح حاليًا</b><p>أعد تحميل الصفحة أو تحقق من اتصال الإنترنت.</p></div></div>';});
})();
