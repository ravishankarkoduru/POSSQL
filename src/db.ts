import Dexie, { type Table } from 'dexie';

export interface Transaction {
  id: string;
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
}

export class SyncPOSDatabase extends Dexie {
  transactions!: Table<Transaction>;
  products!: Table<Product>;

  constructor() {
    super('SyncPOSDB');
    this.version(4).stores({
      transactions: 'id, timestamp, synced',
      products: 'id, name, category, barcode'
    });
  }
}

export const localDb = new SyncPOSDatabase();
