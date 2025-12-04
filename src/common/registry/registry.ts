/**
 * Interface for uniquely named objects that can be registered
 */
export interface Registrable {
  readonly name: string;
}

/**
 * Generic registry for storing and retrieving objects by name
 */
export class Registry<T extends Registrable> {
  private readonly items = new Map<string, T>();
  private readonly itemList: T[] = [];

  /**
   * Register an item and return it for inline usage
   * @param item - The item to register
   * @returns The registered item
   * @throws Error if an item with the same name already exists
   */
  register(item: T): T {
    if (this.items.has(item.name)) {
      throw new Error(`Item with name "${item.name}" is already registered`);
    }

    this.items.set(item.name, item);
    this.itemList.push(item);
    return item;
  }

  /**
   * Get an item by name with O(1) lookup
   * @param name - The name of the item
   * @returns The item or undefined if not found
   */
  get(name: string): T | undefined {
    return this.items.get(name);
  }

  /**
   * Check if an item exists
   * @param name - The name to check
   * @returns true if the item exists
   */
  has(name: string): boolean {
    return this.items.has(name);
  }

  /**
   * Get all registered items as an array
   * @returns Array of all items
   */
  getAll(): readonly T[] {
    return this.itemList;
  }

  /**
   * Get all item names
   * @returns Array of all names
   */
  getAllNames(): string[] {
    return Array.from(this.items.keys());
  }

  /**
   * Get the count of registered items
   * @returns Number of items
   */
  get size(): number {
    return this.items.size;
  }

  /**
   * Clear all registered items
   */
  clear(): void {
    this.items.clear();
    this.itemList.length = 0;
  }
}
