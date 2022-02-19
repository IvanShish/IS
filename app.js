const Agent = require('./agent') // Импорт агента
const VERSION = 7 // Версия сервера
const teamName = "teamB" // Имя команды
const agent = new Agent(); // Создание экземпляра агента
require('./socket')(agent, teamName, VERSION) //Настройка сокета
agent.socketSend("move", `-3 -20`) // Размещение игрока на поле
