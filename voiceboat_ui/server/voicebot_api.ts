import express, { Request, Response } from "express";

const router = express.Router();

// In-memory store for conversations (replace with Redis in production)
const conversations: Record<string, any> = {};
const escalations: Record<string, any> = {};

// Message types
interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: number;
}

interface Conversation {
  id: string;
  driverId: string;
  messages: Message[];
  status: "active" | "escalated" | "completed";
  intent?: string;
  sentiment?: string;
  confidence?: number;
}

// POST /api/chat - Send a message to the bot
router.post("/api/chat", (req: Request, res: Response) => {
  try {
    const { conversationId, driverId, text } = req.body;

    if (!conversationId || !text) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get or create conversation
    if (!conversations[conversationId]) {
      conversations[conversationId] = {
        id: conversationId,
        driverId,
        messages: [],
        status: "active",
      };
    }

    const conversation: Conversation = conversations[conversationId];

    // Add user message
    conversation.messages.push({
      id: `msg-${Date.now()}`,
      sender: "user",
      text,
      timestamp: Date.now(),
    });

    // Simulate bot response (in production, call the Python orchestrator)
    let botResponse = "";
    let shouldEscalate = false;
    let intent = "unknown";
    let sentiment = "neutral";
    let confidence = 0.8;

    // Simple intent detection
    const textLower = text.toLowerCase();
    if (textLower.includes("station")) {
      intent = "FindNearestStation";
      if (!textLower.includes("noida") && !textLower.includes("delhi")) {
        botResponse = "Sure! Which area are you in?";
        confidence = 0.6;
      } else {
        botResponse = "The nearest station is Station Central at Main Road, Sector 5.";
        confidence = 0.95;
      }
    } else if (textLower.includes("swap") || textLower.includes("history")) {
      intent = "GetSwapHistory";
      botResponse = "You had 3 swaps last week. Your last swap was on Jan 22 at 2:30 PM.";
      confidence = 0.9;
    } else if (textLower.includes("subscription")) {
      intent = "CheckSubscription";
      botResponse = "Your subscription is active and valid until Dec 31, 2026.";
      confidence = 0.95;
    } else if (textLower.includes("angry") || textLower.includes("bad") || textLower.includes("agent")) {
      sentiment = "angry";
      shouldEscalate = true;
      botResponse = "I'm connecting you to a support executive. Please stay on the line.";
      conversation.status = "escalated";
    } else {
      botResponse = "I'm sorry, I didn't quite understand that. Could you please rephrase?";
      confidence = 0.4;
    }

    // Add bot message
    const botMessageId = `msg-${Date.now() + 1}`;
    conversation.messages.push({
      id: botMessageId,
      sender: "bot",
      text: botResponse,
      timestamp: Date.now(),
    });

    // Update conversation metadata
    conversation.intent = intent;
    conversation.sentiment = sentiment;
    conversation.confidence = confidence;

    // If escalation needed, create escalation record
    if (shouldEscalate) {
      escalations[conversationId] = {
        conversationId,
        driverId,
        reason: sentiment === "angry" ? "User is angry" : "User requested agent",
        summary: {
          intent,
          messages: conversation.messages,
          sentiment,
        },
        createdAt: Date.now(),
        status: "pending",
      };
    }

    // Return success response
    const response = {
      success: true,
      conversationId,
      message: {
        id: botMessageId,
        sender: "bot",
        text: botResponse,
        timestamp: Date.now(),
      },
      shouldEscalate,
      conversation,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: "Internal server error", details: String(error) });
  }
});

// GET /api/conversations/:id - Get conversation details
router.get("/api/conversations/:id", (req: Request, res: Response) => {
  try {
    const conversation = conversations[req.params.id];
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    res.status(200).json(conversation);
  } catch (error) {
    console.error("Error in /api/conversations/:id:", error);
    res.status(500).json({ error: "Internal server error", details: String(error) });
  }
});

// GET /api/escalations - Get all pending escalations
router.get("/api/escalations", (_req: Request, res: Response) => {
  try {
    const pendingEscalations = Object.values(escalations).filter(
      (e: any) => e.status === "pending"
    );
    res.status(200).json(pendingEscalations);
  } catch (error) {
    console.error("Error in /api/escalations:", error);
    res.status(500).json({ error: "Internal server error", details: String(error) });
  }
});

// POST /api/escalations/:id/assign - Assign escalation to agent
router.post("/api/escalations/:id/assign", (req: Request, res: Response) => {
  try {
    const { agentId } = req.body;
    const escalation = escalations[req.params.id];

    if (!escalation) {
      return res.status(404).json({ error: "Escalation not found" });
    }

    escalation.status = "assigned";
    escalation.agentId = agentId;
    escalation.assignedAt = Date.now();

    res.status(200).json(escalation);
  } catch (error) {
    console.error("Error in /api/escalations/:id/assign:", error);
    res.status(500).json({ error: "Internal server error", details: String(error) });
  }
});

// POST /api/escalations/:id/resolve - Mark escalation as resolved
router.post("/api/escalations/:id/resolve", (req: Request, res: Response) => {
  try {
    const { resolution } = req.body;
    const escalation = escalations[req.params.id];

    if (!escalation) {
      return res.status(404).json({ error: "Escalation not found" });
    }

    escalation.status = "resolved";
    escalation.resolution = resolution;
    escalation.resolvedAt = Date.now();

    // Update conversation status
    if (conversations[escalation.conversationId]) {
      conversations[escalation.conversationId].status = "completed";
    }

    res.status(200).json(escalation);
  } catch (error) {
    console.error("Error in /api/escalations/:id/resolve:", error);
    res.status(500).json({ error: "Internal server error", details: String(error) });
  }
});

// GET /api/health - Health check
router.get("/api/health", (_req: Request, res: Response) => {
  try {
    res.status(200).json({ status: "healthy", timestamp: Date.now() });
  } catch (error) {
    console.error("Error in /api/health:", error);
    res.status(500).json({ error: "Internal server error", details: String(error) });
  }
});

export default router;
