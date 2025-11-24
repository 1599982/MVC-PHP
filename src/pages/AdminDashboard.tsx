import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Vote, Menu } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { CandidateManagement } from "@/components/CandidateManagement";
import { AdminResults } from "@/components/AdminResults";
import { DataAnalysis } from "@/components/DataAnalysis";
import AdminSideMenu from "@/components/AdminSideMenu";
import ThemeToggle from "@/components/ThemeToggle";
import AdminComments from "@/components/AdminComments";

export default function AdminDashboard() {
  const { adminSession, logoutAdmin } = useApp();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<
    "presidentes" | "alcaldes" | "resultados" | "analisis" | "comentarios"
  >("presidentes");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!adminSession) {
      navigate("/");
    }
  }, [adminSession, navigate]);

  const handleLogout = () => {
    logoutAdmin();
    navigate("/");
  };

  if (!adminSession) return null;

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSideMenu
        activeSection={activeSection}
        onSectionChange={(section) => {
          setActiveSection(section);
          setIsMobileMenuOpen(false);
        }}
        onLogout={handleLogout}
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 md:ml-64 flex flex-col">
        <header className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
          <div className="px-4 md:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="Abrir menú"
              >
                <Menu className="w-6 h-6 text-card-foreground" />
              </button>
              <Vote className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-card-foreground">
                  Panel de Administración
                </h1>
                <p className="text-sm text-muted-foreground">
                  {adminSession.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-8 relative z-0">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            {activeSection === "presidentes" && (
              <CandidateManagement category="presidencia" />
            )}
            {activeSection === "alcaldes" && (
              <CandidateManagement category="alcaldia" />
            )}
            {activeSection === "resultados" && <AdminResults />}
            {activeSection === "analisis" && <DataAnalysis />}
            {activeSection === "comentarios" && <AdminComments />}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
