import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { InvitationResponse } from '../../models/invitation-response.model';

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private stompClient: Client | null = null;
  private subscription?: StompSubscription;

  private invitationSubject = new Subject<InvitationResponse | null>();
  public invitations$ = this.invitationSubject.asObservable();

  constructor() {}

  /**
   * Connexion WebSocket avec email récupéré depuis le JWT
   */
  connectFromToken(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.stompClient && this.stompClient.connected) return resolve();

      const token = localStorage.getItem('auth-token');
      if (!token) return reject('❌ Token non trouvé');

      let email: string;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        email = payload.sub; // 👈 L'email du user
        console.log('🔑 Email extrait du token pour WS :', email);
      } catch (e) {
        console.error('❌ Erreur parsing JWT', e);
        return reject();
      }

      this.stompClient = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws?token=' + token),
        reconnectDelay: 5000,
        heartbeatIncoming: 0,
        heartbeatOutgoing: 20000,
        debug: () => {}
      });

      this.stompClient.onConnect = () => {
         const destination = '/user/queue/invitations';
        this.subscription = this.stompClient!.subscribe(destination, (message: IMessage) => {
          try {
            if (!message.body || message.body === 'null') {
              console.warn('⚠️ Message WebSocket vide ou null');
              return;
            }
            const newInvitation: InvitationResponse = JSON.parse(message.body);
            this.invitationSubject.next(newInvitation);
            
          } catch (e) {
            console.error('❌ Erreur parsing WebSocket :', e);
          }
        });

        console.log("✅ STOMP connecté et abonné avec email !");
        resolve();
      };

      this.stompClient.onStompError = (frame) => {
        console.error('❌ STOMP error :', frame);
        reject();
      };

      this.stompClient.activate();
    });
  }

  disconnect(): void {
    this.subscription?.unsubscribe();
    this.stompClient?.deactivate();
    this.stompClient = null;
    this.invitationSubject.next(null);
  }

  clearCurrent(): void {
    this.invitationSubject.next(null);
  }
}
