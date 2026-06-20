// components/Footer.tsx
import { Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
          <footer className="bg-isbDeepBlue text-white pt-16 pb-8 border-t-4 border-isbGold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="text-2xl tracking-wider mb-4">
                <span className="text-white font-normal">Alumni</span> 
                <span className="text-white font-semibold"> ISB</span> 
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Asociación de Egresados de Ingeniería en Sistemas Biomédicos | UNAM.
              </p>
              <div>
                <p>Redes Sociales</p>
                <a href="Instagra"></a>
                <a href="Linkedin"></a>
                <a href="Youtube"></a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg text-isbGold mb-4">Explora</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><a href="/" className="hover:text-white hover:underline transition-colors duration-300">Inicio</a></li>
                <li><a href="#" className="hover:text-white hover:underline transition-colors duration-300">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-white hover:underline transition-colors duration-300">Organigrama</a></li>
                <li><a href="#" className="hover:text-white hover:underline transition-colors duration-300">Eventos y Talleres</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg text-isbGold mb-4">Contacto</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start">
                  <MapPin className="w-5 h-5 mr-3 mt-0.5 text-isbGold flex-shrink-0" />
                  <span>Facultad de Ingeniería, UNAM<br />Ciudad Universitaria, CDMX</span>
                </li>
                <li className="flex items-center">
                  <Mail className="w-5 h-5 mr-3 text-isbGold flex-shrink-0" />
                  <a href="mailto:egresados_isb@fi.unam.edu" className="hover:text-white transition-colors duration-300 break-all">egresados_isb@fi.unam.edu</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-600 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
            <p className="mb-4 md:mb-0 text-center md:text-left">
              &copy; {new Date().getFullYear()} Alumni ISB. Todos los derechos reservados.
            </p>
            
            <div className="flex space-x-6">
              <a href="/aviso-de-privacidad" className="hover:text-isbGold transition-colors duration-300 font-medium">
                Aviso de Privacidad
              </a>
              <a href="/terminos-y-condiciones" className="hover:text-isbGold transition-colors duration-300 font-medium">
                Términos y Condiciones
              </a>
            </div>
          </div>
          
        </div>
      </footer>
  );
}