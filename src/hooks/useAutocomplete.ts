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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null); 

  useTask(
    function* () {
      let current;

      for (const value of yield* each(values)) {
        if (current) {
          yield* current.halt();
        }
        current = yield* spawn(function* () {
          yield* sleep(250);
          setError(null);
          setLoading(true);
          try {
            const results = yield* getResults(value);
            setResults(results);
          } catch (e) {
            if (e instanceof Error) {
              setError(e)
            } else {
              setError(new Error(`${e}`))
            }
          } finally {
            setLoading(false);
          }
        });
        yield* each.next();
      }
    },
    [setResults, values, setLoading]
  );

  return [results, values.send, { loading, error }] as const;
}
