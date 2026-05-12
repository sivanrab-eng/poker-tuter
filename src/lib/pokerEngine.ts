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
      return { rank: 10, name: 'hand.royal_flush', kickers: values };
    }
    return { rank: 9, name: 'hand.straight_flush', kickers: values };
  }
  if (groups[0].count === 4) return { rank: 8, name: 'hand.four_of_a_kind', kickers: [groups[0].value, groups[1].value] };
  if (groups[0].count === 3 && groups[1].count === 2) return { rank: 7, name: 'hand.full_house', kickers: [groups[0].value, groups[1].value] };
  if (isFlush) return { rank: 6, name: 'hand.flush', kickers: values };
  if (isStraight) return { rank: 5, name: 'hand.straight', kickers: values };
  if (groups[0].count === 3) return { rank: 4, name: 'hand.three_of_a_kind', kickers: [groups[0].value, ...groups.slice(1).map(g => g.value)] };
  if (groups[0].count === 2 && groups[1].count === 2) return { rank: 3, name: 'hand.two_pair', kickers: [groups[0].value, groups[1].value, groups[2].value] };
  if (groups[0].count === 2) return { rank: 2, name: 'hand.pair', kickers: [groups[0].value, ...groups.slice(1).map(g => g.value)] };
  return { rank: 1, name: 'hand.high_card', kickers: values };
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
      newState.winningHandName = 'engine.fold.player';
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
      newState.winningHandName = 'engine.fold.bot';
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

// Calculate outs — cards that improve the player's hand
export interface DrawInfo {
  /** Translation key, e.g. 'draw.flush' */
  name: string;
  outs: number;
  /** Translation key + params for description */
  descriptionKey: string;
  descriptionParams: Record<string, string | number>;
}

export interface OutsResult {
  totalOuts: number;
  draws: DrawInfo[];
  cardsRemaining: number;
}

export function calculateOuts(hand: Card[], community: Card[]): OutsResult {
  if (community.length < 3 || community.length >= 5) {
    return { totalOuts: 0, draws: [], cardsRemaining: 52 - hand.length - community.length };
  }

  const allKnown = [...hand, ...community];
  const knownSet = new Set(allKnown.map(c => `${c.rank}${c.suit}`));
  const cardsRemaining = 52 - allKnown.length;

  // Build remaining deck
  const remaining: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      if (!knownSet.has(`${rank}${suit}`)) remaining.push({ rank, suit });
    }
  }

  const currentEval = allKnown.length >= 5 ? evaluateHand(allKnown) : { rank: 0, kickers: [], name: '' };
  const draws: DrawInfo[] = [];
  const outsSet = new Set<string>();

  // Check flush draw
  const suitCounts: Record<string, number> = {};
  const handSuits = allKnown.map(c => c.suit);
  handSuits.forEach(s => suitCounts[s] = (suitCounts[s] || 0) + 1);
  for (const [suit, count] of Object.entries(suitCounts)) {
    if (count === 4 && currentEval.rank < 6) {
      const flushOuts = remaining.filter(c => c.suit === suit).length;
      draws.push({
        name: 'draw.flush',
        outs: flushOuts,
        descriptionKey: 'draw.desc.flush',
        descriptionParams: { n: flushOuts, suit },
      });
      remaining.filter(c => c.suit === suit).forEach(c => outsSet.add(`${c.rank}${c.suit}`));
    }
  }

  // Check straight draw (open-ended and gutshot)
  const numericRanks = [...new Set(allKnown.map(c => rankValue(c.rank)))].sort((a, b) => a - b);
  for (let target = 5; target <= 14; target++) {
    const seqRanks = [target - 4, target - 3, target - 2, target - 1, target];
    const adjRanks = seqRanks.map(r => r < 2 ? r + 13 : r > 14 ? r - 13 : r);
    const have = adjRanks.filter(r => numericRanks.includes(r));
    const missing = adjRanks.filter(r => !numericRanks.includes(r));
    if (have.length === 4 && missing.length === 1 && currentEval.rank < 5) {
      const neededRank = missing[0];
      const straightOuts = remaining.filter(c => rankValue(c.rank) === neededRank);
      if (straightOuts.length > 0) {
        const isGutshot = !(missing[0] === adjRanks[0] || missing[0] === adjRanks[4]);
        const drawName = isGutshot ? 'draw.gutshot' : 'draw.oesd';
        const existingDraw = draws.find(d => d.name === drawName);
        if (!existingDraw) {
          draws.push({
            name: drawName,
            outs: straightOuts.length,
            descriptionKey: 'draw.desc.straight',
            descriptionParams: { rank: straightOuts[0].rank },
          });
          straightOuts.forEach(c => outsSet.add(`${c.rank}${c.suit}`));
        }
      }
    }
  }

  // Check for pair/trips/set improvement
  const handRanks = hand.map(c => rankValue(c.rank));
  const commRankCounts: Record<number, number> = {};
  community.forEach(c => commRankCounts[rankValue(c.rank)] = (commRankCounts[rankValue(c.rank)] || 0) + 1);

  if (currentEval.rank <= 1) {
    const overOuts = remaining.filter(c => handRanks.includes(rankValue(c.rank)));
    if (overOuts.length > 0) {
      draws.push({
        name: 'draw.overcards',
        outs: overOuts.length,
        descriptionKey: 'draw.desc.overcards',
        descriptionParams: { n: overOuts.length },
      });
      overOuts.forEach(c => outsSet.add(`${c.rank}${c.suit}`));
    }
  } else if (currentEval.rank === 2) {
    const pairRank = hand.find(c => {
      const rv = rankValue(c.rank);
      const allRanks = allKnown.map(cc => rankValue(cc.rank));
      return allRanks.filter(r => r === rv).length >= 2;
    });
    if (pairRank) {
      const setOuts = remaining.filter(c => c.rank === pairRank.rank);
      if (setOuts.length > 0) {
        draws.push({
          name: 'draw.set',
          outs: setOuts.length,
          descriptionKey: 'draw.desc.set',
          descriptionParams: { n: setOuts.length },
        });
        setOuts.forEach(c => outsSet.add(`${c.rank}${c.suit}`));
      }
    }
  }

  return { totalOuts: outsSet.size, draws, cardsRemaining };
}

