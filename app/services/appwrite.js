import { Account, Client, ID } from 'react-native-appwrite';

const client = new Client();

// Initialize client
client
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('686e9b88001159ab5cb2');

// Initialize account
const account = new Account(client);

export const appwriteService = {
  // Test connection and permissions
  testConnection: async () => {
    try {
      // First test - Check project connection
      console.log('🔄 Step 1: Testing project connection...');
      try {
        await account.get();
        console.log('❌ Warning: Found existing session');
        // Clean up any existing session
        await account.deleteSessions();
        console.log('✅ Cleaned up existing session');
      } catch (error) {
        if (error.code !== 401) {
          throw {
            step: 'project_connection',
            message: 'Failed to connect to Appwrite',
            details: error.message,
            code: error.code
          };
        }
        console.log('✅ Project connection successful');
      }

      // Generate test credentials
      const testId = ID.unique();
      const email = `test.${testId}@test.com`;
      const password = 'Test123!@#';
      
      // Step 2 - Create account
      console.log('🔄 Step 2: Testing account creation...');
      try {
        const newAccount = await account.create(
          testId,
          email,
          password,
          'Test User'
        );
        console.log('✅ Account creation successful:', newAccount.$id);
      } catch (error) {
        throw {
          step: 'account_creation',
          message: 'Failed to create test account',
          details: error.message,
          code: error.code,
          hint: error.code === 401 ? 'Check if React Native platform is enabled in Appwrite Console' : ''
        };
      }

      // Step 3 - Test login
      console.log('🔄 Step 3: Testing login...');
      try {
        const session = await account.createEmailPasswordSession(email, password);
        console.log('✅ Login successful:', session.$id);
      } catch (error) {
        throw {
          step: 'login',
          message: 'Failed to login',
          details: error.message,
          code: error.code
        };
      }

      // Step 4 - Test account get
      console.log('🔄 Step 4: Testing account retrieval...');
      try {
        const user = await account.get();
        console.log('✅ Account retrieval successful:', user.name);
      } catch (error) {
        throw {
          step: 'account_get',
          message: 'Failed to get account details',
          details: error.message,
          code: error.code
        };
      }

      // Step 5 - Cleanup
      console.log('🔄 Step 5: Cleaning up...');
      try {
        await account.deleteSessions();
        await account.delete();
        console.log('✅ Cleanup successful');
      } catch (error) {
        console.warn('⚠️ Cleanup warning:', error.message);
        // Don't throw on cleanup errors
      }

      return {
        success: true,
        message: 'All tests passed successfully!'
      };
    } catch (error) {
      console.error('❌ Test failed:', error);
      let errorMessage = error.message;
      let hint = '';

      // Add helpful hints based on error codes
      if (error.code === 401) {
        hint = 'Make sure React Native platform is enabled in Appwrite Console and Project ID is correct';
      } else if (error.code === 404) {
        hint = 'Check if your Project ID is correct';
      } else if (error.code === 'project_connection') {
        hint = 'Verify your endpoint URL and Project ID';
      }

      return {
        success: false,
        message: errorMessage,
        error,
        hint
      };
    }
  },

  // Create a new account
  createAccount: async (email, password, name) => {
    try {
      const userId = ID.unique();
      const response = await account.create(
        userId,
        email,
        password,
        name
      );
      
      if (response) {
        // Login immediately after successful registration
        return await appwriteService.login(email, password);
      }
    } catch (error) {
      throw error;
    }
  },

  // Login to account
  login: async (email, password) => {
    try {
      console.log('🔄 Attempting login with email:', email);
      const session = await account.createEmailPasswordSession(email, password);
      console.log('✅ Login successful, session:', session);
      return session;
    } catch (error) {
      console.error('❌ Login error:', {
        code: error.code,
        message: error.message,
        type: error.type,
        response: error.response
      });
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      return await account.deleteSessions();
    } catch (error) {
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      // First check if we have an active session
      try {
        const sessions = await account.listSessions();
        if (sessions.total === 0) {
          console.log('No active session found');
          return null;
        }
      } catch (error) {
        console.error('Error checking sessions:', error);
        return null;
      }

      // Now try to get the user
      return await account.get();
    } catch (error) {
      console.error('Error getting current user:', error);
      // If we get a missing scope error, we need to re-authenticate
      if (error.code === 401 || error.message.includes('missing scope')) {
        console.log('Session expired or invalid - user needs to login again');
        // Clean up any invalid sessions
        try {
          await account.deleteSessions();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      return null;
    }
  },

  // Check if user is logged in
  isLoggedIn: async () => {
    try {
      const user = await account.get();
      return !!user;
    } catch (error) {
      return false;
    }
  }
}; 