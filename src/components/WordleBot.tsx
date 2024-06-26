import React, { useEffect, useState } from 'react';
import { Button, CircularProgress, Alert, Grid, Box, Typography, useTheme } from '@mui/material';
import { fetchWordleResult, WordleRequestItem } from '../api/api';
import GuessBox from './GuessBox';
import GuessesList from './GuessesList';

function WordleBot() {
    const theme = useTheme();
    const [initialGuess, setInitialGuess] = useState<string>('');
    const [guesses, setGuesses] = useState<WordleRequestItem[]>([]);
    const [userClueColors, setUserClueColors] = useState<string[]>(['white', 'white', 'white', 'white', 'white']);
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const fetchInitialGuess = async () => {
            try {
                const response = await fetchWordleResult([]);
                setInitialGuess(response.guess);
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

        fetchInitialGuess();
    }, []);

    const handleBoxClick = (index: number) => {
        const newColors = [...userClueColors];
        newColors[index] = newColors[index] === 'white' ? 'yellow' : newColors[index] === 'yellow' ? 'green' : 'white';
        setUserClueColors(newColors);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);

        const clueString = userClueColors.map(color => color === 'green' ? 'g' : color === 'yellow' ? 'y' : 'x').join('');
        const newGuess = { word: initialGuess, clue: clueString };
        const newGuesses = [...guesses, newGuess];

        if (newGuesses.length === 5 && clueString !== 'ggggg') {
            setError('Wordle not solved. Please refresh WordleBot to try again.');
            setSubmitting(false);
            return;
        }

        try {
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
            setSubmitting(false);
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
                <Grid container justifyContent="center" data-testid="initial-guess-container">
                    {initialGuess.split('').map((letter, index) => (
                        <Grid item key={index}>
                            <GuessBox
                                letter={letter}
                                color="white"
                                dataTestId="letter"
                            />
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
                    <Grid container justifyContent="center">
                        {userClueColors.map((color, index) => (
                            <Grid item key={index}>
                                <GuessBox
                                    letter={initialGuess[index] || ''}
                                    color={
                                        color === 'green' ? theme.palette.green.main :
                                        color === 'yellow' ? theme.palette.yellow.main :
                                        'white'
                                    }
                                    onClick={() => handleBoxClick(index)}
                                    dataTestId="clue-box"
                                />
                            </Grid>
                        ))}
                    </Grid>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading || submitting || success !== null}
                        style={{ marginTop: '16px' }}
                        data-testid="submit-button"
                    >
                        {!submitting && <Typography variant="body2" color="white">Submit</Typography>}
                        {submitting && <CircularProgress size={18} />}
                    </Button>
                </form>
                <GuessesList guesses={guesses} theme={theme} />
                {error && <Alert severity="error" sx={{ mt: 2 }} data-testid="error-message">{error}</Alert>}
                {success && <Alert severity="success" sx={{ mt: 2 }} data-testid="success-message">{success}</Alert>}
            </Box>
        </Box>
    );
}

export default WordleBot;
