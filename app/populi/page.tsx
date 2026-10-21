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
import { Doughnut, Bar, Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

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

// Paletas de colores
const paletaOrigen = ["#001F36", "#2B6CB0", "#4299E1", "#63B3ED", "#90CDF4"];
const paletaResidencia = ["#BF953F", "#D69E2E", "#ECC94B", "#F6E05E", "#FAF089"];
const paletaAlcaldias = ["#2F855A", "#38A169", "#48BB78", "#68D391", "#9AE6B4"];

// COMPONENTE: Gráfica de barras horizontales
const GraficaBarrasHorizontales = ({ titulo, datos, colores }: { titulo: string, datos: any[], colores: string[] }) => {
  if (!datos || datos.length === 0) return <div className="text-sm text-gray-400 py-2">Sin datos de {titulo}</div>;
  
  // Calculamos el total de respuestas para sacar el 100%
  const totalRespuestas = datos.reduce((acc, curr) => acc + curr.cantidad, 0);

  return (
    <div className="w-full">
      <h3 className="text-sm font-bold text-isbDeepBlue border-b border-gray-300 pb-1 mb-3 flex justify-between">
        <span>{titulo}</span>
        <span className="font-normal text-gray-500 text-xs">% de respuestas</span>
      </h3>
      <div className="space-y-2">
        {datos.map((item, idx) => {
          const pct = Math.round((item.cantidad / totalRespuestas) * 100);
          const color = colores[idx % colores.length];
          return (
            <div key={idx} className="flex items-center text-xs">
              <div className="w-1/2 text-gray-700 truncate pr-2 font-medium" title={item.categoria}>
                {item.categoria}
              </div>
              <div className="w-1/2 flex items-center">
                <div 
                  className="h-3.5 rounded-sm transition-all duration-700 ease-out" 
                  style={{ width: `${Math.max(pct, 1)}%`, backgroundColor: color }}
                ></div>
                <span className="ml-2 font-bold text-isbDeepBlue">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function PopuliDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Variables fijas internas para el embudo
  const egresadosEstimados = 240;
  const mapeadosEstimados = 45;

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

  // ---------------- DATOS ORIGINALES ----------------
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

  // ---------------- DATOS NUEVOS (EMBUDO Y PASTELES) ----------------
  const totalAfiliados = stats.afiliados_db || 0;
  const totalActivos = stats.activos_db || 0;

  const pctMapeados = egresadosEstimados > 0 ? Math.round((mapeadosEstimados / egresadosEstimados) * 100) : 0;
  const pctAfiliados = mapeadosEstimados > 0 ? Math.round((totalAfiliados / mapeadosEstimados) * 100) : 0;
  const pctActivos = totalAfiliados > 0 ? Math.round((totalActivos / totalAfiliados) * 100) : 0;

  const armarDatosPastel = (coleccion: any[], colores: string[]) => {
    const datos = coleccion || [];
    return {
      labels: datos.map((d: any) => d.estado || d.alcaldia),
      datasets: [{
        data: datos.map((d: any) => d.cantidad),
        backgroundColor: colores,
        borderWidth: 1,
        borderColor: "#ffffff",
      }],
    };
  };

  const chartOptionsPie = { 
    plugins: { legend: { position: 'bottom' as const, labels: { boxWidth: 12 } } }, 
    maintainAspectRatio: false 
  };

  return (
    <main className="bg-gray-50 min-h-screen font-sans">
      <Navbar/>
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
        
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-isbDeepBlue mb-2">Comunidad - Alumni ISB</h1>
        </div>
        
        {/* ================= SECCIÓN 1: EMBUDO (ANCHO COMPLETO) ================= */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4">
            <h2 className="text-xl font-bold text-isbDeepBlue">Embudo de la comunidad (Personas)</h2>
          </div>

          <div className="pt-2">
            <div 
              className="flex w-full h-[160px] text-white text-center font-medium shadow-inner"
              style={{ clipPath: "polygon(0 0, 100% 15%, 100% 85%, 0 100%)" }}
            >
              <div className="flex-1 bg-[#0a192f] flex flex-col justify-center items-center border-r border-[#ffffff20]">
                <span className="text-4xl md:text-6xl font-black drop-shadow-md">{egresadosEstimados}</span>
                <span className="text-xs md:text-sm opacity-90 mt-2">Egresados</span>
              </div>
              <div className="flex-1 bg-[#172a45] flex flex-col justify-center items-center border-r border-[#ffffff20]">
                <span className="text-4xl md:text-6xl font-black drop-shadow-md">{mapeadosEstimados}</span>
                <span className="text-xs md:text-sm opacity-90 mt-2">Mapeados</span>
              </div>
              <div className="flex-1 bg-[#2b6cb0] flex flex-col justify-center items-center border-r border-[#ffffff20]">
                <span className="text-4xl md:text-6xl font-black drop-shadow-md">{totalAfiliados}</span>
                <span className="text-xs md:text-sm opacity-90 mt-2">Afiliados</span>
              </div>
              <div className="flex-1 bg-[#63b3ed] flex flex-col justify-center items-center">
                <span className="text-4xl md:text-6xl font-black drop-shadow-md text-[#0a192f]">{totalActivos}</span>
                <span className="text-xs md:text-sm opacity-90 mt-2 text-[#0a192f] font-bold">Activos</span>
              </div>
            </div>

            <div className="flex w-full mt-6 text-center text-sm font-semibold px-2">
              <div className="flex-1 text-gray-400">Total estimado</div>
              <div className="flex-1 text-blue-600">{pctMapeados}% del total</div>
              <div className="flex-1 text-blue-500">{pctAfiliados}% de mapeados</div>
              <div className="flex-1 text-blue-400">{pctActivos}% de afiliados</div>
            </div>
          </div>
          <h2 className="text-xl font-bold text-isbDeepBlue border-b pb-2">Datos de empleabiliodad</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <GraficaBarrasHorizontales 
              titulo="Sector donde trabajan" 
              datos={stats.empleabilidad_sector} 
              colores={["#0a192f", "#2b6cb0", "#4299e1", "#63b3ed", "#90cdf4", "#bee3f8"]} 
            />
            <GraficaBarrasHorizontales 
              titulo="Rango Salarial (MXN)" 
              datos={stats.empleabilidad_salario} 
              colores={["#2F855A", "#38A169", "#48BB78", "#68D391", "#9AE6B4"]} 
            />
            <GraficaBarrasHorizontales 
              titulo="Tiempo de primer empleo" 
              datos={stats.empleabilidad_tiempo} 
              colores={["#975A16", "#B7791F", "#D69E2E", "#ECC94B", "#F6E05E"]} 
            />
          </div>
        </section>

        {/* ================= SECCIÓN 3: MÉTRICAS GENERALES DE REGISTRO ================= */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-isbDeepBlue border-b pb-2">Datos de los afiliados</h2>
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
        </section>

        {/* ================= SECCIÓN 4: GRÁFICAS DEMOGRÁFICAS (PASTELES) ================= */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
            <h3 className="text-base font-bold text-isbDeepBlue w-full mb-4 text-center">Entidad Federativa de Origen</h3>
            <div className="w-full relative h-[250px]">
              <Pie data={armarDatosPastel(stats.origen_entidad, paletaOrigen)} options={chartOptionsPie} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
            <h3 className="text-base font-bold text-isbDeepBlue w-full mb-4 text-center">Dónde Residen</h3>
            <div className="w-full relative h-[250px]">
              <Pie data={armarDatosPastel(stats.residencia_estado, paletaResidencia)} options={chartOptionsPie} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
            <h3 className="text-base font-bold text-isbDeepBlue w-full mb-4 text-center">Alcaldías (CDMX)</h3>
            <div className="w-full relative h-[250px]">
              {stats.alcaldias_cdmx && stats.alcaldias_cdmx.length > 0 ? (
                 <Pie data={armarDatosPastel(stats.alcaldias_cdmx, paletaAlcaldias)} options={chartOptionsPie} />
              ) : (
                 <div className="h-full flex items-center justify-center text-gray-400 text-sm">Sin datos detectados</div>
              )}
            </div>
          </div>
        </section>

        {/* ================= SECCIÓN 5: DATOS DE TITULACIÓN Y SITUACIÓN ================= */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-isbDeepBlue border-b pb-2">Progresión Académica</h2>

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
        </section>

      </div>
      <Footer/>
    </main>
  );
}