// This is aproximately defined to a ~14-15 hour day, 
// and can be specifically updated as per season (API call or reading date from the system)

import { convertTo24Hour } from "./sedentarismTest";
export const calculateCircadianFactor = (simulationHour) => {
    const START_HOUR = 3.5;      // 03:30 AM - Metabolism begins rising
    const PEAK_HOUR = 14;        // 02:00 PM - Peak metabolic activity
    const END_HOUR = 23;         // 11:00 PM - Return to base level
    
    const BASE_LEVEL = 0.8;      // Minimum metabolic rate
    const PEAK_LEVEL = 1.2;      // Maximum metabolic rate
    
    // Handle day wrapping
    let adjustedHour = convertTo24Hour(simulationHour);

    // Calculate position in the cycle
    let cyclePosition;
    if (adjustedHour >= START_HOUR && adjustedHour <= END_HOUR) {
        // Active phase
        const totalActiveHours = END_HOUR - START_HOUR;
        const peakPosition = (PEAK_HOUR - START_HOUR) / totalActiveHours;
        const currentPosition = (adjustedHour - START_HOUR) / totalActiveHours;
        
        // Create a smooth curve that peaks at PEAK_HOUR
        cyclePosition = Math.sin(currentPosition * Math.PI);
        
        // Adjust the curve to peak at the correct time
        if (currentPosition <= peakPosition) {
            cyclePosition = cyclePosition * (currentPosition / peakPosition);
        } else {
            cyclePosition = cyclePosition * (1 - (currentPosition - peakPosition) / (1 - peakPosition));
        }
    } else {
        // Inactive phase - maintain base level
        cyclePosition = 0;
    }
    
    // Scale between BASE_LEVEL and PEAK_LEVEL
    return BASE_LEVEL + (PEAK_LEVEL - BASE_LEVEL) * cyclePosition;
};


// // Only run analysis if we're in Node.js environment
// if (typeof process !== 'undefined' && process.versions && process.versions.node) {
//     const fs = require('fs');
    
//     // Initialize output
//     let output = `CIRCADIAN RHYTHM ANALYSIS
// =======================
// Base Metabolism: 0.8 (80% of normal)
// Peak Metabolism: 1.2 (120% of normal)
// Start Time: 03:30 AM
// Peak Time: 14:00 (2:00 PM)
// End Time: 23:00 (11:00 PM)

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
//         const factor = calculateCircadianFactor(hour);
//         const wholeHour = Math.floor(hour);
//         const minutes = Math.round((hour - wholeHour) * 60);
//         const timeStr = `${wholeHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
//         // Determine period type based on metabolic rate
//         let periodType = "Normal Metabolism";
//         if (factor > 1.1) {
//             periodType = "Peak Metabolism";
//         } else if (factor < 0.9) {
//             periodType = "Low Metabolism";
//         }
        
//         // Calculate percentage difference from baseline
//         const percentChange = ((factor - 1) * 100).toFixed(1);
//         const changeStr = (percentChange >= 0 ? '+' : '') + percentChange + '%';
        
//         // Create visual representation
//         // Scale factor from 0.8 to 1.2 to 0 to 40 for bar display
//         const barLength = Math.round((factor - 0.8) * 100);
//         const bar = '█'.repeat(barLength) + '░'.repeat(40 - barLength);
        
//         output += `${timeStr} | ${factor.toFixed(3)} (${changeStr}) ${bar} | ${periodType}\n`;
//     });

//     // Add explanation
//     output += `\nLegend:
// ----------------------------------------
// █ = Metabolic Rate (longer bar = higher metabolism)
// Base Rate: 0.800 (80% metabolism before 3:30 AM and after 11:00 PM)
// Peak: ~1.200 (+20% around 2:00 PM)
// Low: ~0.800 (-20% during night hours)

// Key Periods:
// - Night/Early Morning (00:00-03:30): Base metabolism
// - Rising Phase (03:30-14:00): Gradually increasing metabolism
// - Peak Period (around 14:00): Maximum metabolic rate
// - Declining Phase (14:00-23:00): Gradually decreasing metabolism
// - Night Phase (23:00-00:00): Return to base metabolism

// Formula uses modified sine curves for smooth transitions between:
// 1. Base level (0.8) at 03:30
// 2. Peak level (1.2) at 14:00
// 3. Return to base level (0.8) at 23:00\n`;

//     // Write results to file
//     fs.writeFileSync('circadian_analysis.txt', output);
//     console.log('Circadian rhythm analysis has been written to circadian_analysis.txt');
// }

// // Export for both environments
// if (typeof module !== 'undefined' && module.exports) {
//     module.exports = { calculateCircadianFactor };
// } else {
//     window.calculateCircadianFactor = calculateCircadianFactor;
// }

