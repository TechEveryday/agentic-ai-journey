import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Alert,
  CircularProgress,
  Box,
  Button,
  TextField,
} from '@mui/material';
import { useBracket } from '@/application';
import { LocalStorageBracketRepository } from '@/infrastructure';
import { createParticipant, getChampion, type Participant } from '@/core';
import { ParticipantForm } from '../components/ParticipantForm';
import { ParticipantList } from '../components/ParticipantList';
import { BracketView } from '../components/BracketView';
import { ChampionBanner } from '../components/ChampionBanner';

const repository = new LocalStorageBracketRepository();

export function BracketPage() {
  const {
    currentBracket,
    isLoading,
    error,
    createBracket,
    recordWinner,
  } = useBracket(repository);

  const [tournamentName, setTournamentName] = useState('');
  const [pendingParticipants, setPendingParticipants] = useState<Participant[]>([]);
  const [isCreating, setIsCreating] = useState(true);
  const [hasHandledInitialLoad, setHasHandledInitialLoad] = useState(false);

  // Once the initial load from the repository resolves, show the loaded
  // bracket (if any) instead of the participant form. This only fires once,
  // so it never fights with a later explicit "New Tournament" click.
  useEffect(() => {
    if (!isLoading && !hasHandledInitialLoad) {
      setHasHandledInitialLoad(true);
      if (currentBracket) {
        setIsCreating(false);
      }
    }
  }, [isLoading, currentBracket, hasHandledInitialLoad]);

  const handleAddParticipant = (name: string) => {
    setPendingParticipants((prev) => [...prev, createParticipant(name, prev.length + 1)]);
  };

  const handleRemoveParticipant = (id: string) => {
    setPendingParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const handleGenerateBracket = async () => {
    await createBracket(tournamentName.trim() || 'Untitled Tournament', pendingParticipants);
    setIsCreating(false);
    setPendingParticipants([]);
    setTournamentName('');
  };

  const handleNewTournament = () => {
    setIsCreating(true);
  };

  const showBracket = currentBracket !== null && !isCreating;
  const champion = currentBracket ? getChampion(currentBracket) : null;
  const canGenerate = pendingParticipants.length >= 2 && tournamentName.trim().length > 0;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Tournament Bracket Maker
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : showBracket && currentBracket ? (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="h2">
              {currentBracket.name}
            </Typography>
            <Button variant="outlined" onClick={handleNewTournament}>
              New Tournament
            </Button>
          </Box>

          {champion && <ChampionBanner champion={champion} />}

          <BracketView bracket={currentBracket} onSelectWinner={recordWinner} />
        </>
      ) : (
        <>
          <TextField
            fullWidth
            label="Tournament name"
            placeholder="Tournament name"
            value={tournamentName}
            onChange={(e) => setTournamentName(e.target.value)}
            size="small"
            sx={{ mb: 3 }}
          />

          <ParticipantForm onAdd={handleAddParticipant} />
          <ParticipantList participants={pendingParticipants} onRemove={handleRemoveParticipant} />

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" disabled={!canGenerate} onClick={handleGenerateBracket}>
              Generate Bracket
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
}
