/**
 * Client-side sentiment analysis using keyword matching.
 * This runs entirely in the browser — no API calls.
 */

export interface SentimentResult {
  label: 'positive' | 'negative' | 'neutral';
  score: number;        // 0–1
  confidence: number;   // 0–1
  keywords: {
    word: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    index: number;
  }[];
  positiveCount: number;
  negativeCount: number;
}

export function analyzeSentiment(
  text: string,
  keywords: { positive: string[]; negative: string[]; neutral: string[] },
  thresholds: { positive: number; negative: number }
): SentimentResult {
  if (!text.trim()) {
    return {
      label: 'neutral',
      score: 0.5,
      confidence: 0,
      keywords: [],
      positiveCount: 0,
      negativeCount: 0,
    };
  }

  const lower = text.toLowerCase();
  const words = lower.split(/\W+/).filter(Boolean);
  const found: SentimentResult['keywords'] = [];

  // Build a map of word positions in original text for highlighting
  const wordPositions: Record<string, number> = {};
  let cursor = 0;
  for (const word of words) {
    const idx = lower.indexOf(word, cursor);
    wordPositions[word] = idx;
    cursor = idx + word.length;
  }

  let posScore = 0;
  let negScore = 0;

  for (const word of words) {
    if (keywords.positive.includes(word)) {
      posScore += 1;
      found.push({ word, sentiment: 'positive', index: wordPositions[word] ?? 0 });
    } else if (keywords.negative.includes(word)) {
      negScore += 1;
      found.push({ word, sentiment: 'negative', index: wordPositions[word] ?? 0 });
    } else if (keywords.neutral.includes(word)) {
      found.push({ word, sentiment: 'neutral', index: wordPositions[word] ?? 0 });
    }
  }

  const total = posScore + negScore;
  const rawScore = total > 0 ? posScore / total : 0.5;
  const confidence = Math.min(total / Math.max(words.length * 0.1, 1), 1);

  let label: 'positive' | 'negative' | 'neutral';
  if (total === 0) {
    label = 'neutral';
  } else if (rawScore >= thresholds.positive) {
    label = 'positive';
  } else if (rawScore <= thresholds.negative) {
    label = 'negative';
  } else {
    label = 'neutral';
  }

  return {
    label,
    score: rawScore,
    confidence,
    keywords: found,
    positiveCount: posScore,
    negativeCount: negScore,
  };
}

export function highlightKeywords(text: string, keywords: SentimentResult['keywords']): string {
  if (keywords.length === 0) return text;

  // Sort by index descending to replace from end to start (preserve indices)
  const sorted = [...keywords].sort((a, b) => b.index - a.index);
  let result = text;

  for (const kw of sorted) {
    const regex = new RegExp(`\\b${kw.word}\\b`, 'gi');
    const colorClass =
      kw.sentiment === 'positive' ? 'text-accent-green' :
      kw.sentiment === 'negative' ? 'text-red-400' :
      'text-text-muted';
    result = result.replace(regex, `<mark class="${colorClass} bg-transparent font-medium">$&</mark>`);
  }

  return result;
}
