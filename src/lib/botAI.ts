import type { GameState, Action } from './pokerEngine';

/**
 * Bot action with configurable aggression level (1-5).
 * 1 = very passive, 5 = maniac
 */
export function botActionWithAggression(state: GameState, aggression: number): GameState {
  const newState = { ...state, actions: [...state.actions] };
  const toCall = state.playerBet - state.botBet;

  // Evaluate hand strength roughly
  const botCards = [...state.botHand, ...state.communityCards];
  const hasCards = botCards.length >= 5;

  // Simple strength heuristic: rank value from evaluateHand not accessible here,
  // so we use a basic proxy
  const highCard = Math.max(
    ...state.botHand.map(c => '23456789'.indexOf(c.rank[0]) >= 0
      ? parseInt(c.rank) : { J: 11, Q: 12, K: 13, A: 14 }[c.rank[0]] ?? 10)
  );
  const isPair = state.botHand[0].rank === state.botHand[1].rank;
  const isSuited = state.botHand[0].suit === state.botHand[1].suit;

  let strength = 0.3;
  if (isPair) strength = 0.6 + highCard / 50;
  else {
    strength = 0.2 + highCard / 30;
    if (isSuited) strength += 0.05;
  }
  if (hasCards) strength += 0.1; // post-flop bonus if still in

  // Aggression factor: 1=0.1, 2=0.25, 3=0.4, 4=0.6, 5=0.8
  const aggrFactor = [0, 0.1, 0.25, 0.4, 0.6, 0.8][aggression];
  const rand = Math.random();

  let action: Action;

  if (toCall === 0) {
    // Can check or raise
    if (rand < aggrFactor || (strength > 0.5 && rand < aggrFactor + 0.2)) {
      action = 'raise';
    } else {
      action = 'check';
    }
  } else {
    // Need to call, raise, or fold
    const foldThreshold = Math.max(0.05, 0.5 - aggrFactor * 0.5 - strength * 0.3);
    const raiseThreshold = aggrFactor * 0.4 + (strength > 0.5 ? 0.2 : 0);

    if (rand < foldThreshold && aggression <= 3) {
      action = 'fold';
    } else if (rand < foldThreshold + raiseThreshold) {
      action = 'raise';
    } else {
      action = 'call';
    }
  }

  newState.actions.push({ phase: state.phase, actor: 'bot', action });

  switch (action) {
    case 'fold':
      newState.winner = 'player';
      newState.phase = 'finished';
      newState.winningHandName = 'Bot folded';
      return newState;
    case 'check':
      break;
    case 'call':
      newState.botChips -= toCall;
      newState.botBet += toCall;
      newState.pot += toCall;
      break;
    case 'raise': {
      // Aggressive bots raise bigger
      const baseRaise = 40;
      const raiseMultiplier = [0, 0.5, 0.75, 1, 1.5, 2.5][aggression];
      const raiseAmount = Math.min(Math.round(baseRaise * raiseMultiplier), newState.botChips);
      newState.botChips -= (toCall + raiseAmount);
      newState.botBet += (toCall + raiseAmount);
      newState.pot += (toCall + raiseAmount);
      newState.isPlayerTurn = true;
      return newState;
    }
  }

  return newState;
}
