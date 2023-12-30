import {
  call,
  createChannel,
  createSignal,
  each,
  resource,
  sleep,
  spawn,
  suspend,
} from "effection";
import { Operation } from "effection";
import { Stream } from "effection";

export type AutocompleteResult<TResult> = [
  Stream<TResult, never>,
  (value: string) => void
];

export function useAutocompleteOperation<TResult>(
  getResult: (value: string) => Operation<TResult>
): Operation<AutocompleteResult<TResult>> {
  return resource(function* (provide) {
    const values = createSignal<string>();
    const results = createChannel<TResult, never>();

    yield* spawn(function* () {
      let current = yield* spawn(() => suspend()); // start with a placeholder

      try {
        for (const value of yield* each(values)) {
          // stop the current task;
          yield* current.halt();

          console.log("running loop")

          current = yield* spawn(function* () {
            yield* sleep(250);

            const result = yield* getResult(value);

            yield* results.send(result);
          });
          yield* each.next();
        }        
      } finally {
        console.log('exited');
      }

    });

    yield* provide([results, values.send]);
  });
}