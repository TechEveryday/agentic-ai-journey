import type { Bracket } from '@/core';
import type { IBracketRepository } from '@/application';

const STORAGE_KEY = 'tournament-bracket:brackets';

export class LocalStorageBracketRepository implements IBracketRepository {
  async getAll(): Promise<Bracket[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return [];
      }
      return JSON.parse(data) as Bracket[];
    } catch (error) {
      // Gracefully handle corrupted localStorage data
      console.error('Failed to read brackets from localStorage:', error);
      return [];
    }
  }

  async getById(id: string): Promise<Bracket | null> {
    const brackets = await this.getAll();
    return brackets.find((bracket) => bracket.id === id) || null;
  }

  async save(bracket: Bracket): Promise<void> {
    const brackets = await this.getAll();
    const existingIndex = brackets.findIndex((b) => b.id === bracket.id);

    if (existingIndex >= 0) {
      // Update
      brackets[existingIndex] = bracket;
    } else {
      // Insert
      brackets.push(bracket);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(brackets));
  }

  async delete(id: string): Promise<void> {
    const brackets = await this.getAll();
    const filtered = brackets.filter((bracket) => bracket.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
}
