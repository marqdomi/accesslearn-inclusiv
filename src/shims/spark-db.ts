/**
 * Shim for @github/spark/db
 * Replaces GitHub Spark's DB class with a localStorage-backed implementation.
 * This allows the codebase to run outside of the GitHub Spark platform.
 *
 * NOTE: In production this data layer is replaced by the real backend API
 * (Azure Cosmos DB via Express). This shim is only used in environments that
 * still bootstrap via the Spark entrypoint (legacy / local dev without backend).
 */

function storageKey(collection: string): string {
  return `spark_db_${collection}`
}

function readCollection<T extends { id: string }>(collection: string): T[] {
  try {
    const raw = localStorage.getItem(storageKey(collection))
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}

function writeCollection<T extends { id: string }>(collection: string, items: T[]): void {
  try {
    localStorage.setItem(storageKey(collection), JSON.stringify(items))
  } catch (err) {
    console.warn(`[spark-db] Failed to persist collection "${collection}":`, err)
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export class DB {
  /** Return all items in a collection */
  async getAll<T extends { id: string }>(collection: string): Promise<T[]> {
    return readCollection<T>(collection)
  }

  /** Return a single item by id, or null if not found */
  async get<T extends { id: string }>(
    collection: string,
    id: string
  ): Promise<T | null> {
    const items = readCollection<T>(collection)
    return items.find((item) => item.id === id) ?? null
  }

  /** Insert a new item; auto-generates an id if not provided */
  async insert<T extends { id: string }>(
    collection: string,
    data: Omit<T, 'id'> & Partial<Pick<T, 'id'>>
  ): Promise<T> {
    const items = readCollection<T>(collection)
    const newItem = { ...data, id: (data as Partial<T>).id ?? generateId() } as T
    items.push(newItem)
    writeCollection(collection, items)
    return newItem
  }

  /** Merge partial updates into an existing item */
  async update<T extends { id: string }>(
    collection: string,
    id: string,
    data: Partial<T>
  ): Promise<T> {
    const items = readCollection<T>(collection)
    const index = items.findIndex((item) => item.id === id)
    if (index === -1) {
      throw new Error(`[spark-db] Item "${id}" not found in collection "${collection}"`)
    }
    items[index] = { ...items[index], ...data }
    writeCollection(collection, items)
    return items[index]
  }

  /** Remove an item by id */
  async delete(collection: string, id: string): Promise<void> {
    const items = readCollection<{ id: string }>(collection)
    const filtered = items.filter((item) => item.id !== id)
    writeCollection(collection, filtered)
  }
}
