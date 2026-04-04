/**
 * Test Email Configuration
 * Run this script to test if your email setup is working
 * 
 * Usage: node test-email.js
 */

require('dotenv').config();
const { sendPasswordResetEmail } = require('./src/config/email');

async function testEmail() {
  console.log('📧 Testing email configuration...\n');
  
  console.log('Configuration:');
  console.log('SMTP_HOST:', process.env.SMTP_HOST || 'smtp.gmail.com');
  console.log('SMTP_PORT:', process.env.SMTP_PORT || '587');
  console.log('SMTP_USER:', process.env.SMTP_USER || process.env.EMAIL_USER);
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'Not set');
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'http://localhost:3001');
  console.log('\n');

  const testEmail = process.env.SMTP_USER || process.env.EMAIL_USER;
  
  if (!testEmail) {
    console.error('❌ Error: No email configured. Please set SMTP_USER or EMAIL_USER in .env');
    process.exit(1);
  }

  try {
    console.log(`Sending test email to: ${testEmail}...\n`);
    
    const testToken = 'test-token-12345';
    const testUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${testToken}`;
    
    await sendPasswordResetEmail(testEmail, testToken, testUrl);
    
    console.log('✅ Email sent successfully!');
    console.log(`📬 Check your inbox: ${testEmail}`);
    console.log('   (This is a test email, the reset link won\'t work)');
  } catch (error) {
    console.error('❌ Error sending email:');
    console.error(error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\n💡 Authentication failed. Possible issues:');
      console.error('   - Wrong email or password');
      console.error('   - For Gmail: Make sure you\'re using App Password, not regular password');
      console.error('   - Check if 2-Step Verification is enabled');
    } else if (error.code === 'ECONNECTION') {
      console.error('\n💡 Connection failed. Possible issues:');
      console.error('   - Check your internet connection');
      console.error('   - Verify SMTP_HOST and SMTP_PORT are correct');
      console.error('   - Check firewall settings');
    }
    
    process.exit(1);
  }
}

testEmail();



