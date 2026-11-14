// Function to calculate Sedentarism Factor with dynamic variation
// Utility function for generating biased random variation
const addBiasedVariation = (value, percentage = 0.1, upwardBias = 0.8) => {
    // Generate a biased random number: 60% chance for positive variation
    const bias = Math.random() < upwardBias ? 1 : -1;
    const variation = bias * Math.random() * percentage * value;
    return Math.max(0.2, value + variation); // Ensure it doesn't go below the minimum sedentarism level
  };
  
  
  // Function to calculate Sedentarism Factor with dynamic and realistic variation
  export const calculateSedentarismFactor = (
    simulationHour,
    fullSedentarismStartHour = 23,
    fullSedentarismEndHour = 7
  ) => {
    const TRANSITION_LENGTH = Math.random() * 0.5 + 1.5; // Random between 1.5 and 2 hours
  
    // Activity levels
    const SLEEP_LEVEL = 1.0; // Completely sedentary while sleeping
    const MIN_LEVEL = 0.2; // Most active during day
  
    const hour24 = convertTo24Hour(simulationHour);
    let factor;
  
    // Deep sleep period (full sedentarism)
    if ((hour24 >= fullSedentarismStartHour) || (hour24 < fullSedentarismEndHour)) {
      factor = SLEEP_LEVEL; // Static for sleep
    }
    // Morning transition (waking up)
    else if (hour24 < (fullSedentarismEndHour + TRANSITION_LENGTH)) {
      const progress = (hour24 - fullSedentarismEndHour) / TRANSITION_LENGTH;
      factor = SLEEP_LEVEL - (SLEEP_LEVEL - MIN_LEVEL) * Math.pow(progress, 2);
      factor = addBiasedVariation(factor, 0.13, 0.58); // Smaller variation during transition
    }
    // Evening transition (getting ready for sleep)
    else if (hour24 >= (fullSedentarismStartHour - TRANSITION_LENGTH)) {
      const progress = (fullSedentarismStartHour - hour24) / TRANSITION_LENGTH;
      factor = SLEEP_LEVEL - (SLEEP_LEVEL - MIN_LEVEL) * Math.pow(progress, 2);
      factor = addBiasedVariation(factor, 0.15, 0.25); // Smaller variation during transition
    }
    // Active day period
    else {  
      factor = MIN_LEVEL;
      factor = addBiasedVariation(factor, 1.5, 0.88); // Larger variation with upward bias during active periods
    }
  
    return factor;
  };

  
// Utility function to convert AM/PM time format to 24-hour format
export const convertTo24Hour = (timeString) => {
    const [time, modifier] = timeString.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
  
    if (modifier === "PM" && hours !== 12) {
      hours += 12; // Add 12 for PM hours except 12 PM
    } else if (modifier === "AM" && hours === 12) {
      hours = 0; // Midnight case (12 AM is 0:00)
    }
  
    return hours + minutes / 60; // Convert to fractional hour (e.g., 1:30 = 1.5)
  };


// // Only run analysis if we're in Node.js environment
// if (typeof process !== 'undefined' && process.versions && process.versions.node) {
//     const fs = require('fs');
    
//     // Initialize output
//     let output = `SEDENTARISM FACTOR THROUGHOUT THE DAY
// =====================================
// Sleep Period: 23:00 - 07:00
// Maximum Sedentarism: 1.0 (deep sleep)
// Minimum Sedentarism: 0.2 (active day)
// Transition: Variable (1.5-2 hours), Exponential curve

// Hour-by-Hour Analysis:
// ----------------------------------------\n\n`;

//     // Calculate for each hour with 15-minute intervals
//     const hoursToShow = [];
//     for (let hour = 0; hour < 24; hour++) {
//         for (let fraction = 0; fraction <= 0.75; fraction += 0.25) {
//             hoursToShow.push(hour + fraction);
//         }
//     }

//     hoursToShow.forEach(hour => {
//         const factor = calculateSedentarismFactor(hour);
//         const wholeHour = Math.floor(hour);
//         const minutes = Math.round((hour - wholeHour) * 60);
//         const timeStr = `${wholeHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
//         // Determine period type based on time
//         let periodType;
//         const hour24 = (wholeHour + (minutes / 60)) % 24;
//         if ((hour24 >= 23) || (hour24 < 7)) {
//             periodType = "Sleep Period";
//         } else if ((hour24 >= 7 && hour24 < 9) || (hour24 >= 21 && hour24 < 23)) {
//             periodType = "Transition Period";
//         } else {
//             periodType = "Active Period";
//         }
        
//         // Create visual representation
//         // Scale factor from 0.2 to 1.0 to 0 to 40 for bar display
//         const barLength = Math.round((factor - 0.2) * 50);
//         const bar = '█'.repeat(barLength) + '░'.repeat(40 - barLength);
        
//         // Calculate percentage of max sedentarism
//         const percentSedentary = ((factor - 0.2) * 1.25).toFixed(1);
        
//         output += `${timeStr} | ${factor.toFixed(3)} (${percentSedentary}%) ${bar} | ${periodType}\n`;
//     });

//     // Add explanation
//     output += `\nLegend:
// ----------------------------------------
// █ = Sedentarism Level (longer bar = more sedentary)
// Sleep Level: 1.000 (complete sedentarism during deep sleep)
// Active Level: 0.200 (minimum sedentarism during day)

// Key Periods:
// - Sleep Start: 23:00 (11:00 PM)
// - Sleep End: 07:00 (7:00 AM)
// - Transition Length: 1.5-2 hours (randomized)

// Notes:
// - Uses exponential curves for natural transitions
// - Highest sedentarism during deep sleep
// - Gradual wake-up and wind-down periods
// - Most active during day\n`;

//     // Write results to file
//     fs.writeFileSync('sedentarism_analysis.txt', output);
//     console.log('Sedentarism analysis has been written to sedentarism_analysis.txt');
// }

// // Export for both environments
// if (typeof module !== 'undefined' && module.exports) {
//     module.exports = { calculateSedentarismFactor };
// } else {
//     window.calculateSedentarismFactor = calculateSedentarismFactor;
// }