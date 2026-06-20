"use client";

import Image from "next/image";
import { useState } from "react";
import { MapPin, Mail, Menu, X } from "lucide-react";
import Link from 'next/link';

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <main className="bg-gray-50 text-gray-800 font-sans antialiased min-h-screen flex flex-col">
      
      {/* Navegación */}
      <Navbar/>

      {/* Hero Section */}
      <header className="relative bg-gradient-to-b from-isbDeepBlue to-isbTeal text-white overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 transition-all duration-500">
            Conectando el talento en <br /> 
            <span className="bg-gradient-to-r from-[#BF953F] to-[#FCF6BA] bg-clip-text text-transparent">
              Sistemas Biomédicos
            </span>
          </h1>
          <p className="text-xl md:text-2xl font-light max-w-3xl mb-10 text-gray-200">
            Sitio web de la Asociación de Egresados de Ingeniería en Sistemas Biomédicos, UNAM. Sitio en proceso, espera más proximamenete

          </p>
          <Link 
              href="./sign-up/" 
              className="inline-block bg-gradient-to-r from-[#BF953F] to-[#FCF6BA] text-isbDeepBlue font-bold px-8 py-3 rounded shadow-lg hover:shadow-xl hover:opacity-90 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 text-center"
            >
              Regístrate Ahora
            </Link>
        </div>
      </header>

      {/* Sección "Sobre Nosotros" y Galería Dinámica */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-isbDeepBlue mb-6">Sobre Alumni ISB</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Somos la comunidad que une a las generaciones de ingenieros en sistemas biomédicos de la Facultad de Ingeniería. Nuestro propósito es crear un ecosistema donde la innovación clínica, la tecnología y la experiencia profesional se encuentren para impulsar el desarrollo del sector salud.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[250px]">
            
            {/* Imagen 1 */}
            <div className="relative group overflow-hidden rounded-xl shadow-md md:col-span-2">
              <Image 
                src="https://djxudbldtyuyenvtiduw.supabase.co/storage/v1/object/public/src/Habilidades.png" 
                alt="Generación de Innovadores"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-isbDeepBlue bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center z-10">
                <span className="text-white font-semibold text-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 text-center px-4">
                  Desarollo de habilidades
                </span>
              </div>
            </div>

            {/* Imagen 2 */}
            <div className="relative group overflow-hidden rounded-xl shadow-md">
              <Image 
                src="https://djxudbldtyuyenvtiduw.supabase.co/storage/v1/object/public/src/Talleres.jpeg" 
                alt="Talleres.ZIP"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-isbTeal bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center z-10">
                <span className="text-white font-semibold text-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 text-center px-4">
                  Talleres y cursos
                </span>
              </div>
            </div>

            {/* Imagen 3 */}
            <div className="relative group overflow-hidden rounded-xl shadow-md">
              <Image 
                src="https://djxudbldtyuyenvtiduw.supabase.co/storage/v1/object/public/src/Trabajo_equipo.jpg" 
                alt="Proyectos Clínicos"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-isbTeal bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center z-10">
                <span className="text-white font-semibold text-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 text-center px-4">
                  Proyectos y trabajo en equipo
                </span>
              </div>
            </div>

            {/* Imagen 4 */}
            <div className="relative group overflow-hidden rounded-xl shadow-md md:col-span-2">
              <Image 
                src="https://djxudbldtyuyenvtiduw.supabase.co/storage/v1/object/public/src/Convivencia.jpeg" 
                alt="Networking y Comunidad"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-isbDeepBlue bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center z-10">
                <span className="text-white font-semibold text-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 text-center px-4">
                  Networking y Comunidad
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      <div className="flex-grow"></div>

      {/* Footer Elegante */}
      <Footer/>
    </main>
  );
}