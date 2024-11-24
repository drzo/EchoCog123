import { Logger } from '../../cogutil/Logger';

interface Experience {
  state: Float32Array;
  action: string;
  reward: number;
  nextState: Float32Array;
  done: boolean;
}

export class ExperienceReplay {
  private buffer: Experience[];
  private readonly maxSize: number;

  constructor(maxSize: number) {
    this.buffer = [];
    this.maxSize = maxSize;
  }

  addExperience(experience: Experience): void {
    try {
      if (this.buffer.length >= this.maxSize) {
        this.buffer.shift();
      }
      this.buffer.push(experience);
    } catch (error) {
      Logger.error('Failed to add experience:', error);
    }
  }

  sampleBatch(batchSize: number): Experience[] {
    try {
      if (this.buffer.length === 0) return [];
      
      const indices = new Set<number>();
      while (indices.size < Math.min(batchSize, this.buffer.length)) {
        indices.add(Math.floor(Math.random() * this.buffer.length));
      }

      return Array.from(indices).map(i => this.buffer[i]);
    } catch (error) {
      Logger.error('Failed to sample batch:', error);
      return [];
    }
  }

  getSize(): number {
    return this.buffer.length;
  }

  clear(): void {
    this.buffer = [];
  }
}