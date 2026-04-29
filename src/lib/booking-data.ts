export interface BookingData {
  venue: "Main Room" | "VIP Room Front" | "VIP Room Back" | "";
  decideLater: boolean;
  wantsPrivateRoom: boolean;
  date: Date | undefined;
  time: string;
  timeTag: "Lunch" | "Dinner" | "";
  guestCount: number;
  hasKids: boolean;
  kidsCount: number;
  menu: "Classico" | "Gustoso" | "Magnifico" | "";
  courseChoice: "insalate" | "dolci" | "";
  menuSelections: Record<string, string[]>;
  allergens: string;
  beverageStrategy: "open-bar" | "consumption" | "";
  barType: "beer-wine" | "full-bar" | "";
  barDuration: "2hr" | "3hr" | "";

  addons: {
    tablecloths: boolean;
    avSpeaker: boolean;
    liveMusic: boolean;
    ownMusician: boolean;
  };
  bringingCake: boolean;
  bringingDecor: boolean;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  specialRequests: string;
}

export const initialBookingData: BookingData = {
  venue: "",
  decideLater: false,
  wantsPrivateRoom: false,
  date: undefined,
  time: "",
  timeTag: "",
  guestCount: 16,
  hasKids: false,
  kidsCount: 0,
  menu: "",
  courseChoice: "",
  menuSelections: {},
  allergens: "",
  beverageStrategy: "",
  barType: "",
  barDuration: "",

  addons: {
    tablecloths: false,
    avSpeaker: false,
    liveMusic: false,
    ownMusician: false,
  },
  bringingCake: false,
  bringingDecor: false,
  fullName: "",
  email: "",
  phone: "",
  company: "",
  specialRequests: "",
};

export const KIDS_MENU_PRICE = 45;

export const timeSlots = [
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
  "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM",
  "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM", "10:00 PM",
];

export function getTimeTag(time: string): "Lunch" | "Dinner" | "" {
  if (!time) return "";
  const hour = parseInt(time.split(":")[0]);
  const isPM = time.includes("PM");
  const hour24 = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour);
  return hour24 >= 12 && hour24 < 17 ? "Lunch" : "Dinner";
}

export function getAvailableVenues(guestCount: number) {
  return venues.filter((v) => {
    const max = parseInt(v.capacity.match(/\d+/)?.[0] ?? "0");
    return guestCount <= max;
  });
}

export const venues = [
  { id: "VIP Room Front" as const, name: "VIP Room (Front)", capacity: "Max 24 seated", description: "Intimate private section of the VIP Room" },
  { id: "VIP Room Back" as const, name: "VIP Room (Back, with TV)", capacity: "Max 42 seated", description: "Larger private section with TV — U-shaped or long tables available" },
  { id: "Main Room" as const, name: "Main Dining (Semi-Private)", capacity: "Max 75 seated", description: "Semi-private main dining area" },
];

export interface MenuCourseItem {
  name: string;
  info: string;
  description?: string;
  supplement?: string;
}

export interface MenuCourse {
  name: string;
  note?: string;
  selectCount?: number;
  items: MenuCourseItem[];
}

export interface MenuItem {
  id: "Classico" | "Gustoso" | "Magnifico";
  name: string;
  tagline: string;
  price: number;
  priceLabel: string;
  lunchPrice?: number;
  lunchPriceLabel?: string;
  lunchOnly?: boolean;
  choiceNote?: string;
  description: string;
  highlights: { name: string; info: string }[];
  courses?: MenuCourse[];
}

export function isLunchPricing(time: string): boolean {
  if (!time) return false;
  const hour = parseInt(time.split(":")[0]);
  const isPM = time.includes("PM");
  const hour24 = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour);
  return hour24 >= 12 && hour24 < 17;
}

