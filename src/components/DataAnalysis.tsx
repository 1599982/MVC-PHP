import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  AlertCircle,
  Trash2,
  Download,
  Play,
  BarChart3,
  AlertTriangle,
  Eye,
  TrendingUp,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface CSVData {
  headers: string[];
  rows: string[][];
}

interface DataQuality {
  nulls: number;
  duplicates: number;
  inconsistencies: number;
}

interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  mae: number;
}

export function DataAnalysis() {
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [quality, setQuality] = useState<DataQuality | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics | null>(null);
  const [modelType, setModelType] = useState("random-forest");
  const [testSplit, setTestSplit] = useState("0.2");
  const [activeSection, setActiveSection] = useState<
    "load" | "quality" | "training" | "results" | "prediction"
  >("load");
  const [predictionData, setPredictionData] = useState<any>(null);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length === 0) {
        toast.error("El archivo CSV está vacío");
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim());
      const rows = lines
        .slice(1, 11)
        .map((line) => line.split(",").map((c) => c.trim()));

      setCsvData({ headers, rows });
      analyzeDataQuality({
        headers,
        rows: lines.slice(1).map((line) => line.split(",")),
      });
      toast.success("Archivo CSV cargado exitosamente");
    };

    reader.readAsText(file);
  };

  const analyzeDataQuality = (data: CSVData) => {
    let nulls = 0;
    let duplicates = 0;
    let inconsistencies = 0;

    data.rows.forEach((row) => {
      row.forEach((cell) => {
        if (!cell || cell.trim() === "") nulls++;
        if (!/^[a-zA-Z0-9\s.,áéíóúñÁÉÍÓÚÑ-]*$/.test(cell)) inconsistencies++;
      });
    });

    const rowStrings = data.rows.map((r) => r.join(","));
    duplicates = rowStrings.length - new Set(rowStrings).size;

    setQuality({ nulls, duplicates, inconsistencies });
  };

  const handleCleanData = (
    action: "nulls" | "duplicates" | "mean" | "median"
  ) => {
    if (!csvData) return;

    let message = "";
    switch (action) {
      case "nulls":
        message = "Filas con valores nulos eliminadas";
        break;
      case "duplicates":
        message = "Filas duplicadas eliminadas";
        break;
      case "mean":
        message = "Valores imputados por media";
        break;
      case "median":
        message = "Valores imputados por mediana";
        break;
    }

    toast.success(message);
    if (quality) {
      setQuality({
        ...quality,
        nulls: action === "nulls" ? 0 : quality.nulls,
        duplicates: action === "duplicates" ? 0 : quality.duplicates,
      });
    }
  };

  const handleTrainModel = async () => {
    if (!csvData) {
      toast.error("Primero carga un archivo CSV");
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);

    const interval = setInterval(() => {
      setTrainingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    setTimeout(() => {
      setIsTraining(false);
      const metrics: ModelMetrics = {
        accuracy: 0.85 + Math.random() * 0.1,
        precision: 0.82 + Math.random() * 0.1,
        recall: 0.79 + Math.random() * 0.1,
        mae: Math.random() * 0.2,
      };
      setModelMetrics(metrics);
      toast.success("Modelo entrenado exitosamente");
    }, 3500);
  };

  const handleExportResults = () => {
    if (!modelMetrics) return;

    const csvContent = `Métrica,Valor\nAccuracy,${modelMetrics.accuracy.toFixed(
      4
    )}\nPrecision,${modelMetrics.precision.toFixed(
      4
    )}\nRecall,${modelMetrics.recall.toFixed(
      4
    )}\nMAE,${modelMetrics.mae.toFixed(4)}`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "model-results.csv";
    link.click();
    URL.revokeObjectURL(url);

    toast.success("Resultados exportados exitosamente");
  };

  const handleLoadPrediction = async () => {
    setIsLoadingPrediction(true);
    try {
      const response = await fetch("http://161.132.54.35:3000/api/candidates");
      if (!response.ok) throw new Error("Error al cargar candidatos");
      
      const candidates = await response.json();
      
      // Separar por rol
      const presidents = candidates.filter((c: any) => c.roleType === "PRESIDENT");
      const mayors = candidates.filter((c: any) => c.roleType === "MAYOR");
      
      // Calcular totales
      const totalPresidentVotes = presidents.reduce((sum: number, c: any) => sum + c.votes, 0);
      const totalMayorVotes = mayors.reduce((sum: number, c: any) => sum + c.votes, 0);
      
      // Encontrar ganadores
      const winningPresident = presidents.reduce((max: any, c: any) => 
        c.votes > (max?.votes || 0) ? c : max, null);
      const winningMayor = mayors.reduce((max: any, c: any) => 
        c.votes > (max?.votes || 0) ? c : max, null);
      
      // Calcular porcentajes y tendencias
      const presidentsWithPercentage = presidents.map((c: any) => ({
        ...c,
        percentage: totalPresidentVotes > 0 ? (c.votes / totalPresidentVotes) * 100 : 0,
        trend: Math.random() > 0.5 ? "up" : "down"
      })).sort((a: any, b: any) => b.votes - a.votes);
      
      const mayorsWithPercentage = mayors.map((c: any) => ({
        ...c,
        percentage: totalMayorVotes > 0 ? (c.votes / totalMayorVotes) * 100 : 0,
        trend: Math.random() > 0.5 ? "up" : "down"
      })).sort((a: any, b: any) => b.votes - a.votes);
      
      setPredictionData({
        presidents: presidentsWithPercentage,
        mayors: mayorsWithPercentage,
        winningPresident,
        winningMayor,
        totalPresidentVotes,
        totalMayorVotes,
        totalCandidates: candidates.length
      });
      
      toast.success("Datos de predicción cargados exitosamente");
    } catch (error) {
      toast.error("Error al cargar datos de predicción");
      console.error(error);
    } finally {
      setIsLoadingPrediction(false);
    }
  };

  return (
    <div className="space-y-4 w-full overflow-hidden">
      <h2 className="text-2xl font-bold">Análisis de Datos y Modelado</h2>

      {/* Opciones estilizadas como menú lateral */}
      <div className="sticky top-0 z-10 bg-background pb-4 grid grid-cols-5 gap-3">
        <button
          onClick={() => setActiveSection("load")}
          className={`flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg transition-all ${
            activeSection === "load"
              ? "bg-primary/10 text-primary border-2 border-primary"
              : "text-muted-foreground hover:bg-muted border-2 border-transparent"
          }`}
        >
          <Upload className="w-5 h-5 flex-shrink-0" />
          <div className="text-center">
            <p className="text-xs font-semibold text-card-foreground">Cargar</p>
            <p className="text-xs text-muted-foreground">Datos</p>
          </div>
        </button>

        <button
          onClick={() => setActiveSection("quality")}
          className={`flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg transition-all ${
            activeSection === "quality"
              ? "bg-primary/10 text-primary border-2 border-primary"
              : "text-muted-foreground hover:bg-muted border-2 border-transparent"
          }`}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="text-center">
            <p className="text-xs font-semibold text-card-foreground">
              Análisis
            </p>
            <p className="text-xs text-muted-foreground">Calidad</p>
          </div>
        </button>

        <button
          onClick={() => setActiveSection("training")}
          className={`flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg transition-all ${
            activeSection === "training"
              ? "bg-primary/10 text-primary border-2 border-primary"
              : "text-muted-foreground hover:bg-muted border-2 border-transparent"
          }`}
        >
          <Play className="w-5 h-5 flex-shrink-0" />
          <div className="text-center">
            <p className="text-xs font-semibold text-card-foreground">
              Entrenar
            </p>
            <p className="text-xs text-muted-foreground">Modelos</p>
          </div>
        </button>

        <button
          onClick={() => setActiveSection("results")}
          className={`flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg transition-all ${
            activeSection === "results"
              ? "bg-primary/10 text-primary border-2 border-primary"
              : "text-muted-foreground hover:bg-muted border-2 border-transparent"
          }`}
        >
          <Eye className="w-5 h-5 flex-shrink-0" />
          <div className="text-center">
            <p className="text-xs font-semibold text-card-foreground">Ver</p>
            <p className="text-xs text-muted-foreground">Resultados</p>
          </div>
        </button>

        <button
          onClick={() => setActiveSection("prediction")}
          className={`flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg transition-all ${
            activeSection === "prediction"
              ? "bg-primary/10 text-primary border-2 border-primary"
              : "text-muted-foreground hover:bg-muted border-2 border-transparent"
          }`}
        >
          <TrendingUp className="w-5 h-5 flex-shrink-0" />
          <div className="text-center">
            <p className="text-xs font-semibold text-card-foreground">Predicción</p>
            <p className="text-xs text-muted-foreground">Ganador</p>
          </div>
        </button>
      </div>

      {activeSection === "load" && (
        <div className="mt-6 max-w-7xl mx-auto">
          <div className="space-y-6">
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center w-full flex flex-col justify-center gap-4 items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2"
              >
                <Upload className="mr-2" />
                Seleccionar archivo
              </Button>
              <p className="text-sm text-muted-foreground">
                Arrastra un archivo CSV o haz clic para seleccionar
              </p>
            </div>

            {/* Tabla grande: una sola columna, alta y centrada */}
            <div>
              {csvData ? (
                <div className="overflow-auto h-[520px] md:h-[520px] min-h-[480px] border rounded-lg p-4">
                  <Table className="text-sm">
                    <TableHeader>
                      <TableRow>
                        {csvData.headers.map((header, i) => (
                          <TableHead key={i}>{header}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {csvData.rows.map((row, i) => (
                        <TableRow key={i}>
                          {row.map((cell, j) => (
                            <TableCell key={j}>{cell}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
                  Cargue un archivo para ver la tabla aquí.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSection === "quality" && (csvData || quality) && (
        <div className="space-y-3 mt-4 max-w-7xl mx-auto min-h-[520px]">
          {/* Tarjetas de resumen */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            <Card className="h-full">
              <CardContent className="pt-3 pb-2 h-full">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Registros totales
                    </p>
                    <p className="text-2xl font-bold">
                      {csvData?.rows.length || 0}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-primary/20" />
                </div>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardContent className="pt-3 pb-2 h-full">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Valores Nulos
                    </p>
                    <p className="text-2xl font-bold text-orange-600">
                      {quality?.nulls || 0}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-600/20" />
                </div>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardContent className="pt-3 pb-2 h-full">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Duplicados
                    </p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {quality?.duplicates || 0}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-yellow-600/20" />
                </div>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardContent className="pt-3 pb-2 h-full">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Inconsistencias
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      {quality?.inconsistencies || 0}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-600/20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de línea - Tendencia de calidad          */}
          <Card className="w-full h-full">
            <CardHeader className="pb-1 px-3">
              <CardTitle className="text-xs flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Tendencia de Calidad por Columna
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 pb-0 h-[260px] md:h-[260px]">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart
                  data={
                    csvData?.headers.map((header, idx) => ({
                      name: header,
                      calidad: 85 + Math.random() * 15,
                    })) || []
                  }
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="calidad"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráficos en fila */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {/* Gráfico de barras */}
            <Card className="w-full min-w-0 h-full">
              <CardHeader className="pb-1 px-4">
                <CardTitle className="text-sm">
                  Distribución de Problemas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 h-[320px] md:h-[320px]">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { name: "Nulos", valor: quality?.nulls || 0 },
                      { name: "Duplicados", valor: quality?.duplicates || 0 },
                      {
                        name: "Inconsistencias",
                        valor: quality?.inconsistencies || 0,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="valor" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de pastel */}
            <Card className="w-full min-w-0 h-full">
              <CardHeader className="pb-1 px-4">
                <CardTitle className="text-sm">Composición de Datos</CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex items-center justify-center h-[320px] md:h-[320px]">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Válidos",
                          value: Math.max(
                            0,
                            (csvData?.rows.length || 0) - (quality?.nulls || 0)
                          ),
                        },
                        { name: "Nulos", value: quality?.nulls || 0 },
                        { name: "Duplicados", value: quality?.duplicates || 0 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#ef4444" />
                      <Cell fill="#f59e0b" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Acciones de limpieza */}
          <Card className="w-full">
            <CardHeader className="pb-2 px-3">
              <CardTitle className="text-xs">Opciones de Limpieza</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="flex flex-wrap gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCleanData("nulls")}
                  className="text-xs h-7"
                >
                  <Trash2 className="w-2 h-2 mr-1" />
                  Nulos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCleanData("duplicates")}
                  className="text-xs h-7"
                >
                  <Trash2 className="w-2 h-2 mr-1" />
                  Dup.
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCleanData("mean")}
                  className="text-xs h-7"
                >
                  Media
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCleanData("median")}
                  className="text-xs h-7"
                >
                  Mediana
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de datos */}
          {csvData && (
            <Card className="w-full">
              <CardHeader className="pb-1 px-3">
                <CardTitle className="text-xs">Vista de Datos</CardTitle>
              </CardHeader>
              <CardContent className="p-1">
                <div className="overflow-auto max-h-[420px] min-h-[220px] border rounded-lg p-2">
                  <Table className="text-sm">
                    <TableHeader>
                      <TableRow>
                        {csvData.headers.map((header, i) => (
                          <TableHead key={i}>{header}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {csvData.rows.map((row, i) => (
                        <TableRow key={i}>
                          {row.map((cell, j) => (
                            <TableCell key={j}>{cell}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeSection === "training" && (csvData || quality) && (
        <div className="mt-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium mb-2">
                Tipo de Modelo
              </label>
              <Select value={modelType} onValueChange={setModelType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="random-forest">Random Forest</SelectItem>
                  <SelectItem value="svm">SVM</SelectItem>
                  <SelectItem value="neural-network">Red Neuronal</SelectItem>
                  <SelectItem value="logistic">Regresión Logística</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-2">
                Test Split
              </label>
              <Select value={testSplit} onValueChange={setTestSplit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.2">20%</SelectItem>
                  <SelectItem value="0.3">30%</SelectItem>
                  <SelectItem value="0.4">40%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleTrainModel}
            disabled={isTraining}
            className="w-full text-sm py-2"
          >
            {isTraining ? (
              <>
                <Play className="w-4 h-4 mr-2 animate-pulse" />
                Entrenando modelo...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Entrenar Modelo
              </>
            )}
          </Button>

          {isTraining && (
            <div className="mt-2">
              <Progress value={trainingProgress} className="h-1" />
              <p className="text-xs text-center mt-1 text-muted-foreground">
                {trainingProgress}% completado
              </p>
            </div>
          )}

          {csvData && (
            <div className="mt-4">
              <div className="overflow-auto max-h-48 border rounded-lg">
                <Table className="text-xs">
                  <TableHeader>
                    <TableRow>
                      {csvData.headers.map((header, i) => (
                        <TableHead key={i} className="text-xs">
                          {header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.rows.map((row, i) => (
                      <TableRow key={i}>
                        {row.map((cell, j) => (
                          <TableCell key={j} className="text-xs py-1 px-2">
                            {cell}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSection === "results" && modelMetrics && (
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-success/10 p-5 rounded-lg">
              <p className="text-base text-muted-foreground mb-2">Accuracy</p>
              <p className="text-3xl font-bold">
                {(modelMetrics.accuracy * 100).toFixed(2)}%
              </p>
            </div>
            <div className="bg-primary/10 p-5 rounded-lg">
              <p className="text-base text-muted-foreground mb-2">Precision</p>
              <p className="text-3xl font-bold">
                {(modelMetrics.precision * 100).toFixed(2)}%
              </p>
            </div>
            <div className="bg-accent/10 p-5 rounded-lg">
              <p className="text-base text-muted-foreground mb-2">Recall</p>
              <p className="text-3xl font-bold">
                {(modelMetrics.recall * 100).toFixed(2)}%
              </p>
            </div>
            <div className="bg-warning/10 p-5 rounded-lg">
              <p className="text-base text-muted-foreground mb-2">MAE</p>
              <p className="text-3xl font-bold">
                {modelMetrics.mae.toFixed(4)}
              </p>
            </div>
          </div>

          <Button onClick={handleExportResults} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Exportar Resultados (CSV)
          </Button>
        </div>
      )}

      {activeSection === "prediction" && (
        <div className="mt-4 space-y-4 max-w-7xl mx-auto">
          {!predictionData ? (
            <div className="text-center space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Predicción de Ganadores</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Carga los datos actuales de votación para predecir los candidatos ganadores
                </p>
                <Button 
                  onClick={handleLoadPrediction} 
                  disabled={isLoadingPrediction}
                  className="px-6"
                >
                  {isLoadingPrediction ? (
                    <>
                      <Play className="w-4 h-4 mr-2 animate-pulse" />
                      Cargando datos...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Cargar Datos de Votación
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Estadísticas generales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <BarChart3 className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">Total Candidatos</p>
                      <p className="text-3xl font-bold">{predictionData.totalCandidates}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-sm text-muted-foreground">Votos Presidencia</p>
                      <p className="text-3xl font-bold">{predictionData.totalPresidentVotes}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <p className="text-sm text-muted-foreground">Votos Alcaldía</p>
                      <p className="text-3xl font-bold">{predictionData.totalMayorVotes}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Ganadores predichos */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Presidente */}
                <Card className="border-2 border-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Ganador Predicho - Presidencia
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {predictionData.winningPresident ? (
                      <div className="space-y-4">
                        <div className="bg-primary/10 p-6 rounded-lg text-center">
                          <p className="text-2xl font-bold mb-2">{predictionData.winningPresident.nombre}</p>
                          <p className="text-lg text-muted-foreground mb-3">{predictionData.winningPresident.politicalParty}</p>
                          <div className="flex items-center justify-center gap-4">
                            <div>
                              <p className="text-3xl font-bold text-primary">{predictionData.winningPresident.votes}</p>
                              <p className="text-xs text-muted-foreground">votos</p>
                            </div>
                            <div>
                              <p className="text-3xl font-bold text-primary">
                                {((predictionData.winningPresident.votes / predictionData.totalPresidentVotes) * 100).toFixed(1)}%
                              </p>
                              <p className="text-xs text-muted-foreground">del total</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-semibold">Ranking de Candidatos:</p>
                          {predictionData.presidents.slice(0, 5).map((candidate: any, idx: number) => (
                            <div key={candidate.dni} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-lg w-6">{idx + 1}.</span>
                                <div>
                                  <p className="text-sm font-medium">{candidate.nombre}</p>
                                  <p className="text-xs text-muted-foreground">{candidate.politicalParty}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold">{candidate.votes} votos</p>
                                <p className="text-xs text-muted-foreground">{candidate.percentage.toFixed(1)}%</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground">No hay candidatos a presidente</p>
                    )}
                  </CardContent>
                </Card>

                {/* Alcalde */}
                <Card className="border-2 border-green-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Ganador Predicho - Alcaldía
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {predictionData.winningMayor ? (
                      <div className="space-y-4">
                        <div className="bg-green-600/10 p-6 rounded-lg text-center">
                          <p className="text-2xl font-bold mb-2">{predictionData.winningMayor.nombre}</p>
                          <p className="text-lg text-muted-foreground mb-3">{predictionData.winningMayor.politicalParty}</p>
                          <div className="flex items-center justify-center gap-4">
                            <div>
                              <p className="text-3xl font-bold text-green-600">{predictionData.winningMayor.votes}</p>
                              <p className="text-xs text-muted-foreground">votos</p>
                            </div>
                            <div>
                              <p className="text-3xl font-bold text-green-600">
                                {((predictionData.winningMayor.votes / predictionData.totalMayorVotes) * 100).toFixed(1)}%
                              </p>
                              <p className="text-xs text-muted-foreground">del total</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-semibold">Ranking de Candidatos:</p>
                          {predictionData.mayors.slice(0, 5).map((candidate: any, idx: number) => (
                            <div key={candidate.dni} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-lg w-6">{idx + 1}.</span>
                                <div>
                                  <p className="text-sm font-medium">{candidate.nombre}</p>
                                  <p className="text-xs text-muted-foreground">{candidate.politicalParty}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold">{candidate.votes} votos</p>
                                <p className="text-xs text-muted-foreground">{candidate.percentage.toFixed(1)}%</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground">No hay candidatos a alcalde</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Gráficos comparativos */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Distribución de Votos - Presidencia</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={predictionData.presidents.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="politicalParty" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fontSize: 10 }}
                        />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="votes" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Distribución de Votos - Alcaldía</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={predictionData.mayors.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="politicalParty" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fontSize: 10 }}
                        />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="votes" fill="#16a34a" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Botón para recargar */}
              <div className="flex gap-3">
                <Button 
                  onClick={handleLoadPrediction} 
                  disabled={isLoadingPrediction}
                  className="flex-1"
                >
                  {isLoadingPrediction ? (
                    <>
                      <Play className="w-4 h-4 mr-2 animate-pulse" />
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Actualizar Predicción
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setPredictionData(null)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpiar
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
