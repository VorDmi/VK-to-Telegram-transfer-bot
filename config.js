//Токены
const vktoken = '';
const tgtoken = '';
const uservktoken = '';

//ID профиля ВК владельца бота
const owner = 1;

//ID чата телеграмм(присылается при приглашении в беседу)
const chatId = -1;
//ID чата вконтакте
const vk = 2000000000;

//Отправка всех сообщений
const msgTGtoVK = true;
const msgVKtoTG = true;

module.exports = {
    chatId, vk,
    owner,
    msgTGtoVK, msgVKtoTG,
    vktoken, tgtoken, uservktoken
}
