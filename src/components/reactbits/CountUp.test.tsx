import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, it, expect, vi } from "vitest";
import CountUp from "./CountUp";

class IOStub {
  callback: IntersectionObserverCallback;
  constructor(cb: IntersectionObserverCallback) {
    this.callback = cb;
  }
  observe(target: Element) {
    this.callback(
      [{ isIntersecting: true, intersectionRatio: 1, target } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    );
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

describe("CountUp SSR + hydration", () => {
  it("shows the number after hydrating server HTML", async () => {
    vi.stubGlobal("IntersectionObserver", IOStub);
    const html = renderToString(<CountUp to={999.5} format={(n) => n.toFixed(2)} duration={0.3} />);
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);
    hydrateRoot(container, <CountUp to={999.5} format={(n) => n.toFixed(2)} duration={0.3} />);
    await new Promise((r) => setTimeout(r, 600));
    expect(container.textContent).toContain("999.50");
    vi.unstubAllGlobals();
  });
});
