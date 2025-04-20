const { ethers } = require('ethers');
const axios = require('axios');
require('dotenv').config();

// Configuration
const CONFIG = {
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    MADNESS_API: 'https://madness.finance/api',
    MONAD_RPC: 'https://testnet-rpc.monad.xyz/',
    API_KEY: 'madness-9w1dawd8a962d',
    // Contract addresses
    ROUTER_ADDRESS: '0x64Aff7245EbdAAECAf266852139c67E4D8DBa4de',
    WMON_ADDRESS: '0x760afe86e5de5fa0ee542fc7b7b713e1c5425701',
    MAD_ADDRESS: '0xc8527e96c3cb9522f6e35e95c0a28feab8144f15',
    // Swap amount in MON
    SWAP_AMOUNT: ethers.parseEther('0.1'), // 0.1 MON
    // Liquidity amounts
    LIQUIDITY_MON: ethers.parseEther('0.1'), // 0.1 MON
    LIQUIDITY_MAD: ethers.parseEther('8.0') // 8 MAD
};

// Function to connect wallet using private key
async function connectWallet(privateKey) {
    try {
        console.log('🔄 Connecting to Monad network...');
        const provider = new ethers.JsonRpcProvider(CONFIG.MONAD_RPC);
        const wallet = new ethers.Wallet(privateKey, provider);
        
        // Verify connection by getting balance
        const balance = await provider.getBalance(wallet.address);
        console.log('✅ Wallet connected successfully!');
        console.log('📝 Wallet Address:', wallet.address);
        console.log('💰 Balance:', ethers.formatEther(balance), 'MON');
        
        return wallet;
    } catch (error) {
        console.error('❌ Error connecting wallet:', error.message);
        return null;
    }
}

// Function to get user profile
async function getUserProfile(address) {
    try {
        console.log('🔄 Getting user profile...');
        const response = await axios.get(`${CONFIG.MADNESS_API}/profile`, {
            params: { account: address }
        });
        console.log('✅ Profile retrieved successfully');
        return response.data;
    } catch (error) {
        console.error('❌ Error getting profile:', error.message);
        return null;
    }
}

// Function to check previous checkin status
async function checkPreviousCheckin(userId, taskId) {
    try {
        console.log('🔄 Checking previous checkin status...');
        const response = await axios.get(`${CONFIG.MADNESS_API}/progress`, {
            params: { 
                userId: userId,
                taskId: taskId
            }
        });
        
        if (response.data && response.data.data && response.data.data.completed) {
            const lastCheckin = new Date(response.data.data.lastCheckin);
            console.log('ℹ️ Last checkin was at:', lastCheckin.toLocaleString());
            return true;
        }
        return false;
    } catch (error) {
        console.error('❌ Error checking previous checkin:', error.message);
        return false;
    }
}

// Function to perform checkin
async function performCheckin(userId, taskId) {
    try {
        console.log('🔄 Performing checkin...');
        const response = await axios.post(`${CONFIG.MADNESS_API}/progress`, {
            taskId: taskId,
            userId: userId
        }, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CONFIG.API_KEY
            }
        });
        console.log('✅ Checkin successful!');
        return response.data;
    } catch (error) {
        console.error('❌ Error performing checkin:', error.message);
        return null;
    }
}

// Function to perform swap MON to MAD
async function performSwap(wallet) {
    try {
        console.log('🔄 Preparing swap from MON to MAD...');
        
        // Get router contract
        const routerABI = [
            'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'
        ];
        const router = new ethers.Contract(CONFIG.ROUTER_ADDRESS, routerABI, wallet);

        // Set path for swap
        const path = [CONFIG.WMON_ADDRESS, CONFIG.MAD_ADDRESS];
        
        // Get current block timestamp and add 20 minutes
        const deadline = Math.floor(Date.now() / 1000) + 1200;
        
        // Set minimum amount out (90% of expected)
        const amountOutMin = ethers.parseEther('7.0'); // Minimum 7 MAD tokens

        console.log('📊 Swap Details:');
        console.log('From: 0.1 MON');
        console.log('To: MAD (min 7 tokens)');
        console.log('Path:', path);
        
        // Perform swap
        console.log('🔄 Executing swap...');
        const tx = await router.swapExactETHForTokens(
            amountOutMin,
            path,
            wallet.address,
            deadline,
            { value: CONFIG.SWAP_AMOUNT }
        );

        console.log('⏳ Waiting for transaction confirmation...');
        const receipt = await tx.wait();
        
        console.log('✅ Swap successful!');
        console.log('📝 Transaction Hash:', receipt.hash);
        console.log('💰 Gas Used:', ethers.formatEther(receipt.gasUsed), 'MON');
        
        return receipt;
    } catch (error) {
        console.error('❌ Error performing swap:', error.message);
        return null;
    }
}

// Function to update progress on chain
async function updateProgressOnChain(userId, taskId, amount) {
    try {
        console.log('🔄 Updating progress on chain...');
        const response = await axios.post(`${CONFIG.MADNESS_API}/progressOnChain`, {
            taskId: taskId,
            userId: userId,
            amount: amount
        }, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CONFIG.API_KEY
            }
        });
        console.log('✅ Progress updated successfully!');
        return response.data;
    } catch (error) {
        console.error('❌ Error updating progress:', error.message);
        return null;
    }
}

