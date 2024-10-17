import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import * as dotenv from "dotenv";

dotenv.config();

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
  }

  async sendMail(to: string[], subject: string, text: string, html?: string) {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject,
      text,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }
}
