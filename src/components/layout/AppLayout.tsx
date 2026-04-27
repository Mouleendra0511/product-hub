import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Search, Package2, ShoppingBag, PlusCircle, Boxes } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./ThemeToggle";
import { useSearch } from "@/context/SearchContext";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/products", label: "All Products", icon: ShoppingBag },
  { to: "/products/add", label: "Add Product", icon: PlusCircle },
  { to: "/inventory", label: "Inventory", icon: Boxes },
];

export function AppLayout() {
  const { keyword, setKeyword } = useSearch();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center gap-3 sm:gap-6">
          <button
            className="flex items-center gap-2 font-semibold text-lg shrink-0"
            onClick={() => navigate("/products")}
            aria-label="Go to all products"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-elegant)]">
              <Package2 className="h-5 w-5" />
            </span>
            <span className="hidden sm:inline tracking-tight">Product Dashboard</span>
          </button>

          <div className="relative flex-1 max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                if (location.pathname !== "/products") navigate("/products");
              }}
              placeholder="Search by name, brand, category…"
              className="pl-9"
              aria-label="Search products"
            />
          </div>

          <ThemeToggle />
        </div>

        <nav className="border-t" aria-label="Primary">
          <div className="container">
            <ul className="flex gap-1 overflow-x-auto -mb-px">
              {tabs.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === "/products"}
                    className={({ isActive }) =>
                      cn(
                        "inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
                        isActive
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
                      )
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      <main className="container py-6 md:py-10">
        <Outlet />
      </main>
    </div>
  );
}