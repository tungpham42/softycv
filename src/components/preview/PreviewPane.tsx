import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button, Segmented, Slider, Space, Tag, Tooltip } from "antd";
import { CompressOutlined, ZoomInOutlined } from "@ant-design/icons";
import type { CVData, DesignConfig } from "../../types";
import { PAGE_DIMENSIONS, PAGE_PADDING } from "../../constants";
import { TEMPLATE_COMPONENTS } from "./templates";

interface Props {
  data: CVData;
  design: DesignConfig;
  onPagesChange: (pages: number) => void;
  onDesignChange: (patch: Partial<DesignConfig>) => void;
}

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 1.25;

const PreviewPane: React.FC<Props> = ({
  data,
  design,
  onPagesChange,
  onDesignChange,
}) => {
  const { w: pageW, h: pageH } = PAGE_DIMENSIONS[design.pageSize];
  const usable = pageH - PAGE_PADDING * 2;

  const wrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [wrapW, setWrapW] = useState(0);
  const [contentH, setContentH] = useState(0);
  const [manualZoom, setManualZoom] = useState<number | null>(null); // null = fit

  useLayoutEffect(() => {
    const observe = (el: Element | null, cb: (r: DOMRectReadOnly) => void) => {
      if (!el || typeof ResizeObserver === "undefined") return () => {};
      const ro = new ResizeObserver(([entry]) => cb(entry.contentRect));
      ro.observe(el);
      return () => ro.disconnect();
    };
    const a = observe(wrapRef.current, (r) => setWrapW(r.width));
    const b = observe(contentRef.current, (r) => setContentH(r.height));
    return () => {
      a();
      b();
    };
  }, []);

  const fitZoom = wrapW
    ? Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, wrapW / pageW))
    : 1;
  const zoom = manualZoom ?? fitZoom;

  const pages = Math.max(1, Math.ceil((contentH - 1) / usable));
  useEffect(() => onPagesChange(pages), [pages, onPagesChange]);

  const pageHeight = Math.max(pageH, contentH + PAGE_PADDING * 2);
  const Template = TEMPLATE_COMPONENTS[design.template];

  const tighten = () =>
    onDesignChange({
      spacing: "compact",
      fontSize: Math.max(11, design.fontSize - 1),
      lineHeight: Math.max(1.3, +(design.lineHeight - 0.1).toFixed(1)),
    });

  return (
    <div ref={wrapRef} className="cv-preview">
      <div className="no-print cv-toolbar">
        <Space wrap size={8}>
          <Tag
            color={pages === 1 ? "success" : pages === 2 ? "warning" : "error"}
            style={{ margin: 0 }}
          >
            ≈ {pages} {pages === 1 ? "page" : "pages"}
          </Tag>
          {pages > 1 && (
            <Tooltip title="Switches to compact spacing and slightly smaller text">
              <Button size="small" icon={<CompressOutlined />} onClick={tighten}>
                Tighten layout
              </Button>
            </Tooltip>
          )}
        </Space>
        <Space size={8}>
          <Segmented
            size="small"
            value={design.pageSize}
            options={["A4", "Letter"]}
            onChange={(v) => onDesignChange({ pageSize: v as DesignConfig["pageSize"] })}
          />
          <ZoomInOutlined style={{ color: "#94a3b8" }} />
          <Slider
            style={{ width: 110, margin: "0 4px" }}
            min={MIN_ZOOM * 100}
            max={MAX_ZOOM * 100}
            value={Math.round(zoom * 100)}
            tooltip={{ formatter: (v) => `${v}%` }}
            onChange={(v) => setManualZoom(v / 100)}
          />
          <Button
            size="small"
            type={manualZoom === null ? "primary" : "default"}
            onClick={() => setManualZoom(null)}
          >
            Fit
          </Button>
        </Space>
      </div>

      <div
        className="cv-scale-box"
        style={{ width: pageW * zoom, height: pageHeight * zoom }}
      >
        <div
          id="cv-print-area"
          className="cv-page"
          style={{
            position: "relative",
            width: pageW,
            minHeight: pageH,
            padding: PAGE_PADDING,
            boxSizing: "border-box",
            background: "#fff",
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
            fontFamily: design.fontFamily,
            fontSize: design.fontSize,
          }}
        >
          <div ref={contentRef}>
            <Template data={data} config={design} />
          </div>

          {/* Page-break guides (screen only) */}
          {Array.from({ length: pages - 1 }, (_, i) => (
            <div
              key={i}
              className="no-print"
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: PAGE_PADDING + (i + 1) * usable,
                borderTop: "2px dashed #f59e0b",
                pointerEvents: "none",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  right: 8,
                  top: 2,
                  fontSize: 11,
                  color: "#b45309",
                  background: "#fffbeb",
                  padding: "0 6px",
                  borderRadius: 4,
                }}
              >
                Page {i + 2} starts below
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PreviewPane;
