export interface NewsItem {
  title: string;
  content?: string;
  timestamp?: string; // ISO
}

export enum ConnectionStatus {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
}

