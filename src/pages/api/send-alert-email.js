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
  background:#f4f7fb;
  font-family:Arial,sans-serif;
">

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="padding:40px 0;"
  >

    <tr>

      <td align="center">

        <table
          width="650"
          cellpadding="0"
          cellspacing="0"
          style="
            background:#ffffff;
            border-radius:20px;
            overflow:hidden;
            box-shadow:
              0 8px 24px rgba(0,0,0,0.08);
          "
        >

          <!-- HEADER -->

          <tr>

            <td style="
  background:
    linear-gradient(
      135deg,
      #0f172a,
      #1e40af
    );

  color:white;
  padding:32px;
">

  <table cellpadding="0" cellspacing="0">
    <tr>

      <td width="100">
        <img
          src="https://res.cloudinary.com/dgkdfu5dm/image/upload/v1781746130/LOGO_gaigmh.png"
          alt="NEELA AI Logo"
          width="70"
          style="
            background:white;
            border-radius:50%;
            padding:6px;
          "
        />
      </td>

      <td>
        <h1 style="
          margin:0;
          font-size:28px;
        ">
          NEELA AI Alert
        </h1>

        <p style="
          margin-top:8px;
          color:#dbeafe;
          font-size:15px;
        ">
          Smart Aquaculture Monitoring System
        </p>
      </td>

    </tr>
  </table>

</td>

          </tr>

          <!-- STATUS -->

          <tr>

            <td style="padding:32px;">

              <div style="
                background:#fff7ed;
                border-left:
                  6px solid #ea580c;

                padding:20px;
                border-radius:12px;
              ">

                <h2 style="
                  margin:0;
                  color:#9a3412;
                ">

                  Pond Condition Alert Detected

                </h2>

              </div>

            </td>

          </tr>

          <!-- ALERTS -->

          <tr>

            <td style="
              padding:0 32px 20px;
            ">  

              ${alerts.map(alert => `

                <div style="
                  margin-bottom:12px;
                  padding:18px;
                  border-radius:12px;
                  background:
                    ${
                      alert.severity === "CRITICAL"
                      ? "#fef2f2"
                      : "#fffbeb"
                    };

                  border-left:
                    5px solid
                    ${
                      alert.severity === "CRITICAL"
                      ? "#dc2626"
                      : "#d97706"
                    };
                ">

                  <div style="
                    display:flex;
                    justify-content:
                      space-between;
                  ">

                    <strong style="
                      color:#0f172a;
                    ">

                      ${alert.title}

                    </strong>

                    <span style="
                      background:
                        ${
                          alert.severity === "CRITICAL"
                          ? "#dc2626"
                          : "#d97706"
                        };

                      color:white;

                      padding:
                        4px 10px;

                      border-radius:
                        999px;

                      font-size:12px;

                      font-weight:bold;
                    ">

                      ${alert.severity}

                    </span>

                  </div>

                  <p style="
                    margin-top:10px;
                    color:#475569;
                    line-height:1.5;
                  ">

                    ${alert.message}

                  </p>

                </div>

              `).join("")}

            </td>

          </tr>

          <!-- SENSOR TABLE -->

          <tr>

            <td style="
              padding:0 32px 20px;
            ">

              <h2 style="
                color:#1e293b;
              ">

                Sensor Overview

              </h2>

              <table
                width="100%"
                cellpadding="12"
                cellspacing="0"
                style="
                  border-collapse:collapse;
                  border-radius:12px;
                  overflow:hidden;
                "
              >

                <tr style="
                  background:#eff6ff;
                ">

                  <th align="left">

                    Parameter

                  </th>

                  <th align="left">

                    Current Value

                  </th>

                </tr>

                <tr>

                  <td>

                    Temperature

                  </td>

                  <td>

                    ${sensorData.temperature} °C

                  </td>

                </tr>

                <tr style="
                  background:#f8fafc;
                ">

                  <td>

                    Dissolved Oxygen

                  </td>

                  <td>

                    ${sensorData.do} mg/L

                  </td>

                </tr>

                <tr>

                  <td>

                    pH

                  </td>

                  <td>

                    ${sensorData.ph}

                  </td>

                </tr>

                <tr style="
                  background:#f8fafc;
                ">

                  <td>

                    Turbidity

                  </td>

                  <td>

                    ${sensorData.turbidity} NTU

                  </td>

                </tr>

              </table>

            </td>

          </tr>

          <!-- BUZZER -->

          <tr>

            <td style="
              padding:0 32px 32px;
            ">

              <div style="
                background:
                  ${
                    buzzer === "ON"
                    ? "#fef2f2"
                    : "#f0fdf4"
                  };

                border:
                  2px solid
                  ${
                    buzzer === "ON"
                    ? "#dc2626"
                    : "#16a34a"
                  };

                border-radius:12px;

                padding:20px;

                text-align:center;
              ">

                <div style="
                  font-size:22px;
                  font-weight:bold;

                  color:
                    ${
                      buzzer === "ON"
                      ? "#dc2626"
                      : "#16a34a"
                    };
                ">

                  ${
                    buzzer === "ON"
                    ? "Emergency Alarm Active"
                    : "System Stable"
                  }

                </div>

              </div>

            </td>

          </tr>

          <!-- FOOTER -->

          <tr>

            <td style="
              background:#f8fafc;
              padding:24px;
              text-align:center;
              color:#64748b;
              font-size:12px;
            ">

              Generated automatically by
              <strong>
                NEELA AI Smart Aquaculture Platform
              </strong>

              <br><br>

              ${new Date().toLocaleString()}

              <br><br>

              This is an automated alert message.
              Please do not reply to this email.

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