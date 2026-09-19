import { appConfig } from "../../app/config/appConfig";

type LogContext = Record<string, unknown>;

function write(method: "debug" | "info" | "warn" | "error", message: string, context?: LogContext) {
  if (method === "debug" && appConfig.logLevel !== "debug") return;
  console[method](`[AMMERHA] ${message}`, context ?? "");
}

export const logger = {
  debug: (message: string, context?: LogContext) => write("debug", message, context),
  info: (message: string, context?: LogContext) => write("info", message, context),
  warn: (message: string, context?: LogContext) => write("warn", message, context),
  error: (message: string, context?: LogContext) => write("error", message, context)
};
