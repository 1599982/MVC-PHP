import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ApiComment {
  id: number;
  dni: string;
  nombre: string;
  datetime: string;
  description: string;
}

export default function AdminComments() {
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://161.132.54.35:3000/api/comments");

        if (!response.ok) {
          throw new Error("Error al cargar comentarios");
        }

        const data = await response.json();
        // Mostrar más recientes primero
        const sortedComments = data.sort(
          (a: ApiComment, b: ApiComment) =>
            new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
        );
        setComments(sortedComments);
      } catch (error) {
        console.error("Error al cargar comentarios:", error);
        toast.error("Error al cargar los comentarios desde el servidor");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Comentarios de usuarios</h2>
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-muted-foreground">Cargando comentarios...</p>
        </div>
      ) : comments.length === 0 ? (
        <p className="text-muted-foreground">No hay comentarios registrados.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div
              key={c.id}
              className="p-4 bg-card border border-border rounded-lg"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{c.nombre}</p>
                  <p className="text-sm text-muted-foreground">DNI: {c.dni}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(c.datetime).toLocaleString("es-PE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-card-foreground">{c.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
