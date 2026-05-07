
-- Game rooms table for multiplayer poker
CREATE TABLE public.game_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT NOT NULL UNIQUE,
  stage TEXT NOT NULL DEFAULT 'waiting',
  pot INTEGER NOT NULL DEFAULT 40,
  community TEXT[] NOT NULL DEFAULT '{}',
  revealed INTEGER NOT NULL DEFAULT 0,
  current_turn TEXT NOT NULL DEFAULT 'p1',
  p1_hand TEXT[] NOT NULL DEFAULT '{}',
  p2_hand TEXT[] NOT NULL DEFAULT '{}',
  p1_chips INTEGER NOT NULL DEFAULT 1000,
  p2_chips INTEGER NOT NULL DEFAULT 1000,
  p1_bet INTEGER NOT NULL DEFAULT 20,
  p2_bet INTEGER NOT NULL DEFAULT 20,
  p1_action TEXT,
  p2_action TEXT,
  p1_joined BOOLEAN NOT NULL DEFAULT false,
  p2_joined BOOLEAN NOT NULL DEFAULT false,
  result TEXT,
  p1_eval TEXT,
  p2_eval TEXT,
  deck TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Allow anonymous access (no auth required for casual play)
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read game rooms" ON public.game_rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can create game rooms" ON public.game_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update game rooms" ON public.game_rooms FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete game rooms" ON public.game_rooms FOR DELETE USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_rooms;
