/* eslint-disable react-hooks/rules-of-hooks */
import { useMemo, useState } from "react";
import {
  each,
  createSignal,
  spawn,
  Operation,
  sleep,
} from "effection";
import { useTask } from "./useTask";

export function useAutocomplete<T>({
  getResults,
}: {
  getResults: (keyword: string) => Operation<T>;
}) {
  const values = useMemo(() => createSignal<string>(), []);
  const [results, setResults] = useState<T>();

  useTask(
    function* () {
      let current;

      for (const value of yield* each(values)) {
        if (current) {
          yield* current.halt();
        }
        current = yield* spawn(function* () {
          yield* sleep(250);
          const results = yield* getResults(value);
          setResults(results);
        });
        yield* each.next();
      }
    },
    [setResults, values]
  );

  return [results, values.send] as const;
}
