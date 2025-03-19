import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import fs from 'fs';
import axios from 'axios';
import { ethers } from 'ethers';
import pkg from 'proxy-agent';
const { ProxyAgent } = pkg;
import { SocksProxyAgent } from 'socks-proxy-agent';
import cfonts from 'cfonts';

function centerText(text, color = "greenBright") {
  const terminalWidth = process.stdout.columns || 80;
  const textLength = text.length;
  const padding = Math.max(0, Math.floor((terminalWidth - textLength) / 2));
  return " ".repeat(padding) + chalk[color](text);
}

cfonts.say('NT Exhaust', {
  font: 'block',
  align: 'center',
  colors: ['cyan', 'magenta'],
});
console.log(centerText("=== Telegram Channel 🚀 : NT Exhaust ( @NTExhaust ) ===\n"));

console.log(chalk.blue('============ Auto Register Madness ===========\n'));

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function countdown(ms) {
  const seconds = Math.floor(ms / 1000);
  for (let i = seconds; i > 0; i--) {
    process.stdout.write(chalk.cyan(`\rMenunggu ${i} detik... `));
    await delay(1000);
  }
  process.stdout.write('\r' + ' '.repeat(50) + '\r');
}

async function performTasksForWallet(sessionId, wallet, accountId, axiosConfig) {
  const taskSpinner = ora('Menjalankan tasks...').start();
  try {
    await axios.post("https://madness.finance/api/progress", {
      taskId: "67cab35dea568701db792ff1",
      userId: accountId
    }, axiosConfig);

    const socialTasks = [
      { taskId: "67cab4f8ea568701db793123", social: "telegram", name: "Task Telegram" },
      { taskId: "67cab53eea568701db793166", social: "twitter", name: "Follow Twitter" },
      { taskId: "67cab5b3ea568701db7931d0", social: "telegram", name: "Discord" },
      { taskId: "67d157816c4ae2d9983dc91b", social: "telegram", name: "RT and Like Twitter" }
    ];

    for (const task of socialTasks) {
      await axios.post("https://madness.finance/api/progressSocial", {
        taskId: task.taskId,
        userId: accountId,
        social: task.social
      }, axiosConfig);
      await axios.post("https://madness.finance/api/claim", {
        userId: accountId,
        taskId: task.taskId
      }, axiosConfig);
    }

    const profileResponse = await axios.get(`https://madness.finance/api/profile?account=${wallet.address}`, axiosConfig);
    const totalEarned = profileResponse.data?.data?.user?.totalEarned;
    taskSpinner.succeed(chalk.greenBright(`  Tasks selesai, Total Earned: ${totalEarned}`));
  } catch (error) {
    taskSpinner.fail(chalk.redBright(`  Task gagal: ${error.message}`));
  }
}

