const synth = window.speechSynthesis;
let currentText = '';
let selectedVoice = null;
let xp = Number(localStorage.getItem('cyberComputerXP') || 0);

const componentIcons = { CPU:'🧠', RAM:'🧩', GPU:'🎮', Motherboard:'🧱', Storage:'💾', PSU:'🔌', Cooler:'❄️', Case:'🖥️' };

// ---------- Reliable Arabic Text-to-Speech ----------
function loadArabicVoice() {
  if (!('speechSynthesis' in window)) return;
  const voices = synth.getVoices();
  selectedVoice = voices.find(v => /^ar(-|_)/i.test(v.lang)) || voices.find(v => /arabic|العربية/i.test(v.name)) || null;
}
loadArabicVoice();
if ('speechSynthesis' in window) synth.addEventListener('voiceschanged', loadArabicVoice);

function speak(text) {
  if (!('speechSynthesis' in window)) {
    alert('المتصفح لا يدعم القراءة الصوتية. جرّب Chrome أو Edge.');
    return;
  }
  if (!text) return;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = selectedVoice?.lang || 'ar-EG';
  if (selectedVoice) utterance.voice = selectedVoice;
  utterance.rate = Number(document.getElementById('rate')?.value || 1);
  utterance.pitch = 1;
  utterance.volume = 1;
  utterance.onerror = () => {
    // Retry with the browser's default Arabic locale if a selected voice fails.
    synth.cancel();
    const retry = new SpeechSynthesisUtterance(text);
    retry.lang = 'ar'; retry.rate = utterance.rate; retry.pitch = 1; retry.volume = 1;
    synth.speak(retry);
  };
  synth.speak(utterance);
}
function stopSpeech() { if ('speechSynthesis' in window) synth.cancel(); }
function pauseSpeech() {
  if (!('speechSynthesis' in window)) return;
  if (synth.speaking && !synth.paused) synth.pause(); else if (synth.paused) synth.resume();
}

// ---------- Component encyclopedia ----------
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalText = document.getElementById('modalText');
const modalIcon = document.getElementById('modalIcon');
document.querySelectorAll('.component').forEach(card => card.addEventListener('click', () => {
  currentText = `${card.dataset.title}. ${card.dataset.text}`;
  modalTitle.textContent = card.dataset.title;
  modalText.textContent = card.dataset.text;
  modalIcon.textContent = componentIcons[card.dataset.name] || '🖥️';
  modal.classList.add('show');
}));
document.getElementById('closeModal').addEventListener('click', () => { stopSpeech(); modal.classList.remove('show'); });
modal.addEventListener('click', e => { if (e.target === modal) { stopSpeech(); modal.classList.remove('show'); } });
document.getElementById('speakBtn').addEventListener('click', () => speak(currentText));
document.getElementById('pauseBtn').addEventListener('click', pauseSpeech);
document.getElementById('stopBtn').addEventListener('click', stopSpeech);

