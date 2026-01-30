/**
 * Error Handler
 * Gerencia erros da API e fornece mensagens amigáveis em português
 */

export class APIError extends Error {
  statusCode: number;
  originalError: any;

  constructor(message: string, statusCode: number, originalError?: any) {
    super(message);
    this.name = "APIError";
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

/**
 * Trata erros da API e retorna um APIError padronizado
 */
export const handleAPIError = (error: any): APIError => {
  // Erro de rede
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return new APIError(
      "Erro de conexão. Verifique se a API está rodando.",
      0,
      error
    );
  }

  // Erro já é um APIError
  if (error instanceof APIError) {
    return error;
  }

  // Erro com resposta HTTP
  if (error.statusCode) {
    return new APIError(
      error.message || getErrorMessageByStatus(error.statusCode),
      error.statusCode,
      error
    );
  }

  // Erro desconhecido
  return new APIError(
    "Ocorreu um erro inesperado. Tente novamente.",
    500,
    error
  );
};

/**
 * Retorna uma mensagem de erro amigável baseada no código HTTP
 */
const getErrorMessageByStatus = (statusCode: number): string => {
  const messages: Record<number, string> = {
    400: "Requisição inválida. Verifique os dados enviados.",
    401: "Sessão expirada. Faça login novamente.",
    403: "Você não tem permissão para realizar esta ação.",
    404: "Recurso não encontrado.",
    409: "Conflito. Este recurso já existe.",
    422: "Dados inválidos. Verifique os campos.",
    429: "Muitas requisições. Aguarde um momento.",
    500: "Erro no servidor. Tente novamente mais tarde.",
    502: "Servidor indisponível. Tente novamente mais tarde.",
    503: "Serviço temporariamente indisponível.",
  };

  return messages[statusCode] || `Erro ${statusCode}. Tente novamente.`;
};

/**
 * Extrai mensagem de erro amigável de um APIError
 */
export const getErrorMessage = (error: APIError): string => {
  // Tenta extrair mensagem específica do erro original
  if (error.originalError?.detail) {
    return error.originalError.detail;
  }

  if (error.originalError?.message) {
    return error.originalError.message;
  }

  // Tenta extrair erros de validação
  if (error.originalError?.errors) {
    const errors = error.originalError.errors;
    const firstKey = Object.keys(errors)[0];
    if (firstKey && Array.isArray(errors[firstKey])) {
      return errors[firstKey][0];
    }
  }

  // Retorna a mensagem padrão do erro
  return error.message;
};
