import { type AnchorProvider, setProvider } from "@coral-xyz/anchor";

module.exports = (provider: AnchorProvider) => {
  setProvider(provider);
};
