import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import WordleBot from '../components/WordleBot';
import { fetchWordleResult } from '../api/api';
import theme from '../components/theme';
import { ThemeProvider } from '@mui/material/styles';

jest.mock('../api/api');

const mockFetchWordleResult = fetchWordleResult as jest.MockedFunction<typeof fetchWordleResult>;

describe('WordleBot', () => {
    beforeEach(() => {
        mockFetchWordleResult.mockClear();
    });

    test('shows initial guess after loading', async () => {
        mockFetchWordleResult.mockResolvedValue({ guess: 'serai' });

        await act(async () => {
            render(
                <ThemeProvider theme={theme}>
                    <WordleBot />
                </ThemeProvider>
            );
        });

        // Wait for the component to load
        expect(await screen.findByTestId('guess-number')).toHaveTextContent('Guess #1');

        const initialGuessContainer = screen.getByTestId('initial-guess-container');
        expect(initialGuessContainer).toBeInTheDocument();

        // ensure each box contains a valid letter
        const letterElements = await screen.findAllByTestId('letter');
        expect(letterElements).toHaveLength(5);
        letterElements.forEach(letterElement => {
            expect(letterElement.textContent).toMatch(/^[A-Z]$/);
        });
    });

    test('limits guesses to 5 and shows not solved message on 5th incorrect guess', async () => {
        mockFetchWordleResult.mockResolvedValue({ guess: 'serai' });

        await act(async () => {
            render(
                <ThemeProvider theme={theme}>
                    <WordleBot />
                </ThemeProvider>
            );
        });

        // simulate 4 incorrect guesses
        for (let i = 0; i < 4; i++) {
            const boxes = screen.getAllByTestId('clue-box');
            // user marks all letters as incorrect
            boxes.forEach(box => {
                fireEvent.click(box); // yellow
                fireEvent.click(box); // green
                fireEvent.click(box); // back to white (x)
            });
            fireEvent.click(screen.getByTestId('submit-button'));
            await waitFor(() => screen.findByTestId('guess-number'));
        }

        // simulate a 5th guess also incorrect
        const boxes = screen.getAllByTestId('clue-box');
        // mark this guess as incorrect
        boxes.forEach(box => {
            fireEvent.click(box); // yellow
            fireEvent.click(box); // green
            fireEvent.click(box); // back to white (x)
        });
        fireEvent.click(screen.getByTestId('submit-button'));

        // errors out
        await waitFor(() => screen.findByTestId('error-message'), { timeout: 5000 });
        expect(screen.getByTestId('error-message')).toHaveTextContent('Wordle not solved. Please refresh WordleBot to try again.');
    });

    test('shows loading indicator while fetching initial guess', async () => {
        mockFetchWordleResult.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ guess: 'serai' }), 100)));

        await act(async () => {
            render(
                <ThemeProvider theme={theme}>
                    <WordleBot />
                </ThemeProvider>
            );
        });

        expect(screen.getByRole('progressbar')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });
    });

    test('shows error message if API call fails', async () => {
        mockFetchWordleResult.mockRejectedValue(new Error('API call failed'));

        await act(async () => {
            render(
                <ThemeProvider theme={theme}>
                    <WordleBot />
                </ThemeProvider>
            );
        });

        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toHaveTextContent('API call failed');
        });
    });

    test('changes box color on click', async () => {
        mockFetchWordleResult.mockResolvedValue({ guess: 'serai' });

        await act(async () => {
            render(
                <ThemeProvider theme={theme}>
                    <WordleBot />
                </ThemeProvider>
            );
        });

        const boxes = await screen.findAllByTestId('clue-box');

        // expect initial white
        expect(boxes[0]).toHaveStyle('background-color: white');

        // expect 2nd color in cycle to be yellow
        fireEvent.click(boxes[0]);
        expect(boxes[0]).toHaveStyle(`background-color: ${theme.palette.yellow.main}`);

        // expect 3rd color in cycle to be green
        fireEvent.click(boxes[0]);
        expect(boxes[0]).toHaveStyle(`background-color: ${theme.palette.green.main}`);

        // fourth cycle returns to white
        fireEvent.click(boxes[0]);
        expect(boxes[0]).toHaveStyle('background-color: white');
    });

    test('displays success message when all clues are green', async () => {
        mockFetchWordleResult.mockResolvedValue({ guess: 'serai' });

        await act(async () => {
            render(
                <ThemeProvider theme={theme}>
                    <WordleBot />
                </ThemeProvider>
            );
        });

        const boxes = await screen.findAllByTestId('clue-box');
        
        // changes each box to a green clue
        for (let i = 0; i < boxes.length; i++) {
            fireEvent.click(boxes[i]);
            fireEvent.click(boxes[i]);
        }

        fireEvent.click(screen.getByTestId('submit-button'));

        await waitFor(() => screen.findByTestId('success-message'));
        expect(screen.getByTestId('success-message')).toHaveTextContent('Yay! All done');
    });

    test('submit button is disabled during loading', async () => {
        mockFetchWordleResult.mockResolvedValue({ guess: 'serai' });
    
        await act(async () => {
            render(
                <ThemeProvider theme={theme}>
                    <WordleBot />
                </ThemeProvider>
            );
        });
    
        // wait for initial component load
        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });
    
        // simulate clue submission
        const boxes = screen.getAllByTestId('clue-box');
        fireEvent.click(boxes[0]);
        fireEvent.click(screen.getByTestId('submit-button'));
    
        // check that the loading state resumes
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(screen.getByTestId('submit-button')).toBeDisabled();
    
        // wait for loading completion
        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });
    });
});
