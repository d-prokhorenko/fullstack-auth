import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { render } from '@react-email/components';
import { ConfirmationTemplate } from './templates/confirmation.template';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend = new Resend(process.env.MAIL_PASSWORD);

  constructor(
    private configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  async sendConfirmationEmail(email: string, token: string) {
    const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN');
    const html = await render(ConfirmationTemplate({ domain, token }));

    return this.sendResendEmail(email, 'Подтверждение почты', html);
  }

  private sendMail(email: string, subject: string, html: string) {
    return this.mailerService.sendMail({
      to: email,
      subject: subject,
      html,
    });
  }

  private async sendResendEmail(email: string, subject: string, html: string) {
    const { data, error } = await this.resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject,
      html,
    });

    if (error) {
      console.error('Resend ошибка:', error);
      throw error;
    }

    return data;
  }
}
