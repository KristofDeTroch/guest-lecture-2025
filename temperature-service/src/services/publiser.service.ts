import { Injectable } from '@nestjs/common';
import { PubSub } from '@google-cloud/pubsub';
import config from '~/config.parser';

@Injectable()
export class PublisherService {
  private pubSub: PubSub;
  constructor() {
    this.pubSub = new PubSub();
  }

  async publishEmailEvent({ temperature }: { temperature: number }) {
    const topic = this.pubSub.topic(config.gcloud.pubsubTopics.email);
    await topic.publishMessage({
      data: Buffer.from(JSON.stringify({ temperature })),
      attributes: { 'content-type': 'application/json' },
    });
  }
}
