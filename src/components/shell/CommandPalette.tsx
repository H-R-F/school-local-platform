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

const fold = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("fr");

export function CommandPalette({ open, user, onClose, onNavigate }: Props) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
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
    if (open) {
      setQuery("");
      setIndex(0);
      window.setTimeout(() => inputRef.current?.focus(), 0);
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

  const onKeyDown = (event: React.KeyboardEvent) => {
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
    }
  };

  return (
    <div className="cmdk-backdrop" onMouseDown={onClose}>
      <div className="cmdk" role="dialog" aria-modal="true" aria-label="Recherche globale" onMouseDown={(e) => e.stopPropagation()} onKeyDown={onKeyDown}>
        <div className="cmdk-input">
          <Search size={17} aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Aller à une page…"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmdk-list"
            aria-activedescendant={results[index] ? `cmdk-opt-${index}` : undefined}
            aria-label="Rechercher une page"
          />
          <kbd>Échap</kbd>
        </div>
        <ul id="cmdk-list" className="cmdk-list" role="listbox" ref={listRef}>
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
                <Icon size={17} aria-hidden="true" />
                <span>{item.label}</span>
                <small>{item.group}</small>
                {i === index && <CornerDownLeft size={14} aria-hidden="true" />}
              </li>
            );
          })}
          {results.length === 0 && <li className="cmdk-empty">Aucun résultat pour « {query} ».</li>}
        </ul>
        <div className="cmdk-foot"><span><kbd>↑</kbd><kbd>↓</kbd> naviguer</span><span><kbd>↵</kbd> ouvrir</span><span><kbd>Échap</kbd> fermer</span></div>
      </div>
    </div>
  );
}
