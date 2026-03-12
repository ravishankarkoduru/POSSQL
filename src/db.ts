import Dexie, { type Table } from 'dexie';

export interface Transaction {
  id: string;
  session_id: string;
  item_name: string;
  quantity: number;
  price: number;
  total: number;
  timestamp: string;
  user_id: string;
  synced: number; // 0 for no, 1 for yes
}

export interface Product {
  id: string;
  name: string;
  cost: number;
  price: number;
  category: string;
  image: string;
  stock: number;
  lowStock: number;
  isExpired: boolean;
  barcode: string;
  expiryDate: string;
  isActive: boolean;
}

export type Role = 'Admin' | 'Manager' | 'Cashier';

export interface Employee {
  id: string;
  name: string;
  role: Role;
  pin: string;
  createdAt: string;
}

export class SyncPOSDatabase extends Dexie {
  transactions!: Table<Transaction>;
  products!: Table<Product>;
  employees!: Table<Employee>;

  constructor() {
    super('SyncPOSDB');
    this.version(7).stores({
      transactions: 'id, session_id, timestamp, synced',
      products: 'id, name, category, barcode',
      employees: 'id, name, role, pin'
    });
  }
}

export const localDb = new SyncPOSDatabase();
