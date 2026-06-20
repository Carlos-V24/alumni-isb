"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

const OPCIONES_SITUACION = ["Trabajo de tiempo completo", "Trabajo de medio tiempo", "Prácticas profesionales", "Internship", "Servicio Social", "Buscando empleo", "Emprendimiento propio", "Posgrado", "Aún sin experiencia profesional"];
const OPCIONES_AREA = ["Industria de dispositivos médicos", "Ingeniería clínica / hospitalaria", "Ventas técnicas", "Especialista de producto", "Consultoría", "Investigación", "Desarrollo tecnológico / I + D", "Regulación sanitaria / asuntos regulatorios", "Calidad", "Servicio técnico", "Ciencia de datos", "Docencia"];
const OPCIONES_SECTOR = ["Hospital pública", "Hospital privada", "Empresa de dispositivos médicos", "Empresa farmacéutica", "Consultoría", "Universidad / centro de investigación", "Startup", "Sector pública", "Otro"];
const OPCIONES_CRECIMIENTO = ["Conseguir mi primer empleo", "Cambiar de área profesional", "Crecer dentro de mi empresa actual", "Conseguir mentoría", "Hacer Networking", "Iniciar o fortalecer un posgrado", "Mejorar mi perfil para entrevistas", "Participar en proyectos colaborativos"];

