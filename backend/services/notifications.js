// Notification Service
const firebase = require("../config/firebase");
const twilio = require("twilio");

class NotificationService {
  constructor() {
    // Only initialize Twilio if credentials are provided
    if (
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_ACCOUNT_SID.startsWith("AC") &&
      process.env.TWILIO_AUTH_TOKEN
    ) {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
      );
      this.twilioEnabled = true;
    } else {
      this.twilioEnabled = false;
      console.warn(
        "Twilio not configured. SMS notifications will be disabled.",
      );
    }
  }

  // Send Push Notification
  async sendPushNotification(deviceTokens, title, body, data = {}) {
    try {
      if (!firebase || !firebase.apps.length) {
        return {
          success: false,
          error: "Firebase push notifications are not configured",
        };
      }

      const message = {
        notification: {
          title,
          body,
        },
        data,
        tokens: Array.isArray(deviceTokens) ? deviceTokens : [deviceTokens],
      };

      const messaging = firebase.messaging();
      const response =
        typeof messaging.sendEachForMulticast === "function"
          ? await messaging.sendEachForMulticast(message)
          : await messaging.sendMulticast(message);

      return {
        success: response.successCount > 0,
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (err) {
      console.error("Push notification error:", err);
      return { success: false, error: err.message };
    }
  }

  // Send SMS Notification
  async sendSMSNotification(phoneNumber, message) {
    try {
      if (!this.twilioEnabled) {
        console.warn("Twilio not configured. SMS not sent to", phoneNumber);
        return {
          success: false,
          error: "Twilio not configured",
          message: "SMS notifications are disabled",
        };
      }

      const response = await this.twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });

      return {
        success: true,
        messageId: response.sid,
      };
    } catch (err) {
      console.error("SMS notification error:", err);
      return { success: false, error: err.message };
    }
  }

  // Send Email Notification (optional email service integration)
  async sendEmailNotification(email, subject, htmlContent) {
    // Integrate with email service like SendGrid, Nodemailer, etc.
    try {
      console.log(`Email notification sent to ${email}: ${subject}`);
      return { success: true };
    } catch (err) {
      console.error("Email notification error:", err);
      return { success: false, error: err.message };
    }
  }

  // Emergency Alert Notification
  async sendEmergencyAlert(user, alert, responders) {
    const alertMessage = `EMERGENCY: ${user.firstName} needs help at ${alert.location.description}`;

    // Push notifications to responders
    const responderTokens = responders
      .filter((r) => r.deviceToken)
      .map((r) => r.deviceToken);

    if (responderTokens.length > 0) {
      await this.sendPushNotification(
        responderTokens,
        "Emergency Alert",
        alertMessage,
        {
          alertId: alert._id.toString(),
          userId: user._id.toString(),
          location: JSON.stringify(alert.location),
          type: "emergency",
        },
      );
    }

    // SMS to responders
    for (let responder of responders) {
      if (responder.phone) {
        await this.sendSMSNotification(
          responder.phone,
          `EMERGENCY: ${user.firstName} needs help. Building: ${alert.location.description}. Alert ID: ${alert._id}`,
        );
      }
    }
  }

  // Navigation Update Notification
  async sendNavigationUpdate(deviceToken, direction, distance) {
    return await this.sendPushNotification(
      deviceToken,
      "Navigation Update",
      direction,
      { distance, type: "navigation" },
    );
  }

  // Responder Arrival Notification
  async sendArrivalNotification(userId, deviceToken, responderName) {
    return await this.sendPushNotification(
      deviceToken,
      "Help Arriving",
      `${responderName} is on the way to help you`,
      { type: "responder_arrival" },
    );
  }

  // System Announcement
  async sendSystemAnnouncement(userIds, title, message) {
    const announcements = [];

    for (let userId of userIds) {
      announcements.push({
        userId,
        title,
        message,
        createdAt: new Date(),
        read: false,
      });
    }

    return announcements;
  }

  // Batch Notification
  async sendBatchNotifications(recipients, template, variables) {
    const results = [];

    for (let recipient of recipients) {
      let message = template;

      for (let [key, value] of Object.entries(variables)) {
        message = message.replace(`{{${key}}}`, value);
      }

      if (recipient.deviceToken) {
        results.push(
          await this.sendPushNotification(
            recipient.deviceToken,
            "Notification",
            message,
          ),
        );
      }
    }

    return results;
  }
}

module.exports = NotificationService;
