import { useAddress, useMetamask, useNFTDrop } from "@thirdweb-dev/react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";

const Mint: NextPage = () => {
  const router = useRouter();
  // Get the currently connected wallet's address
  const address = useAddress();

  // Function to connect to the user's Metamask wallet
  const connectWithMetamask = useMetamask();

  // Get the NFT Collection contract
  const nftDropContract = useNFTDrop(
    "0x322067594DBCE69A9a9711BC393440aA5e3Aaca1"
  );

  async function claimNft() {
    try {
      const tx = await nftDropContract?.claim(1);
      console.log(tx);
      alert("NFT Claimed!");
      router.push(`/stake`);
    } catch (error) {
      console.error(error);
      alert(error);
    }
  }

  async function buyToken(){
    try{ 
      window.open("https://www.coin-up.pro/en_US/trade/DHO_USDT");
    }catch(error){
      console.error(error);
      alert(error);
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.h1}>Buy token!</h1>

      <p className={styles.explain}>
        test <b>test</b> test.
      </p>
      <hr className={`${styles.smallDivider} ${styles.detailPageHr}`} />

      {!address ? (
        <button
          className={`${styles.mainButton} ${styles.spacerBottom}`}
          onClick={connectWithMetamask}
        >
          Connect Wallet
        </button>
      ) : (
        <button
          className={`${styles.mainButton} ${styles.spacerBottom}`}
          //onClick={() => claimNft()}
          onClick={()=>buyToken()}
        >
          Buy token
        </button>
      )}
    </div>
  );
};

export default Mint;
