/**
 * Global ambient type declarations
 * Extends the browser Window interface with legacy Spark globals that some
 * components may still reference (window.spark.kv, window.spark.llm).
 */

interface SparkKV {
  get<T = unknown>(key: string): Promise<T | null>
  set(key: string, value: unknown): Promise<void>
  delete(key: string): Promise<void>
}

interface SparkLLM {
  (prompt: string, model?: string, jsonMode?: boolean): Promise<string>
  prompt?(message: string, options?: Record<string, unknown>): Promise<string>
}

interface SparkGlobal {
  kv?: SparkKV
  llm?: SparkLLM
}

interface Window {
  spark?: SparkGlobal
}
