import 'server-only'
import nodemailer from 'nodemailer';

// Email configuration using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export type EventEmailData = {
  eventTitle: string;
  eventDate: Date;
  eventLocation: string;
  eventImageUrl?: string;
  registrationId: string;
};

export type UserEmailData = {
  name: string;
  email: string;
};

/**
 * Send event registration confirmation email
 */
export const sendEventRegistrationEmail = async (
  user: UserEmailData,
  event: EventEmailData,
  status: 'REGISTERED' | 'WAITING_LIST'
): Promise<void> => {
  try {
    const isWaitingList = status === 'WAITING_LIST';
    const subject = isWaitingList
      ? `[Waiting List] ${event.eventTitle} - LampungDev`
      : `Konfirmasi Pendaftaran: ${event.eventTitle} - LampungDev`;

    const eventDateFormatted = new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    }).format(event.eventDate);

    // Generate QR code URL (using public QR code generator)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(event.registrationId)}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #16a34a 0%, #eab308 100%); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">
            ${isWaitingList ? '📋 Waiting List' : '🎉 Pendaftaran Berhasil!'}
        </h1>
    </div>
    
    <div style="background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0;">
        <p>Halo <strong>${user.name}</strong>,</p>
        
        ${isWaitingList
        ? `<p>Kamu telah masuk ke <strong>waiting list</strong> untuk event berikut. Kami akan menghubungimu jika ada slot yang tersedia.</p>`
        : `<p>Terima kasih telah mendaftar! Berikut detail event kamu:</p>`
      }
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <h2 style="margin: 0 0 15px 0; color: #333;">${event.eventTitle}</h2>
            <p style="margin: 5px 0;">📅 <strong>Tanggal:</strong> ${eventDateFormatted}</p>
            <p style="margin: 5px 0;">📍 <strong>Lokasi:</strong> ${event.eventLocation}</p>
        </div>
        
        ${!isWaitingList ? `
        <div style="text-align: center; margin: 30px 0;">
            <p style="margin-bottom: 15px;"><strong>QR Code Ticket</strong></p>
            <p style="font-size: 12px; color: #666;">Tunjukkan QR code ini saat registrasi di venue</p>
            <img src="${qrCodeUrl}" alt="QR Code Ticket" style="border: 1px solid #ddd; padding: 10px; background: white; border-radius: 8px;" />
            <p style="font-size: 11px; color: #999; margin-top: 10px;">ID: ${event.registrationId}</p>
        </div>
        ` : ''}
        
        <p style="color: #666; font-size: 14px;">
            Jika ada pertanyaan, silakan hubungi kami di <a href="mailto:hello@lampungdev.org">hello@lampungdev.org</a>
        </p>
    </div>
    
    <div style="background: #333; color: white; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
        <p style="margin: 0; font-size: 14px;">
            © ${new Date().getFullYear()} LampungDev Community
        </p>
    </div>
</body>
</html>
        `;

    await transporter.sendMail({
      from: `"LampungDev" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject,
      html,
    });

    console.log(`Email sent to ${user.email} for event: ${event.eventTitle}`);
  } catch (error) {
    console.error('ERROR sendEventRegistrationEmail:', error);
    // Don't throw - email failure shouldn't block registration
  }
};

/**
 * Send event reminder email (H-1)
 */
export const sendEventReminderEmail = async (
  user: UserEmailData,
  event: EventEmailData
): Promise<void> => {
  try {
    const eventDateFormatted = new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    }).format(event.eventDate);

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(event.registrationId)}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Reminder: Event Besok!</h1>
    </div>
    
    <div style="background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0;">
        <p>Halo <strong>${user.name}</strong>,</p>
        
        <p>Ini reminder bahwa event yang kamu daftarkan akan berlangsung <strong>besok</strong>!</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5576c;">
            <h2 style="margin: 0 0 15px 0; color: #333;">${event.eventTitle}</h2>
            <p style="margin: 5px 0;">📅 <strong>Tanggal:</strong> ${eventDateFormatted}</p>
            <p style="margin: 5px 0;">📍 <strong>Lokasi:</strong> ${event.eventLocation}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <p style="margin-bottom: 15px;"><strong>QR Code Ticket</strong></p>
            <img src="${qrCodeUrl}" alt="QR Code Ticket" style="border: 1px solid #ddd; padding: 10px; background: white; border-radius: 8px;" />
        </div>
        
        <p style="color: #666; font-size: 14px;">
            Jangan lupa bawa QR code ini untuk registrasi di venue. Sampai jumpa! 👋
        </p>
    </div>
    
    <div style="background: #333; color: white; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
        <p style="margin: 0; font-size: 14px;">
            © ${new Date().getFullYear()} LampungDev Community
        </p>
    </div>
</body>
</html>
        `;

    await transporter.sendMail({
      from: `"LampungDev" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: `⏰ Reminder: ${event.eventTitle} - Besok!`,
      html,
    });

    console.log(`Reminder email sent to ${user.email} for event: ${event.eventTitle}`);
  } catch (error) {
    console.error('ERROR sendEventReminderEmail:', error);
  }
};

/**
 * Send waiting list promotion email
 */
export const sendWaitingListPromotionEmail = async (
  user: UserEmailData,
  event: EventEmailData
): Promise<void> => {
  try {
    const eventDateFormatted = new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    }).format(event.eventDate);

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(event.registrationId)}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Selamat! Kamu Terdaftar!</h1>
    </div>
    
    <div style="background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0;">
        <p>Halo <strong>${user.name}</strong>,</p>
        
        <p>Kabar baik! Ada slot yang tersedia dan kamu sekarang <strong>terdaftar resmi</strong> untuk event berikut:</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #38ef7d;">
            <h2 style="margin: 0 0 15px 0; color: #333;">${event.eventTitle}</h2>
            <p style="margin: 5px 0;">📅 <strong>Tanggal:</strong> ${eventDateFormatted}</p>
            <p style="margin: 5px 0;">📍 <strong>Lokasi:</strong> ${event.eventLocation}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <p style="margin-bottom: 15px;"><strong>QR Code Ticket</strong></p>
            <img src="${qrCodeUrl}" alt="QR Code Ticket" style="border: 1px solid #ddd; padding: 10px; background: white; border-radius: 8px;" />
            <p style="font-size: 11px; color: #999; margin-top: 10px;">ID: ${event.registrationId}</p>
        </div>
    </div>
    
    <div style="background: #333; color: white; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
        <p style="margin: 0; font-size: 14px;">
            © ${new Date().getFullYear()} LampungDev Community
        </p>
    </div>
</body>
</html>
        `;

    await transporter.sendMail({
      from: `"LampungDev" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: `🎉 Selamat! Kamu Terdaftar: ${event.eventTitle}`,
      html,
    });

    console.log(`Promotion email sent to ${user.email} for event: ${event.eventTitle}`);
  } catch (error) {
    console.error('ERROR sendWaitingListPromotionEmail:', error);
  }
};
