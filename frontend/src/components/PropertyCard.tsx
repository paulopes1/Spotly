'use client';

import { useState } from 'react';
import { ScoreRing } from './ScoreRing';
import { PROPERTY_TYPE_LABELS, SearchResultDto, formatBRL } from '@/lib/types';

/**
 * Card de imóvel da tela de resultados — réplica do card do Stitch
 * (imagem, badge "Top Match", anel de score, chips) com a adição da seção
 * de prós/contras gerados pela IA (o conteúdo core do produto).
 */
export function PropertyCard({
  result,
  rank,
  selected,
  onSelect,
  saved,
  onToggleSave,
}: {
  result: SearchResultDto;
  rank: number;
  selected: boolean;
  onSelect: () => void;
  /** Omitir esconde o botão de salvar (usado em contextos sem essa ação). */
  saved?: boolean;
  onToggleSave?: () => void;
}) {
  const [expanded, setExpanded] = useState(rank === 0); // top match abre expandido
  const p = result.property;

  return (
    <div
      id={`card-${result.id}`}
      onClick={onSelect}
      className={
        selected
          ? 'bg-coral-tint rounded-card p-1 border border-coral/30 shadow-[0_8px_30px_rgba(216,90,48,0.12)] cursor-pointer transform transition-all duration-300 scale-[1.02]'
          : 'bg-white rounded-card p-1 border border-neutral-fill shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] cursor-pointer transition-all duration-300'
      }
    >
      {/* Imagem */}
      <div className="relative h-48 rounded-[24px] overflow-hidden group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          src={p.imageUrl}
          alt={p.title}
        />
        {rank === 0 && (
          <div className="absolute top-4 left-4 bg-coral text-white px-3 py-1 rounded-full text-label-sm shadow-md flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">verified</span> Top Match
          </div>
        )}
        {onToggleSave && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave();
            }}
            aria-label={saved ? 'Remover dos salvos' : 'Salvar imóvel'}
            aria-pressed={saved}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
          >
            <span
              className={`material-symbols-outlined text-[20px] ${saved ? 'text-coral icon-fill' : 'text-on-surface-variant'}`}
            >
              favorite
            </span>
          </button>
        )}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-label-sm text-on-surface-variant shadow-sm">
          {PROPERTY_TYPE_LABELS[p.propertyType] ?? p.propertyType} • {p.areaM2}m²
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-sm">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className={`text-headline-md ${selected ? 'text-coral' : 'text-on-surface'}`}>{p.title}</h3>
            <p className="text-body-md text-on-surface-variant">{p.address}</p>
          </div>
          <div className="text-right shrink-0 ml-3">
            <p className={`text-headline-md ${selected ? 'text-coral' : 'text-on-surface'}`}>
              {formatBRL(p.rentPrice)}
            </p>
            <p className="text-label-sm text-on-surface-variant">/mês • {p.neighborhood}</p>
          </div>
        </div>

        {/* Score + toggle de análise */}
        <div className={`flex items-center gap-4 mt-4 pt-4 border-t ${selected ? 'border-coral/20' : 'border-neutral-fill'}`}>
          <ScoreRing score={result.score} selected={selected} />
          <div className="flex-1">
            <p className="text-label-md text-on-surface">{result.score}% compatível</p>
            <p className="text-label-sm text-on-surface-variant">com o seu negócio</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className={`flex items-center gap-1 px-3 py-2 rounded-full text-label-sm transition-colors ${
              selected ? 'bg-white/60 text-coral hover:bg-white' : 'bg-neutral-fill text-on-surface-variant hover:text-coral'
            }`}
          >
            Análise da IA
            <span className="material-symbols-outlined text-[16px]">
              {expanded ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>

        {/* Prós e contras gerados pela IA */}
        {expanded && (
          <div className="mt-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div>
              <p className="text-label-sm text-coral uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">thumb_up</span> Pontos positivos
              </p>
              <ul className="space-y-1.5">
                {result.pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2 text-label-md font-normal text-on-surface">
                    <span className="material-symbols-outlined text-[16px] text-coral mt-0.5">add_circle</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">thumb_down</span> Pontos de atenção
              </p>
              <ul className="space-y-1.5">
                {result.cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-2 text-label-md font-normal text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px] mt-0.5">do_not_disturb_on</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Breakdown do score (transparência do algoritmo) */}
            <div className="grid grid-cols-6 gap-1 pt-2">
              {(
                [
                  ['footTraffic', 'Fluxo'],
                  ['competition', 'Concorr.'],
                  ['income', 'Renda'],
                  ['anchors', 'Âncoras'],
                  ['budget', 'Orçam.'],
                  ['proximity', 'Distância'],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="text-center">
                  <div className="h-1.5 rounded-full bg-neutral-fill overflow-hidden mb-1">
                    <div
                      className="h-full bg-coral rounded-full"
                      style={{ width: `${result.scoreBreakdown[key] ?? 0}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-on-surface-variant">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
