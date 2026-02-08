// Systeme.io integration for email marketing automation

const SYSTEME_API_KEY = process.env.SYSTEME_API_KEY;
const SYSTEME_API_URL = 'https://api.systeme.io/api';

interface AddContactOptions {
  email: string;
  firstName?: string;
  lastName?: string;
  tags: string[];
}

export interface SystemeResult {
  success: boolean;
  error?: string;
}

export async function addContactToSystemeDetailed({ email, firstName, lastName, tags }: AddContactOptions): Promise<SystemeResult> {
  if (!SYSTEME_API_KEY) {
    return { success: false, error: 'API key not configured' };
  }

  try {
    const tagIds: number[] = [];
    for (const tagName of tags) {
      const tagId = await getOrCreateTag(tagName);
      if (tagId) tagIds.push(tagId);
    }

    const existingContact = await findContact(email);

    if (existingContact) {
      await updateContactTags(existingContact.id, tagIds);
      return { success: true };
    }

    const response = await fetch(`${SYSTEME_API_URL}/contacts`, {
      method: 'POST',
      headers: {
        'X-API-Key': SYSTEME_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        locale: 'en',
        fields: [
          ...(firstName ? [{ slug: 'first_name', value: firstName }] : []),
          ...(lastName ? [{ slug: 'last_name', value: lastName }] : []),
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return { success: false, error: `${response.status}: ${errorBody}` };
    }

    const newContact = await response.json();
    if (tagIds.length > 0 && newContact.id) {
      await updateContactTags(newContact.id, tagIds);
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function addContactToSysteme({ email, firstName, lastName, tags }: AddContactOptions): Promise<boolean> {
  if (!SYSTEME_API_KEY) {
    console.error('[Systeme] API key not configured');
    return false;
  }

  try {
    // First, get or create tag IDs
    const tagIds: number[] = [];
    for (const tagName of tags) {
      const tagId = await getOrCreateTag(tagName);
      if (tagId) tagIds.push(tagId);
    }

    // Check if contact already exists
    const existingContact = await findContact(email);

    if (existingContact) {
      // Update existing contact with new tags
      await updateContactTags(existingContact.id, tagIds);
      console.log('[Systeme] Updated existing contact:', email, 'with tags:', tags);
      return true;
    }

    // Create new contact (Systeme ignores tags on creation, must add separately)
    const response = await fetch(`${SYSTEME_API_URL}/contacts`, {
      method: 'POST',
      headers: {
        'X-API-Key': SYSTEME_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        locale: 'en',
        fields: [
          ...(firstName ? [{ slug: 'first_name', value: firstName }] : []),
          ...(lastName ? [{ slug: 'last_name', value: lastName }] : []),
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[Systeme] Failed to add contact ${email}: ${response.status} ${error}`);
      return false;
    }

    const newContact = await response.json();

    // Add tags to the newly created contact
    if (tagIds.length > 0 && newContact.id) {
      await updateContactTags(newContact.id, tagIds);
    }

    console.log('[Systeme] Added contact:', email, 'with tags:', tags);
    return true;
  } catch (error) {
    console.error('[Systeme] Error adding contact:', error);
    return false;
  }
}

async function findContact(email: string): Promise<{ id: number } | null> {
  if (!SYSTEME_API_KEY) return null;

  try {
    const response = await fetch(`${SYSTEME_API_URL}/contacts?email=${encodeURIComponent(email)}`, {
      headers: {
        'X-API-Key': SYSTEME_API_KEY,
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.items && data.items.length > 0) {
      return { id: data.items[0].id };
    }
    return null;
  } catch {
    return null;
  }
}

async function updateContactTags(contactId: number, tagIds: number[]): Promise<void> {
  if (!SYSTEME_API_KEY) return;

  for (const tagId of tagIds) {
    try {
      const res = await fetch(`${SYSTEME_API_URL}/contacts/${contactId}/tags`, {
        method: 'POST',
        headers: {
          'X-API-Key': SYSTEME_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tagId }),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error(`[Systeme] Tag ${tagId} failed for contact ${contactId}: ${res.status} ${errText}`);
      }
      // Small delay between tag operations
      await new Promise(resolve => setTimeout(resolve, 150));
    } catch (error) {
      console.error('[Systeme] Error adding tag to contact:', error);
    }
  }
}

// Cache for tag IDs to avoid repeated API calls
const tagCache: Record<string, number> = {};

async function getOrCreateTag(tagName: string): Promise<number | null> {
  if (!SYSTEME_API_KEY) return null;

  // Check cache first
  if (tagCache[tagName]) {
    return tagCache[tagName];
  }

  try {
    // Search for existing tag
    const searchResponse = await fetch(`${SYSTEME_API_URL}/tags?query=${encodeURIComponent(tagName)}`, {
      headers: {
        'X-API-Key': SYSTEME_API_KEY,
      },
    });

    if (searchResponse.ok) {
      const data = await searchResponse.json();
      const existingTag = data.items?.find((t: any) => t.name.toLowerCase() === tagName.toLowerCase());
      if (existingTag) {
        tagCache[tagName] = existingTag.id;
        return existingTag.id;
      }
    }

    // Create new tag if not found
    const createResponse = await fetch(`${SYSTEME_API_URL}/tags`, {
      method: 'POST',
      headers: {
        'X-API-Key': SYSTEME_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: tagName }),
    });

    if (createResponse.ok) {
      const newTag = await createResponse.json();
      tagCache[tagName] = newTag.id;
      console.log('[Systeme] Created tag:', tagName, 'with ID:', newTag.id);
      return newTag.id;
    }

    console.error('[Systeme] Failed to create tag:', tagName);
    return null;
  } catch (error) {
    console.error('[Systeme] Error getting/creating tag:', error);
    return null;
  }
}
