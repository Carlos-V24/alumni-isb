"use client";
import React, { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Tooltip } from "react-tooltip";

const geoUrl = "/data/states_simple.json"; 

interface MapaProps {
  datosOrigen: any[];
  datosResidencia: any[];
  paletaOrigen: string[];     // Array de 4 colores: [0, 1-2, 3-5, 5+]
  paletaResidencia: string[]; // Array de 4 colores: [0, 1-2, 3-5, 5+]
}

export default function MapaEstadosCombinado({ datosOrigen, datosResidencia, paletaOrigen, paletaResidencia }: MapaProps) {
  const [modo, setModo] = useState<"origen" | "residencia">("origen");
  const [tooltipContent, setTooltipContent] = useState("");

  const activeData = modo === "origen" ? datosOrigen : datosResidencia;
  const activePalette = modo === "origen" ? paletaOrigen : paletaResidencia;

  const getColor = (cantidad: number) => {
    if (!cantidad || cantidad === 0) return activePalette[0];
    if (cantidad <= 2) return activePalette[1];
    if (cantidad <= 5) return activePalette[2];
    return activePalette[3];
  };

  const normalizar = (texto: string) => 
    texto ? texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

  return (
    <div className="w-full h-full flex flex-col items-center justify-between">
      {/* Selector (Toggle) */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-2 w-full max-w-[250px] relative z-10">
        <button
          onClick={() => setModo("origen")}
          className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${
            modo === "origen" ? "bg-white shadow text-isbDeepBlue" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Origen
        </button>
        <button
          onClick={() => setModo("residencia")}
          className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${
            modo === "residencia" ? "bg-white shadow text-[#975A16]" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Residencia
        </button>
      </div>

      {/* Contenedor del Mapa */}
      <div className="w-full flex-1 relative min-h-[180px]">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 1300, center: [-102, 23.5] }}
          style={{ width: "100%", height: "100%" }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const nombreGeo = geo.properties?.NOMGEO || geo.properties?.name || "Desconocido";
                const matchData = activeData?.find((d: any) => normalizar(d.estado) === normalizar(nombreGeo));
                const cantidad = matchData ? matchData.cantidad : 0;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getColor(cantidad)}
                    stroke="#FFFFFF"
                    strokeWidth={0.5}
                    className="transition-all duration-300 outline-none hover:opacity-75 cursor-pointer"
                    onMouseEnter={() => setTooltipContent(`${nombreGeo}: ${cantidad}`)}
                    onMouseLeave={() => setTooltipContent("")}
                    data-tooltip-id="map-nacional-tooltip"
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
        
        <Tooltip 
          id="map-nacional-tooltip" 
          content={tooltipContent} 
          className={`z-50 !text-white !font-bold !rounded-md !px-3 !py-1 !text-sm shadow-lg ${modo === "origen" ? "!bg-[#001F36]" : "!bg-[#975A16]"}`} 
        />
      </div>

      {/* Leyenda Dinámica */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] text-gray-600 mt-2 border-t border-gray-100 pt-2 w-full">
        <span className="flex items-center gap-1 font-medium"><span className="w-3 h-3 rounded-sm border border-gray-200 transition-colors duration-300" style={{ backgroundColor: activePalette[0] }}></span> 0</span>
        <span className="flex items-center gap-1 font-medium"><span className="w-3 h-3 rounded-sm transition-colors duration-300" style={{ backgroundColor: activePalette[1] }}></span> 1-2</span>
        <span className="flex items-center gap-1 font-medium"><span className="w-3 h-3 rounded-sm transition-colors duration-300" style={{ backgroundColor: activePalette[2] }}></span> 3-5</span>
        <span className="flex items-center gap-1 font-medium"><span className="w-3 h-3 rounded-sm transition-colors duration-300" style={{ backgroundColor: activePalette[3] }}></span> 5+</span>
      </div>
    </div>
  );
}