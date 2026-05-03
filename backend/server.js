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
    const ds = candidate.scores.design_sprint || {};
    const sc = candidate.scores.solve_conflict || {};

    const rowData =[
      timestamp, assessorName, candidate.name, candidate.cnic,
      cs.teamwork || '', cs.ownership || '', cs.business_acumen || '', cs.problem_solving || '', cs.comments || '',
      ds.teamwork || '', ds.ownership || '', ds.fairness || '', ds.honesty || '', ds.ambition_passion || '', ds.risk_taking || '', ds.commitment_process || '', ds.multi_tasking || '', ds.stakeholder_management || '', ds.business_acumen || '', ds.problem_solving || '', ds.comments || '',
      sc.teamwork || '', sc.interpersonal_skills || '', sc.inclusivity || '', sc.emotional_intelligence || '', sc.ownership || '', sc.fairness || '', sc.honesty || '', sc.ambition_passion || '', sc.multi_tasking || '', sc.stakeholder_management || '', sc.problem_solving || '', sc.comments || ''
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Sheet1!A:AG', 
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