import { AxiosStatic } from 'axios';

export interface StormGlassPointSource {
  [key: string]: number;
}

export interface StormGlassPoint {
  time: string;
  readonly waveHeight: StormGlassPointSource;
  readonly waveDirection: StormGlassPointSource;
  readonly swellDirection: StormGlassPointSource;
  readonly swellHeight: StormGlassPointSource;
  readonly swellPeriod: StormGlassPointSource;
  readonly windDirection: StormGlassPointSource;
  readonly windSpeed: StormGlassPointSource;
}

export interface StormGlassForecastResponse {
  hours: StormGlassPoint[];
}

export interface ForecastPoint {
  time: string;
  waveHeight: number;
  waveDirection: number;
  swellDirection: number;
  swellHeight: number;
  swellPeriod: number;
  windDirection: number;
  windSpeed: number;
}

export class StormGlass {
  constructor(protected request: AxiosStatic) {}

  readonly stormGlassApiParams =
    'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';
  readonly stormGlassAPISource = 'noaa';

  public async fetchPoints(lat: number, lng: number): Promise<ForecastPoint[]> {
    const response = await this.request.get<StormGlassForecastResponse>(
      `https://api.stormglass.io/v2/weather/point?params=${this.stormGlassApiParams}&source${this.stormGlassAPISource}&lat=${lat}&lgn=${lng}`
    );

    return this.normalizeForecasetResponse(response.data);
  }

  private normalizeForecasetResponse(
    points: StormGlassForecastResponse
  ): ForecastPoint[] {
    return points.hours.filter(this.isValidPoint.bind(this)).map((point) => ({
      time: point.time,
      waveHeight: point.waveHeight[this.stormGlassAPISource],
      waveDirection: point.waveDirection[this.stormGlassAPISource],
      swellDirection: point.swellDirection[this.stormGlassAPISource],
      swellHeight: point.swellHeight[this.stormGlassAPISource],
      swellPeriod: point.swellPeriod[this.stormGlassAPISource],
      windDirection: point.windDirection[this.stormGlassAPISource],
      windSpeed: point.windSpeed[this.stormGlassAPISource],
    }));
  }

  private isValidPoint(point: Partial<StormGlassPoint>): boolean {
    return !!(
      point.time &&
      point.swellDirection?.[this.stormGlassAPISource] &&
      point.swellHeight?.[this.stormGlassAPISource] &&
      point.swellPeriod?.[this.stormGlassAPISource] &&
      point.waveDirection?.[this.stormGlassAPISource] &&
      point.waveHeight?.[this.stormGlassAPISource] &&
      point.windDirection?.[this.stormGlassAPISource] &&
      point.windSpeed?.[this.stormGlassAPISource]
    );
  }
}