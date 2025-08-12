export interface Contact {
  id: number;
  phoneNumber?: string | null;
  email?: string | null;
  linkedId?: number | null;
  linkPrecedence: 'primary' | 'secondary';
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface IdentifyRequest {
  email?: string | null;
  phoneNumber?: string | null;
}

export interface IdentifyResponse {
  contact: {
    primaryContactId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
  };
}
