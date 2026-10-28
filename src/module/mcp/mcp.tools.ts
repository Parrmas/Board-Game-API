import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v3";
import { AppError } from "../../utils/appError.util";
import * as FilterUtil from "../../utils/filter.util";
import * as GameService from "../game/game.service";
import * as StatsService from "../stats/stats.service";
import {
  FETCH_MAX_LIMIT,
  FETCH_MIN_LIMIT,
  GameFilters,
} from "../game/game.type";
import { toolError, toolResult, trimGames } from "./mcp.util";

export const registerTools = (server: McpServer): void => {
  server.registerTool(
    "get_filter_options",
    {
      description:
        "Min/max ranges for players, playtime, rating and complexity across the game collection",
    },
    async () => {
      try {
        return toolResult(await FilterUtil.getFilterOptions());
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "search_games",
    {
      description:
        "Search games using optional filters. Results omit description. " +
        "The maximum limit is 50. categories, mechanics, designers, and " +
        "publishers accept BGG ids; use list_reference_data to find those " +
        "ids once that tool is available.",
      inputSchema: {
        limit: z
          .number()
          .int()
          .min(FETCH_MIN_LIMIT)
          .max(FETCH_MAX_LIMIT)
          .default(10),
        page: z.number().int().min(1).default(1),
        name: z.string().trim().min(1).max(100).optional(),
        min_players: z.number().int().positive().optional(),
        max_players: z.number().int().positive().optional(),
        min_playtime: z.number().int().nonnegative().optional(),
        max_playtime: z.number().int().nonnegative().optional(),
        min_rating: z.number().min(0).max(10).optional(),
        max_rating: z.number().min(0).max(10).optional(),
        min_complexity: z.number().min(0).max(5).optional(),
        max_complexity: z.number().min(0).max(5).optional(),
        categories: z.array(z.number().int()).max(50).optional(),
        mechanics: z.array(z.number().int()).max(50).optional(),
        designers: z.array(z.number().int()).max(50).optional(),
        publishers: z.array(z.number().int()).max(50).optional(),
      },
    },
    async ({ limit, page, ...filters }) => {
      if (
        filters.min_players !== undefined &&
        filters.max_players !== undefined &&
        filters.min_players > filters.max_players
      ) {
        return toolError(
          new AppError("min_players must be <= max_players", 400),
        );
      }

      if (
        filters.min_rating !== undefined &&
        filters.max_rating !== undefined &&
        filters.min_rating > filters.max_rating
      ) {
        return toolError(new AppError("min_rating must be <= max_rating", 400));
      }

      try {
        const games = await GameService.list(
          limit,
          page,
          filters as GameFilters,
        );
        return toolResult(
          trimGames(games as unknown as { data: Record<string, unknown>[] }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "get_games",
    {
      description:
        "Get games by their BGG ids. Provide 1 to 50 ids. Results omit " +
        "description and include populated categories, mechanics, designers, " +
        "and publishers. Use list_reference_data to find reference BGG ids " +
        "once that tool is available.",
      inputSchema: {
        bgg_ids: z.array(z.number().int()).min(1).max(50),
      },
    },
    async ({ bgg_ids }) => {
      try {
        const games = await GameService.get(bgg_ids);
        return toolResult(
          trimGames(games as unknown as { data: Record<string, unknown>[] }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "get_top_rated_games",
    {
      description:
        "Get games ranked by average rating, highest first. Results omit " +
        "description. The maximum limit is 50.",
      inputSchema: {
        limit: z
          .number()
          .int()
          .min(FETCH_MIN_LIMIT)
          .max(FETCH_MAX_LIMIT)
          .default(10),
      },
    },
    async ({ limit }) => {
      try {
        const result = await StatsService.getTopRatedGames(limit);
        return toolResult(
          trimGames(result as unknown as { data: Record<string, unknown>[] }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "get_most_complex_games",
    {
      description:
        "Get games ranked by complexity weight, highest first. Results " +
        "omit description. The maximum limit is 50.",
      inputSchema: {
        limit: z
          .number()
          .int()
          .min(FETCH_MIN_LIMIT)
          .max(FETCH_MAX_LIMIT)
          .default(10),
      },
    },
    async ({ limit }) => {
      try {
        const result = await StatsService.getMostComplexGames(limit);
        return toolResult(
          trimGames(result as unknown as { data: Record<string, unknown>[] }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "get_best_games_for_players",
    {
      description:
        "Get games ranked by average rating for the requested player count. " +
        "Results omit description. The maximum limit is 50.",
      inputSchema: {
        player_count: z.number().int().positive(),
        limit: z
          .number()
          .int()
          .min(FETCH_MIN_LIMIT)
          .max(FETCH_MAX_LIMIT)
          .default(10),
      },
    },
    async ({ player_count, limit }) => {
      try {
        const result = await StatsService.getBestGamesForPlayers(
          limit,
          player_count,
        );
        return toolResult(
          trimGames(result as unknown as { data: Record<string, unknown>[] }),
        );
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.registerTool(
    "get_overall_stats",
    {
      description:
        "Return collection-wide totals, player-count and playtime " +
        "distributions, and games per year.",
      inputSchema: {},
    },
    async () => {
      try {
        return toolResult(await StatsService.getOverallStats());
      } catch (e) {
        return toolError(e);
      }
    },
  );
};
