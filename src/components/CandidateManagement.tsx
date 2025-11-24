import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
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
import { toast } from "sonner";

interface ApiCandidate {
  dni: string;
  nombre: string;
  politicalParty: string;
  description: string;
  imageUri: string;
  roleType: "PRESIDENT" | "MAYOR";
  votes: number;
  enabled: boolean;
}

interface CandidateManagementProps {
  category: "presidencia" | "alcaldia";
}

export function CandidateManagement({ category }: CandidateManagementProps) {
  const [apiCandidates, setApiCandidates] = useState<ApiCandidate[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<ApiCandidate | null>(
    null
  );
  const [disablingCandidateId, setDisablingCandidateId] = useState<
    string | null
  >(null);

  const [formData, setFormData] = useState({
    dni: "",
    party: "",
    description: "",
    image: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(true);

  // Cargar candidatos desde la API
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoadingCandidates(true);
        const roleType = category === "presidencia" ? "PRESIDENT" : "MAYOR";
        const response = await fetch(
          `http://localhost:8080/api/candidates/role/${roleType}`
        );

        if (!response.ok) {
          throw new Error("Error al cargar candidatos");
        }

        const data = await response.json();
        setApiCandidates(data);
      } catch (error) {
        console.error("Error al cargar candidatos:", error);
        toast.error("Error al cargar los candidatos desde el servidor");
      } finally {
        setLoadingCandidates(false);
      }
    };

    fetchCandidates();
  }, [category]);

  const enabledCandidates = apiCandidates.filter((c) => c.enabled !== false);
  const disabledCandidates = apiCandidates.filter((c) => c.enabled === false);

  const sortedEnabledCandidates = [...enabledCandidates].sort(
    (a, b) => (b.votes ?? 0) - (a.votes ?? 0)
  );

  const handleOpenDialog = (candidate?: ApiCandidate) => {
    if (candidate) {
      setEditingCandidate(candidate);
      setFormData({
        dni: candidate.dni,
        party: candidate.politicalParty,
        description: candidate.description,
        image: candidate.imageUri,
      });
    } else {
      setEditingCandidate(null);
      setFormData({ dni: "", party: "", description: "", image: "" });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCandidate(null);
    setFormData({ dni: "", party: "", description: "", image: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingCandidate) {
        // Editar candidato existente usando la API
        const roleType = category === "presidencia" ? "PRESIDENT" : "MAYOR";

        const response = await fetch(
          `http://localhost:8080/api/candidates/${formData.dni}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              politicalParty: formData.party,
              description: formData.description,
              imageUri: formData.image,
              roleType: roleType,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al actualizar el candidato");
        }

        const data = await response.json();

        toast.success(`Candidato ${data.nombre} actualizado exitosamente`);

        // Actualizar en la lista local de API
        setApiCandidates((prev) =>
          prev.map((c) =>
            c.dni === data.dni
              ? {
                  ...c,
                  politicalParty: data.politicalParty,
                  description: data.description,
                  imageUri: data.imageUri,
                  nombre: data.nombre,
                }
              : c
          )
        );

        handleCloseDialog();
      } else {
        // Agregar nuevo candidato usando la API
        const roleType = category === "presidencia" ? "PRESIDENT" : "MAYOR";

        const response = await fetch("http://localhost:8080/api/candidates", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dni: formData.dni,
            politicalParty: formData.party,
            description: formData.description,
            imageUri: formData.image,
            roleType: roleType,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al crear el candidato");
        }

        const data = await response.json();

        toast.success(`Candidato ${data.nombre} agregado exitosamente`);

        // Agregar a la lista local de API
        setApiCandidates((prev) => [...prev, data]);

        handleCloseDialog();
      }
    } catch (error: any) {
      console.error("Error al guardar candidato:", error);
      toast.error(
        error.message ||
          "Error al guardar el candidato. Por favor, intenta de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableClick = (dni: string) => {
    setDisablingCandidateId(dni);
    setDisableDialogOpen(true);
  };

  const handleConfirmDisable = async () => {
    if (!disablingCandidateId) return;

    const candidate = apiCandidates.find((c) => c.dni === disablingCandidateId);
    if (!candidate) return;

    setIsLoading(true);

    try {
      const newEnabledState = !candidate.enabled;
      const roleType = category === "presidencia" ? "PRESIDENT" : "MAYOR";

      const response = await fetch(
        `http://localhost:8080/api/candidates/${disablingCandidateId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            politicalParty: candidate.politicalParty,
            description: candidate.description,
            imageUri: candidate.imageUri,
            roleType: roleType,
            enabled: newEnabledState,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar el candidato");
      }

      const data = await response.json();

      toast.success(
        newEnabledState
          ? `Candidato ${data.nombre} habilitado exitosamente`
          : `Candidato ${data.nombre} deshabilitado exitosamente`
      );

      // Actualizar en la lista local
      setApiCandidates((prev) =>
        prev.map((c) =>
          c.dni === disablingCandidateId ? { ...c, enabled: newEnabledState } : c
        )
      );

      setDisableDialogOpen(false);
      setDisablingCandidateId(null);
    } catch (error: any) {
      console.error("Error al actualizar candidato:", error);
      toast.error(
        error.message ||
          "Error al actualizar el candidato. Por favor, intenta de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const CandidateCard = ({
    candidate,
    isDisabled,
  }: {
    candidate: ApiCandidate;
    isDisabled: boolean;
  }) => (
    <motion.div
      key={candidate.dni}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full"
    >
      <Card
        className={`h-full bg-transparent border shadow-none ${
          isDisabled ? "border-red-300 opacity-60" : "border-border"
        }`}
      >
        <CardHeader>
          <div className="flex items-start gap-4">
            <img
              src={candidate.imageUri}
              alt={candidate.nombre}
              className={`w-16 h-16 rounded-full object-cover ${
                isDisabled ? "grayscale" : ""
              }`}
            />
            <div className="flex-1">
              <CardTitle className="text-lg mb-1">{candidate.nombre}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {candidate.politicalParty}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                DNI: {candidate.dni}
              </p>
              {isDisabled && (
                <p className="text-xs text-red-500 font-semibold mt-1">
                  Deshabilitado
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {candidate.description}
          </p>
          <p className="text-sm font-medium mb-4">Votos: {candidate.votes}</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => handleOpenDialog(candidate)}
            >
              <Edit className="w-3 h-3 mr-1" />
              Editar
            </Button>
            <Button
              variant={isDisabled ? "default" : "destructive"}
              size="sm"
              className="flex-1"
              onClick={() => handleDisableClick(candidate.dni)}
            >
              {isDisabled ? (
                <>
                  <Edit className="w-3 h-3 mr-1" />
                  Habilitar
                </>
              ) : (
                <>
                  <EyeOff className="w-3 h-3 mr-1" />
                  Deshabilitar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          Gestión de {category === "presidencia" ? "Presidentes" : "Alcaldes"}
        </h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Agregar Candidato
        </Button>
      </div>

      {/* Candidatos Habilitados */}
      {loadingCandidates ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-muted-foreground">Cargando candidatos...</p>
        </div>
      ) : sortedEnabledCandidates.length === 0 && disabledCandidates.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-muted-foreground">
            No hay candidatos registrados aún
          </p>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedEnabledCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.dni}
                  candidate={candidate}
                  isDisabled={false}
                />
              ))}
            </div>
          </div>

          {/* Candidatos Deshabilitados */}
          {disabledCandidates.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border">
              <h3 className="text-xl font-bold mb-6 text-red-500">
                {category === "presidencia"
                  ? "Presidentes Deshabilitados"
                  : "Alcaldes Deshabilitados"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {disabledCandidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.dni}
                    candidate={candidate}
                    isDisabled={true}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCandidate ? "Editar Candidato" : "Agregar Candidato"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                DNI
              </label>
              <Input
                value={formData.dni}
                onChange={(e) =>
                  setFormData({ ...formData, dni: e.target.value })
                }
                placeholder="Ej: 12345678"
                required
                disabled={!!editingCandidate}
                type="text"
                pattern="[0-9]{8,10}"
                title="El DNI debe tener entre 8 y 10 dígitos"
              />
              {editingCandidate && (
                <p className="text-xs text-muted-foreground mt-1">
                  El DNI no se puede modificar
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Partido</label>
              <Input
                value={formData.party}
                onChange={(e) =>
                  setFormData({ ...formData, party: e.target.value })
                }
                placeholder="Ej: Partido Progreso Nacional"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Descripción
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Breve descripción del candidato y sus propuestas"
                rows={4}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                URL de imagen
              </label>
              <Input
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                placeholder="https://ejemplo.com/imagen.jpg"
                required
                type="url"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : editingCandidate ? "Actualizar" : "Agregar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              {apiCandidates.find((c) => c.dni === disablingCandidateId)?.enabled
                ? "Este candidato será deshabilitado y no aparecerá para votar."
                : "Este candidato será habilitado nuevamente."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDisable} disabled={isLoading}>
              {isLoading ? "Procesando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
