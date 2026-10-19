import React, { useMemo } from "react";
import { Button, Empty, Input, Progress, Tag, Typography } from "antd";
import {
  CheckCircleFilled,
  ExclamationCircleFilled,
  PlusOutlined,
} from "@ant-design/icons";
import type { CVData } from "../../types";
import {
  Analysis,
  EditorTab,
  matchKeywords,
} from "../../utils/analysis";

const { Text, Title } = Typography;

interface Props {
  data: CVData;
  analysis: Analysis;
  jobDescription: string;
  onJobDescriptionChange: (v: string) => void;
  onJump: (tab: EditorTab) => void;
  onAddSkill: (name: string) => void;
}

export const scoreColor = (score: number) =>
  score >= 85 ? "#16a34a" : score >= 65 ? "#d97706" : "#dc2626";

export const scoreLabel = (score: number) =>
  score >= 85 ? "Ready to send" : score >= 65 ? "Good, a few fixes" : "Needs work";

const InsightsTab: React.FC<Props> = ({
  data,
  analysis,
  jobDescription,
  onJobDescriptionChange,
  onJump,
  onAddSkill,
}) => {
  const failing = analysis.checks.filter((c) => !c.passed);
  const passing = analysis.checks.filter((c) => c.passed);
  const match = useMemo(
    () => (jobDescription.trim().length > 20 ? matchKeywords(data, jobDescription) : null),
    [data, jobDescription],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Score */}
      <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
        <Progress
          type="circle"
          size={84}
          percent={analysis.score}
          strokeColor={scoreColor(analysis.score)}
        />
        <div>
          <Title level={5} style={{ margin: 0 }}>
            {scoreLabel(analysis.score)}
          </Title>
          <Text type="secondary">
            {failing.length === 0
              ? "Every check passes."
              : `${failing.length} thing${failing.length > 1 ? "s" : ""} to improve below.`}
          </Text>
        </div>
      </div>

      {/* Checklist */}
      <div>
        <Title level={5} style={{ marginTop: 0 }}>Resume checklist</Title>
        {failing.map((c) => (
          <div
            key={c.id}
            style={{
              display: "flex",
              gap: 10,
              padding: "8px 0",
              borderBottom: "1px solid #f1f5f9",
              alignItems: "flex-start",
            }}
          >
            <ExclamationCircleFilled style={{ color: "#d97706", marginTop: 4 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{c.label}</div>
              <Text type="secondary" style={{ fontSize: 13 }}>{c.tip}</Text>
            </div>
            <Button size="small" onClick={() => onJump(c.tab)}>
              Fix
            </Button>
          </div>
        ))}
        {passing.map((c) => (
          <div
            key={c.id}
            style={{ display: "flex", gap: 10, padding: "5px 0", alignItems: "center" }}
          >
            <CheckCircleFilled style={{ color: "#16a34a" }} />
            <span style={{ color: "#475569" }}>{c.label}</span>
          </div>
        ))}
      </div>

      {/* Job match */}
      <div>
        <Title level={5} style={{ marginTop: 0 }}>Match a job post</Title>
        <Text type="secondary" style={{ display: "block", marginBottom: 8, fontSize: 13 }}>
          Paste the job description. Applicant-tracking systems filter on its
          keywords, so see which ones your CV already uses.
        </Text>
        <Input.TextArea
          rows={5}
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
          placeholder="Paste the job description here…"
        />

        {match && match.keywords.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
              <Text strong>Keyword match</Text>
              <Text strong style={{ color: scoreColor(match.percent) }}>{match.percent}%</Text>
            </div>
            <Progress
              percent={match.percent}
              showInfo={false}
              strokeColor={scoreColor(match.percent)}
            />
            <Text strong style={{ display: "block", margin: "10px 0 6px" }}>
              Found in your CV ({match.matched.length})
            </Text>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {match.matched.map((k) => (
                <Tag key={k} color="success" style={{ margin: 0 }}>{k}</Tag>
              ))}
              {!match.matched.length && <Text type="secondary">None yet.</Text>}
            </div>
            <Text strong style={{ display: "block", margin: "12px 0 6px" }}>
              Missing ({match.missing.length})
            </Text>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {match.missing.map((k) => (
                <Tag
                  key={k}
                  color="warning"
                  icon={<PlusOutlined />}
                  style={{ margin: 0, cursor: "pointer" }}
                  onClick={() => onAddSkill(k)}
                >
                  {k}
                </Tag>
              ))}
              {!match.missing.length && <Text type="secondary">Nothing missing.</Text>}
            </div>
            <Text type="secondary" style={{ display: "block", marginTop: 8, fontSize: 12 }}>
              Click a missing keyword to add it as a skill. Only add what you
              genuinely know, and work the rest naturally into your bullets.
            </Text>
          </div>
        )}
        {match && match.keywords.length === 0 && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No keywords found. Paste more of the job post."
          />
        )}
      </div>
    </div>
  );
};

export default InsightsTab;
