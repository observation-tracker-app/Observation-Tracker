import nodemailer from 'nodemailer';

// Generate a unique 6-digit alphanumeric code (uppercase)
export function generateUserId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate a unique 6-digit observation ID (numeric only)
export function generateObservationId(): string {
  const chars = '0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Convert string to uppercase (for user IDs)
export function toUpperCase(str: string): string {
  return str.toUpperCase();
}

// Email transporter configuration
export function createEmailTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
}

// Send observation creation email to sender
export async function sendObservationCreatedEmail(
  senderEmail: string,
  senderName: string,
  observationId: string,
  location: string,
  observation: string,
  recipients: string[],
  photoPath?: string
) {
  const transporter = createEmailTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: senderEmail,
    subject: `Observation Created - ID: ${observationId}`,
    html: `
      <h2>Observation Created Successfully</h2>
      <p>Dear ${senderName},</p>
      <p>Your observation has been created with the following details:</p>
      <ul>
        <li><strong>Observation ID:</strong> ${observationId}</li>
        <li><strong>Location:</strong> ${location}</li>
        <li><strong>Observation:</strong> ${observation}</li>
        <li><strong>Recipients:</strong> ${recipients.join(', ')}</li>
      </ul>
      ${photoPath ? '<p>Observation photo attached.</p>' : ''}
    `,
    attachments: photoPath ? [{ path: photoPath }] : [],
  };

  await transporter.sendMail(mailOptions);
}

// Send observation notification to recipients
export async function sendObservationToRecipient(
  recipientEmail: string,
  senderName: string,
  senderUserId: string,
  senderEmail: string,
  observationId: string,
  location: string,
  observation: string,
  photoPath?: string
) {
  const transporter = createEmailTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: recipientEmail,
    subject: `New Observation - ID: ${observationId}`,
    html: `
      <h2>New Observation Received</h2>
      <p>An observation has been created by:</p>
      <ul>
        <li><strong>Sender Name:</strong> ${senderName}</li>
        <li><strong>Sender User ID:</strong> ${senderUserId}</li>
        <li><strong>Sender Email:</strong> ${senderEmail}</li>
      </ul>
      <h3>Observation Details:</h3>
      <ul>
        <li><strong>Observation ID:</strong> ${observationId}</li>
        <li><strong>Location:</strong> ${location}</li>
        <li><strong>Observation:</strong> ${observation}</li>
      </ul>
      ${photoPath ? '<p>Observation photo attached.</p>' : ''}
    `,
    attachments: photoPath ? [{ path: photoPath }] : [],
  };

  await transporter.sendMail(mailOptions);
}

// Send invalid user ID email
export async function sendInvalidUserIdEmail(
  senderEmail: string,
  invalidUserIds: string[]
) {
  const transporter = createEmailTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: senderEmail,
    subject: 'Invalid User IDs',
    html: `
      <h2>Invalid User IDs Detected</h2>
      <p>The following user IDs do not exist:</p>
      <ul>
        ${invalidUserIds.map(id => `<li>${id}</li>`).join('')}
      </ul>
      <p>Please verify the user IDs and try again.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Send revision notification emails
export async function sendRevisionEmails(
  senderEmail: string,
  senderName: string,
  senderUserId: string,
  reviserEmail: string,
  reviserName: string,
  reviserUserId: string,
  observationId: string,
  originalLocation: string,
  originalObservation: string,
  revisedLocation: string,
  revisedObservation: string,
  originalPhotoPath?: string,
  revisedPhotoPath?: string
) {
  const transporter = createEmailTransporter();

  const emailContent = `
    <h2>Observation Revised</h2>
    <h3>Original Observation:</h3>
    <ul>
      <li><strong>Sender Name:</strong> ${senderName}</li>
      <li><strong>Sender User ID:</strong> ${senderUserId}</li>
      <li><strong>Sender Email:</strong> ${senderEmail}</li>
      <li><strong>Observation ID:</strong> ${observationId}</li>
      <li><strong>Location:</strong> ${originalLocation}</li>
      <li><strong>Observation:</strong> ${originalObservation}</li>
    </ul>
    <h3>Revised Observation:</h3>
    <ul>
      <li><strong>Reviser Name:</strong> ${reviserName}</li>
      <li><strong>Reviser User ID:</strong> ${reviserUserId}</li>
      <li><strong>Reviser Email:</strong> ${reviserEmail}</li>
      <li><strong>Revised Location:</strong> ${revisedLocation}</li>
      <li><strong>Revised Observation:</strong> ${revisedObservation}</li>
    </ul>
  `;

  const attachments = [];
  if (originalPhotoPath) attachments.push({ path: originalPhotoPath });
  if (revisedPhotoPath) attachments.push({ path: revisedPhotoPath });

  // Send to sender
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: senderEmail,
    subject: `Observation Revised - ID: ${observationId}`,
    html: emailContent,
    attachments,
  });

  // Send to reviser
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: reviserEmail,
    subject: `Observation Revised - ID: ${observationId}`,
    html: emailContent,
    attachments,
  });
}

// Send invalid revision email
export async function sendInvalidRevisionEmail(
  reviserEmail: string,
  observationId: string,
  senderId: string
) {
  const transporter = createEmailTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: reviserEmail,
    subject: 'Invalid Revision Attempt',
    html: `
      <h2>Revision Failed</h2>
      <p>The observation ID <strong>${observationId}</strong> does not match with sender ID <strong>${senderId}</strong>.</p>
      <p>Please verify the information and try again.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}