// ---------- Lessons ----------
const lessons = {
  basics:{title:'أساسيات الكمبيوتر',body:'الكمبيوتر جهاز إلكتروني يستقبل البيانات ويعالجها ثم ينتج معلومات. Hardware هو الأجزاء المادية التي يمكن لمسها، وSoftware هو البرامج والتعليمات. المعالج ينفذ التعليمات، والرام توفر مساحة عمل مؤقتة، والتخزين يحتفظ بالملفات بشكل دائم.'},
  componentsLesson:{title:'مكونات الكمبيوتر',body:'CPU ينفذ التعليمات، RAM تحفظ البيانات مؤقتًا، GPU يعالج الرسوميات، Motherboard تربط المكونات، Storage يحفظ الملفات، PSU يوفر الطاقة، وCooling يساعد في التخلص من الحرارة.'},
  howLesson:{title:'كيف تعمل القطع معًا؟',body:'عند فتح برنامج يتم تحميل أجزاء منه من التخزين إلى RAM. يقرأ CPU التعليمات وينفذها، ويعالج GPU الرسوميات عند الحاجة، ثم تظهر النتيجة على الشاشة. اللوحة الأم والكابلات توفر الاتصال والطاقة.'},
  buildLesson:{title:'تجميع الكمبيوتر',body:'قبل التركيب افصل الكهرباء وتأكد من التوافق. نركب CPU في مقبسه، وRAM في شقوق الذاكرة، والتخزين والتبريد، ثم اللوحة الأم داخل الكيس، وبعدها PSU وGPU، وأخيرًا كابلات الطاقة والبيانات ثم نفحص التوصيلات قبل التشغيل.'}
};
const lessonModal = document.getElementById('lessonModal');
const lessonTitle = document.getElementById('lessonTitle');
const lessonBody = document.getElementById('lessonBody');
document.querySelectorAll('.lesson-open').forEach(btn => btn.addEventListener('click', () => {
  const lesson = lessons[btn.dataset.lesson]; lessonTitle.textContent = lesson.title; lessonBody.textContent = lesson.body; lessonModal.classList.add('show');
}));
document.getElementById('closeLesson').addEventListener('click', () => { stopSpeech(); lessonModal.classList.remove('show'); });
document.getElementById('lessonSpeak').addEventListener('click', () => speak(`${lessonTitle.textContent}. ${lessonBody.textContent}`));
document.getElementById('lessonStop').addEventListener('click', stopSpeech);
lessonModal.addEventListener('click', e => { if (e.target === lessonModal) { stopSpeech(); lessonModal.classList.remove('show'); } });

// ---------- Build lab ----------
autoBuildLab();
function autoBuildLab(){
  const parts = document.querySelectorAll('.part'), zones = document.querySelectorAll('.zone');
  const status = document.getElementById('buildStatus'), powerBtn = document.getElementById('powerBtn');
  const placed = new Set(), map = {cpu:'cpu',ram:'ram',gpu:'gpu',storage:'storage',power:'power'};
  parts.forEach(part => {
    part.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', part.dataset.part); part.classList.add('dragging'); });
    part.addEventListener('dragend', () => part.classList.remove('dragging'));
  });
  zones.forEach(zone => {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('over'));
    zone.addEventListener('drop', e => {
      e.preventDefault(); zone.classList.remove('over'); const part = e.dataTransfer.getData('text/plain'); if (!part) return;
      if (map[part] !== zone.dataset.slot) { status.textContent = `❌ مش مكان ${part.toUpperCase()}. اقرأ الشرح وحاول مرة أخرى.`; return; }
      if (placed.has(part)) return;
      placed.add(part); zone.classList.add('correct'); zone.innerHTML = `<strong>✓ ${part.toUpperCase()} Installed</strong>`;
      status.textContent = `✅ تم تركيب ${part.toUpperCase()} بشكل صحيح.`;
      const item = document.querySelector(`.part[data-part="${part}"]`); if (item) { item.style.opacity='.35'; item.style.pointerEvents='none'; }
      if (placed.size === 5) status.textContent='🏆 ممتاز! كل القطع الأساسية مركبة. جرّب تشغيل الجهاز.';
    });
  });
  powerBtn.addEventListener('click', () => {
    if (placed.size < 5) { status.textContent=`⚠️ الجهاز لن يقلع بعد. ركّبت ${placed.size}/5 قطع أساسية.`; return; }
    powerBtn.textContent='🟢 الجهاز يعمل'; powerBtn.disabled=true; status.textContent='🟢 POST Successful — CPU → RAM → BIOS → Operating System';
    document.querySelector('.pc-scene .case').style.boxShadow='0 30px 90px rgba(0,0,0,.55),0 0 55px rgba(0,255,149,.2)';
  });
}

