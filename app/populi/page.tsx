"use client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, GraduationCap, Clock, Loader2 } from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleLinear } from "d3-scale";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// URL corregida a la rama 'main' para evitar el 404
// Usamos la versión .geo.json que es 100% compatible nativamente con react-simple-maps
    const GEOURL_MEXICO = "https://code.highcharts.com/mapdata/countries/mx/mx-all.geo.json";

// Diccionario de Casteo en el Frontend
const formatSituacion = (sit: string) => {
  const map: Record<string, string> = {
    'no_titulado': 'Sin titular',
    'titulado': 'Titulado',
    'proceso_titulacion': 'Proceso titulación',
    'proceso_titulación': 'Proceso titulación'
  };
  return map[sit] || sit || 'Otra';
};

export default function PopuliDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase.rpc("obtener_estadisticas_populi");
      if (!error && data) setStats(data);
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <div className="min-h-[80vh] flex items-center justify-center"><Loader2 className="animate-spin text-isbTeal" size={48} /></div>;
  if (!stats) return <div className="p-8 text-center text-gray-500">No se pudieron cargar las estadísticas.</div>;

  const egresadosData = {
    labels: ["Egresados", "Aún en carrera"],
    datasets: [{
      data: [stats.egresados || 0, stats.no_egresados || 0],
      backgroundColor: ["#001F36", "#BF953F"],
      borderWidth: 0,
      hoverOffset: 4,
    }],
  };

  const generacionesSituacion = stats.situacion_generacion || [];
  const etiquetasGen = [...new Set(generacionesSituacion.map((d: any) => String(d.generacion)))].sort() as string[];
  const tiposSituacionRaw = [...new Set(generacionesSituacion.map((d: any) => d.situacion))] as string[];
  const coloresSituacion = ["#001f36", "#BF953F", "#4A5568", "#2B6CB0", "#ED8936"];

  const situacionData = {
    labels: etiquetasGen,
    datasets: tiposSituacionRaw.map((situacionRaw, i) => ({
      // Casteo aplicado a las etiquetas de la leyenda
      label: formatSituacion(situacionRaw),
      data: etiquetasGen.map((gen) => {
        const coincidencia = generacionesSituacion.find((d: any) => String(d.generacion) === gen && d.situacion === situacionRaw);
        return coincidencia ? coincidencia.cantidad : 0;
      }),
      backgroundColor: coloresSituacion[i % coloresSituacion.length],
    })),
  };

  const generacionesRaw = stats.alumnos_generacion || [];
  const listadoAnos = Array.from({ length: 12 }, (_, i) => (2015 + i).toString());
  
  const totalGeneracionData = {
    labels: listadoAnos,
    datasets: [{
      label: "Alumnos Inscritos",
      data: listadoAnos.map(ano => {
        const row = generacionesRaw.find((d: any) => String(d.generacion) === ano);
        return row ? row.cantidad : 0;
      }),
      backgroundColor: "#001F36",
      borderRadius: 4,
    }]
  };

  const maxNacimientos = Math.max(...(stats.lugar_nacimiento || []).map((d: any) => d.cantidad), 1);
  const colorScale = scaleLinear<string>().domain([0, maxNacimientos]).range(["#EBF8FF", "#001F36"]);

  return (
    <main className="bg-gray-50 min-h-screen font-sans">
          
          <Navbar/>
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-isbDeepBlue mb-2">Demografia - Alumni ISB</h1>
        <p className="text-gray-500">Demografia de nuestra comunidad.</p>
      </div>
    
    <h2 className="text-lg font-bold text-isbDeepBlue mb-6">Datos de la comunidad</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-4 bg-blue-50 text-isbDeepBlue rounded-xl"><Users size={32} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Registrados</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total_registrados}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-4 bg-yellow-50 text-yellow-600 rounded-xl"><GraduationCap size={32} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Ya Egresados</p>
            <p className="text-3xl font-bold text-gray-900">{stats.egresados}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl"><Clock size={32} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tiempo Promedio de Egreso</p>
            <p className="text-3xl font-bold text-gray-900">{stats.tiempo_promedio ? `${stats.tiempo_promedio} años` : "N/D"}</p>
          </div>
        </div>
      </div>
    
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-isbDeepBlue mb-6">Distribución por generación</h3>
            <div className="h-[300px] w-full">
                <Bar data={totalGeneracionData} options={{ maintainAspectRatio: false, responsive: true, plugins: { legend: { display: false } } }} />
            </div>
        </div>

    <h2 className="text-lg font-bold text-isbDeepBlue mb-6">Datos egresados</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1 flex flex-col items-center">
          <h3 className="text-lg font-bold text-isbDeepBlue w-full mb-6">Proporción de Egresados</h3>
          <div className="w-full relative h-[250px] flex justify-center">
            <Doughnut data={egresadosData} options={{ maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-isbDeepBlue mb-6">Situación Actual por Generación</h3>
          <div className="h-[250px] w-full">
            <Bar data={situacionData} options={{ maintainAspectRatio: false, responsive: true, scales: { x: { stacked: true }, y: { stacked: true } }, plugins: { legend: { position: 'top' } } }} />
          </div>
        </div>
      </div>

      {/* <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-isbDeepBlue mb-2">Distribución de Origen</h3>
        <div className="w-full max-w-3xl mx-auto h-[400px] bg-blue-50/30 rounded-xl overflow-hidden flex justify-center items-center">
          {/* Proyección corregida con las coordenadas exactas de México 

        </div>
      </div> */}
    </div>
    <Footer/>
    </main>
  );
}