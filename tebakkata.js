const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const words = [
    "programming",
    "javascript",
    "discord",
    "bot",
    "tebak",
    "kata",
    "developer",
    "kucing",
    "anjing",
    "gajah",
    "singa",
    "kuda",
    "ayam",
    "sapi",
    "kambing",
    "kelinci",
    "rumah",
    "gedung",
    "jembatan",
    "masjid",
    "gereja",
    "sekolah",
    "rumahsakit",
    "kantor",
    "taman",
    "mall",
];

// Path file JSON untuk menyimpan skor
const scoresFilePath = path.resolve(__dirname, 'scores.json');

// Membaca skor dari file JSON
function readScores() {
    if (!fs.existsSync(scoresFilePath)) {
        fs.writeFileSync(scoresFilePath, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(scoresFilePath, 'utf8'));
}

// Menulis skor ke file JSON
function writeScores(scores) {
    fs.writeFileSync(scoresFilePath, JSON.stringify(scores, null, 2));
}

function startGame(message) {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const scrambledWord = randomWord.split('').sort(() => Math.random() - 0.5).join('');

    message.channel.send(`**Tebak Kata!** Susunan huruf: \`${scrambledWord}\``);

    const filter = (msg) => msg.author.id === message.author.id;
    const collector = message.channel.createMessageCollector({ filter, time: 60000 });

    collector.on('collect', (msg) => {
        if (msg.content.toLowerCase() === randomWord) {
            const scores = readScores();
            const userId = msg.author.id;

            // Update skor
            scores[userId] = (scores[userId] || 0) + 1;
            writeScores(scores);

            const embedBenar = new EmbedBuilder()
                .setTitle("🎉 Jawaban Benar!")
                .setDescription(`Kata: \`${randomWord}\`\nSkor Total Anda: **${scores[userId]}**`)
                .setColor("#00FF00");

            message.channel.send({ embeds: [embedBenar] });
            collector.stop();
        } else {
            const embedSalah = new EmbedBuilder()
                .setTitle("❌ Jawaban Salah!")
                .setDescription("Coba lagi!")
                .setColor("#FF0000");

            message.channel.send({ embeds: [embedSalah] });
        }
    });

    collector.on('end', (collected, reason) => {
        if (reason === 'time') {
            const embedTimeout = new EmbedBuilder()
                .setTitle("⏰ Waktu Habis!")
                .setDescription(`Kata yang benar adalah: \`${randomWord}\``)
                .setColor("#FFFF00");

            message.channel.send({ embeds: [embedTimeout] });
        }
    });
}

function showScore(message) {
    const scores = readScores();
    const userScore = scores[message.author.id] || 0;

    const embedScore = new EmbedBuilder()
        .setTitle("🏆 Skor Anda")
        .setDescription(`Skor Total Anda saat ini adalah: **${userScore}**`)
        .setColor("#0000FF");

    message.channel.send({ embeds: [embedScore] });
}

function showLeaderboard(message) {
    const scores = readScores();
    const sortedScores = Object.entries(scores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

    const leaderboard = sortedScores.map(([userId, score], index) => {
        return `**${index + 1}. <@${userId}>** - ${score} poin`;
    }).join('\n');

    const embedLeaderboard = new EmbedBuilder()
        .setTitle("🌟 Leaderboard Tebak Kata")
        .setDescription(leaderboard || "Belum ada skor yang tercatat.")
        .setColor("#FFD700");

    message.channel.send({ embeds: [embedLeaderboard] });
}

module.exports = { startGame, showScore, showLeaderboard };
