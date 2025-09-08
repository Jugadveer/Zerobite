const emissionFactors = {
  'cooked meals': {
    portions: 2.5,
    packs: 2.0,
    trays: 3.0,
    boxes: 2.8,
    units: 1.5,
  },
  bakery: {
    loaves: 1.3,
    packs: 1.0,
    slices: 0.2,
    pieces: 0.25,
    boxes: 1.8,
  },
  produce: {
    kg: 0.5,
    grams: 0.0005,
    pieces: 0.1,
    bunches: 0.75,
    boxes: 2.0,
  },
  dairy: {
    kg: 3.0,
    liters: 2.8,
    packs: 1.5,
    bottles: 2.2,
    cartons: 2.5,
  },
  packaged: {
    packs: 1.2,
    boxes: 2.0,
    units: 0.8,
    bottles: 1.0,
    cans: 0.9,
  },
};


function calculateCo2Reduction(donation) {

  const foodTypeKey=donation['foodType'].toLowerCase();
  const unitKey=donation['unit'].toLowerCase();
  const quantity=donation['quantity'];
  const foodEmissions = emissionFactors[foodTypeKey];
  // console.log('Food Emissions:', foodEmissions);
  if (!foodEmissions) return null;

  const factor = foodEmissions[unitKey];
  if (!factor) return null;
  // console.log('Emission Factor:', factor);

  return factor * quantity; 
  
}

module.exports = { calculateCo2Reduction };
