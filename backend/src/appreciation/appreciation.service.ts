import { Injectable } from '@nestjs/common';
import { SP_NEIGHBORHOOD_NAMES, haversineKm, resolveNeighborhoodCentroid } from '../common/sp-locations';
import { URBAN_PROJECTS, UrbanProject, UrbanProjectStatus, UrbanProjectType } from '../common/urban-projects';
import { fetchKnownStationNames, isStationKnown } from './metro-stations';

/**
 * Peso de impacto na valorização por tipo de projeto — estação de
 * metrô/trem tende a mexer mais no preço de imóveis comerciais do que um
 * equipamento de saúde ou uma escola, mas os três importam. Pesos são uma
 * simplificação assumida (documentar no TCC), não um resultado empírico.
 */
const TYPE_WEIGHT: Record<UrbanProjectType, number> = {
  metro: 1.0,
  hospital: 0.7,
  escola: 0.55,
};

/**
 * Peso por estágio: uma obra recém-inaugurada já tem o impacto totalmente
 * visível; uma em obras já é precificada pelo mercado por antecipação
 * (um pouco menos); um projeto só planejado é mais especulativo.
 */
const STATUS_WEIGHT: Record<UrbanProjectStatus, number> = {
  recem_inaugurado: 1.0,
  em_obras: 0.85,
  planejado: 0.5,
};

/** Raio de influência (decaimento exponencial) — mesmo padrão usado no scoring de imóveis. */
const INFLUENCE_RADIUS_KM = 3;

/** Só lista o projeto como "relevante" pro bairro se ele ainda tiver alguma influência perceptível. */
const MIN_RELEVANT_FACTOR = 0.05;

export interface NearbyProject extends UrbanProject {
  distanceKm: number;
  /** true = nome bateu com a lista de estações buscada ao vivo no portal do Metrô SP. */
  apiVerified: boolean;
}

export interface NeighborhoodAppreciation {
  neighborhood: string;
  lat: number;
  lng: number;
  /** 0–100, normalizado pelo bairro com maior soma de contribuições entre os cobertos. */
  score: number;
  projects: NearbyProject[];
}

/**
 * Calcula o indicador de valorização por bairro: quanto mais perto e mais
 * recentes/relevantes os projetos urbanos ao redor, maior o score.
 *
 * A parte "metro" tenta confirmar cada estação contra o portal de dados
 * abertos real do Metrô SP (metro-stations.ts) — se a rede falhar, segue
 * sem o selo de confirmação, sem afetar o score (que já vem da base
 * curada com fonte citada).
 */
@Injectable()
export class AppreciationService {
  async getHeatmap(): Promise<{ neighborhoods: NeighborhoodAppreciation[]; metroApiOk: boolean }> {
    const knownStations = await fetchKnownStationNames();
    const metroApiOk = knownStations.size > 0;

    const raw = SP_NEIGHBORHOOD_NAMES.map((name) => {
      const centroid = resolveNeighborhoodCentroid(name);
      if (!centroid) return null;

      let rawScore = 0;
      const nearby: NearbyProject[] = [];

      for (const project of URBAN_PROJECTS) {
        const distanceKm = haversineKm(centroid, { lat: project.lat, lng: project.lng });
        const proximityFactor = Math.exp(-distanceKm / INFLUENCE_RADIUS_KM);
        rawScore += TYPE_WEIGHT[project.type] * STATUS_WEIGHT[project.status] * proximityFactor;

        if (proximityFactor >= MIN_RELEVANT_FACTOR) {
          nearby.push({
            ...project,
            distanceKm: Math.round(distanceKm * 10) / 10,
            apiVerified: project.type === 'metro' && isStationKnown(project.name, knownStations),
          });
        }
      }

      nearby.sort((a, b) => a.distanceKm - b.distanceKm);
      return { neighborhood: name, lat: centroid.lat, lng: centroid.lng, rawScore, projects: nearby };
    }).filter((r): r is NonNullable<typeof r> => r !== null);

    const maxRaw = Math.max(...raw.map((r) => r.rawScore), 0.0001);
    const neighborhoods: NeighborhoodAppreciation[] = raw
      .map((r) => ({
        neighborhood: r.neighborhood,
        lat: r.lat,
        lng: r.lng,
        score: Math.round((r.rawScore / maxRaw) * 100),
        projects: r.projects,
      }))
      .sort((a, b) => b.score - a.score);

    return { neighborhoods, metroApiOk };
  }
}
