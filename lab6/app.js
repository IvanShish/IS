const Agent = require('./agent') // Импорт агента
const VERSION = 7 // Версия сервера
const agent = new Agent() // Создание экземпляра агента
// Подключение модуля ввода из командной строки
const readline = require('readline')
const rl = readline.createInterface({ // Чтение консоли
    input: process.stdin,
    output: process.stdout
})

rl.question('Enter team name: ', teamName => {
    agent.teamName = teamName
    rl.question('Number player: ', n => {
        agent.number = n
        rl.question('Goalie? (y/n): ', isGk => {
            if (isGk === 'y') {
                agent.controller.setIsGk(true)
            }
            rl.question('Enter coordinate x: ', x => {
                rl.question('Enter coordinate y: ', y => {
                    agent.xCoord = x
                    agent.yCoord = y
                    const settings = require('./socket')
                    settings(agent, teamName, VERSION).then(() => {
                        agent.socketSend('move', `${x} ${y}`)
                    })
                })
            })
        })
    })
})

