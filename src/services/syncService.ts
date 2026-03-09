import { localDb, type Transaction } from '../db';

export async function syncData() {
  if (!navigator.onLine) return;

  try {
    const unsynced = await localDb.transactions
      .where('synced')
      .equals(0)
      .toArray();

    if (unsynced.length === 0) return;

    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions: unsynced }),
    });

    if (response.ok) {
      const ids = unsynced.map(t => t.id);
      await localDb.transactions.bulkUpdate(
        ids.map(id => ({
          key: id,
          changes: { synced: 1 }
        }))
      );
      console.log(`Synced ${unsynced.length} transactions`);
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Auto-sync every 30 seconds if online
export function startAutoSync() {
  setInterval(syncData, 30000);
  window.addEventListener('online', syncData);
}
