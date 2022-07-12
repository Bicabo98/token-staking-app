import type { NextPage } from "next";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const router = useRouter();

  return (
    <div className={styles.container}>
      {/* Top Section */}
      <h1 className={styles.h1}>Staking Dapp</h1>

      <div
        className={styles.nftBoxGrid}
        role="button"
        onClick={() => router.push(`/stake`)}
      >
        {/* Mint a new NFT */}
        <div className={styles.optionSelectBox}>
          <img src={`/icons/drop.webp`} alt="drop" />
          <h2 className={styles.selectBoxTitle}>Stake Your token</h2>
          <p className={styles.selectBoxDescription}>
               Stake <b>Your Token </b>{" "}  
          </p>
        </div>

        <div
          className={styles.optionSelectBox}
          role="button"
          onClick={() =>router.push(`/mint`)}
        >
          <img src={`/icons/token.webp`} alt="drop" />
          <h2 className={styles.selectBoxTitle}>BUY DHO</h2>
          <p className={styles.selectBoxDescription}>
            DHO will go to mars.   
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
