import { TonConnectUI } from '@tonconnect/ui';

let tonConnectUI: TonConnectUI | null = null;

export const getTonConnector = () => {
  if (!tonConnectUI && typeof window !== 'undefined') {
    tonConnectUI = new TonConnectUI({
      manifestUrl: '/tonconnect-manifest.json'
    });
  }
  return tonConnectUI;
};