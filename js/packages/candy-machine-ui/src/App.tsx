import './App.css';
import { useMemo } from 'react';
import * as anchor from '@j0nnyboi/anchor';
import Home from './Home';
import { DEFAULT_TIMEOUT } from './connection';
import { clusterApiUrl } from '@safecoin/web3.js';
import { WalletAdapterNetwork } from '@araviel/wallet-adapter-base';
import {

  getSafecoinWallet as getSolletWallet

} from '@araviel/wallet-adapter-wallets';

import {
  ConnectionProvider,
  WalletProvider,
} from '@araviel/wallet-adapter-react';
import { WalletDialogProvider } from '@araviel/wallet-adapter-material-ui';

import { ThemeProvider, createTheme } from '@material-ui/core';

const theme = createTheme({
  palette: {
    type: 'dark',
  },
});

const getCandyMachineId = (): anchor.web3.PublicKey | undefined => {
  try {
    const candyMachineId = new anchor.web3.PublicKey(
      process.env.REACT_APP_CANDY_MACHINE_ID!,
    );

    return candyMachineId;
  } catch (e) {
    console.log('Failed to construct CandyMachineId', e);
    return undefined;
  }
};

const candyMachineId = getCandyMachineId();
const network = process.env.REACT_APP_SAFECOIN_NETWORK as WalletAdapterNetwork;
const rpcHost = process.env.REACT_APP_SAFECOIN_RPC_HOST!;
const connection = new anchor.web3.Connection(
  rpcHost ? rpcHost : anchor.web3.clusterApiUrl('devnet'),
);

const App = () => {
  const endpoint = useMemo(() => clusterApiUrl(network), []);

  const wallets = useMemo(
    () => [

      getSolletWallet({ network }),

    ],
    [],
  );

  return (
    <ThemeProvider theme={theme}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletDialogProvider>
            <Home
              candyMachineId={candyMachineId}
              connection={connection}
              txTimeout={DEFAULT_TIMEOUT}
              rpcHost={rpcHost}
            />
          </WalletDialogProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ThemeProvider>
  );
};

export default App;
