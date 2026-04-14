// =============================================
//  NUOVO DROP BANNER
// =============================================
const dropBanner = document.getElementById('drop-banner');
const dropBannerClose = document.getElementById('drop-banner-close');

if (sessionStorage.getItem('dropBannerClosed') === 'true') {
  dropBanner.classList.add('drop-banner--hidden');
}

dropBannerClose.addEventListener('click', () => {
  dropBanner.classList.add('drop-banner--hidden');
  sessionStorage.setItem('dropBannerClosed', 'true');
});

// =============================================
//  BACK TO TOP
// =============================================
const backToTopBtn = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
  backToTopBtn.classList.toggle('is-visible', window.scrollY > 300);
}, { passive: true });

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// =============================================
//  CATALOG — SEE MORE (mobile only)
// =============================================
const catalogGrid = document.querySelector('.product-grid');
const showMoreBtn = document.getElementById('catalog-show-more-btn');
const showMoreWrap = document.getElementById('catalog-show-more');

if (showMoreBtn && catalogGrid) {
  showMoreBtn.addEventListener('click', () => {
    const expanded = catalogGrid.classList.toggle('is-expanded');
    showMoreBtn.setAttribute('aria-expanded', expanded);
    showMoreBtn.querySelector('svg').style.transform = expanded ? 'rotate(180deg)' : '';
    showMoreBtn.childNodes[0].textContent = expanded ? 'See less ' : 'See more ';
    if (expanded) {
      const fifthCard = catalogGrid.querySelector('.product-card:nth-child(5)');
      if (fifthCard) fifthCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

// =============================================
//  SMOOTH SCROLL
// =============================================
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// =============================================
//  LIGHTBOX
// =============================================
const lightbox  = document.getElementById('lightbox');
const lbImg     = lightbox.querySelector('.lightbox__img');
const lbName    = lightbox.querySelector('.lightbox__name');
const lbPrice   = document.getElementById('lb-price');
const lbDots    = lightbox.querySelector('.lightbox__dots');
const lbPrev    = lightbox.querySelector('.lightbox__arrow--prev');
const lbNext    = lightbox.querySelector('.lightbox__arrow--next');
const lbClose   = lightbox.querySelector('.lightbox__close');
const lbAddCart      = document.getElementById('lb-add-cart');
const lbBuyNow       = document.getElementById('lb-buy-now');
const lbSizes        = document.getElementById('lb-sizes');
const lbAvailability = document.getElementById('lb-availability');

let images = [];
let current = 0;
let currentProduct = {};

function openLightbox(card) {
  images  = JSON.parse(card.dataset.images);
  current = 0;

  const availableSizes = JSON.parse(card.dataset.sizes || '[]');
  const soldSizes      = JSON.parse(card.dataset.sizesSold || '[]');

  currentProduct = {
    name:  card.dataset.name,
    price: card.dataset.price,
    size:  '',
    image: images[0]
  };

  lbName.textContent  = card.dataset.name;
  lbPrice.textContent = card.dataset.price;
  lbAddCart.textContent = '+ Cart';

  const isSold = card.dataset.sold === 'true';
  if (lbAvailability) {
    lbAvailability.textContent = isSold ? 'Sold Out' : '1 pair available';
    lbAvailability.style.color = isSold ? '#888' : '#4caf50';
  }

  buildSizes(availableSizes, soldSizes);

  // Se c'è una sola taglia disponibile, selezionala in automatico
  if (availableSizes.length === 1) {
    selectSize(availableSizes[0]);
  } else {
    lbAddCart.disabled = true;
    lbBuyNow.disabled  = true;
  }

  buildDots();
  showImage(0);
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
  lbClose.focus();
}

function buildSizes(available, sold) {
  lbSizes.innerHTML = '';
  [...available, ...sold].forEach(size => {
    const isSold = sold.includes(size);
    const btn = document.createElement('button');
    btn.className = 'lb-size-btn' + (isSold ? ' lb-size-btn--sold' : '');
    btn.textContent = isSold ? size + ' — SOLD' : size;
    btn.disabled = isSold;
    if (!isSold) {
      btn.addEventListener('click', () => selectSize(size));
    }
    lbSizes.appendChild(btn);
  });
}

function selectSize(size) {
  currentProduct.size = size;
  const alreadyInCart = isInCart(currentProduct.name);
  lbAddCart.disabled  = alreadyInCart;
  lbAddCart.textContent = alreadyInCart ? '✓ Already in cart' : '+ Cart';
  lbBuyNow.disabled   = false;
  lbSizes.querySelectorAll('.lb-size-btn').forEach(btn => {
    btn.classList.toggle('lb-size-btn--selected', btn.textContent === size);
  });
}

function closeLightbox() {
  lightbox.hidden = true;
  document.body.style.overflow = '';
  images = [];
}

function showImage(index) {
  current = index;
  lbImg.src = images[current];
  lbImg.alt = lbName.textContent;
  lbPrev.disabled = current === 0;
  lbNext.disabled = current === images.length - 1;
  lightbox.querySelectorAll('.lightbox__dot').forEach((dot, i) => {
    dot.classList.toggle('lightbox__dot--active', i === current);
  });
}

function buildDots() {
  lbDots.innerHTML = '';
  images.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'lightbox__dot';
    dot.setAttribute('aria-label', `Foto ${i + 1}`);
    dot.addEventListener('click', () => showImage(i));
    lbDots.appendChild(dot);
  });
}

document.querySelectorAll('.product-card').forEach(card => {
  // Applica sold-out visivo all'avvio
  if (card.dataset.sold === 'true') {
    card.classList.add('product-card--sold');
  }
  card.addEventListener('click', () => {
    if (card.dataset.sold === 'true') return;
    openLightbox(card);
  });
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (card.dataset.sold === 'true') return;
      openLightbox(card);
    }
  });
});

