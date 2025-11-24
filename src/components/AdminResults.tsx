import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { Button } from "./ui/button";
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

export function AdminResults() {
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "presidencia" | "alcaldia"
  >("all");
  const [presidenciaCandidates, setPresidenciaCandidates] = useState<ApiCandidate[]>([]);
  const [alcaldiaCandidates, setAlcaldiaCandidates] = useState<ApiCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar candidatos desde la API
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);

        // Cargar presidentes
        const presidentResponse = await fetch(
          "http://localhost:8080/api/candidates/role/PRESIDENT"
        );
        if (presidentResponse.ok) {
          const presidentData = await presidentResponse.json();
          setPresidenciaCandidates(presidentData);
        }

        // Cargar alcaldes
        const mayorResponse = await fetch(
          "http://localhost:8080/api/candidates/role/MAYOR"
        );
        if (mayorResponse.ok) {
          const mayorData = await mayorResponse.json();
          setAlcaldiaCandidates(mayorData);
        }
      } catch (error) {
        console.error("Error al cargar candidatos:", error);
        toast.error("Error al cargar los resultados");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  const getChartData = (category: "presidencia" | "alcaldia") => {
    const filtered =
      category === "presidencia" ? presidenciaCandidates : alcaldiaCandidates;
    return filtered.map((c) => ({
      name: c.nombre,
      votos: c.votes,
      partido: c.politicalParty,
    }));
  };

  const getTotalVotes = (category: "presidencia" | "alcaldia") => {
    return (
      category === "presidencia" ? presidenciaCandidates : alcaldiaCandidates
    ).reduce((sum, c) => sum + c.votes, 0);
  };

  const presidenciaData = getChartData("presidencia");
  const alcaldiaData = getChartData("alcaldia");
  const presidenciaTotalVotes = getTotalVotes("presidencia");
  const alcaldiaTotalVotes = getTotalVotes("alcaldia");
  const totalVotes = presidenciaTotalVotes + alcaldiaTotalVotes;

  // Get filtered candidates based on selected category
  const getFilteredCandidates = () => {
    if (selectedCategory === "presidencia") return presidenciaCandidates;
    if (selectedCategory === "alcaldia") return alcaldiaCandidates;
    return [...presidenciaCandidates, ...alcaldiaCandidates];
  };

  const filteredCandidates = getFilteredCandidates();
  const filteredTotal = filteredCandidates.reduce((sum, c) => sum + c.votes, 0);

  // Simulated time series data based on selected category
  const timeSeriesData = [
    { time: "08:00", votos: Math.floor(filteredTotal * 0.1) },
    { time: "10:00", votos: Math.floor(filteredTotal * 0.3) },
    { time: "12:00", votos: Math.floor(filteredTotal * 0.5) },
    { time: "14:00", votos: Math.floor(filteredTotal * 0.7) },
    { time: "16:00", votos: Math.floor(filteredTotal * 0.9) },
    { time: "18:00", votos: filteredTotal },
  ];

  // Get leader for specific category
  const getLeaderByCategory = (category: "presidencia" | "alcaldia") => {
    const candidates = category === "presidencia" ? presidenciaCandidates : alcaldiaCandidates;
    if (candidates.length === 0) return "N/A";
    const leader = candidates.reduce((max, c) => {
      if (!max || c.votes > max.votes) return c;
      return max;
    }, null as ApiCandidate | null);
    return leader ? leader.nombre : "N/A";
  };



  const handleExport = () => {
    // Preparar datos para CSV con campos útiles para predicción
    const csvData = [];
    
    // Headers del CSV
    csvData.push([
      "Categoría",
      "DNI",
      "Nombre",
      "Partido Político",
      "Votos",
      "Porcentaje",
      "Posición",
      "Estado",
      "Diferencia con Líder",
      "Fecha Exportación"
    ]);

    // Función para calcular datos de predicción
    const addCandidateData = (candidates: typeof presidenciaCandidates, category: string) => {
      const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);
      const sortedCandidates = [...candidates].sort((a, b) => b.votes - a.votes);
      const leaderVotes = sortedCandidates[0]?.votes || 0;

      sortedCandidates.forEach((candidate, index) => {
        const percentage = totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(2) : "0.00";
        const position = index + 1;
        const status = position === 1 ? "Líder" : position === 2 ? "Segundo" : position === 3 ? "Tercero" : "Otros";
        const diffWithLeader = leaderVotes - candidate.votes;

        csvData.push([
          category,
          candidate.dni,
          `"${candidate.nombre}"`, // Comillas para nombres con comas
          `"${candidate.politicalParty}"`,
          candidate.votes,
          percentage,
          position,
          status,
          diffWithLeader,
          new Date().toISOString()
        ]);
      });
    };

    // Agregar datos de presidentes
    addCandidateData(presidenciaCandidates, "Presidente");
    
    // Agregar datos de alcaldes
    addCandidateData(alcaldiaCandidates, "Alcalde");

    // Agregar resumen al final
    csvData.push([]);
    csvData.push(["RESUMEN GENERAL"]);
    csvData.push(["Total Votos Presidencia", "", "", "", presidenciaTotalVotes]);
    csvData.push(["Total Votos Alcaldía", "", "", "", alcaldiaTotalVotes]);
    csvData.push(["Total Votos General", "", "", "", totalVotes]);
    csvData.push(["Total Candidatos", "", "", "", presidenciaCandidates.length + alcaldiaCandidates.length]);

    // Convertir a CSV
    const csvContent = csvData.map(row => row.join(",")).join("\n");
    
    // Crear y descargar archivo
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `resultados-electorales-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-muted-foreground">Cargando resultados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center relative z-10">
        <h2 className="text-2xl font-bold">Resultados Generales</h2>
        <div className="flex gap-4 items-center relative">
          <Select
            value={selectedCategory}
            onValueChange={(v: any) => setSelectedCategory(v)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="all">Todas las categorías</SelectItem>
              <SelectItem value="presidencia">Solo Presidencia</SelectItem>
              <SelectItem value="alcaldia">Solo Alcaldía</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {(selectedCategory === "all" || selectedCategory === "presidencia") && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados - Presidente</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={presidenciaData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="votos" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {(selectedCategory === "all" || selectedCategory === "alcaldia") && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados - Alcalde</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={alcaldiaData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="votos" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}


        {(selectedCategory === "all" || selectedCategory === "alcaldia") && (
          <Card>
            <CardHeader>
              <CardTitle>Evolución de Votos (Serie Temporal)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="votos"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Primera fila: Total de Votos, Líder Presidente, Líder Alcalde */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total de Votos (General)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalVotes}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Presidencia: {presidenciaTotalVotes} | Alcaldía: {alcaldiaTotalVotes}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Candidato Líder Presidente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{getLeaderByCategory("presidencia")}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Votos: {presidenciaCandidates.length > 0 ? Math.max(...presidenciaCandidates.map(c => c.votes)) : 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Candidato Líder Alcalde</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{getLeaderByCategory("alcaldia")}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Votos: {alcaldiaCandidates.length > 0 ? Math.max(...alcaldiaCandidates.map(c => c.votes)) : 0}
            </p>
          </CardContent>
        </Card>

        {/* Segunda fila: Candidatos Registrados */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Candidatos Presidenciales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{presidenciaCandidates.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Candidatos a Alcalde</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{alcaldiaCandidates.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Candidatos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {presidenciaCandidates.length + alcaldiaCandidates.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">En el sistema</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
