/**
 * contact-message lifecycle hooks
 */

const FALLBACK_EMAIL = 'info@cck.ki';

interface ContactMessageResult {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

/**
 * Resolve the department inbox for a subject from the Contact Subject
 * collection (case-insensitive label match). Any miss or lookup failure
 * falls back to the general inbox — routing must never block the email.
 */
async function recipientForSubject(subject?: string): Promise<string> {
  if (!subject) return FALLBACK_EMAIL;
  try {
    const matches = await strapi
      .documents('api::contact-subject.contact-subject')
      .findMany({ filters: { label: { $eqi: subject } }, limit: 1 });
    return matches[0]?.recipientEmail || FALLBACK_EMAIL;
  } catch (err) {
    strapi.log.error('contact-subject recipient lookup failed', err);
    return FALLBACK_EMAIL;
  }
}

export default {
  async afterCreate(event: { result: ContactMessageResult }) {
    const { name, email, subject, message } = event.result;
    const recipient = await recipientForSubject(subject);

    // Fire-and-forget: do NOT await — a hanging/unconfigured mail transport
    // must never block (or stall) the create response.
    strapi.plugins['email'].services.email
      .send({
        to: recipient,
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
