export function mapContactFromDB(dbContact: any): any {
  return {
    id: dbContact.id,
    phoneNumber: dbContact.phonenumber,
    email: dbContact.email,
    linkedId: dbContact.linkedid,
    linkPrecedence: dbContact.linkprecedence,
    createdAt: dbContact.createdat,
    updatedAt: dbContact.updatedat,
    deletedAt: dbContact.deletedat
  };
}


export function mapContactToDB(contact: any): any {
  return {
    id: contact.id,
    phonenumber: contact.phoneNumber,
    email: contact.email,
    linkedid: contact.linkedId,
    linkprecedence: contact.linkPrecedence,
    createdat: contact.createdAt,
    updatedat: contact.updatedAt,
    deletedat: contact.deletedAt
  };
}
