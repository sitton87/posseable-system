import http from "http";
import open from "open";
import { google } from "googleapis";

const client_id =
  "1085140048402-m6fsau9rqaev5cd64t5nt3ti32pq0ks9.apps.googleusercontent.com";
const client_secret = "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";
const redirect_uri = "http://localhost:8080";

const oauth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uri
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: ["https://www.googleapis.com/auth/gmail.send"],
  prompt: "consent",
});

console.log("Opening browser for authentication...");
open(authUrl);

const server = http
  .createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:8080`);
    const code = url.searchParams.get("code");

    if (!code) {
      res.end("No code provided.");
      return;
    }

    const { tokens } = await oauth2Client.getToken(code);

    console.log("\n==== REFRESH TOKEN ====\n");
    console.log(tokens.refresh_token);
    console.log("\n=======================\n");

    res.end("Authentication successful! You can close this window.");
    server.close();
  })
  .listen(8080, () => {
    console.log("Waiting for Google OAuth callback on port 8080...");
  });
