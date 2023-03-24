import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import Layout from "../components/layout/layout";
import { ChakraProvider } from "@chakra-ui/react";
import RelayWrapper from "../components/relayWrapper/RelayWrapper";
import "../styles/globals.css";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <Provider store={store}>
      <SessionProvider session={session}>
        <ChakraProvider>
          <Layout>
            <RelayWrapper>
              <Component {...pageProps} />
            </RelayWrapper>
          </Layout>
        </ChakraProvider>
      </SessionProvider>
    </Provider>
  );
}
