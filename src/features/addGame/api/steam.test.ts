import { resolveSteamGame, searchSteamGames } from './steam';

function jsonResponse(body: unknown) {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
  });
}

const reviewSummary = {
  success: 1,
  query_summary: {
    review_score: 9,
    review_score_desc: 'Extremely Positive',
    total_reviews: 100,
  },
};

describe('resolveSteamGame', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('reads the game when Steam keys appdetails by a DLC id', async () => {
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes('appdetails')) {
        return jsonResponse({
          '440820': {
            success: true,
            data: {
              type: 'game',
              name: 'Stardew Valley',
              steam_appid: 413150,
              short_description: 'Farm',
              header_image: 'https://shared.akamai.steamstatic.com/header.jpg',
              developers: ['ConcernedApe'],
              publishers: ['ConcernedApe'],
              release_date: { date: '26 фев. 2016' },
            },
          },
        });
      }

      return jsonResponse(reviewSummary);
    });

    const result = await resolveSteamGame(413150);

    expect(result).toMatchObject({
      status: 'game',
      game: {
        steamAppId: 413150,
        name: 'Stardew Valley',
        steamUrl: 'https://store.steampowered.com/app/413150',
        developers: ['ConcernedApe'],
      },
    });
  });

  it('does not accept a different app returned under another key', async () => {
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes('appdetails')) {
        return jsonResponse({
          '440820': {
            success: true,
            data: {
              type: 'music',
              name: 'Stardew Valley Soundtrack',
              steam_appid: 440820,
            },
          },
        });
      }

      return jsonResponse(reviewSummary);
    });

    await expect(resolveSteamGame(413150)).resolves.toEqual({ status: 'not_found' });
  });

  it('rejects a soundtrack when its own app id is requested', async () => {
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes('appdetails')) {
        return jsonResponse({
          '440820': {
            success: true,
            data: {
              type: 'music',
              name: 'Stardew Valley Soundtrack',
              steam_appid: 440820,
            },
          },
        });
      }

      return jsonResponse(reviewSummary);
    });

    await expect(resolveSteamGame(440820)).resolves.toEqual({ status: 'not_game' });
  });
});

describe('searchSteamGames', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('keeps games and drops soundtracks and DLC', async () => {
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes('storesearch')) {
        return jsonResponse({
          items: [
            { id: 413150, name: 'Stardew Valley', type: 'app' },
            { id: 620, name: 'Portal 2', type: 'app' },
            { id: 440820, name: 'Stardew Valley Soundtrack', type: 'app' },
            { id: 2378500, name: "Baldur's Gate 3 - Digital Deluxe Edition DLC", type: 'app' },
            { id: 3516070, name: 'Grand Emprise 2 Demo', type: 'app' },
          ],
        });
      }

      return jsonResponse({
        response: {
          store_items: [
            { appid: 413150, type: 0, success: 1, release: { steam_release_date: 1456509578 } },
            { appid: 620, type: 0, success: 1 },
            { appid: 440820, type: 11, success: 1 },
            { appid: 2378500, type: 4, success: 1 },
            { appid: 3516070, type: 1, success: 1 },
          ],
        },
      });
    });

    await expect(searchSteamGames('stardew')).resolves.toEqual([
      { steamAppId: 413150, name: 'Stardew Valley', releaseYear: 2016 },
      { steamAppId: 620, name: 'Portal 2', releaseYear: null },
    ]);

    const browseCall = fetchMock.mock.calls
      .map(([input]) => String(input))
      .find((url) => url.includes('GetItems'));

    expect(decodeURIComponent(browseCall ?? '')).toContain('"country_code":"US"');
    expect(browseCall).toContain('include_release');
    expect(
      fetchMock.mock.calls.filter(([input]) => String(input).includes('GetItems')),
    ).toHaveLength(1);
  });

  it('keeps a hit when the US catalog does not classify it', async () => {
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes('storesearch')) {
        return jsonResponse({
          items: [
            { id: 33230, name: "Assassin's Creed 2", type: 'app' },
            { id: 999, name: 'Unclassified', type: 'app' },
          ],
        });
      }

      return jsonResponse({
        response: {
          store_items: [
            {
              appid: 33230,
              success: 1,
              type: 0,
              release: { steam_release_date: 1268157600 },
            },
            { appid: 999, success: 15 },
          ],
        },
      });
    });

    await expect(searchSteamGames("Assassin's")).resolves.toEqual([
      { steamAppId: 33230, name: "Assassin's Creed 2", releaseYear: 2010 },
      { steamAppId: 999, name: 'Unclassified', releaseYear: null },
    ]);
    expect(
      fetchMock.mock.calls.filter(([input]) => String(input).includes('GetItems')),
    ).toHaveLength(1);
  });
});
