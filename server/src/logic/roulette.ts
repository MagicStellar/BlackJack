import { PlayerSchema } from "../schema/MatchState";

export interface RouletteResult {
  playerId: string;
  isEliminated: boolean;
  isShieldUsed: boolean;
  chamberNumber: number;
  bulletChamber: number;
  isBulletHit: boolean;
}

export class RouletteEngine {
  /**
   * Performs an independent 6-chamber Russian Roulette check.
   * 1 chamber is loaded out of 6.
   */
  public static executeCheck(player: PlayerSchema): RouletteResult {
    const bulletChamber = Math.floor(Math.random() * 6) + 1; // 1 to 6
    const chamberNumber = Math.floor(Math.random() * 6) + 1; // 1 to 6 (the chamber pulled)

    const isBulletHit = chamberNumber === bulletChamber;
    let isShieldUsed = false;
    let isEliminated = false;

    if (isBulletHit) {
      if (player.shieldPending) {
        isShieldUsed = true;
        player.shieldPending = false;
        isEliminated = false;
      } else {
        isEliminated = true;
      }
    }

    return {
      playerId: player.id,
      isEliminated,
      isShieldUsed,
      chamberNumber,
      bulletChamber,
      isBulletHit
    };
  }

  public static previewCheck(): { bulletInChamber: boolean } {
    const bulletChamber = Math.floor(Math.random() * 6) + 1;
    const chamberNumber = Math.floor(Math.random() * 6) + 1;
    return {
      bulletInChamber: bulletChamber === chamberNumber
    };
  }
}
