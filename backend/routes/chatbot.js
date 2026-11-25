
const express = require("express");
const OpenAI = require("openai");
const { authenticateCustomer } = require("./auth");
const rateLimit = require("../src/rateLimit");

const router = express.Router();

let openai;

const SYSTEM_INSTRUCTIONS = `
You are Indipay Assistant, the customer support chatbot for Indipay,
a platform operated by Jaytrade.

Your responsibilities:
- Help customers understand Indipay services.
- Explain financial, legal, employment, business development,
  and technology services.
- Guide customers through the application process.
- Be friendly, professional, clear and concise.
- Ask clarifying questions when necessary.

Important rules:
- Never invent service charges, eligibility requirements,
  approval guarantees, or company policies.
- If you don't know something, say so and recommend contacting
  Indipay support.
- Never claim that an application has been approved or processed
  unless verified information is provided.
- Do not request passwords, OTPs, or API keys.
`;

router.post("/", authenticateCustomer, rateLimit({ limit: 10, windowMs: 60000, key: (req) => req.user.id }), async (req, res) => {
  try {
    const { messages } = req.body ?? {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a message.",
      });
    }

    const validMessages = messages
      .filter(
        (msg) =>
          ["user", "assistant"].includes(msg?.role) &&
          typeof msg.content === "string" &&
          msg.content.trim()
      )
      .slice(-20)
      .map((msg) => ({
        role: msg.role,
        content: msg.content.slice(0, 3000),
      }));

    if (
      validMessages.length === 0 ||
      validMessages[validMessages.length - 1].role !== "user"
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid user message is required.",
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ success: false, message: "The assistant is temporarily unavailable." });
    }
    openai ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 10000, maxRetries: 0 });
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      instructions: SYSTEM_INSTRUCTIONS,
      input: validMessages,
      max_output_tokens: 500,
    });

    return res.json({
      success: true,
      reply: response.output_text,
    });
  } catch (error) {
    console.error("Indipay chatbot error:", error.code || error.name);

    return res.status(500).json({
      success: false,
      message: "The assistant is temporarily unavailable. Please try again.",
    });
  }
});

module.exports = router;
