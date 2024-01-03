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

function App() {

  const [results, search] = useAutocomplete<PersonInfo[]>({
    getResults,
  });

  return (
    <div className="container">
      <div className="flex items-center">
        <input className="border rounded-sm" onChange={(e) => {
          search(e.target.value)
        }}/>
        <ul>
          {results && results.map((item) => <li key={item.name}>{item.name}</li>)}
        </ul>
      </div>
    </div>
  )
}

export default App
