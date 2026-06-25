// =============================================================
//  FitConnection — Cypress E2E Support (ejecutado antes de cada spec)
// =============================================================

import "./commands";

// Ignorar errores no capturados de React HMR en modo dev
Cypress.on("uncaught:exception", (err) => {
  // Vite HMR y React errores que no afectan los tests
  if (
    err.message.includes("ResizeObserver loop") ||
    err.message.includes("ChunkLoadError") ||
    err.message.includes("Loading chunk")
  ) {
    return false;
  }
  // Para cualquier otro error, dejar que Cypress falle normalmente
  return true;
});
