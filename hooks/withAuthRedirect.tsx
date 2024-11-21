import { JSX, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export const withAuthRedirect = (Component: React.ComponentType) => {
  const AuthenticatedComponent = (props: JSX.IntrinsicAttributes) => {
    const { user, isLoaded } = useUser();
    const router = useRouter();

    useEffect(() => {
      if (isLoaded && !user) {
        router.push("/"); // Redirect to landing page if not authenticated
      }
    }, [isLoaded, user, router]);

    // Wait until the user state is loaded
    if (!isLoaded) {
      return null; // Or a loading spinner, if desired
    }

    // Render the component if authenticated
    return user ? <Component {...props} /> : null;
  };

  return AuthenticatedComponent;
};
