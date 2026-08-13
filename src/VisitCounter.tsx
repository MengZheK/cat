import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type VisitCounterValue = {
  siteViews: string | null;
};

const VisitCounterContext = createContext<VisitCounterValue>({ siteViews: null });
const VERCOUNT_SCRIPT_URL = "https://events.vercount.one/js";

export function VisitCounterProvider({ children }: { children: ReactNode }) {
  const [siteViews, setSiteViews] = useState<string | null>(null);

  useEffect(() => {
    const valueElement = document.getElementById("vercount_value_site_pv");
    if (!valueElement) return;

    const readValue = () => {
      const value = valueElement.textContent?.trim();
      if (value && value !== "加载中…") setSiteViews(value);
    };

    const observer = new MutationObserver(readValue);
    observer.observe(valueElement, { childList: true, characterData: true, subtree: true });

    const script = document.createElement("script");
    script.src = VERCOUNT_SCRIPT_URL;
    script.defer = true;
    script.async = true;
    script.dataset.vercount = "cat";
    script.addEventListener("load", readValue);
    document.head.appendChild(script);

    readValue();

    return () => {
      observer.disconnect();
      script.remove();
    };
  }, []);

  const value = useMemo(() => ({ siteViews }), [siteViews]);

  return (
    <VisitCounterContext.Provider value={value}>
      <span id="vercount_value_site_pv" className="visitCounterSource" aria-hidden>
        加载中…
      </span>
      {children}
    </VisitCounterContext.Provider>
  );
}

export function useVisitCounter(): VisitCounterValue {
  return useContext(VisitCounterContext);
}
