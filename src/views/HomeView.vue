<template>
  <div class="container container-narrow">
    <div class="glass p-4 p-md-5 hero">

      <div class="hero-overlay"></div>

      <div class="row align-items-center g-4 position-relative">
        <div class="col-12 col-lg-7">
          <div class="hero-pill mb-3">Handcrafted cookies and cheesecakes</div>
          
          <h1 class="mb-3 hero-title">
            A boutique pastry experience,
            made to look irresistible.
          </h1>
          
          <p class="text-white-50 mb-4" style="max-width: 54ch">
            Bright flavors, soft textures, and a curated menu designed for gifting, sharing, and indulgence.
          </p>

          <div class="d-flex flex-wrap gap-2">
            <router-link to="/products" class="btn btn-accent">Explore Products</router-link>
            <router-link to="/register" class="btn btn-ghost">Create account</router-link>
          </div>
        </div>

        <div class="col-12 col-lg-5">
          <div class="hero-card">
            <div class="hero-art"></div>
            <div class="hero-card-body">
              <div class="fw-semibold">Today’s mood</div>
              <div class="text-white-50">Strawberry glaze, caramel warmth, blueberry notes</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-3 mt-3">
      <div class="col-12 col-md-4">
        <div class="glass p-4 h-100">
          <div class="fw-semibold mb-1">Premium ingredients</div>
          <div class="text-white-50">Balanced sweetness, clean finish, elegant textures.</div>
        </div>
      </div>
      <div class="col-12 col-md-4">
        <div class="glass p-4 h-100">
          <div class="fw-semibold mb-1">Curated selection</div>
          <div class="text-white-50">Cookies and cheesecakes that feel boutique.</div>
        </div>
      </div>
      <div class="col-12 col-md-4">
        <div class="glass p-4 h-100">
          <div class="fw-semibold mb-1">Designed for gifting</div>
          <div class="text-white-50">Packaging worthy visuals, even before checkout.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* HERO BOX: Set to relative so absolute overlays stay inside it */
.hero{
  position: relative;
  overflow: hidden;
}

/* GRADIENT BLOBS: Uses radial gradients to create soft, colorful spots */
.hero-overlay{
  position: absolute;
  inset: 0;
  background:
    radial-gradient(700px 420px at 18% 30%, rgba(255,79,135,0.18), transparent 60%),
    radial-gradient(800px 460px at 82% 60%, rgba(255,184,74,0.18), transparent 62%),
    radial-gradient(700px 420px at 60% 120%, rgba(106,92,255,0.12), transparent 60%);
  pointer-events: none; /* Allows clicks to pass through to buttons underneath */
}

/* TOP-RIGHT GLOW: An extra decorative element using :before */
.hero:before{
  content: "";
  position: absolute;
  inset: -120px -120px auto auto;
  width: 340px;
  height: 340px;
  background: radial-gradient(circle, rgba(255,79,135,0.28), transparent 60%);
  filter: blur(10px);
  pointer-events: none;
}

/* TYPOGRAPHY: Ultra-bold weight for a modern look */
.hero-title{
  font-weight: 850;
  line-height: 1.05;
  letter-spacing: -0.2px;
}

/* PILL: Stylized tag for secondary branding */
.hero-pill{
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255,79,135,0.10);
  border: 1px solid rgba(255,79,135,0.18);
  font-weight: 700;
}

/* DECORATIVE CARD: A "scrapbook" style card used as a visual placeholder */
.hero-card{
  border-radius: 22px;
  overflow: hidden;
  background: rgba(255,255,255,0.80);
  border: 1px solid rgba(36,27,24,0.10);
  box-shadow: 0 18px 44px rgba(36,27,24,0.12);
  transform: rotate(1deg); /* The 1-degree tilt adds a handcrafted feel */
}

/* CSS ART: Creates an abstract "pastry" look using only code */
.hero-art{
  height: 220px;
  background:
    radial-gradient(220px 160px at 30% 40%, rgba(255,79,135,0.40), transparent 60%),
    radial-gradient(260px 180px at 70% 50%, rgba(255,184,74,0.40), transparent 62%),
    radial-gradient(260px 180px at 55% 110%, rgba(106,92,255,0.24), transparent 62%),
    linear-gradient(180deg, rgba(255,255,255,0.0), rgba(255,255,255,0.55));
}

.hero-card-body{
  padding: 14px 16px;
}
</style>