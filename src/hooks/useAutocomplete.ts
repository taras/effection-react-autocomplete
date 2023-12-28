/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";
import { run, useAbortSignal, call, each } from "effection";
import { useAutocompleteOperation } from "../operations/autocomplete";

type PersonInfo = {
  name: string;
  gender: string;
  hair_color: string;
  skin_color: string;
};

const noop = () => { };

export function useAutocomplete() {
  const [autocomplete, set] = useState<[PersonInfo[], (keyword: string) => void]>([
    [],
    noop,
  ]);

  useEffect(() => {
    const task = run(function* () {
      console.log("started task");
      const [results, trigger] = yield* useAutocompleteOperation<PersonInfo[]>(
        function* getResults(keyword) {
          console.log({ keyword })
          const signal = yield* useAbortSignal();

          const response = yield* call(
            fetch(`https://swapi.py4e.com/api/people/?search=${keyword}`, {
              signal,
            })
          );

          if (response.ok) {
            return yield* call(response.json());
          } else {
            throw new Error(`${response.statusText}`);
          }
        }
      );
      console.log({ results, trigger })

      for (const value of yield* each(results)) {
        // handle updates
        console.log("update", { value })
        set([value, trigger]);
        yield* each.next();
      }
    });

    return () => {
      run(() => task.halt());
    };
  }, [set]);

  return autocomplete;
}
