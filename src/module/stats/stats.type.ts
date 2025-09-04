export interface OverallStats {
  summary: {
    totalGames: number;
    totalDesigners: number;
    totalPublishers: number;
    totalCategories: number;
    totalMechanics: number;
    averageRating: number;
    averageComplexity: number;
    yearRange: { min: number; max: number };
  };
  players: Array<{
    playerCount: number;
    gameCount: number;
  }>;
  playtime: Array<{
    range: string;
    gameCount: number;
  }>;
  byYear: Array<{
    year: number;
    gameCount: number;
  }>;
}
