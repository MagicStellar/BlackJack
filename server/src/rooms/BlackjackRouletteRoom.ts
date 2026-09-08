import { Room, Client } from "colyseus";
import { MatchStateSchema, PlayerSchema, CardSchema } from "../schema/MatchState";
import { Deck } from "../logic/deck";
import { calculateHandScore, rankActivePlayers } from "../logic/scoring";
import { RouletteEngine } from "../logic/roulette";
import { ItemManager, createItem, ItemActionResult } from "../logic/items";
import {
  JoinPayload,
  UseItemPayload,
  RouletteCheckStartedEvent,
  RouletteCheckResolvedEvent,
  NotificationEvent
} from "../../../shared/types";

const BOT_NAMES = ["Victor 'Viper'", "Elena Frost", "The Gambler", "Baron Kane"];

export class BlackjackRouletteRoom extends Room<MatchStateSchema> {
  maxClients = 4;
  private deck: Deck = new Deck();
  private turnTimeout?: any;
  private botTimer?: any;

  onCreate(options: any) {
    this.setState(new MatchStateSchema());
    this.state.matchId = this.roomId;
    this.state.round.phase = "lobby";

    // Register message handlers
    this.onMessage("join", (client, message: JoinPayload) => {
      this.handlePlayerJoin(client, message.name);
    });

    this.onMessage("addBots", (client) => {
      this.handleAddBots();
    });

    this.onMessage("startMatch", (client) => {
      this.startMatch();
    });

    this.onMessage("hit", (client) => {
      this.handlePlayerHit(client.sessionId);
    });

    this.onMessage("stand", (client) => {
      this.handlePlayerStand(client.sessionId);
    });

    this.onMessage("useItem", (client, payload: UseItemPayload) => {
      this.handleUseItem(client.sessionId, payload);
    });

    this.onMessage("restartMatch", (client) => {
      this.restartMatch();
    });
  }

  onJoin(client: Client, options: any) {
    const name = options.name || `Player ${this.state.players.size + 1}`;
    this.handlePlayerJoin(client, name);
  }

  onLeave(client: Client, consented?: boolean) {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    this.sendNotification("warning", "Player Left", `${player.name} left the table.`);

    // If in lobby, delete player
    if (this.state.round.phase === "lobby") {
      this.state.players.delete(client.sessionId);
    } else {
      // Mark as eliminated if game in progress
      player.status = "eliminated";
      this.checkVictoryCondition();
      if (this.state.round.activePlayerId === player.id) {
        this.advanceToNextPlayer();
      }
    }
  }

  private handlePlayerJoin(client: Client, name: string) {
    if (this.state.players.has(client.sessionId)) {
      const p = this.state.players.get(client.sessionId)!;
      p.name = name;
      return;
    }

    if (this.state.players.size >= 4) {
      client.send("error", "Table is full");
      return;
    }

    const player = new PlayerSchema();
    player.id = `player-${client.sessionId}`;
    player.sessionId = client.sessionId;
    player.name = name.trim() || `Player ${this.state.players.size + 1}`;
    player.status = "active";
    player.standing = false;
    player.isBot = false;

    this.state.players.set(client.sessionId, player);

    this.sendNotification("info", "Player Joined", `${player.name} joined the table.`);

    // Auto start when 4 players join
    if (this.state.players.size === 4 && this.state.round.phase === "lobby") {
      this.clock.setTimeout(() => this.startMatch(), 1000);
    }
  }

