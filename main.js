document.addEventListener('DOMContentLoaded', () => {

  const WA_NUMBER = '6289646417533';

  /* ---------- sticky navbar shadow ---------- */
  const navbar = document.getElementById('navbar');
  if(navbar){
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('shadow-soft', window.scrollY > 8);
    });
  }

  /* ---------- sidebar: dual mode (rail <-> expanded) + mobile drawer ---------- */
  const sidebar = document.getElementById('dash-sidebar');
  const sbToggle = document.getElementById('sb-toggle');
  const sbOpenMobile = document.getElementById('mobile-sb-open');
  const sbScrim = document.getElementById('sb-scrim');
  const page = document.getElementById('page');

  function setDesktopPad(expanded){
    if(window.innerWidth >= 1024 && page){
      page.classList.toggle('lg:pl-[76px]', !expanded);
      page.classList.toggle('lg:pl-[248px]', expanded);
    }
  }

  if(sidebar && sbToggle){
    sbToggle.addEventListener('click', () => {
      if(window.innerWidth >= 1024){
        const nowExpanded = !sidebar.classList.contains('expanded');
        sidebar.classList.toggle('expanded', nowExpanded);
        sidebar.style.width = nowExpanded ? '248px' : '76px';
        setDesktopPad(nowExpanded);
      } else {
        sidebar.classList.toggle('mobile-open');
        sbScrim.classList.toggle('show');
      }
    });
  }
  if(sbOpenMobile && sidebar){
    sbOpenMobile.addEventListener('click', () => {
      sidebar.classList.remove('hidden'); sidebar.classList.add('flex');
      sidebar.classList.add('mobile-open', 'expanded');
      sbScrim.classList.add('show');
    });
  }
  if(sbScrim && sidebar){
    sbScrim.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      sbScrim.classList.remove('show');
    });
  }
  if(sidebar){
    document.querySelectorAll('#dash-sidebar a').forEach(a=>{
      a.addEventListener('click', () => {
        if(window.innerWidth < 1024){
          sidebar.classList.remove('mobile-open');
          sbScrim.classList.remove('show');
        }
      });
    });
  }

  /* ---------- reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .12 });
  revealEls.forEach(el=>io.observe(el));

  /* ---------- stat counters ---------- */
  const counters = document.querySelectorAll('.num-tick');
  const cio = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const dur = 1100;
      const start = performance.now();
      function tick(now){
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if(p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      cio.unobserve(el);
    });
  }, { threshold: .5 });
  counters.forEach(el=>cio.observe(el));

  /* ---------- portfolio gallery: load from portfolio-data.json (portofolio.html) ---------- */
  const galleryEl = document.getElementById('gallery');
  const pills = document.querySelectorAll('#filter-bar .pill');

  function paintPills(){
    pills.forEach(p=>{
      const on = p.classList.contains('active');
      p.style.background = on ? '#15bb81' : '#fff';
      p.style.color = on ? '#fff' : '#56645f';
      p.style.borderColor = on ? '#15bb81' : '#e7ece9';
    });
  }

  function applyFilter(cat){
    pills.forEach(p=>p.classList.toggle('active', p.dataset.filter === cat));
    paintPills();
    document.querySelectorAll('#gallery .portfolio-card').forEach(c=>{
      c.style.display = (cat === 'all' || c.dataset.cat === cat) ? '' : 'none';
    });
  }

  function portfolioCardHTML(item){
    const imgBlock = item.image
      ? `<div class="aspect-[4/3] rounded-xl overflow-hidden border border-line bg-bg-soft"><img src="${item.image}" alt="${item.title} — ${item.client}" class="w-full h-full object-cover" loading="lazy"></div>`
      : `<div class="aspect-[4/3] rounded-xl bg-gradient-to-br from-primary-soft to-white grid place-items-center border border-line"><div class="w-16 h-16 rounded-2xl bg-white shadow-card grid place-items-center"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#15bb81" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5v17M4 12h16"/></svg></div></div>`;
    return `
    <div class="portfolio-card reveal in cursor-pointer" data-cat="${item.category}" data-id="${item.id}">
      <div class="artboard-face relative rounded-2xl border border-line bg-white p-5 shadow-soft hover:shadow-card-lg transition-shadow">
        <span class="washi"></span>
        ${imgBlock}
        <div class="mt-4 flex items-center justify-between gap-2">
          <div><div class="font-bold text-[15px] text-ink">${item.title}</div><div class="text-[12.5px] text-ink-soft">${item.client}</div></div>
          <span class="text-[11px] font-mono text-primary-deep bg-primary-soft px-2 py-1 rounded-full shrink-0">${item.categoryLabel}</span>
        </div>
      </div>
    </div>`;
  }

  function openPortfolioModal(item){
    const modal = document.getElementById('portfolio-modal');
    if(!modal) return;
    document.getElementById('portfolio-modal-category').textContent = item.categoryLabel;
    document.getElementById('portfolio-modal-title').textContent = item.title;
    document.getElementById('portfolio-modal-client').textContent = item.client;
    document.getElementById('portfolio-modal-desc').textContent = item.description || 'Deskripsi belum ditambahkan untuk karya ini.';
    const imgWrap = document.getElementById('portfolio-modal-image');
    imgWrap.innerHTML = item.image
      ? `<img src="${item.image}" alt="${item.title} — ${item.client}" class="w-full h-full object-cover rounded-t-3xl">`
      : '';
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.setAttribute('aria-hidden', 'false');
  }
  function closePortfolioModal(){
    const modal = document.getElementById('portfolio-modal');
    if(!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    modal.setAttribute('aria-hidden', 'true');
  }
  const modalClose = document.getElementById('portfolio-modal-close');
  const modalBackdrop = document.getElementById('portfolio-modal-backdrop');
  if(modalClose) modalClose.addEventListener('click', closePortfolioModal);
  if(modalBackdrop) modalBackdrop.addEventListener('click', closePortfolioModal);
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closePortfolioModal(); });

  if(galleryEl){
    fetch('portfolio-data.json')
      .then(res => res.json())
      .then(data => {
        const items = Array.isArray(data) ? data : (data.items || []);
        galleryEl.innerHTML = items.map(portfolioCardHTML).join('');
        document.querySelectorAll('#gallery .portfolio-card').forEach(card=>{
          card.addEventListener('click', () => {
            const item = items.find(i => i.id === card.dataset.id);
            if(item) openPortfolioModal(item);
          });
        });
        if(pills.length){
          pills.forEach(pill=>{
            pill.addEventListener('click', () => applyFilter(pill.dataset.filter));
          });
          paintPills();
          const params = new URLSearchParams(window.location.search);
          const catParam = params.get('cat');
          if(catParam && document.querySelector(`#filter-bar .pill[data-filter="${catParam}"]`)){
            applyFilter(catParam);
          }
        }
      })
      .catch(err => {
        galleryEl.innerHTML = '<p class="col-span-full text-center text-ink-soft text-[14px] py-10">Gagal memuat portofolio. Coba refresh halaman.</p>';
        console.error('Gagal memuat portfolio-data.json', err);
      });
  }

  /* ---------- testimonials: load from testimonials-data.json (portofolio.html) ---------- */
  const testimonialsEl = document.getElementById('testimonials-grid');
  function starRow(rating){
    const r = Math.max(0, Math.min(5, parseInt(rating,10) || 5));
    let html = '';
    for(let i=1;i<=5;i++){
      html += `<svg width="15" height="15" viewBox="0 0 24 24" fill="${i<=r ? '#f5b400' : '#e7ece9'}"><path d="M12 2.5l2.9 6.3 6.9.7-5.2 4.6 1.6 6.8L12 17.8l-6.2 3.1 1.6-6.8-5.2-4.6 6.9-.7Z"/></svg>`;
    }
    return html;
  }
  function testimonialCardHTML(t){
    const avatar = t.photo
      ? `<img src="${t.photo}" alt="${t.name}" class="w-11 h-11 rounded-full object-cover">`
      : `<div class="w-11 h-11 rounded-full bg-primary-soft text-primary-deep grid place-items-center font-bold text-[15px]">${(t.name||'?').trim().charAt(0).toUpperCase()}</div>`;
    return `
    <div class="reveal in rounded-2xl border border-line bg-white p-5 shadow-soft">
      <div class="flex items-center gap-1 mb-3">${starRow(t.rating)}</div>
      <p class="text-[14px] text-ink leading-relaxed">"${t.quote}"</p>
      <div class="flex items-center gap-3 mt-4">
        ${avatar}
        <div><div class="font-bold text-[13.5px] text-ink">${t.name}</div><div class="text-[12px] text-ink-soft">${t.business}</div></div>
      </div>
    </div>`;
  }
  if(testimonialsEl){
    fetch('testimonials-data.json')
      .then(res => res.json())
      .then(data => {
        const items = Array.isArray(data) ? data : (data.items || []);
        if(!items.length){
          testimonialsEl.innerHTML = '<p class="col-span-full text-center text-ink-soft text-[14px] py-6">Belum ada testimoni.</p>';
          return;
        }
        testimonialsEl.innerHTML = items.map(testimonialCardHTML).join('');
      })
      .catch(err => {
        testimonialsEl.innerHTML = '<p class="col-span-full text-center text-ink-soft text-[14px] py-6">Gagal memuat testimoni.</p>';
        console.error('Gagal memuat testimonials-data.json', err);
      });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(item=>{
    const q = item.querySelector('.faq-q');
    if(!q) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(o=>{ if(o!==item) o.classList.remove('open'); });
      item.classList.toggle('open', !isOpen);
    });
  });

  /* ---------- hero deck parallax (gerak dibatasi, tidak numpuk lagi) ---------- */
  const deck = document.getElementById('hero-deck');
  if(deck && window.matchMedia('(prefers-reduced-motion: no-preference)').matches){
    const deckCards = Array.from(deck.querySelectorAll('.artboard'));
    // simpan transform dasar (rotasi/posisi asli tiap kartu) sebelum ditimpa efek parallax
    const baseTransforms = deckCards.map(el => {
      const t = getComputedStyle(el).transform;
      return (t === 'none') ? '' : t;
    });
    const MAX_SHIFT = 16; // px, batas maksimal pergeseran supaya kartu tidak kabur keluar area
    deck.addEventListener('mousemove', (e) => {
      const r = deck.getBoundingClientRect();
      const x = Math.max(-.5, Math.min(.5, (e.clientX - r.left) / r.width - .5));
      const y = Math.max(-.5, Math.min(.5, (e.clientY - r.top) / r.height - .5));
      deckCards.forEach((el, i)=>{
        const depth = Math.min((i + 1) * 6, MAX_SHIFT);
        el.style.transform = `${baseTransforms[i]} translate(${(x*depth).toFixed(2)}px, ${(y*depth).toFixed(2)}px)`;
      });
    });
    deck.addEventListener('mouseleave', () => {
      deckCards.forEach((el, i)=>{ el.style.transform = baseTransforms[i]; });
    });
  }

  /* ---------- newsletter -> whatsapp handoff (no backend) ---------- */
  const nlForm = document.getElementById('newsletter-form');
  const nlNote = document.getElementById('newsletter-note');
  if(nlForm){
    nlForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = nlForm.querySelector('input[type="email"]').value.trim();
      nlNote.textContent = 'Terima kasih — lanjutkan lewat WhatsApp untuk konfirmasi.';
      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Halo ranahdesain.store! Saya mau subscribe update promo/tips desain. Email: ' + email)}`, '_blank');
      nlForm.reset();
    });
  }

  /* ---------- order form -> whatsapp handoff (no backend) ---------- */
  const orderForm = document.getElementById('order-form');
  if(orderForm){
    const layananSelect = document.getElementById('order-layanan');
    const lainnyaWrap = document.getElementById('order-lainnya-wrap');
    const lainnyaInput = document.getElementById('order-lainnya');
    const note = document.getElementById('order-note');

    if(layananSelect){
      layananSelect.addEventListener('change', () => {
        const isOther = layananSelect.value === 'Lainnya';
        lainnyaWrap.classList.toggle('rd-hidden', !isOther);
        lainnyaInput.required = isOther;
        if(!isOther) lainnyaInput.value = '';
      });
    }

    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nama = document.getElementById('order-nama').value.trim();
      let layanan = layananSelect.value;
      if(layanan === 'Lainnya' && lainnyaInput.value.trim()){
        layanan = `Lainnya — ${lainnyaInput.value.trim()}`;
      }
      const deskripsi = document.getElementById('order-deskripsi').value.trim();
      const kontak = document.getElementById('order-kontak') ? document.getElementById('order-kontak').value.trim() : '';

      let msg = `Halo ranahdesain.store! Saya mau pesan desain.\n\n`;
      msg += `Nama: ${nama}\n`;
      msg += `Layanan: ${layanan}\n`;
      if(kontak) msg += `Kontak lain: ${kontak}\n`;
      msg += `Kebutuhan: ${deskripsi}`;

      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
      if(note){
        note.classList.remove('hidden');
        note.textContent = 'Form terkirim ke WhatsApp — cek tab baru untuk lanjut chat dengan kami.';
      }
      orderForm.reset();
      if(lainnyaWrap) lainnyaWrap.classList.add('rd-hidden');
    });
  }

});
