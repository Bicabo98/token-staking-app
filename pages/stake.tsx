
import {
  ThirdwebNftMedia,
  useAddress,
  useMetamask,
  useNFTDrop,
  useToken,
  useTokenBalance,
  useOwnedNFTs,
  useContract,
} from "@thirdweb-dev/react";
import { BigNumber, ethers } from "ethers";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import Web3 from 'web3';
import styles from "../styles/Home.module.css";


// const nftDropContractAddress = "0xB1520fe0f11B06219b7bBF4F17CcCDc6B9390e10";
// const tokenContractAddress = "0xE8954374DA6c3d3d4CdB3a00dDB03060b8d3d0f8";
// const stakingContractAddress = "0x9ac3b4F3CbF47cb864723Cbce89B3708CBafe168";



const nftDropContractAddress = "0xB1520fe0f11B06219b7bBF4F17CcCDc6B9390e10";
const tokenContractAddress = "0xE8954374DA6c3d3d4CdB3a00dDB03060b8d3d0f8";
const stakingContractAddress = "0x965Dbb1E6863596DA5Aa83161231e75d0bf770c7";
const stakeTokenContractAddress = "0xE8954374DA6c3d3d4CdB3a00dDB03060b8d3d0f8";


const Stake: NextPage = () => {
  // Wallet Connection Hooks
  const address = useAddress();
  const connectWithMetamask = useMetamask();

  // Contract Hooks
  const nftDropContract = useNFTDrop(nftDropContractAddress);
  const tokenContract = useToken(tokenContractAddress);

  const stakeTokenContract = useToken(stakeTokenContractAddress);

  const { contract, isLoading } = useContract(stakingContractAddress);

  // Load Unstaked NFTs
  const { data: ownedNfts } = useOwnedNFTs(nftDropContract, address);

  // Load Balance of Token
  const { data: tokenBalance } = useTokenBalance(tokenContract, address);

  const {data:stakeTokenBalance} = useTokenBalance(stakeTokenContract, address);

  ///////////////////////////////////////////////////////////////////////////
  // Custom contract functions
  ///////////////////////////////////////////////////////////////////////////
  const [stakedNfts, setStakedNfts] = useState<any[]>([]);
  const [claimableRewards, setClaimableRewards] = useState<BigNumber>();
  const [totalTokenStake, setTotalTokenStake] = useState<BigNumber>();
  const [amountTokenStake, setAmountTokenStake] = useState<BigNumber>();

  const [inputValue, setInputValue] = useState('');


  useEffect(() => {
    if (!contract) return;

    async function loadStakedNfts() {
      //const stakedTokens = await contract?.call("getStakedTokens", address);

      // For each staked token, fetch it from the sdk
      // const stakedNfts = await Promise.all(
      //   stakedTokens?.map(
      //     async (stakedToken: { staker: string; tokenId: BigNumber }) => {
      //       const nft = await nftDropContract?.get(stakedToken.tokenId);
      //       return nft;
      //     }
      //   )
      // );

      setStakedNfts(stakedNfts);
      console.log("setStakedNfts", stakedNfts);
    }

    if (address) {
      loadStakedNfts();
    }
  }, [address, contract, nftDropContract]);

  useEffect(() => {
    if (!contract || !address) return;

    async function loadClaimableRewards() {
      const cr = await contract?.call("availableRewards", address);
      console.log("Loaded claimable rewards", cr);
      setClaimableRewards(cr);
    }

    async function totalStake(){
      const total = await contract?.call("availabTotalStake");
      console.log("TotalStake ",total);
      setTotalTokenStake(total);
    }

    async function loadAmountStake(){
      const amount = await contract?.call("amountStaked",address);
      console.log("Stake amount number ",amount);
      setAmountTokenStake(amount);
    }
  

    loadAmountStake();
    totalStake();
    loadClaimableRewards();
  }, [address, contract]);

  ///////////////////////////////////////////////////////////////////////////
  // Write Functions
  ///////////////////////////////////////////////////////////////////////////
  async function stakeNft(id: BigNumber) {
    if (!address) return;

    const isApproved = await nftDropContract?.isApproved(
      address,
      stakingContractAddress
    );
    // If not approved, request approval
    if (!isApproved) {
      await nftDropContract?.setApprovalForAll(stakingContractAddress, true);
    }
    const stake = await contract?.call("stake", id);
  }

  async function withdraw(id: BigNumber) {
    const withdraw = await contract?.call("withdraw", id);
  }

  async function claimRewards() {
    const claim = await contract?.call("claimRewards");
  }

  async function withdrawToken() {
    const withdraw = await contract?.call("tokenWithdraw");
  }



  async function stakeToken(id:string){
    if(!address) return;
    let amount = Web3.utils.toWei(id,'ether');
    console.log(amount);
    await stakeTokenContract.setAllowance(stakingContractAddress,amount);
    await contract?.call("tokenStake", amount);
  }
  if (isLoading) {
    return <div>Loading</div>;
  }

  return (

    <div className={styles.container}>
      <h1 className={styles.h1}>All Stake Amount</h1>
      <p></p>
      <div className={styles.tokenItem}>
      <p className={styles.tokenValue}>
                <b>
                  {!totalTokenStake
                    ? "Loading..."
                    : ethers.utils.formatUnits(totalTokenStake, 18)}
                </b>{" "}
                {tokenBalance?.symbol}
              </p>
      </div>

      <p></p>
      
      <hr className={`${styles.divider} ${styles.spacerTop}`} />

      {!address ? (
        <button className={styles.mainButton} onClick={connectWithMetamask}>
          Connect Wallet
        </button>
      ) : (
        <>
          <h2>Your Tokens</h2>

          <div className={styles.tokenGrid}>
          <div className={styles.tokenItem}>
            <h3 className={styles.tokenLabel}>Your Stake Amount</h3>
            <p className={styles.tokenValue}>
              <b>
                {!amountTokenStake?"Loading..." : ethers.utils.formatUnits(amountTokenStake,18)}
              </b>{" "}
              {tokenBalance?.symbol}
            </p>
            </div>
          <div className={styles.tokenItem}>
              <h3 className={styles.tokenLabel}>Current Balance</h3>
              <p className={styles.tokenValue}>
                <b>{tokenBalance?.displayValue}</b> {tokenBalance?.symbol}
              </p>
            </div>                                          
          </div>

          <p></p>

          <div className={styles.tokenItem}>
              <h3 className={styles.tokenLabel}>Claimable Rewards</h3>
              <p className={styles.tokenValue}>
                <b>
                  {!claimableRewards
                    ? "Loading..."
                    : ethers.utils.formatUnits(claimableRewards, 18)}
                </b>{" "}
                {tokenBalance?.symbol}
              </p>
            </div>       

          <button
            className={`${styles.mainButton} ${styles.spacerTop}`}
            onClick={() => claimRewards()}
          >
            Claim Rewards
          </button>           
          {/* <hr className={`${styles.divider} ${styles.spacerTop}`} />   */}


          {/* <h2>Your Staked NFTs</h2>
          <div className={styles.nftBoxGrid}>
            {stakedNfts?.map((nft) => (
              <div className={styles.nftBox} key={nft.metadata.id.toString()}>
                <ThirdwebNftMedia
                  metadata={nft.metadata}
                  className={styles.nftMedia}
                />
                <h3>{nft.metadata.name}</h3>
                <button
                  className={`${styles.mainButton} ${styles.spacerBottom}`}
                  onClick={() => withdraw(nft.metadata.id)}
                >
                  Withdraw
                </button>
              </div>
            ))}
          </div> */}

          {/* <hr className={`${styles.divider} ${styles.spacerTop}`} /> */}

          {/* <h2>Your Unstaked NFTs</h2>

          <div className={styles.nftBoxGrid}>
            {ownedNfts?.map((nft) => (
              <div className={styles.nftBox} key={nft.metadata.id.toString()}>
                <ThirdwebNftMedia
                  metadata={nft.metadata}
                  className={styles.nftMedia}
                />
                <h3>{nft.metadata.name}</h3>
                <button
                  className={`${styles.mainButton} ${styles.spacerBottom}`}
                  onClick={() => stakeNft(nft.metadata.id)}
                >
                  Stake
                </button>
              </div>
            ))}
          </div> */}

          <p></p>

          <hr className={`${styles.divider} ${styles.spacerTop}`} />  
                 
          <div className={styles.inputDiv}>
            <input
              className={styles.input}
              type="number"
              min="0"             
              onChange={(e) => setInputValue(e.target.value)}
              value={inputValue}    
              required    
            ></input>
            </div>
          <button
            className={`${styles.mainButton} ${styles.spacerTop}`}
            onClick={() => stakeToken(inputValue)}
          >
            Stake
          </button>
          <button
            className={`${styles.mainButton} ${styles.spacerTop}`}
            onClick={() => withdrawToken()}
          >
            Withdraw
          </button>
        </>
      )}
    </div>
  );
};

export default Stake;
