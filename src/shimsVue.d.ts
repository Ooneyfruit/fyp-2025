/**
 * Global type definitions for Vue single-file components.
 * This ensures TypeScript can import .vue files without errors.
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  // Use object and unknown to satisfy strict linting rules against empty objects and explicit any.
  const component: DefineComponent<object, object, unknown>;
  export default component;
}
