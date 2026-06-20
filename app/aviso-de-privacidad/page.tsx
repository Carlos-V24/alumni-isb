"use client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useState } from "react";
import Link from "next/link";
import { 
  MapPin, 
  Mail, 
  Menu, 
  X, 
  Building, 
  Target, 
  FileText, 
  Share2, 
  UserCheck, 
  RefreshCw,
  ArrowLeft 
} from "lucide-react";

export default function AvisoPrivacidad() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lista de secciones para la navegación rápida lateral
  const sections = [
    { id: "responsable", label: "Responsable del Tratamiento", icon: Building },
    { id: "finalidades", label: "Finalidades del Tratamiento", icon: Target },
    { id: "datos", label: "Datos Personales Recabados", icon: FileText },
    { id: "transferencias", label: "Transferencia de Datos", icon: Share2 },
    { id: "arco", label: "Derechos ARCO", icon: UserCheck },
    { id: "cambios", label: "Cambios al Aviso", icon: RefreshCw },
  ];

  return (
    <main className="bg-gray-50 text-gray-800 font-sans antialiased min-h-screen flex flex-col">
      
      {/* Navegación (Mismo diseño institucional) */}
      <Navbar/>

      {/* Encabezado de la Página Legal */}
      <header className="bg-isbDeepBlue text-white py-16 border-b border-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-isbDeepBlue to-isbTeal opacity-40"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link href="/" className="inline-flex items-center text-sm text-isbGold hover:underline mb-4 transition-all">
            <ArrowLeft size={16} className="mr-2" /> Volver al inicio
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Aviso de Privacidad Integral
          </h1>
          <p className="mt-2 text-sm text-gray-400 font-light">
            Última actualización: 04 de Mayo de 2026
          </p>
        </div>
      </header>

      {/* Cuerpo del Contenido Legal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Navegación Lateral Rápida (Solo visible en Escritorio) */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-28 space-y-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-3">Secciones</p>
              {sections.map((sec) => {
                const IconComponent = sec.icon;
                return (
                  <a 
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="flex items-center space-x-3 px-3 py-2.5 text-sm rounded-lg text-gray-600 hover:bg-gray-50 hover:text-isbTeal font-medium transition-all"
                  >
                    <IconComponent size={16} className="text-gray-400" />
                    <span>{sec.label}</span>
                  </a>
                );
              })}
            </div>
          </aside>

          {/* Texto Legal */}
          <section className="col-span-1 lg:col-span-3 space-y-12 bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100">
            
            <p className="text-gray-600 leading-relaxed text-base italic border-l-4 border-isbGold pl-4">
              En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares y su Reglamento, la Asociación de Egresados de Ingeniería en Sistemas Biomédicos (en adelante e indistintamente &ldquo;Alumni ISB&rdquo; o la &ldquo;Asociación&rdquo;), pone a su disposición el presente Aviso de Privacidad.
            </p>

            {/* 1. Responsable */}
            <div id="responsable" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl font-bold text-isbDeepBlue flex items-center">
                <Building className="w-5 h-5 mr-3 text-isbTeal" />
                Identidad y domicilio del responsable
              </h2>
              <p className="text-gray-600 leading-relaxed pl-8">
                La Asociación de Egresados de Ingeniería en Sistemas Biomédicos de la UNAM, con domicilio para oír y recibir notificaciones en la Facultad de Ingeniería, Universidad Nacional Autónoma de México (Ciudad Universitaria, CDMX), es la responsable del tratamiento, resguardo y protección de sus datos personales.
              </p>
            </div>

            {/* 2. Finalidades */}
            <div id="finalidades" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl font-bold text-isbDeepBlue flex items-center">
                <Target className="w-5 h-5 mr-3 text-isbTeal" />
                Finalidades del tratamiento
              </h2>
              <div className="pl-8 space-y-4">
                <div>
                  <h3 className="text-sm uppercase font-bold text-gray-500 tracking-wider mb-2">Finalidades Primarias</h3>
                  <p className="text-gray-600 mb-3 font-light text-sm">Necesarias para mantener la relación institucional con Alumni ISB:</p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600 text-sm">
                    <li>Integración y actualización de la base de datos de egresados y alumnos de ISB.</li>
                    <li>Validación de la trayectoria académica y profesional de los miembros.</li>
                    <li>Comunicación para fines institucionales y de vinculación profesional.</li>
                    <li>Elaboración de reportes escolares, educativos y profesionales sobre los integrantes de la Asociación.</li>
                    <li>Elaboración de reportes estadísticos y documentos de trabajo sobre el perfil del egresado.</li>
                    <li>Publicación de análisis, estudios, documentos de trabajo, investigaciones y publicaciones de carácter académico o institucional.</li>
                  </ul>
                </div>
                
                <div className="pt-2">
                  <h3 className="text-sm uppercase font-bold text-gray-500 tracking-wider mb-2">Finalidades Secundarias</h3>
                  <p className="text-gray-600 mb-3 font-light text-sm">No necesarias para la relación jurídica, pero orientadas a aportar valor a su desarrollo:</p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600 text-sm">
                    <li>Envío de convocatorias a eventos, cursos, talleres y vacantes laborales.</li>
                    <li>Difusión de logros profesionales en boletines o redes sociales de la Asociación.</li>
                    <li>Realización de encuestas de satisfacción o de mercado laboral.</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-4 text-xs text-gray-500 leading-relaxed">
                  Todos los datos serán tratados siempre bajo estrictos criterios de confidencialidad, resguardo y uso legítimo de la información. Si no desea que sus datos se utilicen para estas finalidades secundarias, puede manifestar su negativa enviando un correo electrónico a: <a href="mailto:egresados_isb@fi.unam.edu" className="text-isbTeal hover:underline font-semibold">egresados_isb@fi.unam.edu</a>.
                </div>
              </div>
            </div>

            {/* 3. Datos Personales */}
            <div id="datos" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl font-bold text-isbDeepBlue flex items-center">
                <FileText className="w-5 h-5 mr-3 text-isbTeal" />
                Datos personales que serán sometidos a tratamiento
              </h2>
              <p className="text-gray-600 pl-8 text-sm mb-2">
                Para cumplir con las finalidades descritas en este aviso, la plataforma recabará las siguientes categorías de información:
              </p>
              <div className="pl-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <h4 className="font-bold text-isbDeepBlue text-sm mb-1">Datos de identificación</h4>
                  <p className="text-xs text-gray-600">Nombre completo, fecha de nacimiento y lugar de nacimiento.</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <h4 className="font-bold text-isbDeepBlue text-sm mb-1">Datos de contacto</h4>
                  <p className="text-xs text-gray-600">Correo electrónico, teléfono móvil o fijo, domicilio residencial y perfil profesional de LinkedIn.</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <h4 className="font-bold text-isbDeepBlue text-sm mb-1">Datos académicos</h4>
                  <p className="text-xs text-gray-600">Número de cuenta (UNAM), generación, situación académica (pasante/titulado), año de egreso y área de especialidad biomédica.</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <h4 className="font-bold text-isbDeepBlue text-sm mb-1">Datos profesionales</h4>
                  <p className="text-xs text-gray-600">Lugar actual de trabajo, cargo u ocupación, experiencia laboral previa y trayectoria en el sector clínico o tecnológico.</p>
                </div>
              </div>
            </div>

            {/* 4. Transferencias */}
            <div id="transferencias" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl font-bold text-isbDeepBlue flex items-center">
                <Share2 className="w-5 h-5 mr-3 text-isbTeal" />
                Transferencias de datos
              </h2>
              <p className="text-gray-600 leading-relaxed pl-8 text-sm">
                Alumni ISB se compromete a no transferir su información personal a terceros ajenos a la organización sin su consentimiento, salvo las excepciones previstas en el artículo 37 de la LFPDPPP o para fines estrictamente estadísticos donde la información haya sido previamente anonimizada.
              </p>
              <p className="text-gray-600 leading-relaxed pl-8 text-sm">
                Los datos personales no serán divulgados de manera individualizada ni utilizados para finalidades distintas a las aquí previstas. En su caso, la información que derive de su tratamiento podrá ser incorporada en análisis, reportes, investigaciones o publicaciones únicamente de manera agregada, disociada o anonimizada, de forma tal que no permita la identificación directa o indirecta de las personas titulares. En caso de querer compartir su perfil con aliados estratégicos del sector salud, Alumni ISB solicitará su **autorización expresa previa**.
              </p>
            </div>

            {/* 5. Derechos ARCO */}
            <div id="arco" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl font-bold text-isbDeepBlue flex items-center">
                <UserCheck className="w-5 h-5 mr-3 text-isbTeal" />
                Derechos ARCO y Revocación del Consentimiento
              </h2>
              <p className="text-gray-600 leading-relaxed pl-8 text-sm">
                Usted tiene derecho a conocer qué datos tenemos de usted (**Acceso**), solicitar su corrección en caso de estar desactualizados o ser inexactos (**Rectificación**), pedir que los eliminemos de nuestras bases de datos (**Cancelación**) u oponerse al uso de los mismos para fines específicos (**Oposición**).
              </p>
              <p className="text-gray-600 leading-relaxed pl-8 text-sm">
                Para ejercer cualquiera de estos derechos ARCO, deberá enviar una solicitud formal al correo electrónico <a href="mailto:egresados_isb@fi.unam.edu" className="text-isbTeal hover:underline font-semibold">egresados_isb@fi.unam.edu</a> adjuntando la siguiente documentación:
              </p>
              <ul className="list-disc pl-13 space-y-1.5 text-gray-600 text-sm">
                <li>Nombre completo del titular y un medio de contacto (correo electrónico) para comunicarle la respuesta.</li>
                <li>Documento oficial digitalizado que acredite su identidad (Identificación Oficial INE o Credencial de Alumno/Exalumno UNAM).</li>
                <li>Descripción clara y precisa de los datos personales respecto de los cuales busca ejercer alguno de los derechos ARCO.</li>
              </ul>
            </div>

            {/* 6. Cambios al aviso */}
            <div id="cambios" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl font-bold text-isbDeepBlue flex items-center">
                <RefreshCw className="w-5 h-5 mr-3 text-isbTeal" />
                Cambios al Aviso de Privacidad
              </h2>
              <p className="text-gray-600 leading-relaxed pl-8 text-sm">
                Alumni ISB se reserva el derecho de efectuar en cualquier momento modificaciones o actualizaciones al presente aviso de privacidad, con el fin de atender novedades legislativas o políticas internas. Las modificaciones estarán disponibles para su consulta directamente en nuestra plataforma web oficial y/o mediante los canales informativos de la comunidad en redes sociales, enviando adicionalmente una notificación al último correo electrónico que haya registrado con nosotros.
              </p>
            </div>

          </section>
        </div>
      </div>

      {/* Footer Elegante */}
      <Footer/>
    </main>
  );
}