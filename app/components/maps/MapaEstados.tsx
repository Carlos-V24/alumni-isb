// src/components/MapaEstados.tsx
"use client";
import React, { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Tooltip } from "react-tooltip";

// Ruta al archivo GeoJSON de la República Mexicana
const geoUrl = "/data/states_simple.json"; 
// Si prefieres usar el de internet, descomenta la siguiente línea:
// const geoUrl = "https://code.highcharts.com/mapdata/countries/mx/mx-all.geo.json";

export default function MapaEstados({ datosEstados, idUnico }: { datosEstados: any[], idUnico: string }) {
  const [tooltipContent, setTooltipContent] = useState("");

  // Escala de colores
  const getColor = (cantidad: number) => {
    if (!cantidad || cantidad === 0) return "#E2E8F0"; // Gris (Sin egresados)
    if (cantidad <= 2) return "#63B3ED";               // Azul claro
    if (cantidad <= 5) return "#2B6CB0";               // Azul medio
    return "#001F36";                                  // Azul oscuro
  };

  // Función para normalizar textos (quitar acentos y mayúsculas para comparar bien)
  const normalizar = (texto: string) => 
    texto ? texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full relative h-[180px]">
        <ComposableMap
          projection="geoMercator"
          // Coordenadas para enfocar la República Mexicana
          projectionConfig={{ scale: 1200, center: [-102, 23.5] }}
          style={{ width: "100%", height: "100%" }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                // El nombre del estado puede venir en NOMGEO, name, o estado
                const nombreGeo = geo.properties?.NOMGEO || geo.properties?.name || "Desconocido";
                
                // Buscamos el estado en tus datos normalizando el texto
                const matchData = datosEstados?.find((d: any) => 
                  normalizar(d.estado) === normalizar(nombreGeo)
                );
                const cantidad = matchData ? matchData.cantidad : 0;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getColor(cantidad)}
                    stroke="#FFFFFF"
                    strokeWidth={0.5}
                    className="transition-opacity duration-200 outline-none hover:opacity-75 cursor-pointer"
                    onMouseEnter={() => setTooltipContent(`${nombreGeo}: ${cantidad}`)}
                    onMouseLeave={() => setTooltipContent("")}
                    data-tooltip-id={idUnico} // Usamos el ID único para que no choquen los mapas
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
        
        <Tooltip 
          id={idUnico} 
          content={tooltipContent} 
          className="z-50 !bg-[#001F36] !text-white !font-bold !rounded-md !px-3 !py-1 !text-sm shadow-lg" 
        />
      </div>

      {/* Leyenda de rangos */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] text-gray-600 mt-4 border-t border-gray-100 pt-3 w-full">
        <span className="flex items-center gap-1 font-medium"><span className="w-3 h-3 bg-[#E2E8F0] rounded-sm border border-gray-200"></span> 0</span>
        <span className="flex items-center gap-1 font-medium"><span className="w-3 h-3 bg-[#63B3ED] rounded-sm"></span> 1-2</span>
        <span className="flex items-center gap-1 font-medium"><span className="w-3 h-3 bg-[#2B6CB0] rounded-sm"></span> 3-5</span>
        <span className="flex items-center gap-1 font-medium"><span className="w-3 h-3 bg-[#001F36] rounded-sm"></span> 5+</span>
      </div>
    </div>
  );
}