
// Removed hardcoded enum to allow dynamic categories
export type Category = string; 

export enum OrderStatus {
  PENDING = '待处理', // 刚下单，待接单/打印
  COOKING = '烹饪中', // 厨房制作中
  SERVED = '已上菜',  // 服务员已送达
  PAID = '已支付',    // 结账完成 (Legacy/Digital)
  COMPLETED = '已完成', // 订单结束 (Takeout done)
  CANCELLED = '已取消'
}

export type OrderSource = 'LOBBY' | 'ROOM_SERVICE' | 'KTV' | 'TAKEOUT';

export type PaymentMethod = 'CASH' | 'WECHAT' | 'ALIPAY' | 'USDT' | 'GCASH' | 'MAYA' | 'UNIONPAY' | 'CREDIT_CARD' | 'SIGN_BILL';

// Interface Optimization: Recipe Structure
export interface DishIngredient {
  ingredientId: string;
  quantity: number; // Amount required per dish (e.g., 0.5 unit)
}

export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  imageUrl: string;
  available: boolean;
  spiciness: number; // 0-3
  ingredients?: DishIngredient[]; 
}

export interface OrderItem {
  dishId: string;
  dishName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  tableNumber: string; 
  source: OrderSource; 
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  createdAt: string; // ISO string
  notes?: string;
  paymentMethod?: PaymentMethod; 
}

// Inventory Types
export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  threshold: number; // Low stock alert threshold
  updatedAt: string;
}

// Finance Types
export enum ExpenseCategory {
  INGREDIENTS = '食材采购',
  SALARY = '员工工资',
  RENT = '店铺租金',
  UTILITIES = '水电煤气',
  MAINTENANCE = '维修保养',
  OTHER = '其他支出'
}

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string; // ISO string
}

// KTV Types
export type KTVRoomType = 'Small' | 'Medium' | 'Large' | 'VIP';
export type KTVRoomStatus = 'Available' | 'InUse' | 'Cleaning' | 'Maintenance';

export interface KTVSession {
  guestName: string;
  startTime: string; // ISO String
  orders: OrderItem[]; // Associated food/drink orders
}

export interface KTVRoom {
  id: string;
  name: string;
  type: KTVRoomType;
  status: KTVRoomStatus;
  hourlyRate: number;
  currentSession?: KTVSession;
  currentSong?: string; // Simulation
}

// Hotel Room Types (Dining Focused)
export type HotelRoomStatus = 'Vacant' | 'Occupied'; 

export interface HotelRoom {
  id: string;
  number: string; // e.g. "8201"
  floor: number;  // 2 or 3
  status: HotelRoomStatus;
  guestName?: string; 
  orders: OrderItem[]; 
  lastOrderTime?: string;
}

// Sign Bill System Types
export interface SignBillAccount {
  id: string;
  name: string; // 挂帐人/单位
  cooperationMethod: string; // 合作方式 (e.g. 协议单位, 长期合作, 临时挂帐)
  settlementMethod: string; // 结算方式 (e.g. 月结, 季结, 单笔结)
  approver: string; // 批准人
  phoneNumber: string;
  creditLimit?: number; // 信用额度
  currentDebt: number; // 当前欠款
  status: 'Active' | 'Inactive';
  lastTransactionDate?: string;
}

// Transaction Record for Sign Bill history
export interface BillTransaction {
    id: string;
    accountId: string;
    amount: number;
    type: 'CHARGE' | 'SETTLEMENT'; // 记账 or 还款
    paymentMethod?: PaymentMethod; // Only for settlement
    date: string;
}

export interface PaymentConfig {
  enabledMethods: PaymentMethod[]; // Allowed methods
  aliPayEnabled: boolean;
  weChatEnabled: boolean;
  gCashEnabled: boolean;
  mayaEnabled: boolean;
}

export interface StoreInfo {
    name: string;
    address: string;
    phone: string;
    openingHours: string;
    kitchenPrinterUrl?: string;
    wifiSsid?: string;
    wifiPassword?: string;
    telegram?: string;
}

export interface SystemSettings {
    storeInfo?: StoreInfo;
    notifications?: {
        sound: boolean;
        desktop: boolean;
    };
    payment?: PaymentConfig;
    exchangeRate?: number; // RMB to PHP
    serviceChargeRate?: number; // e.g., 0.10 for 10%
    categories?: string[]; // Dynamic categories
}

export type Page = 'dashboard' | 'menu' | 'orders' | 'finance' | 'inventory' | 'settings' | 'ktv' | 'signbill' | 'hotel' | 'qrcode' | 'kitchen' | 'customer' | 'car';

// Standardized API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

// Storage Configuration
export type StorageType = 'local' | 's3' | 'github';

export interface S3Config {
  region: string;
  endpoint?: string; // Optional for non-AWS S3
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export interface GitHubConfig {
  owner: string;      // GitHub Username or Org name
  repo: string;       // Repository name
  branch: string;     // e.g. 'main'
  token: string;      // Personal Access Token
  pathPrefix?: string; // Optional folder path, defaults to 'data/'
}

export interface SupabaseConfig {
  url: string;
  key: string;
}

export interface StorageSettings {
  type: StorageType;
  s3Config: S3Config;
  githubConfig: GitHubConfig;
}

// Car Service Types
export interface CarRecord {
  id: string;
  guestName: string;
  destination: string;
  price: number;
  driver: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  date: string; // ISO string
}
