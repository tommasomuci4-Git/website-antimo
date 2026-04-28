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
//  SIZES HELPERS
// =============================================
function parseSizes(sizeField) {
  if (!sizeField) return [];
  try {
    const parsed = JSON.parse(sizeField);
    return Array.isArray(parsed) ? parsed : [sizeField];
  } catch {
    return [sizeField];
  }
}

function buildSizeTags(container, sizes, onRemove) {
  container.innerHTML = '';
  sizes.forEach((s, i) => {
    const tag = document.createElement('span');
    tag.style.cssText = 'background:#0052ff22;border:1px solid #0052ff66;border-radius:4px;padding:0.2rem 0.5rem;font-size:0.75rem;display:flex;align-items:center;gap:0.3rem;';
    tag.innerHTML = `${s} <button type="button" style="background:none;border:none;color:#e57373;cursor:pointer;font-size:0.8rem;padding:0;line-height:1;">✕</button>`;
    tag.querySelector('button').addEventListener('click', () => { onRemove(i); });
    container.appendChild(tag);
  });
}

function setupSizeInput(inputEl, tagsContainer, sizesArray) {
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = inputEl.value.trim();
      if (val && !sizesArray.includes(val)) {
        sizesArray.push(val);
        buildSizeTags(tagsContainer, sizesArray, (i) => {
          sizesArray.splice(i, 1);
          buildSizeTags(tagsContainer, sizesArray, arguments.callee);
        });
      }
      inputEl.value = '';
    }
  });
}

// =============================================
//  RENDER PRODUCT ROW
// =============================================
function renderAdminProduct(product) {
  const images     = Array.isArray(product.images) ? product.images : [];
  const firstImage = images[0] || '';
  const sizes      = parseSizes(product.size);
  const sizeLabel  = sizes.join(', ') || '—';

  const div = document.createElement('div');
  div.className = 'admin-product' + (product.sold ? ' admin-product--sold' : '');
  div.dataset.id = product.id;

  div.innerHTML = `
    <img class="admin-product__img" src="${firstImage}" alt="${product.name}" onerror="this.src=''">
    <div class="admin-product__info">
      <span class="admin-product__name">${product.name}</span>
      <span class="admin-product__meta">${product.brand || '—'} &nbsp;·&nbsp; ${product.price || '—'} &nbsp;·&nbsp; ${sizeLabel}</span>
    </div>
    <div class="admin-product__actions">
      <label class="sold-toggle">
        <input type="checkbox" class="new-checkbox" ${product.is_new ? 'checked' : ''}>
        <span class="toggle-track new-track"><span class="toggle-thumb"></span></span>
        <span class="toggle-label new-label">${product.is_new ? 'NEW' : 'Standard'}</span>
      </label>
      <label class="sold-toggle">
        <input type="checkbox" class="sold-checkbox" ${product.sold ? 'checked' : ''}>
        <span class="toggle-track"><span class="toggle-thumb"></span></span>
        <span class="toggle-label">${product.sold ? 'SOLD' : 'Available'}</span>
      </label>
      <button class="btn btn--ghost btn-edit" style="padding:0.45rem 0.9rem;font-size:0.75rem;">Edit</button>
      <button class="btn btn--danger btn-delete" style="padding:0.45rem 0.9rem;font-size:0.75rem;">Delete</button>
    </div>
  `;

  const newCheckbox  = div.querySelector('.new-checkbox');
  const newLabel     = div.querySelector('.new-label');
  const newTrack     = div.querySelector('.new-track');

  newCheckbox.addEventListener('change', async () => {
    const val = newCheckbox.checked;
    newLabel.textContent = val ? 'NEW' : 'Standard';
    newTrack.style.background = val ? '#0052ff' : '';
    const { error } = await db.from('products').update({ is_new: val }).eq('id', product.id);
    if (error) {
      console.error(error);
      newCheckbox.checked = !val;
      newLabel.textContent = !val ? 'NEW' : 'Standard';
      newTrack.style.background = !val ? '#0052ff' : '';
      alert('Error updating product.');
    }
  });

  const checkbox    = div.querySelector('.sold-checkbox');
  const toggleLabel = div.querySelector('.toggle-label');

  checkbox.addEventListener('change', async () => {
    const newSold = checkbox.checked;
    toggleLabel.textContent = newSold ? 'SOLD' : 'Available';
    div.classList.toggle('admin-product--sold', newSold);
    const { error } = await db.from('products').update({ sold: newSold }).eq('id', product.id);
    if (error) {
      console.error(error);
      checkbox.checked = !newSold;
      toggleLabel.textContent = !newSold ? 'SOLD' : 'Available';
      div.classList.toggle('admin-product--sold', !newSold);
      alert('Error updating product.');
    }
  });

  div.querySelector('.btn-edit').addEventListener('click', () => openEditModal(product, div));

  div.querySelector('.btn-delete').addEventListener('click', async () => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    const { error } = await db.from('products').delete().eq('id', product.id);
    if (error) { console.error(error); alert('Error deleting product.'); return; }
    div.remove();
    if (productList.children.length === 0) {
      productList.innerHTML = '<div class="loading-row">No products yet. Add the first one!</div>';
    }
  });

  return div;
}

// =============================================
//  EDIT MODAL
// =============================================
const editModal      = document.getElementById('edit-modal');
const editForm       = document.getElementById('edit-form');
const editModalClose = document.getElementById('edit-modal-close');
const editCancel     = document.getElementById('edit-cancel');
const editSaveBtn    = document.getElementById('edit-save-btn');
const editSizeInput  = document.getElementById('edit-sizes-input');
const editSizesTags  = document.getElementById('edit-sizes-tags');
const editCurrentPhotos = document.getElementById('edit-current-photos');
const editImagesInput   = document.getElementById('edit-images-input');
const editNewPreview    = document.getElementById('edit-new-preview');

