import { useSession, signIn, signOut } from "next-auth/react";

const Login = () => {
  const { data: session, status } = useSession();

  const handleSignIn = () => {
    signIn();
  };

  const handleSignOut = () => {
    console.log("signing out");
    signOut();
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (session) {
    return (
      <div>
        {/* <p>Signed in as {session.user.email}</p> */}
        <button onClick={handleSignOut}>Sign out</button>
      </div>
    );
  }

  return (
    <div>
      <p>You are not signed in.</p>
      <button onClick={handleSignIn}>Sign in with GitHub</button>
    </div>
  );
};

export default Login;
