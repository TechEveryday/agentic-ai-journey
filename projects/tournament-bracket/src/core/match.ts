export interface Match {
  id: string;
  round: number; // 1-based, round 1 is the first round
  position: number; // 0-based index of this match within its round
  participantA: string | null; // Participant id, or null (bye / not yet decided)
  participantB: string | null; // Participant id, or null (bye / not yet decided)
  winnerId: string | null;
}
