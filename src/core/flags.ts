export interface FlagRule {
  emoji: string;
  patterns: RegExp[];
}

const FLAG_RULES: FlagRule[] = [
  {
    emoji: "🇭🇰",
    patterns: [/香港/i, /\bhk\b/i, /hong[\s-]*kong/i]
  },
  {
    emoji: "🇹🇼",
    patterns: [/台湾|台北|新北|高雄|台中/i, /\btw\b/i, /taiwan|taipei/i]
  },
  {
    emoji: "🇯🇵",
    patterns: [/日本|东京|大阪|埼玉|名古屋/i, /\bjp\b/i, /japan|tokyo|osaka|nagoya/i]
  },
  {
    emoji: "🇸🇬",
    patterns: [/新加坡/i, /\bsg\b/i, /singapore/i]
  },
  {
    emoji: "🇺🇸",
    patterns: [
      /美国|洛杉矶|西雅图|芝加哥|纽约|圣何塞|达拉斯|硅谷/i,
      /\bus\b/i,
      /\busa\b/i,
      /united[\s-]*states|america/i,
      /los[\s-]*angeles|seattle|chicago|new[\s-]*york|san[\s-]*jose|dallas|silicon[\s-]*valley/i
    ]
  },
  {
    emoji: "🇰🇷",
    patterns: [/韩国|首尔/i, /\bkr\b/i, /korea|seoul/i]
  },
  {
    emoji: "🇷🇺",
    patterns: [/俄罗斯|莫斯科|圣彼得堡|伯力|海参崴/i, /\bru\b/i, /russia|moscow|russian|saint[\s-]*petersburg|vladivostok/i]
  },
  {
    emoji: "🇵🇭",
    patterns: [/菲律宾|马尼拉/i, /\bph\b/i, /\bmnl\b/i, /philippines|manila/i]
  },
  {
    emoji: "🇦🇪",
    patterns: [/迪拜|阿联酋/i, /\bae\b/i, /\buae\b/i, /dubai|dibai|uae|emirates/i]
  },
  {
    emoji: "🇬🇧",
    patterns: [/英国|伦敦/i, /\buk\b/i, /united[\s-]*kingdom|london|england/i]
  },
  {
    emoji: "🇩🇪",
    patterns: [/德国|法兰克福|柏林/i, /\bde\b/i, /germany|frankfurt|berlin/i]
  },
  {
    emoji: "🇫🇷",
    patterns: [/法国|巴黎/i, /\bfr\b/i, /france|paris/i]
  },
  {
    emoji: "🇨🇦",
    patterns: [/加拿大|多伦多|温哥华/i, /\bca\b/i, /canada|toronto|vancouver/i]
  },
  {
    emoji: "🇦🇺",
    patterns: [/澳大利亚|悉尼|墨尔本/i, /\bau\b/i, /australia|sydney|melbourne/i]
  },
  {
    emoji: "🇳🇱",
    patterns: [/荷兰|阿姆斯特丹/i, /\bnl\b/i, /netherlands|amsterdam/i]
  },
  {
    emoji: "🇮🇳",
    patterns: [/印度|孟买/i, /\bin\b/i, /india|mumbai/i]
  }
];

function isRegionalIndicatorSymbol(char: string | undefined): boolean {
  if (!char) {
    return false;
  }

  const value = char.codePointAt(0) ?? 0;
  return value >= 0x1f1e6 && value <= 0x1f1ff;
}

export function hasEmojiPrefix(value: string): boolean {
  const trimmed = value.trimStart();
  const chars = Array.from(trimmed);
  const first = chars[0];
  const second = chars[1];

  if (isRegionalIndicatorSymbol(first) && isRegionalIndicatorSymbol(second)) {
    return true;
  }

  const codePoint = first?.codePointAt(0) ?? 0;
  return codePoint >= 0x1f300 && codePoint <= 0x1faff;
}

export function applyFlagToName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed || hasEmojiPrefix(trimmed)) {
    return name;
  }

  const normalized = typeof trimmed.normalize === "function" ? trimmed.normalize("NFKC") : trimmed;
  for (const rule of FLAG_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(normalized))) {
      return `${rule.emoji} ${trimmed}`;
    }
  }

  return name;
}

export function getFlagRules(): FlagRule[] {
  return FLAG_RULES.slice();
}
