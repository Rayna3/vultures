
const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const {OpenAI} = require("openai");

admin.initializeApp();
const db = admin.firestore();

exports.fridgeBot = onRequest(
    {
      region: "us-central1",
      memory: "512MiB",
      timeoutSeconds: 60,
      secrets: ["OPENAI_API_KEY"], // <‑‑ secret declared
      invoker: "public", // <‑‑ unauthenticated calls allowed
    },
    async (req, res) => {
    /* ‑‑‑ CORS for CRA dev server ‑‑‑*/
      res.set("Access-Control-Allow-Origin", "http://localhost:3000");
      res.set("Access-Control-Allow-Headers", "Content-Type");
      if (req.method === "OPTIONS") return res.status(204).send("");

      try {
        const userMsg = (req.body?.message || "").trim();
        if (!userMsg) return res.status(400).json({error: "No message."});

        /* 1. inventory */
        const snap = await db
            .collection("groceries")
            .where("claimed", "==", false)
            .get();

        const items = snap.docs.map((d) => d.data());
        const inventory =
        items.length === 0 ?
          "(The fridge is empty.)" :
          items
              .map(
                  (i) =>
                    `• ${i.name} (${i.category}) – ${i.amount} left, ` +
                  `expires ${i.expiry}`,
              )
              .join("\n");

        /* 2. prompt */
        const prompt = [
          "You are FridgeBot, an office‑fridge assistant.",
          "Current unclaimed items:",
          inventory,
          "",
          `User: ${userMsg}`,
          "FridgeBot:",
        ].join("\n");

        /* 3. OpenAI – client built **inside** the handler */
        const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

        const chat = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{role: "user", content: prompt}],
          temperature: 0.7,
          max_tokens: 150,
        });

        const reply =
        chat.choices?.[0]?.message?.content?.trim() ??
        "Sorry, I couldn't answer that.";

        return res.json({reply});
      } catch (err) {
        console.error("fridgeBot error:", err);
        return res.status(500).json({error: "Internal error."});
      }
    },
);
