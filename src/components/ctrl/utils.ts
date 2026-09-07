import type { NCtrlShortcut, NCtrlShortcutKeys } from "./types"

const modifierOrder = ["ctrl", "alt", "shift", "meta"] as const

const aliases: Record<string, string> = {
  control: "ctrl",
  cmd: "meta",
  command: "meta",
  option: "alt",
  esc: "escape",
  return: "enter",
  spacebar: "space",
  " ": "space",
  arrowup: "arrowup",
  arrowdown: "arrowdown",
  arrowleft: "arrowleft",
  arrowright: "arrowright",
}

function normalizePart(value: string): string {
  const part = value.trim().toLowerCase()
  return aliases[part] ?? part
}

export function normalizeNCtrlChord(chord: string, platform = typeof navigator === "undefined" ? "" : navigator.platform): string {
  const parts = chord.split("+").map(normalizePart).filter(Boolean)
  const key = parts.find((part) => ![...modifierOrder, "mod"].includes(part as never)) ?? ""
  const modifiers = new Set(parts.filter((part) => part !== key).map((part) => part === "mod" ? (/mac|iphone|ipad/i.test(platform) ? "meta" : "ctrl") : part))
  return [...modifierOrder.filter((modifier) => modifiers.has(modifier)), key].filter(Boolean).join("+")
}

export function nCtrlEventChord(event: KeyboardEvent): string {
  const key = normalizePart(event.key)
  return [event.ctrlKey && "ctrl", event.altKey && "alt", event.shiftKey && "shift", event.metaKey && "meta", key]
    .filter(Boolean)
    .join("+")
}

export function nCtrlKeys(keys: NCtrlShortcutKeys): readonly string[] {
  return typeof keys === "string" ? [keys] : keys
}

export function matchesNCtrlShortcut(event: KeyboardEvent, keys: NCtrlShortcutKeys): string | undefined {
  const eventChord = nCtrlEventChord(event)
  return nCtrlKeys(keys).find((keysValue) => normalizeNCtrlChord(keysValue) === eventChord)
}

export function formatNCtrlChord(chord: string): string {
  const labels: Record<string, string> = { ctrl: "Ctrl", alt: "Alt", shift: "Shift", meta: "⌘", escape: "Esc", enter: "Enter", space: "Espacio", arrowup: "↑", arrowdown: "↓", arrowleft: "←", arrowright: "→" }
  return normalizeNCtrlChord(chord).split("+").map((part) => labels[part] ?? part.toUpperCase()).join(" + ")
}

export function resolveNCtrlShortcuts(declared: readonly NCtrlShortcut[], registered: readonly NCtrlShortcut[]): readonly NCtrlShortcut[] {
  const shortcuts = new Map<string, NCtrlShortcut>()
  for (const shortcut of registered) shortcuts.set(shortcut.id, shortcut)
  for (const shortcut of declared) shortcuts.set(shortcut.id, shortcut)
  return [...shortcuts.values()].filter((shortcut) => !shortcut.hidden)
}
