import { ItemType } from "../../../shared/types";
import { ItemSchema, PlayerSchema } from "../schema/MatchState";
import { Deck } from "./deck";

export const ITEM_TYPES: ItemType[] = ["peek", "forceHit", "cardSwap", "shield", "redraw"];

export function getRandomItemType(): ItemType {
  const randomIndex = Math.floor(Math.random() * ITEM_TYPES.length);
  return ITEM_TYPES[randomIndex];
}

export function createItem(type: ItemType): ItemSchema {
  const item = new ItemSchema();
  item.id = `item-${type}-${Math.random().toString(36).substring(2, 8)}`;
  item.type = type;
  return item;
}

export interface ItemActionResult {
  success: boolean;
  message: string;
  consumed: boolean;
  extraData?: any;
}

export class ItemManager {
  public static awardRandomItem(player: PlayerSchema): ItemSchema | null {
    if (player.inventory.length >= 3) {
      // Inventory full: forfeit item
      return null;
    }
    const itemType = getRandomItemType();
    const item = createItem(itemType);
    player.inventory.push(item);
    if (itemType === "shield") {
      player.shieldPending = true;
    }
    return item;
  }

  public static handleRedraw(player: PlayerSchema, cardId: string | undefined, deck: Deck): ItemActionResult {
    if (player.hand.length === 0) {
      return { success: false, message: "No cards to redraw", consumed: false };
    }

    let targetCardIndex = 0;
    if (cardId) {
      const idx = player.hand.findIndex(c => c.id === cardId);
      if (idx !== -1) targetCardIndex = idx;
    } else {
      // Default to last drawn card
      targetCardIndex = player.hand.length - 1;
    }

    const removedCard = player.hand[targetCardIndex];
    const newCard = deck.drawCard(true);
    player.hand[targetCardIndex] = newCard;

    const removedRank = removedCard ? removedCard.rank : 'card';
    return {
      success: true,
      message: `${player.name} redrew a card (${removedRank} -> ${newCard.rank})`,
      consumed: true
    };
  }

  public static handleCardSwap(
    player: PlayerSchema,
    targetPlayer: PlayerSchema,
    sourceCardId?: string,
    targetCardId?: string
  ): ItemActionResult {
    if (player.hand.length === 0 || targetPlayer.hand.length === 0) {
      return { success: false, message: "Cannot swap with empty hand", consumed: false };
    }

    let myIdx = 0;
    if (sourceCardId) {
      const idx = player.hand.findIndex(c => c.id === sourceCardId);
      if (idx !== -1) myIdx = idx;
    }

    let targetIdx = 0;
    if (targetCardId) {
      const idx = targetPlayer.hand.findIndex(c => c.id === targetCardId);
      if (idx !== -1) targetIdx = idx;
    }

    const myCard = player.hand[myIdx];
    const targetCard = targetPlayer.hand[targetIdx];

    // Swap cards
    player.hand[myIdx] = targetCard;
    targetPlayer.hand[targetIdx] = myCard;

    return {
      success: true,
      message: `${player.name} swapped cards with ${targetPlayer.name}`,
      consumed: true
    };
  }

  public static handleForceHit(targetPlayer: PlayerSchema): ItemActionResult {
    targetPlayer.forcedHit = true;
    return {
      success: true,
      message: `${targetPlayer.name} is forced to hit on their next turn!`,
      consumed: true
    };
  }
}