lbPrev.addEventListener('click', () => { if (current > 0) showImage(current - 1); });
lbNext.addEventListener('click', () => { if (current < images.length - 1) showImage(current + 1); });

lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

document.addEventListener('keydown', e => {
  if (lightbox.hidden) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  { if (current > 0) showImage(current - 1); }
  if (e.key === 'ArrowRight') { if (current < images.length - 1) showImage(current + 1); }
});

// =============================================
//  SWIPE su mobile
// =============================================
let touchStartX = 0;
let touchStartY = 0;

lightbox.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

lightbox.addEventListener('touchend', e => {
  if (lightbox.hidden) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dy) > Math.abs(dx)) return;
  if (Math.abs(dx) < 50) return;
  if (dx < 0 && current < images.length - 1) showImage(current + 1);
  if (dx > 0 && current > 0)                 showImage(current - 1);
}, { passive: true });

// =============================================
//  DISPONIBILITÀ CARD
// =============================================
function updateAvailability() {
  document.querySelectorAll('.product-card').forEach(card => {
    let avail = card.querySelector('.product-card__availability');
    if (!avail) {
      avail = document.createElement('span');
      avail.className = 'product-card__availability';
      card.querySelector('.product-card__info').appendChild(avail);
    }
    if (card.dataset.sold === 'true') {
      avail.textContent = '';
      avail.classList.remove('product-card__availability--sold');
    } else if (isInCart(card.dataset.name)) {
      avail.textContent = 'Reserved';
      avail.classList.add('product-card__availability--sold');
    } else {
      avail.textContent = '1 pair available';
      avail.classList.remove('product-card__availability--sold');
    }
  });
}

// =============================================
//  ANIMAZIONI SCROLL
// =============================================
const animObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      animObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

const animSelectors = [
  '.come-funziona__header',
  '.cf-step',
  '.autenticita__item',
  '.catalogo__header',
  '.product-card',
  '.social-feed__title',
  '.social-feed__item',
  '.recensioni__header',
  '.rec-card',
  '.recensioni__form-wrap',
  '.feed__header',
  '.feed__item',
  '.faq__header',
  '.faq__item',
  '.chiusura__brand'
];

