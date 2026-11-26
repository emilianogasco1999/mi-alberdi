export interface ParsedApiError {
  status: number | null;
  code: string | null;
  message: string | null;
}

interface AxiosLikeError {
  response?: {
    status?: number;
    data?: { error?: { code?: string; message?: string } };
  };
}

/** Extrae status, código y mensaje del envelope de error de la API ({ ok: false, error }). */
export function parseApiError(error: unknown): ParsedApiError {
  const err = error as AxiosLikeError | null;
  return {
    status: err?.response?.status ?? null,
    code: err?.response?.data?.error?.code ?? null,
    message: err?.response?.data?.error?.message ?? null,
  };
}
