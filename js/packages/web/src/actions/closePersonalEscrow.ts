import { Connection, Keypair, TransactionInstruction } from '@safecoin/web3.js';
import {
  utils,
  sendTransactionWithRetry,
  StringPublicKey,
  toPublicKey,
  WalletSigner,
} from '@j0nnyboi/common';
import { WalletNotConnectedError } from '@j0nnyboi/wallet-adapter-base';
import { Token } from '@safecoin/safe-token';
// When you are an artist and you receive royalties, due to the design of the system
// it is to a permanent ATA WSAFE account. This is because the auctioneer can't transfer monies
// from your WSAFE to your SAFE wallet since you own both, and having the auctioneer temporarily
// own your WSOL account to the transfer is one hell of a security vulnerability for a little convenience.
// Instead we make the WSOL permanent, and you have to accept it on the UI via your "unsettled funds"
// notification. All we do is then transfer the lamports out of the account.
export async function closePersonalEscrow(
  connection: Connection,
  wallet: WalletSigner,
  ata: StringPublicKey,
) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  const PROGRAM_IDS = utils.programIds();

  const signers: Keypair[] = [];

  const instructions: TransactionInstruction[] = [
    Token.createCloseAccountInstruction(
      PROGRAM_IDS.token,
      toPublicKey(ata),
      wallet.publicKey,
      wallet.publicKey,
      [],
    ),
  ];

  await sendTransactionWithRetry(
    connection,
    wallet,
    instructions,
    signers,
    'single',
  );
}
