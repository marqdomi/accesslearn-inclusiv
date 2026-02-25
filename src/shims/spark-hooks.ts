/**
 * Shim for @github/spark/hooks
 * Replaces GitHub Spark's useKV with localStorage-backed implementation.
 * This allows the codebase to run outside of the GitHub Spark platform.
 */

export { useLocalStorage as useKV } from '../hooks/use-local-storage'
