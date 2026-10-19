import React, { useState } from "react";
import {
  Button,
  Collapse,
  Input,
  Popconfirm,
  Popover,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CopyOutlined,
  DeleteOutlined,
  PlusOutlined,
  UnorderedListOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import type { ItemOf, ListSection } from "../../types";
import type { Actions } from "../../hooks/useWorkspace";
import { POWER_VERBS } from "../../constants";
import {
  findWeakPhrases,
  formatAsBullets,
  hasMetric,
  isBulleted,
  toLines,
} from "../../utils/text";

const { Text } = Typography;
const { TextArea } = Input;

export const Field: React.FC<{
  label?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ label, children, style }) => (
  <div style={style}>
    {label && (
      <Text strong style={{ display: "block", marginBottom: 4, fontSize: 13 }}>
        {label}
      </Text>
    )}
    {children}
  </div>
);

/** Two-column responsive grid for form fields. */
export const Grid: React.FC<{ cols?: number; children: React.ReactNode }> = ({
  cols = 2,
  children,
}) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(auto-fit, minmax(${cols === 3 ? 130 : 190}px, 1fr))`,
      gap: 10,
      marginBottom: 10,
    }}
  >
    {children}
  </div>
);

/* ---------- Bullet writing assistant ---------- */

interface BulletEditorProps {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}

export const BulletEditor: React.FC<BulletEditorProps> = ({
  value,
  onChange,
  rows = 4,
  placeholder,
}) => {
  const lines = toLines(value);
  const weak = findWeakPhrases(value);
  const noMetrics = lines.length >= 2 && !lines.some(hasMetric);

  const addVerb = (verb: string) => {
    const base = value.replace(/\s+$/, "");
    onChange(`${base}${base ? "\n" : ""}• ${verb} `);
  };

  return (
    <div>
      <TextArea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 6,
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <Space size={6} wrap>
          <Button
            size="small"
            icon={<UnorderedListOutlined />}
            disabled={!value.trim() || isBulleted(value)}
            onClick={() => onChange(formatAsBullets(value))}
          >
            Format as bullets
          </Button>
          <Popover
            trigger="click"
            title="Start a bullet with a strong verb"
            content={
              <div style={{ maxWidth: 260, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {POWER_VERBS.map((v) => (
                  <Tag
                    key={v}
                    color="blue"
                    style={{ cursor: "pointer", margin: 0 }}
                    onClick={() => addVerb(v)}
                  >
                    {v}
                  </Tag>
                ))}
              </div>
            }
          >
            <Button size="small">Power verbs</Button>
          </Popover>
        </Space>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {lines.length} {lines.length === 1 ? "bullet" : "bullets"}
        </Text>
      </div>
      {(weak.length > 0 || noMetrics) && (
        <div style={{ marginTop: 6, fontSize: 12, color: "#b45309" }}>
          <WarningOutlined />{" "}
          {weak.length > 0 &&
            `Avoid “${weak[0]}”: start with what you did instead. `}
          {noMetrics && "Add at least one number (%, $, team size, time saved)."}
        </div>
      )}
    </div>
  );
};

/* ---------- Reorderable, collapsible entry list ---------- */

interface EntryListProps<K extends ListSection> {
  section: K;
  items: ItemOf<K>[];
  actions: Actions;
  title: (item: ItemOf<K>, index: number) => string;
  render: (
    item: ItemOf<K>,
    update: (patch: Partial<ItemOf<K>>) => void,
  ) => React.ReactNode;
  create: () => ItemOf<K>;
  addLabel: string;
  emptyText: string;
}

export function EntryList<K extends ListSection>({
  section,
  items,
  actions,
  title,
  render,
  create,
  addLabel,
  emptyText,
}: EntryListProps<K>) {
  const [open, setOpen] = useState<string[]>(items[0] ? [items[0].id] : []);
  const stop = (fn: () => void) => (e: React.SyntheticEvent) => {
    e.stopPropagation();
    fn();
  };

  return (
    <div>
      {items.length === 0 && (
        <Text type="secondary" style={{ display: "block", margin: "4px 0 12px" }}>
          {emptyText}
        </Text>
      )}
      <Collapse
        size="small"
        activeKey={open}
        onChange={(k) => setOpen(Array.isArray(k) ? k : [k])}
        style={{ marginBottom: 12 }}
        items={items.map((item, i) => ({
          key: item.id,
          label: (
            <span style={{ fontWeight: 600 }}>
              {title(item, i) || `Untitled #${i + 1}`}
            </span>
          ),
          extra: (
            <Space size={0} onClick={(e) => e.stopPropagation()}>
              <Tooltip title="Move up">
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowUpOutlined />}
                  disabled={i === 0}
                  onClick={stop(() => actions.moveItem(section, item.id, -1))}
                />
              </Tooltip>
              <Tooltip title="Move down">
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowDownOutlined />}
                  disabled={i === items.length - 1}
                  onClick={stop(() => actions.moveItem(section, item.id, 1))}
                />
              </Tooltip>
              <Tooltip title="Duplicate">
                <Button
                  type="text"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={stop(() => actions.duplicateItem(section, item.id))}
                />
              </Tooltip>
              <Popconfirm
                title="Delete this entry?"
                okText="Delete"
                okButtonProps={{ danger: true }}
                onConfirm={() => actions.removeItem(section, item.id)}
              >
                <Button type="text" size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space>
          ),
          children: render(item, (patch) =>
            actions.updateItem(section, item.id, patch),
          ),
        }))}
      />
      <Button
        type="dashed"
        block
        icon={<PlusOutlined />}
        onClick={() => {
          const fresh = create();
          actions.addItem(section, fresh);
          setOpen((o) => [...o, fresh.id]);
        }}
      >
        {addLabel}
      </Button>
    </div>
  );
}
