import { IInterviewRequest } from "./match.model";

export interface MatchResult {
  matched: boolean;
  candidate?: IInterviewRequest;
  score?: number;
}

export class MatchingEngine {
  static findBestMatch(
    current: IInterviewRequest,
    candidates: IInterviewRequest[]
  ): MatchResult {
    if (!candidates.length) {
      return {
        matched: false,
      };
    }

    let bestCandidate: IInterviewRequest | undefined;
    let highestScore = -1;

    for (const candidate of candidates) {
      const score = this.calculateCompatibilityScore(
        current,
        candidate
      );

      if (score > highestScore) {
        highestScore = score;
        bestCandidate = candidate;
      }
    }

    if (!bestCandidate) {
      return {
        matched: false,
      };
    }

    return {
      matched: true,
      candidate: bestCandidate,
      score: highestScore,
    };
  }

  private static calculateCompatibilityScore(
    current: IInterviewRequest,
    candidate: IInterviewRequest
  ): number {
    let score = 0;

    if (
      current.interviewType ===
      candidate.interviewType
    ) {
      score += 40;
    }

    if (
      current.difficulty ===
      candidate.difficulty
    ) {
      score += 20;
    }

    if (
      current.preferredLanguage ===
      candidate.preferredLanguage
    ) {
      score += 20;
    }

    if (
      current.duration ===
      candidate.duration
    ) {
      score += 20;
    }

    return score;
  }
}