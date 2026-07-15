import type { Bracket } from '@/core';
import type { IBracketRepository } from '@/application';

/**
 * Mock repository for testing — stores brackets in memory
 * Useful for testing components and hooks without localStorage
 */
export class MockBracketRepository implements IBracketRepository {
  private brackets: Map<string, Bracket> = new Map();

  async getAll(): Promise<Bracket[]> {
    return Array.from(this.brackets.values());
  }

  async getById(id: string): Promise<Bracket | null> {
    return this.brackets.get(id) || null;
  }

  async save(bracket: Bracket): Promise<void> {
    this.brackets.set(bracket.id, bracket);
  }

  async delete(id: string): Promise<void> {
    this.brackets.delete(id);
  }

  clear(): void {
    this.brackets.clear();
  }
}
