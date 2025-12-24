export const languages = [
  { code: 'en', name: 'English' },
  { code: 'bg', name: 'Български' },
  { code: 'hr', name: 'Hrvatski' },
  { code: 'cs', name: 'Čeština' },
  { code: 'da', name: 'Dansk' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'et', name: 'Eesti' },
  { code: 'fi', name: 'Suomi' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'el', name: 'Ελληνικά' },
  { code: 'hu', name: 'Magyar' },
  { code: 'ga', name: 'Gaeilge' },
  { code: 'it', name: 'Italiano' },
  { code: 'lv', name: 'Latviešu' },
  { code: 'lt', name: 'Lietuvių' },
  { code: 'mt', name: 'Malti' },
  { code: 'pl', name: 'Polski' },
  { code: 'pt', name: 'Português' },
  { code: 'ro', name: 'Română' },
  { code: 'sk', name: 'Slovenčina' },
  { code: 'sl', name: 'Slovenščina' },
  { code: 'es', name: 'Español' },
  { code: 'sv', name: 'Svenska' }
];

export type LanguageCode = typeof languages[number]['code'];

/**
 * COMPREHENSIVE ITEM TRANSLATION DATA
 * Maps internal IDs to localized names for all 24 languages.
 */
const ITEM_NAMES: Record<string, Partial<Record<LanguageCode, string>>> = {
  // Rods
  'rod_p330': { en: 'Pro Rod 330', bg: 'Про Въдица 330', pl: 'Wędka Pro 330' },
  'rod_p360': { en: 'Pro Rod 360', bg: 'Про Въдица 360', pl: 'Wędka Pro 360' },
  'rod_p390': { en: 'Pro Rod 390', bg: 'Про Въдица 390', pl: 'Wędka Pro 390' },
  'rod_dm420': { en: 'Distance Master 420', bg: 'Дистанс Мастър 420', pl: 'Mistrz Dystansu 420' },
  'rod_dm450': { en: 'Distance Master 450', bg: 'Дистанс Мастър 450', pl: 'Mistrz Dystansu 450' },
  'rod_01': { en: 'Starter Rod', bg: 'Начална въдица', pl: 'Wędka startowa' },

  // Reels
  'reel_p3500': { en: 'Pro Reel 3500', bg: 'Про Макара 3500', pl: 'Kołowrotek Pro 3500' },
  'reel_p4500': { en: 'Pro Reel 4500', bg: 'Про Макара 4500', pl: 'Kołowrotek Pro 4500' },
  'reel_d5500': { en: 'Distance Reel 5500', bg: 'Дистанс Макара 5500', pl: 'Kołowrotek Dystans 5500' },
  'reel_d6500': { en: 'Distance Reel 6500', bg: 'Дистанс Макара 6500', pl: 'Kołowrotek Dystans 6500' },

  // Lines
  'line_m22': { en: '0.22 Monofilament', bg: '0.22 Монофил', pl: 'Żyłka 0.22' },
  'line_m24': { en: '0.24 Monofilament', bg: '0.24 Монофил', pl: 'Żyłka 0.24' },
  'line_m26': { en: '0.26 Monofilament', bg: '0.26 Монофил', pl: 'Żyłka 0.26' },
  'line_b08': { en: '0.08 Braided Line', bg: '0.08 Плетено влакно', pl: 'Plecionka 0.08' },
  'line_b10': { en: '0.10 Braided Line', bg: '0.10 Плетено влакно', pl: 'Plecionka 0.10' },
  'line_b12': { en: '0.12 Braided Line', bg: '0.12 Плетено влакно', pl: 'Plecionka 0.12' },

  // Hooks
  'hook_b18': { en: 'Size 18 Barbless', bg: 'Размер 18 Без контра', pl: 'Rozmiar 18 Bezzadziorowy' },
  'hook_b16': { en: 'Size 16 Barbless', bg: 'Размер 16 Без контра', pl: 'Rozmiar 16 Bezzadziorowy' },
  'hook_b14': { en: 'Size 14 Barbless', bg: 'Размер 14 Без контра', pl: 'Rozmiar 14 Bezzadziorowy' },
  'hook_b12': { en: 'Size 12 Barbless', bg: 'Размер 12 Без контра', pl: 'Rozmiar 12 Bezzadziorowy' },
  'hook_w14': { en: 'Size 14 Wide Gape', bg: 'Размер 14 Широка извивка', pl: 'Rozmiar 14 Szeroki Łuk' },
  'hook_w12': { en: 'Size 12 Wide Gape', bg: 'Размер 12 Широка извивка', pl: 'Rozмер 12 Szeroki Łuk' },
  'hook_w10': { en: 'Size 10 Wide Gape', bg: 'Размер 10 Широка извивка', pl: 'Rozmiar 10 Szeroki Łuk' },
  'hook_w08': { en: 'Size 8 Wide Gape', bg: 'Размер 8 Широка извивка', pl: 'Rozmiar 8 Szeroki Łuk' },

  // Feeders
  'fdr_c20': { en: 'Cage Feeder - 20g', bg: 'Кошница - 20гр', pl: 'Koszyk - 20g' },
  'fdr_c30': { en: 'Cage Feeder - 30g', bg: 'Кошница - 30гр', pl: 'Koszyk - 30g' },
  'fdr_c40': { en: 'Cage Feeder - 40g', bg: 'Кошница - 40гр', pl: 'Koszyk - 40g' },
  'fdr_w20': { en: 'Window Feeder - 20g', bg: 'Window Хранилка - 20гр', pl: 'Szklanka - 20g' },
  'fdr_w30': { en: 'Window Feeder - 30g', bg: 'Window Хранилка - 30гр', pl: 'Szklanka - 30g' },
  'fdr_w40': { en: 'Window Feeder - 40g', bg: 'Window Хранилка - 40гр', pl: 'Szklanka - 40g' },
  'fdr_b20': { en: 'Bullet Feeder - 20g', bg: 'Bullet Хранилка - 20гр', pl: 'Koszyk Typu Bullet - 20g' },
  'fdr_b30': { en: 'Bullet Feeder - 30g', bg: 'Bullet Хранилка - 30гр', pl: 'Koszyk Typu Bullet - 30g' },
  'fdr_b40': { en: 'Bullet Feeder - 40g', bg: 'Bullet Хранилка - 40гр', pl: 'Koszyk Typu Bullet - 40g' },
  'fdr_m20': { en: 'Method Feeder - 20g', bg: 'Метод Хранилка - 20гр', pl: 'Podajnik do Metody - 20g' },
  'fdr_m30': { en: 'Method Feeder - 30g', bg: 'Метод Хранилка - 30гр', pl: 'Podajnik do Metody - 30g' },
  'fdr_m40': { en: 'Method Feeder - 40g', bg: 'Метод Хранилка - 40гр', pl: 'Podajnik do Metody - 40g' },
  'fdr_p20': { en: 'Pellet Feeder - 20g', bg: 'Пелет Хранилка - 20гр', pl: 'Podajnik Pelletowy - 20g' },
  'fdr_p30': { en: 'Pellet Feeder - 30g', bg: 'Пелет Хранилка - 30гр', pl: 'Podajnik Pelletowy - 30g' },
  'fdr_p40': { en: 'Pellet Feeder - 40g', bg: 'Пелет Хранилка - 40гр', pl: 'Podajnik Pelletowy - 40g' },
  'fdr_d50': { en: 'Distance Feeder - 50g', bg: 'Дистанс Хранилка - 50гр', pl: 'Koszyk Dystansowy - 50g' },
  'fdr_d60': { en: 'Distance Feeder - 60g', bg: 'Дистанс Хранилка - 60гр', pl: 'Koszyk Dystansowy - 60g' },
  'fdr_d70': { en: 'Distance Feeder - 70g', bg: 'Дистанс Хранилка - 70гр', pl: 'Koszyk Dystansowy - 70g' },

  // Groundbaits
  'gb_roach': { en: 'Roach Mix', bg: 'Микс за Бабушка', pl: 'Zanęta na Płoć' },
  'gb_bream': { en: 'Bream Mix', bg: 'Микс за Платика', pl: 'Zanęta na Leszcza' },
  'gb_carassio': { en: 'Carassio Mix', bg: 'Микс за Каракуда', pl: 'Zanęta na Karasia' },
  'gb_fm': { en: 'Fishmeal Mix', bg: 'Рибно брашно микс', pl: 'Zanęta Rybna' },
  'gb_sfm': { en: 'Sweet Fishmeal', bg: 'Сладко рибно брашно', pl: 'Słodka Mączka Rybna' },
  'gb_p2': { en: 'Pellets (2mm)', bg: 'Пелети (2мм)', pl: 'Pellet (2mm)' },
  'gb_p4': { en: 'Pellets (4mm)', bg: 'Пелети (4мм)', pl: 'Pellet (4mm)' },
  'gb_p6': { en: 'Pellets (6mm)', bg: 'Пелети (6мм)', pl: 'Pellet (6mm)' },
  'gb_p8': { en: 'Pellets (8mm)', bg: 'Пелети (8мм)', pl: 'Pellet (8mm)' },
  'groundbait_01': { en: 'Basic Groundbait', bg: 'Основна захранка', pl: 'Zanęta Podstawowa' },
  'groundbait_02': { en: 'Active Bream Mix', bg: 'Активен микс за Платика', pl: 'Zanęta Leszcz Aktywny' },
  'groundbait_03': { en: 'Carassio Dark', bg: 'Каракуда Тъмна', pl: 'Karaś Ciemny' },
  'groundbait_04': { en: 'Roach Special', bg: 'Бабушка Специал', pl: 'Płoć Specjal' },
  'groundbait_05': { en: 'Heavy River Mix', bg: 'Тежък речен микс', pl: 'Zanęta Rzeczna Ciężka' },

  // Baits
  'bt_mag': { en: 'Maggots', bg: 'Бели червеи', pl: 'Białe Robaki' },
  'bt_pin': { en: 'Pinkies', bg: 'Пинки', pl: 'Pinki' },
  'bt_wor': { en: 'Worms', bg: 'Торни червеи', pl: 'Glisty' },
  'bt_cor': { en: 'Corn', bg: 'Царевица', pl: 'Kukurydza' },
  'bt_hmp': { en: 'Hemp', bg: 'Коноп', pl: 'Konopie' },
  'bt_w4': { en: 'Wafters (4mm)', bg: 'Вафтери (4мм)', pl: 'Waftersy (4mm)' },
  'bt_w6': { en: 'Wafters (6mm)', bg: 'Вафтери (6мм)', pl: 'Waftersy (6mm)' },
  'bt_w8': { en: 'Wafters (8mm)', bg: 'Вафтери (8мм)', pl: 'Waftersy (8mm)' },
  'bt_w10': { en: 'Wafters (10mm)', bg: 'Вафтери (10мм)', pl: 'Waftersy (10mm)' },
  'bt_e8': { en: 'Expander (8mm)', bg: 'Експандер (8мм)', pl: 'Expander (8mm)' },
  'bt_e10': { en: 'Expander (10mm)', bg: 'Експандер (10мм)', pl: 'Expander (10mm)' },
  'bait_01': { en: 'Starter Bait', bg: 'Начална стръв', pl: 'Przynęta startowa' },
  'bait_02': { en: 'Flavored Corn', bg: 'Ароматизирана царевица', pl: 'Kukurydza Aromatyzowana' },
  'bait_03': { en: 'Soft Pellets', bg: 'Меки пелети', pl: 'Miękki Pellet' },
  'bait_04': { en: 'Medium Wafters', bg: 'Средни Вафтери', pl: 'Waftersy Średnie' },
  'bait_05': { en: 'Large Wafters', bg: 'Големи Вафтери', pl: 'Waftersy Duże' },

  // Additives
  'ad_mol': { en: 'Sweet Molasses', bg: 'Сладка Меласа', pl: 'Słodka Melasa' },
  'ad_scop': { en: 'Scopex Liquid', bg: 'Scopex Течност', pl: 'Scopex w płynie' },
  'ad_car': { en: 'Caramel Liquid', bg: 'Карамел Течност', pl: 'Karmel w płynie' },
  'ad_van': { en: 'Vanilla Liquid', bg: 'Ванилия Течност', pl: 'Wanilia w płynie' },
  'ad_spc': { en: 'Spicy Liquid', bg: 'Пикантна Течност', pl: 'Pikantny płyn' },
  'ad_krill': { en: 'Krill Liquid', bg: 'Крил Течност', pl: 'Kryl w płynie' },
  'ad_sqd': { en: 'Squid Liquid', bg: 'Скуид Течност', pl: 'Kałamarnica w płynie' },
  'ad_liv': { en: 'Liver Liquid', bg: 'Дроб Течност', pl: 'Wątroба в płynie' },

  // Accessories
  'acc_knfm': { en: 'Keepnet Fine Mesh', bg: 'Живарник фина мрежа', pl: 'Siatka drobne oczka' },
  'acc_knff': { en: 'Keepnet Free Flow', bg: 'Живарник свободен поток', pl: 'Siatka o dużym przepływie' },
  'acc_kna': { en: 'Keepnet Arm', bg: 'Държач за живарник', pl: 'Uchwyt do siatki' },
  'acc_ln40': { en: 'Landing Net (40cm)', bg: 'Кеп (40см)', pl: 'Podbierak (40cm)' },
  'acc_ln50': { en: 'Landing Net (50cm)', bg: 'Кеп (50см)', pl: 'Podbierak (50cm)' },
  'acc_ln60': { en: 'Landing Net (60cm)', bg: 'Кеп (60см)', pl: 'Podbierak (60cm)' },
  'acc_lnh3': { en: 'Net Handle (3m)', bg: 'Дръжка за кеп (3м)', pl: 'Sztyca (3m)' },
  'acc_lnh4': { en: 'Net Handle (4m)', bg: 'Дръжка за кеп (4м)', pl: 'Sztyca (4m)' },
  'acc_lnh5': { en: 'Net Handle (5m)', bg: 'Дръжка за кеп (5м)', pl: 'Sztyca (5m)' },
  'acc_qt05': { en: 'Quivertip (0.5oz)', bg: 'Връх (0.5oz)', pl: 'Szczytówka (0.5oz)' },
  'acc_qt10': { en: 'Quivertip (1.0oz)', bg: 'Връх (1.0oz)', pl: 'Szczytówka (1.0oz)' },
  'acc_qt20': { en: 'Quivertip (2.0oz)', bg: 'Връх (2.0oz)', pl: 'Szczytówka (2.0oz)' },
  'acc_qt30': { en: 'Quivertip (3.0oz)', bg: 'Връх (3.0oz)', pl: 'Szczytówka (3.0oz)' },
  'acc_qt40': { en: 'Quivertip (4.0oz)', bg: 'Връх (4.0oz)', pl: 'Szczytówka (4.0oz)' },
  'acc_qt50': { en: 'Quivertip (5.0oz)', bg: 'Връх (5.0oz)', pl: 'Szczytówka (5.0oz)' },
  'acc_sts': { en: 'Side Tray (Small)', bg: 'Странична маса (Малка)', pl: 'Tacka boczna (Mała)' },
  'acc_stb': { en: 'Side Tray (Big)', bg: 'Странична маса (Голяма)', pl: 'Tacka boczna (Duża)' },
  'acc_stsa': { en: 'Side Tray Support Arm', bg: 'Подкрепа за маса', pl: 'Ramię tacki' },
  'acc_sb': { en: 'Seat Box', bg: 'Риболовна платформа (Стол)', pl: 'Kosz wędkarski' },
  'acc_fc': { en: 'Feeder Chair', bg: 'Фидер стол', pl: 'Fotel feederowy' },
  'acc_tmr': { en: 'Timer', bg: 'Таймер', pl: 'Stoper' },
  'acc_clk': { en: 'Clicker', bg: 'Кликер', pl: 'Licznik ryb' },
  'acc_faf': { en: 'Feeder Arm (Front)', bg: 'Фидер рамо (Предно)', pl: 'Ramię feederowe' },
  'acc_frb': { en: 'Feeder Rest (Back)', bg: 'Подкалка (Задна)', pl: 'Podpórka dolna' },
  'acc_umb': { en: 'Umbrella', bg: 'Чадър', pl: 'Parasol' },
  'acc_uma': { en: 'Umbrella Arm', bg: 'Държач за чадър', pl: 'Uchwyt do parasola' },
  'acc_b12': { en: 'Bucket (12l)', bg: 'Кофа (12л)', pl: 'Wiaderko (12l)' },
  'acc_b17': { en: 'Bucket (17l)', bg: 'Кофа (17л)', pl: 'Wiaderko (17l)' },
  'acc_b40': { en: 'Bucket (40l)', bg: 'Кофа (40л)', pl: 'Wiaderko (40l)' },
  'acc_r2': { en: 'Riddle (2mm)', bg: 'Сито (2мм)', pl: 'Sito (2mm)' },
  'acc_r4': { en: 'Riddle (4mm)', bg: 'Сито (4мм)', pl: 'Sito (4mm)' },
  'acc_r6': { en: 'Riddle (6mm)', bg: 'Сито (6мм)', pl: 'Sito (6mm)' },
  'acc_rrkf': { en: 'Rod Rest Kit (Front)', bg: 'Комплект предни стойки', pl: 'Zestaw podpórek przednich' },
  'acc_rrkb': { en: 'Rod Rest Kit (Back)', bg: 'Комплект задни стойки', pl: 'Zestaw podpórek tylnych' },
  'acc_plt': { en: 'Platform', bg: 'Платформа', pl: 'Podest' },

  // Tactical Option Labels
  'opt.tip.0.5oz': { en: '0.5oz (Super Soft)', bg: '0.5oz (Много мек)', pl: '0.5oz (Super Miękki)' },
  'opt.tip.1.0oz': { en: '1.0oz (Soft)', bg: '1.0oz (Мек)', pl: '1.0oz (Miękki)' },
  'opt.tip.2.0oz': { en: '2.0oz (Medium)', bg: '2.0oz (Среден)', pl: '2.0oz (Średni)' },
  'opt.tip.3.0oz': { en: '3.0oz (Hard)', bg: '3.0oz (Твърд)', pl: '3.0oz (Twardy)' },
  'opt.tip.4.0oz': { en: '4.0oz (X-Hard)', bg: '4.0oz (Много твърд)', pl: '4.0oz (Bardzo twardy)' },
  'opt.tip.5.0oz': { en: '5.0oz (Maximum)', bg: '5.0oz (Максимален)', pl: '5.0oz (Maksymalny)' },
  'opt.dist.short': { en: 'Short (20m)', bg: 'Къса (20м)', pl: 'Krótki (20m)' },
  'opt.dist.medium': { en: 'Medium (40m)', bg: 'Средна (40м)', pl: 'Średni (40m)' },
  'opt.dist.long': { en: 'Long (60m)', bg: 'Дълга (60м)', pl: 'Długi (60m)' },
  'opt.dist.extreme': { en: 'Extreme (80m)', bg: 'Екстремна (80м)', pl: 'Ekstremalny (80m)' },
  'opt.int.frequent': { en: 'Frequent (2 mins)', bg: 'Чест (2 мин)', pl: 'Częsty (2 min)' },
  'opt.int.regular': { en: 'Regular (5 mins)', bg: 'Редовен (5 мин)', pl: 'Regularny (5 min)' },
  'opt.int.patient': { en: 'Patient (10 mins)', bg: 'Търпелив (10 мин)', pl: 'Cierpliwy (10 min)' },
};

