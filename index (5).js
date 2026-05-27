const supabase = require('./database/supabase')
const TelegramBot = require('node-telegram-bot-api')
const moment = require('moment-timezone')

const bot = new TelegramBot(
  '8949237246:AAFrvEQ_h9kU_G3-lPnSI3oTYannjned7SI',
  { polling: true }
)

const ADMIN_ID = '5993350382'

async function getUser(msg) {

  const userId = msg.from.id

  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (existing) {
    return existing
  }

  const newUser = {
    id: userId,
    username: msg.from.username || '-',
    name: msg.from.first_name,
    money: 300,
    slot_limit: 100,
    last_daily: null,
    last_slot_reset: null
  }

  await supabase
    .from('users')
    .insert(newUser)

  return newUser

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

  for (let row of board) {

    if (
      row[0] === row[1] &&
      row[1] === row[2]
    ) {
      lines++
    }

  }

  for (let i = 0; i < 3; i++) {

    if (
      board[0][i] === board[1][i] &&
      board[1][i] === board[2][i]
    ) {
      lines++
    }

  }

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
bot.onText(/\/start/, async (msg) => {

  const user = await getUser(msg)

  bot.sendMessage(

    msg.chat.id,

`🎰 Selamat datang di Bot Casino Telegram Ter gacorr Ter aman, dijamin menang banyakkk tanpa deposit 🎰

💰 Total uang : Rp${user.money}
⏳ Total limit : ${user.slot_limit}/100
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
bot.onText(/\/profile/, async (msg) => {

  const user = await getUser(msg)

  bot.sendMessage(

    msg.chat.id,

`👤 ${user.name}

🆔 ${user.id}
👤 @${user.username}

💰 Rp${user.money}
⏳ ${user.slot_limit}/100`

  )

})

// DAILY
bot.onText(/\/daily/, async (msg) => {

  const user = await getUser(msg)

  const now =
  moment().tz(
    'Asia/Jakarta'
  )

  const today =
  now.format(
    'YYYY-MM-DD'
  )

  if (
    user.last_daily === today
  ) {

    return bot.sendMessage(

      msg.chat.id,

      'Kamu sudah claim daily hari ini'

    )

  }

  user.last_daily = today
  user.money += 50

  await supabase
    .from('users')
    .update({
      money: user.money,
      last_daily: user.last_daily
    })
    .eq('id', user.id)

  bot.sendMessage(

    msg.chat.id,

`✅ Check harian telah berhasil

💰 uang kamu +Rp50

⏰ kembali lagi jam 00.00 WIB`

  )

})

// BUYLIMIT
bot.onText(/\/buylimit (.+)/, async (msg, match) => {

  const amount =
  Number(match[1])

  const user =
  await getUser(msg)

  const price =
  amount * 5

  if (
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
  user.slot_limit += amount

  await supabase
    .from('users')
    .update({
      money: user.money,
      slot_limit: user.slot_limit
    })
    .eq('id', user.id)

  bot.sendMessage(
    msg.chat.id,

`☑️ Berhasil beli limit

⌛ +${amount} limit
💸 -Rp${price}

⏳ Total limit:
${user.slot_limit}/100`

  )

})

// LEADERBOARD
bot.onText(/\/leaderboard/, async (msg) => {

  const { data: users } =
  await supabase
    .from('users')
    .select('*')
    .order('money', {
      ascending: false
    })
    .limit(10)

  let text =
'🏆 LEADERBOARD CASINO\n\n'

  users.forEach((u, i) => {

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
bot.onText(/\/mines (.+) (.+)/, async (msg, match) => {

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

  const target = match[1]
  const amount = Number(match[2])

  const { data: targetUser } =
  await supabase
    .from('users')
    .select('*')
    .eq('id', target)
    .single()

  if (!targetUser) {

    return bot.sendMessage(
      msg.chat.id,
      'User tidak ditemukan'
    )

  }

  targetUser.money -= amount

  await supabase
    .from('users')
    .update({
      money: targetUser.money
    })
    .eq('id', target)

  bot.sendMessage(

    msg.chat.id,

`✅ Berhasil mengurangi

🆔 ${target}
💸 -Rp${amount}`

  )

})

// SLOT
bot.onText(/\/slot/, async (msg) => {
  playSlot(msg)
})

async function playSlot(msg) {

  const user = await getUser(msg)

  const ownerId = 5993350382

  let { data: owner } =
  await supabase
    .from('users')
    .select('*')
    .eq('id', ownerId)
    .single()

  if (!owner) {

    await supabase
      .from('users')
      .insert({
        id: ownerId,
        username: 'admin',
        name: 'Casino Owner',
        money: 0,
        slot_limit: 0
      })

    const result = await supabase
      .from('users')
      .select('*')
      .eq('id', ownerId)
      .single()

    owner = result.data

  }

  const now =
  moment().tz('Asia/Jakarta')

  const today =
  now.format('YYYY-MM-DD')

  if (
    user.last_slot_reset !== today
  ) {

    user.slot_limit = 100
    user.last_slot_reset = today

  }

  if (
    user.slot_limit < 5
  ) {

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
  user.slot_limit -= 5

  owner.money += 25
  owner.slot_limit += 5

  const { data: jackpot } =
  await supabase
    .from('jackpot')
    .select('*')
    .eq('id', 1)
    .single()

  const currentTime = Date.now()

  let canJackpot = true

  if (
    jackpot.last_jackpot
  ) {

    const next =
      jackpot.last_jackpot +
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

  if (chance < 75) {

    do {

      board = generateBoard()
      lines = countLines(board)

    }

    while (lines > 0)

  }

  else if (chance < 93) {

    do {

      board = generateBoard()
      lines = countLines(board)

    }

    while (lines !== 1)

  }

  else if (chance < 99) {

    do {

      board = generateBoard()
      lines = countLines(board)

    }

    while (lines !== 2)

  }

  else {

    if (canJackpot) {

      board = [
        ['🍏','🍏','🍏'],
        ['🍅','🍅','🍅'],
        ['🍋','🍋','🍋']
      ]

      lines = 3

      await supabase
        .from('jackpot')
        .update({
          last_jackpot: currentTime
        })
        .eq('id', 1)

    }

    else {

      do {

        board = generateBoard()
        lines = countLines(board)

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
⏳ sisa limit: ${user.slot_limit}/100`

  }

  else if (lines === 1) {

    user.money += 50

    text =
`@${msg.from.username || msg.from.first_name}

${boardText(board)}

🎉 selamat kamu menang
💰 uang kamu +Rp50
⏳ sisa limit: ${user.slot_limit}/100`

  }

  else if (lines === 2) {

    user.money += 150

    text =
`@${msg.from.username || msg.from.first_name}

${boardText(board)}

🔥 gokill menang 2 baris
💰 uang kamu +Rp150
⏳ sisa limit: ${user.slot_limit}/100`

  }

  else {

    user.money += 3000

    text =
`@${msg.from.username || msg.from.first_name}

${boardText(board)}

🏆 JACKPOT GEDE NIH🔥
💰 uang kamu +Rp3.000
⏳ sisa limit: ${user.slot_limit}/100`

  }

  await supabase
    .from('users')
    .update({
      money: user.money,
      slot_limit: user.slot_limit,
      last_slot_reset: user.last_slot_reset
    })
    .eq('id', user.id)

  await supabase
    .from('users')
    .update({
      money: owner.money,
      slot_limit: owner.slot_limit
    })
    .eq('id', owner.id)

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

// CALLBACK
bot.on('callback_query', async (query) => {

  query.message.from = query.from

  if (
    query.data === 'spin'
  ) {

    playSlot(query.message)

  }

})

// DUEL
bot.onText(
/\/duel (.+) (.+)/,

async (msg, match) => {

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

  if (
    !match[1] ||
    !match[2]
  ) {

    return bot.sendMessage(

      msg.chat.id,

`✖️ penggunaan salah!

Format yg benar:
/duel (id lawan) (taruhan)

Contoh:
/duel 5993350382 200`

    )

  }

  let target =
  match[1]

let targetUser = null

// kalau pakai @username 😭🔥
if (
target.startsWith('@')
) {

const username =

target
.replace('@', '')

const result =
await supabase

.from('users')

.select('*')

.eq(
'username',
username
)

.single()

targetUser =
result.data

if (!targetUser) {

return bot.sendMessage(

msg.chat.id,

'Username tidak ditemukan'

)

}

target =
targetUser.id

}

// kalau pakai ID 😭🔥
else {

const result =
await supabase

.from('users')

.select('*')

.eq(
'id',
target
)

.single()

targetUser =
result.data

if (!targetUser) {

return bot.sendMessage(

msg.chat.id,

'User tidak ditemukan'

)

}

}

  const amount =
  Number(match[2])

  const challenger =
  await getUser(msg)

  if (
    !targetUser
  ) {

    return bot.sendMessage(

      msg.chat.id,

'User target belum pernah pakai bot, suruh /start dulu'

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

  if (
    targetUser.money
    < amount
  ) {

    return bot.sendMessage(

      msg.chat.id,

      'Uang target kurang'

    )

  }

  bot.sendMessage(

    msg.chat.id,

`🎰 Pengguna ID ${msg.from.id}
(@${challenger.username})

mengajak

${target}
(@${targetUser.username})

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

// ACCEPT / REJECT DUEL
bot.on(
'callback_query',

async (query) => {

  query.message.from =
  query.from

  // SPIN
  if (
    query.data === 'spin'
  ) {

    return playSlot(
      query.message
    )

  }

  // ACCEPT
  if (
    query.data.startsWith(
      'accept_'
    )
  ) { 
    await bot.deleteMessage(
      query.message.chat.id,
      query.message.message_id
    )

    const split =
    query.data.split('_')

    const challengerId =
    split[1]

    const targetId =
    split[2]

    const amount =
    Number(split[3])

    if (
      String(query.from.id)
      !==
      String(targetId)
    ) {

      return bot.answerCallbackQuery(
        query.id,
        {
          text:
          'Ini bukan duel kamu'
        }
      )

    }

    const {
      data:
      challenger
    }
    =
    await supabase

    .from('users')

    .select('*')

    .eq(
      'id',
      challengerId
    )

    .single()

    const {
      data:
      target
    }
    =
    await supabase

    .from('users')

    .select('*')

    .eq(
      'id',
      targetId
    )

    .single()

    if (
      !challenger ||
      !target
    ) {
      return
    }

    if (
      challenger.money
      < amount
    ) {

      return bot.sendMessage(

        query.message.chat.id,

        'Uang penantang kurang'

      )

    }

    if (
      target.money
      < amount
    ) {

      return bot.sendMessage(

        query.message.chat.id,

        'Uang target kurang'

      )

    }

    challenger.money -= amount
    target.money -= amount

    const board1 =
    generateBoard()

    const line1 =
    countLines(board1)

    const board2 =
    generateBoard()

    const line2 =
    countLines(board2)

    bot.sendMessage(

      query.message.chat.id,

`🎰 HASIL @${challenger.username}

${boardText(board1)}

🔥 Total line:
${line1}`

    )

    bot.sendMessage(

      query.message.chat.id,

`🎰 HASIL @${target.username}

${boardText(board2)}

🔥 Total line:
${line2}`

    )

    let winner

    if (
      line1 > line2
    ) {

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

      winner =

      Math.random() < 0.5

      ? challenger
      : target

    }

    winner.money +=
    amount * 2

    await supabase

    .from('users')

    .update({

      money:
      challenger.money

    })

    .eq(
      'id',
      challenger.id
    )

    await supabase

    .from('users')

    .update({

      money:
      target.money

    })

    .eq(
      'id',
      target.id
    )
    // save winner 😭🔥
     await supabase
     .from('users')
     .update({
     money: winner.money
     })
     .eq('id', winner.id)

    bot.sendMessage(

      query.message.chat.id,

`🏆 Duel selesai

Pemenang:
@${winner.username}

💰 mendapatkan Rp${amount * 2}`

    )

  }

  // REJECT
  if (
    query.data.startsWith(
      'reject_'
    )
  ) {
    await bot.deleteMessage(
      query.message.chat.id,
      query.message.message_id
    )

    bot.sendMessage(

      query.message.chat.id,

      'Duel ditolak'

    )

  }

})

console.log(
'Casino Bot Aktif 😭🔥'
)