export const menus: MenuItem[] = [
  {
    id: "Classico" as const,
    name: "Classico",
    tagline: "Antipasti, Entrée & Dolci",
    price: 60,
    priceLabel: "$60 per person (Dinner)",
    lunchPrice: 50,
    lunchPriceLabel: "$50 per person (Lunch)",
    description: "A curated selection of authentic Italian dishes featuring family-style antipasti, a choice of entrée, and Tiramisu.",
    highlights: [
      { name: "Rigatoni Bolognese", info: "Rigatoni pasta with classic Bolognese sauce" },
      { name: "Chicken Parmigiana", info: "Breaded chicken breast, marinara, mozzarella, served with spaghetti al pomodoro" },
      { name: "Porchetta", info: "Roasted pork loin wrapped in crispy pork belly with fingerling potatoes" },
    ],
    courses: [
      {
        name: "Antipasti (Appetizers)",
        note: "Served family style · All three included",
        items: [
          { name: "Selezione di Salumi & Formaggi", info: "A curated selection of Italian cured meats and artisan cheeses", description: "Charcuterie and cheese selection" },
          { name: "Salumeria's Meatballs", info: "House-made meatballs in our signature tomato sauce", description: "Meatballs stewed in tomato sauce, fresh ricotta cheese" },
          { name: "Calamari e Gamberi", info: "Light fried wild caught New Zealand Turner calamari and shrimp", description: "Calamari and shrimp, vegetables, marinara sauce" },
        ],
      },
      {
        name: "Entrée",
        note: "Served individually · Choice of",
        items: [
          { name: "Rigatoni Bolognese", info: "Rigatoni pasta with classic Bolognese sauce", description: "Rigatoni with slow-cooked meat ragù" },
          { name: "Chicken Parmigiana", info: "Breaded chicken breast, marinara, mozzarella, spaghetti al pomodoro", description: "Breaded chicken, marinara, mozzarella, with spaghetti al pomodoro" },
          { name: "Porchetta", info: "Roasted pork loin wrapped in crispy pork belly", description: "Served with fingerling potatoes" },
        ],
      },
      {
        name: "Dolci",
        note: "Served individually",
        items: [
          { name: "Tiramisu", info: "Italy's most beloved dessert, meaning 'pick me up'", description: "Mascarpone cream, espresso-soaked lady fingers and cocoa" },
        ],
      },
    ],
  },
  {
    id: "Gustoso" as const,
    name: "Gustoso",
    tagline: "Antipasti, Salad, Entrée & Dolci",
    price: 70,
    priceLabel: "$70 per person",
    description: "An elevated experience with a Caesar salad, a choice of entrée including Branzino or Salmon, and two desserts family style.",
    highlights: [
      { name: "Branzino alla Livornese", info: "Branzino filet with tomato sauce, Taggiasca olives, capers, cherry tomatoes, served with spinach" },
      { name: "Chicken Parmigiana (or Milanese)", info: "Breaded chicken breast, marinara, mozzarella, with spaghetti al pomodoro" },
      { name: "Nutellino", info: "Nutella-stuffed calzone-style pizza" },
    ],
    courses: [
      {
        name: "Antipasti (Appetizers)",
        note: "Served family style · Preselect three",
        selectCount: 3,
        items: [
          { name: "Selezione di Salumi & Formaggi", info: "Italian cured meats and artisan cheeses", description: "Charcuterie and cheese selection" },
          { name: "Salumeria's Meatballs", info: "House-made meatballs in tomato sauce", description: "Meatballs stewed in tomato sauce, fresh ricotta cheese" },
          { name: "Calamari e Gamberi", info: "Light fried calamari and shrimp", description: "Calamari and shrimp, vegetables, marinara sauce" },
          { name: "Margherita Pizza", info: "Classic Neapolitan pizza", description: "Tomato sauce, mozzarella, basil" },
        ],
      },
      {
        name: "Salad",
        note: "Served individually",
        items: [
          { name: "Caesar Salad", info: "Classic Caesar salad", description: "Heart of romaine, garlic crostini" },
        ],
      },
      {
        name: "Entrée",
        note: "Served individually · Choice of",
        items: [
          { name: "Rigatoni Bolognese", info: "Rigatoni with classic Bolognese sauce", description: "Rigatoni with slow-cooked meat ragù" },
          { name: "Chicken Parmigiana (or Milanese)", info: "Breaded chicken breast, marinara, mozzarella", description: "Served with spaghetti al pomodoro" },
          { name: "Branzino alla Livornese", info: "Branzino: European sea bass in Livornese sauce", description: "Branzino filet, tomato sauce, Taggiasca olives, capers, cherry tomatoes, oregano, with spinach" },
          { name: "Salmon", info: "Grilled salmon", description: "Served with sautéed spinach" },
        ],
      },
      {
        name: "Dolci",
        note: "Served family style · Preselect two",
        selectCount: 2,
        items: [
          { name: "Tiramisu", info: "Italy's most beloved dessert", description: "Mascarpone cream, espresso-soaked lady fingers and cocoa" },
          { name: "Cannoli", info: "Classic Sicilian pastry", description: "Crispy cannoli filled with fresh ricotta mix" },
          { name: "Nutellino", info: "Nutella-stuffed calzone-style pizza", description: "A sweet, dessert-style pizza" },
        ],
      },
    ],
  },
  {
    id: "Magnifico" as const,
    name: "Magnifico",
    tagline: "Four Course · Includes Soft Drinks",
    price: 88,
    priceLabel: "$88 per person (includes soft drinks)",
    description: "Our most luxurious offering, featuring imported delicacies, prime cuts, and an unforgettable multi-course experience. Soft drinks included.",
    highlights: [
      { name: "Braised Short Ribs", info: "Barolo sauce, served with mashed potatoes" },
      { name: "NY Steak", info: "Grilled to your liking, served with fingerling potatoes" },
      { name: "Risotto ai Porcini", info: "Carnaroli rice, porcini mushrooms" },
    ],
    courses: [
      {
        name: "Antipasti (Appetizers)",
        note: "Served family style · Preselect three",
        selectCount: 3,
        items: [
          { name: "Selezione di Salumi & Formaggi", info: "Italian cured meats and artisan cheeses", description: "Charcuterie and cheese selection" },
          { name: "Carpaccio di Carne", info: "Marinated Angus beef carpaccio", description: "Mustard honey truffle, pickled onions and cornichons" },
          { name: "Salumeria's Meatballs", info: "House-made meatballs in tomato sauce", description: "Meatballs stewed in tomato sauce, fresh ricotta cheese" },
          { name: "Calamari e Gamberi", info: "Light fried calamari and shrimp", description: "Calamari and shrimp, vegetables, marinara sauce" },
          { name: "Margherita Pizza", info: "Classic Neapolitan pizza", description: "Tomato sauce, mozzarella, basil" },
        ],
      },
      {
        name: "Salad",
        note: "Served individually · Preselect one",
        selectCount: 1,
        items: [
          { name: "Caesar Salad", info: "Classic Caesar salad", description: "Heart of romaine, garlic crostini" },
        ],
      },
      {
        name: "Entrée",
        note: "Served individually · Preselect four",
        selectCount: 4,
        items: [
          { name: "Risotto ai Porcini", info: "Porcini mushroom risotto", description: "Carnaroli rice, porcini mushrooms" },
          { name: "Fettuccine Nere", info: "Black ink fettuccine", description: "Black ink fettuccine, wild caught shrimp, garlic, Calabrian chili oil, tomato sauce" },
          { name: "Braised Short Ribs", info: "Barolo sauce", description: "Served with mashed potatoes" },
          { name: "NY Steak", info: "Grilled to your liking", description: "Served with fingerling potatoes" },
          { name: "Chicken Parmigiana (or Milanese)", info: "Breaded chicken breast, marinara, mozzarella", description: "Served with spaghetti al pomodoro" },
          { name: "Salmon", info: "Grilled salmon", description: "Served with sautéed spinach" },
        ],
      },
      {
        name: "Dolci",
        note: "Served family style · All three included",
        items: [
          { name: "Tiramisu", info: "Italy's most beloved dessert", description: "Mascarpone cream, espresso-soaked lady fingers and cocoa" },
          { name: "Cannoli", info: "Classic Sicilian pastry", description: "Crispy cannoli filled with fresh ricotta mix" },
          { name: "Nutellino", info: "Nutella-stuffed calzone-style pizza", description: "A sweet, dessert-style pizza" },
        ],
      },
    ],
  },
];

