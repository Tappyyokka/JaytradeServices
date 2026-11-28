import { useEffect, useId, useRef, useState } from "react";
import { Clock3, Search, ShoppingBag, Store, TrendingUp, X } from "lucide-react";
import { discoverProducts, findStores } from "./productDiscovery";

const popularSearches = ["Wireless headphones", "Coffee", "Home & Living", "Sneakers"];

export default function MarketplaceSearch({
  initialQuery = "", products, stores, history, onSearch, onProduct, onStore, onClearHistory, withinStore,
}) {
  const [value, setValue] = useState(initialQuery);
  const [debounced, setDebounced] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const input = useRef(null);
  const listId = useId();
  const query = value.trim();
  const waiting = query !== debounced;
  const showMenu = open && !waiting;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query), 220);
    return () => window.clearTimeout(timer);
  }, [query]);

  const productOptions = !waiting && query
    ? discoverProducts(products, { q: query }).slice(0, 5).map((product) => ({
      id: product.id, title: product.name, subtitle: product.seller, Icon: ShoppingBag, action: () => onProduct(product, query),
    })) : [];
  const storeOptions = !waiting && query && !withinStore
    ? findStores(stores, query).slice(0, 3).map((store) => ({
      id: store.id, title: store.name, subtitle: store.category, Icon: Store, action: () => onStore(store.id, query),
    })) : [];
  const recent = query ? [] : history.slice(0, 4);
  const popular = query || withinStore ? [] : popularSearches;
  const sections = [
    { label: "Recent searches", options: recent.map((term) => ({ id: term, title: term, Icon: Clock3, action: () => onSearch(term) })) },
    { label: "Popular searches", options: popular.map((term) => ({ id: term, title: term, Icon: TrendingUp, action: () => onSearch(term) })) },
    { label: "Products", options: productOptions },
    { label: "Stores", options: storeOptions },
  ];
  const options = sections.flatMap(({ options }) => options);
  const selected = showMenu ? options[active] : undefined;

  function close() {
    setOpen(false);
    setActive(-1);
  }

  function select(option) {
    close();
    option.action();
  }

  function handleKey(event) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Escape" && open) {
      event.preventDefault();
      close();
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      if (options.length) {
        const direction = event.key === "ArrowDown" ? 1 : -1;
        const next = active < 0 ? (direction === 1 ? 0 : options.length - 1) : (active + direction + options.length) % options.length;
        setActive(next);
        document.getElementById(listId + "-" + next)?.scrollIntoView({ block: "nearest" });
      }
    }
    if (event.key === "Enter" && selected) {
      event.preventDefault();
      select(selected);
    }
  }

  return (
    <div className="mp-discovery-search" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) close(); }}>
      <form className="mp-search" role="search" onSubmit={(event) => {
        event.preventDefault();
        close();
        onSearch(query);
      }}>
        <Search size={18} aria-hidden="true" />
        <input ref={input} type="text" inputMode="search" role="combobox" aria-autocomplete="list" aria-haspopup="listbox"
          aria-expanded={showMenu && options.length > 0} aria-controls={showMenu && options.length > 0 ? listId : undefined}
          aria-activedescendant={selected ? listId + "-" + active : undefined} aria-label={withinStore ? "Search this store" : "Search Superstore"}
          placeholder={withinStore ? "Search this store" : "Search products, stores or brands"}
          maxLength={120} autoComplete="off" value={value} onFocus={() => setOpen(true)} onKeyDown={handleKey}
          onChange={(event) => { setValue(event.target.value); setActive(-1); setOpen(true); }} />
        {value && <button type="button" className="mp-search-clear" aria-label="Clear search" onClick={() => {
          const nextQuery = "";
          setValue(nextQuery);
          setActive(-1);
          if (initialQuery) {
            close();
            onSearch(nextQuery);
          } else {
            input.current?.focus();
            setOpen(true);
          }
        }}><X size={17} aria-hidden="true" /></button>}
        <button type="submit" className="mp-search-submit">Search</button>
      </form>
      {open && (waiting || (!options.length && query)) && (
        <div className="mp-suggestion-panel" role="status">{waiting ? "Finding suggestions…" : "No suggestions. Search to see all results."}</div>
      )}
      {showMenu && options.length > 0 && (
        <div className="mp-suggestion-panel">
          {recent.length > 0 && <button className="mp-suggestion-clear" type="button" onClick={() => {
            setActive(-1);
            onClearHistory();
            input.current?.focus();
          }}>Clear recent searches</button>}
          <ul id={listId} role="listbox" aria-label="Search suggestions">
            {sections.filter(({ options }) => options.length).map(({ label, options: items }) => (
              <li key={label} role="presentation">
                <ul role="group" aria-label={label}>
                  <li className="mp-suggestion-label" role="presentation">{label}</li>
                  {items.map((option) => {
                    const position = options.indexOf(option);
                    const { id, title, subtitle, Icon } = option;
                    return <li key={id} id={listId + "-" + position} className="mp-suggestion-option" role="option"
                      aria-selected={position === active} onMouseDown={(event) => event.preventDefault()} onClick={() => select(option)}>
                      <Icon size={16} aria-hidden="true" /><span>{title}{subtitle && <small>{subtitle}</small>}</span>
                    </li>;
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
