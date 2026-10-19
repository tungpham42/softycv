import React from "react";
import {
  Button,
  Checkbox,
  Input,
  Select,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { CVData } from "../../types";
import type { Actions } from "../../hooks/useWorkspace";
import { QUICK_SKILLS, SKILL_LEVELS } from "../../constants";
import { uid } from "../../utils/text";
import { BulletEditor, EntryList, Field, Grid } from "./fields";

const { Text } = Typography;

interface TabProps {
  data: CVData;
  actions: Actions;
}

const join = (...parts: (string | undefined)[]) =>
  parts.filter(Boolean).join(" · ");

/* ---------- Experience ---------- */
export const ExperienceTab: React.FC<TabProps> = ({ data, actions }) => (
  <EntryList
    section="experience"
    items={data.experience}
    actions={actions}
    addLabel="Add work experience"
    emptyText="List your most recent role first. Recruiters read the top 3 bullets most closely."
    title={(e) => join(e.position, e.company)}
    create={() => ({
      id: uid("exp"),
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    })}
    render={(e, update) => (
      <>
        <Grid>
          <Field label="Position">
            <Input value={e.position} onChange={(ev) => update({ position: ev.target.value })} />
          </Field>
          <Field label="Company">
            <Input value={e.company} onChange={(ev) => update({ company: ev.target.value })} />
          </Field>
        </Grid>
        <Grid cols={3}>
          <Field label="Start">
            <Input
              placeholder="e.g. 2021 or Mar 2021"
              value={e.startDate}
              onChange={(ev) => update({ startDate: ev.target.value })}
            />
          </Field>
          <Field label="End">
            <Input
              placeholder="e.g. 2024"
              disabled={e.current}
              value={e.current ? "Present" : e.endDate}
              onChange={(ev) => update({ endDate: ev.target.value })}
            />
          </Field>
          <Field label="Location">
            <Input value={e.location} onChange={(ev) => update({ location: ev.target.value })} />
          </Field>
        </Grid>
        <Checkbox
          checked={e.current}
          style={{ marginBottom: 10 }}
          onChange={(ev) =>
            update({ current: ev.target.checked, endDate: ev.target.checked ? "Present" : "" })
          }
        >
          I currently work here
        </Checkbox>
        <Field label="Achievements & responsibilities">
          <BulletEditor
            value={e.description}
            onChange={(description) => update({ description })}
            placeholder={"• Led … resulting in 30% faster …\n• Built …"}
          />
        </Field>
      </>
    )}
  />
);

/* ---------- Education ---------- */
export const EducationTab: React.FC<TabProps> = ({ data, actions }) => (
  <EntryList
    section="education"
    items={data.education}
    actions={actions}
    addLabel="Add education"
    emptyText="Add your highest degree or most relevant training."
    title={(e) => join(e.degree, e.institution)}
    create={() => ({
      id: uid("edu"),
      institution: "",
      degree: "",
      fieldOfStudy: "",
      location: "",
      startDate: "",
      endDate: "",
      gpa: "",
      description: "",
    })}
    render={(e, update) => (
      <>
        <Grid>
          <Field label="School / university">
            <Input value={e.institution} onChange={(ev) => update({ institution: ev.target.value })} />
          </Field>
          <Field label="Degree">
            <Input
              placeholder="e.g. Bachelor of Science"
              value={e.degree}
              onChange={(ev) => update({ degree: ev.target.value })}
            />
          </Field>
          <Field label="Field of study">
            <Input value={e.fieldOfStudy} onChange={(ev) => update({ fieldOfStudy: ev.target.value })} />
          </Field>
          <Field label="Location">
            <Input value={e.location} onChange={(ev) => update({ location: ev.target.value })} />
          </Field>
        </Grid>
        <Grid cols={3}>
          <Field label="Start">
            <Input value={e.startDate} onChange={(ev) => update({ startDate: ev.target.value })} />
          </Field>
          <Field label="End">
            <Input value={e.endDate} onChange={(ev) => update({ endDate: ev.target.value })} />
          </Field>
          <Field label="GPA (optional)">
            <Input value={e.gpa} onChange={(ev) => update({ gpa: ev.target.value })} />
          </Field>
        </Grid>
        <Field label="Honors & activities (optional)">
          <Input.TextArea
            rows={2}
            value={e.description}
            onChange={(ev) => update({ description: ev.target.value })}
          />
        </Field>
      </>
    )}
  />
);

/* ---------- Skills ---------- */
export const SkillsTab: React.FC<TabProps> = ({ data, actions }) => {
  const addSkill = (name: string) => {
    if (
      name &&
      data.skills.some((s) => s.name.toLowerCase() === name.toLowerCase())
    ) {
      message.info(`${name} is already in your list.`);
      return;
    }
    actions.addItem("skills", { id: uid("sk"), name, level: "Advanced" });
  };
  const available = QUICK_SKILLS.filter(
    (q) => !data.skills.some((s) => s.name.toLowerCase() === q.toLowerCase()),
  );

  return (
    <div>
      {available.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Quick add:
          </Text>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
            {available.map((s) => (
              <Tag
                key={s}
                color="blue"
                style={{ cursor: "pointer", margin: 0 }}
                onClick={() => addSkill(s)}
              >
                + {s}
              </Tag>
            ))}
          </div>
        </div>
      )}

      {data.skills.map((skill, i) => (
        <div key={skill.id} style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          <Input
            placeholder="Skill, e.g. React"
            value={skill.name}
            onChange={(e) => actions.updateItem("skills", skill.id, { name: e.target.value })}
          />
          <Select
            style={{ width: 130, flexShrink: 0 }}
            value={skill.level || "Advanced"}
            onChange={(level) => actions.updateItem("skills", skill.id, { level })}
            options={SKILL_LEVELS.map((v) => ({ value: v, label: v }))}
          />
          <Tooltip title="Move up">
            <Button
              icon={<ArrowUpOutlined />}
              disabled={i === 0}
              onClick={() => actions.moveItem("skills", skill.id, -1)}
            />
          </Tooltip>
          <Tooltip title="Move down">
            <Button
              icon={<ArrowDownOutlined />}
              disabled={i === data.skills.length - 1}
              onClick={() => actions.moveItem("skills", skill.id, 1)}
            />
          </Tooltip>
          <Button
            danger
            icon={<DeleteOutlined />}
            aria-label={`Remove ${skill.name || "skill"}`}
            onClick={() => actions.removeItem("skills", skill.id)}
          />
        </div>
      ))}
      <Button
        type="dashed"
        block
        icon={<PlusOutlined />}
        onClick={() => addSkill("")}
        style={{ marginTop: 4 }}
      >
        Add skill
      </Button>
    </div>
  );
};

