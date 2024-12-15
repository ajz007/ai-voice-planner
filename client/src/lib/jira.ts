interface JiraTicket {
  summary: string;
  description: string;
  estimate?: string;
}

export async function createJiraTicket(ticket: JiraTicket) {
  const response = await fetch('/api/jira/ticket', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ticket),
  });

  if (!response.ok) {
    throw new Error('Failed to create JIRA ticket');
  }

  return response.json();
}

export async function updateJiraTicket(ticketId: string, updates: Partial<JiraTicket>) {
  const response = await fetch(`/api/jira/ticket/${ticketId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update JIRA ticket');
  }

  return response.json();
}
