import React from "react";
import {
  Button,
  ColorPicker,
  Segmented,
  Select,
  Slider,
  Switch,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import type { CVData, DesignConfig, SectionKey } from "../../types";
import {
  FONT_OPTIONS,
  PRESET_PALETTES,
  SECTION_LABELS,
  TEMPLATES,
} from "../../constants";
import type { Actions } from "../../hooks/useWorkspace";
import { Field } from "./fields";

const { Text } = Typography;

interface Props {
  data: CVData;
  design: DesignConfig;
  actions: Actions;
}

const DesignTab: React.FC<Props> = ({ data, design, actions }) => {
  const set = actions.setDesign;
  const template = TEMPLATES.find((t) => t.id === design.template)!;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Field label="Template">
        <Segmented
          block
          value={design.template}
          onChange={(v) => set({ template: v as DesignConfig["template"] })}
          options={TEMPLATES.map((t) => ({ label: t.label, value: t.id }))}
        />
        <div style={{ marginTop: 6, fontSize: 12 }}>
          <Text type="secondary">{template.hint}. </Text>
          {template.atsFriendly ? (
            <Tag color="success" style={{ margin: 0 }}>Single column · ATS-friendly</Tag>
          ) : (
            <Tag color="warning" style={{ margin: 0 }}>
              Columns can confuse some applicant-tracking systems
            </Tag>
          )}
        </div>
      </Field>

      <Field label="Accent color">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {PRESET_PALETTES.map((p) => (
            <Tooltip key={p.color} title={p.name}>
              <button
                type="button"
                aria-label={p.name}
                aria-pressed={design.primaryColor === p.color}
                onClick={() => set({ primaryColor: p.color })}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  backgroundColor: p.color,
                  cursor: "pointer",
                  border: "2px solid #fff",
                  outline:
                    design.primaryColor === p.color ? `2px solid ${p.color}` : "1px solid #cbd5e1",
                  outlineOffset: 1,
                }}
              />
            </Tooltip>
          ))}
          <ColorPicker
            value={design.primaryColor}
            onChangeComplete={(c) => set({ primaryColor: c.toHexString() })}
            showText
            disabledAlpha
          />
        </div>
      </Field>

      <Field label="Font">
        <Select
          style={{ width: "100%" }}
          value={design.fontFamily}
          onChange={(fontFamily) => set({ fontFamily })}
          options={FONT_OPTIONS}
        />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label={`Text size (${design.fontSize}px)`}>
          <Slider min={11} max={18} value={design.fontSize} onChange={(fontSize) => set({ fontSize })} />
        </Field>
        <Field label={`Line height (${design.lineHeight})`}>
          <Slider min={1.2} max={1.8} step={0.1} value={design.lineHeight} onChange={(lineHeight) => set({ lineHeight })} />
        </Field>
      </div>

      <Field label="Spacing">
        <Segmented
          block
          value={design.spacing}
          onChange={(spacing) => set({ spacing: spacing as DesignConfig["spacing"] })}
          options={[
            { label: "Compact", value: "compact" },
            { label: "Comfortable", value: "comfortable" },
            { label: "Spacious", value: "spacious" },
          ]}
        />
      </Field>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        {(
          [
            ["showIcons", "Contact icons"],
            ["showPhoto", "Photo"],
            ["borderAccent", "Accent border"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Switch size="small" checked={design[key]} onChange={(v) => set({ [key]: v })} />
            {label}
          </label>
        ))}
      </div>

      <SectionManager data={data} actions={actions} />
    </div>
  );
};

const SectionManager: React.FC<{ data: CVData; actions: Actions }> = ({ data, actions }) => (
  <Field label="Sections: order and visibility">
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 8 }}>
      {data.sections.map((s, i) => (
        <div
          key={s.key}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 10px",
            borderTop: i ? "1px solid #f1f5f9" : undefined,
            opacity: s.visible ? 1 : 0.55,
          }}
        >
          <Switch
            size="small"
            checked={s.visible}
            aria-label={`Show ${SECTION_LABELS[s.key as SectionKey]}`}
            onChange={(v) => actions.toggleSection(s.key, v)}
          />
          <span style={{ flex: 1 }}>{SECTION_LABELS[s.key]}</span>
          <Button
            type="text"
            size="small"
            icon={<ArrowUpOutlined />}
            disabled={i === 0}
            aria-label={`Move ${SECTION_LABELS[s.key]} up`}
            onClick={() => actions.moveSection(s.key, -1)}
          />
          <Button
            type="text"
            size="small"
            icon={<ArrowDownOutlined />}
            disabled={i === data.sections.length - 1}
            aria-label={`Move ${SECTION_LABELS[s.key]} down`}
            onClick={() => actions.moveSection(s.key, 1)}
          />
        </div>
      ))}
    </div>
    <Text type="secondary" style={{ fontSize: 12 }}>
      Hidden sections stay saved but don’t appear on the CV. In the two-column
      template, Skills and Certifications always sit in the sidebar.
    </Text>
  </Field>
);

export default DesignTab;
