import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CommentModal({ open, onClose }: Props) {
  const { userSession } = useApp();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Por favor escribe un comentario");
      return;
    }

    if (!userSession?.dni) {
      toast.error("No se pudo identificar tu sesión");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dni: userSession.dni,
          description: message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Error al enviar el comentario");
      }

      const data = await response.json();

      toast.success("✅ Comentario enviado correctamente");

      setMessage("");
      onClose();
    } catch (error) {
      console.error("Error al enviar comentario:", error);
      toast.error("Error al enviar el comentario. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar comentario</DialogTitle>
        </DialogHeader>

        <textarea
          className="w-full p-3 border rounded-lg bg-background mt-2"
          rows={5}
          placeholder="Escribe tu comentario aquí..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSend} disabled={isLoading}>
            {isLoading ? "Enviando..." : "Enviar comentario"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