export const barPackages = {
  "beer-wine": { "2hr": 45, "3hr": 55, label: "Wine / Beer / Prosecco / Softs" },
  "full-bar": { "2hr": 55, "3hr": 65, label: "Full Bar (Well Liquor, Cocktails, Wine, Beer)" },
};

export const openBarSelections = {
  rosso: [
    { name: "Primitivo San Marzano", region: "Puglia" },
    { name: "Nero d'Avola Colosi", region: "Sicilia" },
  ],
  bianchi: [
    { name: "Pinot Grigio Zenato", region: "Veneto" },
    { name: "Pecorino Fantini", region: "Abruzzo" },
  ],
  sparkling: [
    { name: "Prosecco Cin Cin", region: "Veneto" },
  ],
  beer: [
    { name: "Menabrea", detail: "" },
    { name: "Artisanal Italian Beer", detail: "Pils, Blond Ale, Red Ale, IPA" },
  ],
  cocktails: [
    { name: "Lychee Martini", ingredients: "Tito's Vodka, fresh lychees, lemon juice" },
    { name: "Classic Aperol Spritz", ingredients: "Aperol, prosecco, carbonated water" },
    { name: "Classic Margarita", ingredients: "Cazadores Blanco Tequila, lime juice, triple sec" },
    { name: "House Old Fashioned", ingredients: "Maker's Mark Bourbon, syrup, angostura & orange bitters" },
    { name: "Moscow Mule", ingredients: "Tito's Vodka, simple syrup, lime juice, soda water, ginger beer" },
  ],
  softDrinks: ["Coke", "Diet Coke", "Sprite"],
  nonAlcoholic: ["Aranciata", "Limonata", "Iced Tea", "Apple Juice"],
};

