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
import { GroupGeometry } from "./components/GroupGeometry";
import { RotatingGeometry } from "./components/RotatingGeometry";
import { Dominos } from "./components/Dominos";
import { Drag } from "./components/Drag";

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
        {
          path: "/group-geometry",
          element: <GroupGeometry />,
        },
        {
          path: "/rotating-geometry",
          element: <RotatingGeometry />,
        },
        {
          path: "/dominos",
          element: <Dominos />
        },
        {
          path: "/drag",
          element: <Drag />
        }
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
