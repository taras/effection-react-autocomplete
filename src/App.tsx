import { useAutocomplete } from "./hooks/useAutocomplete";

function App() {

  const [items, trigger] = useAutocomplete();

  console.log({ items, trigger })

  return (
    <div className="container">
      <div className="flex items-center">
        <input className="border rounded-sm" onChange={(e) => {
          console.log({ value: e.target.value })
          trigger(e.target.value)
        }}/>
        <ul className="">
          {items.map((item) => <li key={item.name}>{item.name}</li>)}
        </ul>
      </div>
    </div>
  )
}

export default App
