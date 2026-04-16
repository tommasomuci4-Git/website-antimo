// =============================================
//  SUPABASE
// =============================================
const { createClient } = supabase;
const db = createClient(
  'https://nvpxouzsdaospwgwnfpt.supabase.co',
  'sb_publishable_3fg8pF_a8u0nUPTDs6g1Vw_gZvNS-YO'
);

// =============================================
//  DOM
// =============================================
const loginScreen   = document.getElementById('login-screen');
const adminPanel    = document.getElementById('admin-panel');
const loginForm     = document.getElementById('login-form');
const loginError    = document.getElementById('login-error');
const loginBtn      = document.getElementById('login-btn');
const logoutBtn     = document.getElementById('logout-btn');
const productList   = document.getElementById('product-list');
const addProductBtn = document.getElementById('add-product-btn');
const productModal  = document.getElementById('product-modal');
const productForm   = document.getElementById('product-form');
const modalClose    = document.getElementById('modal-close');
const cancelModal   = document.getElementById('cancel-modal');
const imageInput    = document.getElementById('images-input');
const imagePreview  = document.getElementById('image-preview');
const saveBtn       = document.getElementById('save-btn');

// =============================================
//  AUTH
// =============================================
db.auth.onAuthStateChange((_event, session) => {
  if (session) {
    showAdminPanel();
  } else {
    showLoginScreen();
  }
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in…';
  loginError.style.display = 'none';

  const email    = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const { error } = await db.auth.signInWithPassword({ email, password });

  if (error) {
    loginError.textContent = 'Email or password incorrect.';
    loginError.style.display = 'block';
    loginBtn.disabled = false;
    loginBtn.textContent = 'Login';
  }
});

logoutBtn.addEventListener('click', async () => {
  await db.auth.signOut();
});

function showLoginScreen() {
  loginScreen.style.display = 'flex';
  adminPanel.style.display  = 'none';
}

function showAdminPanel() {
  loginScreen.style.display = 'none';
  adminPanel.style.display  = 'block';
  loadAdminProducts();
}

// =============================================
//  LOAD PRODUCTS
// =============================================
async function loadAdminProducts() {
  productList.innerHTML = '<div class="loading-row">Loading products…</div>';

  const { data, error } = await db
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    productList.innerHTML = '<div class="loading-row">Error loading products.</div>';
    console.error(error);
    return;
  }

  if (data.length === 0) {
    productList.innerHTML = '<div class="loading-row">No products yet. Add the first one!</div>';
    return;
  }

  productList.innerHTML = '';
  data.forEach(product => productList.appendChild(renderAdminProduct(product)));
}

// =============================================
//  RENDER PRODUCT ROW
// =============================================
function renderAdminProduct(product) {
  const images     = Array.isArray(product.images) ? product.images : [];
  const firstImage = images[0] || '';

  const div = document.createElement('div');
  div.className = 'admin-product' + (product.sold ? ' admin-product--sold' : '');
  div.dataset.id = product.id;

  div.innerHTML = `
    <img class="admin-product__img" src="${firstImage}" alt="${product.name}" onerror="this.src=''">
    <div class="admin-product__info">
      <span class="admin-product__name">${product.name}</span>
      <span class="admin-product__meta">${product.brand || '—'} &nbsp;·&nbsp; ${product.price || '—'} &nbsp;·&nbsp; ${product.size || '—'}</span>
    </div>
    <div class="admin-product__actions">
      <label class="sold-toggle">
        <input type="checkbox" class="sold-checkbox" ${product.sold ? 'checked' : ''}>
        <span class="toggle-track"><span class="toggle-thumb"></span></span>
        <span class="toggle-label">${product.sold ? 'SOLD' : 'Available'}</span>
      </label>
      <button class="btn btn--danger btn-delete" style="padding:0.45rem 0.9rem;font-size:0.75rem;">Delete</button>
    </div>
  `;

  const checkbox    = div.querySelector('.sold-checkbox');
  const toggleLabel = div.querySelector('.toggle-label');

  checkbox.addEventListener('change', async () => {
    const newSold = checkbox.checked;
    toggleLabel.textContent = newSold ? 'SOLD' : 'Available';
    div.classList.toggle('admin-product--sold', newSold);

    const { error } = await db
      .from('products')
      .update({ sold: newSold })
      .eq('id', product.id);

    if (error) {
      console.error(error);
      checkbox.checked = !newSold;
      toggleLabel.textContent = !newSold ? 'SOLD' : 'Available';
      div.classList.toggle('admin-product--sold', !newSold);
      alert('Error updating product.');
    }
  });

  div.querySelector('.btn-delete').addEventListener('click', async () => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;

    const { error } = await db.from('products').delete().eq('id', product.id);
    if (error) {
      console.error(error);
      alert('Error deleting product.');
      return;
    }
    div.remove();
    if (productList.children.length === 0) {
      productList.innerHTML = '<div class="loading-row">No products yet. Add the first one!</div>';
    }
  });

  return div;
}

// =============================================
//  ADD PRODUCT MODAL
// =============================================
addProductBtn.addEventListener('click', () => {
  productForm.reset();
  imagePreview.innerHTML = '';
  productModal.style.display = 'flex';
});

modalClose.addEventListener('click', closeModal);
cancelModal.addEventListener('click', closeModal);
productModal.addEventListener('click', (e) => {
  if (e.target === productModal) closeModal();
});

function closeModal() {
  productModal.style.display = 'none';
}

// Image preview
imageInput.addEventListener('change', () => {
  imagePreview.innerHTML = '';
  Array.from(imageInput.files).forEach(file => {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.className = 'preview-img';
    imagePreview.appendChild(img);
  });
});

// Drag & drop support on upload area
const uploadArea = document.querySelector('.image-upload-area');
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.style.borderColor = '#0052ff';
});
uploadArea.addEventListener('dragleave', () => {
  uploadArea.style.borderColor = '';
});
uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.style.borderColor = '';
  imageInput.files = e.dataTransfer.files;
  imageInput.dispatchEvent(new Event('change'));
});

// =============================================
//  SAVE PRODUCT
// =============================================
productForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving…';

  const name      = document.getElementById('prod-name').value.trim();
  const brand     = document.getElementById('prod-brand').value.trim();
  const price     = document.getElementById('prod-price').value.trim();
  const size      = document.getElementById('prod-size').value.trim();
  const condition = document.getElementById('prod-condition').value;
  const category  = document.getElementById('prod-category').value.trim();
  const desc      = document.getElementById('prod-desc').value.trim();
  const files     = imageInput.files;

  if (files.length === 0) {
    alert('Please upload at least one photo.');
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Product';
    return;
  }

  // Generate a unique ID from the product name
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 50);
  const id = `${slug}-${Date.now()}`;

  try {
    // Upload images to Supabase Storage
    const imageUrls = [];
    for (const file of files) {
      const ext  = file.name.split('.').pop().toLowerCase();
      const path = `${id}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

      const { error: uploadError } = await db.storage
        .from('product-images')
        .upload(path, file, { cacheControl: '3600' });

      if (uploadError) throw uploadError;

      const { data: urlData } = db.storage
        .from('product-images')
        .getPublicUrl(path);

      imageUrls.push(urlData.publicUrl);
    }

    // Insert product into database
    const { error: insertError } = await db.from('products').insert({
      id,
      name,
      brand,
      price,
      size,
      condition,
      category,
      description: desc,
      images: imageUrls,
      sold: false
    });

    if (insertError) throw insertError;

    closeModal();
    loadAdminProducts();

  } catch (err) {
    console.error(err);
    alert('Error saving product: ' + err.message);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Product';
  }
});
