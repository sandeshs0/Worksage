/**
 * Test script to verify plan upgrade integration
 * This tests the frontend plan service integration
 */

// Mock console for testing
const testResults = [];

function logTest(description, result) {
  testResults.push({ description, result });
  console.log(`${result ? '✅' : '❌'} ${description}`);
}

// Test 1: Verify environment variables
logTest(
  'Environment variables are properly set',
  process.env.VITE_KHALTI_PUBLIC_KEY !== undefined
);

// Test 2: Verify plan service can be imported
try {
  const planService = require('./src/services/planService.js');
  logTest('Plan service imports successfully', true);
  
  // Test 3: Verify planService has required methods
  const requiredMethods = ['getPlans', 'initiatePlanUpgrade', 'verifyPlanUpgrade', 'getPlanUpgradeHistory'];
  const hasAllMethods = requiredMethods.every(method => 
    typeof planService[method] === 'function'
  );
  logTest('Plan service has all required methods', hasAllMethods);
  
} catch (error) {
  logTest('Plan service imports successfully', false);
  console.error('Import error:', error.message);
}

// Test 4: Verify KhaltiCheckout component structure
try {
  const fs = require('fs');
  const khaltiCheckoutPath = './src/components/payments/KhaltiCheckout.jsx';
  const khaltiContent = fs.readFileSync(khaltiCheckoutPath, 'utf8');
  
  const hasKhaltiScript = khaltiContent.includes('khalti-checkout.iffe.js');
  const hasProperStructure = khaltiContent.includes('window.KhaltiCheckout');
  const hasErrorHandling = khaltiContent.includes('onError');
  
  logTest('KhaltiCheckout component has script loading', hasKhaltiScript);
  logTest('KhaltiCheckout component has proper structure', hasProperStructure);
  logTest('KhaltiCheckout component has error handling', hasErrorHandling);
  
} catch (error) {
  logTest('KhaltiCheckout component verification failed', false);
  console.error('Component verification error:', error.message);
}

// Test 5: Verify SettingsPage integration
try {
  const fs = require('fs');
  const settingsPath = './src/pages/dashboard/SettingsPage.jsx';
  const settingsContent = fs.readFileSync(settingsPath, 'utf8');
  
  const hasKhaltiImport = settingsContent.includes('KhaltiCheckout');
  const hasPlanServiceImport = settingsContent.includes('planService');
  const hasUpgradeHistory = settingsContent.includes('upgradeHistory');
  const hasPaymentLoading = settingsContent.includes('paymentLoading');
  
  logTest('SettingsPage imports KhaltiCheckout', hasKhaltiImport);
  logTest('SettingsPage imports plan service', hasPlanServiceImport);
  logTest('SettingsPage has upgrade history', hasUpgradeHistory);
  logTest('SettingsPage has payment loading state', hasPaymentLoading);
  
} catch (error) {
  logTest('SettingsPage integration verification failed', false);
  console.error('SettingsPage verification error:', error.message);
}

// Summary
console.log('\n📊 Test Summary:');
console.log(`Total tests: ${testResults.length}`);
console.log(`Passed: ${testResults.filter(t => t.result).length}`);
console.log(`Failed: ${testResults.filter(t => !t.result).length}`);

if (testResults.every(t => t.result)) {
  console.log('\n🎉 All tests passed! Plan upgrade integration is ready.');
  console.log('\n🚀 Next steps:');
  console.log('1. Start both backend and frontend servers');
  console.log('2. Navigate to Settings > Billing tab');
  console.log('3. Test plan upgrades with Khalti payment');
  console.log('4. Verify upgrade history displays correctly');
} else {
  console.log('\n❌ Some tests failed. Please review the errors above.');
}
