## Product Dashboard — Frontend for Spring Boot E-commerce API

A modern, responsive React frontend with top-tab navigation, an emerald commerce palette, and a table/list-first catalog. Connects to your Spring Boot API at `/api` via a Vite dev proxy.

### Design system

- **Palette (emerald commerce):** emerald primary, warm neutral surfaces, slate text, amber/red for low-stock and destructive actions. Full light + dark mode via HSL tokens in `index.css`.
- **Typography:** Inter (system fallback), tight headings, comfortable body line-height.
- **Components:** shadcn/ui (Button, Input, Table, Dialog, Badge, Card, Tabs, Toast/Sonner, Select, Switch, Calendar/Popover for date picker).
- **Feedback:** Sonner toasts for success/error, skeleton loaders, empty states with illustrations, confirmation dialogs for destructive actions.

### Layout

- **Top nav bar (sticky):** "Product Dashboard" wordmark on the left, global search input in the center (debounced, hits `/api/products/search`), theme toggle (light/dark) on the right.
- **Top tab navigation** under the nav: All Products · Add Product · Inventory. Active tab styled with emerald underline + bold label. Collapses to a horizontal scrollable tab strip on mobile.
- **Main content area:** centered max-width container, generous padding, responsive across mobile/tablet/desktop.

### Routes

```text
/                    → redirects to /products
/products            → All Products (table/list)
/products/add        → Add Product form
/products/:id        → Product Details
/products/:id/edit   → Edit Product form
/inventory           → Inventory / Manage Products (admin table)
*                    → NotFound
```

### Screens

**1. All Products (`/products`)** — default landing
- Table/list layout with columns: thumbnail, name, brand, category (chip), price, availability badge, quantity, release date, actions (View / Edit / Delete).
- Controls row above table: category filter dropdown, availability filter (All/Available/Out of stock), sort dropdown (price asc/desc, date newest/oldest, name A–Z, brand A–Z).
- Global search in the top nav drives this list (calls `/api/products/search?keyword=...`, debounced 300ms; falls back to `/api/products` when empty).
- States: skeleton rows while loading, empty state ("No products found") with CTA to Add Product.
- Row actions: View (navigate to details), Edit (navigate to edit), Delete (opens confirmation dialog, calls `DELETE /api/product/{id}`, optimistic UI removal + success toast).

**2. Product Details (`/products/:id`)**
- Two-column responsive layout: large product image on the left (from `/api/product/{id}/image`), info panel on the right.
- Right panel: name (h1), brand + category chips, price (large), availability badge, stock quantity, release date (formatted dd MMM yyyy), full description paragraph, small "Image info" subsection (imageName, imageType).
- Action buttons: "Edit this product", "Delete product" (with confirmation dialog → on success, navigate back to /products with toast).
- Loading skeleton, 404 state if product not found.

**3. Add Product (`/products/add`)**
- Card-wrapped form with sections: Basic info (name, brand, category, description), Pricing & stock (price, quantity, availability switch), Release date (shadcn date picker, sent as `dd-MM-yyyy`), Image upload (file input, accept `image/*`, live preview thumbnail with remove button).
- Client-side validation with zod + react-hook-form: required fields (name, brand, price, category, quantity, image), price ≥ 0, quantity ≥ 0, max lengths on text fields.
- Submit builds `FormData` with `product` (Blob of JSON, `application/json`) and `imageFile` parts → `POST /api/product`.
- On success: success toast + navigate to new product's detail page. On error: error toast with backend message if available.

**4. Edit Product (`/products/:id/edit`)**
- Pre-loads via `GET /api/product/{id}`, hydrates the same form component used by Add.
- Shows current image with option to replace (new file shows preview; "Keep current image" if untouched).
- Submit `PUT /api/product/{id}` with `FormData`. Image part is always included — if user didn't pick a new file, the current image is re-fetched from `/api/product/{id}/image` and re-uploaded to satisfy the backend's expectation.
- On success: toast + navigate back to product details.

**5. Inventory / Manage Products (`/inventory`)**
- Dense admin table: ID, Name, Brand, Category, Quantity, Availability, Price, Release date, Actions (View / Edit / Delete).
- **Inline editing** for quantity (number input that saves on blur/Enter) and availability (switch) — each fires `PUT /api/product/{id}` with the existing image re-uploaded behind the scenes.
- **Low-stock highlighting:** rows with `quantity < 5` get an amber row tint and warning icon next to the quantity.
- **Bulk selection:** header checkbox + per-row checkboxes; bulk actions bar appears when ≥1 selected, offering "Delete selected" (single confirmation dialog) and "Toggle availability".
- Sticky table header, horizontal scroll on small screens.

### API service layer (`src/services/api.ts`)

Single Axios instance with `baseURL: '/api'`. Exports:
- `getProducts()` → `GET /products`
- `getProductById(id)` → `GET /product/{id}`
- `searchProducts(keyword)` → `GET /products/search?keyword=...`
- `createProduct(product, imageFile)` → `POST /product` (multipart)
- `updateProduct(id, product, imageFile)` → `PUT /product/{id}` (multipart)
- `deleteProduct(id)` → `DELETE /product/{id}`
- `getProductImageUrl(id)` → returns `/api/product/{id}/image`

Date helpers convert between JS `Date` and the backend's `dd-MM-yyyy` string format.

### Data fetching

TanStack Query (already in the project) for caching, loading states, and cache invalidation:
- `['products']` list, `['products','search',keyword]`, `['product',id]`.
- Mutations invalidate the relevant keys so UI stays fresh after create/update/delete without manual refetch.

### Vite proxy

`vite.config.ts` updated with:

```ts
server: {
  proxy: {
    '/api': { target: 'http://localhost:8080', changeOrigin: true }
  }
}
```

So the frontend can call `/api/...` in dev and Spring Boot serves it on port 8080. (Target port can be changed later if your backend runs elsewhere.)

### Accessibility & responsiveness

- Semantic landmarks (`<header>`, `<nav>`, `<main>`), labeled inputs, visible focus rings, aria-labels on icon-only buttons.
- Sufficient contrast in both themes.
- Breakpoints: table becomes a stacked card list on `<sm`, top tabs become horizontally scrollable, form columns collapse to single column on mobile.

### Files to be created/modified

- `src/index.css` — emerald palette tokens (light + dark), typography.
- `src/App.tsx` — router with all 5 routes + ThemeProvider.
- `src/components/layout/AppLayout.tsx` — top nav + tab bar wrapper.
- `src/components/layout/ThemeToggle.tsx`
- `src/components/products/ProductTable.tsx`, `ProductFilters.tsx`, `ProductForm.tsx`, `DeleteProductDialog.tsx`, `ImageUpload.tsx`, `AvailabilityBadge.tsx`.
- `src/pages/AllProducts.tsx`, `AddProduct.tsx`, `EditProduct.tsx`, `ProductDetails.tsx`, `Inventory.tsx`.
- `src/services/api.ts`, `src/lib/date.ts`, `src/types/product.ts`.
- `src/hooks/useProducts.ts`, `useProduct.ts`, `useProductMutations.ts` (TanStack Query wrappers).
- `vite.config.ts` — add `/api` proxy.

After approval I'll implement everything end-to-end and you'll have a working UI against your Spring Boot API as soon as it's reachable on the proxy target.