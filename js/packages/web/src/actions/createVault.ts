import {
  Keypair,
  Connection,
  SystemProgram,
  TransactionInstruction,
} from '@safecoin/web3.js';
import {
  utils,
  createMint,
  findProgramAddress,
  StringPublicKey,
  toPublicKey,
  WalletSigner,
} from '@j0nnyboi/common';
import {
  initVault,
  MAX_VAULT_SIZE,
  VAULT_PREFIX,
} from '@j0nnyboi/common/dist/lib/actions/vault';
import { createTokenAccount } from '@j0nnyboi/common/dist/lib/actions/account';

import { AccountLayout, MintLayout } from '@safecoin/safe-token';
import { WalletNotConnectedError } from '@j0nnyboi/wallet-adapter-base';

// This command creates the external pricing oracle a vault
// This gets the vault ready for adding the tokens.
export async function createVault(
  connection: Connection,
  wallet: WalletSigner,
  priceMint: StringPublicKey,
  externalPriceAccount: StringPublicKey,
): Promise<{
  vault: StringPublicKey;
  fractionalMint: StringPublicKey;
  redeemTreasury: StringPublicKey;
  fractionTreasury: StringPublicKey;
  instructions: TransactionInstruction[];
  signers: Keypair[];
}> {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  const PROGRAM_IDS = utils.programIds();

  const signers: Keypair[] = [];
  const instructions: TransactionInstruction[] = [];

  const accountRentExempt = await connection.getMinimumBalanceForRentExemption(
    AccountLayout.span,
  );

  const mintRentExempt = await connection.getMinimumBalanceForRentExemption(
    MintLayout.span,
  );

  const vaultRentExempt = await connection.getMinimumBalanceForRentExemption(
    MAX_VAULT_SIZE,
  );

  const vault = Keypair.generate();

  const vaultAuthority = (
    await findProgramAddress(
      [
        Buffer.from(VAULT_PREFIX),
        toPublicKey(PROGRAM_IDS.vault).toBuffer(),
        vault.publicKey.toBuffer(),
      ],
      toPublicKey(PROGRAM_IDS.vault),
    )
  )[0];

  const fractionalMint = createMint(
    instructions,
    wallet.publicKey,
    mintRentExempt,
    0,
    toPublicKey(vaultAuthority),
    toPublicKey(vaultAuthority),
    signers,
  ).toBase58();

  const redeemTreasury = createTokenAccount(
    instructions,
    wallet.publicKey,
    accountRentExempt,
    toPublicKey(priceMint),
    toPublicKey(vaultAuthority),
    signers,
  ).toBase58();

  const fractionTreasury = createTokenAccount(
    instructions,
    wallet.publicKey,
    accountRentExempt,
    toPublicKey(fractionalMint),
    toPublicKey(vaultAuthority),
    signers,
  ).toBase58();

  const uninitializedVault = SystemProgram.createAccount({
    fromPubkey: wallet.publicKey,
    newAccountPubkey: vault.publicKey,
    lamports: vaultRentExempt,
    space: MAX_VAULT_SIZE,
    programId: toPublicKey(PROGRAM_IDS.vault),
  });
  instructions.push(uninitializedVault);
  signers.push(vault);

  await initVault(
    true,
    fractionalMint,
    redeemTreasury,
    fractionTreasury,
    vault.publicKey.toBase58(),
    wallet.publicKey.toBase58(),
    externalPriceAccount,
    instructions,
  );

  return {
    vault: vault.publicKey.toBase58(),
    fractionalMint,
    redeemTreasury,
    fractionTreasury,
    signers,
    instructions,
  };
}
