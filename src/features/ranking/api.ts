import { z } from 'zod';
import { supabase, type AppSupabaseClient } from '../../lib/supabase';
import type { Difficulty, GameId } from '../../games/ids';
import type { SubtopicSelection, TopicId } from '../../content';
import { CloudError, toCloudError } from '../records/cloudApi';
import { effectiveDifficulty } from '../records/localRecords';

export type LeaderboardTarget = {
  topic: TopicId;
  subtopic: SubtopicSelection;
  game: GameId;
  difficulty: Difficulty;
};

export type LeaderboardRow = {
  rank: number;
  username: string;
  bestScore: number;
  isMe: boolean;
};

const rowsSchema = z.array(
  z.object({
    rank: z.number(),
    username: z.string(),
    best_score: z.number(),
    is_me: z.boolean(),
  })
);

export function createRankingApi(client: AppSupabaseClient) {
  return {
    /** Los mejores de una combinación. Solo con sesión; solo apodos elegidos, sin datos personales. */
    async fetchLeaderboard(
      target: LeaderboardTarget,
      limit = 10
    ): Promise<LeaderboardRow[]> {
      const { data, error, status } = await client.rpc('get_leaderboard', {
        p_topic: target.topic,
        p_subtopic: target.subtopic,
        p_game: target.game,
        p_difficulty: effectiveDifficulty(target.game, target.difficulty),
        p_limit: limit,
      });
      if (error) throw toCloudError(error, status);
      const parsed = rowsSchema.safeParse(data);
      if (!parsed.success)
        throw new CloudError('rejected', 'Respuesta inesperada del servidor');
      return parsed.data.map((r) => ({
        rank: r.rank,
        username: r.username,
        bestScore: r.best_score,
        isMe: r.is_me,
      }));
    },
  };
}

export type RankingApi = ReturnType<typeof createRankingApi>;

export const rankingApi: RankingApi | null = supabase
  ? createRankingApi(supabase)
  : null;
