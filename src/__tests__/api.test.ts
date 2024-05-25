import { fetchWordleResult, WordleRequest, WordleResponse } from '../api/api';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('API Tests', () => {
    afterEach(() => {
        mockFetch.mockClear();
    });

    // Verifies fetchWordleResult correctly handles a successful API response.
    test('fetchWordleResult returns correct response', async () => {
        const mockResponse: WordleResponse = { guess: 'serai' };
        mockFetch.mockResolvedValueOnce({
            status: 200,
            json: async () => mockResponse,
        });

        const request: WordleRequest = [{ word: 'serai', clue: 'gxyxx' }];
        const response = await fetchWordleResult(request);

        expect(response).toEqual(mockResponse);
        expect(mockFetch).toHaveBeenCalledWith(
            "https://interviewing.venteur.co/api/wordle",
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(request),
            })
        );
    });

    // Ensures fetchWordleResult properly handles and throws errors on API failure.
    test('fetchWordleResult handles API errors', async () => {
        const mockErrorMessage = 'Internal Server Error';
        mockFetch.mockResolvedValueOnce({
            status: 500,
            text: async () => mockErrorMessage,
        });

        const request: WordleRequest = [{ word: 'serai', clue: 'gxyxx' }];

        // suppress error logs during test execution
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await expect(fetchWordleResult(request)).rejects.toThrow(mockErrorMessage);

        expect(mockFetch).toHaveBeenCalledWith(
            "https://interviewing.venteur.co/api/wordle",
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(request),
            })
        );

        consoleErrorSpy.mockRestore();
    });
});
