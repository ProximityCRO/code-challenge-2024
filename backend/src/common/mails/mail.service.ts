import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";

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
        user: "getaridepearls@gmail.com",
        pass: "mysi qwpp gywy mepl",
      },
    });
  }

  async sendMail(to: string[], subject: string, text: string, html?: string) {
    const mailOptions = {
      from: "getaridepearls@gmail.com",
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
