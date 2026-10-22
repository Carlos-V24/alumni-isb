// components/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-isbDeepBlue text-white shadow-lg sticky top-0 z-50">
      {/* Navegación */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 bg-isbDeepBlue">
          <div className="flex justify-between h-20 items-center">
            
            {/* Logo */}
            <Link href="./">
            <div className="text-2xl tracking-wider">
              <span className="text-white font-normal">Alumni</span> 
              <span className="text-white font-semibold"> ISB</span> 
            </div>
            </Link>

            {/* Menú de Escritorio */}
            <div className="hidden md:flex space-x-8 items-center">
              <a href="/stats/" className="hover:text-isbGold transition-colors duration-300">Estadisticas</a>
              {/* <a href="#" className="hover:text-isbGold transition-colors duration-300">Próximamente</a> */}
              <a href="/login/" className="border border-isbGold text-isbGold px-5 py-2 rounded hover:bg-isbGold hover:text-isbDeepBlue transition-all duration-300 font-semibold">
                Iniciar Sesión
              </a>
            </div>

            {/* Botón de Menú Móvil Animado */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="relative w-10 h-10 flex items-center justify-center text-white hover:text-isbGold focus:outline-none transition-colors duration-300"
                aria-label="Toggle menu"
              >
                {/* Ícono de Hamburguesa */}
                <Menu 
                  className={`absolute transition-all duration-300 ease-in-out ${
                    isMobileMenuOpen ? 'rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'
                  }`} 
                  size={28} 
                />
                {/* Ícono de X */}
                <X 
                  className={`absolute transition-all duration-300 ease-in-out ${
                    isMobileMenuOpen ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'
                  }`} 
                  size={28} 
                />
              </button>
            </div>
          </div>
        </div>

        {/* Menú Desplegable Móvil con Transición Suave */}
        <div 
          className={`md:hidden bg-[#001f36] border-t border-gray-700 overflow-hidden transition-all duration-500 ease-in-out origin-top ${
            isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 border-transparent'
          }`}
        >
          <div className="px-4 pt-2 pb-4 space-y-2 flex flex-col">
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-isbGold hover:bg-isbDeepBlue transition-colors duration-300">
              Organigrama
            </a>
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-isbGold hover:bg-isbDeepBlue transition-colors duration-300">
              Próximamente
            </a>
            <a href="./login/" className="block px-3 py-2 mt-4 text-center border border-isbGold text-isbGold rounded-md hover:bg-isbGold hover:text-isbDeepBlue transition-all duration-300 font-semibold">
              Iniciar Sesión
            </a>
          </div>
        </div>
      </nav>
  );
}