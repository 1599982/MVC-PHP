import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

interface DniModalProps {
  open: boolean;
  onClose: () => void;
}

export function DniModal({ open, onClose }: DniModalProps) {
  const [dni, setDni] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loginUser } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (dni.length < 7 || dni.length > 10) {
      toast.error('El DNI debe tener entre 7 y 10 dígitos');
      return;
    }

    setIsLoading(true);

    try {
      // Registrar el votante en la API
      const response = await fetch('http://161.132.54.35:3000/api/persons/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dni }),
      });

      if (!response.ok) {
        throw new Error('Error al registrar el votante');
      }

      const data = await response.json();

      // Mostrar mensaje apropiado según si es nuevo registro o ya existía
      if (data.newRegistration) {
        toast.success(`¡Bienvenido ${data.nombre}! Registro exitoso`);
      } else {
        toast.success(`¡Bienvenido de nuevo ${data.nombre}!`);
      }

      // Hacer login con los datos de votos desde la API
      loginUser(dni, data.votedPresidentDni, data.votedMayorDni);
      navigate('/user');
      onClose();
      setDni('');
    } catch (error) {
      console.error('Error al registrar:', error);
      toast.error('Error al conectar con el servidor. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Ingresa tu DNI</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div>
            <label htmlFor="dni" className="block text-sm font-medium mb-2">
              Número de DNI
            </label>
            <Input
              id="dni"
              type="number"
              placeholder="12345678"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              className="text-lg"
              required
              min="1000000"
              max="99999999999"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Ingresa tu documento de identidad para acceder
            </p>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? 'Registrando...' : 'Continuar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
