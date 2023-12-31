import { Operation, run } from "effection";
import { useEffect, type DependencyList } from "react";

export function useTask(operation: () => Operation<unknown>, deps?: DependencyList): void {
  useEffect(() => {
    const task = run(operation);

    return () => {
      run(() => task.halt());
    };
  }, deps)
}
