/**
 * contact-message lifecycle hooks
 */

const OFFICIALS_EMAIL = 'info@cck.ki';

interface ContactMessageResult {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default {
  afterCreate(event: { result: ContactMessageResult }) {
    const { name, email, subject, message } = event.result;

    // Fire-and-forget: do NOT await — a hanging/unconfigured mail transport
    // must never block (or stall) the create response.
    strapi.plugins['email'].services.email
      .send({
        to: OFFICIALS_EMAIL,
        replyTo: email,
        subject: `New contact form submission: ${subject ?? '(no subject)'}`,
        text: [
          'A new message was submitted via the CCK website contact form.',
          '',
          `Name: ${name ?? '—'}`,
          `Email: ${email ?? '—'}`,
          `Subject: ${subject ?? '—'}`,
          '',
          'Message:',
          message ?? '—',
        ].join('\n'),
      })
      .catch((err: unknown) => {
        strapi.log.error('contact-message notification email failed', err);
      });

    if (email) {
      strapi.plugins['email'].services.email
        .send({
          to: email,
          subject: 'We received your message — CCK',
          text: [
            `Dear ${name ?? 'Sir/Madam'},`,
            '',
            'Thank you for contacting the Communications Commission of Kiribati.',
            'We have received your message and will get back to you as soon as possible.',
            '',
            `Subject: ${subject ?? '—'}`,
            '',
            'Communications Commission of Kiribati',
          ].join('\n'),
        })
        .catch((err: unknown) => {
          strapi.log.error('contact-message acknowledgement email failed', err);
        });
    }
  },
};
