import axios from 'axios';
import api from './api';

const API_URL = '/api/recruitment';

// Job Posting APIs
export const jobAPI = {
    getAll: (params) => api.get('/recruitment/jobs', { params }),
    getById: (id) => api.get(`/recruitment/jobs/${id}`),
    create: (data) => api.post('/recruitment/jobs', data),
    update: (id, data) => api.put(`/recruitment/jobs/${id}`, data),
    publish: (id) => api.put(`/recruitment/jobs/${id}/publish`),
    close: (id) => api.delete(`/recruitment/jobs/${id}`)
};

// Candidate APIs
export const candidateAPI = {
    getAll: (params) => api.get('/recruitment/candidates', { params }),
    getById: (id) => api.get(`/recruitment/candidates/${id}`),
    create: (data) => api.post('/recruitment/candidates', data),
    update: (id, data) => api.put(`/recruitment/candidates/${id}`, data),
    screen: (id, data) => api.put(`/recruitment/candidates/${id}/screen`, data),
    updateStatus: (id, status) => api.put(`/recruitment/candidates/${id}/status`, { status }),
    delete: (id) => api.delete(`/recruitment/candidates/${id}`),
    uploadResume: (id, formData) => api.post(`/recruitment/candidates/${id}/resume`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    downloadResume: (id) => api.get(`/recruitment/candidates/${id}/resume`, { responseType: 'blob' })
};

// Interview APIs
export const interviewAPI = {
    getAll: (params) => api.get('/recruitment/interviews', { params }),
    getById: (id) => api.get(`/recruitment/interviews/${id}`),
    getPublicFeed: () => api.get('/recruitment/interviews/public-feed'),
    getMyInterviews: () => api.get('/recruitment/interviews/my-interviews'),
    getCandidateProfile: (interviewId) => api.get(`/recruitment/interviews/${interviewId}/candidate`),
    create: (data) => api.post('/recruitment/interviews', data),
    update: (id, data) => api.put(`/recruitment/interviews/${id}`, data),
    submitFeedback: (id, feedback) => api.put(`/recruitment/interviews/${id}/feedback`, feedback),
    cancel: (id) => api.delete(`/recruitment/interviews/${id}`)
};

// Offer APIs
export const offerAPI = {
    getAll: (params) => api.get('/recruitment/offers', { params }),
    getById: (id) => api.get(`/recruitment/offers/${id}`),
    create: (data) => api.post('/recruitment/offers', data),
    update: (id, data) => api.put(`/recruitment/offers/${id}`, data),
    send: (id) => api.put(`/recruitment/offers/${id}/send`),
    accept: (id) => api.put(`/recruitment/offers/${id}/accept`),
    reject: (id) => api.put(`/recruitment/offers/${id}/reject`)
};

export default {
    jobAPI,
    candidateAPI,
    interviewAPI,
    offerAPI
};
