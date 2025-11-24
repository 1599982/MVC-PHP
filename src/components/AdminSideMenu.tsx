import { Users, MapPin, BarChart3, MessageSquare, LogOut } from "lucide-react";

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
}

export default function AdminSideMenu({
  activeSection,
  onSectionChange,
  onLogout,
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
    <div className="hidden md:flex md:fixed md:left-0 md:top-0 md:bottom-0 md:w-64 md:flex-col md:bg-card md:border-r md:border-border md:z-40">
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
  );
}
