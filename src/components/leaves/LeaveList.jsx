import React, { useState } from 'react';
import {
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, IconButton, Tooltip, Typography, Box, Dialog, DialogTitle,
    DialogContent, DialogContentText, DialogActions, Button, TextField,
    MenuItem, TablePagination, InputAdornment, FormControl, InputLabel, Select, Grid
} from '@mui/material';
import { Edit, Delete, Visibility, Search } from '@mui/icons-material';

const LeaveList = ({ leaves, onEdit, onDelete, onRefresh, isHR = false, onReview = null }) => {
    const [deleteDialog, setDeleteDialog] = useState({ open: false, leave: null });
    const [reviewDialog, setReviewDialog] = useState({ open: false, leave: null });
    const [reviewData, setReviewData] = useState({ status: 'Approved', reviewComments: '' });
    const [detailDialog, setDetailDialog] = useState({ open: false, leave: null });

    // Search, filter, pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [leaveTypeFilter, setLeaveTypeFilter] = useState('All');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'warning';
            case 'Approved': return 'success';
            case 'Rejected': return 'error';
            case 'Cancelled': return 'default';
            default: return 'default';
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleDeleteClick = (leave) => {
        setDeleteDialog({ open: true, leave });
    };

    const handleDeleteConfirm = async () => {
        try {
            await onDelete(deleteDialog.leave._id);
            setDeleteDialog({ open: false, leave: null });
            onRefresh();
        } catch (error) {
            console.error('Failed to delete leave:', error);
        }
    };

    const handleReviewClick = (leave) => {
        setReviewDialog({ open: true, leave });
        setReviewData({ status: 'Approved', reviewComments: '' });
    };

    const handleReviewSubmit = async () => {
        try {
            await onReview(reviewDialog.leave._id, reviewData);
            setReviewDialog({ open: false, leave: null });
            onRefresh();
        } catch (error) {
            console.error('Failed to review leave:', error);
        }
    };

    const handleViewDetails = (leave) => {
        setDetailDialog({ open: true, leave });
    };

    return (
        <>
            {/* Search & Filter Controls */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth size="small"
                        placeholder={isHR ? 'Search by employee name or subject...' : 'Search by subject...'}
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Leave Type</InputLabel>
                        <Select
                            value={leaveTypeFilter}
                            label="Leave Type"
                            onChange={(e) => { setLeaveTypeFilter(e.target.value); setPage(0); }}
                        >
                            <MenuItem value="All">All Types</MenuItem>
                            <MenuItem value="Casual Leave">Casual Leave</MenuItem>
                            <MenuItem value="Sick Leave">Sick Leave</MenuItem>
                            <MenuItem value="Earned Leave">Earned Leave</MenuItem>
                            <MenuItem value="Emergency Leave">Emergency Leave</MenuItem>
                            <MenuItem value="Maternity Leave">Maternity Leave</MenuItem>
                            <MenuItem value="Paternity Leave">Paternity Leave</MenuItem>
                            <MenuItem value="Unpaid Leave">Unpaid Leave</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {isHR && <TableCell>Employee</TableCell>}
                            <TableCell>Subject</TableCell>
                            <TableCell>Leave Type</TableCell>
                            <TableCell>Start Date</TableCell>
                            <TableCell>End Date</TableCell>
                            <TableCell>Days</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Applied On</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(() => {
                            const filtered = leaves.filter(leave => {
                                const empName = `${leave.employeeId?.firstName || ''} ${leave.employeeId?.lastName || ''}`.toLowerCase();
                                const searchMatch = !searchTerm ||
                                    (leave.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    empName.includes(searchTerm.toLowerCase());
                                const typeMatch = leaveTypeFilter === 'All' || leave.leaveType === leaveTypeFilter;
                                return searchMatch && typeMatch;
                            });
                            const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
                            if (filtered.length === 0) return (
                                <TableRow>
                                    <TableCell colSpan={isHR ? 9 : 8} align="center">
                                        <Typography color="textSecondary">No leave requests found</Typography>
                                    </TableCell>
                                </TableRow>
                            );
                            return paginated.map((leave) => (
                                <TableRow key={leave._id}>
                                    {isHR && (
                                        <TableCell>
                                            {leave.employeeId?.firstName} {leave.employeeId?.lastName}
                                            <br />
                                            <Typography variant="caption" color="textSecondary">
                                                {leave.employeeId?.employeeId}
                                            </Typography>
                                        </TableCell>
                                    )}
                                    <TableCell>{leave.subject}</TableCell>
                                    <TableCell>{leave.leaveType}</TableCell>
                                    <TableCell>{formatDate(leave.startDate)}</TableCell>
                                    <TableCell>{formatDate(leave.endDate)}</TableCell>
                                    <TableCell>{leave.numberOfDays}</TableCell>
                                    <TableCell>
                                        <Chip label={leave.status} color={getStatusColor(leave.status)} size="small" />
                                    </TableCell>
                                    <TableCell>{formatDate(leave.appliedDate)}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Tooltip title="View Details">
                                                <IconButton size="small" onClick={() => handleViewDetails(leave)}>
                                                    <Visibility fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            {!isHR && leave.status === 'Pending' && (
                                                <>
                                                    <Tooltip title="Edit">
                                                        <IconButton size="small" color="primary" onClick={() => onEdit(leave)}>
                                                            <Edit fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(leave)}>
                                                            <Delete fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}
                                            {isHR && leave.status === 'Pending' && (
                                                <Button size="small" variant="contained" onClick={() => handleReviewClick(leave)}>
                                                    Review
                                                </Button>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ));
                        })()}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={leaves.filter(leave => {
                    const empName = `${leave.employeeId?.firstName || ''} ${leave.employeeId?.lastName || ''}`.toLowerCase();
                    const searchMatch = !searchTerm ||
                        (leave.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        empName.includes(searchTerm.toLowerCase());
                    const typeMatch = leaveTypeFilter === 'All' || leave.leaveType === leaveTypeFilter;
                    return searchMatch && typeMatch;
                }).length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, leave: null })}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this leave request? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, leave: null })}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Review Dialog (HR) */}
            {isHR && (
                <Dialog
                    open={reviewDialog.open}
                    onClose={() => setReviewDialog({ open: false, leave: null })}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Review Leave Request</DialogTitle>
                    <DialogContent>
                        {reviewDialog.leave && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Employee: {reviewDialog.leave.employeeId?.firstName} {reviewDialog.leave.employeeId?.lastName}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Subject: {reviewDialog.leave.subject}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Leave Type: {reviewDialog.leave.leaveType}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Duration: {formatDate(reviewDialog.leave.startDate)} to {formatDate(reviewDialog.leave.endDate)} ({reviewDialog.leave.numberOfDays} days)
                                </Typography>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Reason: {reviewDialog.leave.reason}
                                </Typography>
                            </Box>
                        )}

                        <TextField
                            fullWidth
                            select
                            label="Decision"
                            value={reviewData.status}
                            onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                            sx={{ mb: 2 }}
                        >
                            <MenuItem value="Approved">Approve</MenuItem>
                            <MenuItem value="Rejected">Reject</MenuItem>
                        </TextField>

                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Comments"
                            value={reviewData.reviewComments}
                            onChange={(e) => setReviewData({ ...reviewData, reviewComments: e.target.value })}
                            placeholder="Add your comments (optional)"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setReviewDialog({ open: false, leave: null })}>
                            Cancel
                        </Button>
                        <Button onClick={handleReviewSubmit} variant="contained">
                            Submit Review
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            {/* Detail Dialog */}
            <Dialog
                open={detailDialog.open}
                onClose={() => setDetailDialog({ open: false, leave: null })}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Leave Request Details</DialogTitle>
                <DialogContent>
                    {detailDialog.leave && (
                        <Box>
                            {isHR && (
                                <Typography variant="body1" gutterBottom>
                                    <strong>Employee:</strong> {detailDialog.leave.employeeId?.firstName} {detailDialog.leave.employeeId?.lastName} ({detailDialog.leave.employeeId?.employeeId})
                                </Typography>
                            )}
                            <Typography variant="body1" gutterBottom>
                                <strong>Subject:</strong> {detailDialog.leave.subject}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                <strong>Leave Type:</strong> {detailDialog.leave.leaveType}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                <strong>Duration:</strong> {formatDate(detailDialog.leave.startDate)} to {formatDate(detailDialog.leave.endDate)}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                <strong>Number of Days:</strong> {detailDialog.leave.numberOfDays}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                <strong>Reason:</strong> {detailDialog.leave.reason}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                <strong>Status:</strong>{' '}
                                <Chip
                                    label={detailDialog.leave.status}
                                    color={getStatusColor(detailDialog.leave.status)}
                                    size="small"
                                />
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                <strong>Applied On:</strong> {formatDate(detailDialog.leave.appliedDate)}
                            </Typography>
                            {detailDialog.leave.reviewedBy && (
                                <>
                                    <Typography variant="body1" gutterBottom>
                                        <strong>Reviewed By:</strong> {detailDialog.leave.reviewedBy.email}
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        <strong>Reviewed On:</strong> {formatDate(detailDialog.leave.reviewedDate)}
                                    </Typography>
                                </>
                            )}
                            {detailDialog.leave.reviewComments && (
                                <Typography variant="body1" gutterBottom>
                                    <strong>Review Comments:</strong> {detailDialog.leave.reviewComments}
                                </Typography>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailDialog({ open: false, leave: null })}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default LeaveList;
