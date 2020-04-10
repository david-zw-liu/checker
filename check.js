const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const axios = require('axios').default;

const recordsPath = path.join(__dirname, 'records');
const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath).toString());
const { chatId, sendMessageUrl, detections } = config;

detections.forEach((detection) => {
  const { name, url, selector } = detection;
  const recordPath = path.join(recordsPath, `${name}.html`);
  let oldHtml = null;

  try {
    if (fs.existsSync(recordPath)) {
      oldHtml = fs.readFileSync(recordPath).toString();
    }
  } catch(err) { }

  axios.get(url).then(function (response) {
    const page = response.data;
    const $ = cheerio.load(page);
    const newHtml = $(selector).html();

    if (oldHtml === null) {
      console.log(`「${name}」寫入初始紀錄`);
    } else if (oldHtml !== newHtml) {
      axios.post(sendMessageUrl, { text: `發現「${name}」內容有變更，請至 ${url} 查看`, chat_id: chatId });
    }

    fs.writeFileSync(recordPath, newHtml);
  })
});
