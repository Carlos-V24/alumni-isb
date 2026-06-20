"use client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  User, 
  GraduationCap, 
  AlertCircle,
  CheckCircle2,
  Mail,
  Menu,
  X,
  MapPin,
  Globe,
  Loader2,
  Lock,
  ShieldCheck
} from "lucide-react";
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

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
          <input type="password" placeholder="Contraseña" required className="w-full px-4 py-3 border rounded-lg" onChange={(e) => setPassword(e.target.value)} />
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