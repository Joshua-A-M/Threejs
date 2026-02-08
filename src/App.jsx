import {
  BrowserRouter,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { GettingStarted } from "./components/GettingStarted";
import { CubeGeometry } from "./components/CubeGeometry";
import { Navbar } from "./components/Navbar";
import { Layout } from "./components/Layout";

function App() {
  const router = createBrowserRouter([
    {
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <GettingStarted />,
        },

        {
          path: "/cube-geometry",
          element: <CubeGeometry />,
        },
      ],
    },
  ]);
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