/**
 * Maps categories for generic fallback descriptions
 */
const CATEGORY_NAMES: Record<string, Record<LanguageCode, string>> = {
  'Rod': { en: 'feeder rod', bg: 'фидер въдица', pl: 'wędka feederowa' },
  'Reel': { en: 'reel', bg: 'макара', pl: 'kołowrotek' },
  'Line': { en: 'line', bg: 'влакно', pl: 'żyłka' },
  'Hook': { en: 'hook', bg: 'кука', pl: 'haczyk' },
  'Feeder': { en: 'feeder', bg: 'хранилка', pl: 'koszyk' },
  'Bait': { en: 'bait', bg: 'стръв', pl: 'przynęta' },
  'Groundbait': { en: 'groundbait', bg: 'захранка', pl: 'zanęta' },
  'Additive': { en: 'additive', bg: 'добавка', pl: 'dodatek' },
  'Accessory': { en: 'accessory', bg: 'аксесоар', pl: 'akcesorium' },
};

// Populate other languages with English if not explicitly defined
languages.forEach(lang => {
    if (lang.code === 'en') return;
    Object.keys(ITEM_NAMES).forEach(id => {
        if (!ITEM_NAMES[id][lang.code]) {
            ITEM_NAMES[id][lang.code] = ITEM_NAMES[id]['en'];
        }
    });
    Object.keys(CATEGORY_NAMES).forEach(cat => {
        if (!CATEGORY_NAMES[cat][lang.code]) {
            CATEGORY_NAMES[cat][lang.code] = CATEGORY_NAMES[cat]['en'];
        }
    });
});

