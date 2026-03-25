/**
 * Master Luxury Email Layout
 * Enforces rigid, table-based structural rendering for high-class clients natively.
 */
const layout = (title, bodyContent) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased; color: #000000;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff;">
    <tr>
      <td align="center" style="padding: 40px 15px;">
        
        <!-- Main Email Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; text-align: left;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 40px 30px;">
              <h1 style="margin: 0; font-family: 'Times New Roman', Times, serif; font-size: 24px; font-weight: normal; letter-spacing: 0.2em; text-transform: uppercase; color: #000000;">
                AurumVault
              </h1>
              <div style="margin-top: 25px; height: 1px; background-color: #C9A14A; width: 40px; margin-left: auto; margin-right: auto;"></div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 0 40px 40px;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 40px 40px 40px; border-top: 1px solid #E5E5E5;">
              <p style="margin: 0 0 10px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #666666;">
                AurumVault Private Atelier
              </p>
              <p style="margin: 0 0 15px; font-size: 10px; color: #999999;">
                Contact us at <a href="mailto:concierge@aurumvault.com" style="color: #666666; text-decoration: none;">concierge@aurumvault.com</a>
              </p>
              <p style="margin: 0; font-size: 9px; color: #999999; text-transform: uppercase; letter-spacing: 0.05em;">
                © ${new Date().getFullYear()} AurumVault. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;

module.exports = layout;
