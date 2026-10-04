export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  message?: string;
  /** Submitted non-secret values, so fields survive React resetting the form. Never passwords or codes. */
  values?: Record<string, string>;
  /** Timestamp (ms) of the last successful "send code" action, used for the resend cooldown. */
  sentAt?: number;
};
