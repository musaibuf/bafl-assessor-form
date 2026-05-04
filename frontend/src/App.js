import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Paper, Typography, TextField, Button, Box,
  Radio, RadioGroup, FormControlLabel, FormControl, FormLabel,
  FormHelperText, AppBar, Toolbar, Autocomplete,
  Drawer, List, ListItem, ListItemText, Chip, Accordion,
  AccordionSummary, AccordionDetails, IconButton, Avatar, Divider, LinearProgress, Tooltip,
  Snackbar, Alert, Collapse
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Papa from 'papaparse';
import {
  CheckCircle, ExpandMore, Delete,
  PersonSearch, AccountBalance, AssignmentTurnedIn,
  Person, Badge, School, LocationOn, KeyboardArrowRight,
  PictureAsPdf, FolderOpen, ExpandLess
} from '@mui/icons-material';

// ─── BANK ALFALAH THEME ─────────────────────────────────────────────────────
const baflTheme = createTheme({
  palette: {
    primary:   { main: '#CC0000', dark: '#990000', light: '#FF3333', contrastText: '#fff' },
    secondary: { main: '#1A1A2E', dark: '#0D0D1A', light: '#2D2D4A', contrastText: '#fff' },
    background:{ default: '#F5F6FA', paper: '#FFFFFF' },
    text:      { primary: '#1A1A2E', secondary: '#5A6475' },
    success:   { main: '#1B8A4E', light: '#E8F5EE' },
    divider:   '#E4E8F0',
  },
  typography: {
    fontFamily: '"Poppins", "Segoe UI", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.5px' },
    h5: { fontWeight: 700, letterSpacing: '-0.3px' },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    overline: { letterSpacing: 2, fontWeight: 700, fontSize: '0.68rem' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 8, padding: '10px 20px' },
        contained: { boxShadow: '0 4px 14px rgba(204,0,0,0.25)', '&:hover': { boxShadow: '0 6px 20px rgba(204,0,0,0.35)' } }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover fieldset': { borderColor: '#CC0000' },
            '&.Mui-focused fieldset': { borderColor: '#CC0000', borderWidth: 2 },
          },
          '& label.Mui-focused': { color: '#CC0000' },
        }
      }
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: '12px !important',
          overflow: 'hidden',
          '&:before': { display: 'none' },
          '&.Mui-expanded': { margin: '0 0 16px 0' },
        }
      }
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600, borderRadius: 6 } }
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 12 }
      }
    }
  }
});

// ─── DATA ───────────────────────────────────────────────────────────────────
const activityMatrix = {
  case_study:    ["problem_solving_ability","business_acumen","teamwork","ownership"],
  design_sprint: ["innovation_creativity","resilience_agility","teamwork","problem_solving_ability","commitment_to_process_improvement","ownership","business_acumen","stakeholder_management"],
  solve_conflict:["conduct_integrity","emotional_intelligence","interpersonal_skills","ownership","teamwork","inclusivity","stakeholder_management","problem_solving_ability"]
};

const rounds =[
  { id:'case_study',    title:'Case Study',            icon:'📋', color:'#CC0000' },
  { id:'design_sprint', title:'The Experience Center', icon:'🚀', color:'#0066CC' },
  { id:'solve_conflict',title:"Solve That Conflict!",  icon:'🤝', color:'#1B8A4E' },
];

const clusters =[
  { id:"collaboration",        title:"Collaboration",          icon:"👥", competencies:[{id:"teamwork",label:"Teamwork"},{id:"interpersonal_skills",label:"Interpersonal Skills"},{id:"inclusivity",label:"Inclusivity"},{id:"emotional_intelligence",label:"Emotional Intelligence"}] },
  { id:"conduct_integrity",    title:"Conduct & Integrity",    icon:"⚖️", competencies:[{id:"conduct_integrity",label:"Conduct & Integrity"},{id:"ownership",label:"Ownership"}] },
  { id:"creativity_innovation",title:"Creativity & Innovation",icon:"💡", competencies:[{id:"innovation_creativity",label:"Innovation & Creativity"},{id:"resilience_agility",label:"Resilience & Agility"},{id:"commitment_to_process_improvement",label:"Commitment to Process Improvement"}] },
  { id:"customer_care",        title:"Customer Care",          icon:"🎯", competencies:[{id:"stakeholder_management",label:"Stakeholder Management"},{id:"business_acumen",label:"Business Acumen"},{id:"problem_solving_ability",label:"Problem Solving Ability"}] }
];

const scoreLabels = { 1:'Below Expectation', 2:'Meets Basic', 3:'Meets Expectation', 4:'Exceeds Expectation' };
const scoreColors = { 1:'#D32F2F', 2:'#F57C00', 3:'#1976D2', 4:'#2E7D32' };

