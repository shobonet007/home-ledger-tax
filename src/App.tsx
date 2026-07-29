import { Toaster } from "sonner";
import MobileApp from "./components/MobileApp";

function App() {
  return (
    <>
      <MobileApp />
      <Toaster position="top-center" richColors />
    </>
  );
}

export default App;