// ============================================================
// @trimtime/queue-engine
// Pure, framework-agnostic queue business logic
// Shared between NestJS backend and any future worker services
// ============================================================

export * from './lib/ewt.engine';
export * from './lib/queue-state.machine';
export * from './lib/ticket.generator';
export * from './lib/priority.sorter';
