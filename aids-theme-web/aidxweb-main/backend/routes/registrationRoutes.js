import express from 'express';
import {
    registerSolo,
    registerTeam,
    getSoloRegistrations,
    getTeamRegistrations
} from '../controllers/registrationController.js';

const router = express.Router();

// Public Registration Routes
router.post('/register/solo', registerSolo);
router.post('/register/team', registerTeam);

// Admin Routes (Protected in real app, but currently open as per existing server.js pattern for now, or we can add middleware later)
router.get('/admin/registrations/solo', getSoloRegistrations);
router.get('/admin/registrations/team', getTeamRegistrations);

export default router;
