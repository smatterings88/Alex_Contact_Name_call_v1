import NodeCache from 'node-cache';
import { config } from '../config/env.js';

const contactCache = new NodeCache({ stdTTL: 300 }); // 5 minute cache

export async function findOrCreateContact(phoneNumber) {
    const cacheKey = `contact:${phoneNumber}`;
    const cachedContact = contactCache.get(cacheKey);
    
    if (cachedContact) {
        return cachedContact;
    }

    try {
        const contact = await searchContact(phoneNumber) || await createContact(phoneNumber);
        contactCache.set(cacheKey, contact);
        return contact;
    } catch (error) {
        console.error('Error in findOrCreateContact:', error);
        throw error;
    }
}

async function searchContact(phoneNumber) {
    const response = await fetch(`${config.ghl.apiUrl}/contacts/search?query=${phoneNumber}`, {
        headers: {
            'Authorization': `Bearer ${config.ghl.apiKey}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to search contact: ${response.statusText}`);
    }

    const result = await response.json();
    return result.contacts?.[0] || null;
}

async function createContact(phoneNumber) {
    const response = await fetch(`${config.ghl.apiUrl}/contacts`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.ghl.apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            phone: phoneNumber,
            locationId: config.ghl.locationId
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to create contact: ${response.statusText}`);
    }

    const result = await response.json();
    return result.contact;
}

export async function addTagToContact(contactId, tag) {
    const response = await fetch(`${config.ghl.apiUrl}/contacts/${contactId}/tags`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.ghl.apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tags: [tag] })
    });

    if (!response.ok) {
        throw new Error(`Failed to add tag: ${response.statusText}`);
    }

    return response.json();
}