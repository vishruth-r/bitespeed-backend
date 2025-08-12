import { supabase } from '../db/supabase';
import { Contact, IdentifyRequest, IdentifyResponse } from '../models/contact';
import { mapContactFromDB, mapContactToDB } from '../utils/dbMapper';

class ContactService {
  async findContactsByEmailOrPhone(email?: string | null, phoneNumber?: string | null): Promise<Contact[]> {
    if (!email && !phoneNumber) {
      return [];
    }

    const dbColumns = mapContactToDB({
      email,
      phoneNumber
    });

    let query = supabase.from('contact').select('*');

    if (email && phoneNumber) {
      query = query.or(`email.eq.${email},phonenumber.eq.${phoneNumber}`);
    } else if (email) {
      query = query.eq('email', email);
    } else if (phoneNumber) {
      query = query.eq('phonenumber', phoneNumber);
    }

    query = query.order('createdat', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Error finding contacts:', error);
      throw new Error('Failed to find contacts');
    }

    return data ? data.map(item => mapContactFromDB(item)) : [];
  }
  async createContact(
    email: string | null | undefined, 
    phoneNumber: string | null | undefined,
    linkedId: number | null = null,
    linkPrecedence: 'primary' | 'secondary' = 'primary'
  ): Promise<Contact> {
    const newContact: Partial<Contact> = {
      email,
      phoneNumber,
      linkedId,
      linkPrecedence,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const dbContact = mapContactToDB(newContact);
    
    const { data, error } = await supabase
      .from('contact')
      .insert(dbContact)
      .select()
      .single();

    if (error) {
      console.error('Error creating contact:', error);
      throw new Error('Failed to create contact');
    }
    
    if (!data) {
      throw new Error('No data returned from contact creation');
    }

    return mapContactFromDB(data);
  }

  async updateContact(id: number, updates: Partial<Contact>): Promise<Contact> {
    const updatedContact = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    const dbUpdates = mapContactToDB(updatedContact);
    
    const { data, error } = await supabase
      .from('contact')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating contact:', error);
      throw new Error('Failed to update contact');
    }
    
    if (!data) {
      throw new Error('No data returned from contact update');
    }

    return mapContactFromDB(data);
  }

  async findAllRelatedContacts(primaryContactId: number): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contact')
      .select('*')
      .or(`id.eq.${primaryContactId},linkedid.eq.${primaryContactId}`)
      .order('createdat', { ascending: true });

    if (error) {
      console.error('Error finding related contacts:', error);
      throw new Error('Failed to find related contacts');
    }

    return data ? data.map(item => mapContactFromDB(item)) : [];
  }
  
  async convertPrimaryToSecondary(contactToConvert: Contact, newPrimaryId: number): Promise<void> {
    const updates: Partial<Contact> = {
      linkedId: newPrimaryId,
      linkPrecedence: 'secondary',
      updatedAt: new Date().toISOString()
    };
    
    const dbUpdates = mapContactToDB(updates);
    
    const { error } = await supabase
      .from('contact')
      .update(dbUpdates)
      .eq('id', contactToConvert.id);

    if (error) {
      console.error('Error converting primary to secondary:', error);
      throw new Error('Failed to convert primary to secondary');
    }
    
    const secondaryUpdates: Partial<Contact> = {
      linkedId: newPrimaryId,
      updatedAt: new Date().toISOString()
    };
    
    const dbSecondaryUpdates = mapContactToDB(secondaryUpdates);
    
    const { error: updateError } = await supabase
      .from('contact')
      .update(dbSecondaryUpdates)
      .eq('linkedid', contactToConvert.id);
    
    if (updateError) {
      console.error('Error updating secondary contacts:', updateError);
      throw new Error('Failed to update secondary contacts');
    }
  }
  
  formatContactsResponse(contacts: Contact[]): IdentifyResponse {
    if (!contacts || contacts.length === 0) {
      throw new Error('No contacts provided for formatting response');
    }
    
    const primaryContact = contacts.find(c => c.linkPrecedence === 'primary');
    
    if (!primaryContact) {
      throw new Error('No primary contact found');
    }
    
    const emails = Array.from(new Set(
      contacts
        .filter(c => c.email)
        .sort((a, b) => {
          if (a.id === primaryContact.id) return -1;
          if (b.id === primaryContact.id) return 1;
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        })
        .map(c => c.email as string)
    ));
    
    const phoneNumbers = Array.from(new Set(
      contacts
        .filter(c => c.phoneNumber)
        .sort((a, b) => {
          if (a.id === primaryContact.id) return -1;
          if (b.id === primaryContact.id) return 1;
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        })
        .map(c => c.phoneNumber as string)
    ));
    const secondaryContactIds = contacts
      .filter(c => c.linkPrecedence === 'secondary')
      .map(c => c.id);
    
    return {
      contact: {
        primaryContactId: primaryContact.id,
        emails,
        phoneNumbers,
        secondaryContactIds
      }
    };
  }
  
  shouldCreateSecondaryContact(
    existingContacts: Contact[], 
    email: string | null | undefined, 
    phoneNumber: string | null | undefined
  ): boolean {
    if (!email && !phoneNumber) {
      return false;
    }

    if (email && phoneNumber) {
      const exactMatch = existingContacts.some(
        c => c.email === email && c.phoneNumber === phoneNumber
      );
      
      if (exactMatch) {
        return false;
      }
      
      const hasEmail = existingContacts.some(c => c.email === email);
      const hasPhone = existingContacts.some(c => c.phoneNumber === phoneNumber);
      
      if (hasEmail && hasPhone) {
        return true;
      }
      
      if (hasEmail || hasPhone) {
        return true;
      }
    } else if (email) {
      return !existingContacts.some(c => c.email === email);
    } else if (phoneNumber) {
      return !existingContacts.some(c => c.phoneNumber === phoneNumber);
    }
    
    return false;
  }
}

export default new ContactService();
