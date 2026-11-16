/* Shared: language, mobile menu, chat, reveal animations */
(function () {
  'use strict';

  /* ---- Language ---- */
  var lang = 'en';
  var hist = [];
  var translatedNodes = new WeakMap();
  var textTranslations = {
    'Mon–Sat 9:30 AM–11 PM · Sun 10 AM–10 PM': 'సోమ–శని ఉదయం 9:30–రాత్రి 11 · ఆదివారం ఉదయం 10–రాత్రి 10',
    'WhatsApp': 'వాట్సాప్',
    'WhatsApp Order': 'వాట్సాప్ ఆర్డర్',
    'Call 98490 97880': '98490 97880కు కాల్ చేయండి',
    'Call 1': 'కాల్ 1',
    'Call 2': 'కాల్ 2',
    'Call': 'కాల్ చేయండి',
    'Order on WhatsApp': 'వాట్సాప్‌లో ఆర్డర్ చేయండి',
    'Call now': 'ఇప్పుడే కాల్ చేయండి',
    'What do you sell?': 'మీరు ఏమి విక్రయిస్తారు?',
    'Where is the shop?': 'దుకాణం ఎక్కడ ఉంది?',
    'How do I order?': 'నేను ఎలా ఆర్డర్ చేయాలి?',
    'Opening hours?': 'దుకాణ సమయాలు ఏమిటి?',
    'Ask about the shop': 'దుకాణం గురించి అడగండి',
    'Send': 'పంపండి',
    'Find the shop': 'దుకాణాన్ని కనుగొనండి',
    'Home': 'హోమ్',
    'About': 'మా గురించి',
    'Products': 'ఉత్పత్తులు',
    'Gallery': 'గ్యాలరీ',
    'Licences': 'లైసెన్సులు',
    'Contact': 'సంప్రదించండి',
    'Back': 'వెనుకకు',
    'Quick links': 'త్వరిత లింకులు',
    'Vijetha Medical & General Stores': 'విజేత మెడికల్ & జనరల్ స్టోర్స్',
    'Chemist & Druggists at Koneru Centre, Machilipatnam. Also known as Nowroji Medicals.': 'మచిలీపట్నంలోని కోనేరు సెంటర్‌లోని ఔషధ దుకాణం. నౌరోజీ మెడికల్స్‌గా కూడా ప్రసిద్ధి.',
    'Chemist & Druggists at Koneru Centre, Machilipatnam. Also known as Nowroji Medicals. Prescription medicines dispensed as the law requires.': 'మచిలీపట్నంలోని కోనేరు సెంటర్‌లోని ఔషధ దుకాణం. నౌరోజీ మెడికల్స్‌గా కూడా ప్రసిద్ధి. చట్ట ప్రకారం చెల్లుబాటు అయ్యే ప్రిస్క్రిప్షన్‌పై మాత్రమే మందులు ఇస్తాము.',
    '© Vijetha Medical & General Stores. Serving Machilipatnam since 1989.': '© విజేత మెడికల్ & జనరల్ స్టోర్స్. 1989 నుండి మచిలీపట్నానికి సేవలు.',
    '© Vijetha Medical & General Stores (Nowroji Medicals). Serving Machilipatnam since 1989.': '© విజేత మెడికల్ & జనరల్ స్టోర్స్ (నౌరోజీ మెడికల్స్). 1989 నుండి మచిలీపట్నానికి సేవలు.',
    'Prescription medicines are dispensed only against a valid prescription. Send your list or a photo of the prescription on WhatsApp and we will confirm the order by phone.': 'చెల్లుబాటు అయ్యే ప్రిస్క్రిప్షన్‌పై మాత్రమే మందులు ఇస్తాము. మీ జాబితా లేదా ప్రిస్క్రిప్షన్ ఫోటోను వాట్సాప్‌లో పంపండి; ఆర్డర్‌ను ఫోన్‌లో నిర్ధారిస్తాము.',
    'Tablets, capsules, syrups, drops and injections for common and prescribed needs. Always with a valid prescription where required by law.': 'సాధారణ మరియు ప్రిస్క్రిప్షన్ అవసరాలకు మాత్రలు, క్యాప్సూల్స్, సిరప్‌లు, చుక్కల మందులు, ఇంజెక్షన్లు. చట్టం కోరినప్పుడు చెల్లుబాటు అయ్యే ప్రిస్క్రిప్షన్ తప్పనిసరి.',
    'Topical treatments for everyday skin, wound care and prescribed use — ready at the counter.': 'చర్మ సంరక్షణ, గాయాల సంరక్షణ మరియు వైద్యుల సూచనల కోసం లేపనాలు, క్రీములు అందుబాటులో ఉన్నాయి.',
    'Scissors, blades, cotton rolls, IV saline and NS solutions for clinics and home care. Essential for hospitals and nursing homes in the area.': 'క్లినిక్‌లు, ఆసుపత్రులు మరియు ఇంటి సంరక్షణ కోసం కత్తెరలు, బ్లేడ్లు, దూది రోల్స్, ఐవీ సెలైన్ మరియు ఎన్‌ఎస్ ద్రావణాలు.',
    'Hand sanitisers and everyday hygiene products that keep households and workplaces safe.': 'ఇంటి మరియు కార్యాలయ పరిశుభ్రత కోసం చేతుల శానిటైజర్లు, రోజువారీ పరిశుభ్రత ఉత్పత్తులు.',
    'Blades, injections, ointments and medicines for livestock and animals — supporting farms around the town.': 'పశువులు మరియు ఇతర జంతువుల కోసం బ్లేడ్లు, ఇంజెక్షన్లు, లేపనాలు, మందులు.',
    'Milk powders, nutrition drinks and packaged items for infants, elders and daily wellness.': 'శిశువులు, పెద్దలు మరియు రోజువారీ ఆరోగ్య సంరక్షణ కోసం పాల పొడులు, పోషక పానీయాలు, ప్యాకేజ్డ్ ఉత్పత్తులు.',
    'Wellness products and traditional massage oils used in many homes across the region.': 'ఆరోగ్య సంరక్షణ ఉత్పత్తులు మరియు సంప్రదాయ మసాజ్ నూనెలు.',
    'Everyday personal care items for the whole family, stocked alongside medicines and supplies.': 'మొత్తం కుటుంబం కోసం రోజువారీ వ్యక్తిగత సంరక్షణ ఉత్పత్తులు.',
    'A family-run chemist that the town and nearby villages have relied on for decades.': 'దశాబ్దాలుగా పట్టణం మరియు సమీప గ్రామాల ప్రజలు విశ్వసిస్తున్న కుటుంబ నిర్వహిత ఔషధ దుకాణం.',
    'Retail drug licences in Forms 20 and 21, registered under ABDM. Dispensing follows the law.': 'ఫారమ్ 20, 21 రిటైల్ ఔషధ లైసెన్సులు; ఏబీడీఎంలో నమోదు. చట్ట ప్రకారం మందులు పంపిణీ చేస్తాము.',
    'Prescription medicines, surgical supplies, nutrition, wellness and general items in one place.': 'ప్రిస్క్రిప్షన్ మందులు, శస్త్రచికిత్స సామాగ్రి, పోషకాహారం, ఆరోగ్య సంరక్షణ మరియు జనరల్ వస్తువులు ఒకే చోట.',
    'Saline, blades, cotton rolls and animal-health products for clinics and farms.': 'క్లినిక్‌లు, పొలాల కోసం సెలైన్, బ్లేడ్లు, దూది రోల్స్ మరియు పశువైద్య ఉత్పత్తులు.',
    'Orders delivered in Machilipatnam. Confirm location by phone.': 'మచిలీపట్నం మరియు సమీప గ్రామాలకు సరుకులు అందిస్తాము. మీ ప్రాంతాన్ని ఫోన్‌లో నిర్ధారించండి.',
    'A look at the shop and the service we provide at Koneru Centre.': 'కోనేరు సెంటర్‌లోని మా దుకాణం మరియు సేవల దృశ్యాలు.',
    'Shopfront – Koneru Centre': 'కోనేరు సెంటర్‌లోని దుకాణం',
    'At the counter': 'కౌంటర్ వద్ద',
    'Licences on record': 'నమోదైన లైసెన్సులు',
    'Inside the store': 'దుకాణం లోపల',
    'Stocked for the town': 'పట్టణ అవసరాలకు సరుకులు',
    'Serving since 1989': '1989 నుండి సేవలు',
    'More photos can be added here. For a visit, see our': 'మరిన్ని చిత్రాలు త్వరలో జోడిస్తాము. దుకాణాన్ని సందర్శించడానికి',
    'Contact page.': 'సంప్రదింపు పేజీని చూడండి.',
    'Also known locally as Nowroji Medicals, Koneru Centre / Valandapalam area.': 'నౌరోజీ మెడికల్స్‌గా కూడా ప్రసిద్ధి; కోనేరు సెంటర్ / వలందపాలెం ప్రాంతం.',
    'Stall No. 64, Azad Road, Koneru Centre, Machilipatnam, Andhra Pradesh 521001': 'స్టాల్ నం. 64, ఆజాద్ రోడ్, కోనేరు సెంటర్, మచిలీపట్నం, ఆంధ్రప్రదేశ్ 521001',
    'Monday – Saturday: 9:30 AM – 11:00 PM': 'సోమవారం – శనివారం: ఉదయం 9:30 – రాత్రి 11:00',
    'Sunday: 10:00 AM – 10:00 PM': 'ఆదివారం: ఉదయం 10:00 – రాత్రి 10:00',
    'Visit or contact us': 'సందర్శించండి లేదా సంప్రదించండి',
    'Send your list or prescription on WhatsApp, or call. We confirm every order by phone.': 'మీ జాబితా లేదా ప్రిస్క్రిప్షన్‌ను వాట్సాప్‌లో పంపండి లేదా కాల్ చేయండి. ప్రతి ఆర్డర్‌ను ఫోన్‌లో నిర్ధారిస్తాము.',
    'Location map': 'ప్రదేశ మ్యాప్',
    'What families, clinics and farms in and around Machilipatnam need every day.': 'మచిలీపట్నం మరియు పరిసర ప్రాంతాల కుటుంబాలు, క్లినిక్‌లు, పొలాలకు రోజూ అవసరమైనవి.',
    'What would you like to do?': 'మీరు ఏమి చేయాలనుకుంటున్నారు?',
    'Why choose Vijetha?': 'విజేతను ఎందుకు ఎంచుకోవాలి?',
    'Your trusted chemist at Koneru Centre, Machilipatnam': 'మచిలీపట్నం కోనేరు సెంటర్‌లో మీ విశ్వసనీయ ఔషధ దుకాణం',
    'Medicines, hospital supplies, veterinary products and everyday health needs for the town and surrounding villages — continuously since 1989. Also known as Nowroji Medicals.': '1989 నుండి మచిలీపట్నం మరియు చుట్టుపక్కల గ్రామాలకు మందులు, ఆసుపత్రి సామాగ్రి, పశువైద్య ఉత్పత్తులు మరియు రోజువారీ ఆరోగ్య అవసరాలు. నౌరోజీ మెడికల్స్‌గా కూడా ప్రసిద్ధి.',
    'Since 1989': '1989 నుండి',
    'Hospital supplies': 'ఆసుపత్రి సామాగ్రి',
    'Medicines, blades and ointments for animals.': 'జంతువుల కోసం మందులు, బ్లేడ్లు మరియు లేపనాలు.',
    'Milk powders, nutrition drinks and packaged items.': 'పాల పొడులు, పోషక పానీయాలు మరియు ప్యాకేజ్డ్ ఉత్పత్తులు.',
    'Prescription medicines are dispensed only against a valid prescription.': 'చెల్లుబాటు అయ్యే ప్రిస్క్రిప్షన్‌పై మాత్రమే మందులు ఇస్తాము.',
    'View all categories →': 'అన్ని విభాగాలను చూడండి →',
    'Exemption certificate': 'మినహాయింపు ధృవీకరణ పత్రం',
    'Drug Licence, Form 20': 'ఔషధ లైసెన్స్, ఫారమ్ 20',
    'Drug Licence, Form 21': 'ఔషధ లైసెన్స్, ఫారమ్ 21',
    'ABDM Health Facility ID': 'ABDM ఆరోగ్య కేంద్ర గుర్తింపు సంఖ్య',
    'GSTIN': 'GSTIN',
    'FSSAI Licence No.': 'FSSAI లైసెన్స్ నం.',
    'To be added': 'జోడించాల్సి ఉంది',
    'Drugs Inspector order': 'ఔషధ నియంత్రణ అధికారి ఉత్తర్వు',
    'The family that has kept the shop serving the community since 1989.': '1989 నుండి సమాజానికి సేవలందిస్తున్న ఈ కుటుంబం.',
    'Established the shop in 1989 and laid the foundation of trust the town still relies on.': '1989లో దుకాణాన్ని స్థాపించి, పట్టణం నేటికీ విశ్వసించే సేవకు పునాది వేశారు.',
    'Our leadership': 'మా నాయకత్వం',
    'Our story': 'మా కథ',
    'Founder': 'స్థాపకులు',
    'Proprietor': 'యజమాని',
    'Sub-Proprietor': 'సహ యజమాని',
    'Nearby hospitals': 'సమీపంలోని ఆసుపత్రులు',
    'Andhra Hospitals, Machilipatnam': 'ఆంధ్ర హాస్పిటల్స్, మచిలీపట్నం',
    'Government Hospital, Machilipatnam': 'ప్రభుత్వ ఆసుపత్రి, మచిలీపట్నం',
    'Vijaya Lakshmi Nursing Home': 'విజయ లక్ష్మి నర్సింగ్ హోమ్',
    'In an emergency, please go to your nearest hospital.': 'అత్యవసర పరిస్థితుల్లో సమీప ఆసుపత్రికి వెళ్లండి.'
  };

  function setLang(l) {
    lang = l;
    document.body.classList.toggle('lang-te', l === 'te');
    document.querySelectorAll('[data-te-html]').forEach(function (el) {
      if (!el.dataset.enHtml) el.dataset.enHtml = el.innerHTML;
      el.innerHTML = l === 'te' ? el.dataset.teHtml : el.dataset.enHtml;
    });
    document.querySelectorAll('[data-te]').forEach(function (el) {
      if (!el.dataset.en) el.dataset.en = el.textContent.trim();
      var value = l === 'te' ? el.dataset.te : el.dataset.en;
      var textNode = Array.prototype.find.call(el.childNodes, function (node) {
        return node.nodeType === Node.TEXT_NODE && node.nodeValue.trim();
      });
      if (textNode) textNode.nodeValue = textNode.nodeValue.replace(textNode.nodeValue.trim(), value);
      else if (!el.children.length) el.textContent = value;
    });
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var textNode;
    while ((textNode = walker.nextNode())) {
      if (textNode.parentElement.closest('[data-te], [data-te-html]')) continue;
      var original = translatedNodes.get(textNode);
      if (!original) {
        original = textNode.nodeValue;
        translatedNodes.set(textNode, original);
      }
      var key = original.trim();
      if (textTranslations[key]) {
        textNode.nodeValue = original.replace(key, l === 'te' ? textTranslations[key] : key);
      }
    }
    document.querySelectorAll('[data-te-alt]').forEach(function (el) {
      el.alt = l === 'te' ? el.dataset.teAlt : el.dataset.enAlt;
    });
    document.querySelectorAll('[data-te-aria]').forEach(function (el) {
      el.setAttribute('aria-label', l === 'te' ? el.dataset.teAria : el.dataset.enAria);
    });
    document.querySelectorAll('[data-te-title]').forEach(function (el) {
      el.title = l === 'te' ? el.dataset.teTitle : el.dataset.enTitle;
    });
    document.documentElement.lang = l;
    var pageTitles = {
      'index.html': ['Vijetha Medical & General Stores | Home – Machilipatnam', 'విజేత మెడికల్ & జనరల్ స్టోర్స్ | హోమ్ – మచిలీపట్నం'],
      'about.html': ['About Us | Vijetha Medical & General Stores – Machilipatnam', 'మా గురించి | విజేత మెడికల్ & జనరల్ స్టోర్స్ – మచిలీపట్నం'],
      'products.html': ['Products | Vijetha Medical & General Stores – Machilipatnam', 'ఉత్పత్తులు | విజేత మెడికల్ & జనరల్ స్టోర్స్ – మచిలీపట్నం'],
      'gallery.html': ['Gallery | Vijetha Medical & General Stores – Machilipatnam', 'గ్యాలరీ | విజేత మెడికల్ & జనరల్ స్టోర్స్ – మచిలీపట్నం'],
      'licences.html': ['Licences | Vijetha Medical & General Stores – Machilipatnam', 'లైసెన్సులు | విజేత మెడికల్ & జనరల్ స్టోర్స్ – మచిలీపట్నం'],
      'contact.html': ['Contact | Vijetha Medical & General Stores – Machilipatnam', 'సంప్రదించండి | విజేత మెడికల్ & జనరల్ స్టోర్స్ – మచిలీపట్నం']
    };
    var pageTitle = pageTitles[window.location.pathname.split('/').pop() || 'index.html'];
    if (pageTitle) document.title = pageTitle[l === 'te' ? 1 : 0];
    document.querySelectorAll('.lang button').forEach(function (b) {
      b.setAttribute('aria-pressed', b.dataset.l === l);
    });
    var ci = document.getElementById('ci');
    if (ci) ci.placeholder = l === 'te' ? 'షాప్ గురించి అడగండి' : 'Ask about the shop';
    var menu = document.querySelector('.nav-mobile');
    if (menu) menu.setAttribute('aria-label', l === 'te' ? 'ప్రధాన మెనూ' : 'Main menu');
    var menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) menuToggle.setAttribute('aria-label', l === 'te' ? 'మెనూను తెరవండి' : 'Open menu');
    var map = document.querySelector('.map-wrap iframe');
    if (map) {
      if (!map.dataset.enSrc) map.dataset.enSrc = map.src;
      var mapUrl = new URL(map.dataset.enSrc);
      mapUrl.searchParams.set('hl', l === 'te' ? 'te' : 'en');
      map.src = mapUrl.toString();
    }
    try { localStorage.setItem('vijetha-lang', l); } catch (e) {}
  }

  document.querySelectorAll('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.dataset.l); });
  });
  try {
    if (localStorage.getItem('vijetha-lang') === 'te') setLang('te');
  } catch (e) {}

  /* ---- Mobile menu ---- */
  var toggle = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.nav-mobile');
  if (toggle && mobileNav) {
    function closeMenu() {
      mobileNav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', lang === 'te' ? 'మెనూను తెరవండి' : 'Open menu');
      document.body.style.overflow = '';
    }
    toggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
      toggle.setAttribute('aria-label', open
        ? (lang === 'te' ? 'మెనూను మూసివేయండి' : 'Close menu')
        : (lang === 'te' ? 'మెనూను తెరవండి' : 'Open menu'));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileNav.addEventListener('click', function (e) {
      if (e.target === mobileNav) closeMenu();
    });
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) closeMenu();
    });
  }

  /* ---- Intro splash and footer-safe floating controls ---- */
  var splash = document.getElementById('site-splash');
  if (splash) {
    var splashDismissed = false;
    function dismissSplash() {
      if (splashDismissed) return;
      splashDismissed = true;
      splash.classList.add('is-hidden');
      window.setTimeout(function () { splash.remove(); }, 500);
    }
    window.addEventListener('load', function () { window.setTimeout(dismissSplash, 900); }, { once: true });
    window.setTimeout(dismissSplash, 3000);
  }
  var footer = document.querySelector('.site-footer');
  if (footer && 'IntersectionObserver' in window) {
    var footerObserver = new IntersectionObserver(function (entries) {
      document.body.classList.toggle('footer-visible', entries[0].isIntersecting);
      if (entries[0].isIntersecting) {
        document.documentElement.style.setProperty(
          '--footer-fab-offset',
          Math.ceil(entries[0].target.getBoundingClientRect().height + 12) + 'px'
        );
      }
    });
    footerObserver.observe(footer);
  }

  /* ---- Chat ---- */
  var log = document.getElementById('log');
  var chatPending = false;
  window.openChat = function () {
    var chat = document.getElementById('chat');
    if (!chat) return;
    chat.classList.add('on');
    if (log && !log.children.length) showWelcomeMessage();
    var ci = document.getElementById('ci');
    if (ci && !window.matchMedia('(max-width: 560px)').matches) ci.focus();
  };
  window.clearChat = function () {
    if (chatPending || !log) return;
    hist = [];
    log.replaceChildren();
    var ci = document.getElementById('ci');
    if (ci) ci.value = '';
    showWelcomeMessage();
  };
  function showWelcomeMessage() {
    addMsg(
      lang === 'te'
        ? 'నమస్కారం! నేను లీసా. విజేత మెడికల్ ఉత్పత్తులు, చిరునామా, సమయాలు లేదా ఆర్డర్ గురించి అడగండి.'
        : 'Hello! I’m Lisa, the Vijetha Medical website assistant. Ask about the shop, its listed product categories, location, hours, or ordering.',
      'b'
    );
  };
  window.closeChat = function () {
    var chat = document.getElementById('chat');
    if (chat) chat.classList.remove('on', 'keyboard-open');
    var chatInput = document.getElementById('ci');
    if (chatInput) chatInput.blur();
  };

  function addMsg(t, c) {
    if (!log) return null;
    var d = document.createElement('div');
    d.className = 'm ' + c;
    d.textContent = t;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }

  function formatAssistantReply(text) {
    return String(text)
      .replace(/\r\n?/g, '\n')
      .replace(/^\s{0,3}#{1,6}\s*/gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/^\s*[-*]\s+/gm, '')
      .replace(/\*{1,2}|_{1,2}/g, '')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  async function ask(q) {
    if (chatPending) return;
    chatPending = true;
    var sendButton = form && form.querySelector('button[type="submit"]');
    var clearButton = document.querySelector('.clear-chat');
    var chatInput = document.getElementById('ci');
    var promptButtons = document.querySelectorAll('.chips button');
    if (sendButton) sendButton.disabled = true;
    if (clearButton) clearButton.disabled = true;
    if (chatInput) chatInput.disabled = true;
    promptButtons.forEach(function (button) { button.disabled = true; });
    addMsg(q, 'u');
    var nextHist = hist.concat({ role: 'user', text: q });
    var requestHist = nextHist.slice(-10);
    if (requestHist[0] && requestHist[0].role === 'model') requestHist.shift();
    var w = addMsg(lang === 'te' ? 'లీసా సమాధానం ఇస్తున్నారు…' : 'Lisa is replying…', 'b');
    var controller = new AbortController();
    var timeout = window.setTimeout(function () { controller.abort(); }, 28000);
    try {
      var r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: requestHist, lang: lang }),
        signal: controller.signal
      });
      var d, responseText = await r.text();
      try {
        d = JSON.parse(responseText);
      } catch (parseError) {
        var contentType = r.headers.get('content-type') || 'unknown content type';
        var isStaticResponse = r.status === 404 || r.status === 405 || /text\/html/i.test(contentType);
        var responseError = new Error(isStaticResponse
          ? 'Lisa chat API is unavailable (HTTP ' + r.status + '). This deployment must include the /api/chat function.'
          : 'Chat API returned non-JSON data (HTTP ' + r.status + ', ' + contentType + '). Check the API deployment logs.');
        responseError.status = r.status;
        responseError.code = isStaticResponse ? 'CHAT_API_UNAVAILABLE' : 'CHAT_INVALID_RESPONSE';
        throw responseError;
      }
      if (!d || typeof d.reply !== 'string') {
        var shapeError = new Error('Chat API returned unexpected JSON (HTTP ' + r.status + '); expected a reply string. Check the server logs.');
        shapeError.status = r.status;
        throw shapeError;
      }
      if (!r.ok) {
        var apiError = new Error(d.reply || d.error?.message || ('Chat request failed (HTTP ' + r.status + ').'));
        apiError.status = r.status;
        throw apiError;
      }
      if (w) w.textContent = formatAssistantReply(d.reply || (lang === 'te' ? 'దయచేసి 98493 65613కు కాల్ చేయండి.' : 'Please call 98493 65613.'));
      hist = nextHist;
      hist.push({ role: 'model', text: w ? w.textContent : '' });
    } catch (e) {
      console.error('Shop assistant request failed:', e);
      if (w) {
        if (window.location.protocol === 'file:') {
          w.textContent = lang === 'te'
            ? 'చాట్ ఉపయోగించడానికి ప్రచురించిన వెబ్‌సైట్‌ను తెరవండి. API కీ సర్వర్‌లో సురక్షితంగా ఉంచబడుతుంది.'
            : 'Open the deployed website to use chat. The API key is kept securely on the server.';
        } else if (e.code === 'CHAT_API_UNAVAILABLE' || e.status === 404) {
          w.textContent = lang === 'te'
            ? 'ఈ డిప్లాయ్‌మెంట్‌లో Lisa చాట్ API అందుబాటులో లేదు. /api/chat ఫంక్షన్‌ను చేర్చి Vercelలో మళ్లీ డిప్లాయ్ చేయండి.'
            : 'Lisa chat API is not included in this deployment. Include the /api/chat function and redeploy on Vercel.';
        } else if (e.status === 405) {
          w.textContent = lang === 'te'
            ? 'ఈ డిప్లాయ్‌మెంట్ చాట్ POST అభ్యర్థనలను అంగీకరించడం లేదు. Vercelలో /api/chat ఫంక్షన్‌ను తనిఖీ చేసి మళ్లీ డిప్లాయ్ చేయండి.'
            : 'This deployment is rejecting chat POST requests (HTTP 405). Check that Vercel deployed /api/chat.';
        } else if (e.name === 'AbortError') {
          w.textContent = lang === 'te'
            ? 'సమయం ముగిసింది. ఇంటర్నెట్ లేదా Gemini API స్థితిని తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.'
            : 'The request timed out. Check your connection or Gemini API status, then try again.';
        } else if (e.message && e.message !== 'Failed to fetch') {
          w.textContent = e.message;
        } else {
          w.textContent = lang === 'te'
            ? 'సహాయకుడిని చేరుకోలేకపోయాము. దయచేసి Vercelలో చాట్ API మరియు Gemini API కీని తనిఖీ చేయండి.'
            : 'Could not reach the assistant. Check that the chat API is deployed and the Gemini API key is configured.';
        }
      }
    } finally {
      window.clearTimeout(timeout);
      chatPending = false;
      if (sendButton) sendButton.disabled = false;
      if (clearButton) clearButton.disabled = false;
      if (chatInput) chatInput.disabled = false;
      promptButtons.forEach(function (button) { button.disabled = false; });
    }
    if (log) log.scrollTop = log.scrollHeight;
  }

  var form = document.getElementById('cf');
  var chatInput = document.getElementById('ci');
  var viewport = window.visualViewport;
  function updateChatViewport() {
    var chat = document.getElementById('chat');
    if (!chat || !viewport || !chat.classList.contains('keyboard-open')) return;
    chat.style.setProperty('--chat-viewport-top', Math.max(0, viewport.offsetTop + 8) + 'px');
    chat.style.setProperty('--chat-viewport-height', Math.max(180, viewport.height - 16) + 'px');
  }
  if (chatInput) {
    chatInput.addEventListener('focus', function () {
      if (window.matchMedia('(max-width: 560px)').matches) {
        var chat = document.getElementById('chat');
        if (chat) {
          chat.classList.add('keyboard-open');
          updateChatViewport();
        }
      }
    });
    chatInput.addEventListener('blur', function () {
      var chat = document.getElementById('chat');
      if (chat) chat.classList.remove('keyboard-open');
    });
  }
  if (viewport) {
    viewport.addEventListener('resize', updateChatViewport);
    viewport.addEventListener('scroll', updateChatViewport);
  }
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var i = document.getElementById('ci');
      var q = i && i.value.trim();
      if (q && !chatPending) {
        i.value = '';
        ask(q);
      }
    });
  }
  document.querySelectorAll('.chips button').forEach(function (b) {
    b.addEventListener('click', function () {
      openChat();
      if (!chatPending) ask(b.textContent);
    });
  });

  /* ---- Gallery photo zoom ---- */
  var galleryItems = document.querySelectorAll('.gallery-item img');
  if (galleryItems.length) {
    var lightbox = document.createElement('div');
    lightbox.className = 'gallery-lightbox';
    lightbox.hidden = true;
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', lang === 'te' ? 'పెద్ద ఫోటో' : 'Enlarged photo');
    var enlargedPhoto = document.createElement('img');
    var closeLightbox = document.createElement('button');
    closeLightbox.className = 'gallery-lightbox-close';
    closeLightbox.type = 'button';
    closeLightbox.setAttribute('aria-label', lang === 'te' ? 'మూసివేయి' : 'Close photo');
    closeLightbox.textContent = '×';
    lightbox.append(enlargedPhoto, closeLightbox);
    document.body.appendChild(lightbox);

    var lastGalleryTrigger = null;
    function hideGalleryPhoto() {
      lightbox.hidden = true;
      document.body.style.overflow = '';
      if (lastGalleryTrigger) lastGalleryTrigger.focus();
    }
    function showGalleryPhoto(image) {
      lastGalleryTrigger = image;
      enlargedPhoto.src = image.currentSrc || image.src;
      enlargedPhoto.alt = image.alt;
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      closeLightbox.focus();
    }
    galleryItems.forEach(function (image) {
      image.tabIndex = 0;
      image.setAttribute('role', 'button');
      image.setAttribute('aria-label', (image.alt || 'Photo') + (lang === 'te' ? ' — పెద్దగా చూడండి' : ' — enlarge photo'));
      image.addEventListener('click', function () { showGalleryPhoto(image); });
      image.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          showGalleryPhoto(image);
        }
      });
    });
    closeLightbox.addEventListener('click', hideGalleryPhoto);
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox || event.target === enlargedPhoto) hideGalleryPhoto();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !lightbox.hidden) hideGalleryPhoto();
    });
  }

  /* ---- Scroll reveal ---- */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('visible');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }
})();
