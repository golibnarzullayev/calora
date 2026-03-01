export interface UserMetrics {
  age: number;
  weight: number;
  height: number;
  workoutFrequency: number;
  goal: "lose" | "maintain" | "gain";
  isMale?: boolean;
}

export interface CalorieResult {
  bmr: number;
  tdee: number;
  dailyCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export class CalorieCalculator {
  static calculateBMR(metrics: UserMetrics): number {
    const { age, weight, height, isMale = true } = metrics;

    if (isMale) {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  }

  static getActivityMultiplier(workoutFrequency: number): number {
    if (workoutFrequency === 0) return 1.2;
    if (workoutFrequency <= 3) return 1.35;
    if (workoutFrequency <= 4) return 1.45;
    if (workoutFrequency <= 6) return 1.6;
    return 1.2;
  }

  static calculateTDEE(bmr: number, workoutFrequency: number): number {
    const multiplier = this.getActivityMultiplier(workoutFrequency);
    return bmr * multiplier;
  }

  static adjustForGoal(
    tdee: number,
    goal: "lose" | "maintain" | "gain",
  ): number {
    if (goal === "lose") return tdee - 400;
    if (goal === "gain") return tdee + 250;
    return tdee;
  }

  static calculateMacros(
    dailyCalories: number,
    weight: number,
    goal: "lose" | "maintain" | "gain",
  ): { protein: number; carbs: number; fat: number } {
    let proteinPerKg = 1.6;
    if (goal === "lose") proteinPerKg = 2.0;
    if (goal === "gain") proteinPerKg = 2.2;

    const protein = weight * proteinPerKg;
    const proteinCalories = protein * 4;

    const fatCalories = dailyCalories * 0.25;
    const fat = fatCalories / 9;

    const carbCalories = dailyCalories - proteinCalories - fatCalories;
    const carbs = carbCalories / 4;

    return {
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
    };
  }

  static calculate(metrics: UserMetrics): CalorieResult {
    const bmr = this.calculateBMR(metrics);
    const tdee = this.calculateTDEE(bmr, metrics.workoutFrequency);
    const dailyCalories = this.adjustForGoal(tdee, metrics.goal);
    const macros = this.calculateMacros(
      dailyCalories,
      metrics.weight,
      metrics.goal,
    );

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      dailyCalories: Math.round(dailyCalories),
      macros,
    };
  }
}
