import type { GameItem, Loadout } from './types';

export const MOCK_RODS = ['Basic Feeder Rod', 'Pro Rod 330', 'Pro Rod 360', 'Pro Rod 390', 'Distance Master 420', 'Distance Master 450'];
export const MOCK_BAITS = ['Maggots', 'Pinkies', 'Worms', 'Corn', 'Hemp', 'Wafters (6mm)', 'Expander Pellets (8mm)'];
export const MOCK_GROUNDBAITS = ['Roach Mix', 'Bream Mix', 'Fishmeal Mix', 'Sweet Fishmeal Mix', 'Pellets (2mm)'];
export const MOCK_HOOK_SIZES = ['Size 18 Barbless Hooks (x10)', 'Size 16 Barbless Hooks (x10)', 'Size 14 Barbless Hooks (x10)', 'Size 12 Barbless Hooks (x10)'];
export const MOCK_FEEDER_TYPES = ['Cage Feeder - 20g (x5)', 'Window Feeder - 30g (x5)', 'Bullet Feeder - 30g (x5)', 'Flat Method Feeder - 30g (x5)'];
export const MOCK_FEEDER_TIPS = ['0.5oz', '1.0oz', '2.0oz', '3.0oz', '4.0oz', '5.0oz'];
export const MOCK_CASTING_DISTANCES = ['Short (20m)', 'Medium (40m)', 'Long (60m)', 'Extreme (80m)'];
export const MOCK_CASTING_INTERVALS = ['Frequent (2 mins)', 'Regular (5 mins)', 'Patient (10 mins)'];

export const MOCK_FISH_SPECIES = [
    { name: 'Roach', minWeight: 0.1, maxWeight: 0.8 },
    { name: 'Bream', minWeight: 0.5, maxWeight: 4.0 },
    { name: 'Carp', minWeight: 1.0, maxWeight: 10.0 },
    { name: 'Tench', minWeight: 0.8, maxWeight: 3.0 },
    { name: 'Perch', minWeight: 0.2, maxWeight: 1.5 },
];

export const MOCK_COUNTRIES = [
    'Argentina', 'Australia', 'Austria', 'Belgium', 'Brazil', 'Bulgaria', 'Canada', 'China', 'Croatia', 'Cyprus',
    'Czech Republic', 'Denmark', 'Egypt', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'India',
    'Indonesia', 'Iran', 'Ireland', 'Italy', 'Japan', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Mexico',
    'Netherlands', 'Nigeria', 'Pakistan', 'Philippines', 'Poland', 'Portugal', 'Romania', 'Russia', 'Slovakia',
    'Slovenia', 'South Korea', 'Spain', 'Sweden', 'Switzerland', 'Turkey', 'United Kingdom', 'United States',
];

export const DEFAULT_LOADOUT: Loadout = {
    rod: MOCK_RODS[0],
    reel: 'Pro Reel 3500',
    line: '0.22 Monofilament',
    hook: MOCK_HOOK_SIZES[1],
    feeder: MOCK_FEEDER_TYPES[0],
    bait: MOCK_BAITS[0],
    groundbait: MOCK_GROUNDBAITS[0],
    additive: 'Sweet Molasses',
    feederTip: MOCK_FEEDER_TIPS[1],
    castingDistance: MOCK_CASTING_DISTANCES[1],
    castingInterval: MOCK_CASTING_INTERVALS[1],
};

