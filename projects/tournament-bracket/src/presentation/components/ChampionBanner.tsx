import { Paper, Typography, Box } from '@mui/material';
import { EmojiEvents as TrophyIcon } from '@mui/icons-material';
import type { Participant } from '@/core';

interface ChampionBannerProps {
  champion: Participant;
}

export function ChampionBanner({ champion }: ChampionBannerProps) {
  return (
    <Paper
      elevation={3}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 3,
        mb: 3,
        bgcolor: 'success.light',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TrophyIcon sx={{ fontSize: 40, color: 'success.dark' }} />
        <Typography variant="h5" component="p" sx={{ fontWeight: 700 }}>
          Champion: {champion.name}
        </Typography>
      </Box>
    </Paper>
  );
}
