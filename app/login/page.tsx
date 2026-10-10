"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Loader2,
  Eye,
  EyeOff,
  AlertCircle
} from "lucide-react";
import Link from 'next/link';

// 1. Creamos un componente interno con el contenido del formulario
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  const deleteCookie = (name: string) => {
    if (typeof document !== "undefined") {
      document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (authError) {
      setError(
        authError.message === "Invalid login credentials" 
          ? "Correo o contraseña incorrectos." 
          : authError.message
      );
      setLoading(false);
    } else {
      const nextFromUrl = searchParams.get('next');
      const nextFromCookie = getCookie('next_url');
      const targetUrl = nextFromUrl || nextFromCookie || "/dashboard";

      deleteCookie('next_url');
      router.push(targetUrl);
    }
  };

  return (
    <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm space-y-6 border border-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-isbDeepBlue">Bienvenido Alumni</h1>
        <p className="text-sm text-gray-500 mt-1">Inicia sesión para continuar</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs flex items-center">
          <AlertCircle size={16} className="mr-2 flex-shrink-0" /> {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
            Correo Electrónico
          </label>
          <input 
            type="email" 
            placeholder="ejemplo@correo.com" 
            required 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isbTeal outline-none transition text-sm" 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Contraseña
            </label>
            <Link 
              href="/recuperar-contrasena" 
              className="text-xs text-isbTeal font-medium hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Escribe tu contraseña" 
              required 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isbTeal outline-none transition text-sm pr-12" 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-isbTeal transition-colors"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      </div>

      <button 
        disabled={loading} 
        type="submit"
        className="w-full bg-isbDeepBlue text-white py-3.5 rounded-xl font-bold hover:bg-isbTeal transition-all shadow-md flex justify-center items-center"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : "Entrar al Sistema"}
      </button>
      
      <p className="text-center text-sm text-gray-500">
        ¿No tienes cuenta? <Link href="/sign-up" className="text-isbTeal font-bold hover:underline">Regístrate</Link>
      </p>
    </form>
  );
}

// 2. Exportamos la página envolviendo LoginForm con <Suspense>
export default function Login() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />  

      <div className="flex-grow grid place-items-center py-12 px-4">
        <Suspense fallback={
          <div className="flex items-center justify-center p-8">
            <Loader2 className="animate-spin text-isbTeal" size={32} />
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>

      <Footer />
    </main>
  );
}