export const MOCK_SHOP_ITEMS: GameItem[] = [
    // Rods
    { id: 'rod_p330', name: 'Pro Rod 330', type: 'Rod', description: 'Versatile short-range feeder rod.', price: 200 },
    { id: 'rod_p360', name: 'Pro Rod 360', type: 'Rod', description: 'The standard choice for medium distance.', price: 250 },
    { id: 'rod_p390', name: 'Pro Rod 390', type: 'Rod', description: 'Powerful rod for larger venues.', price: 300 },
    { id: 'rod_dm420', name: 'Distance Master 420', type: 'Rod', description: 'Engineered for long-range accuracy.', price: 350 },
    { id: 'rod_dm450', name: 'Distance Master 450', type: 'Rod', description: 'The ultimate distance casting tool.', price: 450 },

    // Reels
    { id: 'reel_p3500', name: 'Pro Reel 3500', type: 'Reel', description: 'Smooth, reliable reel for short range.', price: 200 },
    { id: 'reel_p4500', name: 'Pro Reel 4500', type: 'Reel', description: 'Excellent all-rounder with precision drag.', price: 250 },
    { id: 'reel_d5500', name: 'Distance Reel 5500', type: 'Reel', description: 'Big pit reel for effortless retrieving.', price: 300 },
    { id: 'reel_d6500', name: 'Distance Reel 6500', type: 'Reel', description: 'Maximum cranking power for long range.', price: 350 },

    // Lines
    { id: 'line_m22', name: '0.22 Monofilament', type: 'Line', description: 'Reliable mono for general feeder work.', price: 10 },
    { id: 'line_m24', name: '0.24 Monofilament', type: 'Line', description: 'Slightly heavier mono for big fish.', price: 10 },
    { id: 'line_m26', name: '0.26 Monofilament', type: 'Line', description: 'Strong mono for demanding conditions.', price: 10 },
    { id: 'line_b08', name: '0.08 Braided Line', type: 'Line', description: 'Ultra-thin braid for instant bite detection.', price: 20 },
    { id: 'line_b10', name: '0.10 Braided Line', type: 'Line', description: 'Perfect balance of strength and sensitivity.', price: 20 },
    { id: 'line_b12', name: '0.12 Braided Line', type: 'Line', description: 'Heavy-duty braid for snaggy swims.', price: 20 },

    // Hooks
    { id: 'hook_b18', name: 'Size 18 Barbless Hooks (x10)', type: 'Hook', description: 'Small hooks for delicate presentations.', price: 10 },
    { id: 'hook_b16', name: 'Size 16 Barbless Hooks (x10)', type: 'Hook', description: 'Standard hook for roach and skimmers.', price: 10 },
    { id: 'hook_b14', name: 'Size 14 Barbless Hooks (x10)', type: 'Hook', description: 'Strong wire for big bream.', price: 10 },
    { id: 'hook_b12', name: 'Size 12 Barbless Hooks (x10)', type: 'Hook', description: 'The choice for big carp and tench.', price: 10 },
    { id: 'hook_w14', name: 'Size 14 Wide Gape Hooks (x10)', type: 'Hook', description: 'Excellent hooking potential for baits.', price: 10 },
    { id: 'hook_w12', name: 'Size 12 Wide Gape Hooks (x10)', type: 'Hook', description: 'A versatile wide gape for various baits.', price: 10 },
    { id: 'hook_w10', name: 'Size 10 Wide Gape Hooks (x10)', type: 'Hook', description: 'Targeting specimen sized fish.', price: 10 },
    { id: 'hook_w08', name: 'Size 8 Wide Gape Hooks (x10)', type: 'Hook', description: 'Strongest hook in the range.', price: 10 },

    // Feeders
    { id: 'fdr_c20', name: 'Cage Feeder - 20g (x5)', type: 'Feeder', description: 'Standard cage for shallow water.', price: 15 },
    { id: 'fdr_c30', name: 'Cage Feeder - 30g (x5)', type: 'Feeder', description: 'Classic cage for medium depths.', price: 15 },
    { id: 'fdr_c40', name: 'Cage Feeder - 40g (x5)', type: 'Feeder', description: 'Heavy cage for deep lakes.', price: 15 },
    { id: 'fdr_w20', name: 'Window Feeder - 20g (x5)', type: 'Feeder', description: 'Aerodynamic for accurate casting.', price: 20 },
    { id: 'fdr_w30', name: 'Window Feeder - 30g (x5)', type: 'Feeder', description: 'The choice for medium distance windows.', price: 20 },
    { id: 'fdr_w40', name: 'Window Feeder - 40g (x5)', type: 'Feeder', description: 'Stability in windy conditions.', price: 20 },
    { id: 'fdr_b20', name: 'Bullet Feeder - 20g (x5)', type: 'Feeder', description: 'Distance casting specialist.', price: 15 },
    { id: 'fdr_b30', name: 'Bullet Feeder - 30g (x5)', type: 'Feeder', description: 'Precise delivery at medium range.', price: 15 },
    { id: 'fdr_b40', name: 'Bullet Feeder - 40g (x5)', type: 'Feeder', description: 'Extra weight for extreme distance.', price: 15 },
    { id: 'fdr_m20', name: 'Flat Method Feeder - 20g (x5)', type: 'Feeder', description: 'Classic method for commercials.', price: 15 },
    { id: 'fdr_m30', name: 'Flat Method Feeder - 30g (x5)', type: 'Feeder', description: 'Excellent bait presentation.', price: 15 },
    { id: 'fdr_m40', name: 'Flat Method Feeder - 40g (x5)', type: 'Feeder', description: 'Stability on steep lake beds.', price: 15 },
    { id: 'fdr_p20', name: 'Pellet Method Feeder - 20g (x5)', type: 'Feeder', description: 'Specialist for pellet presentations.', price: 15 },
    { id: 'fdr_p30', name: 'Pellet Method Feeder - 30g (x5)', type: 'Feeder', description: 'The standard pellet feeder.', price: 15 },
    { id: 'fdr_p40', name: 'Pellet Method Feeder - 40g (x5)', type: 'Feeder', description: 'Ideal for deeper pellet fishing.', price: 15 },
    { id: 'fdr_d50', name: 'Distance Method Feeder - 50g (x5)', type: 'Feeder', description: 'Method fishing at long range.', price: 15 },
    { id: 'fdr_d60', name: 'Distance Method Feeder - 60g (x5)', type: 'Feeder', description: 'Extra stability at distance.', price: 15 },
    { id: 'fdr_d70', name: 'Distance Method Feeder - 70g (x5)', type: 'Feeder', description: 'The heavy hitter for method work.', price: 15 },

    // Groundbaits
    { id: 'gb_roach', name: 'Roach Mix', type: 'Groundbait', description: 'Active mix with hemp and spice.', price: 10 },
    { id: 'gb_bream', name: 'Bream Mix', type: 'Groundbait', description: 'Sweet, yellow mix bream love.', price: 10 },
    { id: 'gb_carassio', name: 'Carassio Mix', type: 'Groundbait', description: 'Rich, dark mix for carassio.', price: 10 },
    { id: 'gb_fm', name: 'Fishmeal Mix', type: 'Groundbait', description: 'High protein mix for carp.', price: 15 },
    { id: 'gb_sfm', name: 'Sweet Fishmeal Mix', type: 'Groundbait', description: 'Best of both worlds for skimmers.', price: 15 },
    { id: 'gb_p2', name: 'Pellets (2mm)', type: 'Groundbait', description: 'Standard micros for the method.', price: 15 },
    { id: 'gb_p4', name: 'Pellets (4mm)', type: 'Groundbait', description: 'Larger feed for bigger fish.', price: 15 },
    { id: 'gb_p6', name: 'Pellets (6mm)', type: 'Groundbait', description: 'Coarse pellets for loose feed.', price: 15 },
    { id: 'gb_p8', name: 'Pellets (8mm)', type: 'Groundbait', description: 'Maximum impact pellets.', price: 15 },

    // Bait
    { id: 'bt_mag', name: 'Maggots', type: 'Bait', description: 'The classic all-round bait.', price: 5 },
    { id: 'bt_pin', name: 'Pinkies', type: 'Bait', description: 'Perfect for small roach and skimmers.', price: 7 },
    { id: 'bt_wor', name: 'Worms', type: 'Bait', description: 'Highly attractive to all species.', price: 10 },
    { id: 'bt_cor', name: 'Corn', type: 'Bait', description: 'Sweetcorn, a carp and bream favorite.', price: 3 },
    { id: 'bt_hmp', name: 'Hemp', type: 'Bait', description: 'Keeps fish rooting in the swim.', price: 5 },
    { id: 'bt_w4', name: 'Wafters (4mm)', type: 'Bait', description: 'Balanced bait for picky fish.', price: 15 },
    { id: 'bt_w6', name: 'Wafters (6mm)', type: 'Bait', description: 'Standard wafter for the method.', price: 15 },
    { id: 'bt_w8', name: 'Wafters (8mm)', type: 'Bait', description: 'Selective bait for bigger carp.', price: 15 },
    { id: 'bt_w10', name: 'Wafters (10mm)', type: 'Bait', description: 'Maximum visibility bait.', price: 15 },
    { id: 'bt_e8', name: 'Expander Pellets (8mm)', type: 'Bait', description: 'Softened pellets for direct hooking.', price: 20 },
    { id: 'bt_e10', name: 'Expander Pellets (10mm)', type: 'Bait', description: 'Large expanders for big specimens.', price: 20 },

    // Additives
    { id: 'ad_mol', name: 'Sweet Molasses', type: 'Additive', description: 'Natural sweetener and binder.', price: 10 },
    { id: 'ad_scop', name: 'Scopex Attractor Liquid', type: 'Additive', description: 'Classic buttery scent.', price: 15 },
    { id: 'ad_car', name: 'Caramel Attractor Liquid', type: 'Additive', description: 'Sweet scent for silverfish.', price: 15 },
    { id: 'ad_van', name: 'Vanille Attractor Liquid', type: 'Additive', description: 'Traditional vanilla attraction.', price: 15 },
    { id: 'ad_spc', name: 'Spicy Attractor Liquid', type: 'Additive', description: 'Sharp spice for murky water.', price: 15 },
    { id: 'ad_krill', name: 'Krill Attractor Liquid', type: 'Additive', description: 'Powerful marine attraction.', price: 15 },
    { id: 'ad_sqd', name: 'Squid Attractor Liquid', type: 'Additive', description: 'Pungent squid aroma.', price: 15 },
    { id: 'ad_liv', name: 'Liver Attractor Liquid', type: 'Additive', description: 'Rich meaty attraction.', price: 15 },

    // Accessories
    { id: 'acc_knfm', name: 'Keepnet Fine Mesh (3m)', type: 'Accessory', description: 'Soft mesh for fish safety.', price: 50 },
    { id: 'acc_knff', name: 'Keepnet Free Flow (3.5m)', type: 'Accessory', description: 'High flow mesh for rivers.', price: 50 },
    { id: 'acc_kna', name: 'Keepnet Arm', type: 'Accessory', description: 'Securely mount your keepnet.', price: 25 },
    { id: 'acc_ln40', name: 'Landing Net (40cm)', type: 'Accessory', description: 'Ideal for roach and silverfish.', price: 20 },
    { id: 'acc_ln50', name: 'Landing Net (50cm)', type: 'Accessory', description: 'All-round landing net.', price: 25 },
    { id: 'acc_ln60', name: 'Landing Net (60cm)', type: 'Accessory', description: 'Large net for bonus carp.', price: 30 },
    { id: 'acc_lnh3', name: 'Landing Net Handle (3m)', type: 'Accessory', description: 'Carbon handle for quick netting.', price: 100 },
    { id: 'acc_lnh4', name: 'Landing Net Handle (4m)', type: 'Accessory', description: 'Longer reach for high banks.', price: 120 },
    { id: 'acc_lnh5', name: 'Landing Net Handle (5m)', type: 'Accessory', description: 'Maximum reach for match fishing.', price: 140 },
    { id: 'acc_qt05', name: 'Quivertip (0.5oz)', type: 'Accessory', description: 'Sensitive tip for calm days.', price: 30 },
    { id: 'acc_qt10', name: 'Quivertip (1.0oz)', type: 'Accessory', description: 'The standard feeder tip.', price: 30 },
    { id: 'acc_qt20', name: 'Quivertip (2.0oz)', type: 'Accessory', description: 'Strong tip for flow or wind.', price: 30 },
    { id: 'acc_qt30', name: 'Quivertip (3.0oz)', type: 'Accessory', description: 'Heavy tip for river fishing.', price: 30 },
    { id: 'acc_qt40', name: 'Quivertip (4.0oz)', type: 'Accessory', description: 'Extra heavy tip for big flow.', price: 30 },
    { id: 'acc_qt50', name: 'Quivertip (5.0oz)', type: 'Accessory', description: 'Maximum strength tip.', price: 30 },
    { id: 'acc_sts', name: 'Side Tray (Small)', type: 'Accessory', description: 'Keep your bait organized.', price: 70 },
    { id: 'acc_stb', name: 'Side Tray (Big)', type: 'Accessory', description: 'Large surface for all your gear.', price: 100 },
    { id: 'acc_stsa', name: 'Side Tray Support Arm', type: 'Accessory', description: 'Stability for your big tray.', price: 50 },
    { id: 'acc_faf', name: 'Feeder Arm (Front)', type: 'Accessory', description: 'Adjustable front rod support.', price: 100 },
    { id: 'acc_frb', name: 'Feeder Rest (Back)', type: 'Accessory', description: 'Support for the rod butt.', price: 100 },
    { id: 'acc_umb', name: 'Umbrella', type: 'Accessory', description: 'Stay dry and focused.', price: 100 },
    { id: 'acc_uma', name: 'Umbrella Arm', type: 'Accessory', description: 'Attach your brolly to the box.', price: 20 },
    { id: 'acc_sb', name: 'Seat Box', type: 'Accessory', description: 'Professional match station.', price: 500 },
    { id: 'acc_fc', name: 'Feeder Chair', type: 'Accessory', description: 'Comfortable session seating.', price: 250 },
    { id: 'acc_tmr', name: 'Timer', type: 'Accessory', description: 'Keep track of your casting.', price: 20 },
    { id: 'acc_clk', name: 'Clicker', type: 'Accessory', description: 'Count your fish accurately.', price: 20 },
    { id: 'acc_b12', name: 'Bucket (12l)', type: 'Accessory', description: 'Compact groundbait bucket.', price: 20 },
    { id: 'acc_b17', name: 'Bucket (17l)', type: 'Accessory', description: 'The standard size bucket.', price: 25 },
    { id: 'acc_b40', name: 'Bucket (40l)', type: 'Accessory', description: 'Large bucket for big matches.', price: 35 },
    { id: 'acc_r2', name: 'Riddle (2mm)', type: 'Accessory', description: 'Fine riddle for small seeds.', price: 15 },
    { id: 'acc_r4', name: 'Riddle (4mm)', type: 'Accessory', description: 'Standard groundbait riddle.', price: 15 },
    { id: 'acc_r6', name: 'Riddle (6mm)', type: 'Accessory', description: 'Coarse riddle for pellet prep.', price: 15 },
    { id: 'acc_rrkf', name: 'Rod Rest Kit (Front)', type: 'Accessory', description: 'High stability front rests.', price: 60 },
    { id: 'acc_rrkb', name: 'Rod Rest Kit (Back)', type: 'Accessory', description: 'Gripping back rests.', price: 30 },
    { id: 'acc_plt', name: 'Platform', type: 'Accessory', description: 'Fish comfortably in the water.', price: 250 },
];

export const MOCK_INVENTORY_ITEMS: GameItem[] = [
     { id: 'rod_01', name: 'Basic Feeder Rod', type: 'Rod', description: 'Your trusty starting rod.', price: 0 },
     { id: 'reel_p3500', name: 'Pro Reel 3500', type: 'Reel', description: 'A basic starter reel.', price: 0 },
     { id: 'line_m22', name: '0.22 Monofilament', type: 'Line', description: 'Starter mono line.', price: 0 },
     { id: 'hook_b16', name: 'Size 16 Barbless Hooks (x10)', type: 'Hook', description: 'Starter hooks.', price: 0 },
     { id: 'fdr_c20', name: 'Cage Feeder - 20g (x5)', type: 'Feeder', description: 'Starter feeder.', price: 0 },
     { id: 'bt_mag', name: 'Maggots', type: 'Bait', description: 'A classic bait for all species.', price: 5 },
     { id: 'gb_fm', name: 'Fishmeal Mix', type: 'Groundbait', description: 'A standard groundbait mix.', price: 15 },
     { id: 'ad_mol', name: 'Sweet Molasses', type: 'Additive', description: 'A simple additive.', price: 0 },
];