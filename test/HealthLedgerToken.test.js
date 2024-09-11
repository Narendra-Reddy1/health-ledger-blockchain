const { deployments, getNamedAccounts, ethers, artifacts } = require("hardhat");
const { expect } = require("chai")
require("mocha")

contractConfig = {
    totalSupply: ethers.parseEther("100000000"),
    symbol: "HLT",
    name: "HealthLedgerToken",

}
describe("HealthLedgerToken", function () {
    let tokenContract;
    let deployer;
    let signer;
    let helper01;
    let helper02;

    before(async function () {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        const simpleToken = await deployments.get("HealthLedgerToken");
        //tokenContract = new ethers.Contract(simpleToken.address, simpleToken.abi, deployer)
        tokenContract = await ethers.getContract("HealthLedgerToken")
    })
    describe("Constructor", function () {

        it("Should initalize properly", async () => {

            const supply = await tokenContract.totalSupply()
            expect(supply.toString()).to.equal(contractConfig.totalSupply.toString())
        })

        it("should mint the total supply to deployer", async () => {
            const deployerBalance = await tokenContract.balanceOf(deployer);
            expect(deployerBalance.toString()).to.equal(contractConfig.totalSupply.toString());
        })
        it("Should set the Name and Symbol correct", async () => {
            const symbol = await tokenContract.symbol();
            const name = await tokenContract.name();
            expect(symbol).to.equal(contractConfig.symbol)
            expect(name).to.equal(contractConfig.name);
        })
    })

    describe("Transfers", function () {


        it("Should transfer the amount to the receiver", async () => {
            const accounts = await ethers.getSigners();
            const amount = 100n;
            await tokenContract.connect(deployer)
            const senderBalanceBeforeTx = await tokenContract.balanceOf(deployer);
            const tx = await tokenContract.transfer(accounts[1], amount)
            tx.wait(1);
            const receiverBalance = await tokenContract.balanceOf(accounts[1]);
            const senderBalanceAfterTx = await tokenContract.balanceOf(deployer);
            expect(senderBalanceBeforeTx.toString()).to.equal((senderBalanceAfterTx + amount).toString());
            expect(receiverBalance.toString()).to.equal((amount).toString());
        })

    })
    describe("Allowance", function () {
        it("Should able to allocate allowances", async () => {
            const { helper01, helper02 } = await getNamedAccounts();
            const allowanceAmount = 129;
            await tokenContract.connect(deployer);
            const tx = await tokenContract.approve(helper01, allowanceAmount);
            const allowance = await tokenContract.allowance(deployer, helper01);
            expect(allowance.toString()).to.equal(allowanceAmount.toString());
            //await expect(tx).to.be.emit(tokenContract, "Approval").withArgs(deployer, helper01, allowanceAmount);
        })
        it("Should emit an event on a allowance", async () => {
            const { helper01, helper02 } = await getNamedAccounts();
            const allowanceAmount = 129;
            await tokenContract.connect(deployer);
            // const tx = await tokenContract.approve(helper01, allowanceAmount);
            // await expect(tx).to.be.emit(tokenContract, "Approval").withArgs(deployer, helper01, allowanceAmount);

            await expect(tokenContract.approve(helper01, allowanceAmount)).to.be.emit(tokenContract, "Approval").withArgs(deployer, helper01, allowanceAmount);
        })

        it("Should able to spend allowances", async () => {
            /* 
            set allowance to an address
            spend the allowance and check the updated  allowance
            */
            const accounts = await ethers.getSigners();
            const spendAmount = 123n;
            const allowanceAmount = 10000n;

            const deployerBalanceBeforeSpent = await tokenContract.balanceOf(deployer);

            await tokenContract.approve(accounts[1], allowanceAmount);
            const initialAllowance = await tokenContract.allowance(deployer, accounts[1]);

            //const helper01Contract = new ethers.Contract("SimpleToken", (await deployments.get("SimpleToken")).abi, helper01);
            const helper01Contract = await tokenContract.connect(accounts[1])
            await expect(helper01Contract.transferFrom(deployer, accounts[2], spendAmount)).to.emit(tokenContract, "Transfer");
            const deployerBalanceAfterSpent = await tokenContract.balanceOf(deployer);

            const updatedAllowance = await tokenContract.allowance(deployer, accounts[1]);
            const balanceOfAc2 = await tokenContract.balanceOf(accounts[2]);
            expect(initialAllowance).to.be.equal(updatedAllowance + spendAmount);
            expect(deployerBalanceBeforeSpent).to.equal(deployerBalanceAfterSpent + spendAmount);
            expect(balanceOfAc2).to.be.equal(spendAmount);
        })
        it("Should revert if allownce limit it crossed", async () => {
            // try to spend more amount than allowance to check reverting
            const accounts = await ethers.getSigners();
            const allowanceAmount = 10000n;

            await tokenContract.approve(accounts[1], allowanceAmount);
            //const helper01Contract = new ethers.Contract("SimpleToken", (await deployments.get("SimpleToken")).abi, helper01);
            const helper01Contract = await tokenContract.connect(accounts[1])
            await expect(helper01Contract.transferFrom(deployer, accounts[2], allowanceAmount * 2n))
                .to.be.revertedWithCustomError(tokenContract, "ERC20InsufficientAllowance")//.withArgs(accounts[1].address, allowanceAmount, allowanceAmount * 2n)
        })
        it("Should revert if allownce spend more than given allowance", async () => {
            // try to spend more amount than allowance to check reverting
            const accounts = await ethers.getSigners();
            const allowanceAmount = 10000n;

            await tokenContract.approve(accounts[1], allowanceAmount);

            //const helper01Contract = new ethers.Contract("SimpleToken", (await deployments.get("SimpleToken")).abi, helper01);
            const helper01Contract = await tokenContract.connect(accounts[1])
            await expect(helper01Contract.transferFrom(deployer, accounts[2], allowanceAmount * 2n))
                .to.be.revertedWithCustomError(helper01Contract, "ERC20InsufficientAllowance")//.withArgs(accounts[1].address, allowanceAmount, allowanceAmount * 2n)
        })

        it("Should revert if owner balance is less than  allowance can spend", async () => {
            // try to spend more amount than availale balance to check reverting

            const accounts = await ethers.getSigners();
            const spendAmount = 123n;

            const deployerBalance = await tokenContract.balanceOf(deployer);

            await tokenContract.approve(accounts[1], deployerBalance);
            await tokenContract.approve(accounts[2], deployerBalance);
            const helper01Contract = await tokenContract.connect(accounts[1]);

            await helper01Contract.transferFrom(deployer, accounts[1], spendAmount * 10n)

            const helper02Contract = await tokenContract.connect(accounts[2]);
            await expect(helper02Contract.transferFrom(deployer, accounts[1], deployerBalance))
                .to.be.revertedWithCustomError(tokenContract, "ERC20InsufficientBalance")
        })

    })

    // describe("Burn Tokens", function () {
    //     it("Should burn tokens", async () => {
    //         const burnAmount = 12234n;
    //         const totalSupplyBeforeBurning = await tokenContract.totalSupply();
    //         await expect(tokenContract.burn(deployer, burnAmount)).to.emit(tokenContract, "Transfer");
    //         const totalSupplyAfterBurning = await tokenContract.totalSupply();
    //         expect(totalSupplyAfterBurning).to.be.equal(totalSupplyBeforeBurning - burnAmount);


    //     })
    // })

})