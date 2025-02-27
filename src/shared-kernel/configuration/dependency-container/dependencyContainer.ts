export class DependencyContainer {
  private readonly _dependencies: Record<
    string,
    {
      factory: (...args: Array<never>) => unknown;
      inject: string[];
    }
  > = {};

  private readonly _resolved: Record<string, unknown> = {};

  register<T>(param: {
    id: string;
    factory: (...args: Array<never>) => T | Promise<T>;
    inject?: string[];
  }) {
    this._dependencies[param.id] = {
      factory: param.factory,
      inject: param.inject || [],
    };
    return this;
  }

  async resolve<T>(id: string): Promise<T> {
    if (this._resolved[id]) return this._resolved[id] as T;
    const dependency = this._dependencies[id];
    const params = await Promise.all(
      dependency.inject.map(this.resolve.bind(this)),
    );
    const resolved = (await dependency.factory(...(params as never[]))) as T;
    this._resolved[id] = resolved;
    return resolved;
  }
}
