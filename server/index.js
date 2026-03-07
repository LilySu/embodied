const { createServer } = require('node:http');
const crypto = require('node:crypto');

const PORT = Number(process.env.PORT || 8080);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5000';
const OURA_CLIENT_ID = process.env.OURA_CLIENT_ID || '';
const OURA_CLIENT_SECRET = process.env.OURA_CLIENT_SECRET || '';
const OURA_REDIRECT_URI = process.env.OURA_REDIRECT_URI || `http://localhost:${PORT}/auth/oura/callback`;
const OURA_SCOPES = process.env.OURA_SCOPES || 'personal daily';
const OURA_MOCK = process.env.OURA_MOCK === '1';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const stateStore = new Set();
const tokenStore = {
  accessToken: null,
  refreshToken: null,
  expiresAt: 0,
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': FRONTEND_URL,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(payload));
}

function sendRedirect(res, location) {
  res.writeHead(302, { Location: location });
  res.end();
}

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

function isoDateDaysAgo(days) {
  return new Date(Date.now() - days * ONE_DAY_MS).toISOString().slice(0, 10);
}

function isConnected() {
  return Boolean(tokenStore.accessToken && tokenStore.expiresAt > Date.now());
}

async function exchangeToken(params) {
  const response = await fetch('https://api.ouraring.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Token exchange failed (${response.status}): ${message}`);
  }

  const token = await response.json();
  tokenStore.accessToken = token.access_token;
  tokenStore.refreshToken = token.refresh_token;
  tokenStore.expiresAt = Date.now() + (Number(token.expires_in || 0) * 1000) - 15_000;
}

async function refreshAccessTokenIfNeeded() {
  if (!tokenStore.refreshToken) return;
  if (tokenStore.expiresAt > Date.now()) return;

  await exchangeToken({
    grant_type: 'refresh_token',
    refresh_token: tokenStore.refreshToken,
    client_id: OURA_CLIENT_ID,
    client_secret: OURA_CLIENT_SECRET,
  });
}

