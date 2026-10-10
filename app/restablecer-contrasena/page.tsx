"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";

export default function RestablecerContrasena() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    const problematicChars = /['";\\`]/g;
    if (problematicChars.test(value)) value = value.replace(problematicChars, '');

    setPassword(value);

    if (value.length > 0) {
      if (value.length < 8) setPasswordError("Debe tener al menos 8 caracteres.");
      else if (!/[A-Z]/.test(value)) setPasswordError("Debe incluir al menos 1 mayúscula.");
      else if (!/[a-z]/.test(value)) setPasswordError("Debe incluir al menos 1 minúscula.");
      else if (!/[!@#$%^&*()_+\-=\[\]{}|<>?.]/.test(value)) setPasswordError("Debe incluir al menos 1 carácter especial.");
      else setPasswordError("");
    } else {
      setPasswordError("");
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordError || password.length < 8) return;

    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      setCompleted(true);
      setTimeout(() => router.push("/login"), 3000);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <div className="flex-grow flex items-center justify-center p-4 py-12">
        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
          {completed ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-2xl font-bold text-isbDeepBlue">Contraseña Actualizada</h2>
              <p className="text-sm text-gray-600">Tu contraseña ha sido actualizada con éxito. Serás redirigido al inicio de sesión...</p>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-isbDeepBlue mb-2">Crear Nueva Contraseña</h1>
                <p className="text-sm text-gray-500">Ingresa tu nueva contraseña para acceder a tu cuenta Alumni ISB.</p>
              </div>

              {errorMsg && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center">
                  <AlertCircle size={16} className="mr-2 flex-shrink-0" /> {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Lock size={14} className="mr-1 text-gray-400" /> Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    placeholder="Escribe tu nueva contraseña"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition pr-12 ${passwordError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-isbTeal'}`}
                    onChange={handlePasswordChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-isbTeal transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {passwordError ? (
                  <p className="text-xs text-red-500 mt-2 flex items-center">
                    <AlertCircle size={12} className="mr-1" /> {passwordError}
                  </p>
                ) : password.length >= 8 ? (
                  <p className="text-xs text-green-600 mt-2 flex items-center">
                    <ShieldCheck size={12} className="mr-1" /> Contraseña válida
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={loading || !!passwordError || password.length < 8}
                className={`w-full font-bold py-3.5 rounded-xl transition-all shadow-md flex justify-center items-center text-white ${
                  loading || !!passwordError || password.length < 8
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-isbDeepBlue hover:bg-isbTeal'
                }`}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Guardar Contraseña"}
              </button>
            </form>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}