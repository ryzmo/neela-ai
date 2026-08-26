import nodemailer from "nodemailer";

export default async function handler(req, res) {

  if (req.method !== "POST") {

    return res
      .status(405)
      .json({
        message: "Method not allowed"
      });

  }

  try {

    const {

      emails,

      alerts,

      sensorData,

      buzzer,

    } = req.body;

    if (
  !emails ||
  emails.length === 0
) {

  return res.status(400).json({

    message:
      "At least one email is required"

  });

}

    const transporter =
      nodemailer.createTransport({

        host:
          process.env.EMAIL_HOST,

        port:
          Number(
            process.env.EMAIL_PORT
          ),

        secure: false,

        auth: {

          user:
            process.env.EMAIL_USER,

          pass:
            process.env.EMAIL_PASS,

        },

      });
      
    console.log("Sending to:", emails);
    await transporter.sendMail({

      from:
        '"NEELA AI" neela32026@gmail.com',

      to: emails,

      subject:
        "NEELA AI - Pond Alert Notification",

html: `

<div style="
  margin:0;
  padding:0;
  background-color:#f8fafc;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
  color:#1e293b;
">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc; padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:24px; overflow:hidden; border:1px solid #e2e8f0; box-shadow:0 10px 25px rgba(15,23,42,0.05);">
          
          <!-- BRAND HEADER -->
          <tr>
            <td style="background-color:#0f172a; padding:36px; border-bottom:1px solid #1e293b;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="64" style="vertical-align:middle;">
                    <img src="https://res.cloudinary.com/dgkdfu5dm/image/upload/v1781746130/LOGO_gaigmh.png" alt="NEELA AI Logo" width="54" style="background:#ffffff; border-radius:16px; padding:6px; display:block;" />
                  </td>
                  <td style="padding-left:16px; vertical-align:middle;">
                    <h1 style="margin:0; font-size:20px; font-weight:800; color:#ffffff; letter-spacing:1px; text-transform:uppercase;">NEELA AI SYSTEM</h1>
                    <span style="color:#64748b; font-size:11px; font-weight:700; tracking-wider; text-transform:uppercase; margin-top:2px; display:block;">Pond Diagnostics & Automated Dispatch</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- EMERGENCY ALERTS -->
          ${alerts.length > 0 ? `
          <tr>
            <td style="padding:32px 32px 16px;">
              <h2 style="margin:0 0 16px; font-size:12px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:1.5px;">Active Anomaly Warnings</h2>
              ${alerts.map(alert => {
                const isCritical = alert.severity === "CRITICAL";
                return `
                <div style="margin-bottom:16px; padding:20px; border-radius:16px; background-color:${isCritical ? '#fef2f2' : '#fffbeb'}; border:1px solid ${isCritical ? '#fca5a5' : '#fde68a'};">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-size:14px; font-weight:800; color:#0f172a;">${alert.title}</td>
                      <td align="right">
                        <span style="background-color:${isCritical ? '#ef4444' : '#f59e0b'}; color:#ffffff; padding:4px 10px; border-radius:99px; font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px;">
                          ${alert.severity}
                        </span>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:10px 0 0; font-size:12px; line-height:1.6; color:#475569; font-weight:550;">${alert.message}</p>
                </div>
                `;
              }).join("")}
            </td>
          </tr>
          ` : ""}

          <!-- SENSOR TELEMETRY OVERVIEW -->
          <tr>
            <td style="padding:24px 32px 16px;">
              <h2 style="margin:0 0 16px; font-size:12px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:1.5px;">Water Parameter Snaps</h2>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0; border-radius:16px; overflow:hidden; font-size:12.5px;">
                <tr style="background-color:#f8fafc; border-bottom:1px solid #e2e8f0;">
                  <th align="left" style="padding:14px 16px; font-weight:800; color:#475569; text-transform:uppercase; font-size:10.5px; letter-spacing:0.5px;">Quality Parameter</th>
                  <th align="right" style="padding:14px 16px; font-weight:800; color:#475569; text-transform:uppercase; font-size:10.5px; letter-spacing:0.5px;">Real-Time Value</th>
                </tr>
                
                <tr>
                  <td style="padding:14px 16px; border-bottom:1px solid #f1f5f9; font-weight:700; color:#334155;">Water Temperature</td>
                  <td align="right" style="padding:14px 16px; border-bottom:1px solid #f1f5f9; font-weight:800; color:#0f172a;">${sensorData.temperature} °C</td>
                </tr>
                
                <tr>
                  <td style="padding:14px 16px; border-bottom:1px solid #f1f5f9; font-weight:700; color:#334155;">Dissolved Oxygen (DO)</td>
                  <td align="right" style="padding:14px 16px; border-bottom:1px solid #f1f5f9; font-weight:800; color:#0f172a;">${sensorData.do} mg/L</td>
                </tr>
                
                <tr>
                  <td style="padding:14px 16px; border-bottom:1px solid #f1f5f9; font-weight:700; color:#334155;">pH Value Balance</td>
                  <td align="right" style="padding:14px 16px; border-bottom:1px solid #f1f5f9; font-weight:800; color:#0f172a;">${sensorData.ph}</td>
                </tr>
                
                <tr>
                  <td style="padding:14px 16px; border-bottom:1px solid #f1f5f9; font-weight:700; color:#334155;">Water Turbidity</td>
                  <td align="right" style="padding:14px 16px; border-bottom:1px solid #f1f5f9; font-weight:800; color:#0f172a;">${sensorData.turbidity} %</td>
                </tr>
                
                <tr>
                  <td style="padding:14px 16px; font-weight:700; color:#334155;">Water Level</td>
                  <td align="right" style="padding:14px 16px; font-weight:800; color:#0f172a;">${sensorData.water_level || '-'} %</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- EMERGENCY ALARM RELAY STAMP -->
          <tr>
            <td style="padding:16px 32px 36px;">
              <div style="background-color:${buzzer === 'ON' ? '#fef2f2' : '#f0fdf4'}; border:1px solid ${buzzer === 'ON' ? '#fca5a5' : '#bbf7d0'}; border-radius:16px; padding:16px 20px; text-align:center;">
                <span style="font-size:10px; font-weight:800; color:${buzzer === 'ON' ? '#b91c1c' : '#15803d'}; text-transform:uppercase; letter-spacing:1.5px; display:block; margin-bottom:4px;">Physical Alarm Relay</span>
                <span style="font-size:16px; font-weight:900; color:${buzzer === 'ON' ? '#dc2626' : '#16a34a'}; text-transform:uppercase; letter-spacing:0.5px;">
                  ${buzzer === 'ON' ? 'EMERGENCY BUZZER TRIGGERED' : 'ALL SYSTEMS NORMAL'}
                </span>
              </div>
            </td>
          </tr>

          <!-- SYSTEM FOOTER -->
          <tr>
            <td style="background-color:#f1f5f9; padding:28px 36px; text-align:center; border-top:1px solid #e2e8f0; font-size:11px; line-height:1.6; color:#64748b; font-weight:600;">
              Generated automatically by <strong>Neela AI Smart Aquaculture</strong>
              <br/>
              Report Dispatch Time: ${new Date().toLocaleString()}
              <br/><br/>
              <span style="font-size:10px; color:#94a3b8; font-weight:500;">This is a system-generated alert message dispatched from your pond telemetry modules. Please do not reply.</span>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</div>

`,

    });

    return res.status(200).json({

      message:
        "Alert email sent successfully",

    });

  }

  catch (error) {

    console.error(error);

    return res.status(500).json({

      message:
        "Failed to send email",

    });

  }
}