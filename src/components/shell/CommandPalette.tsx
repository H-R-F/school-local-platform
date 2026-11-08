import { useEffect, useMemo, useRef, useState } from "react";
import { CornerDownLeft, Search } from "lucide-react";
import { navigation } from "../../data/navigation";
import type { AuthenticatedSidebarUser } from "../../types/navigation";

interface Props {
  open: boolean;
  user: AuthenticatedSidebarUser;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

const fold = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr");

export function CommandPalette({ open, user, onClose, onNavigate }: Props) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => {
    const q = fold(query.trim());
    return navigation
      .flatMap((group) =>
        group.items
          .filter((item) => item.roles.includes(user.role) && user.permissions.includes(item.permission))
          .map((item) => ({ ...item, group: group.label })),
      )
      .filter((item) => !q || fold(item.label).includes(q) || fold(item.group).includes(q));
  }, [query, user.role, user.permissions]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => {
      window.clearTimeout(focusTimer);
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setIndex(0);
    }
  }, [open]);

  useEffect(() => setIndex(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${index}"]`)?.scrollIntoView({ block: "nearest" });
  }, [index]);

  if (!open) return null;

  const choose = (route: string) => {
    onClose();
    onNavigate(route);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setIndex((value) => Math.min(value + 1, Math.max(results.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setIndex((value) => Math.max(value - 1, 0));
    } else if (event.key === "Enter" && results[index]) {
      event.preventDefault();
      choose(results[index].route);
    } else if (event.key === "Tab") {
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('input:not([disabled]),button:not([disabled]),[href],[tabindex]:not([tabindex="-1"])');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <div className="cmdk-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={dialogRef} className="cmdk" role="dialog" aria-modal="true" aria-labelledby="cmdk-title" aria-describedby="cmdk-help" onKeyDown={onKeyDown}>
        <div className="cmdk-input">
          <Search size={18} aria-hidden="true" />
          <span id="cmdk-title" className="sr-only">Recherche globale</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Aller à une page…"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded="true"
            aria-controls="cmdk-list"
            aria-activedescendant={results[index] ? `cmdk-opt-${index}` : undefined}
            aria-label="Rechercher une page"
          />
          <kbd aria-hidden="true">Échap</kbd>
        </div>
        <ul id="cmdk-list" className="cmdk-list" role="listbox" aria-label="Résultats de navigation" ref={listRef}>
          {results.map((item, i) => {
            const Icon = item.icon;
            return (
              <li
                key={item.id}
                id={`cmdk-opt-${i}`}
                data-index={i}
                role="option"
                aria-selected={i === index}
                className={i === index ? "is-active" : ""}
                onMouseMove={() => setIndex(i)}
                onClick={() => choose(item.route)}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
                <small>{item.group}</small>
                {i === index && <CornerDownLeft size={16} aria-hidden="true" />}
              </li>
            );
          })}
          {results.length === 0 && <li className="cmdk-empty" role="presentation">Aucun résultat pour « {query} ».</li>}
        </ul>
        <div id="cmdk-help" className="cmdk-foot"><span><kbd>↑</kbd><kbd>↓</kbd> naviguer</span><span><kbd>↵</kbd> ouvrir</span><span><kbd>Échap</kbd> fermer</span></div>
      </div>
    </div>
  );
}
