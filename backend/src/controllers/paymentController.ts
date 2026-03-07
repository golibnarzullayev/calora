import { Request, Response } from "express";
import paymeService from "../services/PaymeService.js";

interface PaymeRequest {
  method: string;
  params: any;
  id: number;
  jsonrpc: string;
}

interface PaymeResponse {
  jsonrpc: string;
  id: number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: string;
  };
}

const createErrorResponse = (
  id: number,
  code: number,
  message: string,
): PaymeResponse => {
  return {
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message,
    },
  };
};

const createSuccessResponse = (id: number, result: any): PaymeResponse => {
  return {
    jsonrpc: "2.0",
    id,
    ...result,
  };
};

export const handlePaymeCallback = async (req: Request, res: Response) => {
  try {
    const paymeReq = req.body as PaymeRequest;
    const { method, params, id } = paymeReq;

    if (!method || !id) {
      return res
        .status(200)
        .json(createErrorResponse(id || 0, -32600, "Invalid Request"));
    }

    try {
      let result;

      switch (method) {
        case "CheckPerformTransaction":
          result = await paymeService.checkPerformTransaction(params);
          return res.json(createSuccessResponse(id, result));

        case "CreateTransaction":
          result = await paymeService.createTransaction(params);
          return res.json(createSuccessResponse(id, result));

        case "PerformTransaction":
          result = await paymeService.performTransaction(params);
          return res.json(createSuccessResponse(id, result));

        case "CancelTransaction":
          result = await paymeService.cancelTransaction(params);
          return res.json(createSuccessResponse(id, result));

        case "CheckTransaction":
          result = await paymeService.checkTransaction(params);
          return res.json(createSuccessResponse(id, result));

        case "GetStatement":
          const { from, to } = params;
          result = await paymeService.getStatement({ from, to });
          return res.json(createSuccessResponse(id, result));

        default:
          return res
            .status(200)
            .json(createErrorResponse(id, -32601, "Method not found"));
      }
    } catch (error: any) {
      const errorMessage = error.message || "Internal server error";
      const errorCode = getPaymeErrorCode(errorMessage);
      return res.json(createErrorResponse(id, errorCode, errorMessage));
    }
  } catch (error) {
    res.status(200).json({
      jsonrpc: "2.0",
      id: 0,
      error: {
        code: -32603,
        message: "Internal server error",
      },
    });
  }
};

const getPaymeErrorCode = (errorMessage: string): number => {
  const errorMap: { [key: string]: number } = {
    INVALID_AMOUNT: -31001,
    ORDER_NOT_FOUND: -31050,
    TRANSACTION_NOT_FOUND: -31003,
    CANT_DO_OPERATION: -31008,
    ALREADY_DONE: -31009,
    PENDING: -31051,
  };

  return errorMap[errorMessage] || -32603;
};

export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { orderId } = req.params;
    // This would typically fetch the order and its transaction status
    res.json({ status: "pending" });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payment status" });
  }
};
