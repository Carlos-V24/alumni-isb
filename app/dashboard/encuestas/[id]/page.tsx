"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

// Tipados ampliados para soportar checkboxes y escalas
type Pregunta = {
  id: string;
  tipo: "texto" | "texto_largo" | "numero" | "fecha" | "opciones" | "opciones_multiples" | "escala";
  pregunta: string;
  opciones?: string[];
  requerido: boolean;
};

export default function FormularioDinamico() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const modo = searchParams.get('modo'); // Puede ser 'ver', 'editar' o null (nuevo)
  const isReadOnly = modo === 'ver';
  
  const [user, setUser] = useState<any>(null);
  const [formulario, setFormulario] = useState<any>(null);
  const [yaRespondio, setYaRespondio] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorInfo, setErrorInfo] = useState("");
  
  const [respuestas, setRespuestas] = useState<Record<string, any>>({});

  useEffect(() => {
    async function cargarDatos() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);

      // 1. Obtener la estructura del formulario
      const { data: formData, error: formError } = await supabase
        .from('formularios')
        .select('*')
        .eq('id', id)
        .single();

      if (formError || !formData) {
        setCargando(false);
        return;
      }
      setFormulario(formData);

      // 2. Verificar si el usuario ya respondió esto antes
      const { data: respuestaData } = await supabase
        .from('respuestas_formularios')
        .select('*')
        .eq('formulario_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (respuestaData) {
        setYaRespondio(true);
        // Precargar respuestas para los modos 'ver' o 'editar'
        if (modo === 'ver' || modo === 'editar') {
          setRespuestas(respuestaData.respuestas);
        }
      }
      
      setCargando(false);
    }
    cargarDatos();
  }, [id, modo, router]);

  const handleChange = (preguntaId: string, valor: any) => {
    if (isReadOnly) return;
    setRespuestas(prev => ({ ...prev, [preguntaId]: valor }));
  };

  const handleCheckboxToggle = (preguntaId: string, opcion: string) => {
    if (isReadOnly) return;
    setRespuestas(prev => {
      const actuales = prev[preguntaId] || [];
      const nuevas = actuales.includes(opcion)
        ? actuales.filter((item: string) => item !== opcion)
        : [...actuales, opcion];
      return { ...prev, [preguntaId]: nuevas };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    setIsSubmitting(true);
    setErrorInfo("");

    try {
      let error;
      if (modo === 'editar' && yaRespondio) {
        // Actualizar respuesta existente
        const res = await supabase
          .from('respuestas_formularios')
          .update({ respuestas })
          .eq('formulario_id', formulario.id)
          .eq('user_id', user.id);
        error = res.error;
      } else {
        // Crear nueva respuesta
        const res = await supabase
          .from('respuestas_formularios')
          .insert([{
            formulario_id: formulario.id,
            user_id: user.id,
            respuestas
          }]);
        error = res.error;
      }

      if (error) throw error;
      router.push("/dashboard?success=true");
    } catch (err: any) {
      console.error("Error guardando:", err);
      setErrorInfo(err.message || "Hubo un error al guardar las respuestas.");
      setIsSubmitting(false);
    }
  };

  // --- RENDERIZADORES ---
  
  if (cargando) return <div className="min-h-screen flex items-center justify-center">Cargando cuestionario...</div>;
  if (!formulario) return <div className="min-h-screen flex items-center justify-center">Cuestionario no encontrado.</div>;

  // Si ya respondió, es nuevo intento (sin ?modo=) y no queremos que re-escriba accidentalmente
  if (yaRespondio && !modo) {
    return (
      <main className="min-h-screen bg-gray-50 py-20 px-4">
        <div className="max-w-2xl mx-auto bg-white p-10 rounded-2xl shadow-sm text-center border border-gray-100">
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-isbDeepBlue mb-2">Ya respondiste este cuestionario</h1>
          <p className="text-gray-600 mb-8">Tus respuestas ya fueron registradas para: {formulario.titulo}.</p>
          <div className="flex justify-center space-x-4">
            <Link href="/dashboard" className="text-gray-600 font-bold hover:underline border border-gray-300 px-6 py-2 rounded-lg transition">
              Volver
            </Link>
            <Link href={`/dashboard/encuestas/${id}?modo=ver`} className="text-isbTeal font-bold hover:bg-teal-50 border border-isbTeal px-6 py-2 rounded-lg transition">
              Ver mis respuestas
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-isbTeal flex items-center mb-6 transition">
          <ArrowLeft size={16} className="mr-1" /> Volver al panel
        </Link>
        
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-8 border-b pb-6 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-isbDeepBlue mb-3">
                {formulario.titulo} {isReadOnly && <span className="text-sm font-normal text-gray-400 ml-2">(Modo Lectura)</span>}
              </h1>
              <p className="text-sm text-gray-600 leading-relaxed">{formulario.descripcion}</p>
            </div>
          </div>

          {errorInfo && (
            <div className="mb-6 bg-red-50 p-4 rounded-lg flex items-center text-red-600 text-sm">
              <AlertCircle size={16} className="mr-2" /> {errorInfo}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {formulario.esquema.map((q: Pregunta) => (
              <div key={q.id} className="space-y-3 bg-white">
                <label className="block text-sm font-medium text-gray-800">
                  {q.pregunta} {q.requerido && !isReadOnly && <span className="text-red-500">*</span>}
                </label>
                
                {/* 1. TEXTO CORTO */}
                {q.tipo === "texto" && (
                  <input type="text" required={q.requerido && !isReadOnly} disabled={isReadOnly} value={respuestas[q.id] || ""} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-isbTeal outline-none disabled:bg-gray-50 disabled:text-gray-500" onChange={(e) => handleChange(q.id, e.target.value)} />
                )}

                {/* 2. TEXTO LARGO */}
                {q.tipo === "texto_largo" && (
                  <textarea required={q.requerido && !isReadOnly} disabled={isReadOnly} value={respuestas[q.id] || ""} rows={3} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-isbTeal outline-none resize-none disabled:bg-gray-50 disabled:text-gray-500" onChange={(e) => handleChange(q.id, e.target.value)} />
                )}

                {/* 3. NÚMERO */}
                {q.tipo === "numero" && (
                  <input type="number" required={q.requerido && !isReadOnly} disabled={isReadOnly} value={respuestas[q.id] || ""} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-isbTeal outline-none disabled:bg-gray-50 disabled:text-gray-500" onChange={(e) => handleChange(q.id, Number(e.target.value))} />
                )}

                {/* 4. FECHA */}
                {q.tipo === "fecha" && (
                  <input type="date" required={q.requerido && !isReadOnly} disabled={isReadOnly} value={respuestas[q.id] || ""} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-isbTeal outline-none disabled:bg-gray-50 disabled:text-gray-500" onChange={(e) => handleChange(q.id, e.target.value)} />
                )}

                {/* 5. OPCIÓN ÚNICA (SELECT) */}
                {q.tipo === "opciones" && (
                  <select required={q.requerido && !isReadOnly} disabled={isReadOnly} value={respuestas[q.id] || ""} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-isbTeal outline-none bg-white disabled:bg-gray-50 disabled:text-gray-500" onChange={(e) => handleChange(q.id, e.target.value)}>
                    <option value="">Selecciona una opción</option>
                    {q.opciones?.map(op => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>
                )}

                {/* 6. OPCIONES MÚLTIPLES (CHECKBOXES) */}
                {q.tipo === "opciones_multiples" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.opciones?.map(op => {
                      const isChecked = (respuestas[q.id] || []).includes(op);
                      return (
                        <label key={op} className={`flex items-center space-x-3 p-3 rounded-lg border transition ${isReadOnly ? 'bg-gray-50 border-gray-200 cursor-default' : 'bg-white border-gray-200 hover:bg-gray-50 cursor-pointer'}`}>
                          <input 
                            type="checkbox" 
                            disabled={isReadOnly}
                            checked={isChecked}
                            className="w-4 h-4 text-isbTeal rounded disabled:opacity-50" 
                            onChange={() => handleCheckboxToggle(q.id, op)} 
                          />
                          <span className={`text-sm ${isReadOnly && !isChecked ? 'text-gray-400' : 'text-gray-700'}`}>{op}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* 7. ESCALAS (1 a 5) */}
                {q.tipo === "escala" && (
                  <div className="flex gap-4 mt-2">
                    {[1, 2, 3, 4, 5].map(num => (
                      <label key={num} className={`flex flex-col items-center ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}>
                        <span className={`text-xs mb-1 ${isReadOnly && respuestas[q.id] !== num ? 'text-gray-300' : 'text-gray-600'}`}>{num}</span>
                        <input 
                          type="radio" 
                          name={q.id} 
                          disabled={isReadOnly}
                          required={q.requerido && !isReadOnly} 
                          checked={respuestas[q.id] === num}
                          className="w-4 h-4 text-isbTeal focus:ring-isbTeal border-gray-300 disabled:opacity-50"
                          onChange={() => handleChange(q.id, num)}
                        />
                      </label>
                    ))}
                  </div>
                )}

              </div>
            ))}

            {!isReadOnly && (
              <div className="pt-6 border-t border-gray-100">
                <button disabled={isSubmitting} type="submit" className="w-full bg-isbDeepBlue text-white font-bold py-4 rounded-xl hover:bg-isbTeal transition-all shadow-md flex justify-center items-center">
                  {isSubmitting ? (
                    <><Loader2 className="animate-spin mr-2"/> Guardando...</>
                  ) : (
                    <>{modo === 'editar' ? 'Actualizar Respuestas' : 'Enviar Cuestionario'}</>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}