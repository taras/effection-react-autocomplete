import {
  call,
  createChannel,
  createSignal,
  each,
  race,
  resource,
  sleep,
  spawn,
} from "effection";
import { Operation } from "effection";
import { Stream } from "effection";

export type AutocompleteResult<TResult> = [Stream<TResult, never>, (value: string) => void];

export function useAutocompleteOperation<TResult>(
  getResult: (value: string) => Operation<TResult>,
): Operation<AutocompleteResult<TResult>> {
  return resource(function* (provide) {
    const values = createSignal<string>();
    const results = createChannel<TResult, never>();

    yield* spawn(function* () {
      for (const value of yield* each(values)) {
        console.log("getting values", value)
        yield* race<string | void>([
          first(values),
          call(function* (): Operation<void> {
            yield* sleep(250);
            const result = yield* getResult(value);
            yield* results.send(result);
          }),
        ]);
        yield* each.next();
      }
    });

    yield* provide([results, values.send]);
  });
}

const first = <T>(stream: Stream<T, never>) => call(function* () {
  const subscription = yield* stream;
  const next = yield* subscription.next();
  return next.value;
});