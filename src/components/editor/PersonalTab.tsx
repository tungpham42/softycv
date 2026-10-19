import React, { useRef } from "react";
import { Avatar, Button, Input, Space, Typography, message } from "antd";
import {
  GithubOutlined,
  GlobalOutlined,
  HomeOutlined,
  LinkedinOutlined,
  MailOutlined,
  PhoneOutlined,
  SolutionOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { CVData } from "../../types";
import { fileToAvatarDataUrl } from "../../utils/image";
import { isEmail, wordCount } from "../../utils/text";
import { Field, Grid } from "./fields";

const { TextArea } = Input;
const { Text } = Typography;

interface Props {
  data: CVData;
  setPersonal: (field: keyof CVData["personalInfo"], value: string) => void;
  setSummary: (v: string) => void;
}

const PersonalTab: React.FC<Props> = ({ data, setPersonal, setSummary }) => {
  const p = data.personalInfo;
  const fileRef = useRef<HTMLInputElement>(null);
  const words = wordCount(data.summary);
  const summaryColor =
    words === 0 ? undefined : words >= 40 && words <= 90 ? "#16a34a" : "#d97706";

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setPersonal("avatarUrl", await fileToAvatarDataUrl(file));
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  const text = (
    field: keyof CVData["personalInfo"],
    label: string,
    icon: React.ReactNode,
    placeholder: string,
    extra?: { status?: "error" },
  ) => (
    <Field label={label}>
      <Input
        prefix={icon}
        value={p[field]}
        status={extra?.status}
        onChange={(e) => setPersonal(field, e.target.value)}
        placeholder={placeholder}
      />
    </Field>
  );

  return (
    <div>
      <Grid>
        {text("fullName", "Full name", <UserOutlined />, "e.g. Alex Morgan")}
        {text("jobTitle", "Professional title", <SolutionOutlined />, "e.g. Senior Software Engineer")}
        {text(
          "email",
          "Email",
          <MailOutlined />,
          "alex@example.com",
          { status: p.email && !isEmail(p.email) ? "error" : undefined },
        )}
        {text("phone", "Phone", <PhoneOutlined />, "+1 (555) 019-2834")}
        {text("location", "Location", <HomeOutlined />, "San Francisco, CA")}
        {text("website", "Portfolio / website", <GlobalOutlined />, "yourwebsite.com")}
        {text("linkedin", "LinkedIn", <LinkedinOutlined />, "linkedin.com/in/you")}
        {text("github", "GitHub", <GithubOutlined />, "github.com/you")}
      </Grid>

      <Field label="Photo" style={{ marginBottom: 12 }}>
        <Space align="center" wrap>
          <Avatar size={48} src={p.avatarUrl || undefined} icon={<UserOutlined />} />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={onPhoto}
          />
          <Button icon={<UploadOutlined />} onClick={() => fileRef.current?.click()}>
            Upload photo
          </Button>
          <Input
            style={{ width: 220 }}
            value={p.avatarUrl.startsWith("data:") ? "" : p.avatarUrl}
            placeholder={p.avatarUrl.startsWith("data:") ? "Uploaded image" : "…or paste an image URL"}
            onChange={(e) => setPersonal("avatarUrl", e.target.value)}
          />
          {p.avatarUrl && (
            <Button type="link" danger onClick={() => setPersonal("avatarUrl", "")}>
              Remove
            </Button>
          )}
        </Space>
        <Text type="secondary" style={{ display: "block", fontSize: 12, marginTop: 4 }}>
          Photos are optional. Many US/UK employers prefer CVs without one.
        </Text>
      </Field>

      <Field label="Professional summary">
        <TextArea
          rows={5}
          value={data.summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Your role, years of experience, and your strongest result in 2–3 sentences."
        />
        <Text style={{ fontSize: 12, color: summaryColor }} type={summaryColor ? undefined : "secondary"}>
          {words} words · aim for 40–90
        </Text>
      </Field>
    </div>
  );
};

export default PersonalTab;
