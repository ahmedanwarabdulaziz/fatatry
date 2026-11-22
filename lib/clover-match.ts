// Suggests which Clover item a website menu item (or one of its sizes) corresponds to.
// Pure functions: no network or database access.

export interface CloverItemLite {
    id: string;
    name: string;
    price: number; // dollars
    categories: string[];
}

export interface MatchSuggestion {
    cloverId: string;
    score: number; // 0..1, overall ranking score
    nameScore: number; // 0..1, name similarity only
    priceMatches: boolean;
}

// Spelling variants seen between the website and Clover
const SYNONYMS: [RegExp, string][] = [
    [/\bkoshary\b|\bkoshri\b/g, "koshari"],
    [/\btawouk\b|\btaook\b/g, "tawook"],
    [/\bsoujuk\b|\bsujuok\b|\bsoujouk\b/g, "sujuk"],
    [/\bbastirma\b|\bbasterma\b|\bpastrami\b/g, "pastirma"],
    [/\bshops\b/g, "chops"],
    [/\bmeduim\b/g, "medium"],
    [/\bbachamel\b/g, "bechamel"],
    [/\bmolokhya\b|\bmolokia\b/g, "molokhia"],
    [/\bkabab\b/g, "kebab"],
    [/\biskandarani\b/g, "iskandrani"],
    [/\bhawashi\b/g, "hawawshi"],
    [/\bbeeef\b/g, "beef"],
    [/\bsavory\b/g, "savoury"],
    [/\bkashta\b/g, "keshta"],
    [/\bsakalnce\b/g, "sakalance"],
    [/\bcraft\b/g, "kraft"],
    [/\bchocalate\b/g, "chocolate"],
    [/\bboild\b/g, "boiled"],
    [/\bmixed\b/g, "mix"],
    [/\bhot dog\b/g, "hotdog"],
];

// Words that describe the category rather than the dish
const STOP = new Set(["savoury", "sweet", "pies", "with", "and", "the", "of", "a", "plate", "pcs", "pc", "egyptian", "style", "alexandrian", "beef", "sausage", "liver", "w"]);

export function normalize(name: string): string[] {
    let s = name.toLowerCase().replace(/[’'`]/g, "").replace(/&/g, " and ").replace(/[^a-z0-9 ]+/g, " ");
    for (const [re, to] of SYNONYMS) s = s.replace(re, to);
    return s.split(/\s+/).filter(Boolean);
}

function keyTokens(name: string): Set<string> {
    const all = normalize(name);
    const key = all.filter((t) => !STOP.has(t));
    return new Set(key.length ? key : all);
}

function dice(a: Set<string>, b: Set<string>): number {
    if (!a.size || !b.size) return 0;
    let inter = 0;
    a.forEach((t) => { if (b.has(t)) inter++; });
    return (2 * inter) / (a.size + b.size);
}

const CATERING_CATEGORY = /catering|tray|events|buffet/i;

/**
 * Best Clover matches for a website item.
 * @param name  website item name (plus size label when matching a size)
 * @param price website price in dollars
 * @param catering whether the website item is on the catering menu
 */
export function suggestMatches(name: string, price: number, catering: boolean, clover: CloverItemLite[], limit = 3): MatchSuggestion[] {
    const target = keyTokens(name);
    const scored = clover.map((c) => {
        const nameScore = dice(target, keyTokens(c.name));
        let score = nameScore;
        const priceMatches = price > 0 && Math.abs(c.price - price) < 0.01;
        if (priceMatches) score += 0.2;
        else if (price > 0 && c.price > 0 && Math.max(price, c.price) / Math.min(price, c.price) > 1.5) score -= 0.2;
        const cloverCatering = c.categories.some((x) => CATERING_CATEGORY.test(x));
        if (c.categories.length && cloverCatering !== catering) score -= 0.25;
        if (!c.categories.length) score -= 0.1; // uncategorised Clover items are often old duplicates
        return { cloverId: c.id, score: Math.max(0, Math.min(1, score)), nameScore, priceMatches };
    });
    return scored.filter((s) => s.score > 0.3).sort((a, b) => b.score - a.score).slice(0, limit);
}

/** A suggestion strong enough to accept in bulk: same price, very similar name, clearly ahead of the next option. */
export function isStrong(s: MatchSuggestion | undefined, runnerUp?: MatchSuggestion): boolean {
    if (!s) return false;
    const clearWinner = !runnerUp || s.score - runnerUp.score >= 0.1;
    return clearWinner && s.priceMatches && s.nameScore >= 0.75;
}
