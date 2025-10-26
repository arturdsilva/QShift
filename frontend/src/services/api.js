import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  Headers: {'Content-Type': 'application/json'}
});

export const ShiftConfigApi = {
    save: async (shifts) => {
        return await api.post('/shifts-config-save', {shifts});
    },
    //TODO: Ver save e restore do config de shifts com cache

    restore: async () => {
        return await api.get('/shifts-config-restore');
    },

    createShcedule: async (schedule) => {
        return await api.post('/create-schedule', {schedule});
    }
};

export const StaffApi = {
    getAll: async () => {
        return await api.get('/employees');
    },

    toggleActive: async (employeeId, isActive) => {
        return await api.patch(`/employees/${employeeId}/toggle-active`, { active: isActive });
    }
};

export const AvailabilityApi = {
    getEmployee: async (employeeId) => {
        return await api.get(`/employees/${employeeId}`);
    },

    getByEmployeeId: async (employeeId) => {
        return await api.get(`/availability/${employeeId}`);
    },

    updateEmployeeAvailability: async (employeeId, availability) => {
        return await api.put(`/availability/${employeeId}`, { availability });
    },

    addNewEmployee: async (employeeData) => {
        return await api.post('/employees', employeeData);
    }
    // TODO:passa um ID
}
