import { defineAction, ActionError } from "astro:actions";
import { z } from "astro/zod";

const optional = z.string().optional();
const required = z.string().min(1);

export const server = {
  contact: {
    send: defineAction({
      accept: "form",
      input: z.object({
        // Spam honeypot — must stay empty.
        bot_catch_field: optional,
        name: required,
        email: z.email(),
        subject: required,
        message: z.string().min(10, "Please provide at least 10 characters."),
      }),
      handler: async (input) => {
        const { bot_catch_field, ...data } = input;
        // Honeypot filled → silently reject the bot.
        if (bot_catch_field) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "Invalid submission.",
          });
        }

        // Validate-only: log server-side. Wire real delivery (email/Strapi) later.
        console.info("[contact] submission:", data);

        return { success: true as const };
      },
    }),
  },
  distressBeacon: {
    register: defineAction({
      accept: "form",
      input: z.object({
        // Spam honeypot — must stay empty.
        bot_catch_field: optional,
        // Base
        registrationType: optional,
        beaconType: optional,
        epirbUseType: optional,
        // EPIBP/PLB beacon details
        uniqueId: optional,
        checksum: optional,
        manufacturer: optional,
        modelNumber: optional,
        serialNumber: optional,
        batteryExpiryDate: optional,
        // Vessel details
        vesselName: optional,
        vesselCallsign: optional,
        vesselRegistrationNo: optional,
        vesselMmsi: optional,
        vesselHomePort: optional,
        vesselDwt: optional,
        vesselLength: optional,
        vesselType: optional,
        vesselInmarsatNo: optional,
        vesselOtherEquipment: optional,
        // ELT aircraft details
        aircraftRegistrationNo: optional,
        aircraftMakeType: optional,
        aircraftType: optional,
        aircraftSatelliteNumber: optional,
        // Owner (mandatory)
        applicantEmail: z.email(),
        ownerName: required,
        ownerAddress: required,
        ownerPhone: required,
        // Emergency contact (mandatory)
        emergencyContactName: required,
        emergencyContactPhone: required,
        emergencyContactAddress: required,
      }),
      handler: async (input) => {
        // Honeypot filled → silently reject the bot.
        const { bot_catch_field, ...data } = input;
        if (bot_catch_field) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "Invalid submission.",
          });
        }

        const res = await fetch(
          `${import.meta.env.STRAPI_URL}/api/distress-beacons`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data }),
          },
        );

        if (!res.ok) {
          throw new ActionError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Could not submit your beacon registration. Please try again.",
          });
        }

        return { success: true as const };
      },
    }),
  },
};
