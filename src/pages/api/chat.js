import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { messages, context } = req.body;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ message: "Messages history is required" });
    }

    const latestMessage = messages[messages.length - 1].content;
    const telemetry = context || {
      sensor_data: { temperature: "-", do: "-", ph: "-", turbidity: "-", water_level: "-" },
      health_status: "-",
      risk_level: "-",
      aerator: "OFF",
      feeder: "OFF",
      water_circulation: "OFF",
      ph_neutralizer: "OFF",
      buzzer: "OFF"
    };

    const apiKeyGemini = process.env.GEMINI_API_KEY;
    const apiKeyOpenAI = process.env.OPENAI_API_KEY;

    // Construct the context system prompt
    const systemPrompt = `You are NEELA AI, an expert Smart Aquaculture Assistant for Tilapia fish farming.
You have direct access to the live pond telemetry data.

CURRENT POND CONTEXT:
- Health Status: ${telemetry.health_status}
- Risk Level: ${telemetry.risk_level || (telemetry.health_status?.toLowerCase().includes("risk") ? "HIGH" : "LOW")}
- Sensor Readings:
  * Temperature: ${telemetry.sensor_data?.temperature}°C (Optimal: < 30°C)
  * Dissolved Oxygen (DO): ${telemetry.sensor_data?.do} mg/L (Optimal: > 5.0 mg/L)
  * pH Level: ${telemetry.sensor_data?.ph} (Optimal: 6.5 - 8.0)
  * Turbidity: ${telemetry.sensor_data?.turbidity} NTU (Optimal: < 15 NTU)
  * Water Level: ${telemetry.sensor_data?.water_level} cm (Max: 20 cm)
- Actuators Relays State:
  * Aerator (Air Pump): ${telemetry.aerator || "OFF"}
  * Feeder (Auto Feeder): ${telemetry.feeder || "OFF"}
  * Water Circulation (Water Pump): ${telemetry.water_circulation || "OFF"}
  * pH Neutralizer: ${telemetry.ph_neutralizer || "OFF"}
  * Alarm Buzzer: ${telemetry.buzzer || "OFF"}

INSTRUCTIONS:
1. Always base your replies on the live pond telemetry values.
2. Reply in the same language as the user's message (default to Indonesian if they speak Indonesian, or English if they speak English).
3. Be helpful, concise, and scientific. Explain the rationale behind active actuators (e.g. Aerator turns ON if DO is low, Water Circulation turns ON on high temp/turbidity, pH Neutralizer turns ON if pH is out of bounds).`;

    // ----------------------------------------------------
    // Option A: OpenAI GPT API Connection
    // ----------------------------------------------------
    if (apiKeyOpenAI) {
      try {
        const response = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              ...messages.map(m => ({ role: m.sender === "user" ? "user" : "assistant", content: m.content }))
            ]
          },
          {
            headers: {
              Authorization: `Bearer ${apiKeyOpenAI}`,
              "Content-Type": "application/json"
            }
          }
        );
        const reply = response.data.choices[0].message.content;
        return res.status(200).json({ reply });
      } catch (err) {
        console.error("OpenAI API call failed, falling back to local expert system:", err.message);
      }
    }

    // ----------------------------------------------------
    // Option B: Gemini API Connection
    // ----------------------------------------------------
    if (apiKeyGemini) {
      try {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKeyGemini}`,
          {
            contents: [
              {
                role: "user",
                parts: [
                  { text: systemPrompt },
                  ...messages.map(m => ({ text: `${m.sender === "user" ? "User" : "AI"}: ${m.content}` })),
                  { text: "Response:" }
                ]
              }
            ]
          },
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
        const reply = response.data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply });
      } catch (err) {
        console.error("Gemini API call failed, falling back to local expert system:", err.message);
      }
    }

    // ----------------------------------------------------
    // Option C: Smart Context-Aware Expert Rule System (No API keys fallback)
    // ----------------------------------------------------
    const query = latestMessage.toLowerCase();
    const isIndo = query.match(/(siapa|apa|bagaimana|kondisi|suhu|oksigen|kolam|kenapa|mengapa|saran|rekomendasi|aman|sehat|status)/i) !== null;

    let responseText = "";

    const t_val = telemetry.sensor_data?.temperature || "-";
    const do_val = telemetry.sensor_data?.do || "-";
    const ph_val = telemetry.sensor_data?.ph || "-";
    const tur_val = telemetry.sensor_data?.turbidity || "-";

    const isStable = telemetry.health_status?.toLowerCase().includes("stable") || telemetry.health_status?.toLowerCase().includes("good") || telemetry.health_status?.toLowerCase().includes("normal");

    // 1. GREETING & GENERAL INFO
    if (query.match(/(hello|halo|hi|hay|siapa|intro|bantuan|help)/i)) {
      if (isIndo) {
        responseText = `Halo! Saya adalah **NEELA AI Assistant**. Saya memantau data sensor kolam Anda secara real-time. 
Kondisi kolam Anda saat ini diklasifikasikan sebagai **${telemetry.health_status && telemetry.health_status !== "-" ? telemetry.health_status : "STABLE"}** dengan tingkat risiko **${isStable ? "RENDAH" : "TINGGI"}**.
Anda bisa menanyakan kondisi sensor spesifik (seperti pH, suhu, oksigen terlarut/DO, kekeruhan) atau meminta rekomendasi tindakan untuk mengoptimalkan tambak ikan nila Anda. Ada yang ingin Anda konsultasikan?`;
      } else {
        responseText = `Hello! I am the **NEELA AI Assistant**. I monitor your pond's sensor telemetry in real-time.
Your pond status is currently classified as **${telemetry.health_status && telemetry.health_status !== "-" ? telemetry.health_status : "STABLE"}** with a **${isStable ? "LOW" : "HIGH"}** risk assessment.
Feel free to ask me about specific sensors (pH, temperature, dissolved oxygen/DO, turbidity) or request action recommendations to optimize your tilapia pond. How can I help you today?`;
      }
    }
    // 2. PH
    else if (query.match(/(ph|asam|basa|alkali)/i)) {
      const phNum = parseFloat(ph_val);
      let phStatus = "normal";
      let action = "Sistem penetral pH berada dalam kondisi pasif.";
      if (phNum < 6.5) {
        phStatus = "terlalu asam (rendah)";
        action = `Karena pH di bawah batas aman (6.5), **pH Neutralizer aktif (${telemetry.ph_neutralizer})** untuk menyuntikkan larutan alkali guna menaikkan pH.`;
      } else if (phNum > 8.0) {
        phStatus = "terlalu basa (tinggi)";
        action = `Karena pH melebihi batas aman (8.0), **pH Neutralizer aktif (${telemetry.ph_neutralizer})** untuk menyuntikkan penetral asam.`;
      }

      if (isIndo) {
        responseText = `Tingkat **pH air kolam saat ini adalah ${ph_val}** (Batas aman: 6.5 - 8.0). Kondisi ini dinilai **${phStatus}**. ${action} pH yang terlalu ekstrem dapat memicu stres pada ikan nila dan menghambat laju pertumbuhan mereka.`;
      } else {
        const phStatusEn = phStatus === "normal" ? "normal" : (phNum < 6.5 ? "too acidic" : "too alkaline");
        const actionEn = phNum < 6.5 || phNum > 8.0 
          ? `Because the pH is out of bounds, the **pH Neutralizer is turned ${telemetry.ph_neutralizer}** to restore balance.` 
          : "The pH neutralizer system is currently inactive.";
        responseText = `The current **pond pH level is ${ph_val}** (Optimal: 6.5 - 8.0), which is **${phStatusEn}**. ${actionEn} Extreme pH levels can severely stress tilapia and suppress their immune system.`;
      }
    }
    // 3. DO / OKSIGEN
    else if (query.match(/(do|oksigen|oxygen|udara|sesak|napas)/i)) {
      const doNum = parseFloat(do_val);
      let doStatus = "cukup dan aman";
      let action = "Aerator saat ini mati karena kadar oksigen mencukupi.";
      if (doNum < 5.0) {
        doStatus = "rendah (kritis)";
        action = `Kadar oksigen yang rendah memicu **Aerator menyala otomatis (${telemetry.aerator})** untuk meningkatkan aerasi dan difusi oksigen ke air.`;
      }

      if (isIndo) {
        responseText = `Kadar **Oksigen Terlarut (DO) saat ini adalah ${do_val} mg/L** (Batas minimum aman: 5.0 mg/L). Kondisi oksigen dinilai **${doStatus}**. ${action} Oksigen yang cukup sangat vital bagi metabolisme dan kelangsungan hidup ikan nila.`;
      } else {
        const doStatusEn = doNum < 5.0 ? "critically low" : "optimal and safe";
        const actionEn = doNum < 5.0 
          ? `This critical level automatically triggers the **Aerator relay to turn ${telemetry.aerator}** to oxygenate the water.` 
          : "The aerator is currently OFF as oxygen levels are sufficient.";
        responseText = `The **Dissolved Oxygen (DO) level is ${do_val} mg/L** (Safe threshold: > 5.0 mg/L), which is **${doStatusEn}**. ${actionEn} Low DO is the leading cause of sudden tilapia mortality.`;
      }
    }
    // 4. TEMPERATURE / SUHU
    else if (query.match(/(suhu|temp|panas|dingin|celcius|derajat)/i)) {
      const tempNum = parseFloat(t_val);
      let tempStatus = "optimal";
      let action = "Sistem sirkulasi pompa air stabil.";
      if (tempNum > 30.0) {
        tempStatus = "terlalu panas";
        action = `Suhu tinggi memicu **Pompa Sirkulasi air menyala (${telemetry.water_circulation})** untuk membantu pencampuran air dan menurunkan suhu lapisan atas kolam.`;
      }

      if (isIndo) {
        responseText = `Suhu **air kolam saat ini adalah ${t_val}°C** (Batas optimal: 25 - 30°C). Suhu dinilai **${tempStatus}**. ${action} Suhu air mempengaruhi tingkat konsumsi pakan dan aktivitas pencernaan ikan nila.`;
      } else {
        const tempStatusEn = tempNum > 30.0 ? "high (above safe limits)" : "optimal";
        const actionEn = tempNum > 30.0 
          ? `This high temperature automatically turns the **Water Circulation pump ${telemetry.water_circulation}** to cool down the surface layer.` 
          : "The circulation pump is running in standard idle state.";
        responseText = `The **water temperature is ${t_val}°C** (Optimal: 25 - 30°C), which is **${tempStatusEn}**. ${actionEn} Water temperature directly impacts tilapia feed conversion ratio (FCR).`;
      }
    }
    // 5. TURBIDITY / KEKERUHAN
    else if (query.match(/(keruh|kekeruhan|turbid|lumpur|kotor|jernih)/i)) {
      const turNum = parseFloat(tur_val);
      let turStatus = "jernih dan aman";
      let action = "Sirkulasi penyaringan berjalan normal.";
      if (turNum > 15.0) {
        turStatus = "terlalu keruh (tinggi)";
        action = `Kekeruhan tinggi mendeteksi penumpukan sedimen/plankton, sehingga **Pompa Sirkulasi menyala (${telemetry.water_circulation})** untuk mengalirkan air melewati filter fisik.`;
      }

      if (isIndo) {
        responseText = `Tingkat **kekeruhan air saat ini adalah ${tur_val} NTU** (Batas aman: < 15 NTU). Kondisi air dinilai **${turStatus}**. ${action} Air yang terlalu keruh dapat menyumbat insang ikan dan mengganggu jarak pandang makan mereka.`;
      } else {
        const turStatusEn = turNum > 15.0 ? "too turbid (cloudy)" : "clear and safe";
        const actionEn = turNum > 15.0 
          ? `High turbidity triggers the **Water Circulation pump ${telemetry.water_circulation}** to run the water through the filtration unit.` 
          : "The filtration circulation is in normal idle status.";
        responseText = `The **turbidity reading is ${tur_val} NTU** (Optimal: < 15 NTU), which is **${turStatusEn}**. ${actionEn} Suspended solids can clog tilapia gills and limit natural light penetration.`;
      }
    }
    // 6. SARAN / REKOMENDASI / STATUS / SUMMARY
    else if (query.match(/(saran|rekomendasi|tindakan|tips|solusi|bagaimana|kondisi|status|aman|sehat)/i)) {
      const doNum = parseFloat(do_val);
      const phNum = parseFloat(ph_val);
      const tempNum = parseFloat(t_val);
      const turNum = parseFloat(tur_val);

      const warnings = [];
      if (doNum < 5.0) warnings.push(isIndo ? "Kadar oksigen (DO) kritis" : "Dissolved Oxygen is low");
      if (phNum < 6.5 || phNum > 8.0) warnings.push(isIndo ? "pH di luar batas aman" : "pH is out of range");
      if (tempNum > 30.0) warnings.push(isIndo ? "Suhu air terlalu panas" : "Water temperature is too high");
      if (turNum > 15.0) warnings.push(isIndo ? "Air terlalu keruh" : "Pond water is too turbid");

      if (isIndo) {
        responseText = `### Laporan Konsultasi Kolam (Status: **${telemetry.health_status && telemetry.health_status !== "-" ? telemetry.health_status : "STABLE"}**)
        
Berdasarkan telemetri terbaru, berikut ringkasan evaluasi:
- **Kondisi Umum**: Kolam dalam keadaan ${isStable ? "stabil dan sehat" : "butuh perhatian khusus (At Risk)"}.
${warnings.length > 0 ? `- **Masalah Terdeteksi**: ${warnings.join(", ")}.` : "- **Masalah Terdeteksi**: Tidak ada parameter yang melanggar batas kritis."}

**Rekomendasi Tindakan:**
1. **Aerator**: ${telemetry.aerator === "ON" ? "Aerator menyala otomatis untuk menambah pasokan udara. Pastikan lubang aerasi bersih dari kotoran." : "Kadar udara aman. Aerator mati untuk efisiensi listrik."}
2. **Sirkulasi**: ${telemetry.water_circulation === "ON" ? "Pompa sirkulasi aktif untuk menyaring lumpur/menurunkan suhu. Periksa apakah filter fisik tersumbat." : "Sirkulasi normal. Air cukup jernih."}
3. **Pemberian Pakan**: Ikan nila aktif makan pada suhu 26-29°C. Saat ini suhu ${t_val}°C, ${tempNum > 30 ? "kurangi volume pakan untuk mencegah pengendapan sisa pakan di dasar kolam." : "pemberian pakan dapat dilakukan secara normal."}`;
      } else {
        responseText = `### Pond Consultation Report (Status: **${telemetry.health_status && telemetry.health_status !== "-" ? telemetry.health_status : "STABLE"}**)
        
Based on the latest telemetry readings, here is my evaluation:
- **General Condition**: The pond is ${isStable ? "stable and healthy" : "requiring attention (At Risk)"}.
${warnings.length > 0 ? `- **Alerts Triggered**: ${warnings.join(", ")}.` : "- **Alerts Triggered**: None. All parameters are within ideal ranges."}

**Action Recommendations:**
1. **Aerator Control**: ${telemetry.aerator === "ON" ? "Aerator is ON to increase oxygen diffusion. Ensure the air intakes are free of dust." : "Oxygen levels are safe. Aerator is OFF to save power."}
2. **Filtration Pump**: ${telemetry.water_circulation === "ON" ? "Circulation pump is ON to filter out solids/cool the water. Check the physical filter screens." : "Circulation is stable. Turbidity is low."}
3. **Feeding Schedule**: Tilapia feed optimally at 26-29°C. Since it is currently ${t_val}°C, ${tempNum > 30 ? "reduce feed portions to prevent organic decomposition at the pond bottom." : "standard feed amount is recommended."}`;
      }
    }
    // 7. RANDOM FOREST / AI MODEL
    else if (query.match(/(random forest|rf|model|akurasi|klasifikasi|ai|cerdas|mesin)/i)) {
      if (isIndo) {
        responseText = `Pond Health Classifier kami menggunakan algoritma **Random Forest Classifier (dengan 200 estimators)** yang dilatih menggunakan 4.383 baris data pengamatan sensor per jam. 
Model ini memiliki tingkat akurasi sebesar **99.88%** dalam memprediksi kondisi kolam menjadi 'Stable' atau 'At Risk'. 
Pada pembacaan terbaru, model menerima masukan: Temp=${t_val}°C, DO=${do_val} mg/L, pH=${ph_val}, Turbidity=${tur_val} NTU, dan mengklasifikasikan kolam Anda sebagai **${telemetry.health_status && telemetry.health_status !== "-" ? telemetry.health_status : "STABLE"}** (Kepercayaan: ${telemetry.rf_confidence ? (telemetry.rf_confidence * 100).toFixed(1) + "%" : "100%"}).`;
      } else {
        responseText = `Our Pond Health Classifier utilizes a **Random Forest Classifier (with 200 estimators)** trained on 4,383 hourly sensor observations.
The model achieves **99.88% validation accuracy** in predicting whether a pond is 'Stable' or 'At Risk'.
For the latest data packet, it evaluated Temp=${t_val}°C, DO=${do_val} mg/L, pH=${ph_val}, and Turbidity=${tur_val} NTU to predict a status of **${telemetry.health_status && telemetry.health_status !== "-" ? telemetry.health_status : "STABLE"}** (Confidence: ${telemetry.rf_confidence ? (telemetry.rf_confidence * 100).toFixed(1) + "%" : "100%"}).`;
      }
    }
    // 8. FALLBACK / GENERAL
    else {
      if (isIndo) {
        responseText = `Saya memahami pertanyaan Anda tentang kolam. Berdasarkan telemetri terbaru (Suhu: ${t_val}°C, DO: ${do_val} mg/L, pH: ${ph_val}, Kekeruhan: ${tur_val} NTU), kolam berada dalam status **${telemetry.health_status && telemetry.health_status !== "-" ? telemetry.health_status : "STABLE"}**.
Silakan tanyakan secara lebih spesifik, seperti:
- "Bagaimana kondisi kadar pH kolam?"
- "Kenapa pompa air / aerator menyala?"
- "Berikan saran penanganan kolam saat ini."
- "Bagaimana cara kerja model Random Forest AI Anda?"`;
      } else {
        responseText = `I hear your question about the pond. Based on the latest telemetry (Temp: ${t_val}°C, DO: ${do_val} mg/L, pH: ${ph_val}, Turbidity: ${tur_val} NTU), the pond is currently **${telemetry.health_status && telemetry.health_status !== "-" ? telemetry.health_status : "STABLE"}**.
Please ask a more specific question, such as:
- "What is the status of the pond's pH levels?"
- "Why is the aerator or water pump running?"
- "Give me recommendations for current pond status."
- "How does the Random Forest AI model classify this?"`;
      }
    }

    return res.status(200).json({ reply: responseText });

  } catch (error) {
    console.error("Chat Handler Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
