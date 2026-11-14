// src/simulate_archetype.js

const TIME_ACCELERATION = 1000; // 1000 ms = 1 simulated hour

// Configuration for different archetypes
export const archetypeConfig = {
  TheCentenarian: {
    name: "Centenarian",
    startEatingHour: 7,
    stopEatingHour: 17,
    mealInterval: 2.87,
    fullSedentarismStartHour: 17,
    fullSedentarismEndHour: 7,
    mealDistribution: [0.12, 0.41, 0.47, 0.02],
  },
  ModernMan: {
    name: "Modern Man",
    startEatingHour: 6,
    stopEatingHour: 22,
    mealInterval: 1.5,
    fullSedentarismStartHour: 18,
    fullSedentarismEndHour: 7,
    mealDistribution: [0.15, 0.35, 0.44, 0.06], // Probability for small, medium, and big meals
  },
  PonPon: {
    name: "PonPon",
    startEatingHour: 7,
    stopEatingHour: 18,
    mealInterval: 4,
    fullSedentarismStartHour: 15,
    fullSedentarismEndHour: 8,
    mealDistribution: [0.05, 0.31, 0.64, 0.02],
  },
  Lao: {
    name: "Lao",
    startEatingHour: 17,
    stopEatingHour: 22,
    mealInterval: 2,
    fullSedentarismStartHour: 18,
    fullSedentarismEndHour: 5,
    mealDistribution: [0.05, 0.21, 0.58, 0.16],
  },
  Monk: {
    name: "Monk",
    startEatingHour: 7,
    stopEatingHour: 17,
    mealInterval: 4.5,
    fullSedentarismStartHour: 19,
    fullSedentarismEndHour: 7,
    mealDistribution: [0.05, 0.31, 0.64, 0.02],
  },
};

// Meal Time adjustment distribution
const timeAdjustmentDistribution = [
  { adjustment: -1, probability: 0.05 },
  { adjustment: -0.5, probability: 0.18 },
  { adjustment: 0, probability: 0.55 },
  { adjustment: 0.5, probability: 0.17 },
  { adjustment: 1, probability: 0.05 },
];


class ArchetypeSimulator {
  constructor(worker) {
    this.defaultTimeAcceleration = TIME_ACCELERATION;
    this.worker = worker;
    this.currentArchetype = null;
    this.simulationInterval = null;
    this.simulationStartTimeReal = Date.now();
    this.simulationStartTime = 6; // Simulation always starts at 6 AM
    this.nextMealTime = null;
    this.defaultMealDistribution = null; // To hold default probabilities for reset
    this.mealDistribution = null; // To hold current probabilities during the day
    this.SimulationRealTime = 6;
    this.isSimulationStarted = false;
    this.currentEpoch_startTime = Date.now();
    this.epochs = {}; // Object to track elapsed real time per speed

  }

