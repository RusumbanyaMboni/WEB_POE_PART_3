
const qs = (s, parent=document) => parent.querySelector(s);
const qsa = (s, parent=document) => Array.from((parent || document).querySelectorAll(s));

document.addEventListener("DOMContentLoaded", () => {
  addFadeIn();
  loadProducts();          
  setupScrollAnimations(); 
  enableLightbox();
  setupForms();
  addDownloadButtonToContact();
  setupSearch();
});

/* HERO SLIDESHOW */

(function () {
  function initHeroSlideshow() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const prefersReduced =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dotsWrap = hero.querySelector('.hero-dots');
    if (!slides.length || !dotsWrap) return;

    slides.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'hero-dot' + (i === 0 ? ' active' : '');
      btn.setAttribute('aria-label', 'Show slide ' + (i + 1));
      btn.dataset.index = i;
      dotsWrap.appendChild(btn);
    });

    let current = slides.findIndex(s => s.classList.contains('active'));
    if (current === -1) current = 0;
    const dots = Array.from(dotsWrap.children);

    function goTo(n) {
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = (n + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
    }

    dotsWrap.addEventListener('click', (e) => {
      const d = e.target.closest('button');
      if (!d) return;
      goTo(Number(d.dataset.index));
    });

    if (!prefersReduced) {
      let timer = setInterval(() => goTo(current + 1), 4500);
      hero.addEventListener('mouseenter', () => clearInterval(timer));
      hero.addEventListener('mouseleave', () => {
        timer = setInterval(() => goTo(current + 1), 4500);
      });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) clearInterval(timer);
        else timer = setInterval(() => goTo(current + 1), 4500);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroSlideshow);
  } else {
    initHeroSlideshow();
  }
})();

/* FADE IN ANIMATIONS*/

function addFadeIn() {
  qsa("h1").forEach((h, i) => {
    h.style.opacity = 0;
    setTimeout(() => {
      h.style.transition = "opacity 700ms ease";
      h.style.opacity = 1;
    }, 150 + i * 150);
  });

  qsa(".card").forEach((card, i) => {
    card.style.opacity = 0;
    card.style.transform = "translateY(20px)";
    setTimeout(() => {
      card.style.transition = "opacity 700ms ease, transform 320ms ease";
      card.style.opacity = 1;
      card.style.transform = "translateY(0)";
    }, 220 + i * 140);
  });
}

/* 
   PRODUCT LIST
 */
const products = [
  { id:1, name:"Classic Chocolate Cake", description:"Rich, moist chocolate cake with creamy ganache frosting.", image:"image/Classic%20Chocolate%20Cake.jpg" },
  { id:2, name:"Red Velvet Cake", description:"Elegant red velvet with cream cheese frosting.", image:"image/Red%20Velvet%20Cake.jpeg" },
  { id:3, name:"Vanilla Cheesecake", description:"Creamy cheesecake with a buttery graham base.", image:"image/Cupcake-vanillee.png" },
  { id:4, name:"Strawberry Shortcake", description:"Fresh strawberries and whipped cream.", image:"image/strawberry_cupcake.jpg" },
  { id:5, name:"Carrot Cake", description:"Moist carrot cake with cream cheese frosting and walnuts.", image:"image/Carrot%20cake.webp" }
];

function loadProducts() {
  const container = qs("#product-list");
  if (!container) return;

  container.innerHTML = "";
  products.forEach(p => container.appendChild(createProductCard(p)));

  
  autoMarkAnimateTargets();
  setupScrollAnimations();
}

function createProductCard(p) {
  const card = document.createElement("article");
  card.className = "product-card";
  card.setAttribute("aria-label", p.name);
  card.style.backgroundImage = `url('${p.image}')`;
  card.style.backgroundSize = "cover";
  card.style.backgroundPosition = "center";

  const overlay = document.createElement("div");
  overlay.style.cssText = "position:absolute;inset:0;background:rgba(0,0,0,0.38);";

  const content = document.createElement("div");
  content.style.cssText = "position:relative;z-index:1;padding:14px;width:100%";
  content.innerHTML = `
    <h3 style="margin:0 0 8px;color:#fff;font-size:18px;">${p.name}</h3>
    <p style="margin:0 0 10px;color:#fff;opacity:0.95;font-size:14px;">${p.description}</p>
    <div style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;">
      <button class="btn view-btn" data-id="${p.id}" aria-label="View ${p.name}">View</button>
      <button class="btn order-btn" data-name="${p.name}" aria-label="Order ${p.name}">Order</button>
    </div>
  `;

  card.appendChild(overlay);
  card.appendChild(content);
  return card;
}

/* 
   MODAL / LIGHTBOX
 */
