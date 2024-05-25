import React, { useEffect, useState } from 'react';
import { Button, CircularProgress, Alert, Grid, Box, Typography, useTheme } from '@mui/material';
import { fetchWordleResult, WordleRequestItem, WordleResponse } from '../api/api';

const WordleBot: React.FC = () => {
  const theme = useTheme();
  const [initialGuess, setInitialGuess] = useState<string>('');
  const [guesses, setGuesses] = useState<WordleRequestItem[]>([]);
  const [userClueColors, setUserClueColors] = useState<string[]>(['white', 'white', 'white', 'white', 'white']);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchWordleResult([])
      .then((response: WordleResponse) => {
        setInitialGuess(response.guess);
        setLoading(false);
      })
      .catch((error: unknown) => {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An unknown error occurred.");
        }
        setLoading(false);
      });
  }, []);

  const handleBoxClick = (index: number) => {
    const newColors = [...userClueColors];
    if (newColors[index] === 'white') {
      newColors[index] = 'yellow';
    } else if (newColors[index] === 'yellow') {
      newColors[index] = 'green';
    } else {
      newColors[index] = 'white';
    }
    setUserClueColors(newColors);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const clueString = userClueColors.map(color => color === 'green' ? 'g' : color === 'yellow' ? 'y' : 'x').join('');
      const newGuess = { word: initialGuess, clue: clueString };
      const newGuesses = [...guesses, newGuess];

      if (newGuesses.length >= 6) {
        setError('Wordle not solved. Please refresh WordleBot to try again.');
        setLoading(false);
        return;
      }

      const response = await fetchWordleResult(newGuesses);
      setGuesses(newGuesses);
      setInitialGuess(response.guess);
      setUserClueColors(['white', 'white', 'white', 'white', 'white']);
      setError(null);

      if (clueString === 'ggggg') {
        setSuccess('Yay! All done');
      } else {
        setSuccess(null);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="top" height="100vh">
      <CircularProgress />
    </Box>
  );

  return (
    <Box display="flex" justifyContent="center" alignItems="top" height="100vh">
      <Box textAlign="center">
        <Typography variant="h4" data-testid="guess-number">Guess #{guesses.length + 1}</Typography>
        <Typography variant="h6">Word to Guess:</Typography>
        <Grid container spacing={1} justifyContent="center" data-testid="initial-guess-container">
          {initialGuess.split('').map((letter, index) => (
            <Grid item key={index} xs={2}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                height="50px"
                border={1}
                borderRadius="4px"
                data-testid="letter-box"
              >
                <Typography variant="h5" data-testid="letter">{letter.toUpperCase()}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        <Typography variant="h6" marginTop={2}>
          What response did you get back?
        </Typography>
        <Typography variant="body2" color="textSecondary" mb={2}>
          Click on each letter to mark it as correct letter in the wrong spot (yellow), correct letter in the right spot (green), or incorrect letter (white).
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={1} justifyContent="center">
            {userClueColors.map((color, index) => (
              <Grid item key={index} xs={2}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  height="50px"
                  border={1}
                  borderRadius="4px"
                  bgcolor={
                    color === 'green' ? theme.palette.green.main :
                    color === 'yellow' ? theme.palette.yellow.main :
                    'white'
                  }
                  onClick={() => handleBoxClick(index)}
                  data-testid="clue-box"
                  sx={{ cursor: 'pointer' }}
                >
                  <Typography variant="h5" color={color === 'white' ? 'black' : 'white'}>
                    {initialGuess[index]?.toUpperCase()}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            data-testid="submit-button"
            style={{ marginTop: '16px' }}
          >
            Submit
          </Button>
        </form>
        <Box marginTop={2} data-testid="guesses-container">
          {guesses.map((item, index) => (
            <Box key={index} marginBottom={2}>
              <Typography>Guess #{index + 1}: {item.word.toUpperCase()}</Typography>
              <Grid container spacing={1} justifyContent="center">
                {item.word.split('').map((letter, i) => (
                  <Grid item key={i} xs={2}>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      height="50px"
                      border={1}
                      borderRadius="4px"
                      data-testid="guessed-letter-box"
                      bgcolor={
                        item.clue[i] === 'g' ? theme.palette.green.main :
                        item.clue[i] === 'y' ? theme.palette.yellow.main :
                        'white'
                      }
                    >
                      <Typography variant="h5" color={item.clue[i] === 'x' ? 'black' : 'white'}>
                        {letter.toUpperCase()}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Box>
        {error && <Alert severity="error" data-testid="error-message" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" data-testid="success-message" sx={{ mt: 2 }}>{success}</Alert>}
      </Box>
    </Box>
  );
};

export default WordleBot;
