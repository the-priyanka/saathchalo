export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  message?: string;
  /** Timestamp (ms) of the last successful "send code" action, used for the resend cooldown. */
  sentAt?: number;
};
