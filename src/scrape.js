import axios from 'axios';
import { load } from 'cheerio';

// move to node process? PHPSESSOD
const AUTH_COOKIE = '';

const ME = 'Howkins, Luke';

export async function loadSite(url) {
  const { data } = await axios.get(url, {
    headers: {
      Cookie: `PHPSESSID=${AUTH_COOKIE}`,
    },
  });
  return load(data);
}

export const getCompetitors = ($, myBoxNumber) => {
  if (!$) throw new Error('$ not loaded');
  let competitors = [];
  $('table th').each((idx, th) => {
    if (idx === myBoxNumber) {
      const table = $(th).parentsUntil('table');
      table.find('tbody tr').each((idx2, tr) => {
        $(tr)
          .find('td')
          .each((idx3, td) => {
            if (idx3 === 1) {
              const text = $(td).text();
              if (text) competitors.push(text);
            }
          });
      });
    }
  });

  return competitors
    .map((competitor) => {
      const [name, rest] = competitor.split('E-mail:');
      const [email, phone] = rest.split('Phone:');
      return {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      };
    })
    .filter((competitor) => competitor.name !== ME);
};

export const getPlayerResults = ($, name) => {
  if (!$) throw new Error('$ not loaded');
  let td;
  $(`td`).each((idx, el) => {
    if ($(el).text().includes(name)) td = $(el);
  });
  if (!td) return 'Not in league';
  const tr = td.parent();
  const table = tr.parent();
  const box = table.find('th').text().toLowerCase().replace('box', '').trim();
  const points = tr.find('td:last-child').text();
  const notPlayed = tr.text().toLowerCase().split('unset').length - 1;
  let scores = [];
  table.find('tr').each((idx, body) => {
    const score = $(body).find('td:last-child').text();
    if (score && !isNaN(+score)) scores.push(+score);
  });
  scores = scores.sort((a, b) => +b - +a);
  const position = scores.findIndex((s) => s == points) + 1;

  return {
    box: +box,
    points: +points,
    notPlayed,
    position: `${position}/${scores.length}`,
  };
};
