/**
 * Mock for CosmosDB service
 * Provides in-memory storage for tests
 */

const mockItems = new Map<string, any>()

export const mockContainer = {
  items: {
    query: jest.fn().mockReturnValue({
      fetchAll: jest.fn().mockResolvedValue({ resources: [] }),
    }),
    upsert: jest.fn().mockImplementation(async (item: any) => {
      mockItems.set(item.id, item)
      return { resource: item }
    }),
    create: jest.fn().mockImplementation(async (item: any) => {
      mockItems.set(item.id, item)
      return { resource: item }
    }),
  },
  item: jest.fn().mockImplementation((id: string) => ({
    read: jest.fn().mockResolvedValue({ resource: mockItems.get(id) || null }),
    replace: jest.fn().mockImplementation(async (item: any) => {
      mockItems.set(id, item)
      return { resource: item }
    }),
    delete: jest.fn().mockResolvedValue({}),
  })),
}

export const getContainer = jest.fn().mockReturnValue(mockContainer)
export const initializeCosmos = jest.fn().mockResolvedValue(undefined)

// Helpers for tests
export function resetMockItems() {
  mockItems.clear()
}

export function setMockItems(items: Record<string, any>) {
  for (const [key, val] of Object.entries(items)) {
    mockItems.set(key, val)
  }
}

export function setMockQueryResult(resources: any[]) {
  mockContainer.items.query.mockReturnValue({
    fetchAll: jest.fn().mockResolvedValue({ resources }),
  })
}
