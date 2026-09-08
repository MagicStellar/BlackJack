import { CardSchema, PlayerSchema } from "../schema/MatchState";

export interface HandScore {
  total: number;
  isBusted: boolean;
  isBlackjack: boolean;
  isSoft: boolean;
}

export function calculateHandScore(hand: CardSchema[], onlyFaceUp: boolean = false): HandScore {
  let total = 0;
  let aces = 0;

  for (const card of hand) {
    if (onlyFaceUp && !card.faceUp) continue;

    const rank = card.rank;
    if (rank === "A") {
      aces++;
      total += 11;
    } else if (["K", "Q", "J", "10"].includes(rank)) {
      total += 10;
    } else {
      total += parseInt(rank, 10);
    }
  }

  // Adjust Aces from 11 to 1 if busting
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  const isBusted = total > 21;
  const isBlackjack = hand.length === 2 && total === 21 && !onlyFaceUp;
  const isSoft = aces > 0 && !isBusted;

  return {
    total,
    isBusted,
    isBlackjack,
    isSoft
  };
}

export interface PlayerRankResult {
  player: PlayerSchema;
  score: number;
  cardCount: number;
  isBusted: boolean;
  isBlackjack: boolean;
}

export function rankActivePlayers(players: PlayerSchema[]): PlayerRankResult[] {
  const results: PlayerRankResult[] = players.map(player => {
    const scoreObj = calculateHandScore(player.hand.toArray());
    return {
      player,
      score: scoreObj.total,
      cardCount: player.hand.length,
      isBusted: scoreObj.isBusted,
      isBlackjack: scoreObj.isBlackjack
    };
  });

  // Ranking Comparator:
  // 1. Non-busted beats Busted
  // 2. Higher score beats lower score
  // 3. Tie-breaker: FEWER cards in hand wins
  results.sort((a, b) => {
    if (a.isBusted && !b.isBusted) return 1;
    if (!a.isBusted && b.isBusted) return -1;

    if (a.isBusted && b.isBusted) {
      // Both busted: tie-breaker is fewer cards
      return a.cardCount - b.cardCount;
    }

    if (b.score !== a.score) {
      return b.score - a.score; // higher score first
    }

    // Tie-breaker: fewer cards in hand wins
    return a.cardCount - b.cardCount;
  });

  return results;
}
