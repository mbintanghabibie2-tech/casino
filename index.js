// ========================================
// CASINO BOT FINAL STABLE 😭🔥
// FULL SUPABASE VERSION
// ========================================

const supabase =
require('./database/supabase')

const TelegramBot =
require('node-telegram-bot-api')

const moment =
require('moment-timezone')

const bot =
new TelegramBot(

'8949237246:AAHqZyAasGc79FWifLVU2FQ358F_zYRjhv4',

{
polling: true
}

)

const ADMIN_ID =
5993350382

// ========================================
// GET USER 😭🔥
// ========================================

async function getUser(userData) {

const userId =
Number(userData.id)

const {
data:
existing
}
=
await supabase

.from('users')

.select('*')

.eq(
'id',
userId
)

.single()

if (existing) {

if (
existing.username
!==
(
userData.username
||
'-'
)
||
existing.name
!==
userData.first_name
) {

await supabase

.from('users')

.update({

username:
userData.username
||
'-',

name:
userData.first_name

})

.eq(
'id',
userId
)

existing.username =
userData.username
||
'-'

existing.name =
userData.first_name

}

return existing

}

const newUser = {

id:
userId,

username:
userData.username
||
'-',

name:
userData.first_name,

money:
300,

slot_limit:
100,

last_daily:
null,

last_slot_reset:
null

}

await supabase

.from('users')

.insert(newUser)

return newUser

}

// ========================================
// SAVE USER 😭🔥
// ========================================

async function saveUser(user) {

await supabase

.from('users')

.update({

username:
user.username,

name:
user.name,

money:
user.money,

slot_limit:
user.slot_limit,

last_daily:
user.last_daily,

last_slot_reset:
user.last_slot_reset

})

.eq(
'id',
user.id
)

}

// ========================================
// FIND USER 😭🔥
// ========================================

async function findUser(input) {

let targetUser = null

// USERNAME 😭🔥
if (
input.startsWith('@')
) {

const username =
input
.replace('@', '')

const result =
await supabase

.from('users')

.select('*')

.ilike(
'username',
username
)

.single()

targetUser =
result.data

}

// ID 😭🔥
else {

const result =
await supabase

.from('users')

.select('*')

.eq(
'id',
Number(input)
)

.single()

targetUser =
result.data

}

return targetUser

}

// ========================================
// SLOT UTIL 😭🔥
// ========================================

