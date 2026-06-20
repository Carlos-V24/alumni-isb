"use client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 items-center justify-center">
    <Navbar/>  

    <div className="h-screen grid place-items-center py-2">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-isbDeepBlue">Bienvenido Alumni</h1>
          <p className="text-sm text-gray-500">Inicia sesión para continuar</p>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className="space-y-4">
          <input type="email" placeholder="Correo electrónico" required className="w-full px-4 py-3 border rounded-lg" onChange={(e) => setEmail(e.target.value)} />
          <div className="relative">
            <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Contraseña" 
                required 
                className="w-full px-4 py-3 border rounded-lg pr-12" 
                onChange={(e) => setPassword(e.target.value)} 
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-isbTeal transition-colors"
            >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            </div>
        </div>

        <button disabled={loading} className="w-full bg-isbDeepBlue text-white py-3 rounded-lg font-bold hover:bg-isbTeal transition flex justify-center">
          {loading ? <Loader2 className="animate-spin" /> : "Entrar al Sistema"}
        </button>
        
        <p className="text-center text-sm text-gray-500">
          ¿No tienes cuenta? <Link href="/sign-up" className="text-isbTeal font-bold">Regístrate</Link>
        </p>
      </form>
    </div>

        {/* Footer Elegante (Importado desde tu diseño original) */}
      <Footer/>
    </main>
  );
}