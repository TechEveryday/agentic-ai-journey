import { Box, Typography } from '@mui/material';
import type { Bracket } from '@/core';
import { getRounds } from '@/core';
import { MatchCard } from './MatchCard';

interface BracketViewProps {
  bracket: Bracket;
  onSelectWinner: (matchId: string, participantId: string) => void;
}

function roundLabel(roundIndex: number, totalRounds: number): string {
  const roundsFromEnd = totalRounds - roundIndex;
  if (roundsFromEnd === 1) return 'Final';
  if (roundsFromEnd === 2) return 'Semifinal';
  if (roundsFromEnd === 3) return 'Quarterfinal';
  return `Round ${roundIndex + 1}`;
}

export function BracketView({ bracket, onSelectWinner }: BracketViewProps) {
  const rounds = getRounds(bracket);
  const participantsById = new Map(bracket.participants.map((p) => [p.id, p]));

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 4,
        overflowX: 'auto',
        py: 2,
      }}
    >
      {rounds.map((matches, roundIndex) => (
        <Box
          key={roundIndex}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            gap: 3,
            minWidth: 220,
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" sx={{ textAlign: 'center' }}>
            {roundLabel(roundIndex, rounds.length)}
          </Typography>
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              participantsById={participantsById}
              onSelectWinner={onSelectWinner}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
}
