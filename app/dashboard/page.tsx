"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LogOut, MapPin, ClipboardList, CheckCircle2, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// import Footer from "../components/Footer"; // Descomenta si lo tienes en componente separado

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [encuestaFortalezasEstado, setEncuestaFortalezasEstado] = useState<"cargando" | "pendiente" | "completado">("cargando");
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // Obtener perfil
      const { data: profileData } = await supabase
        .from('perfiles_alumni')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(profileData);

      // Verificar si ya respondió el Cuestionario de Fortalezas
      const { data: encuestaData } = await supabase
        .from('encuesta_fortalezas')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      setEncuestaFortalezasEstado(encuestaData ? "completado" : "pendiente");
    }
    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!profile) return <div className="min-h-screen flex items-center justify-center">Cargando perfil...</div>;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow p-6">
        <div className="max-w-4xl mx-auto space-y-8 mt-6">
          
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-isbDeepBlue">Mi Panel Alumni</h1>
            <button onClick={handleLogout} className="text-red-500 flex items-center hover:underline text-sm font-medium">
              <LogOut size={16} className="mr-1"/> Salir
            </button>
          </div>

          {/* Card de Perfil */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 bg-isbDeepBlue text-white rounded-full flex items-center justify-center text-2xl font-bold">
              {profile.nombres[0]}{profile.apellido_paterno[0]}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold text-gray-800">{profile.nombres} {profile.apellido_paterno}</h2>
              <p className="text-gray-500 flex items-center justify-center md:justify-start mt-1">
                <MapPin size={14} className="mr-1"/> {profile.ciudad_actual}, {profile.estado_actual}
              </p>
              <p className="text-sm text-isbTeal mt-2 font-medium">Generación {profile.generacion_ingreso} | N° Cuenta: {profile.numero_cuenta}</p>
            </div>
          </div>

          {/* Sección Dinámica de Cuestionarios */}
          <section>
            <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
              <ClipboardList className="mr-2 text-isbTeal"/> Mis Tareas y Encuestas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Tarjeta del Cuestionario de Fortalezas */}
              {encuestaFortalezasEstado === "cargando" ? (
                <div className="bg-white p-5 rounded-xl border border-gray-100 animate-pulse h-24"></div>
              ) : encuestaFortalezasEstado === "pendiente" ? (
                <Link href="/dashboard/encuestas/fortalezas" className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-isbTeal transition group block cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-800 group-hover:text-isbTeal transition">Cuestionario de Fortalezas</h4>
                      <p className="text-sm text-gray-500 mt-1">Identificación de perfil y áreas de interés.</p>
                    </div>
                    <span className="flex items-center text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full border border-orange-100">
                      <Clock size={12} className="mr-1"/> Pendiente
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 opacity-75">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-600">Cuestionario de Fortalezas</h4>
                      <p className="text-sm text-gray-400 mt-1">¡Gracias por tu participación!</p>
                    </div>
                    <span className="flex items-center text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                      <CheckCircle2 size={12} className="mr-1"/> Completado
                    </span>
                  </div>
                </div>
              )}

            </div>
          </section>

        </div>
      </div>
      {/* <Footer /> */} 
    </main>
  );
}