export class UserTokenHolder {
  private static token: string | undefined;
  private static isExpiring: boolean;

  static async getToken(): Promise<string | undefined> {
    if (!this.token || this.isExpiring) {
      this.isExpiring = false;
    }
    return this.token;
  }
}
