import Layout from "./components/common/layout";
import Png2Webp from "./components/png2webp/app";
import { Toaster } from "sonner";

function App() {
  return (
    <div id="App">
      <Toaster richColors />
      <div className="bg-slate-100 w-screen min-h-screen h-full">
        <Layout>
          <Png2Webp />
        </Layout>
      </div>
    </div>
  );
}

export default App;
