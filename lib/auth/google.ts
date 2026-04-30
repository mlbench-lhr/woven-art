interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token?: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

interface GoogleTokenErrorResponse {
  error?: string;
  error_description?: string;
}

export class GoogleOAuth {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(options?: { redirectBase?: string }) {
    this.clientId = process.env.GOOGLE_ID || "";
    this.clientSecret = process.env.GOOGLE_SECRET || "";

    const callbackPath = "/api/auth/google/callback";
    const redirectBase =
      options?.redirectBase ||
      process.env.GOOGLE_REDIRECT_URL ||
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "";
    const normalizedRedirectBase = redirectBase.replace(/\/$/, "");
    this.redirectUri = normalizedRedirectBase.endsWith(callbackPath)
      ? normalizedRedirectBase
      : `${normalizedRedirectBase}${callbackPath}`;

    if (!this.clientId || !this.clientSecret) {
      throw new Error("Google OAuth credentials not configured");
    }
    if (!normalizedRedirectBase) {
      throw new Error("Google OAuth redirect URL not configured");
    }
  }

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent",
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: this.redirectUri,
      }),
    });

    if (!response.ok) {
      const raw = await response.text().catch(() => "");
      let detail = "";
      try {
        const parsed = JSON.parse(raw) as GoogleTokenErrorResponse;
        const parts = [parsed.error, parsed.error_description].filter(Boolean);
        detail = parts.join(": ");
      } catch {
        detail = raw.trim();
      }
      const suffix = detail ? `: ${detail}` : "";
      throw new Error(
        `Failed to exchange code for tokens (${response.status})${suffix}`
      );
    }

    return response.json();
  }

  async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user info from Google");
    }

    return response.json();
  }
}