async function fetchOuraJson(pathname, queryParams = {}) {
  await refreshAccessTokenIfNeeded();

  if (!tokenStore.accessToken) {
    throw new Error('Not connected to Oura');
  }

  const url = new URL(`https://api.ouraring.com${pathname}`);
  for (const [key, value] of Object.entries(queryParams)) {
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${tokenStore.accessToken}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Oura request failed (${response.status}): ${message}`);
  }

  return response.json();
}

function latestFromData(payload) {
  const items = Array.isArray(payload?.data) ? payload.data : [];
  return items.length ? items[items.length - 1] : null;
}

function buildMockSummary(days) {
  const points = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = isoDateDaysAgo(i);
    const offset = days - 1 - i;
    points.push({
      day,
      readinessScore: 72 + Math.min(12, offset),
      sleepScore: 70 + Math.min(10, offset),
      activityScore: 68 + Math.min(14, offset),
      steps: 6400 + offset * 550,
      totalSleepDuration: 7 * 3600 + (offset % 3) * 900,
      efficiency: 84 + (offset % 5),
      activeCalories: 380 + offset * 28,
    });
  }

  const latest = points[points.length - 1];
  const startDate = points[0].day;
  const endDate = latest.day;

  return {
    window: { startDate, endDate, days },
    personalInfo: { age: 49, biological_sex: 'female' },
    latest: {
      readiness: {
        date: latest.day,
        score: latest.readinessScore,
        temperatureDeviation: 0.1,
        restingHeartRate: 58,
      },
      sleep: {
        date: latest.day,
        score: latest.sleepScore,
        totalSleepDuration: latest.totalSleepDuration,
        efficiency: latest.efficiency,
      },
      activity: {
        date: latest.day,
        score: latest.activityScore,
        steps: latest.steps,
        activeCalories: latest.activeCalories,
      },
    },
    raw: {
      readiness: points.map((p) => ({ day: p.day, score: p.readinessScore })),
      sleep: points.map((p) => ({
        day: p.day,
        score: p.sleepScore,
        total_sleep_duration: p.totalSleepDuration,
        efficiency: p.efficiency,
      })),
      activity: points.map((p) => ({
        day: p.day,
        score: p.activityScore,
        steps: p.steps,
        active_calories: p.activeCalories,
      })),
    },
  };
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': FRONTEND_URL,
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  try {
    if (req.method === 'GET' && url.pathname === '/health') {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/auth/oura/start') {
      if (OURA_MOCK) {
        sendRedirect(res, `${FRONTEND_URL}/?oura=connected`);
        return;
      }

      if (!OURA_CLIENT_ID || !OURA_CLIENT_SECRET) {
        sendJson(res, 500, {
          error: 'Missing OURA_CLIENT_ID / OURA_CLIENT_SECRET env vars on backend.',
        });
        return;
      }

      const state = crypto.randomBytes(16).toString('hex');
      stateStore.add(state);

      const authUrl = new URL('https://cloud.ouraring.com/oauth/authorize');
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('client_id', OURA_CLIENT_ID);
      authUrl.searchParams.set('redirect_uri', OURA_REDIRECT_URI);
      authUrl.searchParams.set('scope', OURA_SCOPES);
      authUrl.searchParams.set('state', state);

      sendRedirect(res, authUrl.toString());
      return;
    }

    if (req.method === 'GET' && url.pathname === '/auth/oura/callback') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const error = url.searchParams.get('error');

      if (error) {
        sendRedirect(res, `${FRONTEND_URL}/?oura=error&message=${encodeURIComponent(error)}`);
        return;
      }

      if (!code || !state || !stateStore.has(state)) {
        sendRedirect(res, `${FRONTEND_URL}/?oura=error&message=${encodeURIComponent('Invalid OAuth callback state')}`);
        return;
      }

      stateStore.delete(state);

      await exchangeToken({
        grant_type: 'authorization_code',
        code,
        redirect_uri: OURA_REDIRECT_URI,
        client_id: OURA_CLIENT_ID,
        client_secret: OURA_CLIENT_SECRET,
      });

      sendRedirect(res, `${FRONTEND_URL}/?oura=connected`);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/oura/status') {
      sendJson(res, 200, {
        connected: OURA_MOCK ? true : isConnected(),
        expiresAt: tokenStore.expiresAt || null,
        mock: OURA_MOCK,
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/oura/summary') {
      const days = Math.max(1, Math.min(30, Number(url.searchParams.get('days') || 7)));

      if (OURA_MOCK) {
        sendJson(res, 200, buildMockSummary(days));
        return;
      }

      if (!tokenStore.accessToken) {
        sendJson(res, 401, { error: 'Not connected to Oura' });
        return;
      }

      const startDate = isoDateDaysAgo(days - 1);
      const endDate = todayISODate();

      const [personalInfo, readiness, sleep, activity] = await Promise.all([
        fetchOuraJson('/v2/usercollection/personal_info'),
        fetchOuraJson('/v2/usercollection/daily_readiness', { start_date: startDate, end_date: endDate }),
        fetchOuraJson('/v2/usercollection/daily_sleep', { start_date: startDate, end_date: endDate }),
        fetchOuraJson('/v2/usercollection/daily_activity', { start_date: startDate, end_date: endDate }),
      ]);

      const latestReadiness = latestFromData(readiness);
      const latestSleep = latestFromData(sleep);
      const latestActivity = latestFromData(activity);

      sendJson(res, 200, {
        window: { startDate, endDate, days },
        personalInfo,
        latest: {
          readiness: latestReadiness
            ? {
                date: latestReadiness.day,
                score: latestReadiness.score,
                temperatureDeviation: latestReadiness.temperature_deviation,
                restingHeartRate: latestReadiness.contributors?.resting_heart_rate,
              }
            : null,
          sleep: latestSleep
            ? {
                date: latestSleep.day,
                score: latestSleep.score,
                totalSleepDuration: latestSleep.total_sleep_duration,
                efficiency: latestSleep.efficiency,
              }
            : null,
          activity: latestActivity
            ? {
                date: latestActivity.day,
                score: latestActivity.score,
                steps: latestActivity.steps,
                activeCalories: latestActivity.active_calories,
              }
            : null,
        },
        raw: {
          readiness: readiness.data || [],
          sleep: sleep.data || [],
          activity: activity.data || [],
        },
      });
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : 'Unknown server error',
    });
  }
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Oura backend listening on http://localhost:${PORT}`);
});
