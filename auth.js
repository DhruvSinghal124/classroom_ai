/**
 * Classroom.AI — Auth Module (Legacy Compatibility)
 * ===================================================
 * This file now re-exports from the new centralized firebase-config.js
 * to maintain backward compatibility with pages that import from "./auth.js".
 */
export { app, auth } from "./js/firebase-config.js";
