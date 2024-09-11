const { ethers, deployments, network } = require("hardhat");
const { developmentChains, chainConfig } = require("../helper.hardhat");


module.exports = async ({ getNamedAccounts, deployments }) => {
    const accounts = await getNamedAccounts();
    const deployer = accounts.deployer;
    const tokenContract = await ethers.getContract("HealthLedgerToken", await ethers.getSigner(deployer));
    const args = [
        tokenContract.target,
        "https://teal-eligible-bobolink-804.mypinata.cloud/ipfs/"
    ]
    await deployments.deploy("HealthLedger", {
        log: true,
        args: args,
        from: deployer,
        //autoMine: true,
        //waitConfirmations: chainConfig[network.config.chainId]
    })
    //const healthLedger = await ethers.getContract("HealthLedger", await ethers.getSigner(deployer));

    //const token = await ethers.getContract("HealthLedgerToken", await ethers.getSigner(deployer));
    //console.log(await token.transfer("0x4Ceb6D0f29E9aA6318e6e389F07e9204d9ABb6B2", ethers.parseEther("100")));
    //healthLedger.startTournament()
}

module.exports.tags = ["all", "HealthLedger"]


/* 
deploying "HealthLedgerToken" (tx: 0x26d65fd0d4fb3ec2f59708a80b97a7172ca3564fca4d7be5c80d22abdd6b6793)...:
 deployed at 0x5FbDB2315678afecb367f032d93F642f64180aa3 with 974582 gas
*/