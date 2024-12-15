import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "../db";
import { notes, tasks } from "@db/schema";
import { desc, eq } from "drizzle-orm";
import { OAuth2Client } from "google-auth-library";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export function registerRoutes(app: Express): Server {
  // Enable CORS for the Google OAuth popup
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });
  const httpServer = createServer(app);

  // Notes endpoints
  app.get("/api/notes", async (_req, res) => {
    try {
      const allNotes = await db.select().from(notes).orderBy(desc(notes.timestamp));
      res.json(allNotes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const note = await db.insert(notes).values(req.body).returning();
      res.json(note[0]);
    } catch (error) {
      console.error("Error creating note:", error);
      res.status(500).json({ message: "Failed to create note" });
    }
  });

  // Tasks endpoints
  app.get("/api/tasks", async (_req, res) => {
    try {
      const allTasks = await db.select().from(tasks);
      res.json(allTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const task = await db.insert(tasks).values(req.body).returning();
      res.json(task[0]);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  // JIRA integration endpoints
  app.post("/api/jira/ticket", async (req, res) => {
    const { JIRA_API_TOKEN, JIRA_EMAIL, JIRA_URL } = process.env;
    
    if (!JIRA_API_TOKEN || !JIRA_EMAIL || !JIRA_URL) {
      return res.status(500).json({ message: "JIRA configuration missing" });
    }

    const response = await fetch(`${JIRA_URL}/rest/api/3/issue`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(
          `${JIRA_EMAIL}:${JIRA_API_TOKEN}`
        ).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          project: { key: "PROJ" },
          summary: req.body.summary,
          description: req.body.description,
          issuetype: { name: "Task" },
        },
      }),
    });

    if (!response.ok) {
      return res.status(response.status).json({ message: "Failed to create JIRA ticket" });
    }

    const ticket = await response.json();
    res.json(ticket);
  });

  // Google OAuth callback endpoint
  app.get('/auth/google/callback', async (req, res) => {
    const { code } = req.query;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).send('Missing authorization code');
    }

    try {
      // Send the authorization code back to the parent window
      res.send(`
        <script>
          window.opener.postMessage(
            { type: 'google-oauth-success', code: '${code}' },
            window.location.origin
          );
          window.close();
        </script>
      `);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.status(500).send(`
        <script>
          window.opener.postMessage(
            { type: 'google-oauth-error', error: 'Failed to authenticate' },
            window.location.origin
          );
          window.close();
        </script>
      `);
    }
  });

  return httpServer;
}
