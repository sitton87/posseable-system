import readline from "readline";
import { google } from "googleapis";

const client_id =
  "1085140048402-6vhm7oocq392fbhjgrdcuii54divqivs.apps.googleusercontent.com";
const client_secret = "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";
const redirect_uri = "urn:ietf:wg:oauth:2.0:oob";

const oauth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uri
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: ["https://www.googleapis.com/auth/gmail.send"],
});

console.log("Authorize this app by visiting this URL:");
console.log(authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter the code from the page here: ", async (code) => {
  rl.close();
  const { tokens } = await oauth2Client.getToken(code);
  console.log("Refresh token:", tokens.refresh_token);
});
