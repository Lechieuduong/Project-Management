import { MailerModule } from '@nestjs-modules/mailer';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { registerConfig } from 'src/configs/configs.constants';
import { UsersModule } from 'src/modules/users/users.module';
import { SendMailService } from './send-mail/send-mail.service';

@Global()
@Module({
    imports: [
        MailerModule.forRootAsync({
            useFactory: async (config: ConfigService) => ({
                transport: {
                    host: 'smtp.gmail.com',
                    secure: false,
                    auth: {
                        user: registerConfig.user,
                        pass: registerConfig.password,
                    },
                },
                defaults: {
                    from: `"No Reply" <${config.get('GMAIL_FROM')}>`,
                },
                template: {
                    options: {
                        strict: true,
                    },
                },
            }),
            inject: [ConfigService],
        }),
        UsersModule,
        PassportModule.register({ defaultStrategy: 'jwt', })
    ],
    providers: [SendMailService],
    exports: [SendMailService]
})
export class CommonModule { }
