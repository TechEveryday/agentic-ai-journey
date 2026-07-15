import { Box, Typography } from '@mui/material';
import { PersonOutline as PersonIcon } from '@mui/icons-material';

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
      <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        No contacts yet
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Add one above to get started
      </Typography>
    </Box>
  );
}
