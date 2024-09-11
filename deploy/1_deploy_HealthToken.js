const { ethers, deployments, network } = require("hardhat");
const { developmentChains, chainConfig } = require("../helper.hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts();
    const args = [
        "HealthLedgerToken",
        "HLT",
        ethers.parseEther("100000000")
    ]
    await deployments.deploy("HealthLedgerToken", {
        log: true,
        args: args,
        from: deployer,
        autoMine: true,
        //waitConfirmations: chainConfig[network.config.chainId]
    })
    //console.log(ethers.formatEther(ethers.parseEther("100").toString()));
}

module.exports.tags = ["all", "Token"]


/* 
deploying "HealthLedgerToken" (tx: 0x26d65fd0d4fb3ec2f59708a80b97a7172ca3564fca4d7be5c80d22abdd6b6793)...:
 deployed at 0x5FbDB2315678afecb367f032d93F642f64180aa3 with 974582 gas
*/