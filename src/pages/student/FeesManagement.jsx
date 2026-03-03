import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Button, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    IconButton, Chip, MenuItem, Grid, FormControl, InputLabel, Select,
    Tooltip, Alert, CircularProgress, Tabs, Tab, Divider
} from '@mui/material';
import { Add, Edit, Delete, Payment, Receipt, Assessment, Download } from '@mui/icons-material';

// ─── Paid Slip PDF Generator ───────────────────────────────────────────────
const downloadPaidSlip = (fee) => {
    const institutionName = 'BY8labs';
    const slip = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Fee Receipt - ${fee.receiptNumber || 'N/A'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1a1a1a; padding: 40px; }
    .container { max-width: 700px; margin: 0 auto; border: 2px solid #10b981; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #10b981, #059669); color: #fff; padding: 28px 32px; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { font-size: 22px; font-weight: 800; letter-spacing: 0.5px; }
    .header .badge { background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; }
    .receipt-label { text-align: center; padding: 10px; background: #f0fdf4; color: #065f46; font-size: 15px; font-weight: 700; letter-spacing: 2px; border-bottom: 1px solid #d1fae5; text-transform: uppercase; }
    .body { padding: 28px 32px; }
    .section-title { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; margin-top: 20px; }
    .row { display: flex; border-bottom: 1px solid #f3f4f6; padding: 9px 0; }
    .row:last-child { border-bottom: none; }
    .label { width: 200px; color: #6b7280; font-size: 13px; }
    .value { flex: 1; font-weight: 600; font-size: 13px; color: #111827; }
    .amount-box { background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 2px solid #10b981; border-radius: 10px; padding: 20px 32px; margin: 24px 0; display: flex; justify-content: space-between; align-items: center; }
    .amount-box .paid-label { font-size: 14px; color: #065f46; font-weight: 600; }
    .amount-box .paid-value { font-size: 28px; font-weight: 900; color: #059669; }
    .status-badge { display: inline-block; padding: 5px 18px; border-radius: 20px; font-size: 13px; font-weight: 700; }
    .status-Paid { background: #d1fae5; color: #065f46; }
    .status-Partial { background: #dbeafe; color: #1e3a8a; }
    .footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 18px 32px; display: flex; justify-content: space-between; align-items: flex-end; }
    .footer .note { font-size: 11px; color: #9ca3af; max-width: 320px; }
    .signature-box { text-align: center; }
    .signature-line { border-top: 1.5px solid #374151; width: 150px; margin: 0 auto 5px; }
    .signature-label { font-size: 11px; color: #6b7280; }
    @media print {
      body { padding: 0; }
      .container { border: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1>🎓 ${institutionName}</h1>
        <div style="font-size:12px; opacity:0.85; margin-top:4px;">Official Fee Payment Receipt</div>
      </div>
      <div class="badge">${fee.receiptNumber || 'RECEIPT'}</div>
    </div>
    <div class="receipt-label">Payment Receipt</div>
    <div class="body">
      <div class="section-title">Student Information</div>
      <div class="row"><span class="label">Student Name</span><span class="value">${fee.student?.name || '—'}</span></div>
      <div class="row"><span class="label">Student ID</span><span class="value">${fee.student?.studentId || '—'}</span></div>
      <div class="row"><span class="label">Course</span><span class="value">${fee.course?.courseName || '—'}</span></div>

      <div class="section-title">Fee Details</div>
      <div class="row"><span class="label">Fee Type</span><span class="value">${fee.feeType}</span></div>
      <div class="row"><span class="label">Total Fee Amount</span><span class="value">₹${fee.amount?.toLocaleString('en-IN')}</span></div>
      <div class="row"><span class="label">Amount Paid</span><span class="value">₹${fee.paidAmount?.toLocaleString('en-IN')}</span></div>
      <div class="row"><span class="label">Balance Due</span><span class="value" style="color:${(fee.amount - fee.paidAmount) > 0 ? '#dc2626' : '#059669'};">
        ₹${(fee.amount - fee.paidAmount).toLocaleString('en-IN')}
      </span></div>
      <div class="row"><span class="label">Due Date</span><span class="value">${fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}</span></div>
      <div class="row"><span class="label">Payment Date</span><span class="value">${fee.paidDate ? new Date(fee.paidDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}</span></div>
      <div class="row"><span class="label">Payment Mode</span><span class="value">${fee.paymentMode || '—'}</span></div>
      <div class="row"><span class="label">Status</span><span class="value"><span class="status-badge status-${fee.status}">${fee.status}</span></span></div>
      ${fee.notes ? `<div class="row"><span class="label">Notes</span><span class="value">${fee.notes}</span></div>` : ''}

      <div class="amount-box">
        <div>
          <div class="paid-label">Total Amount Paid</div>
          <div style="font-size:11px; color:#6b7280; margin-top:2px;">Receipt No: ${fee.receiptNumber || 'N/A'}</div>
        </div>
        <div class="paid-value">₹${fee.paidAmount?.toLocaleString('en-IN')}</div>
      </div>
    </div>
    <div class="footer">
      <div class="note">This is a computer-generated receipt and does not require a physical signature. Please retain this for your records.</div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">Authorized Signatory</div>
      </div>
    </div>
  </div>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=800,height=700');
    win.document.write(slip);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
};

const API = 'https://by8labs-backend.onrender.com/api';
const getToken = () => localStorage.getItem('token');
const headers = () => ({ Authorization: `Bearer ${getToken()}` });

const STATUS_COLOR = { Paid: 'success', Pending: 'warning', Partial: 'info', Overdue: 'error' };
const FEE_TYPES = ['Tuition', 'Lab', 'Exam', 'Library', 'Sports', 'Transport', 'Hostel', 'Other'];
const PAY_MODES = ['Cash', 'Online', 'Cheque', 'DD'];

export default function FeesManagement() {
    const [fees, setFees] = useState([]);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [pending, setPending] = useState({ records: [], totalPending: 0 });
    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [payDialog, setPayDialog] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState(null);
    const [form, setForm] = useState({ student: '', course: '', feeType: 'Tuition', amount: '', dueDate: '', notes: '' });
    const [payForm, setPayForm] = useState({ paidAmount: '', paymentMode: 'Cash', notes: '' });
    const [filterStatus, setFilterStatus] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get(`${API}/students?limit=200`, { headers: headers() }).then(r => setStudents(r.data.students || []));
        axios.get(`${API}/student-courses`, { headers: headers() }).then(r => setCourses(r.data || []));
    }, []);

    useEffect(() => { fetchFees(); }, [filterStatus]);
    useEffect(() => { if (tab === 1) fetchPending(); }, [tab]);

    const fetchFees = async () => {
        setLoading(true);
        const params = {};
        if (filterStatus) params.status = filterStatus;
        const res = await axios.get(`${API}/student-fees`, { headers: headers(), params });
        setFees(res.data || []);
        setLoading(false);
    };

    const fetchPending = async () => {
        const res = await axios.get(`${API}/student-fees/pending/summary`, { headers: headers() });
        setPending(res.data || { records: [], totalPending: 0 });
    };

    const handleSave = async () => {
        if (!form.student || !form.amount) { setError('Student and amount are required'); return; }
        try {
            await axios.post(`${API}/student-fees`, form, { headers: headers() });
            setSuccess('Fee record created');
            setDialogOpen(false);
            fetchFees();
        } catch (err) { setError(err.response?.data?.message || 'Save failed'); }
    };

    const handlePay = async () => {
        await axios.put(`${API}/student-fees/${payDialog}/pay`, payForm, { headers: headers() });
        setPayDialog(null);
        setSuccess('Payment recorded');
        fetchFees();
        if (tab === 1) fetchPending();
    };

    const handleDelete = async () => {
        await axios.delete(`${API}/student-fees/${deleteDialog}`, { headers: headers() });
        setDeleteDialog(null);
        setSuccess('Record deleted');
        fetchFees();
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight={700} color="primary.dark">💰 Fees Management</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => { setForm({ student: '', course: '', feeType: 'Tuition', amount: '', dueDate: '', notes: '' }); setDialogOpen(true); setError(''); }}>Create Fee</Button>
            </Box>

            {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
                <Tab label="All Fee Records" />
                <Tab label="Pending Summary" />
                <Tab label="Fee Report" />
            </Tabs>

            {tab === 0 && (
                <Box>
                    <FormControl size="small" sx={{ minWidth: 160, mb: 2 }}>
                        <InputLabel>Filter Status</InputLabel>
                        <Select value={filterStatus} label="Filter Status" onChange={e => setFilterStatus(e.target.value)}>
                            <MenuItem value="">All</MenuItem>
                            {['Pending', 'Paid', 'Partial', 'Overdue'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </Select>
                    </FormControl>
                    {loading ? <CircularProgress /> : (
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow><TableCell>Student</TableCell><TableCell>Fee Type</TableCell><TableCell>Amount</TableCell><TableCell>Paid</TableCell><TableCell>Balance</TableCell><TableCell>Due Date</TableCell><TableCell>Status</TableCell><TableCell>Receipt</TableCell><TableCell align="right">Actions</TableCell></TableRow>
                                </TableHead>
                                <TableBody>
                                    {fees.map(f => (
                                        <TableRow key={f._id} hover>
                                            <TableCell><Typography variant="body2" fontWeight={600}>{f.student?.name}</Typography><Typography variant="caption" color="text.secondary">{f.student?.studentId}</Typography></TableCell>
                                            <TableCell>{f.feeType}</TableCell>
                                            <TableCell>₹{f.amount?.toLocaleString()}</TableCell>
                                            <TableCell>₹{f.paidAmount?.toLocaleString()}</TableCell>
                                            <TableCell sx={{ color: f.amount - f.paidAmount > 0 ? 'error.main' : 'success.main', fontWeight: 600 }}>₹{(f.amount - f.paidAmount).toLocaleString()}</TableCell>
                                            <TableCell>{f.dueDate ? new Date(f.dueDate).toLocaleDateString() : '—'}</TableCell>
                                            <TableCell><Chip label={f.status} size="small" color={STATUS_COLOR[f.status]} /></TableCell>
                                            <TableCell>{f.receiptNumber ? <Chip label={f.receiptNumber} size="small" variant="outlined" icon={<Receipt sx={{ fontSize: '12px !important' }} />} /> : '—'}</TableCell>
                                            <TableCell align="right">
                                                {f.status !== 'Paid' && <Tooltip title="Record Payment"><IconButton size="small" color="success" onClick={() => { setPayDialog(f._id); setPayForm({ paidAmount: '', paymentMode: 'Cash', notes: '' }); }}><Payment fontSize="small" /></IconButton></Tooltip>}
                                                {(f.status === 'Paid' || f.status === 'Partial') && (
                                                    <Tooltip title="Download Paid Slip">
                                                        <IconButton size="small" color="primary" onClick={() => downloadPaidSlip(f)}>
                                                            <Download fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteDialog(f._id)}><Delete fontSize="small" /></IconButton></Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {fees.length === 0 && <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>No fee records</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            )}

            {tab === 1 && (
                <Box>
                    <Paper sx={{ p: 2, mb: 3, background: 'linear-gradient(135deg, #fef2f2 0%, #fff5f5 100%)', border: '1px solid #fecaca' }}>
                        <Typography variant="h6" color="error.main" fontWeight={700}>
                            Total Pending: ₹{pending.totalPending?.toLocaleString()} ({pending.count || 0} records)
                        </Typography>
                    </Paper>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow><TableCell>Student</TableCell><TableCell>Fee Type</TableCell><TableCell>Amount</TableCell><TableCell>Paid</TableCell><TableCell>Balance</TableCell><TableCell>Status</TableCell><TableCell>Action</TableCell></TableRow>
                            </TableHead>
                            <TableBody>
                                {(pending.records || []).map(f => (
                                    <TableRow key={f._id} hover>
                                        <TableCell><Typography variant="body2" fontWeight={600}>{f.student?.name}</Typography><Typography variant="caption">{f.student?.studentId}</Typography></TableCell>
                                        <TableCell>{f.feeType}</TableCell>
                                        <TableCell>₹{f.amount?.toLocaleString()}</TableCell>
                                        <TableCell>₹{f.paidAmount?.toLocaleString()}</TableCell>
                                        <TableCell sx={{ color: 'error.main', fontWeight: 700 }}>₹{(f.amount - f.paidAmount).toLocaleString()}</TableCell>
                                        <TableCell><Chip label={f.status} size="small" color={STATUS_COLOR[f.status]} /></TableCell>
                                        <TableCell><Button size="small" variant="outlined" color="success" startIcon={<Payment />} onClick={() => { setPayDialog(f._id); setPayForm({ paidAmount: '', paymentMode: 'Cash', notes: '' }); }}>Pay</Button></TableCell>
                                    </TableRow>
                                ))}
                                {(pending.records || []).length === 0 && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>🎉 No pending fees!</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {tab === 2 && (
                <Box>
                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Grid container spacing={2}>
                            {['Paid', 'Pending', 'Partial', 'Overdue'].map(s => {
                                const count = fees.filter(f => f.status === s).length;
                                const total = fees.filter(f => f.status === s).reduce((sum, f) => sum + f.amount, 0);
                                return (
                                    <Grid item xs={6} sm={3} key={s}>
                                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: `${STATUS_COLOR[s]}.50` || '#f9fafb' }} variant="outlined">
                                            <Typography variant="h5" fontWeight={700}><Chip label={s} color={STATUS_COLOR[s]} /></Typography>
                                            <Typography variant="h6" fontWeight={700} mt={1}>₹{total.toLocaleString()}</Typography>
                                            <Typography variant="caption" color="text.secondary">{count} records</Typography>
                                        </Paper>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Paper>
                </Box>
            )}

            {/* Create Fee Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle fontWeight={700}>Create Fee Record</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth size="small" required>
                                <InputLabel>Student *</InputLabel>
                                <Select value={form.student} label="Student *" onChange={e => setForm({ ...form, student: e.target.value })}>
                                    {students.map(s => <MenuItem key={s._id} value={s._id}>{s.name} ({s.studentId})</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Fee Type</InputLabel>
                                <Select value={form.feeType} label="Fee Type" onChange={e => setForm({ ...form, feeType: e.target.value })}>
                                    {FEE_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Amount *" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Due Date" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Course</InputLabel>
                                <Select value={form.course} label="Course" onChange={e => setForm({ ...form, course: e.target.value })}>
                                    <MenuItem value="">None</MenuItem>
                                    {courses.map(c => <MenuItem key={c._id} value={c._id}>{c.courseName}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}><TextField fullWidth size="small" label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} multiline rows={2} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>Create</Button>
                </DialogActions>
            </Dialog>

            {/* Pay Dialog */}
            <Dialog open={!!payDialog} onClose={() => setPayDialog(null)}>
                <DialogTitle fontWeight={700}>Record Payment</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}><TextField fullWidth size="small" label="Payment Amount" type="number" value={payForm.paidAmount} onChange={e => setPayForm({ ...payForm, paidAmount: e.target.value })} /></Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Payment Mode</InputLabel>
                                <Select value={payForm.paymentMode} label="Payment Mode" onChange={e => setPayForm({ ...payForm, paymentMode: e.target.value })}>
                                    {PAY_MODES.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}><TextField fullWidth size="small" label="Notes" value={payForm.notes} onChange={e => setPayForm({ ...payForm, notes: e.target.value })} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setPayDialog(null)}>Cancel</Button>
                    <Button variant="contained" color="success" onClick={handlePay}>Record Payment</Button>
                </DialogActions>
            </Dialog>

            {/* Delete */}
            <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
                <DialogTitle>Delete Fee Record?</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
