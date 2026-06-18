import {
  useState,
  useEffect,
} from "react";
import Sidebar from "../components/Sidebar";
import useAquaAgent from "../hooks/useAquaAgent";



export default function AlertsPage() {

  const { data} =
    useAquaAgent();

  const [newEmail, setNewEmail] = useState("");

  const [emails, setEmails] = useState([]);
  const [sending, setSending] = useState(false);

  const activeAlerts = [

  Number(data.sensor_data?.do) < 5 && {
    title: "Low Dissolved Oxygen",
    severity: "CRITICAL",
    message: "DO level below recommended threshold.",
  },

  Number(data.sensor_data?.temperature) > 30 && {
    title: "High Temperature",
    severity: "WARNING",
    message: "Water temperature exceeds optimal range.",
  },

  (
    Number(data.sensor_data?.ph) < 6.5 ||
    Number(data.sensor_data?.ph) > 8
  ) && {
    title: "Unstable pH",
    severity: "WARNING",
    message: "pH outside safe operating range.",
  },

].filter(Boolean);

// Load settings from localStorage
useEffect(() => {

  const savedEmails =
    localStorage.getItem(
      "alertEmails"
    );

  if (savedEmails) {

    setEmails(
      JSON.parse(
        savedEmails
      )
    );

  }

}, []);

useEffect(() => {

  localStorage.setItem(

    "alertEmails",

    JSON.stringify(
      emails
    )

  );

}, [emails]);

function addEmail() {

  if (!newEmail.trim()) {

    alert("Please enter an email");

    return;

  }

  if (
    !/\S+@\S+\.\S+/.test(newEmail)
  ) {

    alert("Invalid email");

    return;

  }

  if (
    emails.includes(newEmail)
  ) {

    alert("Email already exists");

    return;

  }

  setEmails([
    ...emails,
    newEmail,
  ]);

  setNewEmail("");

}
function removeEmail(emailToRemove) {

  setEmails(

    emails.filter(

      email =>

        email !== emailToRemove

    )

  );

}

async function sendEmail() {

  if (emails.length === 0) {

  alert(
    "Please add at least one email"
  );

  return;

}

  try {

    setSending(true);

    const response = await fetch(
      "/api/send-alert-email",
      {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({

          emails,

          alerts: activeAlerts,

          sensorData: data?.sensor_data,
          buzzer: data.buzzer,

        }),

      }
    );

    const result =
      await response.json();

    if (response.ok) {

    alert(
      activeAlerts.length > 0
        ? "Alert email sent successfully"
        : "Notif email sent successfully"
    );

    }

    else {

      alert(result.message);

    }

  }

  catch (error) {

    console.error(error);

    alert("Failed to send email");

  }

  finally {

    setSending(false);

  }

}
  

  return (

    <div className="md:flex">

      <Sidebar />

      <main className="flex-1 p-4 md:p-10">

        <h1 className="text-4xl font-bold mb-8">

          Alerts & Notifications

        </h1>

        {
  data?.buzzer === "ON" && (

    <div className="
      bg-red-600
      text-white
      rounded-2xl
      p-5
      mb-8
      animate-pulse
    ">

      🚨 Emergency Buzzer Activated

      <div className="text-sm mt-1">

        AI detected HIGH or CRITICAL pond condition.

      </div>

    </div>

  )
}

<div className="bg-white rounded-2xl shadow p-8 mb-8">

  <div className="flex justify-between items-center mb-6">

    <div>

      <h2 className="text-2xl font-bold">

        Email Notifications

      </h2>

      <p className="text-gray-500 mt-1">

        Manage recipients for Neela notifications.

      </p>

    </div>

    <span
      className="
        bg-blue-100
        text-blue-700
        px-3
        py-1
        rounded-full
        text-sm
      "
    >

      {emails.length} Recipients

    </span>

  </div>

  {/* Add Email */}

  <div className="flex flex-col md:flex-row gap-3 mb-6">

    <input

      type="email"

      value={newEmail}

      onChange={(e) =>
        setNewEmail(
          e.target.value
        )
      }

      placeholder="example@email.com"

      className="
        flex-1
        border
        rounded-xl
        p-3
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
      "

    />

    <button

      onClick={addEmail}

      className="
        bg-green-600
        hover:bg-green-700
        text-white
        px-6
        py-3
        rounded-xl
      "

    >

      Add Email

    </button>

  </div>

  {/* Email List */}

  <div className="space-y-3 mb-6">

    {

      emails.length === 0 &&

      <div className="text-gray-500">

        No recipients added.

      </div>

    }

    {

      emails.map(

        email => (

          <div

            key={email}

            className="
              flex
              justify-between
              items-center
              border
              rounded-xl
              p-3
            "

          >

            <span>

              {email}

            </span>

            <button

              onClick={() =>
                removeEmail(
                  email
                )
              }

              className="
                bg-red-500
                hover:bg-red-600
                text-white
                px-3
                py-1
                rounded-lg
              "

            >

              Remove

            </button>

          </div>

        )

      )

    }

  </div>

  {/* Send Button */}

  <button

    onClick={sendEmail}

    disabled={
      sending ||

      emails.length === 0
    }

    className={`
      w-full
      py-3
      rounded-xl
      text-white
      font-semibold

      ${
        activeAlerts.length > 0

        ? "bg-red-600 hover:bg-red-700"

        : "bg-blue-600 hover:bg-blue-700"

      }

      disabled:opacity-50
    `}

  >

    {

      sending

      ? "Sending..."

      : activeAlerts.length > 0

        ? "Send Alert Notification"

        : "Send Notification"

    }

  </button>

</div>

        {/* ACTIVE ALERTS */}

        <div className="bg-white rounded-2xl shadow p-8 mb-8">

          <h2 className="text-2xl font-bold mb-6">

            Active Alerts

          </h2>

          <div className="space-y-4">

            {
              activeAlerts.length === 0 &&

              <div className="bg-green-50 border border-green-200 rounded-xl p-4">

                No active alerts detected.

              </div>
            }

            {
              activeAlerts.map(
                (alert,index) => (

                  <AlertCard
                    key={index}
                    {...alert}
                  />

                )
              )
            }

          </div>

        </div>

      </main>

    </div>

  );

}

function AlertCard({
  title,
  severity,
  message
}) {

  return (

    <div
      className={`
        p-4 rounded-xl border

        ${
          severity === "CRITICAL"
          ? "bg-red-50 border-red-300"
          : "bg-yellow-50 border-yellow-300"
        }
      `}
    >

      <div className="flex justify-between">

        <h3 className="font-bold">

          {title}

        </h3>

        <span
          className={`
            px-3 py-1 rounded-full text-xs

            ${
              severity === "CRITICAL"
              ? "bg-red-500 text-white"
              : "bg-yellow-500 text-white"
            }
          `}
        >

          {severity}

        </span>

      </div>

      <p className="mt-2">

        {message}

      </p>

    </div>

  );

}