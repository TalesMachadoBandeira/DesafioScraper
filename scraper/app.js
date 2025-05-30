const fetch = require('node-fetch'); // Para buscar dados da URL
const cheerio = require('cheerio'); // Para manipular e buscar dados no HTML

const url = 'https://myanimelist.net/topanime.php';

async function fetchData() {
    try {
        // Faz a requisição da página
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

        // Seleciona cada bloco de anime
        $('.ranking-list').each(function() {
            const rank = $(this).find('.rank').text().trim();
            const title = $(this).find('.anime_ranking_h3 a').text().trim() || $(this).find('.title h3').text().trim();
            const info = $(this).find('.information').text().trim();
            const score = $(this).find('.score').text().trim();

            if (rank && title && info && score) {
                animes.push({
                    rank,
                    title,
                    info,
                    score
                });
            }
        });

        // Exibe os dados no console
        console.log(animes);
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
    }
}

// Executa a função
fetchData();
