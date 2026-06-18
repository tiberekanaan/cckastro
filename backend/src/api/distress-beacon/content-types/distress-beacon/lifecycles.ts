/**
 * distress-beacon lifecycle hooks
 */

export default {
  afterCreate(event: { result: Record<string, any> }) {
    const { applicantEmail, ownerName } = event.result;
    if (!applicantEmail) return;

    // Fire-and-forget: do NOT await — a hanging/unconfigured mail transport
    // must never block (or stall) the create response.
    strapi.plugins['email'].services.email
      .send({
        to: applicantEmail,
        subject: 'Distress Beacon Registration Received — CCK',
        text: `Dear ${ownerName ?? 'Applicant'},\n\nWe have successfully received your distress beacon registration. The CCK team will review it and reach out if necessary.\n\nCommunications Commission of Kiribati`,
      })
      .catch((err: unknown) => {
        strapi.log.error('distress-beacon confirmation email failed', err);
      });
  },
};
