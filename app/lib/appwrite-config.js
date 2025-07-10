import { Account, Client, Databases, Teams } from 'react-native-appwrite';

export const DATABASE_ID = 'murai';
export const GROUPS_COLLECTION_ID = 'groups';
export const GROUP_MEMBERS_COLLECTION_ID = 'group_members';

const client = new Client();

// Initialize client with your Appwrite project details
client
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('686e9b88001159ab5cb2');

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const teams = new Teams(client); 