  private handleAddBots() {
    if (this.state.round.phase !== "lobby") return;

    let botIndex = 0;
    while (this.state.players.size < 4) {
      const botId = `bot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const bot = new PlayerSchema();
      bot.id = botId;
      bot.sessionId = botId;
      bot.name = BOT_NAMES[botIndex % BOT_NAMES.length] || `Bot ${botIndex + 1}`;
      bot.status = "active";
      bot.standing = false;
      bot.isBot = true;

      this.state.players.set(botId, bot);
      botIndex++;
    }

    this.sendNotification("info", "Bots Added", "AI Opponents took open seats. Starting match!");
    this.clock.setTimeout(() => this.startMatch(), 800);
  }

  private startMatch() {
    if (this.state.players.size < 2) {
      this.sendNotification("warning", "Cannot Start", "Need at least 2 players to begin match.");
      return;
    }

    this.state.isStarted = true;
    this.state.round.roundNumber = 1;
    this.state.winnerId = "";
    this.startRound();
  }

  private restartMatch() {
    // Reset players for new match
    this.state.players.forEach(p => {
      p.status = "active";
      p.standing = false;
      p.shieldPending = false;
      p.forcedHit = false;
      p.hand.clear();
      p.inventory.clear();
      p.score = 0;
      p.isBusted = false;
    });

    this.state.round.roundNumber = 1;
    this.state.winnerId = "";
    this.state.round.phase = "lobby";
    this.state.isStarted = false;

    this.sendNotification("info", "Match Reset", "A new match is ready to start.");
  }

  private startRound() {
    this.deck.resetAndShuffle();

    this.state.round.phase = "dealing";
    this.state.round.lowestFinisherId = "";
    this.state.round.topFinisherId = "";
    this.state.round.awardedItemType = "";
    this.state.round.awardedPlayerId = "";
    this.state.round.dealer.hand.clear();
    this.state.round.dealer.score = 0;
    this.state.round.dealer.isBusted = false;

    // Reset active players hand states
    const activePlayerIds: string[] = [];
    this.state.players.forEach(player => {
      if (player.status === "active") {
        player.hand.clear();
        player.standing = false;
        player.forcedHit = false;
        player.score = 0;
        player.isBusted = false;
        activePlayerIds.push(player.id);
      }
    });

    this.state.round.turnOrder.clear();
    activePlayerIds.forEach(id => this.state.round.turnOrder.push(id));

    // Deal 2 cards to each active player
    for (let round = 0; round < 2; round++) {
      this.state.players.forEach(player => {
        if (player.status === "active") {
          const card = this.deck.drawCard(true);
          player.hand.push(card);
        }
      });
    }

    // Deal 2 cards to Dealer: 1 Face Up, 1 Face Down (hole card)
    this.state.round.dealer.hand.push(this.deck.drawCard(true));
    this.state.round.dealer.hand.push(this.deck.drawCard(false)); // Hole card

    // Update player scores
    this.updateScores();

    // Transition to player turns after dealing animation
    this.clock.setTimeout(() => {
      this.state.round.phase = "playerTurns";
      this.state.round.activePlayerId = this.state.round.turnOrder[0] || "";
      this.checkActivePlayerTurn();
    }, 1500);
  }

  private updateScores() {
    this.state.players.forEach(p => {
      if (p.status === "active") {
        const score = calculateHandScore(p.hand.toArray());
        p.score = score.total;
        p.isBusted = score.isBusted;
      }
    });

    const dealerScore = calculateHandScore(this.state.round.dealer.hand.toArray(), true);
    this.state.round.dealer.score = dealerScore.total;
    this.state.round.dealer.isBusted = dealerScore.isBusted;
  }

  private checkActivePlayerTurn() {
    const activePlayer = this.getActivePlayer();
    if (!activePlayer) {
      this.startDealerResolve();
      return;
    }

    // Check if player has forced hit from an item
    if (activePlayer.forcedHit) {
      this.sendNotification("warning", "Forced Hit", `${activePlayer.name} is forced to hit!`);
      activePlayer.forcedHit = false;
      this.clock.setTimeout(() => {
        this.handlePlayerHit(activePlayer.sessionId);
      }, 1000);
      return;
    }

    // Bot AI turn logic
    if (activePlayer.isBot) {
      this.botTimer = this.clock.setTimeout(() => {
        this.executeBotTurn(activePlayer);
      }, 1200 + Math.random() * 800);
    }
  }

  private executeBotTurn(bot: PlayerSchema) {
    if (this.state.round.phase !== "playerTurns" || this.state.round.activePlayerId !== bot.id) {
      return;
    }

    // 1. Bot item usage heuristic
    if (bot.inventory.length > 0 && Math.random() < 0.4) {
      const itemToUse = bot.inventory[0];
      if (itemToUse) {
        if (itemToUse.type === "redraw") {
          const score = calculateHandScore(bot.hand.toArray());
          if (score.total > 21 || (score.total <= 14 && bot.hand.length >= 2)) {
            this.handleUseItem(bot.sessionId, { itemId: itemToUse.id });
          }
        } else if (itemToUse.type === "peek") {
          this.handleUseItem(bot.sessionId, { itemId: itemToUse.id });
        } else if (itemToUse.type === "forceHit") {
          const opponents = Array.from(this.state.players.values()).filter(
            p => p.id !== bot.id && p.status === "active" && !p.standing
          );
          if (opponents.length > 0) {
            const target = opponents[Math.floor(Math.random() * opponents.length)];
            if (target) {
              this.handleUseItem(bot.sessionId, { itemId: itemToUse.id, targetPlayerId: target.id });
            }
          }
        }
      }
    }

    // 2. Blackjack Hit / Stand decision
    const currentScore = calculateHandScore(bot.hand.toArray());
    if (currentScore.isBusted) {
      this.advanceToNextPlayer();
      return;
    }

    // Standard blackjack dealer-style logic for bot
    if (currentScore.total < 16) {
      this.handlePlayerHit(bot.sessionId);
    } else if (currentScore.total === 16 && currentScore.isSoft) {
      this.handlePlayerHit(bot.sessionId);
    } else {
      this.handlePlayerStand(bot.sessionId);
    }
  }

  private getActivePlayer(): PlayerSchema | undefined {
    if (!this.state.round.activePlayerId) return undefined;
    for (const [, player] of this.state.players) {
      if (player.id === this.state.round.activePlayerId && player.status === "active") {
        return player;
      }
    }
    return undefined;
  }

  private handlePlayerHit(sessionId: string) {
    if (this.state.round.phase !== "playerTurns") return;

    const player = this.state.players.get(sessionId);
    if (!player || player.id !== this.state.round.activePlayerId || player.standing) {
      return;
    }

    const card = this.deck.drawCard(true);
    player.hand.push(card);
    this.updateScores();

    const score = calculateHandScore(player.hand.toArray());
    if (score.isBusted) {
      this.sendNotification("danger", "Bust!", `${player.name} busted with ${score.total}!`);
      this.clock.setTimeout(() => this.advanceToNextPlayer(), 1000);
    } else if (score.total === 21) {
      // Auto stand on 21
      this.sendNotification("success", "21!", `${player.name} locked in 21!`);
      player.standing = true;
      this.clock.setTimeout(() => this.advanceToNextPlayer(), 1000);
    } else if (player.isBot) {
      // Re-evaluate next bot action
      this.clock.setTimeout(() => this.checkActivePlayerTurn(), 1000);
    }
  }

  private handlePlayerStand(sessionId: string) {
    if (this.state.round.phase !== "playerTurns") return;

    const player = this.state.players.get(sessionId);
    if (!player || player.id !== this.state.round.activePlayerId) {
      return;
    }

    player.standing = true;
    this.sendNotification("info", "Stand", `${player.name} stands with ${player.score}.`);
    this.advanceToNextPlayer();
  }

  private handleUseItem(sessionId: string, payload: UseItemPayload) {
    const player = this.state.players.get(sessionId);
    if (!player || player.status !== "active") return;

    const itemIndex = player.inventory.findIndex(i => i.id === payload.itemId);
    if (itemIndex === -1) return;

    const item = player.inventory[itemIndex];
    if (!item) return;

    let result: ItemActionResult = { success: false, message: "", consumed: false };

    switch (item.type) {
      case "redraw": {
        result = ItemManager.handleRedraw(player, payload.sourceCardId, this.deck);
        this.updateScores();
        break;
      }
      case "forceHit": {
        if (!payload.targetPlayerId) {
          result = { success: false, message: "Target required for Force Hit", consumed: false };
          break;
        }
        let target: PlayerSchema | undefined;
        this.state.players.forEach(p => {
          if (p.id === payload.targetPlayerId) target = p;
        });
        if (target && target.status === "active") {
          result = ItemManager.handleForceHit(target);
        } else {
          result = { success: false, message: "Invalid target", consumed: false };
        }
        break;
      }
      case "cardSwap": {
        if (!payload.targetPlayerId) {
          result = { success: false, message: "Target required for Card Swap", consumed: false };
          break;
        }
        let target: PlayerSchema | undefined;
        this.state.players.forEach(p => {
          if (p.id === payload.targetPlayerId) target = p;
        });
        if (target && target.status === "active") {
          result = ItemManager.handleCardSwap(player, target, payload.sourceCardId, payload.targetCardId);
          this.updateScores();
        } else {
          result = { success: false, message: "Invalid target", consumed: false };
        }
        break;
      }
      case "peek": {
        const preview = RouletteEngine.previewCheck();
        result = {
          success: true,
          message: `${player.name} peeked into the chamber!`,
          consumed: true,
          extraData: preview
        };
        // Send private peek info to requesting client
        const client = this.clients.find(c => c.sessionId === sessionId);
        if (client) {
          client.send("peekResult", {
            bulletInChamber: preview.bulletInChamber
          });
        }
        break;
      }
      case "shield": {
        result = {
          success: true,
          message: "Shield is passive and protects automatically on roulette hit.",
          consumed: false
        };
        break;
      }
    }

    if (result.success && result.consumed) {
      player.inventory.splice(itemIndex, 1);
      this.sendNotification("item", "Item Activated", result.message);
    }
  }

  private advanceToNextPlayer() {
    const currentIndex = this.state.round.turnOrder.indexOf(this.state.round.activePlayerId || "");
    const nextIndex = currentIndex + 1;

    if (nextIndex < this.state.round.turnOrder.length) {
      this.state.round.activePlayerId = this.state.round.turnOrder[nextIndex] || "";
      this.checkActivePlayerTurn();
    } else {
      // All players took turn -> Dealer Resolve
      this.state.round.activePlayerId = "";
      this.startDealerResolve();
    }
  }

  private startDealerResolve() {
    this.state.round.phase = "dealerResolve";

    // Reveal dealer's hole card
    this.state.round.dealer.hand.forEach(c => (c.faceUp = true));
    let dealerScore = calculateHandScore(this.state.round.dealer.hand.toArray());
    this.state.round.dealer.score = dealerScore.total;
    this.state.round.dealer.isBusted = dealerScore.isBusted;

    const dealerDrawLoop = () => {
      dealerScore = calculateHandScore(this.state.round.dealer.hand.toArray());
      this.state.round.dealer.score = dealerScore.total;
      this.state.round.dealer.isBusted = dealerScore.isBusted;

      // Dealer must hit until 17 or higher
      if (dealerScore.total < 17) {
        this.clock.setTimeout(() => {
          const card = this.deck.drawCard(true);
          this.state.round.dealer.hand.push(card);
          dealerDrawLoop();
        }, 1000);
      } else {
        // Dealer finished drawing -> Move to scoring
        this.clock.setTimeout(() => this.executeScoring(), 1200);
      }
    };

    this.clock.setTimeout(dealerDrawLoop, 1000);
  }

  private executeScoring() {
    this.state.round.phase = "scoring";

    const activePlayers: PlayerSchema[] = [];
    this.state.players.forEach(p => {
      if (p.status === "active") activePlayers.push(p);
    });

    if (activePlayers.length === 0) {
      return;
    }

    const rankedResults = rankActivePlayers(activePlayers);
    const topFinisher = rankedResults[0]?.player;
    const lowestFinisher = rankedResults[rankedResults.length - 1]?.player;

    this.state.round.topFinisherId = topFinisher ? topFinisher.id : "";
    this.state.round.lowestFinisherId = lowestFinisher ? lowestFinisher.id : "";

    // Award random item to top finisher if inventory not full
    if (topFinisher) {
      const item = ItemManager.awardRandomItem(topFinisher);
      if (item) {
        this.state.round.awardedItemType = item.type;
        this.state.round.awardedPlayerId = topFinisher.id;
        this.sendNotification(
          "success",
          "Reward Awarded",
          `${topFinisher.name} won Round ${this.state.round.roundNumber} and earned: ${item.type.toUpperCase()}!`
        );
      } else {
        this.sendNotification(
          "info",
          "Reward Forfeit",
          `${topFinisher.name} placed #1, but inventory is full!`
        );
      }
    }

    // Proceed to Roulette Check for lowest finisher
    this.clock.setTimeout(() => {
      if (lowestFinisher) {
        this.executeRoulettePhase(lowestFinisher);
      } else {
        this.startNextRound();
      }
    }, 2500);
  }

  private executeRoulettePhase(targetPlayer: PlayerSchema) {
    this.state.round.phase = "rouletteCheck";

    const hasShield =
      targetPlayer.inventory.some(i => i.type === "shield") || targetPlayer.shieldPending;

    // Step 1: Broadcast Roulette Check Started (Suspense phase for clients to play 3D spin)
    const startedEvent: RouletteCheckStartedEvent = {
      playerId: targetPlayer.id,
      playerName: targetPlayer.name,
      shieldActive: hasShield
    };
    this.broadcast("rouletteCheckStarted", startedEvent);

    this.sendNotification(
      "danger",
      "Roulette Chamber Locked",
      `${targetPlayer.name} placed lowest and pulls the trigger...`
    );

    // Step 2: Suspense delay (3.8s) before resolving outcome
    this.clock.setTimeout(() => {
      const outcome = RouletteEngine.executeCheck(targetPlayer);

      if (outcome.isEliminated) {
        targetPlayer.status = "eliminated";
        this.sendNotification(
          "danger",
          "ELIMINATED!",
          `BANG! ${targetPlayer.name} was eliminated in the chamber!`
        );
      } else if (outcome.isShieldUsed) {
        this.sendNotification(
          "success",
          "Shield Absorbed!",
          `CLANG! ${targetPlayer.name}'s SHIELD absorbed the bullet!`
        );
      } else {
        this.sendNotification(
          "success",
          "CLICK! Survived!",
          `*CLICK* Chamber was empty. ${targetPlayer.name} survives to fight another round!`
        );
      }

      // Step 3: Broadcast Resolved outcome
      const resolvedEvent: RouletteCheckResolvedEvent = {
        playerId: targetPlayer.id,
        playerName: targetPlayer.name,
        isEliminated: outcome.isEliminated,
        shieldUsed: outcome.isShieldUsed,
        chamberNumber: outcome.chamberNumber,
        bulletChamber: outcome.bulletChamber
      };
      this.broadcast("rouletteCheckResolved", resolvedEvent);

      // Check win condition or proceed to next round
      this.clock.setTimeout(() => {
        const isGameOver = this.checkVictoryCondition();
        if (!isGameOver) {
          this.startNextRound();
        }
      }, 3000);
    }, 3800);
  }

  private checkVictoryCondition(): boolean {
    const activePlayers: PlayerSchema[] = [];
    this.state.players.forEach(p => {
      if (p.status === "active") activePlayers.push(p);
    });

    if (activePlayers.length === 1 && this.state.players.size > 1) {
      const winner = activePlayers[0];
      this.state.winnerId = winner.id;
      this.state.round.phase = "matchEnd";

      this.broadcast("matchEnded", {
        winnerId: winner.id,
        winnerName: winner.name
      });

      this.sendNotification(
        "success",
        "VICTORY!",
        `${winner.name} is the last survivor and wins the match!`
      );
      return true;
    }

    if (activePlayers.length === 0) {
      this.state.round.phase = "matchEnd";
      this.sendNotification("danger", "Match Over", "No survivors remained.");
      return true;
    }

    return false;
  }

  private startNextRound() {
    this.state.round.roundNumber++;
    this.sendNotification("info", "Next Round", `Round ${this.state.round.roundNumber} is beginning...`);
    this.clock.setTimeout(() => this.startRound(), 1500);
  }

  private sendNotification(
    type: "info" | "warning" | "danger" | "success" | "item",
    title: string,
    message: string
  ) {
    const event: NotificationEvent = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      title,
      message,
      timestamp: Date.now()
    };
    this.broadcast("notification", event);
  }
}
