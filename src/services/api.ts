import type {
  User,
  Restaurant,
  MenuItem,
  Order,
  Review,
  Promotion,
  Notification,
  AuthResponse,
  Address,
} from '../types/index.js';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('foodora_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
  }
  return data as T;
}

export const api = {
  // Authentication
  auth: {
    async register(payload: { name: string; email: string; phone: string; password: string }): Promise<AuthResponse> {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return handleResponse<AuthResponse>(res);
    },

    async login(payload: { email: string; password: string }): Promise<AuthResponse> {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return handleResponse<AuthResponse>(res);
    },

    async demoSwitch(role: string): Promise<AuthResponse> {
      const res = await fetch(`${API_BASE}/auth/demo-switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      return handleResponse<AuthResponse>(res);
    },

    async getMe(): Promise<{ user: User }> {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<{ user: User }>(res);
    },

    async logout(): Promise<void> {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
      }).catch(() => {});
    },
  },

  // Restaurants
  restaurants: {
    async getAll(params?: Record<string, string | number | boolean | undefined>): Promise<{ count: number; restaurants: Restaurant[] }> {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined && val !== '') query.append(key, String(val));
        });
      }
      const res = await fetch(`${API_BASE}/restaurants?${query.toString()}`);
      return handleResponse<{ count: number; restaurants: Restaurant[] }>(res);
    },

    async getById(id: string): Promise<{
      restaurant: Restaurant;
      categories: string[];
      menuCount: number;
      reviewsCount: number;
      recentReviews: Review[];
    }> {
      const res = await fetch(`${API_BASE}/restaurants/${id}`);
      return handleResponse(res);
    },

    async create(payload: Partial<Restaurant>): Promise<{ restaurant: Restaurant }> {
      const res = await fetch(`${API_BASE}/restaurants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },

    async update(id: string, payload: Partial<Restaurant>): Promise<{ restaurant: Restaurant }> {
      const res = await fetch(`${API_BASE}/restaurants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },
  },

  // Menu Items
  menu: {
    async getByRestaurant(restaurantId?: string, category?: string, search?: string): Promise<{ menuItems: MenuItem[] }> {
      const query = new URLSearchParams();
      if (restaurantId) query.append('restaurantId', restaurantId);
      if (category) query.append('category', category);
      if (search) query.append('search', search);

      const res = await fetch(`${API_BASE}/menu-items?${query.toString()}`);
      return handleResponse(res);
    },

    async getById(id: string): Promise<{ menuItem: MenuItem }> {
      const res = await fetch(`${API_BASE}/menu-items/${id}`);
      return handleResponse(res);
    },

    async create(payload: Partial<MenuItem>): Promise<{ menuItem: MenuItem }> {
      const res = await fetch(`${API_BASE}/menu-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },

    async update(id: string, payload: Partial<MenuItem>): Promise<{ menuItem: MenuItem }> {
      const res = await fetch(`${API_BASE}/menu-items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },

    async delete(id: string): Promise<void> {
      const res = await fetch(`${API_BASE}/menu-items/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
  },

  // Orders
  orders: {
    async create(payload: {
      restaurantId: string;
      items: { menuItemId: string; quantity: number; instructions?: string; selectedCustomizations?: string[] }[];
      deliveryAddress: Address;
      paymentMethod: 'cod' | 'card_demo';
      promoCode?: string;
      notes?: string;
    }): Promise<{ order: Order }> {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },

    async getMyOrders(): Promise<{ orders: Order[] }> {
      const res = await fetch(`${API_BASE}/orders/my-orders`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },

    async getById(id: string): Promise<{ order: Order }> {
      const res = await fetch(`${API_BASE}/orders/${id}`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },

    async cancel(id: string): Promise<{ order: Order }> {
      const res = await fetch(`${API_BASE}/orders/${id}/cancel`, {
        method: 'PATCH',
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },

    async simulateStep(id: string): Promise<{ order: Order }> {
      const res = await fetch(`${API_BASE}/orders/${id}/simulate-step`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
  },

  // Reviews
  reviews: {
    async getByRestaurant(restaurantId: string): Promise<{ reviews: Review[] }> {
      const res = await fetch(`${API_BASE}/reviews/restaurant/${restaurantId}`);
      return handleResponse(res);
    },

    async submit(restaurantId: string, payload: { rating: number; comment: string; orderId?: string }): Promise<{ review: Review; updatedRestaurantRating: number }> {
      const res = await fetch(`${API_BASE}/reviews/restaurant/${restaurantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },
  },

  // User Profile & Addresses
  users: {
    async updateProfile(payload: { name?: string; phone?: string; avatarUrl?: string }): Promise<{ user: User }> {
      const res = await fetch(`${API_BASE}/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },

    async getAddresses(): Promise<{ addresses: Address[] }> {
      const res = await fetch(`${API_BASE}/users/me/addresses`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },

    async addAddress(payload: Omit<Address, 'id'>): Promise<{ address: Address; addresses: Address[] }> {
      const res = await fetch(`${API_BASE}/users/me/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },

    async updateAddress(addressId: string, payload: Partial<Address>): Promise<{ addresses: Address[] }> {
      const res = await fetch(`${API_BASE}/users/me/addresses/${addressId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      return handleResponse(res);
    },

    async deleteAddress(addressId: string): Promise<{ addresses: Address[] }> {
      const res = await fetch(`${API_BASE}/users/me/addresses/${addressId}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
  },

  // Promotions
  promotions: {
    async getAll(): Promise<{ promotions: Promotion[] }> {
      const res = await fetch(`${API_BASE}/promotions`);
      return handleResponse(res);
    },

    async validate(code: string, subtotalLkr: number): Promise<{
      valid: boolean;
      code: string;
      discountType: 'percentage' | 'fixed';
      discountValue: number;
      discountLkr: number;
      description: string;
    }> {
      const res = await fetch(`${API_BASE}/promotions/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotalLkr }),
      });
      return handleResponse(res);
    },
  },

  // Owner
  owner: {
    async getDashboard(): Promise<{
      metrics: {
        totalRestaurants: number;
        totalOrders: number;
        activeOrdersCount: number;
        totalRevenueLkr: number;
        menuItemsCount: number;
      };
      restaurants: Restaurant[];
      recentOrders: Order[];
    }> {
      const res = await fetch(`${API_BASE}/owner/dashboard`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },

    async getOrders(): Promise<{ orders: Order[] }> {
      const res = await fetch(`${API_BASE}/owner/orders`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },

    async updateOrderStatus(orderId: string, status: string, message?: string): Promise<{ order: Order }> {
      const res = await fetch(`${API_BASE}/owner/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ status, message }),
      });
      return handleResponse(res);
    },

    async toggleOpen(restaurantId: string): Promise<{ restaurant: Restaurant }> {
      const res = await fetch(`${API_BASE}/owner/restaurants/${restaurantId}/toggle-open`, {
        method: 'PATCH',
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },

    async getMenu(): Promise<{ menuItems: MenuItem[]; restaurants: Restaurant[] }> {
      const res = await fetch(`${API_BASE}/owner/menu`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
  },

  // Rider
  rider: {
    async getDashboard(): Promise<{
      metrics: {
        totalDeliveries: number;
        activeOrdersCount: number;
        availableTasksCount: number;
        demoTotalEarningsLkr: number;
      };
      activeOrders: Order[];
      availableTasks: Order[];
      completedOrders: Order[];
    }> {
      const res = await fetch(`${API_BASE}/rider/dashboard`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },

    async getOrders(): Promise<{ assigned: Order[]; available: Order[] }> {
      const res = await fetch(`${API_BASE}/rider/orders`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },

    async acceptTask(orderId: string): Promise<{ order: Order }> {
      const res = await fetch(`${API_BASE}/rider/orders/${orderId}/accept`, {
        method: 'PATCH',
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },

    async updateStatus(orderId: string, status: string, message?: string): Promise<{ order: Order }> {
      const res = await fetch(`${API_BASE}/rider/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ status, message }),
      });
      return handleResponse(res);
    },
  },

  // Admin
  admin: {
    async getDashboard(): Promise<any> {
      const res = await fetch(`${API_BASE}/admin/dashboard`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },

    async getUsers(): Promise<{ users: User[] }> {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },

    async updateUserStatus(id: string, status: 'active' | 'inactive'): Promise<{ user: User }> {
      const res = await fetch(`${API_BASE}/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ status }),
      });
      return handleResponse(res);
    },

    async getRestaurants(): Promise<{ restaurants: Restaurant[] }> {
      const res = await fetch(`${API_BASE}/admin/restaurants`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },

    async updateRestaurantStatus(id: string, status: string): Promise<{ restaurant: Restaurant }> {
      const res = await fetch(`${API_BASE}/admin/restaurants/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ status }),
      });
      return handleResponse(res);
    },

    async getOrders(): Promise<{ orders: Order[] }> {
      const res = await fetch(`${API_BASE}/admin/orders`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },

    async resetDemoData(): Promise<{ message: string }> {
      const res = await fetch(`${API_BASE}/admin/reset-data`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
  },

  // Notifications
  notifications: {
    async getAll(): Promise<{ notifications: Notification[]; unreadCount: number }> {
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },

    async markRead(id: string): Promise<void> {
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },

    async markAllRead(): Promise<void> {
      const res = await fetch(`${API_BASE}/notifications/mark-all-read`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
  },
};
