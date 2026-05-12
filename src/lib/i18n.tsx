import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "he";

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextType | null>(null);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Hero
    "hero.title": "Master Poker",
    "hero.share": "Share",
    "hero.install": "Install",
    "hero.install.toast": "🎉 App added to home screen!",
    "hero.install.ios.title": "Add to Home Screen",
    "hero.install.ios.desc": "Tap the Share button (⬆) in Safari, then 'Add to Home Screen'",
    "hero.install.android.title": "Add to Home Screen",
    "hero.install.android.desc": "Open browser menu (⋮) and choose 'Add to Home Screen' or 'Install App'",

    // Sections
    "section.theory.title": "Theory & Learning",
    "section.theory.desc": "Lessons, hand rankings & glossary.",
    "section.theory.info.what": "The theoretical learning center — lessons, hand rankings, and glossary.",
    "section.theory.info.shows": "4 graded lessons, 9 hand combinations, and a comprehensive glossary.",
    "section.theory.info.teaches": "The basics of Texas Hold'em — rules, concepts, and rankings.",
    "section.theory.info.why": "Because without solid theory, there's no chance at the table.",

    "section.guided.title": "Learn While Playing",
    "section.guided.desc": "Play vs bot with AI coach, smart analysis & analyst report.",
    "section.guided.subtitle": "Includes analyst report: equity, EV & full analysis",
    "section.guided.info.what": "Guided play vs bot with AI coach + professional analyst report after each hand.",
    "section.guided.info.shows": "Full poker table, smart analysis, and post-hand report with equity, EV, correct decisions.",
    "section.guided.info.teaches": "How to make correct decisions and analyze your game professionally.",
    "section.guided.info.why": "Because the best way to learn is to play, get feedback, and analyze.",

    "section.visual.title": "Visual Lab Training",
    "section.visual.desc": "'Who wins?' & 'What beats what?' — fast recognition.",
    "section.visual.info.what": "Visual quizzes for fast recognition of winning hands.",
    "section.visual.info.shows": "Two hands face to face, combination comparisons and difficulty levels.",
    "section.visual.info.teaches": "Instant recognition of winning hands and priority order.",
    "section.visual.info.why": "Because in a real game there's no time to think — you need to recognize instantly.",

    "section.probability.title": "Poker Probability",
    "section.probability.desc": "Outs, Rule of 4, Pot Odds — practical calculations.",
    "section.probability.info.what": "Math module for practicing probabilities and value calculations.",
    "section.probability.info.shows": "Structured scenarios with step-by-step questions.",
    "section.probability.info.teaches": "How to calculate odds, outs and Pot Odds practically.",
    "section.probability.info.why": "Because poker is also math — and whoever understands it wins.",

    // Arena
    "arena.title": "🎰 Game Arena: Choose Your Setting",
    "arena.free.title": "Free Practice",
    "arena.free.desc": "Vs bot, no pressure",
    "arena.multi.title": "Two Players",
    "arena.multi.desc": "Real-time — live!",
    "arena.bot.title": "Bot Battle",
    "arena.bot.desc": "Aggressive vs conservative",

    // Info modal
    "info.what": "What is it?",
    "info.shows": "What does it show?",
    "info.teaches": "What does it teach?",
    "info.why": "Why does it exist?",

    // Placeholder
    "placeholder.back": "Back to menu",
    "placeholder.soon": "Coming soon...",
    "placeholder.free.title": "Free Practice",
    "placeholder.free.desc": "Play vs bot, no pressure",
    "placeholder.multi.title": "Two Players",
    "placeholder.multi.desc": "Live game vs a friend",
    "placeholder.bot.title": "Bot Battle",
    "placeholder.bot.desc": "Aggressive vs conservative — who wins?",

    // Not Found
    "notfound.title": "404",
    "notfound.text": "Oops! Page not found",
    "notfound.link": "Return to Home",

    // Theory Learning
    "theory.title": "Theory & Learning",
    "theory.intro": "The foundation for every good poker player. Learn the rules, know the hands, and speak the language.",
    "theory.lessons.title": "Lessons",
    "theory.lessons.desc": "4 graded lessons to learn poker fundamentals — from basic rules to strategy.",
    "theory.lessons.subtitle": "Beginner → Advanced",
    "theory.rankings.title": "Hand Rankings",
    "theory.rankings.desc": "All 9 combinations from strongest to weakest — with visual examples.",
    "theory.rankings.subtitle": "Royal Flush → High Card",
    "theory.glossary.title": "Glossary",
    "theory.glossary.desc": "All the terms you need to know — clearly explained.",
    "theory.glossary.subtitle": "20+ terms",

    // Guided Game
    "guided.title": "Guided Game",
    "guided.report.title": "Analyst Report",
    "guided.welcome": "Welcome! Choose an action for the pre-flop stage.",
    "guided.chose": "You chose:",
    "guided.bot.did": "The bot did",
    "guided.bot.your.turn": "Your turn!",
    "guided.showdown": "Showdown! Revealing cards...",
    "guided.phase.action": "stage — choose an action.",
    "guided.new.game": "New game! Choose an action for the pre-flop stage.",
    "guided.bot.label": "🤖 Bot",
    "guided.bot.chips": "Chips:",
    "guided.bot.thinking": "Thinking...",
    "guided.community": "Community Cards",
    "guided.community.hidden": "Not yet revealed",
    "guided.your.hand": "🃏 Your Hand",
    "guided.outs.title": "🔢 Outs & Pot Odds",
    "guided.pot.label": "Pot:",
    "guided.call.label": "Call:",
    "guided.free.check": "Free check",
    "guided.outs.label": "outs",
    "guided.total.label": "Total:",
    "guided.improve.label": "Improve:",
    "guided.free.check.always": "✅ Free check — always correct to continue!",
    "guided.outs.free": "outs ({pct}% to improve) — no cost",
    "guided.no.draws": "No clear draws at this stage.",
    "guided.hint.btn": "💡 Hint — show decision variables",

    // Visual Quiz
    "quiz.title": "Who Wins?",
    "quiz.streak": "🔥 Streak",
    "quiz.community": "Community Cards",
    "quiz.player.a": "Player A",
    "quiz.player.b": "Player B",
    "quiz.tie": "🤝 Tie",
    "quiz.next": "Next Question →",
    "quiz.correct.1": "Excellent! Your eye is getting sharper 🎯",
    "quiz.correct.2": "Correct! You're already identifying like a pro 💪",
    "quiz.correct.3": "Spot on! Keep it up 🔥",
    "quiz.wrong.answer": "The correct answer:",
    "quiz.wrong.player.a": "Player A",
    "quiz.wrong.player.b": "Player B",
    "quiz.wrong.tie": "Tie",
    "quiz.beats": "beats",
    "quiz.both.equal": "Both hands are equal!",

    // Probability
    "prob.title": "Poker Probability",
    "prob.community": "Community Cards",
    "prob.your.hand": "Your hand",
    "prob.pot": "Pot",
    "prob.opponent.bet": "Opponent's bet",
    "prob.step1": "Step 1: How many outs?",
    "prob.step1.placeholder": "Number of outs",
    "prob.step2": "Step 2: Rule of 4 — what percentage?",
    "prob.step2.placeholder": "Chance percentage",
    "prob.step3": "Step 3: Pot Odds — what percentage?",
    "prob.step3.placeholder": "Pot Odds %",
    "prob.step4": "Step 4: What's the decision?",
    "prob.check": "Check",
    "prob.call": "✅ Call",
    "prob.fold": "❌ Fold",
    "prob.next": "Next Scenario →",
    "prob.correct.outs": "Correct! {n} outs 🎯",
    "prob.wrong.outs": "Not exactly. The answer: {n} outs.",
    "prob.correct.rule": "Excellent! {n}% ({outs}×4) 💪",
    "prob.wrong.rule": "Rule of 4: {outs} × 4 = {n}%",
    "prob.correct.potodds": "Correct! Pot Odds ≈ {n}% ✅",
    "prob.wrong.potodds": "Pot Odds = {bet}/({pot}+{bet}) ≈ {n}%",
    "prob.correct.decision": "Correct decision! 🏆",
    "prob.wrong.decision.call": "Not exactly. Call is profitable here.",
    "prob.wrong.decision.fold": "Not exactly. Fold is better here.",

    // Hand Rankings
    "rankings.title": "Hand Rankings",
    "rankings.intro": "From strongest to weakest — with examples and probability",
    "rankings.rarity": "Odds:",

    // Glossary
    "glossary.title": "Glossary",
    "glossary.search": "Search term...",
    "glossary.empty": "No results found",
    "glossary.count": "{n} terms",

    // Lesson Page
    "lesson.of": "Lesson {n} of {total}",
    "lesson.not.found": "Lesson not found",
    "lesson.back": "Back to Theory",
    "lesson.example": "Example",

    // Coach
    "coach.label": "Coach's Tip",
    "coach.open": "Click to open",

    // Analyst Report
    "report.title": "📊 Analyst Report",
    "report.win": "🏆 Victory!",
    "report.loss": "😞 Loss",
    "report.tie": "🤝 Tie",
    "report.winning.hand": "Winning hand: {name}. Final pot: {pot} chips.",
    "report.cards": "Cards",
    "report.yours": "Yours",
    "report.bot": "Bot",
    "report.actions.title": "🎯 What You Did",
    "report.analyst.title": "🧠 What the Analyst Would Do",
    "report.outs.title": "🔢 Outs & Pot Odds — Analysis by Phase",
    "report.pot.label": "Pot:",
    "report.call.cost": "Call cost:",
    "report.potodds.label": "Pot odds (cost/pot+cost):",
    "report.potodds.free": "Free check ✅",
    "report.cards.remaining": "Cards remaining in deck:",
    "report.total.outs": "Total outs:",
    "report.improve.next": "Improve chance (next card):",
    "report.improve.river": "Improve chance (to river):",
    "report.improve.to.river": "Improve to river:",
    "report.improve.label": "Improve:",
    "report.no.draws": "No clear draws at this stage.",
    "report.free.check": "✅ Free check — always correct to continue",
    "report.calc": "Calculation:",
    "report.example.yours": "Example with your numbers:",
    "report.call.profitable": "Call profitable",
    "report.call.unprofitable": "Call not profitable",
    "report.equity.title": "📈 Final Equity",
    "report.equity.yours": "Your equity:",
    "report.new.game": "🃏 New Game",

    // Hint Panel
    "hint.title": "💡 Hint —",
    "hint.pot.label": "Pot",
    "hint.tocall.label": "Cost to Call (To Call)",
    "hint.tocall.free": "Free ✅",
    "hint.potodds.label": "Pot Odds",
    "hint.potodds.free": "0% (free)",
    "hint.outs.label": "Outs",
    "hint.improve.label": "Improve Chance (%)",
    "hint.equity.label": "Equity",
    "hint.compare.title": "📊 Action Comparison",
    "hint.var": "Variable",
    "hint.check": "Check",
    "hint.call": "Call",
    "hint.raise": "Raise",
    "hint.fold": "Fold",
    "hint.cost": "💰 Cost",
    "hint.pot.after": "🏦 Pot After",
    "hint.risk": "⚠️ Risk",
    "hint.risk.zero": "Zero",
    "hint.risk.low": "Low",
    "hint.risk.medium": "Medium",
    "hint.risk.high": "High",
    "hint.detail.check": "Check detail",
    "hint.detail.call": "Call detail",
    "hint.detail.raise": "Raise detail",
    "hint.detail.fold": "Fold detail",
    "hint.recommend": "Action Recommendation",

    // Poker terms (used in engine)
    "phase.preflop": "Pre-Flop",
    "phase.flop": "Flop",
    "phase.turn": "Turn",
    "phase.river": "River",
    "phase.showdown": "Showdown",
    "phase.finished": "Finished",
    "action.fold": "Fold",
    "action.check": "Check",
    "action.call": "Call",
    "action.raise": "Raise",
    "action.all-in": "All-In",

    // Hand names
    "hand.royal_flush": "Royal Flush",
    "hand.straight_flush": "Straight Flush",
    "hand.four_of_a_kind": "Four of a Kind",
    "hand.full_house": "Full House",
    "hand.flush": "Flush",
    "hand.straight": "Straight",
    "hand.three_of_a_kind": "Three of a Kind",
    "hand.two_pair": "Two Pair",
    "hand.pair": "Pair",
    "hand.high_card": "High Card",

    // Draw names
    "draw.flush": "Flush Draw",
    "draw.oesd": "Open-Ended Straight Draw",
    "draw.gutshot": "Gutshot Straight Draw",
    "draw.overcards": "Pair (Overcards)",
    "draw.set": "Three of a Kind (Set)",

    // Probability scenarios
    "scenario.flush": "Flush Draw",
    "scenario.oesd": "Open-Ended Straight Draw (OESD)",
    "scenario.gutshot": "Gutshot",
    "scenario.overcards": "Overcards",

    // Bot Battle
    "bot.title": "Bot Battle",
    "bot.setup.desc": "Choose the bot's aggression level before the game starts.",
    "bot.aggression.label": "Bot Aggression Level",
    "bot.aggression.info": "How will the bot play?",
    "bot.style.passive": "Rarely raises, prefers to check/call. Easy to bluff.",
    "bot.style.balanced": "Mixes raises and calls. Standard play.",
    "bot.style.aggressive": "Raises often, bluffs frequently. High pressure!",
    "bot.start": "⚔️ Start Battle",
    "bot.welcome": "Bot Battle! Choose your action.",
    "bot.new.hand": "New hand! Choose your action.",
    "bot.next.hand": "Next Hand ⚔️",
    "bot.change.level": "Change Level",
    "bot.hands": "hands",
    "bot.wins": "wins",

    // Engine
    "engine.fold.player": "Player folded",
    "engine.fold.bot": "Bot folded",
    "engine.explain.free.outs": "No need to pay — free check. You have {outs} outs ({odds}% to improve).",
    "engine.explain.free.no.outs": "No need to pay and no clear draws — check.",
    "engine.explain.profitable": "Pot odds: {pot}%. Improve chance: {odds}%. Profitable call! ✅",
    "engine.explain.profitable.runout": "Pot odds: {pot}%. Improve chance: {odds}% ({runout}% by river). Profitable call! ✅",
    "engine.explain.unprofitable": "Pot odds: {pot}%. Improve chance: {odds}%. Call not profitable — consider folding. ❌",
    "engine.explain.unprofitable.runout": "Pot odds: {pot}%. Improve chance: {odds}% ({runout}% by river). Call not profitable — consider folding. ❌",
    "engine.explain.no.outs": "No clear outs. Continue only with a strong hand.",
    "draw.desc.flush": "{n} {suit} cards remaining in the deck",
    "draw.desc.straight": "Need {rank} to complete the straight",
    "draw.desc.overcards": "{n} cards to pair with your hole cards",
    "draw.desc.set": "{n} cards to improve to three of a kind",

    // Common
    "common.chips": "chips",
    "common.outs": "outs",
    "common.you": "You",
    "common.pot": "Pot",
    "common.equity": "Equity",
    "common.cancel": "Cancel",

    // Guided extras
    "guided.community.label": "Community Cards",
    "guided.community.empty": "Not yet revealed",
    "guided.your.label": "Your Hand",
    "guided.equity.label": "Equity:",
    "guided.outs.heading": "🔢 Outs & Pot Odds",
    "guided.outs.total": "Total: {n} outs",
    "guided.outs.improve": "Improve:",
    "guided.outs.no.draws": "No clear draws at this stage.",
    "guided.outs.free.check": "✅ Free check — always correct to continue!",
    "guided.outs.free.bonus": "{n} outs ({odds}% to improve) — no cost",
    "guided.hint.btn.full": "💡 Hint — show decision variables",
    "guided.message.welcome": "Welcome! Choose an action for the pre-flop stage.",
    "guided.message.new": "New game! Choose an action for the pre-flop stage.",
    "guided.message.chose": "You chose: {action}",
    "guided.message.bot.did": "The bot did {action}.",
    "guided.message.bot.your.turn": "The bot did {action}. Your turn!",
    "guided.message.showdown": "Showdown! Revealing cards...",
    "guided.message.phase": "{phase} — choose an action.",
    "guided.phase.label": "Stage: {phase}",
    "guided.pot.full": "Pot: {n}",

    // Hint
    "hint.heading": "💡 Hint — {phase}",
    "hint.var.pot.label": "Pot",
    "hint.var.pot.value": "{n} chips",
    "hint.var.pot.exp": "The pot is the total chips invested in the current hand.\n\n📐 Calculation: sum of all bets across all stages = {n} chips.\n\nThe bigger the pot, the more it pays off to try to win it.",
    "hint.var.tocall.label": "Cost to Call",
    "hint.var.tocall.free": "Free ✅",
    "hint.var.tocall.value": "{n} chips",
    "hint.var.tocall.exp.free": "There's no bet to match — you can check for free.\n\n📐 Calculation: bot bet ({bot}) − your bet ({me}) = 0.\n\nAlways correct to continue when there's no cost!",
    "hint.var.tocall.exp.cost": "How many chips you need to pay to stay in the hand.\n\n📐 Calculation: bot bet ({bot}) − your bet ({me}) = {n} chips.\n\nThis is the amount to evaluate whether it's 'worth' paying.",
    "hint.var.potodds.label": "Pot Odds",
    "hint.var.potodds.zero": "0% (free)",
    "hint.var.potodds.value": "{n}%",
    "hint.var.potodds.exp.free": "Pot odds = call cost / (pot + call cost)\n\n📐 Calculation: 0 / ({pot} + 0) = 0%\n\nWhen pot odds are 0%, any improve chance makes continuing profitable.",
    "hint.var.potodds.exp.cost": "Pot odds = call cost / (pot + call cost)\n\n📐 Calculation: {n} / ({pot} + {n}) = {odds}%\n\nIf your improve chance is higher than {odds}%, the call is profitable.",
    "hint.var.potodds.exp.na": "Pot odds are calculated from the flop onward.",
    "hint.var.outs.label": "Outs",
    "hint.var.outs.exp": "Outs = cards in the deck that improve your hand.\n\n📐 {remaining} cards left in the deck.\n{lines}\n\nTotal: {total} outs out of {remaining} cards.",
    "hint.var.outs.line": "• {name}: {n} outs",
    "hint.var.outs.none": "• No specific draws",
    "hint.var.improve.label": "Improve Chance (%)",
    "hint.var.improve.value": "{n}%",
    "hint.var.improve.value.runout": "{n}% ({runout}% by river)",
    "hint.var.improve.exp.next": "Improve chance = outs / cards remaining\n\n📐 Calculation (next card): {outs} / {remaining} = {odds}%\n\nThe more outs you have, the higher the chance to improve.",
    "hint.var.improve.exp.runout": "Improve chance = outs / cards remaining\n\n📐 Calculation (next card): {outs} / {remaining} = {odds}%\n\n📐 Calculation (by river — Rule of 4): {outs} × 4 ≈ {ruleOf4}% (precise: {runout}%)\n\nThe more outs you have, the higher the chance to improve.",
    "hint.var.equity.label": "Equity",
    "hint.var.equity.value": "{n}%",
    "hint.var.equity.exp": "Equity = your overall chance to win the hand.\n\n📐 Current value: {n}%\n\nIncludes both the chance your hand is winning now and the chance to improve.\n\n• Above 65% → raise (build pot)\n• 45-65% → call (decent hand)\n• Below 30% → consider folding",
    "hint.compare.heading": "📊 Action Comparison",
    "hint.compare.var": "Variable",
    "hint.compare.check": "Check",
    "hint.compare.call": "Call",
    "hint.compare.raise": "Raise",
    "hint.compare.fold": "Fold",
    "hint.compare.cost": "💰 Cost",
    "hint.compare.pot.after": "🏦 Pot After",
    "hint.compare.potodds": "📐 Pot Odds",
    "hint.compare.equity": "📈 Equity",
    "hint.compare.outs": "🎯 Outs",
    "hint.compare.improve": "📊 Improve %",
    "hint.compare.risk": "⚠️ Risk",
    "hint.rec.heading": "Action Recommendation",
    "hint.rec.check.action": "Check / Raise",
    "hint.rec.check.reason": "No cost to continue (free check). Always right to see more cards for free.\n\nIf you have a strong hand (equity {equity}%), consider raising to build the pot.",
    "hint.rec.call.action": "Call ✅",
    "hint.rec.call.reason": "Your improve chance ({improve}%) is higher than pot odds ({potodds}%).\nStatistically, over time, calling will earn money.",
    "hint.rec.raise.action": "Raise",
    "hint.rec.raise.reason": "High equity of {equity}% — strong hand.\nWorth building the pot and making the opponent pay.",
    "hint.rec.fold.action": "Fold ❌",
    "hint.rec.fold.reason": "Improve chance ({improve}%) is lower than pot odds ({potodds}%).\nOver time, calling here loses money.",
    "hint.rec.fold2.action": "Fold",
    "hint.rec.fold2.reason": "Low equity ({equity}%) — small chance to win.\nBetter to save chips for hands with a better chance.",
    "hint.rec.callsoft.action": "Call",
    "hint.rec.callsoft.reason": "Decent equity ({equity}%). Worth seeing more cards if the price is reasonable.",
    "hint.action.fold.title": "Fold — Analysis",
    "hint.action.call.title": "Call / Check — Analysis",
    "hint.action.callcost.title": "Call — Analysis",
    "hint.action.raise.title": "Raise — Analysis",
    "hint.fold.line.heading": "📐 Fold analysis:",
    "hint.fold.line.giveup": "• You give up the pot ({pot} chips).",
    "hint.fold.line.invested": "• Cumulative loss in this hand: {n} chips already invested.",
    "hint.fold.line.equity": "• Current equity: {n}% — {note}",
    "hint.fold.line.equity.high": "too high to give up!",
    "hint.fold.line.equity.low": "low, reasonable to fold.",
    "hint.fold.line.potodds": "• Pot odds: {pot}% | Improve chance: {improve}%",
    "hint.fold.line.profitable": "\n❌ The call is profitable here — folding wastes opportunity!",
    "hint.fold.line.unprofitable": "\n✅ Call not profitable — folding saves {n} chips.",
    "hint.fold.line.weak": "\n✅ Weak hand — folding saves money long-term.",
    "hint.fold.line.consider": "\n⚠️ Consider check/call before folding — hand isn't weak.",
    "hint.call.line.heading": "📐 Call analysis ({label}):",
    "hint.call.line.label.free": "free check",
    "hint.call.line.label.cost": "cost: {n}",
    "hint.call.line.newpot": "• Pot after call: {pot} + {tocall} = {newpot} chips",
    "hint.call.line.zero.cost": "• Cost: 0 — no risk!",
    "hint.call.line.equity": "• Equity: {n}%",
    "hint.call.line.zero.right": "\n✅ Free check — always correct to continue.",
    "hint.call.line.zero.outs": "   {n} outs ({improve}% to improve) at no cost.",
    "hint.call.line.potodds": "• Pot odds: {tocall} / {newpot} = {potodds}%",
    "hint.call.line.outs": "• Outs: {n} | Improve chance: {improve}%",
    "hint.call.line.profitable": "\n✅ Profitable call! Improve chance ({improve}%) > pot odds ({potodds}%).",
    "hint.call.line.profitable.long": "   Over 100 such hands, you profit on average.",
    "hint.call.line.unprofitable": "\n❌ Call not profitable: improve chance ({improve}%) < pot odds ({potodds}%).",
    "hint.call.line.unprofitable.long": "   Over 100 such hands, you lose on average.",
    "hint.raise.line.heading": "📐 Raise analysis ({size} chips):",
    "hint.raise.line.cost": "• Cost: {tocall} (call) + {size} (raise) = {total} chips",
    "hint.raise.line.newpot": "• Pot after raise: ~{newpot} chips",
    "hint.raise.line.equity": "• Equity: {n}%",
    "hint.raise.line.outs": "• Outs: {outs} | Improve: {improve}%",
    "hint.raise.line.strong": "\n✅ Strong raise! High equity ({n}%) — build the pot.",
    "hint.raise.line.strong.long": "   Pressure the opponent and force mistakes.",
    "hint.raise.line.semibluff": "\n⚠️ Semi-bluff raise: equity {n}%.",
    "hint.raise.line.semibluff.long": "   May work if opponent folds, but risky.",
    "hint.raise.line.risky": "\n❌ Risky raise! Low equity ({n}%).",
    "hint.raise.line.risky.long": "   You invest {total} chips with low chance to win.",

    // Report extras
    "report.heading": "📊 Analyst Report",
    "report.cards.heading": "The Cards",
    "report.cards.you": "You",
    "report.cards.bot": "Bot",
    "report.timeline.heading": "📜 Hand Sequence",
    "report.timeline.you": "You",
    "report.timeline.bot": "Bot",
    "report.timeline.decided": "🏁 Hand decided in stage:",
    "report.timeline.bot.folded": " — bot folded!",
    "report.timeline.you.folded": " — you folded",
    "report.analyst.heading": "🧠 What the Analyst Would Do",
    "report.rec.raise": "In the {phase} stage, with equity of {n}%, the right action is raise. Strong hand — build a pot with it.",
    "report.rec.call": "In the {phase} stage, with equity of {n}%, the right action is call. Decent hand — worth seeing more cards.",
    "report.rec.checkcall": "In the {phase} stage, with equity of {n}%, you can check/call if the price is low, but be careful with big investments.",
    "report.rec.fold": "In the {phase} stage, with equity of {n}%, folding is preferable. The chance to win is too low for the cost.",
    "report.outs.heading": "🔢 Outs & Pot Odds — Analysis by Stage",
    "report.outs.pot": "Pot:",
    "report.outs.callcost": "Call cost:",
    "report.outs.potodds": "Pot odds (cost/pot+cost):",
    "report.outs.free": "Free check ✅",
    "report.outs.remaining": "Cards remaining in deck:",
    "report.outs.totalouts": "Total outs:",
    "report.outs.improve.next": "Improve chance (next card):",
    "report.outs.improve.river": "Improve chance (by river):",
    "report.outs.improve.toriver": "Improve by river:",
    "report.outs.improve": "Improve:",
    "report.outs.no.draws": "No clear draws at this stage.",
    "report.outs.outslabel": "{n} outs",
    "report.outs.profitable": "Profitable call",
    "report.outs.unprofitable": "Call not profitable",
    "report.outs.free.heading": "✅ Free check — always correct to continue",
    "report.outs.free.calc1": "📐 Calculation: Pot = {pot}, toCall = 0",
    "report.outs.free.calc2": "→ Pot Odds = toCall / (Pot + toCall) = 0 / ({pot}+0) = 0%",
    "report.outs.free.calc3": "→ Outs: {outs} of {remaining} cards",
    "report.outs.free.calc4": "→ Improve chance (next card): {outs}/{remaining} = {odds}%",
    "report.outs.free.calc5": "→ Improve chance (by river): ≈ {runout}%",
    "report.outs.free.calc6": "→ Any improve chance > 0% = check/call always profitable",
    "report.outs.free.example.heading": "📊 Example with your numbers:",
    "report.outs.free.example1": "The pot is {pot} chips and you don't pay anything (toCall=0).",
    "report.outs.free.example2": "You have {outs} outs of {remaining} cards remaining in the deck.",
    "report.outs.free.example3": "Chance to improve next card: {outs}÷{remaining} = {odds}%.",
    "report.outs.free.example4": "Chance to improve by river (2 cards): ≈ {runout}% (Rule of 4 ≈ {ruleOf4}%).",
    "report.outs.free.example5": "Since pot odds = 0% and improve chance = {odds}%, it always pays to continue.",
    "report.outs.free.example.no.outs": "No outs to improve, but since there's no cost — better to check and see free cards.",
    "report.equity.heading": "📈 Final Equity",
    "report.equity.label": "Your equity:",
    "report.newgame": "🃏 New Game",
    "report.win.title": "🏆 Victory!",
    "report.loss.title": "😞 Loss",
    "report.tie.title": "🤝 Tie",
    "report.win.summary": "Winning hand: {name}. Final pot: {pot} chips.",

    // Two Player
    "two.title": "🃏 Two Players",
    "two.lobby.title": "Two players — two devices",
    "two.lobby.subtitle": "Each sees only their own cards",
    "two.lobby.create": "✨ Create New Room",
    "two.lobby.join.label": "Join an existing room",
    "two.lobby.join.placeholder": "Enter room code...",
    "two.lobby.join.btn": "Join →",
    "two.lobby.error.notfound": "Room not found. Check the code.",
    "two.lobby.error.full": "Room is already full.",
    "two.waiting.title": "Waiting...",
    "two.waiting.player": "Waiting for player 2...",
    "two.waiting.dealer": "Waiting for dealer...",
    "two.waiting.send": "Send the code to your friend:",
    "two.waiting.share": "Share",
    "two.waiting.copy": "Copy code",
    "two.share.text": "🃏 Come play poker with me!\n\nOpen the link, choose \"Join room\" and enter the code:\n\n*{code}*\n\n{url}",
    "two.share.title": "Come play poker!",
    "two.share.copy": "Room code: {code}\n{url}",
    "two.game.player": "🃏 Player {n}",
    "two.game.pot": "Pot {n}",
    "two.game.opp.label": "👤 Opponent (Player {n})",
    "two.game.board": "🂠 Board — {stage}",
    "two.game.your.cards": "✋ Your Cards",
    "two.game.your.turn": "🟢 Your turn!",
    "two.game.waiting.opp": "🟡 Waiting for opponent...",
    "two.game.you.won": "You won!",
    "two.game.you.lost": "You lost",
    "two.game.tie": "Tie!",
    "two.game.eval.row": "P1: {p1} · P2: {p2}",
    "two.game.btn.call": "✅ Call",
    "two.game.btn.raise": "📈 Raise",
    "two.game.btn.fold": "❌ Fold",
    "two.game.btn.new": "🔄 New Round",
    "two.game.btn.waiting": "Waiting for dealer...",
    "two.stage.preflop": "Pre-Flop",
    "two.stage.flop": "Flop",
    "two.stage.turn": "Turn",
    "two.stage.river": "River",
    "two.stage.showdown": "Showdown",
  },
  he: {
    // Hero
    "hero.title": "מאסטר פוקר",
    "hero.share": "שתף",
    "hero.install": "הוסף",
    "hero.install.toast": "🎉 האפליקציה נוספה למסך הבית!",
    "hero.install.ios.title": "הוספה למסך הבית",
    "hero.install.ios.desc": "לחצו על כפתור השיתוף (⬆) בספארי ואז 'הוסף למסך הבית'",
    "hero.install.android.title": "הוספה למסך הבית",
    "hero.install.android.desc": "פתחו את התפריט של הדפדפן (⋮) ובחרו 'הוסף למסך הבית' או 'התקן אפליקציה'",

    // Sections
    "section.theory.title": "תיאוריה ולמידה",
    "section.theory.desc": "שיעורים, דירוג ידיים ומילון מונחים.",
    "section.theory.info.what": "מרכז הלמידה התיאורטי — שיעורים, דירוג ידיים ומילון מונחים.",
    "section.theory.info.shows": "4 שיעורים מדורגים, 9 קומבינציות ידיים, ומילון מקיף.",
    "section.theory.info.teaches": "את הבסיס של טקסס הולדם — חוקים, מושגים, ודירוג.",
    "section.theory.info.why": "כי בלי תיאוריה חזקה, אין סיכוי להצליח בשולחן.",

    "section.guided.title": "לומד תוך כדי משחק",
    "section.guided.desc": "שחק מול בוט עם מאמן AI, ניתוח חכם ודו״ח אנליסט.",
    "section.guided.subtitle": "כולל דו״ח אנליסט: אקוויטי, EV וניתוח מלא",
    "section.guided.info.what": "משחק מודרך מול בוט עם מאמן AI + דו״ח אנליסט מקצועי אחרי כל יד.",
    "section.guided.info.shows": "שולחן פוקר מלא, ניתוח חכם, ובסיום כל יד — דו״ח עם אקוויטי, EV, החלטות נכונות.",
    "section.guided.info.teaches": "איך לקבל החלטות נכונות ולנתח את המשחק שלך בצורה מקצועית.",
    "section.guided.info.why": "כי הדרך הכי טובה ללמוד היא לשחק, לקבל פידבק ולנתח.",

    "section.visual.title": "אימון ויזואלי בתנאי מעבדה",
    "section.visual.desc": "חידוני 'מי מנצח?' ו'מה לוקח מה?' — זיהוי מהיר.",
    "section.visual.info.what": "חידונים ויזואליים לזיהוי מהיר של ידיים מנצחות.",
    "section.visual.info.shows": "שתי ידיים זו מול זו, השוואת קומבינציות ורמת קושי.",
    "section.visual.info.teaches": "זיהוי מיידי של יד מנצחת וסדר עדיפויות.",
    "section.visual.info.why": "כי במשחק אמיתי אין זמן לחשוב — צריך לזהות ברגע.",

    "section.probability.title": "הסתברות פוקר",
    "section.probability.desc": "אאוטס, כלל ה-4, Pot Odds — חישובים מעשיים.",
    "section.probability.info.what": "מודול מתמטי לתרגול הסתברויות וחישובי כדאיות.",
    "section.probability.info.shows": "תרחישים מובנים עם שאלות שלב-אחר-שלב.",
    "section.probability.info.teaches": "איך לחשב סיכויים, אאוטס ו-Pot Odds בצורה מעשית.",
    "section.probability.info.why": "כי פוקר הוא גם מתמטיקה — ומי שמבין אותה מנצח.",

    // Arena
    "arena.title": "🎰 זירת המשחק: בחר את הסביבה שלך",
    "arena.free.title": "תרגול חופשי",
    "arena.free.desc": "נגד בוט, בלי לחץ",
    "arena.multi.title": "משחק לשניים",
    "arena.multi.desc": "בזמן אמת — חי!",
    "arena.bot.title": "קרב בוטים",
    "arena.bot.desc": "תוקפן vs שמרן",

    // Info modal
    "info.what": "מה זה?",
    "info.shows": "מה מראה?",
    "info.teaches": "מה בא ללמד?",
    "info.why": "למה הוא קיים?",

    // Placeholder
    "placeholder.back": "חזרה לתפריט",
    "placeholder.soon": "בקרוב...",
    "placeholder.free.title": "תרגול חופשי",
    "placeholder.free.desc": "משחק מול בוט בלי לחץ",
    "placeholder.multi.title": "משחק לשניים",
    "placeholder.multi.desc": "משחק חי מול חבר",
    "placeholder.bot.title": "קרב בוטים",
    "placeholder.bot.desc": "תוקפן נגד שמרן — מי ינצח?",

    // Not Found
    "notfound.title": "404",
    "notfound.text": "אופס! הדף לא נמצא",
    "notfound.link": "חזרה לדף הבית",

    // Theory Learning
    "theory.title": "תיאוריה ולמידה",
    "theory.intro": "הבסיס לכל שחקן פוקר טוב. למדו את החוקים, הכירו את הידיים, ודברו את השפה.",
    "theory.lessons.title": "שיעורים",
    "theory.lessons.desc": "4 שיעורים מדורגים ללימוד יסודות הפוקר — מהחוקים הבסיסיים ועד אסטרטגיה.",
    "theory.lessons.subtitle": "מתחיל → מתקדם",
    "theory.rankings.title": "דירוג ידיים",
    "theory.rankings.desc": "כל 9 הקומבינציות מהחזק לחלש — עם דוגמאות ויזואליות.",
    "theory.rankings.subtitle": "Royal Flush → High Card",
    "theory.glossary.title": "מילון מונחים",
    "theory.glossary.desc": "כל המושגים שצריך לדעת — בעברית פשוטה עם הסבר באנגלית.",
    "theory.glossary.subtitle": "20+ מונחים",

    // Guided Game
    "guided.title": "משחק מודרך",
    "guided.report.title": "דו״ח אנליסט",
    "guided.welcome": "ברוכים הבאים! בחר פעולה לשלב הפרה-פלופ.",
    "guided.chose": "בחרת:",
    "guided.bot.did": "הבוט עשה",
    "guided.bot.your.turn": "תורך!",
    "guided.showdown": "שואדאון! חשיפת הקלפים...",
    "guided.phase.action": "— בחר פעולה.",
    "guided.new.game": "משחק חדש! בחר פעולה לשלב הפרה-פלופ.",
    "guided.bot.label": "🤖 בוט",
    "guided.bot.chips": "צ'יפס:",
    "guided.bot.thinking": "חושב...",
    "guided.community": "קלפים קהילתיים",
    "guided.community.hidden": "טרם נחשפו",
    "guided.your.hand": "🃏 היד שלך",
    "guided.outs.title": "🔢 אאוטס ופוט אודס",
    "guided.pot.label": "פוט:",
    "guided.call.label": "קול:",
    "guided.free.check": "צ׳ק חינמי",
    "guided.outs.label": "אאוטס",
    "guided.total.label": "סה״כ:",
    "guided.improve.label": "שיפור:",
    "guided.free.check.always": "✅ צ׳ק חינמי — תמיד נכון להמשיך!",
    "guided.outs.free": "אאוטס ({pct}% לשפר) — ללא עלות",
    "guided.no.draws": "אין דרואו ברורים בשלב זה.",
    "guided.hint.btn": "💡 רמז — הצג משתנים להחלטה",

    // Visual Quiz
    "quiz.title": "מי מנצח?",
    "quiz.streak": "🔥 רצף",
    "quiz.community": "קלפים קהילתיים",
    "quiz.player.a": "שחקן א׳",
    "quiz.player.b": "שחקן ב׳",
    "quiz.tie": "🤝 תיקו",
    "quiz.next": "שאלה הבאה ←",
    "quiz.correct.1": "מצוין! העין שלך מתחדדת 🎯",
    "quiz.correct.2": "נכון! אתה כבר מזהה כמו מקצוען 💪",
    "quiz.correct.3": "בול! המשך ככה 🔥",
    "quiz.wrong.answer": "התשובה הנכונה:",
    "quiz.wrong.player.a": "שחקן א׳",
    "quiz.wrong.player.b": "שחקן ב׳",
    "quiz.wrong.tie": "תיקו",
    "quiz.beats": "מנצח",
    "quiz.both.equal": "שתי הידיים שוות!",

    // Probability
    "prob.title": "הסתברות פוקר",
    "prob.community": "קלפים קהילתיים",
    "prob.your.hand": "היד שלך",
    "prob.pot": "פוט",
    "prob.opponent.bet": "הימור היריב",
    "prob.step1": "שלב 1: כמה אאוטס?",
    "prob.step1.placeholder": "מספר אאוטס",
    "prob.step2": "שלב 2: כלל ה-4 — כמה אחוז?",
    "prob.step2.placeholder": "אחוז סיכוי",
    "prob.step3": "שלב 3: Pot Odds — כמה אחוז?",
    "prob.step3.placeholder": "Pot Odds %",
    "prob.step4": "שלב 4: מה ההחלטה?",
    "prob.check": "בדוק",
    "prob.call": "✅ קול",
    "prob.fold": "❌ פולד",
    "prob.next": "תרחיש הבא ←",
    "prob.correct.outs": "נכון! {n} אאוטס 🎯",
    "prob.wrong.outs": "לא בדיוק. התשובה: {n} אאוטס.",
    "prob.correct.rule": "מצוין! {n}% ({outs}×4) 💪",
    "prob.wrong.rule": "כלל ה-4: {outs} × 4 = {n}%",
    "prob.correct.potodds": "נכון! Pot Odds ≈ {n}% ✅",
    "prob.wrong.potodds": "Pot Odds = {bet}/({pot}+{bet}) ≈ {n}%",
    "prob.correct.decision": "החלטה נכונה! 🏆",
    "prob.wrong.decision.call": "לא בדיוק. קול רווחי כאן.",
    "prob.wrong.decision.fold": "לא בדיוק. פולד עדיף כאן.",

    // Hand Rankings
    "rankings.title": "דירוג ידיים",
    "rankings.intro": "מהחזקה ביותר לחלשה — עם דוגמאות והסתברות",
    "rankings.rarity": "סיכוי:",

    // Glossary
    "glossary.title": "מילון מונחים",
    "glossary.search": "חיפוש מונח...",
    "glossary.empty": "לא נמצאו תוצאות",
    "glossary.count": "{n} מונחים",

    // Lesson Page
    "lesson.of": "שיעור {n} מתוך {total}",
    "lesson.not.found": "שיעור לא נמצא",
    "lesson.back": "חזרה לתיאוריה",
    "lesson.example": "דוגמה",

    // Coach
    "coach.label": "טיפ מהמאמן",
    "coach.open": "לחצו לפתיחה",

    // Analyst Report
    "report.title": "📊 דו״ח אנליסט",
    "report.win": "🏆 ניצחון!",
    "report.loss": "😞 הפסד",
    "report.tie": "🤝 תיקו",
    "report.winning.hand": "יד מנצחת: {name}. פוט סופי: {pot} צ'יפס.",
    "report.cards": "הקלפים",
    "report.yours": "שלך",
    "report.bot": "בוט",
    "report.actions.title": "🎯 מה עשית",
    "report.analyst.title": "🧠 מה האנליסט היה עושה",
    "report.outs.title": "🔢 אאוטס ופוט אודס — ניתוח לפי שלב",
    "report.pot.label": "פוט:",
    "report.call.cost": "עלות קול:",
    "report.potodds.label": "פוט אודס (עלות/פוט+עלות):",
    "report.potodds.free": "צ׳ק חינמי ✅",
    "report.cards.remaining": "קלפים שנותרו בחפיסה:",
    "report.total.outs": "סה״כ אאוטס:",
    "report.improve.next": "סיכוי שיפור (קלף הבא):",
    "report.improve.river": "סיכוי שיפור (עד ריבר):",
    "report.improve.to.river": "שיפור עד ריבר:",
    "report.improve.label": "שיפור:",
    "report.no.draws": "אין דרואו ברורים בשלב זה.",
    "report.free.check": "✅ צ׳ק חינמי — תמיד נכון להמשיך",
    "report.calc": "חישוב:",
    "report.example.yours": "דוגמה עם המספרים שלך:",
    "report.call.profitable": "קול רווחי",
    "report.call.unprofitable": "קול לא רווחי",
    "report.equity.title": "📈 אקוויטי סופי",
    "report.equity.yours": "אקוויטי שלך:",
    "report.new.game": "🃏 משחק חדש",

    // Hint Panel
    "hint.title": "💡 רמז —",
    "hint.pot.label": "פוט (Pot)",
    "hint.tocall.label": "עלות קול (To Call)",
    "hint.tocall.free": "חינמי ✅",
    "hint.potodds.label": "פוט אודס (Pot Odds)",
    "hint.potodds.free": "0% (חינמי)",
    "hint.outs.label": "אאוטס (Outs)",
    "hint.improve.label": "סיכוי שיפור (%)",
    "hint.equity.label": "אקוויטי (Equity)",
    "hint.compare.title": "📊 השוואת פעולות",
    "hint.var": "משתנה",
    "hint.check": "צ׳ק",
    "hint.call": "קול",
    "hint.raise": "רייז",
    "hint.fold": "פולד",
    "hint.cost": "💰 עלות",
    "hint.pot.after": "🏦 פוט אחרי",
    "hint.risk": "⚠️ סיכון",
    "hint.risk.zero": "אפס",
    "hint.risk.low": "נמוך",
    "hint.risk.medium": "בינוני",
    "hint.risk.high": "גבוה",
    "hint.detail.check": "פירוט צ׳ק",
    "hint.detail.call": "פירוט קול",
    "hint.detail.raise": "פירוט רייז",
    "hint.detail.fold": "פירוט פולד",
    "hint.recommend": "המלצת פעולה",

    // Poker terms
    "phase.preflop": "פרה-פלופ",
    "phase.flop": "פלופ",
    "phase.turn": "טרן",
    "phase.river": "ריבר",
    "phase.showdown": "שואדאון",
    "phase.finished": "סיום",
    "action.fold": "פולד",
    "action.check": "צ'ק",
    "action.call": "קול",
    "action.raise": "רייז",
    "action.all-in": "אול-אין",

    // Hand names
    "hand.royal_flush": "רויאל פלאש",
    "hand.straight_flush": "סטרייט פלאש",
    "hand.four_of_a_kind": "קארה",
    "hand.full_house": "פול האוס",
    "hand.flush": "פלאש",
    "hand.straight": "סטרייט",
    "hand.three_of_a_kind": "שלישייה",
    "hand.two_pair": "שני זוגות",
    "hand.pair": "זוג",
    "hand.high_card": "קלף גבוה",

    // Draw names
    "draw.flush": "פלאש דרו",
    "draw.oesd": "אופן-אנדד סטרייט דרו",
    "draw.gutshot": "גאטשוט סטרייט דרו",
    "draw.overcards": "זוג (אוברקארדס)",
    "draw.set": "שלישייה (סט)",

    // Probability scenarios
    "scenario.flush": "פלאש דרו",
    "scenario.oesd": "סטרייט דרו פתוח (OESD)",
    "scenario.gutshot": "גאטשוט (Gutshot)",
    "scenario.overcards": "אוברקארדס (Overcards)",

    // Bot Battle
    "bot.title": "קרב בוטים",
    "bot.setup.desc": "בחר את רמת האגרסיביות של הבוט לפני תחילת המשחק.",
    "bot.aggression.label": "רמת אגרסיביות הבוט",
    "bot.aggression.info": "איך הבוט ישחק?",
    "bot.style.passive": "כמעט לא מרים, מעדיף צ׳ק/קול. קל לבלוף.",
    "bot.style.balanced": "מערבב רייזים וקולים. משחק סטנדרטי.",
    "bot.style.aggressive": "מרים הרבה, בלופים תכופים. לחץ גבוה!",
    "bot.start": "⚔️ התחל קרב",
    "bot.welcome": "קרב בוטים! בחר פעולה.",
    "bot.new.hand": "יד חדשה! בחר פעולה.",
    "bot.next.hand": "יד הבאה ⚔️",
    "bot.change.level": "שנה רמה",
    "bot.hands": "ידיים",
    "bot.wins": "נצחונות",
  },
};

