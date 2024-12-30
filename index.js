const { 
    Client, 
    GatewayIntentBits, 
    PermissionsBitField, 
    EmbedBuilder, 
    SlashCommandBuilder, 
    REST, 
    Routes 
} = require('discord.js');

const fs = require('fs')

const REPS_FILE = './reputation.json'

const { startGame, showScore, showLeaderboard } = require('./tebakkata');

// Fungsi untuk memuat data dari file
const loadReputation = () => {
    if (!fs.existsSync(REPS_FILE)) {
        fs.writeFileSync(REPS_FILE, JSON.stringify({}));
    }
    const data = fs.readFileSync(REPS_FILE);
    return JSON.parse(data);
};

// Fungsi untuk menyimpan data ke file
const saveReputation = (data) => {
    fs.writeFileSync(REPS_FILE, JSON.stringify(data, null, 2));
};

// Data reputasi diambil dari file
let reputation = loadReputation();

// Fungsi untuk menambahkan reputasi
const addReputation = (userId, giverId, reason) => {
    if (!reputation[userId]) {
        reputation[userId] = [];
    }
    reputation[userId].push({ giver: giverId, reason });
    saveReputation(reputation); // Simpan ke file
};

// Fungsi untuk mendapatkan jumlah reputasi
const getReputation = (userId) => {
    return reputation[userId] ? reputation[userId].length : 0;
};

// Token bot dan ID
const TOKEN = 'MTMyMDYwODg2OTEwMTIxMTc0MA.GjUHU_.Sa_QqqfXbCWEmHmmqY6-C8XDg3VaTGgHjpD6wM';
const CLIENT_ID = '1320608869101211740';
const GUILD_ID = '1319888976152105010';

const OWNER_PROFILE = {
    name: 'Dendra De Tama',
    // description: 'Jawir Negro Suki Jomok',
    avatar: 'https://i.pinimg.com/736x/a9/59/87/a959873184a5986c44c1426c668a8846.jpg' // Ganti dengan URL avatar Anda
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Daftar kata-kata kasar
const bannedWords = ['KONTOL', 'memek', 'kontol', 'MEMEK', 'PEPEK', 'pepek'];

// Daftar slash commands
const commands = [
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Menampilkan daftar perintah bot ini.')
,
    new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Mengeluarkan pengguna dari server.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('Pengguna yang akan di-kick')
                .setRequired(true))
,
    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Memblokir pengguna dari server.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('Pengguna yang akan di-ban')
                .setRequired(true))
,
    new SlashCommandBuilder()
        .setName('pay')
        .setDescription('Menampilkan metode pembayaran.')
,
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Menampilkan informasi ping, uptime, dan profil bot.')
,
    new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Memberikan timeout kepada pengguna.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('Pengguna yang akan diberi timeout')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('time')
                .setDescription('Durasi timeout')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('unit')
                .setDescription('Satuan waktu (detik, menit, jam)')
                .setRequired(true)
                .addChoices(
                    { name: 'detik', value: 's' },
                    { name: 'menit', value: 'm' },
                    { name: 'jam', value: 'h' }
        ))
,
    new SlashCommandBuilder()
        .setName('addrole')
        .setDescription('Menambahkan role ke pengguna.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('Pengguna yang akan diberikan role')
                .setRequired(true))
        .addRoleOption(option => 
            option.setName('role')
                .setDescription('Role yang akan ditambahkan')
                .setRequired(true))
,
    new SlashCommandBuilder()
        .setName('removerole')
        .setDescription('Menghapus role dari pengguna.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('Pengguna yang role-nya akan dihapus')
                .setRequired(true))
        .addRoleOption(option => 
            option.setName('role')
                .setDescription('Role yang akan dihapus')
                .setRequired(true))
,
    new SlashCommandBuilder()
        .setName('setnickname')
        .setDescription('Mengganti nama panggilan pengguna.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('Pengguna yang nama panggilannya akan diganti')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('nickname')
                .setDescription('Nama panggilan baru')
                .setRequired(true))
,
    new SlashCommandBuilder()
        .setName('deletetext')
        .setDescription('Menghapus sejumlah pesan di atasnya.')
        .addIntegerOption(option =>
            option.setName('jumlah')
                .setDescription('Jumlah pesan yang ingin dihapus (max: 100)')
                .setRequired(true))
];

