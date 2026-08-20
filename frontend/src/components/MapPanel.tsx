'use client';

import { useMemo, useRef } from 'react';
import type { MapRef } from 'react-map-gl';
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import MapboxMap, { Marker as MapboxMarker, NavigationControl as MapboxNav } from 'react-map-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { SearchResultDto, formatBRL } from '@/lib/types';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

/** Estilo gratuito (OpenFreeMap/Positron) usado quando não há token Mapbox. */
const FREE_STYLE = 'https://tiles.openfreemap.org/styles/positron';
const MAPBOX_STYLE = 'mapbox://styles/mapbox/light-v11';

/**
 * Pin de mapa com o score dentro — réplica do design (pin coral para o
 * selecionado, branco para os demais, com "rabinho" rotacionado 45°).
 */
function ScorePin({
  result,
  selected,
  onClick,
}: {
  result: SearchResultDto;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="relative group" aria-label={`Ver ${result.property.title}`}>
      <div className="relative">
        <div
          className={
            selected
              ? 'w-12 h-12 bg-coral text-white rounded-full flex items-center justify-center text-headline-md shadow-[0_8px_16px_rgba(216,90,48,0.4)] border-2 border-white relative z-10'
              : 'w-10 h-10 bg-white text-on-surface rounded-full flex items-center justify-center text-label-md shadow-md border border-neutral-fill relative z-10 transition-transform group-hover:-translate-y-1'
          }
        >
          {result.score}
        </div>
        <div
          className={
            selected
              ? 'w-4 h-4 bg-coral rotate-45 absolute -bottom-2 left-1/2 -translate-x-1/2 border-b-2 border-r-2 border-white z-0'
              : 'w-3 h-3 bg-white rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-b border-r border-neutral-fill z-0'
          }
        />
        {selected && <div className="absolute inset-0 bg-coral rounded-full animate-ping opacity-20" />}
        {/* Hover card */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 bg-white rounded-xl shadow-lg border border-neutral-fill p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="w-full h-24 object-cover rounded-lg mb-2"
            src={result.property.imageUrl}
            alt={result.property.title}
          />
          <p className="text-label-md text-coral truncate">{result.property.title}</p>
          <p className="text-label-sm text-on-surface-variant">
            {formatBRL(result.property.rentPrice)}/mês
          </p>
        </div>
      </div>
    </button>
  );
}

/**
 * Painel de mapa interativo.
 * Com NEXT_PUBLIC_MAPBOX_TOKEN → Mapbox GL (light-v11);
 * sem token → MapLibre GL com tiles OSM gratuitos. Mesma API de componentes,
 * então os pins/controles são idênticos nos dois modos.
 */
export function MapPanel({
  results,
  selectedId,
  onSelect,
}: {
  results: SearchResultDto[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const mapRef = useRef<MapRef | null>(null);

  const initialView = useMemo(() => {
    if (results.length === 0) return { latitude: -23.5629, longitude: -46.6544, zoom: 12 };
    const lats = results.map((r) => r.property.lat);
    const lngs = results.map((r) => r.property.lng);
    return {
      latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
      longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
      zoom: 12.5,
    };
  }, [results]);

  // Pins ordenados para o selecionado renderizar por cima
  const ordered = useMemo(
    () => [...results].sort((a, b) => (a.id === selectedId ? 1 : b.id === selectedId ? -1 : 0)),
    [results, selectedId],
  );

  const markers = ordered.map((r) => ({
    key: r.id,
    lat: r.property.lat,
    lng: r.property.lng,
    node: <ScorePin result={r} selected={r.id === selectedId} onClick={() => onSelect(r.id)} />,
  }));

  const flyTo = (id: string) => {
    const r = results.find((x) => x.id === id);
    if (r) mapRef.current?.flyTo({ center: [r.property.lng, r.property.lat], zoom: 14, duration: 800 });
  };

  const handleSelect = (id: string) => {
    onSelect(id);
    flyTo(id);
  };

  if (MAPBOX_TOKEN) {
    return (
      <MapboxMap
        ref={mapRef as never}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={initialView}
        mapStyle={MAPBOX_STYLE}
        style={{ width: '100%', height: '100%' }}
      >
        <MapboxNav position="top-right" />
        {markers.map((m) => (
          <MapboxMarker key={m.key} latitude={m.lat} longitude={m.lng} anchor="bottom">
            <div onClick={() => handleSelect(m.key)}>{m.node}</div>
          </MapboxMarker>
        ))}
      </MapboxMap>
    );
  }

  return (
    <Map
      ref={mapRef as never}
      initialViewState={initialView}
      mapStyle={FREE_STYLE}
      style={{ width: '100%', height: '100%' }}
    >
      <NavigationControl position="top-right" />
      {markers.map((m) => (
        <Marker key={m.key} latitude={m.lat} longitude={m.lng} anchor="bottom">
          <div onClick={() => handleSelect(m.key)}>{m.node}</div>
        </Marker>
      ))}
    </Map>
  );
}
