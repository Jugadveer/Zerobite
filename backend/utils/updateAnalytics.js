const Donation = require('../models/Donation');
const Analytic = require('../models/Analytics');
const { calculateCo2Reduction } = require('./co2Calculater');
const { calculateCommunityImpact } = require('./communityImpact');

async function updateUserAnalytics(userId) {
  const now = new Date();
  const currentPeriod = new Date(now.getFullYear(), now.getMonth(), 1);

  const donations = await Donation.find({ donor: userId });
  



  // Sum only valid quantities
  const mealsSaved = donations.reduce((sum, d) => {
    const qty = Number(d.quantity);
    return sum + (isNaN(qty) ? 0 : qty);
  }, 0);

  // Sum only valid CO2 values
  const co2Reduced = donations.reduce((sum, d) => {
    const val = calculateCo2Reduction(d);
    return sum + (typeof val === 'number' && !isNaN(val) ? val : 0);
  }, 0);

  const activeDonationsCount = donations.length;

  if (donations.length === 0) {
    // No donations: either skip update or save with null metrics
    await Analytic.findOneAndUpdate(
      { user: userId, date: currentPeriod },
      {
        user: userId,
        date: currentPeriod,
        mealsSaved: null,
        co2ReducedKg: null,
        activeDonationsCount: 0,
        donationStatus: { pending: 0, completed: 0, cancelled: 0 },
        foodCategoryCounts: [],
        communityImpactPercent: null,
        createdAt: new Date(),
      },
      { upsert: true, new: true }
    );
    return;
  }

  const donationStatus = donations.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1;
    return acc;
  }, { pending: 0, completed: 0, cancelled: 0 });

  const foodCategoryCountsMap = {};
  donations.forEach(d => {
    if (!foodCategoryCountsMap[d.foodType]) foodCategoryCountsMap[d.foodType] = 0;
    foodCategoryCountsMap[d.foodType]++;
  });
  const foodCategoryCounts = Object.entries(foodCategoryCountsMap).map(([category, count]) => ({ category, count }));

  const communityImpactPercent = calculateCommunityImpact({ mealsSaved, co2Reduced, activeDonationsCount });

  await Analytic.findOneAndUpdate(
    { user: userId, date: currentPeriod },
    {
      user: userId,
      date: currentPeriod,
      mealsSaved,
      co2ReducedKg: co2Reduced,
      activeDonationsCount,
      donationStatus,
      foodCategoryCounts,
      communityImpactPercent,
      createdAt: new Date()
    },
    { upsert: true, new: true }
  );

  console.log(`Analytics updated for user ${userId}`);
}

module.exports = { updateUserAnalytics };
