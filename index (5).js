const TelegramBot = require('node-telegram-bot-api')
const fs = require('fs')
const moment = require('moment-timezone')

const bot = new TelegramBot(
  '8949237246:AAFrvEQ_h9kU_G3-lPnSI3oTYannjned7SI',
  { polling: true }
)

const FILE = './users.json'
const JACKPOT_FILE = './jackpot.json'

const ADMIN_ID = '5993350382'

if (!fs.existsSync(FILE)) {
  fs.writeFileSync(FILE, '{}')
}

if (!fs.existsSync(JACKPOT_FILE)) {
  fs.writeFileSync(
    JACKPOT_FILE,
    '{}'
  )
}

function loadUsers() {

  return JSON.parse(
    fs.readFileSync(FILE)
  )

}

function saveUsers(data) {

  fs.writeFileSync(
    FILE,
    JSON.stringify(data, null, 2)
  )

}

function loadJackpot() {

  return JSON.parse(
    fs.readFileSync(JACKPOT_FILE)
  )

}

function saveJackpot(data) {

  fs.writeFileSync(
    JACKPOT_FILE,
    JSON.stringify(data, null, 2)
  )

}

function getUser(msg) {

  const users = loadUsers()

  if (!users[msg.from.id]) {

    users[msg.from.id] = {

      id: msg.from.id,
      username:
      msg.from.username || '-',

      name:
      msg.from.first_name,

      money: 300,
      
      lastDaily: null,
      slotLimit: 100,
      lastSlotReset : null

    }

    saveUsers(users)

  }

  return users[msg.from.id]

}

function randomFruit() {

  const fruits = [

    '🍏',
    '🍅',
    '🍋'

  ]

  return fruits[
    Math.floor(
      Math.random() *
      fruits.length
    )
  ]

}

function generateBoard() {

  return [

    [
      randomFruit(),
      randomFruit(),
      randomFruit()
    ],

    [
      randomFruit(),
      randomFruit(),
      randomFruit()
    ],

    [
      randomFruit(),
      randomFruit(),
      randomFruit()
    ]

  ]

}

function boardText(board) {

  return `
${board[0].join('')}
${board[1].join('')}
${board[2].join('')}`

}

function countLines(board) {

  let lines = 0

  // horizontal
  for (let row of board) {

    if (
      row[0] === row[1] &&
      row[1] === row[2]
    ) {
      lines++
    }

  }

  // vertical
  for (let i = 0; i < 3; i++) {

    if (
      board[0][i] === board[1][i] &&
      board[1][i] === board[2][i]
    ) {
      lines++
    }

  }

  // diagonal
  if (
    board[0][0] === board[1][1] &&
    board[1][1] === board[2][2]
  ) {
    lines++
  }

  if (
    board[0][2] === board[1][1] &&
    board[1][1] === board[2][0]
  ) {
    lines++
  }

  return lines

}

// START
bot.onText(/\/start/, (msg) => {

  const user = getUser(msg)

  bot.sendMessage(

    msg.chat.id,

`🎰 Selamat datang di Bot Casino Telegram Ter gacorr Ter aman, dijamin menang banyakkk tanpa deposit 🎰

💰 Total uang : Rp${user.money}
⏳ Total limit : ${user.slotLimit}/100
🆔 ID akun : ${user.id}`,

{
  reply_markup: {

    inline_keyboard: [[

      {
        text:
        '🔥 Ayoo Mulai Spin Sekarang 🔥',

        callback_data:
        'spin'
      }

    ]]

  }
}

  )

})

// PROFILE
bot.onText(/\/profile/, (msg) => {

  const user = getUser(msg)

  bot.sendMessage(

    msg.chat.id,

`👤 ${user.name}

🆔 ${user.id}
👤 @${user.username}

💰 Rp${user.money}
⏳ ${user.slotLimit}/100`

  )

})

// BUYLIMIT
bot.onText(
/\/buylimit (.+)/,

(msg, match) => {

  const amount =
  Number(match[1])

  const users =
  loadUsers()

  const user =
  getUser(msg)

  const price =
  amount * 5

  if(
    user.money < price
  ) {

    return bot.sendMessage(

      msg.chat.id,

  `uang kamu kurang untuk beli limit

  👉 Harga:
  Rp${price}`

   )

  }

  user.money -= price
  user.slotLimit += amount

  users[msg.from.id] =
  user

  saveUsers(users)

  bot.sendMessage(
   msg.chat.id,

 `☑️ Berhasil beli limit

 ⌛ +${amount} limit
 💸 -Rp${price}

 ⏳ Total limit:
 ${user.slotLimit}/100`

  )

})

// DAILY
bot.onText(/\/daily/, (msg) => {

  const users = loadUsers()

  const user = getUser(msg)

  const now =
  moment().tz(
    'Asia/Jakarta'
  )

  const today =
  now.format(
    'YYYY-MM-DD'
  )

  if (
    user.lastDaily === today
  ) {

    return bot.sendMessage(

      msg.chat.id,

'Kamu sudah claim daily hari ini'

    )

  }

  user.lastDaily = today
  user.money += 50

  users[msg.from.id] = user

  saveUsers(users)

  bot.sendMessage(

    msg.chat.id,

`✅ Check harian telah berhasil

💰 uang kamu +Rp50

⏰ kembali lagi jam 02.00 WIB`

  )

})

