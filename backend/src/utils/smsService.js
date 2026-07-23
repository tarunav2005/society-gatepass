import twilio from "twilio";

let client = null;

const getClient = () => {
  if (client) return client;
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN)
    return null;
  client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
  );
  return client;
};

export const sendSMS = async ({ to, body }) => {
  try {
    const c = getClient();
    if (!c) {
      console.warn("⚠️  SMS not configured — skipping send to", to);
      return;
    }
    // Ensure E.164 format; assume Indian numbers if no country code given
    const formattedTo = to.startsWith("+") ? to : `+91${to}`;
    await c.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedTo,
    });
    console.log(`📱 SMS sent to ${formattedTo}`);
  } catch (err) {
    console.error("SMS send failed:", err.message);
  }
};
