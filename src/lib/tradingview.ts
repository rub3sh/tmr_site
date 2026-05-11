const TV_BASE = 'https://www.tradingview.com';

async function fetchCsrfToken(sessionId: string, sessionIdSign: string): Promise<string> {
  try {
    const res = await fetch(`${TV_BASE}/`, {
      headers: {
        Cookie: `sessionid=${sessionId}; sessionid_sign=${sessionIdSign}`,
        'User-Agent': 'Mozilla/5.0',
      },
    });
    const cookies = res.headers.get('set-cookie') ?? '';
    const match = cookies.match(/csrftoken=([^;]+)/);
    return match?.[1] ?? '';
  } catch {
    return '';
  }
}

export async function grantTradingViewAccess(
  recipientUsername: string,
  scriptId: string,
  expiresAt: Date,
): Promise<boolean> {
  const sessionId = process.env.TRADINGVIEW_SESSION_ID;
  const sessionIdSign = process.env.TRADINGVIEW_SESSION_SIGN ?? '';

  if (!sessionId) {
    console.warn('[TradingView] TRADINGVIEW_SESSION_ID not configured — skipping access grant');
    return false;
  }

  const expiration = expiresAt.toISOString().split('T')[0]; // YYYY-MM-DD

  try {
    const csrfToken = await fetchCsrfToken(sessionId, sessionIdSign);

    const body = new URLSearchParams({
      pine_id: scriptId,
      username_recip: recipientUsername,
      expiration,
    });

    const res = await fetch(`${TV_BASE}/pine_perm/add/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Cookie: `sessionid=${sessionId}; sessionid_sign=${sessionIdSign}; csrftoken=${csrfToken}`,
        'X-CSRFToken': csrfToken,
        Referer: `${TV_BASE}/`,
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0',
      },
      body: body.toString(),
    });

    const data = await res.json().catch(() => null);
    if (data?.ok !== true) {
      console.error('[TradingView] Access grant failed:', data);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[TradingView] Error granting access:', err);
    return false;
  }
}

export async function grantAccessToAllTierScripts(
  recipientUsername: string,
  tier: string,
  expiresAt: Date,
  indicators: Array<{ tradingViewScriptId: string | null; tier: string }>,
): Promise<{ granted: number; failed: number }> {
  // Suite gets all scripts; Core/SMT get their own tier + CORE scripts
  const tierOrder = ['CORE', 'SMT', 'SUITE'];
  const tierIndex = tierOrder.indexOf(tier.toUpperCase());
  const eligibleTiers = tierOrder.slice(0, tierIndex + 1);

  const scripts = indicators
    .filter((i) => i.tradingViewScriptId && eligibleTiers.includes(i.tier.toUpperCase()))
    .map((i) => i.tradingViewScriptId as string);

  let granted = 0;
  let failed = 0;

  for (const scriptId of scripts) {
    const ok = await grantTradingViewAccess(recipientUsername, scriptId, expiresAt);
    if (ok) granted++;
    else failed++;
  }

  return { granted, failed };
}