  // Method to set the simulation speed dynamically
  setSpeedMultiplier(multiplier) {
    if (this.isSimulationStarted)
      this.updateEpoch();
    this.timeAcceleration = 1000 * (multiplier / 3600); // Adjust time acceleration based on multiplier
    console.log(
      `Updated TIME_ACCELERATION to: ${this.timeAcceleration} ms per simulated hour, received multiplier: ${multiplier}`
    );
    
    // Restart the interval with the new time acceleration
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }
    this.simulateWithInterval(); // Restart the interval with updated speed
  }

  startSimulation(archetype) {
    // Initialize only if the simulation hasn't started yet
    if (!this.isSimulationStarted) {
      this.isSimulationStarted = true;
  
      console.log(`Start simulation received archetype: ${JSON.stringify(archetype, null, 2)}`);
      // Retrieve configuration by the archetype name
      const configName = archetypeConfig[archetype.name]?.name ?? null;
      console.log(`Archetype received name: ${archetype.name}`);

      if (configName) {
        // Use the correct archetype configuration
        const config = archetypeConfig[configName]; // Retrieve the full config object
        this.currentArchetype = config;
        this.startEatingHour = config.startEatingHour;
        this.stopEatingHour = config.stopEatingHour;
        this.mealInterval = config.mealInterval;
        this.defaultMealDistribution = [...config.mealDistribution];
        this.mealDistribution = [...config.mealDistribution];
        this.fullSedentarismStartHour = config.fullSedentarismStartHour;
        this.fullSedentarismEndHour = config.fullSedentarismEndHour;

        console.log(`[${archetype.name}] Initialized values from config:`);
        console.log(`startEatingHour: ${this.startEatingHour}`);
        console.log(`stopEatingHour: ${this.stopEatingHour}`);
        console.log(`mealInterval: ${this.mealInterval}`);

      } else {
        // Initialize with user-received values if not in archetypeConfig
        console.log(`Archetype "${archetype.name}" is not defined in archetypeConfig. Initializing with user-provided values.`);
        this.currentArchetype = archetype;
        this.defaultMealDistribution = archetype.mealDistribution ? [...archetype.mealDistribution] : [0.25, 0.25, 0.25, 0.25]; // Default to equal distribution
        this.mealDistribution = [...this.defaultMealDistribution];
        this.startEatingHour = archetype.startEatingHour ?? 6; // Default to 6 AM
        this.stopEatingHour = archetype.stopEatingHour ?? 22; // Default to 10 PM
        this.mealInterval = archetype.mealInterval ?? 2; // Default to 2 hours
        this.fullSedentarismStartHour = archetype.fullSedentarismStartHour ?? 23; // Default to 11 PM
        this.fullSedentarismEndHour = archetype.fullSedentarismEndHour ?? 6; // Default to 6 AM
        }
          // Initialize simulation start time
          this.simulationStartTime = 6; // Start at 6 AM
          this.simulationStartTimeReal = Date.now();
      // Start the simulation interval
      this.simulateWithInterval();
  } else {
    console.log('Simulation is already running. Use setSpeedMultiplier() to adjust speed.');
  }
}
  stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
      console.log('Simulation stopped.');
    }
  }

  simulateArchetype() {
    console.log(`Starting simulation for ${this.currentArchetype.name}.`);
    
    this.simulationStartTime = 6; // Always start at 6 AM
    this.simulationStartTimeReal = Date.now();

    console.log(`[${this.currentArchetype.name}] Initialized values:`);
    console.log(`startEatingHour: ${this.startEatingHour}`);
    console.log(`stopEatingHour: ${this.stopEatingHour}`);
    console.log(`mealInterval: ${this.mealInterval}`);
  
    const initialAdjustment = this.getRandomTimeAdjustment();
    this.nextMealTime = this.startEatingHour + this.mealInterval + initialAdjustment;
  
    // Ensure the first meal is within eating hours
    if (this.nextMealTime >= this.stopEatingHour) {
      console.log(`[${this.currentArchetype.name}] First meal time is outside eating hours. Setting to null.`);
      this.nextMealTime = null;
    } else {
      console.log(
        `[${this.currentArchetype.name}] First meal scheduled at ${this.formatTime(this.nextMealTime)}.`
      );
    }
  
    // Start the simulation interval
    this.simulateWithInterval();
  }
  
  

  checkAndResetMealDistribution() {
    // Calculate cumulative offset by summing the absolute differences
    this.cumulativeOffset = this.defaultMealDistribution.reduce(
      (sum, defaultValue, index) => sum + Math.abs(defaultValue - this.mealDistribution[index]),
      0
    );
  
    // Define a reset threshold based on the cumulative offset
    const resetThreshold = 0.17;
    if (this.cumulativeOffset >= resetThreshold) {
      console.log(`[${this.currentArchetype.name}] A New Day has come: Cumulative offset: ${this.cumulativeOffset} \n Exceeded threshold! Resetting meal probability distribution.`);
      this.mealDistribution = [...this.defaultMealDistribution];
      this.cumulativeOffset = 0; // Reset cumulative offset after resetting distribution
    } else {
      console.log(`[${this.currentArchetype.name}] A New Day has come: Meal distribution continues from previous day. Current cumulative offset: ${this.cumulativeOffset.toFixed(2)}`);
    }
  }
  

  simulateWithInterval() {
    let newDayStarted = false;
  
    console.log(`Started simulating with interval for archetype: ${this.currentArchetype.name}`);
  
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  
    this.simulationInterval = setInterval(() => {
      const currentSimulatedTime = this.getCurrentSimulatedTime();
  
      if (currentSimulatedTime >= this.startEatingHour && !newDayStarted) {
        const initialAdjustment = this.getRandomTimeAdjustment();
        this.nextMealTime = this.startEatingHour + initialAdjustment;
        newDayStarted = true;
  
        console.log(
          `[${this.currentArchetype.name}] New day started: First meal scheduled at ${this.formatTime(this.nextMealTime)}.`
        );
  
        // Reset meal distribution for the new day
        console.log(`[${this.currentArchetype.name}] Checking if cumulative meal distribution offset needs resetting.`);
        this.checkAndResetMealDistribution();
      }
  
      if (currentSimulatedTime >= this.stopEatingHour) {
        newDayStarted = false;
      }
  
      if (currentSimulatedTime >= this.stopEatingHour || currentSimulatedTime < this.startEatingHour) {
        console.log(
          `[${this.currentArchetype.name}] Current Simulated Time: ${this.formatTime(currentSimulatedTime)} - Not eating hours.`
        );
        return;
      }
  
      if (this.nextMealTime && currentSimulatedTime >= this.nextMealTime) {
        const mealSize = this.chooseMealSize(this.mealDistribution);
        this.addMeal(mealSize);
        console.log(
          `[${this.currentArchetype.name}] Added meal at ${this.formatTime(currentSimulatedTime)}.`
        );
  
        // Adjust the distribution for the next meal
        this.adjustMealDistribution(mealSize);
  
        const adjustment = this.getRandomTimeAdjustment();
        this.nextMealTime = currentSimulatedTime + this.mealInterval + adjustment;
  
        if (this.nextMealTime >= this.stopEatingHour) {
          this.nextMealTime = null;
          console.log(`[${this.currentArchetype.name}] End of eating hours. Meals will resume tomorrow.`);
        } else {
          console.log(
            `[${this.currentArchetype.name}] Next meal scheduled at ${this.formatTime(this.nextMealTime)}.`
          );
        }
      }
  
      console.log(
        `[${this.currentArchetype.name}] Current Simulated Time: ${this.formatTime(currentSimulatedTime)} - Waiting for next meal at ${
          this.nextMealTime ? this.formatTime(this.nextMealTime) : 'N/A'
        }.`
      );
    }, this.timeAcceleration);
  }

  
  
  chooseMealSize(distribution) {
    const randomValue = Math.random();
    if (randomValue < distribution[0]) return 'Small';
    if (randomValue < distribution[0] + distribution[1]) return 'Medium';
    if (randomValue < distribution[0] + distribution[1] + distribution[2]) return 'Big';
    return 'Absolute Max Limit';
  }

  adjustMealDistribution(lastMealSize) {
    const adjustmentFactor = 0.025; // Amount to increase or decrease the probability in meal distribution
  
    if (lastMealSize === 'Small') {
      this.mealDistribution[0] = Math.max(this.mealDistribution[0] - adjustmentFactor, 0);
      this.redistributeProbability(0, adjustmentFactor);
    } else if (lastMealSize === 'Medium') {
      this.mealDistribution[1] = Math.max(this.mealDistribution[1] - adjustmentFactor, 0);
      this.redistributeProbability(1, adjustmentFactor);
    } else if (lastMealSize === 'Big') {
      this.mealDistribution[2] = Math.max(this.mealDistribution[2] - adjustmentFactor, 0);
      this.redistributeProbability(2, adjustmentFactor);
    } else if (lastMealSize === 'Absolute Max Limit') {
      this.mealDistribution[3] = Math.max(this.mealDistribution[3] - adjustmentFactor, 0);
      this.redistributeProbability(3, adjustmentFactor);
    }
  
    console.log(`[${this.currentArchetype.name}] Updated meal distribution for next meal: ${this.mealDistribution}`);
  }

  
  redistributeProbability(excludeIndex, adjustmentFactor) {
    // Redistribute adjustmentFactor across other meal sizes
    const remainingIndices = [0, 1, 2, 3].filter(i => i !== excludeIndex);
    const remainingTotal = remainingIndices.reduce((sum, i) => sum + this.mealDistribution[i], 0);
  
    // Adjust remaining meal probabilities proportionally
    remainingIndices.forEach(i => {
      const increment = (adjustmentFactor * this.mealDistribution[i]) / remainingTotal;
      this.mealDistribution[i] = Math.min(this.mealDistribution[i] + increment, 1);
    });
  
    // Normalize to ensure probabilities sum to 1
    const total = this.mealDistribution.reduce((sum, value) => sum + value, 0);
    this.mealDistribution = this.mealDistribution.map(value => value / total);
  }
  

  getRandomTimeAdjustment() {
    const randomValue = Math.random();
    let cumulativeProbability = 0;
    for (const { adjustment, probability } of timeAdjustmentDistribution) {
      cumulativeProbability += probability;
      if (randomValue < cumulativeProbability) {
        return adjustment;
      }
    }
    return 0; // Fallback if probabilities don’t sum to exactly 1
  }

  // Epochs keep track of elapsed time per simulation speed - so that it can be used to calculate accurate simulated time
  updateEpoch() {
    const currentRealTime = Date.now();
    const elapsedRealTime = currentRealTime - this.currentEpoch_startTime; // in ms
    
    if (!this.timeAcceleration) {
      this.timeAcceleration = TIME_ACCELERATION;
    }

    if (elapsedRealTime < 0) {
      console.warn("gamma Warning: Current real time is earlier than epoch start time.");
      return;
    }

    // Accumulate elapsed real time for the current timeAcceleration
    if (this.epochs.hasOwnProperty(this.timeAcceleration)) {
      this.epochs[this.timeAcceleration] += elapsedRealTime;
    } else {
      this.epochs[this.timeAcceleration] = elapsedRealTime;
    }

    // Update the start time for the next epoch
    this.currentEpoch_startTime = currentRealTime;

    // // Consolidated debug logs
    // console.debug(`
    //   gamma updateEpoch() called
    //   gamma Current Real Time: ${currentRealTime}
    //   gamma Current Epoch Start Time: ${this.currentEpoch_startTime}
    //   gamma Elapsed Real Time since last epoch (ms): ${elapsedRealTime}
    //   gamma Updated epochs[${this.timeAcceleration}] to ${this.epochs[this.timeAcceleration]} ms
    //   gamma Updated currentEpoch_startTime to ${this.currentEpoch_startTime}
    //   gamma -------------------------------------------
    // `);
  }


  
  getCurrentSimulatedTime() {
    // Calculate simulated time for current Epoch
    // const normalization_factor = this.defaultTimeAcceleration / this.timeAcceleration;

    const currentRealTime = Date.now(); // Current real time

    const currentEpochElapsedRealTime = currentRealTime - this.currentEpoch_startTime; // Elapsed real time (ms)

    const currentEpochElapsedSimulatedHours = currentEpochElapsedRealTime / this.timeAcceleration;

    const currentEpochSimulatedTime = this.simulationStartTime + currentEpochElapsedSimulatedHours;

    // Integrate previous Epochs on different time accelerations
    const parsedEpochs = Object.entries(this.epochs).reduce((result, [key, value]) => {
        if (value != null && value !== undefined && value !== this.timeAcceleration && value !== 1) {
            let epoch_normalization_factor = this.defaultTimeAcceleration / key;
            result[key] = (epoch_normalization_factor * value) / this.defaultTimeAcceleration;
        }
        return result;
    }, {});

    // Sum all values in parsedEpochs and add to the current simulated time
    const parsedEpochsSum = Object.values(parsedEpochs).reduce((sum, value) => sum + value, 0);

    const totalSimulatedTime = (parsedEpochsSum + currentEpochSimulatedTime) % 24;

    // // Logs
    // console.log(`phi normalization_factor: ${normalization_factor}`);
    // console.log(`phi currentRealTime: ${currentRealTime}`);
    // console.log(`phi currentEpochElapsedRealTime: ${currentEpochElapsedRealTime}`);
    // console.log(`phi currentEpochElapsedSimulatedHours: ${currentEpochElapsedSimulatedHours}`);
    // console.log(`phi currentEpochSimulatedTime (before mod): ${currentEpochSimulatedTime}`);
    // Object.entries(this.epochs).forEach(([key, value]) => {
    //     if (value != null && value !== undefined && value !== this.timeAcceleration && value !== 1) {
    //         let epoch_normalization_factor = this.defaultTimeAcceleration / key;
    //         console.log(`phi epoch[${key}] normalization_factor: ${epoch_normalization_factor}, value: ${value}`);
    //         console.log(`phi epoch[${key}] contribution: ${(epoch_normalization_factor * value) / this.defaultTimeAcceleration}`);
    //     }
    // });
    // console.log(`phi Parsed epochs:`, parsedEpochs);
    // console.log(`phi Parsed epochs total sum: ${parsedEpochsSum}`);
    // console.log(`phi totalSimulatedTime (after mod): ${totalSimulatedTime}`);

    return totalSimulatedTime;
}

  
  

  formatTime(time) {
    const hour = Math.floor(time);
    const minutes = Math.floor((time - hour) * 60);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = ((hour + 11) % 12) + 1;
    return `${formattedHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  addMeal(size) {
    const mealAmount = {
      'Small': 0.1,
      'Medium': 0.3,
      'Big': 0.7,
      'Absolute Max Limit': 1.0,
    };
    const amount = mealAmount[size];
    this.worker.postMessage({ type: 'ADD_MEAL', amount });
    console.log(`${this.currentArchetype.name}] Added a ${size} meal with amount: ${amount}`);
  }
}

export { ArchetypeSimulator, TIME_ACCELERATION };
