import React, { useState } from "react";
import { Button, Dropdown, Input, Modal, Select, Space, message } from "antd";
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  FileAddOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import type { CVProfile } from "../types";
import type { Actions } from "../hooks/useWorkspace";

interface Props {
  profiles: CVProfile[];
  activeId: string;
  actions: Actions;
}

type Dialog = null | { mode: "blank" | "copy" | "rename"; value: string };

/** Switch between CV versions (e.g. one per job application). */
const ProfileMenu: React.FC<Props> = ({ profiles, activeId, actions }) => {
  const [dialog, setDialog] = useState<Dialog>(null);
  const active = profiles.find((p) => p.id === activeId);

  const confirm = () => {
    if (!dialog) return;
    const name = dialog.value.trim();
    if (!name) {
      message.warning("Give this CV a name.");
      return;
    }
    if (dialog.mode === "rename") actions.renameProfile(activeId, name);
    else actions.createProfile(name, dialog.mode);
    setDialog(null);
  };

  const titles = {
    blank: "New blank CV",
    copy: "Duplicate this CV",
    rename: "Rename CV",
  } as const;

  return (
    <>
      <Space.Compact>
        <Select
          style={{ width: 190 }}
          value={activeId}
          onChange={actions.switchProfile}
          options={profiles.map((p) => ({ value: p.id, label: p.name }))}
          aria-label="Switch CV version"
        />
        <Dropdown
          trigger={["click"]}
          menu={{
            items: [
              {
                key: "blank",
                icon: <FileAddOutlined />,
                label: "New blank CV",
              },
              {
                key: "copy",
                icon: <CopyOutlined />,
                label: "Duplicate this CV",
              },
              { key: "rename", icon: <EditOutlined />, label: "Rename" },
              { type: "divider" },
              {
                key: "delete",
                icon: <DeleteOutlined />,
                danger: true,
                label: "Delete this CV",
                disabled: profiles.length <= 1,
              },
            ],
            onClick: ({ key }) => {
              if (key === "blank")
                setDialog({
                  mode: "blank",
                  value: `CV ${profiles.length + 1}`,
                });
              if (key === "copy")
                setDialog({
                  mode: "copy",
                  value: `${active?.name ?? "CV"} (copy)`,
                });
              if (key === "rename")
                setDialog({ mode: "rename", value: active?.name ?? "" });
              if (key === "delete") {
                Modal.confirm({
                  title: `Delete “${active?.name}”?`,
                  content:
                    "This removes the CV from this browser. Export it first if you may need it again.",
                  okText: "Delete",
                  okButtonProps: { danger: true },
                  onOk: () => actions.deleteProfile(activeId),
                });
              }
            },
          }}
        >
          <Button icon={<MoreOutlined />} aria-label="CV version actions" />
        </Dropdown>
      </Space.Compact>

      <Modal
        open={!!dialog}
        title={dialog ? titles[dialog.mode] : ""}
        okText={dialog?.mode === "rename" ? "Rename" : "Create"}
        onOk={confirm}
        onCancel={() => setDialog(null)}
      >
        <Input
          autoFocus
          maxLength={60}
          value={dialog?.value}
          onChange={(e) =>
            setDialog((d) => d && { ...d, value: e.target.value })
          }
          onPressEnter={confirm}
          placeholder="e.g. Frontend role at Acme"
        />
      </Modal>
    </>
  );
};

export default ProfileMenu;
