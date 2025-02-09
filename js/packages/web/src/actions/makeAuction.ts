import { Keypair, TransactionInstruction } from '@safecoin/web3.js';
import {
  utils,
  findProgramAddress,
  IPartialCreateAuctionArgs,
  CreateAuctionArgs,
  StringPublicKey,
  toPublicKey,
  WalletSigner,
} from '@j0nnyboi/common';
import {
  AUCTION_PREFIX,
  createAuction,
} from '@j0nnyboi/common/dist/lib/actions/auction';
import { WalletNotConnectedError } from '@j0nnyboi/wallet-adapter-base';

// This command makes an auction
export async function makeAuction(
  wallet: WalletSigner,
  vault: StringPublicKey,
  auctionSettings: IPartialCreateAuctionArgs,
): Promise<{
  auction: StringPublicKey;
  instructions: TransactionInstruction[];
  signers: Keypair[];
}> {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  const PROGRAM_IDS = utils.programIds();

  const signers: Keypair[] = [];
  const instructions: TransactionInstruction[] = [];
  const auctionKey = (
    await findProgramAddress(
      [
        Buffer.from(AUCTION_PREFIX),
        toPublicKey(PROGRAM_IDS.auction).toBuffer(),
        toPublicKey(vault).toBuffer(),
      ],
      toPublicKey(PROGRAM_IDS.auction),
    )
  )[0];

  const fullSettings = new CreateAuctionArgs({
    ...auctionSettings,
    authority: wallet.publicKey.toBase58(),
    resource: vault,
  });

  createAuction(fullSettings, wallet.publicKey.toBase58(), instructions);

  return { instructions, signers, auction: auctionKey };
}
