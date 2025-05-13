import { Command } from "commander";
import { addUser } from "../utils/add-user";

const program = new Command();

program.name("Arvo CLI").description("CLI for Arvo program").version("0.0.0");

program
  .command("add-user")
  .description("Add a user to the Arvo program")
  .argument("<userPublicKey>", "Public key of the user to add")
  .action(addUser);

program.parse();
