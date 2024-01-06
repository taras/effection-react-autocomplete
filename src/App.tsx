import { Operation, call, useAbortSignal } from "effection";
import { useAutocomplete } from "./hooks/useAutocomplete";

type PersonInfo = {
  name: string;
  gender: string;
  hair_color: string;
  skin_color: string;
}

function* getResults(keyword: string): Operation<PersonInfo[]> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const signal = yield* useAbortSignal();

  const response = yield* call(
    fetch(`https://swapi-proxy.deno.dev/api/people/?search=${keyword}&delay=1000&status=500`, {
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

function App() {

  const [results, search, { loading, error }] = useAutocomplete<PersonInfo[]>({
    getResults,
  });

  return (
    <div className="container">
      <div className="flex items-center">
        <input className="border rounded-sm" onChange={(e) => {
          search(e.target.value)
        }}/>
        {loading ? "Loading..." : null}
        {error ? `${error}` : null}
        <ul>
          {results && results.map((item) => <li key={item.name}>{item.name}</li>)}
        </ul>
      </div>
    </div>
  )
}

export default App
