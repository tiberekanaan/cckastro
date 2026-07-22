import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => {
  // Without an API key (local dev) fall back to the default provider so
  // Strapi still boots; lifecycle sends fail and are caught + logged there.
  if (!env('RESEND_API_KEY')) {
    return {};
  }

  return {
    email: {
      config: {
        provider: 'nodemailer',
        providerOptions: {
          // Resend SMTP endpoint — username is the literal string "resend",
          // password is the API key. https://resend.com/docs/send-with-smtp
          host: env('SMTP_HOST', 'smtp.resend.com'),
          port: env.int('SMTP_PORT', 465),
          secure: true,
          auth: {
            user: env('SMTP_USERNAME', 'resend'),
            pass: env('RESEND_API_KEY'),
          },
        },
        settings: {
          // Must be an address on a domain verified in Resend.
          defaultFrom: env('EMAIL_FROM', 'onboarding@resend.dev'),
          defaultReplyTo: env('EMAIL_REPLY_TO', 'info@cck.ki'),
        },
      },
    },
  };
};

export default config;