// Event untuk menangani pesan
client.on('messageCreate', (message) => {
    // Jangan memproses pesan dari bot
    if (message.author.bot) return;

    const args = message.content.trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // ID channel yang diperbolehkan
    const allowedChannelId = '1319900099546972190'; // Ganti dengan ID channel yang diizinkan

    if (command === '+reps') {
        // Cek apakah command dijalankan di channel yang diizinkan
        if (message.channel.id !== allowedChannelId) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000') // Warna merah
                .setTitle('❌ Gagal Menggunakan Perintah')
                .setDescription('Perintah `+reps` hanya dapat digunakan di <#1319900099546972190>')
                .setFooter({ text: 'Perintah reputasi' })
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });
        }

    // Ambil user yang disebutkan
    const user = message.mentions.users.first();
    const reason = args.slice(1).join(' ');

    if (!user) {
        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Gagal Memberikan Reputasi')
            .setDescription('Anda harus menyebutkan pengguna untuk memberikan reputasi.')
            .setFooter({ text: 'Perintah reputasi' })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    if (!reason) {
        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Gagal Memberikan Reputasi')
            .setDescription('Anda harus memberikan alasan untuk reputasi.')
            .setFooter({ text: 'Perintah reputasi' })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    // Tambahkan reputasi
    addReputation(user.id);

    const embed = new EmbedBuilder()
        .setColor('#00FF00') // Warna hijau
        .setTitle('✅ Reputasi Ditambahkan')
        .addFields(
            { name: 'Pengguna yang diberi reputasi', value: `<@${user.id}>`, inline: true },
            { name: 'Diberikan oleh', value: `<@${message.author.id}>`, inline: true },
            { name: 'Alasan', value: reason, inline: false }
        )
        .setFooter({ text: `Reputasi total sekarang: ${getReputation(user.id)}` })
        .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }

    // Fungsi untuk melihat total reputasi
    if (command === '?reps') {
        const user = message.mentions.users.first() || message.author;
        const totalReps = getReputation(user.id);

        // Buat embed untuk total reputasi
        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('📊 Total Reputasi')
            .addFields(
                { name: 'Pengguna', value: `<@${user.id}>`, inline: true },
                { name: 'Total Reputasi', value: `${totalReps}`, inline: true }
            )
            .setFooter({ text: 'Perintah reputasi' })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }

    if (message.content === '.tebak') {
        startGame(message);
    } else if (message.content === '.skor') {
        showScore(message);
    } else if (message.content === '.leaderboard') {
        showLeaderboard(message);
    }

});


// Deploy commands
const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
    try {
        console.log('Memperbarui slash commands...');
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
            body: commands.map(command => command.toJSON())
        });
        console.log('Slash commands berhasil diperbarui.');
    } catch (error) {
        console.error('Gagal memperbarui slash commands:', error);
    }
})();

// Ketika bot siap
client.once('ready', () => {
    console.log(`✅ Bot ${client.user.tag} telah online dan siap digunakan!`);
    // Set status bot
    client.user.setPresence({
        activities: [
            {
                name: 'Dezaa Store', // Mengubah nama aktivitas
                type: 'PLAYING', // Jenis aktivitas: PLAYING, STREAMING, LISTENING, WATCHING
            },
        ],
        status: 'online', // Status bot: online, idle, dnd (Do Not Disturb), invisible
    });
    console.log(`🎮 Status bot telah diatur: PLAYING Dezaa Store.`);
});

// Sistem Moderasi Otomatis
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const containsBannedWord = bannedWords.some(word =>
        message.content.toLowerCase().includes(word)
    );

    if (containsBannedWord) {
        await message.delete();
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('Pesan Dihapus')
            .setDescription(`${message.author} Kebanyakan Toxic ku ban kau ya`);
        message.channel.send({ embeds: [embed] });
    }
});