// Function to approve MAD token for router
async function approveMADToken(wallet) {
    try {
        console.log('🔄 Approving MAD token for router...');
        
        // Get MAD token contract
        const madABI = [
            'function approve(address spender, uint256 amount) external returns (bool)'
        ];
        const madToken = new ethers.Contract(CONFIG.MAD_ADDRESS, madABI, wallet);

        // Approve router to spend MAD tokens
        const tx = await madToken.approve(
            CONFIG.ROUTER_ADDRESS,
            CONFIG.LIQUIDITY_MAD
        );

        console.log('⏳ Waiting for approval confirmation...');
        const receipt = await tx.wait();
        
        console.log('✅ MAD token approved successfully!');
        console.log('📝 Transaction Hash:', receipt.hash);
        
        return receipt;
    } catch (error) {
        console.error('❌ Error approving MAD token:', error.message);
        return null;
    }
}

// Function to add liquidity to MON-MAD pool
async function addLiquidity(wallet) {
    try {
        console.log('🔄 Adding liquidity to MON-MAD pool...');
        
        // Get router contract
        const routerABI = [
            'function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)'
        ];
        const router = new ethers.Contract(CONFIG.ROUTER_ADDRESS, routerABI, wallet);

        // Get current block timestamp and add 20 minutes
        const deadline = Math.floor(Date.now() / 1000) + 1200;
        
        // Set minimum amounts (90% of desired)
        const amountTokenMin = CONFIG.LIQUIDITY_MAD * 9n / 10n;
        const amountETHMin = CONFIG.LIQUIDITY_MON * 9n / 10n;

        console.log('📊 Liquidity Details:');
        console.log('MON Amount:', ethers.formatEther(CONFIG.LIQUIDITY_MON));
        console.log('MAD Amount:', ethers.formatEther(CONFIG.LIQUIDITY_MAD));
        console.log('Minimum MON:', ethers.formatEther(amountETHMin));
        console.log('Minimum MAD:', ethers.formatEther(amountTokenMin));
        
        // Add liquidity
        console.log('🔄 Executing add liquidity...');
        const tx = await router.addLiquidityETH(
            CONFIG.MAD_ADDRESS,
            CONFIG.LIQUIDITY_MAD,
            amountTokenMin,
            amountETHMin,
            wallet.address,
            deadline,
            { value: CONFIG.LIQUIDITY_MON }
        );

        console.log('⏳ Waiting for transaction confirmation...');
        const receipt = await tx.wait();
        
        console.log('✅ Liquidity added successfully!');
        console.log('📝 Transaction Hash:', receipt.hash);
        console.log('💰 Gas Used:', ethers.formatEther(receipt.gasUsed), 'MON');
        
        return receipt;
    } catch (error) {
        console.error('❌ Error adding liquidity:', error.message);
        return null;
    }
}

// Main function to run auto checkin, swap and add liquidity
async function runAutoCheckin() {
    try {
        console.log('🚀 Starting auto checkin, swap and add liquidity process...');
        
        // Check if private key exists
        if (!CONFIG.PRIVATE_KEY) {
            console.error('❌ Private key not found in .env file');
            return;
        }

        // Step 1: Connect Wallet
        const wallet = await connectWallet(CONFIG.PRIVATE_KEY);
        if (!wallet) {
            console.error('❌ Failed to connect wallet, stopping process');
            return;
        }

        // Step 2: Get User Profile
        const profile = await getUserProfile(wallet.address);
        if (!profile || !profile.data || !profile.data.user) {
            console.error('❌ Failed to get user profile, stopping process');
            return;
        }
        const userId = profile.data.user._id;
        console.log('📋 User ID:', userId);

        // Step 3: Check Previous Checkin
        const taskId = '67cab3f2ea568701db79306d'; // Swap task ID
        const hasCheckedIn = await checkPreviousCheckin(userId, taskId);
        
        if (hasCheckedIn) {
            console.log('⚠️ You have already checked in today!');
            return;
        }

        // Step 4: Perform Swap
        const swapResult = await performSwap(wallet);
        if (!swapResult) {
            console.error('❌ Swap failed, stopping process');
            return;
        }

        // Step 5: Approve MAD token
        const approveResult = await approveMADToken(wallet);
        if (!approveResult) {
            console.error('❌ MAD token approval failed, stopping process');
            return;
        }

        // Step 6: Add Liquidity
        const liquidityResult = await addLiquidity(wallet);
        if (!liquidityResult) {
            console.error('❌ Adding liquidity failed, stopping process');
            return;
        }

        // Step 7: Update Progress On Chain
        const progressResult = await updateProgressOnChain(userId, taskId, 0.1);
        if (!progressResult) {
            console.error('❌ Failed to update progress on chain');
            return;
        }

        console.log('✨ All processes completed successfully!');
        console.log('1. ✅ Checkin completed');
        console.log('2. ✅ Swap completed');
        console.log('3. ✅ MAD token approved');
        console.log('4. ✅ Liquidity added');
        console.log('5. ✅ Progress updated on chain');

    } catch (error) {
        console.error('❌ Error in auto process:', error.message);
    }
}

// Run auto checkin, swap and add liquidity
runAutoCheckin(); 