function randomFruit() {

const fruits = [

'🍏',
'🍅',
'🍋'

]

return fruits[
Math.floor(
Math.random()
*
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

for (
let row
of board
) {

if (
row[0]
===
row[1]
&&
row[1]
===
row[2]
) {
lines++
}

}

for (
let i = 0;
i < 3;
i++
) {

if (
board[0][i]
===
board[1][i]
&&
board[1][i]
===
board[2][i]
) {
lines++
}

}

if (
board[0][0]
===
board[1][1]
&&
board[1][1]
===
board[2][2]
) {
lines++
}

if (
board[0][2]
===
board[1][1]
&&
board[1][1]
===
board[2][0]
) {
lines++
}

return lines

}

// ========================================
// START 😭🔥
// ========================================

bot.onText(
/\/start/,

async (msg) => {

const user =
await getUser(
msg.from
)

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

}
)

// ========================================
// PROFILE 😭🔥
// ========================================

bot.onText(
/\/profile/,

async (msg) => {

const user =
await getUser(
msg.from
)

bot.sendMessage(

msg.chat.id,

`👤 ${user.name}

🆔 ${user.id}
👤 @${user.username}

💰 Rp${user.money}
⏳ ${user.slot_limit}/100`

)

}
)

// ========================================
// DAILY 😭🔥
// ========================================

bot.onText(
/\/daily/,

async (msg) => {

const user =
await getUser(
msg.from
)

const today =
moment()

.tz(
'Asia/Jakarta'
)

.format(
'YYYY-MM-DD'
)

if (
user.last_daily
===
today
) {

return bot.sendMessage(

msg.chat.id,

'Kamu sudah claim daily hari ini'

)

}

user.money += 50
user.last_daily = today

await saveUser(user)

bot.sendMessage(

msg.chat.id,

`✅ Check harian telah berhasil

💰 uang kamu +Rp50

⏰ kembali lagi jam 00.00 WIB`

)

}
)

// ========================================
// BUY LIMIT 😭🔥
// ========================================

bot.onText(
/\/buylimit (.+)/,

async (msg, match) => {

const amount =
Number(match[1])

const user =
await getUser(
msg.from
)

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

await saveUser(user)

bot.sendMessage(

msg.chat.id,

`☑️ Berhasil beli limit

⌛ +${amount} limit
💸 -Rp${price}

⏳ Total limit:
${user.slot_limit}/100`

)

}
)

// ========================================
// LEADERBOARD 😭🔥
// ========================================

bot.onText(
/\/leaderboard/,

async (msg) => {

const {
data:
users
}
=
await supabase

.from('users')

.select('*')

.order(
'money',
{
ascending: false
}
)

.limit(10)

if (
!users
||
users.length
===
0
) {

return bot.sendMessage(

msg.chat.id,

'Leaderboard kosong'

)

}

let text =
'🏆 LEADERBOARD CASINO\n\n'

users.forEach(

(u, i) => {

text +=

`${i + 1}. ${u.name}
🆔 ${u.id}
👤 @${u.username}
💰 Rp${u.money}

`

}

)

bot.sendMessage(
msg.chat.id,
text
)

}
)

// ========================================
// MINES 😭🔥
// ========================================

bot.onText(
/\/mines (.+) (.+)/,

async (msg, match) => {

if (
Number(msg.from.id)
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

const targetUser =
await findUser(target)

if (!targetUser) {

return bot.sendMessage(

msg.chat.id,

'User tidak ditemukan'

)

}

targetUser.money -= amount

await saveUser(
targetUser
)

bot.sendMessage(

msg.chat.id,

`✅ Berhasil mengurangi

🆔 ${targetUser.id}
💸 -Rp${amount}`

)

}
)
// ========================================
// SLOT 😭🔥
// ========================================

bot.onText(
/\/slot/,

async (msg) => {

playSlot(msg)

}
)

async function playSlot(msg) {

const user =
await getUser(
msg.from
)

const owner =
await getUser({

id:
ADMIN_ID,

username:
'admin',

first_name:
'Casino Owner'

})

const today =
moment()

.tz(
'Asia/Jakarta'
)

.format(
'YYYY-MM-DD'
)

// RESET LIMIT 😭🔥
if (
user.last_slot_reset
!==
today
) {

user.slot_limit =
100

user.last_slot_reset =
today

await saveUser(user)

}

if (
user.slot_limit
<
5
) {

return bot.sendMessage(

msg.chat.id,

`Limit slot hari ini habis
reset otomatis jam 00.00 wib

beli limit: 1 limit = Rp5
contoh: /buylimit 100`

)

}

if (
user.money
<
25
) {

return bot.sendMessage(

msg.chat.id,

`uang tidak cukup untuk spin
modal untuk spin Rp25`

)

}

// KURANGI MODAL 😭🔥
user.money -= 25
user.slot_limit -= 5

owner.money += 25

// JACKPOT 😭🔥
const {
data:
jackpot
}
=
await supabase

.from('jackpot')

.select('*')

.eq(
'id',
1
)

.single()

const currentTime =
Date.now()

let canJackpot =
true

if (
jackpot.last_jackpot
) {

const next =
jackpot.last_jackpot
+
(
3 *
24 *
60 *
60 *
1000
)

if (
currentTime
<
next
) {

canJackpot =
false

}

}

let board
let lines

const chance =
Math.random()
*
100

// KALAH 😭🔥
if (
chance < 75
) {

do {

board =
generateBoard()

lines =
countLines(board)

}

while (
lines > 0
)

}

// MENANG 1 😭🔥
else if (
chance < 93
) {

do {

board =
generateBoard()

lines =
countLines(board)

}

while (
lines !== 1
)

}

// MENANG 2 😭🔥
else if (
chance < 99
) {

do {

board =
generateBoard()

lines =
countLines(board)

}

while (
lines !== 2
)

}

// JACKPOT 😭🔥
else {

if (
canJackpot
) {

board = [

[
'🍏',
'🍏',
'🍏'
],

[
'🍅',
'🍅',
'🍅'
],

[
'🍋',
'🍋',
'🍋'
]

]

lines = 3

await supabase

.from('jackpot')

.update({

last_jackpot:
currentTime

})

.eq(
'id',
1
)

}

else {

do {

board =
generateBoard()

lines =
countLines(board)

}

while (
lines >= 3
)

}

}

let text

// KALAH 😭🔥
if (
lines === 0
) {

text =

`@${msg.from.username || msg.from.first_name}

${boardText(board)}

kurang beruntung.
💸 uang kamu -Rp25
⏳ sisa limit: ${user.slot_limit}/100`

}

// MENANG 1 😭🔥
else if (
lines === 1
) {

user.money += 50

text =

`@${msg.from.username || msg.from.first_name}

${boardText(board)}

🎉 selamat kamu menang
💰 uang kamu +Rp50
⏳ sisa limit: ${user.slot_limit}/100`

}

// MENANG 2 😭🔥
else if (
lines === 2
) {

user.money += 150

text =

`@${msg.from.username || msg.from.first_name}

${boardText(board)}

🔥 gokill menang 2 baris
💰 uang kamu +Rp150
⏳ sisa limit: ${user.slot_limit}/100`

}

// JACKPOT 😭🔥
else {

user.money += 3000

text =

`@${msg.from.username || msg.from.first_name}

${boardText(board)}

🏆 JACKPOT GEDE NIH🔥
💰 uang kamu +Rp3.000
⏳ sisa limit: ${user.slot_limit}/100`

}

// SAVE 😭🔥
await saveUser(user)
await saveUser(owner)

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

// ========================================
// DUEL 😭🔥
// ========================================

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

const targetInput =
match[1]

const amount =
Number(match[2])

const challenger =
await getUser(
msg.from
)

const targetUser =
await findUser(
targetInput
)

if (!targetUser) {

return bot.sendMessage(

msg.chat.id,

'User target belum pernah pakai bot, suruh /start dulu'

)

}

if (
challenger.id
===
targetUser.id
) {

return bot.sendMessage(

msg.chat.id,

'Tidak bisa duel diri sendiri'

)

}

if (
challenger.money
<
amount
) {

return bot.sendMessage(

msg.chat.id,

'Uang kamu kurang'

)

}

if (
targetUser.money
<
amount
) {

return bot.sendMessage(

msg.chat.id,

'Uang target kurang'

)

}

bot.sendMessage(

msg.chat.id,

`🎰 Pengguna ID ${challenger.id}
(@${challenger.username})

mengajak

${targetUser.id}
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
`accept_${challenger.id}_${targetUser.id}_${amount}`

},

{

text:
'❌ Tolak',

callback_data:
`reject_${challenger.id}_${targetUser.id}_${amount}`

}

]]

}
}

)

}
)
// ========================================
// CALLBACK 😭🔥
// ========================================

bot.on(
'callback_query',

async (query) => {

query.message.from =
query.from

// ========================================
// SPIN 😭🔥
// ========================================

if (
query.data
===
'spin'
) {

return playSlot(
query.message
)

}

// ========================================
// ACCEPT DUEL 😭🔥
// ========================================

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
Number(split[1])

const targetId =
Number(split[2])

const amount =
Number(split[3])

if (
Number(query.from.id)
!==
targetId
) {

return bot.answerCallbackQuery(

query.id,

{
text:
'Ini bukan duel kamu'
}

)

}

// REFRESH USER 😭🔥
const challenger =
await findUser(
String(challengerId)
)

const target =
await findUser(
String(targetId)
)

if (
!challenger
||
!target
) {

return bot.sendMessage(

query.message.chat.id,

'User tidak ditemukan'

)

}

if (
challenger.money
<
amount
) {

return bot.sendMessage(

query.message.chat.id,

'Uang penantang kurang'

)

}

if (
target.money
<
amount
) {

return bot.sendMessage(

query.message.chat.id,

'Uang target kurang'

)

}

// KURANGI DUIT 😭🔥
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

// HADIAH 😭🔥
winner.money +=
amount * 2

// SAVE 😭🔥
await saveUser(
challenger
)

await saveUser(
target
)

bot.sendMessage(

query.message.chat.id,

`🏆 Duel selesai

Pemenang:
@${winner.username}

💰 mendapatkan Rp${amount * 2}`

)

}

// ========================================
// REJECT DUEL 😭🔥
// ========================================

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

}
)

// ========================================
// ONLINE 😭🔥
// ========================================

console.log(

'Casino Bot Aktif 😭🔥'

)