// LEADERBOARD
bot.onText(
/\/leaderboard/,
(msg) => {

  const users = loadUsers()

  const sorted =
  Object.values(users)

  .sort(
    (a, b) =>
    b.money - a.money
  )

  .slice(0, 10)

  let text =
'🏆 LEADERBOARD CASINO\n\n'

  sorted.forEach((u, i) => {

    text +=
`${i + 1}. ${u.name}
🆔 ${u.id}
👤 @${u.username}
💰 Rp${u.money}

`

  })

  bot.sendMessage(
    msg.chat.id,
    text
  )

})

// ADMIN MINES
bot.onText(
/\/mines (.+) (.+)/,

(msg, match) => {

  if (
    String(msg.from.id)
    !==
    ADMIN_ID
  ) {

    return bot.sendMessage(

      msg.chat.id,

      '❌ Khusus owner'

    )

  }

  const target =
  match[1]

  const amount =
  Number(match[2])

  const users =
  loadUsers()

  if (!users[target]) {

    return bot.sendMessage(

      msg.chat.id,

      'User tidak ditemukan'

    )

  }

  users[target].money -= amount

  saveUsers(users)

  bot.sendMessage(

    msg.chat.id,

`✅ Berhasil mengurangi

🆔 ${target}
💸 -Rp${amount}`

  )

})

// SLOT
bot.onText(
/\/slot/,
(msg) => {

  playSlot(msg)

})

async function playSlot(msg) {

  const users =
  loadUsers()

  const user =
  getUser(msg)

  if (!users[5993350382]) {

    users[5993350382] = {

      id: 5993350382,
      username:'admin',
      name: 'Casino Owner',
      money: 0,
      slotLimit: 0

    }

  }

  const now =
  moment()
  .tz('Asia/Jakarta')

  const today =
  now.format(
  'YYYY-MM-DD'
  )

  if(
    user.lastSlotReset
    !==today
  ){

    user.slotLimit = 100

    user.lastSlotReset =
    today

  }

  if(
    user.slotLimit < 5
  ){

    return bot.sendMessage(

    msg.chat.id,

  `Limit slot hari ini habis
   reset otomatis jam 00.00 wib
      
   beli limit: 1 limit = Rp5
   contoh: /buylimit 100`

    )

  }

  if (user.money < 25) {
    return bot.sendMessage(
      msg.chat.id,
    `uang tidak cukup untuk spin
     modal untuk spin Rp25`
      )
  }
  user.money -= 25
  users[5993350382].money += 25
  
  user.slotLimit -= 5
  users[5993350382].slotLimit += 5
  

  const jackpot =
  loadJackpot()

  const currentTime =
  Date.now()

  let canJackpot =
  true

  if (
    jackpot.lastJackpot
  ) {

    const next =

      jackpot.lastJackpot +

      (
        3 *
        24 *
        60 *
        60 *
        1000
      )

    if (currentTime < next) {

      canJackpot = false

    }

  }

  let board
  let lines

  const chance =
  Math.random() * 100

  // kalah 75%
  if (chance < 75) {

    do {

      board =
      generateBoard()

      lines =
      countLines(board)

    }

    while (lines > 0)

  }

  // 1 line 18%
  else if (chance < 93) {

    do {

      board =
      generateBoard()

      lines =
      countLines(board)

    }

    while (lines !== 1)

  }

  // 2 line 6%
  else if (chance < 99) {

    do {

      board =
      generateBoard()

      lines =
      countLines(board)

    }

    while (lines !== 2)

  }

  // jackpot 1%
  else {

    if (canJackpot) {

      board = [

        ['🍏','🍏','🍏'],
        ['🍅','🍅','🍅'],
        ['🍋','🍋','🍋']

      ]

      lines = 3

      jackpot.lastJackpot =
      currentTime

      saveJackpot(jackpot)

    }

    else {

      do {

        board =
        generateBoard()

        lines =
        countLines(board)

      }

      while (lines >= 3)

    }

  }

  let text

  if (lines === 0) {

    text =
`@${msg.from.username || msg.from.first_name}

${boardText(board)}

kurang beruntung.
💸 uang kamu -Rp25
⏳ sisa limit: ${user.slotLimit}/100`

  }

  else if (lines === 1) {

    user.money += 50

    text =
`@${msg.from.username || msg.from.first_name}

${boardText(board)}

🎉 selamat kamu menang
💰 uang kamu +Rp50
⏳ sisa limit: ${user.slotLimit}/100`

  }

  else if (lines === 2) {

    user.money += 150

    text =
`@${msg.from.username || msg.from.first_name}

${boardText(board)}

🔥 gokill menang 2 baris
💰 uang kamu +Rp150
⏳ sisa limit: ${user.slotLimit}/100`

  }

  else {

    user.money += 3000

    text =
`@${msg.from.username || msg.from.first_name}

${boardText(board)}

🏆 JACKPOT GEDE NIH🔥
💰 uang kamu +Rp3.000
⏳ sisa limit: ${user.slotLimit}/100`

  }

  users[msg.from.id] = user

  saveUsers(users)

  bot.sendMessage(

    msg.chat.id,

    text,

{
  reply_markup: {

    inline_keyboard: [[

      {

        text:
        '🔥 Putar Lagi 🔥',

        callback_data:
        'spin'

      }

    ]]

  }
}

  )

}

