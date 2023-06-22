"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { ethers } from "ethers";
import { ChangeEvent, useMemo, useState } from "react";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import {
  configureChains,
  createConfig,
  usePrepareSendTransaction,
  useSendTransaction,
  WagmiConfig,
} from "wagmi";
import { arbitrum, mainnet, polygon } from "wagmi/chains";
import { Web3Button } from "@web3modal/react";
import { useAccount } from "wagmi";
import { useDebounce } from "use-debounce";
import { useEthersProvider } from "./ethers";
import { sendTransaction } from "@wagmi/core";
import { ToastContainer, toast } from "react-toastify";

const chains = [arbitrum, mainnet, polygon];
const projectId = "e14d37f15600f99222e2ff44adf1bc52";

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  publicClient,
});
const ethereumClient = new EthereumClient(wagmiConfig, chains);

export default function Home() {
  const { connector, isConnecting, isDisconnected } = useAccount();

  const [hex, setHex] = useState<string>("");
  const [debouncedHex] = useDebounce(hex, 500);
  const [hexTo, setHexTo] = useState<string>("");
  const [debouncedHexTo] = useDebounce(hexTo, 500);

  const [text, setText] = useState<string>("");
  const [debouncedText] = useDebounce(text, 500);
  const [textTo, setTextTo] = useState<string>("");
  const [debouncedTextTo] = useDebounce(textTo, 500);

  const onEthscribeText = async () => {
    console.log(debouncedTextTo);
    if (debouncedText == "" || debouncedTextTo == "") {
      toast.error("Text or To is blank!");
      return;
    }
    if (ethers.isAddress(debouncedTextTo)) {
      console.log(
        `0x${ethers
          .hexlify(
            ethers.toUtf8Bytes(
              `data:,{"p":"erc-20","op":"mint","tick":"tom","id":"${debouncedText}","amt":"1000"}`
            )
          )
          .slice(2)}`
      );
      toast
        .promise(
          sendTransaction({
            value: BigInt(0),
            to: debouncedTextTo,
            data: `0x${ethers
              .hexlify(
                ethers.toUtf8Bytes(
                  `data:,{"p":"erc-20","op":"mint","tick":"tom","id":"${debouncedText}","amt":"1000"}`
                )
              )
              .slice(2)}`,
          }),
          {
            success: "ETHScription Success!",
            error: `Error ETHScribing...`,
            pending: `Sending ETHScription...`,
          }
        )
        .then(({ hash }) => {
          toast.info(`Txn. Hash: ${hash}`);
        });
    } else {
      toast.error("Invalid Address!");
    }
  };

  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <main className={styles.main}>
          <div className={styles.description}>
            <img src="/tom.jpg" alt="baller" />

            <p>Tom</p>
            <p>enough said</p>
            <br />
            <br />
            <p>
              <a href="https://dune.com/swolidity/tom">
                https://dune.com/swolidity/tom
              </a>
            </p>

            {!connector && (
              <p>
                <Web3Button />
              </p>
            )}
            {connector && (
              <>
                <p>
                  <strong>ETHScribe $TOM</strong>
                  <br />
                  <br />
                  ID:
                  <input
                    className={styles.input}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setText(e.target.value);
                    }}
                  ></input>
                  <br />
                  <br />
                  Ethscribe To:
                  <input
                    className={styles.input}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setTextTo(e.target.value);
                    }}
                  ></input>
                  <br />
                  <br />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onEthscribeText();
                    }}
                  >
                    Ethscribe
                  </button>
                </p>
              </>
            )}
          </div>
        </main>
      </WagmiConfig>
      <ToastContainer />

      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  );
}
