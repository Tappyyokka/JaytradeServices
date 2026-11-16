
const express = require("express");
const OpenAI = require("openai");

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

router.post("/", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a message.",
      });
    }

    const validMessages = messages
      .filter(
        (msg) =>
          ["user", "assistant"].includes(msg.role) &&
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
    console.error("Indipay chatbot error:", error);

    return res.status(500).json({
      success: false,
      message: "The assistant is temporarily unavailable. Please try again.",
    });
  }
});

module.exports = router;
