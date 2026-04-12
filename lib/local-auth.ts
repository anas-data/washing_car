import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: "admin" | "employee" | "reviewer" | "user";
}

export interface LoginCredentials {
  username: string;
  password: string;
}

const SESSION_TOKEN_KEY = "app_session_token";
const USER_INFO_KEY = "app_user_info";

// Mock users database - in production, this would be from a real database
const MOCK_USERS = [
  {
    id: "1",
    username: "admin",
    email: "admin@example.com",
    password: "admin123", // In production, use hashed passwords
    name: "أحمد محمد",
    role: "admin" as const,
  },
  {
    id: "2",
    username: "employee",
    email: "employee@example.com",
    password: "emp123",
    name: "فاطمة علي",
    role: "employee" as const,
  },
  {
    id: "3",
    username: "reviewer",
    email: "reviewer@example.com",
    password: "rev123",
    name: "محمود حسن",
    role: "reviewer" as const,
  },
];

/**
 * Local authentication service
 * Handles login, logout, and session management
 */
export const localAuth = {
  /**
   * Login with username/email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Find user by username or email
    const user = MOCK_USERS.find(
      (u) =>
        u.username === credentials.username ||
        u.email === credentials.username
    );

    if (!user) {
      throw new Error("المستخدم غير موجود");
    }

    // Verify password
    if (user.password !== credentials.password) {
      throw new Error("كلمة المرور غير صحيحة");
    }

    // Create session token
    const sessionToken = `token_${user.id}_${Date.now()}`;

    // Save session and user info
    await AsyncStorage.setItem(SESSION_TOKEN_KEY, sessionToken);
    await AsyncStorage.setItem(
      USER_INFO_KEY,
      JSON.stringify({
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
      })
    );

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  },

  /**
   * Get current user from session
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const token = await AsyncStorage.getItem(SESSION_TOKEN_KEY);
      if (!token) {
        return null;
      }

      const userJson = await AsyncStorage.getItem(USER_INFO_KEY);
      if (!userJson) {
        return null;
      }

      return JSON.parse(userJson);
    } catch (error) {
      console.error("[LocalAuth] Error getting current user:", error);
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(SESSION_TOKEN_KEY);
    return !!token;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await AsyncStorage.removeItem(SESSION_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_INFO_KEY);
  },

  /**
   * Get session token
   */
  async getSessionToken(): Promise<string | null> {
    return AsyncStorage.getItem(SESSION_TOKEN_KEY);
  },
};
