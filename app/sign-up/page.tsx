"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  User, 
  GraduationCap, 
  AlertCircle,
  CheckCircle2,
  Mail,
  MapPin,
  Globe,
  Loader2,
  Lock,
  ShieldCheck,
  Phone,
  Eye,      // <- Agregado
  EyeOff    // <- Agregado
} from "lucide-react";

const ESTADOS_MEXICO = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas", 
  "Chihuahua", "Ciudad de México", "Coahuila", "Colima", "Durango", "Estado de México", 
  "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "Michoacán", "Morelos", "Nayarit", 
  "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", 
  "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", 
  "Zacatecas", "Extranjero"
];

export default function Registro() {
  const currentYear = new Date().getFullYear();
  const entryYears = Array.from({ length: currentYear - 2015 + 1 }, (_, i) => 2015 + i);

  const [formData, setFormData] = useState({
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    fechaNacimiento: "",
    lugarNacimiento: "",
    correo: "",
    telefono: "",
    contrasena: "",
    ciudadActual: "",
    estadoActual: "",
    cpActual: "",
    numeroCuenta: "",
    generacionIngreso: "",
    yaEgresado: "no",
    añoEgreso: "",
    situacionActual: "",
    otraSituacion: ""
  });

  const [aceptaAviso, setAceptaAviso] = useState(false);
  const [aceptaPubli, setAceptaPubli] = useState(false);
  const [canEgresar, setCanEgresar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // <- NUEVO ESTADO

  // Lógica de 4.5 años para habilitar egreso
  useEffect(() => {
    if (formData.generacionIngreso) {
      const ingreso = parseInt(formData.generacionIngreso);
      if (currentYear - ingreso >= 4) {
        setCanEgresar(true);
      } else {
        setCanEgresar(false);
        setFormData(prev => ({ ...prev, yaEgresado: "no", añoEgreso: "", situacionActual: "" }));
      }
    }
  }, [formData.generacionIngreso, currentYear]);

  // Manejo y validación de contraseña en tiempo real
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Bloquear caracteres problemáticos
    const problematicChars = /['";\\`]/g;
    if (problematicChars.test(value)) {
      value = value.replace(problematicChars, '');
    }

    setFormData({ ...formData, contrasena: value });

    if (value.length > 0) {
      if (value.length < 8) {
        setPasswordError("Debe tener al menos 8 caracteres.");
      } else if (!/[A-Z]/.test(value)) {
        setPasswordError("Debe incluir al menos 1 mayúscula.");
      } else if (!/[a-z]/.test(value)) {
        setPasswordError("Debe incluir al menos 1 minúscula.");
      } else if (!/[!@#$%^&*()_+\-=\[\]{}|<>?.]/.test(value)) {
        setPasswordError("Debe incluir al menos 1 carácter especial (ej. @, #, $, -, _).");
      } else {
        setPasswordError(""); 
      }
    } else {
      setPasswordError("");
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!aceptaAviso) {
      setErrorMessage("Debes aceptar el Aviso de Privacidad para continuar.");
      return;
    }
    
    if (passwordError || formData.contrasena.length < 8) {
      setErrorMessage("Por favor, verifica que tu contraseña cumpla con los requisitos.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      // 1. NUEVO: Verificar si el número de cuenta ya existe
      const { data: correoOculto, error: rpcError } = await supabase.rpc('verificar_cuenta_existente', {
        p_numero_cuenta: formData.numeroCuenta
      });

      if (rpcError) throw rpcError;

      // Si la base de datos nos devuelve un correo, significa que el número ya está registrado
      if (correoOculto) {
        setErrorMessage(`El número de cuenta ${formData.numeroCuenta} ya se encuentra registrado y asociado al correo ${correoOculto}. Si es tu cuenta, por favor inicia sesión o recupera tu contraseña. De caso contrario contacte a alumniisbinteligencia@gmail.com`);
        setIsSubmitting(false);
        return; // Detiene el registro
      }

      // 2. Si no hay conflicto, procedemos con el registro normal
      const { data, error } = await supabase.auth.signUp({
        email: formData.correo,
        password: formData.contrasena,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`, 
          data: {
            nombres: formData.nombres,
            apellidoPaterno: formData.apellidoPaterno,
            apellidoMaterno: formData.apellidoMaterno,
            fechaNacimiento: formData.fechaNacimiento,
            lugarNacimiento: formData.lugarNacimiento,
            correo: formData.correo,
            telefono: formData.telefono,
            ciudadActual: formData.ciudadActual,
            estadoActual: formData.estadoActual,
            cpActual: formData.cpActual,
            numeroCuenta: formData.numeroCuenta,
            generacionIngreso: formData.generacionIngreso,
            yaEgresado: formData.yaEgresado,
            añoEgreso: formData.añoEgreso || null,
            situacionActual: formData.situacionActual || null,
            otraSituacion: formData.otraSituacion || null,
            recibirPublicidad: aceptaPubli
          }
        }
      });

      if (error) throw error;
      
      setSubmitStatus("success");
    } catch (error: any) {
      console.error("Error en el flujo de Auth:", error);
      setSubmitStatus("error");
      setErrorMessage(error.message || "Ocurrió un error al procesar tu alta de usuario.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (submitStatus === "success") {
    return (
      <main className="bg-gray-50 min-h-screen font-sans flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6 border border-gray-100">
          <div className="w-20 h-20 bg-blue-50 text-isbDeepBlue rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
            <Mail size={40} />
          </div>
          <h1 className="text-3xl font-bold text-isbDeepBlue">¡Verifica tu correo!</h1>
          
          <div className="text-gray-600 space-y-4">
            <p>
              Hemos enviado un enlace de confirmación a:
              <br/>
              <strong className="text-gray-800 text-lg">{formData.correo}</strong>
            </p>
            <p className="text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
              Por favor, haz clic en el enlace del correo para activar tu cuenta. 
              <br/><br/>
              <span className="text-isbTeal font-semibold">Al verificarlo, iniciarás sesión automáticamente y entrarás a tu panel.</span>
            </p>
            <p className="text-xs text-gray-400">
              * No olvides revisar tu carpeta de Spam o Correo no deseado si no lo encuentras en unos minutos.
            </p>
          </div>

          <Link href="/login" className="inline-block w-full bg-isbDeepBlue text-white font-bold py-3.5 rounded-xl hover:bg-isbTeal transition-all shadow-md mt-4">
            Ir al Inicio de Sesión
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen font-sans">
      
      <Navbar/>

      <div className="max-w-3xl mx-auto px-4 mt-12 mb-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-isbDeepBlue mb-2">Registro de Miembro</h1>
          <p className="text-gray-600">Únete a la red oficial de Egresados de Sistemas Biomédicos UNAM</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100">
          
          {/* SECCIÓN 1: Datos Personales */}
          <div className="space-y-5">
            <h2 className="flex items-center text-isbTeal font-bold uppercase text-xs tracking-widest border-b border-gray-100 pb-2">
              <User size={16} className="mr-2" /> Información Personal
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre(s)</label>
                <input required type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isbTeal outline-none transition" onChange={(e) => setFormData({...formData, nombres: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido Paterno</label>
                <input required type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isbTeal outline-none transition" onChange={(e) => setFormData({...formData, apellidoPaterno: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido Materno</label>
                <input required type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isbTeal outline-none transition" onChange={(e) => setFormData({...formData, apellidoMaterno: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                <input required type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isbTeal outline-none transition" onChange={(e) => setFormData({...formData, fechaNacimiento: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lugar de Nacimiento</label>
                <select required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isbTeal outline-none transition bg-white" onChange={(e) => setFormData({...formData, lugarNacimiento: e.target.value})}>
                  <option value="">Selecciona una opción</option>
                  {ESTADOS_MEXICO.map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: Contacto, Residencia y Seguridad */}
          <div className="space-y-5">
            <h2 className="flex items-center text-isbTeal font-bold uppercase text-xs tracking-widest border-b border-gray-100 pb-2">
              <Globe size={16} className="mr-2" /> Contacto y Seguridad
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Mail size={14} className="mr-1 text-gray-400" /> Correo Electrónico
                </label>
                <input required type="email" placeholder="ejemplo@correo.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isbTeal outline-none transition" onChange={(e) => setFormData({...formData, correo: e.target.value})} />
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Phone size={14} className="mr-1 text-gray-400" /> Número de Teléfono
                </label>
                <input required type="tel" maxLength={10} pattern="[0-9]{10}" title="Debe contener 10 dígitos" placeholder="Ej. 5512345678" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isbTeal outline-none transition" onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
              </div>

              {/* Contenedor de la Contraseña Modificado */}
              <div className="md:col-span-2 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Lock size={14} className="mr-1 text-gray-400" /> Contraseña de Acceso
                </label>
                <div className="relative">
                  <input 
                    required 
                    type={showPassword ? "text" : "password"} 
                    value={formData.contrasena}
                    placeholder="Crea una contraseña segura" 
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition pr-12 ${passwordError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-isbTeal'}`}
                    onChange={handlePasswordChange} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-isbTeal transition-colors focus:outline-none"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {passwordError ? (
                  <p className="text-xs text-red-500 mt-2 flex items-center">
                    <AlertCircle size={12} className="mr-1" /> {passwordError}
                  </p>
                ) : formData.contrasena.length > 0 ? (
                  <p className="text-xs text-green-600 mt-2 flex items-center">
                    <ShieldCheck size={12} className="mr-1" /> Contraseña segura
                  </p>
                ) : (
                  <p className="text-[11px] text-gray-500 mt-2">
                    Mínimo 8 caracteres, incluyendo mayúsculas, minúsculas y caracteres especiales. Caracteres como comillas y punto y coma están bloqueados.
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <MapPin size={14} className="mr-1 text-gray-400" /> Alcaldía / Municipio de Residencia Actual
                </label>
                <input required type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isbTeal outline-none transition" onChange={(e) => setFormData({...formData, ciudadActual: e.target.value})} />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado de Residencia</label>
                <select required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isbTeal outline-none transition bg-white" onChange={(e) => setFormData({...formData, estadoActual: e.target.value})}>
                  <option value="">Selecciona estado</option>
                  {ESTADOS_MEXICO.map(estado => (
                    <option key={`res-${estado}`} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                <input required type="text" maxLength={5} pattern="[0-9]{5}" title="Debe contener 5 dígitos" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isbTeal outline-none transition" onChange={(e) => setFormData({...formData, cpActual: e.target.value})} />
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: Datos Académicos */}
          <div className="space-y-5">
            <h2 className="flex items-center text-isbTeal font-bold uppercase text-xs tracking-widest border-b border-gray-100 pb-2">
              <GraduationCap size={16} className="mr-2" /> Trayectoria Académica
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de cuenta UNAM</label>
                <input required type="text" maxLength={9} pattern="[0-9]{9}" title="Debe contener exactamente 9 dígitos" placeholder="Ej. 312345678" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isbTeal outline-none transition" onChange={(e) => setFormData({...formData, numeroCuenta: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Generación de ingreso</label>
                <select required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isbTeal outline-none transition bg-white" value={formData.generacionIngreso} onChange={(e) => setFormData({...formData, generacionIngreso: e.target.value})}>
                  <option value="">Selecciona año</option>
                  {entryYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">¿Ya egresaste?</label>
                <select disabled={!canEgresar} className={`w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition bg-white ${!canEgresar ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'focus:ring-2 focus:ring-isbTeal'}`} value={formData.yaEgresado} onChange={(e) => setFormData({...formData, yaEgresado: e.target.value})}>
                  <option value="no">Aún soy alumno</option>
                  <option value="si">Sí, ya egresé</option>
                </select>
                {!canEgresar && formData.generacionIngreso && (
                  <p className="text-[10px] text-isbTeal mt-1 flex items-center">
                    <AlertCircle size={10} className="mr-1" /> Requiere 4.5 años desde el ingreso
                  </p>
                )}
              </div>
            </div>

            {formData.yaEgresado === "si" && (
              <div className="p-5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-isbDeepBlue mb-1">Año de Egreso</label>
                    <input required type="number" min={parseInt(formData.generacionIngreso) + 4} placeholder="AAAA" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isbTeal outline-none transition" onChange={(e) => setFormData({...formData, añoEgreso: e.target.value})} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-isbDeepBlue mb-1">Situación Actual</label>
                    <select required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isbTeal outline-none transition bg-white" onChange={(e) => setFormData({...formData, situacionActual: e.target.value})}>
                      <option value="">Selecciona opción</option>
                      <option value="proceso_titulacion">Terminé materias, en proceso de titulación</option>
                      <option value="titulado">Egresado/a titulado/a</option>
                      <option value="no_titulado">Egresado/a no titulado/a</option>
                      <option value="posgrado">Posgrado</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                </div>

                {formData.situacionActual === "otro" && (
                  <div className="animate-in zoom-in-95">
                    <label className="block text-sm font-medium text-isbDeepBlue mb-1">Especifique situación</label>
                    <input required type="text" placeholder="Respuesta corta..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isbTeal outline-none transition" onChange={(e) => setFormData({...formData, otraSituacion: e.target.value})} />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-gray-200">
            {/* Checkbox de Aviso de Privacidad */}
            <div className="flex items-start mb-6">
              <div className="flex items-center h-5">
                <input 
                  required
                  id="aviso" 
                  type="checkbox" 
                  className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-isbTeal" 
                  checked={aceptaAviso}
                  onChange={(e) => setAceptaAviso(e.target.checked)}
                />
              </div>
              <label htmlFor="aviso" className="ml-2 text-sm font-medium text-gray-700">
                He leído y acepto el <Link href="/aviso-de-privacidad" className="text-isbTeal hover:underline">Aviso de Privacidad Integral</Link> para el tratamiento de mis datos personales conforme a las finalidades primarias expuestas.
              </label>
            </div>

            <div className="flex items-start mb-6">
              <div className="flex items-center h-5">
                <input 
                  id="publi" 
                  type="checkbox" 
                  className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-isbTeal" 
                  checked={aceptaPubli}
                  onChange={(e) => setAceptaPubli(e.target.checked)}
                />
              </div>
              <label htmlFor="publi" className="ml-2 text-sm font-medium text-gray-700">
                Deseo recibir notificaciones por correo u otros canales respecto a las actividades, talleres u ofertas existentes.
              </label>
            </div>

            {/*ENVIAR INFO*/}
            <button 
              type="submit"
              disabled={isSubmitting || !!passwordError || formData.contrasena.length < 8}
              className={`w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 ${(isSubmitting || !!passwordError || formData.contrasena.length < 8) ? 'bg-gray-400 cursor-not-allowed' : 'bg-isbDeepBlue hover:bg-isbTeal hover:shadow-xl hover:-translate-y-0.5'}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Enviando datos...</span>
                </>
              ) : (
                <>
                  <span>Completar Registro Oficial</span>
                  <CheckCircle2 size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      <Footer/>
      {/* MODAL DE ERROR CON FONDO DESENFOCADO */}
            {errorMessage && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center transform scale-100 transition-all">
                  <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <AlertCircle size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Atención</h3>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    {errorMessage}
                  </p>
                  <button
                    onClick={() => setErrorMessage("")}
                    className="w-full bg-isbDeepBlue text-white font-bold py-3 rounded-xl hover:bg-isbTeal transition-colors shadow-md"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            )}
    </main>
  );
}