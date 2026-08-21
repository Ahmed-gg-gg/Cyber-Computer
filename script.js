const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalText = document.getElementById('modalText');
const modalIcon = document.getElementById('modalIcon');

const componentIcons = { CPU:'🧠', RAM:'🧩', GPU:'🎮', Motherboard:'🧱', Storage:'💾', PSU:'🔌', Cooler:'❄️', Case:'🖥️' };

document.querySelectorAll('.component').forEach(card => {
  card.addEventListener('click', () => {
    modalTitle.textContent = card.dataset.title;
    modalText.textContent = card.dataset.text;
    modalIcon.textContent = componentIcons[card.dataset.name] || '🖥️';
    modal.classList.add('show');
  });
});

document.getElementById('closeModal').addEventListener('click', () => modal.classList.remove('show'));
modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('show'); });

autoBuildLab();

function autoBuildLab(){
  const parts = document.querySelectorAll('.part');
  const zones = document.querySelectorAll('.zone');
  const status = document.getElementById('buildStatus');
  const powerBtn = document.getElementById('powerBtn');
  const placed = new Set();
  const map = { cpu:'cpu', ram:'ram', gpu:'gpu', storage:'storage', power:'power' };

  parts.forEach(part => {
    part.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', part.dataset.part);
      part.classList.add('dragging');
    });
    part.addEventListener('dragend', () => part.classList.remove('dragging'));
  });

  zones.forEach(zone => {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('over'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('over');
      const part = e.dataTransfer.getData('text/plain');
      if (!part) return;
      if (map[part] !== zone.dataset.slot) {
        status.textContent = `❌ مش مكان ${part.toUpperCase()}. ابحث عن المكان الصحيح على اللوحة الأم.`;
        return;
      }
      if (placed.has(part)) return;
      placed.add(part);
      zone.classList.add('correct');
      zone.innerHTML = `<strong>✓ ${part.toUpperCase()} Installed</strong>`;
      status.textContent = `✅ تم تركيب ${part.toUpperCase()} بشكل صحيح.`;
      const item = document.querySelector(`.part[data-part="${part}"]`);
      if (item) { item.style.opacity = '.35'; item.style.pointerEvents = 'none'; }
      if (placed.size === 5) status.textContent = '🏆 ممتاز! كل القطع الأساسية مركبة. جرّب تشغيل الجهاز.';
    });
  });

  powerBtn.addEventListener('click', () => {
    if (placed.size < 5) {
      status.textContent = `⚠️ الجهاز لن يقلع بعد. ركّبت ${placed.size}/5 قطع أساسية.`;
      return;
    }
    powerBtn.textContent = '🟢 الجهاز يعمل';
    powerBtn.disabled = true;
    status.textContent = '🟢 POST Successful — CPU → RAM → BIOS → Operating System';
    document.querySelector('.pc-scene .case').style.boxShadow = '0 30px 90px rgba(0,0,0,.55), 0 0 55px rgba(0,255,149,.2)';
  });
}