// ---------- 50-question bank ----------
const questions = [
 ['ما هو الجزء الذي ينفذ التعليمات الأساسية؟',['CPU','RAM','SSD','PSU'],0,'المعالج CPU ينفذ التعليمات والعمليات.'],
 ['أي ذاكرة تفقد محتواها عند إيقاف التشغيل؟',['HDD','RAM','SSD','ROM'],1,'RAM ذاكرة مؤقتة.'],
 ['ما وظيفة اللوحة الأم؟',['تبريد الجهاز فقط','ربط المكونات وتوفير الاتصال','تخزين الملفات فقط','عرض الصورة فقط'],1,'اللوحة الأم تربط المكونات وتوفر مسارات الاتصال والطاقة.'],
 ['أين يركب كارت الشاشة المنفصل عادة؟',['DIMM','PCIe x16','M.2','SATA'],1,'كروت الشاشة المنفصلة تستخدم عادة شق PCIe x16.'],
 ['ما وظيفة PSU؟',['معالجة الصور','توفير الطاقة المناسبة للمكونات','تخزين الملفات','تشغيل الصوت فقط'],1,'PSU يحول ويوزع الطاقة على المكونات.'],
 ['أي قطعة تحفظ الملفات بشكل دائم؟',['RAM','CPU','SSD','Cache'],2,'SSD وHDD وحدات تخزين دائمة.'],
 ['ما المقصود بـ GPU؟',['وحدة معالجة الرسوميات','وحدة تخزين','مزود الطاقة','ذاكرة مؤقتة'],0,'GPU تعني Graphics Processing Unit.'],
 ['ما القطعة التي تساعد على إزالة حرارة المعالج؟',['Cooler','SSD','RAM','NIC'],0,'المبرد والمروحة أو التبريد المائي يساعدان في التخلص من حرارة CPU.'],
 ['ما الفرق الأساسي بين Hardware وSoftware؟',['لا فرق','Hardware مكونات مادية وSoftware برامج','Hardware برامج وSoftware كابلات','كلاهما تخزين'],1,'Hardware يمكن لمسه، وSoftware عبارة عن برامج وتعليمات.'],
 ['ما وظيفة نظام التشغيل؟',['إدارة موارد الجهاز وتشغيل البرامج','زيادة حجم RAM فعليًا','توليد الكهرباء','استبدال المعالج'],0,'نظام التشغيل يدير الموارد ويوفر بيئة لتشغيل البرامج.'],
 ['أي وحدة أسرع عادة؟',['SSD','شريط مغناطيسي قديم','قرص بصري','لا شيء'],0,'SSD عادة أسرع بكثير من HDD التقليدي.'],
 ['ماذا يعني CPU Socket؟',['مكان تركيب المعالج','منفذ USB','مكان تركيب PSU','فتحة كارت الذاكرة'],0,'Socket هو المقبس المخصص للمعالج على اللوحة الأم.'],
 ['ما وظيفة DIMM slots؟',['تركيب RAM','تركيب GPU','تركيب PSU','تركيب المروحة فقط'],0,'شقوق DIMM هي أماكن تركيب وحدات RAM.'],
 ['ما وظيفة M.2 slot في كثير من اللوحات؟',['تركيب وحدات NVMe SSD','تركيب RAM','تركيب CPU','توصيل الشاشة'],0,'M.2 يستخدم بكثرة لوحدات التخزين NVMe.'],
 ['ما هو BIOS/UEFI؟',['برنامج Firmware يبدأ فحص وتهيئة الجهاز','نوع RAM','كارت شاشة','مزود طاقة'],0,'Firmware اللوحة يهيئ العتاد ويبدأ عملية الإقلاع.'],
 ['ما معنى POST؟',['فحص ذاتي عند بدء التشغيل','ضغط ملف','تثبيت لعبة','تشفير القرص'],0,'POST يفحص مكونات أساسية أثناء بدء التشغيل.'],
 ['أي كابل رئيسي يزود اللوحة الأم بالطاقة؟',['24-pin ATX','HDMI','SATA Data','USB'],0,'موصل 24-pin هو موصل الطاقة الرئيسي للوحة الأم في كثير من الأنظمة.'],
 ['أي كابل مخصص عادة لطاقة المعالج؟',['EPS CPU 4/8-pin','HDMI','SATA Data','DisplayPort'],0,'موصل EPS يوفر طاقة للمعالج عبر اللوحة.'],
 ['ما وظيفة SATA Data؟',['نقل البيانات بين اللوحة ووحدة SATA','توفير طاقة AC','تبريد CPU','توصيل الشاشة'],0,'SATA Data ينقل البيانات، بينما SATA Power يوفر الطاقة.'],
 ['هل RAM هي نفسها Storage؟',['نعم','لا، RAM مؤقتة وStorage دائم','نعم في كل الأجهزة','لا توجد ذاكرة RAM'],1,'هما نوعان مختلفان من الذاكرة والاستخدام.'],
 ['لماذا نحتاج إلى تبريد CPU؟',['لمنع ارتفاع الحرارة الزائد','لزيادة سعة SSD','لتشغيل USB','لتخزين الملفات'],0,'المعالج يولد حرارة ويحتاج إلى تبريد مناسب.'],
 ['ما فائدة المراوح داخل الكيس؟',['تحسين تدفق الهواء والتخلص من الحرارة','زيادة مساحة القرص','تشغيل BIOS','تغيير نوع المعالج'],0,'تدفق الهواء يساعد على إبقاء المكونات ضمن درجات حرارة مناسبة.'],
 ['ما المقصود بـ PCIe؟',['واجهة توسعة عالية السرعة','نوع من البطاريات','نظام تشغيل','نوع ملف'],0,'PCI Express معيار لتوصيل بطاقات ووحدات توسعة.'],
 ['أي قطعة مسؤولة أكثر عن إخراج الرسوميات في الألعاب؟',['GPU','PSU','Case','RAM فقط'],0,'GPU يعالج الرسوميات، مع اعتماد الأداء أيضًا على CPU وباقي النظام.'],
 ['ماذا يحدث للبيانات في RAM عند فصل الكهرباء؟',['تبقى للأبد','تفقد عادة','تنتقل للـGPU','تصبح SSD'],1,'RAM ذاكرة متطايرة.'],
 ['ما المقصود بـ dual-channel في RAM؟',['استخدام قناتين للذاكرة لزيادة عرض النطاق','وجود معالجين دائمًا','قرصين SSD','مروحتين'],0,'Dual-channel يسمح باستخدام قناتين للذاكرة وفق دعم المنصة.'],
 ['ما العامل المهم عند تركيب RAM؟',['مطابقة الشق والاتجاه والتوافق','وضعها في PCIe','توصيل HDMI','ربطها بالـPSU مباشرة'],0,'يجب مطابقة notch والتوافق مع اللوحة.'],
 ['ما وظيفة الـcase؟',['حماية وتنظيم المكونات وتدفق الهواء','تنفيذ التعليمات','تخزين BIOS فقط','توليد الكهرباء'],0,'الكيس يحمل المكونات ويحميها ويساعد في airflow.'],
 ['ما الذي يحدد توافق CPU مع Motherboard بشكل أساسي؟',['Socket والمنصة ودعم BIOS','لون الكيس','نوع الشاشة فقط','حجم الماوس'],0,'يجب أن يتوافق المقبس والمنصة والـBIOS مع المعالج.'],
 ['ما فائدة تحديث BIOS/UEFI أحيانًا؟',['إضافة دعم لمعالجات أو إصلاحات وتحسينات','زيادة حجم الشاشة','تحويل RAM إلى SSD','إلغاء PSU'],0,'تحديثات firmware قد تضيف دعمًا وتحل مشكلات.'],
 ['ما الفرق الأساسي بين SSD وHDD؟',['SSD بدون أجزاء ميكانيكية دوارة وHDD يعتمد على أقراص ميكانيكية','HDD دائمًا أسرع','SSD يحتاج RAM بدل الكهرباء','لا فرق'],0,'SSD يعتمد على ذاكرة فلاش، وHDD على أجزاء ميكانيكية.'],
 ['ما فائدة NVMe؟',['بروتوكول تخزين سريع يستخدم غالبًا مع PCIe','نوع PSU','نوع RAM','برنامج رسم'],0,'NVMe مصمم للتخزين السريع عبر PCIe.'],
 ['أين نضع المعجون الحراري؟',['بين سطح CPU والمبرد بطبقة مناسبة','على RAM','داخل PSU','على أطراف HDMI'],0,'المعجون يحسن انتقال الحرارة بين المعالج والمبرد.'],
 ['ما الذي يجب فعله قبل العمل داخل الكمبيوتر؟',['إيقافه وفصل الكهرباء واتخاذ احتياطات ESD','تشغيله بأعلى طاقة','رش الماء','فصل RAM أثناء التشغيل'],0,'السلامة تبدأ بفصل الطاقة وتقليل خطر الكهرباء الساكنة.'],
 ['ماذا يعني ESD؟',['تفريغ كهربائي ساكن','نوع SSD','سرعة CPU','نوع كابل'],0,'Electrostatic Discharge قد يضر المكونات الإلكترونية.'],
 ['إذا لم يعمل الجهاز بعد التركيب، ما أول شيء منطقي؟',['فحص الطاقة والتوصيلات والمكونات الأساسية','شراء GPU جديد فورًا','حذف الملفات','تغيير الشاشة'],0,'ابدأ بفحص الأسباب الأساسية مثل الطاقة والكابلات والتركيب.'],
 ['إذا لم تظهر صورة، أي فحص مهم؟',['التأكد من توصيل الشاشة بالمخرج الصحيح وفحص GPU/RAM','تغيير اسم الكمبيوتر','حذف BIOS','فصل PSU'],0,'توصيل الشاشة والمنظومة الرسومية والذاكرة من الفحوص المهمة.'],
 ['ما وظيفة 12V-2x6/12VHPWR في الأنظمة الداعمة له؟',['توفير طاقة عالية لكارت الشاشة','توصيل SSD SATA','توصيل RAM','إشارة HDMI'],0,'هذه موصلات طاقة عالية القدرة لبعض كروت الشاشة الحديثة.'],
 ['هل كل GPU يحتاج كابل طاقة منفصل؟',['لا، يعتمد على الكارت؛ بعض البطاقات تستمد الطاقة من PCIe فقط','نعم دائمًا','لا GPU يحتاج كهرباء','فقط من HDMI'],0,'متطلبات الطاقة تختلف حسب تصميم GPU.'],
 ['ما وظيفة VRM على اللوحة الأم؟',['تنظيم وتوفير الطاقة المناسبة للمعالج ومكونات أخرى','تخزين الملفات','تشغيل الشاشة','تبريد الكيس فقط'],0,'VRM ينظم الجهد والتيار للمكونات التي تحتاج طاقة منظمة.'],
 ['ما معنى thermal throttling؟',['خفض الأداء لتقليل الحرارة عند ارتفاعها','زيادة RAM','تشفير SSD','تغيير PSU'],0,'المعالج أو GPU قد يخفضان التردد عند الحرارة العالية لحماية العتاد.'],
 ['أي عنصر ينفذ التعليمات لكنه ليس مكان تخزين الملفات الدائم؟',['CPU','SSD','HDD','USB drive'],0,'CPU يعالج التعليمات، وليس وحدة تخزين دائمة.'],
 ['ما فائدة Cache داخل المعالج؟',['ذاكرة صغيرة وسريعة تقلل زمن الوصول لبعض البيانات والتعليمات','توفير طاقة PSU','تخزين ملفات المستخدم دائمًا','عرض الصورة'],0,'Cache تساعد CPU بالوصول السريع للبيانات المتكررة.'],
 ['ما الذي يربط CPU وRAM وباقي المكونات على مستوى المنصة؟',['اللوحة الأم ومتحكمات المنصة وواجهات الاتصال','الكيس فقط','المروحة فقط','الشاشة'],0,'اللوحة الأم والمنصة توفران مسارات الاتصال بين المكونات.'],
 ['ما المقصود بـ bottleneck؟',['مكوّن يحد الأداء الكلي بسبب كونه أبطأ من المطلوب','نوع كابل','نوع تبريد','برنامج حماية'],0,'عنق الزجاجة يحدث عندما يحد جزء من النظام أداء بقية المكونات.'],
 ['لماذا لا يعني امتلاك GPU أقوى دائمًا أداءً أفضل؟',['لأن التوافق والدقة والـCPU والبرنامج قد تحد الأداء','لأن GPU لا يعالج الرسوميات','لأن RAM غير مهمة أبدًا','لأن PSU لا يهم'],0,'الأداء النهائي يعتمد على المنظومة كاملة والبرنامج والدقة والإعدادات.'],
 ['ما أفضل وصف لـdriver؟',['برنامج يسمح لنظام التشغيل بالتعامل مع جهاز معين','قطعة RAM','كابل طاقة','نوع CPU'],0,'Driver هو برنامج تشغيل/تعريف يتيح للنظام التواصل مع العتاد.'],
 ['ما وظيفة Device Manager في Windows؟',['عرض وإدارة الأجهزة والتعريفات','تغيير الجهد داخل PSU','تركيب CPU فعليًا','تنظيف الكيس'],0,'Device Manager يعرض العتاد وحالته وتعريفاته.'],
 ['ما المقصود بـ boot؟',['عملية بدء تشغيل الجهاز وتحميل النظام','إيقاف الشاشة','تثبيت RAM','تنظيف SSD'],0,'Boot هي عملية الإقلاع من تشغيل الجهاز حتى بدء نظام التشغيل.'],
 ['ما الذي يحدث عادة بعد POST الناجح؟',['يبدأ مسار الإقلاع لتحميل نظام التشغيل','تُفصل RAM','يتوقف PSU','يُحذف BIOS'],0,'بعد التهيئة والفحص يبدأ النظام في تحميل bootloader ونظام التشغيل.'],
 ['لماذا يجب التأكد من توافق PSU مع الجهاز؟',['لتوفير قدرة وموصلات مناسبة بأمان','لزيادة دقة الشاشة','لتثبيت Windows','لتغيير نوع RAM'],0,'PSU يجب أن يوفر القدرة والموصلات المناسبة لجهازك.'],
 ['ما أهم قاعدة عند تركيب كابل؟',['استخدم الموصل المخصص له ولا تجبره بالقوة','أدخل أي كابل في أي منفذ','اضغط بقوة دائمًا','قص الكابل'],0,'الموصل الصحيح والتركيب بدون قوة غير طبيعية يقللان خطر الضرر.']
];

