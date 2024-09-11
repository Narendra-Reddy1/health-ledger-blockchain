const { expect } = require("chai");
const { ethers, getNamedAccounts, network } = require("hardhat");


describe("Health Ledger", function () {
    let healthLedger;
    let tokenContract;
    let nftContract;
    let signer;
    let deployer;
    let helper01;
    let helper02;
    const baseURI = "https://teal-eligible-bobolink-804.mypinata.cloud/ipfs/";
    let tokenURI = "QmS6mcz4PTCr9pU7eYxhQA6XU7pXbGoK39AN6YMSDWMvaD";
    beforeEach(async () => {
        const accounts = await getNamedAccounts();
        deployer = accounts.deployer;
        signer = (await ethers.getSigner(deployer))
        helper01 = (await ethers.getSigner(accounts.helper01))
        helper02 = (await ethers.getSigner(accounts.helper02))

        // healthLedger = (await ethers.getContract("HealthLedger", signer));
        //tokenContract = await ethers.getContract("HealthLedgerToken", signer);
        // const cft = await ethers.getContractFactory("HealthLedgerToken", signer);
        // const cdt = await cf.deploy();
        // healthLedger = await cd.waitForDeployment();
        tokenContract = await ethers.getContract("HealthLedgerToken", signer);
        const cf = await ethers.getContractFactory("HealthLedger", signer);
        const cd = await cf.deploy(tokenContract.target, baseURI);
        healthLedger = await cd.waitForDeployment();
        nftContract = await ethers.getContractAt("HealthLedgerNFT", await healthLedger.getNFTContractAddress(), signer)
    })
    describe("Constructor", function () {
        it("Should be initialized with token contract address", async () => {
            const address = await healthLedger.getTokenContract()
            expect(address).equal(tokenContract.target)
        })
    })

    describe("Start Tournament", async () => {
        it("Should start new tournament", async () => {
            let startTime = Date.now() + 5000;
            let endTime = Date.now() + 25000;
            let prizePool = 10000;
            await tokenContract.approve(healthLedger.target, prizePool)
            const tx = healthLedger.startTournament(startTime.toString(), endTime.toString(), prizePool.toString())
            await expect(tx).to.be.emit(healthLedger, "NewTournamentStarted");
            const id = await healthLedger.getLastTournamentId();


            const cStartTime = await healthLedger.getStartTime(id);
            const cEndTime = await healthLedger.getEndTime(id);
            const cPrizePool = await healthLedger.getPrizepool(id)
            expect(cStartTime).to.be.equal(startTime)
            expect(cEndTime).to.be.equal(endTime)
            expect(cPrizePool).to.be.equal(prizePool)
        })

        it("Should revert starting tournament if allowance is less than prizepool", async () => {
            let startTime = Date.now() + 5000;
            let endTime = Date.now() + 25000;
            let prizePool = 10000;
            await tokenContract.approve(healthLedger.target, prizePool / 2)
            await expect(healthLedger.startTournament(startTime.toString(), endTime.toString(), (prizePool).toString())).to.be.reverted;
            //(healthLedger, "NewTournamentStarted");
        })
    })
    let tournamentId;
    describe("Join Tournament", function () {

        beforeEach(async () => {
            let startTime = Date.now() + 5000;
            let endTime = Date.now() + 25000;
            let prizePool = 100;
            await tokenContract.approve(healthLedger.target, prizePool)
            await healthLedger.startTournament(startTime.toString(), endTime.toString(), (prizePool).toString());
            tournamentId = await healthLedger.getLastTournamentId();

        });
        it("Should let a user join a running tournament", async function () {

            await expect(healthLedger.connect(helper01).joinTournament(tournamentId))
                .to.emit(healthLedger, "TournamentJoined")
                .withArgs(helper01.address, tournamentId);

            const isParticipated = await healthLedger.isUserParticipatedInTournament(tournamentId, helper01.address);
            expect(isParticipated).to.be.true;
        });

        it("Should revert if the tournament is not running", async function () {

            await expect(healthLedger.connect(helper01).joinTournament(tournamentId + 1n))
                .to.be.revertedWithCustomError(healthLedger, "HL__TournamentOver");
        });

        it("Should revert if the user has already participated", async function () {

            // User joins the tournament the first time
            await healthLedger.connect(helper01).joinTournament(tournamentId);

            // User tries to join the tournament a second time
            await expect(healthLedger.connect(helper01).joinTournament(tournamentId))
                .to.be.revertedWithCustomError(healthLedger, "HL__AlreadyParticipated");
        });

        it("Should set the user's step count to zero when they join", async function () {
            await healthLedger.connect(helper01).joinTournament(tournamentId);

            const stepCount = await healthLedger.getUserStepCount(tournamentId, helper01.address);
            expect(stepCount).to.equal(0n);
        });

    })

    describe("Record Steps", async () => {

        beforeEach(async () => {

            // let startTime = Math.floor((Date.now() + 500000) / 1000);
            // let endTime = Math.floor((Date.now() + 2500000) / 1000);
            let startTime = Math.floor((Date.now() + 50000));
            let endTime = Math.floor((Date.now() + 250000));
            let prizePool = 100;
            const tmsp = (await ethers.provider.getBlock()).timestamp;

            await tokenContract.approve(healthLedger.target, prizePool)
            await healthLedger.startTournament(startTime.toString(), endTime.toString(), (prizePool).toString());
            tournamentId = await healthLedger.getLastTournamentId();
            const chu = await healthLedger.connect(helper01);
            await chu.joinTournament(tournamentId);

        });
        it("Should record steps for a user in a running tournament", async function () {

            const steps = 1000;
            await expect(healthLedger.recordSteps(tournamentId, helper01.address, steps))
                .to.emit(healthLedger, "RecordStepsSuccess")
                .withArgs(helper01.address, steps);

            const stepCount = await healthLedger.getUserStepCount(tournamentId, helper01.address);
            expect(stepCount).to.equal(steps);
        });

        it("Should revert if the tournament is not running", async function () {

            const steps = 1000;
            await expect(healthLedger.recordSteps(tournamentId + 1n, helper01.address, steps))
                .to.be.revertedWithCustomError(healthLedger, "HL__TournamentOver");
        });

        it("Should revert if the user has not participated in the tournament", async function () {

            const steps = 1000;

            await expect(healthLedger.recordSteps(tournamentId, helper02.address, steps))
                .to.be.revertedWithCustomError(healthLedger, "HL__NotParticipated");
        });

        it("Should only allow the owner to record steps", async function () {

            const steps = 1000;

            await expect(healthLedger.connect(helper01).recordSteps(tournamentId, helper01.address, steps))
                .to.be.revertedWithCustomError(healthLedger, "OwnableUnauthorizedAccount");
        });

        it("Should accumulate steps when recorded multiple times", async function () {

            const steps1 = 500n;
            const steps2 = 1500n;

            await healthLedger.recordSteps(tournamentId, helper01.address, steps1);
            await healthLedger.recordSteps(tournamentId, helper01.address, steps2);

            const stepCount = await healthLedger.getUserStepCount(tournamentId, helper01.address);
            expect(stepCount).to.equal(steps1 + steps2);
        });
    })

    describe("Reward Winner", async () => {
        let _tid;
        const sleep = async (seconds = 10000) => {
            await network.provider.send("evm_increaseTime", [seconds]);
            await network.provider.send("evm_mine");
            await network.provider.send("evm_mine");
        }
        beforeEach(async () => {
            let startTime = Date.now() + 5;
            let endTime = Date.now() + 25;
            let prizePool = ethers.parseEther("100");
            await tokenContract.approve(healthLedger.target, prizePool)
            await healthLedger.startTournament(startTime.toString(), endTime.toString(), (prizePool).toString());
            _tid = await healthLedger.getLastTournamentId();
            const chu = await healthLedger.connect(helper01);
            await chu.joinTournament(_tid);
            await (healthLedger).recordSteps(_tid, helper01.address, "1000");
            await sleep();
            // const endT = await healthLedger.getEndTime(tournamentId);
            // const timestamp = (await ethers.provider.getBlock()).timestamp;

        })
        it("Should reward the winner if they participated", async function () {
            _tid = await healthLedger.getLastTournamentId();
            const rewardAmount = ethers.parseEther("10");
            const winnerBalanceBefore = await tokenContract.balanceOf(helper01.address);
            await expect(healthLedger.rewardWinner(_tid, helper01.address, rewardAmount))
                .to.emit(healthLedger, "PrizeDistributedToWinner")
                .withArgs(helper01.address, rewardAmount);

            const winnerBalanceAfter = await tokenContract.balanceOf(helper01.address);
            expect(winnerBalanceAfter).to.equal(winnerBalanceBefore + rewardAmount);
        });

        it("Should revert if the user did not participate in the tournament", async function () {
            _tid = await healthLedger.getLastTournamentId();
            const rewardAmount = ethers.parseEther("10");
            await expect(healthLedger.rewardWinner(_tid, helper02.address, rewardAmount))
                .to.be.revertedWithCustomError(healthLedger, "HL__NotParticipated");
        });

        // it("Should return false if the token transfer fails", async function () {
        //     _tid = await healthLedger.getLastTournamentId();
        //     const rewardAmount = ethers.parseEther("1000");
        //     const success = await healthLedger.rewardWinner(_tid, helper01.address, rewardAmount)
        //     expect(success).to.be.false;
        // });

        it("Should revert if not called by the owner", async function () {
            _tid = await healthLedger.getLastTournamentId();
            const rewardAmount = ethers.parseEther("10");
            await expect(healthLedger.connect(helper01).rewardWinner(_tid, helper01.address, rewardAmount))
                .to.be.revertedWithCustomError(healthLedger, "OwnableUnauthorizedAccount");
        });

        // it("Should handle the case where transfer fails and approve is successful", async function () {
        //     _tid = await healthLedger.getLastTournamentId();
        //     const rewardAmount = ethers.parseEther("1000");
        //     // Simulate the transfer failure by reducing the balance and ensuring approval works
        //     await tokenContract.transfer(deployer, ethers.parseEther("90")); // Reduce contract balance

        //     await expect(healthLedger.rewardWinner(_tid, helper01.address, rewardAmount))
        //         .to.be.revertedWithCustomError(healthLedger, "HL : Approved for withdraw");

        //     const approvedAmount = await tokenContract.allowance(healthLedger.address, helper01.address);
        //     expect(approvedAmount).to.equal(rewardAmount);
        // });
    })

    describe("Reward NFT", function () {
        it("Should reward the user with an NFT if called by the owner", async function () {

            const initialCounter = await healthLedger.getNFTCounter();

            // Call rewardNFT function by owner
            await expect(healthLedger.rewardNFT(helper01.address, tokenURI))
                .to.emit(nftContract, "Transfer") // Assuming the NFT contract emits a Transfer event when minting
                .withArgs(ethers.ZeroAddress, helper01.address, initialCounter); // Expect minting to helper01

            // Verify the user's NFT balance
            const helper01Balance = await nftContract.balanceOf(helper01.address);
            expect(helper01Balance).to.equal(1);

            // Verify the NFT's tokenURI
            const mintedTokenURI = await nftContract.tokenURI(initialCounter);
            expect(mintedTokenURI).to.equal(baseURI + tokenURI);

            // Verify getNFTCounter has incremented
            const updatedCounter = await healthLedger.getNFTCounter();
            expect(updatedCounter).to.equal(initialCounter + 1n);
        });

        it("Should revert if rewardNFT is called by a non-owner", async function () {
            await expect(
                healthLedger.connect(helper01).rewardNFT(helper01.address, tokenURI)
            ).to.be.revertedWithCustomError(healthLedger, "OwnableUnauthorizedAccount");
        });
    })



})