const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalText = document.getElementById('modalText');
const modalIcon = document.getElementById('modalIcon');
const synth = window.speechSynthesis;
let currentText = '';

const componentIcons = { CPU:'🧠', RAM:'🧩', GPU:'🎮', Motherboard:'🧱', Storage:'💾', PSU:'🔌', Cooler:'❄️', Case:'🖥️' };

function speak(text) {
  if (!('speechSynthesis' in window)) return;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ar-EG';
  utterance.rate = Number(document.getElementById('rate')?.value || 1);
  utterance.pitch = 1;
  synth.speak(utterance);
}

function stopSpeech() { if ('speechSynthesis' in window) synth.cancel(); }

function pauseSpeech() {
  if (!('speechSynthesis' in window)) return;
  if (synth.speaking && !synth.paused) synth.pause();
  else if (synth.paused) synth.resume();
}

document.querySelectorAll('.component').forEach(card => {
  card.addEventListener('click', () => {
    currentText = `${card.dataset.title}. ${card.dataset.text}`;
    modalTitle.textContent = card.dataset.title;
    modalText.textContent = card.dataset.text;
    modalIcon.textContent = componentIcons[card.dataset.name] || '🖥️';
    modal.classList.add('show');
  });
});

document.getElementById('closeModal').addEventListener('click', () => { stopSpeech(); modal.classList.remove('show'); });
modal.addEventListener('click', e => { if (e.target === modal) { stopSpeech(); modal.classList.remove('show'); } });
document.getElementById('speakBtn').addEventListener('click', () => speak(currentText));
document.getElementById('pauseBtn').addEventListener('click', pauseSpeech);
document.getElementById('stopBtn').addEventListener('click', stopSpeech);

const lessons = {
  basics: { title:'أساسيات الكمبيوتر', body:'الكمبيوتر جهاز إلكتروني يستقبل البيانات ويعالجها ثم ينتج معلومات. يتكون بشكل عام من Hardware، وهي الأجزاء المادية التي نستطيع لمسها، وSoftware، وهي البرامج والتعليمات التي تجعل هذه الأجزاء تنفذ المهام. المعالج ينفذ التعليمات، والرام تحفظ البيانات مؤقتًا أثناء العمل، والتخزين يحتفظ بالملفات بشكل دائم.' },
  componentsLesson: { title:'مكونات الكمبيوتر', body:'كل قطعة في الكمبيوتر لها وظيفة محددة. CPU ينفذ التعليمات، RAM توفر مساحة عمل سريعة ومؤقتة، GPU يعالج الرسوميات، Motherboard تربط المكونات، Storage يحفظ الملفات، PSU يوفر الطاقة، وCooling يساعد في التخلص من الحرارة.' },
  howLesson: { title:'كيف تعمل القطع معًا؟', body:'عندما يفتح المستخدم برنامجًا، يتم تحميل أجزاء من البرنامج من وحدة التخزين إلى RAM. يقرأ CPU التعليمات وينفذها، وإذا كانت هناك رسوميات يعالج GPU الجزء الرسومي، ثم تظهر النتيجة على الشاشة. اللوحة الأم والكابلات توفر الاتصال والطاقة بين المكونات.' },
  buildLesson: { title:'تجميع الكمبيوتر', body:'قبل تركيب أي قطعة، افصل الكهرباء وتأكد من أن المكونات متوافقة. عادة نركب المعالج في مقبسه، ثم RAM في شقوق الذاكرة، ونركب وحدات التخزين والتبريد، ثم اللوحة الأم داخل الكيس، وبعدها مزود الطاقة وكارت الشاشة، وأخيرًا نوصل كابلات الطاقة والبيانات ونفحص التوصيلات قبل التشغيل.' }
};

const lessonModal = document.getElementById('lessonModal');
const lessonTitle = document.getElementById('lessonTitle');
const lessonBody = document.getElementById('lessonBody');
document.querySelectorAll('.lesson-open').forEach(btn => {
  btn.addEventListener('click', () => {
    const lesson = lessons[btn.dataset.lesson];
    lessonTitle.textContent = lesson.title;
    lessonBody.textContent = lesson.body;
    lessonModal.classList.add('show');
  });
});
document.getElementById('closeLesson').addEventListener('click', () => { stopSpeech(); lessonModal.classList.remove('show'); });
document.getElementById('lessonSpeak').addEventListener('click', () => speak(`${lessonTitle.textContent}. ${lessonBody.textContent}`));
document.getElementById('lessonStop').addEventListener('click', stopSpeech);

lessonModal.addEventListener('click', e => { if (e.target === lessonModal) { stopSpeech(); lessonModal.classList.remove('show'); } });

autoBuildLab();

function autoBuildLab(){
  const parts = document.querySelectorAll('.part');
  const zones = document.querySelectorAll('.zone');
  const status = document.getElementById('buildStatus');
  const powerBtn = document.getElementById('powerBtn');
  const placed = new Set();
  const map = { cpu:'cpu', ram:'ram', gpu:'gpu', storage:'storage', power:'power' };
  parts.forEach(part => {
    part.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', part.dataset.part); part.classList.add('dragging'); });
    part.addEventListener('dragend', () => part.classList.remove('dragging'));
  });
  zones.forEach(zone => {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('over'));
    zone.addEventListener('drop', e => {
      e.preventDefault(); zone.classList.remove('over');
      const part = e.dataTransfer.getData('text/plain'); if (!part) return;
      if (map[part] !== zone.dataset.slot) { status.textContent = `❌ مش مكان ${part.toUpperCase()}. اقرأ الشرح وحاول مرة أخرى.`; return; }
      if (placed.has(part)) return;
      placed.add(part); zone.classList.add('correct'); zone.innerHTML = `<strong>✓ ${part.toUpperCase()} Installed</strong>`;
      status.textContent = `✅ تم تركيب ${part.toUpperCase()} بشكل صحيح.`;
      const item = document.querySelector(`.part[data-part="${part}"]`); if (item) { item.style.opacity = '.35'; item.style.pointerEvents = 'none'; }
      if (placed.size === 5) status.textContent = '🏆 ممتاز! كل القطع الأساسية مركبة. جرّب تشغيل الجهاز.';
    });
  });
  powerBtn.addEventListener('click', () => {
    if (placed.size < 5) { status.textContent = `⚠️ الجهاز لن يقلع بعد. ركّبت ${placed.size}/5 قطع أساسية.`; return; }
    powerBtn.textContent = '🟢 الجهاز يعمل'; powerBtn.disabled = true;
    status.textContent = '🟢 POST Successful — CPU → RAM → BIOS → Operating System';
    document.querySelector('.pc-scene .case').style.boxShadow = '0 30px 90px rgba(0,0,0,.55), 0 0 55px rgba(0,255,149,.2)';
  });
}

let xp = 0;
document.querySelectorAll('.answer').forEach(answer => {
  answer.addEventListener('click', () => {
    document.querySelectorAll('.answer').forEach(a => a.disabled = true);
    const feedback = document.getElementById('quizFeedback');
    if (answer.dataset.correct === 'true') { xp += 10; feedback.textContent = '✅ إجابة صحيحة! +10 XP — RAM هي الذاكرة المؤقتة التي تستخدمها البرامج أثناء التشغيل.'; }
    else { feedback.textContent = '❌ ليست الإجابة الصحيحة. RAM هي التي تحتفظ بالبيانات مؤقتًا أثناء تشغيل البرامج.'; }
    document.getElementById('score').textContent = `${xp} XP`;
  });
});