"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function RecuperarContrasena() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Determina el origen dinámicamente para producción o local
    const redirectUrl = `${window.location.origin}/restablecer-contrasena`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <div className="flex-grow flex items-center justify-center p-4 py-12">
        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
          <Link href="/login" className="text-sm text-gray-500 hover:text-isbTeal flex items-center mb-6 transition">
            <ArrowLeft size={16} className="mr-1" /> Volver al inicio de sesión
          </Link>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-2xl font-bold text-isbDeepBlue">Correo Enviado</h2>
              <p className="text-sm text-gray-600">
                Hemos enviado las instrucciones a <strong className="text-gray-800">{email}</strong>. Revisa tu bandeja de entrada o spam.
              </p>
            </div>
          ) : (
            <form onSubmit={handleResetRequest} className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-isbDeepBlue mb-2">Recuperar Contraseña</h1>
                <p className="text-sm text-gray-500">
                  Ingresa tu correo institucional o personal asociado a tu cuenta de Alumni ISB.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center">
                  <AlertCircle size={16} className="mr-2 flex-shrink-0" /> {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Mail size={14} className="mr-1 text-gray-400" /> Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isbTeal outline-none transition"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-isbDeepBlue text-white font-bold py-3.5 rounded-xl hover:bg-isbTeal transition-all shadow-md flex justify-center items-center"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Enviar Enlace de Recuperación"}
              </button>
            </form>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}