client.on('messageCreate', (message) => {
    // Deteksi teks "price" dalam pesan
    if (message.content.toLowerCase().includes('harganitro')) {
        // Kirim pesan dengan format yang diminta
        const priceList = `
        # <a:live:1320721203777765456> PRICE LIST NITRO & BOOST SERVER <a:live:1320721203777765456>
        <a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648>
        > **<a:NITROBASIC:1320433677104054333> Nitro Basic 1 Mount/Bulan = 25K 
        > <a:NITROBASIC:1320433677104054333> Nitro Basic 1 Year = 275K
        > <a:NITROBOOST:1320433732208951358> Nitro Boost 1 Mount/Bulan = 75K 
        > <a:NITROBOOST:1320433732208951358> Nitro Boost 1 Year = 800K**
        <a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648>
        > **<a:nitro:1320443737502912522> 2x   Boost 1 Mount = 7K
        > <a:nitro:1320443737502912522> 8x   Boost 1 Mount = 35K
        > <a:nitro:1320443737502912522> 14x Boost 1 Mount = 40K
        > <a:nitro:1320443737502912522> 14x Boost 3 Mount = 85K**
        <a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648><a:rgb:1320721179606253648>
                `;
        message.channel.send(priceList);
    }

    if (message.content.toLowerCase().includes('nbasic1b')) {
        // Ganti 'ROLE_ID_BUYER_NITRO' dengan ID dari role "Buyer Nitro"
        const buyerRoleId = '1319969323791679559';
        
        // Kirim pesan dengan format yang diminta
        const NITROBASIC1BULAN = {
            content: `<@&${buyerRoleId}>`, // Mention role "Buyer Nitro"
            embeds: [
                {
                    title: "Terima Kasih!",
                    description: `Terima kasih sudah order! Jangan lupa untuk memberikan reputasi dengan mengetik:`,
                    fields: [
                        {
                            name: "Cara Memberikan Reputasi",
                            value: "`+reps @dezaaqt NITRO BASIC 1 BULAN`",
                        },
                    ],
                    color: 0x00ff00, // Warna hijau
                    footer: {
                        text: "Thanks You",
                    },
                },
            ],
        };
    
        message.channel.send(NITROBASIC1BULAN);
    }

    if (message.content.toLowerCase().includes('nboost1b')) {
        // Ganti 'ROLE_ID_BUYER_NITRO' dengan ID dari role "Buyer Nitro"
        const buyerRoleId = '1319969323791679559';
        
        // Kirim pesan dengan format yang diminta
        const NITROBASIC1BULAN = {
            content: `<@&${buyerRoleId}>`, // Mention role "Buyer Nitro"
            embeds: [
                {
                    title: "Terima Kasih!",
                    description: `Terima kasih sudah order! Jangan lupa untuk memberikan reputasi dengan mengetik:`,
                    fields: [
                        {
                            name: "Cara Memberikan Reputasi",
                            value: "`+reps @dezaaqt NITRO BOOST 1 BULAN`",
                        },
                    ],
                    color: 0x00ff00, // Warna hijau
                    footer: {
                        text: "Thanks You",
                    },
                },
            ],
        };
    
        message.channel.send(NITROBASIC1BULAN);
    }

    if (message.content.toLowerCase().includes('sboost2x')) {
        // Ganti 'ROLE_ID_BUYER_NITRO' dengan ID dari role "Buyer Nitro"
        const buyerRoleId = '1319969323791679559';
        
        // Kirim pesan dengan format yang diminta
        const NITROBASIC1BULAN = {
            content: `<@&${buyerRoleId}>`, // Mention role "Buyer Nitro"
            embeds: [
                {
                    title: "Terima Kasih!",
                    description: `Terima kasih sudah order! Jangan lupa untuk memberikan reputasi dengan mengetik:`,
                    fields: [
                        {
                            name: "Cara Memberikan Reputasi",
                            value: "`+reps @dezaaqt SERVER BOOST 2X`",
                        },
                    ],
                    color: 0x00ff00, // Warna hijau
                    footer: {
                        text: "Thanks You",
                    },
                },
            ],
        };
    
        message.channel.send(NITROBASIC1BULAN);
    }
    
    if (message.content.toLowerCase().includes('sboost8x')) {
        // Ganti 'ROLE_ID_BUYER_NITRO' dengan ID dari role "Buyer Nitro"
        const buyerRoleId = '1319969323791679559';
        
        // Kirim pesan dengan format yang diminta
        const NITROBASIC1BULAN = {
            content: `<@&${buyerRoleId}>`, // Mention role "Buyer Nitro"
            embeds: [
                {
                    title: "Terima Kasih!",
                    description: `Terima kasih sudah order! Jangan lupa untuk memberikan reputasi dengan mengetik:`,
                    fields: [
                        {
                            name: "Cara Memberikan Reputasi",
                            value: "`+reps @dezaaqt SERVER BOOST 8X`",
                        },
                    ],
                    color: 0x00ff00, // Warna hijau
                    footer: {
                        text: "Thanks You",
                    },
                },
            ],
        };
    
        message.channel.send(NITROBASIC1BULAN);
    }

    if (message.content.toLowerCase().includes('sboost14x')) {
        // Ganti 'ROLE_ID_BUYER_NITRO' dengan ID dari role "Buyer Nitro"
        const buyerRoleId = '1319969323791679559';
        
        // Kirim pesan dengan format yang diminta
        const NITROBASIC1BULAN = {
            content: `<@&${buyerRoleId}>`, // Mention role "Buyer Nitro"
            embeds: [
                {
                    title: "Terima Kasih!",
                    description: `Terima kasih sudah order! Jangan lupa untuk memberikan reputasi dengan mengetik:`,
                    fields: [
                        {
                            name: "Cara Memberikan Reputasi",
                            value: "`+reps @dezaaqt SERVER BOOST 14X`",
                        },
                    ],
                    color: 0x00ff00, // Warna hijau
                    footer: {
                        text: "Thanks You",
                    },
                },
            ],
        };
    
        message.channel.send(NITROBASIC1BULAN);
    }    
    
});

