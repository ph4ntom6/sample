import { config } from 'dotenv'
config()

export default {
    'reset-password': {
        subject: `${process.env.APP_NAME} - Reset Password Request`,
        html: `<div style="width: 100%; font-family: Arial, Helvetica, sans-serif;">
      
        <div style="width: 100%; height: 64px; text-align: center; margin: 60px 0 40px 0">
          <img src="{{LOGO}}" width="259px" height="64px" />
        </div>
        <div
          style="
            width: 500px;
            background-color: #F8FAFC;
            margin: 0 auto 0;
            padding: 32px;
            border-radius: 12px;
            border: 1px solid #CBD5E1;
            position: relative;
            box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.10), 0px 1px 2px 0px rgba(0, 0, 0, 0.06);
          "
        >
          <table
            role="presentation"
            cellspacing="0"
            cellpadding="0"
            width="100%"
            style="margin: auto"
          >
            <tr>
              <td>
                <div style="margin-bottom: 12px; font-size: 16px; color: #0F172A">
                  <h2
                    style="
                      font-size: 30px;
                      margin-bottom: 12px;
                      margin-top: 0px;
                    "
                  >
                  Reset Password Request
                  </h2>
                 
                </div>
                <table
                  width="100%"
                  style="color: #1c1917; font-size: 15px; line-height: 20px"
                >
                  <tr>
                    <td>
                      <p style="padding-bottom: 10px">
                        It appears that you have lost your password.
                      </p>
                      
                        <p style="margin-bottom: 12px">
                          You are receiving this email because we received a password reset request for your account.
                        </p>
                        <a
                          style="
                            display: block;
                            margin-bottom: 22px;
                            background: #2563EB;
                            font-weight: 400;
                            border-radius: 6px;
                            color: #ffffff;
                            font-size: 16px;
                            line-height: 24px;
                            padding: 9px 17px;
                            width: auto;
                            text-align: center;
                            text-decoration: none;
                          "
                          href="{{LINK}}"
                        >
                          Set New Password
                        </a>
                      
                      
                      <p style="margin-bottom: 0px">
                        Best,<br />
                        <strong> ${process.env.APP_NAME}</strong><br /><br />
                        Web:
                        <a
                          href="https://billtrackai.com/"
                          target="_blank"
                          style="color: #2563EB"
                          >www.billtrackai.com</a
                        ><br />
                        Email:
                        <a
                          href="mailto: info@billtrackai.com"
                          style="color: #2563EB"
                          >info@billtrackai.com</a
                        >
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
        <div style="text-align: center">
          <p
            style="
              margin-top: 28px;
              font-size: 14px;
              color: #64748B;
              font-family: Arial, Helvetica, sans-serif;
            "
          >
            By clicking “Sign In”, you agree to our <a href="#" style="color: #64748B; text-decoration: underline;">Terms of Service</a> and <a href="#" style="color: #64748B; text-decoration: underline;">Privacy Policy</a>.
          </p>
        </div>
    </div>`,
    },
}
