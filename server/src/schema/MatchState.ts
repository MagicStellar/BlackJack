import { Schema, type, ArraySchema, MapSchema } from "@colyseus/schema";

export class CardSchema extends Schema {
  @type("string") id: string = "";
  @type("string") suit: string = "";
  @type("string") rank: string = "";
  @type("boolean") faceUp: boolean = true;
}

export class ItemSchema extends Schema {
  @type("string") id: string = "";
  @type("string") type: string = "";
}

export class PlayerSchema extends Schema {
  @type("string") id: string = "";
  @type("string") sessionId: string = "";
  @type("string") name: string = "";
  @type([CardSchema]) hand = new ArraySchema<CardSchema>();
  @type([ItemSchema]) inventory = new ArraySchema<ItemSchema>();
  @type("string") status: string = "active"; // "active" | "eliminated"
  @type("boolean") standing: boolean = false;
  @type("boolean") shieldPending: boolean = false;
  @type("boolean") forcedHit: boolean = false;
  @type("boolean") isBot: boolean = false;
  @type("number") score: number = 0;
  @type("boolean") isBusted: boolean = false;
}

export class DealerSchema extends Schema {
  @type([CardSchema]) hand = new ArraySchema<CardSchema>();
  @type("number") score: number = 0;
  @type("boolean") isBusted: boolean = false;
}

export class RoundSchema extends Schema {
  @type("number") roundNumber: number = 1;
  @type("string") phase: string = "lobby"; // "lobby" | "dealing" | "playerTurns" | "dealerResolve" | "scoring" | "rouletteCheck" | "roundEnd" | "matchEnd"
  @type("string") activePlayerId: string = "";
  @type(["string"]) turnOrder = new ArraySchema<string>();
  @type(DealerSchema) dealer = new DealerSchema();
  @type("string") lowestFinisherId: string = "";
  @type("string") topFinisherId: string = "";
  @type("string") awardedItemType: string = "";
  @type("string") awardedPlayerId: string = "";
  @type("number") turnExpiresAt: number = 0;
  @type("number") turnDuration: number = 30;
}

export class MatchStateSchema extends Schema {
  @type("string") matchId: string = "";
  @type({ map: PlayerSchema }) players = new MapSchema<PlayerSchema>();
  @type(RoundSchema) round = new RoundSchema();
  @type("string") winnerId: string = "";
  @type("number") createdAt: number = Date.now();
  @type("boolean") isStarted: boolean = false;
}