export const addonPrices = {
  tablecloths: { price: 0, label: "White Tablecloths", description: "Based on availability, request in advance" },
  avSpeaker: { price: 150, label: "JBL Speaker + 2 Microphones", description: "$150" },
  liveMusic: { price: 300, label: "Live Music", description: "Starts at $300" },
  ownMusician: { price: 0, label: "I will bring my own musician", description: "No charge" },
};

export function calculateSteakSupplement(data: BookingData): number {
  if (!data.menu || data.decideLater) return 0;
  const menu = menus.find((m) => m.id === data.menu);
  if (!menu?.courses) return 0;
  const selections = data.menuSelections || {};
  for (const course of menu.courses) {
    const chosen = selections[course.name] || [];
    const steakItem = course.items.find((i) => i.name === "NY Steak" && i.supplement);
    if (steakItem && chosen.includes("NY Steak")) {
      return 5;
    }
  }
  return 0;
}

export function calculateQuote(data: BookingData) {
  const menuItem = menus.find((m) => m.id === data.menu);
  const useLunchPrice = menuItem?.lunchPrice && isLunchPricing(data.time);
  const menuPerPerson = useLunchPrice ? menuItem.lunchPrice! : (menuItem?.price ?? 0);
  const adultCount = data.guestCount - (data.hasKids ? data.kidsCount : 0);
  const steakSupplement = calculateSteakSupplement(data);

  let barPerPerson = 0;
  if (data.beverageStrategy === "open-bar" && data.barType && data.barDuration) {
    barPerPerson = barPackages[data.barType][data.barDuration];
  }

  const adultSubtotal = (menuPerPerson + barPerPerson + steakSupplement) * adultCount;
  const kidsCount = data.hasKids ? data.kidsCount : 0;
  const kidsSubtotal = kidsCount > 0 ? (KIDS_MENU_PRICE + steakSupplement) * kidsCount : 0;
  const guestSubtotal = adultSubtotal + kidsSubtotal;

  let addonsTotal = 0;
  if (data.addons.tablecloths) addonsTotal += addonPrices.tablecloths.price;
  if (data.addons.avSpeaker) addonsTotal += addonPrices.avSpeaker.price;
  if (data.addons.liveMusic) addonsTotal += addonPrices.liveMusic.price;

  const subtotal = guestSubtotal + addonsTotal;
  const serviceCharge = Math.round(subtotal * 0.23 * 100) / 100;
  const salesTax = Math.round(subtotal * 0.08 * 100) / 100;
  const grandTotal = Math.round((subtotal + serviceCharge + salesTax) * 100) / 100;
  const isConsumption = data.beverageStrategy === "consumption";
  const perPersonTotal = menuPerPerson + barPerPerson + steakSupplement;
  const isLunch = useLunchPrice ?? false;

  return { menuPerPerson, barPerPerson, steakSupplement, perPersonTotal, adultCount, kidsCount: data.hasKids ? data.kidsCount : 0, guestSubtotal, addonsTotal, subtotal, serviceCharge, salesTax, grandTotal, isConsumption, isLunch };
}
