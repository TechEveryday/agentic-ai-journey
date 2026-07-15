import type { Bracket } from '@/core';

export interface IBracketRepository {
  getAll(): Promise<Bracket[]>;
  getById(id: string): Promise<Bracket | null>;
  save(bracket: Bracket): Promise<void>;
  delete(id: string): Promise<void>;
}
