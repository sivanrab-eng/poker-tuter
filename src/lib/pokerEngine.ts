// Poker game engine for Texas Hold'em

export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  rank: Rank;
  suit: Suit;
}

export type GamePhase = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'finished';
export type Action = 'fold' | 'check' | 'call' | 'raise' | 'all-in';

export interface ActionRecord {
  phase: GamePhase;
  actor: 'player' | 'bot';
  action: Action;
  amount?: number;
}

export interface GameState {
  playerHand: Card[];
  botHand: Card[];
  communityCards: Card[];
  phase: GamePhase;
  pot: number;
  playerChips: number;
  botChips: number;
  playerBet: number;
  botBet: number;
  actions: ActionRecord[];
  deck: Card[];
  isPlayerTurn: boolean;
  winner: 'player' | 'bot' | 'tie' | null;
  winningHandName: string;
}

const RANKS: Rank[] = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const SUITS: Suit[] = ['♠','♥','♦','♣'];

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function cardToString(card: Card): string {
  return `${card.rank}${card.suit}`;
}

export function isRedSuit(suit: Suit): boolean {
  return suit === '♥' || suit === '♦';
}

function rankValue(rank: Rank): number {
  const map: Record<Rank, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
    '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };
  return map[rank];
}

export interface HandEval {
  rank: number; // 1=high card, 2=pair, ..., 9=straight flush, 10=royal flush
  name: string;
  kickers: number[];
}

function evaluateHand(cards: Card[]): HandEval {
  // Generate all 5-card combos from 5-7 cards
  const combos = getCombinations(cards, 5);
  let best: HandEval = { rank: 0, name: '', kickers: [] };
  
  for (const combo of combos) {
    const eval_ = evaluate5(combo);
    if (comparHands(eval_, best) > 0) {
      best = eval_;
    }
  }
  return best;
}

function getCombinations(arr: Card[], k: number): Card[][] {
  if (k === 0) return [[]];
  if (arr.length === 0) return [];
  const [first, ...rest] = arr;
  const withFirst = getCombinations(rest, k - 1).map(c => [first, ...c]);
  const without = getCombinations(rest, k);
  return [...withFirst, ...without];
}

function evaluate5(cards: Card[]): HandEval {
  const sorted = [...cards].sort((a, b) => rankValue(b.rank) - rankValue(a.rank));
  const values = sorted.map(c => rankValue(c.rank));
  const suits = sorted.map(c => c.suit);
  
  const isFlush = suits.every(s => s === suits[0]);
  const isStraight = checkStraight(values);
  
  // Count ranks
  const counts: Record<number, number> = {};
  values.forEach(v => counts[v] = (counts[v] || 0) + 1);
  const groups = Object.entries(counts)
    .map(([v, c]) => ({ value: Number(v), count: c }))
    .sort((a, b) => b.count - a.count || b.value - a.value);
  
  if (isFlush && isStraight) {
    if (values[0] === 14 && values[1] === 13) {
      return { rank: 10, name: 'רויאל פלאש', kickers: values };
    }
    return { rank: 9, name: 'סטרייט פלאש', kickers: values };
  }
  if (groups[0].count === 4) return { rank: 8, name: 'קארה (Four of a Kind)', kickers: [groups[0].value, groups[1].value] };
  if (groups[0].count === 3 && groups[1].count === 2) return { rank: 7, name: 'פול האוס', kickers: [groups[0].value, groups[1].value] };
  if (isFlush) return { rank: 6, name: 'פלאש (Flush)', kickers: values };
  if (isStraight) return { rank: 5, name: 'סטרייט (Straight)', kickers: values };
  if (groups[0].count === 3) return { rank: 4, name: 'שלישייה (Three of a Kind)', kickers: [groups[0].value, ...groups.slice(1).map(g => g.value)] };
  if (groups[0].count === 2 && groups[1].count === 2) return { rank: 3, name: 'זוג כפול (Two Pair)', kickers: [groups[0].value, groups[1].value, groups[2].value] };
  if (groups[0].count === 2) return { rank: 2, name: 'זוג (Pair)', kickers: [groups[0].value, ...groups.slice(1).map(g => g.value)] };
  return { rank: 1, name: 'קלף גבוה (High Card)', kickers: values };
}

