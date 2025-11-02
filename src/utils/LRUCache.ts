/**
 * LRU Cache 实现
 * 使用双向链表 + Map 实现 O(1) 的访问和更新
 */
export default class LRUCache<K, V> {
  private maxSize: number;
  private cache: Map<K, { value: V; prev: K | null; next: K | null }>;
  private head: K | null = null;
  private tail: K | null = null;

  constructor(maxSize: number = 10) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  private moveToHead(key: K): void {
    const node = this.cache.get(key);
    if (!node || key === this.head) return;

    // 从链表中移除
    if (node.prev !== null) {
      const prevNode = this.cache.get(node.prev);
      if (prevNode) {
        prevNode.next = node.next;
      }
    }
    if (node.next !== null) {
      const nextNode = this.cache.get(node.next);
      if (nextNode) {
        nextNode.prev = node.prev;
      }
    }
    if (this.tail === key) {
      this.tail = node.prev;
    }

    // 移到头部
    if (this.head !== null) {
      const headNode = this.cache.get(this.head);
      if (headNode) {
        headNode.prev = key;
      }
    }
    node.prev = null;
    node.next = this.head;
    this.head = key;
    if (this.tail === null) {
      this.tail = key;
    }
  }

  get(key: K): V | undefined {
    const node = this.cache.get(key);
    if (!node) return undefined;

    this.moveToHead(key);
    return node.value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      const node = this.cache.get(key)!;
      node.value = value;
      this.moveToHead(key);
    } else {
      // 新增
      if (this.cache.size >= this.maxSize && this.tail !== null) {
        // 删除尾部
        const tailNode = this.cache.get(this.tail);
        if (tailNode && tailNode.prev !== null) {
          const prevNode = this.cache.get(tailNode.prev);
          if (prevNode) {
            prevNode.next = null;
          }
        }
        this.cache.delete(this.tail);
        this.tail = tailNode?.prev ?? null;
      }

      const node = { value, prev: null, next: this.head };
      this.cache.set(key, node);

      if (this.head !== null) {
        const headNode = this.cache.get(this.head);
        if (headNode) {
          headNode.prev = key;
        }
      }
      this.head = key;
      if (this.tail === null) {
        this.tail = key;
      }
    }
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    const node = this.cache.get(key);
    if (!node) return false;

    if (node.prev !== null) {
      const prevNode = this.cache.get(node.prev);
      if (prevNode) {
        prevNode.next = node.next;
      }
    }
    if (node.next !== null) {
      const nextNode = this.cache.get(node.next);
      if (nextNode) {
        nextNode.prev = node.prev;
      }
    }
    if (this.head === key) {
      this.head = node.next;
    }
    if (this.tail === key) {
      this.tail = node.prev;
    }

    return this.cache.delete(key);
  }

  size(): number {
    return this.cache.size;
  }

  clear(): void {
    this.cache.clear();
    this.head = null;
    this.tail = null;
  }

  forEach(callback: (value: V, key: K) => void): void {
    this.cache.forEach((node, key) => {
      callback(node.value, key);
    });
  }
}
