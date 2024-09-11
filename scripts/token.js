const { ethers, network, getNamedAccounts } = require("hardhat");
const { PinataSDK } = require("pinata")
async function name(params) {

    const { deployer } = await getNamedAccounts();
    const signer = await ethers.getSigner(deployer);
    const token = await ethers.getContract("HealthLedgerToken", signer);
    const tx = await signer.sendTransaction({
        to: "0x4Ceb6D0f29E9aA6318e6e389F07e9204d9ABb6B2",
        value: ethers.parseEther("10")
    });
    await tx.wait();

    const ledger = await ethers.getContract("HealthLedger", signer);
    console.log(await ledger.getUserStepCount(0, "0x4Ceb6D0f29E9aA6318e6e389F07e9204d9ABb6B2"));
    console.log(await ledger.isUserParticipatedInTournament(0, "0x4Ceb6D0f29E9aA6318e6e389F07e9204d9ABb6B2"));

    //console.log(await token.balanceOf("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")); //deployer

} name()