let editSizes = [];
let editPhotosToKeep = [];

function renderEditCurrentPhotos() {
  editCurrentPhotos.innerHTML = '';
  editPhotosToKeep.forEach((url, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'edit-photo-wrap';
    wrap.innerHTML = `<img src="${url}" alt="foto ${i+1}"><button type="button">✕</button>`;
    wrap.querySelector('button').addEventListener('click', () => {
      editPhotosToKeep.splice(i, 1);
      renderEditCurrentPhotos();
    });
    editCurrentPhotos.appendChild(wrap);
  });
}

editImagesInput.addEventListener('change', () => {
  editNewPreview.innerHTML = '';
  Array.from(editImagesInput.files).forEach(file => {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.className = 'preview-img';
    editNewPreview.appendChild(img);
  });
});

function openEditModal(product, rowEl) {
  document.getElementById('edit-id').value    = product.id;
  document.getElementById('edit-name').value  = product.name  || '';
  document.getElementById('edit-price').value = product.price || '';
  document.getElementById('edit-brand').value = product.brand || '';

  editSizes = parseSizes(product.size);
  rebuildEditTags();

  editPhotosToKeep = Array.isArray(product.images) ? [...product.images] : [];
  renderEditCurrentPhotos();
  editImagesInput.value = '';
  editNewPreview.innerHTML = '';

  editModal.style.display = 'flex';
  editModal._rowEl = rowEl;
  editModal._product = product;
}

function rebuildEditTags() {
  buildSizeTags(editSizesTags, editSizes, (i) => {
    editSizes.splice(i, 1);
    rebuildEditTags();
  });
}

editSizeInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const val = editSizeInput.value.trim();
    if (val && !editSizes.includes(val)) {
      editSizes.push(val);
      rebuildEditTags();
    }
    editSizeInput.value = '';
  }
});

editModalClose.addEventListener('click', () => { editModal.style.display = 'none'; });
editCancel.addEventListener('click',     () => { editModal.style.display = 'none'; });
editModal.addEventListener('click', (e) => { if (e.target === editModal) editModal.style.display = 'none'; });

editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  editSaveBtn.disabled = true;
  editSaveBtn.textContent = 'Saving…';

  const id      = document.getElementById('edit-id').value;
  const name    = document.getElementById('edit-name').value.trim();
  const price   = document.getElementById('edit-price').value.trim();
  const brand   = document.getElementById('edit-brand').value.trim();
  const sizeVal = editSizes.length === 1 ? editSizes[0] : JSON.stringify(editSizes);

  try {
    const newFiles = Array.from(editImagesInput.files);
    const newUrls  = [];

    for (const file of newFiles) {
      const ext  = file.name.split('.').pop().toLowerCase();
      const path = `${id}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const { error: uploadError } = await db.storage
        .from('product-images')
        .upload(path, file, { cacheControl: '3600' });
      if (uploadError) throw uploadError;
      const { data: urlData } = db.storage.from('product-images').getPublicUrl(path);
      newUrls.push(urlData.publicUrl);
    }

    const images = [...editPhotosToKeep, ...newUrls];

    const { error } = await db
      .from('products')
      .update({ name, price, brand, size: sizeVal, images })
      .eq('id', id);

    if (error) throw error;

    editModal.style.display = 'none';
    const row = editModal._rowEl;
    row.querySelector('.admin-product__img').src = images[0] || '';
    row.querySelector('.admin-product__name').textContent = name;
    row.querySelector('.admin-product__meta').textContent =
      `${brand || '—'} · ${price || '—'} · ${editSizes.join(', ') || '—'}`;
    editModal._product = { ...editModal._product, name, price, brand, size: sizeVal, images };

  } catch (err) {
    console.error(err);
    alert('Error saving changes: ' + err.message);
  }

  editSaveBtn.disabled = false;
  editSaveBtn.textContent = 'Save changes';
});

// =============================================
//  ADD PRODUCT MODAL — multi-size
// =============================================
const addSizeInput = document.getElementById('prod-size');
const addSizesTags = document.getElementById('add-sizes-tags');
let addSizes = [];

function rebuildAddTags() {
  buildSizeTags(addSizesTags, addSizes, (i) => {
    addSizes.splice(i, 1);
    rebuildAddTags();
  });
}

addSizeInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const val = addSizeInput.value.trim();
    if (val && !addSizes.includes(val)) {
      addSizes.push(val);
      rebuildAddTags();
    }
    addSizeInput.value = '';
  }
});

addProductBtn.addEventListener('click', () => {
  productForm.reset();
  imagePreview.innerHTML = '';
  addSizes = [];
  rebuildAddTags();
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
  const lastTyped = addSizeInput.value.trim();
  if (lastTyped && !addSizes.includes(lastTyped)) addSizes.push(lastTyped);
  const size      = addSizes.length === 1 ? addSizes[0] : addSizes.length > 1 ? JSON.stringify(addSizes) : '';
  const condition = document.getElementById('prod-condition').value;
  const category  = document.getElementById('prod-category').value.trim();
  const desc      = document.getElementById('prod-desc').value.trim();
  const isNew     = document.getElementById('prod-is-new').checked;
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
      sold: false,
      is_new: isNew
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
