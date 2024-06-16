import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class NotificationsService {
  constructor(private eventEmitter: EventEmitter2) {}

  notifyFollowers(followerName: string, followedUserId: number) {
    this.eventEmitter.emit('user.followed', { followerName, followedUserId });
  }
}
