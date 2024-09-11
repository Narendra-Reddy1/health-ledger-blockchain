require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("hardhat-deploy");
require("@nomicfoundation/hardhat-chai-matchers");
require("hardhat-deploy-ethers")
require("@nomicfoundation/hardhat-ethers");
/** @type import('hardhat/config').HardhatUserConfig */
const { MUMBAI_RPC, PRIVATE_KEY } = process.env
module.exports = {
  solidity: "0.8.20",
  defaultNetwork: "localhost",
  namedAccounts: {
    deployer: {
      default: 0
    },
    helper01: {
      default: 1
    },
    helper02: {
      default: 2,
    }

  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
    mumbai: {
      url: MUMBAI_RPC,
      accounts: [PRIVATE_KEY],
      chainId: 80002

    },
  },
};
