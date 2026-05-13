import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useI18n } from '@/lib/i18n';
import type { GameState } from '@/lib/pokerEngine';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AiCoachChatProps {
  game: GameState;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/poker-coach`;

const AiCoachChat = ({ game }: AiCoachChatProps) => {
  const { t, lang } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const gameContext = {
    phase: game.phase,
    playerHand: game.playerHand.map(c => `${c.rank}${c.suit}`).join(', '),
    communityCards: game.communityCards.map(c => `${c.rank}${c.suit}`).join(', ') || t('coach.chat.empty.community'),
    pot: game.pot,
    playerChips: game.playerChips,
    botChips: game.botChips,
    language: lang,
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    let assistantSoFar = '';

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newMessages, gameContext }),
      });

      if (!resp.ok || !resp.body) {
        throw new Error('Failed');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: 'assistant', content: assistantSoFar }];
              });
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: t('coach.chat.error') }]);
    }
    setIsLoading(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 left-3 z-50 bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all animate-in fade-in"
        title={t('coach.chat.tooltip')}
      >
        <MessageCircle size={22} />
      </button>
    );
  }

  return (
    <div className="fixed inset-x-2 bottom-16 top-14 z-50 bg-card border border-border rounded-xl shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎓</span>
          <span className="text-sm font-heading font-bold text-primary">{t('coach.chat.title')}</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-xs mt-8 space-y-2">
            <p>{t('coach.chat.greet1')}</p>
            <p>{t('coach.chat.greet2')}</p>
            <p className="text-[10px]">{t('coach.chat.greet3')}</p>
            <div className="flex flex-wrap gap-1.5 justify-center mt-3">
              {[t('coach.chat.suggest1'), t('coach.chat.suggest2'), t('coach.chat.suggest3')].map(q => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
                  className="text-[10px] bg-secondary/60 text-foreground px-2.5 py-1 rounded-full hover:bg-secondary transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-br-sm'
                : 'bg-secondary/60 text-foreground rounded-bl-sm'
            }`}>
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm prose-invert max-w-none [&_p]:m-0 [&_ul]:m-0 [&_li]:m-0 text-xs">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : msg.content}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div className="bg-secondary/60 rounded-xl px-3 py-2">
              <Loader2 size={14} className="animate-spin text-primary" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-2 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder={t('coach.chat.placeholder')}
          className="flex-1 bg-secondary/40 rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50"
          dir={lang === 'he' ? 'rtl' : 'ltr'}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="bg-primary text-primary-foreground rounded-lg px-3 py-2 disabled:opacity-50 hover:bg-primary/90 transition-colors"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};

export default AiCoachChat;
