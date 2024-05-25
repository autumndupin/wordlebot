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
        const letterElements = screen.getAllByTestId('letter');
        expect(letterElements).toHaveLength(5);
        letterElements.forEach(letterElement => {
            expect(letterElement.textContent).toMatch(/^[A-Z]$/);
        });
    });

    test('limits guesses to 6 and shows not solved message', async () => {
        mockFetchWordleResult.mockResolvedValue({ guess: 'serai' });

        await act(async () => {
            render(
                <ThemeProvider theme={theme}>
                    <WordleBot />
                </ThemeProvider>
            );
        });

        // 5 guesses
        for (let i = 0; i < 5; i++) {
            fireEvent.click(screen.getAllByTestId('letter')[0]);
            fireEvent.click(screen.getByTestId('submit-button'));
            await waitFor(() => screen.findByTestId('guess-number'));
        }

        // simulate the 6th guess
        fireEvent.click(screen.getAllByTestId('letter')[0]);
        fireEvent.click(screen.getByTestId('submit-button'));

        await waitFor(() => screen.findByTestId('error-message'));
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
});