animSelectors.forEach(sel => {
  document.querySelectorAll(sel).forEach((el, i) => {
    el.setAttribute('data-animate', '');
    el.style.transitionDelay = `${i * 0.07}s`;
    animObserver.observe(el);
  });
});

// =============================================
//  FAQ ACCORDION
// =============================================
document.querySelectorAll('.faq__btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const answer   = btn.closest('.faq__item').querySelector('.faq__answer');
    const isOpen   = btn.getAttribute('aria-expanded') === 'true';
    // Chiudi tutte
    document.querySelectorAll('.faq__btn').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      b.closest('.faq__item').querySelector('.faq__answer').hidden = true;
    });
    // Apri quella cliccata (se era chiusa)
    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      answer.hidden = false;
    }
  });
});

// =============================================
//  RECENSIONI — solo lettura (gestite manualmente via HTML)
// =============================================
const recShowMore = document.getElementById('rec-show-more');
const recList     = document.getElementById('recensioni-list');
const REC_LIMIT   = 3;

// Nasconde le card oltre il limite e mostra il bottone "Scopri di più"
const allCards = recList ? Array.from(recList.querySelectorAll('.rec-card')) : [];
if (allCards.length > REC_LIMIT) {
  allCards.slice(REC_LIMIT).forEach(c => { c.hidden = true; });
  if (recShowMore) recShowMore.hidden = false;
}

if (recShowMore) {
  recShowMore.addEventListener('click', () => {
    recList.querySelectorAll('.rec-card[hidden]').forEach(c => { c.hidden = false; });
    recShowMore.hidden = true;
  });
}

// =============================================
//  GUIDA TAGLIE
// =============================================
const sizeGuide      = document.getElementById('size-guide');
const sizeGuideClose = document.getElementById('size-guide-close');
const lbSizeGuideBtn = document.getElementById('lb-size-guide-btn');

lbSizeGuideBtn.addEventListener('click', () => {
  sizeGuide.hidden = false;
  sizeGuideClose.focus();
});

sizeGuideClose.addEventListener('click', () => { sizeGuide.hidden = true; });
sizeGuide.addEventListener('click', e => { if (e.target === sizeGuide) sizeGuide.hidden = true; });

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !sizeGuide.hidden) {
    sizeGuide.hidden = true;
  }
});

// =============================================
//  CARRELLO
// =============================================
const WHATSAPP_NUMBER = '393938235209';

let cart = JSON.parse(localStorage.getItem('origineresell_cart') || '[]');

const cartPanel    = document.getElementById('cart-panel');
const cartOverlay  = document.getElementById('cart-overlay');
const cartList     = document.getElementById('cart-list');
const cartTotalEl  = document.getElementById('cart-total');
const cartBadge    = document.getElementById('cart-badge');
const cartBtn      = document.getElementById('cart-btn');
const cartClose    = document.getElementById('cart-close');
const cartCheckout = document.getElementById('cart-checkout');

function saveCart() {
  localStorage.setItem('origineresell_cart', JSON.stringify(cart));
}

function openCart() {
  cartPanel.classList.add('cart-panel--open');
  cartOverlay.classList.add('cart-overlay--visible');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartPanel.classList.remove('cart-panel--open');
  cartOverlay.classList.remove('cart-overlay--visible');
  document.body.style.overflow = '';
}

function isInCart(name) {
  return cart.some(item => item.name === name);
}

function addToCart(product) {
  if (isInCart(product.name)) return;
  cart.push({ ...product });
  saveCart();
  updateCartUI();
  cartBadge.classList.add('cart-badge--bump');
  cartBadge.addEventListener('animationend', () => {
    cartBadge.classList.remove('cart-badge--bump');
  }, { once: true });
}