/* ---------- Projects ---------- */
export const ProjectsTab: React.FC<TabProps> = ({ data, actions }) => (
  <EntryList
    section="projects"
    items={data.projects}
    actions={actions}
    addLabel="Add project"
    emptyText="Projects are useful when you have little work experience or want to show side work."
    title={(p) => p.title}
    create={() => ({
      id: uid("proj"),
      title: "",
      subtitle: "",
      link: "",
      startDate: "",
      endDate: "",
      technologies: "",
      description: "",
    })}
    render={(p, update) => (
      <>
        <Grid>
          <Field label="Project title">
            <Input value={p.title} onChange={(e) => update({ title: e.target.value })} />
          </Field>
          <Field label="Your role">
            <Input
              placeholder="e.g. Creator & maintainer"
              value={p.subtitle}
              onChange={(e) => update({ subtitle: e.target.value })}
            />
          </Field>
          <Field label="Link">
            <Input
              placeholder="github.com/you/project"
              value={p.link}
              onChange={(e) => update({ link: e.target.value })}
            />
          </Field>
          <Field label="Technologies">
            <Input value={p.technologies} onChange={(e) => update({ technologies: e.target.value })} />
          </Field>
        </Grid>
        <Grid>
          <Field label="Start">
            <Input value={p.startDate} onChange={(e) => update({ startDate: e.target.value })} />
          </Field>
          <Field label="End">
            <Input value={p.endDate} onChange={(e) => update({ endDate: e.target.value })} />
          </Field>
        </Grid>
        <Field label="What it does and the result">
          <BulletEditor
            rows={3}
            value={p.description}
            onChange={(description) => update({ description })}
          />
        </Field>
      </>
    )}
  />
);

/* ---------- Certificates (was missing from the editor) ---------- */
export const CertificatesTab: React.FC<TabProps> = ({ data, actions }) => (
  <EntryList
    section="certificates"
    items={data.certificates}
    actions={actions}
    addLabel="Add certification"
    emptyText="Add licenses and certifications that match the job."
    title={(c) => join(c.title, c.issuer)}
    create={() => ({ id: uid("cert"), title: "", issuer: "", date: "", link: "" })}
    render={(c, update) => (
      <Grid>
        <Field label="Certification">
          <Input value={c.title} onChange={(e) => update({ title: e.target.value })} />
        </Field>
        <Field label="Issuer">
          <Input value={c.issuer} onChange={(e) => update({ issuer: e.target.value })} />
        </Field>
        <Field label="Date">
          <Input value={c.date} onChange={(e) => update({ date: e.target.value })} />
        </Field>
        <Field label="Credential link">
          <Input value={c.link} onChange={(e) => update({ link: e.target.value })} />
        </Field>
      </Grid>
    )}
  />
);
