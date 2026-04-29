CREATE TABLE public.walk_routes (
  route_key TEXT PRIMARY KEY,
  stops JSONB NOT NULL,
  segment_waypoints JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by TEXT
);

ALTER TABLE public.walk_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view walk routes"
ON public.walk_routes
FOR SELECT
TO anon, authenticated
USING (true);

INSERT INTO public.walk_routes (route_key, stops, segment_waypoints)
VALUES (
  'heritage_walk',
  $$[
    {
      "number": 1,
      "name": "LVP Gate",
      "subtitle": "Laxmi Vilas Palace Gate, Rajmahal Road",
      "lat": 22.293943,
      "lng": 73.194471,
      "description": "The grand gateway to Laxmi Vilas Palace — the Gaekwad royal residence and one of the largest private dwellings built. The walk begins here where palace architecture meets the old-city artery."
    },
    {
      "number": 2,
      "name": "Kirti Stambh",
      "subtitle": "Kirti Stambh Circle, Palace Road",
      "lat": 22.295754,
      "lng": 73.197524,
      "description": "A memorial column on Palace Road commemorating Vadodara's princely legacy. Pause here to take in the colonial-era civic planning that frames the approach into the old city."
    },
    {
      "number": 3,
      "name": "Khanderao Statue",
      "subtitle": "Khanderao Market Building, Kevdabaug",
      "lat": 22.296196,
      "lng": 73.201237,
      "description": "A statue of Maharaja Khanderao Gaekwad outside the Indo-Saracenic Khanderao Market — a late 19th-century civic landmark that still anchors the market precinct."
    },
    {
      "number": 4,
      "name": "Bhagat Singh Statue",
      "subtitle": "Old Nyay Mandir, Mandvi (Bajwada)",
      "lat": 22.303734,
      "lng": 73.205420,
      "description": "Standing in front of the Old Nyay Mandir in Mandvi, this statue of Shaheed Bhagat Singh marks the political heart of the old city, amid the dense Bajwada bazaar."
    },
    {
      "number": 5,
      "name": "Sursagar Statue",
      "subtitle": "Sursagar Lake",
      "lat": 22.300821,
      "lng": 73.203916,
      "description": "The towering Shiva statue rising from the middle of Sursagar Lake — a signature image of Vadodara and a natural resting point along the walk."
    },
    {
      "number": 6,
      "name": "Gandhi Statue",
      "subtitle": "Jubilee Baugh",
      "lat": 22.303055,
      "lng": 73.204715,
      "description": "A bronze of Mahatma Gandhi in Jubilee Baugh, the public garden laid out during Sayajirao III's reign — a green breathing space inside the walled city."
    },
    {
      "number": 7,
      "name": "Buddha Statue",
      "subtitle": "Mahatma Gandhi Nagar Gruh, Jubilee Baugh",
      "lat": 22.302485,
      "lng": 73.205135,
      "description": "A seated Buddha outside the Mahatma Gandhi Nagar Gruh town hall — the civic auditorium that hosts the city's political and cultural gatherings."
    },
    {
      "number": 8,
      "name": "Gazra Cafe",
      "subtitle": "Chimnabai Stree Udyogalaya (End Point)",
      "lat": 22.301854,
      "lng": 73.203423,
      "description": "The walk ends at Gazra Cafe, run out of the historic Chimnabai Stree Udyogalaya — a women's vocational institute founded by Maharani Chimnabai II. A fitting place to rest, reflect, and eat."
    }
  ]$$::jsonb,
  $${
    "1-2": [],
    "2-3": [],
    "3-4": [],
    "4-5": [],
    "5-6": [],
    "6-7": [],
    "7-8": []
  }$$::jsonb
)
ON CONFLICT (route_key) DO NOTHING;
