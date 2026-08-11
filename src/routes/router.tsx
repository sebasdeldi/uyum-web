import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import RootLayout from "./root-layout";
import AuthenticatedLayout from "./authenticated-layout";
import LandingPage from "./landing-page";
import RegisterForm from "../features/auth/components/RegisterForm";
import LoginForm from "../features/auth/components/LoginForm";
import Index from "../features/mint-operations/components/Index";
import { useAuthStore } from "../store/auth-store";
import MintOperationRoute from "../features/mint-operations/components/MintOperationRoute";
import CreateMintForm from "../features/mint-operations/components/CreateMintForm";

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterForm,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginForm,
});

const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "authenticated",
  component: AuthenticatedLayout,
  beforeLoad: () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      throw redirect({ to: "/login" });
    }
  },
});

const mintOperationsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/mint-operations",
  component: Index,
});

const newMintOperationsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/mint-operations/new",
  component: CreateMintForm,
});

const mintOperationRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/mint-operation/$id",
  component: MintOperationRoute,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  registerRoute,
  loginRoute,
  authenticatedRoute.addChildren([
    mintOperationsRoute,
    mintOperationRoute,
    newMintOperationsRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
