import { NextRequest } from 'next/server';

const SYMBOLS_RE = /^\d+(,\d+)*$/;
const TYPE_RE    = /^\d+$/;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawSymbols = searchParams.get('symbols') ?? '';
  const rawType    = searchParams.get('type')    ?? '';

  const symbols = SYMBOLS_RE.test(rawSymbols) ? rawSymbols : '1,2,3,4,5,6,7,34';
  const type    = TYPE_RE.test(rawType)        ? rawType    : '1';

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: transparent; font-family: Inter, sans-serif; }
</style>
</head>
<body>
<!-- myfxbook.com outlook widget - Start -->
<div>
  <script class="powered" type="text/javascript"
    src="https://widgets.myfxbook.com/scripts/fxOutlook.js?type=${type}&symbols=,${symbols}"></script>
</div>
<div style="font-size:10px">
  <a href="https://www.myfxbook.com" title="" class="myfxbookLink" target="_blank" rel="noopener">
    Powered by Myfxbook.com
  </a>
</div>
<script type="text/javascript">showOutlookWidget()</script>
<!-- myfxbook.com outlook widget - End -->
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Frame-Options': 'SAMEORIGIN',
      'Cache-Control': 'no-store',
    },
  });
}
