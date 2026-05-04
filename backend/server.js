require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');

const app = express();
app.use(cors());
app.use(express.json());

// Securely load Google Credentials
let auth;
console.log("Checking environment variables...");

if (process.env.GOOGLE_CREDENTIALS) {
  console.log("✅ GOOGLE_CREDENTIALS found! Using Render environment variables.");
  try {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    auth = new google.auth.GoogleAuth({
      credentials,
      scopes:['https://www.googleapis.com/auth/spreadsheets'],
    });
  } catch (err) {
    console.error("❌ Error parsing GOOGLE_CREDENTIALS JSON. Make sure you copied the whole file correctly:", err.message);
  }
} else {
  console.log("⚠️ GOOGLE_CREDENTIALS is missing! Falling back to local credentials.json file.");
  auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes:['https://www.googleapis.com/auth/spreadsheets'],
  });
}

app.post('/api/submit-results', async (req, res) => {
  try {
    const { assessorName, candidate } = req.body;
    const sheets = google.sheets({ version: 'v4', auth });

    const timestamp = new Date().toLocaleString('en-PK', {
  timeZone: 'Asia/Karachi',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true
});
    
    const cs = candidate.scores.case_study || {};
    const ec = candidate.scores.design_sprint || {};
    const sc = candidate.scores.solve_conflict || {};

    const rowData = [
      timestamp, assessorName, candidate.name, candidate.cnic,
      // Case Study (4 competencies)
      cs.problem_solving_ability || '', cs.business_acumen || '', cs.teamwork || '', cs.ownership || '', cs.comments || '',
      // The Experience Center (8 competencies)
      ec.innovation_creativity || '', ec.resilience_agility || '', ec.teamwork || '', ec.problem_solving_ability || '', ec.commitment_to_process_improvement || '', ec.ownership || '', ec.business_acumen || '', ec.stakeholder_management || '', ec.comments || '',
      // Solve That Conflict (8 competencies)
      sc.conduct_integrity || '', sc.emotional_intelligence || '', sc.interpersonal_skills || '', sc.ownership || '', sc.teamwork || '', sc.inclusivity || '', sc.stakeholder_management || '', sc.problem_solving_ability || '', sc.comments || ''
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Sheet1!A:AA',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [rowData] },
    });

    res.status(200).json({ success: true, message: 'Saved to Google Sheets' });
  } catch (error) {
    console.error('Error saving to sheets:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));