// Handle interaksi slash command
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    // Help Comand
    if (commandName === 'help') {
        const helpEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Daftar Perintah Bot')
            .setDescription('Berikut adalah daftar perintah yang tersedia untuk bot ini:')
            .addFields(
                { name: 'Kick', value: '/kick @user' },
                { name: 'Ban', value: '/ban @user' },
                { name: 'Pay', value: '/pay' },
                { name: 'Ping', value: '/ping' },
                { name: 'Timeout', value: '/timeout @user' },
                { name: 'AddRole', value: '/addrole @user role' },
                { name: 'RemoveRole', value: '/removerole @user role' },
                { name: 'SetNickname', value: '/setnickname @user nickname' },
                { name: 'deletetext', value: '/deletetext <jumlah>' }
            );
        await interaction.reply({ embeds: [helpEmbed] });
    }

    // Ping Comand
    if (commandName === 'ping') {
        const ping = Math.round(client.ws.ping);
        const uptime = process.uptime();

        const days = Math.floor(uptime / (24 * 60 * 60));
        const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((uptime % (60 * 60)) / 60);
        const seconds = Math.floor(uptime % 60);

        const botProfileEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('Informasi Bot')
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { name: 'Ping', value: `${ping} ms`, inline: true },
                { name: 'Uptime', value: `${days} hari, ${hours} jam, ${minutes} menit, ${seconds} detik`, inline: true },
                { name: 'Nama Bot', value: client.user.username, inline: true },
                { name: 'Pemilik Bot', value: `${OWNER_PROFILE.name}`, inline: true }
            )
            .setImage(OWNER_PROFILE.avatar);

        await interaction.reply({ embeds: [botProfileEmbed] });
    }

    // Kick Comand
    if (commandName === 'kick') {
        const member = options.getMember('target');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Akses Ditolak')
                .setDescription('Anda tidak memiliki izin untuk melakukan ini!');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (!member) {
            return interaction.reply({ content: 'Pengguna tidak ditemukan.', ephemeral: true });
        }

        await member.kick();
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('Pengguna Dikeluarkan')
            .setDescription(`${member.user.tag} telah di-kick.`);
        await interaction.reply({ embeds: [embed] });
    }

    // Kick Comand
    if (commandName === 'ban') {
        const member = options.getMember('target');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Akses Ditolak')
                .setDescription('Anda tidak memiliki izin untuk melakukan ini!');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (!member) {
            return interaction.reply({ content: 'Pengguna tidak ditemukan.', ephemeral: true });
        }

        await member.ban();
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('Pengguna Diblokir')
            .setDescription(`${member.user.tag} telah di-ban.`);
        await interaction.reply({ embeds: [embed] });
    }

    // Pay Comand
    if (commandName === 'pay') {
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('Metode Pembayaran')
            // .setDescription('Silakan pilih metode pembayaran yang tersedia:')
            .addFields(
                { name: 'Dana <:Dana:1320308145603612712> ', value: '081239021528' },
                { name: 'Gopay <:Gopay:1320306645540016231> ', value: '081239021528' },
                { name: 'Paypal <:paypal:1320956125994156072> ', value: '081239021528' },
                { name: 'Qris <:qris:1320296143321825311> ', value: 'Silahkan scan QR Code di bawah ini' },
            )
            .setImage('https://i.pinimg.com/736x/a9/59/87/a959873184a5986c44c1426c668a8846.jpg'); // Ganti dengan URL gambar QRIS Anda

        await interaction.reply({ embeds: [embed] });
    }

    // Timeout Comand
    if (commandName === 'timeout') {
        const target = options.getUser('target');
        const time = options.getInteger('time');
        const unit = options.getString('unit');

        let timeoutDuration;
        if (unit === 's') {
            timeoutDuration = time * 1000; // detik
        } else if (unit === 'm') {
            timeoutDuration = time * 60 * 1000; // menit
        } else if (unit === 'h') {
            timeoutDuration = time * 60 * 60 * 1000; // jam
        }

        const member = await interaction.guild.members.fetch(target.id);
        await member.timeout(timeoutDuration, `Diberi timeout selama ${time} ${unit}`);

        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('Pengguna Diberikan Timeout')
            .setDescription(`${target.tag} telah diberikan timeout selama ${time} ${unit}.`);
        await interaction.reply({ embeds: [embed] });
    }

    // AddRole Comand
    if (commandName === 'addrole') {
        const member = options.getMember('target');
        const role = options.getRole('role');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Akses Ditolak')
                .setDescription('Anda tidak memiliki izin untuk menambahkan role!');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (!member || !role) {
            return interaction.reply({ content: 'Pengguna atau role tidak ditemukan.', ephemeral: true });
        }

        await member.roles.add(role);
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('Role Ditambahkan')
            .setDescription(`Role ${role.name} telah ditambahkan ke ${member.user.tag}.`);
        await interaction.reply({ embeds: [embed] });
    }

    // RemoveRole Comand
    if (commandName === 'removerole') {
        const member = options.getMember('target');
        const role = options.getRole('role');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Akses Ditolak')
                .setDescription('Anda tidak memiliki izin untuk menghapus role!');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (!member || !role) {
            return interaction.reply({ content: 'Pengguna atau role tidak ditemukan.', ephemeral: true });
        }

        await member.roles.remove(role);
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('Role Dihapus')
            .setDescription(`Role ${role.name} telah dihapus dari ${member.user.tag}.`);
        await interaction.reply({ embeds: [embed] });
    }

    // SetNickName Comand
    if (commandName === 'setnickname') {
        const member = options.getMember('target');
        const nickname = options.getString('nickname');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Akses Ditolak')
                .setDescription('Anda tidak memiliki izin untuk mengganti nama panggilan!');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (!member) {
            return interaction.reply({ content: 'Pengguna tidak ditemukan.', ephemeral: true });
        }

        try {
            await member.setNickname(nickname);
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('Nama Panggilan Diperbarui')
                .setDescription(`${member.user.tag} sekarang memiliki nama panggilan ${nickname}.`);
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Terjadi Kesalahan')
                .setDescription('Gagal mengganti nama panggilan pengguna.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }

    if (commandName === 'deletetext') {
        const jumlah = interaction.options.getInteger('jumlah');

        if (jumlah <= 0 || jumlah > 100) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Gagal Menghapus Pesan')
                .setDescription('Anda hanya dapat menghapus 1 hingga 100 pesan.')
                .setTimestamp();

            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        try {
            // Hapus pesan
            const deletedMessages = await interaction.channel.bulkDelete(jumlah, true);

            // Embed untuk konfirmasi penghapusan
            const successEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Berhasil Menghapus Pesan')
                .setDescription(`Berhasil menghapus **${deletedMessages.size} pesan**.`)
                .setTimestamp();

            return interaction.reply({ embeds: [successEmbed], ephemeral: true });
        } catch (error) {
            console.error(error);

            // Embed untuk error
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Gagal Menghapus Pesan')
                .setDescription('Terjadi kesalahan saat mencoba menghapus pesan. Pastikan bot memiliki izin yang diperlukan.')
                .setTimestamp();

            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
});

client.login(TOKEN);
