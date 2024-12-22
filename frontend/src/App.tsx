import { useState } from "react";
import { Greet } from "../wailsjs/go/main/App";
import { main } from "../wailsjs/go/models";
import Layout from "./components/common/layout";
import Png2Webp from "./components/png2webp/app";
import { Toaster } from "sonner";

function App() {
  const [resultText, setResultText] = useState(
    "Please enter your name below 👇"
  );
  const [name, setName] = useState("");
  const updateName = (e: any) => setName(e.target.value);
  const updateResultText = (result: string) => setResultText(result);

  function generate() {
    const t = main.Person.createFrom({
      name: "Peter",
      age: 27,
      address: {
        street: "123 Main St",
        postcode: "12345",
      },
    });
    Greet(t).then(updateResultText);
  }

  return (
    <div id="App">
      <Toaster richColors />
      <div className="bg-slate-100 w-screen h-screen">
        <Layout>
          <Png2Webp />
        </Layout>
      </div>
    </div>
  );
}

export default App;
