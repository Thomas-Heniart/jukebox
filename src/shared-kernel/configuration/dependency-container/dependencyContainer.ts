export class DependencyContainer {
  private readonly _dependencies: Record<
    string,
    {
      factory: (...args: Array<never>) => unknown;
      inject: string[];
    }
  > = {};

  register<T>(param: {
    id: string;
    factory: (...args: Array<never>) => T;
    inject?: string[];
  }) {
    this._dependencies[param.id] = {
      factory: param.factory,
      inject: param.inject || [],
    };
    return this;
  }

  resolve<T>(id: string): T {
    const dependency = this._dependencies[id];
    const params = dependency.inject.map(this.resolve.bind(this));
    return dependency.factory(...(params as never[])) as T;
  }
}
