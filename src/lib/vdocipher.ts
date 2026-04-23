const VDOCIPHER_API_BASE = 'https://dev.vdocipher.com/api';

interface VdoCipherOTPResponse {
  otp: string;
  playbackInfo: string;
}

export async function generateVideoOTP(
  videoId: string,
  userEmail: string
): Promise<VdoCipherOTPResponse> {
  const response = await fetch(`${VDOCIPHER_API_BASE}/videos/${videoId}/otp`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Apisecret ${process.env.VDOCIPHER_API_SECRET}`,
    },
    body: JSON.stringify({
      annotate: JSON.stringify([
        {
          type: 'rtext',
          text: userEmail,
          alpha: '0.30',
          color: '0xD4AF37',
          size: '15',
          interval: '5000',
        },
      ]),
    }),
  });

  if (!response.ok) {
    throw new Error(`VdoCipher OTP generation failed: ${response.statusText}`);
  }

  return response.json();
}

export async function getVideoDetails(videoId: string) {
  const response = await fetch(`${VDOCIPHER_API_BASE}/videos/${videoId}`, {
    headers: {
      Authorization: `Apisecret ${process.env.VDOCIPHER_API_SECRET}`,
    },
  });

  if (!response.ok) {
    throw new Error(`VdoCipher video fetch failed: ${response.statusText}`);
  }

  return response.json();
}
