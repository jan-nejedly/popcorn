import { Controller, Sse, MessageEvent, Param } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

@Controller('notifications')
export class NotificationsController {
  private userNotifications = new Map<number, Subject<MessageEvent>>();

  constructor(private eventEmitter: EventEmitter2) {}

  @Sse('sse/:userId')
  sse(@Param('userId') userId: number): Observable<MessageEvent> {
    if (!this.userNotifications.has(userId)) {
      this.userNotifications.set(userId, new Subject<MessageEvent>());
    }
    return this.userNotifications.get(userId).asObservable();
  }

  @OnEvent('user.followed')
  handleUserFollowedEvent(payload: {
    followerName: string;
    followedUserId: number;
  }) {
    if (this.userNotifications.has(payload.followedUserId)) {
      const notification = {
        data: `🍿 ${payload.followerName} just started following you!`,
      };
      this.userNotifications.get(payload.followedUserId).next(notification);
    }
  }
}
