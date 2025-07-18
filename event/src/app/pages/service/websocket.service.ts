import { Injectable } from '@angular/core';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private stompClient: Client | null = null;
  private invitationSubject = new BehaviorSubject<any>(null);
  public invitation$ = this.invitationSubject.asObservable();

  connect(userId: number): void {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      debug: () => {}, // désactiver les logs
      onConnect: () => {
        const destination = `/topic/invitations/${userId}`;
        this.stompClient?.subscribe(destination, (message: IMessage) => {
          const data = JSON.parse(message.body);
          this.invitationSubject.next(data);
        });
      }
    });

    this.stompClient.activate();
  }

  disconnect(): void {
    this.stompClient?.deactivate();
  }
}
