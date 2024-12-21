import * as anchor from "@coral-xyz/anchor";
import { Vesting } from "@token-vesting/anchor/target/types/vesting";
import { PROGRAM_ID } from "@/constants";

export function getVestingProgram(
  connection: anchor.web3.Connection,
  wallet: anchor.Wallet
) {
  const provider = new anchor.AnchorProvider(connection, wallet, {});
  return new anchor.Program<Vesting>(
    require("@token-vesting/anchor/target/idl/vesting.json"),
    PROGRAM_ID,
    provider
  );
}
