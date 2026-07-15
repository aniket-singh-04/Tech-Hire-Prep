import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { RouterProvider } from "react-router-dom";
import { AppRouter } from "./routes/AppRouter";
import { ToastProvider } from "./context/ToastContext";

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <RouterProvider router={AppRouter} />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;