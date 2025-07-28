const User = require('./models/User');
const PlanUpgrade = require('./models/PlanUpgrade');
require('./config/db');

async function checkUserAuth() {
  try {
    console.log('🔍 Checking authentication and user data...');
    
    // Check all users in the database
    const users = await User.find({}, { _id: 1, email: 1, fullName: 1 }).limit(10);
    console.log('👥 All users in database:');
    users.forEach(user => {
      console.log(`  - ${user._id} (${user.email}) - ${user.fullName}`);
    });
    
    console.log('\n💳 All plan upgrades in database:');
    const upgrades = await PlanUpgrade.find({}, { _id: 1, userId: 1 }).limit(10);
    upgrades.forEach(upgrade => {
      console.log(`  - Upgrade ${upgrade._id} belongs to user ${upgrade.userId}`);
    });
    
    // Check if the request user ID exists in database
    const requestUserId = '6888f1dbabff9038fe0c6fff';
    console.log(`\n🔍 Checking if request user ID exists: ${requestUserId}`);
    
    const userExists = await User.findById(requestUserId);
    if (userExists) {
      console.log(`✅ User found: ${userExists.email} - ${userExists.fullName}`);
    } else {
      console.log('❌ User with this ID does not exist in database');
    }
    
    // Find upgrades for each user
    console.log('\n📊 Upgrade count per user:');
    for (const user of users) {
      const userUpgrades = await PlanUpgrade.countDocuments({ userId: user._id });
      console.log(`  - ${user._id} (${user.email}): ${userUpgrades} upgrades`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUserAuth();
