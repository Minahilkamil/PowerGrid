import Notification from '../models/Notification.js';

/**
 * Create a notification record for a consumer.
 *
 * @param {string} consumerId  - Consumer ObjectId
 * @param {string} title       - Notification title
 * @param {string} message     - Notification message
 * @param {string} type        - One of: bill_generated | payment_reminder | due_date | payment_success
 */
const sendNotification = async (consumerId, title, message, type) => {
  try {
    await Notification.create({ consumer: consumerId, title, message, type });
  } catch (error) {
    // Non-critical — log but don't throw
    console.error('Failed to create notification:', error.message);
  }
};

export default sendNotification;
