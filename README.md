# 🛍️ Product Hub

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0-green?logo=spring)
![Java](https://img.shields.io/badge/Java-21-orange?logo=java)
![Vite](https://img.shields.io/badge/Vite-5.x-purple?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-teal?logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-lightgrey)
![Build](https://img.shields.io/badge/build-passing-brightgreen)

A full-stack product management dashboard built with **React + TypeScript** on the frontend and **Spring Boot + Java** on the backend.

---

## ✨ Features

- **Product catalog** — browse all products in a sortable, filterable table (`src/pages/AllProducts.tsx`)
- **Full CRUD** — create, view, edit, and delete products with image upload support (`src/pages/AddProduct.tsx`, `EditProduct.tsx`, `ProductDetails.tsx`)
- **Inventory view** — admin panel for inline quantity edits, availability toggles, bulk actions, and low-stock alerts (`src/pages/Inventory.tsx`)
- **Live search** — debounced search by name, brand, or category via a global `SearchContext` (`src/context/SearchContext.tsx`, `src/hooks/useDebounce.ts`)
- **Dark / light theme** — powered by `next-themes` with a `ThemeToggle` component (`src/components/layout/ThemeToggle.tsx`)
- **Image management** — product images stored as BLOBs in the database and served via REST (`backend/.../ProductController.java` line 52–58)
- **Seed data** — 10 sample products auto-loaded on startup (`backend/src/main/resources/data1.sql`)

---

## 🏗️ Tech Stack

| Layer       | Technology                                            |
|-------------|-------------------------------------------------------|
| Frontend    | React 18, TypeScript 5, Vite 5, React Router 6       |
| UI          | Tailwind CSS 3, shadcn/ui (Radix UI), Lucide React   |
| State/Data  | TanStack React Query 5, React Hook Form, Zod         |
| Backend     | Spring Boot 4 (Spring MVC, Spring Data JPA)          |
| Database    | H2 in-memory (configurable)                          |
| Language    | Java 21 + Lombok                                     |
| Testing     | Vitest + Testing Library (frontend)                  |

---
```
product-hub/
│
├── frontend/                    # React App (Vite + TS)
│   ├── src/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── backend/                    # Spring Boot API
│   ├── src/main/java/com/telusko/ecom_proj/
│   ├── src/main/resources/
│   ├── pom.xml
│   └── mvnw / mvnw.cmd
│
├── README.md                   # Main project overview
├── .gitignore
└── docs/ (optional)            # Screenshots / diagrams
```
---

## ⚙️ Prerequisites

- **Node.js** ≥ 18 and **npm** ≥ 9 (or **bun**)
- **Java** 21
- **Maven** 3.x (or use the included `backend/mvnw` wrapper)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Mouleendra0511/product-hub.git
cd product-hub
```
2. Start the backend

```bash
cd backend
./mvnw spring-boot:run          # Linux / macOS
mvnw.cmd spring-boot:run        # Windows
The API starts on http://localhost:8081 and auto-seeds 10 sample products from data1.sql. The H2 console is accessible at http://localhost:8081/h2-console (JDBC URL: jdbc:h2:mem:fauji).
```
3. Start the frontend (dev server)
In the project root:

```bash
npm install
npm run dev
The dev server starts on http://localhost:8080 and proxies all /api/* requests to http://localhost:8081 (vite.config.ts line 15–18).
```
npm Scripts (package.json)
Script	Description
```
npm run dev	Start Vite dev server (port 8080, HMR enabled)
npm run build	Production build → dist/
npm run build:dev	Development-mode build
npm run preview	Preview the production build locally
npm run lint	Run ESLint
npm run test	Run Vitest tests once
npm run test:watch	Run Vitest in watch mode
```
REST API Endpoints
All endpoints are prefixed with /api (ProductController.java line 18).
```
Method	Path	Description
GET	/api/products	List all products
GET	/api/product/{id}	Get product by ID
GET	/api/product/{id}/image	Get product image (binary)
GET	/api/products/search?keyword=	Search by name/brand/category
POST	/api/product	Create product (multipart)
PUT	/api/product/{id}	Update product (multipart)
DELETE	/api/product/{id}	Delete product
```
Testing
Frontend unit tests use Vitest and @testing-library/react:

```bash
npm run test          # run once
npm run test:watch    # watch mode
Test setup: src/test/setup.ts. Example test: src/test/example.test.ts.
```
Contributing
Fork the repo and create a feature branch: git checkout -b feature/my-feature
Make your changes and ensure npm run lint passes
Run npm run test to confirm tests pass
Open a pull request against main

License
No license file is present in the repository. Contact the repository owner for usage terms.


---

## Key Findings & Citations

| Topic | Detail | File / Line |
|---|---|---|
| Frontend entry | `main.tsx` renders `<App />` into `#root` | `src/main.tsx` |
| Routing | React Router v6 with 5 routes under `AppLayout` | `src/App.tsx:27–35` |
| API base | All fetch calls use `/api` prefix; proxied to `:8081` | `src/services/api.ts:3`, `vite.config.ts:15` |
| Backend port | Spring Boot default `:8081` (Vite dev uses `:8080`) | `vite.config.ts:17` |
| Product model | 11 fields: id, name, desc, brand, price, category, releaseDate, available, quantity, imageName, imageType + imageDate BLOB | `backend/.../model/Product.java:17–36` |
| Search query | JPQL LIKE search across name, description, brand, category (note: field in query is `p.description` but column is `desc` — potential mismatch) | `backend/.../repo/ProductRepo.java:12–16` |
| Database | H2 in-memory named `fauji` | `backend/.../resources/application.properties:3` |
| Seed data | 10 electronics products auto-inserted | `backend/.../resources/data1.sql` |
| Image storage | `@Lob byte[] imageDate` stored in DB, served via `GET /api/product/{id}/image` | `Product.java:35`, `ProductController.java:52–58` |
| Low-stock threshold | Inventory flags items with `quantity < 5` | `src/pages/Inventory.tsx:29` |
| Debounced search | 300 ms debounce before API call | `src/pages/AllProducts.tsx:52` |
| Theme | Light/dark via `next-themes`, togglable in header | `src/App.tsx:5`, `src/components/layout/ThemeToggle.tsx` |