function removeFromCart(index) {
  const removed = cart[index];
  cart.splice(index, 1);
  saveCart();
  updateCartUI();
  // Se il lightbox è aperto sullo stesso prodotto, riabilita il bottone
  if (!lightbox.hidden && currentProduct.name === removed.name) {
    lbAddCart.disabled = false;
    lbAddCart.textContent = '+ Cart';
  }
}

function calcTotal() {
  return cart.reduce((sum, item) => {
    const n = parseFloat((item.price || '').replace(/[^\d,]/g, '').replace(',', '.'));
    return sum + (isNaN(n) ? 0 : n);
  }, 0);
}

function updateCartUI() {
  const count = cart.length;
  cartBadge.textContent = count;
  cartBadge.hidden = count === 0;
  cartCheckout.disabled = count === 0;

  cartList.innerHTML = '';
  cart.forEach((item, i) => {
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <img class="cart-item__img" src="${item.image}" alt="${item.name}">
      <div class="cart-item__info">
        <span class="cart-item__name">${item.name}</span>
        <span class="cart-item__size">${item.size}</span>
        <span class="cart-item__price">${item.price}</span>
      </div>
      <button class="cart-item__remove" aria-label="Remove from cart">&#10005;</button>
    `;
    li.querySelector('.cart-item__remove').addEventListener('click', () => removeFromCart(i));
    cartList.appendChild(li);
  });

  const total = calcTotal();
  cartTotalEl.textContent = total > 0 ? `€ ${total.toLocaleString('it-IT')}` : '€ 0';
  updateAvailability();
}

function buildWhatsAppMessage() {
  let msg = 'Hi! I would like to buy:\n\n';
  cart.forEach(item => {
    msg += `• ${item.name}\n  Size: ${item.size}\n  Price: ${item.price}\n\n`;
  });
  const total = calcTotal();
  msg += `Total: € ${total.toLocaleString('en-US')}`;
  return encodeURIComponent(msg);
}

// Bottone "+ Carrello" nel lightbox
lbAddCart.addEventListener('click', () => {
  if (isInCart(currentProduct.name)) return;
  addToCart(currentProduct);
  lbAddCart.textContent = '✓ Already in cart';
  lbAddCart.disabled = true;
});


// Bottone "Acquista ora" → WhatsApp diretto
lbBuyNow.addEventListener('click', () => {
  closeLightbox();
  const msg = encodeURIComponent(
    `Hi! I'm interested in:\n\n• ${currentProduct.name}\n  Size: ${currentProduct.size}\n  Price: ${currentProduct.price}`
  );
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank', 'noopener');
});

// Apri/chiudi carrello
cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// Checkout → WhatsApp con tutto il carrello
cartCheckout.addEventListener('click', () => {
  if (cart.length === 0) return;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMessage()}`, '_blank', 'noopener');
});

// Chiudi carrello con Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && cartPanel.classList.contains('cart-panel--open')) {
    closeCart();
  }
});

// =============================================
//  FILTRI CATALOGO
// =============================================
const activeFilters = { brand: 'tutti', size: 'tutti', stato: 'tutti' };

document.querySelectorAll('.filtri__btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const group = btn.dataset.filter;
    btn.closest('.filtri__btns').querySelectorAll('.filtri__btn').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    activeFilters[group] = btn.dataset.value;
    applyFilters();
  });
});

function applyFilters() {
  document.querySelectorAll('.product-card').forEach(card => {
    const brand = card.dataset.brand || '';
    const size  = card.dataset.euSize || '';
    const sold  = card.dataset.sold === 'true';

    const brandMatch = activeFilters.brand === 'tutti' || brand === activeFilters.brand;
    const sizeMatch  = activeFilters.size  === 'tutti' || size  === activeFilters.size;
    const statoMatch = activeFilters.stato === 'tutti' ||
      (activeFilters.stato === 'disponibile' && !sold) ||
      (activeFilters.stato === 'sold' && sold);

    card.hidden = !(brandMatch && sizeMatch && statoMatch);
  });
}


// Init
updateCartUI();
updateAvailability();

