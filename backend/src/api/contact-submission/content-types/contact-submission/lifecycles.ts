/**
 * contact-submission lifecycle hooks
 */

const INQUIRY_INBOX = 'inquiry@cck.ki';

export default {
  afterCreate(event: { result: Record<string, any> }) {
    const { fullName, email, phone, subject, message } = event.result;

    // Fire-and-forget: do NOT await — a hanging/unconfigured mail transport
    // must never block (or stall) the create response.
    strapi.plugins['email'].services.email
      .send({
        to: INQUIRY_INBOX,
        replyTo: email,
        subject: `Contact form: ${subject ?? '(no subject)'}`,
        text: [
          `Name: ${fullName ?? ''}`,
          `Email: ${email ?? ''}`,
          `Phone: ${phone ?? ''}`,
          `Subject: ${subject ?? ''}`,
          '',
          'Message:',
          message ?? '',
        ].join('\n'),
      })
      .catch((err: unknown) => {
        strapi.log.error('contact-submission notification email failed', err);
      });
  },
};
