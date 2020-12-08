import { Inject, Injectable } from '@nestjs/common'
import got from 'got'
import { CONFIG_OPTIONS } from 'src/jwt/jwt.constants'
import { MailModuleOptions } from './mail.interface'
import * as FormData from 'form-data'

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    console.log(options)
    this.sendEmail('testing', 'test')
  }

  /*
curl -s --user 'api:YOUR_API_KEY' \
	https://api.mailgun.net/v3/YOUR_DOMAIN_NAME/messages \
	-F from='Excited User <mailgun@YOUR_DOMAIN_NAME>' \
	-F to=YOU@YOUR_DOMAIN_NAME \
	-F to=bar@example.com \
	-F subject='Hello' \
  -F text='Testing some Mailgun awesomeness!'
*/
  private async sendEmail(subject: string, content: string) {
    const form = new FormData()
    form.append('from', `Excited User <mailgun@${this.options.domain}>`)
    form.append('to', `tkhwang@gmail.com`)
    form.append('text', content)
    form.append('subject', subject)

    const response = await got(
      `https://api.mailgun.net/v3/${this.options.domain}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(
            `api:${this.options.apiKey}`,
          ).toString('base64')}`,
        },
        body: form,
      },
    )
    console.log(response.body)
  }
}
