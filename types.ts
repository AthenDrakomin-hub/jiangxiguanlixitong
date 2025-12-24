// Standard types for the hotel management system
export interface Dish {
  id: string;
  name: string;
  category: string;
  price: number;
  cost?: number;
  description?: string;
  image?: string;
  available: boolean;
  createdAt: string;
  updatedAt: string;
  ingredients?: string[];
}

export interface OrderItem {
  id: string;
  dishId: string;
  name: string;
  quantity: number;
  price: number;
  specialRequests?: string;
}

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  discount?: number;
  tax?: number;
  serviceCharge?: number;
  paid: boolean;
  timestamp: string;
  completedAt?: string;
  customerName?: string;
  customerPhone?: string;
  roomNumber?: string;
  paymentMethod?: string;
  paymentStatus?: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  specialRequests?: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  COOKING = 'COOKING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ExpenseCategory {
  INGREDIENTS = 'Ingredients',
  RENT = 'Rent',
  SALARY = 'Salary',
  UTILITIES = 'Utilities',
  MAINTENANCE = 'Maintenance',
  EQUIPMENT = 'Equipment',
  OTHER = 'Other',
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  receiptImage?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  pricePerUnit?: number;
  supplier?: string;
  lastRestocked?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KTVRoom {
  id: string;
  name: string;
  status: 'available' | 'occupied' | 'maintenance';
  currentSession?: {
    startTime: string;
    customerName: string;
    advancePayment: number;
    totalCharges?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SignBillAccount {
  id: string;
  accountName: string;
  creditLimit: number;
  currentBalance: number;
  status: 'active' | 'suspended' | 'closed';
  contactPerson?: string;
  contactPhone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HotelRoom {
  id: string;
  roomNumber: string;
  roomType: string;
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  currentGuest?: {
    name: string;
    checkInDate: string;
    expectedCheckOut: string;
    advancePayment: number;
  };
  rate: number;
  floor?: number;
  bedType?: string;
  amenities?: string[];
  lastCleaned?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemSettings {
  storeInfo?: StoreInfo;
  notifications?: {
    sound: boolean;
    desktop: boolean;
  };
  payment?: {
    enabledMethods: string[];
    aliPayEnabled?: boolean;
    weChatEnabled?: boolean;
    gCashEnabled?: boolean;
    mayaEnabled?: boolean;
  };
  exchangeRate?: number;
  serviceChargeRate?: number;
  categories?: string[]; // Dynamic categories
  // H5页面配置
  h5PageSettings?: {
    enableCustomStyling?: boolean;
    customHeaderColor?: string;
    customButtonColor?: string;
    showStoreInfo?: boolean;
    showWiFiInfo?: boolean;
  };
}

export interface StoreInfo {
  name: string;
  address: string;
  phone: string;
  openingHours: string;
  kitchenPrinterUrl?: string;
  wifiSsid: string;
  wifiPassword: string;
  telegram: string;
  h5PageTitle?: string;
  h5PageDescription?: string;
  h5PageKeywords?: string;
  bannerImageUrl?: string;
  mapUrl?: string;
}

export type Page =
  | 'dashboard'
  | 'menu'
  | 'orders'
  | 'finance'
  | 'inventory'
  | 'settings'
  | 'ktv'
  | 'signbill'
  | 'hotel'
  | 'qrcode'
  | 'kitchen'
  | 'customer'
  | 'payment'
  | 'permissions'
  | 'dataviewer'
  | 'validationtest'
  | 'autodetect';

// Standardized API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

// Storage Configuration
export type StorageType = 'mongodb' | 'mysql' | 'postgresql' | 'sqlite' | 'file' | 'memory' | 'neon';

export interface S3Config {
  region: string;
  endpoint?: string; // Optional for non-AWS S3
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export interface GitHubConfig {
  owner: string; // GitHub Username or Org name
  repo: string; // Repository name
  branch: string; // e.g. 'main'
  token: string; // Personal Access Token
  pathPrefix?: string; // Optional folder path, defaults to 'data/'
}



export interface NeonConfig {
  connectionString: string;
}



export interface StorageSettings {
  type: StorageType;
}

// Car Service Types
export interface CarWashOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  licensePlate: string;
  vehicleType: 'car' | 'suv' | 'truck' | 'motorcycle';
  serviceType: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  assignedStaff?: string;
  scheduledTime: string;
  completedTime?: string;
  price: number;
  discount?: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Database interface for abstraction
export interface Database {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<boolean>;
  getAll<T>(prefix: string): Promise<T[]>;
  create<T>(prefix: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update<T>(prefix: string, id: string, data: Partial<T>): Promise<T | null>;
  remove(prefix: string, id: string): Promise<boolean>;
}

// Database configuration type
export interface DatabaseConfig {
  type: StorageType;
  settings?: NeonConfig | null;
}

// Database factory interface
export interface DatabaseFactory {
  create(config: DatabaseConfig): Database;
}

// 用户管理相关类型
export interface User {
  id: string;
  username: string;
  password: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}