const AWS = require('aws-sdk');
const rp = require('request-promise');
const LINE = require('@line/bot-sdk');

//const { replySingerContent } = require('./functions/replySingerContent.js');

exports.handler = async function(event, context, callback) {
  const serverIP = process.env["serverIP"];
  const channelAccessToken = process.env["channelAccessToken"];
  const LINE_CLIENT = new LINE.Client({channelAccessToken: channelAccessToken});

  let response = { statusCode: 200 };
  var replyMessage = [];

  if(event.events[0].message.type === "text"){
    var requestMsg = event.events[0].message.text;
    var options = {
      method: 'POST',
      uri: 'http://' + serverIP + "/api/v1/admin_bot/get_listened_song_count",
      form: {
        twitter_name: requestMsg
      },
    };
    await rp(options).then( data => {
      if(data.length === 0){
        replyMessage.push({ 'type': 'text', 'text': "twitterのIDを入力してください(@はいりません)" });
        return "";
      }

      var text = "";
      for(var i in data){
        text += `${data[i]["song_name"]} >> ${data[i]["count"]}回\n`
      }
      replyMessage.push({ 'type': 'text', 'text': text });
    })

    replyMessage.push({ 'type': 'text', 'text': "テキストメッセージを入力してください。" });
  } else {
    replyMessage.push({ 'type': 'text', 'text': "テキストメッセージを入力してください。" });
  }

  // Botにメッセージをリプライ
  await LINE_CLIENT.replyMessage(event.events[0].replyToken, replyMessage);

  return response;
};

