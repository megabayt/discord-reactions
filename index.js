const axios = require('axios');
const credentials = require('./credentials.json');

(async () => {
  const transport = axios.create({
    withCredentials: true
  });

  const cookieResult = await transport.post('https://discordapp.com/api/v6/auth/login', {
    ...credentials,
    captcha_key: null,
    gift_code_sku_id: null,
    login_source: null,
    undelete: false,
  });

  transport.defaults.headers.common = {
    ...transport.defaults.headers.common,
    'cookie': cookieResult.headers['set-cookie'],
    'authorization':  cookieResult.data.token,
  };

  // all channels
  const channels = [
    '557518630120849419',
    '504307067495120898',
    '572785157510004736',
    '611859164066480141',
    '504312576038010903',
    '504312400703389696',
    '519831694753267712',
    '656825308942565376',
    '646369996183961650',
    '504312443665907732',
    '557227522866151445',
    '537950877730734089',
    '512253920492519425',
    '616579539287670804',
    '511536251749531658',
  ];

  const processMessage = async (channel, message) => {
    const letkoId = '526700533264809995';
    const prideFlag = '%F0%9F%8F%B3%EF%B8%8F%E2%80%8D%F0%9F%8C%88';
    if (message.author.id === letkoId) {
      await transport.put(`https://discordapp.com/api/v6/channels/${channel}/messages/${message.id}/reactions/${prideFlag}/%40me`);
    }
  }

  const processChannel = async (channel, result) => {
    const messages = result.data && result.data.length ? result.data : [];
    for(let message of messages) {
      if (message.reactions && message.reactions.some(item => item.me)) {
        continue;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      await processMessage(channel, message);
    }
    if (messages.length) {
      const before = messages[messages.length - 1].id;
      const newResultChannel = await transport.get(`https://discordapp.com/api/v6/channels/${channel}/messages?before=${before}&limit=50`)
      if (newResultChannel.data && newResultChannel.data.length) {
        await processChannel(channel, newResultChannel);
      }
    }
  };

  for(let channel of channels) {
    const resultChannel = await transport.get(`https://discordapp.com/api/v6/channels/${channel}/messages?limit=50`);
    await processChannel(channel, resultChannel);
  }
})();
