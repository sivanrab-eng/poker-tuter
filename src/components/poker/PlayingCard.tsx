import { Card, isRedSuit, cardToString } from '@/lib/pokerEngine';

interface PlayingCardProps {
  card: Card;
  hidden?: boolean;
  small?: boolean;
}

const PlayingCard = ({ card, hidden = false, small = false }: PlayingCardProps) => {
  if (hidden) {
    return (
      <div className={`${small ? 'w-10 h-14' : 'w-14 h-20'} rounded-lg bg-gradient-to-br from-primary/40 to-primary/20 gold-border flex items-center justify-center`}>
        <span className="text-primary text-lg">🂠</span>
      </div>
    );
  }

  const red = isRedSuit(card.suit);
  
  return (
    <div className={`${small ? 'w-10 h-14 text-xs' : 'w-14 h-20 text-sm'} rounded-lg bg-foreground flex flex-col items-center justify-center gap-0.5 shadow-lg border border-primary/30`}>
      <span className={`font-bold ${red ? 'text-red-600' : 'text-gray-900'}`}>
        {card.rank}
      </span>
      <span className={`${small ? 'text-base' : 'text-lg'} ${red ? 'text-red-600' : 'text-gray-900'}`}>
        {card.suit}
      </span>
    </div>
  );
};

export default PlayingCard;
