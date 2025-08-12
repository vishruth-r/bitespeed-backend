import { Request, Response } from 'express';
import { Contact, IdentifyRequest } from '../models/contact';
import contactService from '../services/contactService';

export const identifyContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phoneNumber }: IdentifyRequest = req.body;
    
    if (!email && !phoneNumber) {
      res.status(400).json({ error: 'Either email or phoneNumber is required' });
      return;
    }

    const existingContacts = await contactService.findContactsByEmailOrPhone(email, phoneNumber);

    if (existingContacts.length === 0) {
      const newContact = await contactService.createContact(email, phoneNumber);
      
      res.json({
        contact: {
          primaryContactId: newContact.id,
          emails: email ? [email] : [],
          phoneNumbers: phoneNumber ? [phoneNumber] : [],
          secondaryContactIds: []
        }
      });
      return;
    }
    
    const secondaryContacts = existingContacts.filter(c => c.linkPrecedence === 'secondary' && c.linkedId);
    if (secondaryContacts.length > 0) {
      const primaryIds = [...new Set(secondaryContacts.map(c => c.linkedId as number))];
      
      for (const primaryId of primaryIds) {
        const primaryContact = await contactService.findAllRelatedContacts(primaryId);
        existingContacts.push(...primaryContact.filter(
          pc => !existingContacts.some(ec => ec.id === pc.id)
        ));
      }
    }

    const primaryContacts = existingContacts.filter(c => c.linkPrecedence === 'primary');
    
    if (primaryContacts.length === 0) {
      const newContact = await contactService.createContact(email, phoneNumber);
      
      res.json({
        contact: {
          primaryContactId: newContact.id,
          emails: email ? [email] : [],
          phoneNumbers: phoneNumber ? [phoneNumber] : [],
          secondaryContactIds: []
        }
      });
      return;
    }
    
    if (primaryContacts.length > 1) {
      primaryContacts.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      const oldestPrimaryContact = primaryContacts[0];
      const contactsToConvert = primaryContacts.slice(1);
      
      for (const contact of contactsToConvert) {
        await contactService.convertPrimaryToSecondary(contact, oldestPrimaryContact.id);
      }
      
      const allRelatedContacts = await contactService.findAllRelatedContacts(oldestPrimaryContact.id);
      const response = contactService.formatContactsResponse(allRelatedContacts);
      
      res.json(response);
      return;
    }
    
    const primaryContact = primaryContacts[0];
    
    if (email && phoneNumber) {
      const emailContact = existingContacts.find(c => c.email === email);
      const phoneContact = existingContacts.find(c => c.phoneNumber === phoneNumber);
      
      if (emailContact && phoneContact && emailContact.id !== phoneContact.id) {
        if (emailContact.linkPrecedence === 'primary' && phoneContact.linkPrecedence === 'primary') {
          const newerContact = new Date(emailContact.createdAt) > new Date(phoneContact.createdAt) ? 
            emailContact : phoneContact;
          const olderContact = newerContact === emailContact ? phoneContact : emailContact;
          
          await contactService.convertPrimaryToSecondary(newerContact, olderContact.id);
          
          const updatedRelatedContacts = await contactService.findAllRelatedContacts(olderContact.id);
          const response = contactService.formatContactsResponse(updatedRelatedContacts);
          
          res.json(response);
          return;
        }
      }
    }
    
    const shouldCreate = contactService.shouldCreateSecondaryContact(
      existingContacts, 
      email, 
      phoneNumber
    );
    
    if (shouldCreate) {
      await contactService.createContact(email, phoneNumber, primaryContact.id, 'secondary');
    }
    
    const allRelatedContacts = await contactService.findAllRelatedContacts(primaryContact.id);
    const response = contactService.formatContactsResponse(allRelatedContacts);
    
    res.json(response);
    
  } catch (error) {
    console.error('Error in identify controller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
