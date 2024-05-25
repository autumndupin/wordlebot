import { render, screen } from '@testing-library/react';
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
        render(<WordleBot />);
        
        // Wait for the component to load
        expect(await screen.findByText(/Guess #1/)).toBeInTheDocument();
        
        const initialGuessContainer = screen.getByTestId('initial-guess-container');
        expect(initialGuessContainer).toBeInTheDocument();
        
        const letterElements = screen.getAllByTestId('letter');
        expect(letterElements).toHaveLength(5);

        // ensure each box contains a valid letter
        letterElements.forEach(letterElement => {
            expect(letterElement.textContent).toMatch(/^[A-Z]$/);
        });
    });
});