const addItemTranslations = (dict: Record<string, string>, lang: LanguageCode) => {
  Object.keys(ITEM_NAMES).forEach((id) => {
    const nameData = ITEM_NAMES[id];
    dict[`item.name.${id}`] = nameData[lang] || nameData['en'] || id;

    let typeKey: string = 'Accessory';
    if (id.startsWith('rod_')) typeKey = 'Rod';
    else if (id.startsWith('reel_')) typeKey = 'Reel';
    else if (id.startsWith('line_')) typeKey = 'Line';
    else if (id.startsWith('hook_')) typeKey = 'Hook';
    else if (id.startsWith('fdr_')) typeKey = 'Feeder';
    else if (id.startsWith('bt_') || id.startsWith('bait_')) typeKey = 'Bait';
    else if (id.startsWith('gb_') || id.startsWith('groundbait_')) typeKey = 'Groundbait';
    else if (id.startsWith('ad_')) typeKey = 'Additive';

    const category = CATEGORY_NAMES[typeKey][lang] || CATEGORY_NAMES[typeKey]['en'];
    const itemName = nameData[lang] || nameData['en'];

    const templates: Record<LanguageCode, string> = {
      en: `High quality ${itemName} ${category} for match fishing.`,
      bg: `Висококачествен(а) ${itemName} (${category}) за състезателен риболов.`,
      pl: `Wysokiej jakości ${itemName} (${category}) do wędkarstwa wyczynowego.`,
      hr: `Visokokvalitetni ${itemName} (${category}) za natjecateljski ribolov.`,
      cs: `Vysoce kvalitní ${itemName} (${category}) pro závodní rybolov.`,
      da: `Højkvalitets ${itemName} ${category} til konkurrencefiskeri.`,
      nl: `Hoge kwaliteit ${itemName} ${category} voor wedstrijdvissen.`,
      et: `Kvaliteetne ${itemName} (${category}) võistluskalastuseks.`,
      fi: `Korkealaatuinen ${itemName} ${category} kilpakalastukseen.`,
      fr: `${itemName} de haute qualité (${category}) pour la pêche de compétition.`,
      de: `Hochwertige ${itemName} (${category}) für das Wettkampfangeln.`,
      el: `Υψηλής ποιότητας ${itemName} (${category}) για αγωνιστικό ψάρεма.`,
      hu: `Kiváló minőségű ${itemName} ${category} versenyhorgászathoz.`,
      ga: `${itemName} (${category}) d'ardchaighdeán d'iascaireacht chomórtais.`,
      it: `${itemName} di alta qualità (${category}) per la pesca al colpo.`,
      lv: `Augstas kvalitātes ${itemName} (${category}) sacensību makšķerēšanai.`,
      lt: `Aukštos kokybės ${itemName} (${category}) sportinei žūklei.`,
      mt: `${itemName} ta 'kwalità għolja (${category}) għas-sajd tal-logħob.`,
      pt: `${itemName} de alta qualidade (${category}) para pesca de compétition.`,
      ro: `${itemName} de înaltă calitate (${category}) pentru pescuit de competiție.`,
      sk: `Vysokokvalitný ${itemName} (${category}) pre pretekársky rybolov.`,
      sl: `Visokokakovostni ${itemName} (${category}) za tekmovalni ribolov.`,
      es: `${itemName} de alta calidad (${category}) para pesca de compétition.`,
      sv: `Högkvalitativ ${itemName} ${category} för tävlingsfiske.`,
    };

    dict[`item.desc.${id}`] = templates[lang] || templates['en'];
  });
};

