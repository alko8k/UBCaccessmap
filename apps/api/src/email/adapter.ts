export type MagicLinkEmail = {
  to: string;
  verifyUrl: string;
};

export type EmailAdapter = {
  sendMagicLink(email: MagicLinkEmail): Promise<void>;
  getLatestMagicLink?(to: string): string | undefined;
};
