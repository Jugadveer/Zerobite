const weights = {
  mealsSaved: 0.5,
  co2Reduced: 0.3,
  activeDonations: 0.2
};

const maxGoals = {
  mealsSaved: 100000,
  co2Reduced: 100000,
  activeDonations: 10000
};

function calculateCommunityImpact(metrics) {
  
  // if (
  //   metrics['mealsSaved'] == null ||
  //   metrics['co2Reduced'] == null ||
  //   metrics['activeDonations'] == null
  // ) {
  //   return null; // no calculation if missing data
  // }

  const mealScore = Math.min(metrics.mealsSaved / maxGoals.mealsSaved, 1);
  const co2Score = Math.min(metrics.co2Reduced / maxGoals.co2Reduced, 1);
  

  const donationScore = Math.min(metrics.activeDonationsCount / maxGoals.activeDonations, 1);


 
  return     ((weights.mealsSaved * mealScore +
     weights.co2Reduced * co2Score +
     weights.activeDonations * donationScore) * 100).toFixed(4)
  ;

 

}

module.exports = { calculateCommunityImpact };
