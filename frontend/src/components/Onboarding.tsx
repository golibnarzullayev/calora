import React, { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { userAPI, authAPI } from "../services/api";
import { UZ } from "../constants/uz";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "../hooks/useToast";
import { getErrorMessage } from "../utils/errorHandler";
import { PhoneInput } from "./PhoneInput";

export const Onboarding: React.FC<{ telegramId: string | null }> = ({
  telegramId,
}) => {
  const [step, setStep] = useState(0);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    password: "",
    age: "20",
    weight: "70",
    height: "170",
    workoutFrequency: "3",
    goal: "maintain" as "lose" | "maintain" | "gain",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastSwipeTime, setLastSwipeTime] = useState(0);
  const { setUser, setCalorieTarget, setOnboarded } = useAppStore();
  const { error: showError, success: showSuccess } = useToast();

  const isWebUser = !telegramId;

  const getSteps = () => {
    if (isLoginMode) {
      // Login steps for web users
      return [
        { label: UZ.onboarding.phone, key: "phoneNumber", type: "tel" },
        { label: "Parolingiz", key: "password", type: "password" },
      ];
    }

    // Registration steps
    const registrationSteps = [
      { label: UZ.onboarding.firstName, key: "firstName", type: "text" },
      { label: UZ.onboarding.lastName, key: "lastName", type: "text" },
      { label: UZ.onboarding.phone, key: "phoneNumber", type: "tel" },
    ];

    // Add password field only for web users
    if (isWebUser) {
      registrationSteps.push({
        label: "Parolingiz",
        key: "password",
        type: "password",
      });
    }

    registrationSteps.push(
      { label: UZ.onboarding.age, key: "age", type: "number" },
      { label: UZ.onboarding.weight, key: "weight", type: "number" },
      { label: UZ.onboarding.height, key: "height", type: "number" },
      {
        label: UZ.onboarding.workoutFrequency,
        key: "workoutFrequency",
        type: "select",
      },
      { label: UZ.onboarding.goal, key: "goal", type: "goal" },
    );

    return registrationSteps;
  };

  const steps = getSteps();

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      await handleFinish();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    setError("");
    try {
      let response;

      if (isLoginMode) {
        // Web user login
        response = await authAPI.login(formData.phoneNumber, formData.password);
        localStorage.setItem("authToken", response.data.token);
        setUser(response.data.user);
        setCalorieTarget(response.data.calorieTarget);
        setOnboarded(true);
        showSuccess(UZ.success.loggedIn);
        return;
      } else if (telegramId && telegramId !== "") {
        // Telegram registration - go directly to dashboard
        response = await userAPI.createOrUpdate({
          telegramId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          age: parseInt(formData.age),
          weight: parseFloat(formData.weight),
          height: parseInt(formData.height),
          workoutFrequency: parseInt(formData.workoutFrequency),
          goal: formData.goal,
        });
        setUser(response.data.user);
        setCalorieTarget(response.data.calorieTarget);
        setOnboarded(true);
        showSuccess(UZ.success.registered);
      } else {
        // Web registration with password - redirect to login mode
        response = await authAPI.register({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          age: parseInt(formData.age),
          weight: parseFloat(formData.weight),
          height: parseInt(formData.height),
          workoutFrequency: parseInt(formData.workoutFrequency),
          goal: formData.goal,
        });
        // Reset form and switch to login mode
        setFormData({
          firstName: "",
          lastName: "",
          phoneNumber: formData.phoneNumber,
          password: "",
          age: "20",
          weight: "70",
          height: "170",
          workoutFrequency: "3",
          goal: "maintain",
        });
        setIsLoginMode(true);
        setStep(0);
        setError("");
        showSuccess(UZ.success.registered);
      }
    } catch (err: any) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const currentStep = steps[step];

  return (
    <div className="h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center justify-center px-4 py-2 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse"></div>

      <div className="w-full max-w-sm relative z-10">
        {/* Progress indicator */}
        <div className="mb-4">
          <div className="flex justify-center gap-1.5 mb-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index < step
                    ? "bg-white w-6"
                    : index === step
                      ? "bg-white w-8"
                      : "bg-white bg-opacity-30 w-1.5"
                }`}
              ></div>
            ))}
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white mb-0.5">
              {isWebUser && isLoginMode ? "Kirish" : UZ.onboarding.welcome}
            </h1>
            <p className="text-blue-100 text-xs">
              {step + 1} / {steps.length}
            </p>
          </div>
        </div>

        {/* Main card with enhanced styling */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl backdrop-blur-sm border border-white dark:border-gray-700 border-opacity-20 animate-slide-up">
          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-base">
              {error}
            </div>
          )}

          <label className="block text-2xl font-bold text-gray-800 dark:text-white mb-6">
            {currentStep.label}
          </label>

          {currentStep.type === "text" && (
            <div className="space-y-3">
              <input
                type="text"
                value={formData[currentStep.key as keyof typeof formData]}
                onChange={(e) =>
                  handleInputChange(currentStep.key, e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleNext();
                  }
                }}
                placeholder={currentStep.label}
                className="w-full px-6 py-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border-2 border-gray-200 dark:border-gray-600 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium transition-all"
                autoFocus
              />
            </div>
          )}

          {currentStep.type === "password" && (
            <div className="space-y-3">
              <input
                type="password"
                value={formData[currentStep.key as keyof typeof formData]}
                onChange={(e) =>
                  handleInputChange(currentStep.key, e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleNext();
                  }
                }}
                placeholder={currentStep.label}
                className="w-full px-6 py-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border-2 border-gray-200 dark:border-gray-600 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium transition-all"
                autoFocus
              />
            </div>
          )}

          {currentStep.type === "tel" && (
            <div className="space-y-3">
              <PhoneInput
                value={formData[currentStep.key as keyof typeof formData]}
                onChange={(value) => handleInputChange(currentStep.key, value)}
                placeholder="+998 (XX) XXX-XX-XX"
                className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border-2 border-gray-200 dark:border-gray-600 text-lg font-medium"
              />
            </div>
          )}

          {currentStep.type === "number" && (
            <div className="space-y-6">
              <div
                className="flex-1 text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-3xl py-10 px-6 cursor-grab active:cursor-grabbing select-none overflow-hidden relative"
                onWheel={(e: React.WheelEvent<HTMLDivElement>) => {
                  const now = Date.now();
                  if (now - lastSwipeTime < 500) return;

                  const current =
                    parseInt(
                      formData[
                        currentStep.key as keyof typeof formData
                      ] as string,
                    ) || 0;
                  const direction = e.deltaY > 0 ? 1 : -1;
                  const newValue = current + direction;

                  let shouldPrevent = false;

                  if (
                    currentStep.key === "age" &&
                    newValue >= 18 &&
                    newValue <= 80
                  ) {
                    handleInputChange(currentStep.key, newValue);
                    setLastSwipeTime(now);
                    shouldPrevent = true;
                  } else if (
                    currentStep.key === "weight" &&
                    newValue >= 40 &&
                    newValue <= 200
                  ) {
                    handleInputChange(currentStep.key, newValue);
                    setLastSwipeTime(now);
                    shouldPrevent = true;
                  } else if (
                    currentStep.key === "height" &&
                    newValue >= 140 &&
                    newValue <= 220
                  ) {
                    handleInputChange(currentStep.key, newValue);
                    setLastSwipeTime(now);
                    shouldPrevent = true;
                  }

                  if (shouldPrevent) {
                    (e as any).preventDefault?.();
                  }
                }}
                onTouchStart={(e) => {
                  if (e.touches.length === 1) {
                    const touch = e.touches[0];
                    const startY = touch.clientY;

                    const handleTouchEnd = (endEvent: TouchEvent) => {
                      const now = Date.now();
                      if (now - lastSwipeTime < 500) {
                        document.removeEventListener(
                          "touchend",
                          handleTouchEnd,
                        );
                        return;
                      }

                      const endY = endEvent.changedTouches[0].clientY;
                      const diff = startY - endY;
                      const current =
                        parseInt(
                          formData[
                            currentStep.key as keyof typeof formData
                          ] as string,
                        ) || 0;

                      if (Math.abs(diff) > 50) {
                        const direction = diff > 0 ? 1 : -1;
                        const newValue = current + direction;

                        if (
                          currentStep.key === "age" &&
                          newValue >= 18 &&
                          newValue <= 80
                        ) {
                          handleInputChange(currentStep.key, newValue);
                          setLastSwipeTime(now);
                        } else if (
                          currentStep.key === "weight" &&
                          newValue >= 40 &&
                          newValue <= 200
                        ) {
                          handleInputChange(currentStep.key, newValue);
                          setLastSwipeTime(now);
                        } else if (
                          currentStep.key === "height" &&
                          newValue >= 140 &&
                          newValue <= 220
                        ) {
                          handleInputChange(currentStep.key, newValue);
                          setLastSwipeTime(now);
                        }
                      }

                      document.removeEventListener("touchend", handleTouchEnd);
                    };

                    document.addEventListener("touchend", handleTouchEnd);
                  }
                }}
              >
                {/* Top faded value */}
                <div className="text-2xl font-bold text-gray-400 opacity-40 mb-1 transition-all">
                  {parseInt(
                    formData[
                      currentStep.key as keyof typeof formData
                    ] as string,
                  ) - 1 || 0}
                </div>

                {/* Current value - highlighted */}
                <div className="text-6xl font-black text-blue-600 dark:text-blue-400 mb-3">
                  {formData[currentStep.key as keyof typeof formData]}
                </div>
                <p className="text-base text-gray-600 dark:text-gray-400 font-medium">
                  {currentStep.key === "age" && "Yoshingiz"}
                  {currentStep.key === "weight" && "kg"}
                  {currentStep.key === "height" && "cm"}
                </p>

                {/* Bottom faded value */}
                <div className="text-3xl font-bold text-gray-400 opacity-40 transition-all">
                  {parseInt(
                    formData[
                      currentStep.key as keyof typeof formData
                    ] as string,
                  ) + 1 || 0}
                </div>
              </div>
            </div>
          )}

          {currentStep.type === "select" && (
            <div className="space-y-3">
              {[
                {
                  value: 0,
                  label: "Deyarli qilmayman",
                  emoji: "😴",
                  color: "from-gray-400 to-gray-500",
                },
                {
                  value: 3,
                  label: "Ba'zan mashq qilaman",
                  emoji: "💪",
                  color: "from-yellow-400 to-yellow-500",
                },
                {
                  value: 4,
                  label: "Haftasiga bir necha marta mashq qilaman",
                  emoji: "🔥",
                  color: "from-purple-400 to-purple-500",
                },
                {
                  value: 6,
                  label: "Professional sportchi",
                  emoji: "🚀",
                  color: "from-purple-400 to-purple-500",
                },
              ].map(({ value, label, emoji, color }) => (
                <button
                  key={value}
                  onClick={() =>
                    handleInputChange("workoutFrequency", value.toString())
                  }
                  className={`w-full p-5 rounded-2xl transition-all transform ${
                    formData.workoutFrequency === value.toString()
                      ? `bg-gradient-to-r ${color} text-white shadow-lg scale-105`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{emoji}</span>
                    <span className="font-semibold text-base">{label}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {currentStep.type === "goal" && (
            <div className="space-y-3">
              {(
                [
                  {
                    value: "lose",
                    emoji: "📉",
                    title: "Vazn kamaytirish",
                    desc: "Sog'lom yo'l bilan vazn yo'qotish",
                    gradient: "from-purple-400 to-orange-500",
                  },
                  {
                    value: "maintain",
                    emoji: "⚖️",
                    title: "Saqlash",
                    desc: "Joriy vazningizni saqlang",
                    gradient: "from-blue-400 to-cyan-500",
                  },
                  {
                    value: "gain",
                    emoji: "📈",
                    title: "Vazn oshirish",
                    desc: "Muskulni rivojlantirish va kuch",
                    gradient: "from-green-400 to-emerald-500",
                  },
                ] as const
              ).map(({ value, emoji, title, desc, gradient }) => (
                <button
                  key={value}
                  onClick={() => handleInputChange("goal", value)}
                  className={`w-full p-5 rounded-2xl transition-all transform ${
                    formData.goal === value
                      ? `bg-gradient-to-r ${gradient} text-white shadow-lg scale-105`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{emoji}</span>
                    <div className="text-left flex-1">
                      <p className="font-bold text-base">{title}</p>
                      <p className="text-sm opacity-90">{desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-4 mt-8">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:text-gray-400 text-gray-800 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-lg text-base"
            >
              <ChevronLeft size={24} />
              {UZ.onboarding.back || "Orqaga"}
            </button>
            <button
              onClick={handleNext}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-lg text-base"
            >
              {step === steps.length - 1 ? (
                <>🎉 {UZ.onboarding.finish}</>
              ) : (
                <>
                  {UZ.onboarding.next}
                  <ChevronRight size={24} />
                </>
              )}
            </button>
          </div>

          {isWebUser && step === 0 && (
            <div className="mt-3 text-center border-t border-gray-200 dark:border-gray-700 pt-3">
              <p className="text-gray-600 dark:text-gray-400 text-xs mb-2">
                {isLoginMode
                  ? "Akkauntingiz yo'qmi?"
                  : "Allaqachon akkauntingiz bormi?"}
              </p>
              <button
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setStep(0);
                  setError("");
                }}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline text-xs"
              >
                {isLoginMode ? "Ro'yxatdan o'tish" : "Kirish"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
