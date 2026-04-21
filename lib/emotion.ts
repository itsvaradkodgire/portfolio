/**
 * Client-side multi-emotion detection using lexicon matching.
 * Detects 7 emotion categories with per-emotion confidence scores.
 * Runs entirely in the browser — zero API calls.
 */

export type EmotionLabel = 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'disgust' | 'neutral';

export interface EmotionScore {
  label: EmotionLabel;
  score: number;       // raw keyword hit count
  confidence: number;  // 0–1, normalized across all emotions
}

export interface EmotionResult {
  dominant: EmotionLabel;
  dominantConfidence: number;
  scores: EmotionScore[];
  matchedWords: { word: string; emotion: EmotionLabel; index: number }[];
}

const LEXICON: Record<EmotionLabel, string[]> = {
  joy: [
    'happy', 'happiness', 'joy', 'joyful', 'love', 'amazing', 'wonderful', 'fantastic',
    'awesome', 'excited', 'excitement', 'thrilled', 'delightful', 'brilliant', 'great',
    'excellent', 'good', 'superb', 'incredible', 'spectacular', 'pleased', 'cheerful',
    'glad', 'euphoric', 'blissful', 'ecstatic', 'grateful', 'thankful', 'perfect',
    'outstanding', 'marvelous', 'impressive', 'best', 'fun', 'enjoy', 'enjoying',
  ],
  sadness: [
    'sad', 'unhappy', 'miserable', 'depressed', 'depression', 'heartbroken', 'lonely',
    'cry', 'crying', 'tears', 'sorrowful', 'grief', 'gloomy', 'melancholy', 'hopeless',
    'down', 'upset', 'disappointed', 'disheartened', 'hurt', 'pain', 'loss', 'lost',
    'empty', 'broken', 'suffering', 'devastated', 'regret', 'sorry', 'mourn', 'despair',
  ],
  anger: [
    'angry', 'anger', 'furious', 'hate', 'rage', 'annoyed', 'frustrated', 'frustrating',
    'mad', 'livid', 'outraged', 'infuriated', 'seething', 'enraged', 'irate', 'incensed',
    'terrible', 'awful', 'horrible', 'dreadful', 'useless', 'pathetic', 'disgusted',
    'unacceptable', 'ridiculous', 'absurd', 'stupid', 'worst', 'hate', 'hating',
  ],
  fear: [
    'afraid', 'scared', 'terrified', 'fear', 'fearful', 'worried', 'worry', 'anxious',
    'anxiety', 'nervous', 'nervousness', 'dread', 'panic', 'paranoid', 'horror', 'horrified',
    'frightened', 'spooked', 'uneasy', 'apprehensive', 'dreading', 'terror', 'phobia',
    'threat', 'threatening', 'danger', 'dangerous', 'risk', 'unsafe',
  ],
  surprise: [
    'surprised', 'surprise', 'shocked', 'shock', 'amazed', 'astonished', 'unexpected',
    'unbelievable', 'stunned', 'dumbfounded', 'astounded', 'whoa', 'wow', 'omg',
    'unimaginable', 'incredible', 'extraordinary', 'remarkable', 'sudden', 'suddenly',
    'wait', 'really', 'seriously', 'bizarre', 'weird', 'strange', 'odd',
  ],
  disgust: [
    'disgusting', 'disgusted', 'gross', 'revolting', 'repulsive', 'nauseating', 'vile',
    'yuck', 'ugh', 'appalling', 'repulsed', 'sickening', 'foul', 'nasty', 'repugnant',
    'offensive', 'hideous', 'abhorrent', 'abominable', 'loathing', 'loathe', 'cringe',
    'cringing', 'eww', 'disgusts', 'putrid', 'rank',
  ],
  neutral: [
    'okay', 'ok', 'fine', 'alright', 'average', 'normal', 'typical', 'standard',
    'regular', 'moderate', 'fair', 'mediocre', 'adequate', 'acceptable', 'decent',
  ],
};

export function analyzeEmotions(text: string): EmotionResult {
  const lower = text.toLowerCase();
  const words = lower.split(/\W+/).filter(Boolean);

  // Track first occurrence index of each word for highlighting
  const wordIndices: Record<string, number> = {};
  let cursor = 0;
  for (const word of words) {
    const idx = lower.indexOf(word, cursor);
    if (!(word in wordIndices)) wordIndices[word] = idx;
    cursor = idx + word.length;
  }

  const hitCounts: Record<EmotionLabel, number> = {
    joy: 0, sadness: 0, anger: 0, fear: 0, surprise: 0, disgust: 0, neutral: 0,
  };
  const matched: EmotionResult['matchedWords'] = [];

  for (const word of words) {
    for (const [emotion, lexicon] of Object.entries(LEXICON) as [EmotionLabel, string[]][]) {
      if (lexicon.includes(word)) {
        hitCounts[emotion] += 1;
        // Only add first match per word per emotion
        if (!matched.find((m) => m.word === word && m.emotion === emotion)) {
          matched.push({ word, emotion, index: wordIndices[word] ?? 0 });
        }
        break; // a word belongs to one emotion category
      }
    }
  }

  const totalHits = Object.values(hitCounts).reduce((a, b) => a + b, 0);

  const scores: EmotionScore[] = (Object.entries(hitCounts) as [EmotionLabel, number][]).map(
    ([label, score]) => ({
      label,
      score,
      confidence: totalHits > 0 ? score / totalHits : label === 'neutral' ? 1 : 0,
    }),
  );

  // Sort by confidence descending
  scores.sort((a, b) => b.confidence - a.confidence);

  const dominant = totalHits === 0 ? 'neutral' : scores[0].label;
  const dominantConf = totalHits === 0 ? 1 : scores[0].confidence;

  return { dominant, dominantConfidence: dominantConf, scores, matchedWords: matched };
}

export function highlightEmotions(text: string, matches: EmotionResult['matchedWords']): string {
  if (matches.length === 0) return text;
  const COLORS: Record<EmotionLabel, string> = {
    joy:      'color:#4ade80',
    sadness:  'color:#60a5fa',
    anger:    'color:#f87171',
    fear:     'color:#c084fc',
    surprise: 'color:#fbbf24',
    disgust:  'color:#f97316',
    neutral:  'color:#8a8690',
  };
  const sorted = [...matches].sort((a, b) => b.index - a.index);
  let result = text;
  for (const m of sorted) {
    const regex = new RegExp(`\\b${m.word}\\b`, 'gi');
    result = result.replace(
      regex,
      `<mark style="${COLORS[m.emotion]};background:transparent;font-weight:600">$&</mark>`,
    );
  }
  return result;
}
