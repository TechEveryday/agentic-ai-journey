import { Paper, ButtonBase, Typography, Box } from '@mui/material';
import { EmojiEvents as TrophyIcon } from '@mui/icons-material';
import type { Match, Participant } from '@/core';

interface MatchCardProps {
  match: Match;
  participantsById: Map<string, Participant>;
  onSelectWinner: (matchId: string, participantId: string) => void;
}

function slotLabel(
  participantId: string | null,
  round: number,
  participantsById: Map<string, Participant>
): string {
  if (participantId) {
    return participantsById.get(participantId)?.name ?? 'Unknown';
  }
  return round === 1 ? 'BYE' : 'TBD';
}

export function MatchCard({ match, participantsById, onSelectWinner }: MatchCardProps) {
  const isDecided = match.winnerId !== null;

  const renderSlot = (participantId: string | null) => {
    const label = slotLabel(participantId, match.round, participantsById);
    const isWinner = participantId !== null && participantId === match.winnerId;
    const isClickable = !isDecided && participantId !== null;

    return (
      <ButtonBase
        disabled={!isClickable}
        onClick={() => participantId && onSelectWinner(match.id, participantId)}
        sx={{
          width: '100%',
          justifyContent: 'flex-start',
          px: 1.5,
          py: 1,
          textAlign: 'left',
          borderRadius: 1,
          bgcolor: isWinner ? 'success.light' : 'transparent',
          '&:hover': isClickable ? { bgcolor: 'action.hover' } : undefined,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: isWinner ? 700 : 400,
            color: participantId ? 'text.primary' : 'text.disabled',
            fontStyle: participantId ? 'normal' : 'italic',
          }}
        >
          {label}
        </Typography>
        {isWinner && <TrophyIcon fontSize="small" sx={{ ml: 1, color: 'success.dark' }} />}
      </ButtonBase>
    );
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        width: 220,
        overflow: 'hidden',
      }}
      data-testid={`match-${match.id}`}
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        {renderSlot(match.participantA)}
      </Box>
      <Box>{renderSlot(match.participantB)}</Box>
    </Paper>
  );
}
