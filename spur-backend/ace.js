/**
 * Register hook to process TypeScript files using ts-node
 */
import 'ts-node-maintained/register/esm'

/**
 * Import ace console entrypoint
 */
await import('./bin/console.js')