function checkStraight(values: number[]): boolean {
  const unique = [...new Set(values)].sort((a, b) => b - a);
  if (unique.length < 5) return false;
  if (unique[0] - unique[4] === 4) return true;
  // Ace-low straight
  if (unique.includes(14) && unique.includes(2) && unique.includes(3) && unique.includes(4) && unique.includes(5)) return true;
  return false;
}

function comparHands(a: HandEval, b: HandEval): number {
  if (a.rank !== b.rank) return a.rank - b.rank;
  for (let i = 0; i < Math.min(a.kickers.length, b.kickers.length); i++) {
    if (a.kickers[i] !== b.kickers[i]) return a.kickers[i] - b.kickers[i];
  }
  return 0;
}

export function createGame(): GameState {
  const deck = createDeck();
  const playerHand = [deck.pop()!, deck.pop()!];
  const botHand = [deck.pop()!, deck.pop()!];
  
  return {
    playerHand,
    botHand,
    communityCards: [],
    phase: 'preflop',
    pot: 30, // blinds: 10 + 20
    playerChips: 980,
    botChips: 990,
    playerBet: 20, // big blind
    botBet: 10, // small blind
    actions: [],
    deck,
    isPlayerTurn: true,
    winner: null,
    winningHandName: '',
  };
}

export function getAvailableActions(state: GameState): Action[] {
  if (!state.isPlayerTurn || state.phase === 'showdown' || state.phase === 'finished') return [];
  
  const actions: Action[] = ['fold'];
  const toCall = state.botBet - state.playerBet;
  
  if (toCall === 0) {
    actions.push('check');
  } else {
    actions.push('call');
  }
  actions.push('raise');
  return actions;
}

export function playerAction(state: GameState, action: Action): GameState {
  const newState = { ...state, actions: [...state.actions] };
  const toCall = state.botBet - state.playerBet;
  
  newState.actions.push({ phase: state.phase, actor: 'player', action });
  
  switch (action) {
    case 'fold':
      newState.winner = 'bot';
      newState.phase = 'finished';
      newState.winningHandName = 'פולד של השחקן';
      return newState;
    case 'check':
      newState.isPlayerTurn = false;
      break;
    case 'call':
      newState.playerChips -= toCall;
      newState.playerBet += toCall;
      newState.pot += toCall;
      newState.isPlayerTurn = false;
      break;
    case 'raise': {
      const raiseAmount = Math.min(40, newState.playerChips);
      newState.playerChips -= (toCall + raiseAmount);
      newState.playerBet += (toCall + raiseAmount);
      newState.pot += (toCall + raiseAmount);
      newState.isPlayerTurn = false;
      break;
    }
  }
  
  return newState;
}

export function botAction(state: GameState): GameState {
  const newState = { ...state, actions: [...state.actions] };
  const toCall = state.playerBet - state.botBet;
  
  // Simple bot logic based on hand strength
  const botCards = [...state.botHand, ...state.communityCards];
  const eval_ = botCards.length >= 5 ? evaluateHand(botCards) : { rank: 0, kickers: [] };
  
  let action: Action;
  const rand = Math.random();
  
  if (toCall === 0) {
    // Can check or raise
    if (eval_.rank >= 3 || rand > 0.7) {
      action = 'raise';
    } else {
      action = 'check';
    }
  } else {
    // Need to call or fold
    if (eval_.rank >= 2 || rand > 0.4) {
      if (eval_.rank >= 4 && rand > 0.5) {
        action = 'raise';
      } else {
        action = 'call';
      }
    } else {
      action = rand > 0.7 ? 'call' : 'fold';
    }
  }
  
  newState.actions.push({ phase: state.phase, actor: 'bot', action });
  
  switch (action) {
    case 'fold':
      newState.winner = 'player';
      newState.phase = 'finished';
      newState.winningHandName = 'פולד של הבוט';
      return newState;
    case 'check':
      break;
    case 'call':
      newState.botChips -= toCall;
      newState.botBet += toCall;
      newState.pot += toCall;
      break;
    case 'raise': {
      const raiseAmount = Math.min(40, newState.botChips);
      newState.botChips -= (toCall + raiseAmount);
      newState.botBet += (toCall + raiseAmount);
      newState.pot += (toCall + raiseAmount);
      newState.isPlayerTurn = true;
      return newState; // Player needs to respond
    }
  }
  
  return newState;
}

