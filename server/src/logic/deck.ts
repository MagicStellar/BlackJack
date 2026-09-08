import { Suit, Rank, Card } from "../../../shared/types";
import { CardSchema } from "../schema/MatchState";

const SUITS: Suit[] = ["clubs", "diamonds", "hearts", "spades"];
const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export class Deck {
  private cards: Card[] = [];
  private cardIndex = 0;

  constructor() {
    this.resetAndShuffle();
  }

  public resetAndShuffle(): void {
    this.cards = [];
    this.cardIndex = 0;
    let counter = 1;

    for (const suit of SUITS) {
      for (const rank of RANKS) {
        this.cards.push({
          id: `${rank}${suit[0].toUpperCase()}-${counter++}-${Date.now().toString(36)}`,
          suit,
          rank,
          faceUp: true
        });
      }
    }

    // Fisher-Yates shuffle
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  public drawCard(faceUp: boolean = true): CardSchema {
    if (this.cardIndex >= this.cards.length) {
      // Re-shuffle if deck runs out
      this.resetAndShuffle();
    }
    const card = this.cards[this.cardIndex++];
    const schema = new CardSchema();
    schema.id = card.id;
    schema.suit = card.suit;
    schema.rank = card.rank;
    schema.faceUp = faceUp;
    return schema;
  }
}
