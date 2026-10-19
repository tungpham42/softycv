import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { emptyCVData, initialCVData, initialDesignConfig } from "../constants";
import type {
  CVData,
  CVDocument,
  CVProfile,
  DesignConfig,
  ItemOf,
  ListSection,
  SectionKey,
} from "../types";
import {
  Workspace,
  loadWorkspace,
  makeProfile,
  saveWorkspace,
} from "../utils/storage";
import { uid } from "../utils/text";
import { useHistory } from "./useHistory";

export type SaveStatus = "saved" | "saving" | "error";

/**
 * Owns every CV version, the active document (with undo/redo) and
 * debounced persistence. The UI only talks to the actions returned here.
 */
export function useWorkspace() {
  const initial = useMemo(loadWorkspace, []);
  const [profiles, setProfiles] = useState<CVProfile[]>(initial.profiles);
  const [activeId, setActiveId] = useState(initial.activeId);
  const activeProfile =
    initial.profiles.find((p) => p.id === initial.activeId) ??
    initial.profiles[0];
  const history = useHistory<CVDocument>(activeProfile.doc);
  const doc = history.state;

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [savedAt, setSavedAt] = useState<number>(Date.now());

  /* ---------- persistence (debounced) ---------- */
  const latest = useRef({ profiles, activeId, doc });
  latest.current = { profiles, activeId, doc };

  const flush = useCallback(() => {
    const { profiles: ps, activeId: id, doc: d } = latest.current;
    const ws: Workspace = {
      activeId: id,
      profiles: ps.map((p) =>
        p.id === id ? { ...p, doc: d, updatedAt: Date.now() } : p,
      ),
    };
    const ok = saveWorkspace(ws);
    setSaveStatus(ok ? "saved" : "error");
    if (ok) setSavedAt(Date.now());
  }, []);

  useEffect(() => {
    setSaveStatus("saving");
    const t = setTimeout(flush, 500);
    return () => clearTimeout(t);
  }, [doc, profiles, activeId, flush]);

  // Don't lose the last keystrokes when the tab closes.
  useEffect(() => {
    window.addEventListener("beforeunload", flush);
    return () => window.removeEventListener("beforeunload", flush);
  }, [flush]);

  /* ---------- document editing ---------- */
  const setData = useCallback(
    (fn: (d: CVData) => CVData) =>
      history.set((cur) => ({ ...cur, data: fn(cur.data) })),
    [history],
  );

  const setDesign = useCallback(
    (patch: Partial<DesignConfig>) =>
      history.set((cur) => ({ ...cur, design: { ...cur.design, ...patch } })),
    [history],
  );

  const setPersonal = useCallback(
    (field: keyof CVData["personalInfo"], value: string) =>
      setData((d) => ({
        ...d,
        personalInfo: { ...d.personalInfo, [field]: value },
      })),
    [setData],
  );

  const setSummary = useCallback(
    (summary: string) => setData((d) => ({ ...d, summary })),
    [setData],
  );

  const addItem = useCallback(
    <K extends ListSection>(section: K, item: ItemOf<K>) =>
      setData((d) => ({
        ...d,
        [section]: [...(d[section] as ItemOf<K>[]), item],
      })),
    [setData],
  );

  const updateItem = useCallback(
    <K extends ListSection>(
      section: K,
      id: string,
      patch: Partial<ItemOf<K>>,
    ) =>
      setData((d) => ({
        ...d,
        [section]: (d[section] as ItemOf<K>[]).map((it) =>
          it.id === id ? { ...it, ...patch } : it,
        ),
      })),
    [setData],
  );

  const removeItem = useCallback(
    (section: ListSection, id: string) =>
      setData((d) => ({
        ...d,
        [section]: (d[section] as { id: string }[]).filter(
          (it) => it.id !== id,
        ),
      })),
    [setData],
  );

  const duplicateItem = useCallback(
    (section: ListSection, id: string) =>
      setData((d) => {
        const list = d[section] as { id: string }[];
        const i = list.findIndex((it) => it.id === id);
        if (i < 0) return d;
        const copy = { ...list[i], id: uid(section.slice(0, 3)) };
        return {
          ...d,
          [section]: [...list.slice(0, i + 1), copy, ...list.slice(i + 1)],
        };
      }),
    [setData],
  );

  const moveItem = useCallback(
    (section: ListSection, id: string, dir: -1 | 1) =>
      setData((d) => {
        const list = [...(d[section] as { id: string }[])];
        const i = list.findIndex((it) => it.id === id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= list.length) return d;
        [list[i], list[j]] = [list[j], list[i]];
        return { ...d, [section]: list };
      }),
    [setData],
  );

  const moveSection = useCallback(
    (key: SectionKey, dir: -1 | 1) =>
      setData((d) => {
        const list = [...d.sections];
        const i = list.findIndex((s) => s.key === key);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= list.length) return d;
        [list[i], list[j]] = [list[j], list[i]];
        return { ...d, sections: list };
      }),
    [setData],
  );

  const toggleSection = useCallback(
    (key: SectionKey, visible: boolean) =>
      setData((d) => ({
        ...d,
        sections: d.sections.map((s) =>
          s.key === key ? { ...s, visible } : s,
        ),
      })),
    [setData],
  );

  const replaceData = useCallback(
    (data: CVData, design?: DesignConfig) =>
      history.set((cur) => ({ data, design: design ?? cur.design })),
    [history],
  );

  /* ---------- versions (profiles) ---------- */
  const commitActive = useCallback(
    () =>
      latest.current.profiles.map((p) =>
        p.id === latest.current.activeId
          ? { ...p, doc: latest.current.doc, updatedAt: Date.now() }
          : p,
      ),
    [],
  );

  const switchProfile = useCallback(
    (id: string) => {
      if (id === latest.current.activeId) return;
      const committed = commitActive();
      const target = committed.find((p) => p.id === id);
      if (!target) return;
      setProfiles(committed);
      setActiveId(id);
      history.reset(target.doc);
    },
    [commitActive, history],
  );

  const createProfile = useCallback(
    (name: string, mode: "blank" | "sample" | "copy") => {
      const committed = commitActive();
      const current = latest.current.doc;
      const docFor: CVDocument =
        mode === "copy"
          ? { data: current.data, design: current.design }
          : mode === "sample"
            ? { data: initialCVData, design: initialDesignConfig }
            : { data: emptyCVData, design: current.design };
      const profile = makeProfile(name, docFor);
      setProfiles([...committed, profile]);
      setActiveId(profile.id);
      history.reset(profile.doc);
    },
    [commitActive, history],
  );

  const renameProfile = useCallback((id: string, name: string) => {
    setProfiles((ps) =>
      ps.map((p) => (p.id === id ? { ...p, name: name.trim() || p.name } : p)),
    );
  }, []);

  const deleteProfile = useCallback(
    (id: string) => {
      const committed = commitActive();
      if (committed.length <= 1) return;
      const rest = committed.filter((p) => p.id !== id);
      setProfiles(rest);
      if (id === latest.current.activeId) {
        setActiveId(rest[0].id);
        history.reset(rest[0].doc);
      }
    },
    [commitActive, history],
  );

  const profileList = useMemo(
    () => profiles.map((p) => (p.id === activeId ? { ...p, doc } : p)),
    [profiles, activeId, doc],
  );

  return {
    data: doc.data,
    design: doc.design,
    profiles: profileList,
    activeId,
    activeName: profileList.find((p) => p.id === activeId)?.name ?? "CV",
    saveStatus,
    savedAt,
    undo: history.undo,
    redo: history.redo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    actions: {
      setPersonal,
      setSummary,
      setDesign,
      addItem,
      updateItem,
      removeItem,
      duplicateItem,
      moveItem,
      moveSection,
      toggleSection,
      replaceData,
      switchProfile,
      createProfile,
      renameProfile,
      deleteProfile,
    },
  };
}

export type Actions = ReturnType<typeof useWorkspace>["actions"];
