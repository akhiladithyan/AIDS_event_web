import SettingsModel from '../models/Settings.js';

// Get current settings
export const getSettings = async (req, res) => {
    try {
        let settings = await SettingsModel.findOne();
        if (!settings) {
            settings = await SettingsModel.create({ registrationOpen: true });
        }
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update settings
export const updateSettings = async (req, res) => {
    try {
        const { registrationOpen } = req.body;

        let settings = await SettingsModel.findOne();
        if (!settings) {
            settings = new SettingsModel({ registrationOpen });
        } else {
            settings.registrationOpen = registrationOpen;
            settings.lastUpdated = Date.now();
        }

        await settings.save();
        console.log(`✅ Settings updated: Registration is now ${registrationOpen ? 'OPEN' : 'CLOSED'}`);
        res.json({ success: true, message: "Settings updated successfully", data: settings });
    } catch (error) {
        console.error("❌ Error updating settings:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};
