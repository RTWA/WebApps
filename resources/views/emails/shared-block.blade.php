<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

  <head>
    <meta charset="utf-8">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
    <!--[if mso]>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
    <style>
      td,th,div,p,a,h1,h2,h3,h4,h5,h6 {font-family: "Segoe UI", sans-serif; mso-line-height-rule: exactly;}
    </style>
  <![endif]-->
    <link href="https://fonts.googleapis.com/css?family=Nunito+Sans:400,700&amp;amp;display=swap" rel="stylesheet" media="screen">
    <style>
      @media (max-width: 600px) {
        .button {
          width: 100% !important;
          text-align: center !important;
        }
      }

      @media (prefers-color-scheme: dark) {

        body,
        .email-body,
        .email-content,
        .email-wrapper,
        .email-masthead,
        .email-footer {
          background-color: #333333 !important;
          color: #ffffff !important;
        }

        .email-body_inner {
          background-color: #222222 !important;
          color: #ffffff !important;
        }

        p,
        ul,
        ol,
        blockquote,
        h1,
        h2,
        h3 {
          color: #ffffff !important;
        }
      }

      @media (max-width: 600px) {
        .sm-w-full {
          width: 100% !important;
        }
      }

      @media (prefers-color-scheme: dark) {
        .dark-bg-gray-postmark-darker {
          background-color: #333333 !important;
        }

        .dark-bg-gray-postmark-darkest {
          background-color: #222222 !important;
        }

        .dark-text-gray-postmark-lighter {
          color: #f2f4f6 !important;
        }

        .dark-text-gray-postmark-light {
          color: #a8aaaf !important;
        }
      }
    </style>
  </head>

  <body class="dark-bg-gray-postmark-darker" style="margin: 0; width: 100%; padding: 0; word-break: break-word; -webkit-font-smoothing: antialiased; background-color: #f2f4f6;">
    <div role="article" aria-roledescription="email" aria-label="" lang="en">
      <table class="email-wrapper" style="width: 100%; background-color: #f2f4f6; font-family: 'Nunito Sans', -apple-system, 'Segoe UI', sans-serif;" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="center">
            <table class="email-content" style="width: 100%;" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td align="center" class="email-masthead" style="padding-top: 25px; padding-bottom: 25px; text-align: center; font-size: 16px;"></td>
              </tr>
              <tr>
                <td class="email-body" style="width: 100%;">
                  <table align="center" class="email-body_inner dark-bg-gray-postmark-darkest sm-w-full" style="margin-left: auto; margin-right: auto; width: 570px; background-color: #ffffff;" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td style="padding: 45px;">
                        <div style="font-size: 16px;">
                          <h1 class="dark-text-gray-postmark-lighter" style="margin-top: 0; text-align: left; font-size: 24px; font-weight: 700; color: #333333;">Hi {{ $user->name }},</h1>
                          <p class="dark-text-gray-postmark-light" style="margin-top: 6px; margin-bottom: 20px; font-size: 16px; line-height: 24px; color: #51545e;">
                          {{ $block->user->name }} has shared a Block with you in WebApps. You will now be able to edit this Block and find it in WebApps under Shared Blocks.
                          </p>
                          <p class="dark-text-gray-postmark-light" style="margin-top: 6px; margin-bottom: 20px; font-size: 16px; line-height: 24px; color: #51545e;">
                            Use the link below to view and edit the Block.
                          </p>
                          <table align="center" style="margin-left: auto; margin-right: auto; margin-top: 30px; margin-bottom: 30px; width: 100%; text-align: center;" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td align="center">
                                <table style="width: 100%;" cellpadding="0" cellspacing="0" role="presentation">
                                  <tr>
                                    <td align="center" style="font-size: 16px;">
                                      <a href="{{ $Block_Edit_URL }}" class="button" target="_blank" style="display: inline-block; color: #ffffff; text-decoration: none; border-radius: 3px; box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16); background-color: #22bc66; border-color: #22bc66; border-style: solid; border-width: 10px 18px;">Edit Block</a>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td>
                  <table align="center" class="email-footer sm-w-full" style="margin-left: auto; margin-right: auto; width: 570px; text-align: center;" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td align="center" style="padding: 24px; font-size: 16px;">
                        <div style="margin-left: auto; margin-right: auto; padding-top: 2px; padding-bottom: 2px; color: #85878e;">
                          <span style="font-size: 14px; font-weight: 700;">WebApps</span>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  </body>

</html>