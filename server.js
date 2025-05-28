const express = require("express");
const cors = require("cors");
const { GoogleAuth } = require("google-auth-library");
const fetch = require("node-fetch");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const auth = new GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
  scopes: "https://www.googleapis.com/auth/generative-language",
});

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  try {
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken.token}`,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: messages.map((msg) => ({ text: msg.content })),
            },
          ],
        }),
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error al llamar a Gemini:", error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
