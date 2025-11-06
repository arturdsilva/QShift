import axios from 'axios';
import { week } from '../MockData';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 500,
  headers: {'Content-Type': 'application/json'}
});

api.interceptors.request.use(config => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
        config.headers['X-User-ID'] = userId;
    }
    // TODO: Adicionar token de autenticação se necessário

    return config;
}, error => {
    return Promise.reject(error);
});

export const ShiftConfigApi = {
    createShcedule: async (weekPath, shifts) => {
        return await api.post(`${weekPath}/schedule`, shifts);
    },

    submitWeekData: async (week) => {
        return await api.post('/weeks', week);
    }
};

export const StaffApi = {
    getAll: async () => {
    return await api.get('/employees');
    },

    toggleActive: async (employeeId, isActive) => {
        return await api.patch(`/employees/${employeeId}/toggle-active`, {active: isActive});
    }
};

export const AvailabilityApi = {
    getAvailabilityEmployee: async (employeeId) => {
        return await api.get(`/employees/${employeeId}/availabilities`);
    },

    getByEmployeeId: async (employeeId) => {
        return await api.get(`/availability/${employeeId}`);
    },

    updateEmployeeAvailability: async (employeeId, availability) => {
        return await api.put(`/availability/${employeeId}`, availability );
    },

    addNewEmployee: async (employeeData) => {
        return await api.post('/employees', employeeData);
    }
}

export const GeneratedScheduleApi = {
    getEmployees: async () => {
        return await api.get('/employees');
    },
    getGeneratedSchedule: async () => {
        return await api.get('/schedule');
    },
    approvedSchedule: async (schedule) => {
        return await api.post('/schedule', schedule);
    }
}

export const LoginApi = {
    authenticateUser: async (username, password) => {
        return await api.post('/login', {username, password});
    }
}