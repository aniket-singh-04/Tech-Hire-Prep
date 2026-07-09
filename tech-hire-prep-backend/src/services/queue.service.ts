type Redis = any;

export class QueueService {
  constructor(private readonly redis: Redis) {}

  async enqueue(userId: string): Promise<void> {}

  async dequeue(userId: string): Promise<void> {}

  async getPosition(userId: string): Promise<number> {
    return -1;
  }

  async getQueueSize(): Promise<number> {
    return 0;
  }

  async estimateWaitTime(position: number): Promise<number> {
    return position * 30; // placeholder
  }
}