import {
  BrowserRouter,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { GettingStarted } from "./components/GettingStarted";
import { CubeGeometry } from "./components/CubeGeometry";
import { Navbar } from "./components/Navbar";
import { Layout } from "./components/Layout";
import { RainTexture } from "./components/RainTexture";

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

        {
          path: "/rain-texture",
          element: <RainTexture />,
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
