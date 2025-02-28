import type { WalletInfo } from "@tonconnect/sdk"

interface TonWalletConnectionState {
  connected: boolean
  address: string | null
  error: string | null
}

class TonConnector {
  private static instance: TonConnector | null = null
  private connector: any = null
  private connectionState: TonWalletConnectionState

  private constructor() {
    this.connectionState = {
      connected: false,
      address: null,
      error: null,
    }
  }

  public static getInstance(): TonConnector {
    if (!TonConnector.instance) {
      TonConnector.instance = new TonConnector()
    }
    return TonConnector.instance
  }

  private async initializeConnector() {
    if (typeof window === "undefined") return

    if (!this.connector) {
      const { TonConnect } = await import("@tonconnect/sdk")
      this.connector = new TonConnect({
        manifestUrl: "/tonconnect-manifest.json",
        walletsListSource: "https://raw.githubusercontent.com/ton-blockchain/wallet-apps-registry/main/apps.json",
      })

      this.connector.onStatusChange((wallet: any) => {
        if (wallet) {
          this.connectionState = {
            connected: true,
            address: wallet.account.address,
            error: null,
          }
        } else {
          this.connectionState = {
            connected: false,
            address: null,
            error: null,
          }
        }
      })
    }
  }

  private isTelegramWebApp(): boolean {
    return typeof window !== "undefined" && Boolean((window as any)?.Telegram?.WebApp)
  }

  public async connect(): Promise<void> {
    await this.initializeConnector()
    if (!this.connector) {
      throw new Error("TonConnect not initialized")
    }

    try {
      this.connectionState.error = null

      const wallets: WalletInfo[] = await this.connector.getWallets()

      if (this.isTelegramWebApp()) {
        const telegramWallet = wallets.find((w: WalletInfo) => w.name.toLowerCase().includes("telegram"))
        if (telegramWallet) {
          const universalLink = await this.connector.connect({
            wallet: telegramWallet,
            universalUrl: true,
          })

          if (universalLink?.universalUrl) {
            if ((window as any).Telegram?.WebApp?.openTonWallet) {
              ;(window as any).Telegram.WebApp.openTonWallet()
            } else {
              window.open(universalLink.universalUrl, "_blank")
            }
            return
          }
        }
      }

      const preferredWallet = wallets.find((w: WalletInfo) => w.name === "TON Wallet") || wallets[0]

      if (!preferredWallet) {
        throw new Error("No TON wallets found. Please install a TON wallet.")
      }

      const universalLink = await this.connector.connect({
        wallet: preferredWallet,
        universalUrl: true,
      })

      if (universalLink?.universalUrl) {
        window.open(universalLink.universalUrl, "_blank")
      } else {
        throw new Error("Failed to generate wallet connection link")
      }
    } catch (error) {
      this.connectionState.error = error instanceof Error ? error.message : "Failed to connect wallet"
      console.error("TON wallet connection error:", error)
      throw error
    }
  }

  public async disconnect(): Promise<void> {
    await this.initializeConnector()
    if (!this.connector) {
      throw new Error("TonConnect not initialized")
    }

    try {
      await this.connector.disconnect()
      this.connectionState = {
        connected: false,
        address: null,
        error: null,
      }
    } catch (error) {
      console.error("Error disconnecting wallet:", error)
    }
  }

  public getConnectionState(): TonWalletConnectionState {
    return { ...this.connectionState }
  }

  public isConnected(): boolean {
    return this.connectionState.connected
  }

  public getAddress(): string | null {
    return this.connectionState.address
  }

  public getError(): string | null {
    return this.connectionState.error
  }
}

export const tonConnector = TonConnector.getInstance()

