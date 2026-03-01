import { UZ } from "../constants/uz";

export const getErrorMessage = (error: any): string => {
  // If error has a custom message from backend
  if (error?.response?.data?.error) {
    const backendError = error.response.data.error;
    
    // Map common backend errors to Uzbek messages
    const errorMap: Record<string, string> = {
      "User not found": UZ.errors.userNotFound,
      "Invalid credentials": UZ.errors.invalidCredentials,
      "User already exists": UZ.errors.userExists,
      "No image provided": UZ.errors.noImage,
      "Bu rasm ovqatga o'xshamaydi": UZ.errors.invalidImage,
      "Meal not found": UZ.errors.mealNotFound,
      "Failed to create/update user": UZ.errors.updateFailed,
      "Failed to fetch user": UZ.errors.loadingFailed,
      "Failed to upload meal": UZ.errors.uploadFailed,
      "Failed to delete meal": UZ.errors.deleteFailed,
      "Failed to fetch meals": UZ.errors.loadingFailed,
      "Failed to fetch stats": UZ.errors.loadingFailed,
      "Failed to update weight": UZ.errors.updateFailed,
      "Failed to record weight": UZ.errors.updateFailed,
    };

    // Check if backend error matches any known error
    for (const [key, value] of Object.entries(errorMap)) {
      if (backendError.includes(key)) {
        return value;
      }
    }

    // If backend error is in Uzbek, return it as is
    if (backendError.includes("o'")) {
      return backendError;
    }

    // Default to backend error
    return backendError;
  }

  // Handle HTTP status codes
  if (error?.response?.status) {
    switch (error.response.status) {
      case 400:
        return UZ.errors.badRequest;
      case 401:
        return UZ.errors.unauthorized;
      case 403:
        return UZ.errors.forbidden;
      case 404:
        return UZ.errors.userNotFound;
      case 429:
        return UZ.errors.tooManyRequests;
      case 500:
      case 502:
      case 503:
      case 504:
        return UZ.errors.serverError;
      default:
        return UZ.errors.serverError;
    }
  }

  // Handle network errors
  if (error?.code === "ECONNABORTED" || error?.message === "Network Error") {
    return UZ.errors.networkError;
  }

  // Handle timeout
  if (error?.code === "ECONNABORTED") {
    return UZ.errors.networkError;
  }

  // Default error message
  return UZ.errors.serverError;
};

export const handleApiError = (
  error: any,
  defaultMessage?: string
): string => {
  return defaultMessage || getErrorMessage(error);
};
