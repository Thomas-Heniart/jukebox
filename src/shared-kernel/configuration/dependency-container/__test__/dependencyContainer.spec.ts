import { beforeEach, describe, expect, it } from "@jest/globals";
import { DependencyContainer } from "@/shared-kernel/configuration/dependency-container/dependencyContainer";

describe("DependencyContainer", () => {
  let container: DependencyContainer;

  beforeEach(() => {
    container = new DependencyContainer();
  });

  it("should be able to resolve a dependency", () => {
    container.register({
      id: "foo",
      factory: () => "bar",
    });

    expect(container.resolve("foo")).toEqual("bar");
  });

  it("should be able to resolve a dependency with injection", () => {
    container
      .register({
        id: "foo",
        factory: (bar: string) => bar,
        inject: ["bar"],
      })
      .register({
        id: "bar",
        factory: () => "bar",
      });

    expect(container.resolve("foo")).toEqual("bar");
  });
});
