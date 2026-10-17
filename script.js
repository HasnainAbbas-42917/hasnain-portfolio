(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  $('#year').textContent = new Date().getFullYear();

  // Mobile menu
  const burger = $('#burger'), links = $('#links');
  const closeMenu = () => {
    burger.classList.remove('open');
    links.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  };
  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    links.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('#links a').forEach(a => a.addEventListener('click', closeMenu));

  // Scroll effects
  const nav = $('#nav'), bar = $('#progress'), topBtn = $('#toTop');
  const onScroll = () => {
    const y = window.scrollY;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle('scrolled', y > 30);
    bar.style.width = (h > 0 ? y / h * 100 : 0) + '%';
    topBtn.classList.toggle('show', y > 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Active link highlight (scroll spy)
  const navLinks = $$('.nl');
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));

  // Typing effect
  const words = ['Python backends', 'FastAPI and REST APIs', 'Flutter mobile apps', 'AI and ML solutions'];
  const el = $('#typed');
  let w = 0, c = 0, del = false;
  (function type() {
    const word = words[w];
    el.textContent = word.slice(0, c);
    if (!del && c === word.length) { del = true; return setTimeout(type, 1500); }
    if (del && c === 0) { del = false; w = (w + 1) % words.length; }
    c += del ? -1 : 1;
    setTimeout(type, del ? 40 : 85);
  })();

  // Reveal on scroll
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const n = e.target;
      n.classList.add('in');
      io.unobserve(n);
      // After the entrance finishes, hand the transform back to hover/tilt effects
      setTimeout(() => {
        n.classList.remove('reveal', 'in');
        n.style.transitionDelay = '';
      }, 1300);
    });
  }, { threshold: .12 });
  $$('.reveal').forEach((n, i) => {
    n.style.transitionDelay = (i % 4) * 90 + 'ms';
    io.observe(n);
  });

  // Cursor glow + card spotlight
  const glow = $('#cursorGlow');
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
  $$('.spot').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // Gentle 3D tilt on project cards (desktop only)
  if (window.matchMedia('(hover:hover)').matches) {
    $$('.tilt').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-8px)`;
      });
      card.addEventListener('mouseleave', () => card.style.transform = '');
    });
  }

  // Contact form: sends the message straight to the Gmail inbox
  const RECEIVER = 'hassnain6786@gmail.com';
  // FormSubmit private alias for the activated Gmail address (keeps the email out of the page source)
  const FORM_ALIAS = '1f6a0298fe4d8b50e73ed9b8266bbd06';
  const form = $('#contactForm'), btn = $('#fBtn'), status = $('#fStatus');
  const say = (msg, type) => { status.className = 'status ' + (type || ''); status.innerHTML = msg; };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if ($('#fHoney').value) return; // spam trap

    const name = $('#fName').value.trim();
    const email = $('#fEmail').value.trim();
    const phone = $('#fPhone').value.trim();
    const subject = $('#fSubject').value.trim();
    const message = $('#fMsg').value.trim();

    if (!name || !email || !subject || !message) return say('Please fill in all required fields.', 'err');
    if (!/^\S+@\S+\.\S+$/.test(email)) return say('Please enter a valid email address.', 'err');

    btn.disabled = true;
    btn.querySelector('span').textContent = 'Sending...';
    say('');

    try {
      const res = await fetch('https://formsubmit.co/ajax/' + FORM_ALIAS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name, email, phone: phone || 'Not provided', subject, message,
          _subject: 'Portfolio message: ' + subject,
          _replyto: email,
          _template: 'table',
          _captcha: 'false'
        })
      });
      const data = await res.json();
      if (res.ok && (data.success === true || data.success === 'true')) {
        say('Thank you ' + name + '. Your message has been sent. I will reply to you soon.', 'ok');
        form.reset();
      } else {
        throw new Error(data.message || 'Failed');
      }
    } catch (err) {
      const gmail = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + RECEIVER +
        '&su=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(message + '\n\nFrom: ' + name + ' (' + email + ')' + (phone ? '\nPhone: ' + phone : ''));
      say('Message could not be sent (' + (err.message || 'network error') + '). <a href="' + gmail + '" target="_blank" rel="noopener">Click here to send it through Gmail</a>.', 'err');
    } finally {
      btn.disabled = false;
      btn.querySelector('span').textContent = 'Send message';
    }
  });
})();