// FIX CALLBACK
bot.on(
'callback_query',

async (query) => {

  query.message.from =
  query.from

  // spin
  if (
    query.data === 'spin'
  ) {

    playSlot(
      query.message
    )

  }

  // duel accept
  if (
    query.data.startsWith(
      'accept_'
    )
  ) {

    const split =
    query.data.split('_')

    const challenger =
    split[1]

    const target =
    split[2]

    const amount =
    Number(split[3])

    if (
      String(query.from.id)
      !==
      String(target)
    ) {

      return bot.answerCallbackQuery(
        query.id,
        {
          text:
          'Ini bukan duel kamu'
        }
      )

    }

    const users =
    loadUsers()

    if (
      !users[challenger] ||
      !users[target]
    ) {

      return
    }

    if (
      users[challenger].money
      < amount
    ) {

      return bot.sendMessage(

        query.message.chat.id,

        'Penantang uangnya kurang'

      )

    }

    if (
      users[target].money
      < amount
    ) {

      return bot.sendMessage(

        query.message.chat.id,

        'Uang kamu kurang'

      )

    }

    users[challenger].money -= amount
    users[target].money -= amount

    saveUsers(users)

    // spin challenger
    const board1 =
    generateBoard()

    const line1 =
    countLines(board1)

    // spin target
    const board2 =
    generateBoard()

    const line2 =
    countLines(board2)

    bot.sendMessage(

      query.message.chat.id,

`🎰 HASIL @${users[challenger].username}

${boardText(board1)}

🔥 Total line:
${line1}`

    )

    bot.sendMessage(

      query.message.chat.id,

`🎰 HASIL @${users[target].username}

${boardText(board2)}

🔥 Total line:
${line2}`

    )

    let winner

    if (line1 > line2) {

      winner =
      challenger

    }

    else if (
      line2 > line1
    ) {

      winner =
      target

    }

    else {

      const random =

      Math.random() < 0.5

      ? challenger
      : target

      winner = random

    }

    users[winner].money +=
    amount * 2

    saveUsers(users)

    bot.sendMessage(

      query.message.chat.id,

`🏆 Duel selesai

Pemenang:
@${users[winner].username}

💰 mendapatkan Rp${amount * 2}`

    )

  }

  // duel reject
  if (
    query.data.startsWith(
      'reject_'
    )
  ) {

    bot.sendMessage(

      query.message.chat.id,

'Duel ditolak'

    )

  }

})

// DUEL
bot.onText(
/\/duel (.+) (.+)/,

(msg, match) => {

  if (
    msg.chat.type
    ===
    'private'
  ) {

    return bot.sendMessage(

      msg.chat.id,

      `❌ Duel tidak tersedia dichat bot
      
      bisa digunakan hanya di grup
      atau tambahkan saya ke grup`,
      {
         reply_markup: {
           inline_keyboard: [[
           {
              text:
              'join grup official casino',

              url:
              'https://t.me/casinooogrup'
            }
          ]]
         }
      }

    )

  }

  if (!match[1] || !match[2]) {

    return bot.sendMessage(
      msg.chat.id,

    `✖️ penggunaan salah!

    Format yg benar:
     /duel (id lawan) (taruhan)

    Contoh:
     /duel 5993350382 200`
      )
  }

  const target =
  match[1]

  const amount =
  Number(match[2])

  const users =
  loadUsers()

  const challenger =
  getUser(msg)

  if (
    !users[target]
  ) {

    return bot.sendMessage(

      msg.chat.id,

      'User target belum pernah pakai bot, silahkan suruh /start di chat bot'

    )

  }

  if (
    challenger.money
    < amount
  ) {

    return bot.sendMessage(

      msg.chat.id,

      'Uang kamu kurang'

    )

  }

  bot.sendMessage(

    msg.chat.id,

`🎰 Pengguna ID ${msg.from.id}
(@${challenger.username})

mengajak

${target}
(@${users[target].username})

berduel dengan nominal
Rp${amount}

Apakah setuju?`,

{
  reply_markup: {

    inline_keyboard: [[

      {

        text:
        '✅ Setuju',

        callback_data:
`accept_${msg.from.id}_${target}_${amount}`

      },

      {

        text:
        '❌ Tolak',

        callback_data:
`reject_${msg.from.id}_${target}_${amount}`

      }

    ]]

  }
}

  )

})

console.log(
'Casino Bot Aktif 😭🔥'
)
