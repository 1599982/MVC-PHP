import { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useApp } from "@/contexts/AppContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
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

export function UserResults() {
  const { userSession } = useApp();

  const [presidenciaCandidates, setPresidenciaCandidates] = useState<ApiCandidate[]>([]);
  const [alcaldiaCandidates, setAlcaldiaCandidates] = useState<ApiCandidate[]>([]);
  const [votedPresidentDni, setVotedPresidentDni] = useState<string | null>(null);
  const [votedMayorDni, setVotedMayorDni] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos del usuario y candidatos desde la API
  useEffect(() => {
    const fetchData = async () => {
      if (!userSession?.dni) return;

      try {
        setLoading(true);

        // Obtener información de la persona (incluye votos)
        const personResponse = await fetch(
          "http://localhost:8080/api/persons/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ dni: userSession.dni }),
          }
        );

        if (personResponse.ok) {
          const personData = await personResponse.json();
          setVotedPresidentDni(personData.votedPresidentDni);
          setVotedMayorDni(personData.votedMayorDni);
        }

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
        console.error("Error al cargar datos:", error);
        toast.error("Error al cargar los resultados");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userSession?.dni]);

  const votedPresidente = presidenciaCandidates.find(
    (c) => c.dni === votedPresidentDni
  );
  const votedAlcalde = alcaldiaCandidates.find(
    (c) => c.dni === votedMayorDni
  );

  const totalPresidenciaVotes = presidenciaCandidates.reduce(
    (sum, c) => sum + c.votes,
    0
  );
  const totalAlcaldiaVotes = alcaldiaCandidates.reduce(
    (sum, c) => sum + c.votes,
    0
  );

  const presidenciaData = presidenciaCandidates.map((c) => ({
    name: c.nombre,
    votos: c.votes,
    percentage:
      totalPresidenciaVotes > 0
        ? ((c.votes / totalPresidenciaVotes) * 100).toFixed(1)
        : 0,
  }));

  const alcaldiaData = alcaldiaCandidates.map((c) => ({
    name: c.nombre,
    votos: c.votes,
    percentage:
      totalAlcaldiaVotes > 0
        ? ((c.votes / totalAlcaldiaVotes) * 100).toFixed(1)
        : 0,
  }));

  // Obtener líderes
  const getLeader = (candidates: ApiCandidate[]) => {
    if (candidates.length === 0) return null;
    return candidates.reduce((max, c) => {
      if (!max || c.votes > max.votes) return c;
      return max;
    }, null as ApiCandidate | null);
  };

  const presidentLeader = getLeader(presidenciaCandidates);
  const mayorLeader = getLeader(alcaldiaCandidates);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-muted-foreground">Cargando resultados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* User Votes */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-foreground">Tus Votos</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                Presidente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {votedPresidente ? (
                <div className="flex items-center gap-4">
                  <img
                    src={votedPresidente.imageUri}
                    alt={votedPresidente.nombre}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-lg">
                      {votedPresidente.nombre}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {votedPresidente.politicalParty}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No has votado aún</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                Alcalde
              </CardTitle>
            </CardHeader>
            <CardContent>
              {votedAlcalde ? (
                <div className="flex items-center gap-4">
                  <img
                    src={votedAlcalde.imageUri}
                    alt={votedAlcalde.nombre}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-lg">{votedAlcalde.nombre}</p>
                    <p className="text-sm text-muted-foreground">
                      {votedAlcalde.politicalParty}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No has votado aún</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Results Charts */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-foreground">
          Resultados Generales
        </h2>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Resultados - Presidente</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={presidenciaData}>
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
                  <Line
                    type="monotone"
                    dataKey="votos"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resultados - Alcalde</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={alcaldiaData}>
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
                  <Line
                    type="monotone"
                    dataKey="votos"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Comparativa de Votos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={[
                  ...presidenciaData.map((d) => ({
                    ...d,
                    category: "Presidencia",
                  })),
                  ...alcaldiaData.map((d) => ({ ...d, category: "Alcaldía" })),
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="votos"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detailed Results Tables: separado por Presidencia y Alcaldía */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Resultados - Presidencia</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const total = totalPresidenciaVotes;
                const rows = presidenciaCandidates
                  .slice()
                  .sort((a, b) => b.votes - a.votes)
                  .map((c, i) => ({
                    position: i + 1,
                    name: c.nombre,
                    party: c.politicalParty,
                    votos: c.votes,
                    percentage:
                      total > 0
                        ? Number(((c.votes / total) * 100).toFixed(1))
                        : 0,
                  }));

                const getPartyColor = (party: string) => {
                  switch ((party || "").toLowerCase()) {
                    case "partido progreso":
                      return "bg-blue-500 text-white";
                    case "unidad nacional":
                      return "bg-red-500 text-white";
                    case "verdes por el cambio":
                      return "bg-green-500 text-white";
                    case "frente democrático":
                      return "bg-yellow-600 text-white";
                    default:
                      return "bg-gray-200 text-gray-800";
                  }
                };

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="text-xs text-muted-foreground">
                          <th className="px-4 py-3">Pos</th>
                          <th className="px-4 py-3">Candidato</th>
                          <th className="px-4 py-3">Partido</th>
                          <th className="px-4 py-3">Votos</th>
                          <th className="px-4 py-3">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => (
                          <tr key={row.position} className="border-t">
                            <td className="px-4 py-3 align-middle">
                              {row.position}
                            </td>
                            <td className="px-4 py-3 align-middle">
                              {row.name}
                            </td>
                            <td className="px-4 py-3 align-middle">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPartyColor(
                                  row.party
                                )}`}
                              >
                                {row.party}
                              </span>
                            </td>
                            <td className="px-4 py-3 align-middle">
                              {row.votos.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 align-middle w-24 text-right">
                              {row.percentage}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resultados - Alcaldía</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const total = totalAlcaldiaVotes;
                const rows = alcaldiaCandidates
                  .slice()
                  .sort((a, b) => b.votes - a.votes)
                  .map((c, i) => ({
                    position: i + 1,
                    name: c.nombre,
                    party: c.politicalParty,
                    votos: c.votes,
                    percentage:
                      total > 0
                        ? Number(((c.votes / total) * 100).toFixed(1))
                        : 0,
                  }));

                const getPartyColor = (party: string) => {
                  switch ((party || "").toLowerCase()) {
                    case "partido progreso":
                      return "bg-blue-500 text-white";
                    case "unidad nacional":
                      return "bg-red-500 text-white";
                    case "verdes por el cambio":
                      return "bg-green-500 text-white";
                    case "frente democrático":
                      return "bg-yellow-600 text-white";
                    default:
                      return "bg-gray-200 text-gray-800";
                  }
                };

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="text-xs text-muted-foreground">
                          <th className="px-4 py-3">Pos</th>
                          <th className="px-4 py-3">Candidato</th>
                          <th className="px-4 py-3">Partido</th>
                          <th className="px-4 py-3">Votos</th>
                          <th className="px-4 py-3">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => (
                          <tr key={row.position} className="border-t">
                            <td className="px-4 py-3 align-middle">
                              {row.position}
                            </td>
                            <td className="px-4 py-3 align-middle">
                              {row.name}
                            </td>
                            <td className="px-4 py-3 align-middle">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPartyColor(
                                  row.party
                                )}`}
                              >
                                {row.party}
                              </span>
                            </td>
                            <td className="px-4 py-3 align-middle">
                              {row.votos.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 align-middle w-24 text-right">
                              {row.percentage}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats */}
      <section>
        <div className="grid md:grid-cols-3 gap-4">
          {/* Primera fila: Total de Votos, Líder Presidente, Líder Alcalde */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total de Votos (General)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {totalPresidenciaVotes + totalAlcaldiaVotes}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Presidencia: {totalPresidenciaVotes} | Alcaldía: {totalAlcaldiaVotes}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Candidato Líder Presidente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {presidentLeader ? presidentLeader.nombre : "N/A"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Votos: {presidentLeader ? presidentLeader.votes : 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Candidato Líder Alcalde</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {mayorLeader ? mayorLeader.nombre : "N/A"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Votos: {mayorLeader ? mayorLeader.votes : 0}
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
      </section>
    </div>
  );
}
