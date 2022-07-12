// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ERC721Staking is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Interfaces for ERC20 and ERC721
    IERC20 public immutable rewardsToken;
    IERC721 public immutable nftCollection;
    IERC20 public immutable stakeToken;

    error TransferFailed();

     uint256 public totalStaked;

    // Constructor function to set the rewards token and the NFT collection addresses
    constructor(IERC721 _nftCollection, IERC20 _rewardsToken, IERC20 _stakeToken) {
        nftCollection = _nftCollection;
        rewardsToken = _rewardsToken;
        stakeToken = _stakeToken;
    }


    struct TokenStaker{
        // Amount of tokens staked by the staker
        uint256 amountStaked;

        // Staked token ids
        //StakedToken[] stakedTokens;

        // Last time of the rewards were calculated for this user
        uint256 timeOfLastUpdate;

        // Calculated, but unclaimed rewards for the User. The rewards are
        // calculated each time the user writes to the Smart Contract
        uint256 unclaimedRewards;

        bool hasStaked;
    }

    // Rewards per hour per token deposited in wei.
    uint256 private rewardsPerHour = 1;

    // Mapping of User Address to Staker info

    mapping(address => TokenStaker) public tokenStakers;

    // Mapping of Token Id to staker. Made for the SC to remeber
    // who to send back the ERC721 Token to.
    mapping(uint256 => address) public stakerAddress;

    address[] public stakers;

    function tokenStake(uint256 _amount) external nonReentrant{
        // If wallet has tokens staked, calculate the rewards before adding the new token
        require(_amount > 0, "amount cannot be 0");

        if (tokenStakers[msg.sender].amountStaked > 0) {
            uint256 rewards = calculateRewards(msg.sender);
            tokenStakers[msg.sender].unclaimedRewards += rewards;
        }   

        stakeToken.transferFrom(msg.sender, address(this), _amount);
      // stakeToken.transfer(address(this),_amount);

       totalStaked = totalStaked + _amount;

         tokenStakers[msg.sender].amountStaked =  tokenStakers[msg.sender].amountStaked + _amount;

       if(!tokenStakers[msg.sender].hasStaked){
           stakers.push(msg.sender);
       }
     
        tokenStakers[msg.sender].timeOfLastUpdate = block.timestamp;

    }

    function tokenWithdraw() external nonReentrant{
        require(tokenStakers[msg.sender].amountStaked > 0,"You have no token staked!");

        uint256 rewards = calculateRewards(msg.sender);

        tokenStakers[msg.sender].unclaimedRewards += rewards;

        uint256 balance = tokenStakers[msg.sender].amountStaked;

        stakeToken.transfer(msg.sender,balance);

        totalStaked = totalStaked - balance;

        tokenStakers[msg.sender].amountStaked = 0;

        tokenStakers[msg.sender].timeOfLastUpdate = block.timestamp;

    }

    function claimRewards() external {
        uint256 rewards = calculateRewards(msg.sender) +
            tokenStakers[msg.sender].unclaimedRewards;
        require(rewards > 0, "You have no rewards to claim");
        tokenStakers[msg.sender].timeOfLastUpdate = block.timestamp;
        tokenStakers[msg.sender].unclaimedRewards = 0;
        rewardsToken.safeTransfer(msg.sender, rewards);
    }

    function checkBalance(address owner) external view returns(uint256){
        uint256 balance = stakeToken.balanceOf(owner);
        return balance;
    }


     function availableRewards(address _tokenStaker) public view returns (uint256) {
        uint256 rewards = calculateRewards(_tokenStaker) +
            tokenStakers[_tokenStaker].unclaimedRewards;
        return rewards;
    }

    function availabTotalStake() public view returns (uint256){
        return totalStaked;
    }

    function amountStaked(address _tokenStaker) external view returns(uint256){
        uint256 amount = tokenStakers[_tokenStaker].amountStaked;
        return amount;
    }


    function calculateRewards(address _tokenStaker)
        internal
        view
        returns (uint256 _rewards)
    {
        return (((
            ((block.timestamp - tokenStakers[_tokenStaker].timeOfLastUpdate) *
                tokenStakers[_tokenStaker].amountStaked)
        ) * rewardsPerHour) / 36000000);
    }

}