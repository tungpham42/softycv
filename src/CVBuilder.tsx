import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Badge,
  Button,
  Card,
  Dropdown,
  Layout,
  Progress,
  Space,
  Tabs,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  BulbOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  DownloadOutlined,
  ExportOutlined,
  FileTextOutlined,
  FormatPainterOutlined,
  IdcardOutlined,
  LoadingOutlined,
  ProjectOutlined,
  ReadOutlined,
  RedoOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  UndoOutlined,
  UploadOutlined,
  UserOutlined,
  WarningOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { PAGE_PADDING, initialCVData, initialDesignConfig } from "./constants";
import { useWorkspace } from "./hooks/useWorkspace";
import { analyzeCV, EditorTab } from "./utils/analysis";
import { cvToPlainText, downloadBlob, safeFileName } from "./utils/export";
import { normalizeCVData, normalizeDesign } from "./utils/storage";
import { uid } from "./utils/text";
import PersonalTab from "./components/editor/PersonalTab";
import {
  CertificatesTab,
  EducationTab,
  ExperienceTab,
  ProjectsTab,
  SkillsTab,
} from "./components/editor/ListTabs";
import DesignTab from "./components/editor/DesignTab";
import InsightsTab, { scoreColor } from "./components/editor/InsightsTab";
import ProfileMenu from "./components/ProfileMenu";
import PreviewPane from "./components/preview/PreviewPane";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export type {
  CVData,
  DesignConfig,
  ExperienceItem,
  EducationItem,
  SkillItem,
  ProjectItem,
  CertificateItem,
} from "./types";

