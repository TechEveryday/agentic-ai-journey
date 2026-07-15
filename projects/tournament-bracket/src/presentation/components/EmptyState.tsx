import { Box, Typography } from '@mui/material';
import { EmojiEvents as TrophyIcon } from '@mui/icons-material';

export function EmptyState() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
      }}
    >
      <TrophyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        No participants yet
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Add at least 2 participants to generate a bracket
      </Typography>
    </Box>
  );
}
