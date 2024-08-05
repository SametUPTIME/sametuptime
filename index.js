const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
  });

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
    });

const Discord = require('discord.js');
const { MongoClient } = require('mongodb');
const axios = require('axios');
const client = new Discord.Client();
const prefix = "?";

// MongoDB bağlantı ayarları
const uri = 'mongodb_url_niz';
const dbName = 'veritaban_ismi';
const linksCollectionName = 'links';
const bannedUsersCollectionName = 'bannedUsers';

// Ban ve unban komutlarının kullanılabileceği sunucu ve rollerin ID'leri
const allowedGuilds = ['birinci_discord_sunucu_id', 'ikinci_discord_sunucu_id'];
const allowedRoles = ['birinci_discord_rol_id', 'birinci_discord_rol_id'];

let db, linksCollection, bannedUsersCollection;

MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
        db = client.db(dbName);
        linksCollection = db.collection(linksCollectionName);
        bannedUsersCollection = db.collection(bannedUsersCollectionName);
        console.log('Connected to MongoDB');

        loadLinks();
        loadBannedUsers();
    })
    .catch(error => console.error(error));

let links = [];
let bannedUsers = [];

async function loadLinks() {
    try {
        links = await linksCollection.find().toArray();
        console.log('Links loaded from database:', links);
    } catch (error) {
        console.error('Error loading links from database:', error);
    }
}

async function loadBannedUsers() {
    try {
        bannedUsers = await bannedUsersCollection.find().toArray();
        console.log('Banned users loaded from database:', bannedUsers);
    } catch (error) {
        console.error('Error loading banned users from database:', error);
    }
}

client.once('ready', () => {
    console.log('Bot is online!');
    setInterval(checkLinks, 60000); // Her 1 dakikada bir linkleri kontrol eder
});

