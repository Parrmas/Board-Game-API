import { PopulateConfig } from "../utils/populate.util";
import * as CategoryService from "../services/category.service";
import * as DesignerService from "../services/designer.service";
import * as MechanicService from "../services/mechanic.service";
import * as PublisherService from "../services/publisher.service";
import { IGame } from "../models/game.model";

export const FETCH_MIN_LIMIT = 1;
export const FETCH_MAX_LIMIT = 50;

export interface GameFilters {
  name?: string;
  min_players?: number;
  max_players?: number;
  min_playtime?: number;
  max_playtime?: number;
  min_rating?: number;
  max_rating?: number;
  min_complexity?: number;
  max_complexity?: number;
  categories?: number[];
  mechanics?: number[];
  designers?: number[];
  publishers?: number[];
}

export interface GamesResult {
  data: IGame[];
}

export interface FilterOptions {
  players: { min: number; max: number };
  playtime: { min: number; max: number };
  rating: { min: number; max: number };
  complexity: { min: number; max: number };
}

export const POPULATE_CONFIG: PopulateConfig[] = [
  {
    field: "categories",
    localIdsField: "category_ids",
    service: CategoryService,
    mapKey: "bgg_id",
  },
  {
    field: "designers",
    localIdsField: "designer_ids",
    service: DesignerService,
    mapKey: "bgg_id",
  },
  {
    field: "mechanics",
    localIdsField: "mechanic_ids",
    service: MechanicService,
    mapKey: "bgg_id",
  },
  {
    field: "publishers",
    localIdsField: "publisher_ids",
    service: PublisherService,
    mapKey: "bgg_id",
  },
];
