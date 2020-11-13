const TelegramBot = require('node-telegram-bot-api');	
const { VK } = require('vk-io');	
const config = require('./config');	
const bot = new TelegramBot(config.tgtoken, { polling: true });	
const vk = new VK({ token: config.vktoken });	


const telegram = (text, params) => {	
    return bot.sendMessage(config.chatId, `${text}`, params);	
}	

async function msgTGtoVK(context) {	
    await vk.api.messages.send({	
        peer_id: config.vk,	
        user_id: Number(config.owner),	
        message: `${context.from.username} ${context.text}`	
    });	
}	

async function msgVKtoTG(context) {	
    telegram(`${(await vk.api.users.get({ user_ids: context.senderId }))[0].first_name} ${(await vk.api.users.get({ user_ids: context.senderId }))[0].last_name}: ${context.text}`);	
}	

async function photoVKtoTG(context) {
    const vk = new VK({ token: config.uservktoken });

    let url = await vk.api.photos.getById({
        photos: context.attachments[0].ownerId+"_"+context.attachments[0].id
    });
    
    return bot.sendPhoto(config.chatId, url[0].sizes[url[0].sizes.length - 1].url);
    
}

async function videoVKtoTG(context) {
    const vk = new VK({ token: config.uservktoken });

    let url = await vk.api.video.get({
        videos: context.attachments[0].ownerId +"_" +context.attachments[0].id
    });

    return bot.sendVideo(config.chatId, url.items[0].files.mp4_240);
}

async function checkEventsTG(context) {	
    const initiator = context.from.username;	

    if (context.new_chat_title !== undefined) {	
        return vk.api.messages.send({	
            peer_id: config.vk,	
            message: `*** ${initiator} изменил(а) название беседы на ${context.new_chat_title} ***`	
        });	
    } else return;	
}	

async function checkEventsVK(context) {	
    let event = context.eventType;	
    const initiator = (await vk.api.users.get({ user_ids: context.senderId }))[0].first_name + " " + (await vk.api.users.get({ user_ids: context.senderId }))[0].last_name;	
    let external = null;	
    if (context.eventMemberId !== null) {	
        external = (await vk.api.users.get({ user_ids: Number(context.eventMemberId) }))[0].first_name + " " + (await vk.api.users.get({ user_ids: Number(context.eventMemberId) }))[0].last_name;	
    }	

    if (event == "chat_title_update") {	
        return telegram(`*** ${initiator} изменил(а) название беседы на ${context.eventText} ***`);	
    } else if (event == 'chat_invite_user') {	
        return telegram(`*** ${initiator} пригласил(а) в беседу ${external} ***`);	
    } else if (event == 'chat_kick_user') {	
        return telegram(`*** ${initiator} выгнал(а) из беседы ${external} ***`);	
    } else if (event == 'chat_photo_update') {	
        return telegram(`*** ${initiator} обновил(а) фотографию беседы ***`);	
    } else if (event == 'chat_photo_remove') {	
        return telegram(`*** ${initiator} удалил(а) фотографию беседы ***`);	
    } else if (event == 'chat_create') {	
        return telegram(`*** Создана беседа ${context.eventText} ***`);	
    } else return;	
}	

bot.on('message', async (context) => {	
    if (context.group_chat_created == true) return telegram(`ID для связи с беседой VK: ${config.vk}`);	
    if (context.text == undefined) return checkEventsTG(context);	
    if (config.msgTGtoVK) return msgTGtoVK(context);	
});	

vk.updates.on('message', async (context) => {	
    if (context.senderId < 1 || context.isOutbox) return;
    if (context.attachments.length > 0 && context.attachments[0].type == "video") return videoVKtoTG(context);
    if (context.attachments.length > 0 && context.attachments[0].type == "photo") return photoVKtoTG(context);
    if (context.eventType !== null) return checkEventsVK(context);
    if (config.msgVKtoTG) return msgVKtoTG(context);
});	

vk.updates.startPolling();
