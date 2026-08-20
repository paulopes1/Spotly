'use client';

import { useMemo, useRef } from 'react';
import type { MapRef } from 'react-map-gl';
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import MapboxMap, { Marker as MapboxMarker, NavigationControl as MapboxNav } from 'react-map-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  NeighborhoodAppreciationDto,
  URBAN_PROJECT_STATUS_LABELS,
  URBAN_PROJECT_TYPE_ICONS,
  URBAN_PROJECT_TYPE_LABELS,
} from '@/lib/types';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const FREE_STYLE = 'https://tiles.openfreemap.org/styles/positron';
const MAPBOX_STYLE = 'mapbox://styles/mapbox/light-v11';

/** Cor do coral com alfa proporcional ao score — mais forte = bairro mais quente para investir. */
function heatStyle(score: number) {
  const alpha = 0.15 + (score / 100) * 0.75;
  return {
    background: `rgba(216, 90, 48, ${alpha})`,
    color: score >= 55 ? '#ffffff' : '#993C1D',
    border: score >= 80 ? '2px solid #993C1D' : '1px solid rgba(153,60,29,0.3)',
  };
}

const PROJECT_TYPE_COLOR: Record<string, string> = {
  metro: '#2563eb',
  hospital: '#ba1a1a',
  escola: '#15803d',
};

function NeighborhoodBubble({
  n,
  selected,
  onClick,
}: {
  n: NeighborhoodAppreciationDto;
  selected: boolean;
  onClick: () => void;
}) {
  const size = 26 + Math.round((n.score / 100) * 22);
  const style = heatStyle(n.score);
  return (
    <button onClick={onClick} className="relative group" aria-label={`${n.neighborhood}: score ${n.score}`}>
      <div
        style={{ width: size, height: size, ...style }}
        className={`rounded-full flex items-center justify-center text-label-sm font-semibold shadow-md transition-transform ${
          selected ? 'scale-110 ring-2 ring-coral-dark ring-offset-2' : 'group-hover:scale-105'
        }`}
      >
        {n.score}
      </div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap bg-white rounded-lg shadow-lg border border-neutral-fill px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
        <p className="text-label-sm text-on-surface">{n.neighborhood}</p>
        <p className="text-[10px] text-on-surface-variant">{n.projects.length} projeto(s) por perto</p>
      </div>
    </button>
  );
}

function ProjectPin({ project }: { project: NeighborhoodAppreciationDto['projects'][number] }) {
  const color = PROJECT_TYPE_COLOR[project.type] ?? '#6b6b6b';
  return (
    <div className="relative group">
      <div
        style={{ background: color }}
        className="w-6 h-6 rounded-full flex items-center justify-center text-white shadow border-2 border-white"
      >
        <span className="material-symbols-outlined text-[14px]">{URBAN_PROJECT_TYPE_ICONS[project.type]}</span>
      </div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-white rounded-xl shadow-lg border border-neutral-fill p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
        <p className="text-label-sm text-on-surface">{project.name}</p>
        <p className="text-[10px] text-on-surface-variant mt-0.5">
          {URBAN_PROJECT_TYPE_LABELS[project.type]} · {URBAN_PROJECT_STATUS_LABELS[project.status]} · {project.year}
        </p>
        <p className="text-[10px] text-on-surface-variant mt-1">{project.distanceKm}km do centro do bairro</p>
      </div>
    </div>
  );
}

export function AppreciationMap({
  neighborhoods,
  selected,
  onSelect,
}: {
  neighborhoods: NeighborhoodAppreciationDto[];
  selected: string | null;
  onSelect: (name: string) => void;
}) {
  const mapRef = useRef<MapRef | null>(null);

  const initialView = useMemo(() => ({ latitude: -23.56, longitude: -46.68, zoom: 12.2 }), []);

  // Marcadores de projeto deduplicados (um projeto pode aparecer "próximo" de vários bairros).
  const allProjects = useMemo(() => {
    const dedup = new globalThis.Map<string, NeighborhoodAppreciationDto['projects'][number]>();
    for (const n of neighborhoods) for (const p of n.projects) dedup.set(p.id, p);
    return Array.from(dedup.values());
  }, [neighborhoods]);

  const flyTo = (name: string) => {
    const n = neighborhoods.find((x) => x.neighborhood === name);
    if (n) mapRef.current?.flyTo({ center: [n.lng, n.lat], zoom: 13, duration: 800 });
  };

  const handleSelect = (name: string) => {
    onSelect(name);
    flyTo(name);
  };

  // Bairros selecionados renderizam por cima.
  const ordered = useMemo(
    () => [...neighborhoods].sort((a, b) => (a.neighborhood === selected ? 1 : b.neighborhood === selected ? -1 : 0)),
    [neighborhoods, selected],
  );

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
        {allProjects.map((p) => (
          <MapboxMarker key={p.id} latitude={p.lat} longitude={p.lng} anchor="center">
            <ProjectPin project={p} />
          </MapboxMarker>
        ))}
        {ordered.map((n) => (
          <MapboxMarker key={n.neighborhood} latitude={n.lat} longitude={n.lng} anchor="center">
            <NeighborhoodBubble n={n} selected={n.neighborhood === selected} onClick={() => handleSelect(n.neighborhood)} />
          </MapboxMarker>
        ))}
      </MapboxMap>
    );
  }

  return (
    <Map ref={mapRef as never} initialViewState={initialView} mapStyle={FREE_STYLE} style={{ width: '100%', height: '100%' }}>
      <NavigationControl position="top-right" />
      {allProjects.map((p) => (
        <Marker key={p.id} latitude={p.lat} longitude={p.lng} anchor="center">
          <ProjectPin project={p} />
        </Marker>
      ))}
      {ordered.map((n) => (
        <Marker key={n.neighborhood} latitude={n.lat} longitude={n.lng} anchor="center">
          <NeighborhoodBubble n={n} selected={n.neighborhood === selected} onClick={() => handleSelect(n.neighborhood)} />
        </Marker>
      ))}
    </Map>
  );
}
