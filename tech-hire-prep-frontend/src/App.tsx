import { ToastProvider } from "./components/ui/ToastProvider";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { RouterProvider } from "react-router-dom";
import { AppRouter } from "./routes/AppRouter";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider />
        <RouterProvider router={AppRouter} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;