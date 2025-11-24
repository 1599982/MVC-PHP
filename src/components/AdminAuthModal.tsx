import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

interface AdminAuthModalProps {
  open: boolean;
  onClose: () => void;
}

export function AdminAuthModal({ open, onClose }: AdminAuthModalProps) {
  const [dni, setDni] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { loginAdmin } = useApp();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (dni.length < 7 || dni.length > 10) {
      toast.error("El DNI debe tener entre 7 y 10 dígitos");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://161.132.54.35:3000/api/admin/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dni,
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al verificar credenciales");
      }

      const data = await response.json();

      if (data.authenticated) {
        // Login exitoso
        loginAdmin(data.dni, data.nombre);
        toast.success(`¡Bienvenido al panel de administración, ${data.nombre}!`);
        navigate("/admin");
        onClose();
        setDni("");
        setEmail("");
        setPassword("");
      } else {
        toast.error("Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error al verificar admin:", error);
      toast.error("Error al conectar con el servidor. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            Panel de Administración
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleLogin} className="space-y-6 mt-4">
          <div>
            <label htmlFor="admin-dni" className="block text-sm font-medium mb-2">
              DNI de Administrador
            </label>
            <Input
              id="admin-dni"
              type="text"
              placeholder="12345678"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              className="text-lg"
              required
              pattern="[0-9]{7,10}"
              title="El DNI debe tener entre 7 y 10 dígitos"
            />
          </div>

          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium mb-2">
              Correo electrónico
            </label>
            <Input
              id="admin-email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium mb-2">
              Contraseña
            </label>
            <Input
              id="admin-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? "Verificando..." : "Ingresar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
