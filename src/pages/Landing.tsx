import { useState } from "react";
import { motion } from "framer-motion";
import { UserCircle, Shield, BarChart3, Database, CheckCircle2, SwitchCamera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DniModal } from "@/components/DniModal";
import { AdminAuthModal } from "@/components/AdminAuthModal";
import ThemeToggle from "@/components/ThemeToggle";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";

export default function Landing() {
  const [dniModalOpen, setDniModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [showFirst, setShowFirst] = useState(true);
  const { theme } = useTheme();

  return (
    <div
      className="min-h-screen relative bg-cover bg-center transition-colors duration-300"
      style={{
        backgroundColor: theme === "dark" ? "#1a1f2e" : "#e8f0f7",
        backgroundAttachment: 'fixed',
      }}
    >
      <div 
        className="absolute inset-0 transition-colors duration-300" 
        style={{
          backgroundColor: theme === "dark" ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0.3)"
        }}
        aria-hidden="true" 
      />
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
           		<img className="filter [filter:invert(27%)_sepia(99%)_saturate(2069%)_hue-rotate(215deg)_brightness(94%)_contrast(97%)] w-12 h-12 text-primary" src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn-icons-png.flaticon.com%2F512%2F1456%2F1456042.png&f=1&nofb=1&ipt=95c7d73991294edcab213d5c9114bed9df1fbb5962e36b8193eab685c40f91fd" alt="" />
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Elecciones 2026
              </h1>
            </div>
            <div>
              {/* Theme toggle */}
              <ThemeToggle />
            </div>
          </div>

          <p className="text-center text-lg text-muted-foreground max-w-2xl mx-auto">
            Sistema de votación electrónica para las elecciones presidenciales y
            municipales. Participa de manera segura y transparente.
          </p>
        </motion.header>

        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-12 shadow-2xl"
        >
          {/* Imagen difuminada específica para el hero (detrás del overlay y texto) */}
          <img
            src="https://grupogoberna.com/wp-content/uploads/2025/05/Elecciones-en-Peru.jpg"
            alt="Elecciones - hero"
            className="absolute inset-0 w-full h-full object-cover filter blur-sm opacity-70"
          />
          {/* Overlay suave encima de la imagen para contraste con el texto */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-black/20 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Únete al cambio
              </h2>
              <p className="text-lg md:text-xl opacity-90">
                CONTIGO MEJORAMOS EL PAIS
              </p>
               <p className="text-lg md:text-xl opacity-90">
                tu opinion si importa!!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Role Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
        >
          {/* Usuario */}
          <div className="bg-white/60 dark:bg-black/60 backdrop-blur-md rounded-xl p-8 shadow-lg border border-white/10 dark:border-black/20 hover:shadow-xl transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <UserCircle className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-card-foreground">
                Votante
              </h3>
              <p className="text-muted-foreground mb-6">
                Ingresa con tu DNI para ejercer tu derecho al voto y ver los
                resultados en tiempo real.
              </p>
              <Button
                size="lg"
                className="w-full"
                onClick={() => setDniModalOpen(true)}
              >
                Entrar como Usuario
              </Button>
            </div>
          </div>

          {/* Admin */}
          <div className="bg-white/60 dark:bg-black/60 backdrop-blur-md rounded-xl p-8 shadow-lg border border-white/10 dark:border-black/20 hover:shadow-xl transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mb-6">
                <Shield className="w-12 h-12 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-card-foreground">
                Administrador
              </h3>
              <p className="text-muted-foreground mb-6">
                Accede al panel de administración para gestionar candidatos y
                analizar resultados.
              </p>
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={() => setAdminModalOpen(true)}
              >
                Entrar como Administrador
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Features Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h3 className="mb-3 text-3xl font-bold text-foreground">Sistema Seguro y Confiable</h3>
              <p className="text-lg text-muted-foreground">
                Tecnología de vanguardia para garantizar elecciones transparentes
              </p>
            </div>
              <div className="grid gap-6 md:grid-cols-3">
              <Card className="p-6 bg-white/60 dark:bg-black/60 backdrop-blur-sm hover:shadow-lg transition-shadow border border-white/10 dark:border-black/20">
                <CheckCircle2 className="mb-4 h-12 w-12 text-success" />
                <h4 className="mb-2 text-xl font-semibold text-card-foreground">
                  Votación Segura
                </h4>
                <p className="text-muted-foreground">
                  Sistema de autenticación con DNI y encriptación de extremo a extremo
                </p>
              </Card>
              <Card className="p-6 bg-white/60 dark:bg-black/60 backdrop-blur-sm hover:shadow-lg transition-shadow border border-white/10 dark:border-black/20">
                <BarChart3 className="mb-4 h-12 w-12 text-primary" />
                <h4 className="mb-2 text-xl font-semibold text-card-foreground">
                  Resultados en Tiempo Real
                </h4>
                <p className="text-muted-foreground">
                  Visualización instantánea de resultados con gráficos interactivos
                </p>
              </Card>
              <Card className="p-6 bg-white/60 dark:bg-black/60 backdrop-blur-sm hover:shadow-lg transition-shadow border border-white/10 dark:border-black/20">
                <Database className="mb-4 h-12 w-12 text-accent" />
                <h4 className="mb-2 text-xl font-semibold text-card-foreground">
                  Análisis Avanzado
                </h4>
                <p className="text-muted-foreground">
                  Herramientas de análisis de datos y predicciones electorales
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section>
          <div className="container mx-auto px-4">
              <div className="mx-auto max-w-8xl">
              <h3 className="mb-6 text-center text-3xl font-bold text-foreground">
                Información Electoral
              </h3>
              <div className="grid gap-2 md:grid-cols-2">
              	      <Card className="p-8 bg-white/60 dark:bg-black/60 backdrop-blur-sm border border-white/10 dark:border-black/20">
	                <div className="space-y-4">
	                  <div>
	                    <h4 className="mb-2 font-semibold text-lg text-card-foreground">Fecha de Elecciones</h4>
	                    <p className="text-muted-foreground">Domingo 15 de Diciembre, 2024</p>
	                  </div>
	                  <div>
	                    <h4 className="mb-2 font-semibold text-lg text-card-foreground">Cargos a Elegir</h4>
	                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
	                      <li>Presidente de la República</li>
	                      <li>Alcaldes Municipales</li>
	                    </ul>
	                  </div>
	                  <div>
	                    <h4 className="mb-2 font-semibold text-lg text-card-foreground">Requisitos para Votar</h4>
	                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
	                      <li>Ser ciudadano mayor de 18 años</li>
	                      <li>Contar con DNI vigente</li>
	                      <li>Estar registrado en el padrón electoral</li>
	                    </ul>
	                  </div>
	                </div>
	              </Card>
              	      <Card className="relative p-2 bg-white/60 dark:bg-black/60 backdrop-blur-sm border border-white/10 dark:border-black/20">
									<Button size="lg" className="absolute right-2" onClick={() => setShowFirst(prev => !prev)}>
										<SwitchCamera className="w-[100px] h-[50px] scale-150" width={200} height={200} size={50} />
									</Button>
<iframe className={(showFirst ? "block" : "hidden") + " w-full h-full focus-visible:outline-none"}  src="https://viewer.diagrams.net/?tags=%7B%7D&lightbox=1&highlight=FFFFFF&layers=1&nav=1&transparent=1&dark=auto#R%3Cmxfile%3E%3Cdiagram%20name%3D%22Page-1%22%20id%3D%22gGuT3AzqFFvegHEhMBOz%22%3E7Vzbdps4FP0aP6aL%2B%2BUxcdKZzprpZDVr0vZRBtnWFCMP4MTp148EkgEBBhNAsdPkISAkIXS29rnoKDN9vtn%2FFoHt%2Bi%2Fsw2CmKf5%2Bpt%2FONE1TVYX8oSUvWYmqumZWsoqQz8ryggf0E7JC1nC1Qz6MSxUTjIMEbcuFHg5D6CWlMhBF%2BLlcbYmD8lu3YAUrBQ8eCKqlX5GfrLNSx1Ty8t8hWq35m1WFPdkAXpkVxGvg4%2BdCkX430%2BcRxkl2tdnPYUBnj89L1u5jw9PDwCIYJl0a3H%2F9%2Bw9FM6NH%2B4exAV%2B2T8G3b1d21ssTCHbsg2eaFZD%2Bbnz0RC5X9PJTuIpgDKJ0mjeY%2FHnECQgTyOuSlxaqs89NXvgcRngX%2BpAOQyGPn9cogQ9b4NGnzwQ2pGydbAJyp5LLEP8JFjBglTcwAXc%2BStjtEgXBHAc4SjvWfQCdpUfK4yTCP2DhieU5cLE8DOYJRgncN06cehAHATLE5KXRC6nCGug2kyDHMBf%2Bcw4IlUt5XQCDwcoAw%2BDq0HUuJnLBJHWC1JwTpXb7%2BdMYonoT0jisL2nScLtIIxUBrYN8PNM%2FdhXHGm8Wu%2FhkUSyXS82rFYVvLSzTGkgUjiAKt0YUSo0onLFEwbVGQRb3ZBEQFULYKh4W7SZ0fKNuih1toVsDTfFhStkUG45stKtqF7hfB0SFUsU9Ae1MIgjDfHOCMKpYB2Fmf0Gmoz00m%2BuzGz28AKI3FOkzblZmnE5ylPL5WTO3bUhn7k6W6F0A%2F0WpHQpCH%2FkgwRdr11i2dLh3MmzICqAewRe4QmR%2BiItzsRJxpNv9Wifd%2BwijVCDxLkguWR6udMufthfkMYdRlPpcD8TsxOH5qwZXulGvVQ2dypzC0L%2Bm0R5y5wUgjpFXnsoyuuEeJd%2Fo9QeT3X1n9ej17b5Q7faF34TkWwqN6O334rO8WXrH22VDhX4lzCQIRFOIJbGCyZGJsOsFVxCMWSMXXhbBACToqTyMOmGxN9xjRAaYG8C6EAXRBHnHeBd5kLUqxqHEjjShI0voKJuHSkcpdg6f%2FQo41UVPLhBOmTza4NQBdo5M2FXCPeq5wq7OmpocdgPCx%2BkIH1cmfDSlLHVd7wkfTfD%2FK%2BpuZPjoVVNjIPioBfDkUGphLbXEWTmFjc9a7jmwloiWA4udCjtdxK%2BodRtgR3AAXgrVtrRC3DxgU6tfJ03jEutzGztHfTaCYddAs0O6yP2arGCJ0%2BHmq8P6b4f5g6s43We8JhWc7T5rxR7zfj4X%2Faass%2FILSPGi0ZmiSGfbWMUFCAK0CunqpOFoYrvfUEsdeSC4Zg82yPdpHzc0aP0TLNL%2B6AJi8iOdmzcz8%2FaYqc92Qlnj2WF%2FpLjYjlBMo2NwpXywTS6CvuuDweVK1OJ4uYzhKMTJnb8R9G4f4iSzqChOmT0tw2jhz%2FTuHkaIzAYFjixSzWLO0lhVcE110YTrzKqCL6OLcByIVXXjNFYV6xuaNT6rGtWo9mis%2BoDeHasayqx2yRRZ1XTOjlXrwvXv0YlWu3rR2eaRNDdaMEjt3tEbtaWjkf0gY%2FjoTU%2Bfpo%2F%2FNCDwbKMr8KSGDQ86muOlryfUF3gne0KCbWApLZ6QWN%2BdwBNymzPAXquiK7q%2F5AlVLIKKHr8Ind0QPMh1tqK4xiDr45BUwHW46U6lw8263UR5npFyGv0OqcPNs6RSS9zX7EulpjuN%2B2M7p7k%2Fk1Cp3Zx4MjiV8oJ4C8J61yorm4PQI1iJ2p2lup7eKE3T9z%2BwN%2FKYzICcbR7f1qZ%2BluFqw3C2EPyc0O8yxzN%2F5e1rqw0uspyNbaNvVMkUaVUZh1ZF%2BuYDbqRVMXXVmoBWzbpY%2FdkDtYFjfgG1fsDHgdc6rkmAamknATXEIeyDUnVClEoN0g%2BGUkOI9h%2FQNFGkydLPjcHeisgd0Z%2FonqPjfrCtUl%2FuxPFFq5ps%2BBEdOz5BxXxiHqdJf5lFXCjPfmZ1WbTpz7FQxwknisQ8PoWzrrQ0WsuqzPmnEHkIX9C0V5LJpU%2F6rzTIclJ9q17NJkha9EcV123fVDYxjuROnMpmjZcJ2SfuKC%2BVjX93K%2FIsqRadGJZTFdES64w8V%2Bypo%2BcxWLCv%2BQDN4MG%2BUq7DWwzINWq13jE4qyHXt7hvYrwyg4z7iiUgTRiB43r83SfidmYvyf6owDlO38wHS1TAHQ8QnBo1sZQGRd84MKEBD6N0rc9PRoy7zVIXZvm1Yz0U89qtWWYO92xfu%2FnBU78kUG%2FVN%2F8n3oGIOorKC6BP6GHk8ztyKRjkJr8vOodGDUWOduTSOS01oDUoOqBnOFwgtT0vQOmq4aSG38QTu1ZfDVfZFxCDD0PlBZj17zl1XKMqLGfw8G9XZL6VMG5F%2FJ3DuGJHEx%2B1PBxPf%2Fc2evfMJqmnNCvB0d7IEzIz7JEym8Tjb22ZTWJ9x56AwVSlOdox%2BMmOOQ6XKNp0yVm6sAMejG2O2d628coDHnzvRlrekarU%2BW%2BDUOqZJYt2zruXrMzFdPnee7JiAv9YRqEw4La8e7G%2B%2BzqjkNzm%2F4o3q57%2FR2P97n8%3D%3C%2Fdiagram%3E%3C%2Fmxfile%3E" allowtransparency="true"></iframe>
									<div className={(showFirst ? "hidden" : "block") + " p-6 space-y-6"}>
	                  <div>
	                    <h4 className="font-semibold text-lg text-card-foreground">1. Da click en "Ingresar como Votante".</h4>
	                    <h4 className="font-semibold text-lg text-card-foreground">2. Se abre una ventana donde ingresa su DNI.</h4>
	                    <h4 className="font-semibold text-lg text-card-foreground">3. El sistema valida el DNI y lo lleva al Panel de Votación.</h4>
	                    <h4 className="mb-2 font-semibold text-lg text-card-foreground">4. El usuario elige la categoría donde quiere votar.</h4>
	                    <ul className="mb-2 list-disc list-inside space-y-1 text-muted-foreground">
	                      <li>Presidencia</li>
	                      <li>Alcaldía</li>
	                    </ul>
											<h4 className="font-semibold text-lg text-card-foreground">5. En cada categoría ve la lista de candidatos con su foto, nombre y botón de "Votar".</h4>
											<h4 className="font-semibold text-lg text-card-foreground">6. El usuario selecciona un candidato y confirma su voto en una ventana emergente.</h4>
											<h4 className="font-semibold text-lg text-card-foreground">7. El sistema registra el voto y marca la categoría como “Voto realizado”.</h4>
											<h4 className="mb-2 font-semibold text-lg text-card-foreground">8. El usuario puede ir a “Mis Resultados” para ver:</h4>
	                    <ul className="mb-2 list-disc list-inside space-y-1 text-muted-foreground">
	                      <li>A quién votó</li>
	                    </ul>
											<h4 className="font-semibold text-lg text-card-foreground">9. Finalmente, puede cerrar sesión o regresar al menú principal.</h4>
										</div>
	                </div>
	              </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Info Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12 text-sm text-muted-foreground"
        >
          <p>YART • Sistema de Votación Electrónica</p>
          <p className="mt-2">
            El futuro esta en la nueva generacion de dibujitos
          </p>
        </motion.footer>
      </div>

      <DniModal open={dniModalOpen} onClose={() => setDniModalOpen(false)} />
      <AdminAuthModal
        open={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
      />
    </div>
  );
}