client.on('message', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    // DM'den gelen mesajları yanıtsız bırak
    if (message.channel.type === 'dm') return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'ping') {
        const msg = await message.channel.send('Pinging...');
        const latency = msg.createdTimestamp - message.createdTimestamp;
        const uptime = client.uptime;

        const embed = new Discord.MessageEmbed()
            .setTitle('Ping Bilgisi')
            .addField('Mesaj Gecikmesi', `${latency}ms`)
            .addField('API Gecikmesi', `${Math.round(client.ws.ping)}ms`)
            .addField('Uptime', `${uptime}ms`)
            .setColor('#00FF00');

        msg.edit('', embed);

    } else if (command === 'uptime-time') {
        const uptime = client.uptime;
        const seconds = Math.floor((uptime / 1000) % 60);
        const minutes = Math.floor((uptime / (1000 * 60)) % 60);
        const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
        const days = Math.floor((uptime / (1000 * 60 * 60 * 24)) % 7);
        const weeks = Math.floor((uptime / (1000 * 60 * 60 * 24 * 7)) % 4);
        const months = Math.floor((uptime / (1000 * 60 * 60 * 24 * 30)) % 12);
        const years = Math.floor(uptime / (1000 * 60 * 60 * 24 * 365));

        const embed = new Discord.MessageEmbed()
            .setTitle('Bot Uptime')
            .addField('Yıl', `${years}`)
            .addField('Ay', `${months}`)
            .addField('Hafta', `${weeks}`)
            .addField('Gün', `${days}`)
            .addField('Saat', `${hours}`)
            .addField('Dakika', `${minutes}`)
            .addField('Saniye', `${seconds}`)
            .setColor('#00FF00');

        message.channel.send(embed);

    } else if (command === 'add') {
        const link = args[0];
        if (!link) {
            return message.channel.send('Lütfen eklemek için bir link sağlayın.');
        }

        // Linkin 'https://' ile başladığını ve geçerli bir URL formatında olduğunu kontrol et
        const linkRegex = /^https:\/\/[^\s/$.?#].[^\s]*$/i;
        if (!linkRegex.test(link)) {
            return message.channel.send('Lütfen geçerli bir https:// linki sağlayın.');
        }

        // Yasaklanmış URL uzantıları ve kelimeleri kontrol et
        const bannedExtensions = ['.am', '.fr', '.in', '.ir'];
        const bannedWords = ['surfshark', 'pornhub'];
        const bannedDomains = ['surfshark.com', 'api.surfshark.com', 'mfa.am'];

        const isBannedExtension = bannedExtensions.some(ext => link.endsWith(ext));
        const isBannedWord = bannedWords.some(word => link.includes(word));
        const isBannedDomain = bannedDomains.some(domain => link.includes(domain));

        if (isBannedExtension || isBannedWord || isBannedDomain) {
            await bannedUsersCollection.insertOne({ userId: message.author.id, reason: 'Oto moderasyon: yasaklanmış url, uzantı' });
            bannedUsers.push({ userId: message.author.id, reason: 'Oto moderasyon: yasaklanmış url, uzantı' });

            await linksCollection.deleteMany({ userId: message.author.id });
            links = links.filter(link => link.userId !== message.author.id);

            message.guild.members.ban(message.author.id, { reason: 'Oto moderasyon: yasaklanmış url, uzantı' })
                .then(() => message.channel.send('Bu URL yasaklanmış içerik içeriyor. Kullanıcı otomatik olarak banlandı.'))
                .catch(err => message.channel.send(`Kullanıcı banlanamadı. Hata: ${err}`));

            return;
        }

        const bannedUser = bannedUsers.find(user => user.userId === message.author.id);
        if (bannedUser) {
            return message.channel.send('Banlı kullanıcılara link ekleme izni yok.');
        }

        const existingLink = links.find(item => item.link === link);
        if (existingLink) {
            return message.channel.send('Bu link zaten eklenmiş.');
        }

        const linkData = { link, userId: message.author.id };
        links.push(linkData);
        await linksCollection.insertOne(linkData);
        message.channel.send(`Link eklendi: ${link}`);

    } else if (command === 'remove-link') {
        if (!allowedGuilds.includes(message.guild.id)) {
            return message.reply('Bu komut bu sunucuda kullanılamaz.');
        }

        const memberRoles = message.member.roles.cache.map(role => role.id);
        if (!allowedRoles.some(role => memberRoles.includes(role))) {
            return message.reply('Bu komutu kullanmak için gerekli yetkiniz yok.');
        }

        const link = args[0];
        if (!link) {
            return message.channel.send('Lütfen silmek için bir link sağlayın.');
        }

        const result = await linksCollection.deleteOne({ link });
        if (result.deletedCount === 0) {
            return message.channel.send('Bu link bulunamadı.');
        }

        links = links.filter(item => item.link !== link);
        message.channel.send(`Link silindi: ${link}`);

    } else if (command === 'ban') {
        if (!allowedGuilds.includes(message.guild.id)) {
            return message.reply('Bu komut bu sunucuda kullanılamaz.');
        }

        const memberRoles = message.member.roles.cache.map(role => role.id);
        if (!allowedRoles.some(role => memberRoles.includes(role))) {
            return message.reply('Bu komutu kullanmak için gerekli yetkiniz yok.');
        }

        const userId = args[0];
        const reason = args.slice(1).join(' ') || 'Sebep belirtilmemiş';

        if (!userId) {
            return message.channel.send('Lütfen banlamak için bir kullanıcı ID\'si sağlayın.');
        }

        await bannedUsersCollection.insertOne({ userId, reason });
        bannedUsers.push({ userId, reason });

        // Banlanan kullanıcının eklediği tüm linkleri sil
        await linksCollection.deleteMany({ userId });
        links = links.filter(link => link.userId !== userId);

        message.guild.members.ban(userId, { reason })
            .then(() => message.channel.send(`Kullanıcı ${userId} bot tarafından banlandı. Sebep: ${reason}`))
            .catch(err => message.channel.send(`Kullanıcı banlanamadı. Hata: ${err}`));

    } else if (command === 'unban') {
        if (!allowedGuilds.includes(message.guild.id)) {
            return message.reply('Bu komut bu sunucuda kullanılamaz.');
        }

        const memberRoles = message.member.roles.cache.map(role => role.id);
        if (!allowedRoles.some(role => memberRoles.includes(role))) {
            return message.reply('Bu komutu kullanmak için gerekli yetkiniz yok.');
        }

        const userId = args[0];
        if (!userId) {
            return message.channel.send('Lütfen banını kaldırmak için bir kullanıcı ID\'si sağlayın.');
        }

        await bannedUsersCollection.deleteOne({ userId });
        bannedUsers = bannedUsers.filter(user => user.userId !== userId);

        message.guild.members.unban(userId)
            .then(() => message.channel.send(`Kullanıcı ${userId}'nin bot tarafından banı kaldırıldı.`))
            .catch(err => message.channel.send(`Kullanıcının banı kaldırılamadı. Hata: ${err}`));

    } else if (command === 'banned-list') {
        if (!allowedGuilds.includes(message.guild.id)) {
            return message.reply('Bu komut bu sunucuda kullanılamaz.');
        }

        const memberRoles = message.member.roles.cache.map(role => role.id);
        if (!allowedRoles.some(role => memberRoles.includes(role))) {
            return message.reply('Bu komutu kullanmak için gerekli yetkiniz yok.');
        }

        if (bannedUsers.length === 0) {
            return message.channel.send('Banlanmış kullanıcı yok.');
        }

        let currentPage = 0;
        const itemsPerPage = 5;
        const totalPages = Math.ceil(bannedUsers.length / itemsPerPage);

        const generateEmbed = (page) => {
            const start = page * itemsPerPage;
            const end = start + itemsPerPage;
            const pageItems = bannedUsers.slice(start, end);

            const embed = new Discord.MessageEmbed()
                .setTitle('Banlanmış Kullanıcılar')
                .setFooter(`Sayfa ${page + 1}/${totalPages}`)
                .setColor('#FF0000');

            pageItems.forEach(({ userId, reason }, index) => {
                embed.addField(`Kullanıcı ${index + 1}`, `ID: ${userId}\nSebep: ${reason}`);
            });

            return embed;
        };

        const messageEmbed = await message.channel.send(generateEmbed(currentPage));

        if (totalPages > 1) {
            await messageEmbed.react('⬅️');
            await messageEmbed.react('➡️');

            const filter = (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && !user.bot;
            const collector = messageEmbed.createReactionCollector(filter, { time: 60000 });

            collector.on('collect', (reaction, user) => {
                reaction.users.remove(user);

                if (reaction.emoji.name === '➡️') {
                    if (currentPage < totalPages - 1) {
                        currentPage++;
                        messageEmbed.edit(generateEmbed(currentPage));
                    }
                } else if (reaction.emoji.name === '⬅️') {
                    if (currentPage > 0) {
                        currentPage--;
                        messageEmbed.edit(generateEmbed(currentPage));
                    }
                }
            });
        }

    } else if (command === 'list-links') {
        if (!allowedGuilds.includes(message.guild.id)) {
            return message.reply('Bu komut bu sunucuda kullanılamaz.');
        }

        const memberRoles = message.member.roles.cache.map(role => role.id);
        if (!allowedRoles.some(role => memberRoles.includes(role))) {
            return message.reply('Bu komutu kullanmak için gerekli yetkiniz yok.');
        }

        if (links.length === 0) {
            return message.channel.send('Eklenmiş link yok.');
        }

        let currentPage = 0;
        const itemsPerPage = 5;
        const totalPages = Math.ceil(links.length / itemsPerPage);

        const generateEmbed = (page) => {
            const start = page * itemsPerPage;
            const end = start + itemsPerPage;
            const pageItems = links.slice(start, end);

            const embed = new Discord.MessageEmbed()
                .setTitle('Eklenen Linkler')
                .setFooter(`Sayfa ${page + 1}/${totalPages}`)
                .setColor('#00FF00');

            pageItems.forEach(({ link, userId }, index) => {
                embed.addField(`Link ${index + 1}`, `URL: ${link}\nEkleyen: ${userId}`);
            });

            return embed;
        };

        const messageEmbed = await message.channel.send(generateEmbed(currentPage));

        if (totalPages > 1) {
            await messageEmbed.react('⬅️');
            await messageEmbed.react('➡️');

            const filter = (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && !user.bot;
            const collector = messageEmbed.createReactionCollector(filter, { time: 60000 });

            collector.on('collect', (reaction, user) => {
                reaction.users.remove(user);

                if (reaction.emoji.name === '➡️') {
                    if (currentPage < totalPages - 1) {
                        currentPage++;
                        messageEmbed.edit(generateEmbed(currentPage));
                    }
                } else if (reaction.emoji.name === '⬅️') {
                    if (currentPage > 0) {
                        currentPage--;
                        messageEmbed.edit(generateEmbed(currentPage));
                    }
                }
            });
        }

    } else if (command === 'bot-info') {
        const botUser = client.user;
        const creationDate = botUser.createdAt;
        const joinDate = message.guild.members.cache.get(botUser.id).joinedAt;

        const totalLinks = links.length;
        let activeLinksCount = 0;

        for (const linkObj of links) {
            try {
                const response = await axios.get(linkObj.link);
                if (response.status === 200) {
                    activeLinksCount++;
                }
            } catch (error) {
                // Aktif olmayan linkleri dikkate almayın
            }
        }

        const embed = new Discord.MessageEmbed()
            .setTitle('Bot Bilgisi')
            .addField('Bot İsmi', botUser.username)
            .addField('Oluşturma Tarihi', creationDate.toDateString())
            .addField('Sunucu Katılma Tarihi', joinDate.toDateString())
            .addField('Eklenen Link Sayısı', totalLinks)
            .addField('Aktif Link Sayısı', activeLinksCount)
            .setColor('#00FF00');

        message.channel.send(embed);
    }
});

async function checkLinks() {
    for (const linkObj of links) {
        try {
            const response = await axios.get(linkObj.link);
            console.log(`Link aktif: ${linkObj.link}, Durum Kodu: ${response.status}`);
        } catch (error) {
            console.log(`Link kontrolünde hata: ${linkObj.link}, Hata: ${error.message}`);
            await linksCollection.deleteOne({ link: linkObj.link });
            links = links.filter(link => link.link !== linkObj.link);
        }
    }
}

client.login(process.env.token);
