import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getInitialSeedData } from '../scripts/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../server/data');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory write lock map per file to prevent concurrent collisions
const writeLocks = new Map<string, Promise<void>>();

export class JsonStorage<T extends { id: string }> {
  private filePath: string;
  private defaultDataFactory: () => T[];

  constructor(fileName: string, defaultDataFactory: () => T[]) {
    this.filePath = path.join(DATA_DIR, fileName);
    this.defaultDataFactory = defaultDataFactory;
    this.ensureInitialized();
  }

  private ensureInitialized(): void {
    try {
      if (!fs.existsSync(this.filePath)) {
        const defaults = this.defaultDataFactory();
        fs.writeFileSync(this.filePath, JSON.stringify(defaults, null, 2), 'utf-8');
      } else {
        const content = fs.readFileSync(this.filePath, 'utf-8').trim();
        if (!content || content === '[]') {
          const defaults = this.defaultDataFactory();
          fs.writeFileSync(this.filePath, JSON.stringify(defaults, null, 2), 'utf-8');
        }
      }
    } catch (err) {
      console.error(`Failed to initialize storage for ${this.filePath}:`, err);
    }
  }

  private async acquireLock(): Promise<() => void> {
    while (writeLocks.has(this.filePath)) {
      await writeLocks.get(this.filePath);
    }
    let resolveLock!: () => void;
    const lockPromise = new Promise<void>((resolve) => {
      resolveLock = resolve;
    });
    writeLocks.set(this.filePath, lockPromise);

    return () => {
      writeLocks.delete(this.filePath);
      resolveLock();
    };
  }

  public async getAll(): Promise<T[]> {
    try {
      if (!fs.existsSync(this.filePath)) {
        this.ensureInitialized();
      }
      const raw = await fs.promises.readFile(this.filePath, 'utf-8');
      return JSON.parse(raw) as T[];
    } catch (err) {
      console.error(`Error reading ${this.filePath}:`, err);
      return this.defaultDataFactory();
    }
  }

  public async getById(id: string): Promise<T | null> {
    const items = await this.getAll();
    return items.find((item) => item.id === id) || null;
  }

  public async find(predicate: (item: T) => boolean): Promise<T[]> {
    const items = await this.getAll();
    return items.filter(predicate);
  }

  public async findOne(predicate: (item: T) => boolean): Promise<T | null> {
    const items = await this.getAll();
    return items.find(predicate) || null;
  }

  public async saveAll(items: T[]): Promise<void> {
    const releaseLock = await this.acquireLock();
    try {
      const tempPath = `${this.filePath}.${Date.now()}.tmp`;
      const serialized = JSON.stringify(items, null, 2);
      await fs.promises.writeFile(tempPath, serialized, 'utf-8');
      await fs.promises.rename(tempPath, this.filePath);
    } finally {
      releaseLock();
    }
  }

  public async create(item: T): Promise<T> {
    const items = await this.getAll();
    items.unshift(item);
    await this.saveAll(items);
    return item;
  }

  public async update(id: string, partial: Partial<T>): Promise<T | null> {
    const items = await this.getAll();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return null;

    const updated: T = { ...items[index], ...partial };
    items[index] = updated;
    await this.saveAll(items);
    return updated;
  }

  public async delete(id: string): Promise<boolean> {
    const items = await this.getAll();
    const filtered = items.filter((i) => i.id !== id);
    if (filtered.length === items.length) return false;
    await this.saveAll(filtered);
    return true;
  }

  public async resetToDefaults(): Promise<T[]> {
    const defaults = this.defaultDataFactory();
    await this.saveAll(defaults);
    return defaults;
  }
}

// Singletons for each collection
const seed = getInitialSeedData();

export const userStorage = new JsonStorage('users.json', () => seed.users);
export const restaurantStorage = new JsonStorage('restaurants.json', () => seed.restaurants);
export const menuItemStorage = new JsonStorage('menu-items.json', () => seed.menuItems);
export const orderStorage = new JsonStorage('orders.json', () => seed.orders);
export const reviewStorage = new JsonStorage('reviews.json', () => seed.reviews);
export const promotionStorage = new JsonStorage('promotions.json', () => seed.promotions);
export const notificationStorage = new JsonStorage('notifications.json', () => seed.notifications);

export async function resetAllDataToSeed(): Promise<void> {
  const fresh = getInitialSeedData();
  await userStorage.saveAll(fresh.users);
  await restaurantStorage.saveAll(fresh.restaurants);
  await menuItemStorage.saveAll(fresh.menuItems);
  await orderStorage.saveAll(fresh.orders);
  await reviewStorage.saveAll(fresh.reviews);
  await promotionStorage.saveAll(fresh.promotions);
  await notificationStorage.saveAll(fresh.notifications);
}
