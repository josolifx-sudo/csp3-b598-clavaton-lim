<template>
  <div class="container container-narrow">
    <div class="admin-hero glass p-4 mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-end gap-3">
        <div>
          <div class="kicker">Admin console</div>
          <h2 class="mb-1">Admin Products</h2>
          <div class="text-white-50">
            Manage products, toggle availability, and update details.
          </div>
        </div>

        <div class="controls">
          <div class="control">
            <div class="control-label">Filter</div>
            <select class="form-select input-soft" v-model="statusFilter">
              <option value="all">All</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
          </div>

          <div class="control">
            <div class="control-label">Search</div>
            <input
              class="form-control input-soft"
              v-model.trim="q"
              placeholder="Search by name or description"
            />
          </div>

          <button class="btn btn-add" type="button" @click="openAdd">
            <span class="btn-add-icon">＋</span>
            <span>Add Product</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="glass p-4 text-white-50">
      Loading products...
    </div>

    <div v-else>
      <div v-if="filtered.length === 0" class="glass p-4 text-white-50">
        No products found.
      </div>

      <div v-else class="row g-3">
        <div v-for="p in filtered" :key="p._id" class="col-12 col-sm-6 col-lg-4">
          <div class="card card-premium h-100 overflow-hidden admin-card">
            <div class="thumb">
              <img
                v-if="p.imageUrl"
                :src="p.imageUrl"
                :alt="p.name"
                class="thumb-img"
                loading="lazy"
              />
              <div v-else class="thumb-placeholder">
                <div class="placeholder-text">Atelier</div>
              </div>

              <span class="status-pill" :class="p.isActive ? 'pill-active' : 'pill-inactive'">
                {{ p.isActive ? "Active" : "Inactive" }}
              </span>
            </div>

            <div class="p-3 d-flex flex-column h-100">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="badge-soft text-capitalize">
                  {{ p.category || "Signature" }}
                </span>
                <div class="fw-semibold">₱ {{ formatPrice(p.price) }}</div>
              </div>

              <h5 class="mb-2">{{ p.name }}</h5>

              <p class="mb-3 text-white-50 clamp">
                {{ p.description }}
              </p>

              <div class="mt-auto d-grid gap-2">
                <button class="btn btn-ghost w-100" type="button" @click="openEdit(p)">
                  Edit
                </button>

                <button
                  class="btn w-100"
                  type="button"
                  :class="p.isActive ? 'btn-outline-danger' : 'btn-accent'"
                  @click="toggleStatus(p)"
                  :disabled="busyId === p._id"
                >
                  {{ busyId === p._id ? "Working..." : (p.isActive ? "Disable" : "Activate") }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <div v-if="addOpen" class="modal-backdrop-custom" @click.self="closeAdd">
      <div class="modal-card modal-themed glass">
        <div class="modal-top">
          <div>
            <div class="modal-kicker">Create product</div>
            <h5 class="mb-1">Add Product</h5>
            <div class="text-white-50">Make it look as good as it tastes.</div>
          </div>

          <button class="btn btn-close-soft" type="button" @click="closeAdd" aria-label="Close">
            ✕
          </button>
        </div>

        <div class="modal-body-grid">
          <div class="left">
            <div class="field">
              <label class="field-label">Name</label>
              <input v-model.trim="addForm.name" class="form-control input-soft" placeholder="e.g. Matcha Cookie" />
            </div>

            <div class="two-col">
              <div class="field">
                <label class="field-label">Price</label>
                <input v-model.number="addForm.price" type="number" class="form-control input-soft" placeholder="e.g. 199" />
              </div>

              <div class="field">
                <label class="field-label">Category</label>
                <select v-model="addForm.category" class="form-select input-soft">
                  <option value="cookie">Cookie</option>
                  <option value="cheesecake">Cheesecake</option>
                </select>
              </div>
            </div>

            <div class="field">
              <label class="field-label">Image URL</label>
              <input v-model.trim="addForm.imageUrl" class="form-control input-soft" placeholder="https://..." />
              <div class="field-help">Tip: use a direct image link ending in .jpg or .png for best results.</div>
            </div>

            <div class="field">
              <label class="field-label">Description</label>
              <textarea
                v-model.trim="addForm.description"
                class="form-control input-soft textarea-soft"
                rows="4"
                placeholder="Short, enticing description"
              />
            </div>
          </div>

          <div class="right">
            <div class="preview-card">
              <div class="preview-title">Live preview</div>

              <div class="preview-box">
                <img
                  v-if="addForm.imageUrl"
                  :src="addForm.imageUrl"
                  alt="Preview"
                  class="preview-img"
                />
                <div v-else class="preview-empty">
                  <div class="preview-empty-title">No image yet</div>
                  <div class="preview-empty-sub">Paste an image URL to preview</div>
                </div>
              </div>

              <div class="preview-meta">
                <div class="preview-name">{{ addForm.name || "Product name" }}</div>
                <div class="preview-price">₱ {{ formatPrice(addForm.price || 0) }}</div>
              </div>

              <div class="preview-desc">
                {{ addForm.description || "Description preview will show here." }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="formError" class="alert alert-danger py-2 mb-3">
          {{ formError }}
        </div>

        <div class="modal-actions">
          <button class="btn btn-ghost" type="button" @click="closeAdd" :disabled="saving">
            Cancel
          </button>
          <button class="btn btn-save" type="button" @click="saveAdd" :disabled="saving">
            {{ saving ? "Saving..." : "Save Product" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="editOpen" class="modal-backdrop-custom" @click.self="closeEdit">
      <div class="modal-card modal-themed glass">
        <div class="modal-top">
          <div>
            <div class="modal-kicker">Update product</div>
            <h5 class="mb-1">Edit Product</h5>
            <div class="text-white-50">Polish the details and save.</div>
          </div>

          <button class="btn btn-close-soft" type="button" @click="closeEdit" aria-label="Close">
            ✕
          </button>
        </div>

        <div class="modal-body-grid">
          <div class="left">
            <div class="field">
              <label class="field-label">Name</label>
              <input v-model.trim="editForm.name" class="form-control input-soft" />
            </div>

            <div class="two-col">
              <div class="field">
                <label class="field-label">Price</label>
                <input v-model.number="editForm.price" type="number" class="form-control input-soft" />
              </div>

              <div class="field">
                <label class="field-label">Category</label>
                <select v-model="editForm.category" class="form-select input-soft">
                  <option value="cookie">Cookie</option>
                  <option value="cheesecake">Cheesecake</option>
                </select>
              </div>
            </div>

            <div class="field">
              <label class="field-label">Image URL</label>
              <input v-model.trim="editForm.imageUrl" class="form-control input-soft" placeholder="https://..." />
            </div>

            <div class="field">
              <label class="field-label">Description</label>
              <textarea v-model.trim="editForm.description" class="form-control input-soft textarea-soft" rows="4" />
            </div>
          </div>

          <div class="right">
            <div class="preview-card">
              <div class="preview-title">Live preview</div>

              <div class="preview-box">
                <img
                  v-if="editForm.imageUrl"
                  :src="editForm.imageUrl"
                  alt="Preview"
                  class="preview-img"
                />
                <div v-else class="preview-empty">
                  <div class="preview-empty-title">No image yet</div>
                  <div class="preview-empty-sub">Paste an image URL to preview</div>
                </div>
              </div>

              <div class="preview-meta">
                <div class="preview-name">{{ editForm.name || "Product name" }}</div>
                <div class="preview-price">₱ {{ formatPrice(editForm.price || 0) }}</div>
              </div>

              <div class="preview-desc">
                {{ editForm.description || "Description preview will show here." }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="formError" class="alert alert-danger py-2 mb-3">
          {{ formError }}
        </div>

        <div class="modal-actions">
          <button class="btn btn-ghost" type="button" @click="closeEdit" :disabled="saving">
            Cancel
          </button>
          <button class="btn btn-save" type="button" @click="saveEdit" :disabled="saving">
            {{ saving ? "Saving..." : "Save Changes" }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useProductsStore } from "../stores/products";

const products = useProductsStore();

const loading = ref(false);
const q = ref("");
const statusFilter = ref("all");

const addOpen = ref(false);
const editOpen = ref(false);

const saving = ref(false);
const formError = ref("");
const busyId = ref("");

const addForm = ref({
  name: "",
  description: "",
  price: 0,
  category: "cookie",
  imageUrl: ""
});

const editId = ref("");
const editForm = ref({
  name: "",
  description: "",
  price: 0,
  category: "cookie",
  imageUrl: ""
});

onMounted(async () => {
  await refresh();
});

const filtered = computed(() => {
  const query = (q.value || "").toLowerCase().trim();

  let list = Array.isArray(products.all) ? products.all : [];

  if (statusFilter.value === "active") list = list.filter((p) => p.isActive);
  if (statusFilter.value === "inactive") list = list.filter((p) => !p.isActive);

  if (!query) return list;

  return list.filter((p) => {
    const name = (p.name || "").toLowerCase();
    const desc = (p.description || "").toLowerCase();
    return name.includes(query) || desc.includes(query);
  });
});

async function refresh() {
  loading.value = true;
  try {
    await products.fetchAllAdmin();
  } finally {
    loading.value = false;
  }
}

function formatPrice(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return n.toFixed(2);
}

function openAdd() {
  formError.value = "";
  addForm.value = {
    name: "",
    description: "",
    price: 0,
    category: "cookie",
    imageUrl: ""
  };
  addOpen.value = true;
}

function closeAdd() {
  addOpen.value = false;
}

function openEdit(p) {
  formError.value = "";
  editId.value = p._id;

  editForm.value = {
    name: p.name || "",
    description: p.description || "",
    price: Number(p.price || 0),
    category: p.category || "cookie",
    imageUrl: p.imageUrl || ""
  };

  editOpen.value = true;
}

function closeEdit() {
  editOpen.value = false;
  editId.value = "";
}

function validateForm(f) {
  if (!f.name?.trim()) return "Name is required.";
  if (!f.description?.trim()) return "Description is required.";
  if (Number(f.price) <= 0) return "Price must be greater than 0.";
  if (f.imageUrl && !/^https?:\/\//i.test(f.imageUrl.trim())) return "Image URL must start with http or https.";
  return "";
}

async function saveAdd() {
  formError.value = validateForm(addForm.value);
  if (formError.value) return;

  saving.value = true;
  try {
    await products.addProduct(addForm.value);
    await refresh();
    addOpen.value = false;
  } catch (e) {
    formError.value =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      "Failed to add product.";
  } finally {
    saving.value = false;
  }
}

async function saveEdit() {
  formError.value = validateForm(editForm.value);
  if (formError.value) return;

  saving.value = true;
  try {
    await products.updateProduct(editId.value, editForm.value);
    await refresh();
    editOpen.value = false;
  } catch (e) {
    formError.value =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      "Failed to update product.";
  } finally {
    saving.value = false;
  }
}

async function toggleStatus(p) {
  busyId.value = p._id;
  try {
    if (p.isActive) await products.archiveProduct(p._id);
    else await products.activateProduct(p._id);

    await refresh();
  } finally {
    busyId.value = "";
  }
}
</script>

<style scoped>
.kicker{
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.65;
  margin-bottom: 6px;
}

.admin-hero{
  border-radius: 22px;
  position: relative;
  overflow: hidden;
}

.admin-hero::before{
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(600px 260px at 18% 10%, rgba(255, 108, 153, 0.22), transparent 60%),
    radial-gradient(520px 260px at 85% 0%, rgba(255, 197, 113, 0.20), transparent 55%),
    linear-gradient(180deg, rgba(255,255,255,0.58), rgba(255,255,255,0.30));
  pointer-events: none;
}

.admin-hero > *{
  position: relative;
}

.controls{
  display: grid;
  grid-template-columns: 180px 320px auto;
  gap: 12px;
  align-items: end;
}

@media (max-width: 992px){
  .controls{
    grid-template-columns: 1fr;
  }
}

.control-label{
  font-size: 11px;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  opacity: 0.70;
  margin-bottom: 8px;
}

.input-soft{
  border-radius: 14px;
  border: 1px solid rgba(36,27,24,0.10);
  background: rgba(255,255,255,0.80);
  box-shadow: 0 10px 22px rgba(36,27,24,0.06);
}

.input-soft{
  border-radius: 16px;
  border: 1px solid rgba(36,27,24,0.12);
  background:
    linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.78));
  box-shadow:
    0 18px 44px rgba(36,27,24,0.10),
    inset 0 1px 0 rgba(255,255,255,0.80);
  transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
}

.input-soft:hover{
  transform: translateY(-1px);
  box-shadow:
    0 22px 60px rgba(36,27,24,0.12),
    inset 0 1px 0 rgba(255,255,255,0.85);
}

.input-soft:focus{
  border-color: rgba(255, 108, 153, 0.55);
  box-shadow:
    0 0 0 0.22rem rgba(255, 108, 153, 0.18),
    0 22px 60px rgba(36,27,24,0.12),
    inset 0 1px 0 rgba(255,255,255,0.85);
}

.btn-add{
  border-radius: 16px;
  padding: 10px 14px;
  border: 1px solid rgba(36,27,24,0.12);
  background:
    linear-gradient(135deg, rgba(255, 108, 153, 0.92), rgba(255, 197, 113, 0.92));
  color: rgba(20, 12, 10, 0.92);
  font-weight: 800;
  box-shadow: 0 18px 40px rgba(36,27,24,0.12);
  display: inline-flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  transition: transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease;
  white-space: nowrap;
}

.btn-add:hover{
  transform: translateY(-1px);
  filter: brightness(1.02);
  box-shadow: 0 24px 60px rgba(36,27,24,0.16);
  color: rgba(20, 12, 10, 0.92);
}

.btn-add:active{
  transform: translateY(0px);
}

.btn-add-icon{
  width: 28px;
  height: 28px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: rgba(255,255,255,0.70);
  border: 1px solid rgba(36,27,24,0.10);
  box-shadow: 0 10px 22px rgba(36,27,24,0.06);
  font-size: 18px;
  line-height: 1;
}

.admin-card{
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.admin-card:hover{
  transform: translateY(-6px);
  box-shadow: 0 22px 50px rgba(36,27,24,0.14);
}

.thumb{
  height: 180px;
  overflow: hidden;
  border-bottom: 1px solid rgba(36,27,24,0.08);
  position: relative;
}

.thumb-img{
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.02);
  transition: transform 0.35s ease;
}

.admin-card:hover .thumb-img{
  transform: scale(1.06);
}

.thumb-placeholder{
  height: 100%;
  display: grid;
  place-items: center;
  background:
    radial-gradient(420px 200px at 30% 10%, rgba(255,79,135,0.25), transparent 60%),
    radial-gradient(420px 200px at 70% 0%, rgba(255,184,74,0.22), transparent 60%),
    linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.65));
}

.placeholder-text{
  font-weight: 800;
  letter-spacing: 1.2px;
  opacity: 0.75;
}

.status-pill{
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid rgba(36,27,24,0.10);
  background: rgba(255,255,255,0.8);
}

.pill-inactive{
  opacity: 0.85;
}

.clamp{
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Modal */
.modal-backdrop-custom{
  position: fixed;
  inset: 0;
  background: rgba(14, 10, 9, 0.35);
  backdrop-filter: blur(10px);
  display: grid;
  place-items: center;
  z-index: 9999;
  padding: 16px;
}

.modal-themed{
  border-radius: 24px;
  box-shadow: 0 40px 110px rgba(36,27,24,0.22);
  overflow: hidden;
  position: relative;
}

.modal-themed::before{
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(620px 300px at 20% 0%, rgba(255, 108, 153, 0.20), transparent 60%),
    radial-gradient(620px 300px at 95% 10%, rgba(255, 197, 113, 0.18), transparent 60%),
    linear-gradient(180deg, rgba(255,255,255,0.68), rgba(255,255,255,0.40));
  pointer-events: none;
}

.modal-themed > *{
  position: relative;
}

.modal-card{
  width: min(920px, 100%);
  padding: 18px 18px 16px;
  animation: popIn 140ms ease-out;
}

@keyframes popIn {
  from { transform: translateY(8px) scale(0.985); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

.modal-top{
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.modal-kicker{
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.65;
  margin-bottom: 4px;
}

.btn-close-soft{
  width: 38px;
  height: 38px;
  border-radius: 14px;
  border: 1px solid rgba(36,27,24,0.12);
  background: rgba(255,255,255,0.70);
  box-shadow: 0 10px 22px rgba(36,27,24,0.08);
}

.modal-body-grid{
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 14px;
}

@media (max-width: 992px){
  .modal-body-grid{
    grid-template-columns: 1fr;
  }
}

.field{
  margin-bottom: 12px;
}

.field-label{
  font-size: 12px;
  opacity: 0.70;
  margin-bottom: 6px;
}

.field-help{
  font-size: 12px;
  opacity: 0.60;
  margin-top: 6px;
}

.two-col{
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

@media (max-width: 520px){
  .two-col{
    grid-template-columns: 1fr;
  }
}

.textarea-soft{
  resize: none;
}

.preview-card{
  border-radius: 22px;
  border: 1px solid rgba(36,27,24,0.12);
  background:
    linear-gradient(180deg, rgba(255,255,255,0.86), rgba(255,255,255,0.72));
  padding: 14px;
  box-shadow:
    0 22px 70px rgba(36,27,24,0.14),
    inset 0 1px 0 rgba(255,255,255,0.75);
}

.preview-title{
  font-size: 12px;
  opacity: 0.70;
  margin-bottom: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.preview-box{
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(36,27,24,0.12);
  background:
    radial-gradient(520px 240px at 20% 0%, rgba(255, 108, 153, 0.10), transparent 60%),
    radial-gradient(520px 240px at 90% 10%, rgba(255, 197, 113, 0.10), transparent 60%),
    linear-gradient(180deg, rgba(255,255,255,0.72), rgba(255,255,255,0.58));
  height: 210px;
  display: grid;
  place-items: center;
}

.preview-img{
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.preview-empty{
  text-align: center;
  padding: 14px;
  opacity: 0.75;
}

.preview-empty-title{
  font-weight: 800;
  margin-bottom: 4px;
}

.preview-empty-sub{
  font-size: 12px;
  opacity: 0.7;
}

.preview-meta{
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
  margin-top: 12px;
}

.preview-name{
  font-weight: 800;
}

.preview-price{
  font-weight: 800;
}

.preview-desc{
  margin-top: 10px;
  font-size: 13px;
  opacity: 0.78;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.modal-actions{
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
}

.btn-save{
  border-radius: 16px;
  padding: 10px 14px;
  border: 1px solid rgba(36,27,24,0.12);
  background:
    linear-gradient(135deg, rgba(255, 108, 153, 0.92), rgba(255, 197, 113, 0.92));
  color: rgba(20, 12, 10, 0.92);
  font-weight: 900;
  box-shadow: 0 18px 44px rgba(36,27,24,0.12);
}

.btn-save:hover{
  filter: brightness(1.02);
  color: rgba(20, 12, 10, 0.92);
}

.modal-actions .btn-ghost{
  border-radius: 16px;
  padding: 10px 14px;
  border: 1px solid rgba(36,27,24,0.12);
  background: rgba(255,255,255,0.70);
  box-shadow: 0 12px 28px rgba(36,27,24,0.10);
}

.modal-actions .btn-ghost:hover{
  filter: brightness(1.01);
  box-shadow: 0 18px 44px rgba(36,27,24,0.12);
}
</style>