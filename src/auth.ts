import { Env } from './service/types';

interface JWTPayload {
  aud: string;
  email?: string;
  exp: number;
  iat: number;
  iss: string;
  sub: string;
}

export async function verifyCloudflareAccessJWT(
  request: Request,
  env: Env
): Promise<JWTPayload | null> {
  const token = request.headers.get('cf-access-jwt-assertion');

  if (!token) {
    return null;
  }

  try {
    // Get the public key from Cloudflare Access
    const certsUrl = `https://${env.CF_ACCESS_TEAM_DOMAIN}.cloudflareaccess.com/cdn-cgi/access/certs`;
    const certsResponse = await fetch(certsUrl);

    if (!certsResponse.ok) {
      console.error('Failed to fetch CF Access certs');
      return null;
    }

    const certs = (await certsResponse.json()) as {
      keys: Array<{
        kid: string;
        kty: string;
        alg: string;
        use: string;
        n: string;
        e: string;
      }>;
    };

    // Decode JWT header to get kid
    const [headerB64] = token.split('.');
    const header = JSON.parse(atob(headerB64));

    // Find the matching public key
    const publicKey = certs.keys.find((key) => key.kid === header.kid);

    if (!publicKey) {
      console.error('No matching public key found');
      return null;
    }

    // Import the RSA public key
    const keyData = {
      kty: publicKey.kty,
      n: publicKey.n,
      e: publicKey.e,
      alg: publicKey.alg,
      use: publicKey.use,
    };

    const cryptoKey = await crypto.subtle.importKey(
      'jwk',
      keyData,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['verify']
    );

    // Split the token
    const [, payloadB64, signatureB64] = token.split('.');

    // Verify the signature
    const encoder = new TextEncoder();
    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const signature = Uint8Array.from(atob(signatureB64), (c) =>
      c.charCodeAt(0)
    );

    const isValid = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      signature,
      data
    );

    if (!isValid) {
      console.error('Invalid JWT signature');
      return null;
    }

    // Decode and verify payload
    const payload = JSON.parse(atob(payloadB64)) as JWTPayload;

    // Verify audience
    if (payload.aud !== env.CF_ACCESS_AUD) {
      console.error('Invalid audience');
      return null;
    }

    // Verify expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      console.error('Token expired');
      return null;
    }

    return payload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}
