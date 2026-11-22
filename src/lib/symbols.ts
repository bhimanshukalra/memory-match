// Card symbols and their spoken names (emoji read poorly with screen readers).
// 18 entries cover the largest level (6x6 = 18 pairs).
export const SYMBOL_NAMES: Record<string, string> = {
  "🍎": "apple",
  "🐶": "dog",
  "🚀": "rocket",
  "🎲": "dice",
  "🌵": "cactus",
  "🎧": "headphones",
  "🦊": "fox",
  "⚡": "lightning bolt",
  "🐙": "octopus",
  "🍕": "pizza",
  "🎸": "guitar",
  "⚽": "soccer ball",
  "🌈": "rainbow",
  "🚗": "car",
  "🦄": "unicorn",
  "🍩": "donut",
  "🎈": "balloon",
  "🔥": "fire",
};

export const SYMBOLS = Object.keys(SYMBOL_NAMES);

export const symbolName = (symbol: string) => SYMBOL_NAMES[symbol] ?? symbol;
