import { WordItem } from '@guess-the-11/shared';

export const WORD_DATABASE: WordItem[] = [
  // Animals
  { id: 'a1', word: 'Lion', category: 'Animals', difficulty: 'easy', hint: 'King of the jungle' },
  { id: 'a2', word: 'Elephant', category: 'Animals', difficulty: 'easy', hint: 'Large mammal with a trunk' },
  { id: 'a3', word: 'Penguin', category: 'Animals', difficulty: 'easy', hint: 'Flightless bird in tuxedos' },
  { id: 'a4', word: 'Giraffe', category: 'Animals', difficulty: 'easy', hint: 'Very tall animal with long neck' },
  { id: 'a5', word: 'Kangaroo', category: 'Animals', difficulty: 'medium', hint: 'Australian marsupial that hops' },
  { id: 'a6', word: 'Chameleon', category: 'Animals', difficulty: 'medium', hint: 'Changes skin color' },
  { id: 'a7', word: 'Platypus', category: 'Animals', difficulty: 'hard', hint: 'Egg-laying mammal with duck bill' },
  { id: 'a8', word: 'Dolphin', category: 'Animals', difficulty: 'easy', hint: 'Intelligent sea mammal' },
  { id: 'a9', word: 'Octopus', category: 'Animals', difficulty: 'medium', hint: 'Eight tentacled sea creature' },
  { id: 'a10', word: 'Cheetah', category: 'Animals', difficulty: 'medium', hint: 'Fastest land animal' },
  { id: 'a11', word: 'Hedgehog', category: 'Animals', difficulty: 'medium', hint: 'Spiky small mammal' },
  { id: 'a12', word: 'Komodo Dragon', category: 'Animals', difficulty: 'hard', hint: 'Largest living lizard' },

  // Food
  { id: 'f1', word: 'Pizza', category: 'Food', difficulty: 'easy', hint: 'Cheesy Italian dish with slices' },
  { id: 'f2', word: 'Burger', category: 'Food', difficulty: 'easy', hint: 'Patty between buns' },
  { id: 'f3', word: 'Sushi', category: 'Food', difficulty: 'medium', hint: 'Japanese rolled rice with seafood' },
  { id: 'f4', word: 'Tacos', category: 'Food', difficulty: 'easy', hint: 'Folded Mexican tortilla' },
  { id: 'f5', word: 'Ice Cream', category: 'Food', difficulty: 'easy', hint: 'Sweet frozen dessert' },
  { id: 'f6', word: 'Spaghetti', category: 'Food', difficulty: 'easy', hint: 'Long Italian pasta strings' },
  { id: 'f7', word: 'Croissant', category: 'Food', difficulty: 'medium', hint: 'Crescent-shaped flaky pastry' },
  { id: 'f8', word: 'Ramen', category: 'Food', difficulty: 'medium', hint: 'Japanese noodle broth soup' },
  { id: 'f9', word: 'Pancake', category: 'Food', difficulty: 'easy', hint: 'Flat round breakfast cake with syrup' },
  { id: 'f10', word: 'Donut', category: 'Food', difficulty: 'easy', hint: 'Fried dough ring with frosting' },
  { id: 'f11', word: 'Guacamole', category: 'Food', difficulty: 'hard', hint: 'Avocado-based dip' },

  // Sports
  { id: 's1', word: 'Football', category: 'Sports', difficulty: 'easy', hint: 'The beautiful game played with feet' },
  { id: 's2', word: 'Basketball', category: 'Sports', difficulty: 'easy', hint: 'Throwing balls into hoops' },
  { id: 's3', word: 'Tennis', category: 'Sports', difficulty: 'easy', hint: 'Racket sport on a court with a net' },
  { id: 's4', word: 'Cricket', category: 'Sports', difficulty: 'medium', hint: 'Bat and ball game with wickets' },
  { id: 's5', word: 'Volleyball', category: 'Sports', difficulty: 'medium', hint: 'Spiking ball over a high net' },
  { id: 's6', word: 'Baseball', category: 'Sports', difficulty: 'medium', hint: 'Bases, gloves and home runs' },
  { id: 's7', word: 'Golf', category: 'Sports', difficulty: 'easy', hint: 'Hitting tiny balls into 18 holes' },
  { id: 's8', word: 'Archery', category: 'Sports', difficulty: 'medium', hint: 'Bow and arrows targeting bullseye' },
  { id: 's9', word: 'Boxing', category: 'Sports', difficulty: 'easy', hint: 'Gloves fighting in a ring' },
  { id: 's10', word: 'Skateboarding', category: 'Sports', difficulty: 'medium', hint: 'Deck on four wheels doing kickflips' },
  { id: 's11', word: 'Badminton', category: 'Sports', difficulty: 'medium', hint: 'Hitting a feathered shuttlecock' },

  // Movies
  { id: 'm1', word: 'Titanic', category: 'Movies', difficulty: 'easy', hint: 'Sinking ship romance movie' },
  { id: 'm2', word: 'Avatar', category: 'Movies', difficulty: 'easy', hint: 'Blue aliens on planet Pandora' },
  { id: 'm3', word: 'Spider-Man', category: 'Movies', difficulty: 'easy', hint: 'Hero bitten by radioactive arachnid' },
  { id: 'm4', word: 'Star Wars', category: 'Movies', difficulty: 'easy', hint: 'Lightsabers and Jedi knights in space' },
  { id: 'm5', word: 'The Matrix', category: 'Movies', difficulty: 'medium', hint: 'Red pill or blue pill simulation' },
  { id: 'm6', word: 'Jurassic Park', category: 'Movies', difficulty: 'medium', hint: 'Dinosaurs running wild in a theme park' },
  { id: 'm7', word: 'Harry Potter', category: 'Movies', difficulty: 'easy', hint: 'Boy wizard with lightning scar' },
  { id: 'm8', word: 'Inception', category: 'Movies', difficulty: 'hard', hint: 'Dream inside a dream spinning top' },
  { id: 'm9', word: 'The Lion King', category: 'Movies', difficulty: 'easy', hint: 'Circle of life in the Pride Lands' },
  { id: 'm10', word: 'Gladiator', category: 'Movies', difficulty: 'medium', hint: 'Roman arena fighter seeking revenge' },

  // Objects
  { id: 'o1', word: 'Guitar', category: 'Objects', difficulty: 'easy', hint: 'Six-stringed acoustic or electric instrument' },
  { id: 'o2', word: 'Camera', category: 'Objects', difficulty: 'easy', hint: 'Device to capture photographs' },
  { id: 'o3', word: 'Telescope', category: 'Objects', difficulty: 'medium', hint: 'Optics to observe distant stars' },
  { id: 'o4', word: 'Clock', category: 'Objects', difficulty: 'easy', hint: 'Hands pointing at time' },
  { id: 'o5', word: 'Umbrella', category: 'Objects', difficulty: 'easy', hint: 'Canopy protecting from rain' },
  { id: 'o6', word: 'Compass', category: 'Objects', difficulty: 'medium', hint: 'Magnetic needle pointing North' },
  { id: 'o7', word: 'Backpack', category: 'Objects', difficulty: 'easy', hint: 'Bag carried on two shoulders' },
  { id: 'o8', word: 'Microscope', category: 'Objects', difficulty: 'medium', hint: 'Device to view microscopic cells' },
  { id: 'o9', word: 'Headphones', category: 'Objects', difficulty: 'easy', hint: 'Speakers worn over ears' },
  { id: 'o10', word: 'Hourglass', category: 'Objects', difficulty: 'medium', hint: 'Sand trickling through narrow neck' },

  // Places
  { id: 'p1', word: 'Eiffel Tower', category: 'Places', difficulty: 'easy', hint: 'Iron lattice tower in Paris' },
  { id: 'p2', word: 'Pyramids', category: 'Places', difficulty: 'easy', hint: 'Ancient triangular tombs of Egypt' },
  { id: 'p3', word: 'Statue of Liberty', category: 'Places', difficulty: 'easy', hint: 'Torch-bearing statue in New York harbor' },
  { id: 'p4', word: 'Taj Mahal', category: 'Places', difficulty: 'medium', hint: 'White marble mausoleum in Agra' },
  { id: 'p5', word: 'Colosseum', category: 'Places', difficulty: 'medium', hint: 'Ancient Roman amphitheater' },
  { id: 'p6', word: 'Great Wall', category: 'Places', difficulty: 'easy', hint: 'Massive defensive wall across China' },
  { id: 'p7', word: 'Mount Everest', category: 'Places', difficulty: 'medium', hint: 'Highest mountain peak in the world' },
  { id: 'p8', word: 'Hollywood', category: 'Places', difficulty: 'easy', hint: 'Famous hillside sign in Los Angeles' },
  { id: 'p9', word: 'Stonehenge', category: 'Places', difficulty: 'hard', hint: 'Prehistoric ring of standing stones in England' },

  // Nature
  { id: 'n1', word: 'Volcano', category: 'Nature', difficulty: 'easy', hint: 'Mountain spewing molten lava' },
  { id: 'n2', word: 'Rainbow', category: 'Nature', difficulty: 'easy', hint: 'Colorful arc after sunlight hits rain' },
  { id: 'n3', word: 'Waterfall', category: 'Nature', difficulty: 'easy', hint: 'Water cascading over a cliff' },
  { id: 'n4', word: 'Tornado', category: 'Nature', difficulty: 'medium', hint: 'Violent rotating column of air' },
  { id: 'n5', word: 'Glacier', category: 'Nature', difficulty: 'medium', hint: 'Massive slow-moving body of dense ice' },
  { id: 'n6', word: 'Lightning', category: 'Nature', difficulty: 'easy', hint: 'High-voltage electric discharge from clouds' },
  { id: 'n7', word: 'Coral Reef', category: 'Nature', difficulty: 'medium', hint: 'Underwater ecosystem formed by colonies' },
  { id: 'n8', word: 'Desert', category: 'Nature', difficulty: 'easy', hint: 'Barren area of dry sand dunes' },
  { id: 'n9', word: 'Northern Lights', category: 'Nature', difficulty: 'hard', hint: 'Aurora borealis in polar skies' },

  // Technology
  { id: 't1', word: 'Smartphone', category: 'Technology', difficulty: 'easy', hint: 'Touchscreen mobile computer' },
  { id: 't2', word: 'Rocket', category: 'Technology', difficulty: 'easy', hint: 'Vehicle propelled into outer space' },
  { id: 't3', word: 'Robot', category: 'Technology', difficulty: 'easy', hint: 'Automated mechanical machine' },
  { id: 't4', word: 'Drone', category: 'Technology', difficulty: 'easy', hint: 'Unmanned quadcopter flying device' },
  { id: 't5', word: 'Satellite', category: 'Technology', difficulty: 'medium', hint: 'Spacecraft orbiting the Earth' },
  { id: 't6', word: 'Virtual Reality', category: 'Technology', difficulty: 'medium', hint: 'Headset creating simulated 3D world' },
  { id: 't7', word: 'Laptop', category: 'Technology', difficulty: 'easy', hint: 'Foldable personal computer' },
  { id: 't8', word: 'Solar Panel', category: 'Technology', difficulty: 'medium', hint: 'Converts sunlight directly to electricity' },
  { id: 't9', word: 'Cyberpunk', category: 'Technology', difficulty: 'hard', hint: 'High tech low life aesthetic' },

  // General Knowledge
  { id: 'g1', word: 'Doctor', category: 'General Knowledge', difficulty: 'easy', hint: 'Medical professional with stethoscope' },
  { id: 'g2', word: 'Astronaut', category: 'General Knowledge', difficulty: 'easy', hint: 'Person trained to travel in space' },
  { id: 'g3', word: 'Firefighter', category: 'General Knowledge', difficulty: 'easy', hint: 'Extinguishes fires with hose and helmet' },
  { id: 'g4', word: 'Crown', category: 'General Knowledge', difficulty: 'easy', hint: 'Ornamental headdress worn by a monarch' },
  { id: 'g5', word: 'Treasure Chest', category: 'General Knowledge', difficulty: 'medium', hint: 'Locked box filled with gold coins' },
  { id: 'g6', word: 'Magic Wand', category: 'General Knowledge', difficulty: 'easy', hint: 'Stick used by magicians to cast spells' },
  { id: 'g7', word: 'Lighthouse', category: 'General Knowledge', difficulty: 'medium', hint: 'Tower projecting beam of light for ships' },
  { id: 'g8', word: 'Hot Air Balloon', category: 'General Knowledge', difficulty: 'medium', hint: 'Large gas bag carrying basket in the sky' }
];

export function getRandomWord(category?: string, difficulty?: string, usedWords: string[] = []): WordItem {
  let pool = WORD_DATABASE.filter(w => !usedWords.includes(w.word.toLowerCase()));

  if (pool.length === 0) {
    // If all words were used, reset pool
    pool = [...WORD_DATABASE];
  }

  if (category && category !== 'all') {
    const categoryFiltered = pool.filter(w => w.category.toLowerCase() === category.toLowerCase());
    if (categoryFiltered.length > 0) {
      pool = categoryFiltered;
    }
  }

  if (difficulty && difficulty !== 'all') {
    const diffFiltered = pool.filter(w => w.difficulty.toLowerCase() === difficulty.toLowerCase());
    if (diffFiltered.length > 0) {
      pool = diffFiltered;
    }
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

export function generateWordHint(word: string): string {
  // Replace alphanumeric characters with underscores, preserving spaces and hyphens
  return word.split('').map(char => {
    if (char === ' ') return '  ';
    if (char === '-') return '-';
    return '_';
  }).join(' ');
}
