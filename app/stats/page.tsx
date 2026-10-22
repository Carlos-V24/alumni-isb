"use client";
import MapaAlcaldias from "../components/maps/MapaAlcaldias";
import MapaEstadosCombinado from "../components/maps/MapaEstadosCombinado";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, GraduationCap, Clock, Loader2, Award, Building2 } from "lucide-react";
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
const paletaSexo = ["#001F36", "#BF953F", "#4A5568"];
const paletaModalidad = ["#4238a1", "#894bec", "#bfa4f8"];

// NUEVO: Función para calcular porcentajes en los tooltips de Chart.js
const tooltipProporciones = {
  callbacks: {
    label: function (context: any) {
      const dataset = context.dataset;
      const total = dataset.data.reduce((acc: number, curr: number) => acc + curr, 0);
      const valor = context.raw;
      const porcentaje = total > 0 ? Math.round((valor / total) * 100) : 0;
      return ` ${context.label}: ${porcentaje}%`;
    },
  },
};

// COMPONENTE: Gráfica de barras horizontales
const GraficaBarrasHorizontales = ({ titulo, datos, colores }: { titulo: string, datos: any[], colores: string[] }) => {
  if (!datos || datos.length === 0) return <div className="text-sm text-gray-400 py-2">Sin datos de {titulo}</div>;
  
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

  // Variables fijas internas
  const egresadosEstimados = 229;
  const mapeadosEstimados = 35;
  const tituladosFijos = 179;
  const porcentajeTitulacion = Math.round((tituladosFijos / egresadosEstimados) * 100);

  // DATOS HARDCODEADOS
  const datosSector = [
    { categoria: "Industria MedTech", cantidad: 8 },
    { categoria: "Salud Digital y TI", cantidad: 2 },
    { categoria: "Logística y distribución", cantidad: 1 },
    { categoria: "Consultoría", cantidad: 1 },
    { categoria: "Retail", cantidad: 1 }
  ];

  const datosSalario = [
    { categoria: "$20,000 - $29,999", cantidad: 6 },
    { categoria: "$48,000 o más", cantidad: 3 },
    { categoria: "Menos de $20,000", cantidad: 2 },
    { categoria: "$36,000 - $41,999", cantidad: 1 },
    { categoria: "$30,000 - $35,999", cantidad: 1 }
  ];

  const datosTiempo = [
    { categoria: "Ya contaba con empleo antes de egresar", cantidad: 7 },
    { categoria: "Menos de 3 meses", cantidad: 5 },
    { categoria: "De 3 a 6 meses", cantidad: 1 }
  ];

  const datosModalidad = [
    { categoria: "Híbrido", cantidad: 9 },
    { categoria: "100% Presencial", cantidad: 4 },
    { categoria: "100% Remoto", cantidad: 1 }
  ];

// Nube de empresas (Estilo unificado)
  const nubeEmpresas = [
    { nombre: "Medtronic", logo: "https://cdn.cookielaw.org/logos/74306bdd-94de-443c-9589-2ebbc975a0be/4433fa59-565e-4547-8f55-b2dd5f908e80/d18e98ce-b1e6-41cd-8cab-04512edeffd6/art-logo-en-rgb-bl.png" },
    { nombre: "Siemens Healthineers", logo: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/79/Siemens_Healthineers_logo.svg/1280px-Siemens_Healthineers_logo.svg.png?utm_source=es.wikipedia.org&utm_campaign=index&utm_content=thumbnail" },
    { nombre: "Cyber Robotics", logo: "https://static.wixstatic.com/media/a36d0e_e823c56a4d99457b9f3318974c56c995~mv2.png/v1/fill/w_571,h_87,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/logocyberlargo_edited.png" }, 
    { nombre: "ISSSTE", logo: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/df/Logo_del_ISSSTE.svg/3840px-Logo_del_ISSSTE.svg.png?utm_source=es.wikipedia.org&utm_campaign=index&utm_content=thumbnail" },
    { nombre: "Philips", logo: "https://www.signify.com/content/dam/signify/master/homepage/logo-philips.png" },
    { nombre: "GE Healthcare", logo: "https://portal.myesr.org/esr/membership/fs/storage/company_files/8f5b2dc2-5689-47d7-ac8c-cc0446559a24/logo_widen_1200.png?ts=1674565364" },
    { nombre: "Johnson & Johnson", logo: "https://jnj-content-lab2.brightspotcdn.com/dims4/default/24f4d52/2147483647/strip/true/crop/1880x914+0+0/resize/1000x486!/quality/90/?url=https%3A%2F%2Fjnj-production-jnj.s3.us-east-1.amazonaws.com%2Fbrightspot%2F6d%2Fa9%2F79c4f0144bc9820b28734d19a6ae%2Fjj-logo-stacked-red-rgb.png" },
    { nombre: "Boston Scientific", logo: "https://www.bostonscientific.com/content/dam/logo-bsc.svg" },
    { nombre: "Becton Dickinson", logo: "https://www.bd.com/content/dam/bd-assets/bd-com/en-us/logos/bd/header-bd-logo.svg" },
    { nombre: "Olympus", logo: "https://1000marcas.net/wp-content/uploads/2020/03/Logo-Olympus.png" },
  ];

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

  // ---------------- DATOS ORIGINALES DE SUPABASE ----------------
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
// DATOS HARDCODEADOS: Distribución por generación (Apilada con espacios vacíos)
  const distribucionGeneracionData = {
    labels: [
      "1er Gen (2015)", 
      "2da Gen (2016)", 
      "3ra Gen (2017)", 
      "4ta Gen (2018)", 
      "5ta Gen (2019)", 
      "6ta Gen (2020)", 
      "7ma Gen (2021)", 
      "8va Gen (2022)"
    ],
    datasets: [
      {
        label: "Afiliados",
        // Ingresa aquí tus datos reales de afiliados por generación
        data: [2, 0, 0, 1, 1, 0, 2, 3],
        backgroundColor: "#001F36", // Azul oscuro
      },
      {
        label: "Otros Mapeados",
        // La diferencia para llegar a tu total de egresados mapeados
        data: [1, 0, 0, 2, 0, 1, 2, 2],
        backgroundColor: "#4299E1", // Azul claro
        borderRadius: { topLeft: 6, topRight: 6, bottomLeft: 0, bottomRight: 0 }, // Redondea solo la punta superior
      }
    ]
  };
  
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

  // ---------------- DATOS DE EMBUDO ----------------
  const totalAfiliados = stats.afiliados_db  || 0;
  const totalActivos = stats.activos_db || 0;

  const pctMapeados = egresadosEstimados > 0 ? Math.round((mapeadosEstimados / egresadosEstimados) * 100) : 0;
  const pctAfiliados = mapeadosEstimados > 0 ? Math.round((totalAfiliados / mapeadosEstimados) * 100) : 0;
  const pctActivos = totalAfiliados > 0 ? Math.round((totalActivos / totalAfiliados) * 100) : 0;

  const armarDatosPastel = (coleccion: any[], colores: string[], formatLabel?: (l: string) => string) => {
    const datos = coleccion || [];
    return {
      labels: datos.map((d: any) => formatLabel ? formatLabel(d.categoria || d.estado || d.alcaldia) : (d.categoria || d.estado || d.alcaldia)),
      datasets: [{
        data: datos.map((d: any) => d.cantidad),
        backgroundColor: colores,
        borderWidth: 1,
        borderColor: "#ffffff",
      }],
    };
  };

  const chartOptionsPie = { 
    plugins: { 
      legend: { position: 'bottom' as const, labels: { boxWidth: 12 } },
      tooltip: tooltipProporciones 
    }, 
    maintainAspectRatio: false 
  };

  return (
    <main className="bg-gray-50 min-h-screen font-sans">
      <Navbar/>
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
        
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-isbDeepBlue mb-2">Comunidad - Alumni ISB</h1>
        </div>
        
        {/* ================= SECCIÓN 1: EMBUDO Y KPI TITULACIÓN ================= */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4">
            <h3 className="text-xl font-bold text-isbDeepBlue">Embudo de la comunidad <span className="font-normal text-gray-500 text-xs">Personas</span></h3>
            
            {/* KPI DE TITULACIÓN EN GRANDE */}
            <div className="bg-yellow-50 border border-emerald-100 px-6 py-3 rounded-xl flex items-center gap-4 shadow-sm">
              <div className="bg-yellow-500 p-2 rounded-full text-white">
                <Award size={28} />
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Titulados*</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-amber-900">{porcentajeTitulacion}%</span>
                  <span className="text-sm font-medium text-amber-600">({tituladosFijos} de {egresadosEstimados})</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <div 
              className="flex w-full h-[160px] text-white text-center font-medium shadow-inner"
              style={{ clipPath: "polygon(0 0, 100% 15%, 100% 85%, 0 100%)" }}
            >
              <div className="flex-1 bg-[#0a192f] flex flex-col justify-center items-center border-r border-[#ffffff20]">
                <span className="text-4xl md:text-6xl font-black drop-shadow-md">{egresadosEstimados}</span>
                <span className="text-xs md:text-sm opacity-90 mt-2">Egresados<span className="text-xs">*</span></span>
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
        </section>

        {/* ================= SECCIÓN 3: DATOS DE EMPLEABILIDAD ================= */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <GraficaBarrasHorizontales 
              titulo="Sector donde trabajan" 
              datos={datosSector} 
              colores={["#0a192f", "#2b6cb0", "#4299e1", "#63b3ed", "#90cdf4", "#bee3f8"]} 
            />
            <GraficaBarrasHorizontales 
              titulo="Rango Salarial (MXN)" 
              datos={datosSalario} 
              colores={["#975A16", "#B7791F", "#D69E2E", "#ECC94B", "#F6E05E"]} 
            />
            <GraficaBarrasHorizontales 
              titulo="Tiempo de primer empleo" 
              datos={datosTiempo} 
              colores={["#2F855A", "#38A169", "#48BB78", "#68D391", "#9AE6B4"]} 
            />
          </div>
        </section>

      {/* ================= SECCIÓN 4: GRÁFICAS DEMOGRÁFICAS ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* MAPA NACIONAL COMBINADO (Ocupa 2 columnas) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-between lg:col-span-2">
            <h3 className="text-sm font-bold text-isbDeepBlue w-full mb-1 text-center">Distribución Nacional</h3>
            <p className="text-[10px] text-gray-400 mb-4 text-center uppercase tracking-wider">Origen vs Residencia actual</p>
            <div className="w-full flex-1 flex items-center justify-center">
              <MapaEstadosCombinado 
                datosOrigen={stats?.origen_entidad || []} 
                datosResidencia={stats?.residencia_estado || []} 
                // Paleta 1: Escala de Azules
                paletaOrigen={["#E2E8F0", "#63B3ED", "#2B6CB0", "#001F36"]} 
                // Paleta 2: Escala de Dorados/Cafés
                paletaResidencia={["#ccc47f", "#bea512", "#df990d", "#ca5511"]} 
              />
            </div>
          </div>

          {/* Mapa Alcaldías (1 columna) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-between lg:col-span-2">
            <h3 className="text-sm font-bold text-isbDeepBlue w-full mb-1 text-center">Distribución CDMX</h3>
            <p className="text-[10px] text-gray-400 mb-4 text-center uppercase tracking-wider">Densidad de residencia</p>
            <div className="w-full flex-1 flex items-center justify-center">
              {stats?.alcaldias_cdmx && stats.alcaldias_cdmx.length > 0 ? (
                 <MapaAlcaldias 
                    datosAlcaldias={stats.alcaldias_cdmx} 
                    // Paleta en tonos verdes
                    paleta={["#E2E8F0", "#68D391", "#38A169", "#2F855A"]} 
                 />
              ) : (
                 <div className="h-full flex items-center justify-center text-gray-400 text-sm">Sin datos detectados</div>
              )}
            </div>
          </div>
          
        </section>


        <section>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2 flex flex-col items-center">
              <h3 className="text-lg font-bold text-isbDeepBlue w-full mb-6">Proporción de Egresados</h3>
              <div className="h-[300px] w-full">
                <Bar 
                  data={distribucionGeneracionData} 
                  options={{ 
                    maintainAspectRatio: false, 
                    responsive: true, 
                    plugins: { 
                      legend: { display: true, position: 'bottom' } // Habilitamos la leyenda abajo
                    },
                    scales: {
                      x: {
                        stacked: true, // Apila en el eje X
                      },
                      y: {
                        stacked: true, // Apila en el eje Y
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                      }
                    }
                  }} 
                />
            </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1">
              <h3 className="text-sm font-bold text-isbDeepBlue w-full mb-4 text-center">Distribución por Sexo</h3>
            <div className="w-full relative h-[200px]">
              {stats.sexo_distribucion ? (
                 <Pie data={armarDatosPastel(stats.sexo_distribucion, paletaSexo, (val) => val === 'H' ? 'Hombres' : val === 'M' ? 'Mujeres' : val)} options={chartOptionsPie} />
              ) : (
                 <div className="h-full flex items-center justify-center text-gray-400 text-xs">Sin datos</div>
              )}
            </div>
            </div>
          </div>
        </section>


        {/* ================= SECCIÓN 2: NUBE DE EMPRESAS (LOGOS) ================= */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="flex items-center gap-3 w-full mb-6 border-b pb-2">
            <h2 className="text-lg font-bold text-isbDeepBlue">¿Dónde trabajan algunos de nuestros egresados?</h2>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 max-w-4xl py-8 px-4 bg-gray-50 rounded-xl">
            {nubeEmpresas.map((empresa, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-center h-12 w-32 md:w-40 transition-all duration-300 hover:scale-110 grayscale hover:grayscale-0"
              >
                {empresa.logo ? (
                  <img 
                    src={empresa.logo} 
                    alt={empresa.nombre} 
                    title={empresa.nombre}
                    className="max-h-full max-w-full object-contain"
                    // Si el link se rompe, mostramos el texto de respaldo
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                
                {/* Texto de respaldo (Oculto por defecto si hay logo, visible si el logo falla o no existe) */}
                <span className={`text-xl font-bold text-[#2B6CB0] opacity-90 text-center ${empresa.logo ? 'hidden' : 'block'}`}>
                  {empresa.nombre}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* <h2 className="text-xl font-bold text-isbDeepBlue border-b pb-2">Datos de los afiliados</h2>
        <section className="space-y-6">
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

        <section className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1 flex flex-col items-center">
              <h3 className="text-lg font-bold text-isbDeepBlue w-full mb-6">Proporción de Egresados</h3>
              <div className="w-full relative h-[250px] flex justify-center">
                <Doughnut data={egresadosData} options={{ maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom' }, tooltip: tooltipProporciones } }} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
              <h3 className="text-lg font-bold text-isbDeepBlue mb-6">Situación Actual por Generación</h3>
              <div className="h-[250px] w-full">
                <Bar data={situacionData} options={{ maintainAspectRatio: false, responsive: true, scales: { x: { stacked: true }, y: { stacked: true } }, plugins: { legend: { position: 'top' } } }} />
              </div>
            </div>
          </div>
        </section> */}
        <p className="font-normal text-gray-500 text-[0.625rem] text-center">* Información obtenida gracias al Departamento de Ingeniería en Sistemas Biomédicos, información actualziada hasta Julio del 2026</p>
      </div>
      <Footer/>
    </main>
  );
}