"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  LogOut, MapPin, ClipboardList, CheckCircle2, Clock, 
  CalendarX, Eye, Edit3 
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// import Footer from "../components/Footer";

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [formulariosActivos, setFormulariosActivos] = useState<any[]>([]);
  const [formulariosHistorial, setFormulariosHistorial] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // 1. Obtener perfil
      const { data: profileData } = await supabase
        .from('perfiles_alumni')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(profileData);

      // 2. Obtener TODOS los formularios
      const { data: todosFormularios } = await supabase
        .from('formularios')
        .select('id, titulo, descripcion, fecha_fin, activo, editable')
        .order('created_at', { ascending: false });

      // 3. Obtener las respuestas del usuario actual
      const { data: misRespuestas } = await supabase
        .from('respuestas_formularios')
        .select('formulario_id')
        .eq('user_id', user.id);

      const respondidosIds = new Set(misRespuestas?.map(r => r.formulario_id) || []);
      const ahora = new Date();

      const activos: any[] = [];
      const historial: any[] = [];

      todosFormularios?.forEach(form => {
        const yaRespondio = respondidosIds.has(form.id);
        const fechaFin = form.fecha_fin ? new Date(form.fecha_fin) : null;
        const yaVencio = fechaFin ? fechaFin < ahora : false;
        // Se considera inactivo si la bandera es false O si ya pasó la fecha de fin
        const estaActivo = form.activo && !yaVencio;

        // Calcular días restantes si hay fecha de fin y está activo
        let diasRestantes = null;
        if (estaActivo && fechaFin) {
          const diffTime = Math.abs(fechaFin.getTime() - ahora.getTime());
          diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        const formAnotado = { ...form, yaRespondio, yaVencio, diasRestantes, estaActivo };

        if (!yaRespondio && estaActivo) {
          // Pendientes por responder y que aún se pueden responder
          activos.push(formAnotado);
        } else if (yaRespondio || !estaActivo) {
          // Ya lo respondió O ya se venció/desactivó (y no lo alcanzó a responder)
          historial.push(formAnotado);
        }
      });

      setFormulariosActivos(activos);
      setFormulariosHistorial(historial);
      setCargando(false);
    }
    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (cargando) return <div className="min-h-screen flex items-center justify-center">Cargando panel...</div>;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <div className="flex-grow p-4 md:p-6">
        <div className="max-w-5xl mx-auto space-y-10 mt-6">
          
          {/* Cabecera */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-isbDeepBlue">Mi Panel Alumni</h1>
            <button onClick={handleLogout} className="text-red-500 flex items-center hover:bg-red-50 px-3 py-2 rounded-lg transition text-sm font-medium">
              <LogOut size={16} className="mr-2"/> Cerrar Sesión
            </button>
          </div>

          {/* Tarjeta de Perfil */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-isbDeepBlue to-isbTeal text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-inner">
              {profile?.nombres?.[0]}{profile?.apellido_paterno?.[0]}
            </div>
            <div className="flex-1 text-center md:text-left space-y-1">
              <h2 className="text-2xl font-bold text-gray-800">{profile?.nombres} {profile?.apellido_paterno}</h2>
              <p className="text-gray-500 flex items-center justify-center md:justify-start">
                <MapPin size={16} className="mr-1 text-isbTeal"/> {profile?.ciudad_actual}, {profile?.estado_actual}
              </p>
              <div className="inline-flex items-center space-x-4 mt-3 bg-gray-50 px-4 py-2 rounded-lg text-sm border border-gray-100">
                <span className="font-medium text-isbDeepBlue">Generación: <span className="font-normal text-gray-600">{profile?.generacion_ingreso}</span></span>
                <span className="text-gray-300">|</span>
                <span className="font-medium text-isbDeepBlue">Cuenta: <span className="font-normal text-gray-600">{profile?.numero_cuenta}</span></span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* COLUMNA 1: Tareas Pendientes */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center border-b pb-3">
                <ClipboardList className="mr-2 text-isbTeal"/> Tareas Pendientes
                <span className="ml-3 bg-isbTeal text-white text-xs py-1 px-2.5 rounded-full">{formulariosActivos.length}</span>
              </h3>
              
              {formulariosActivos.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-gray-100 text-center border-dashed">
                  <CheckCircle2 size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">¡Estás al día!</p>
                  <p className="text-sm text-gray-400 mt-1">No tienes encuestas pendientes por responder.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formulariosActivos.map(form => (
                    <Link key={form.id} href={`/dashboard/encuestas/${form.id}`} className="block bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:border-isbTeal hover:shadow-md transition group">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-800 group-hover:text-isbTeal transition pr-4">{form.titulo}</h4>
                        <span className="flex-shrink-0 flex items-center text-[10px] uppercase tracking-wider font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md border border-orange-100">
                          <Clock size={12} className="mr-1"/> Pendiente
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{form.descripcion}</p>
                      
                      {form.diasRestantes !== null && (
                        <div className="flex items-center text-xs text-orange-500 font-medium bg-orange-50/50 inline-block px-2 py-1 rounded">
                          Quedan {form.diasRestantes} días para responder
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* COLUMNA 2: Historial y Cuestionarios Completados */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center border-b pb-3">
                <Clock className="mr-2 text-gray-400"/> Historial de Cuestionarios
              </h3>
              
              {formulariosHistorial.length === 0 ? (
                <p className="text-sm text-gray-500 italic p-4 text-center">No hay historial disponible.</p>
              ) : (
                <div className="space-y-3">
                  {formulariosHistorial.map(form => (
                    <div key={form.id} className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`font-bold ${form.yaRespondio ? 'text-gray-700' : 'text-gray-400'} pr-4`}>
                          {form.titulo}
                        </h4>
                        
                        {/* Etiqueta de Estado */}
                        {form.yaRespondio ? (
                          <span className="flex-shrink-0 flex items-center text-[10px] uppercase tracking-wider font-bold text-green-700 bg-green-50 px-2 py-1 rounded-md border border-green-200">
                            <CheckCircle2 size={12} className="mr-1"/> Completado
                          </span>
                        ) : (
                          <span className="flex-shrink-0 flex items-center text-[10px] uppercase tracking-wider font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-100">
                            <CalendarX size={12} className="mr-1"/> Vencido
                          </span>
                        )}
                      </div>
                      
                      {/* Botones de Acción (Solo si ya lo respondió) */}
                      {form.yaRespondio && (
                        <div className="mt-4 flex space-x-3 border-t border-gray-200 pt-3">
                          {/* Botón Ver Respuestas (Siempre disponible si respondió) */}
                          <Link 
                            href={`/dashboard/encuestas/${form.id}?modo=ver`} 
                            className="flex items-center text-xs font-medium text-gray-600 hover:text-isbDeepBlue transition"
                          >
                            <Eye size={14} className="mr-1" /> Ver mis respuestas
                          </Link>
                          
                          {/* Botón Editar (Solo si el formulario permite edición Y está activo) */}
                          {form.editable && form.estaActivo && (
                            <Link 
                              href={`/dashboard/encuestas/${form.id}?modo=editar`} 
                              className="flex items-center text-xs font-medium text-isbTeal hover:text-teal-700 transition"
                            >
                              <Edit3 size={14} className="mr-1" /> Modificar respuestas
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>
        </div>
      </div>
      {/* <Footer /> */}
    </main>
  );
}