import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

interface ApiCandidate {
  dni: string;
  nombre: string;
  politicalParty: string;
  description: string;
  imageUri: string;
  roleType: "PRESIDENT" | "MAYOR";
  votes: number;
}

export function VotingSection({
  onlyCategory,
}: {
  onlyCategory?: "presidencia" | "alcaldia";
}) {
  const { userSession, voteForCandidate } = useApp();
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null
  );
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [proposalDialogOpen, setProposalDialogOpen] = useState(false);
  const [proposalCandidate, setProposalCandidate] = useState<ApiCandidate | null>(
    null
  );
  const [presidenciaCandidates, setPresidenciaCandidates] = useState<ApiCandidate[]>([]);
  const [alcaldiaCandidates, setAlcaldiaCandidates] = useState<ApiCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar candidatos desde la API
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);

        // Cargar presidentes si es necesario
        if (onlyCategory === undefined || onlyCategory === "presidencia") {
          const presidentResponse = await fetch(
            "http://161.132.54.35:3000/api/candidates/role/PRESIDENT"
          );
          if (presidentResponse.ok) {
            const presidentData = await presidentResponse.json();
            setPresidenciaCandidates(presidentData);
          }
        }

        // Cargar alcaldes si es necesario
        if (onlyCategory === undefined || onlyCategory === "alcaldia") {
          const mayorResponse = await fetch(
            "http://161.132.54.35:3000/api/candidates/role/MAYOR"
          );
          if (mayorResponse.ok) {
            const mayorData = await mayorResponse.json();
            setAlcaldiaCandidates(mayorData);
          }
        }
      } catch (error) {
        console.error("Error al cargar candidatos:", error);
        toast.error("Error al cargar los candidatos");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [onlyCategory]);

  const handleVoteClick = (candidateId: string) => {
    setSelectedCandidate(candidateId);
    setConfirmDialogOpen(true);
  };

  const handleConfirmVote = async () => {
    if (!selectedCandidate || !userSession?.dni) return;

    try {
      const response = await fetch("http://161.132.54.35:3000/api/candidates/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voterDni: userSession.dni,
          candidateDni: selectedCandidate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al registrar el voto");
      }

      const data = await response.json();

      // Actualizar el contexto local
      voteForCandidate(selectedCandidate);

      toast.success(`¡Voto registrado exitosamente por ${data.nombre}!`);
      setConfirmDialogOpen(false);
      setSelectedCandidate(null);

      // Recargar candidatos para actualizar el conteo de votos
      const roleType = data.roleType;
      if (roleType === "PRESIDENT") {
        const presidentResponse = await fetch(
          "http://161.132.54.35:3000/api/candidates/role/PRESIDENT"
        );
        if (presidentResponse.ok) {
          const presidentData = await presidentResponse.json();
          setPresidenciaCandidates(presidentData);
        }
      } else if (roleType === "MAYOR") {
        const mayorResponse = await fetch(
          "http://161.132.54.35:3000/api/candidates/role/MAYOR"
        );
        if (mayorResponse.ok) {
          const mayorData = await mayorResponse.json();
          setAlcaldiaCandidates(mayorData);
        }
      }
    } catch (error: any) {
      console.error("Error al registrar voto:", error);
      toast.error(error.message || "Error al registrar el voto. Por favor, intenta de nuevo.");
    }
  };

  const CandidateCard = ({
    candidate,
    category,
  }: {
    candidate: ApiCandidate;
    category: "presidencia" | "alcaldia";
  }) => {
    const votedInCategoryId =
      category === "presidencia"
        ? userSession?.votedPresidencia
        : userSession?.votedAlcaldia;

    const categoryVoted = !!votedInCategoryId; // user has voted in this category
    const isVotedCandidate =
      typeof votedInCategoryId === "string" &&
      votedInCategoryId === candidate.dni; // this candidate is the one user voted for

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: categoryVoted && !isVotedCandidate ? 1 : 1.01 }}
        transition={{ duration: 0.18 }}
      >
        <Card
          className={`overflow-hidden rounded-xl shadow-md max-w-sm mx-auto ${
            categoryVoted && !isVotedCandidate ? "opacity-60" : ""
          }`}
        >
          {/* Image banner */}
          <div
            className="relative w-full rounded-t-xl"
            style={{
              backgroundImage: "url('/images/fondo.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              height: "120px", // altura real para mostrar fondo
            }}
          >
            <img
              src={candidate.imageUri}
              alt={candidate.nombre}
              className="w-24 h-24 rounded-full object-cover border"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                // fallback image when remote URL fails
                target.onerror = null;
                target.src =
                  "https://via.placeholder.com/600x400?text=Sin+imagen";
              }}
              loading="lazy"
            />
            <div className="absolute left-4 bottom-3">
              <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-blue-600 text-white shadow-sm">
                {candidate.politicalParty}
              </div>
            </div>
          </div>

          <CardContent>
            <div className="mt-2">
              <CardTitle className="text-lg font-semibold mb-1">
                {candidate.nombre}
              </CardTitle>
              <div className="text-sm text-primary font-medium mb-2">
                {candidate.roleType === "PRESIDENT" ? "Presidente" : "Alcalde"}
              </div>
              <p className="text-sm text-muted-foreground mb-4 max-h-14 overflow-hidden">
                {candidate.description}
              </p>

              <div className="flex items-center gap-3">
                <Button
                  className="flex-1"
                  disabled={categoryVoted && !isVotedCandidate}
                  onClick={() => handleVoteClick(candidate.dni)}
                >
                  {isVotedCandidate ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Tu voto
                    </>
                  ) : (
                    "Votar"
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setProposalCandidate(candidate);
                    setProposalDialogOpen(true);
                  }}
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
                >
                  Ver propuestas
                  <ExternalLink className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-muted-foreground">Cargando candidatos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Presidencia */}
      {(onlyCategory === undefined || onlyCategory === "presidencia") && (
        <section>
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Elección Presidencial
            </h2>
            <p className="text-muted-foreground">
              {userSession?.votedPresidencia
                ? "✓ Ya has votado en esta categoría"
                : "Selecciona tu candidato para presidente"}
            </p>
          </div>
          {presidenciaCandidates.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay candidatos presidenciales registrados
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {presidenciaCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.dni}
                  candidate={candidate}
                  category="presidencia"
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Alcaldía */}
      {(onlyCategory === undefined || onlyCategory === "alcaldia") && (
        <section>
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Elección de Alcalde
            </h2>
            <p className="text-muted-foreground">
              {userSession?.votedAlcaldia
                ? "✓ Ya has votado en esta categoría"
                : "Selecciona tu candidato para alcalde"}
            </p>
          </div>
          {alcaldiaCandidates.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay candidatos a alcalde registrados
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alcaldiaCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.dni}
                  candidate={candidate}
                  category="alcaldia"
                />
              ))}
            </div>
          )}
        </section>
      )}

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar voto</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres votar por{" "}
              {[...presidenciaCandidates, ...alcaldiaCandidates].find(
                (c) => c.dni === selectedCandidate
              )?.nombre}
              ? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmVote}>
              Confirmar voto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={proposalDialogOpen} onOpenChange={setProposalDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Propuestas</DialogTitle>
          </DialogHeader>
          {proposalCandidate && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="h-56 md:h-auto overflow-hidden rounded-lg">
                <img
                  src={proposalCandidate.imageUri}
                  alt={proposalCandidate.nombre}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.onerror = null;
                    target.src =
                      "https://via.placeholder.com/600x400?text=Sin+imagen";
                  }}
                  loading="lazy"
                />
              </div>
              <div>
                <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-blue-600 text-white shadow-sm mb-3">
                  {proposalCandidate.politicalParty}
                </div>
                <h3 className="text-xl font-semibold">
                  {proposalCandidate.nombre}
                </h3>
                <p className="text-sm text-primary font-medium mb-4">
                  {proposalCandidate.roleType === "PRESIDENT"
                    ? "Presidente"
                    : "Alcalde"}
                </p>
                <div className="prose max-w-none text-sm text-muted-foreground">
                  {/* usando description como propuesta si no existe campo específico */}
                  <p>{proposalCandidate.description}</p>
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <Button
                    onClick={() => {
                      if (!proposalCandidate) return;
                      setSelectedCandidate(proposalCandidate.dni);
                      setProposalDialogOpen(false);
                      setConfirmDialogOpen(true);
                    }}
                    className="mr-2"
                  >
                    Votar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setProposalDialogOpen(false)}
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