// Pot odds calculation
export interface PotOddsResult {
  potOdds: number;
  outsOdds: number;
  outsOddsRunout: number;
  isCallProfitable: boolean;
  /** Translation key for the explanation, with params */
  explanationKey: string;
  explanationParams: Record<string, string>;
  /** @deprecated Use explanationKey + explanationParams via t() instead. Kept for backwards-compat — falls back to the key. */
  explanation: string;
}

export function calculatePotOdds(pot: number, toCall: number, outs: number, cardsRemaining: number, communityCount: number): PotOddsResult {
  const potOdds = toCall > 0 ? (toCall / (pot + toCall)) * 100 : 0;
  const outsOdds = cardsRemaining > 0 ? (outs / cardsRemaining) * 100 : 0;
  const cardsTocome = communityCount === 3 ? 2 : 1;
  const outsOddsRunout = cardsTocome === 2
    ? (1 - ((cardsRemaining - outs) / cardsRemaining) * ((cardsRemaining - outs - 1) / (cardsRemaining - 1))) * 100
    : outsOdds;
  const isCallProfitable = outsOdds >= potOdds || (cardsTocome === 2 && outsOddsRunout >= potOdds);

  let explanationKey: string;
  const explanationParams: Record<string, string> = {
    pot: potOdds.toFixed(1),
    odds: outsOdds.toFixed(1),
    runout: outsOddsRunout.toFixed(1),
    outs: String(outs),
  };
  if (toCall === 0) {
    explanationKey = outs > 0 ? 'engine.explain.free.outs' : 'engine.explain.free.no.outs';
  } else if (isCallProfitable) {
    explanationKey = cardsTocome === 2 ? 'engine.explain.profitable.runout' : 'engine.explain.profitable';
  } else if (outs > 0) {
    explanationKey = cardsTocome === 2 ? 'engine.explain.unprofitable.runout' : 'engine.explain.unprofitable';
  } else {
    explanationKey = 'engine.explain.no.outs';
  }

  return { potOdds, outsOdds, outsOddsRunout, isCallProfitable, explanationKey, explanationParams, explanation: explanationKey };
}

// Calculate simple equity approximation
export function calculateEquity(hand: Card[], community: Card[]): number {
  const allCards = [...hand, ...community];
  if (allCards.length < 5) {
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

/** Returns the i18n key for a phase (e.g. 'phase.preflop'). */
export function getPhaseKey(phase: GamePhase): string {
  return `phase.${phase}`;
}

/** Returns the i18n key for an action (e.g. 'action.fold'). */
export function getActionKey(action: Action): string {
  return `action.${action}`;
}

// Backwards-compat aliases — return translation keys; consumers must wrap in t().
export const getPhaseHebrew = getPhaseKey;
export const getActionHebrew = getActionKey;

