import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const API_URL = `http://localhost:${process.env.PORT || 5000}/api`;
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';

console.log(`Running Admin Verification Tests on ${API_URL}...`);

async function runTests() {
    try {
        // 1. Test Admin Login
        console.log('\n--- 1. Testing Admin Login ---');
        const loginRes = await axios.post(`${API_URL}/admin/login`, { password: ADMIN_PASS });
        if (loginRes.data.success) {
            console.log('✅ Admin Login Successful');
        } else {
            throw new Error(`Login Failed: ${loginRes.data.message}`);
        }

        // 2. Test Content Update (Ticket Pass Toggle)
        console.log('\n--- 2. Testing Ticket Pass Toggle ---');
        // First get current content
        const contentRes = await axios.get(`${API_URL}/content`);
        const currentContent = contentRes.data.data || {};

        // Toggle the value
        const newToggleValue = !currentContent.isTicketPassEnabled;
        const updateContentRes = await axios.post(`${API_URL}/content/update`, {
            content: { ...currentContent, isTicketPassEnabled: newToggleValue }
        });

        if (updateContentRes.data.success) {
            console.log(`✅ Content Updated (isTicketPassEnabled: ${newToggleValue})`);
        } else {
            throw new Error(`Content Update Failed: ${updateContentRes.data.error}`);
        }

        // 3. Test Registration Verification
        console.log('\n--- 3. Testing Registration Verification ---');
        // Create a dummy registration
        const dummyReg = {
            name: "Test Bot",
            email: "testbot@test.com",
            college: "Test University",
            phone: "1234567890",
            degree: "B.Tech",
            course: "CSE",
            year: "3",
            paymentScreenshotUrl: "http://example.com/screenshot.png"
        };
        const regRes = await axios.post(`${API_URL}/register`, dummyReg);
        if (!regRes.data.success) throw new Error("Registration Failed");
        console.log('✅ Dummy Registration Created');

        // Fetch to get ID
        const allRegsRes = await axios.get(`${API_URL}/admin/registrations`); // Note: unprotected route in this codebase layout
        const createdReg = allRegsRes.data.data.find(r => r.email === dummyReg.email);

        if (!createdReg) throw new Error("Could not find created registration");
        console.log(`Found Registration ID: ${createdReg._id}`);

        // Verify it
        const verifyRes = await axios.post(`${API_URL}/admin/verify-registration`, {
            registrationId: createdReg._id,
            isActive: true
        });

        if (verifyRes.data.success && verifyRes.data.data.isActive) {
            console.log('✅ Registration Verified Successfully!');
        } else {
            throw new Error('Verification Endpoint Failed');
        }

        console.log('\n🎉 ALL TESTS PASSED!');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
        }
        process.exit(1);
    }
}

runTests();
