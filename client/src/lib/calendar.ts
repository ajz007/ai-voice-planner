import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

interface CalendarEventInput {
  title: string;
  description: string;
  scheduledStart?: number;
  scheduledEnd?: number;
  estimatedHours?: number;
}

interface CalendarEventResponse {
  success: boolean;
  eventId: string;
  htmlLink: string;
}

class GoogleCalendarService {
  private auth: OAuth2Client | null = null;

  async initialize(): Promise<void> {
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        throw new Error('Google Calendar credentials not configured');
      }

      this.auth = new google.auth.OAuth2(
        clientId,
        clientSecret,
        `${window.location.origin}/auth/google/callback`
      );
    } catch (error) {
      throw new Error(`Failed to initialize Google Calendar service: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async authorize(): Promise<string> {
    if (!this.auth) {
      await this.initialize();
    }
    
    const authUrl = this.auth!.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent', // Force consent screen to ensure we get refresh token
    });

    // Open the auth URL in a popup window
    const popup = window.open(
      authUrl,
      'googleAuth',
      'width=500,height=600,status=yes,scrollbars=yes'
    );

    if (!popup) {
      throw new Error('Failed to open authentication popup. Please allow popups for this site.');
    }

    return new Promise<string>((resolve, reject) => {
      const messageHandler = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        try {
          if (event.data.type === 'google-oauth-success') {
            const { code } = event.data;
            const { tokens } = await this.auth!.getToken(code);
            this.auth!.setCredentials(tokens);
            resolve('Successfully authenticated with Google Calendar');
          } else if (event.data.type === 'google-oauth-error') {
            throw new Error(event.data.error);
          }
        } catch (error) {
          reject(error instanceof Error ? error : new Error('Authentication failed'));
        } finally {
          window.removeEventListener('message', messageHandler);
          popup.close();
        }
      };

      // Listen for the OAuth2 callback
      window.addEventListener('message', messageHandler);

      // Handle popup being closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          reject(new Error('Authentication cancelled'));
        }
      }, 1000);
    });
  }

  async createEvent(task: CalendarEventInput): Promise<CalendarEventResponse> {
    if (!this.auth?.credentials) {
      throw new Error('Not authenticated with Google Calendar. Please connect your calendar first.');
    }

    const calendar = google.calendar({ version: 'v3', auth: this.auth });

    // Handle dates and duration
    const startTime = task.scheduledStart ? new Date(task.scheduledStart) : new Date();
    const endTime = task.scheduledEnd 
      ? new Date(task.scheduledEnd)
      : task.estimatedHours 
        ? new Date(startTime.getTime() + task.estimatedHours * 60 * 60 * 1000)
        : new Date(startTime.getTime() + 60 * 60 * 1000); // Default 1 hour

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const event = {
      summary: task.title,
      description: task.description,
      start: {
        dateTime: startTime.toISOString(),
        timeZone,
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone,
      },
      reminders: {
        useDefault: true,
      },
    };

    try {
      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      if (!response.data.id) {
        throw new Error('Failed to create calendar event: No event ID returned');
      }

      return {
        success: true,
        eventId: response.data.id,
        htmlLink: response.data.htmlLink || '',
      };
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw new Error(
        error instanceof Error 
          ? `Failed to create calendar event: ${error.message}`
          : 'Failed to create calendar event'
      );
    }
  }
}

export const calendarService = new GoogleCalendarService();
