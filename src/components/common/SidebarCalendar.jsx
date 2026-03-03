import React, { useState } from 'react';
import { Box, Typography, IconButton, Grid, Paper, Tooltip } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from 'date-fns';

const SidebarCalendar = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const nextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    const prevMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const renderHeader = () => {
        const dateFormat = "MMMM yyyy";

        return (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={prevMonth} size="small">
                    <ChevronLeft />
                </IconButton>
                <Typography variant="subtitle1" fontWeight="bold">
                    {format(currentMonth, dateFormat)}
                </Typography>
                <IconButton onClick={nextMonth} size="small">
                    <ChevronRight />
                </IconButton>
            </Box>
        );
    };

    const renderDays = () => {
        const dateFormat = "EEE";
        const days = [];
        let startDate = startOfWeek(currentMonth);

        for (let i = 0; i < 7; i++) {
            days.push(
                <Grid item xs={1.7} key={i} sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary">
                        {format(addDays(startDate, i), dateFormat)}
                    </Typography>
                </Grid>
            );
        }

        return <Grid container columns={11.9}>{days}</Grid>; // Using 11.9 to roughly fit 7 items evenly
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat);
                const cloneDay = day;

                // Determine styling based on status (Placeholder logic for now as per image request)
                // In a real app, you'd pass attendance data here
                let bgcolor = 'transparent';
                let color = 'text.primary';

                // Placeholder styling to match the image vaguely/randomly or just default
                // The image shows specific styling. Since we don't have the data yet, 
                // we will stick to a clean default calendar style.
                // The user asked to display a calendar "like in this image", which implies the structure/look.

                const isCurrentMonth = isSameMonth(day, monthStart);

                days.push(
                    <Grid item xs={1.7} key={day} sx={{ textAlign: 'center', mb: 1 }}>
                        <Box
                            sx={{
                                height: 30,
                                width: 30,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 1,
                                margin: '0 auto',
                                bgcolor: isToday(day) ? 'primary.main' : 'transparent',
                                color: isToday(day) ? 'common.white' : (isCurrentMonth ? 'text.primary' : 'text.disabled'),
                                border: '1px solid',
                                borderColor: 'divider',
                                cursor: 'pointer',
                                '&:hover': {
                                    bgcolor: isToday(day) ? 'primary.dark' : 'action.hover'
                                }
                            }}
                            onClick={() => setSelectedDate(cloneDay)}
                        >
                            <Typography variant="body2">
                                {formattedDate}
                            </Typography>
                        </Box>
                    </Grid>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <Grid container columns={11.9} key={day} sx={{ mt: 1 }}>
                    {days}
                </Grid>
            );
            days = [];
        }
        return <Box>{rows}</Box>;
    };

    const renderFooter = () => {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
                <Box sx={{ px: 1, py: 0.5, bgcolor: '#C8E6C9', borderRadius: 5, fontSize: '0.75rem', fontWeight: 'bold' }}>
                    Present
                </Box>
                <Box sx={{ px: 1, py: 0.5, bgcolor: '#FFCDD2', borderRadius: 5, fontSize: '0.75rem', fontWeight: 'bold' }}>
                    Absent
                </Box>
                <Box sx={{ px: 1, py: 0.5, bgcolor: '#BBDEFB', borderRadius: 5, fontSize: '0.75rem', fontWeight: 'bold' }}>
                    Holiday
                </Box>
            </Box>
        );
    };

    return (
        <Paper elevation={0} sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            {renderHeader()}
            {renderDays()}
            {renderCells()}
            {renderFooter()}
        </Paper>
    );
};

export default SidebarCalendar;
