import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CONFIG } from './config.js';
import { Player, RoundResult, FinalGameResult } from '@guess-the-11/shared';

let supabase: SupabaseClient | null = null;

if (CONFIG.SUPABASE_URL && CONFIG.SUPABASE_SERVICE_ROLE_KEY && !CONFIG.SUPABASE_URL.includes('mock-supabase')) {
  try {
    supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    console.log('[Database] Supabase client initialized with production credentials');
  } catch (err) {
    console.warn('[Database] Failed to initialize Supabase client:', err);
  }
} else {
  console.log('[Database] Running with in-memory persistence fallback (no Supabase secret provided)');
}

export class DatabaseService {
  // Record game start
  static async recordGameStart(gameId: string, roomCode: string, totalRounds: number): Promise<void> {
    if (!supabase) return;
    try {
      // Find room id
      const { data: room } = await supabase
        .from('rooms')
        .select('id')
        .eq('code', roomCode)
        .single();

      if (room) {
        await supabase.from('games').insert({
          id: gameId,
          room_id: room.id,
          total_rounds: totalRounds,
          started_at: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error('[Database] recordGameStart error:', e);
    }
  }

  // Record round result & scores
  static async recordRound(gameId: string, result: RoundResult): Promise<void> {
    if (!supabase) return;
    try {
      const { data: roundData } = await supabase
        .from('game_rounds')
        .insert({
          game_id: gameId,
          round_number: result.round,
          drawer_id: result.drawerId,
          secret_word: result.word,
          category: 'General',
          drawer_points: result.drawerPointsAwarded,
          started_at: new Date(Date.now() - 60000).toISOString(),
          ended_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (roundData) {
        const roundId = roundData.id;
        const scoreRecords = [];

        // Correct guessers
        for (const guesser of result.correctGuessers) {
          scoreRecords.push({
            game_id: gameId,
            round_id: roundId,
            player_id: guesser.playerId,
            points_awarded: guesser.pointsAwarded,
            reason: 'correct_guess'
          });
        }

        // Drawer
        if (result.drawerPointsAwarded > 0) {
          scoreRecords.push({
            game_id: gameId,
            round_id: roundId,
            player_id: result.drawerId,
            points_awarded: result.drawerPointsAwarded,
            reason: 'drawer_bonus'
          });
        } else if (result.nobodyGuessed) {
          scoreRecords.push({
            game_id: gameId,
            round_id: roundId,
            player_id: result.drawerId,
            points_awarded: result.drawerPointsAwarded,
            reason: 'no_guess_penalty'
          });
        }

        if (scoreRecords.length > 0) {
          await supabase.from('game_scores').insert(scoreRecords);
        }
      }
    } catch (e) {
      console.error('[Database] recordRound error:', e);
    }
  }

  // Record final game completion & update profile stats
  static async recordGameEnd(result: FinalGameResult): Promise<void> {
    if (!supabase) return;
    try {
      await supabase
        .from('games')
        .update({
          winner_id: result.winner.id,
          ended_at: new Date().toISOString()
        })
        .eq('id', result.gameId);

      // Update leaderboard stats in profiles
      for (const player of result.leaderboard) {
        const isWinner = player.id === result.winner.id;
        try {
          await supabase.rpc('increment_profile_stats', {
            p_id: player.id,
            p_score: player.score,
            p_is_winner: isWinner
          });
        } catch {
          // Fallback update
          const { data: prof } = await supabase.from('profiles').select('*').eq('id', player.id).single();
          if (prof) {
            await supabase.from('profiles').update({
              total_score: (prof.total_score || 0) + player.score,
              games_played: (prof.games_played || 0) + 1,
              games_won: (prof.games_won || 0) + (isWinner ? 1 : 0)
            }).eq('id', player.id);
          }
        }
      }
    } catch (e) {
      console.error('[Database] recordGameEnd error:', e);
    }
  }

  // Get global leaderboard
  static async getLeaderboard(limit = 50): Promise<any[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar, total_score, games_won, games_played, correct_guesses')
        .order('total_score', { ascending: false })
        .order('games_won', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('[Database] getLeaderboard error:', e);
      return [];
    }
  }
}
