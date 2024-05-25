import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import WordleBot from '../components/WordleBot';
import { fetchWordleResult } from '../api/api';

jest.mock('../api/api');

const mockFetchWordleResult = fetchWordleResult as jest.MockedFunction<typeof fetchWordleResult>;

describe('WordleBot', () => {
    beforeEach(() => {
        mockFetchWordleResult.mockClear();
    });

    test('shows initial guess after loading', async () => {
        mockFetchWordleResult.mockResolvedValue({ guess: 'serai' });
        
        await act(async () => {
            render(<WordleBot />);
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
            render(<WordleBot />);
        });

        // 5 guesses
        for (let i = 0; i < 5; i++) {
            fireEvent.click(screen.getAllByTestId('letter')[0]);
            fireEvent.click(screen.getByTestId('submit-button'));
            await waitFor(() => screen.findByText(`Guess #${i + 2}`));
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
            render(<WordleBot />);
        });
    
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        
        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });
    });
});
