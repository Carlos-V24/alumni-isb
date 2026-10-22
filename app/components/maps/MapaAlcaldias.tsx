"use client";
import React, { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Tooltip } from "react-tooltip";

const geoUrl = "/data/cdmx-alcaldias.json";

interface MapaAlcaldiasProps {
  datosAlcaldias: any[];
  paleta: string[]; // Debe recibir 4 colores: [0, 1-2, 3-5, 5+]
}

export default function MapaAlcaldias({ datosAlcaldias, paleta }: MapaAlcaldiasProps) {
  const [tooltipContent, setTooltipContent] = useState("");

  // Escala de colores dinámica
  const getColor = (cantidad: number) => {
    if (!cantidad || cantidad === 0) return paleta[0];
    if (cantidad <= 2) return paleta[1];
    if (cantidad <= 5) return paleta[2];
    return paleta[3];
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full relative min-h-[180px]">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 45000, center: [-99.15, 19.3] }}
          style={{ width: "100%", height: "100%" }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const nombreGeo = geo.properties?.NOMGEO || geo.properties?.name || "Desconocido";
                const matchData = datosAlcaldias?.find((d: any) => d.alcaldia.toLowerCase() === nombreGeo.toLowerCase());
                const cantidad = matchData ? matchData.cantidad : 0;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getColor(cantidad)}
                    stroke="#FFFFFF"
                    strokeWidth={1}
                    className="transition-all duration-300 outline-none hover:opacity-75 cursor-pointer"
                    onMouseEnter={() => setTooltipContent(`${nombreGeo}: ${cantidad} egresados`)}
                    onMouseLeave={() => setTooltipContent("")}
                    data-tooltip-id="map-alcaldias-tooltip"
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
        
        <Tooltip 
          id="map-alcaldias-tooltip" 
          content={tooltipContent} 
          style={{ backgroundColor: paleta[3] }}
          className="z-50 !text-white !font-bold !rounded-md !px-3 !py-1 !text-sm shadow-lg border-none" 
        />
      </div>

      {/* Leyenda Dinámica */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] text-gray-600 mt-4 border-t border-gray-100 pt-3 w-full">
        <span className="flex items-center gap-1 font-medium"><span className="w-3.5 h-3.5 rounded-sm border border-gray-200 transition-colors" style={{ backgroundColor: paleta[0] }}></span> 0</span>
        <span className="flex items-center gap-1 font-medium"><span className="w-3.5 h-3.5 rounded-sm transition-colors" style={{ backgroundColor: paleta[1] }}></span> 1-2</span>
        <span className="flex items-center gap-1 font-medium"><span className="w-3.5 h-3.5 rounded-sm transition-colors" style={{ backgroundColor: paleta[2] }}></span> 3-5</span>
        <span className="flex items-center gap-1 font-medium"><span className="w-3.5 h-3.5 rounded-sm transition-colors" style={{ backgroundColor: paleta[3] }}></span> 5+</span>
      </div>
    </div>
  );
}