const discord = require('discord.js');
const client = new discord.Client();

const config = require('./config.json');


client.login(config.token);

client.on('ready', () => {
    console.log(client.user.username + " has logged in.");
});


const sql = require('sqlite');
const path = require('path');
const ms = require('parse-ms');
const prefix = "$";
sql.open(path.join(__dirname, 'credits.sql'))
.then(() => {
    console.log('Opened')
    sql.run(`CREATE TABLE IF NOT EXISTS creditSysteme (id VARCHAR(30), credits BIGINT, timeDaily BIGINT, visa VARCHAR(30), Bcredits BIGINT, visan BIGINT)`)
})
.catch(err => console.error(err))
client.on("message", async msg => {
    if(!msg.channel.guild) return;
    let men = msg.mentions.users.first() || msg.author;
    let prize =  msg.content.split(" ").slice(2).join(" ")
    const random = Math.floor(Math.random() * (10 - 5 + 1))+ 5
    sql.get(`SELECT * FROM creditSysteme WHERE id = '${msg.author.id}'`).then(res => {
      if(!res) sql.run(`INSERT INTO creditSysteme VALUES ('${msg.author.id}', 0, 0, 'Disabled', 0, 0)`)
      if(res) {
        let randomC = res.credits
        sql.run(`UPDATE creditSysteme SET credits = ${randomC + parseInt(random)} WHERE id = '${msg.author.id}'`);
        console.log(`${random}`)
      }
    })
    if(msg.content.startsWith(prefix+"credits")) {
        if(!men || !men === undefined) return msg.channel.send("** :interrobang: | "+men.username+", I can't find "+men.username+"!**");
        if(!prize) {
        sql.get(`SELECT * FROM creditSysteme WHERE id = '${men.id}'`).then(res => {
            if(!res) sql.run(`INSERT INTO creditSysteme VALUES ('${men.id}', 0, 0, 'Disabled', 0, 0)`)
            if(res) {
                    msg.channel.send("**"+men.username+" :credit_card: balance is ``"+res.credits+"$``.**")
            }
        })
        }else{
            if(isNaN(prize) || prize <= 0) return msg.channel.send(" :interrobang: | "+msg.author.username+", type the credit you need to transfer!");
            if(parseFloat(prize) === NaN) return msg.channel.send(" :interrobang: | "+msg.author.username+", type the credit you need to transfer!");
            let authorRes = await sql.get(`SELECT * FROM creditSysteme WHERE id = '${msg.author.id}'`)
            let userRes = await sql.get(`SELECT * FROM creditSysteme WHERE id = '${men.id}'`)
            if(!authorRes) sql.run(`INSERT INTO creditSysteme VALUES ('${msg.author.id}', 0, 0, 'Disabled', 0, 0)`)
            if(!userRes) sql.run(`INSERT INTO creditSysteme VALUES ('${men.id}', 0, 0, 'Disabled', 0, 0)`)
            let authorCredits = authorRes.credits;
            let userCredits = userRes.credits;
            let tprize = Math.floor(prize - (prize * 5/100))
            if(prize <= 5) tprize = prize
            if(parseFloat(prize) > authorCredits) return msg.channel.send("** :thinking: | "+msg.author.username+", Your balance is not enough for that!**");
            sql.run(`UPDATE creditSysteme SET credits = ${authorCredits - parseInt(prize)} WHERE id = '${msg.author.id}'`);
            sql.run(`UPDATE creditSysteme SET credits = ${userCredits + parseInt(tprize)} WHERE id = '${men.id}'`);
            msg.channel.send("**:moneybag: | "+msg.author.username+", has transferred ``$"+tprize+"`` to "+men.toString()+"**")
            men.send(`:atm:  |  Transfer Receipt\n\`\`\`You have received $ ${tprize} from user ${msg.author.username} (ID: ${msg.author.id})\`\`\``)
        }
    }
   
   
   
    else if(msg.content.startsWith(prefix+"daily")) {
        let daily = 86400000;
        let amount = Math.floor((Math.random() * 500) + 1)
        let res = await sql.get(`SELECT * FROM creditSysteme WHERE id = '${msg.author.id}'`)
        if(!res) sql.run(`INSERT INTO creditSysteme VALUES ('${men.id}', 0, 0, 'Disabled', 0, 0)`)
        let time = res.timeDaily;
        let credits = res.credits;
        if(time != null && daily - (Date.now() - time) > 0) {
            let fr8 = ms(daily - (Date.now() - time));
            msg.channel.send("**:stopwatch: | "+msg.author.username+", your daily :yen: credits refreshes in "+fr8.hours+" hours and "+fr8.seconds+" seconds. **")
        }else{
            msg.channel.send("**:atm:  |  "+msg.author.username+", you received your :yen: "+amount+" daily credits!**");
            sql.run(`UPDATE creditSysteme SET credits = ${credits + amount}, timeDaily = ${Date.now()} WHERE id = '${msg.author.id}'`);
        }
    }
    else
    if(msg.content.startsWith(prefix+"create-Visa")) {
      sql.get(`SELECT * FROM creditSysteme WHERE id = '${msg.author.id}'`).then(res => {
        if(!res) sql.run(`INSERT INTO creditSysteme VALUES ('${msg.author.id}', 0, 0, 'Disabled', 0, 0)`)
        if(res) {
          var idkey = "123456789987654321147852369963258741951753";
          var ID = "";
          for (var y = 0; y < 16; y++) {
            ID +=  `${idkey.charAt(Math.floor(Math.random() * idkey.length))}`;
          };
          msg.channel.send("**:credit_card: The Visa Has Been Created Succesfully.**")
          sql.run(`UPDATE creditSysteme SET visa = 'Enabled', visan = ${ID} WHERE id = '${msg.author.id}'`);
        }
    })
  }
  else
  if(msg.content.startsWith(prefix+"put-In-Bank")) {
    var bacredits = msg.content.split(" ").slice(1).join(" ")
    if(msg.author.bot || !msg.channel.guild || isNaN(bacredits) || parseFloat(bacredits) === NaN || bacredits <= 0) return msg.channel.send("**Type The Amount You Want To Put!**");
    let bncredits = await sql.get(`SELECT * FROM creditSysteme WHERE id = '${msg.author.id}'`)
    if(!bncredits) sql.run(`INSERT INTO creditSysteme VALUES ('${msg.author.id}', 0, 0, 'Disabled', 0, 0)`)
    let authorBCredits = bncredits.credits;
    let Visas = bncredits.visa
    let bank = bncredits.Bcredits
    if(Visas === 'Disabled')return msg.channel.send("**:x: | "+msg.author.username+", Please Create A Visa To Use This Command!**");
    if(parseInt(bacredits) > authorBCredits) return msg.channel.send("** :thinking: | "+msg.author.username+", Your balance is not enough for that!**");
    sql.run(`UPDATE creditSysteme SET credits = ${authorBCredits - parseInt(bacredits)} WHERE id = '${msg.author.id}'`);
    sql.run(`UPDATE creditSysteme SET Bcredits = ${bank + parseInt(bacredits)} WHERE id = '${msg.author.id}'`).then(msg.channel.send("**Donne...**"))
  }
  else if(msg.content.startsWith(prefix+"get-From-Bank")) {
    var gcredits = msg.content.split(" ").slice(1).join(" ")
    if(msg.author.bot || !msg.channel.guild || isNaN(gcredits) || parseFloat(gcredits) === NaN || gcredits <= 0) return msg.channel.send("**Type The Amount You Want To Put!**");
    let ucredits = await sql.get(`SELECT * FROM creditSysteme WHERE id = '${msg.author.id}'`)
    if(!ucredits) sql.run(`INSERT INTO creditSysteme VALUES ('${msg.author.id}', 0, 0, 'Disabled', 0, 0)`)
    let authorgCredits = ucredits.credits;
    let Visa = ucredits.visa
    let banka = ucredits.Bcredits
    if(Visa === 'Disabled') return msg.channel.send("**:x: | "+msg.author.username+", Please Create A Visa To Use This Command!**");
    if(parseInt(bacredits) > authorgCredits) return msg.channel.send("** :x: | "+msg.author.username+", Your balance is not enough for that!**");
    sql.run(`UPDATE creditSysteme SET credits = ${authorgCredits + parseInt(gcredits)} WHERE id = '${msg.author.id}'`);
    sql.run(`UPDATE creditSysteme SET Bcredits = ${banka - parseInt(gcredits)} WHERE id = '${msg.author.id}'`).then(msg.channel.send("**Donne...**"))
  }
  else
  if(msg.content === prefix+"bank-Balance") {
    sql.get(`SELECT * FROM creditSysteme WHERE id = '${msg.author.id}'`).then(res => {
      if(!res) sql.run(`INSERT INTO creditSysteme VALUES ('${msg.author.id}', 0, 0, 'Disabled', 0, 0)`)
      if(res) {
        msg.channel.send("**"+msg.author.username+", Your Bank balance is ``"+res.Bcredits+"$``.**")
      }
    })
  }
  else
  if(msg.content === prefix+"info-Visa") {
      sql.get(`SELECT * FROM creditSysteme WHERE id = '${men.id}'`).then(res => {
        if(!res) sql.run(`INSERT INTO creditSysteme VALUES ('${msg.author.id}', 0, 0, 'Disabled', 0, 0)`)
        if(res) {
          if(res.visa === 'Disabled') return
          let embed = new Discord.RichEmbed()
          .setAuthor(men.tag)
          .addField("**Visa Status:**", "**"+res.visa+"**",true)
          .addField("**Visa Number**:", "**"+res.visan+"**",true)
          .addField("Visa balance:", "**"+res.Bcredits+"**")
          .setTimestamp()
          msg.channel.send(embed)
        }
      })
  }
});