const quizCard = document.querySelector('.quiz-card');
const quizQuestion = document.getElementById('quizQuestion');
const quizAnswers = document.querySelector('.answers');
const feedback = document.getElementById('quizFeedback');
const scoreEl = document.getElementById('score');
let qIndex = 0, answered = false;

function renderQuestion() {
  const q = questions[qIndex]; answered = false;
  if (quizCard) quizCard.querySelector('.quiz-meta span').textContent = `السؤال ${qIndex + 1} من ${questions.length}`;
  quizQuestion.textContent = q[0];
  feedback.textContent = '';
  quizAnswers.innerHTML = '';
  q[1].forEach((answer, i) => {
    const btn = document.createElement('button'); btn.className='answer'; btn.textContent=answer;
    btn.addEventListener('click', () => answerQuestion(i, btn)); quizAnswers.appendChild(btn);
  });
  scoreEl.textContent = `${xp} XP`;
}
function answerQuestion(choice, btn) {
  if (answered) return; answered = true;
  const q = questions[qIndex];
  document.querySelectorAll('.answer').forEach(a => a.disabled=true);
  if (choice === q[2]) { xp += 10; localStorage.setItem('cyberComputerXP', xp); feedback.textContent=`✅ إجابة صحيحة! +10 XP — ${q[3]}`; btn.classList.add('correct'); }
  else { feedback.textContent=`❌ ليست الإجابة الصحيحة. ${q[3]}`; btn.classList.add('wrong'); document.querySelectorAll('.answer')[q[2]].classList.add('correct'); }
  scoreEl.textContent=`${xp} XP`;
  const next = document.createElement('button'); next.className='btn primary small'; next.textContent=qIndex === questions.length-1 ? '🏆 إنهاء الاختبار' : 'السؤال التالي →';
  next.style.marginTop='14px'; next.addEventListener('click', () => { if(qIndex < questions.length-1){qIndex++;renderQuestion();} else { feedback.textContent=`🏆 أنهيت الـ50 سؤال! مجموعك ${xp} XP.`; next.disabled=true; }}); feedback.appendChild(next);
}
renderQuestion();