// ─── PDF RESOURCES ───────────────────────────────────────────────────────────
const pdfResources = [
  { name: 'Assessor Rubric',                          file: 'BAFL 26 - Assessor Rubric Final.pdf' },
  { name: 'Case Study 1 — The Untapped Millions',     file: 'BAFL 26 - Case Study 1 - The Untapped Millions.pdf' },
  { name: 'Case Study 1 — Solution Key',              file: 'BAFL 26 - Case Study 1 Solution Key.pdf' },
  { name: 'Case Study 2 — The Corridor that Counts',  file: 'BAFL 26 - Case Study 2 - The Corridor that Counts.pdf' },
  { name: 'Case Study 2 — Solution Key',              file: 'BAFL 26 - Case Study 2 Solution Key.pdf' },
  { name: 'Case Study 3 — The $12 Billion Question',  file: 'BAFL 26 - Case Study 3- The $12 Billion Question.pdf' },
  { name: 'Case Study 3 — Solution Key',              file: 'BAFL 26 - Case Study 3 Solution Key.pdf' },
  { name: 'Case Study 4 — A Letter from Branch 0247', file: 'BAFL 26 - Case Study 4 - A Letter from Branch 0247.pdf' },
  { name: 'Case Study 4 — Solution Key',              file: 'BAFL 26 - Case Study 4 Solution Key.pdf' },
  { name: 'Experience Center Assessors Guide',         file: 'BAFL 26 - Experience Center Assessors Guide.pdf' },
  { name: 'The Experience Center Brief',               file: 'BAFL 26 - The Experience Center Brief.pdf' },
  { name: 'Solve That Conflict Scenarios',             file: 'BAFL 26 Solve That Conflict Scenarios.pdf' },
];
// ─── SCHEMA ─────────────────────────────────────────────────────────────────
const getRoundSchema = (roundId) => {
  const shape = { comments: z.string().min(10,"Please provide at least a brief comment (min 10 characters)") };
  activityMatrix[roundId].forEach(comp => {
    shape[comp] = z.coerce.number({ invalid_type_error:"Please select a score" }).min(1).max(4);
  });
  return z.object(shape);
};

const drawerWidth = 300;

