import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Vesting } from "../target/types/vesting";
import { describe, it } from "mocha";

describe("vesting", () => {
  // Configure the client to use devnet
  const connection = new anchor.web3.Connection(
    "https://api.devnet.solana.com"
  );
  const provider = new anchor.AnchorProvider(
    connection,
    anchor.AnchorProvider.env().wallet,
    {}
  );
  anchor.setProvider(provider);

  const program = anchor.workspace.Vesting as Program<Vesting>;

  it("Can create vesting account", async () => {
    const tx = await program.methods.createVestingAccount("Test Company").rpc();
    console.log("Your transaction signature", tx);
  });
});
