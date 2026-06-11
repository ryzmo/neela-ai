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

      <div style="font-family:sans-serif">

        <h2>⚠️ Pond Alert Notification</h2>

        <p>
          NEELA AI detected abnormal pond conditions.
        </p>

        <h3>Active Alerts</h3>

        <ul>

          ${alerts.map(alert => `

            <li>

              <b>${alert.title}</b>

              (${alert.severity})

              - ${alert.message}

            </li>

          `).join("")}

        </ul>

        <h3>Sensor Data</h3>

        <table>

          <tr>
            <td>Temperature</td>
            <td>${sensorData.temperature} °C</td>
          </tr>

          <tr>
            <td>DO</td>
            <td>${sensorData.do} mg/L</td>
          </tr>

          <tr>
            <td>pH</td>
            <td>${sensorData.ph}</td>
          </tr>

          <tr>
            <td>Turbidity</td>
            <td>${sensorData.turbidity} NTU</td>
          </tr>

        </table>

        <p>

          Buzzer Status:

          <b>${buzzer}</b>

        </p>

        <hr>

        <small>

          NEELA AI Smart Aquaculture Platform

        </small>

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