// ─── SCORE BUTTON ────────────────────────────────────────────────────────────
const ScoreButton = ({ value, onChange, error }) => {
  const selected = Number(value) || null;
  return (
    <Box sx={{ display:'flex', gap:1, flexWrap:'wrap', mt:0.5 }}>
      {[1,2,3,4].map(v => {
        const isSelected = selected === v;
        return (
          <Tooltip key={v} title={scoreLabels[v]} placement="top" arrow>
            <Box
              onClick={() => onChange(v)}
              sx={{
                width: 44, height: 44, borderRadius: 2,
                display:'flex', alignItems:'center', justifyContent:'center',
                cursor:'pointer', fontWeight: 700, fontSize:'1.05rem',
                border: isSelected ? `2px solid ${scoreColors[v]}` : '2px solid #E4E8F0',
                color: isSelected ? '#fff' : (error ? '#D32F2F' : '#5A6475'),
                backgroundColor: isSelected ? scoreColors[v] : (error ? '#FFF5F5' : '#F9FAFB'),
                boxShadow: isSelected ? `0 4px 14px ${scoreColors[v]}55` : 'none',
                transition:'all 0.18s ease',
                '&:hover': {
                  borderColor: scoreColors[v],
                  backgroundColor: isSelected ? scoreColors[v] : `${scoreColors[v]}18`,
                  color: isSelected ? '#fff' : scoreColors[v],
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 16px ${scoreColors[v]}45`
                }
              }}
            >
              {v}
            </Box>
          </Tooltip>
        );
      })}
      {selected && (
        <Chip
          label={scoreLabels[selected]}
          size="small"
          sx={{
            alignSelf:'center', backgroundColor:`${scoreColors[selected]}15`,
            color: scoreColors[selected], border:`1px solid ${scoreColors[selected]}40`,
            fontSize:'0.7rem', height:24
          }}
        />
      )}
    </Box>
  );
};

// ─── ROUND FORM ──────────────────────────────────────────────────────────────
const RoundForm = ({ roundId, candidateId, onSave, onAutoSave, isCompleted, savedData }) => {
  const { control, handleSubmit, watch, getValues, formState:{errors} } = useForm({
    resolver: zodResolver(getRoundSchema(roundId)),
    defaultValues: savedData || { comments:'' }
  });
  
  const watchedValues = watch();
  const requiredComps = activityMatrix[roundId];
  const filled = requiredComps.filter(c => watchedValues[c] >= 1 && watchedValues[c] <= 4).length;
  const progress = Math.round((filled / requiredComps.length) * 100);

  // Auto-save logic: Debounces typing and saves immediately on unmount (switching candidates)
  useEffect(() => {
    let timeoutId;
    const subscription = watch(() => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        onAutoSave(candidateId, roundId, getValues());
      }, 500);
    });
    
    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
      // Force save on unmount so no data is lost when switching screens
      onAutoSave(candidateId, roundId, getValues());
    };
  },[watch, candidateId, roundId, onAutoSave, getValues]);

  return (
    <Box component="form" onSubmit={handleSubmit(d => onSave(roundId, d))}>

      {/* Progress bar */}
      <Box sx={{ mb:3, p:2, backgroundColor:'#F9FAFB', borderRadius:2, border:'1px solid #E4E8F0' }}>
        <Box sx={{ display:'flex', justifyContent:'space-between', mb:1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>Scoring Progress</Typography>
          <Typography variant="caption" sx={{ color: progress===100 ? '#1B8A4E' : '#CC0000', fontWeight:700 }}>
            {filled}/{requiredComps.length} competencies rated
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate" value={progress}
          sx={{
            height:6, borderRadius:3,
            backgroundColor:'#E4E8F0',
            '& .MuiLinearProgress-bar': {
              borderRadius:3,
              background: progress===100
                ? 'linear-gradient(90deg,#1B8A4E,#27AE60)'
                : 'linear-gradient(90deg,#CC0000,#FF4444)'
            }
          }}
        />
      </Box>

      {clusters.map(cluster => {
        const active = cluster.competencies.filter(c => activityMatrix[roundId].includes(c.id));
        if (!active.length) return null;
        return (
          <Box key={cluster.id} sx={{ mb:3 }}>
            <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:1.5 }}>
              <Typography sx={{ fontSize:'1rem' }}>{cluster.icon}</Typography>
              <Typography variant="subtitle2" sx={{
                color:'#1A1A2E', fontWeight:700, textTransform:'uppercase',
                letterSpacing:0.8, fontSize:'0.72rem'
              }}>
                {cluster.title}
              </Typography>
              <Box sx={{ flex:1, height:'1px', backgroundColor:'#E4E8F0', ml:1 }} />
            </Box>

            {active.map(comp => (
              <Box key={comp.id} sx={{
                mb:2, p:2, borderRadius:2,
                border: errors[comp.id] ? '1px solid #FFCDD2' : '1px solid #F0F2F8',
                backgroundColor: errors[comp.id] ? '#FFF5F5' : '#FAFBFD',
                transition:'all 0.2s',
                '&:hover': { borderColor:'#E4E8F0', backgroundColor:'#F5F7FF' }
              }}>
                <Typography variant="body2" sx={{ fontWeight:600, color:'#1A1A2E', mb:0.5 }}>
                  {comp.label}
                </Typography>
                <Controller
                  name={comp.id} control={control}
                  render={({ field }) => (
                    <ScoreButton
                      value={field.value}
                      onChange={v => field.onChange(v)}
                      error={!!errors[comp.id]}
                    />
                  )}
                />
                {errors[comp.id] && (
                  <Typography variant="caption" color="error" sx={{ mt:0.5, display:'block' }}>
                    {errors[comp.id]?.message}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        );
      })}

      {/* Remarks */}
      <Box sx={{ mt:1, mb:2 }}>
        <Typography variant="subtitle2" sx={{ color:'#1A1A2E', fontWeight:700, mb:1 }}>
          Assessor Remarks
        </Typography>
        <Controller
          name="comments" control={control}
          render={({ field }) => (
            <TextField
              {...field} multiline rows={3} variant="outlined" fullWidth
              placeholder="Provide observations, behavioral evidence, and overall assessment notes..."
              error={!!errors.comments} helperText={errors.comments?.message}
            />
          )}
        />
      </Box>

      <Button
        type="submit" variant="contained" fullWidth size="large"
        startIcon={isCompleted ? <AssignmentTurnedIn /> : <CheckCircle />}
        sx={{
          background: isCompleted
            ? 'linear-gradient(135deg,#1B8A4E,#27AE60)'
            : 'linear-gradient(135deg,#CC0000,#FF3333)',
          '&:hover': {
            background: isCompleted
              ? 'linear-gradient(135deg,#166B3C,#1B8A4E)'
              : 'linear-gradient(135deg,#990000,#CC0000)',
          },
          py:1.5, fontSize:'0.95rem'
        }}
      >
        {isCompleted ? 'Update Round Scores' : 'Save Round Scores'}
      </Button>
    </Box>
  );
};

// ─── CANDIDATE AVATAR ────────────────────────────────────────────────────────
const CandidateAvatar = ({ name, size=36 }) => {
  const initials = name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() || '?';
  const hue = (name?.charCodeAt(0) || 0) * 37 % 360;
  return (
    <Avatar sx={{ width:size, height:size, background:`hsl(${hue},55%,40%)`, fontSize: size*0.38, fontWeight:700 }}>
      {initials}
    </Avatar>
  );
};

// ─── MAIN APP ────────────────────────────────────────────────────────────────
function App() {
  const[candidatesData,    setCandidatesData]    = useState([]);
  const [assessorName,      setAssessorName]      = useState('');
  const [sidebarCandidates, setSidebarCandidates] = useState([]);
  const[activeCandidateId, setActiveCandidateId] = useState(null);
  const [pendingCandidate,  setPendingCandidate]  = useState(null);
  const [expandedRound,     setExpandedRound]     = useState(false);
  const [snackbar,          setSnackbar]          = useState({ open: false, message: '', severity: 'success' });
  const [resourcesOpen,     setResourcesOpen]     = useState(false);

  useEffect(() => {
    fetch('/candidates.BAFL.csv')
      .then(r => r.text())
      .then(csv => Papa.parse(csv, { header:true, skipEmptyLines:true, complete:r => setCandidatesData(r.data) }))
      .catch(e => console.error('CSV load error:', e));
  },[]);

  const handleConfirmAdd = () => {
    if (!pendingCandidate) return;
    if (!sidebarCandidates.find(c => c.id === pendingCandidate.id)) {
      setSidebarCandidates(prev =>[...prev, { ...pendingCandidate, completedRounds:[], scores:{}, submitted: false }]);
    }
    setActiveCandidateId(pendingCandidate.id);
    setPendingCandidate(null);
    setExpandedRound(false);
  };

  const handleRemoveCandidate = (e, id) => {
    e.stopPropagation();
    const updated = sidebarCandidates.filter(c => c.id !== id);
    setSidebarCandidates(updated);
    if (activeCandidateId === id) setActiveCandidateId(updated[0]?.id || null);
  };

  const handleSaveRound = (roundId, data) => {
    setSidebarCandidates(prev => prev.map(c => {
      if (c.id !== activeCandidateId) return c;
      const updatedRounds = c.completedRounds.includes(roundId)
        ? c.completedRounds : [...c.completedRounds, roundId];
      return { ...c, completedRounds:updatedRounds, scores:{ ...c.scores, [roundId]:data } };
    }));
  };

  // Auto-save handler updates the draft scores without marking the round as completed
  const handleAutoSave = useCallback((candId, roundId, data) => {
    setSidebarCandidates(prev => prev.map(c => {
      if (c.id !== candId) return c;
      return { ...c, scores: { ...c.scores, [roundId]: data } };
    }));
  },[]);

  const handleSubmitResults = async (candId) => {
    const cand = sidebarCandidates.find(c => c.id === candId);
    
    if (!assessorName) {
      setSnackbar({ open: true, message: 'Please enter your Assessor Name at the top before submitting.', severity: 'error' });
      return;
    }

    try {
      // 1. Send data to our Node.js backend
      const response = await fetch('https://bafl-assessor-form-backend.onrender.com/api/submit-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessorName: assessorName,
          candidate: cand
        })
      });

      const result = await response.json();

      if (result.success) {
        // 2. Mark as submitted in the UI
        setSidebarCandidates(prev => prev.map(c =>
          c.id === candId ? { ...c, submitted: true } : c
        ));
        setSnackbar({ open: true, message: `Results successfully submitted for ${cand.name}!`, severity: 'success' });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Submission failed:", error);
      setSnackbar({ open: true, message: 'Failed to submit results. Please check your connection.', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  const activeCandidate = sidebarCandidates.find(c => c.id === activeCandidateId);
  const totalCompleted  = sidebarCandidates.reduce((s,c) => s + c.completedRounds.length, 0);

  return (
    <ThemeProvider theme={baflTheme}>
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');`}</style>

      <Box sx={{ display:'flex', minHeight:'100vh', backgroundColor:'background.default' }}>

        {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth, flexShrink:0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth, boxSizing:'border-box',
              background:'linear-gradient(180deg,#1A1A2E 0%,#16213E 60%,#0F3460 100%)',
              color:'white', borderRight:'none',
              boxShadow:'4px 0 24px rgba(0,0,0,0.18)'
            }
          }}
        >
          {/* Sidebar Header */}
          <Box sx={{ p:3, borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
            <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:2 }}>
              <Box sx={{
                width:36, height:36, borderRadius:2,
                background:'linear-gradient(135deg,#CC0000,#FF4444)',
                display:'flex', alignItems:'center', justifyContent:'center'
              }}>
                <AccountBalance sx={{ fontSize:20, color:'#fff' }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight:800, color:'#fff', lineHeight:1.1 }}>
                  Assessment Center
                </Typography>
                <Typography variant="caption" sx={{ color:'rgba(255,255,255,0.5)', fontSize:'0.65rem' }}>
                  Bank Alfalah Limited
                </Typography>
              </Box>
            </Box>

            {/* Stats */}
            <Box sx={{ display:'flex', gap:1 }}>
              {[
                { label:'Candidates', value: sidebarCandidates.length },
                { label:'Rounds Done',  value: totalCompleted }
              ].map(s => (
                <Box key={s.label} sx={{
                  flex:1, p:1.5, borderRadius:2,
                  backgroundColor:'rgba(255,255,255,0.06)',
                  textAlign:'center', border:'1px solid rgba(255,255,255,0.06)'
                }}>
                  <Typography variant="h6" sx={{ fontWeight:800, color:'#CC0000', lineHeight:1 }}>{s.value}</Typography>
                  <Typography variant="caption" sx={{ color:'rgba(255,255,255,0.5)', fontSize:'0.62rem' }}>{s.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Candidate List */}
          <Box sx={{ px:2, pt:2, pb:1 }}>
            <Typography variant="overline" sx={{ color:'rgba(255,255,255,0.35)', letterSpacing:2 }}>
              Active Candidates
            </Typography>
          </Box>

          <List sx={{ px:1.5, flex:1, overflowY:'auto' }}>
            {sidebarCandidates.length === 0 ? (
              <Box sx={{ px:1, py:3, textAlign:'center' }}>
                <PersonSearch sx={{ fontSize:36, color:'rgba(255,255,255,0.15)', mb:1 }} />
                <Typography variant="body2" sx={{ color:'rgba(255,255,255,0.35)', fontSize:'0.8rem', lineHeight:1.5 }}>
                  Search and confirm candidates to begin scoring
                </Typography>
              </Box>
            ) : sidebarCandidates.map(cand => {
              const isActive  = activeCandidateId === cand.id;
              const pct       = Math.round((cand.completedRounds.length / rounds.length) * 100);
              const isSubmitted = cand.submitted;
              
              return (
                <ListItem
                  key={cand.id} disablePadding
                  secondaryAction={
                    <Tooltip title="Remove candidate" placement="right">
                      <IconButton size="small" onClick={e => handleRemoveCandidate(e, cand.id)}
                        sx={{
                          color:'rgba(255,255,255,0.25)',
                          backgroundColor:'rgba(255,255,255,0.04)',
                          border:'1px solid rgba(255,255,255,0.08)',
                          borderRadius:1.5,
                          '&:hover':{ color:'#fff', backgroundColor:'#CC0000', borderColor:'#CC0000' },
                          transition:'all 0.18s'
                        }}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  }
                  sx={{ mb: 1 }}
                >
                  <Box 
                    onClick={() => setActiveCandidateId(cand.id)}
                    sx={{ 
                      display:'flex', alignItems:'center', gap:1.5, py:0.5, px:1.5, 
                      width:'calc(100% - 56px)', cursor:'pointer', borderRadius:2,
                      backgroundColor: isActive ? 'rgba(204,0,0,0.18)' : 'transparent',
                      border: isActive ? '1px solid rgba(204,0,0,0.4)' : '1px solid transparent',
                      '&:hover': { backgroundColor:'rgba(255,255,255,0.05)' },
                      transition:'all 0.2s'
                    }}
                  >
                    <CandidateAvatar name={cand.name} size={34} />
                    <Box sx={{ flex:1, minWidth:0 }}>
                      <Typography variant="body2" sx={{
                        fontWeight: isActive ? 700 : 500, color: isSubmitted ? '#27AE60' : '#fff',
                        whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', fontSize:'0.82rem',
                        display: 'flex', alignItems: 'center', gap: 0.5
                      }}>
                        {cand.name}
                        {isSubmitted && <CheckCircle sx={{ fontSize: 14 }} />}
                      </Typography>
                      <Box sx={{ display:'flex', alignItems:'center', gap:0.5, mt:0.5 }}>
                        <LinearProgress variant="determinate" value={pct} sx={{
                          flex:1, height:3, borderRadius:2,
                          backgroundColor:'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius:2,
                            backgroundColor: pct===100 ? '#27AE60' : '#CC0000'
                          }
                        }} />
                        <Typography variant="caption" sx={{ color:'rgba(255,255,255,0.4)', fontSize:'0.6rem', whiteSpace:'nowrap' }}>
                          {cand.completedRounds.length}/{rounds.length}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </ListItem>
              );
            })}
          </List>

          {/* ── PDF RESOURCES SECTION ───────────────────────────────────── */}
          <Box sx={{ borderTop:'1px solid rgba(255,255,255,0.08)' }}>
            {/* Toggle Header */}
            <Box
              onClick={() => setResourcesOpen(prev => !prev)}
              sx={{
                display:'flex', alignItems:'center', gap:1.5,
                px:2.5, py:1.5, cursor:'pointer',
                '&:hover': { backgroundColor:'rgba(255,255,255,0.04)' },
                transition:'background 0.18s'
              }}
            >
              <Box sx={{
                width:28, height:28, borderRadius:1.5,
                background:'linear-gradient(135deg,#CC0000,#FF4444)',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
              }}>
                <FolderOpen sx={{ fontSize:15, color:'#fff' }} />
              </Box>
              <Typography variant="caption" sx={{
                color:'rgba(255,255,255,0.7)', fontWeight:700,
                textTransform:'uppercase', letterSpacing:1.2, fontSize:'0.65rem', flex:1
              }}>
                Resources
              </Typography>
              {resourcesOpen
                ? <ExpandLess sx={{ fontSize:16, color:'rgba(255,255,255,0.4)' }} />
                : <ExpandMore  sx={{ fontSize:16, color:'rgba(255,255,255,0.4)' }} />
              }
            </Box>

            {/* Collapsible PDF List */}
            <Collapse in={resourcesOpen}>
              <Box sx={{ px:1.5, pb:1.5, maxHeight:260, overflowY:'auto',
                '&::-webkit-scrollbar': { width:4 },
                '&::-webkit-scrollbar-track': { background:'transparent' },
                '&::-webkit-scrollbar-thumb': { background:'rgba(255,255,255,0.12)', borderRadius:2 },
              }}>
                {pdfResources.map((pdf, idx) => (
                  <Box
                    key={idx}
                    component="a"
                    href={`/${pdf.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      display:'flex', alignItems:'center', gap:1.5,
                      px:1.5, py:1, borderRadius:2, mb:0.5,
                      textDecoration:'none',
                      border:'1px solid rgba(255,255,255,0.05)',
                      backgroundColor:'rgba(255,255,255,0.03)',
                      transition:'all 0.18s',
                      '&:hover': {
                        backgroundColor:'rgba(204,0,0,0.15)',
                        borderColor:'rgba(204,0,0,0.35)',
                        transform:'translateX(2px)'
                      }
                    }}
                  >
                    <PictureAsPdf sx={{ fontSize:15, color:'#FF6666', flexShrink:0 }} />
                    <Typography variant="caption" sx={{
                      color:'rgba(255,255,255,0.65)', fontSize:'0.72rem',
                      lineHeight:1.35, fontWeight:500,
                      overflow:'hidden', display:'-webkit-box',
                      WebkitLineClamp:2, WebkitBoxOrient:'vertical'
                    }}>
                      {pdf.name}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Collapse>
          </Box>

          {/* Sidebar Footer */}
          <Box sx={{ p:2, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
            <Typography variant="caption" sx={{ color:'rgba(255,255,255,0.2)', fontSize:'0.62rem', display:'block', textAlign:'center' }}>
              Powered by Carnelian 
            </Typography>
          </Box>
        </Drawer>

        {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
        <Box component="main" sx={{ flexGrow:1, display:'flex', flexDirection:'column', minHeight:'100vh' }}>

          {/* Top AppBar */}
          <AppBar position="static" elevation={0} sx={{
            backgroundColor:'#fff',
            borderBottom:'3px solid #CC0000',
            boxShadow:'0 2px 12px rgba(0,0,0,0.06)'
          }}>
            <Toolbar sx={{ py:1, gap:2 }}>
              {/* Bank Logo placeholder — replace /bafl.png with actual */}
              <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                <Box component="img"
                  src="/bafl.png"
                  onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                  alt="Bank Alfalah" sx={{ height:44, objectFit:'contain' }}
                />
                {/* Fallback if logo missing */}
                <Box sx={{
                  display:'none', alignItems:'center', gap:1,
                  background:'linear-gradient(135deg,#CC0000,#FF4444)',
                  borderRadius:2, px:1.5, py:0.75
                }}>
                  <AccountBalance sx={{ color:'#fff', fontSize:22 }} />
                  <Box>
                    <Typography sx={{ color:'#fff', fontWeight:800, fontSize:'0.8rem', lineHeight:1 }}>Bank</Typography>
                    <Typography sx={{ color:'#fff', fontWeight:800, fontSize:'0.9rem', lineHeight:1 }}>Alfalah</Typography>
                  </Box>
                </Box>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ mx:1 }} />

              <Box>
                <Typography variant="subtitle1" sx={{ color:'#1A1A2E', fontWeight:700, lineHeight:1.2 }}>
                  Assessment Center
                </Typography>
                <Typography variant="caption" sx={{ color:'#5A6475', fontSize:'0.7rem' }}>
                  Graduate Recruitment Program 2026
                </Typography>
              </Box>

              <Box sx={{ flex:1 }} />

              {assessorName && (
                <Box sx={{
                  display:'flex', alignItems:'center', gap:1,
                  backgroundColor:'#F5F6FA', borderRadius:3, px:2, py:0.75,
                  border:'1px solid #E4E8F0'
                }}>
                  <CandidateAvatar name={assessorName} size={28} />
                  <Box>
                    <Typography variant="caption" sx={{ color:'#5A6475', display:'block', lineHeight:1, fontSize:'0.62rem' }}>ASSESSOR</Typography>
                    <Typography variant="body2" sx={{ color:'#1A1A2E', fontWeight:600, lineHeight:1.2, fontSize:'0.82rem' }}>
                      {assessorName}
                    </Typography>
                  </Box>
                </Box>
              )}

              <Box sx={{ display:{xs:'none',sm:'flex'}, flexDirection:'column', alignItems:'flex-end' }}>
                <Typography variant="caption" sx={{ color:'#1A1A2E', fontWeight:700, lineHeight:1.1, fontSize:'0.62rem' }}>
                  Convey Meaning.
                </Typography>
                <Typography variant="caption" sx={{ color:'#CC0000', fontWeight:700, lineHeight:1.1, fontSize:'0.62rem' }}>
                  Create Significance.
                </Typography>
              </Box>
              <Box component="img" src="/logo.png" alt="Carnelian" sx={{ height:36, objectFit:'contain' }} />
            </Toolbar>
          </AppBar>

          {/* ── Page Body ── */}
          <Box sx={{ flex:1, py:4, px:{xs:2,md:4}, backgroundColor:'#F5F6FA' }}>

            {/* Search & Assessor Panel */}
            <Paper elevation={0} sx={{
              mb:4, overflow:'hidden',
              border:'1px solid #E4E8F0',
              boxShadow:'0 2px 16px rgba(0,0,0,0.04)'
            }}>
              {/* Red accent bar */}
              <Box sx={{ height:4, background:'linear-gradient(90deg,#CC0000 0%,#FF6666 50%,#CC0000 100%)' }} />
              <Box sx={{ p:3 }}>
                <Typography variant="overline" sx={{ color:'#CC0000', mb:2, display:'block' }}>
                  Session Setup
                </Typography>
                <Box sx={{ display:'flex', gap:2.5, flexDirection:{xs:'column',sm:'row'} }}>

                  <TextField
                    label="Assessor Name" variant="outlined" value={assessorName}
                    onChange={e => setAssessorName(e.target.value)}
                    placeholder="Enter your full name"
                    InputProps={{ startAdornment:<Person sx={{ color:'#5A6475', mr:1, fontSize:20 }} /> }}
                    sx={{ flex:1 }}
                  />

                  <Box sx={{ display:'flex', flexDirection:'column', gap:1.5, flex:2 }}>
                    <Box sx={{ display:'flex', gap:1.5 }}>
                      <Autocomplete
                        options={candidatesData}
                        getOptionLabel={o => `${o.name} — ${o.cnic}`}
                        value={pendingCandidate}
                        onChange={(_, v) => setPendingCandidate(v)}
                        sx={{ flexGrow:1 }}
                        renderOption={(props, option) => (
                          <Box component="li" {...props} key={option.id}>
                            <Box>
                              <Typography variant="body2" fontWeight={700}>{option.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.cnic} &nbsp;·&nbsp; {option.university} &nbsp;·&nbsp; {option['City for Acs'] || option.city}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                        renderInput={params => (
                          <TextField {...params} label="Search Candidate" variant="outlined" />
                        )}
                      />
                      <Button
                        variant="contained" disabled={!pendingCandidate}
                        onClick={handleConfirmAdd}
                        endIcon={<KeyboardArrowRight />}
                        sx={{ px:3, whiteSpace:'nowrap',
                          background:'linear-gradient(135deg,#CC0000,#FF3333)',
                          '&:hover': { background:'linear-gradient(135deg,#990000,#CC0000)' },
                          '&.Mui-disabled': { background:'#E4E8F0', color:'#9EA8B8', boxShadow:'none' }
                        }}
                      >
                        Add Candidate
                      </Button>
                    </Box>

                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* ── Main Grading Area ── */}
            {!activeCandidate ? (
              <Box sx={{
                textAlign:'center', py:12,
                display:'flex', flexDirection:'column', alignItems:'center', gap:2
              }}>
                <Box sx={{
                  width:80, height:80, borderRadius:'50%',
                  background:'linear-gradient(135deg,#CC000015,#CC000005)',
                  border:'2px dashed #CC000040',
                  display:'flex', alignItems:'center', justifyContent:'center', mb:1
                }}>
                  <AccountBalance sx={{ fontSize:36, color:'#CC000060' }} />
                </Box>
                <Typography variant="h5" sx={{ color:'#1A1A2E', fontWeight:700 }}>
                  Welcome to the Assessment Center
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth:400 }}>
                  Enter your assessor name, search for a candidate, and click <b>Add Candidate</b> to begin scoring.
                </Typography>
              </Box>
            ) : (
              <Box>
                {/* Candidate Header Card */}
                <Paper elevation={0} sx={{
                  mb:3, overflow:'hidden',
                  border:'1px solid #E4E8F0',
                  boxShadow:'0 2px 16px rgba(0,0,0,0.04)'
                }}>
                  <Box sx={{
                    p:3, display:'flex', alignItems:'center', gap:3,
                    background:'linear-gradient(135deg,#1A1A2E 0%,#16213E 100%)',
                    flexWrap:'wrap'
                  }}>
                    <CandidateAvatar name={activeCandidate.name} size={56} />
                    <Box sx={{ flex:1 }}>
                      <Typography variant="h5" sx={{ color:'#fff', fontWeight:700, mb:0.5 }}>
                        {activeCandidate.name}
                      </Typography>
                      <Box sx={{ display:'flex', gap:3, flexWrap:'wrap' }}>
                        {[
                          { icon:<Badge sx={{fontSize:14}}/>, label: activeCandidate.cnic },
                          { icon:<School sx={{fontSize:14}}/>, label: activeCandidate.university },
                          { icon:<LocationOn sx={{fontSize:14}}/>, label: activeCandidate['City for Acs'] || activeCandidate.city },
                        ].filter(i => i.label).map((item, idx) => (
                          <Box key={idx} sx={{ display:'flex', alignItems:'center', gap:0.5, color:'rgba(255,255,255,0.55)' }}>
                            {item.icon}
                            <Typography variant="caption" sx={{ fontSize:'0.78rem' }}>{item.label}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>

                    {/* Round completion pills */}
                    <Box sx={{ display:'flex', gap:1, flexWrap:'wrap' }}>
                      {rounds.map(r => {
                        const done = activeCandidate.completedRounds.includes(r.id);
                        return (
                          <Chip key={r.id} label={r.title} size="small"
                            icon={done ? <CheckCircle sx={{ fontSize:'14px !important', color:'#27AE60 !important' }} /> : undefined}
                            sx={{
                              backgroundColor: done ? 'rgba(27,138,78,0.2)' : 'rgba(255,255,255,0.08)',
                              color: done ? '#6FCFA0' : 'rgba(255,255,255,0.45)',
                              border: done ? '1px solid rgba(27,138,78,0.4)' : '1px solid rgba(255,255,255,0.1)',
                              fontSize:'0.7rem', fontWeight:600
                            }}
                          />
                        );
                      })}
                    </Box>
                  </Box>

                  {/* Completion progress strip */}
                  <Box sx={{ px:3, py:1.5, backgroundColor:'#F9FAFB', borderTop:'1px solid #E4E8F0', display:'flex', alignItems:'center', gap:2 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Overall Completion
                    </Typography>
                    <LinearProgress variant="determinate"
                      value={Math.round((activeCandidate.completedRounds.length / rounds.length)*100)}
                      sx={{
                        flex:1, height:6, borderRadius:3,
                        backgroundColor:'#E4E8F0',
                        '& .MuiLinearProgress-bar': {
                          borderRadius:3,
                          background: activeCandidate.completedRounds.length === rounds.length
                            ? 'linear-gradient(90deg,#1B8A4E,#27AE60)'
                            : 'linear-gradient(90deg,#CC0000,#FF4444)'
                        }
                      }}
                    />
                    <Typography variant="caption" sx={{
                      fontWeight:700,
                      color: activeCandidate.completedRounds.length === rounds.length ? '#1B8A4E' : '#CC0000'
                    }}>
                      {activeCandidate.completedRounds.length}/{rounds.length} Rounds
                    </Typography>
                  </Box>
                </Paper>

                {/* Round Accordions */}
                {rounds.map(round => {
                  const done = activeCandidate.completedRounds.includes(round.id);
                  return (
                    <Accordion
                      key={round.id}
                      expanded={expandedRound === round.id}
                      onChange={(_, exp) => setExpandedRound(exp ? round.id : false)}
                      elevation={0}
                      sx={{
                        mb:2,
                        border: done ? '1px solid rgba(27,138,78,0.3)' : '1px solid #E4E8F0',
                        boxShadow: done
                          ? '0 2px 12px rgba(27,138,78,0.06)'
                          : '0 2px 12px rgba(0,0,0,0.03)',
                        '&.Mui-expanded': { boxShadow:'0 4px 24px rgba(0,0,0,0.08)' }
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMore sx={{ color: done ? '#1B8A4E' : '#5A6475' }} />}
                        sx={{
                          backgroundColor: done ? '#F0FBF5' : '#FAFBFD',
                          px:3, py:0.5,
                          '&.Mui-expanded': { borderBottom:'1px solid #E4E8F0' }
                        }}
                      >
                        <Box sx={{ display:'flex', alignItems:'center', gap:2, width:'100%', py:0.5 }}>
                          <Box sx={{
                            width:40, height:40, borderRadius:2,
                            backgroundColor: done ? 'rgba(27,138,78,0.12)' : `${round.color}12`,
                            border: done ? '1px solid rgba(27,138,78,0.25)' : `1px solid ${round.color}30`,
                            display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem'
                          }}>
                            {round.icon}
                          </Box>
                          <Box sx={{ flex:1 }}>
                            <Typography variant="subtitle1" sx={{
                              color: done ? '#1B8A4E' : '#1A1A2E',
                              fontWeight:700, lineHeight:1.2
                            }}>
                              {round.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color:'#5A6475', fontSize:'0.7rem' }}>
                              {activityMatrix[round.id].length} competencies to score
                            </Typography>
                          </Box>
                          {done && (
                            <Chip label="Completed" size="small"
                              icon={<CheckCircle sx={{ fontSize:'13px !important' }} />}
                              sx={{
                                backgroundColor:'rgba(27,138,78,0.12)',
                                color:'#1B8A4E', border:'1px solid rgba(27,138,78,0.3)',
                                fontSize:'0.7rem', fontWeight:700
                              }}
                            />
                          )}
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p:3, backgroundColor:'#fff' }} TransitionProps={{ unmountOnExit: false }}>
                        <RoundForm
                          key={`${activeCandidate.id}-${round.id}`}
                          roundId={round.id}
                          candidateId={activeCandidate.id}
                          isCompleted={done}
                          onSave={handleSaveRound}
                          onAutoSave={handleAutoSave}
                          savedData={activeCandidate.scores?.[round.id] || null}
                        />
                      </AccordionDetails>
                    </Accordion>
                  );
                })}

                {/* Submit Results Button (Appears only when all rounds are done) */}
                {activeCandidate.completedRounds.length === rounds.length && (
                  <Box sx={{ 
                    mt: 3, p: 3, backgroundColor: '#fff', borderRadius: 3, 
                    border: '1px solid #E4E8F0', display: 'flex', alignItems: 'center', 
                    justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
                    flexDirection: { xs: 'column', sm: 'row' }, gap: 2
                  }}>
                    <Box>
                      <Typography variant="h6" sx={{ color: '#1A1A2E', mb: 0.5 }}>All Rounds Completed</Typography>
                      <Typography variant="body2" color="text.secondary">
                        You have successfully scored all competencies for this candidate.
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      size="large"
                      disabled={activeCandidate.submitted}
                      onClick={() => handleSubmitResults(activeCandidate.id)}
                      startIcon={activeCandidate.submitted ? <CheckCircle /> : <AssignmentTurnedIn />}
                      sx={{
                        background: activeCandidate.submitted ? '#E4E8F0' : 'linear-gradient(135deg,#1B8A4E,#27AE60)',
                        color: activeCandidate.submitted ? '#9EA8B8' : '#fff',
                        px: 4, py: 1.5, whiteSpace: 'nowrap',
                        '&:hover': {
                          background: activeCandidate.submitted ? '#E4E8F0' : 'linear-gradient(135deg,#166B3C,#1B8A4E)'
                        }
                      }}
                    >
                      {activeCandidate.submitted ? 'Results Submitted' : 'Submit Results'}
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Global Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;