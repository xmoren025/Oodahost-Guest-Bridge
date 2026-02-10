// src/utils/priorityLogic.js

/**
 * DICTIONARY
 * English keywords mapped to urgency weights.
 */
const DICTIONARY = {
  CRITICAL: {
    words: ['leak', 'flood', 'fire', 'smoke', 'blood', 'danger', 'broken glass', 'lock out', 'locked out', 'emergency', 'mold'],
    weight: 20
  },
  HIGH: {
    words: ['wifi', 'internet', 'ac', 'air conditioning', 'heat', 'cold', 'freezing', 'power', 'electricity', 'toilet', 'clog', 'bug', 'insect'],
    weight: 10
  },
  MEDIUM: {
    words: ['towel', 'sheet', 'pillow', 'soap', 'clean', 'dirty', 'noise', 'noisy', 'parking', 'key', 'remote'],
    weight: 5
  },
  LOW: {
    words: ['late checkout', 'question', 'info', 'recommendation', 'taxi', 'reservation'],
    weight: 1
  }
};

/**
 * analyzePriority
 * Calculates a TotalScore based on keywords found in distinct segments of the text.
 * Connectors (and, also, etc.) only add value if they introduce a new keyword.
 */
export const analyzePriority = (category, description) => {
  let totalScore = 0;
  
  // 1. Normalize Text
  const fullText = `${category} ${description}`.toLowerCase();

  // 2. Split text into logical segments based on connectors
  // This Regex looks for: " and ", " also ", " & ", ",", " + ", " plus "
  const connectorsRegex = / and | also | plus | & |,| \+ | moreover | as well as /g;
  
  // Example: "Wifi is broken and I need towels" -> ["wifi is broken", "i need towels"]
  const segments = fullText.split(connectorsRegex);

  // 3. Score each segment individually
  segments.forEach(segment => {
    let segmentScore = 0;
    const cleanSegment = segment.trim();

    // Check this segment against our dictionary
    for (const level in DICTIONARY) {
      const { words, weight } = DICTIONARY[level];
      
      // If the segment contains a keyword from this level...
      if (words.some(word => cleanSegment.includes(word))) {
        // We take the highest weight found in this segment.
        // e.g. if a segment has "leak" (20) and "water" (maybe 5), we count 20 for this segment.
        segmentScore = Math.max(segmentScore, weight);
      }
    }

    // Add this segment's score to the total
    totalScore += segmentScore;
  });

  // console.log(`Analyzed "${fullText}" -> Segments: ${segments.length} -> Score: ${totalScore}`);

  // 4. Map TotalScore to ClickUp Priority (1-4)
  
  // Score >= 20 -> Critical (Urgent) (e.g., 1 Critical item OR 2 High items)
  if (totalScore >= 20) return 1; 
  
  // Score >= 10 -> High (e.g., 1 High item OR 2 Medium items)
  if (totalScore >= 10) return 2;
  
  // Score >= 5 -> Normal
  if (totalScore >= 5) return 3;
  
  // Default -> Low
  return 4; 
};