// Map hand rank number to translation key
export const handRankToKey: Record<number, string> = {
  10: "hand.royal_flush",
  9: "hand.straight_flush",
  8: "hand.four_of_a_kind",
  7: "hand.full_house",
  6: "hand.flush",
  5: "hand.straight",
  4: "hand.three_of_a_kind",
  3: "hand.two_pair",
  2: "hand.pair",
  1: "hand.high_card",
};

function getUrlLang(): Language | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const l = params.get("lang");
    if (l === "he" || l === "en") return l;
  } catch { /* ignore */ }
  return null;
}

function getInitialLang(): Language {
  const urlLang = getUrlLang();
  if (urlLang) return urlLang;
  try {
    const saved = localStorage.getItem("app-lang");
    if (saved === "he" || saved === "en") return saved;
  } catch { /* ignore */ }
  return "en";
}

// Set document attributes synchronously before first render
const initialLang = getInitialLang();
document.documentElement.lang = initialLang;
document.documentElement.dir = initialLang === "he" ? "rtl" : "ltr";

function syncLangToUrl(l: Language) {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", l);
    window.history.replaceState(null, "", url.toString());
  } catch { /* ignore */ }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(initialLang);

  const setLang = (l: Language) => {
    setLangState(l);
    try { localStorage.setItem("app-lang", l); } catch { /* ignore */ }
    syncLangToUrl(l);
  };

  const dir = lang === "he" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    syncLangToUrl(lang);
  }, [lang, dir]);

  // Sync lang state when user navigates back/forward
  useEffect(() => {
    const onPopState = () => {
      const urlLang = getUrlLang();
      if (urlLang && urlLang !== lang) {
        setLang(urlLang);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [lang]);

  const t = (key: string): string => {
    return translations[lang][key] ?? translations["en"][key] ?? key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
