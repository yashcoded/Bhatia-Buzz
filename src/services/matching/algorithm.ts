import { MatrimonialProfile, Preferences, Match } from '../../types';

interface MatchScore {
  profileId: string;
  score: number;
  reasons: string[];
}

// Calculate compatibility score between two profiles
export const calculateMatchScore = (
  profile1: MatrimonialProfile,
  profile2: MatrimonialProfile
): number => {
  let score = 0;
  const reasons: string[] = [];

  // Age compatibility (within preferred range)
  const age1 = profile1.personalInfo.age;
  const age2 = profile2.personalInfo.age;
  
  const prefs1 = profile1.preferences;
  const prefs2 = profile2.preferences;

  // Check if ages match preferences
  if (prefs1.minAge && prefs1.maxAge) {
    if (age2 >= prefs1.minAge && age2 <= prefs1.maxAge) {
      score += 20;
      reasons.push('Age matches preferences');
    }
  }

  if (prefs2.minAge && prefs2.maxAge) {
    if (age1 >= prefs2.minAge && age1 <= prefs2.maxAge) {
      score += 20;
      reasons.push('Age matches their preferences');
    }
  }

  // Education compatibility
  if (prefs1.education && prefs1.education.length > 0) {
    if (prefs1.education.includes(profile2.personalInfo.education)) {
      score += 15;
      reasons.push('Education matches preferences');
    }
  }

  if (prefs2.education && prefs2.education.length > 0) {
    if (prefs2.education.includes(profile1.personalInfo.education)) {
      score += 15;
      reasons.push('Education matches their preferences');
    }
  }

  // Location compatibility
  if (prefs1.location && prefs1.location.length > 0) {
    if (prefs1.location.includes(profile2.personalInfo.location)) {
      score += 15;
      reasons.push('Location matches preferences');
    }
  }

  if (prefs2.location && prefs2.location.length > 0) {
    if (prefs2.location.includes(profile1.personalInfo.location)) {
      score += 15;
      reasons.push('Location matches their preferences');
    }
  }

  // Same location bonus
  if (profile1.personalInfo.location === profile2.personalInfo.location) {
    score += 10;
    reasons.push('Same location');
  }

  // Education level similarity
  if (profile1.personalInfo.education === profile2.personalInfo.education) {
    score += 10;
    reasons.push('Similar education level');
  }

  // Gender compatibility (opposite genders)
  if (profile1.personalInfo.gender !== profile2.personalInfo.gender) {
    score += 10;
    reasons.push('Compatible genders');
  } else {
    score -= 50; // Same gender is not a match for matrimonial
    reasons.push('Same gender (not compatible)');
  }

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
};

// Find matches for a profile
export const findMatches = (
  profile: MatrimonialProfile,
  allProfiles: MatrimonialProfile[],
  minScore: number = 50
): MatchScore[] => {
  const matches: MatchScore[] = [];

  for (const otherProfile of allProfiles) {
    // Skip self
    if (otherProfile.id === profile.id) continue;

    // Skip if not approved
    if (otherProfile.status !== 'approved') continue;

    // Skip if same gender (for traditional matrimonial)
    if (profile.personalInfo.gender === otherProfile.personalInfo.gender) continue;

    const score = calculateMatchScore(profile, otherProfile);
    
    if (score >= minScore) {
      const reasons: string[] = [];
      // Recalculate to get reasons (simplified - in real implementation, return reasons from calculation)
      matches.push({
        profileId: otherProfile.id,
        score,
        reasons,
      });
    }
  }

  // Sort by score descending
  matches.sort((a, b) => b.score - a.score);

  return matches;
};

// Generate match object
export const createMatch = (
  profileId1: string,
  profileId2: string,
  score: number
): Omit<Match, 'id' | 'createdAt'> => {
  return {
    profileId1,
    profileId2,
    matchScore: score,
    status: 'pending',
  };
};

