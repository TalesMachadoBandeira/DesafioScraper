require('dotenv').config();
const nodemailer = require('nodemailer');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

// Função para buscar os animes
async function getAnimes() {
  const url = 'https://myanimelist.net/topanime.php';
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Connection': 'keep-alive',
    }
  });
  const html = await response.text();
  const $ = cheerio.load(html);
  const animes = [];
  $('.ranking-list').each(function () {
    const rank = $(this).find('.rank').text().trim();
    const title = $(this).find('.anime_ranking_h3 a').text().trim() || $(this).find('.title h3').text().trim();
    const info = $(this).find('.information').text().trim();
    const score = $(this).find('.score').text().trim();
    if (rank && title && info && score) {
      animes.push({ rank, title, info, score });
    }
  });
  return animes;
}

// Criação do transportador de e-mail
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Função para enviar o e-mail
async function sendEmail() {
  try {
    const animes = await getAnimes();
    
    // Formata o texto do e-mail
    let textContent = 'Lista de Animes do MyAnimeList:\n\n';
    animes.forEach(anime => {
      textContent += `${anime.rank}. ${anime.title}\n`;
      textContent += `Score: ${anime.score}\n`;
      textContent += `Info: ${anime.info}\n\n`;
    });

    // Formata o HTML do e-mail
    let htmlContent = `
      <h1>Lista de Animes do MyAnimeList</h1>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background-color: #f2f2f2;">
          <th style="padding: 8px; border: 1px solid #ddd;">Rank</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Título</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Score</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Informações</th>
        </tr>
    `;

    animes.forEach(anime => {
      htmlContent += `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${anime.rank}</td>
          <td style="padding: 8px; border: 1px solid #ddd;"><b>${anime.title}</b></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${anime.score}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${anime.info}</td>
        </tr>
      `;
    });

    htmlContent += '</table>';

    const info = await transporter.sendMail({
      from: `"Otaquinho Fedido" <${process.env.EMAIL_USER}>`,
      to: 'talesmachadob6@hotmail.com',
      subject: 'Top 50 Animes do MyAnimeList',
      text: textContent,
      html: htmlContent,
    });

    console.log('E-mail enviado com sucesso!');
    console.log('ID da mensagem:', info.messageId);
  } catch (error) {
    console.error('Erro ao enviar o e-mail:', error);
  }
}

// Executa o envio do e-mail
sendEmail();