function enableLightbox() {
  document.body.addEventListener("click", (e) => {
    const btn = e.target.closest(".view-btn");
    if (!btn) return;
    const id = +btn.dataset.id;
    const product = products.find(p => p.id === id);
    if (!product) return;

    showModal(`
      <h2>${product.name}</h2>
      <img src="${product.image}" alt="${product.name}" style="width:100%;max-height:320px;object-fit:cover;border-radius:8px;margin:12px 0;">
      <p>${product.description}</p>
    `);
  });
}

function showModal(html) {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `
    <div class="modal">
      ${html}
      <div style="text-align:right;margin-top:12px;">
        <button class="btn close-modal">Close</button>
      </div>
    </div>`;
  document.body.appendChild(backdrop);

  backdrop.addEventListener("click", (ev) => {
    if (ev.target === backdrop || ev.target.closest(".close-modal"))
      backdrop.remove();
  });
}

/* 
   ORDER BUTTON HANDLER
 */
document.body.addEventListener("click", (e) => {
  const orderBtn = e.target.closest(".order-btn");
  if (!orderBtn) return;
  const productName = orderBtn.dataset.name;

  if (qs("#specialRequests")) {
    qs("#specialRequests").value = `I would like to order: ${productName}`;
    qs("#name")?.focus();
    return;
  }

  window.location.href = `enquiry.html?product=${encodeURIComponent(productName)}`;
});

function setupForms() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("product") && qs("#cakeType")) {
    qs("#cakeType").value = urlParams.get("product");
  }

  qsa("form").forEach(form => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validateForm(form)) return;

      const payload = formToJSON(form);
      await fakeAjaxSend(payload);
      showInlineMessage(form, "✅ Thank you! Your enquiry was submitted.");
      form.reset();
      setTimeout(() => window.location.href = "index.html", 1400);
    });
  });
}

function showInlineMessage(form, text) {
  let msg = form.querySelector(".form-msg");
  if (!msg) {
    msg = document.createElement("div");
    msg.className = "form-msg";
    msg.style.cssText =
      "margin-top:12px;padding:10px;background:var(--accent);color:#fff;border-radius:6px;text-align:center;";
    form.appendChild(msg);
  }
  msg.textContent = text;
}

function validateForm(form) {
  const name = form.querySelector("[name='name']");
  const email = form.querySelector("[name='email']");
  if (name && !name.value.trim()) { alert("Please enter your name."); return false; }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    alert("Please enter a valid email."); return false;
  }
  return true;
}

function formToJSON(form) {
  const data = {};
  new FormData(form).forEach((v, k) => (data[k] = v));
  data.submittedAt = new Date().toISOString();
  return data;
}

function fakeAjaxSend(payload) {
  return new Promise(resolve => {
    setTimeout(() => {
      const key = "sweetcravings_enquiries";
      const list = JSON.parse(localStorage.getItem(key) || "[]");
      list.push(payload);
      localStorage.setItem(key, JSON.stringify(list));
      resolve({ ok: true });
    }, 600);
  });
}

/*  DOWNLOAD JSON BUTTON */
function addDownloadButtonToContact() {
  const contactMain = qs("main");
  if (!contactMain || qs("#download-enquiries")) return;

  const btn = document.createElement("button");
  btn.id = "download-enquiries";
  btn.className = "btn";
  btn.textContent = "📥 Download Enquiries (JSON)";
  btn.style.cssText = "margin-top:14px;background:var(--accent);color:#fff;";

  btn.addEventListener("click", () => {
    const list = JSON.parse(localStorage.getItem("sweetcravings_enquiries") || "[]");
    if (!list.length) return alert("No enquiries saved.");

    const blob = new Blob([JSON.stringify(list, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "enquiries.json"; a.click();
    URL.revokeObjectURL(url);
  });

  contactMain.appendChild(btn);
}

/* 
   SEARCH PRODUCTS
 */
function setupSearch() {
  document.addEventListener("input", (e) => {
    if (e.target.id !== "search") return;
    const q = e.target.value.toLowerCase();
    const container = qs("#product-list");
    if (!container) return;

    const filtered = products.filter(
      p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );

    container.innerHTML = filtered.length
      ? filtered.map(p => createProductCard(p).outerHTML).join('')
      : `<p style="grid-column:1/-1;text-align:center;color:#666;padding:20px;">No products found.</p>`;

    autoMarkAnimateTargets();
    setupScrollAnimations();
  });
}


function setupScrollAnimations() {
  autoMarkAnimateTargets();

  if (!('IntersectionObserver' in window)) {
    qsa('.animate-on-scroll').forEach(el => el.classList.add('in-view'));
    return;
  }

  const io = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('in-view'), i * 120);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px" }
  );

  qsa('.animate-on-scroll').forEach(el => io.observe(el));
}

function autoMarkAnimateTargets() {
  const selectors = [
    "main h2",
    ".card",
    ".product-card",
    ".hero-content",
    "section.cta",
    "footer",
  ];

  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      if (!el.classList.contains("animate-on-scroll")) el.classList.add("animate-on-scroll");
    });
  });
}
