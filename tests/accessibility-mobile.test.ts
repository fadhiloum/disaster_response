import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

function mockShellDependencies() {
  vi.doMock("@/app/lib/data", () => ({
    data: {
      listUsers: vi.fn(async () => [
        {
          id: "user-coordinator",
          name: "Maya Chen",
          email: "maya.chen@example.org",
          role: "Coordinator",
          organization: "Mercy Malaysia",
        },
      ]),
    },
  }));
  vi.doMock("@/app/lib/auth", () => ({
    getSessionUser: vi.fn(async () => ({
      id: "user-coordinator",
      name: "Maya Chen",
      email: "maya.chen@example.org",
      role: "Coordinator",
      organization: "Mercy Malaysia",
    })),
  }));
}

function flattenElements(node: React.ReactNode): React.ReactElement[] {
  if (Array.isArray(node)) {
    return node.flatMap(flattenElements);
  }

  if (!React.isValidElement<Record<string, unknown>>(node)) {
    return [];
  }

  return [
    node,
    ...flattenElements(node.props.children as React.ReactNode),
  ];
}

function textContent(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(textContent).join("");
  }

  if (!React.isValidElement<Record<string, unknown>>(node)) {
    return "";
  }

  return textContent(node.props.children as React.ReactNode);
}

describe("Accessibility and mobile layout checks", () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.doUnmock("@/app/lib/data");
    vi.doUnmock("@/app/lib/auth");
  });

  it("keeps AppShell navigation labeled and responsive", async () => {
    mockShellDependencies();
    const { AppShell } = await import("@/app/components/app-shell");

    const shell = await AppShell({
      active: "Programs",
      children: React.createElement("section", null, "Program content"),
    });
    const elements = flattenElements(shell);
    const classes = elements
      .map((element) => (element.props as Record<string, unknown>).className)
      .filter((className): className is string => typeof className === "string");
    const image = elements.find(
      (element) =>
        (element.props as Record<string, unknown>).alt === "MERCY Malaysia",
    );
    const nav = elements.find((element) => element.type === "nav");
    const incidentLink = elements.find(
      (element) =>
        (element.props as Record<string, unknown>).href === "/incidents",
    );
    const navProps = nav?.props as Record<string, unknown> | undefined;

    expect(image?.props as Record<string, unknown>).toMatchObject({
      alt: "MERCY Malaysia",
    });
    expect(navProps?.className).toContain("overflow-x-auto");
    expect(navProps?.className).toContain("lg:flex-col");
    expect(classes.some((className) => className.includes("lg:flex-row"))).toBe(
      true,
    );
    expect(classes.some((className) => className.includes("lg:w-72"))).toBe(true);
    expect(textContent(incidentLink)).toContain("Programs");
  });
});