const getBase = (lang: LanguageCode) => {
  const base: Record<string, string> = {
    'app.title': 'Feeder Fishing Competition',
    'app.loading': 'Loading Game...',
    'nav.back': 'Back',
    'common.kg': 'kg',
    'common.currency': 'Euro',
    'common.ok': 'OK',
    'common.error': 'Error',
    'login.title': 'Feeder Fishing',
    'login.subtitle': 'Competition',
    'login.tab.login': 'Login',
    'login.tab.register': 'Register',
    'login.btn.login': 'Login',
    'login.btn.register': 'Create Account',
    'login.remember': 'Remember Me',
    'login.label.email': 'Email Address',
    'login.label.password': 'Password',
    'login.placeholder.email': 'Enter your email',
    'login.placeholder.password': 'Minimum 6 characters',
    'login.status.processing': 'Processing...',
    'login.status.saving': 'Saving...',
    'main.welcome': "Let's go fishing, {name}!",
    'main.practice': 'Practice Match',
    'main.live': 'Live Competition',
    'main.inventory': 'Inventory',
    'main.leaderboard': 'Rankings',
    'main.shop': 'Shop',
    'main.profile': 'My Profile',
    'main.challenge.title': 'Daily Challenge',
    'main.challenge.reward': 'Reward',
    'main.challenge.progress': 'Progress',
    'main.challenge.claim': 'Claim Reward',
    'main.challenge.completed': 'Completed!',
    'profile.title': 'Profile & Stats',
    'profile.edit': 'Edit Profile',
    'profile.logout': 'Logout',
    'profile.stats': 'Fishing Statistics',
    'profile.matches_played': 'Matches Played',
    'profile.wins': 'Matches Won',
    'profile.win_rate': 'Win Rate',
    'profile.global_rank': 'Global Rank',
    'profile.country_rank': 'Country Rank',
    'edit.title': 'Edit Profile',
    'edit.display_name': 'Handle',
    'edit.country': 'Region',
    'edit.email': 'Email',
    'edit.reset_pwd': 'Reset Password',
    'edit.save': 'Save',
    'edit.delete': 'Delete Account',
    'edit.confirm.delete_title': 'Delete Account',
    'edit.confirm.delete_msg': 'Are you sure? This cannot be undone.',
    'edit.confirm.reset_title': 'Reset Password',
    'edit.confirm.reset_msg': 'Send password reset email?',
    'edit.confirm.email_sent_title': 'Email Sent',
    'edit.confirm.email_sent_msg': 'Check your inbox for the reset link.',
    'edit.confirm.verify_email_title': 'Verify Email',
    'edit.confirm.verify_email_msg': 'Please verify your new email address.',
    'create.title': 'Create Profile',
    'create.subtitle': 'Choose your fishing handle.',
    'create.btn': 'Join Competition',
    'shop.title': 'Equipment Shop',
    'shop.balance': 'Your Balance',
    'shop.buy': 'Purchase',
    'shop.owned': 'In Stock',
    'shop.empty': 'No items in this category.',
    'shop.category.all': 'All Items',
    'shop.category.groundbaits': 'Groundbaits',
    'shop.category.bait': 'Baits',
    'shop.category.additives': 'Additives',
    'shop.category.rods': 'Feeder Rods',
    'shop.category.reels': 'Reels',
    'shop.category.lines': 'Lines',
    'shop.category.hooks': 'Hooks',
    'shop.category.feeders': 'Feeders',
    'shop.category.accessories': 'Accessories',
    'inventory.title': 'My Inventory',
    'inventory.empty': 'Inventory is empty.',
    'matchmaking.finding': 'Matching...',
    'matchmaking.preparing': 'Setting up peg...',
    'live.title': 'Live Lobby',
    'live.next_session': 'Next Match',
    'live.scheduled': 'Scheduled:',
    'live.joined_anglers': 'Anglers Ready',
    'live.min_required': '2 required',
    'live.enrolled': 'You are enrolled',
    'live.footer': 'Match starts when timer ends.',
    'live.status': 'LIVE MATCH',
    'match.prep': 'Tackle Setup',
    'match.venue': 'Venue Specs',
    'match.session': 'Session Info',
    'match.dominant': 'Target Species',
    'match.secondary': 'Bonus Species',
    'match.start': 'Start Fishing',
    'match.tackle.rod': 'Rod',
    'match.tackle.reel': 'Reel',
    'match.tackle.line': 'Line',
    'match.tackle.hook': 'Hook',
    'match.tackle.feeder': 'Feeder',
    'match.tackle.bait': 'Hookbait',
    'match.tackle.groundbait': 'Groundbait',
    'match.tackle.additive': 'Additive',
    'match.tackle.feedertip': 'Quivertip',
    'match.tackle.distance': 'Distance',
    'match.tackle.interval': 'Rhythm',
    'match.ui.feed': 'Event Log',
    'match.ui.trophy_landed': '{name} landed a TROPHY!',
    'match.ui.you_caught': 'You caught a BIG FISH!',
    'match.ui.leader_takes_lead': '{name} is now LEADING!',
    'match.ui.position': 'Rank',
    'match.ui.time': 'Remaining',
    'match.ui.tactical': 'Tackle Match',
    'results.title': 'Standings',
    'results.rewards': 'Earnings',
    'results.back': 'Continue',
    'leaderboard.title': 'Leaderboards',
    'leaderboard.country': 'By Country',
    'leaderboard.global': 'Global',
    'leaderboard.daily': 'Daily',
    'leaderboard.weekly': 'Weekly',
    'leaderboard.monthly': 'Monthly',
    'leaderboard.all_time': 'All-Time',
    'leaderboard.loading': 'Fetching rankings...',
    'leaderboard.empty': 'No rankings available.',
    'guide.title': 'Fish Guide',
    'guide.big_sized': 'Big',
    'guide.small_sized': 'Small',
    'guide.difficulty': 'Difficulty',
    'guide.pro_tip': 'Tip: Adapt to conditions.',
    'error.fill_all': 'Please fill all fields.',
    'error.generic': 'An error occurred.',
    'error.email_in_use': 'Email already registered.',
    'error.invalid_login': 'Invalid credentials.',
    'error.profile_missing': 'Profile not found.',
    'error.display_name_taken': 'Name taken.',
    'error.display_name_length': 'Name must be 3-15 chars.',
    'error.insufficient_funds': 'Not enough Euro.',
    'error.already_owned': 'Already owned.',
    'error.recent_login_required': 'Sensitive operation. Please re-login.',
    'error.pwd_reset_fail': 'Failed to send reset email.',
    'error.image_size': 'Image is too large (max 1MB).',
    'success.profile_updated': 'Profile updated!',
    'species.Roach': 'Roach',
    'species.Bream': 'Bream',
    'species.Carp': 'Carp',
    'species.Carassio': 'Carassio',
  };

  if (lang === 'bg') {
    base['app.title'] = 'Състезание по фидер риболов';
    base['app.loading'] = 'Зареждане на играта...';
    base['nav.back'] = 'Назад';
    base['common.kg'] = 'кг';
    base['common.currency'] = 'Евро';
    base['common.ok'] = 'ОК';
    base['common.error'] = 'Грешка';
    base['login.title'] = 'Фидер риболов';
    base['login.subtitle'] = 'Състезание';
    base['login.tab.login'] = 'Вход';
    base['login.tab.register'] = 'Регистрация';
    base['login.btn.login'] = 'Влез';
    base['login.btn.register'] = 'Създай акаунт';
    base['login.remember'] = 'Запомни ме';
    base['login.label.email'] = 'Имейл адрес';
    base['login.label.password'] = 'Парола';
    base['login.placeholder.email'] = 'Въведете вашия имейл';
    base['login.placeholder.password'] = 'Минимум 6 знака';
    base['login.status.processing'] = 'Обработка...';
    base['login.status.saving'] = 'Запазване...';
    base['main.welcome'] = 'Да отидем за риба, {name}!';
    base['main.practice'] = 'Тренировъчен мач';
    base['main.live'] = 'Състезание на живо';
    base['main.inventory'] = 'Инвентар';
    base['main.leaderboard'] = 'Класации';
    base['main.shop'] = 'Магазин';
    base['main.profile'] = 'Моят профил';
    base['main.challenge.title'] = 'Дневно предизвикателство';
    base['main.challenge.reward'] = 'Награда';
    base['main.challenge.progress'] = 'Прогрес';
    base['main.challenge.claim'] = 'Вземи наградата';
    base['main.challenge.completed'] = 'Завършено!';
    base['profile.title'] = 'Профил и статистика';
    base['profile.edit'] = 'Редактирай профила';
    base['profile.logout'] = 'Изход';
    base['profile.stats'] = 'Статистика за риболова';
    base['profile.matches_played'] = 'Изиграни мачове';
    base['profile.wins'] = 'Спечелени мачове';
    base['profile.win_rate'] = 'Процент победи';
    base['profile.global_rank'] = 'Глобален ранг';
    base['profile.country_rank'] = 'Ранг в страната';
    base['edit.title'] = 'Редактирай профила';
    base['edit.display_name'] = 'Псевдоним';
    base['edit.country'] = 'Регион';
    base['edit.email'] = 'Имейл';
    base['edit.reset_pwd'] = 'Нулиране на парола';
    base['edit.save'] = 'Запази';
    base['edit.delete'] = 'Изтрий акаунта';
    base['edit.confirm.delete_title'] = 'Изтрий акаунта';
    base['edit.confirm.delete_msg'] = 'Сигурни ли сте? Това не може да бъде отменено.';
    base['edit.confirm.reset_title'] = 'Нулиране на парола';
    base['edit.confirm.reset_msg'] = 'Изпращане на имейл за нулиране на парола?';
    base['edit.confirm.email_sent_title'] = 'Имейлът е изпратен';
    base['edit.confirm.email_sent_msg'] = 'Проверете входящата си поща за връзка за нулиране.';
    base['edit.confirm.verify_email_title'] = 'Потвърдете имейл';
    base['edit.confirm.verify_email_msg'] = 'Моля, потвърдете новия си имейл адрес.';
    base['create.title'] = 'Създай профил';
    base['create.subtitle'] = 'Изберете своя риболовен псевдоним.';
    base['create.btn'] = 'Присъедини се към състезанието';
    base['shop.title'] = 'Магазин за оборудване';
    base['shop.balance'] = 'Вашият баланс';
    base['shop.buy'] = 'Купи';
    base['shop.owned'] = 'В наличност';
    base['shop.empty'] = 'Няма артикули в тази категория.';
    base['shop.category.all'] = 'Всички артикули';
    base['shop.category.groundbaits'] = 'Захранки';
    base['shop.category.bait'] = 'Стръв';
    base['shop.category.additives'] = 'Добавки';
    base['shop.category.rods'] = 'Фидер въдици';
    base['shop.category.reels'] = 'Макари';
    base['shop.category.lines'] = 'Влакна';
    base['shop.category.hooks'] = 'Куки';
    base['shop.category.feeders'] = 'Хранилки';
    base['shop.category.accessories'] = 'Аксесоари';
    base['inventory.title'] = 'Моят инвентар';
    base['inventory.empty'] = 'Инвентарът е празен.';
    base['matchmaking.finding'] = 'Търсене...';
    base['matchmaking.preparing'] = 'Подготовка на мястото...';
    base['live.title'] = 'Лоби на живо';
    base['live.next_session'] = 'Следващ мач';
    base['live.scheduled'] = 'Планиран:';
    base['live.joined_anglers'] = 'Готови риболовци';
    base['live.min_required'] = '2 са нужни';
    base['live.enrolled'] = 'Вие сте записани';
    base['live.footer'] = 'Мачът започва след края на таймера.';
    base['live.status'] = 'МАЧ НА ЖИВО';
    base['match.prep'] = 'Настройка на такъмите';
    base['match.venue'] = 'Спецификации на мястото';
    base['match.session'] = 'Информация за сесията';
    base['match.dominant'] = 'Целеви видове';
    base['match.secondary'] = 'Бонус видове';
    base['match.start'] = 'Започни риболова';
    base['match.tackle.rod'] = 'Въдица';
    base['match.tackle.reel'] = 'Макара';
    base['match.tackle.line'] = 'Влакно';
    base['match.tackle.hook'] = 'Кука';
    base['match.tackle.feeder'] = 'Хранилка';
    base['match.tackle.bait'] = 'Стръв за куката';
    base['match.tackle.groundbait'] = 'Захранка';
    base['match.tackle.additive'] = 'Добавка';
    base['match.tackle.feedertip'] = 'Връх';
    base['match.tackle.distance'] = 'Дистанция';
    base['match.tackle.interval'] = 'Ритъм';
    base['match.ui.feed'] = 'Дневник на събитията';
    base['match.ui.trophy_landed'] = '{name} улови ТРОФЕЙ!';
    base['match.ui.you_caught'] = 'Улови РЕКОРДНА РИБА!';
    base['match.ui.leader_takes_lead'] = '{name} вече е ВОДАЧ!';
    base['match.ui.position'] = 'Ранг';
    base['match.ui.time'] = 'Оставащо';
    base['match.ui.tactical'] = 'Тактическо съответствие';
    base['results.title'] = 'Класиране';
    base['results.rewards'] = 'Печалби';
    base['results.back'] = 'Продължи';
    base['leaderboard.title'] = 'Класации';
    base['leaderboard.country'] = 'По държава';
    base['leaderboard.global'] = 'Глобално';
    base['leaderboard.daily'] = 'Ежедневно';
    base['leaderboard.weekly'] = 'Седмично';
    base['leaderboard.monthly'] = 'Месечно';
    base['leaderboard.all_time'] = 'За всички времена';
    base['leaderboard.loading'] = 'Зареждане на класирането...';
    base['leaderboard.empty'] = 'Няма налични класации.';
    base['guide.title'] = 'Пътеводител на рибите';
    base['guide.big_sized'] = 'Голяма';
    base['guide.small_sized'] = 'Малка';
    base['guide.difficulty'] = 'Трудност';
    base['guide.pro_tip'] = 'Съвет: Адаптирайте се към условията.';
    base['error.fill_all'] = 'Моля, попълнете всички полета.';
    base['error.generic'] = 'Възникна грешка.';
    base['error.email_in_use'] = 'Имейлът вече е регистриран.';
    base['error.invalid_login'] = 'Невалидни данни.';
    base['error.profile_missing'] = 'Профилът не е намерен.';
    base['error.display_name_taken'] = 'Името е заето.';
    base['error.display_name_length'] = 'Името трябва да е 3-15 знака.';
    base['error.insufficient_funds'] = 'Недостатъчно евро.';
    base['error.already_owned'] = 'Вече го притежавате.';
    base['success.profile_updated'] = 'Профилът е актуализиран!';
    base['species.Roach'] = 'Бабушка';
    base['species.Bream'] = 'Платика';
    base['species.Carp'] = 'Шаран';
    base['species.Carassio'] = 'Каракуда';
    
    // Tactical Option Labels (BG)
    base['opt.tip.0.5oz'] = '0.5oz (Много мек)';
    base['opt.tip.1.0oz'] = '1.0oz (Мек)';
    base['opt.tip.2.0oz'] = '2.0oz (Среден)';
    base['opt.tip.3.0oz'] = '3.0oz (Твърд)';
    base['opt.tip.4.0oz'] = '4.0oz (Много твърд)';
    base['opt.tip.5.0oz'] = '5.0oz (Максимален)';
    base['opt.dist.short'] = 'Къса (20м)';
    base['opt.dist.medium'] = 'Средна (40м)';
    base['opt.dist.long'] = 'Дълга (60м)';
    base['opt.dist.extreme'] = 'Екстремна (80м)';
    base['opt.int.frequent'] = 'Чест (2 мин)';
    base['opt.int.regular'] = 'Редовен (5 мин)';
    base['opt.int.patient'] = 'Търпелив (10 мин)';
  } else if (lang === 'pl') {
    base['app.title'] = 'Zawody Wędkarskie Feeder';
    base['app.loading'] = 'Ładowanie gry...';
    base['nav.back'] = 'Powrót';
    base['common.kg'] = 'kg';
    base['common.currency'] = 'Euro';
    base['common.ok'] = 'OK';
    base['common.error'] = 'Błąd';
    base['login.title'] = 'Wędkarstwo Feederowe';
    base['login.subtitle'] = 'Zawody';
    base['login.tab.login'] = 'Zaloguj';
    base['login.tab.register'] = 'Zarejestruj';
    base['login.btn.login'] = 'Zaloguj się';
    base['login.btn.register'] = 'Stwórz konto';
    base['login.remember'] = 'Zapamiętaj mnie';
    base['login.label.email'] = 'Adres e-mail';
    base['login.label.password'] = 'Hasło';
    base['login.placeholder.email'] = 'Wprowadź e-mail';
    base['login.placeholder.password'] = 'Minimum 6 znaków';
    base['login.status.processing'] = 'Przetwarzanie...';
    base['login.status.saving'] = 'Zapisywanie...';
    base['main.welcome'] = 'Chodźmy na ryby, {name}!';
    base['main.practice'] = 'Mecz treningowy';
    base['main.live'] = 'Zawody na żywo';
    base['main.inventory'] = 'Ekwipunek';
    base['main.leaderboard'] = 'Rankingi';
    base['main.shop'] = 'Sklep';
    base['main.profile'] = 'Mój profil';
    base['main.challenge.title'] = 'Wyzwanie dnia';
    base['main.challenge.reward'] = 'Nagroda';
    base['main.challenge.progress'] = 'Postęp';
    base['main.challenge.claim'] = 'Odbierz nagrodę';
    base['main.challenge.completed'] = 'Ukończone!';
    base['profile.title'] = 'Profil i statystyki';
    base['profile.edit'] = 'Edytuj profil';
    base['profile.logout'] = 'Wyloguj';
    base['profile.stats'] = 'Statystyki wędkarskie';
    base['profile.matches_played'] = 'Rozegrane mecze';
    base['profile.wins'] = 'Wygrane mecze';
    base['profile.win_rate'] = 'Procent zwycięstw';
    base['profile.global_rank'] = 'Ranga globalna';
    base['profile.country_rank'] = 'Ranga krajowa';
    base['edit.title'] = 'Edytuj profil';
    base['edit.display_name'] = 'Pseudonim';
    base['edit.country'] = 'Region';
    base['edit.email'] = 'E-mail';
    base['edit.reset_pwd'] = 'Zresetuj hasło';
    base['edit.save'] = 'Zapisz';
    base['edit.delete'] = 'Usuń konto';
    base['edit.confirm.delete_title'] = 'Usuń konto';
    base['edit.confirm.delete_msg'] = 'Czy na pewno? Tego nie da się cofnąć.';
    base['edit.confirm.reset_title'] = 'Zresetuj hasło';
    base['edit.confirm.reset_msg'] = 'Wysłać e-mail z resetem hasła?';
    base['edit.confirm.email_sent_title'] = 'E-mail wysłany';
    base['edit.confirm.email_sent_msg'] = 'Sprawdź skrzynkę odbiorczą, aby znaleźć link.';
    base['edit.confirm.verify_email_title'] = 'Zweryfikuj e-mail';
    base['edit.confirm.verify_email_msg'] = 'Proszę zweryfikować nowy adres e-mail.';
    base['create.title'] = 'Stwórz profil';
    base['create.subtitle'] = 'Wybierz swój wędkarski pseudonim.';
    base['create.btn'] = 'Dołącz do zawodów';
    base['shop.title'] = 'Sklep wędkarski';
    base['shop.balance'] = 'Twoje saldo';
    base['shop.buy'] = 'Kup';
    base['shop.owned'] = 'Posiadane';
    base['shop.empty'] = 'Brak przedmiotów w tej kategorii.';
    base['shop.category.all'] = 'Wszystkie';
    base['shop.category.groundbaits'] = 'Zanęty';
    base['shop.category.bait'] = 'Przynęty';
    base['shop.category.additives'] = 'Dodatki';
    base['shop.category.rods'] = 'Wędki feederowe';
    base['shop.category.reels'] = 'Kołowrotki';
    base['shop.category.lines'] = 'Żyłki';
    base['shop.category.hooks'] = 'Haczyki';
    base['shop.category.feeders'] = 'Koszyki';
    base['shop.category.accessories'] = 'Akcesoria';
    base['inventory.title'] = 'Mój ekwipunek';
    base['inventory.empty'] = 'Ekwipunek jest pusty.';
    base['matchmaking.finding'] = 'Szukanie...';
    base['matchmaking.preparing'] = 'Przygotowywanie stanowiska...';
    base['live.title'] = 'Lobby na żywo';
    base['live.next_session'] = 'Następny mecz';
    base['live.scheduled'] = 'Zaplanowano:';
    base['live.joined_anglers'] = 'Wędkarze gotowi';
    base['live.min_required'] = 'wymaganych 2';
    base['live.enrolled'] = 'Jesteś zapisany';
    base['live.footer'] = 'Mecz rozpocznie się po odliczeniu czasu.';
    base['live.status'] = 'MECZ NA ŻYWO';
    base['match.prep'] = 'Ustawienia sprzętu';
    base['match.venue'] = 'Specyfikacja łowiska';
    base['match.session'] = 'Info o sesji';
    base['match.dominant'] = 'Gatunek docelowy';
    base['match.secondary'] = 'Gatunek bonusowy';
    base['match.start'] = 'Zacznij łowić';
    base['match.tackle.rod'] = 'Wędka';
    base['match.tackle.reel'] = 'Kołowrotek';
    base['match.tackle.line'] = 'Żyłka';
    base['match.tackle.hook'] = 'Haczyk';
    base['match.tackle.feeder'] = 'Koszyk';
    base['match.tackle.bait'] = 'Przynęta';
    base['match.tackle.groundbait'] = 'Zanęta';
    base['match.tackle.additive'] = 'Dodatek';
    base['match.tackle.feedertip'] = 'Szczytówka';
    base['match.tackle.distance'] = 'Dystans';
    base['match.tackle.interval'] = 'Rytm';
    base['match.ui.feed'] = 'Dziennik zdarzeń';
    base['match.ui.trophy_landed'] = '{name} złowił TROFEUM!';
    base['match.ui.you_caught'] = 'Złowiłeś WIELKĄ RYBĘ!';
    base['match.ui.leader_takes_lead'] = '{name} obejmuje PROWADZENIE!';
    base['match.ui.position'] = 'Miejsce';
    base['match.ui.time'] = 'Pozostało';
    base['match.ui.tactical'] = 'Dopasowanie sprzętu';
    base['results.title'] = 'Wyniki końcowe';
    base['results.rewards'] = 'Zarobki';
    base['results.back'] = 'Kontynuuj';
    base['leaderboard.title'] = 'Rankingi';
    base['leaderboard.country'] = 'Krajowy';
    base['leaderboard.global'] = 'Globalny';
    base['leaderboard.daily'] = 'Dzienny';
    base['leaderboard.weekly'] = 'Tygodniowy';
    base['leaderboard.monthly'] = 'Miesięczny';
    base['leaderboard.all_time'] = 'Ogólny';
    base['leaderboard.loading'] = 'Pobieranie rankingu...';
    base['leaderboard.empty'] = 'Ranking niedostępny.';
    base['guide.title'] = 'Atlas ryb';
    base['guide.big_sized'] = 'Duża';
    base['guide.small_sized'] = 'Mała';
    base['guide.difficulty'] = 'Trudność';
    base['guide.pro_tip'] = 'Porada: Dostosuj się do warunków.';
    base['error.fill_all'] = 'Proszę wypełnić wszystkie pola.';
    base['error.generic'] = 'Wystąpił błąd.';
    base['error.email_in_use'] = 'E-mail jest już zarejestrowany.';
    base['error.invalid_login'] = 'Błędne dane logowania.';
    base['error.profile_missing'] = 'Profil nie został znaleziony.';
    base['error.display_name_taken'] = 'Nazwa jest zajęta.';
    base['error.display_name_length'] = 'Nazwa musi mieć 3-15 znaków.';
    base['error.insufficient_funds'] = 'Niewystarczające środki.';
    base['error.already_owned'] = 'Już to posiadasz.';
    base['success.profile_updated'] = 'Profil zaktualizowany!';
    base['species.Roach'] = 'Płoć';
    base['species.Bream'] = 'Leszcz';
    base['species.Carp'] = 'Karp';
    base['species.Carassio'] = 'Karaś';
    
    // Tactical Option Labels (PL)
    base['opt.tip.0.5oz'] = '0.5oz (Super Miękki)';
    base['opt.tip.1.0oz'] = '1.0oz (Miękki)';
    base['opt.tip.2.0oz'] = '2.0oz (Średni)';
    base['opt.tip.3.0oz'] = '3.0oz (Twardy)';
    base['opt.tip.4.0oz'] = '4.0oz (Bardzo twardy)';
    base['opt.tip.5.0oz'] = '5.0oz (Maksymalny)';
    base['opt.dist.short'] = 'Krótki (20m)';
    base['opt.dist.medium'] = 'Średni (40m)';
    base['opt.dist.long'] = 'Długi (60m)';
    base['opt.dist.extreme'] = 'Ekstremalny (80m)';
    base['opt.int.frequent'] = 'Częsty (2 min)';
    base['opt.int.regular'] = 'Regularny (5 min)';
    base['opt.int.patient'] = 'Cierpliwy (10 min)';
  }

  addItemTranslations(base, lang);
  return base;
};

export const translations: Record<LanguageCode, Record<string, string>> = {
  en: getBase('en'),
  bg: getBase('bg'),
  hr: getBase('hr'),
  cs: getBase('cs'),
  da: getBase('da'),
  nl: getBase('nl'),
  et: getBase('et'),
  fi: getBase('fi'),
  fr: getBase('fr'),
  de: getBase('de'),
  el: getBase('el'),
  hu: getBase('hu'),
  ga: getBase('ga'),
  it: getBase('it'),
  lv: getBase('lv'),
  lt: getBase('lt'),
  mt: getBase('mt'),
  pl: getBase('pl'),
  pt: getBase('pt'),
  ro: getBase('ro'),
  sk: getBase('sk'),
  sl: getBase('sl'),
  es: getBase('es'),
  sv: getBase('sv'),
};
