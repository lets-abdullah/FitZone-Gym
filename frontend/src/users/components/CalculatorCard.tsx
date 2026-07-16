import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scale, Flame, Beef, Droplet, Check } from 'lucide-react';

type CalculatorTab = 'bmi' | 'calorie' | 'protein' | 'water';

export default function CalculatorCard() {
  const [activeTab, setActiveTab] = useState<CalculatorTab>('bmi');

  // State variables for calculations
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [weight, setWeight] = useState<number>(75); // kg or lbs
  const [height, setHeight] = useState<number>(175); // cm or inches
  const [age, setAge] = useState<number>(28);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activity, setActivity] = useState<number>(1.55); // Multiplier
  const [goal, setGoal] = useState<'cut' | 'maintain' | 'bulk'>('maintain');
  const [exerciseTime, setExerciseTime] = useState<number>(45); // minutes

  // Activity labels
  const activityLevels = [
    { label: 'Sedentary (No Exercise)', multiplier: 1.2 },
    { label: 'Lightly Active (1-2 days/wk)', multiplier: 1.375 },
    { label: 'Moderately Active (3-4 days/wk)', multiplier: 1.55 },
    { label: 'Highly Active (6-7 days/wk)', multiplier: 1.725 },
    { label: 'Extreme Athlete (Professional)', multiplier: 1.9 },
  ];

  // Helper functions to sanitize and swap units
  const handleUnitSystemChange = (system: 'metric' | 'imperial') => {
    if (system === unitSystem) return;
    setUnitSystem(system);
    if (system === 'imperial') {
      // Convert 75kg to 165lbs, 175cm to 69inches
      setWeight(Math.round(weight * 2.20462));
      setHeight(Math.round(height / 2.54));
    } else {
      // Convert lbs to kg, inches to cm
      setWeight(Math.round(weight / 2.20462));
      setHeight(Math.round(height * 2.54));
    }
  };

  // 1. BMI CALCULATOR METRICS
  const calculateBMI = (): { bmi: number; label: string; color: string; percent: number } => {
    let bmiValue = 0;
    if (unitSystem === 'metric') {
      const heightInMeters = height / 100;
      bmiValue = heightInMeters > 0 ? weight / (heightInMeters * heightInMeters) : 0;
    } else {
      bmiValue = height > 0 ? (weight / (height * height)) * 703 : 0;
    }

    let label = 'Healthy Weight';
    let color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    let percent = 50;

    if (bmiValue < 18.5) {
      label = 'Underweight';
      color = 'text-blue-700 bg-blue-50 border-blue-200';
      percent = 25;
    } else if (bmiValue >= 18.5 && bmiValue < 25) {
      label = 'Normal / Athlete Baseline';
      color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
      percent = 50;
    } else if (bmiValue >= 25 && bmiValue < 30) {
      label = 'Overweight';
      color = 'text-amber-700 bg-amber-50 border-amber-200';
      percent = 75;
    } else if (bmiValue >= 30) {
      label = 'Obese Class';
      color = 'text-red-700 bg-red-50 border-red-200';
      percent = 90;
    }

    return { bmi: parseFloat(bmiValue.toFixed(1)), label, color, percent };
  };

  // 2. DAILY CALORIE CALCULATOR (TDEE - Mifflin-St Jeor)
  const calculateTDEE = (): { bmr: number; tdee: number; deficit: number; surplus: number } => {
    let wKg = weight;
    let hCm = height;
    if (unitSystem === 'imperial') {
      wKg = weight / 2.20462;
      hCm = height * 2.54;
    }

    let bmr = 0;
    if (gender === 'male') {
      bmr = 10 * wKg + 6.25 * hCm - 5 * age + 5;
    } else {
      bmr = 10 * wKg + 6.25 * hCm - 5 * age - 161;
    }

    const tdee = Math.round(bmr * activity);
    const deficit = Math.round(tdee * 0.8); // 20% deficit
    const surplus = Math.round(tdee * 1.1); // 10% surplus

    return { bmr: Math.round(bmr), tdee, deficit, surplus };
  };

  // 3. PROTEIN INTAKE CALCULATOR
  const calculateProtein = (): { targetGrams: number; lowerLimit: number; upperLimit: number } => {
    let wKg = weight;
    if (unitSystem === 'imperial') {
      wKg = weight / 2.20462;
    }

    let coeff = 1.8; // Maintain
    if (goal === 'cut') coeff = 2.2; 
    if (goal === 'bulk') coeff = 2.0; 

    const targetGrams = Math.round(wKg * coeff);
    const lowerLimit = Math.round(wKg * (coeff - 0.2));
    const upperLimit = Math.round(wKg * (coeff + 0.3));

    return { targetGrams, lowerLimit, upperLimit };
  };

  // 4. WATER INTAKE CALCULATOR
  const calculateWater = (): { liters: string; ounces: string; cups: number } => {
    let wKg = weight;
    if (unitSystem === 'imperial') {
      wKg = weight / 2.20462;
    }

    let baselineMl = wKg * 35;
    let exerciseOverheadMl = exerciseTime * 15;

    const totalMl = baselineMl + exerciseOverheadMl;
    const liters = (totalMl / 1000).toFixed(2);
    const totalOunces = Math.round((totalMl / 1000) * 33.814);
    const cups = Math.round(totalOunces / 8);

    return { liters, ounces: totalOunces.toString(), cups };
  };

  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden p-6 md:p-8 shadow-sm">
      
      {/* Unit system toggle & Tabs header */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-zinc-150 pb-5 mb-6 gap-4">
        {/* Toggle system */}
        <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200 w-full sm:w-auto">
          <button
            id="unit-metric-btn"
            onClick={() => handleUnitSystemChange('metric')}
            className={`flex-1 sm:flex-initial px-4 py-2 font-mono text-xs uppercase tracking-wider rounded-lg font-bold transition-all ${
              unitSystem === 'metric' ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Metric (kg/cm)
          </button>
          <button
            id="unit-imperial-btn"
            onClick={() => handleUnitSystemChange('imperial')}
            className={`flex-1 sm:flex-initial px-4 py-2 font-mono text-xs uppercase tracking-wider rounded-lg font-bold transition-all ${
              unitSystem === 'imperial' ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Imperial (lbs/in)
          </button>
        </div>

        <span className="text-xs text-zinc-450 font-mono tracking-widest uppercase font-bold">
          Client-Side Adaptation Models
        </span>
      </div>

      {/* Calculator Grid System */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side Tab Selectors */}
        <div className="lg:col-span-4 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-3 lg:pb-0 scrollbar-none">
          <button
            id="tab-bmi"
            onClick={() => setActiveTab('bmi')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-display text-sm tracking-wide font-bold transition-all cursor-pointer flex-shrink-0 lg:flex-shrink ${
              activeTab === 'bmi'
                ? 'bg-amber-50 border-l-4 border-gold-600 text-gold-800 pl-3 w-auto lg:w-full shadow-sm'
                : 'text-zinc-650 hover:text-zinc-900 bg-zinc-50/50 hover:bg-zinc-100/75 border border-zinc-150'
            }`}
          >
            <Scale size={18} className="text-gold-600" />
            <span className="whitespace-nowrap">1. BMI Index Calculator</span>
          </button>

          <button
            id="tab-calorie"
            onClick={() => setActiveTab('calorie')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-display text-sm tracking-wide font-bold transition-all cursor-pointer flex-shrink-0 lg:flex-shrink ${
              activeTab === 'calorie'
                ? 'bg-amber-50 border-l-4 border-gold-600 text-gold-800 pl-3 w-auto lg:w-full shadow-sm'
                : 'text-zinc-650 hover:text-zinc-900 bg-zinc-50/50 hover:bg-zinc-100/75 border border-zinc-150'
            }`}
          >
            <Flame size={18} className="text-gold-600" />
            <span className="whitespace-nowrap">2. TDEE Daily Calories</span>
          </button>

          <button
            id="tab-protein"
            onClick={() => setActiveTab('protein')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-display text-sm tracking-wide font-bold transition-all cursor-pointer flex-shrink-0 lg:flex-shrink ${
              activeTab === 'protein'
                ? 'bg-amber-50 border-l-4 border-gold-600 text-gold-800 pl-3 w-auto lg:w-full shadow-sm'
                : 'text-zinc-650 hover:text-zinc-900 bg-zinc-50/50 hover:bg-zinc-100/75 border border-zinc-150'
            }`}
          >
            <Beef size={18} className="text-gold-600" />
            <span className="whitespace-nowrap">3. Protein Allocation</span>
          </button>

          <button
            id="tab-water"
            onClick={() => setActiveTab('water')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-display text-sm tracking-wide font-bold transition-all cursor-pointer flex-shrink-0 lg:flex-shrink ${
              activeTab === 'water'
                ? 'bg-amber-50 border-l-4 border-gold-600 text-gold-800 pl-3 w-auto lg:w-full shadow-sm'
                : 'text-zinc-650 hover:text-zinc-900 bg-zinc-50/50 hover:bg-zinc-100/75 border border-zinc-150'
            }`}
          >
            <Droplet size={18} className="text-gold-600" />
            <span className="whitespace-nowrap">4. Sweat Water Index</span>
          </button>
        </div>

        {/* Right Side Input Controls + Output Result Panel */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* BMI Tab Layout */}
              {activeTab === 'bmi' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Inputs */}
                  <div className="space-y-5">
                    <h3 className="font-display font-black text-lg text-zinc-900">Body Mass Index Settings</h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-mono text-zinc-500">
                        <span>Body Weight:</span>
                        <span className="text-zinc-900 font-bold">{weight} {unitSystem === 'metric' ? 'kg' : 'lbs'}</span>
                      </div>
                      <input
                        id="bmi-weight-slider"
                        type="range"
                        min={unitSystem === 'metric' ? 35 : 80}
                        max={unitSystem === 'metric' ? 180 : 400}
                        value={weight}
                        onChange={(e) => setWeight(Number(e.target.value))}
                        className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-mono text-zinc-500">
                        <span>Body Height:</span>
                        <span className="text-zinc-900 font-bold">{height} {unitSystem === 'metric' ? 'cm' : 'inches'}</span>
                      </div>
                      <input
                        id="bmi-height-slider"
                        type="range"
                        min={unitSystem === 'metric' ? 120 : 48}
                        max={unitSystem === 'metric' ? 220 : 88}
                        value={height}
                        onChange={(e) => setHeight(Number(e.target.value))}
                        className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                      />
                    </div>
                  </div>

                  {/* Calculations output */}
                  <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-inner">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1 font-bold">
                        Calculated Score
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl md:text-5xl font-display font-black text-gold-700 tracking-tight">
                          {calculateBMI().bmi}
                        </span>
                        <span className="text-xs text-zinc-500 font-mono">BMI Units</span>
                      </div>
                    </div>

                    <div className={`p-3.5 rounded-xl border text-xs font-bold shadow-sm ${calculateBMI().color}`}>
                      Category: {calculateBMI().label}
                    </div>

                    <div className="space-y-1 text-[11px] text-zinc-500 font-mono">
                      <p>• Underweight: Under 18.5</p>
                      <p>• Healthy Weight: 18.5 – 24.9</p>
                      <p>• Overweight Range: 25.0 – 29.9</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TDEE Calories Tab Layout */}
              {activeTab === 'calorie' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Inputs */}
                  <div className="space-y-4">
                    <h3 className="font-display font-black text-lg text-zinc-900">Daily Caloric Baseline</h3>
                    
                    {/* Weight & Height */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-extrabold text-zinc-550 tracking-wider">Weight</label>
                        <input
                          id="calorie-weight"
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(Math.max(0, Number(e.target.value)))}
                          className="w-full bg-white border border-zinc-200 text-zinc-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500 font-mono font-bold shadow-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-extrabold text-zinc-550 tracking-wider">Height</label>
                        <input
                          id="calorie-height"
                          type="number"
                          value={height}
                          onChange={(e) => setHeight(Math.max(0, Number(e.target.value)))}
                          className="w-full bg-white border border-zinc-200 text-zinc-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500 font-mono font-bold shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Gender and Age */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-extrabold text-zinc-550 tracking-wider">Age</label>
                        <input
                          id="calorie-age"
                          type="number"
                          value={age}
                          min={1}
                          max={120}
                          onChange={(e) => setAge(Math.max(1, Number(e.target.value)))}
                          className="w-full bg-white border border-zinc-200 text-zinc-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500 font-mono font-bold shadow-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-extrabold text-zinc-550 tracking-wider">Gender</label>
                        <div className="flex bg-zinc-100 border border-zinc-200 rounded-lg p-0.5">
                          <button
                            id="gender-male-btn"
                            type="button"
                            onClick={() => setGender('male')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all uppercase ${
                              gender === 'male' ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-500'
                            }`}
                          >
                            M
                          </button>
                          <button
                            id="gender-female-btn"
                            type="button"
                            onClick={() => setGender('female')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all uppercase ${
                              gender === 'female' ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-500'
                            }`}
                          >
                            F
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Activity dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-extrabold text-zinc-550 tracking-wider">Weekly Activity Spectrum</label>
                      <select
                        id="calorie-activity"
                        value={activity}
                        onChange={(e) => setActivity(Number(e.target.value))}
                        className="w-full bg-white border border-zinc-200 text-zinc-800 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-zinc-500 font-sans shadow-sm"
                      >
                        {activityLevels.map((lvl) => (
                          <option key={lvl.multiplier} value={lvl.multiplier}>
                            {lvl.label} (x{lvl.multiplier})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Calculations output */}
                  <div className="space-y-3">
                    <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 shadow-sm">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-0.5 font-bold">
                        TDEE (Maintenance Calories)
                      </span>
                      <span className="text-2xl font-display font-black text-zinc-900 tracking-tight">
                        {calculateTDEE().tdee} <span className="text-xs text-zinc-500 font-sans font-normal">kcal/day</span>
                      </span>
                    </div>

                    <div className="bg-red-50/60 border border-red-200 rounded-2xl p-4 shadow-sm animate-fade-in">
                      <span className="text-[10px] font-mono text-red-650 uppercase tracking-widest block mb-0.5 font-bold">
                        Body Fat Loss Deficit (-20%)
                      </span>
                      <span className="text-xl font-display font-black text-red-700 tracking-tight">
                        {calculateTDEE().deficit} <span className="text-xs text-red-600 font-sans font-normal">kcal/day</span>
                      </span>
                    </div>

                    <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 shadow-sm animate-fade-in">
                      <span className="text-[10px] font-mono text-emerald-650 uppercase tracking-widest block mb-0.5 font-bold">
                        Physique Muscle Gain Surplus (+10%)
                      </span>
                      <span className="text-xl font-display font-black text-emerald-700 tracking-tight">
                        {calculateTDEE().surplus} <span className="text-xs text-emerald-600 font-sans font-normal">kcal/day</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Protein Allocation Tab Layout */}
              {activeTab === 'protein' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Inputs */}
                  <div className="space-y-4">
                    <h3 className="font-display font-black text-lg text-zinc-900">Protein Distribution Matrix</h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-mono text-zinc-500">
                        <span>Body Weight:</span>
                        <span className="text-zinc-900 font-bold">{weight} {unitSystem === 'metric' ? 'kg' : 'lbs'}</span>
                      </div>
                      <input
                        id="protein-weight"
                        type="range"
                        min={unitSystem === 'metric' ? 35 : 80}
                        max={unitSystem === 'metric' ? 180 : 400}
                        value={weight}
                        onChange={(e) => setWeight(Number(e.target.value))}
                        className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-extrabold text-zinc-550 tracking-wider block mb-1">Body Transformation Goal</label>
                      <div className="grid grid-cols-3 gap-2 bg-zinc-100 border border-zinc-200 rounded-xl p-1">
                        <button
                          id="goal-cut-btn"
                          type="button"
                          onClick={() => setGoal('cut')}
                          className={`py-2 text-[10px] uppercase font-black rounded-lg transition-all ${
                            goal === 'cut' ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-550 hover:text-zinc-900'
                          }`}
                        >
                          Fat Loss
                        </button>
                        <button
                          id="goal-maintain-btn"
                          type="button"
                          onClick={() => setGoal('maintain')}
                          className={`py-2 text-[10px] uppercase font-black rounded-lg transition-all ${
                            goal === 'maintain' ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-550 hover:text-zinc-900'
                          }`}
                        >
                          Maintain
                        </button>
                        <button
                          id="goal-bulk-btn"
                          type="button"
                          onClick={() => setGoal('bulk')}
                          className={`py-2 text-[10px] uppercase font-black rounded-lg transition-all ${
                            goal === 'bulk' ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-550 hover:text-zinc-900'
                          }`}
                        >
                          Build Muscle
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Calculations output */}
                  <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-inner">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-0.5 font-bold">
                        Target Protein Protein Goal
                      </span>
                      <span className="text-4xl md:text-5xl font-display font-black text-gold-700 tracking-tight block">
                        {calculateProtein().targetGrams} <span className="text-base text-zinc-650 font-sans font-normal">grams / day</span>
                      </span>
                    </div>

                    <div className="space-y-1.5 border-t border-zinc-200 pt-3 text-xs text-zinc-650 font-mono">
                      <div className="flex justify-between">
                        <span>Safe baseline:</span>
                        <span className="text-zinc-800 font-bold">{calculateProtein().lowerLimit}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>High loading ceiling:</span>
                        <span className="text-zinc-800 font-bold">{calculateProtein().upperLimit}g</span>
                      </div>
                    </div>
                    
                    <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                      Allows optimal skeletal building. Best distributed across 4-5 high-quality bio-available meals.
                    </p>
                  </div>
                </div>
              )}

              {/* Water Intake Tab Layout */}
              {activeTab === 'water' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Inputs */}
                  <div className="space-y-4">
                    <h3 className="font-display font-black text-lg text-zinc-900">Hydration Fluid Adjustor</h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-mono text-zinc-500">
                        <span>Current Body weight:</span>
                        <span className="text-zinc-900 font-bold">{weight} {unitSystem === 'metric' ? 'kg' : 'lbs'}</span>
                      </div>
                      <input
                        id="water-weight"
                        type="range"
                        min={unitSystem === 'metric' ? 35 : 80}
                        max={unitSystem === 'metric' ? 180 : 400}
                        value={weight}
                        onChange={(e) => setWeight(Number(e.target.value))}
                        className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-mono text-zinc-500">
                        <span>Intense Sweat Training Time:</span>
                        <span className="text-zinc-900 font-bold">{exerciseTime} minutes</span>
                      </div>
                      <input
                        id="water-exercise-slider"
                        type="range"
                        min={0}
                        max={180}
                        step={15}
                        value={exerciseTime}
                        onChange={(e) => setExerciseTime(Number(e.target.value))}
                        className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                      />
                    </div>
                  </div>

                  {/* Calculations output */}
                  <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-inner">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-0.5 font-bold">
                        Optimum Daily Water Target
                      </span>
                      <span className="text-4xl md:text-5xl font-display font-black text-blue-700 tracking-tight block">
                        {calculateWater().liters} <span className="text-base text-zinc-650 font-sans font-normal">Liters</span>
                      </span>
                    </div>

                    <div className="space-y-1.5 border-t border-zinc-200 pt-3 text-xs text-zinc-650 font-mono">
                      <div className="flex justify-between">
                        <span>Ounce equivalent:</span>
                        <span className="text-zinc-800 font-bold">{calculateWater().ounces} fl.oz</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Standard 8oz cups:</span>
                        <span className="text-zinc-800 font-bold">~ {calculateWater().cups} cups</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-zinc-550 leading-relaxed">
                      Sipping clean electrolytes before, during, and directly following intensive heat training offsets high salt losses.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Reset / Info footer */}
          <div className="mt-8 border-t border-zinc-150 pt-4 flex items-center justify-between text-xs text-zinc-500 font-mono pr-2">
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-emerald-600" /> Instant client computations
            </span>
            <span>FitZone Metabolic Science Lab</span>
          </div>

        </div>

      </div>

    </div>
  );
}