const timeLabel = (t: number) =>
  new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function CVBuilder() {
  const ws = useWorkspace();
  const { data, design, actions } = ws;

  const [activeTab, setActiveTab] = useState<EditorTab>("personal");
  const [pages, setPages] = useState(1);
  const [jobDescriptions, setJobDescriptions] = useState<
    Record<string, string>
  >({});
  const importRef = useRef<HTMLInputElement>(null);

  const analysis = useMemo(() => analyzeCV(data, pages), [data, pages]);

  /* ---------- keyboard: undo / redo ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "z" && !e.shiftKey) {
        e.preventDefault();
        ws.undo();
      } else if ((k === "z" && e.shiftKey) || k === "y") {
        e.preventDefault();
        ws.redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ws]);

  /* ---------- actions ---------- */
  const printPdf = () => {
    const previous = document.title;
    document.title = `${safeFileName(data.personalInfo.fullName)}_CV`;
    const restore = () => {
      document.title = previous;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    window.print();
  };

  const exportJSON = () => {
    downloadBlob(
      JSON.stringify(
        { version: 2, name: ws.activeName, data, design },
        null,
        2,
      ),
      `${safeFileName(data.personalInfo.fullName)}_CV.json`,
      "application/json",
    );
    message.success("Backup downloaded.");
  };

  const exportText = () => {
    downloadBlob(
      cvToPlainText(data),
      `${safeFileName(data.personalInfo.fullName)}_CV.txt`,
      "text/plain;charset=utf-8",
    );
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(cvToPlainText(data));
      message.success("Plain-text CV copied.");
    } catch {
      message.error(
        "Couldn’t access the clipboard. Use “Download plain text” instead.",
      );
    }
  };

  const importJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      // Accept both v2 exports ({data, design}) and raw v1 CV objects.
      const hasEnvelope =
        parsed && typeof parsed === "object" && "data" in parsed;
      const nextData = normalizeCVData(hasEnvelope ? parsed.data : parsed);
      const nextDesign =
        hasEnvelope && parsed.design
          ? normalizeDesign(parsed.design)
          : undefined;
      actions.replaceData(nextData, nextDesign);
      message.success("Imported. Press Ctrl/Cmd+Z to undo.");
    } catch (err) {
      message.error(
        err instanceof SyntaxError
          ? "That file isn’t valid JSON."
          : (err as Error).message || "Import failed.",
      );
    }
  };

  const loadSample = () => {
    actions.replaceData(initialCVData, initialDesignConfig);
    message.success("Sample CV loaded. Press Ctrl/Cmd+Z to undo.");
  };

  const addKeywordAsSkill = useCallback(
    (keyword: string) => {
      const name = keyword.charAt(0).toUpperCase() + keyword.slice(1);
      actions.addItem("skills", { id: uid("sk"), name, level: "Intermediate" });
      message.success(`Added “${name}” to Skills.`);
    },
    [actions],
  );

  /* ---------- editor tabs ---------- */
  const tabItems = [
    {
      key: "personal",
      label: (
        <span>
          <UserOutlined /> Personal
        </span>
      ),
      children: (
        <PersonalTab
          data={data}
          setPersonal={actions.setPersonal}
          setSummary={actions.setSummary}
        />
      ),
    },
    {
      key: "experience",
      label: (
        <span>
          <IdcardOutlined /> Experience
        </span>
      ),
      children: <ExperienceTab data={data} actions={actions} />,
    },
    {
      key: "education",
      label: (
        <span>
          <ReadOutlined /> Education
        </span>
      ),
      children: <EducationTab data={data} actions={actions} />,
    },
    {
      key: "skills",
      label: (
        <span>
          <ThunderboltOutlined /> Skills
        </span>
      ),
      children: <SkillsTab data={data} actions={actions} />,
    },
    {
      key: "projects",
      label: (
        <span>
          <ProjectOutlined /> Projects
        </span>
      ),
      children: <ProjectsTab data={data} actions={actions} />,
    },
    {
      key: "certificates",
      label: (
        <span>
          <SafetyCertificateOutlined /> Certificates
        </span>
      ),
      children: <CertificatesTab data={data} actions={actions} />,
    },
    {
      key: "design",
      label: (
        <span>
          <FormatPainterOutlined /> Design
        </span>
      ),
      children: <DesignTab data={data} design={design} actions={actions} />,
    },
    {
      key: "insights",
      label: (
        <Badge
          dot={analysis.checks.some((c) => !c.passed)}
          color="#f59e0b"
          offset={[4, 2]}
        >
          <span>
            <BulbOutlined /> Insights
          </span>
        </Badge>
      ),
      children: (
        <InsightsTab
          data={data}
          analysis={analysis}
          jobDescription={jobDescriptions[ws.activeId] ?? ""}
          onJobDescriptionChange={(v) =>
            setJobDescriptions((j) => ({ ...j, [ws.activeId]: v }))
          }
          onJump={setActiveTab}
          onAddSkill={addKeywordAsSkill}
        />
      ),
    },
  ];

  const saveIndicator =
    ws.saveStatus === "error" ? (
      <Tooltip title="Browser storage is full or blocked. Export a JSON backup to keep your work.">
        <Text style={{ color: "#fca5a5", fontSize: 12 }}>
          <WarningOutlined /> Not saved
        </Text>
      </Tooltip>
    ) : ws.saveStatus === "saving" ? (
      <Text style={{ color: "#94a3b8", fontSize: 12 }}>
        <LoadingOutlined /> Saving…
      </Text>
    ) : (
      <Text style={{ color: "#94a3b8", fontSize: 12 }}>
        <CheckCircleOutlined /> Saved {timeLabel(ws.savedAt)}
      </Text>
    );

  return (
    <Layout style={{ minHeight: "100vh", background: "#0f172a" }}>
      <Header
        className="no-print"
        style={{
          background: "rgba(15, 23, 42, 0.95)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid #1e293b",
          padding: "10px 24px",
          height: "auto",
          lineHeight: "normal",
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Space size={14} wrap>
          <Space size={10}>
            <div
              style={{
                background: "#0052CC",
                padding: "6px 10px",
                borderRadius: 8,
                color: "#fff",
                display: "flex",
              }}
            >
              <ThunderboltOutlined style={{ fontSize: 20 }} />
            </div>
            <Title
              level={4}
              style={{ color: "#fff", margin: 0, fontWeight: 700 }}
            >
              SOFTY CV Builder
            </Title>
          </Space>
          <ProfileMenu
            profiles={ws.profiles}
            activeId={ws.activeId}
            actions={actions}
          />
        </Space>

        <Space size={10} wrap>
          {saveIndicator}

          <Space.Compact>
            <Tooltip title="Undo (Ctrl/Cmd+Z)">
              <Button
                icon={<UndoOutlined />}
                disabled={!ws.canUndo}
                onClick={ws.undo}
                aria-label="Undo"
              />
            </Tooltip>
            <Tooltip title="Redo (Ctrl/Cmd+Shift+Z)">
              <Button
                icon={<RedoOutlined />}
                disabled={!ws.canRedo}
                onClick={ws.redo}
                aria-label="Redo"
              />
            </Tooltip>
          </Space.Compact>

          <Tooltip title="Open resume checklist">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setActiveTab("insights")}
              onKeyDown={(e) => e.key === "Enter" && setActiveTab("insights")}
              style={{ width: 130, cursor: "pointer" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: "#94a3b8",
                  marginBottom: 2,
                }}
              >
                <span>Resume score</span>
                <span>{analysis.score}%</span>
              </div>
              <Progress
                percent={analysis.score}
                showInfo={false}
                size="small"
                strokeColor={scoreColor(analysis.score)}
                trailColor="#1e293b"
              />
            </div>
          </Tooltip>

          <Dropdown
            trigger={["click"]}
            menu={{
              items: [
                {
                  key: "json",
                  icon: <DownloadOutlined />,
                  label: "Download backup (JSON)",
                },
                {
                  key: "import",
                  icon: <UploadOutlined />,
                  label: "Import backup…",
                },
                { type: "divider" },
                {
                  key: "txt",
                  icon: <FileTextOutlined />,
                  label: "Download plain text (ATS)",
                },
                {
                  key: "copy",
                  icon: <CopyOutlined />,
                  label: "Copy plain text",
                },
                { type: "divider" },
                {
                  key: "sample",
                  icon: <ReloadOutlined />,
                  label: "Load sample data",
                },
              ],
              onClick: ({ key }) => {
                const handlers: Record<string, () => unknown> = {
                  json: exportJSON,
                  import: () => importRef.current?.click(),
                  txt: exportText,
                  copy: copyText,
                  sample: loadSample,
                };
                handlers[key]?.();
              },
            }}
          >
            <Button icon={<ExportOutlined />}>Export / Import</Button>
          </Dropdown>
          <input
            ref={importRef}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={importJSON}
          />

          <Button
            type="primary"
            size="large"
            icon={<PrinterOutlined />}
            onClick={printPdf}
            style={{ background: "#0052CC", fontWeight: 600 }}
          >
            Save as PDF
          </Button>
        </Space>
      </Header>

      <Content
        className="cv-content"
        style={{ padding: 24, maxWidth: 1600, margin: "0 auto", width: "100%" }}
      >
        <div className="cv-workspace">
          <div className="no-print">
            <Card
              style={{
                border: "none",
                borderRadius: 12,
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
              }}
            >
              <Tabs
                activeKey={activeTab}
                onChange={(k) => setActiveTab(k as EditorTab)}
                size="middle"
                items={tabItems}
              />
            </Card>
          </div>

          <div className="cv-preview-sticky">
            <PreviewPane
              data={data}
              design={design}
              onPagesChange={setPages}
              onDesignChange={actions.setDesign}
            />
          </div>
        </div>
      </Content>

      <style>{`
        .cv-workspace {
          display: grid;
          grid-template-columns: minmax(360px, 5fr) 6fr;
          gap: 24px;
          align-items: start;
        }
        .cv-preview-sticky {
          position: sticky;
          top: 84px;
          max-height: calc(100vh - 100px);
          overflow: auto;
          border-radius: 12px;
        }
        .cv-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          padding: 8px 12px;
          margin-bottom: 12px;
          background: #1e293b;
          border-radius: 10px;
        }
        .cv-toolbar .ant-tag, .cv-toolbar .ant-btn { font-weight: 600; }
        .cv-page { box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); border-radius: 4px; }
        .cv-scale-box { margin: 0 auto; }
        @media (max-width: 1100px) {
          .cv-workspace { grid-template-columns: 1fr; }
          .cv-preview-sticky { position: static; max-height: none; overflow: visible; }
        }
        @page { size: ${design.pageSize}; margin: ${(PAGE_PADDING / 96) * 25.4}mm; }
        @media print {
          html, body {
            background: #fff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print { display: none !important; }
          .ant-layout, .cv-content { background: #fff !important; padding: 0 !important; max-width: none !important; }
          .cv-workspace { display: block !important; }
          .cv-preview-sticky { position: static !important; max-height: none !important; overflow: visible !important; }
          .cv-scale-box { width: auto !important; height: auto !important; margin: 0 !important; }
          .cv-page {
            transform: none !important;
            width: auto !important;
            min-height: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
    </Layout>
  );
}
