import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LogOut,
  Vote,
  Users,
  BarChart3,
  Info,
  FileText,
  Download,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import SideMenu from "@/components/SideMenu";
import { useApp } from "@/contexts/AppContext";
import { VotingSection } from "@/components/VotingSection";
import { UserResults } from "@/components/UserResults";
import ThemeToggle from "@/components/ThemeToggle";
import CommentModal from "@/components/CommentModal";
 // <-- IMPORTANTE

export default function UserDashboard() {
  const { userSession, logoutUser } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("inicio");
  const [showVotingWarning, setShowVotingWarning] = useState(false);
  const [missingVotes, setMissingVotes] = useState<string[]>([]);
  const [hasRedirected, setHasRedirected] = useState(false);

  // Modal comentarios
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSendCommentLocal = () => {
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 2500);
  };

  useEffect(() => {
    if (!userSession) {
      navigate("/");
    }
  }, [userSession, navigate]);

  // Actualizar el modal cuando el usuario vota
  useEffect(() => {
    if (userSession) {
      const missing = [];
      if (!userSession.votedPresidencia) missing.push("Presidente");
      if (!userSession.votedAlcaldia) missing.push("Alcalde");
      setMissingVotes(missing);
    }
  }, [userSession]);

  // Redirigir a resultados cuando completa ambas votaciones (solo una vez)
  useEffect(() => {
    if (
      !hasRedirected &&
      userSession?.votedPresidencia &&
      userSession?.votedAlcaldia &&
      activeTab !== "results" &&
      (activeTab === "presidentes" || activeTab === "alcaldes")
    ) {
      setTimeout(() => {
        setActiveTab("results");
        setHasRedirected(true);
      }, 1000);
    }
  }, [
    userSession?.votedPresidencia,
    userSession?.votedAlcaldia,
    activeTab,
    hasRedirected,
  ]);

  const handleLogoutAttempt = () => {
    if (!userSession?.votedPresidencia || !userSession?.votedAlcaldia) {
      const missing = [];
      if (!userSession?.votedPresidencia) missing.push("Presidente");
      if (!userSession?.votedAlcaldia) missing.push("Alcalde");

      setMissingVotes(missing);
      setShowVotingWarning(true);
    } else {
      handleLogout();
    }
  };

  const handleContinueVoting = () => {
    setShowVotingWarning(false);
    if (!userSession?.votedPresidencia) {
      setActiveTab("presidentes");
    } else if (!userSession?.votedAlcaldia) {
      setActiveTab("alcaldes");
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  if (!userSession) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Modal advertencia */}
      <AlertDialog open={showVotingWarning} onOpenChange={setShowVotingWarning}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <AlertDialogTitle>No ha completado su votación</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-3">
              <p>
                Para poder salir, debe completar su votación en los siguientes
                apartados:
              </p>
              <ul className="list-disc list-inside space-y-1 font-semibold text-card-foreground">
                {missingVotes.map((vote) => (
                  <li key={vote}>{vote}</li>
                ))}
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleContinueVoting}
              className="bg-primary hover:bg-primary/90"
            >
              Terminar con la votación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sidebar */}
      <SideMenu
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogoutAttempt}
      />

      {/* Contenido principal */}
      <div className="flex-1 md:ml-64 flex flex-col">
        <header className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
          <div className="px-4 md:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Vote className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-card-foreground">
                  Panel de Votación
                </h1>
                <p className="text-sm text-muted-foreground">
                  DNI: {userSession.dni}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-8">
          <Tabs value={activeTab} className="w-full">
            {/* INICIO */}
           <TabsContent value="inicio" className="mt-0">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="max-w-6xl mx-auto"
  >
    <div className="mb-12">
      {/* TITULO */}
      <h2 className="text-3xl font-bold mb-2">¿Cómo votaremos?</h2>
      <p className="text-muted-foreground mb-8">
        Estos son los pasos a seguir:
      </p>

      {/* =========================
          SECCIÓN: PASOS
      ========================== */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
        {[1, 2, 3, 4, 5].map((step) => (
          <motion.div
            key={step}
            whileHover={{ scale: 1.05 }}
            className="flex flex-col items-center gap-2 p-4"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {step}
            </div>

            <p className="text-sm font-semibold text-center">
              {step === 1 && "Dirigimos al apartado presidentes o alcaldes"}
              {step === 2 && "Elegimos el candidato preferido"}
              {step === 3 && "Le damos al botón votar y confirmamos"}
              {step === 4 && "Nos dirigimos al apartado resultados"}
              {step === 5 && "Damos por finalizado las votaciones"}
            </p>
          </motion.div>
        ))}
      </div>

      {/* =========================
          SECCIÓN: TARJETAS INFO
      ========================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* CARD IZQUIERDA */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border-l-4 border-primary p-6 rounded-lg"
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Acerca de
          </p>

          <h3 className="text-2xl font-bold text-primary mb-4">
            ¿Cómo funcionan las elecciones presidenciales en el Perú?
          </h3>

          <p className="text-muted-foreground mb-4">
            Estar informados es fundamental para una democracia saludable.
            ¿Quieres conocer más sobre este importante proceso electoral?
          </p>

          <a
            href="https://eg2026.onpe.gob.pe/acerca-del-proceso/informacion-general/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-semibold hover:underline"
            >
              Saber más →
          </a>
        </motion.div>

        {/* CARD DERECHA */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border border-border p-6 rounded-lg"
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Lo que debes saber
          </p>

          <p className="text-muted-foreground mb-4">
            Algunos puntos importantes sobre estas elecciones 2026:
          </p>

          <ul className="space-y-3 text-sm">
            <li className="text-muted-foreground">
              <strong>Fecha:</strong> Domingo 12 de abril de 2026, de 7 a.m. a 5 p.m.
            </li>
            <li className="text-muted-foreground">
              <strong>Votantes:</strong> Más de 27 millones de peruanos elegirán:
            </li>
            <li className="text-muted-foreground">
              Presidente, vicepresidentes, senadores, diputados y representantes del parlamento andino.
            </li>
          </ul>
        </motion.div>
      </div>

      {/* =========================
          SECCIÓN: VIDEO + TEXTO
      ========================== */}
      <motion.div
        initial={{ opacity: 0, x: 0 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-20"
      >
        <h4 className="text-xl font-bold mb-4">
          Datos claves sobre las Elecciones Generales 2026
        </h4>

        {/* VIDEO DE YOUTUBE */}
        <div className="rounded-lg overflow-hidden mb-4 aspect-video">
          <iframe 
            className="w-full h-full"
            src="https://www.youtube.com/embed/4ubKLPBpDXQ"
            title="Datos claves sobre las Elecciones Generales 2026"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </motion.div>

      {/* =========================
          SECCIÓN: BANNER COMENTARIOS
      ========================== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-white relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 opacity-10 text-9xl font-bold">
          ✓
        </div>

        <div className="relative z-10">
          <h4 className="text-2xl font-bold mb-4">Tu opinión nos importa.</h4>
          <p className="text-blue-100 mb-6 max-w-xl">
            Déjanos saber tus comentarios
          </p>

          <button
            onClick={() => setShowCommentModal(true)}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105"
          >
            Comenta Aquí
          </button>
        </div>
      </motion.div>
    </div>

</motion.div>
</TabsContent>


            {/* Presidentes */}
            <TabsContent value="presidentes" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <VotingSection onlyCategory="presidencia" />
              </motion.div>
            </TabsContent>

            {/* Alcaldes */}
            <TabsContent value="alcaldes" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <VotingSection onlyCategory="alcaldia" />
              </motion.div>
            </TabsContent>

            {/* Resultados */}
            <TabsContent value="results" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <UserResults />
              </motion.div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* MODAL DE COMENTARIOS */}
      <CommentModal
        open={showCommentModal}
        onClose={() => setShowCommentModal(false)}
      />

      {/* Toast */}
      {sentSuccess && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
          Comentario enviado correctamente
        </div>
      )}
    </div>
  );
}
