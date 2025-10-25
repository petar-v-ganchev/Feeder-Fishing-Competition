import type { GameItem, Loadout } from './types';

export const MOCK_RODS = ['Basic Feeder Rod', 'Pro Carbon Rod', 'River Master 3000'];
export const MOCK_BAITS = ['Maggots', 'Worms', 'Sweetcorn', 'Bread Flake'];
export const MOCK_GROUNDBAITS = ['Fishmeal Mix', 'Sweet Crumb', 'Spicy Feeder Mix'];
export const MOCK_HOOK_SIZES = ['18', '16', '14', '12'];
export const MOCK_FEEDER_TYPES = ['Cage Feeder', 'Method Feeder', 'Pellet Feeder'];
export const MOCK_FEEDER_TIPS = ['1oz (Light)', '2oz (Medium)', '3oz (Heavy)'];
export const MOCK_CASTING_DISTANCES = ['Short (20m)', 'Medium (40m)', 'Long (60m)'];
export const MOCK_CASTING_INTERVALS = ['Frequent (2 mins)', 'Regular (5 mins)', 'Patient (10 mins)'];

export const MOCK_FISH_SPECIES = [
    { name: 'Roach', minWeight: 0.1, maxWeight: 0.8 },
    { name: 'Bream', minWeight: 0.5, maxWeight: 4.0 },
    { name: 'Carp', minWeight: 1.0, maxWeight: 10.0 },
    { name: 'Tench', minWeight: 0.8, maxWeight: 3.0 },
    { name: 'Perch', minWeight: 0.2, maxWeight: 1.5 },
];

export const MOCK_COUNTRIES = [
    'Argentina',
    'Australia',
    'Austria',
    'Belgium',
    'Brazil',
    'Bulgaria',
    'Canada',
    'China',
    'Croatia',
    'Cyprus',
    'Czech Republic',
    'Denmark',
    'Egypt',
    'Estonia',
    'Finland',
    'France',
    'Germany',
    'Greece',
    'Hungary',
    'India',
    'Indonesia',
    'Iran',
    'Ireland',
    'Italy',
    'Japan',
    'Latvia',
    'Lithuania',
    'Luxembourg',
    'Malta',
    'Mexico',
    'Netherlands',
    'Nigeria',
    'Pakistan',
    'Philippines',
    'Poland',
    'Portugal',
    'Romania',
    'Russia',
    'Slovakia',
    'Slovenia',
    'South Korea',
    'Spain',
    'Sweden',
    'Switzerland',
    'Turkey',
    'United Kingdom',
    'United States',
];


export const DEFAULT_LOADOUT: Loadout = {
    rod: MOCK_RODS[0],
    bait: MOCK_BAITS[0],
    groundbait: MOCK_GROUNDBAITS[0],
    hookSize: MOCK_HOOK_SIZES[1],
    feederType: MOCK_FEEDER_TYPES[0],
    feederTip: MOCK_FEEDER_TIPS[1],
    castingDistance: MOCK_CASTING_DISTANCES[1],
    castingInterval: MOCK_CASTING_INTERVALS[1],
};

export const MOCK_SHOP_ITEMS: GameItem[] = [
    // Rods
    { id: 'rod_02', name: 'Pro Carbon Rod', type: 'Rod', description: 'A lightweight and sensitive rod for experts.', price: 500 },
    { id: 'rod_03', name: 'River Master 3000', type: 'Rod', description: 'Heavy-duty rod for strong river currents.', price: 800 },

    // Reels
    { id: 'reel_01', name: 'QuickDrag 5000', type: 'Reel', description: 'A reliable reel with a smooth drag system.', price: 450 },
    { id: 'reel_02', name: 'FeederPro 400', type: 'Reel', description: 'Lightweight reel perfect for feeder fishing.', price: 600 },

    // Lines
    { id: 'line_01', name: '8lb Monofilament', type: 'Line', description: 'Standard 8lb breaking strain monofilament line.', price: 80 },
    { id: 'line_02', name: '10lb Braided Line', type: 'Line', description: 'Strong, low-stretch braid for sensitive bite detection.', price: 120 },

    // Hooks
    { id: 'hook_01', name: 'Size 16 Barbless Hooks (x10)', type: 'Hook', description: 'Fine wire hooks for delicate presentation.', price: 30 },
    { id: 'hook_02', name: 'Size 12 Wide Gape Hooks (x10)', type: 'Hook', description: 'Stronger hooks for targeting bigger fish.', price: 40 },
    
    // Feeders
    { id: 'feeder_01', name: 'Cage Feeder - 30g', type: 'Feeder', description: 'A classic cage feeder for various groundbaits.', price: 50 },
    { id: 'feeder_02', name: 'Method Feeder - Large', type: 'Feeder', description: 'Perfect for presenting a compact pile of bait.', price: 65 },

    // Groundbaits
    { id: 'groundbait_04', name: 'Hemp Seed Mix', type: 'Groundbait', description: 'An oily mix that creates an attractive cloud.', price: 75 },
    { id: 'groundbait_05', name: 'Sweet Bream Mix', type: 'Groundbait', description: 'A sweet-smelling groundbait designed for bream.', price: 90 },

    // Bait
    { id: 'bait_04', name: 'Pellets (6mm)', type: 'Bait', description: 'High-protein pellets, irresistible to carp.', price: 50 },
    { id: 'bait_05', name: 'Luncheon Meat', type: 'Bait', description: 'A classic big-fish bait, cubed and ready to use.', price: 60 },

    // Additives
    { id: 'additive_01', name: 'Sweet Molasses', type: 'Additive', description: 'A sticky, sweet additive to bind your groundbait.', price: 45 },
    { id: 'additive_02', name: 'Spicy Attractor Liquid', type: 'Additive', description: 'A potent liquid to boost your mix.', price: 55 },

    // Accessories
    { id: 'acc_01', name: 'Rod Rest Head', type: 'Accessory', description: 'A simple V-shaped rod rest for your bankstick.', price: 100 },
    { id: 'acc_02', name: 'Disgorger', type: 'Accessory', description: 'An essential tool for safely unhooking fish.', price: 25 },
];

export const MOCK_INVENTORY_ITEMS: GameItem[] = [
     { id: 'rod_01', name: 'Basic Feeder Rod', type: 'Rod', description: 'Your trusty starting rod.', price: 0 },
     { id: 'bait_01', name: 'Maggots', type: 'Bait', description: 'A classic bait for all species.', price: 0 },
     { id: 'groundbait_01', name: 'Fishmeal Mix', type: 'Groundbait', description: 'A standard groundbait mix.', price: 0 },
];