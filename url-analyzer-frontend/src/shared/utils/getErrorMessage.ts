interface APIErrorResponse {
  data?: {
    error?: string;
  };
}

interface AxiosLikeError {
  isAxiosError?: boolean;
  response?: APIErrorResponse;
  message?: string;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const axiosError = error as AxiosLikeError;
    if (axiosError.isAxiosError && axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    }
    return error.message;
  }

  return 'An unknown error occurred';
}
