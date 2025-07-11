export const getStatusBadgeVariant = (
  statusCode: number
): 'destructive' | 'secondary' => {
  if (statusCode >= 400) return 'destructive';
  return 'secondary';
};

export const getStatusLabel = (statusCode: number): string => {
  switch (statusCode) {
    case 404:
      return 'Not Found';
    case 403:
      return 'Forbidden';
    case 401:
      return 'Unauthorized';
    case 500:
      return 'Server Error';
    case 503:
      return 'Service Unavailable';
    default:
      if (statusCode >= 400 && statusCode < 500) return 'Client Error';
      if (statusCode >= 500) return 'Server Error';
      return `Error ${statusCode}`;
  }
};
