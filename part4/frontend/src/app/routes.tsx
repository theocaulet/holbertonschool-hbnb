import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Home } from "./components/Home";
import { Login } from "./components/Login";
import { Places } from "./components/Places";
import { AddReview } from "./components/AddReview";
import { PlaceDetails } from "./components/PlaceDetails";
import { CreatePlace } from "./components/CreatePlace";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "login", Component: Login },
      { path: "places", Component: Places },
      { path: "places/new", Component: CreatePlace },
      { path: "places/:id", Component: PlaceDetails },
      { path: "add-review", Component: AddReview },
    ],
  },
]);
