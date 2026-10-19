# SOFTY CV Builder (refactor)

Drop the `cv-builder/` folder into your project and render the default export:

```tsx
import CVBuilder from "./cv-builder/CVBuilder";
export default function App() { return <CVBuilder />; }
```

Requires React 18+, `antd` ≥ 5.6 and `@ant-design/icons` 5. No other dependencies.

```
CVBuilder.tsx            shell: header, tabs, shortcuts, import/export, print CSS
types.ts / constants.ts  data model, sample data, palettes, fonts
hooks/useHistory.ts      undo/redo with typing coalescing
hooks/useWorkspace.ts    CV versions, editing actions, debounced autosave
utils/analysis.ts        resume checklist + job-post keyword matcher
utils/storage.ts         validation, v1 -> v2 migration, safe localStorage
utils/{text,export,image}.ts
components/preview/      blocks.tsx (shared), templates.tsx (4 layouts), PreviewPane.tsx
components/editor/       Personal / list tabs / Design / Insights, shared fields
components/ProfileMenu.tsx
```

Existing data saved by the old component (`pro_cv_builder_data`,
`pro_cv_builder_design`) is migrated automatically on first load.
