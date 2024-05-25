import { Box, Grid, Typography } from '@mui/material';
import GuessBox from './GuessBox';
import { WordleRequestItem } from '../api/api'; // Make sure the correct path is used

interface GuessesListProps {
    guesses: WordleRequestItem[];
    theme: any;
}

function GuessesList({ guesses, theme }: GuessesListProps) {
    return (
        <Box data-testid="guesses-container">
            {guesses.map((item, index) => (
                <Box key={index} marginBottom={2}>
                    <Typography>Guess #{index + 1}: {item.word.toUpperCase()}</Typography>
                    <Grid container justifyContent="center">
                        {item.word.split('').map((letter, i) => (
                            <Grid item key={i}>
                                <GuessBox
                                    letter={letter}
                                    color={
                                        item.clue[i] === 'g' ? theme.palette.green.main :
                                        item.clue[i] === 'y' ? theme.palette.yellow.main :
                                        'white'
                                    }
                                    dataTestId="guessed-letter-box"
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            ))}
        </Box>
    );
}

export default GuessesList;
