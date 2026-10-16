export type UserRole = 'customer' | 'restaurant_owner' | 'rider' | 'admin';

export type UserStatus = 'active' | 'inactive';

export interface Address {
  id: string;
  label: string; // 'Home', 'Work', 'Other'
  addressLine: string;
  city: string;
  district: string;
  postalCode?: string;
  landmark?: string;
  isDefault: boolean;
  lat?: number;
  lng?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  addresses: Address[];
  createdAt: string;
  avatarUrl?: string;
  isOnline?: boolean;
  lastLocation?: {
    lat: number;
    lng: number;
    updatedAt: string;
  };
}

export interface UserWithPassword extends User {
  passwordHash: string;
}

export type RestaurantStatus = 'approved' | 'pending' | 'suspended';

export interface Restaurant {
  id: string;
  ownerId: string;
  name: string;
  tagline: string;
  description: string;
  logoUrl: string;
  coverImageUrl: string;
  address: string;
  city: string;
  district: string;
  cuisine: string[];
  rating: number;
  reviewCount: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  deliveryFeeLkr: number;
  minOrderLkr: number;
  isOpen: boolean;
  status: RestaurantStatus;
  featured: boolean;
  phone: string;
  openHours: string;
  createdAt: string;
  lat: number;
  lng: number;
}

export interface MenuItemCustomization {
  name: string;
  options: {
    label: string;
    priceDeltaLkr: number;
  }[];
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  priceLkr: number;
  category: string;
  imageUrl: string;
  isAvailable: boolean;
  isVegetarian: boolean;
  isSpicy: boolean;
  isHalal: boolean;
  preparationTimeMinutes: number;
  customizationOptions?: MenuItemCustomization[];
  createdAt: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'picked_up'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  menuItemId: string;
  name: string;
  priceLkr: number;
  quantity: number;
  instructions?: string;
  selectedCustomizations?: string[];
  imageUrl?: string;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  message: string;
}

export interface RiderLocation {
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  updatedAt: string;
  accuracy?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  restaurantId: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantLat?: number;
  restaurantLng?: number;
  customerLat?: number;
  customerLng?: number;
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  riderLocation?: RiderLocation;
  locationHistory?: { lat: number; lng: number; timestamp: string }[];
  items: OrderItem[];
  subtotalLkr: number;
  deliveryFeeLkr: number;
  discountLkr: number;
  totalLkr: number;
  promoCode?: string;
  deliveryAddress: Address;
  paymentMethod: 'cod' | 'card_demo';
  paymentStatus: 'pending' | 'paid';
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  timeline: OrderTimelineEvent[];
}

export interface Review {
  id: string;
  restaurantId: string;
  customerId: string;
  customerName: string;
  orderId?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Promotion {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderLkr: number;
  maxDiscountLkr?: number;
  validUntil: string;
  isActive: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'promo' | 'system' | 'rider';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  instructions?: string;
  selectedCustomizations?: string[];
}
