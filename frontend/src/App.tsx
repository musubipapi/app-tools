import { AppContainer } from "./components/common/app-container";
import Layout from "./components/common/layout";
import { Toaster } from "sonner";

function App() {
  return (
    <div id="App">
      <Toaster richColors />
      <div className="bg-slate-100 w-screen min-h-screen h-full">
        <Layout>
          <AppContainer />
        </Layout>
      </div>
    </div>
  );
}

export default App;