async function main() {
  const { useProxy } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'useProxy',
      message: 'Apakah Anda ingin menggunakan proxy?',
      default: false,
    }
  ]);

  let isRotating = false;
  let proxyList = [];
  if (useProxy) {
    const { proxyType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'proxyType',
        message: 'Pilih jenis proxy:',
        choices: ['Rotating', 'Static'],
      }
    ]);
    isRotating = proxyType === 'Rotating';
    try {
      const proxyData = fs.readFileSync('proxy.txt', 'utf8');
      proxyList = proxyData.split('\n').map(line => line.trim()).filter(Boolean);
      console.log(chalk.green(`Terdapat ${proxyList.length} proxy.\n`));
    } catch (err) {
      console.log(chalk.yellow('File proxy.txt tidak ditemukan, tidak menggunakan proxy.\n'));
    }
  }

  let count;
  while (true) {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'count',
        message: 'Masukkan jumlah akun: ',
        validate: (value) => {
          const parsed = parseInt(value, 10);
          if (isNaN(parsed) || parsed <= 0) {
            return 'Harap masukkan angka yang valid lebih dari 0!';
          }
          return true;
        }
      }
    ]);
    count = parseInt(answer.count, 10);
    if (count > 0) break;
  }

  const { ref } = await inquirer.prompt([
    {
      type: 'input',
      name: 'ref',
      message: 'Masukkan kode reff: ',
    }
  ]);

  console.log(chalk.yellow('\n==================================='));
  console.log(chalk.yellowBright(`Creating ${count} Akun ..`));
  console.log(chalk.yellowBright('Note: Jangan Bar Barbar Bang 🗿'));
  console.log(chalk.yellowBright('Saran Kalau Mau BarBar Make Proxy.. '));
  console.log(chalk.yellow('=====================================\n'));

  const fileName = 'accounts.json';
  let accounts = [];
  if (fs.existsSync(fileName)) {
    try {
      accounts = JSON.parse(fs.readFileSync(fileName, 'utf8'));
    } catch (err) {
      accounts = [];
    }
  }

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < count; i++) {
    console.log(chalk.magenta(`\n================================ ACCOUNT ${i + 1}/${count} ================================`));
    let accountSessionId = '';
    let accountAxiosConfig = { timeout: 10000 };
    if (useProxy && isRotating) {
      accountSessionId = `session-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      accountAxiosConfig.headers = { 'Session-Id': accountSessionId };
    }
    if (useProxy && proxyList.length > 0) {
      const randomProxy = proxyList[Math.floor(Math.random() * proxyList.length)];
      let agent;
      if (randomProxy.startsWith('socks5://')) {
        agent = new SocksProxyAgent(randomProxy);
      } else {
        agent = new ProxyAgent(randomProxy);
      }
      accountAxiosConfig.httpAgent = agent;
      accountAxiosConfig.httpsAgent = agent;
    }

    let accountIP = '';
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json', accountAxiosConfig);
      accountIP = ipResponse.data.ip;
    } catch (error) {
      accountIP = "Gagal mendapatkan IP";
    }

    console.log(chalk.cyan(`IP Yang Digunakan: ${accountIP}`));
    if (useProxy && isRotating) {
      console.log(chalk.cyan(`Generated Session ID: ${accountSessionId}\n`));
    } else {
      console.log(chalk.cyan(`\n`));
    }

    const wallet = ethers.Wallet.createRandom();
    console.log(chalk.greenBright(`✔️  Wallet Berhasil Di buat: ${wallet.address}`));
    const payload = {
      account: wallet.address,
      referredBy: ref,
    };

    const regSpinner = ora('Mengirim data ke API...').start();
    try {
      const response = await axios.post('https://madness.finance/api/create', payload, accountAxiosConfig);
      regSpinner.succeed(chalk.greenBright('  Berhasil Mendaftarkan akun'));
      successCount++;

      const accountId =
        response.data?.data?.user?._id ||
        response.data?.data?.user?.id ||
        null;
      await performTasksForWallet(accountSessionId, wallet, accountId, accountAxiosConfig);
      accounts.push({
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic.phrase,
        _id: accountId,
      });
     try {
        fs.writeFileSync(fileName, JSON.stringify(accounts, null, 2));
        console.log(chalk.greenBright('✔️  Data akun berhasil disimpan ke accounts.json'));
      } catch (err) {
        console.error(chalk.redBright(`✖   Gagal menyimpan data ke ${fileName}: ${err.message}`));
       }
     }  catch (error) {
      regSpinner.fail(chalk.redBright(`✖   Gagal untuk ${wallet.address}`));
      failCount++;
    }
    console.log(chalk.cyan(`\n Progress: ${i + 1}/${count} akun telah diregistrasi. (Berhasil: ${successCount}, Gagal: ${failCount})`));
    console.log(chalk.magenta('====================================================================\n'));

    if (i < count - 1) {
      const randomDelay = Math.floor(Math.random() * (60000 - 30000 + 1)) + 30000;
      await countdown(randomDelay);
    }
  }
  console.log(chalk.green('\nRegistrasi selesai.'));
}

main();
