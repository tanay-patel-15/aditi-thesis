-- Events & workshops table
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null check (category in ('workshop', 'music', 'flea-market', 'art', 'craft', 'cultural', 'food')),
  date date not null,
  time text not null,
  location text not null,
  organizer text,
  image_url text,
  is_recurring boolean default false,
  recurrence_label text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.events enable row level security;

-- Public read access
create policy "Anyone can view events"
  on public.events for select
  to anon, authenticated
  using (true);

-- Seed sample events
insert into public.events (title, description, category, date, time, location, organizer, is_recurring, recurrence_label) values
  ('Wooden Carving Workshop', 'Learn traditional pol house wood carving techniques from master craftsmen. Materials provided.', 'craft', '2026-04-05', '10:00 AM - 1:00 PM', 'Khanderao Pol', 'Pol Heritage Trust', false, null),
  ('Dharmik Lal Pandya Music Evening', 'Classical music performance featuring tabla and harmonium by students of Dharmik Lal Pandya Music Class.', 'music', '2026-04-12', '6:30 PM - 8:30 PM', 'Raopura Pol Courtyard', 'Dharmik Lal Pandya Music Class', true, 'Monthly'),
  ('Pol Heritage Flea Market', 'Local crafts, handmade textiles, traditional snacks & street food from pol families.', 'flea-market', '2026-04-06', '9:00 AM - 2:00 PM', 'Mangalwada Pol', 'Pol Experience', true, 'Every Sunday'),
  ('Miniature Painting Workshop', 'Introduction to traditional Baroda-style miniature painting. All skill levels welcome.', 'art', '2026-04-10', '3:00 PM - 6:00 PM', 'Navi Pol Community Hall', null, false, null),
  ('Traditional Gujarati Cooking Class', 'Learn to cook authentic pol-style undhiyu, handvo & chai from local families.', 'food', '2026-04-08', '11:00 AM - 2:00 PM', 'Khanderao Pol Kitchen', 'Pol Experience', true, 'Weekly'),
  ('Block Printing on Fabric', 'Hands-on workshop on traditional block printing techniques using natural dyes.', 'craft', '2026-04-15', '10:00 AM - 1:00 PM', 'Raopura Pol', 'Heritage Crafts Collective', false, null),
  ('Heritage Photography Walk', 'Guided photo walk through the pols — learn to capture architectural details and street life.', 'cultural', '2026-04-13', '7:00 AM - 10:00 AM', 'Mandvi Gate', 'Pol Experience', true, 'Monthly'),
  ('Garba & Folk Dance Evening', 'Community garba night celebrating traditional dance forms of Gujarat.', 'cultural', '2026-04-19', '7:00 PM - 10:00 PM', 'Mangalwada Pol Chowk', null, false, null);