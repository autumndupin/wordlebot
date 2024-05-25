import { Box, Typography } from '@mui/material';

interface GuessBoxProps {
    letter: string;
    color: string;
    onClick?: () => void;
    dataTestId: string;
}

function GuessBox({ letter, color, onClick, dataTestId }: GuessBoxProps) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '60px',
                height: '60px',
                border: '1px solid',
                borderRadius: '4px',
                bgcolor: color,
                cursor: onClick ? 'pointer' : 'default',
            }}
            onClick={onClick}
            data-testid={dataTestId}
        >
            <Typography variant="h5" color={color === 'white' ? 'black' : 'white'}>
                {letter.toUpperCase()}
            </Typography>
        </Box>
    );
}

export default GuessBox;
