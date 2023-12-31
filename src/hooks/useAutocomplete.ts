q/* eslint-disable react-hooks/rules-of-hooks */
import { useMemo, useState } from "react";
import { useAbortSignal, call, each, createSignal, spawn, Operation, sleep } from "effection";
import { useTask } from "./useTask";

type PersonInfo = {
  name: string;
  gender: string;
  hair_color: string;
  skin_color: string;
};

export function useAutocomplete() {
  const values = useMemo(() => createSignal<string>(), []);
  const [results, setResults] = useState<PersonInfo[]>([]);
 
  useTask(function* () {
    let current = yield* spawn(function*() {});

    for (const value of yield* each(values)) {
      yield* current.halt();
      current = yield* spawn(function*() {
	yield* sleep(250);
	let results = yield* getResults(value);
	setResults(results);
      });
      yield* each.next();
    }

}, [setResults, values]);

  return [results, values.send];
}

function* getResults(keyword: string): Operation<PersonInfo[]> {
  console.log({ keyword })
  const signal = yield* useAbortSignal();

  const response = yield* call(
    fetch(`https://swapi.py4e.com/api/people/?search=${keyword}`, {
      signal,
    })
  );

  const result = yield* call(response.json());
  
  if (response.ok) {
    return result.results;
  } else {
    throw new Error(`${response.statusText}`);
  }
}
