import { Link } from "react-router-dom";
import classes from "./Navbar.module.css";
export function Navbar() {
  return (
    <>
      <nav className={classes.nav}>
        <ul className={classes.ul}>
          <li>
            <Link to={"/"}>Getting Started</Link>
          </li>
          <li>
            <Link to={"cube-geometry"}>3d Cube</Link>
          </li>
          <li>
            <Link to={"rain-texture"}>Rain Texture</Link>
          </li>
          <li>
            <Link to={"group-geometry"}>Group Geometry</Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