export default function EncuestaFortalezas() {
  const router = useRouter();
  const [userAuth, setUserAuth] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorInfo, setErrorInfo] = useState("");

  const [form, setForm] = useState({
    situacion_profesional: "",
    area_principal: "",
    sector: "",
    experiencia: "",
    crecimiento_buscado: [] as string[],
    skills_tecnicas: {} as Record<string, number>,
    skills_blandas: {} as Record<string, number>,
    fortalezas_texto: "",
    aportacion_alumni: [] as string[],
    comentarios: ""
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/login");
      else setUserAuth(data.user);
    });
  }, [router]);

  const handleCrecimientoToggle = (opcion: string) => {
    setForm(prev => ({
      ...prev,
      crecimiento_buscado: prev.crecimiento_buscado.includes(opcion)
        ? prev.crecimiento_buscado.filter(item => item !== opcion)
        : [...prev.crecimiento_buscado, opcion]
    }));
  };

  const handleAportacionToggle = (opcion: string) => {
    setForm(prev => ({
      ...prev,
      aportacion_alumni: prev.aportacion_alumni.includes(opcion)
        ? prev.aportacion_alumni.filter(item => item !== opcion)
        : [...prev.aportacion_alumni, opcion]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorInfo("");

    try {
      const { error } = await supabase.from('encuesta_fortalezas').insert([{
        user_id: userAuth.id,
        situacion_profesional: form.situacion_profesional,
        area_principal: form.area_principal,
        sector: form.sector,
        experiencia: form.experiencia,
        crecimiento_buscado: form.crecimiento_buscado,
        skills_tecnicas: form.skills_tecnicas,
        skills_blandas: form.skills_blandas,
        fortalezas_texto: form.fortalezas_texto,
        aportacion_alumni: form.aportacion_alumni,
        comentarios: form.comentarios
      }]);

      if (error) throw error;
      router.push("/dashboard?success=true");
    } catch (err: any) {
      setErrorInfo(err.message || "Error al enviar la encuesta.");
      setIsSubmitting(false);
    }
  };

  const renderEscala = (categoria: "skills_tecnicas" | "skills_blandas", pregunta: string, id: string) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{pregunta}</label>
      <div className="flex gap-4">
        {[1, 2, 3, 4, 5].map(num => (
          <label key={num} className="flex flex-col items-center cursor-pointer">
            <span className="text-xs text-gray-500 mb-1">{num}</span>
            <input 
              type="radio" 
              name={id} 
              required 
              className="w-4 h-4 text-isbTeal focus:ring-isbTeal border-gray-300"
              onChange={() => setForm(prev => ({ ...prev, [categoria]: { ...prev[categoria], [id]: num } }))}
            />
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-isbTeal flex items-center mb-6 transition">
          <ArrowLeft size={16} className="mr-1" /> Volver al panel
        </Link>
        
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-8 border-b pb-6">
            <h1 className="text-3xl font-bold text-isbDeepBlue mb-3">Cuestionario de Fortalezas</h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              Objetivo: Identificar el perfil, fortalezas, áreas de oportunidad e intereses de los miembros de Alumni ISB para fortalecer estrategias de vinculación y mentoría. La información se usará para análisis estadístico y segmentación de perfiles.
            </p>
          </div>

          {errorInfo && (
            <div className="mb-6 bg-red-50 p-4 rounded-lg flex items-center text-red-600 text-sm">
              <AlertCircle size={16} className="mr-2" /> {errorInfo}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* SECCIÓN 1: Perfil */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-isbTeal">1. Situación profesional actual</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">¿Cuál es tu situación profesional actual?</label>
                <select required className="w-full px-4 py-3 border rounded-lg focus:ring-isbTeal outline-none" onChange={e => setForm({...form, situacion_profesional: e.target.value})}>
                  <option value="">Selecciona una opción</option>
                  {OPCIONES_SITUACION.map(op => <option key={op} value={op}>{op}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Área principal en la que te desempeñas o interesa</label>
                  <select required className="w-full px-4 py-3 border rounded-lg focus:ring-isbTeal outline-none" onChange={e => setForm({...form, area_principal: e.target.value})}>
                    <option value="">Selecciona una opción</option>
                    {OPCIONES_AREA.map(op => <option key={op} value={op}>{op}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sector donde trabajas o te interesa</label>
                  <select required className="w-full px-4 py-3 border rounded-lg focus:ring-isbTeal outline-none" onChange={e => setForm({...form, sector: e.target.value})}>
                    <option value="">Selecciona una opción</option>
                    {OPCIONES_SECTOR.map(op => <option key={op} value={op}>{op}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nivel de experiencia profesional</label>
                <select required className="w-full px-4 py-3 border rounded-lg focus:ring-isbTeal outline-none" onChange={e => setForm({...form, experiencia: e.target.value})}>
                  <option value="">Selecciona una opción</option>
                  <option value="Sin experiencia formal">Sin experiencia formal</option>
                  <option value="Menos de 6 meses">Menos de 6 meses</option>
                  <option value="6 meses 1 año">6 meses a 1 año</option>
                  <option value="1 a 2 años">1 a 2 años</option>
                  <option value="3 a 5 años">3 a 5 años</option>
                  <option value="Más de 5 años">Más de 5 años</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">¿Qué tipo de crecimiento buscas en los próximos 12 meses? (Selecciona varios si aplica)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {OPCIONES_CRECIMIENTO.map(op => (
                    <label key={op} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-100 hover:bg-gray-100 cursor-pointer transition">
                      <input type="checkbox" className="w-4 h-4 text-isbTeal rounded" onChange={() => handleCrecimientoToggle(op)} />
                      <span className="text-sm text-gray-700">{op}</span>
                    </label>
                  ))}
                </div>
              </div>
            </section>

            {/* SECCIÓN 2: Fortalezas Técnicas */}
            <section className="space-y-6 pt-6 border-t border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-isbTeal mb-1">2. Autoevaluación de fortalezas técnicas</h2>
                <p className="text-xs text-gray-500 mb-6">Califica tu nivel (1 = Muy bajo/sin experiencia, 5 = Avanzado)</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {renderEscala("skills_tecnicas", "Conocimiento en disp. médicos", "dispositivos")}
                {renderEscala("skills_tecnicas", "Ingeniería clínica y gestión", "ing_clinica")}
                {renderEscala("skills_tecnicas", "Normatividad y regulación", "regulacion")}
                {renderEscala("skills_tecnicas", "Calidad y validación", "calidad")}
                {renderEscala("skills_tecnicas", "Procesamiento de señales", "senales")}
                {renderEscala("skills_tecnicas", "Programación", "programacion")}
                {renderEscala("skills_tecnicas", "Ciencia de datos", "datos")}
                {renderEscala("skills_tecnicas", "Diseño CAD / impresión 3D", "cad")}
                {renderEscala("skills_tecnicas", "Investigación científica", "investigacion")}
                {renderEscala("skills_tecnicas", "Gestión de proyectos", "proyectos")}
              </div>
            </section>

            {/* SECCIÓN 3: Soft Skills */}
            <section className="space-y-6 pt-6 border-t border-gray-100">
              <h2 className="text-xl font-bold text-isbTeal mb-4">3. Autoevaluación de Softskills</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {renderEscala("skills_blandas", "Comunicación profesional", "comunicacion")}
                {renderEscala("skills_blandas", "Trabajo en equipo", "equipo")}
                {renderEscala("skills_blandas", "Liderazgo", "liderazgo")}
                {renderEscala("skills_blandas", "Resolución de problemas", "problemas")}
                {renderEscala("skills_blandas", "Negociación (clientes/proveedores)", "negociacion")}
                {renderEscala("skills_blandas", "Presentación ante público", "presentacion")}
              </div>
            </section>

            {/* SECCIÓN 4: Fortalezas Percibidas */}
            <section className="space-y-6 pt-6 border-t border-gray-100">
              <h2 className="text-xl font-bold text-isbTeal mb-4">4. Fortalezas percibidas</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">¿Cuáles consideras que son tus tres principales fortalezas profesionales o académicas?</label>
                <textarea required rows={3} className="w-full px-4 py-3 border rounded-lg focus:ring-isbTeal outline-none resize-none" onChange={e => setForm({...form, fortalezas_texto: e.target.value})}></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">¿En qué tipo de actividades consideras que podrían tus fortalezas aportar más al Alumni?</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {["Revisión de CV o LinkedIN", "Preparación para entrevistas", "Apoyo en idioma inglés", "Coordinar equipos o proyectos", "Impartir talleres o capacitaciones"].map(op => (
                    <label key={op} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-100 hover:bg-gray-100 cursor-pointer transition">
                      <input type="checkbox" className="w-4 h-4 text-isbTeal rounded" onChange={() => handleAportacionToggle(op)} />
                      <span className="text-sm text-gray-700">{op}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">¿Hay algo más que quieras compartir? (Opcional)</label>
                <textarea rows={2} className="w-full px-4 py-3 border rounded-lg focus:ring-isbTeal outline-none resize-none" onChange={e => setForm({...form, comentarios: e.target.value})}></textarea>
              </div>
            </section>

            <button disabled={isSubmitting} type="submit" className="w-full bg-isbDeepBlue text-white font-bold py-4 rounded-xl hover:bg-isbTeal transition-all shadow-lg flex items-center justify-center space-x-2 mt-8">
              {isSubmitting ? (
                <><Loader2 size={20} className="animate-spin" /><span>Guardando respuestas...</span></>
              ) : (
                <><CheckCircle2 size={20} /><span>Enviar Cuestionario Oficial</span></>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}