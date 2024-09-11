const { ethers, network, getNamedAccounts } = require("hardhat");
const { PinataSDK } = require("pinata")
async function name(params) {
    // const pinata = new PinataSDK({
    //     pinataJwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzMGMwZDM2OC04YmUxLTRjY2QtYWVkZS00MWJmYjEyM2I1ZGIiLCJlbWFpbCI6Im5hcmVuZHJhcmVkZHk1NDMyMUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNDgzYTc0Y2IyMjA5YjkwOWQzNGQiLCJzY29wZWRLZXlTZWNyZXQiOiIxNGYzYmU3YTVlMTI0MTMwZTg1MjZhMWQ1NzhkOGM3M2JjZDI0ODlmNmNmMzQ1YzdiZjc2NmZjNTEzNTk2YzQ2IiwiZXhwIjoxNzU2NzE1MjIxfQ.p7cB68QovafgkM2JXICuplLBB76bZ - dT1WRtdDgmQbw",
    //     pinataGateway: "teal-eligible-bobolink-804.mypinata.cloud"
    // })

    // const file = await pinata.gateways.get("QmS6mcz4PTCr9pU7eYxhQA6XU7pXbGoK39AN6YMSDWMvaD");
    // console.log(file)

    const { deployer } = await getNamedAccounts();
    const signer = await ethers.getSigner(deployer);
    const token = await ethers.getContract("HealthLedgerToken", signer);
    const tx = await signer.sendTransaction({
        to: "0x4Ceb6D0f29E9aA6318e6e389F07e9204d9ABb6B2",
        value: ethers.parseEther("10")
    });
    await tx.wait();
    // console.log(await ethers.provider.getBalance("0x4Ceb6D0f29E9aA6318e6e389F07e9204d9ABb6B2"));
    // console.log(await token.balanceOf("0x4Ceb6D0f29E9aA6318e6e389F07e9204d9ABb6B2")); //source
    // console.log(await token.balanceOf(" ")); //toAddress

    const ledger = await ethers.getContract("HealthLedger", signer);
    console.log(await ledger.getUserStepCount(0, "0x4Ceb6D0f29E9aA6318e6e389F07e9204d9ABb6B2"));
    console.log(await ledger.isUserParticipatedInTournament(0, "0x4Ceb6D0f29E9aA6318e6e389F07e9204d9ABb6B2"));

    //console.log(await token.balanceOf("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")); //deployer

} name()