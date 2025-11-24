import { Users, MapPin, BarChart3, MessageSquare, LogOut, X } from "lucide-react";

type Section =
  | "presidentes"
  | "alcaldes"
  | "resultados"
  | "analisis"
  | "comentarios";

interface AdminSideMenuProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  onLogout: () => void;
  isMobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
}

export default function AdminSideMenu({
  activeSection,
  onSectionChange,
  onLogout,
  isMobileMenuOpen,
  onCloseMobileMenu,
}: AdminSideMenuProps) {
  const menuItems = [
    {
      id: "presidentes",
      label: "Presidentes",
      description: "Gestión de candidatos presidenciales",
      icon: Users,
    },
    {
      id: "alcaldes",
      label: "Alcaldes",
      description: "Gestión de candidatos a la alcaldía",
      icon: MapPin,
    },
    {
      id: "resultados",
      label: "Resultados",
      description: "Resultados generales",
      icon: BarChart3,
    },
    {
      id: "analisis",
      label: "Análisis",
      description: "Reportes y gráficas del sistema",
      icon: BarChart3,
    },
    {
      id: "comentarios",
      label: "Comentarios",
      description: "Revisión de retroalimentación",
      icon: MessageSquare,
    },
  ];

  return (
    <>
      {/* Overlay para móvil */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onCloseMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 bottom-0 w-64 flex-col bg-card border-r border-border z-50 transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:flex md:z-40`}
      >
        {/* Header ADMIN */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-primary">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-card-foreground truncate">
                Administrador
              </p>
              <p className="text-xs text-muted-foreground">Panel de control</p>
            </div>
            <button
              onClick={onCloseMobileMenu}
              className="md:hidden p-1 hover:bg-muted rounded-lg transition-colors"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

      {/* Separador */}
      <div className="h-px bg-border" />

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
          Navegación
        </div>

        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id as Section)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-lg transition-all text-left ${
                  isActive
                    ? "bg-primary/10 text-primary border-2 border-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-6 h-6 flex-shrink-0" />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-card-foreground">
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer logout */}
      <div className="border-t border-border p-4">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors text-left"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Cerrar sesión</span>
        </button>
      </div>
      </div>
    </>
  );
}