export function advancePhase(state: GameState): GameState {
  const newState = { ...state, deck: [...state.deck], communityCards: [...state.communityCards] };
  newState.playerBet = 0;
  newState.botBet = 0;
  
  switch (state.phase) {
    case 'preflop':
      newState.phase = 'flop';
      newState.communityCards.push(newState.deck.pop()!, newState.deck.pop()!, newState.deck.pop()!);
      break;
    case 'flop':
      newState.phase = 'turn';
      newState.communityCards.push(newState.deck.pop()!);
      break;
    case 'turn':
      newState.phase = 'river';
      newState.communityCards.push(newState.deck.pop()!);
      break;
    case 'river':
      newState.phase = 'showdown';
      // Evaluate winner
      const playerEval = evaluateHand([...state.playerHand, ...newState.communityCards]);
      const botEval = evaluateHand([...state.botHand, ...newState.communityCards]);
      const cmp = comparHands(playerEval, botEval);
      if (cmp > 0) {
        newState.winner = 'player';
        newState.winningHandName = playerEval.name;
      } else if (cmp < 0) {
        newState.winner = 'bot';
        newState.winningHandName = botEval.name;
      } else {
        newState.winner = 'tie';
        newState.winningHandName = playerEval.name;
      }
      break;
  }
  
  newState.isPlayerTurn = true;
  return newState;
}

export function getPlayerHandEval(state: GameState): HandEval | null {
  const allCards = [...state.playerHand, ...state.communityCards];
  if (allCards.length < 5) return null;
  return evaluateHand(allCards);
}

export function getBotHandEval(state: GameState): HandEval | null {
  const allCards = [...state.botHand, ...state.communityCards];
  if (allCards.length < 5) return null;
  return evaluateHand(allCards);
}

// Calculate simple equity approximation
export function calculateEquity(hand: Card[], community: Card[]): number {
  const allCards = [...hand, ...community];
  if (allCards.length < 5) {
    // Rough preflop equity based on hand
    const r1 = rankValue(hand[0].rank);
    const r2 = rankValue(hand[1].rank);
    const isPair = r1 === r2;
    const isSuited = hand[0].suit === hand[1].suit;
    const high = Math.max(r1, r2);
    
    let equity = 0.3;
    if (isPair) equity = 0.5 + (high / 14) * 0.35;
    else {
      equity = 0.25 + (high / 14) * 0.2 + (Math.min(r1, r2) / 14) * 0.1;
      if (isSuited) equity += 0.04;
      if (Math.abs(r1 - r2) <= 2) equity += 0.03;
    }
    return Math.min(0.95, Math.max(0.15, equity));
  }
  
  const eval_ = evaluateHand(allCards);
  return Math.min(0.95, 0.3 + eval_.rank * 0.07);
}

export function getPhaseHebrew(phase: GamePhase): string {
  const map: Record<GamePhase, string> = {
    preflop: 'פרה-פלופ',
    flop: 'פלופ',
    turn: 'טרן',
    river: 'ריבר',
    showdown: 'שואדאון',
    finished: 'סיום',
  };
  return map[phase];
}

export function getActionHebrew(action: Action): string {
  const map: Record<Action, string> = {
    fold: 'פולד',
    check: "צ'ק",
    call: 'קול',
    raise: 'רייז',
    'all-in': 'אול-אין',
  };
  return map[action];
}
