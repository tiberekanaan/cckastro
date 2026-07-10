/**
 * distress-beacon lifecycle hooks
 */

const OFFICIALS_EMAIL = 'inquiry@cck.ki';

interface DistressBeaconResult {
  registrationType?: string;
  beaconType?: string;
  uniqueId?: string;
  applicantEmail?: string;
  ownerName?: string;
  ownerAddress?: string;
  ownerPhone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export default {
  afterCreate(event: { result: DistressBeaconResult }) {
    const {
      registrationType,
      beaconType,
      uniqueId,
      applicantEmail,
      ownerName,
      ownerAddress,
      ownerPhone,
      emergencyContactName,
      emergencyContactPhone,
    } = event.result;

    // Fire-and-forget: do NOT await — a hanging/unconfigured mail transport
    // must never block (or stall) the create response.
    if (applicantEmail) {
      strapi.plugins['email'].services.email
        .send({
          to: applicantEmail,
          subject: 'Distress Beacon Registration Received — CCK',
          text: `Dear ${ownerName ?? 'Applicant'},\n\nWe have successfully received your distress beacon registration. The CCK team will review it and reach out if necessary.\n\nCommunications Commission of Kiribati`,
        })
        .catch((err: unknown) => {
          strapi.log.error('distress-beacon confirmation email failed', err);
        });
    }

    strapi.plugins['email'].services.email
      .send({
        to: OFFICIALS_EMAIL,
        replyTo: applicantEmail,
        subject: `New distress beacon registration${beaconType ? ` — ${beaconType}` : ''}`,
        text: [
          'A new distress beacon registration was submitted via the CCK website.',
          '',
          `Registration type: ${registrationType ?? '—'}`,
          `Beacon type: ${beaconType ?? '—'}`,
          `Beacon unique ID: ${uniqueId ?? '—'}`,
          '',
          `Owner name: ${ownerName ?? '—'}`,
          `Owner address: ${ownerAddress ?? '—'}`,
          `Owner phone: ${ownerPhone ?? '—'}`,
          `Applicant email: ${applicantEmail ?? '—'}`,
          '',
          `Emergency contact: ${emergencyContactName ?? '—'} (${emergencyContactPhone ?? '—'})`,
          '',
          'Review the full registration in the Strapi admin (Content Manager → Distress Beacon).',
        ].join('\n'),
      })
      .catch((err: unknown) => {
        strapi.log.error('distress-beacon officials notification email failed', err);
      });
  },
};
